import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { useNavigate } from "react-router-dom";
import "./ClientList.css";

type Client = {
  id: number;
  name: string | null;
  birth_date: string | null;
  cnic_number: string | null;
  mobile: string | null;
};

const PAGE_SIZE = 10;
const PAGE_GROUP_SIZE = 10; // ⭐ 페이지 번호 10개씩

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

  // ⭐ 10개씩 페이지 번호 계산
  const getPageNumbers = () => {
    const pages: number[] = [];

    const start =
      Math.floor((page - 1) / PAGE_GROUP_SIZE) * PAGE_GROUP_SIZE + 1;
    const end = Math.min(start + PAGE_GROUP_SIZE - 1, totalPages);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="container">
      <h1>Clients List</h1>

      {/* 🔍 검색 */}
      <input
        type="text"
        placeholder="Search by name"
        value={search}
        onChange={(e) => {
          setPage(1);
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
          <p>Loading ...</p>
        ) : (
          <table width="100%" cellPadding={8}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Birth Date</th>
                <th>CNIC number</th>
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
                    <td style={{ textAlign: "center" }}>{c.id}</td>
                    <td style={{ textAlign: "center" }}>
                      {c.name ?? "No info"}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {c.birth_date ?? "No info"}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {c.cnic_number ?? "No info"}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {c.mobile ?? "No info"}
                    </td>
                    <td>
                      <button
                        className="primary"
                        onClick={() => navigate(`/clients/${c.id}`)}
                      >
                        View
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
          justifyContent: "center",
          gap: "6px",
          flexWrap: "wrap",
        }}
      >
        {/* 이전 페이지 */}
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          ◀
        </button>

        {/* 페이지 번호 (10개씩) */}
        {getPageNumbers().map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              backgroundColor: p === page ? "#007bff" : "white",
              color: p === page ? "white" : "black",
              fontWeight: p === page ? "bold" : "normal",
              cursor: "pointer",
            }}
          >
            {p}
          </button>
        ))}

        {/* 다음 페이지 */}
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          ▶
        </button>
      </div>
    </div>
  );
}