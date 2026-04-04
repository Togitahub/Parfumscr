import { useNavigate, useLocation } from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react";

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
	const navigate = useNavigate();
	const location = useLocation();

	const [store, setStore] = useState(null);
	const [loadingStore, setLoadingStore] = useState(true);
	const [storeNotFound, setStoreNotFound] = useState(false);

	const setFavicon = (url) => {
		let link = document.querySelector("link[rel~='icon']");
		if (!link) {
			link = document.createElement("link");
			link.rel = "icon";
			document.head.appendChild(link);
		}
		link.href = url;
	};

	useEffect(() => {
		const fetchStoreConfig = async () => {
			try {
				const host = window.location.hostname;
				const subdomain = host.split(".")[0];
				const slug = subdomain !== "localhost" ? subdomain : null;

				const url = slug
					? `${import.meta.env.VITE_SERVER_URI.replace("/graphql", "")}/api/store-config?slug=${slug}`
					: `${import.meta.env.VITE_SERVER_URI.replace("/graphql", "")}/api/store-config?slug=${import.meta.env.VITE_STORE_SLUG ?? "default"}`;

				const res = await fetch(url, {
					headers: { Host: host },
				});

				if (!res.ok) {
					setStoreNotFound(true);
					document.title = "Parfumscr";
					return;
				}

				const data = await res.json();

				document.documentElement.style.setProperty(
					"--color-main",
					data.colorMain,
				);
				document.documentElement.style.setProperty(
					"--color-first",
					data.colorFirst,
				);
				document.documentElement.style.setProperty(
					"--color-second",
					data.colorSecond,
				);

				setStore(data);
				document.title = data.storeName ?? "Parfumscr";

				if (data.logo) setFavicon(data.logo);
			} catch (err) {
				console.error("StoreContext error:", err.message);
			} finally {
				setLoadingStore(false);
			}
		};

		fetchStoreConfig();
	}, []); // <- solo al montar

	// Manejo de redirect separado
	useEffect(() => {
		if (
			!loadingStore &&
			store &&
			(location.pathname === "/" || location.pathname === "")
		) {
			navigate("/store", { replace: true });
		}
	}, [loadingStore, store, location.pathname, navigate]);

	return (
		<StoreContext.Provider value={{ store, loadingStore, storeNotFound }}>
			{children}
		</StoreContext.Provider>
	);
};

// eslint-disable-next-line react-refresh/only-export-components
export const useStore = () => {
	const ctx = useContext(StoreContext);
	if (!ctx) throw new Error("useStore must be used within a StoreProvider");
	return ctx;
};
