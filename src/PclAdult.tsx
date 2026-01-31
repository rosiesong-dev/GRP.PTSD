import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import "./PclAdult.css";

type PclData = {
  client_id: number;
  detail: number[];
};

const questions = [
  "Repeated, disturbing, and unwanted memories of the stressful experience?",
  "Repeated, disturbing dreams of the stressful experience?",
  "Suddenly feeling or acting as if the stressful experience were actually happening again?",
  "Feeling very upset when something reminded you of the stressful experience?",
  "Having strong physical reactions when something reminded you of the stressful experience?",
  "Avoiding memories, thoughts, or feelings related to the stressful experience?",
  "Avoiding external reminders of the stressful experience?",
  "Trouble remembering important parts of the stressful experience?",
  "Having strong negative beliefs about yourself, other people, or the world?",
  "Blaming yourself or someone else for the stressful experience?",
  "Having strong negative feelings such as fear, anger, guilt, or shame?",
  "Loss of interest in activities that you used to enjoy?",
  "Feeling distant or cut off from other people?",
  "Trouble experiencing positive feelings?",
  "Irritable behavior or angry outbursts?",
  "Taking too many risks or doing things that could cause you harm?",
  "Being superalert or on guard?",
  "Feeling jumpy or easily startled?",
  "Having difficulty concentrating?",
  "Trouble falling or staying asleep?"
];

const scaleLabels = ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"];

const getSeverity = (score: number) => {
  if (score >= 50) return { level: "Severe", color: "#d32f2f" };
  if (score >= 32) return { level: "Moderate", color: "#f57c00" };
  if (score >= 20) return { level: "Mild", color: "#fbc02d" };
  return { level: "Minimal", color: "#388e3c" };
};

export default function PclAdult() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pclData, setPclData] = useState<PclData>({
    client_id: Number(id),
    detail: Array(20).fill(0),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPclData();
  }, [id]);

  const fetchPclData = async () => {
    setLoading(true);

    try {
      console.log("Searching for client_id:", id);

      const { data, error, count } = await supabase
        .from("counsels")
        .select("client_id, detail", { count: "exact" })
        .eq("client_id", Number(id));

      console.log("Query result:", { data, error, count });
      console.log("detail 원본:", data?.[0]?.detail);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      if (data && data.length > 0) {
        const converted = data[0].detail?.map((v: any) => Number(v) || 0) || Array(20).fill(0);
        console.log("변환된 detail:", converted);
        setPclData({
          client_id: data[0].client_id,
          detail: converted,
        });
      } else {
        console.log("데이터 없음. 기본값 사용");
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => pclData.detail.reduce((sum, v) => sum + (v || 0), 0);

  if (loading) return <p>Loading...</p>;

  const totalScore = calculateTotal();
  const severity = getSeverity(totalScore);

  return (
    <div className="pcl-container">
      <h1 className="pcl-header">PCL-5 Results</h1>
      <p className="pcl-client-info">Client ID: {pclData.client_id}</p>

      <div className="pcl-actions">
        <button onClick={() => navigate(`/clients/${id}`)}>
          ◀ Go to client detail
        </button>
      </div>

      {/* 결과 요약 */}
      <div className="pcl-section">
        <h2>Summary</h2>
        
        <div style={{ display: "flex", gap: "30px", marginBottom: "30px" }}>
          <div style={{ flex: 1, padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
            <h3 style={{ marginTop: 0 }}>Total Score</h3>
            <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0, color: "#007bff" }}>
              {totalScore} / 80
            </p>
          </div>

          <div style={{ flex: 1, padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
            <h3 style={{ marginTop: 0 }}>Severity Level</h3>
            <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0, color: severity.color }}>
              {severity.level}
            </p>
          </div>
        </div>

        {totalScore >= 33 && (
          <div style={{ 
            padding: "15px", 
            backgroundColor: "#fff3cd", 
            border: "1px solid #ffc107", 
            borderRadius: "8px",
            marginBottom: "20px"
          }}>
            <strong>⚠️ Note:</strong> PTSD screening positive — clinical follow-up recommended
          </div>
        )}
      </div>

      {/* 질문별 응답 */}
      <div className="pcl-section">
        <h2>Detailed Responses</h2>
        
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8f9fa" }}>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Question</th>
              <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #dee2e6", width: "100px" }}>Score</th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6", width: "150px" }}>Response</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q, i) => {
              const score = pclData.detail[i] || 0;
              return (
                <tr key={i} style={{ borderBottom: "1px solid #dee2e6" }}>
                  <td style={{ padding: "12px" }}>
                    <strong>{i + 1}.</strong> {q}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center", fontSize: "1.2rem", fontWeight: "bold" }}>
                    {score}
                  </td>
                  <td style={{ padding: "12px", color: "#666" }}>
                    {scaleLabels[score]}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}