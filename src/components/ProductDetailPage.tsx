import React, { useState, useRef, useEffect } from 'react';
import { Star, ShieldCheck, Heart, ShoppingCart, ArrowLeft, ArrowRight, Check, Award, Truck, ShieldAlert, Sparkles, Share2, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, RotateCcw, MessageSquare, Zap } from 'lucide-react';
import { Product } from '../types';
import { formatBDT, getCategoryVariantConfig } from '../utils';
import { allReviews } from '../data/products';

interface ProductDetailPageProps {
  product: Product;
  language: 'en' | 'bn';
  onAddToCart: (p: Product, qty: number, size?: string, color?: string) => void;
  onOrderNow: (p: Product, qty: number, size?: string, color?: string) => void;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  onNavigateHome: () => void;
  allProducts: Product[];
  onSelectProduct: (p: Product) => void;
  onNavigateToCategory: (cat: string) => void;
}

export default function ProductDetailPage({
  product,
  language,
  onAddToCart,
  onOrderNow,
  isWishlisted,
  onToggleWishlist,
  onNavigateHome,
  allProducts,
  onSelectProduct,
  onNavigateToCategory
}: ProductDetailPageProps) {
  // Heartbeat triggers
  const [isBeating, setIsBeating] = useState(false);
  const prevWishlistRef = React.useRef(isWishlisted);

  React.useEffect(() => {
    if (isWishlisted && !prevWishlistRef.current) {
      setIsBeating(true);
      const timer = setTimeout(() => setIsBeating(false), 800);
      return () => clearTimeout(timer);
    }
    prevWishlistRef.current = isWishlisted;
  }, [isWishlisted]);

  // Image gallery states
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [showShareNotification, setShowShareNotification] = useState(false);

  // Lightbox View & Zoom State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxScale, setLightboxScale] = useState(1);
  const [lightboxOffset, setLightboxOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Keyboard navigation & body scroll lock for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const imagesArr = product.images || [product.image];
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev + 1) % imagesArr.length);
        setLightboxScale(1);
        setLightboxOffset({ x: 0, y: 0 });
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev - 1 + imagesArr.length) % imagesArr.length);
        setLightboxScale(1);
        setLightboxOffset({ x: 0, y: 0 });
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, product.images, product.image]);

  // Shopping configuration states
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || '');

  // Tab views state ('details' | 'specifications' | 'reviews')
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews'>('details');

  const containerRef = useRef<HTMLDivElement>(null);

  const variantConfig = getCategoryVariantConfig(product.category);

  const t = {
    specs: language === 'en' ? 'Specifications' : 'বিস্তারিত বিবরণ',
    reviews: language === 'en' ? 'Customer Reviews' : 'গ্রাহক প্রতিক্রিয়া',
    size: variantConfig.optionLabel[language],
    color: variantConfig.colorLabel[language],
    qty: language === 'en' ? 'Quantity' : 'পরিমাণ',
    addToCart: language === 'en' ? 'Add To Cart' : 'কার্টে যোগ করুন',
    outStock: language === 'en' ? 'Out of Stock' : 'স্টক শেষ',
    allProducts: language === 'en' ? 'Back to Shop' : 'মূল শপে ফিরুন',
    breadcrumbHome: language === 'en' ? 'Home' : 'হোম',
    warrantyTitle: language === 'en' ? 'Assured Protection' : 'গ্যারান্টিড নিরাপত্তা',
    securedText: language === 'en' ? '100% Genuine product. Easy 8-hour dispatch with safe 7-day hassle-free refund.' : '১০০% আসল আমদানিকৃত পণ্য। ৮ ঘণ্টায় শিপমেন্ট সুবিধা ও ৭ দিনের নিশ্চিত ক্যাশব্যাক রিটার্ন গ্যারান্টি।',
    verifiedBuyer: language === 'en' ? 'Verified Buyer' : 'যাচাইকৃত ক্রেতা',
    ratingBreakdown: language === 'en' ? 'Rating Distribution' : 'রেটিং ডিস্ট্রিবিউশন',
    relatedTitle: language === 'en' ? 'Related Premium Products' : 'সম্পর্কিত অন্যান্য প্রিমিয়াম পণ্য',
    relatedSubtitle: language === 'en' ? 'Handpicked for your luxury lifestyle and modern daily utility needs.' : 'সেরা মানের দেশীয় ও আন্তর্জাতিক কাস্টম ক্যাটাগরি কালেকশন।',
    saving: language === 'en' ? 'SAVE' : 'ছাড়',
    totalPrice: language === 'en' ? 'Estimated Total:' : 'আনুমানিক মোট দাম:',
    stockLeft: language === 'en' ? 'Only {n} items left in Bangladesh central dispatch Hub' : 'বাংলাদেশ সেন্ট্রাল ডিসপ্যাচ হাবে মাত্র {n}টি পণ্য অবশিষ্ট আছে',
    shareText: language === 'en' ? 'Product link copied to clipboard!' : 'প্রোডাক্ট লিঙ্ক ক্লিপবোর্ডে কপি হয়েছে!'
  };

  const isOutOfStock = product.stock <= 0;

  // Zoom magnifier calculations
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    // Calculate cursor positions in percentage relative to image dimensions
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleShareProduct = () => {
    const textToCopy = `${window.location.origin}/product/${product.id}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setShowShareNotification(true);
      setTimeout(() => setShowShareNotification(false), 3000);
    });
  };

  // Lightbox Zoom & Drag Event Handlers
  const handleZoomIn = () => {
    setLightboxScale(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setLightboxScale(prev => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) {
        setLightboxOffset({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const handleResetZoom = () => {
    setLightboxScale(1);
    setLightboxOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (lightboxScale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - lightboxOffset.x, y: e.clientY - lightboxOffset.y });
  };

  const handleMouseMoveDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || lightboxScale <= 1) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setLightboxOffset({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (lightboxScale <= 1 || e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - lightboxOffset.x, y: touch.clientY - lightboxOffset.y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || lightboxScale <= 1) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    setLightboxOffset({ x: newX, y: newY });
  };

  // Find related products in the same category
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Average review values representation
  const starCounts = { 5: 85, 4: 12, 3: 2, 2: 1, 1: 0 };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-fade-in font-sans">
      {/* 1. Breadcrumbs Navigator Bar */}
      <nav id="product-breadcrumbs" className="flex items-center gap-2 text-xs md:text-sm text-slate-500 mb-8 select-none">
        <button onClick={onNavigateHome} className="hover:text-[#16A34A] font-medium transition duration-200">
          {t.breadcrumbHome}
        </button>
        <span className="text-slate-300">/</span>
        <button 
          onClick={() => {
            onNavigateToCategory(product.category);
            onNavigateHome();
          }} 
          className="hover:text-[#16A34A] font-medium capitalize transition duration-200"
        >
          {product.category}
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-slate-800 font-bold max-w-[180px] md:max-w-xs truncate">
          {language === 'en' ? product.title : product.banglaTitle}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl border border-slate-100 p-4 md:p-8 shadow-sm">
        
        {/* 2. Left Column: Image gallery and Thumbnail selector with Zoom Magnification */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* Large Image Showcase View Box */}
          <div 
            id={`lens-zoom-showcase-${product.id}`}
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onClick={() => {
              setLightboxIndex(selectedImageIndex);
              setIsLightboxOpen(true);
            }}
            className="relative aspect-square md:aspect-[4/4] bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden shadow-inner cursor-zoom-in group select-none"
          >
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 z-10 bg-amber-500 text-slate-950 font-sans text-xs font-black px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{product.discount}% {t.saving}</span>
              </span>
            )}

            {/* Target Display Image with dynamic hover scale */}
            <img
              src={product.images?.[selectedImageIndex] || product.image}
              alt={language === 'en' ? product.title : product.banglaTitle}
              style={
                isZooming
                  ? {
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transform: 'scale(2.2)',
                    }
                  : undefined
              }
              className={`w-full h-full object-cover object-center transition-transform duration-100 ease-out`}
              referrerPolicy="no-referrer"
            />

            {/* Hover magnifying indicator overlay indicator */}
            {!isZooming && (
              <div className="absolute bottom-4 right-4 bg-slate-950/70 text-white text-[10px] uppercase font-bold py-1.5 px-3 rounded-full tracking-wider opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                🔍 Hover to Zoom • Click to Expand
              </div>
            )}
          </div>

          {/* Gallery Thumbnails List Carousel Selector */}
          <div className="flex gap-3 overflow-x-auto py-1 scrollbar-hide">
            {(product.images || [product.image]).map((imgSrc, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 flex-shrink-0 relative transition shadow-sm bg-white ${
                  selectedImageIndex === idx 
                    ? 'border-[#16A34A] scale-102 shadow-emerald-100 shadow-md ring-2 ring-emerald-100' 
                    : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                <img
                  src={imgSrc}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
          </div>

          {/* Quick trust guarantee info underneath photo matrix */}
          <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-4 flex items-start gap-3 mt-2">
            <div className="p-2.5 rounded-xl bg-[#16A34A]/10 text-[#16A34A] shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-800 mb-0.5">{t.warrantyTitle}</h5>
              <p className="text-[11px] md:text-xs text-slate-500 leading-relaxed">
                {t.securedText}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Right Column: Detailed Purchase Configurations */}
        <div className="lg:col-span-6 flex flex-col justify-between pt-2">
          <div>
            {/* Header Product Status */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold tracking-wider capitalize font-mono">
                  ✨ {product.brand}
                </span>
                <span className={`text-[11px] font-bold py-1 px-2.5 rounded-lg font-sans ${isOutOfStock ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'}`}>
                  {isOutOfStock ? t.outStock : 'In Stock'}
                </span>
              </div>

              {/* Share & copylink helper */}
              <div className="relative">
                <button
                  onClick={handleShareProduct}
                  className="p-2 rounded-xl text-slate-400 hover:text-[#16A34A] hover:bg-slate-50 transition active:scale-95 border border-slate-100"
                  title="Share product link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                {showShareNotification && (
                  <div className="absolute right-0 top-11 z-20 bg-slate-900 text-white text-[10px] font-bold p-2.5 rounded-lg shadow-xl w-48 text-center animate-slide-down">
                    {t.shareText}
                  </div>
                )}
              </div>
            </div>

            {/* Product Headings Label */}
            <h1 className="text-xl md:text-3xl font-display font-bold text-slate-900 leading-tight mb-3">
              {language === 'en' ? product.title : product.banglaTitle}
            </h1>

            {/* General stars rating badge */}
            <div className="flex items-center gap-3 mb-6 select-none font-sans">
              <div className="bg-[#0F172A] text-white py-1 px-2 rounded-lg text-xs font-black flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                <span>{product.rating}</span>
              </div>
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 fill-current ${
                      i < Math.floor(product.rating) ? 'text-amber-400' : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-500 font-semibold font-sans">
                {product.reviewsCount} verified reviews and local seller approvals
              </span>
            </div>

            {/* Realtime stock dispatcher bar */}
            {!isOutOfStock && product.stock <= 10 && (
              <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3 mb-6 flex items-center gap-2 text-rose-800 text-[11px] font-semibold animate-pulse">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{t.stockLeft.replace('{n}', product.stock.toString())}</span>
              </div>
            )}

            {/* Price section block */}
            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100 flex items-center gap-6 mb-8">
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider font-extrabold mb-1">{language === 'en' ? 'Offer Price' : 'বিশেষ অফার মূল্য'}</span>
                <span className="text-3xl font-sans font-extrabold text-[#16A34A]">
                  {formatBDT(product.price, language)}
                </span>
              </div>
              {product.originalPrice > product.price && (
                <div className="flex flex-col border-l border-slate-200 pl-6">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider font-extrabold mb-1">{language === 'en' ? 'Regular Price' : 'পূর্ববর্তী সাধারণ মূল্য'}</span>
                  <span className="text-lg font-sans text-slate-400 line-through">
                    {formatBDT(product.originalPrice, language)}
                  </span>
                </div>
              )}
            </div>

            {/* Sizes Selection elements */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs uppercase tracking-wide font-black text-slate-700 mb-3 font-sans">📏 {t.size}</h4>
                <div className="flex gap-2.5 flex-wrap">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide border transition duration-250 ${
                        selectedSize === sz
                          ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                          : 'border-slate-200 text-slate-600 bg-white hover:border-slate-500'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors Selection options */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-8">
                <h4 className="text-xs uppercase tracking-wide font-black text-slate-700 mb-3 font-sans">🎨 {t.color}</h4>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((col) => (
                    <button
                      key={col.name}
                      onClick={() => setSelectedColor(col.name)}
                      className={`h-9 px-3 rounded-full border-2 transition flex items-center gap-2 bg-slate-50 ${
                        selectedColor === col.name 
                          ? 'border-[#16A34A] ring-2 ring-emerald-50 shadow-sm' 
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                      title={col.name}
                    >
                      <span className={`w-4 h-4 rounded-full ${col.class} border border-slate-300 relative`}>
                        {selectedColor === col.name && (
                          <Check className="w-2.5 h-2.5 text-white absolute inset-0 m-auto filter drop-shadow" />
                        )}
                      </span>
                      <span className="text-xs font-bold text-slate-700 font-sans">{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Adjuster + Action CTA Panel */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 py-6 border-t border-slate-100">
              
              {/* Quantity Select Block */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block font-sans">{t.qty}</span>
                <div className="flex items-center border-2 border-slate-200 rounded-xl bg-white p-1.5 h-12 w-max shadow-sm">
                  <button
                    disabled={quantity <= 1 || isOutOfStock}
                    onClick={handleDecrement}
                    className="w-10 h-full flex items-center justify-center font-bold text-slate-500 hover:text-slate-800 disabled:text-slate-300 transition"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-mono font-black text-slate-800 text-sm">
                    {language === 'bn' ? quantity.toLocaleString('bn') : quantity}
                  </span>
                  <button
                    disabled={quantity >= product.stock || isOutOfStock}
                    onClick={handleIncrement}
                    className="w-10 h-full flex items-center justify-center font-bold text-slate-500 hover:text-slate-800 disabled:text-slate-300 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add, Order Now, and WhatsApp buttons */}
              <div className="flex-1 mt-3 space-y-3">
                
                {/* Main Action Row: Order Now + Add to Cart + Wishlist */}
                <div className="flex gap-2 items-stretch">
                  <button
                    disabled={isOutOfStock}
                    onClick={() => onOrderNow(product, quantity, selectedSize, selectedColor)}
                    className={`flex-1 h-12 rounded-xl text-xs md:text-sm font-sans font-black transition flex items-center justify-center gap-2 shadow-md active:scale-98 ${
                      isOutOfStock
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-100 hover:shadow-lg'
                    }`}
                  >
                    <Zap className="w-4 h-4 md:w-5 md:h-5 text-amber-100 fill-current animate-bounce" />
                    <span>{language === 'en' ? 'Order Now' : 'সরাসরি অর্ডার করুন'}</span>
                  </button>

                  <button
                    disabled={isOutOfStock}
                    onClick={() => onAddToCart(product, quantity, selectedSize, selectedColor)}
                    className={`flex-1 h-12 rounded-xl text-xs md:text-sm font-sans font-black transition flex items-center justify-center gap-2.5 shadow-md active:scale-98 ${
                      isOutOfStock
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        : 'bg-[#16A34A] hover:bg-emerald-500 text-white shadow-emerald-100 hover:shadow-lg'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                    <span>{isOutOfStock ? t.outStock : t.addToCart}</span>
                  </button>

                  <button
                    onClick={() => onToggleWishlist(product)}
                    className={`h-12 w-12 rounded-xl flex items-center justify-center border transition duration-200 active:scale-95 border-slate-200 shrink-0 ${
                      isWishlisted 
                        ? 'bg-rose-500 border-rose-500 text-white hover:bg-rose-600' 
                        : 'bg-white text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50/20'
                    } ${isBeating ? 'animate-wishlist-heartbeat' : ''}`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''} ${isBeating ? 'scale-105' : ''}`} />
                  </button>
                </div>

                {/* Direct WhatsApp Ordering Button */}
                {!isOutOfStock && (
                  <button
                    onClick={() => {
                      const pickedSize = selectedSize || product.sizes?.[0] || 'N/A';
                      const pickedColor = selectedColor || product.colors?.[0]?.name || 'N/A';
                      
                      const whatsappMessage = language === 'en'
                        ? `Assalamu Alaikum,\nI would like to order this product:\n\n*Product:* ${product.title}\n*Code:* ${product.id}\n*Price:* ৳${product.price.toLocaleString('en')}\n*Quantity:* ${quantity} pcs\n*Size:* ${pickedSize}\n*Color:* ${pickedColor}\n\nLink: ${window.location.origin}/product/${product.id}`
                        : `আসসালামু আলাইকুম,\nআমি এই পণ্যটি অর্ডার করতে চাই:\n\n*পণ্য:* ${product.banglaTitle}\n*কোড:* ${product.id}\n*মূল্য:* ৳${product.price.toLocaleString('bn')}\n*পরিমাণ:* ${quantity} পিস\n*সাইজ:* ${pickedSize}\n*কালার:* ${pickedColor}\n\nলিঙ্ক: ${window.location.origin}/product/${product.id}`;

                      const whatsappUrl = `https://wa.me/8801712345678?text=${encodeURIComponent(whatsappMessage)}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                    className="w-full h-12 rounded-xl text-xs md:text-sm font-sans font-black transition flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba56] text-white shadow-sm hover:shadow-md active:scale-98 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 md:w-5 md:h-5 text-white/90" />
                    <span>{language === 'en' ? 'Order on WhatsApp' : 'হোয়াটসঅ্যাপে অর্ডার করুন'}</span>
                  </button>
                )}
              </div>

            </div>

            {/* Interactive order sum estimate */}
            {!isOutOfStock && (
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span>{t.totalPrice}</span>
                <span className="font-mono text-slate-700 font-bold">
                  {formatBDT(product.price * quantity, language)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Center Section: Tab Switcher (Overviews, Specification Grid, Reviews) */}
      <section className="mt-12 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Navigation Tabs Header */}
        <div className="flex border-b border-slate-100 bg-[#F8FAFC]">
          {[
            { id: 'details', label: language === 'en' ? 'Product Overview' : 'পণ্য বিবরণী' },
            { id: 'specs', label: t.specs },
            { id: 'reviews', label: `${t.reviews} (${product.reviewsCount})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-4 text-xs md:text-sm font-bold border-b-2 flex-1 md:flex-none transition duration-250 ${
                activeTab === tab.id
                  ? 'border-[#16A34A] text-[#16A34A] bg-white font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body Contents */}
        <div className="p-6 md:p-10">
          
          {/* A. PRODUCT DETAILS PANEL */}
          {activeTab === 'details' && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h3 className="text-sm uppercase tracking-wider font-extrabold text-[#0F172A] mb-3">
                  {language === 'en' ? 'Elite Collection Spotlight' : 'প্রিমিয়াম পণ্য পরিচিতি'}
                </h3>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed whitespace-pre-line font-sans font-normal">
                  {language === 'en' ? product.description : product.banglaDescription}
                </p>
              </div>

              {/* Features bullets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-50 select-none">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-full bg-emerald-50 text-[#16A34A] mt-0.5"><Check className="w-3.5 h-3.5" /></div>
                  <span className="text-xs md:text-sm text-slate-600">{language === 'en' ? 'Handloom woven / original branded custom stitching' : 'শতভাগ খাঁটি ডিজাইন ও অত্যন্ত নিখুঁত কাজের ফিনিশিং'}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-full bg-emerald-50 text-[#16A34A] mt-0.5"><Check className="w-3.5 h-3.5" /></div>
                  <span className="text-xs md:text-sm text-slate-600">{language === 'en' ? 'Tested under strict moisture & quality regulations' : 'আর্দ্রতা ও স্থায়ীত্বের জন্য ল্যাব দ্বারা অনুমোদিত মান'}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-full bg-emerald-50 text-[#16A34A] mt-0.5"><Check className="w-3.5 h-3.5" /></div>
                  <span className="text-xs md:text-sm text-slate-600">{language === 'en' ? 'Secured delivery with real-time tracking dashboard' : 'রিয়েল-টাইম ডেলিভারি ট্র্যাকিং এবং লাইভ সাপোর্ট টিম'}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded-full bg-emerald-50 text-[#16A34A] mt-0.5"><Check className="w-3.5 h-3.5" /></div>
                  <span className="text-xs md:text-sm text-slate-600">{language === 'en' ? 'Easy return claims in 7 days directly from user profile' : 'পছন্দ না হলে সাথে সাথেই ৭ দিনের ক্যাশব্যাক রিটার্ন গ্যারান্টি'}</span>
                </div>
              </div>
            </div>
          )}

          {/* B. SPECIFICATION TABLE */}
          {activeTab === 'specs' && (
            <div className="max-w-3xl">
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm font-sans">
                <table className="w-full text-xs md:text-sm text-left">
                  <tbody>
                    {Object.entries(language === 'en' ? product.specifications : product.banglaSpecifications).map(([key, val], i) => (
                      <tr
                        key={key}
                        className={`border-b border-slate-100 last:border-none ${
                          i % 2 === 0 ? 'bg-slate-50/40' : ''
                        }`}
                      >
                        <td className="px-5 py-3.5 font-bold text-slate-600 w-1/3 bg-slate-100/50 border-r border-slate-100">
                          {key}
                        </td>
                        <td className="px-5 py-3.5 text-slate-800 font-medium">
                          {val}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* C. DETAILED CUSTOMER REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Rating breakdown visual stats dashboard */}
              <div className="lg:col-span-4 bg-slate-50 border border-slate-100 rounded-2xl p-6 select-none font-sans">
                <span className="text-xs font-black uppercase text-slate-400 block mb-1">{t.ratingBreakdown}</span>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-extrabold text-slate-900">{product.rating}</span>
                  <span className="text-slate-400 text-sm">/ 5.0</span>
                </div>

                {/* Vertical slider segments */}
                <div className="space-y-2.5">
                  {Object.entries(starCounts).reverse().map(([star, percent]) => (
                    <div key={star} className="flex items-center gap-3 text-xs text-slate-500 font-bold">
                      <span className="w-3">{star}★</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-mono text-[11px]">{percent}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Listing columns */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                {allReviews.map((rev) => (
                  <div key={rev.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex flex-col gap-2.5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      {/* Avatar name */}
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.userAvatar}
                          alt={rev.userName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-150"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="text-xs md:text-sm font-extrabold text-slate-800 block leading-tight">{rev.userName}</span>
                          <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">{rev.date}</span>
                        </div>
                      </div>

                      {/* Check badge buyer */}
                      {rev.verified && (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-0.5">
                          ✓ {t.verifiedBuyer}
                        </span>
                      )}
                    </div>

                    {/* Star array */}
                    <div className="flex items-center text-amber-400 gap-0.5">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-3.5 h-3.5 fill-current ${
                            idx < rev.rating ? 'text-amber-400' : 'text-slate-100'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Review text statements */}
                    <p className="text-slate-650 text-xs md:text-sm leading-relaxed font-sans">
                      {language === 'en' ? rev.comment : rev.banglaComment}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </section>

      {/* 5. Bottom Section: Related Curated Products */}
      {relatedProducts.length > 0 && (
        <section id="related-explore-matrix" className="mt-16">
          <div className="text-left mb-8 pb-4 border-b border-slate-100">
            <span className="text-[#16A34A] text-xs font-black uppercase tracking-widest block mb-1">
              Shop recommendations
            </span>
            <h3 className="text-lg md:text-2xl font-display font-medium text-slate-900">
              {t.relatedTitle}
            </h3>
            <p className="text-slate-500 text-xs md:text-sm mt-1">{t.relatedSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => {
              const matchesOriginalWithOffer = p.originalPrice > p.price;
              return (
                <div 
                  key={p.id} 
                  className="bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-xl rounded-2xl overflow-hidden shadow-sm transition p-4 flex flex-col justify-between group h-full cursor-pointer"
                  onClick={() => {
                    onSelectProduct(p);
                    setSelectedImageIndex(0);
                    setQuantity(1);
                    setSelectedSize(p.sizes?.[0] || '');
                    setSelectedColor(p.colors?.[0]?.name || '');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="relative aspect-square rounded-xl bg-slate-50 overflow-hidden mb-3">
                    {p.discount > 0 && (
                      <span className="absolute top-2.5 left-2.5 z-10 bg-amber-500 text-slate-950 font-sans text-[10px] font-black px-2 py-0.5 rounded shadow">
                        {p.discount}% OFF
                      </span>
                    )}
                    <img 
                      src={p.image} 
                      alt={p.title} 
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block font-mono">{p.brand}</span>
                    <h4 className="text-xs md:text-sm font-sans font-bold text-slate-800 line-clamp-2 mt-1 hover:text-[#16A34A] transition leading-snug">
                      {language === 'en' ? p.title : p.banglaTitle}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-slate-50 pt-3 mt-3">
                    <div className="flex flex-col">
                      <span className="text-xs md:text-sm font-mono font-black text-slate-900">
                        {formatBDT(p.price, language)}
                      </span>
                      {matchesOriginalWithOffer && (
                        <span className="text-[10px] font-mono text-slate-400 line-through">
                          {formatBDT(p.originalPrice, language)}
                        </span>
                      )}
                    </div>

                    <button 
                      className="bg-emerald-50 text-[#16A34A] hover:bg-[#16A34A] hover:text-white border border-emerald-200 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(p, 1);
                      }}
                    >
                      Buy +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. Full-screen Interactive Lightbox Gallery */}
      {isLightboxOpen && (
        <div 
          id="lightbox-fullscreen-overlay"
          className="fixed inset-0 bg-[#0F172A]/95 backdrop-blur-md z-[9999] flex flex-col justify-between animate-fade-in text-white select-none overflow-hidden"
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
        >
          {/* Top Bar Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/40 backdrop-blur-sm z-10 animate-fade-in">
            <div>
              <p className="text-[10px] md:text-xs uppercase tracking-widest font-black text-emerald-400 font-mono">
                {language === 'en' ? 'Fine Inspection View' : 'উচ্চ-মান পরিদর্শন ভিউ'}
              </p>
              <h4 className="text-sm md:text-base font-bold text-slate-100 truncate max-w-[180px] sm:max-w-md md:max-w-xl">
                {language === 'en' ? product.title : product.banglaTitle}
              </h4>
            </div>

            {/* Quick zoom factor & general sliders indicator */}
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-300">
                <span>Zoom:</span>
                <span className="text-emerald-400">{(lightboxScale * 100).toFixed(0)}%</span>
              </div>

              {/* Action buttons zoom toolset */}
              <div className="flex items-center gap-0.5 sm:gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                <button
                  onClick={handleZoomOut}
                  disabled={lightboxScale <= 1}
                  className="p-1.5 md:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition disabled:opacity-35 disabled:hover:bg-transparent"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={handleResetZoom}
                  disabled={lightboxScale === 1 && lightboxOffset.x === 0 && lightboxOffset.y === 0}
                  className="p-1.5 md:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition disabled:opacity-35 disabled:hover:bg-transparent"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleZoomIn}
                  disabled={lightboxScale >= 4}
                  className="p-1.5 md:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition disabled:opacity-35 disabled:hover:bg-transparent"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* Spacer divider */}
              <div className="w-[1px] h-6 bg-white/10" />

              {/* Close Button */}
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 hover:text-rose-200 border border-rose-500/20 rounded-xl transition cursor-pointer active:scale-95"
                title="Close Lightbox (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Content Area: Image + Arrow Navigators */}
          <div className="flex-1 relative flex items-center justify-center p-4">
            
            {/* Left Nav Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const imagesArr = product.images || [product.image];
                setLightboxIndex((prev) => (prev - 1 + imagesArr.length) % imagesArr.length);
                handleResetZoom();
              }}
              className="absolute left-4 md:left-8 z-15 p-2.5 sm:p-3 rounded-full bg-slate-900/60 hover:bg-slate-950 text-slate-300 hover:text-white border border-white/5 shadow-2xl transition hover:scale-105 active:scale-95 group"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            {/* Central Zoomable viewport frame */}
            <div 
              className={`w-full max-w-4xl max-h-[65vh] md:max-h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-slate-950/30 shadow-2xl relative ${
                lightboxScale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMoveDrag}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onClick={() => {
                if (lightboxScale === 1) {
                  setLightboxScale(2);
                } else {
                  handleResetZoom();
                }
              }}
            >
              <img
                src={(product.images || [product.image])[lightboxIndex]}
                alt={language === 'en' ? product.title : product.banglaTitle}
                draggable={false}
                style={{
                  transform: `translate(${lightboxOffset.x}px, ${lightboxOffset.y}px) scale(${lightboxScale})`,
                  transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="max-w-full max-h-[65vh] md:max-h-[70vh] object-contain pointer-events-none select-none"
                referrerPolicy="no-referrer"
              />

              {/* Extra visual indicators inside viewport */}
              {lightboxScale > 1 && (
                <div className="absolute bottom-4 left-4 z-10 bg-slate-900/80 px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-300 border border-white/10 animate-fade-in pointer-events-none">
                  🖱️ Drag to pan product details
                </div>
              )}
            </div>

            {/* Right Nav Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const imagesArr = product.images || [product.image];
                setLightboxIndex((prev) => (prev + 1) % imagesArr.length);
                handleResetZoom();
              }}
              className="absolute right-4 md:right-8 z-15 p-2.5 sm:p-3 rounded-full bg-slate-900/60 hover:bg-slate-950 text-slate-300 hover:text-white border border-white/5 shadow-2xl transition hover:scale-105 active:scale-95 group"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Bottom Bar: Thumbnails list selector strip */}
          <div className="bg-slate-900/60 backdrop-blur-sm border-t border-white/10 px-6 py-4 flex flex-col items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-slate-400 uppercase font-sans">
              {language === 'en' ? 'Standard High-Resolution Gallery' : 'স্ট্যান্ডার্ড হাই-রেজোলিউশন গ্যালারি'} ({lightboxIndex + 1} / {(product.images || [product.image]).length})
            </span>

            <div className="flex gap-2 max-w-full overflow-x-auto py-1 px-2 scrollbar-hide">
              {(product.images || [product.image]).map((img, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setLightboxIndex(index);
                    handleResetZoom();
                  }}
                  className={`w-14 h-14 md:w-18 md:h-18 rounded-xl overflow-hidden border-2 transition relative shrink-0 ${
                    lightboxIndex === index 
                      ? 'border-emerald-500 ring-4 ring-emerald-500/20 scale-102 filter brightness-110 shadow-lg' 
                      : 'border-white/10 hover:border-white/30 filter brightness-75 hover:brightness-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Gallery Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover pointer-events-none select-none"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
