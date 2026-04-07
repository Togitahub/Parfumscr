export const isTokenExpired = (token) => {
	if (!token || typeof token !== "string") return true;

	try {
		const parts = token.split(".");
		if (parts.length !== 3) return true;

		const payload = JSON.parse(atob(parts[1]));
		if (!payload.exp) return true;

		return Date.now() >= payload.exp * 1000;
	} catch (error) {
		console.error("Error decoding token:", error);
		return true;
	}
};
