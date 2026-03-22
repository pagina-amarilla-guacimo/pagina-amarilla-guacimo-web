"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type MessageState = {
  type: "success" | "error";
  text: string;
} | null;

export default function RecoverPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(true);
  const [message, setMessage] = useState<MessageState>(null);

  useEffect(() => {
    const loadAdminEmail = async () => {
      try {
        setIsLoadingEmail(true);
        const response = await fetch("/api/admin/profile", { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error ?? "No se pudo obtener el correo del administrador");
        }

        setEmail(data.email ?? "");
      } catch (error) {
        const errorText = error instanceof Error ? error.message : "Error inesperado";
        setMessage({ type: "error", text: errorText });
      } finally {
        setIsLoadingEmail(false);
      }
    };

    loadAdminEmail();
  }, []);

  const handleSendCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSendingCode(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "No se pudo enviar el codigo");
      }

      if (!data.token) {
        throw new Error("No se pudo iniciar el proceso de recuperacion");
      }

      setToken(data.token);
      setEmail(data.email ?? email);
      setMessage({
        type: "success",
        text: data.message ?? "Codigo enviado. Revisa tu correo.",
      });
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Error inesperado";
      setMessage({ type: "error", text: errorText });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsResetting(true);
    setMessage(null);

    try {
      if (!token) {
        throw new Error("Primero solicita el codigo de recuperacion");
      }

      if (newPassword.length < 8) {
        throw new Error("La nueva contrasena debe tener al menos 8 caracteres");
      }

      if (newPassword !== confirmPassword) {
        throw new Error("Las contrasenas no coinciden");
      }

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
          token,
          newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "No se pudo actualizar la contrasena");
      }

      setMessage({
        type: "success",
        text: "Contrasena actualizada. Ahora puedes iniciar sesion.",
      });

      setCode("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error) {
      const errorText = error instanceof Error ? error.message : "Error inesperado";
      setMessage({ type: "error", text: errorText });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="recover-title">
        <p className="login-chip">Seguridad de cuenta</p>
        <h1 id="recover-title">Recuperar contrasena</h1>
        <p className="login-copy">
          Enviaremos un codigo al correo del administrador para que puedas crear una nueva contrasena.
        </p>

        {message ? (
          <p className={`login-message login-message--${message.type}`}>{message.text}</p>
        ) : null}

        <form className="login-form" onSubmit={handleSendCode}>
          <label htmlFor="recover-email">Correo administrativo</label>
          <input
            id="recover-email"
            type="email"
            value={email}
            readOnly
            placeholder={isLoadingEmail ? "Cargando correo..." : "Sin correo configurado"}
            autoComplete="email"
            required
          />

          <button type="submit" disabled={isSendingCode || isLoadingEmail || !email}>
            {isSendingCode ? "Enviando..." : "Enviar codigo"}
          </button>
        </form>

        <form className="login-form" onSubmit={handleResetPassword}>
          <label htmlFor="recover-code">Codigo recibido</label>
          <input
            id="recover-code"
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Ingresa el codigo de 6 digitos"
            required
          />

          <label htmlFor="recover-password">Nueva contrasena</label>
          <input
            id="recover-password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="Minimo 8 caracteres"
            autoComplete="new-password"
            required
          />

          <label htmlFor="recover-confirm-password">Confirmar contrasena</label>
          <input
            id="recover-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repite la nueva contrasena"
            autoComplete="new-password"
            required
          />

          <button type="submit" disabled={isResetting}>
            {isResetting ? "Actualizando..." : "Cambiar contrasena"}
          </button>
        </form>

        <Link href="/login" className="login-back-link">
          Volver a inicio de sesion
        </Link>
      </section>
    </main>
  );
}
