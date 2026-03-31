import { useAuth } from "../hooks/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMutation } from "@apollo/client/react";

import UserForm from "../components/forms/UserForm";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { BsArrowBarLeft, BsLock } from "react-icons/bs";
import { useToast } from "../hooks/ToastContext";
import { CHANGE_PASSWORD } from "../graphql/user/UserMutations";

const ChangePasswordForm = () => {
	const toast = useToast();
	const [form, setForm] = useState({ current: "", next: "", confirm: "" });
	const [errors, setErrors] = useState({});

	const [changePassword, { loading }] = useMutation(CHANGE_PASSWORD);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((p) => ({ ...p, [name]: value }));
		if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
	};

	const validate = () => {
		const e = {};
		if (!form.current) e.current = "Requerida";
		if (!form.next) e.next = "Requerida";
		else if (form.next.length < 6) e.next = "Mínimo 6 caracteres";
		if (!form.confirm) e.confirm = "Requerida";
		else if (form.next !== form.confirm)
			e.confirm = "Las contraseñas no coinciden";
		setErrors(e);
		return Object.keys(e).length === 0;
	};

	const handleSubmit = async () => {
		if (!validate()) return;
		try {
			await changePassword({
				variables: { currentPassword: form.current, newPassword: form.next },
			});
			toast.success("Contraseña actualizada");
			setForm({ current: "", next: "", confirm: "" });
		} catch (err) {
			toast.error("Error", { description: err.message });
		}
	};

	return (
		<div className="flex flex-col gap-4">
			<Input
				label="Contraseña actual"
				name="current"
				type="password"
				placeholder="••••••••"
				value={form.current}
				onChange={handleChange}
				error={errors.current}
				required
			/>
			<Input
				label="Nueva contraseña"
				name="next"
				type="password"
				placeholder="••••••••"
				value={form.next}
				onChange={handleChange}
				error={errors.next}
				required
			/>
			<Input
				label="Confirmar nueva contraseña"
				name="confirm"
				type="password"
				placeholder="••••••••"
				value={form.confirm}
				onChange={handleChange}
				error={errors.confirm}
				required
			/>
			<div className="flex justify-end pt-2 border-t border-first/10">
				<Button size="sm" loading={loading} onClick={handleSubmit}>
					Cambiar contraseña
				</Button>
			</div>
		</div>
	);
};

const ProfileView = () => {
	const { user } = useAuth();
	const navigate = useNavigate();

	return (
		<div
			className="my-20 px-4 md:px-8 lg:px-12"
			style={{ animation: "fadeIn 0.4s ease both" }}
		>
			<div className="max-w-xl mx-auto flex flex-col gap-8">
				<div
					className="flex flex-col gap-2"
					style={{ animation: "fadeUp 0.4s ease both" }}
				>
					<div className="flex justify-between">
						<h1
							className="text-4xl font-light tracking-tight text-first leading-none"
							style={{ fontFamily: "'Cormorant Garamond', serif" }}
						>
							Mi perfil
						</h1>
						<Button
							iconOnly
							icon={<BsArrowBarLeft />}
							onClick={() => navigate(-1)}
						/>
					</div>
					<div
						className="mt-1 h-px w-24"
						style={{
							background:
								"linear-gradient(to right, var(--color-second), transparent)",
							opacity: 0.5,
						}}
					/>
				</div>

				{/* Datos personales */}
				<div
					className="rounded-xl border border-first/10 bg-main p-6"
					style={{
						animation: "fadeUp 0.45s ease both",
						animationDelay: "60ms",
					}}
				>
					<UserForm user={user} onSuccess={() => {}} />
				</div>

				{/* Cambio de contraseña */}
				<div
					className="rounded-xl border border-first/10 bg-main p-6 flex flex-col gap-4"
					style={{
						animation: "fadeUp 0.45s ease both",
						animationDelay: "100ms",
					}}
				>
					<div className="flex items-center gap-2">
						<BsLock className="w-4 h-4 text-second/60" />
						<h2 className="text-sm font-semibold text-first/70 uppercase tracking-widest">
							Cambiar contraseña
						</h2>
					</div>
					<ChangePasswordForm />
				</div>
			</div>
		</div>
	);
};

export default ProfileView;
