import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth-session";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const session = verifyAdminSessionToken(sessionToken);

  if (!session.valid) {
    redirect("/login");
  }

  return (
    <main className="admin-page">
      <header className="topbar">
        <div className="topbar__brand">
          <div className="brand-logo-shell">
            <Image
              src="/camara-comercio-logo.png"
              alt="Logo de la Camara de Comercio"
              width={52}
              height={52}
              className="brand-logo"
              priority
            />
          </div>
          <div>
            <p className="brand-title">Camara de Comercio de Guacimo</p>
            <p className="brand-subtitle">Panel administrativo</p>
          </div>
        </div>

        <div className="topbar__actions" aria-label="Navegacion del administrador">
          <Link href="/admin" className="topbar__nav-link">
            Panel
          </Link>
          <Link href="/admin/categorias" className="topbar__nav-link">
            Categorias
          </Link>
          <Link href="/admin/comercios" className="topbar__nav-link">
            Comercios
          </Link>
          <Link href="/api/auth/logout" className="topbar__logout">
            Cerrar sesion
          </Link>
        </div>
      </header>

      <section className="admin-content">{children}</section>
    </main>
  );
}
