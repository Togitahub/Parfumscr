/* eslint-disable react-refresh/only-export-components */
import { isTokenExpired } from "../utils/TokenUtils.js";

import { LOGIN, LOGOUT } from "../graphql/user/UserMutations.js";

import { useApolloClient, useMutation } from "@apollo/client/react";

import {
	useState,
	createContext,
	useContext,
	useEffect,
	useCallback,
} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const client = useApolloClient();
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const [loginMutation] = useMutation(LOGIN);
	const [logoutMutation] = useMutation(LOGOUT);

	const logout = useCallback(
		async (shouldCallServer = true) => {
			if (shouldCallServer) {
				try {
					await logoutMutation();
				} catch {
					// silencioso, igual limpiamos localmente
				}
			}
			localStorage.removeItem("authToken");
			localStorage.removeItem("user");
			setUser(null);
			setIsAuthenticated(false);
			client.resetStore();
		},
		[client, logoutMutation],
	);

	useEffect(() => {
		const token = localStorage.getItem("authToken");
		const savedUser = localStorage.getItem("user");

		const init = async () => {
			if (token && !isTokenExpired(token)) {
				setIsAuthenticated(true);
				if (savedUser) setUser(JSON.parse(savedUser));
			} else if (token) {
				try {
					const res = await fetch(
						`${import.meta.env.VITE_API_URI}/api/refresh-token`,
						{ method: "POST", credentials: "include" },
					);
					if (!res.ok) throw new Error();
					const { token: newToken } = await res.json();
					localStorage.setItem("authToken", newToken);
					if (savedUser) setUser(JSON.parse(savedUser));
					setIsAuthenticated(true);
				} catch {
					localStorage.removeItem("authToken");
					localStorage.removeItem("user");
					setIsAuthenticated(false);
				}
			} else {
				setIsAuthenticated(false);
			}
			setLoading(false);
		};

		init();
	}, []);

	const refreshAccessToken = useCallback(async () => {
		try {
			const res = await fetch(
				`${import.meta.env.VITE_API_URI}/api/refresh-token`,
				{ method: "POST", credentials: "include" },
			);
			if (!res.ok) throw new Error("Refresh failed");
			const { token } = await res.json();
			localStorage.setItem("authToken", token);
			return true;
		} catch {
			return false;
		}
	}, []);

	const login = async (email, password) => {
		try {
			setLoading(true);
			const { data, errors } = await loginMutation({
				variables: { email, password },
			});
			if (!data?.login) {
				throw new Error(
					errors?.[0]?.message || "Error de conexión con el servidor",
				);
			}
			const {
				token: loggedToken,
				user: loggedUser,
				isDefaultAdmin,
			} = data.login;

			localStorage.setItem("authToken", loggedToken);
			localStorage.setItem("user", JSON.stringify(loggedUser));

			setUser(loggedUser);
			setIsAuthenticated(true);

			return {
				success: true,
				user: loggedUser,
				isDefaultAdmin,
				role: loggedUser.role,
			};
		} catch (error) {
			console.error("Login error:", error.message);
			setIsAuthenticated(false);
			return { success: false, error: error.message };
		} finally {
			setLoading(false);
		}
	};

	const value = {
		user,
		login,
		logout,
		loading,
		isAuthenticated,
		refreshAccessToken,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error("Context must be used within an AuthProvider");
	return context;
};
