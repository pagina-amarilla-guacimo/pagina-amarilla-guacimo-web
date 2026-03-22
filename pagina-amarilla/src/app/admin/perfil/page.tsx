"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import Swal from "sweetalert2";
import { updateAdminProfile } from "./actions";

interface AdminData {
  id: number;
  name: string;
  email: string;
}

export default function AdminProfilePage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const response = await fetch("/api/admin/profile");
        if (!response.ok) throw new Error("No se pudo cargar el perfil");
        const data = await response.json();
        setAdmin(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          password: "",
        });
      } catch (error) {
        setMessage({ type: "error", text: "No se pudo cargar el perfil" });
      } finally {
        setIsLoading(false);
      }
    };

    loadAdmin();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const newFormData = new FormData();
      newFormData.append("name", formData.name);
      newFormData.append("email", formData.email);
      newFormData.append("password", formData.password);

      const result = await updateAdminProfile(newFormData);

      if (result.success) {
        setMessage(null);
        if (result.admin) {
          setAdmin(result.admin);
          setFormData({
            name: result.admin.name,
            email: result.admin.email,
            password: "",
          });
        }

        await Swal.fire({
          title: "¡Éxito!",
          text: result.message,
          icon: "success",
          confirmButtonText: "Continuar",
          confirmButtonColor: "#1e2433",
          allowOutsideClick: false,
          allowEscapeKey: false,
        });

        router.push("/admin");
      } else {
        setMessage({ type: "error", text: result.error ?? "Error desconocido"});
        setIsSaving(false);
      }
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      setMessage({ type: "error", text: "Error al guardar cambios" });
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="admin-shell admin-detail" aria-labelledby="admin-profile-title">
        <p>Cargando perfil...</p>
      </section>
    );
  }

  return (
    <section className="admin-shell admin-detail" aria-labelledby="admin-profile-title">
      <header className="admin-header">
        <p className="admin-chip">Cuenta de administrador</p>
        <h1 id="admin-profile-title">Mi informacion</h1>
        <p>Edita tus datos de acceso para mantener segura la administracion del directorio.</p>
      </header>

      {message && (
        <div className={`admin-message admin-message--${message.type}`}>
          {message.text}
        </div>
      )}

      <form className="admin-form" onSubmit={handleSubmit}>
        <label htmlFor="admin-name">Nombre</label>
        <input
          id="admin-name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <label htmlFor="admin-email">Correo</label>
        <input
          id="admin-email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <label htmlFor="admin-password">Nueva contrasena (opcional)</label>
        <input
          id="admin-password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Deja en blanco para no cambiar"
        />

        <button type="submit" disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>

      <Link href="/admin" className="admin-back-link">
        Volver
      </Link>
    </section>
  );
}
