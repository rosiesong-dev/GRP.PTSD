import { useState } from "react";
import { supabase } from "./lib/supabase";
import { useNavigate } from "react-router-dom";
import "./AddClient.css";

export default function AddClient() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    serial_num: "",
    name: "",
    status: "",
    birth_date: "",
    age: "",
    gender: "",
    cnic_number: "",
    mobile: "",
    contact_number: "",
    address: "",
    father_name: "",
    guardian_name: "",
    guardian_contact: "",
    life_status: "",
    widow: false,
    orphan: false,
    code: "",
    disaster_id: "",
    disaster_type: "",
    disaster_vtype: "",
    disaster_refer_to: "",
    disaster_case_manager: "",
    disaster_medical_coverage: "",
    disaster_result_action: "",
    personal_history: "",
    profile_image: "",
    client_image: "",
    family_id: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert("Name is required");
      return;
    }

    setLoading(true);

    const age = form.age ? Number(form.age) : null;
    const disaster_id = form.disaster_id ? Number(form.disaster_id) : null;
    const family_id = form.family_id ? Number(form.family_id) : null;

    const { error } = await supabase.from("clients").insert({
      serial_num: form.serial_num || null,
      name: form.name.trim(),
      status: form.status || null,
      birth_date: form.birth_date || null,
      age,
      gender: form.gender || null,
      cnic_number: form.cnic_number || null,
      mobile: form.mobile || null,
      contact_number: form.contact_number || null,
      address: form.address || null,
      father_name: form.father_name || null,
      guardian_name: form.guardian_name || null,
      guardian_contact: form.guardian_contact || null,
      life_status: form.life_status || null,
      widow: form.widow,
      orphan: form.orphan,
      code: form.code || null,
      disaster_id,
      disaster_type: form.disaster_type || null,
      disaster_vtype: form.disaster_vtype || null,
      disaster_refer_to: form.disaster_refer_to || null,
      disaster_case_manager: form.disaster_case_manager || null,
      disaster_medical_coverage: form.disaster_medical_coverage || null,
      disaster_result_action: form.disaster_result_action || null,
      personal_history: form.personal_history || null,
      profile_image: form.profile_image || null,
      client_image: form.client_image
        ? form.client_image.split(",").map((v) => v.trim())
        : null,
      family_id,
    });

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Failed to add new client");
      return;
    }

    alert("Successfully added new client");
    navigate("/");
  };

  // 페이지 열리면 콘솔 찍히도록
  console.log("AddClient page opened");

  return (
    <div className="client-create-container">
      <h1 className="title">Add new Client</h1>

      <div className="form-grid">
        Serial Number: <input className="input" name="serial_num" value={form.serial_num} placeholder="Serial Number" onChange={handleChange} />
        Name: <input className="input" name="name" value={form.name} placeholder="Name *" onChange={handleChange} />
        Status: <input className="input" name="status" value={form.status} placeholder="Status" onChange={handleChange} />
        Birthday: <input className="input" type="date" name="birth_date" value={form.birth_date} onChange={handleChange} />
        Age: <input className="input" name="age" value={form.age} placeholder="Age" onChange={handleChange} />
        Gender: <input className="input" name="gender" value={form.gender} placeholder="M or F" onChange={handleChange} />

        Cnic number: <input className="input" name="cnic_number" value={form.cnic_number} placeholder="CNIC" onChange={handleChange} />
        Mobile: <input className="input" name="mobile" value={form.mobile} placeholder="Mobile" onChange={handleChange} />
        Address: <input className="input" name="address" value={form.address} placeholder="Address" onChange={handleChange} />

        Father name: <input className="input" name="father_name" value={form.father_name} placeholder="Father Name" onChange={handleChange} />
        Guardian name: <input className="input" name="guardian_name" value={form.guardian_name} placeholder="Guardian Name" onChange={handleChange} />
        Guardian contact: <input className="input" name="guardian_contact" value={form.guardian_contact} placeholder="Guardian Contact" onChange={handleChange} />

        Injured or martyred: <input className="input" name="life_status" value={form.life_status} placeholder="Life Status" onChange={handleChange} />

        Widow status:
        <label className="checkbox">
          <input type="checkbox" name="widow" checked={form.widow} onChange={handleChange} />
        </label>

        Orphan status:
        <label className="checkbox">
          <input type="checkbox" name="orphan" checked={form.orphan} onChange={handleChange} />
        </label>

        Personal history:
        <textarea
          className="textarea"
          name="personal_history"
          value={form.personal_history}
          placeholder="Personal History"
          onChange={handleChange}
        />

        Upload Images:
        <input className="input" name="profile_image" value={form.profile_image} placeholder="Profile Image URL" onChange={handleChange} />
        Family ID:
        <input className="input" name="family_id" value={form.family_id} placeholder="Family ID" onChange={handleChange} />
      </div>

      <div className="button-group">
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            console.log("🟢 Save button clicked");
            handleSave();
          }}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>

        <button
          type="button"
          className="btn"
          onClick={() => navigate("/")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}