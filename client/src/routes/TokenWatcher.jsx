import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";
import { isTokenExpired } from "../utils/TokenUtils";

const PUBLIC_PATHS = ["/auth"];

const TokenWatcher = () => {
	const { isAuthenticated, logout, refreshAccessToken } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const isRefreshing = useRef(false);
	const locationRef = useRef(location.pathname);

	useEffect(() => {
		locationRef.current = location.pathname;
	}, [location.pathname]);

	useEffect(() => {
		if (!isAuthenticated) return;

		const check = async () => {
			const token = localStorage.getItem("authToken");
			if (!isTokenExpired(token)) return;
			if (isRefreshing.current) return;

			isRefreshing.current = true;
			const refreshed = await refreshAccessToken();
			isRefreshing.current = false;

			if (!refreshed) {
				await logout(false);
				if (!PUBLIC_PATHS.includes(locationRef.current)) {
					navigate("/auth", { replace: true });
				}
			}
		};

		check();
		const interval = setInterval(check, 5 * 60 * 1000);
		return () => clearInterval(interval);
	}, [isAuthenticated, logout, refreshAccessToken, navigate]);

	return null;
};

export default TokenWatcher;
