import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import { useCart } from '../context/CartContext';
import {
    Minus,
    Plus,
    Trash2,
    ArrowRight,
    Sparkles,
    ShieldCheck,
    Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@shared/components/ui/Toast';
import { applyCloudinaryTransform } from '@/core/utils/imageUtils';

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { showToast } = useToast();
    const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
    const [emptyBoxData, setEmptyBoxData] = useState(null);

    // Dynamically load empty-box Lottie when cart is empty
    useEffect(() => {
        if (cart.length === 0) {
            import('../../../assets/lottie/Empty box.json')
                .then((m) => setEmptyBoxData(m.default))
                .catch(() => {});
        }
    }, [cart.length === 0]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleRemove = (id, name, variantSku = "") => {
        removeFromCart(id, variantSku);
        showToast(`${name} removed from cart`, 'info');
    };

    return (
        <div className="min-h-screen w-full bg-[#F8FAFC] py-6 md:py-8 lg:py-10 pb-24">
            <div className="mx-auto w-full max-w-[1440px] px-4 md:px-8 lg:px-12">
                {cart.length > 0 ? (
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_26rem]">
                        <section className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-lg md:text-xl font-bold text-[#172033] tracking-tight">
                                    Your Cart Items
                                </h2>
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#64748B] border border-[#E2E8F0]">
                                    {itemCount} items
                                </span>
                            </div>

                            <div className="space-y-3">
                                {cart.map((item) => (
                                    <article
                                        key={`${item.id}::${String(item.variantSku || "").trim()}`}
                                        className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs transition-all hover:shadow-xs"
                                    >
                                        <div className="flex gap-4">
                                            <div className="h-20 w-20 md:h-24 md:w-24 flex-shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100 p-1">
                                                <img
                                                    src={applyCloudinaryTransform(item.image)}
                                                    alt={item.name}
                                                    loading="lazy"
                                                    className="h-full w-full object-cover rounded-lg"
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1 flex flex-col justify-between">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <span className="inline-flex rounded-md bg-[#EFF6FF] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#123B8E]">
                                                            {item.category || "Item"}
                                                        </span>
                                                        <h3 className="mt-1 truncate text-sm md:text-base font-bold text-[#172033]">
                                                            {item.name}
                                                        </h3>
                                                        <p className="text-xs font-medium text-[#64748B]">
                                                            {item.weight || "1 unit"}
                                                        </p>
                                                    </div>

                                                    <button
                                                        onClick={() => handleRemove(item.id, item.name, item.variantSku)}
                                                        className="rounded-full border border-[#E2E8F0] bg-white p-1.5 text-[#64748B] transition-colors hover:border-red-200 hover:text-[#E53935]"
                                                        aria-label={`Remove ${item.name}`}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                                <div className="mt-3 flex items-center justify-between">
                                                    <div className="text-base font-bold text-[#172033]">
                                                        ₹{item.price * item.quantity}
                                                    </div>

                                                    <div className="inline-flex items-center gap-2 rounded-xl border border-[#123B8E] bg-[#EFF6FF] px-2 py-0.5 shadow-2xs">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, -1, item.variantSku)}
                                                            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#123B8E] hover:opacity-75 transition-all disabled:cursor-not-allowed disabled:opacity-30"
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <Minus size={14} strokeWidth={3} />
                                                        </button>
                                                        <span className="min-w-[20px] text-center text-sm font-extrabold text-[#123B8E]">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, 1, item.variantSku)}
                                                            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#123B8E] hover:opacity-75 transition-all"
                                                        >
                                                            <Plus size={14} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            <div className="flex items-center justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs">
                                <Link
                                    to="/categories"
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#123B8E] hover:underline"
                                >
                                    Continue Shopping
                                    <ArrowRight size={14} />
                                </Link>
                                <button
                                    onClick={clearCart}
                                    className="text-xs font-bold text-[#64748B] hover:text-[#E53935] transition-colors"
                                >
                                    Clear Cart
                                </button>
                            </div>
                        </section>

                        <aside className="lg:sticky lg:top-24 h-fit">
                            <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm space-y-4">
                                <div className="border-b border-[#E2E8F0] pb-3">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#123B8E] uppercase tracking-wider mb-1">
                                        <ShieldCheck size={14} />
                                        Secure Summary
                                    </div>
                                    <h2 className="text-lg font-bold text-[#172033]">
                                        Order Summary
                                    </h2>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-[#64748B]">
                                        <span>Subtotal</span>
                                        <span className="font-bold text-[#172033]">₹{cartTotal}</span>
                                    </div>
                                    <div className="flex justify-between text-[#64748B]">
                                        <span>Delivery Fee</span>
                                        <span className="font-bold text-[#16A34A]">FREE</span>
                                    </div>
                                    <div className="border-t border-[#E2E8F0] pt-3 flex items-center justify-between">
                                        <span className="font-bold text-[#172033]">Total Amount</span>
                                        <span className="text-2xl font-black text-[#123B8E]">₹{cartTotal}</span>
                                    </div>
                                </div>

                                <Link to="/checkout" className="block pt-2">
                                    <Button className="h-12 w-full rounded-xl bg-[#123B8E] text-white hover:bg-[#1976D2] text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95">
                                        Proceed to Checkout <ArrowRight size={16} />
                                    </Button>
                                </Link>

                                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-wider text-[#64748B] pt-2 border-t border-[#E2E8F0]">
                                    <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 flex items-center gap-2">
                                        <Truck size={16} className="text-[#16A34A]" />
                                        <span>Fast delivery</span>
                                    </div>
                                    <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 flex items-center gap-2">
                                        <ShieldCheck size={16} className="text-[#123B8E]" />
                                        <span>Secure payment</span>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                ) : (
                    <div className="mx-auto max-w-lg rounded-3xl border border-[#E2E8F0] bg-white p-8 shadow-sm text-center my-8">
                        <div className="mx-auto mb-6 flex h-36 w-36 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#123B8E] shadow-2xs">
                            {emptyBoxData ? (
                                <Lottie animationData={emptyBoxData} loop className="h-32 w-32" />
                            ) : (
                                <Sparkles size={48} />
                            )}
                        </div>

                        <h2 className="text-2xl font-bold tracking-tight text-[#172033] mb-2">
                            Your cart is empty
                        </h2>
                        <p className="text-sm leading-relaxed text-[#64748B] mb-6 max-w-sm mx-auto">
                            Let's fill it with fresh essentials, daily favorites, and everything you need today.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link
                                to="/"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#123B8E] hover:bg-[#1976D2] px-7 py-3 text-sm font-bold text-white shadow-sm transition-all active:scale-95"
                            >
                                Start Shopping
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
