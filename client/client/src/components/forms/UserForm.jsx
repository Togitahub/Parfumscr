import Input from "../common/Input";
import Button from "../common/Button";
import Select from "../common/Select";

import { useState } from "react";
import { useAuth } from "../../hooks/AuthContext";
import { useToast } from "../../hooks/ToastContext";
import { useMutation } from "@apollo/client/react";
import { GET_USERS } from "../../graphql/user/UserQueries";
import { REGISTER, UPDATE_USER } from "../../graphql/user/UserMutations";

// ── Constants ─────────────────────────────────────────────────────────────────

const ROLE_OPTIONS = [
	{ value: "COSTUMER", label: "Cliente" },
	{ value: "ADMIN", label: "Admin" },
	{ value: "SUPER_ADMIN", label: "Super Admin" },
];

const EMPTY_CREATE = {
	name: "",
	email: "",
	password: "",
	confirmPassword: "",
	role: "COSTUMER",
	phone: "",
	address: "",
};

const buildInitialForm = (user) => {
	if (!user) return EMPTY_CREATE;
	return {
		name: user.name ?? "",
		email: user.email ?? "",
		role: user.role ?? "COSTUMER",
		phone: user.phone ?? "",
		address: user.address ?? "",
	};
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * UserForm
 *
 * Props:
 * - user: object | null — si se pasa, activa modo edición
 * - onSuccess: () => void
 * - onCancel: () => void
 */
const UserForm = ({ user = null, onSuccess, onCancel }) => {
	const toast = useToast();
	const { user: loggedUser } = useAuth();
	const isEditing = Boolean(user);
	const isSuperAdmin = loggedUser?.role === "SUPER_ADMIN";

	const [form, setForm] = useState(() => buildInitialForm(user));
	const [errors, setErrors] = useState({});

	const [register, { loading: loadingCreate }] = useMutation(REGISTER, {
		refetchQueries: [{ query: GET_USERS }],
	});

	const [updateUser, { loading: loadingUpdate }] = useMutation(UPDATE_USER, {
		refetchQueries: [{ query: GET_USERS }],
	});

	const loading = loadingCreate || loadingUpdate;

	// ── Handlers ──────────────────────────────────────────────────────────────

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
		if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
	};

	// ── Validation ────────────────────────────────────────────────────────────

	const validate = () => {
		const newErrors = {};

		if (!form.name.trim()) newErrors.name = "El nombre es requerido";

		if (!form.email.trim()) newErrors.email = "El correo es requerido";
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
			newErrors.email = "Correo inválido";

		if (!isEditing) {
			if (!form.password) newErrors.password = "La contraseña es requerida";
			else if (form.password.length < 6)
				newErrors.password = "Mínimo 6 caracteres";
			if (!form.confirmPassword)
				newErrors.confirmPassword = "Confirma la contraseña";
			else if (form.password !== form.confirmPassword)
				newErrors.confirmPassword = "Las contraseñas no coinciden";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// ── Submit ────────────────────────────────────────────────────────────────

	const handleSubmit = async () => {
		if (!validate()) return;

		try {
			if (isEditing) {
				await updateUser({
					variables: {
						id: user.id,
						name: form.name.trim(),
						email: form.email.trim(),
						role: isSuperAdmin ? form.role : undefined,
						phone: form.phone.trim() || undefined,
						address: form.address.trim() || undefined,
					},
				});
				toast.success("Usuario actualizado");
			} else {
				await register({
					variables: {
						name: form.name.trim(),
						email: form.email.trim(),
						password: form.password,
						role: isSuperAdmin ? form.role : undefined,
						phone: form.phone.trim() || undefined,
						address: form.address.trim() || undefined,
					},
				});
				toast.success("Usuario creado");
			}

			onSuccess?.();
		} catch (err) {
			toast.error(isEditing ? "Error al actualizar" : "Error al crear", {
				description: err.message,
			});
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") handleSubmit();
	};

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<div className="flex flex-col gap-5">
			{/* ── Nombre + Email ── */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Input
					label="Nombre"
					name="name"
					placeholder="Nombre completo"
					value={form.name}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					error={errors.name}
					required
					autoFocus
				/>
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
			</div>

			{/* ── Contraseña (solo en creación) ── */}
			{!isEditing && (
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
					<Input
						label="Confirmar contraseña"
						name="confirmPassword"
						type="password"
						placeholder="••••••••"
						value={form.confirmPassword}
						onChange={handleChange}
						onKeyDown={handleKeyDown}
						error={errors.confirmPassword}
						required
					/>
				</div>
			)}

			{/* ── Rol (solo SUPER_ADMIN) ── */}
			{isSuperAdmin && (
				<Select
					label="Rol"
					name="role"
					options={ROLE_OPTIONS}
					value={form.role}
					onChange={handleChange}
					required
				/>
			)}

			{/* ── Teléfono + Dirección ── */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Input
					label="Teléfono"
					name="phone"
					type="tel"
					placeholder="+506 0000-0000"
					value={form.phone}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
				/>
				<Input
					label="Dirección"
					name="address"
					placeholder="Tu dirección"
					value={form.address}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
				/>
			</div>

			{/* ── Acciones ── */}
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
					{isEditing ? "Guardar cambios" : "Crear usuario"}
				</Button>
			</div>
		</div>
	);
};

export default UserForm;
