# Airflow/dags/dag_project_1.py
"""
DAG: dag_project_1
Tasks (ON trigger):
  1. setup_venv      — creates venv, pip-installs backend requirements
  2. setup_frontend  — runs npm install inside container (fixes Windows perms)
  3. start_backend   — launches backend via venv python (non-blocking)
  4. start_frontend  — launches Vite dev server (non-blocking)
  5. health_check    — polls backend until it responds

Tasks (OFF trigger — conf={"action":"stop"}):
  1. stop_services   — kills processes on backend + frontend ports
"""
import json
import os
import subprocess
import sys
import signal
from datetime import datetime

from airflow import DAG
from airflow.operators.python import PythonOperator, BranchPythonOperator
from airflow.operators.empty import EmptyOperator

# ── Config (fully dynamic from project_config.json) ───────────────────────────
PATHS_CONFIG = "/opt/airflow/config/paths_config.json"
PROJECT_KEY  = "project_1"

with open(PATHS_CONFIG) as f:
    paths = json.load(f)

with open(paths["config_file"]) as f:
    project_config = json.load(f)

cfg           = project_config[PROJECT_KEY]
PROJECT_NAME  = cfg["name"]
PROJECT_PATH  = os.path.join(paths["projects_base_path"], PROJECT_KEY)
BACKEND_PORT  = cfg["backend"]["port"]
FRONTEND_PORT = cfg["frontend"]["port"]
BACKEND_HOST  = cfg["backend"]["host"]
FRONTEND_HOST = cfg["frontend"]["host"]

BACKEND_DIR   = os.path.join(PROJECT_PATH, "backend")
FRONTEND_DIR  = os.path.join(PROJECT_PATH, "frontend")

VENV_DIR    = f"/opt/airflow/venvs/{PROJECT_KEY}_venv"
VENV_PYTHON = os.path.join(VENV_DIR, "bin", "python")
VENV_PIP    = os.path.join(VENV_DIR, "bin", "pip")

CONFIG_PATH = paths["config_file"]


# ── Helper ────────────────────────────────────────────────────────────────────
def _run(cmd, cwd=None, timeout=3600):
    """Run a blocking command, stream output to Airflow logs, raise on failure."""
    print(f">>> {' '.join(str(c) for c in cmd)}")
    result = subprocess.run(
        cmd, cwd=cwd, capture_output=True, text=True, timeout=timeout
    )
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr)
    if result.returncode != 0:
        raise RuntimeError(
            f"Command failed (rc={result.returncode}):\n{result.stderr}"
        )
    return result


def _kill_port(port):
    """Kill any process listening on the given port (Linux fuser)."""
    print(f"Killing processes on port {port} ...")
    try:
        result = subprocess.run(
            ["fuser", "-k", f"{port}/tcp"],
            capture_output=True, text=True
        )
        print(result.stdout or f"No process found on port {port}.")
        if result.stderr:
            print(result.stderr)
    except FileNotFoundError:
        # fuser not available — fallback to lsof + kill
        try:
            r = subprocess.run(
                ["lsof", "-ti", f"tcp:{port}"],
                capture_output=True, text=True
            )
            pids = r.stdout.strip().split()
            for pid in pids:
                os.kill(int(pid), signal.SIGTERM)
                print(f"Sent SIGTERM to PID {pid} (port {port})")
        except Exception as e:
            print(f"Could not kill port {port}: {e}")


def _reload_config():
    """Re-read project_config.json at task runtime (handles port changes)."""
    with open(CONFIG_PATH) as f:
        pc = json.load(f)
    c = pc[PROJECT_KEY]
    return {
        "name":           c["name"],
        "backend_port":   c["backend"]["port"],
        "frontend_port":  c["frontend"]["port"],
        "backend_host":   c["backend"]["host"],
        "frontend_host":  c["frontend"]["host"],
    }


# ── Branch ────────────────────────────────────────────────────────────────────
# def branch_action(**context):
#     """Route to 'start' or 'stop' pipeline based on dag_run conf."""
#     action = context.get("dag_run").conf.get("action", "start")
#     print(f"[{PROJECT_NAME}] DAG action = '{action}'")
#     if action == "stop":
#         return "stop_services"
#     return "setup_venv"
def branch_action(**context):
    """Route to 'start' or 'stop' pipeline based on dag_run conf."""
    action = context.get("dag_run").conf.get("action", "start")
    print(f"[{PROJECT_NAME}] DAG action = '{action}'")
    if action == "stop":
        return "stop_services"
    # Return BOTH parallel start tasks so neither gets skipped
    return ["setup_venv", "setup_frontend"]


# ── START Tasks ───────────────────────────────────────────────────────────────
def setup_venv(**context):
    cfg = _reload_config()
    print(f"[{cfg['name']}] Setting up venv at {VENV_DIR} ...")
    os.makedirs("/opt/airflow/venvs", exist_ok=True)

    if not os.path.isdir(VENV_DIR):
        _run([sys.executable, "-m", "venv", VENV_DIR])
        print(f"[{cfg['name']}] Venv created.")
    else:
        print(f"[{cfg['name']}] Venv already exists, skipping creation.")

    req_file = os.path.join(BACKEND_DIR, "requirements.txt")
    _run([VENV_PIP, "install", "--no-cache-dir", "-r", req_file])
    print(f"[{cfg['name']}] Backend dependencies installed.")


def setup_frontend(**context):
    cfg = _reload_config()
    print(f"[{cfg['name']}] Running npm install in {FRONTEND_DIR} ...")
    _run(["npm", "install"], cwd=FRONTEND_DIR, timeout=300)
    print(f"[{cfg['name']}] npm install complete.")


def start_backend(**context):
    cfg = _reload_config()
    print(f"[{cfg['name']}] Starting backend on port {cfg['backend_port']} ...")

    env = os.environ.copy()
    env["PROJECT_KEY"]         = PROJECT_KEY
    env["PROJECT_CONFIG_PATH"] = CONFIG_PATH
    env["VIRTUAL_ENV"]         = VENV_DIR
    env["PATH"]                = os.path.join(VENV_DIR, "bin") + ":" + env.get("PATH", "")

    proc = subprocess.Popen(
        [VENV_PYTHON, "run.py"],
        cwd=BACKEND_DIR,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    print(f"[{cfg['name']}] Backend PID={proc.pid} on port {cfg['backend_port']}.")

    try:
        out, _ = proc.communicate(timeout=3)
        raise RuntimeError(
            f"Backend exited immediately (rc={proc.returncode}):\n{out.decode()}"
        )
    except subprocess.TimeoutExpired:
        print(f"[{cfg['name']}] Backend still running after 3s — looks good.")


def start_frontend(**context):
    cfg = _reload_config()
    print(f"[{cfg['name']}] Starting frontend on port {cfg['frontend_port']} ...")

    proc = subprocess.Popen(
        ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", str(cfg["frontend_port"])],
        cwd=FRONTEND_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    print(f"[{cfg['name']}] Frontend PID={proc.pid} on port {cfg['frontend_port']}.")

    try:
        out, _ = proc.communicate(timeout=5)
        raise RuntimeError(
            f"Frontend exited immediately (rc={proc.returncode}):\n{out.decode()}"
        )
    except subprocess.TimeoutExpired:
        print(f"[{cfg['name']}] Frontend still running after 5s — looks good.")


def health_check(**context):
    import time
    import urllib.request

    cfg = _reload_config()
    url = f"http://localhost:{cfg['backend_port']}/"
    print(f"[{cfg['name']}] Health-checking {url} ...")

    for attempt in range(1, 11):
        try:
            with urllib.request.urlopen(url, timeout=3) as resp:
                body = resp.read().decode()
            print(f"[{cfg['name']}] Health OK (attempt {attempt}): {body}")
            return
        except Exception as exc:
            print(f"[{cfg['name']}] Attempt {attempt}/10 failed: {exc}")
            time.sleep(3)

    raise RuntimeError(f"Backend at {url} did not respond after 10 attempts.")


# ── STOP Task ─────────────────────────────────────────────────────────────────
def stop_services(**context):
    cfg = _reload_config()
    print(f"[{cfg['name']}] Stopping services ...")
    _kill_port(cfg["backend_port"])
    _kill_port(cfg["frontend_port"])
    print(f"[{cfg['name']}] Ports {cfg['backend_port']} and {cfg['frontend_port']} released.")


# ── DAG definition ────────────────────────────────────────────────────────────
with DAG(
    dag_id="dag_project_1",
    description=f"Start & Stop {PROJECT_NAME} dynamically",
    start_date=datetime(2024, 1, 1),
    schedule_interval=None,
    catchup=False,
    tags=["project_1"],
) as dag:

    t_branch   = BranchPythonOperator(task_id="branch_action",   python_callable=branch_action)
    t_stop     = PythonOperator(task_id="stop_services",         python_callable=stop_services)
    t_venv     = PythonOperator(task_id="setup_venv",            python_callable=setup_venv)
    t_npm      = PythonOperator(task_id="setup_frontend",        python_callable=setup_frontend)
    t_backend  = PythonOperator(task_id="start_backend",         python_callable=start_backend)
    t_frontend = PythonOperator(task_id="start_frontend",        python_callable=start_frontend)
    t_health   = PythonOperator(task_id="health_check",          python_callable=health_check)

    #                      ┌─> stop_services
    # branch_action ───────┤
    #                      └─> setup_venv ──┐
    #                          setup_frontend (parallel)
    #                                       └──> start_backend ──> start_frontend ──> health_check

    t_branch >> t_stop
    t_branch >> [t_venv, t_npm] >> t_backend >> t_frontend >> t_health