import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import "./FamilyList.css";

type Client = {
  id: number;
  name: string | null;
};

type Family = {
  id: number;
  fathers_id: number | null;
  mothers_id: number | null;
  sons_ids: string | null;
  daughters_ids: string | null;
  gr_fathers_id: number | null;
  gr_mothers_id: number | null;
  family_photos: string[] | null;
  family_background: string | null;
};

export default function FamilyList() {
  const [families, setFamilies] = useState<(Family & {
    father_name: string;
    mother_name: string;
    father_id: number | null;
    mother_id: number | null;
    sons: { id: number; name: string }[];
    daughters: { id: number; name: string }[];
  })[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    setLoading(true);

    const { data: familiesData, error: famError } = await supabase
      .from("family")
      .select("*");
    if (famError) {
      console.error(famError);
      setLoading(false);
      return;
    }

    const { data: clientsData, error: clientError } = await supabase
      .from("clients")
      .select("*");
    if (clientError) {
      console.error(clientError);
      setLoading(false);
      return;
    }

    const mappedFamilies = familiesData!.map(f => {
      const father = clientsData!.find(c => c.id === f.fathers_id);
      const mother = clientsData!.find(c => c.id === f.mothers_id);
      const sons = f.sons_ids
        ? f.sons_ids.split(",").map(id => {
            const c = clientsData!.find(c => c.id === Number(id.trim()));
            return { id: Number(id), name: c?.name ?? "No info" };
          })
        : [];
      const daughters = f.daughters_ids
        ? f.daughters_ids.split(",").map(id => {
            const c = clientsData!.find(c => c.id === Number(id.trim()));
            return { id: Number(id), name: c?.name ?? "No info" };
          })
        : [];

      return {
        ...f,
        father_name: father?.name ?? "No info",
        mother_name: mother?.name ?? "No info",
        father_id: father?.id ?? null,
        mother_id: mother?.id ?? null,
        sons,
        daughters,
      };
    });

    setFamilies(mappedFamilies);
    setLoading(false);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="client-container">
      <h1>Family List</h1>
      {families.length === 0 ? (
        <p className="empty">No families found</p>
      ) : (
        <table className="client-table">
          <thead>
            <tr>
              <th>Family ID</th>
              <th>Father</th>
              <th>Mother</th>
              <th>Sons</th>
              <th>Daughters</th>
              <th>Background</th>
            </tr>
          </thead>
          <tbody>
            {families.map(f => (
              <tr key={f.id}>
                <td>{f.id}</td>
                <td>
                  {f.father_id ? (
                    <button className="primary-btn" onClick={() => navigate(`/clients/${f.father_id}`)}>
                      {f.father_name}
                    </button>
                  ) : "No info"}
                </td>
                <td>
                  {f.mother_id ? (
                    <button className="primary-btn" onClick={() => navigate(`/clients/${f.mother_id}`)}>
                      {f.mother_name}
                    </button>
                  ) : "No info"}
                </td>
                <td>
                  {f.sons.length > 0 ? (
                    f.sons.map(s => (
                      <button
                        key={s.id}
                        className="primary-btn"
                        onClick={() => navigate(`/clients/${s.id}`)}
                        style={{ marginRight: "5px" }}
                      >
                        {s.name}
                      </button>
                    ))
                  ) : "No info"}
                </td>
                <td>
                  {f.daughters.length > 0 ? (
                    f.daughters.map(d => (
                      <button
                        key={d.id}
                        className="primary-btn"
                        onClick={() => navigate(`/clients/${d.id}`)}
                        style={{ marginRight: "5px" }}
                      >
                        {d.name}
                      </button>
                    ))
                  ) : "No info"}
                </td>
                <td>{f.family_background ?? "No info"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}