const isProd = process.env.NODE_ENV === "production";

export const refreshTokenCookieOptions = {
	httpOnly: true,
	secure: isProd, // HTTPS only in prod
	sameSite: isProd ? "none" : "strict", // "none" required for cross-site in prod
	domain: isProd ? ".parfumsoft.com" : undefined, // shared across subdomains
	maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
	path: "/",
};

export const clearRefreshTokenCookieOptions = {
	httpOnly: true,
	secure: isProd,
	sameSite: isProd ? "none" : "strict",
	domain: isProd ? ".parfumsoft.com" : undefined,
	path: "/",
};
