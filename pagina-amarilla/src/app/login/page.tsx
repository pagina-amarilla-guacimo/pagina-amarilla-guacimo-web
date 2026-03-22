"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "No se pudo iniciar sesion");
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error inesperado";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <p className="login-chip">Acceso administrativo</p>
        <h1 id="login-title">Iniciar sesion</h1>
        <p className="login-copy">
          Solo el administrador autorizado puede acceder.
        </p>

        <form className="login-form" onSubmit={handleLogin}>
          {errorMessage ? (
            <p className="login-message login-message--error">{errorMessage}</p>
          ) : null}

          <label htmlFor="admin-email">Correo administrativo</label>
          <input
            id="admin-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@camaraguacimo.cr"
            autoComplete="username"
            required
          />

          <label htmlFor="admin-password">Contraseña</label>
          <input
            id="admin-password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Ingresa tu contrasena"
            autoComplete="current-password"
            required
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Validando..." : "Entrar al panel"}
          </button>
        </form>

        <Link href="/recuperar-contrasena" className="login-inline-link">
          Olvidaste tu contraseña?
        </Link>

        <p className="login-note"></p>

        <Link href="/" className="login-back-link">
          Volver
        </Link>
      </section>
    </main>
  );
}
