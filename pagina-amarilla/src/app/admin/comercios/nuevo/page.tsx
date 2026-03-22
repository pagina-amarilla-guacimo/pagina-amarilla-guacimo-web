"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import Swal from "sweetalert2";

interface Category {
  id: number;
  name: string;
}

export default function NewComercioPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phoneNumber: "",
    district: "Guácimo",
    location: "",
    image: "",
    categoryId: "",
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("No se pudieron cargar las categorías");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        setMessage({ type: "error", text: "Error al cargar las categorías" });
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          phoneNumber: formData.phoneNumber,
          district: formData.district,
          location: formData.location,
          image: formData.image || undefined,
          categoryId: Number(formData.categoryId),
        }),
      });

      if (!response.ok) throw new Error("Error al crear");

      await response.json();

      await Swal.fire({
        title: "¡Éxito!",
        text: "Comercio creado correctamente",
        icon: "success",
        confirmButtonText: "Continuar",
        confirmButtonColor: "#1e2433",
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      router.push("/admin/comercios");
    } catch (error) {
      console.error("Error:", error);
      setMessage({ type: "error", text: "Error al crear el comercio" });
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="admin-shell admin-detail" aria-labelledby="new-comercio-title">
        <p>Cargando formulario...</p>
      </section>
    );
  }

  return (
    <section className="admin-shell admin-detail" aria-labelledby="new-comercio-title">
      <header className="admin-header">
        <p className="admin-chip">Nuevo comercio</p>
        <h1 id="new-comercio-title">Crear comercio</h1>
        <p>Agrega un nuevo comercio al directorio con toda la información requerida.</p>
      </header>

      {message && (
        <div className={`admin-message admin-message--${message.type}`}>
          {message.text}
        </div>
      )}

      <form className="admin-form" onSubmit={handleSubmit}>
        <label htmlFor="store-name">Nombre del comercio</label>
        <input
          id="store-name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Ej: Restaurante El Típico"
        />

        <label htmlFor="store-description">Descripción</label>
        <textarea
          id="store-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          placeholder="Describe brevemente qué ofrece este comercio"
          style={{ minHeight: "100px", padding: "0.82rem 0.95rem", border: "1px solid rgba(16, 18, 22, 0.14)", borderRadius: "0.8rem" }}
        />

        <label htmlFor="store-phone">Teléfono</label>
        <input
          id="store-phone"
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          required
          placeholder="Ej: +506 2234-5678"
        />

        <label htmlFor="store-district">Distrito</label>
        <select
          id="store-district"
          value={formData.district}
          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
          required
          style={{ padding: "0.82rem 0.95rem", border: "1px solid rgba(16, 18, 22, 0.14)", borderRadius: "0.8rem" }}
        >
          <option value="Guácimo">Guácimo</option>
          <option value="Pocora">Pocora</option>
          <option value="Río Jiménez">Río Jiménez</option>
        </select>

        <label htmlFor="store-location">Ubicación</label>
        <input
          id="store-location"
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          required
          placeholder="Ej: San Isidro, Garita"
        />

        <label htmlFor="store-image">URL de imagen (opcional)</label>
        <input
          id="store-image"
          type="url"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://ejemplo.com/imagen.jpg"
        />

        <label htmlFor="store-category">Categoría</label>
        <select
          id="store-category"
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          required
          style={{ padding: "0.82rem 0.95rem", border: "1px solid rgba(16, 18, 22, 0.14)", borderRadius: "0.8rem" }}
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <button type="submit" disabled={isSaving}>
          {isSaving ? "Creando..." : "Crear comercio"}
        </button>
      </form>

      <Link href="/admin/comercios" className="admin-back-link">
        Volver
      </Link>
    </section>
  );
}
