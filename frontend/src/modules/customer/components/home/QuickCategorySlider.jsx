import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { applyCloudinaryTransform } from "@/core/utils/imageUtils";

const QuickCategorySlider = ({
  categories = [],
  selectedCategoryId,
  onCategoryClick,
  onSeeAll,
}) => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleSeeAll = () => {
    if (typeof onSeeAll === "function") {
      onSeeAll();
    } else {
      navigate("/category/all");
    }
  };

  if (!categories || categories.length === 0) return null;

  return (
    <div className="w-full my-4 px-4 md:px-8 lg:px-[50px] relative z-20">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-base sm:text-lg font-black text-[#172033] tracking-tight leading-none drop-shadow-2xs">
          Quick Categories
        </h2>
        <button
          onClick={handleSeeAll}
          className="text-xs font-bold text-[#123B8E] hover:text-[#1976D2] bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/70 shadow-2xs hover:underline flex items-center gap-0.5 cursor-pointer transition-colors active:scale-95">
          See all
          <ChevronRight size={14} className="stroke-[2.5]" />
        </button>
      </div>

      <div className="relative">
        {/* Left Desktop Scroll Arrow */}
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll Left"
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-30 hidden md:flex h-9 w-9 bg-white/95 backdrop-blur-sm shadow-lg rounded-full items-center justify-center border border-slate-200 text-[#123B8E] hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer">
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>

        {/* Single Row Horizontal Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex items-start gap-3 sm:gap-4 md:gap-5 overflow-x-auto no-scrollbar scroll-smooth snap-x py-1.5 px-0.5">
          {categories.map((cat) => {
            const isSelected = selectedCategoryId && (selectedCategoryId === cat.id || selectedCategoryId === cat._id);

            return (
              <div
                key={cat.id || cat._id}
                onClick={() => onCategoryClick && onCategoryClick(cat.id || cat._id)}
                className="group flex flex-col items-center w-[74px] sm:w-[84px] md:w-[94px] shrink-0 snap-start cursor-pointer active:scale-95 select-none">
                {/* Full Container Image Tile */}
                <div
                  className={`w-[70px] h-[70px] sm:w-[78px] sm:h-[78px] md:w-[86px] md:h-[86px] rounded-2xl md:rounded-3xl overflow-hidden shadow-md border-2 transition-all duration-300 relative bg-white shrink-0 ${
                    isSelected
                      ? "border-[#123B8E] ring-4 ring-[#123B8E]/30 scale-105 shadow-xl"
                      : "border-white/90 hover:border-white hover:scale-105 hover:shadow-lg"
                  }`}>
                  <img
                    src={applyCloudinaryTransform(cat.image, "f_auto,q_auto,w_250")}
                    alt={cat.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Category Label */}
                <span className="block text-[11px] sm:text-xs font-bold text-[#172033] text-center leading-snug line-clamp-2 w-full mt-1.5 drop-shadow-2xs group-hover:text-[#123B8E] transition-colors">
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Desktop Scroll Arrow */}
        <button
          onClick={() => scroll("right")}
          aria-label="Scroll Right"
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-30 hidden md:flex h-9 w-9 bg-white/95 backdrop-blur-sm shadow-lg rounded-full items-center justify-center border border-slate-200 text-[#123B8E] hover:bg-white hover:scale-105 active:scale-95 transition-all cursor-pointer">
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default React.memo(QuickCategorySlider);
