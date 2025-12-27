import React, { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login({ setIsAuthenticated, setRole }) {
  const navigate = useNavigate();

  // Estados
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Handler de login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/token/email/", {
        email,
        password,
      });

      // Guardar tokens
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      // Configurar axios
      api.defaults.headers.common["Authorization"] =
        "Bearer " + response.data.access;

      // Guardar rol si el backend lo devuelve
      const userRole = response.data.role; // asegúrate que tu backend devuelva "role"
      localStorage.setItem("role", userRole);
      setRole(userRole);

      // Guardar username y email
      localStorage.setItem("username", response.data.username);
      localStorage.setItem("email", response.data.email);

      // Marcar usuario logueado
      setIsAuthenticated(true);

      // Redirigir según rol
      navigate("/");
    } catch (err) {
      setError("Correo o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-r from-orange-500 to-yellow-400 p-6">

      {/* LADO IZQUIERDO — Branding */}
      <div className="hidden md:flex flex-col justify-center w-1/2 text-white px-16 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-black/5 backdrop-blur-sm"></div>
        <div className="relative z-10 max-w-xl">
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight drop-shadow-lg">
            Tasks RVJ 7
          </h1>
          <p className="text-xl mb-10 opacity-90 leading-relaxed">
            Sistema avanzado de gestión de tareas y proyectos.
          </p>
          <div className="space-y-5 text-lg">
            <div className="flex gap-4 items-start">
              <span className="text-2xl opacity-90">✨</span>
              <p className="opacity-90">
                Organiza tareas, asigna responsables y cumple objetivos.
              </p>
            </div>
            <div className="flex gap-4 items-start">
              <span className="text-2xl opacity-90">📊</span>
              <p className="opacity-90">
                Múltiples vistas: Dashboard, Lista, Kanban y Calendario.
              </p>
            </div>
            <div className="flex gap-4 items-start">
              <span className="text-2xl opacity-90">🤝</span>
              <p className="opacity-90">
                Colaboración en tiempo real con comentarios y notificaciones.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* LADO DERECHO — FORM */}
      <div className="flex items-center justify-center w-full md:w-1/2">
        <form
          onSubmit={handleLogin}
          className="bg-white w-full max-w-md rounded-3xl shadow-xl p-10"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Bienvenido
          </h2>

          {error && (
            <div className="bg-red-100 text-red-700 border border-red-300 p-3 rounded mb-4 text-center">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-600 mb-1">
              Correo electrónico
            </label>
            <div className="flex items-center bg-gray-100 rounded-lg p-3">
              <Mail className="text-gray-500 w-5 h-5 mr-2" />
              <input
                type="email"
                placeholder="tu@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-transparent outline-none w-full"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="mb-4">
            <label className="block text-gray-600 mb-1">Contraseña</label>
            <div className="flex items-center bg-gray-100 rounded-lg p-3">
              <Lock className="text-gray-500 w-5 h-5 mr-2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-transparent outline-none w-full"
              />
            </div>
          </div>

          {/* Recuperación */}
          <div className="text-right mb-4">
            <button
              type="button"
              className="text-orange-600 hover:underline text-sm"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Botón */}
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 transition text-white p-3 rounded-lg font-semibold shadow-md"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}
