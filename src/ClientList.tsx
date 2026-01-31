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
const PAGE_GROUP_SIZE = 10; // 페이지 번호 10개씩

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
      .select("id, name, birth_date, cnic_number, mobile", { count: "exact" })
      .range(from, to)
      .order("id", { ascending: true });

    if (search.trim() !== "") {
      // 이름 또는 CNIC 번호로 검색
      query = query.or(`name.ilike.%${search}%,cnic_number.ilike.%${search}%`);
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

  // 🔢 페이지 번호 10개씩 계산
  const getPageNumbers = () => {
    const pages: number[] = [];
    const start = Math.floor((page - 1) / PAGE_GROUP_SIZE) * PAGE_GROUP_SIZE + 1;
    const end = Math.min(start + PAGE_GROUP_SIZE - 1, totalPages);

    for (let i = start; i <= end; i++) pages.push(i);

    return pages;
  };

  // 이전/다음 10페이지 이동 (범위 제한)
  const goToPrevGroup = () => {
    const newPage = Math.max(1, page - PAGE_GROUP_SIZE);
    setPage(newPage);
  };

  const goToNextGroup = () => {
    const newPage = Math.min(totalPages, page + PAGE_GROUP_SIZE);
    setPage(newPage);
  };

  const handleAddClient = () => {
    navigate("/AddClient");
  };


  // delete 기능 필요하면 주석 제거
  // const handleDelete = async (id: number) => {
  //   if (!window.confirm("정말 삭제하시겠습니까?")) return;

  //   try {
  //     const { data, error } = await supabase.rpc("update_family_remove_client", { p_client_id: id });

  //     if (error) throw error;

  //     alert("삭제 완료!");
  //     fetchClients(); // 리스트 갱신
  //   } catch (err: any) {
  //     console.error("삭제 실패", err);
  //     alert(`삭제 실패: ${err.message}`);
  //   }
  // };

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      sessionStorage.removeItem("isLoggedIn");
      navigate("/login");
    }
  };

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Clients List</h1>
        <button 
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#E5E7EB",
            color: "black",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          🚪 Logout
        </button>
      </div>

      {/* 🔍 검색 + ➕ Add 버튼 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by Name / CNIC number"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          style={{ padding: "10px", width: "300px", borderRadius: "8px", border: "1px solid #ccc" }}
        />
        <button className="primary" onClick={handleAddClient} style={{ padding: "10px 16px" }}>
          + Add
        </button>
      </div>

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
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center" }}>
                    데이터 없음
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr key={c.id}>
                    <td style={{ textAlign: "center" }}>{c.id}</td>
                    <td style={{ textAlign: "center" }}>{c.name ?? "No info"}</td>
                    <td style={{ textAlign: "center" }}>{c.birth_date ?? "No info"}</td>
                    <td style={{ textAlign: "center" }}>{c.cnic_number ?? "No info"}</td>
                    <td style={{ textAlign: "center" }}>{c.mobile ?? "No info"}</td>
                    <td style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                      <button className="primary" onClick={() => navigate(`/clients/${c.id}`)}>
                        View
                      </button>
                      {/* 삭제 기능 필요하면 주석 제거 */}
                      {/* <button
                        className="primary"
                        style={{ backgroundColor: "gray", borderColor: "gray" }}
                        onClick={() => handleDelete(c.id)}
                      >
                        Delete
                      </button> */}
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
        {/* 맨 처음 페이지로 */}
        <button 
          disabled={page === 1 || totalPages === 0} 
          onClick={() => setPage(1)}
        >
          ≪
        </button>

        {/* 이전 10페이지 */}
        <button 
          disabled={page <= PAGE_GROUP_SIZE} 
          onClick={goToPrevGroup}
        >
          ◀
        </button>

        {/* 페이지 번호 */}
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
            }}
          >
            {p}
          </button>
        ))}

        {/* 다음 10페이지 */}
        <button 
          disabled={page > totalPages - PAGE_GROUP_SIZE} 
          onClick={goToNextGroup}
        >
          ▶
        </button>

        {/* 맨 마지막 페이지로 */}
        <button 
          disabled={page === totalPages || totalPages === 0} 
          onClick={() => setPage(totalPages)}
        >
          ≫
        </button>
      </div>
    </div>
  );
}