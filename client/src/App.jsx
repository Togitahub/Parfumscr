import { Routes, Route } from "react-router-dom";

import AuthView from "./views/AuthView";
import HomeView from "./views/HomeView";
import AboutView from "./views/AboutView";
import AdminView from "./views/AdminView";
import CartView from "./views/CartView";
import OrderView from "./views/OrderView";
import OrdersView from "./views/OrdersView";
import ProductView from "./views/ProductView";
import EntityView from "./views/EntityView";
import FavoritesView from "./views/FavoritesView";
import StoreView from "./views/StoreView";
import ProfileView from "./views/ProfileView";

import NavBar from "./components/design/Navbar";
import Footer from "./components/design/Footer";
import ProtectedRoute from "./routes/ProtectedRoute";
import ScrollToTop from "./routes/ScrollToTop";
import NotFoundView from "./views/NotFoundView";
import LandingNavbar from "./components/design/LandingNavbar";

import { useAuth } from "./hooks/AuthContext";
import { useStore } from "./hooks/StoreContext";

const App = () => {
	const { user } = useAuth();
	const { store } = useStore();

	const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(user?.role);

	return (
		<div className="flex flex-col min-h-screen">
			<ScrollToTop />
			{store ? <NavBar /> : <LandingNavbar />}

			<main className="flex-1">
				<Routes>
					{/* ── Públicas ── */}
					<Route path="/" element={isAdmin ? <AdminView /> : <HomeView />} />
					<Route path="/store" element={<StoreView />} />
					<Route path="/auth" element={<AuthView />} />
					<Route path="/about" element={<AboutView />} />
					<Route path="/store/product/:id" element={<ProductView />} />
					<Route
						path="/store/brand/:id"
						element={<EntityView type="brand" />}
					/>
					<Route
						path="/store/segment/:id"
						element={<EntityView type="segment" />}
					/>
					<Route
						path="/store/category/:id"
						element={<EntityView type="category" />}
					/>
					<Route path="/store/note/:id" element={<EntityView type="note" />} />

					{/* ── Protegidas (usuario autenticado) ── */}
					<Route element={<ProtectedRoute />}>
						<Route path="/store/cart" element={<CartView />} />
						<Route path="/store/orders" element={<OrdersView />} />
						<Route path="/store/orders/:id" element={<OrderView />} />
						<Route path="/store/favorites" element={<FavoritesView />} />
						<Route path="/profile" element={<ProfileView />} />
					</Route>

					{/* ── Protegidas (admin) ── */}
					<Route element={<ProtectedRoute roles={["ADMIN", "SUPER_ADMIN"]} />}>
						<Route path="/admin" element={<AdminView />} />
					</Route>

					{/* ── Fallback ── */}
					<Route path="*" element={<NotFoundView />} />
				</Routes>
			</main>

			<Footer />
		</div>
	);
};

export default App;
