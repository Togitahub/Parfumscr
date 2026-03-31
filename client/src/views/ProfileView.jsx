import { useAuth } from "../hooks/AuthContext";
import { useNavigate } from "react-router-dom";

import UserForm from "../components/forms/UserForm";
import Button from "../components/common/Button";
import { BsArrowBarLeft } from "react-icons/bs";

const ProfileView = () => {
	const { user } = useAuth();

	const navigate = useNavigate();

	const handleSuccess = () => {
		// Opcional: refrescar datos del contexto si los actualizas en localStorage
	};

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

				<div
					className="rounded-xl border border-first/10 bg-main p-6"
					style={{
						animation: "fadeUp 0.45s ease both",
						animationDelay: "60ms",
					}}
				>
					<UserForm user={user} onSuccess={handleSuccess} />
				</div>
			</div>
		</div>
	);
};

export default ProfileView;
