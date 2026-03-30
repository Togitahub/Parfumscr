import {
	ApolloClient,
	InMemoryCache,
	HttpLink,
	ApolloLink,
} from "@apollo/client";
import { Observable } from "@apollo/client/utilities";

const httpLink = new HttpLink({
	uri: import.meta.env.VITE_SERVER_URI,
});

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
			next: (result) => {
				if (result.errors) {
					result.errors.forEach((error) => {
						if (error.extensions?.code === "UNAUTHENTICATED") {
							localStorage.removeItem("authToken");
							window.location.href = "/";
						}
					});
				}
				observer.next(result);
			},
			error: observer.error.bind(observer),
			complete: observer.complete.bind(observer),
		});

		return () => {
			subscription.unsubscribe();
		};
	});
});

export const client = new ApolloClient({
	link: requestLink.concat(httpLink),
	cache: new InMemoryCache(),
});
