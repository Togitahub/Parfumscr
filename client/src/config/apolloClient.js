import {
	ApolloClient,
	InMemoryCache,
	HttpLink,
	ApolloLink,
} from "@apollo/client";
import { Observable } from "@apollo/client/utilities";

// ── HTTP link ─────────────────────────────────────────────────────────────────

const httpLink = new HttpLink({
	uri: import.meta.env.VITE_SERVER_URI,
	credentials: "include",
});

// ── Auth link con refresh automático ─────────────────────────────────────────

let isRefreshing = false;
let pendingRequests = [];

const resolvePending = (token) => {
	pendingRequests.forEach((cb) => cb(token));
	pendingRequests = [];
};

const requestLink = new ApolloLink((operation, forward) => {
	const token = localStorage.getItem("authToken");
	operation.setContext(({ headers = {} }) => ({
		headers: {
			...headers,
			authorization: token ? `Bearer ${token}` : "",
		},
	}));

	return new Observable((observer) => {
		forward(operation).subscribe({
			next: (result) => {
				const isUnauthenticated = result.errors?.some(
					(e) =>
						e.extensions?.code === "UNAUTHENTICATED" ||
						e.message === "Not authenticated" ||
						e.message === "Authentication required",
				);

				if (!isUnauthenticated) {
					observer.next(result);
					return;
				}

				if (isRefreshing) {
					// Encolar el request hasta que el refresh termine
					pendingRequests.push((newToken) => {
						operation.setContext(({ headers = {} }) => ({
							headers: { ...headers, authorization: `Bearer ${newToken}` },
						}));
						forward(operation).subscribe({
							next: observer.next.bind(observer),
							error: observer.error.bind(observer),
							complete: observer.complete.bind(observer),
						});
					});
					return;
				}

				isRefreshing = true;

				fetch(`${import.meta.env.VITE_API_URI}/api/refresh-token`, {
					method: "POST",
					credentials: "include",
				})
					.then((res) => {
						if (!res.ok) throw new Error("Refresh failed");
						return res.json();
					})
					.then(({ token: newToken }) => {
						localStorage.setItem("authToken", newToken);
						isRefreshing = false;
						resolvePending(newToken);

						operation.setContext(({ headers = {} }) => ({
							headers: { ...headers, authorization: `Bearer ${newToken}` },
						}));
						forward(operation).subscribe({
							next: observer.next.bind(observer),
							error: observer.error.bind(observer),
							complete: observer.complete.bind(observer),
						});
					})
					.catch(() => {
						isRefreshing = false;
						pendingRequests = [];
						localStorage.removeItem("authToken");
						localStorage.removeItem("user");
						if (!window.location.pathname.includes("/auth")) {
							window.location.href = "/auth";
						}
						observer.complete();
					});
			},
			error: (error) => {
				console.error(
					`[Network error] op: ${operation.operationName} | ${error.message}`,
				);
				observer.error(error);
			},
			complete: observer.complete.bind(observer),
		});
	});
});

// ── Client ────────────────────────────────────────────────────────────────────

export const client = new ApolloClient({
	link: ApolloLink.from([requestLink, httpLink]),
	cache: new InMemoryCache(),
	defaultOptions: {
		watchQuery: {
			errorPolicy: "all",
		},
		query: {
			errorPolicy: "all",
		},
		mutate: {
			errorPolicy: "none",
		},
	},
});
