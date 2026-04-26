import { useState } from "react";

const LedControl = () => {
  const [status, setStatus] = useState("OFF");

  const turnOn = async () => {
    try {
      await fetch("http://localhost:8000/led/on");
      console.log("LED ON");
      
      setStatus("ON");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const turnOff = async () => {
    try {
      await fetch("http://localhost:8000/led/off");
      console.log("LED OFF");
      setStatus("OFF");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div style={styles.container}>
      <h2>LED Control Panel</h2>

      <p>Status: <b>{status}</b></p>

      <button onClick={turnOn} style={styles.onBtn}>
        LED ON
      </button>

      <button onClick={turnOff} style={styles.offBtn}>
        LED OFF
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    display: "inline-block",
  },
  onBtn: {
    margin: "10px",
    padding: "10px 20px",
    backgroundColor: "green",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  offBtn: {
    margin: "10px",
    padding: "10px 20px",
    backgroundColor: "red",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};

export default LedControl;