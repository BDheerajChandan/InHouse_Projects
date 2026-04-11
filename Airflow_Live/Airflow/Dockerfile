# Airflow/Dockerfile
FROM apache/airflow:2.9.1-python3.11

USER root

# Install Node.js 20 + fuser (for port killing in stop_services task)
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl gnupg psmisc && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

USER airflow

COPY Projects/project_1/backend/requirements.txt /tmp/req_p1.txt
COPY Projects/project_2/backend/requirements.txt /tmp/req_p2.txt

RUN pip install --no-cache-dir -r /tmp/req_p1.txt \
 && pip install --no-cache-dir -r /tmp/req_p2.txt