import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import "./FamilyList.css";

// --------------------
// Types
// --------------------
type Family = {
  id: number;
  fathers_id: number | null;
  mothers_id: number | null;
  sons_ids: number[] | null;
  daughters_ids: number[] | null;
  gr_fathers_id: number | null;
  gr_mothers_id: number | null;
  family_photos: string | null; // e.g. "3-1"
  family_background: string | null;
};

type Client = {
  id: number;
  name: string | null;
};

// --------------------
// Component
// --------------------
export default function FamilyList() {
  const navigate = useNavigate();
  const [families, setFamilies] = useState<any[]>([]);
  const [photosMap, setPhotosMap] = useState<Record<number, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFamilies();
  }, []);

  // --------------------
  // Fetch photos from Supabase Storage
  // --------------------
  const fetchFamilyPhotos = async (familyId: number, folderPath: string) => {
    const { data, error } = await supabase.storage
      .from("pictures")
      .list(folderPath, { limit: 100, offset: 0 });

    if (error) {
      console.error("Photo load error:", error);
      setPhotosMap((prev) => ({ ...prev, [familyId]: [] }));
      return;
    }

    if (!data || data.length === 0) {
      setPhotosMap((prev) => ({ ...prev, [familyId]: [] }));
      return;
    }

    const urls = data
      .filter((file) => file.name && !file.name.endsWith("/"))
      .map((file) =>
        supabase.storage
          .from("pictures")
          .getPublicUrl(`${folderPath}/${file.name}`).data.publicUrl
      );

    setPhotosMap((prev) => ({
      ...prev,
      [familyId]: urls,
    }));
  };

  // --------------------
  // Fetch families + clients
  // --------------------
  const fetchFamilies = async () => {
    setLoading(true);

    const { data: familiesData, error: fErr } = await supabase
      .from("family")
      .select("*");

    const { data: clientsData, error: cErr } = await supabase
      .from("clients")
      .select("id, name");

    if (fErr || cErr || !familiesData || !clientsData) {
      console.error(fErr || cErr);
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

    mapped.forEach((f: any) => {
      if (f.family_photos) {
        fetchFamilyPhotos(f.id, f.family_photos);
      }
    });

    setFamilies(mapped);
    setLoading(false);
  };

  // --------------------
  // Render
  // --------------------
  if (loading) return <p>Loading...</p>;

  return (
    <div className="family-container">
      <h1 style={{ textAlign: "center" }}>[ Family  Info ]</h1>

      {families.map((f) => (
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
{/* TESTT---------------------------------------------- */}
          {f.family_photos && (
  <div>
    <h4>Test Photo</h4>
    <img
      src={`https://uihlvzejcglditmlqzuq.supabase.co/storage/v1/object/public/pictures/${f.family_photos}/1.png`}
      alt="test"
      style={{ width: "200px" }}
    />
  </div>
)}
{/* TESTT---------------------------------------------- */}
          {/* 📸 Photos */}
          <div className="family-row">
            <span className="label">Photos</span>
            <div className="photo-grid">
              {photosMap[f.id] && photosMap[f.id].length > 0 ? (
                photosMap[f.id].map((url, idx) => (
                  <div key={idx}>
                    <img
                      src={url}
                      alt="family"
                      className="family-photo"
                    />
                    <p>{url}</p> {/* 화면에 URL도 표시 */}
                  </div>

                ))
              ) : (
                "❌"
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}