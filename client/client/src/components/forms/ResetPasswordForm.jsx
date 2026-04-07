import Input from "../common/Input";
import Button from "../common/Button";

import { useState } from "react";
import { useToast } from "../../hooks/ToastContext";
import { useMutation } from "@apollo/client/react";
import {
	REQUEST_PASSWORD_RESET,
	RESET_PASSWORD,
} from "../../graphql/user/UserMutations";

// ── Pasos del formulario ──────────────────────────────────────────────────────
// Paso 1: el usuario ingresa su email → se envía el código al correo
// Paso 2: el usuario ingresa el token recibido + nueva contraseña

const ResetPasswordForm = ({ onSuccess, onCancel, onBackToLogin }) => {
	const toast = useToast();

	const [step, setStep] = useState(1);
	const [email, setEmail] = useState("");
	const [form, setForm] = useState({
		token: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState({});

	const [requestReset, { loading: loadingRequest }] = useMutation(
		REQUEST_PASSWORD_RESET,
	);
	const [resetPassword, { loading: loadingReset }] =
		useMutation(RESET_PASSWORD);

	// ── Handlers ────────────────────────────────────────────────────────────

	const handleEmailChange = (e) => {
		setEmail(e.target.value);
		if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
	};

	const handleFormChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
		if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
	};

	// ── Validaciones ─────────────────────────────────────────────────────────

	const validateStep1 = () => {
		const newErrors = {};
		if (!email.trim()) newErrors.email = "El correo es requerido";
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
			newErrors.email = "Correo inválido";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const validateStep2 = () => {
		const newErrors = {};
		if (!form.token.trim()) newErrors.token = "El código es requerido";
		if (!form.newPassword) newErrors.newPassword = "La contraseña es requerida";
		else if (form.newPassword.length < 6)
			newErrors.newPassword = "Mínimo 6 caracteres";
		if (!form.confirmPassword)
			newErrors.confirmPassword = "Confirma tu contraseña";
		else if (form.newPassword !== form.confirmPassword)
			newErrors.confirmPassword = "Las contraseñas no coinciden";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// ── Submit paso 1: solicitar código ──────────────────────────────────────

	const handleRequestReset = async () => {
		if (!validateStep1()) return;

		try {
			await requestReset({ variables: { email: email.trim() } });

			toast.success("Código enviado", {
				description: "Revisa tu correo e ingresa el código recibido",
			});

			setStep(2);
		} catch (err) {
			toast.error("Error al solicitar el código", { description: err.message });
		}
	};

	// ── Submit paso 2: cambiar contraseña ────────────────────────────────────

	const handleResetPassword = async () => {
		if (!validateStep2()) return;

		try {
			await resetPassword({
				variables: {
					token: form.token.trim(),
					newPassword: form.newPassword,
				},
			});

			toast.success("Contraseña actualizada", {
				description: "Ya puedes iniciar sesión con tu nueva contraseña",
			});

			onSuccess?.();
		} catch (err) {
			toast.error("Error al cambiar la contraseña", {
				description: err.message,
			});
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			if (step === 1) handleRequestReset();
			else handleResetPassword();
		}
	};

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<div className="flex flex-col gap-5">
			{/* ── Indicador de pasos ── */}
			<div className="flex items-center gap-2">
				{[1, 2].map((s) => (
					<div key={s} className="flex items-center gap-2">
						<div
							className={[
								"w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200",
								s === step
									? "bg-second text-main"
									: s < step
										? "bg-success text-main"
										: "bg-first/10 text-first/30",
							].join(" ")}
						>
							{s < step ? "✓" : s}
						</div>
						<span
							className={[
								"text-xs",
								s === step ? "text-first/80 font-medium" : "text-first/30",
							].join(" ")}
						>
							{s === 1 ? "Solicitar código" : "Nueva contraseña"}
						</span>
						{s < 2 && (
							<div
								className={[
									"w-8 h-px mx-1 transition-all duration-200",
									step > s ? "bg-success" : "bg-first/10",
								].join(" ")}
							/>
						)}
					</div>
				))}
			</div>

			{/* ── Paso 1: email ── */}
			{step === 1 && (
				<>
					<p className="text-sm text-first/50">
						Ingresa tu correo y te enviaremos un código de verificación para
						restablecer tu contraseña.
					</p>

					<Input
						label="Correo electrónico"
						name="email"
						type="email"
						placeholder="correo@ejemplo.com"
						value={email}
						onChange={handleEmailChange}
						onKeyDown={handleKeyDown}
						error={errors.email}
						required
					/>
				</>
			)}

			{/* ── Paso 2: token + nueva contraseña ── */}
			{step === 2 && (
				<>
					<p className="text-sm text-first/50">
						Ingresa el código que recibiste en{" "}
						<span className="text-second font-medium">{email}</span> y elige una
						nueva contraseña.
					</p>

					<Input
						label="Código de verificación"
						name="token"
						placeholder="Pega el código aquí"
						value={form.token}
						onChange={handleFormChange}
						onKeyDown={handleKeyDown}
						error={errors.token}
						hint="Revisa tu bandeja de entrada o spam"
						required
					/>

					<Input
						label="Nueva contraseña"
						name="newPassword"
						type="password"
						placeholder="••••••••"
						value={form.newPassword}
						onChange={handleFormChange}
						onKeyDown={handleKeyDown}
						error={errors.newPassword}
						required
					/>

					<Input
						label="Confirmar contraseña"
						name="confirmPassword"
						type="password"
						placeholder="••••••••"
						value={form.confirmPassword}
						onChange={handleFormChange}
						onKeyDown={handleKeyDown}
						error={errors.confirmPassword}
						required
					/>
				</>
			)}

			{/* ── Acciones ── */}
			<div className="flex justify-between items-center gap-2 pt-2 border-t border-first/10">
				{/* Izquierda: volver atrás */}
				<div>
					{step === 2 ? (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								setStep(1);
								setErrors({});
								setForm({ token: "", newPassword: "", confirmPassword: "" });
							}}
							disabled={loadingReset}
						>
							← Volver
						</Button>
					) : onBackToLogin ? (
						<Button variant="ghost" size="sm" onClick={onBackToLogin}>
							← Iniciar sesión
						</Button>
					) : null}
				</div>

				{/* Derecha: cancelar + acción principal */}
				<div className="flex gap-2">
					{onCancel && (
						<Button
							variant="outline"
							size="sm"
							onClick={onCancel}
							disabled={loadingRequest || loadingReset}
						>
							Cancelar
						</Button>
					)}

					{step === 1 ? (
						<Button
							size="sm"
							loading={loadingRequest}
							onClick={handleRequestReset}
						>
							Enviar código
						</Button>
					) : (
						<Button
							size="sm"
							loading={loadingReset}
							onClick={handleResetPassword}
						>
							Cambiar contraseña
						</Button>
					)}
				</div>
			</div>
		</div>
	);
};

export default ResetPasswordForm;
