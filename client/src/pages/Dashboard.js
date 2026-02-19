import { useState } from "react";
import axios from "axios";

function Dashboard() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");

  const handleUpload = async () => {
    if (!file) return alert("Upload an image");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/predict",
        formData,
      );

      setResult(`${res.data.prediction} (Confidence: ${res.data.confidence})`);
    } catch (error) {
      alert("Prediction failed");
    }
  };

  return (
    <div>
      <h2>Leaf Disease Detection</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Analyze</button>

      {result && <h3>Result: {result}</h3>}
    </div>
  );
}

export default Dashboard;
