import React from 'react';
import { Eye, ShoppingCart, Star, Heart } from 'lucide-react';
import { Product } from '../types';
import { formatBDT } from '../utils';

interface ProductCardProps {
  product: Product;
  language: 'en' | 'bn';
  onAddToCart: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onSelectProduct?: (p: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  key?: React.Key | string | number;
}

export default function ProductCard({
  product,
  language,
  onAddToCart,
  onQuickView,
  onSelectProduct,
  isWishlisted,
  onToggleWishlist,
}: ProductCardProps) {
  const t = {
    quickView: language === 'en' ? 'Quick View' : 'কুইক ভিউ',
    addCart: language === 'en' ? 'Add To Cart' : 'কার্টে রাখুন',
    outStock: language === 'en' ? 'Out of Stock' : 'স্টক নেই',
    savePrice: language === 'en' ? 'OFF' : 'ছাড়'
  };

  const [isBeating, setIsBeating] = React.useState(false);
  const prevWishlistRef = React.useRef(isWishlisted);

  React.useEffect(() => {
    if (isWishlisted && !prevWishlistRef.current) {
      setIsBeating(true);
      const timer = setTimeout(() => setIsBeating(false), 800);
      return () => clearTimeout(timer);
    }
    prevWishlistRef.current = isWishlisted;
  }, [isWishlisted]);

  const isOutOfStock = product.stock <= 0;

  return (
    <div id={`product-card-${product.id}`} className="h-full">
      {/* Vertical Card */}
      <div className="flex bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 flex-col justify-between overflow-hidden group h-full">
        {/* Upper Media Section in 4:4 aspect ratio */}
        <div className="relative aspect-square bg-slate-50 overflow-hidden w-full select-none">
          {/* Compact Elegant Badges aligned at the bottom-left of image strip */}
          <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 bg-slate-950/80 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-white/10 pointer-events-none">
            {product.discount > 0 && (
              <span className="text-amber-400 font-sans text-[8px] md:text-[9.5px] font-black tracking-tight">
                -{product.discount}%
              </span>
            )}
            {product.discount > 0 && product.isFlashSale && <span className="text-white/20 text-[8px] font-mono">|</span>}
            {product.isFlashSale && (
              <span className="text-emerald-400 font-sans text-[8px] md:text-[9.5px] font-black uppercase tracking-wider flex items-center gap-0.5">
                ⚡ FLASH
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 z-10">
            {/* Wishlist Button */}
            <button
              id={`wishlist-btn-desktop-${product.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product);
              }}
              className={`p-1.5 rounded-full shadow-sm backdrop-blur-md transition active:scale-90 ${
                isWishlisted 
                  ? 'bg-rose-500 text-white hover:bg-rose-600' 
                  : 'bg-white/80 text-slate-500 hover:text-rose-500 hover:bg-white'
              } ${isBeating ? 'animate-wishlist-heartbeat' : ''}`}
            >
              <Heart className={`w-3.5 h-3.5 fill-current ${isBeating ? 'scale-105' : ''}`} />
            </button>
          </div>

          {/* Actual Image */}
          <div 
            onClick={() => onSelectProduct ? onSelectProduct(product) : onQuickView(product)}
            className="w-full h-full cursor-pointer"
          >
            <img
              src={product.image}
              alt={language === 'en' ? product.title : product.banglaTitle}
              className="w-full h-full object-cover object-center group-hover:scale-108 transition-all duration-500"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Floating Quick Action Overlay */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <button
              id={`quick-view-btn-desktop-${product.id}`}
              onClick={() => onQuickView(product)}
              className="bg-white hover:bg-[#0F172A] hover:text-white text-[#0F172A] font-sans text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-lg active:scale-95 transition-all duration-200"
            >
              <Eye className="w-4 h-4" />
              <span>{t.quickView}</span>
            </button>
          </div>
        </div>

        {/* Product Information */}
        <div className="p-2.5 md:p-4 flex flex-col flex-1 justify-between gap-2.5 md:gap-3">
          <div>
            {/* Brand & Stars */}
            <div className="flex items-center justify-between gap-1.5 mb-0.5">
              <span className="text-[9px] md:text-[10px] uppercase tracking-wider font-mono text-slate-400 font-bold truncate max-w-[65px]">
                {product.brand}
              </span>
              <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                <Star className="w-3 h-3 md:w-3.5 md:h-3.5 fill-current" />
                <span className="text-[9px] md:text-[10px] font-bold text-slate-600 font-sans">{product.rating}</span>
              </div>
            </div>

            {/* Title */}
            <h4 
              onClick={() => onSelectProduct ? onSelectProduct(product) : onQuickView(product)}
              className="text-slate-800 font-sans font-bold text-[11px] md:text-sm line-clamp-2 hover:text-[#16A34A] cursor-pointer transition h-8 md:h-10 mt-1 leading-snug"
            >
              {language === 'en' ? product.title : product.banglaTitle}
            </h4>
          </div>

          {/* Pricing structure & Add to Cart button */}
          <div className="mt-1 md:mt-2 pt-1.5 md:pt-2 border-t border-slate-50">
            <div className="flex items-baseline flex-wrap gap-1 mb-2">
              <span className="text-xs md:text-base font-mono font-extrabold text-[#0F172A]">
                {formatBDT(product.price, language)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-slate-400 font-mono text-[9px] md:text-xs line-through">
                  {formatBDT(product.originalPrice, language)}
                </span>
              )}
            </div>

            {/* Add to Cart button */}
            <button
              id={`add-cart-btn-desktop-${product.id}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!isOutOfStock) {
                  onAddToCart(product);
                }
              }}
              disabled={isOutOfStock}
              className={`w-full py-1.5 md:py-2.5 rounded-xl font-sans text-[10px] md:text-xs font-black transition flex items-center justify-center gap-1.5 ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-455 border border-slate-200 cursor-not-allowed'
                  : 'bg-emerald-50 text-[#16A34A] border-emerald-200 hover:bg-[#16A34A] hover:text-white hover:shadow-md'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
              <span>{isOutOfStock ? t.outStock : t.addCart}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
