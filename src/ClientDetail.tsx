import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import "./ClientDetail.css";

type Client = {
  id: number;
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
};

const readOnlyFields: (keyof Client)[] = ["id", "family_id"];

const sections: {
  title: string;
  fields: { key: keyof Client; label: string }[];
}[] = [
  {
    title: "Basic Information",
    fields: [
      { key: "profile_image", label: "Profile (사진)" },
      { key: "status", label: "Status" },
      { key: "birth_date", label: "Birthday" },
      { key: "age", label: "Age" },
      { key: "gender", label: "Gender" },
      { key: "cnic_number", label: "CNIC number" },
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
      { key: "family_id", label: "Family ID" },
      { key: "client_image", label: "Family pictures" },
    ],
  },
];

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
      alert("Failed to load client data");
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
      .update(client)
      .eq("id", client.id);

    if (error) {
      console.error(error);
      alert("Update failed");
    } else {
      alert("Saved successfully!");
      setEditMode(false);
      fetchClient();
    }
  };

  if (loading || !client) return <p>Loading ...</p>;

  return (
    <div className="detail-container">
      <h1>[ {client.name ?? "Client Detail"} ]</h1>

      <div className="detail-actions">
        <button onClick={() => navigate(-1)}>◀ Go to list</button>
        <button onClick={() => setEditMode(!editMode)}>
          {editMode ? "Cancel" : "Update"}
        </button>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="detail-section">
          <h2>{section.title}</h2>
          <table className="detail-table">
            <tbody>
              {section.fields.map(({ key, label }) => {
                const value = client[key];
                const readOnly = readOnlyFields.includes(key);

                return (
                  <tr key={key}>
                    <td className="field-name">{label}</td>
                    <td className="field-value">
                      {editMode && !readOnly ? (
                        key === "widow" || key === "orphan" ? (
                          <input
                            type="checkbox"
                            checked={!!value}
                            onChange={(e) =>
                              handleChange(key, e.target.checked)
                            }
                          />
                        ) : key === "birth_date" ? (
                          <input
                            type="date"
                            value={value ?? ""}
                            onChange={(e) =>
                              handleChange(key, e.target.value)
                            }
                          />
                        ) : Array.isArray(value) ? (
                          <input
                            type="text"
                            value={value.join(", ")}
                            onChange={(e) =>
                              handleChange(
                                key,
                                e.target.value.split(",").map((v) => v.trim())
                              )
                            }
                          />
                        ) : (
                          <input
                            type="text"
                            value={value ?? ""}
                            onChange={(e) =>
                              handleChange(key, e.target.value)
                            }
                          />
                        )
                      ) 
                      : key === "family_id" ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {value ?? "No info"}
                          <button
                            className="primary-btn"
                            onClick={() => value && navigate(`/families/${value}`)}
                          >
                            View
                          </button>
                        </div>
                      ) : key === "widow" || key === "orphan" ? (
                        value ? "Yes" : "No"
                      ) : Array.isArray(value) ? (
                        value.join(", ") || "No info"
                      ) : value === null || value === "" ? (
                        "No info"
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
      ))}

      {editMode && (
        <button className="save-btn" onClick={handleSave}>
          Save
        </button>
      )}
    </div>
  );
}