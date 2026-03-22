"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import Swal from "sweetalert2";

interface Store {
  id: number;
  name: string;
  description: string;
  phoneNumber: string;
  district: string;
  location: string;
  image?: string;
  categoryId: number;
}

interface Category {
  id: number;
  name: string;
}

export default function EditComercioPage() {
  const router = useRouter();
  const params = useParams();
  const storeId = Number(params.id);

  const [store, setStore] = useState<Store | null>(null);
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
    const loadData = async () => {
      try {
        const [storeRes, categoriesRes] = await Promise.all([
          fetch(`/api/stores/${storeId}`),
          fetch("/api/categories"),
        ]);

        if (!storeRes.ok) throw new Error("No se pudo cargar el comercio");
        if (!categoriesRes.ok) throw new Error("No se pudieron cargar las categorías");

        const storeData = await storeRes.json();
        const categoriesData = await categoriesRes.json();

        setStore(storeData);
        setCategories(categoriesData);
        setFormData({
          name: storeData.name || "",
          description: storeData.description || "",
          phoneNumber: storeData.phoneNumber || "",
          district: storeData.district || "Guácimo",
          location: storeData.location || "",
          image: storeData.image || "",
          categoryId: String(storeData.categoryId || ""),
        });
      } catch (error) {
        setMessage({ type: "error", text: "Error al cargar los datos" });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [storeId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: "PUT",
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

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData?.error || "Error al actualizar");
      }

      const updatedStore = responseData;
      setStore(updatedStore);

      await Swal.fire({
        title: "¡Éxito!",
        text: "Comercio actualizado correctamente",
        icon: "success",
        confirmButtonText: "Continuar",
        confirmButtonColor: "#1e2433",
        allowOutsideClick: false,
        allowEscapeKey: false,
      });

      router.push("/admin/comercios");
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Error al actualizar el comercio";
      setMessage({ type: "error", text: errorMessage });
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <section className="admin-shell admin-detail" aria-labelledby="edit-comercio-title">
        <p>Cargando comercio...</p>
      </section>
    );
  }

  return (
    <section className="admin-shell admin-detail" aria-labelledby="edit-comercio-title">
      <header className="admin-header">
        <p className="admin-chip">Editar comercio</p>
        <h1 id="edit-comercio-title">Actualizar información</h1>
        <p>Modifica los detalles del comercio registrado en el directorio.</p>
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
        />

        <label htmlFor="store-description">Descripción</label>
        <textarea
          id="store-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          style={{ minHeight: "100px", padding: "0.82rem 0.95rem", border: "1px solid rgba(16, 18, 22, 0.14)", borderRadius: "0.8rem" }}
        />

        <label htmlFor="store-phone">Teléfono</label>
        <input
          id="store-phone"
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          required
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
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>

      <Link href="/admin/comercios" className="admin-back-link">
        Volver
      </Link>
    </section>
  );
}
