import { useQuery } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import { BsReceipt, BsArrowLeft } from "react-icons/bs";

import { useAuth } from "../hooks/AuthContext";
import { GET_MY_ORDERS } from "../graphql/order/OrderQueries";
import OrderList from "../lists/OrderList";
import Button from "../components/common/Button";

// ── OrdersView ────────────────────────────────────────────────────────────────

const OrdersView = () => {
	const { user } = useAuth();
	const navigate = useNavigate();

	const { data, loading } = useQuery(GET_MY_ORDERS, {
		variables: { userId: user?.id },
		skip: !user?.id,
	});

	const orders = data?.getMyOrders ?? [];

	return (
		<div
			className="min-h-screen px-4 py-10 md:px-8 lg:px-12"
			style={{ animation: "fadeIn 0.4s ease both" }}
		>
			<div className="max-w-4xl mx-auto flex flex-col gap-8">
				{/* ── Header ── */}
				<div
					className="flex flex-col gap-4"
					style={{ animation: "fadeUp 0.4s ease both" }}
				>
					{/* Back button */}
					<button
						onClick={() => navigate(-1)}
						className="flex items-center gap-1.5 text-sm text-first/40 hover:text-first/70 transition-colors w-fit cursor-pointer"
					>
						<BsArrowLeft className="w-3.5 h-3.5" />
						Volver
					</button>

					{/* Title block */}
					<div className="flex flex-col gap-2">
						<p
							className="text-[10px] font-semibold uppercase tracking-[0.3em]"
							style={{
								color: "var(--color-second)",
								fontFamily: "'Cinzel', serif",
							}}
						>
							Mi historial
						</p>

						<div className="flex items-end gap-4">
							<h1
								className="text-4xl font-light tracking-tight text-first leading-none"
								style={{ fontFamily: "'Cormorant Garamond', serif" }}
							>
								Mis órdenes
							</h1>

							{!loading && orders.length > 0 && (
								<span
									className="mb-1 text-sm font-light"
									style={{
										fontFamily: "'Cormorant Garamond', serif",
										fontStyle: "italic",
										color:
											"color-mix(in srgb, var(--color-first) 35%, transparent)",
									}}
								>
									{orders.length} {orders.length === 1 ? "orden" : "órdenes"}
								</span>
							)}
						</div>

						{/* Decorative line */}
						<div
							className="mt-1 h-px w-24"
							style={{
								background:
									"linear-gradient(to right, var(--color-second), transparent)",
								opacity: 0.5,
							}}
						/>
					</div>
				</div>

				{/* ── Empty state (no orders yet) ── */}
				{!loading && orders.length === 0 ? (
					<div
						className="flex flex-col items-center justify-center gap-8 py-24 px-4"
						style={{ animation: "fadeUp 0.6s ease both" }}
					>
						{/* Ornamental icon */}
						<div className="relative flex items-center justify-center">
							<div
								className="absolute w-28 h-28 rounded-full border"
								style={{
									borderColor:
										"color-mix(in srgb, var(--color-second) 15%, transparent)",
									animation: "heroRotateSlow 20s linear infinite",
								}}
							/>
							<div
								className="absolute w-20 h-20 rounded-full border border-dashed"
								style={{
									borderColor:
										"color-mix(in srgb, var(--color-first) 8%, transparent)",
									animation: "heroRotateSlow 14s linear infinite reverse",
								}}
							/>
							<div
								className="w-14 h-14 rounded-full flex items-center justify-center"
								style={{
									background:
										"color-mix(in srgb, var(--color-second) 6%, transparent)",
									border:
										"1px solid color-mix(in srgb, var(--color-second) 18%, transparent)",
								}}
							>
								<BsReceipt
									className="w-5 h-5"
									style={{ color: "var(--color-second)", opacity: 0.7 }}
								/>
							</div>
						</div>

						{/* Text */}
						<div className="flex flex-col items-center gap-3 text-center">
							<h2
								className="text-3xl font-light tracking-wide text-first"
								style={{ fontFamily: "'Cormorant Garamond', serif" }}
							>
								Sin órdenes aún
							</h2>
							<p
								className="text-sm font-light max-w-xs leading-relaxed"
								style={{
									fontFamily: "'Cormorant Garamond', serif",
									fontSize: "1rem",
									fontStyle: "italic",
									color:
										"color-mix(in srgb, var(--color-first) 40%, transparent)",
								}}
							>
								Cuando realices tu primera compra, aparecerá aquí con todos sus
								detalles.
							</p>
						</div>

						<Button
							variant="outline"
							size="md"
							rounded
							onClick={() => navigate("/")}
							icon={<BsArrowLeft />}
						>
							Explorar catálogo
						</Button>
					</div>
				) : (
					/* ── Order list ── */
					<OrderList orders={orders} loading={loading} />
				)}
			</div>
		</div>
	);
};

export default OrdersView;
