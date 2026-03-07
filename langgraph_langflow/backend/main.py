# main.py

import uvicorn
from graphbuilder import build_graph

def run_cli():
    app, flow_sequence = build_graph()  # CLI mode -> interactive

    full_flow = ["start"] + flow_sequence + ["output"]
    print("\nFull execution flow:")
    print(" -> ".join(full_flow))
    print("=" * 50)

    while True:
        try:
            user_input = input("Enter your prompt (or type 'exit' to quit): ")
            if user_input.lower() in ["exit", "quit", "q"]:
                print("Exiting LangGraph...")
                break

            state = {
                "input": user_input,
                "selected_nodes": flow_sequence,
                "output": "",
                "final_output": ""
            }

            result = app.invoke(state)
            print("\nFinal Results:\n", result["final_output"])
            print("\n" + "=" * 50 + "\n")

        except KeyboardInterrupt:
            print("\nKeyboard Interrupt detected. Exiting...")
            break
        except Exception as e:
            print(f"\nError occurred: {e}\n")
            continue


def run_server():
    print("\nStarting FastAPI server for frontend...")
    print("Frontend should connect to: http://localhost:8000")
    print("Press Ctrl+C to stop the server.\n")
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)


def main():
    print("=" * 50)
    print("       LangGraph Runner")
    print("=" * 50)
    print("\nSelect mode:")
    print("  1 - CLI Mode (interactive terminal)")
    print("  2 - Server Mode (host API for frontend)")
    print()

    while True:
        choice = input("Enter 1 or 2: ").strip()
        if choice == "1":
            run_cli()
            break
        elif choice == "2":
            run_server()
            break
        else:
            print("Invalid choice. Please enter 1 or 2.")


if __name__ == "__main__":
    main()