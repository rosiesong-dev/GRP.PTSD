import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { useNavigate } from "react-router-dom";

type Client = {
  id: number;
  name: string | null;
  birth_date: string | null;
  cnic_number: string | null;
  mobile: string | null;
};

const PAGE_SIZE = 50;

export default function ClientList() {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [page, search]);

  const fetchClients = async () => {
    setLoading(true);

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("clients")
      .select(
        "id, name, birth_date, cnic_number, mobile",
        { count: "exact" }
      )
      .range(from, to)
      .order("id", { ascending: true });

    // 🔍 이름 포함 검색 (대소문자 무시)
    if (search.trim() !== "") {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error(error);
      alert("데이터 불러오기 실패");
    } else {
      setClients(data || []);
      setTotalCount(count || 0);
    }

    setLoading(false);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="container">
      <h1>Clients List</h1>

      {/* 🔍 검색 */}
      <input
        type="text"
        placeholder="이름 검색"
        value={search}
        onChange={(e) => {
          setPage(1); // 검색 시 페이지 초기화
          setSearch(e.target.value);
        }}
        style={{
          padding: "10px",
          width: "300px",
          marginBottom: "20px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      {/* 📋 테이블 */}
      <div className="card">
        {loading ? (
          <p>로딩 중...</p>
        ) : (
          <table width="100%" cellPadding={8}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Birth Date</th>
                <th>CNIC</th>
                <th>Mobile</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center" }}>
                    데이터 없음
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.name ?? "정보 없음"}</td>
                    <td>{c.birth_date ?? "정보 없음"}</td>
                    <td>{c.cnic_number ?? "정보 없음"}</td>
                    <td>{c.mobile ?? "정보 없음"}</td>
                    <td>
                      <button
                        className="primary"
                        onClick={() => navigate(`/clients/${c.id}`)}
                      >
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ⏩ 페이지네이션 */}
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          ◀ 이전
        </button>

        <span>
          {page} / {totalPages || 1}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          다음 ▶
        </button>
      </div>
    </div>
  );
}