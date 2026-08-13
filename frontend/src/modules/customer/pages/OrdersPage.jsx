import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, ChevronRight, Clock, CheckCircle, ChevronLeft } from 'lucide-react';
import LottieLoader from '@/shared/components/ui/LottieLoader';
import { customerApi } from '../services/customerApi';
import { getOrderStatusLabel, getLegacyStatusFromOrder } from '@/shared/utils/orderStatus';
import { applyCloudinaryTransform } from '@/core/utils/imageUtils';

const OrdersPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await customerApi.getMyOrders();
                // Backend uses handleResponse():
                // - arrays => { results: [...] }
                // - objects => { result: { items: [...] } }
                const payload = response?.data;
                const items =
                    payload?.result?.items ||
                    payload?.results ||
                    [];
                setOrders(Array.isArray(items) ? items : []);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
                const apiMessage = error?.response?.data?.message;
                // Orders page is a primary screen; surface failures instead of silently showing empty state.
                if (apiMessage) {
                    console.warn("[OrdersPage] API error:", apiMessage);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return <LottieLoader fullScreen />;
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24">
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 pt-3 pb-3 border-b border-[#E2E8F0] mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors -ml-1 text-[#172033]"
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <h1 className="text-lg font-bold text-[#172033] tracking-tight">My Orders</h1>
                </div>
            </div>

            <div className="space-y-3 px-4 pb-2 max-w-3xl mx-auto">
                {orders.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8 flex flex-col items-center justify-center text-center my-6">
                        <div className="w-16 h-16 rounded-full bg-[#EFF6FF] text-[#123B8E] flex items-center justify-center mb-4 shadow-2xs">
                            <Package size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-[#172033] mb-1">No orders yet</h3>
                        <p className="text-[#64748B] text-sm mb-6 max-w-[280px] leading-relaxed">
                            Your next order could be just a few taps away.
                        </p>
                        <Link to="/" className="bg-[#123B8E] hover:bg-[#1976D2] text-white px-7 py-3 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    orders.map((order) => {
                        const legacy = getLegacyStatusFromOrder(order);
                        let badgeStyle = "bg-[#EFF6FF] text-[#123B8E] border-[#BFDBFE]";
                        let iconColor = "text-[#123B8E]";

                        if (legacy === 'delivered' || legacy === 'out_for_delivery') {
                            badgeStyle = "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]";
                            iconColor = "text-[#16A34A]";
                        } else if (legacy === 'cancelled') {
                            badgeStyle = "bg-[#FEF2F2] text-[#E53935] border-[#FECACA]";
                            iconColor = "text-[#E53935]";
                        } else if (legacy === 'packing' || legacy === 'preparing') {
                            badgeStyle = "bg-[#FEFCE8] text-[#9A3412] border-[#FDE047]";
                            iconColor = "text-[#F4B400]";
                        }

                        return (
                        <Link
                            to={`/orders/${order.orderId}`}
                            key={order._id}
                            className="block bg-white rounded-2xl p-4 shadow-2xs border border-[#E2E8F0] active:scale-[0.99] transition-all cursor-pointer hover:border-slate-300"
                        >
                            <div className="flex justify-between items-start gap-3 mb-3">
                                <div className="flex gap-3 flex-1 min-w-0">
                                    <div className="h-12 w-12 rounded-xl overflow-hidden flex items-center justify-center bg-slate-50 border border-slate-100 shrink-0">
                                        {order.items[0]?.image ? (
                                            <img
                                                src={applyCloudinaryTransform(order.items[0].image)}
                                                alt={order.items[0]?.name || 'Order thumbnail'}
                                                loading="lazy"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Package size={22} className="text-[#64748B]" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-[#172033] text-sm tracking-tight leading-snug">
                                            Order #{order.orderId.slice(-6)}
                                        </h3>
                                        <p className="mt-0.5 text-[11px] text-[#64748B] font-medium leading-tight">
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                            })}{' '}
                                            <span className="mx-1 text-slate-300">•</span>
                                            {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeStyle}`}
                                    >
                                        <CheckCircle size={10} className={iconColor} />
                                        <span>{getOrderStatusLabel(order).toUpperCase()}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-[#E2E8F0] pt-2.5 flex justify-between items-center gap-3">
                                <div className="text-[11px] text-[#64748B] font-medium truncate max-w-[220px]">
                                    {order.items.map((i) => i.name).join(', ')}
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-[11px] font-medium text-[#64748B]">Total</span>
                                    <span className="text-sm font-bold text-[#172033]">
                                    ₹{order.pricing?.total || 0}
                                    </span>
                                    <ChevronRight size={16} className="text-[#64748B]" />
                                </div>
                            </div>
                        </Link>
                    );
                    })
                )}
            </div>
        </div>
    );
};

export default OrdersPage;

