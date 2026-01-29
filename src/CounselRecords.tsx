import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import "./CounselRecords.css";

type CounselData = {
  id: number;
  name: string | null;
  counsel_q0: string | null;
  counsel_q1: string | null;
  counsel_q2: string | null;
  counsel_q3: string | null;
  counsel_q4: string | null;
  counsel_q5: string | null;
  counsel_q6: string | null;
  counsel_q7: string | null;
  counsel_q8: string | null;
  counsel_q9: string | null;
  counsel_q10_1: string | null;
  counsel_q10_2: string | null;
  counsel_q10_3: string | null;
  counsel_q10_4: string | null;
  counsel_q10_5: string | null;
  counsel_q11: string | null;
  counsel_q12: string | null;
  counsel_q_image: string | null;
};

const questions = [
  { key: "counsel_q0", label: "Note" },
  { key: "counsel_q1", label: "Name: the victim and family members" },
  { key: "counsel_q2", label: "How many years have you lived in Peshawar? Or how many generations?" },
  { key: "counsel_q3", label: "How much good your relationship with Muslim neighbers?" },
  { key: "counsel_q4", label: "Who do you think that has done this?" },
  { key: "counsel_q5", label: "Why do you think that this happened?" },
  { key: "counsel_q6", label: "Why did the death toll increase gradually?" },
  { key: "counsel_q7", label: "Have you forgiven them?" },
  { key: "counsel_q8", label: "If not, what would you like to do?" },
  { key: "counsel_q9", label: "What do you need most?" },
  { key: "counsel_q10", label: "What would you like to say?" },
  { key: "counsel_q11", label: "What would you like to say to All Saints Church?" },
  { key: "counsel_q12", label: "What would you like to say to Peshawar Diocese?" },
  { key: "counsel_q13", label: "What would you like to say to Christians in the world?" },
  { key: "counsel_q14", label: "What would you like to say to Muslims in KPP or Pakistan?" },
  { key: "counsel_q15", label: "What would you like to say to Pakistan Government?" },
  { key: "counsel_q16", label: "Other things?" },
  { key: "counsel_q17", label: "Note taking" }
];

export default function CounselRecords() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [counselData, setCounselData] = useState<CounselData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchCounselData();
  }, [id]);

  const fetchCounselData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", Number(id))
      .single();

    if (error) {
      console.error("Error details:", error);
      alert(`Failed to load counseling data: ${error.message}`);
    } else {
      console.log("Fetched data:", data);
      setCounselData(data);
    }
    setLoading(false);
  };

  const handleChange = (field: keyof CounselData, value: string) => {
    if (!counselData) return;
    setCounselData({ ...counselData, [field]: value });
  };

  const handleSave = async () => {
    if (!counselData) return;

    const { id, name, ...counselAnswers } = counselData;

    try {
      const { error } = await supabase
        .from("clients")
        .update(counselAnswers)
        .eq("id", Number(id));

      if (error) throw error;

      alert("Saved successfully!");
      setEditMode(false);
      fetchCounselData();
    } catch (err: any) {
      console.error("Update failed:", err);
      alert(`Update failed: ${err.message}`);
    }
  };

  // 해당 클라이언트의 사진 URL
  const getCounselPhotoUrl = () => {
    if (!counselData || !counselData.counsel_q_image) {
      console.log("No counsel_q_image:", counselData?.counsel_q_image);
      return null;
    }
    const url = `https://uihlvzejcglditmlqzuq.supabase.co/storage/v1/object/public/PeshawarCounselData/${counselData.counsel_q_image}.png`;
    console.log("Generated URL:", url);
    return url;
  };

  if (loading || !counselData) return <p>Loading...</p>;

  return (
    <div className="counsel-container">
      <h1 className="counsel-header">🔍 Counsel results 🔍</h1>

      <div className="counsel-actions">
        <button onClick={() => navigate(`/clients/${id}`)}>
          ◀ Go to client detail
        </button>
        <button onClick={() => setEditMode(!editMode)}>
          {editMode ? "Cancel" : "Update"}
        </button>
      </div>

      <h2 className="counsel-title">[{counselData.id}] {counselData.name}</h2>

      {questions.map(({ key, label }, index) => {
        const value = counselData[key as keyof CounselData];

        return (
          <div key={key} className="counsel-question-card">
            <div className="counsel-question-header">
              <span className="counsel-question-number">Q{index}</span>
              <span className="counsel-question-text">{label}</span>
            </div>

            <div className="counsel-answer-container">
              {editMode ? (
                <textarea
                  className="counsel-textarea"
                  value={value ?? ""}
                  onChange={(e) => handleChange(key as keyof CounselData, e.target.value)}
                  rows={4}
                  placeholder="답변을 입력하세요..."
                />
              ) : (
                <div className={`counsel-answer-display ${!value ? "empty" : ""}`}>
                  {value || "No answer provided"}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {editMode && (
        <div className="counsel-save-container">
          <button className="counsel-save-btn" onClick={handleSave}>
            💾 Save All Changes
          </button>
        </div>
      )}

      {/* 📸 Counsel Result Photo */}
      <div className="counsel-photos-section">
        <h2 className="counsel-title">Counsel Result Paper</h2>
        

        <div className="counsel-photos-grid">
          {getCounselPhotoUrl() ? (
            <img
              src={getCounselPhotoUrl()!}
              alt="counsel-result"
              className="counsel-photo"
              onLoad={() => console.log("✅ 사진 로드 성공!")}
              onError={(e) => {
                console.error("❌ 사진 로드 실패:", getCounselPhotoUrl());
                alert("사진을 불러올 수 없습니다: " + getCounselPhotoUrl());
              }}
              style={{ border: "3px solid red" }}
            />
          ) : (
            <p className="counsel-no-photos">No photo available</p>
          )}
        </div>
      </div>
    </div>
  );
}