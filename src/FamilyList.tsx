import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import "./FamilyList.css";

type Family = {
  id: number;
  fathers_id: number | null;
  mothers_id: number | null;
  sons_ids: number[] | null;
  daughters_ids: number[] | null;
  family_background: string | null;
};

export default function FamilyList() {
  const [families, setFamilies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    const { data: familiesData } = await supabase.from("family").select("*");
    const { data: clientsData } = await supabase
      .from("clients")
      .select("id, name");

    const mapped = familiesData!.map((f) => {
      const findName = (id: number | null) =>
        clientsData?.find((c) => c.id === id)?.name ?? "❌";

      return {
        ...f,
        father_name: findName(f.fathers_id),
        mother_name: findName(f.mothers_id),
        sons: f.sons_ids?.map((id) => ({
          id,
          name: findName(id),
        })) ?? [],
        daughters: f.daughters_ids?.map((id) => ({
          id,
          name: findName(id),
        })) ?? [],
        grandfather_name: findName(f.gr_fathers_id),
        grandmother_name: findName(f.gr_mothers_id),
        
      };
    });

    setFamilies(mapped);
    setLoading(false);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="family-container">
      <h1>Family List</h1>

      {families.map((f) => (
        <div key={f.id} className="family-card">
          {/* family_id는 필요 없어 보임 */}
          {/* <div className="family-row">
            <span className="label">Family ID</span>
            <span>{f.id}</span>
          </div> */}

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
              "No info"
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
              "No info"
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
                {f.mother_name}
              </button>
            ) : (
              "No info"
            )}
          </div>

          <div className="family-row">
            <span className="label">Grandmother</span>
            {f.gr_mothers_id ? (
              <button
                className="mini-btn"
                onClick={() => navigate(`/clients/${f.gr_mothers_id}`)}
              >
                {f.mother_name}
              </button>
            ) : (
              "No info"
            )}
          </div>
          <div className="family-row">
            <span className="label">Background</span>
            <span className="bg-text">
              {f.family_background ?? "❌"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}