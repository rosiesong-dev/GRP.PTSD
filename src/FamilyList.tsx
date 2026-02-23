import { useEffect, useRef, useState } from "react";
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

  // Edit Mode States (for family_background)
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBackground, setEditBackground] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Update Mode States (for family members)
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [editIds, setEditIds] = useState<{
    [key: number]: {
      fathers_id: string;
      mothers_id: string;
      sons_ids: string;
      daughters_ids: string;
      gr_fathers_id: string;
      gr_mothers_id: string;
    };
  }>({});
  const [isSavingFamily, setIsSavingFamily] = useState(false);

  // Image upload states
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const startFamilyUpdate = () => {
    const idMap: {
      [key: number]: {
        fathers_id: string;
        mothers_id: string;
        sons_ids: string;
        daughters_ids: string;
        gr_fathers_id: string;
        gr_mothers_id: string;
      };
    } = {};
    families.forEach((f) => {
      idMap[f.id] = {
        fathers_id: f.fathers_id?.toString() ?? "",
        mothers_id: f.mothers_id?.toString() ?? "",
        sons_ids: f.sons_ids?.join(", ") ?? "",
        daughters_ids: f.daughters_ids?.join(", ") ?? "",
        gr_fathers_id: f.gr_fathers_id?.toString() ?? "",
        gr_mothers_id: f.gr_mothers_id?.toString() ?? "",
      };
    });
    setEditIds(idMap);
    setIsUpdateMode(true);
  };

  const handleEditIdChange = (
    familyId: number,
    field: string,
    value: string
  ) => {
    setEditIds((prev) => ({
      ...prev,
      [familyId]: { ...prev[familyId], [field]: value },
    }));
  };

  const saveFamilyMembers = async () => {
    setIsSavingFamily(true);
    try {
      for (const f of families) {
        const ids = editIds[f.id];
        if (!ids) continue;

        const parsedSons = ids.sons_ids
          ? ids.sons_ids
              .split(",")
              .map((s) => parseInt(s.trim()))
              .filter((n) => !isNaN(n))
          : [];
        const parsedDaughters = ids.daughters_ids
          ? ids.daughters_ids
              .split(",")
              .map((s) => parseInt(s.trim()))
              .filter((n) => !isNaN(n))
          : [];

        const updateData = {
          fathers_id: ids.fathers_id ? parseInt(ids.fathers_id) : null,
          mothers_id: ids.mothers_id ? parseInt(ids.mothers_id) : null,
          sons_ids: parsedSons.length ? parsedSons : null,
          daughters_ids: parsedDaughters.length ? parsedDaughters : null,
          gr_fathers_id: ids.gr_fathers_id ? parseInt(ids.gr_fathers_id) : null,
          gr_mothers_id: ids.gr_mothers_id ? parseInt(ids.gr_mothers_id) : null,
        };

        const { error } = await supabase
          .from("family")
          .update(updateData)
          .eq("id", f.id);

        if (error) throw error;
      }
      alert("저장되었습니다.");
      setIsUpdateMode(false);
      fetchFamilies();
    } catch (err: any) {
      alert(`저장 실패: ${err.message}`);
    } finally {
      setIsSavingFamily(false);
    }
  };

  // 이미지 업로드: Storage에 {nextNum}.png 로 저장, 필요 시 폴더 자동 생성
  const uploadImage = async (familyId: number, file: File): Promise<number> => {
    const family = families.find((f) => f.id === familyId);
    if (!family) throw new Error("Family not found");

    let folderPath: string = family.family_photos ?? `family_${familyId}`;
    const isNewFolder = !family.family_photos;

    // 폴더 내 기존 파일 목록 조회 → 다음 번호 계산
    // 신규 폴더는 아직 존재하지 않으므로 list() 에러가 나도 1부터 시작
    const { data: existingFiles, error: listError } = await supabase.storage
      .from("pictures")
      .list(folderPath);

    if (listError && !isNewFolder) throw listError;

    const existingNums = (existingFiles ?? [])
      .map((f) => parseInt(f.name.replace(".png", "")))
      .filter((n) => !isNaN(n));
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;

    // Storage 업로드 (원본 포맷 유지, 파일명만 {nextNum}.png)
    const { error: uploadError } = await supabase.storage
      .from("pictures")
      .upload(`${folderPath}/${nextNum}.png`, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // 신규 폴더인 경우 DB family_photos 컬럼 업데이트
    if (isNewFolder) {
      const { error: dbError } = await supabase
        .from("family")
        .update({ family_photos: folderPath })
        .eq("id", familyId);

      if (dbError) throw dbError;

      setFamilies((prev) =>
        prev.map((f) =>
          f.id === familyId ? { ...f, family_photos: folderPath } : f
        )
      );
    }

    return nextNum;
  };

  // textarea 커서 위치에 태그 삽입
  const insertTagAtCursor = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setEditBackground((prev) => prev + tag);
      return;
    }
    // DOM에서 직접 커서 위치 읽기 (항상 최신 값)
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    // functional form으로 최신 editBackground 사용 → stale closure 방지
    setEditBackground((prev) => prev.substring(0, start) + tag + prev.substring(end));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
  };

  // 파일 처리 공통 함수 (버튼 클릭 / 드래그 앤 드롭 공유)
  const handleImageFile = async (familyId: number, file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    setIsUploading(true);
    try {
      const photoNum = await uploadImage(familyId, file);
      insertTagAtCursor(`[photo${photoNum}]`);
    } catch (err: any) {
      alert(`이미지 업로드 실패: ${err.message}`);
    } finally {
      setIsUploading(false);
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
  const getPhotoUrls = (folder: string | null, maxPhotos = 20) => {
    if (!folder) return [];
    const baseUrl = `https://uihlvzejcglditmlqzuq.supabase.co/storage/v1/object/public/pictures/${folder}/`;
    const urls: string[] = [];
    for (let i = 1; i <= maxPhotos; i++) {
      urls.push(`${baseUrl}${i}.png`);
    }
    return urls;
  };

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

      {/* 상단 액션 버튼 */}
      <div className="family-actions">
        <button className="family-action-btn" onClick={() => navigate("/clients")}>
          ◀ Go to list
        </button>
        <div className="family-actions-right">
          <button
            className="family-action-btn"
            onClick={() => {
              if (isUpdateMode) setIsUpdateMode(false);
              else startFamilyUpdate();
            }}
          >
            {isUpdateMode ? "Cancel" : "Update"}
          </button>
          {isUpdateMode && (
            <button
              className="family-action-btn family-save-action-btn"
              onClick={saveFamilyMembers}
              disabled={isSavingFamily}
            >
              {isSavingFamily ? "Saving..." : "Save"}
            </button>
          )}
        </div>
      </div>

      {families.length === 0 ? (
        <p style={{ textAlign: "center" }}>가족 정보가 없습니다.</p>
      ) : (
        families.map((f) => (
          <div key={f.id} className="family-card">
            <div className="family-row">
              <span className="label">Father</span>
              {isUpdateMode ? (
                <div className="update-field">
                  <span className="update-hint">
                    현재: {f.father_name !== "❌" ? `${f.father_name} (ID: ${f.fathers_id})` : "없음"}
                  </span>
                  <input
                    type="number"
                    className="family-update-input"
                    value={editIds[f.id]?.fathers_id ?? ""}
                    onChange={(e) => handleEditIdChange(f.id, "fathers_id", e.target.value)}
                    placeholder="Client ID"
                  />
                </div>
              ) : f.fathers_id ? (
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
              {isUpdateMode ? (
                <div className="update-field">
                  <span className="update-hint">
                    현재: {f.mother_name !== "❌" ? `${f.mother_name} (ID: ${f.mothers_id})` : "없음"}
                  </span>
                  <input
                    type="number"
                    className="family-update-input"
                    value={editIds[f.id]?.mothers_id ?? ""}
                    onChange={(e) => handleEditIdChange(f.id, "mothers_id", e.target.value)}
                    placeholder="Client ID"
                  />
                </div>
              ) : f.mothers_id ? (
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
              {isUpdateMode ? (
                <div className="update-field">
                  <span className="update-hint">
                    현재: {f.sons.length > 0
                      ? f.sons.map((s: any) => `${s.name} (ID: ${s.id})`).join(", ")
                      : "없음"}
                  </span>
                  <input
                    type="text"
                    className="family-update-input"
                    value={editIds[f.id]?.sons_ids ?? ""}
                    onChange={(e) => handleEditIdChange(f.id, "sons_ids", e.target.value)}
                    placeholder="Client IDs (쉼표로 구분, 예: 3, 7)"
                  />
                </div>
              ) : (
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
              )}
            </div>

            <div className="family-row">
              <span className="label">Daughters</span>
              {isUpdateMode ? (
                <div className="update-field">
                  <span className="update-hint">
                    현재: {f.daughters.length > 0
                      ? f.daughters.map((d: any) => `${d.name} (ID: ${d.id})`).join(", ")
                      : "없음"}
                  </span>
                  <input
                    type="text"
                    className="family-update-input"
                    value={editIds[f.id]?.daughters_ids ?? ""}
                    onChange={(e) => handleEditIdChange(f.id, "daughters_ids", e.target.value)}
                    placeholder="Client IDs (쉼표로 구분, 예: 5, 9)"
                  />
                </div>
              ) : (
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
              )}
            </div>

            <div className="family-row">
              <span className="label">Grandfather</span>
              {isUpdateMode ? (
                <div className="update-field">
                  <span className="update-hint">
                    현재: {f.grandfather_name !== "❌" ? `${f.grandfather_name} (ID: ${f.gr_fathers_id})` : "없음"}
                  </span>
                  <input
                    type="number"
                    className="family-update-input"
                    value={editIds[f.id]?.gr_fathers_id ?? ""}
                    onChange={(e) => handleEditIdChange(f.id, "gr_fathers_id", e.target.value)}
                    placeholder="Client ID"
                  />
                </div>
              ) : f.gr_fathers_id ? (
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
              {isUpdateMode ? (
                <div className="update-field">
                  <span className="update-hint">
                    현재: {f.grandmother_name !== "❌" ? `${f.grandmother_name} (ID: ${f.gr_mothers_id})` : "없음"}
                  </span>
                  <input
                    type="number"
                    className="family-update-input"
                    value={editIds[f.id]?.gr_mothers_id ?? ""}
                    onChange={(e) => handleEditIdChange(f.id, "gr_mothers_id", e.target.value)}
                    placeholder="Client ID"
                  />
                </div>
              ) : f.gr_mothers_id ? (
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
                    {/* 숨김 파일 input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageFile(f.id, file);
                        e.target.value = "";
                      }}
                    />

                    {/* 드래그 앤 드롭 + textarea 영역 */}
                    <div
                      className={`drag-drop-wrapper${isDragOver ? " drag-over" : ""}`}
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        const file = e.dataTransfer.files[0];
                        if (file) handleImageFile(f.id, file);
                      }}
                    >
                      <textarea
                        ref={textareaRef}
                        className="edit-textarea"
                        value={editBackground}
                        onChange={(e) => setEditBackground(e.target.value)}
                        rows={15}
                        placeholder="내용을 입력하세요. 이미지는 아래 버튼으로 추가하거나 여기에 드래그 앤 드롭하세요."
                      />
                      {isDragOver && (
                        <div className="drag-overlay">
                          이미지를 여기에 놓으세요
                        </div>
                      )}
                    </div>

                    <div className="edit-buttons">
                      {/* 이미지 추가 버튼 */}
                      <button
                        className="mini-btn image-upload-btn"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        title="이미지 파일을 선택하면 자동으로 업로드되고 [photo태그]가 삽입됩니다"
                      >
                        {isUploading ? "업로드 중..." : "이미지 추가"}
                      </button>

                      <button
                        className="mini-btn save-btn"
                        onClick={() => saveEditing(f.id)}
                        disabled={isSaving || isUploading}
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </button>
                      <button
                        className="mini-btn cancel-btn"
                        onClick={cancelEditing}
                        disabled={isSaving || isUploading}
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="help-text">
                      * 이미지 추가 버튼 또는 드래그 앤 드롭으로 이미지를 올리면 커서 위치에 <code>[photo숫자]</code> 태그가 자동 삽입됩니다.
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

            {/* 📸 Photos - 모든 사진을 갤러리로 표시 */}
            <div className="family-row">
              <span className="label">Photos</span>
              <div className="photo-grid">
                {getPhotoUrls(f.family_photos, 20).map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`family-${idx + 1}`}
                    className="photo-item"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}