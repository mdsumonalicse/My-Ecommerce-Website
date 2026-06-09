import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem, Page } from '../types';
import { formatBDT } from '../utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  language: 'en' | 'bn';
  onUpdateQty: (pId: string, delta: number, size?: string, color?: string) => void;
  onRemoveItem: (pId: string, size?: string, color?: string) => void;
  onNavigateToCheckout: () => void;
  shippingCost: number;
  freeShippingThreshold: number;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  language,
  onUpdateQty,
  onRemoveItem,
  onNavigateToCheckout,
  shippingCost,
  freeShippingThreshold
}: CartDrawerProps) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const deliveryFee = cartItems.length === 0 ? 0 : isFreeShipping ? 0 : shippingCost;
  const grandTotal = subtotal + deliveryFee;

  const t = {
    cartTitle: language === 'en' ? 'Shopping Cart' : 'আপনার শপিং ব্যাগ',
    emptyCart: language === 'en' ? 'Your cart is completely empty' : 'আপনার শপিং ব্যাগ বর্তমানে খালি রয়েছে',
    subtotal: language === 'en' ? 'Subtotal' : 'সাবটোটাল',
    shipping: language === 'en' ? 'Shipping Fee' : 'ডেলিভারি চার্জ',
    free: language === 'en' ? 'FREE' : 'ফ্রি',
    total: language === 'en' ? 'Grand Total' : 'সর্বমোট মূল্য',
    checkout: language === 'en' ? 'Proceed To Checkout' : 'চেকআউট করতে এগিয়ে যান',
    shopMore: language === 'en' ? 'Continue Shopping' : 'আরো শপিং করতে ফিরে যান',
    congratsFree: language === 'en' ? '🎉 Congrats! You unlocked free delivery!' : '🎉 অভিনন্দন! আপনি ফ্রি ডেলিভারি পেয়েছেন!',
    awayFromFree: language === 'en' ? 'Add {n} more to unlock free shipping' : 'ডেলিভারি চার্জ বাঁচাতে আর {n} টাকার প্রোডাক্ট যোগ করুন'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose}></div>

      {/* Drawer Box */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-100 animate-slide-left h-full">
          
          {/* Header Panel */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#0F172A]">
              <ShoppingBag className="w-5.5 h-5.5 text-[#16A34A]" />
              <h2 className="text-lg font-extrabold tracking-tight">
                {t.cartTitle} ({cartItems.length})
              </h2>
            </div>
            <button
              id="cart-drawer-close"
              onClick={onClose}
              className="p-1 px-2.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-105 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content Items list */}
          <div className="flex-1 overflow-y-auto py-6 px-4 md:px-6">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                <div className="p-6 rounded-full bg-slate-50 border border-slate-100 text-slate-350">
                  <ShoppingBag className="w-12 h-12 stroke-1" />
                </div>
                <div>
                  <h3 className="text-slate-700 font-bold text-sm mb-1">{t.emptyCart}</h3>
                  <button
                    onClick={onClose}
                    className="text-emerald-600 text-xs font-semibold hover:underline"
                  >
                    {t.shopMore}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {/* Shipping Progress bar panel indicators */}
                <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-2xl">
                  {isFreeShipping ? (
                    <span className="text-emerald-700 font-sans font-bold text-xs flex items-center justify-center">
                      {t.congratsFree}
                    </span>
                  ) : (
                    <div className="w-full flex flex-col gap-1.5">
                      <p className="text-slate-655 font-bold text-[11px] text-center">
                        {t.awayFromFree.replace('{n}', formatBDT(freeShippingThreshold - subtotal, language))}
                      </p>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#16A34A] h-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {cartItems.map((item, index) => (
                  <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-none">
                    {/* Item Image */}
                    <img
                      src={item.product.image}
                      alt={language === 'en' ? item.product.title : item.product.banglaTitle}
                      className="w-20 h-20 rounded-xl object-cover border border-slate-100"
                      referrerPolicy="no-referrer"
                    />

                    {/* Metadata & Title */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        {/* Title line */}
                        <h4 className="text-[#0F172A] font-bold text-xs line-clamp-2 leading-snug mb-1 font-sans">
                          {language === 'en' ? item.product.title : item.product.banglaTitle}
                        </h4>

                        {/* Selected configuration tags */}
                        {(item.selectedSize || item.selectedColor) && (
                          <div className="flex gap-1.5 mb-2">
                            {item.selectedSize && (
                              <span className="bg-slate-100 text-slate-500 text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase">
                                Size: {item.selectedSize}
                              </span>
                            )}
                            {item.selectedColor && (
                              <span className="bg-slate-100 text-slate-500 text-[9px] px-1.5 py-0.5 rounded-md font-extrabold uppercase">
                                Color: {item.selectedColor}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Quantity adjusting and price controls */}
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white p-0.5">
                          <button
                            id={`drawer-decrement-${index}`}
                            onClick={() => onUpdateQty(item.product.id, -1, item.selectedSize, item.selectedColor)}
                            className="w-6 h-6 flex items-center justify-center font-bold text-slate-400 hover:text-slate-700"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-mono font-bold text-slate-800 text-xs">
                            {language === 'bn' ? item.quantity.toLocaleString('bn') : item.quantity}
                          </span>
                          <button
                            id={`drawer-increment-${index}`}
                            onClick={() => onUpdateQty(item.product.id, 1, item.selectedSize, item.selectedColor)}
                            className="w-6 h-6 flex items-center justify-center font-bold text-slate-400 hover:text-slate-700"
                          >
                            +
                          </button>
                        </div>

                        {/* Cost layout */}
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block font-mono">
                            {language === 'en' ? 'Total' : 'মোট'}: {formatBDT(item.product.price * item.quantity, language)}
                          </span>
                          <span className="text-xs font-bold font-mono text-[#0F172A]">
                            {formatBDT(item.product.price, language)} each
                          </span>
                        </div>

                        {/* Remove item trigger */}
                        <button
                          id={`drawer-remove-${index}`}
                          onClick={() => onRemoveItem(item.product.id, item.selectedSize, item.selectedColor)}
                          className="p-1 px-2.5 text-slate-350 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout Controls Panel */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col gap-4">
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-slate-500">{t.subtotal}</span>
                  <span className="font-mono font-extrabold text-[#0F172A]">{formatBDT(subtotal, language)}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-slate-500">{t.shipping}</span>
                  <span className={`font-mono font-extrabold ${deliveryFee === 0 ? 'text-emerald-600' : 'text-[#0F172A]'}`}>
                    {deliveryFee === 0 ? t.free : formatBDT(deliveryFee, language)}
                  </span>
                </div>
                <div className="my-1 border-t border-slate-200"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-extrabold text-[#0F172A]">{t.total}</span>
                  <span className="text-lg font-mono font-black text-[#16A34A]">{formatBDT(grandTotal, language)}</span>
                </div>
              </div>

              {/* Final Trigger to checkout */}
              <button
                id="drawer-checkout-action"
                onClick={onNavigateToCheckout}
                className="w-full bg-[#16A34A] hover:bg-emerald-500 text-white font-sans text-xs md:text-sm font-black py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <span>{t.checkout}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
