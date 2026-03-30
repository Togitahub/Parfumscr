import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASSWORD,
	},
});

export const sendResetPasswordEmail = async (email, code) => {
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
		subject: "Código de recuperación de contraseña",
		html: `
            <h1>Recuperación de Contraseña</h1>
            <p>Tu código de verificación es:</p>
            <h2 style="color: #00C9A7; letter-spacing: 5px;">${code}</h2>
            <p>Este código expira en 1 hora.</p>
            <p>Si no solicitaste este cambio, ignora este correo.</p>
        `,
	};

	await transporter.sendMail(mailOptions);
};
