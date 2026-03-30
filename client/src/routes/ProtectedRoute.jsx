import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";
import { LoadingOverlay } from "../components/interface/LoadingUi";

/**
 * ProtectedRoute
 *
 * Props:
 * - roles: string[] — roles permitidos (opcional).
 *   Si no se pasa, solo verifica que el usuario esté autenticado.
 *
 * Uso:
 * <Route element={<ProtectedRoute />}>
 *     <Route path="/cart" element={<CartView />} />
 * </Route>
 *
 * <Route element={<ProtectedRoute roles={["ADMIN", "SUPER_ADMIN"]} />}>
 *     <Route path="/admin" element={<AdminView />} />
 * </Route>
 */

const ProtectedRoute = ({ roles }) => {
	const { isAuthenticated, user, loading } = useAuth();
	const location = useLocation();

	// Esperar a que AuthContext termine de leer el token del localStorage
	if (loading) return <LoadingOverlay visible fullScreen />;

	// No autenticado → redirigir al login guardando la ruta intentada
	if (!isAuthenticated) {
		return <Navigate to="/auth" state={{ from: location }} replace />;
	}

	// Autenticado pero sin el rol requerido → redirigir al home
	if (roles && !roles.includes(user?.role)) {
		return <Navigate to="/" replace />;
	}

	return <Outlet />;
};

export default ProtectedRoute;
