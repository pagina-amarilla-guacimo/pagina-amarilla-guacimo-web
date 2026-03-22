"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  isActive: boolean;
  category: {
    id: number;
    name: string;
  };
}

export default function AdminStoresPage() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStores = async () => {
      try {
        const response = await fetch("/api/stores");
        if (!response.ok) throw new Error("Error al cargar comercios");
        const data = await response.json();
        setStores(data);
      } catch (error) {
        console.error("Error:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudieron cargar los comercios",
          icon: "error",
          confirmButtonColor: "#1e2433",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStores();
  }, []);

  const handleEdit = (storeId: number) => {
    router.push(`/admin/comercios/${storeId}`);
  };

  const handleDelete = async (store: Store) => {
    const result = await Swal.fire({
      title: "¿Eliminar comercio?",
      text: `¿Estás seguro de que deseas eliminar "${store.name}"? Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/stores/${store.id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Error al eliminar");

        setStores(stores.filter((s) => s.id !== store.id));

        Swal.fire({
          title: "¡Éxito!",
          text: "Comercio eliminado correctamente",
          icon: "success",
          confirmButtonColor: "#1e2433",
        });
      } catch (error) {
        console.error("Error:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar el comercio",
          icon: "error",
          confirmButtonColor: "#1e2433",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <section className="admin-shell" aria-labelledby="admin-stores-title">
        <p>Cargando comercios...</p>
      </section>
    );
  }

  return (
    <section className="admin-shell" aria-labelledby="admin-stores-title">
      <header className="admin-header admin-header--row">
        <div>
          <p className="admin-chip">Gestion de comercios</p>
          <h1 id="admin-stores-title">Comercios</h1>
          <p>Listado de comercios con acciones de edicion y eliminacion por fila.</p>
        </div>
        <Link href="/admin/comercios/nuevo" className="admin-primary-action" style={{ textDecoration: "none", color: "white", display: "inline-block" }}>
          Nuevo comercio
        </Link>
      </header>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoria</th>
              <th>Telefono</th>
              <th>Distrito</th>
              <th>Ubicacion</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {stores.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin-table__empty">
                  No hay comercios registrados.
                </td>
              </tr>
            ) : (
              stores.map((store) => (
                <tr key={store.id}>
                  <td>{store.id}</td>
                  <td>{store.name}</td>
                  <td>{store.category?.name ?? "Sin categoria"}</td>
                  <td>{store.phoneNumber}</td>
                  <td>{store.district}</td>
                  <td>{store.location}</td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        className="admin-row-btn admin-row-btn--edit"
                        onClick={() => handleEdit(store.id)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="admin-row-btn admin-row-btn--delete"
                        onClick={() => handleDelete(store)}
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
