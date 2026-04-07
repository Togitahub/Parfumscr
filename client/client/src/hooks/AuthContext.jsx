/* eslint-disable react-refresh/only-export-components */
import { isTokenExpired } from "../utils/TokenUtils.js";
import { LOGIN } from "../graphql/user/UserMutations.js";
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

	const logout = useCallback(() => {
		localStorage.clear();
		setUser(null);
		setIsAuthenticated(false);
		client.resetStore();
		console.log("User logged out successfully");
	}, [client]);

	useEffect(() => {
		const token = localStorage.getItem("authToken");
		const savedUser = localStorage.getItem("user");
		if (token && !isTokenExpired(token)) {
			setIsAuthenticated(true);
			if (savedUser) {
				setUser(JSON.parse(savedUser)); // Agregar esto
			}
		} else {
			setIsAuthenticated(false);
			if (token) localStorage.removeItem("authToken");
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		if (!isAuthenticated) return;

		const interval = setInterval(
			() => {
				const token = localStorage.getItem("authToken");
				if (isTokenExpired(token)) {
					logout();
				}
			},
			5 * 60 * 1000,
		);

		return () => clearInterval(interval);
	}, [isAuthenticated, logout]);

	const login = async (email, password) => {
		try {
			setLoading(true);
			const { data } = await loginMutation({
				variables: { email, password },
			});
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
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error("Context must be used within an AuthProvider");
	return context;
};
