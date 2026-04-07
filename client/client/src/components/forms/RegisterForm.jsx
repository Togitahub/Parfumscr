import Input from "../common/Input";
import Button from "../common/Button";

import { useState } from "react";
import { useToast } from "../../hooks/ToastContext";
import { useMutation } from "@apollo/client/react";
import { REGISTER } from "../../graphql/user/UserMutations";

const EMPTY_FORM = {
	name: "",
	email: "",
	password: "",
	confirmPassword: "",
	phone: "",
	address: "",
};

const RegisterForm = ({ onSuccess, onCancel }) => {
	const toast = useToast();
	const [form, setForm] = useState(EMPTY_FORM);
	const [errors, setErrors] = useState({});

	const [register, { loading }] = useMutation(REGISTER);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
		if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
	};

	const validate = () => {
		const newErrors = {};

		if (!form.name.trim()) newErrors.name = "El nombre es requerido";
		if (!form.email.trim()) newErrors.email = "El correo es requerido";
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
			newErrors.email = "Correo inválido";
		if (!form.password) newErrors.password = "La contraseña es requerida";
		else if (form.password.length < 6)
			newErrors.password = "Mínimo 6 caracteres";
		if (!form.confirmPassword)
			newErrors.confirmPassword = "Confirma tu contraseña";
		else if (form.password !== form.confirmPassword)
			newErrors.confirmPassword = "Las contraseñas no coinciden";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validate()) return;

		try {
			await register({
				variables: {
					name: form.name.trim(),
					email: form.email.trim(),
					password: form.password,
					phone: form.phone.trim() || undefined,
					address: form.address.trim() || undefined,
				},
			});

			toast.success("Cuenta creada", {
				description: "Ya puedes iniciar sesión",
			});

			setForm(EMPTY_FORM);
			onSuccess?.();
		} catch (err) {
			toast.error("Error al registrarse", { description: err.message });
		}
	};

	return (
		<div className="flex flex-col gap-5">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Input
					label="Nombre"
					name="name"
					placeholder="Tu nombre"
					value={form.name}
					onChange={handleChange}
					error={errors.name}
					required
				/>
				<Input
					label="Correo electrónico"
					name="email"
					type="email"
					placeholder="correo@ejemplo.com"
					value={form.email}
					onChange={handleChange}
					error={errors.email}
					required
				/>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Input
					label="Contraseña"
					name="password"
					type="password"
					placeholder="••••••••"
					value={form.password}
					onChange={handleChange}
					error={errors.password}
					required
				/>
				<Input
					label="Confirmar contraseña"
					name="confirmPassword"
					type="password"
					placeholder="••••••••"
					value={form.confirmPassword}
					onChange={handleChange}
					error={errors.confirmPassword}
					required
				/>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Input
					label="Teléfono"
					name="phone"
					type="tel"
					placeholder="+506 0000-0000"
					value={form.phone}
					onChange={handleChange}
				/>
				<Input
					label="Dirección"
					name="address"
					placeholder="Tu dirección"
					value={form.address}
					onChange={handleChange}
				/>
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
					Crear cuenta
				</Button>
			</div>
		</div>
	);
};

export default RegisterForm;
