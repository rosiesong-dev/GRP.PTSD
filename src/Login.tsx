import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [identify, setIdentify] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("로그인 시도:", { identify, password });

      const { data, error } = await supabase
        .from("login")
        .select("*")
        .eq("identify", identify)
        .eq("password", password)
        .single();

      console.log("Supabase 응답 - data:", data);
      console.log("Supabase 응답 - error:", error);

      if (error) {
        console.error("Supabase 에러 상세:", error);
        throw new Error(error.message || "Invalid ID or password");
      }

      if (!data) {
        throw new Error("Invalid ID or password");
      }

      console.log("Login successful:", data);
      
      // 로그인 상태 저장
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("role", data.role ?? "admin");
      
      // alert("Login successful!");
      console.log("Navigating to /clients");
      navigate("/clients", { replace: true });
    } catch (err: any) {
      console.error("Login failed:", err);
      alert(`Login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Sign in to continue</p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="identify">ID</label>
            <input
              id="identify"
              type="text"
              value={identify}
              onChange={(e) => setIdentify(e.target.value)}
              placeholder="Enter your ID"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}