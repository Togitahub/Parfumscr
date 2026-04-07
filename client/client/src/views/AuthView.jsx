import LoginForm from "../components/forms/LoginForm";
import RegisterForm from "../components/forms/RegisterForm";
import ResetPasswordForm from "../components/forms/ResetPasswordForm";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";

// ── Pantallas posibles ────────────────────────────────────────────────────────
// "login" | "register" | "reset"

const AuthView = () => {
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();

	const [screen, setScreen] = useState("login");

	// Si ya está autenticado, redirigir al home
	useEffect(() => {
		if (isAuthenticated) {
			navigate("/", { replace: true });
		}
	}, [isAuthenticated, navigate]);

	if (isAuthenticated) return null;

	// ── Handlers de navegación entre pantallas ────────────────────────────────

	const handleLoginSuccess = () => {
		navigate("/", { replace: true });
	};

	const handleRegisterSuccess = () => {
		setScreen("login");
	};

	const handleResetSuccess = () => {
		setScreen("login");
	};

	// ── Títulos por pantalla ──────────────────────────────────────────────────

	const titles = {
		login: { heading: "Iniciar sesión", sub: "Bienvenido de vuelta" },
		register: { heading: "Crear cuenta", sub: "Únete a la comunidad" },
		reset: {
			heading: "Recuperar contraseña",
			sub: "Te ayudamos a recuperar el acceso",
		},
	};

	const { heading, sub } = titles[screen];

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<div className="min-h-screen flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-md flex flex-col gap-6">
				{/* ── Header ── */}
				<div className="flex flex-col gap-1 text-center">
					<h1 className="text-2xl font-bold text-first">{heading}</h1>
					<p className="text-sm text-first/50">{sub}</p>
				</div>

				{/* ── Card ── */}
				<div className="rounded-xl border border-first/10 bg-main shadow-lg">
					{/* Tabs: solo visibles en login / register */}
					{screen !== "reset" && (
						<div className="flex border-b border-first/10">
							{[
								{ key: "login", label: "Iniciar sesión" },
								{ key: "register", label: "Registrarse" },
							].map(({ key, label }) => (
								<button
									key={key}
									onClick={() => setScreen(key)}
									className={[
										"flex-1 py-3 text-sm font-medium transition-colors duration-150 cursor-pointer",
										screen === key
											? "text-second border-b-2 border-second -mb-px"
											: "text-first/40 hover:text-first/70",
									].join(" ")}
								>
									{label}
								</button>
							))}
						</div>
					)}

					{/* Formulario activo */}
					<div className="px-6 py-6">
						{screen === "login" && (
							<LoginForm
								onSuccess={handleLoginSuccess}
								onForgotPassword={() => setScreen("reset")}
							/>
						)}

						{screen === "register" && (
							<RegisterForm onSuccess={handleRegisterSuccess} />
						)}

						{screen === "reset" && (
							<ResetPasswordForm
								onSuccess={handleResetSuccess}
								onBackToLogin={() => setScreen("login")}
							/>
						)}
					</div>
				</div>

				{/* ── Texto alternativo debajo de la card ── */}
				{screen === "login" && (
					<p className="text-center text-sm text-first/40">
						¿No tienes cuenta?{" "}
						<button
							onClick={() => setScreen("register")}
							className="text-second hover:underline underline-offset-2 font-medium cursor-pointer"
						>
							Regístrate gratis
						</button>
					</p>
				)}

				{screen === "register" && (
					<p className="text-center text-sm text-first/40">
						¿Ya tienes cuenta?{" "}
						<button
							onClick={() => setScreen("login")}
							className="text-second hover:underline underline-offset-2 font-medium cursor-pointer"
						>
							Inicia sesión
						</button>
					</p>
				)}
			</div>
		</div>
	);
};

export default AuthView;
