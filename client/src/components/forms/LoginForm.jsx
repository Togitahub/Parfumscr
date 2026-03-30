import Input from "../common/Input";
import Button from "../common/Button";

import { useState } from "react";
import { useAuth } from "../../hooks/AuthContext";
import { useToast } from "../../hooks/ToastContext";

const EMPTY_FORM = {
	email: "",
	password: "",
};

const LoginForm = ({ onSuccess, onCancel, onForgotPassword }) => {
	const toast = useToast();
	const { login, loading } = useAuth();

	const [form, setForm] = useState(EMPTY_FORM);
	const [errors, setErrors] = useState({});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
		if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
	};

	const validate = () => {
		const newErrors = {};

		if (!form.email.trim()) newErrors.email = "El correo es requerido";
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
			newErrors.email = "Correo inválido";

		if (!form.password) newErrors.password = "La contraseña es requerida";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validate()) return;

		const result = await login(form.email.trim(), form.password);

		if (result.success) {
			toast.success("Bienvenido", {
				description: `Hola, ${result.user.name}`,
			});
			setForm(EMPTY_FORM);
			onSuccess?.(result);
		} else {
			toast.error("Error al iniciar sesión", { description: result.error });
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") handleSubmit();
	};

	return (
		<div className="flex flex-col gap-5">
			<Input
				label="Correo electrónico"
				name="email"
				type="email"
				placeholder="correo@ejemplo.com"
				value={form.email}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				error={errors.email}
				required
			/>

			<div className="flex flex-col gap-1">
				<Input
					label="Contraseña"
					name="password"
					type="password"
					placeholder="••••••••"
					value={form.password}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					error={errors.password}
					required
				/>

				{onForgotPassword && (
					<div className="flex justify-end">
						<Button
							as="button"
							variant="link"
							size="sm"
							onClick={onForgotPassword}
							type="button"
						>
							¿Olvidaste tu contraseña?
						</Button>
					</div>
				)}
			</div>

			<div className="flex justify-end gap-2 pt-2 border-t border-first/10">
				{onCancel && (
					<Button
						variant="outline"
						size="sm"
						onClick={onCancel}
						disabled={loading}
					>
						Cancelar
					</Button>
				)}
				<Button size="sm" loading={loading} onClick={handleSubmit}>
					Iniciar sesión
				</Button>
			</div>
		</div>
	);
};

export default LoginForm;
