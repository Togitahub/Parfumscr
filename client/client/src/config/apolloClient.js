import {
	ApolloClient,
	InMemoryCache,
	HttpLink,
	ApolloLink,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { Observable } from "@apollo/client/utilities";

// ── HTTP link ─────────────────────────────────────────────────────────────────

const httpLink = new HttpLink({
	uri: import.meta.env.VITE_SERVER_URI,
});

// ── Auth + UNAUTHENTICATED handler ────────────────────────────────────────────

const requestLink = new ApolloLink((operation, forward) => {
	const token = localStorage.getItem("authToken");
	operation.setContext(({ headers = {} }) => ({
		headers: {
			...headers,
			authorization: token ? `Bearer ${token}` : "",
		},
	}));

	return new Observable((observer) => {
		const subscription = forward(operation).subscribe({
			next: observer.next.bind(observer),
			error: observer.error.bind(observer),
			complete: observer.complete.bind(observer),
		});

		return () => subscription.unsubscribe();
	});
});

// ── Global error link ─────────────────────────────────────────────────────────

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
	if (graphQLErrors) {
		graphQLErrors.forEach(({ message, extensions }) => {
			const code = extensions?.code;

			// Sesión expirada o token inválido → limpiar y redirigir
			if (code === "UNAUTHENTICATED" || message === "Not authenticated") {
				localStorage.removeItem("authToken");
				localStorage.removeItem("user");
				// Solo redirigir si no estamos ya en /auth
				if (!window.location.pathname.includes("/auth")) {
					window.location.href = "/auth";
				}
				return;
			}

			console.error(
				`[GraphQL error] op: ${operation.operationName} | ${message}`,
			);
		});
	}

	if (networkError) {
		console.error(
			`[Network error] op: ${operation.operationName} | ${networkError.message}`,
		);
	}
});

// ── Client ────────────────────────────────────────────────────────────────────

export const client = new ApolloClient({
	link: ApolloLink.from([errorLink, requestLink, httpLink]),
	cache: new InMemoryCache(),
	defaultOptions: {
		watchQuery: {
			errorPolicy: "all",
		},
		query: {
			errorPolicy: "all",
		},
		mutate: {
			errorPolicy: "all",
		},
	},
});
