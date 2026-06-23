import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import { useRole } from "./hooks/useRole";
import "./ClientDetail.css";

type Client = {
  id: number;
  serial_num: string | null;
  name: string | null;
  status: string | null;
  birth_date: string | null;
  age: number | null;
  gender: string | null;
  cnic_number: string | null;
  mobile: string | null;
  contact_number: string | null;
  address: string | null;
  father_name: string | null;
  guardian_name: string | null;
  guardian_contact: string | null;
  life_status: string | null;
  widow: boolean | null;
  orphan: boolean | null;
  code: string | null;
  disaster_id: number | null;
  disaster_type: string | null;
  disaster_vtype: string | null;
  disaster_refer_to: string | null;
  disaster_case_manager: string | null;
  disaster_medical_coverage: string | null;
  disaster_result_action: string | null;
  personal_history: string | null;
  profile_image: string | null;
  client_image: string[] | null;
  family_id: number | null;
  injured_id: string | null;
  martyr_id: string | null;
  counsel_q_adult: boolean | null;
  job_study_situation_need: string | null;
  care_giver: string | null;
  is_adult_counsel: boolean | null;
};

// ✅ guest에게 숨길 민감한 필드 목록
const GUEST_HIDDEN_FIELDS: (keyof Client)[] = [
  "serial_num",
  "name",
  "cnic_number",
  "mobile",
  "contact_number",
  "address",
  "father_name",
  "guardian_name",
  "guardian_contact",
  "personal_history",
];

const readOnlyFields: (keyof Client)[] = ["id", "family_id"];

const sections: {
  title: string;
  fields: { key: keyof Client | "counseling_link" | "pcl_link" | "counseling_sessions_link"; label: string }[];
}[] = [
    {
      title: "Basic Information",
      fields: [
        { key: "serial_num", label: "Serial Number" },
        { key: "name", label: "Name" },
        { key: "profile_image", label: "Profile (사진)" },
        { key: "status", label: "Status" },
        { key: "job_study_situation_need", label: "Job/Study/Situation/Needs" },
        { key: "birth_date", label: "Birthday" },
        { key: "age", label: "Age" },
        { key: "gender", label: "Gender" },
        { key: "care_giver", label: "Care giver" },
        { key: "cnic_number", label: "CNIC number" },
        { key: "injured_id", label: "Injured number" },
        { key: "martyr_id", label: "Martyred number" },
      ],
    },
    {
      title: "Contact & Guardian Information",
      fields: [
        { key: "mobile", label: "Phone number" },
        { key: "address", label: "Address" },
        { key: "father_name", label: "Father name" },
        { key: "guardian_name", label: "Guardian name" },
        { key: "guardian_contact", label: "Phone number (of Guardian)" },
      ],
    },
    {
      title: "Disaster Information",
      fields: [
        { key: "disaster_id", label: "Disaster ID" },
        { key: "disaster_type", label: "Disaster type (재난 유형)" },
        { key: "disaster_vtype", label: "Disaster victim type (재난 피해자 유형)" },
        { key: "disaster_refer_to", label: "Disaster refer (의뢰 기관?)" },
        { key: "disaster_case_manager", label: "Disaster case manager" },
        { key: "disaster_medical_coverage", label: "Medical coverage" },
        { key: "disaster_result_action", label: "Result" },
      ],
    },
    {
      title: "Additional Information",
      fields: [
        { key: "code", label: "Code" },
        { key: "life_status", label: "Injured or martyred" },
        { key: "personal_history", label: "Personal history" },
        { key: "widow", label: "Widow status" },
        { key: "orphan", label: "Orphan status" },
      ],
    },
    {
      title: "Family Information",
      fields: [
        { key: "family_id", label: "Family info" },
      ],
    },
    {
      title: "Counseling Records (PDF)",
      fields: [
        { key: "counseling_link", label: "Counseling details" },
      ],
    },
    {
      title: "PCL",
      fields: [
        { key: "pcl_link", label: "PCL details" },
      ],
    },
    {
      title: "Counseling Sessions",
      fields: [
        { key: "counseling_sessions_link", label: "Counseling sessions Brief" },
      ],
    },
  ];

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isGuest, isNoUpdate } = useRole(); // ✅ role 확인

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    setLoading(true);

    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("id", Number(id))
      .single();

    if (clientError) {
      console.error(clientError);
      alert("Failed to load client data");
      setLoading(false);
      return;
    }

    const { data: counselData } = await supabase
      .from("counsels")
      .select("is_adult")
      .eq("client_id", Number(id))
      .maybeSingle();

    const finalData = {
      ...clientData,
      is_adult_counsel: counselData?.is_adult ?? null
    };

    setClient(finalData);
    setLoading(false);
  };

  const handleChange = (field: keyof Client, value: any) => {
    if (!client) return;
    setClient({ ...client, [field]: value });
  };

  const handleSave = async () => {
    if (!client) return;

    const { id, is_adult_counsel, ...data } = client;

    const dataToUpdate: any = {};
    Object.entries(data).forEach(([key, value]) => {
      if (['created_at', 'updated_at'].includes(key)) return;
      if (value === undefined) dataToUpdate[key] = null;
      else if (key === "widow" || key === "orphan") dataToUpdate[key] = !!value;
      else dataToUpdate[key] = value;
    });

    try {
      const { data: responseData, error } = await supabase
        .from("clients")
        .update(dataToUpdate)
        .eq("id", Number(id))
        .select();

      if (error) throw error;

      if (!responseData || responseData.length === 0) {
        console.warn("업데이트된 행이 없습니다. ID를 확인하세요.");
      }

      alert("Saved successfully!");
      setEditMode(false);
      fetchClient();
    } catch (err: any) {
      console.error("Update failed detailed:", err);
      alert(`Update failed: ${err.hint || err.message}`);
    }
  };

  // ✅ 필드 값 렌더링 함수 - guest 마스킹 처리
  const renderMaskedValue = (key: keyof Client, _value: any) => {
    if (isGuest && GUEST_HIDDEN_FIELDS.includes(key)) {
      return <span style={{ color: "#aaa", letterSpacing: "2px" }}>••••••</span>;
    }
    return null; // 마스킹 불필요 → 기존 렌더링 사용
  };

  if (loading || !client) return <p>Loading ...</p>;

  return (
    <div className="detail-container">
      <h1>
        [{client.id ?? "Client Detail"}]{" "}
        {/* ✅ 제목의 이름도 마스킹 */}
        {isGuest ? <span style={{ color: "#aaa" }}>••••••</span> : (client.name ?? "Client Detail")}
      </h1>

      <div className="detail-actions" style={{ display: "flex", justifyContent: "space-between" }}>
        <button className="back-btn" onClick={() => navigate("/clients")}>◀ Go to list</button>
        {/* ✅ guest는 수정 버튼 숨김 */}
        {!isGuest && !isNoUpdate && (
          <div>
            <button onClick={() => setEditMode(!editMode)}>
              {editMode ? "Cancel" : "Update"}
            </button>
            {editMode && (
              <button className="save-btn" onClick={handleSave}>
                Save
              </button>
            )}
          </div>
        )}
      </div>

      {sections.map((section) => {
        // ✅ guest면 해당 섹션 숨김
        if (isGuest && ["Family Information", "Counseling Records (PDF)"].includes(section.title)) {
          return null;
        }

        return (
        <div key={section.title} className="detail-section">
          <h2>{section.title}</h2>
          <table className="detail-table">
            <tbody>
              {section.fields.map(({ key, label }) => {
                // 상담 링크 특수 처리
                if (key === "counseling_link") {
                  const counselingPath = client.counsel_q_adult
                    ? `/counseling2/${client.id}`
                    : `/counseling/${client.id}`;
                  return (
                    <tr key={key}>
                      <td className="field-name">{label}</td>
                      <td className="field-value">
                        <button className="primary-btn" onClick={() => navigate(counselingPath)}>
                          View
                        </button>
                      </td>
                    </tr>
                  );
                }

                // PCL 링크 특수 처리
                if (key === "pcl_link") {
                  const pclPath = client.is_adult_counsel
                    ? `/pcl-adult/${client.id}`
                    : `/pcl-child/${client.id}`;
                  return (
                    <tr key={key}>
                      <td className="field-name">{label}</td>
                      <td className="field-value">
                        <button className="primary-btn" onClick={() => navigate(pclPath)}>
                          View
                        </button>
                      </td>
                    </tr>
                  );
                }

                // Counseling Sessions 링크 특수 처리
                if (key === "counseling_sessions_link") {
                  return (
                    <tr key={key}>
                      <td className="field-name">{label}</td>
                      <td className="field-value">
                        <button className="primary-btn" onClick={() => navigate(`/counseling-sessions/${client.id}`)}>
                          View
                        </button>
                      </td>
                    </tr>
                  );
                }

                const value = client[key as keyof Client];
                const readOnly = readOnlyFields.includes(key as keyof Client);

                // ✅ guest 마스킹 체크
                const maskedValue = renderMaskedValue(key as keyof Client, value);

                return (
                  <tr key={key}>
                    <td className="field-name">{label}</td>
                    <td className="field-value">
                      {/* ✅ guest + 민감 필드면 마스킹 표시 */}
                      {maskedValue ? maskedValue : editMode && !readOnly ? (
                        key === "widow" || key === "orphan" ? (
                          <input
                            type="checkbox"
                            checked={!!value}
                            onChange={(e) => handleChange(key as keyof Client, e.target.checked)}
                          />
                        ) : key === "birth_date" ? (
                          <input
                            type="date"
                            value={typeof value === "boolean" ? "" : value ?? ""}
                            onChange={(e) => handleChange(key as keyof Client, e.target.value)}
                          />
                        ) : Array.isArray(value) ? (
                          <input
                            type="text"
                            value={value.join(", ")}
                            onChange={(e) =>
                              handleChange(key as keyof Client, e.target.value.split(",").map((v) => v.trim()))
                            }
                          />
                        ) : (
                          <input
                            type="text"
                            value={typeof value === "boolean" ? "" : value ?? ""}
                            onChange={(e) => handleChange(key as keyof Client, e.target.value)}
                          />
                        )
                      ) : key === "family_id" ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <button
                            className="primary-btn"
                            onClick={() => navigate(`/families/${value || "empty"}`, { state: { clientId: client.id, clientName: client.name } })}
                          >
                            View
                          </button>
                        </div>
                      ) : key === "widow" || key === "orphan" ? (
                        value ? "Yes" : "No"
                      ) : Array.isArray(value) ? (
                        value.join(", ") || "No info"
                      ) : value === null || value === "" ? (
                        ""
                      ) : (
                        value.toString()
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        );
      })}

      {!isGuest && !isNoUpdate && editMode && (
        <button className="save-btn" onClick={handleSave}>
          Save
        </button>
      )}
    </div>
  );
}