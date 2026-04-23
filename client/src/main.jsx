import "./index.css";

import App from "./App.jsx";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ApolloProvider } from "@apollo/client/react";
import { AuthProvider } from "./hooks/AuthContext.jsx";
import { ThemeProvider } from "./hooks/ThemeContext.jsx";
import { ToastProvider } from "./hooks/ToastContext.jsx";
import { StoreProvider } from "./hooks/StoreContext.jsx";
import { CartProvider } from "./hooks/CartContext.jsx";

import { client, persistCachePromise } from "./config/apolloClient.js";

persistCachePromise.then(() => {
	createRoot(document.getElementById("root")).render(
		<StrictMode>
			<ApolloProvider client={client}>
				<BrowserRouter>
					<AuthProvider>
						<StoreProvider>
							<CartProvider>
								<ThemeProvider>
									<ToastProvider>
										<App />
									</ToastProvider>
								</ThemeProvider>
							</CartProvider>
						</StoreProvider>
					</AuthProvider>
				</BrowserRouter>
			</ApolloProvider>
		</StrictMode>,
	);
});
