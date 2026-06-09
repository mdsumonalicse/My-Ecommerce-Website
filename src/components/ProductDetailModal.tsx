import React, { useState } from 'react';
import { X, Star, ShoppingCart, ShieldCheck, Heart, ArrowRight, MessageSquare, Zap } from 'lucide-react';
import { Product } from '../types';
import { formatBDT, getCategoryVariantConfig } from '../utils';
import { allReviews } from '../data/products';

interface ProductDetailModalProps {
  product: Product;
  language: 'en' | 'bn';
  onClose: () => void;
  onAddToCart: (p: Product, quantity: number, size?: string, color?: string) => void;
  onOrderNow: (p: Product, quantity: number, size?: string, color?: string) => void;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
}

export default function ProductDetailModal({
  product,
  language,
  onClose,
  onAddToCart,
  onOrderNow,
  isWishlisted,
  onToggleWishlist
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || '');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  const variantConfig = getCategoryVariantConfig(product.category);

  const t = {
    specs: language === 'en' ? 'Specifications' : 'বিস্তারিত বিবরণ',
    reviews: language === 'en' ? 'Customer Reviews' : 'গ্রাহক প্রতিক্রিয়া',
    size: variantConfig.optionLabel[language],
    color: variantConfig.colorLabel[language],
    qty: language === 'en' ? 'Quantity' : 'পরিমাণ',
    addToCart: language === 'en' ? 'Add To Cart' : 'কার্টে যোগ করুন',
    outStock: language === 'en' ? 'Out of Stock' : 'স্টক নেই',
    brand: language === 'en' ? 'Brand' : 'ব্র্যান্ড',
    stockAvailable: language === 'en' ? 'In Stock (Only {n} left)' : 'স্টক আছে (মাত্র {n}টি বাকি)',
    securedText: language === 'en' ? '100% Genuine product. Easy 7-day return. Bank/bKash terms apply.' : '১০০% আসল আমদানিকৃত পণ্য। ৭ দিনের সহজ রিটার্ন পলিসি এবং অনলাইন রিফান্ড গ্যারান্টি।',
    verifiedBuyer: language === 'en' ? 'Verified Buyer' : 'যাচাইকৃত ক্রেতা'
  };

  const isOutOfStock = product.stock <= 0;

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Container Card */}
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-100 flex flex-col animate-fade-in">
        
        {/* Close Button */}
        <button
          id="detail-modal-close"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-slate-100 hover:bg-[#0F172A] hover:text-white text-slate-500 transition-all active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">
          
          {/* Left Side: Large image view with multiple-images navigation */}
          <div className="flex flex-col gap-4">
            <div 
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-inner cursor-zoom-in select-none"
            >
              {product.discount > 0 && (
                <span className="absolute top-4 left-4 z-10 bg-amber-500 text-[#0F172A] font-sans text-xs font-black px-3 py-1 rounded-lg">
                  {product.discount}% {language === 'en' ? 'SAVE' : 'ছাড়'}
                </span>
              )}
              <img
                src={(product.images && product.images[selectedImageIndex]) || product.image}
                alt={language === 'en' ? product.title : product.banglaTitle}
                style={
                  isZooming
                    ? {
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                        transform: 'scale(2.2)',
                      }
                    : undefined
                }
                className="w-full h-full object-cover object-center transition-transform duration-75"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Thumbnail selector of images */}
            {product.images && product.images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide select-none">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                      selectedImageIndex === index ? 'border-[#16A34A] ring-2 ring-emerald-100 shadow-inner' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumb ${index + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Quick trust check underneath image */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] md:text-xs text-emerald-800 leading-normal font-sans font-medium">
                {t.securedText}
              </p>
            </div>
          </div>

          {/* Right Side: Product Details */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Category & Status */}
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-slate-100 text-slate-650 px-2.5 py-1 rounded-md text-[10px] font-bold font-mono uppercase">
                  {product.brand}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 font-sans">
                  {t.stockAvailable.replace('{n}', product.stock.toString())}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl md:text-2xl font-sans font-extrabold text-[#0F172A] leading-snug mb-3">
                {language === 'en' ? product.title : product.banglaTitle}
              </h2>

              {/* Overarching Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center text-amber-500 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 fill-current ${
                        i < Math.floor(product.rating) ? 'text-amber-500' : 'text-slate-200'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-800 ml-1 font-sans">{product.rating}</span>
                </div>
                <span className="text-slate-305 text-xs">|</span>
                <span className="text-xs text-slate-500 font-normal font-sans">
                  {product.reviewsCount} {language === 'en' ? 'Ratings & Reviews' : 'টি রেটিং ও রিভিউ'}
                </span>
              </div>

              {/* Price Panel */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-4 mb-6">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">{language === 'en' ? 'Offer Price' : 'অফারের মূল্য'}</span>
                  <span className="text-2xl font-mono font-black text-[#0F172A]">
                    {formatBDT(product.price, language)}
                  </span>
                </div>
                {product.originalPrice > product.price && (
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">{language === 'en' ? 'Regular Price' : 'সাধারণ মূল্য'}</span>
                    <span className="text-sm font-mono text-slate-450 line-through">
                      {formatBDT(product.originalPrice, language)}
                    </span>
                  </div>
                )}
              </div>

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs filter font-bold text-slate-700 mb-2 font-sans">{t.size}</h4>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map((sz) => (
                      <button
                        key={sz}
                        id={`size-btn-${sz}`}
                        onClick={() => setSelectedSize(sz)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition ${
                          selectedSize === sz
                            ? 'border-[#0F172A] bg-[#0F172A] text-white'
                            : 'border-slate-205 text-slate-650 hover:border-slate-400'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-700 mb-2 font-sans">{t.color}</h4>
                  <div className="flex gap-3">
                    {product.colors.map((col) => (
                      <button
                        key={col.name}
                        id={`color-btn-${col.name}`}
                        onClick={() => setSelectedColor(col.name)}
                        className={`w-7 h-7 rounded-full ${col.class} border-2 relative transition-transform ${
                          selectedColor === col.name ? 'border-[#16A34A] scale-110' : 'border-slate-205'
                        }`}
                        title={col.name}
                      >
                        {selectedColor === col.name && (
                          <span className="absolute inset-1 w-2 h-2 rounded-full bg-[#16A34A] m-auto"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity adjustment panel & triggers */}
              <div className="flex flex-col gap-4 mb-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-4">
                  <h4 className="text-xs font-bold text-slate-700 font-sans">{t.qty}</h4>
                  <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1">
                    <button
                      id="qty-decrement"
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center font-bold text-slate-500 hover:text-slate-800 disabled:text-slate-300 transition"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-mono font-bold text-slate-800 text-sm">
                      {language === 'bn' ? quantity.toLocaleString('bn') : quantity}
                    </span>
                    <button
                      id="qty-increment"
                      onClick={handleIncrement}
                      disabled={quantity >= product.stock}
                      className="w-8 h-8 flex items-center justify-center font-bold text-slate-500 hover:text-slate-800 disabled:text-slate-300 transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Main purchase actions */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      disabled={isOutOfStock}
                      onClick={() => onOrderNow(product, quantity, selectedSize, selectedColor)}
                      className={`flex-1 py-3 px-4 rounded-xl font-sans text-xs md:text-sm font-black transition flex items-center justify-center gap-1.5 shadow-md active:scale-98 ${
                        isOutOfStock
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                          : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-100 hover:shadow-lg'
                      }`}
                    >
                      <Zap className="w-4 h-4 text-amber-100 fill-current animate-bounce" />
                      <span>{language === 'en' ? 'Order Now' : 'সরাসরি অর্ডার করুন'}</span>
                    </button>

                    <button
                      id="add-to-cart-action"
                      onClick={() => onAddToCart(product, quantity, selectedSize, selectedColor)}
                      disabled={isOutOfStock}
                      className={`flex-1 py-3 px-4 rounded-xl font-sans text-xs md:text-sm font-black transition flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg ${
                        isOutOfStock
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                          : 'bg-[#16A34A] hover:bg-emerald-500 text-white active:scale-98'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>{isOutOfStock ? t.outStock : t.addToCart}</span>
                    </button>
                  </div>

                  {/* Direct WhatsApp Ordering */}
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
                      className="w-full py-3 px-4 rounded-xl font-sans text-xs md:text-sm font-black transition flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba56] text-white shadow-sm hover:shadow-md active:scale-98 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-white/90" />
                      <span>{language === 'en' ? 'Order on WhatsApp' : 'হোয়াটসঅ্যাপে অর্ডার করুন'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Detailed Description and Specifications Tabs */}
        <div className="border-t border-slate-100 bg-[#F8FAFC] px-6 md:px-10 py-8">
          <div className="max-w-3xl">
            {/* Description Card */}
            <h3 className="text-sm uppercase tracking-wider font-extrabold text-[#0F172A] mb-3">
              {language === 'en' ? 'Product Overview' : 'পণ্য পরিচিতি'}
            </h3>
            <p className="text-slate-600 text-xs md:text-sm font-normal leading-relaxed mb-8 font-sans">
              {language === 'en' ? product.description : product.banglaDescription}
            </p>

            {/* Specifications Matrix */}
            <h3 className="text-sm uppercase tracking-wider font-extrabold text-[#0F172A] mb-4">
              {t.specs}
            </h3>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-8 font-sans">
              <table className="w-full text-xs">
                <tbody>
                  {Object.entries(language === 'en' ? product.specifications : product.banglaSpecifications).map(([key, val], i) => (
                    <tr
                      key={key}
                      className={`border-b border-slate-100 last:border-none ${
                        i % 2 === 0 ? 'bg-slate-50/50' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold text-slate-600 w-1/3 border-r border-slate-100">
                        {key}
                      </td>
                      <td className="px-4 py-3 text-slate-800">
                        {val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Verified Reviews Section */}
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
              <h3 className="text-sm uppercase tracking-wider font-extrabold text-[#0F172A]">
                {t.reviews}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-current text-amber-500" />
                <span>{product.rating} / 5</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 font-sans">
              {allReviews.map((rev) => (
                <div key={rev.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col gap-2 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.userAvatar}
                        alt={rev.userName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-100"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="text-xs font-extrabold text-slate-800 block leading-tight">{rev.userName}</span>
                        <span className="text-[10px] font-semibold text-slate-400 block">{rev.date}</span>
                      </div>
                    </div>
                    {rev.verified && (
                      <span className="bg-emerald-55 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        ✓ {t.verifiedBuyer}
                      </span>
                    )}
                  </div>

                  {/* Comment context */}
                  <div className="flex items-center text-amber-500 gap-0.5">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-3 h-3 fill-current ${
                          idx < rev.rating ? 'text-amber-500' : 'text-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-slate-650 text-xs leading-relaxed font-sans mt-0.5">
                    {language === 'en' ? rev.comment : rev.banglaComment}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
