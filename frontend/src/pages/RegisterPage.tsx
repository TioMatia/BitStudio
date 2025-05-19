import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";
import { authApi } from "../api/axios"; 

const RegisterPage: React.FC = () => {
const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [message, setMessage] = useState("");
const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
try {
  const res = await authApi.post("/users/register", {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim(),
    password,
  });

  if (res.status === 201 || res.status === 200) {
    setMessage("✅ Usuario registrado correctamente");
    setTimeout(() => navigate("/login"), 1500);
  } else {
    setMessage("❌ No se pudo registrar");
  }
} catch (error: any) {
  console.error(error);
  setMessage("❌ Error de conexión o usuario ya existe");
}
};

return (
<div className="login-page">
<div className="login-card">
<h2 className="login-title">Crear Cuenta</h2>
<p className="login-subtitle">Regístrate en InfiniteLoop!</p>
<form onSubmit={handleSubmit} className="login-form">
<label className="field">
<span>Nombre</span>
<input
name="firstName"
type="text"
placeholder="Nombre"
value={firstName}
onChange={(e) => setFirstName(e.target.value)}
required
/>
</label>
      <label className="field">
        <span>Apellido</span>
        <input
          name="lastName"
          type="text"
          placeholder="Apellido"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </label>

      <label className="field">
        <span>Correo electrónico</span>
        <input
          name="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label className="field">
        <span>Contraseña</span>
        <input
          name="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>

      <div className="forgot">
        <Link to="/login">¿Ya tienes cuenta? Inicia sesión</Link>
      </div>

      <button type="submit" className="button button-primary">
        Registrarme
      </button>

      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </form>
  </div>
</div>
);
};

export default RegisterPage;