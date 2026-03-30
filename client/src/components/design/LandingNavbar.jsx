import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/AuthContext";

import Button from "../common/Button";
import ThemeChanger from "../interface/ThemeChanger";

import { FaSignOutAlt } from "react-icons/fa";

const LandingNavbar = () => {
	const { isAuthenticated, logout } = useAuth();
	const navigate = useNavigate();

	return (
		<header className="fixed top-0 left-0 right-0 z-40 border-b border-first/8 bg-main/85 backdrop-blur-sm">
			<div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
				{/* Logo */}
				<NavLink to="/" className="flex items-center gap-2.5 shrink-0">
					<div className="w-8 h-8 rounded-lg flex items-center justify-center bg-second text-main font-bold text-sm">
						P
					</div>
					<span className="font-semibold text-base text-first tracking-tight hidden sm:block">
						Parfumscr
					</span>
				</NavLink>

				{/* Actions */}
				<div className="flex items-center gap-2">
					<ThemeChanger />
					{isAuthenticated ? (
						<Button
							size="xs"
							iconOnly="true"
							icon={<FaSignOutAlt />}
							onClick={logout}
						>
							Cerrar Sesión
						</Button>
					) : (
						<Button size="sm" onClick={() => navigate("/auth")}>
							Iniciar sesión
						</Button>
					)}
				</div>
			</div>
		</header>
	);
};

export default LandingNavbar;
