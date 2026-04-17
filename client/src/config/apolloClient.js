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

// ── Refresh helper ────────────────────────────────────────────────────────────

let isRefreshing = false;
let pendingRequests = [];

const resolvePending = (token) => {
	pendingRequests.forEach((cb) => cb(token));
	pendingRequests = [];
};

const rejectPending = (error) => {
	pendingRequests.forEach((cb) => cb(null, error));
	pendingRequests = [];
};

const doRefresh = () =>
	fetch(`${import.meta.env.VITE_API_URI}/api/refresh-token`, {
		method: "POST",
		credentials: "include",
	}).then((res) => {
		if (!res.ok) throw new Error("Refresh failed");
		return res.json().then(({ token }) => {
			localStorage.setItem("authToken", token);
			return token;
		});
	});

// ── Retry operation with new token ───────────────────────────────────────────

const retryOperation = (operation, forward, newToken, observer) => {
	operation.setContext(({ headers = {} }) => ({
		headers: { ...headers, authorization: `Bearer ${newToken}` },
	}));
	forward(operation).subscribe({
		next: observer.next.bind(observer),
		error: observer.error.bind(observer),
		complete: observer.complete.bind(observer),
	});
};

// ── Auth link ─────────────────────────────────────────────────────────────────

const requestLink = new ApolloLink((operation, forward) => {
	// Always read latest token at request time
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

				// No error — pass through normally
				if (!isUnauthenticated) {
					observer.next(result);
					return;
				}

				// Token expired — queue or refresh
				if (isRefreshing) {
					pendingRequests.push((newToken, err) => {
						if (err || !newToken) {
							observer.error(err || new Error("Session expired"));
							return;
						}
						retryOperation(operation, forward, newToken, observer);
					});
					return;
				}

				isRefreshing = true;

				doRefresh()
					.then((newToken) => {
						isRefreshing = false;
						resolvePending(newToken);
						// Retry the operation that triggered the refresh
						retryOperation(operation, forward, newToken, observer);
					})
					.catch((err) => {
						isRefreshing = false;
						rejectPending(err);
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
		watchQuery: { errorPolicy: "all" },
		query: { errorPolicy: "all" },
		mutate: { errorPolicy: "none" },
	},
});
