import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import "./CounselingSessions.css";

type CounselSession = {
    id: number;
    client_id: number;
    start_date: string | null;
    end_date: string | null;
    counselor: string | null;
    counsel_type: string | null;
    status: string | null;
    emergency: string | null;
    care_giver: string | null;
    topic: string | null;
    eval_spiritual: string | null;
    eval_physical: string | null;
    eval_financial: string | null;
    eval_educational: string | null;
    eval_psychological: string | null;
    eval_total: number | null;
    eval_average: number | null;
    education: string | null;
    jobs: string | null;
    business: string | null;
    vocation: string | null;
    note: string | null;
    prayer_note: string | null;
    file: string | null;
    file_name: string | null;
};

export default function CounselingSessions() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<CounselSession[]>([]);
    const [editedSessions, setEditedSessions] = useState<CounselSession[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [clientName, setClientName] = useState<string>("");
    const [careGiver, setCareGiver] = useState<string>("");
    const [editedCareGiver, setEditedCareGiver] = useState<string>("");
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);

        // Fetch Client Name and Care Giver
        const { data: cData } = await supabase
            .from("clients")
            .select("name, care_giver")
            .eq("id", Number(id))
            .single();

        if (cData) {
            setClientName(cData.name);
            setCareGiver(cData.care_giver || "");
            setEditedCareGiver(cData.care_giver || "");
        }

        // Fetch Counsel Sessions
        const { data: sData, error } = await supabase
            .from("counsels")
            .select("*")
            .eq("client_id", Number(id))
            .order("start_date", { ascending: false });

        if (error) {
            console.error(error);
            alert("Failed to load generic sessions data");
        } else {
            setSessions(sData || []);
            setEditedSessions(sData || []);
        }
        setLoading(false);
    };

    const handleEditChange = (index: number, field: keyof CounselSession, value: string) => {
        const newData = [...editedSessions];
        newData[index] = { ...newData[index], [field]: value };
        setEditedSessions(newData);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Update counsels
            await Promise.all(
                editedSessions.map(async (session) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { care_giver, ...counselData } = session; // Remove care_giver before saving to counsels

                    // Supabase treats "" as an empty string, which is fine, but we always want to update
                    await supabase.from("counsels").update(counselData).eq("id", session.id);
                })
            );

            // Update client care_giver if changed
            if (careGiver !== editedCareGiver) {
                await supabase.from("clients").update({ care_giver: editedCareGiver }).eq("id", Number(id));
                setCareGiver(editedCareGiver);
            }

            setSessions(editedSessions);
            setIsEditing(false);
            alert("Sessions updated successfully!");
        } catch (e) {
            console.error(e);
            alert("Failed to save updates.");
        }
        setLoading(false);
    };

    const handleCancel = () => {
        setEditedSessions(sessions);
        setEditedCareGiver(careGiver);
        setIsEditing(false);
    };



    if (loading) return <p>Loading...</p>;

    return (
        <div className="sessions-wrapper">
            <div className="sessions-header">
                <h1 className="header-title">Counseling Sessions Brief</h1>
                <h2 className="header-client">[{id}] {clientName}</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <button className="back-btn" onClick={() => navigate(`/clients/${id}`)}>
                        ◀ Go to client detail
                    </button>
                    <div>
                        {!isEditing ? (
                            <button className="back-btn" onClick={() => setIsEditing(true)}>
                                Update
                            </button>
                        ) : (
                            <>
                                <button className="back-btn" style={{ marginRight: '10px' }} onClick={handleCancel}>
                                    Cancel
                                </button>
                                <button className="back-btn" style={{ backgroundColor: 'orange' }} onClick={handleSave}>
                                    Save
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="sessions-list">
                {sessions.length === 0 ? (
                    <p className="no-data">No counseling sessions found.</p>
                ) : (
                    editedSessions.map((session, index) => (
                        <div key={session.id} className="session-card">

                            {/* 상단: Counseling */}
                            <div className="session-section">
                                <h3>Counseling</h3>
                                <div className="grid-info">
                                    <div className="info-item">
                                        <strong>Date:</strong>
                                        {isEditing ? <input type="date" value={session.start_date || ""} onChange={(e) => handleEditChange(index, 'start_date', e.target.value)} style={{ marginLeft: '5px' }} /> : (session.start_date || "-")}
                                    </div>
                                    <div className="info-item">
                                        <strong>Counselor:</strong>
                                        {isEditing ? <input type="text" value={session.counselor || ""} onChange={(e) => handleEditChange(index, 'counselor', e.target.value)} style={{ marginLeft: '5px' }} /> : (session.counselor || "-")}
                                    </div>
                                    <div className="info-item">
                                        <strong>Type:</strong>
                                        {isEditing ? <input type="text" value={session.counsel_type || ""} onChange={(e) => handleEditChange(index, 'counsel_type', e.target.value)} style={{ marginLeft: '5px' }} /> : (session.counsel_type || "-")}
                                    </div>
                                    <div className="info-item">
                                        <strong>Status:</strong>
                                        {isEditing ? (
                                            <input type="text" value={session.status || ""} onChange={(e) => handleEditChange(index, 'status', e.target.value)} style={{ marginLeft: '5px' }} />
                                        ) : (
                                            session.status && session.status.trim() !== "" && session.status !== "-" ? (
                                                <span className={`badge badge-${session.status.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(" ", "") || "default"}`}>
                                                    {session.status.replace(/[^\p{L}\p{N}\s-]/gu, "").trim()}
                                                </span>
                                            ) : (
                                                "-"
                                            )
                                        )}
                                    </div>
                                    <div className="info-item">
                                        <strong>Emergency:</strong>
                                        {isEditing ? (
                                            <input type="text" value={session.emergency || ""} onChange={(e) => handleEditChange(index, 'emergency', e.target.value)} style={{ marginLeft: '5px' }} />
                                        ) : (
                                            session.emergency && session.emergency.trim() !== "" && session.emergency !== "-" ? (
                                                <span className={`badge badge-${session.emergency.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(" ", "") || "default"}`}>
                                                    {session.emergency.replace(/[^\p{L}\p{N}\s-]/gu, "").trim()}
                                                </span>
                                            ) : (
                                                "-"
                                            )
                                        )}
                                    </div>
                                    <div className="info-item">
                                        <strong>Care-Giver:</strong>
                                        {isEditing ? (
                                            <input type="text" value={editedCareGiver} onChange={(e) => setEditedCareGiver(e.target.value)} style={{ marginLeft: '5px' }} />
                                        ) : (
                                            careGiver || "-"
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 중1단: Wholistic Evaluation */}
                            <div className="session-section eval-section">
                                <div className="eval-header" style={{ cursor: 'default' }}>
                                    <h3>Wholistic Evaluation</h3>
                                    <div className="eval-summary">
                                        {session.eval_total != null && <span className="score-badge">Total: {session.eval_total}</span>}
                                        {session.eval_average != null && <span className="score-badge">Avg: {session.eval_average}</span>}
                                    </div>
                                </div>

                                <div className="eval-content mt-3">
                                    <div className="text-block">
                                        <strong>Spiritual</strong>
                                        {isEditing ? <input type="text" value={session.eval_spiritual || ""} onChange={(e) => handleEditChange(index, 'eval_spiritual', e.target.value)} style={{ width: 'calc(100% - 150px)', marginLeft: '10px' }} /> : (session.eval_spiritual || "No data")}
                                    </div>
                                    <div className="text-block">
                                        <strong>Physical</strong>
                                        {isEditing ? <input type="text" value={session.eval_physical || ""} onChange={(e) => handleEditChange(index, 'eval_physical', e.target.value)} style={{ width: 'calc(100% - 150px)', marginLeft: '10px' }} /> : (session.eval_physical || "No data")}
                                    </div>
                                    <div className="text-block">
                                        <strong>Financial</strong>
                                        {isEditing ? <input type="text" value={session.eval_financial || ""} onChange={(e) => handleEditChange(index, 'eval_financial', e.target.value)} style={{ width: 'calc(100% - 150px)', marginLeft: '10px' }} /> : (session.eval_financial || "No data")}
                                    </div>
                                    <div className="text-block">
                                        <strong>Educational</strong>
                                        {isEditing ? <input type="text" value={session.eval_educational || ""} onChange={(e) => handleEditChange(index, 'eval_educational', e.target.value)} style={{ width: 'calc(100% - 150px)', marginLeft: '10px' }} /> : (session.eval_educational || "No data")}
                                    </div>
                                    <div className="text-block">
                                        <strong>Psychological</strong>
                                        {isEditing ? <input type="text" value={session.eval_psychological || ""} onChange={(e) => handleEditChange(index, 'eval_psychological', e.target.value)} style={{ width: 'calc(100% - 150px)', marginLeft: '10px' }} /> : (session.eval_psychological || "No data")}
                                    </div>
                                </div>
                            </div>

                            {/* 중2단: Self-Sustainable Living */}
                            <div className="session-section">
                                <h3>Self-Sustainable Living</h3>
                                <div className="text-block">
                                    <strong>Education</strong>
                                    {isEditing ? <input type="text" value={session.education || ""} onChange={(e) => handleEditChange(index, 'education', e.target.value)} style={{ width: 'calc(100% - 150px)', marginLeft: '10px' }} /> : (session.education || "No data")}
                                </div>
                                <div className="text-block">
                                    <strong>Jobs</strong>
                                    {isEditing ? <input type="text" value={session.jobs || ""} onChange={(e) => handleEditChange(index, 'jobs', e.target.value)} style={{ width: 'calc(100% - 150px)', marginLeft: '10px' }} /> : (session.jobs || "No data")}
                                </div>
                                <div className="text-block">
                                    <strong>Business</strong>
                                    {isEditing ? <input type="text" value={session.business || ""} onChange={(e) => handleEditChange(index, 'business', e.target.value)} style={{ width: 'calc(100% - 150px)', marginLeft: '10px' }} /> : (session.business || "No data")}
                                </div>
                                <div className="text-block">
                                    <strong>Vocation</strong>
                                    {isEditing ? <input type="text" value={session.vocation || ""} onChange={(e) => handleEditChange(index, 'vocation', e.target.value)} style={{ width: 'calc(100% - 150px)', marginLeft: '10px' }} /> : (session.vocation || "No data")}
                                </div>
                                <div className="text-block">
                                    <strong>Note</strong>
                                    {isEditing ? <textarea value={session.note || ""} onChange={(e) => handleEditChange(index, 'note', e.target.value)} style={{ width: '100%', marginTop: '5px', minHeight: '60px' }} /> : (session.note || "No data")}
                                </div>
                            </div>

                            {/* 하단: Prayer Note & Files */}
                            <div className="session-section">
                                <h3>Prayer Note</h3>
                                {isEditing ? (
                                    <textarea
                                        className="prayer-box"
                                        style={{ width: '100%', boxSizing: 'border-box', minHeight: '80px' }}
                                        value={session.prayer_note || ""}
                                        onChange={(e) => handleEditChange(index, 'prayer_note', e.target.value)}
                                    />
                                ) : (
                                    <div className="prayer-box">
                                        {session.prayer_note || "No prayer note"}
                                    </div>
                                )}

                                {session.file && !isEditing && (
                                    <div className="file-attachment mt-3">
                                        <strong>Attachment:</strong>
                                        <a href={session.file} target="_blank" rel="noopener noreferrer" className="ml-2 file-link">
                                            📎 {session.file_name || "Download File"}
                                        </a>
                                    </div>
                                )}
                            </div>

                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
