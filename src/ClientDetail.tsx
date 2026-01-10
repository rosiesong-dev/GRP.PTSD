import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import "./ClientDetail.css";

type Client = {
  id: number;
  status: string | null;
  name: string | null;
  birth_date: string | null;
  cnic_number: string | null;
  mobile: string | null;
  father_name: string | null;
  guardian_name: string | null;
  guardian_relation: string | null;
  guardian_contact: string | null;
  code: string | null;
  disaster_id: number | null;
  personal_history: string | null;
  profile_image: string | null;
  created_at: string | null;
  updated_at: string | null;
  gender: string | null;
  contact_number: string | null;
  address: string | null;
  disaster_type: string | null;
  disaster_vtype: string | null;
  disaster_refer_to: string | null;
  disaster_case_manager: string | null;
  disaster_medical_coverage: string | null;
  disaster_result_action: string | null;
  user_id: number | null;
  client_image: string[] | null;
  family_id: number | null;
  life_status: string | null;
  widow: boolean | null;
  orphan: boolean | null;
};

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      alert("데이터를 불러오지 못했습니다.");
    } else {
      setClient(data);
    }
    setLoading(false);
  };

  const handleChange = (field: keyof Client, value: any) => {
    if (!client) return;
    setClient({ ...client, [field]: value });
  };

  const handleSave = async () => {
    if (!client) return;

    const { error } = await supabase
      .from("clients")
      .update({ ...client })
      .eq("id", client.id);

    if (error) {
      console.error(error);
      alert("수정 실패");
    } else {
      alert("수정 완료!");
      setEditMode(false);
      fetchClient(); // 최신 데이터 불러오기
    }
  };

  if (loading || !client) return <p>로딩 중...</p>;

  return (
    <div className="detail-container">
      <h1>Client info</h1>
      <button onClick={() => navigate(-1)}>◀ 목록으로</button>
      <button onClick={() => setEditMode(!editMode)}>
        {editMode ? "취소" : "수정"}
      </button>

      <table className="detail-table">
        <tbody>
          {Object.entries(client).map(([key, value]) => (
            <tr key={key}>
              <td className="field-name">{key}</td>
              <td className="field-value">
                {editMode ? (
                  key === "widow" || key === "orphan" ? (
                    <input
                      type="checkbox"
                      checked={!!value}
                      onChange={(e) =>
                        handleChange(key as keyof Client, e.target.checked)
                      }
                    />
                  ) : Array.isArray(value) ? (
                    <input
                      type="text"
                      value={(value as string[]).join(", ")}
                      onChange={(e) =>
                        handleChange(
                          key as keyof Client,
                          e.target.value.split(",").map((v) => v.trim())
                        )
                      }
                    />
                  ) : (
                    <input
                      type="text"
                      value={value ?? ""}
                      onChange={(e) =>
                        handleChange(key as keyof Client, e.target.value)
                      }
                    />
                  )
                ) : Array.isArray(value) ? (
                  (value as string[]).join(", ") || "정보 없음"
                ) : value === null || value === "" ? (
                  "정보 없음"
                ) : (
                  value.toString()
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editMode && (
        <button className="save-btn" onClick={handleSave}>
          저장
        </button>
      )}
    </div>
  );
}