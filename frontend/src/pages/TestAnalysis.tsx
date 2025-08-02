import { useState } from "react";
import { surveyApi } from "../services/api";

export const TestAnalysis = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number>(1);

  const getLevelText = (level: number): string => {
    switch (level) {
      case 0: return "Thấp";
      case 1: return "Trung bình";
      case 2: return "Cao";
      case 3: return "Rất cao";
      default: return "Chưa xác định";
    }
  };

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching analysis for user ID:", userId);
      
      const response = await surveyApi.getLatestAnalysis(userId);
      console.log("API Response:", response);
      
      if (response.success) {
        setResult(response.result);
      } else {
        setError(response.message || "Không có dữ liệu");
      }
    } catch (err: any) {
      console.error("Error fetching analysis:", err);
      setError(`Error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Test direct API call
      const response = await fetch(`http://localhost:3000/api/survey-analysis/${userId}/latest`);
      const data = await response.json();
      console.log("Direct API Response:", data);
      
      if (data.success) {
        setResult(data.result);
      } else {
        setError(data.message || "Không có dữ liệu");
      }
    } catch (err: any) {
      console.error("Error with direct API:", err);
      setError(`Direct API Error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Test Analysis Page</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <label>User ID: </label>
        <input 
          type="number" 
          value={userId} 
          onChange={(e) => setUserId(parseInt(e.target.value))}
          style={{ marginLeft: "10px", padding: "5px" }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={fetchAnalysis} style={{ marginRight: "10px", padding: "10px" }}>
          Test surveyApi.getLatestAnalysis
        </button>
        <button onClick={testDirectAPI} style={{ padding: "10px" }}>
          Test Direct API Call
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      {result && (
        <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h3>Analysis Result:</h3>
          <p><strong>ID:</strong> {result.id}</p>
          <p><strong>User ID:</strong> {result.userId}</p>
          <p><strong>Emotional Level:</strong> {result.emotionalLevel} - {getLevelText(result.emotionalLevel)}</p>
          <p><strong>Financial Level:</strong> {result.financialLevel} - {getLevelText(result.financialLevel)}</p>
          <p><strong>Created At:</strong> {new Date(result.createdAt).toLocaleString()}</p>
          
          <h4>Raw Data:</h4>
          <pre style={{ background: "#f5f5f5", padding: "10px", borderRadius: "4px" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
