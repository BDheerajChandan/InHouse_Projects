import LedControl from "./components/LedControl";

function App() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Arduino UNO LED Controller</h1>

      {/* Child Component */}
      <LedControl />
    </div>
  );
}

export default App;