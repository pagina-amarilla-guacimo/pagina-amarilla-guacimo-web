"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface Category {
  id: number;
  name: string;
  isActive: boolean;
  _count?: {
    stores: number;
  };
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Error al cargar categorías");
        const data = await response.json();
        
        const categoriesWithCount = await Promise.all(
          data.map(async (cat: Category) => {
            const catRes = await fetch(`/api/categories/${cat.id}`);
            if (catRes.ok) {
              const catData = await catRes.json();
              return { ...cat, _count: catData._count };
            }
            return { ...cat, _count: { stores: 0 } };
          })
        );
        
        setCategories(categoriesWithCount);
      } catch (error) {
        console.error("Error:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudieron cargar las categorías",
          icon: "error",
          confirmButtonColor: "#1e2433",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleEdit = (categoryId: number) => {
    router.push(`/admin/categorias/${categoryId}`);
  };

  const handleDelete = async (category: Category) => {
    const result = await Swal.fire({
      title: "¿Eliminar categoría?",
      text: `¿Estás seguro de que deseas eliminar "${category.name}"? Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/categories/${category.id}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (!response.ok) {
          Swal.fire({
            title: "No se puede eliminar",
            text: data.error || "Error al eliminar la categoría",
            icon: "warning",
            confirmButtonColor: "#1e2433",
          });
          return;
        }

        setCategories(categories.filter((c) => c.id !== category.id));

        Swal.fire({
          title: "¡Éxito!",
          text: "Categoría eliminada correctamente",
          icon: "success",
          confirmButtonColor: "#1e2433",
        });
      } catch (error) {
        console.error("Error:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar la categoría",
          icon: "error",
          confirmButtonColor: "#1e2433",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <section className="admin-shell" aria-labelledby="admin-categories-title">
        <p>Cargando categorías...</p>
      </section>
    );
  }

  return (
    <section className="admin-shell" aria-labelledby="admin-categories-title">
      <header className="admin-header admin-header--row">
        <div>
          <p className="admin-chip">Gestion de categorias</p>
          <h1 id="admin-categories-title">Categorias</h1>
          <p>Listado de categorias con opciones para editar o eliminar.</p>
        </div>
        <Link href="/admin/categorias/nueva" className="admin-primary-action" style={{ textDecoration: "none", color: "white", display: "inline-block" }}>
          Nueva categoria
        </Link>
      </header>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Comercios vinculados</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="admin-table__empty">
                  No hay categorias registradas.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.name}</td>
                  <td>{category._count?.stores ?? 0}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-row-btn admin-row-btn--edit"
                        onClick={() => handleEdit(category.id)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="admin-row-btn admin-row-btn--delete"
                        onClick={() => handleDelete(category)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Link href="/admin" className="admin-back-link">
        Volver al panel
      </Link>
    </section>
  );
}
