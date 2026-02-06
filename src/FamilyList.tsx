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

  // Edit Mode States
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBackground, setEditBackground] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

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

  const startEditing = (family: Family) => {
    setEditingId(family.id);
    setEditBackground(family.family_background || "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditBackground("");
  };

  const saveEditing = async (id: number) => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      console.log(`Updating family id: ${id} with content:`, editBackground);

      const { data, error } = await supabase
        .from("family")
        .update({ family_background: editBackground })
        .eq("id", id)
        .select();

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn("Update successful but no rows modified. RLS blocking?");
        alert("⚠️ 저장은 '성공'했지만, 실제 데이터가 바뀌지 않았습니다.\n\n가능성이 높은 원인:\n1. Supabase의 [RLS Policy]가 수정을 막고 있습니다.\n2. 해당 가족 ID를 찾을 수 없습니다.\n\nSupabase 대시보드에서 'family' 테이블의 UPDATE 권한을 확인해주세요.");
        return;
      }

      console.log("Update success:", data);
      alert("저장되었습니다.");
      setEditingId(null);
      fetchFamilies(); // 목록 새로고침
    } catch (err: any) {
      console.error("Save failed caught:", err);
      // 에러 메시지를 더 자세히 표시
      alert(`저장 실패:\nCode: ${err.code || "Unknown"}\nMessage: ${err.message}\nDetails: ${err.details || "None"}\nHint: ${err.hint || "None"}`);
    } finally {
      setIsSaving(false);
    }
  };


  // Generate photo URLs (1.png ~ maxPhotos.png)
  // const getPhotoUrls = (folder: string | null, maxPhotos = 20) => {
  //   if (!folder) return [];
  //   const baseUrl = `https://uihlvzejcglditmlqzuq.supabase.co/storage/v1/object/public/pictures/${folder}/`;
  //   const urls: string[] = [];
  //   for (let i = 1; i <= maxPhotos; i++) {
  //     urls.push(`${baseUrl}${i}.png`);
  //   }
  //   return urls;
  // };

  // 텍스트와 [photoN] 태그를 파싱하여 렌더링하는 함수
  const parseAndRenderContent = (text: string | null, photoFolder: string | null) => {
    if (!text) return "❌";

    // photoFolder가 있을 때만 이미지 URL 생성
    const baseUrl = photoFolder
      ? `https://uihlvzejcglditmlqzuq.supabase.co/storage/v1/object/public/pictures/${photoFolder}/`
      : "";

    // 정규식으로 [photo숫자] 패턴을 찾아서 분리
    // 예: "text... [photo1] text..." -> ["text...", "[photo1]", " text..."]
    const parts = text.split(/(\[photo\d+\])/g);

    return parts.map((part, index) => {
      // [photoN] 태그인 경우 이미지 렌더링
      const match = part.match(/^\[photo(\d+)\]$/);
      if (match) {
        const photoNum = match[1];
        if (!baseUrl) return null; // 폴더가 없으면 이미지 렌더링 불가

        const imageUrl = `${baseUrl}${photoNum}.png`;
        return (
          <div key={index} className="interleaved-photo-wrapper">
            <img
              src={imageUrl}
              alt={`family-${photoNum}`}
              className="interleaved-photo"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>
        );
      }

      // 텍스트인 경우 줄바꿈 처리하여 렌더링
      if (part === "") return null;

      return (
        <div key={index} className="bg-text-part" style={{ whiteSpace: 'pre-wrap' }}>
          {part}
        </div>
      );
    });
  };


  // Render
  if (loading) return <p>Loading...</p>;

  return (
    <div className="family-container">
      <h1 style={{ textAlign: "center" }}>[ Family Info ]</h1>

      {/* ◀ Go to list 버튼 */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => navigate("/clients")} style={{ padding: "10px 16px" }}>
          ◀ Go to list
        </button>
      </div>

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
              <div className="bg-content-wrapper" style={{ width: "100%" }}>
                {editingId === f.id ? (
                  <div className="edit-area">
                    {!f.family_photos && (
                      <div style={{ padding: "8px", background: "#fee2e2", color: "#b91c1c", borderRadius: "4px", fontSize: "0.9rem" }}>
                        ⚠️ 이 가족은 연결된 사진 폴더가 없습니다. <code>[photo1]</code> 등의 태그를 써도 사진이 나오지 않습니다.
                        DB의 <code>family_photos</code> 컬럼을 먼저 확인해주세요.
                      </div>
                    )}
                    <textarea
                      className="edit-textarea"
                      value={editBackground}
                      onChange={(e) => setEditBackground(e.target.value)}
                      rows={15}
                      placeholder="내용을 입력하세요. 사진을 넣으려면 [photo1], [photo2] 와 같이 입력하세요."
                    />
                    <div className="edit-buttons">
                      <button
                        className="mini-btn save-btn"
                        onClick={() => saveEditing(f.id)}
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </button>
                      <button
                        className="mini-btn cancel-btn"
                        onClick={cancelEditing}
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="help-text">
                      * 팁: <code>[photo1]</code>은 해당 가족의 사진 폴더 내 <code>1.png</code> 파일을 의미합니다.
                    </p>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: "10px" }}>
                      <button className="mini-btn" onClick={() => startEditing(f)}>
                        Update Content
                      </button>
                    </div>
                    {parseAndRenderContent(f.family_background, f.family_photos)}
                  </>
                )}
              </div>
            </div>

            {/* 📸 Photos - 이제 본문에 포함되므로 별도로 표시하지 않거나,
                본문에 포함되지 않은 남은 사진만 표시할 수도 있음.
                일단은 사용자 요청대로 "본문에 섞여 나오도록" 했으므로 하단 갤러리는 주석 처리하거나 제거.
                필요하다면 옵션으로 남겨둘 수 있음. */}
            {/* 
            <div className="family-row">
              <span className="label">Photos</span>
              <div className="photo-grid">
                ...
              </div>
            </div> 
            */}
          </div>
        ))
      )}
    </div>
  );
}