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
  "I thought about it when I didn't mean to.",
  "I stopped letting myself get upset when I thought about it or was reminded of it.",
  "I tried not to remember.",
  "I had trouble falling asleep or staying asleep because pictures or thoughts about came into my mind.",
  "I Had strong feelings about it.",
  "I had dreams about it.",
  "I stayed away from things that reminded me of it.",
  "I felt that it did not happen or that is was make-believe.",
  "I tried not to talk about it.",
  "I kept seeing it over and over in my mind.",
  "Other things kept making me think about it.",
  "I had lots of feelings about it, but I didn't pay attention to them.",
  "I tried not to think about it.",
  "Any reminder brought back feelings about it.",
  "I don't have feelings about it anymore.",
  "It was easy to make me angry and upset.",
  "Loud noises made me jump in surprise.",
  "I would act like it was happening all over again.",
  "I had trouble keeping my mind on what I was doing.",
  "Thinking about it made my heart beat faster.",
  "Thinking about it made it hard for me to breathe.",
  "Thinking about it made me sweat.",
  "I kept checking to make sure nothing else bad would happen.",
];

const scaleLabels = ["Not at all", "Rarely", "Sometimes", "Often"];

const getSeverity = (score: number) => {
  if (score >= 50) return { level: "Severe", color: "#d32f2f" };
  if (score >= 32) return { level: "Moderate", color: "#f57c00" };
  if (score >= 20) return { level: "Mild", color: "#fbc02d" };
  return { level: "Minimal", color: "#388e3c" };
};

export default function PclChild() {
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