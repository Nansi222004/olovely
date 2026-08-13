import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Lottie from "lottie-react";
import ProductCard from "../shared/ProductCard";
import {
  getBackgroundColorByValue,
  getBackgroundGradientByValue,
} from "@/shared/constants/offerSectionOptions";
import { applyCloudinaryTransform } from "@/core/utils/imageUtils";

const OfferSections = ({ sections, allProducts = [], categoryTheme }) => {
  if (!sections || sections.length === 0) return null;

  return (
    <div className="w-full px-0 pt-0 pb-2 md:pb-4">
      {[...sections]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((section) => {
          const bgColor = categoryTheme?.primary || getBackgroundColorByValue(section.backgroundColor);
          let sectionProducts = (section.productIds || [])
            .filter((p) => typeof p === "object" && p !== null)
            .map((p) => ({
              ...p,
              id: p._id || p.id,
              _id: p._id || p.id,
              name: p.name,
              image: p.mainImage || p.image || "",
              price: p.salePrice ?? p.price,
              originalPrice: p.price ?? p.salePrice,
              weight: p.weight,
              deliveryTime: p.deliveryTime,
              variants: p.variants || [],
              shopName: p.sellerId?.shopName || p.shopName || "Unknown",
            }));

          // Fallback: If section products unpopulated or empty, match products by category or use allProducts
          if (sectionProducts.length === 0 && allProducts.length > 0) {
            const catIds = (section.categoryIds || []).map((c) => (typeof c === "object" ? c._id : c)).filter(Boolean);
            const matching = catIds.length > 0
              ? allProducts.filter((p) => catIds.includes(p.categoryId?._id || p.categoryId))
              : allProducts;

            sectionProducts = (matching.length > 0 ? matching : allProducts).slice(0, 10).map((p) => ({
              ...p,
              id: p._id || p.id,
              _id: p._id || p.id,
              name: p.name,
              image: p.mainImage || p.image || "",
              price: p.salePrice ?? p.price,
              originalPrice: p.price ?? p.salePrice,
              weight: p.weight,
              deliveryTime: p.deliveryTime,
              variants: p.variants || [],
              shopName: p.sellerId?.shopName || p.shopName || "Unknown",
            }));
          }

          const cardHeaderGradient = categoryTheme?.cardHeaderGradient || categoryTheme?.headerGradient || getBackgroundGradientByValue(section.backgroundColor);
          const textColorClass = categoryTheme?.textColor === "#172033" ? "text-[#172033]" : "text-white";
          const subTextColorClass = categoryTheme?.mutedTextColor || (categoryTheme?.isLight ? "text-[#172033]/80" : "text-white/90");

          return (
            <motion.div
              key={section._id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.4 }}
              className="mb-6 rounded-3xl overflow-hidden shadow-lg bg-white/85 backdrop-blur-sm border border-white/60 mx-4 md:mx-8 lg:mx-[50px]">
              <div
                className="relative flex items-center justify-between px-5 md:px-8 py-5 md:py-6 transition-all duration-500"
                style={{
                  backgroundColor: bgColor,
                  backgroundImage: cardHeaderGradient,
                }}>
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="absolute -top-10 -left-10 w-40 h-40 md:w-56 md:h-56 bg-white/20 rounded-full blur-3xl" />
                  <div className="absolute -bottom-10 right-0 w-44 h-44 bg-white/10 rounded-full blur-3xl" />
                </div>
                <div className="flex-1 pr-4">
                  <p className={`text-[10px] md:text-[11px] font-bold uppercase tracking-wider ${subTextColorClass} mb-1 drop-shadow-2xs`}>
                    Trending right now
                  </p>
                  <h3 className={`text-xl md:text-2xl font-black tracking-tight leading-tight drop-shadow-sm ${textColorClass}`}>
                    {section.title}
                  </h3>
                  {((section.categoryIds || [])
                    .map((c) => (typeof c === "object" && c?.name ? c.name : null))
                    .filter(Boolean)
                    .join(", ") || section.categoryId?.name) && (
                    <p className={`text-[11px] md:text-xs font-semibold mt-1 drop-shadow-2xs ${subTextColorClass}`}>
                      {(section.categoryIds || [])
                        .map((c) => (typeof c === "object" && c?.name ? c.name : null))
                        .filter(Boolean)
                        .join(", ") || section.categoryId?.name}
                    </p>
                  )}
                </div>
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex-shrink-0 shadow-md border border-white/40 overflow-hidden relative bg-white transition-transform hover:-translate-y-1 hover:rotate-[-2deg] hover:scale-105">
                  {sectionProducts[0]?.image ? (
                    <img
                      src={applyCloudinaryTransform(sectionProducts[0].image, "f_auto,q_auto,w_250")}
                      alt={section.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-amber-400 to-orange-500" />
                  )}

                  {sectionProducts.length > 0 && (
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white tracking-wide flex items-center gap-1 z-10 shadow-xs">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
                      {sectionProducts.length} items
                    </div>
                  )}
                </div>
              </div>
              <div className="px-4 pt-4 md:px-5 md:pt-5 pb-1">
                <div className="flex overflow-x-auto gap-3 md:gap-4 pb-0 no-scrollbar snap-x snap-mandatory">
                  {sectionProducts.length === 0 ? (
                    <div className="w-full py-10 flex flex-col items-center justify-center text-center">
                        <div className="w-32 h-32 mb-3 rounded-2xl overflow-hidden">
                          <video 
                              src="/coming-soon-animation-gif-download-10839535.mp4" 
                              autoPlay 
                              loop 
                              muted 
                              playsInline 
                              className="w-full h-full object-contain"
                          />
                        </div>
                      <p className="text-sm md:text-base text-slate-400 font-bold">
                        Looking for the best items in this category...
                      </p>
                    </div>
                  ) : (
                    sectionProducts.map((product) => (
                      <div key={product.id} className="w-[126px] sm:w-[136px] md:w-[148px] flex-shrink-0 snap-start">
                        <ProductCard
                          product={product}
                          className="bg-white border border-slate-100 shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                          compact
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
    </div>
  );
};

export default React.memo(OfferSections);
