import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "./lib/supabase";
import "./FamilyList.css";

// Types
type Family = {
  id: number;
  fathers_id: number | null;
  mothers_id: number | null;
  sons_ids: number[] | null;
  daughters_ids: number[] | null;
  gr_fathers_id: number | null;
  gr_mothers_id: number | null;
  family_photos: string | null; 
  family_background: string | null;
};

type Client = {
  id: number;
  name: string | null;
};


// Component
export default function FamilyList() {
  const navigate = useNavigate();
  const params = useParams();
  const familyId = params.familyId || params.id; // familyId 또는 id 둘 다 체크
  
  const [families, setFamilies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("===== DEBUG =====");
    console.log("All params:", params);
    console.log("familyId:", familyId);
    console.log("================");
    fetchFamilies();
  }, [familyId]);


  // Fetch families + clients (해당 family_id의 가족만)
  const fetchFamilies = async () => {
    setLoading(true);

    try {
      // familyId가 있으면 해당 가족만, 없으면 모든 가족 가져오기
      let query = supabase.from("family").select("*");
      
      if (familyId) {
        query = query.eq("id", Number(familyId));
      }

      const { data: familiesData, error: fErr } = await query;

      console.log("Families data:", familiesData, "Error:", fErr);

      const { data: clientsData, error: cErr } = await supabase
        .from("clients")
        .select("id, name");

      console.log("Clients data:", clientsData, "Error:", cErr);

      if (fErr || cErr) {
        console.error("Error:", fErr || cErr);
        alert(`데이터 가져오기 실패: ${fErr?.message || cErr?.message}`);
        setLoading(false);
        return;
      }

      if (!familiesData || !clientsData) {
        console.log("No data found");
        setFamilies([]);
        setLoading(false);
        return;
      }

      const findName = (id: number | null) =>
        clientsData.find((c: Client) => c.id === id)?.name ?? "❌";

      const mapped = familiesData.map((f: Family) => ({
        ...f,
        father_name: findName(f.fathers_id),
        mother_name: findName(f.mothers_id),
        grandfather_name: findName(f.gr_fathers_id),
        grandmother_name: findName(f.gr_mothers_id),
        sons: f.sons_ids?.map((id) => ({ id, name: findName(id) })) ?? [],
        daughters:
          f.daughters_ids?.map((id) => ({ id, name: findName(id) })) ?? [],
      }));

      console.log("Mapped families:", mapped);
      setFamilies(mapped);
      setLoading(false);
    } catch (err) {
      console.error("Unexpected error:", err);
      alert(`예상치 못한 에러: ${err}`);
      setFamilies([]);
      setLoading(false);
    }
  };


  // Generate photo URLs (1.png ~ maxPhotos.png)
  const getPhotoUrls = (folder: string | null, maxPhotos = 20) => {
    if (!folder) return [];
    const baseUrl = `https://uihlvzejcglditmlqzuq.supabase.co/storage/v1/object/public/pictures/${folder}/`;
    const urls: string[] = [];
    for (let i = 1; i <= maxPhotos; i++) {
      urls.push(`${baseUrl}${i}.png`);
    }
    return urls;
  };


  // Render
  if (loading) return <p>Loading...</p>;

  return (
    <div className="family-container">
      <h1 style={{ textAlign: "center" }}>[ Family Info ]</h1>

      {families.length === 0 ? (
        <p style={{ textAlign: "center" }}>가족 정보가 없습니다.</p>
      ) : (
        families.map((f) => (
          <div key={f.id} className="family-card">
            <div className="family-row">
              <span className="label">Father</span>
              {f.fathers_id ? (
                <button
                  className="mini-btn"
                  onClick={() => navigate(`/clients/${f.fathers_id}`)}
                >
                  {f.father_name}
                </button>
              ) : (
                "❌"
              )}
            </div>

            <div className="family-row">
              <span className="label">Mother</span>
              {f.mothers_id ? (
                <button
                  className="mini-btn"
                  onClick={() => navigate(`/clients/${f.mothers_id}`)}
                >
                  {f.mother_name}
                </button>
              ) : (
                "❌"
              )}
            </div>

            <div className="family-row">
              <span className="label">Sons</span>
              <div className="inline-group">
                {f.sons.length > 0
                  ? f.sons.map((s: any) => (
                      <button
                        key={s.id}
                        className="mini-btn"
                        onClick={() => navigate(`/clients/${s.id}`)}
                      >
                        {s.name}
                      </button>
                    ))
                  : "❌"}
              </div>
            </div>

            <div className="family-row">
              <span className="label">Daughters</span>
              <div className="inline-group">
                {f.daughters.length > 0
                  ? f.daughters.map((d: any) => (
                      <button
                        key={d.id}
                        className="mini-btn"
                        onClick={() => navigate(`/clients/${d.id}`)}
                      >
                        {d.name}
                      </button>
                    ))
                  : "❌"}
              </div>
            </div>

            <div className="family-row">
              <span className="label">Grandfather</span>
              {f.gr_fathers_id ? (
                <button
                  className="mini-btn"
                  onClick={() => navigate(`/clients/${f.gr_fathers_id}`)}
                >
                  {f.grandfather_name}
                </button>
              ) : (
                "❌"
              )}
            </div>

            <div className="family-row">
              <span className="label">Grandmother</span>
              {f.gr_mothers_id ? (
                <button
                  className="mini-btn"
                  onClick={() => navigate(`/clients/${f.gr_mothers_id}`)}
                >
                  {f.grandmother_name}
                </button>
              ) : (
                "❌"
              )}
            </div>

            <div className="family-row">
              <span className="label">Background</span>
              <span className="bg-text">{f.family_background ?? "❌"}</span>
            </div>

            {/* 📸 Photos */}
            <div className="family-row">
              <span className="label">Photos</span>
              <div className="photo-grid">
                {f.family_photos ? (
                  getPhotoUrls(f.family_photos, 10).map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`family-${idx + 1}`}
                      className="family-photo"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ))
                ) : (
                  "❌"
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}