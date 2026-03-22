import nodemailer from "nodemailer";

const SMTP_SETUP_ERROR =
  "SMTP no configurado. Define SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (App Password de Gmail) y SMTP_FROM en .env";

function getMailConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM ?? user;

  if (!host || !user || !pass || !from || Number.isNaN(port)) {
    throw new Error(SMTP_SETUP_ERROR);
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    from,
  };
}

export async function sendPasswordResetEmail(params: {
  to: string;
  code: string;
  expiresAt: number;
}) {
  const config = getMailConfig();

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  await transporter.verify();

  const expiresAtText = new Date(params.expiresAt).toLocaleString("es-CR", {
    hour12: true,
  });

  await transporter.sendMail({
    from: config.from,
    to: params.to,
    subject: "Codigo de recuperacion de contrasena",
    text: [
      "Recibimos una solicitud para recuperar tu contrasena del panel administrativo.",
      `Codigo: ${params.code}`,
      `Vence: ${expiresAtText}`,
      "Si no solicitaste este cambio, ignora este correo.",
    ].join("\n"),
  });
}
