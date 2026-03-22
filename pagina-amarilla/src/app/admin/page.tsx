import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [totalCategories, totalStores, admin] = await Promise.all([
    prisma.category.count(),
    prisma.store.count(),
    prisma.admin.findFirst({
      select: {
        name: true,
        email: true,
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <section className="admin-shell" aria-labelledby="admin-panel-title">
      <header className="admin-header">
        <p className="admin-chip">Panel de administrador</p>
        <h1 id="admin-panel-title">Gestion general</h1>
        <p>Administra toda la informacion del directorio empresarial desde un solo lugar.</p>
      </header>

      <div className="admin-metrics">
        <article>
          <h2>{totalCategories}</h2>
          <p>Categorias registradas</p>
        </article>
        <article>
          <h2>{totalStores}</h2>
          <p>Comercios registrados</p>
        </article>
        <article>
          <h2>{admin?.name ?? "Administrador"}</h2>
          <p>{admin?.email ?? "Sin correo"}</p>
        </article>
      </div>

      <div className="admin-grid">
        <article className="admin-card admin-card--profile">
          <h2>Mi informacion</h2>
          <p>Actualiza nombre, correo y credenciales de acceso del administrador.</p>
          <Link href="/admin/perfil">Editar perfil</Link>
        </article>

        <article className="admin-card admin-card--categories">
          <h2>Categorias</h2>
          <p>Consulta y administra las categorias disponibles del directorio.</p>
          <Link href="/admin/categorias">Gestionar categorias</Link>
        </article>

        <article className="admin-card admin-card--stores">
          <h2>Comercios</h2>
          <p>Administra los comercios registrados y su informacion de contacto.</p>
          <Link href="/admin/comercios">Gestionar comercios</Link>
        </article>
      </div>
    </section>
  );
}
