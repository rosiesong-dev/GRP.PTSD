import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import "./PclAdult.css";

type PclSession = {
  client_id: number;
  start_date: string;
  detail: number[];
  totalScore: number;
  severity: { level: string; color: string };
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

  const [sessions, setSessions] = useState<PclSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    fetchPclData();
  }, [id]);

  const fetchPclData = async () => {
    setLoading(true);

    try {
      console.log("Searching for client_id:", id);

      const { data, error } = await supabase
        .from("counsels")
        .select("client_id, start_date, detail")
        .eq("client_id", Number(id))
        .order("start_date", { ascending: true });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      if (data && data.length > 0) {
        const validSessions: PclSession[] = [];

        data.forEach((row) => {
          if (Array.isArray(row.detail) && row.detail.length > 0) {
            const isValidData = row.detail.some((v: any) => Number(v) > 0);
            if (isValidData) {
              const converted = row.detail.map((v: any) => Number(v) || 0);
              const totalScore = converted.reduce((sum, v) => sum + v, 0);
              const severity = getSeverity(totalScore);

              validSessions.push({
                client_id: row.client_id,
                start_date: row.start_date || "Unknown",
                detail: converted,
                totalScore,
                severity
              });
            }
          }
        });

        if (validSessions.length > 0) {
          setSessions(validSessions);
          setHasData(true);
        } else {
          setHasData(false);
        }
      } else {
        console.log("데이터 없음.");
        setHasData(false);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="pcl-container">
      <h1 className="pcl-header">PCL-5 Results</h1>
      <p className="pcl-client-info">Client ID: {id}</p>

      <div className="pcl-actions">
        <button onClick={() => navigate(`/clients/${id}`)}>
          ◀ Go to client detail
        </button>
      </div>

      <hr style={{ border: "0", borderTop: "1px solid #e0e0e0", margin: "30px 0" }} />

      {!hasData ? (
        <p style={{ textAlign: "center", color: "#888", fontSize: "1.2rem", padding: "40px 0" }}>
          No Information
        </p>
      ) : (
        <>
          {/* 결과 요약 */}
          <div className="pcl-section">
            <h2>Summary</h2>

            <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
              {sessions.map((session, idx) => (
                <div key={idx} style={{ flex: "1 1 calc(50% - 20px)", minWidth: "250px", border: "1px solid #dee2e6", borderRadius: "8px", padding: "20px" }}>
                  <h3 style={{ marginTop: 0, marginBottom: "15px", borderBottom: "2px solid #f8f9fa", paddingBottom: "10px", color: "#333" }}>
                    {session.start_date.substring(0, 4)}
                  </h3>
                  <div style={{ display: "flex", gap: "15px" }}>
                    <div style={{ flex: 1, padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                      <h4 style={{ marginTop: 0, marginBottom: "5px", color: "#666", fontSize: "0.95rem" }}>Total Score</h4>
                      <p style={{ fontSize: "1.8rem", fontWeight: "bold", margin: 0, color: "#007bff" }}>
                        {session.totalScore} <span style={{ fontSize: "1rem", color: "#888", fontWeight: "normal" }}>/ 80</span>
                      </p>
                    </div>

                    <div style={{ flex: 1, padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                      <h4 style={{ marginTop: 0, marginBottom: "5px", color: "#666", fontSize: "0.95rem" }}>Severity Level</h4>
                      <p style={{ fontSize: "1.8rem", fontWeight: "bold", margin: 0, color: session.severity.color }}>
                        {session.severity.level}
                      </p>
                    </div>
                  </div>

                  {session.totalScore >= 33 && (
                    <div style={{
                      marginTop: "15px",
                      padding: "12px",
                      backgroundColor: "#fff3cd",
                      border: "1px solid #ffc107",
                      borderRadius: "6px",
                      fontSize: "0.9rem"
                    }}>
                      <strong>⚠️ Note:</strong> PTSD screening positive — clinical follow-up recommended
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 질문별 응답 */}
          <div className="pcl-section">
            <h2>Detailed Responses</h2>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: `${500 + (sessions.length * 200)}px` }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Question</th>
                    {sessions.map((session, idx) => (
                      <React.Fragment key={idx}>
                        <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid #dee2e6", width: "80px", borderLeft: "2px solid #eee" }}>
                          {session.start_date.substring(0, 4)} Score
                        </th>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid #dee2e6", width: "120px" }}>
                          Response
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #dee2e6" }}>
                      <td style={{ padding: "12px", minWidth: "300px" }}>
                        <strong>{i + 1}.</strong> {q}
                      </td>
                      {sessions.map((session, idx) => {
                        const score = session.detail[i] || 0;
                        return (
                          <React.Fragment key={idx}>
                            <td style={{ padding: "12px", textAlign: "center", fontSize: "1.2rem", fontWeight: "bold", borderLeft: "2px solid #eee" }}>
                              {score}
                            </td>
                            <td style={{ padding: "12px", color: "#666" }}>
                              {scaleLabels[score]}
                            </td>
                          </React.Fragment>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}