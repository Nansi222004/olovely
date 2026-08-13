import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Heart, Search, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '@shared/components/ui/Toast';
import { cn } from '@/lib/utils';
import { applyCloudinaryTransform } from '@/core/utils/imageUtils';

import ProductCard from '../components/shared/ProductCard';
import ProductDetailSheet from '../components/shared/ProductDetailSheet';
import { useProductDetail } from '../context/ProductDetailContext';
import { customerApi } from '../services/customerApi';
import MiniCart from '../components/shared/MiniCart';
import SectionRenderer from "../components/experience/SectionRenderer";
import { useLocation as useAppLocation } from '../context/LocationContext';
import { useSettings } from '@core/context/SettingsContext';
import Lottie from 'lottie-react';
import SEO from '@core/components/SEO';

const CategoryProductsPage = () => {
    const { categoryName: catId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const sellerId = searchParams.get("sellerId");
    const { currentLocation } = useAppLocation();
    const { settings } = useSettings();
    const initialSubcategoryId = location.state?.activeSubcategoryId || 'all';
    const { isOpen: isProductDetailOpen } = useProductDetail();
    const [selectedSubCategory, setSelectedSubCategory] = useState(initialSubcategoryId);
    const [category, setCategory] = useState(null);
    const [subCategories, setSubCategories] = useState([{ id: 'all', name: 'All', icon: 'https://cdn-icons-png.flaticon.com/128/2321/2321831.png' }]);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);


    const fetchData = async () => {
        setIsLoading(true);
        try {
            const hasValidLocation =
                Number.isFinite(currentLocation?.latitude) &&
                Number.isFinite(currentLocation?.longitude);

            // Fetch products and categories in parallel instead of sequentially
            const sort = searchParams.get("sort");
            const type = searchParams.get("type");
            const productParams = {
                lat: currentLocation.latitude,
                lng: currentLocation.longitude,
                limit: 1000, // Fetch up to max limit of products
            };
            if (type === "header") {
                productParams.headerId = catId;
            } else if (catId !== "all") {
                productParams.categoryId = catId;
            }
            if (sellerId) {
                productParams.sellerId = sellerId;
            }
            if (sort) {
                productParams.sort = sort;
            }

            const [prodRes, catRes] = await Promise.all([
                hasValidLocation
                    ? customerApi.getProducts(productParams)
                    : Promise.resolve({ data: { success: true, result: { items: [] } } }),
                customerApi.getCategories({ tree: true }),
            ]);

            if (prodRes.data.success) {
                const rawResult = prodRes.data.result;
                const dbProds = Array.isArray(prodRes.data.results)
                    ? prodRes.data.results
                    : Array.isArray(rawResult?.items)
                        ? rawResult.items
                        : Array.isArray(rawResult)
                            ? rawResult
                            : [];

                const formattedProds = dbProds.map(p => ({
                    ...p,
                    id: p._id,
                    image:
                        p.mainImage ||
                        p.image ||
                        "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=400&h=400",
                    price: p.salePrice || p.price,
                    originalPrice: p.price,
                    weight: p.weight || "1 unit",
                    deliveryTime: p.sellerId?.estimatedDeliveryTime || "8-15 mins",
                    variants: p.variants || [],
                    shopName: p.sellerId?.shopName || p.shopName || "Unknown"
                }));
                setProducts(Array.isArray(formattedProds) ? formattedProds : []);
            } else {
                setProducts([]);
            }

            if (catRes.data.success) {
                const tree = catRes.data.results || catRes.data.result || [];
                const type = searchParams.get("type");
                let currentCat = null;

                if (catId === "all") {
                    setCategory({ name: "All Products", _id: "all", headerColor: "#123B8E" });
                    const allCategories = [];
                    for (const header of tree) {
                        for (const child of (header.children || [])) {
                            allCategories.push({
                                id: child._id,
                                name: child.name,
                                icon: child.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200"
                            });
                        }
                    }
                    setSubCategories([
                        { id: "all", name: "All", icon: "" },
                        ...allCategories
                    ]);
                } else if (type === "header") {
                    currentCat = tree.find(h => h._id === catId);
                } else {
                    for (const header of tree) {
                        const found = (header.children || []).find(c => c._id === catId);
                        if (found) {
                            currentCat = found;
                            break;
                        }
                    }
                }

                if (currentCat && catId !== "all") {
                    setCategory(currentCat);
                    const subs = (currentCat.children || []).map(s => ({
                        id: s._id,
                        name: s.name,
                        icon: s.image || ""
                    }));
                    setSubCategories([
                        { id: "all", name: "All", icon: "" },
                        ...subs
                    ]);
                }
            }
        } catch (error) {
            console.error("Error fetching category data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        setSelectedSubCategory(location.state?.activeSubcategoryId || 'all');
    }, [catId, location.state?.activeSubcategoryId, currentLocation?.latitude, currentLocation?.longitude, sellerId, searchParams]);

    const safeProducts = Array.isArray(products) ? products : [];

    const type = searchParams.get("type");
    const filteredProducts = safeProducts.filter(p => {
        if (selectedSubCategory === 'all') return true;
        if (type === "header") {
            return p.categoryId?._id === selectedSubCategory || p.categoryId === selectedSubCategory;
        } else {
            return p.subcategoryId?._id === selectedSubCategory || p.subcategoryId === selectedSubCategory;
        }
    });

    const productsById = React.useMemo(() => {
        const map = {};
        safeProducts.forEach(p => {
            map[p._id || p.id] = p;
        });
        return map;
    }, [safeProducts]);

    return (
        <div className="flex flex-col min-h-screen bg-[#F8FAFC] relative font-sans">
            <SEO
                title={category?.name || "Category Products"}
                description={`Browse products in ${category?.name || "this category"}`}
            />
            {/* Header */}
            <header className={cn(
                "sticky top-0 z-50 bg-[#123B8E] border-b border-[#0B255C] px-4 py-3 flex items-center justify-between shadow-md text-white transition-colors duration-300",
                isProductDetailOpen && "hidden md:flex"
            )}>
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1.5 hover:bg-white/10 active:scale-95 rounded-full transition-all text-white cursor-pointer"
                        aria-label="Go Back"
                    >
                        <ChevronLeft size={22} strokeWidth={2.5} />
                    </button>
                    <h1 className="text-base sm:text-lg font-black tracking-tight text-white capitalize">
                        {category?.name || (catId === "all" ? "All Products" : catId)}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => navigate("/search")} 
                        className="p-1.5 hover:bg-white/10 rounded-full transition-all text-white cursor-pointer"
                        aria-label="Search"
                    >
                        <Search size={19} strokeWidth={2.5} />
                    </button>
                    <span className="text-[11px] sm:text-xs font-black bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full text-white tracking-wide">
                        {filteredProducts.length} Products
                    </span>
                </div>
            </header>

            <div className="flex flex-1 relative items-start">
                {(safeProducts.length === 0 && !isLoading) ? (
                    <div className="w-full flex-1 py-16 px-6 flex flex-col items-center justify-center text-center">
                        <div className="w-48 h-48 mb-4 rounded-3xl overflow-hidden">
                            <video 
                                src="/coming-soon-animation-gif-download-10839535.mp4" 
                                autoPlay 
                                loop 
                                muted 
                                playsInline 
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <h3 className="text-xl font-bold text-[#172033] tracking-tight mb-2 uppercase">
                            No <span className="text-[#123B8E]">Products Found</span>
                        </h3>
                        <p className="text-[#64748B] font-medium text-sm max-w-[280px] mb-6 leading-relaxed">
                            We couldn't find any products in this category at your current location. Check back soon!
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-8 py-3 bg-[#123B8E] hover:bg-[#1976D2] text-white rounded-xl font-bold text-sm uppercase tracking-wider active:scale-95 transition-all shadow-sm"
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Sidebar */}
                        <aside className="w-[82px] sm:w-24 md:w-64 border-r border-[#E2E8F0] flex flex-col bg-white overflow-y-auto hide-scrollbar sticky top-[60px] h-[calc(100vh-60px)] pb-32 flex-shrink-0 shadow-2xs">
                            {subCategories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedSubCategory(cat.id)}
                                    className={cn(
                                        "flex flex-col md:flex-row items-center py-3 px-1 md:px-4 gap-1.5 md:gap-3 transition-all relative border-l-4 cursor-pointer active:scale-95 select-none",
                                        selectedSubCategory === cat.id
                                            ? "bg-[#EFF6FF] border-[#123B8E] text-[#123B8E] font-black shadow-2xs"
                                            : "border-transparent text-[#64748B] hover:bg-slate-50"
                                    )}
                                >
                                    <div className={cn(
                                        "w-11 h-11 sm:w-12 sm:h-12 md:w-10 md:h-10 rounded-2xl flex items-center justify-center p-1 transition-all duration-200 flex-shrink-0 bg-white border shadow-2xs overflow-hidden",
                                        selectedSubCategory === cat.id ? "scale-105 border-[#123B8E] ring-2 ring-[#123B8E]/20" : "border-slate-200 opacity-90"
                                    )}>
                                        {cat.icon ? (
                                            <img src={applyCloudinaryTransform(cat.icon, "f_auto,q_auto,w_150")} alt={cat.name} loading="lazy" className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            <div className="w-full h-full bg-linear-to-br from-[#123B8E] to-[#1976D2] rounded-xl flex items-center justify-center text-white font-black text-xs">
                                                {cat.name.slice(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-[10px] md:text-xs text-center md:text-left font-bold leading-tight px-0.5 flex-1 line-clamp-2",
                                        selectedSubCategory === cat.id ? "text-[#123B8E]" : "text-[#475569]"
                                    )}>
                                        {cat.name}
                                    </span>
                                </button>
                            ))}
                        </aside>

                        {/* Content */}
                        <main className="flex-1 p-2.5 md:p-6 pb-24 bg-[#F8FAFC] space-y-4 overflow-x-hidden">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} compact={true} />
                                ))}
                            </div>
                        </main>
                    </>
                )}
            </div>

            <MiniCart />
            <ProductDetailSheet />

            <style dangerouslySetInnerHTML={{
                __html: `
                    .hide-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .hide-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}} />
        </div>
    );
};

export default CategoryProductsPage;

