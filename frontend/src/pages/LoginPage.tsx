/*import { useState } from "react";
import { authApi } from "../api/axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authApi.post('/auth/login', { email, password });
      localStorage.setItem("token", res.data.access_token);
      setMessage("✅ Login exitoso");
    } catch (err) {
      setMessage("❌ Credenciales inválidas");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 40 }}>
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit">Ingresar</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default LoginPage;*/

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {authApi} from "../api/axios"; 
import "../styles/login.css";

const LoginPage: React.FC = () => {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [message, setMessage] = useState("");
const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
try {
const res = await authApi.post("/auth/login", { email, password });
const { access_token, user } = res.data;

localStorage.setItem("token", access_token);
localStorage.setItem("role", user.role);

 switch (user.role) {
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "vendedor":
        navigate("/seller/inventory");
        break;
      case "comprador":
        navigate("/shop");
        break;
      case "repartidor":
        navigate("/delivery/orders");
        break;
      default:
        navigate("/login"); // fallback
    }

setMessage("✅ Login exitoso");
// Redirige después de login
navigate("/dashboard"); // O cualquier ruta que tengas
} catch (err: any) {
console.error("❌ Error:", err);
setMessage("❌ Credenciales inválidas");
}
};

return (
<div className="login-page">
<div className="login-card">
<h2 className="login-title">Bienvenido</h2>
<p className="login-subtitle">Ingresa tus credenciales</p>
    <form onSubmit={handleSubmit} className="login-form">
      <label className="field">
        <span>Correo electrónico</span>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
        />
      </label>

      <label className="field">
        <span>Contraseña</span>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          placeholder="••••••••"
        />
      </label>

      <div className="forgot">
        <a href="#">¿Olvidaste tu contraseña?</a>
      </div>

      <button type="submit" className="button button-primary">
        Continuar
      </button>

      {message && <p style={{ marginTop: "1rem", color: "#f44336" }}>{message}</p>}
    </form>

    <p className="signup">
      ¿No tienes una cuenta? <a href="/register">Regístrate</a>
    </p>
  </div>
</div>
);
};
export default LoginPage;