"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import Swal from "sweetalert2";

interface Category {
  id: number;
  name: string;
}

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = Number(params.id);

  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const response = await fetch(`/api/categories/${categoryId}`);
        if (!response.ok) throw new Error("No se pudo cargar la categoría");
        const data = await response.json();
        setCategory(data);
        setName(data.name);
      } catch (error) {
        setMessage({ type: "error", text: "Error al cargar la categoría" });
      } finally {
        setIsLoading(false);
      }
    };

    loadCategory();
  }, [categoryId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: "error", text: data.error || "Error al actualizar la categoría" });
        setIsSaving(false);
        return;
      }

      setCategory(data);

      await Swal.fire({
        title: "¡Éxito!",
        text: "Categoría actualizada correctamente",
        icon: "success",
        confirmButtonText: "Continuar",
        confirmButtonColor: "#1e2433",
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      router.push("/admin/categorias");
    } catch (error) {
      console.error("Error:", error);
      setMessage({ type: "error", text: "Error al actualizar la categoría" });
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="admin-shell admin-detail" aria-labelledby="edit-category-title">
        <p>Cargando categoría...</p>
      </section>
    );
  }

  return (
    <section className="admin-shell admin-detail" aria-labelledby="edit-category-title">
      <header className="admin-header">
        <p className="admin-chip">Editar categoría</p>
        <h1 id="edit-category-title">Actualizar información</h1>
        <p>Modifica el nombre de la categoría.</p>
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
        />

        <button type="submit" disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>

      <Link href="/admin/categorias" className="admin-back-link">
        Volver
      </Link>
    </section>
  );
}
