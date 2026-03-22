"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Swal from "sweetalert2";

export default function NewCategoryPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [name, setName] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: "error", text: data.error || "Error al crear la categoría" });
        setIsSaving(false);
        return;
      }

      await Swal.fire({
        title: "¡Éxito!",
        text: "Categoría creada correctamente",
        icon: "success",
        confirmButtonText: "Continuar",
        confirmButtonColor: "#1e2433",
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      router.push("/admin/categorias");
    } catch (error) {
      console.error("Error:", error);
      setMessage({ type: "error", text: "Error al crear la categoría" });
      setIsSaving(false);
    }
  };

  return (
    <section className="admin-shell admin-detail" aria-labelledby="new-category-title">
      <header className="admin-header">
        <p className="admin-chip">Nueva categoría</p>
        <h1 id="new-category-title">Crear categoría</h1>
        <p>Agrega una nueva categoría para clasificar los comercios del directorio.</p>
      </header>

      {message && (
        <div className={`admin-message admin-message--${message.type}`}>
          {message.text}
        </div>
      )}

      <form className="admin-form" onSubmit={handleSubmit}>
        <label htmlFor="category-name">Nombre de la categoría</label>
        <input
          id="category-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Ej: Restaurantes, Tiendas, Servicios"
          autoFocus
        />

        <button type="submit" disabled={isSaving}>
          {isSaving ? "Creando..." : "Crear categoría"}
        </button>
      </form>

      <Link href="/admin/categorias" className="admin-back-link">
        Volver
      </Link>
    </section>
  );
}
