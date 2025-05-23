import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";
import { authApi } from "../api/axios";

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "comprador", 
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authApi.post("/users/register", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });

      if (res.status === 201 || res.status === 200) {
        setMessage("✅ Usuario registrado correctamente");

        setTimeout(() => {
            navigate("/login");
        }, 1500);
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
              value={form.firstName}
              onChange={handleChange}
              required
            />
          </label>
          <label className="field">
            <span>Apellido</span>
            <input
              name="lastName"
              type="text"
              placeholder="Apellido"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </label>
          <label className="field">
            <span>Correo electrónico</span>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label className="field">
            <span>Contraseña</span>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span>Rol</span>
            <select name="role" value={form.role} onChange={handleChange} required>
              <option value="comprador">Comprador</option>
              <option value="vendedor">Vendedor</option>
            </select>
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
