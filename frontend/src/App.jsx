import { useEffect } from "react";

function App() {
  useEffect(() => {
    fetch("http://localhost:8080/api/test")
      .then(res => res.text())
      .then(data => console.log(data));
  }, []);

  return <h1>linkeddd???? YASSSSS</h1>;
}

export default App;