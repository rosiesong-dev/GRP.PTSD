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
    topic: string | null;
    eval_spiritual: string | null;
    eval_physical: string | null;
    eval_financial: string | null;
    eval_educational: string | null;
    eval_psychological: string | null;
    eval_total: number | null;
    eval_average: number | null;
    educational: string | null;
    jobs: string | null;
    business: string | null;
    vocational: string | null;
    note: string | null;
    prayer_note: string | null;
    file: string | null;
    file_name: string | null;
};

export default function CounselingSessions() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<CounselSession[]>([]);
    const [clientName, setClientName] = useState<string>("");
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);

        // Fetch Client Name
        const { data: cData } = await supabase
            .from("clients")
            .select("name")
            .eq("id", Number(id))
            .single();

        if (cData) setClientName(cData.name);

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
        }
        setLoading(false);
    };



    if (loading) return <p>Loading...</p>;

    return (
        <div className="sessions-wrapper">
            <div className="sessions-header">
                <h1 className="header-title">Counseling Sessions Brief</h1>
                <h2 className="header-client">[{id}] {clientName}</h2>
                <button className="back-btn" onClick={() => navigate(`/clients/${id}`)}>
                    ◀ Go to client detail
                </button>
            </div>

            <div className="sessions-list">
                {sessions.length === 0 ? (
                    <p className="no-data">No counseling sessions found.</p>
                ) : (
                    sessions.map((session) => (
                        <div key={session.id} className="session-card">

                            {/* 상단: Counseling */}
                            <div className="session-section">
                                <h3>Counseling</h3>
                                <div className="grid-info">
                                    <div className="info-item"><strong>Date:</strong> {session.start_date || "-"}</div>
                                    <div className="info-item"><strong>Counselor:</strong> {session.counselor || "-"}</div>
                                    <div className="info-item"><strong>Type:</strong> {session.counsel_type || "-"}</div>
                                    <div className="info-item">
                                        <strong>Status:</strong>
                                        <span className={`badge badge-${session.status?.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(" ", "") || "default"}`}>
                                            {session.status?.replace(/[^\p{L}\p{N}\s-]/gu, "").trim() || "-"}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <strong>Emergency:</strong>
                                        <span className={`badge badge-${session.emergency?.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(" ", "") || "default"}`}>
                                            {session.emergency?.replace(/[^\p{L}\p{N}\s-]/gu, "").trim() || "-"}
                                        </span>
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
                                    <div className="text-block"><strong>Spiritual</strong> {session.eval_spiritual || "No data"}</div>
                                    <div className="text-block"><strong>Physical</strong> {session.eval_physical || "No data"}</div>
                                    <div className="text-block"><strong>Financial</strong> {session.eval_financial || "No data"}</div>
                                    <div className="text-block"><strong>Educational</strong> {session.eval_educational || "No data"}</div>
                                    <div className="text-block"><strong>Psychological</strong> {session.eval_psychological || "No data"}</div>
                                </div>
                            </div>

                            {/* 중2단: Self-Sustainable Living */}
                            <div className="session-section">
                                <h3>Self-Sustainable Living</h3>
                                <div className="text-block"><strong>Education</strong> {session.educational || "No data"}</div>
                                <div className="text-block"><strong>Jobs</strong> {session.jobs || "No data"}</div>
                                <div className="text-block"><strong>Business</strong> {session.business || "No data"}</div>
                                <div className="text-block"><strong>Vocation</strong> {session.vocational || "No data"}</div>
                                <div className="text-block"><strong>Note</strong> {session.note || "No data"}</div>
                            </div>

                            {/* 하단: Prayer Note & Files */}
                            <div className="session-section">
                                <h3>Prayer Note</h3>
                                <div className="prayer-box">
                                    {session.prayer_note || "No prayer note"}
                                </div>

                                {session.file && (
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
