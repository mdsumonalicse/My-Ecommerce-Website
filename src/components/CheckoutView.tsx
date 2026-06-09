import React, { useState } from 'react';
import { ShieldCheck, Calendar, Lock, ArrowLeft, ArrowRight, Landmark, Smartphone, RefreshCw, CheckCircle, X } from 'lucide-react';
import { CartItem, Order } from '../types';
import { formatBDT } from '../utils';

interface CheckoutViewProps {
  language: 'en' | 'bn';
  cartItems: CartItem[];
  cartTotal: number;
  freeShippingThreshold: number;
  onSubmitOrder: (order: Order, pointsDeducted?: number) => void;
  onNavigateHome: () => void;
  userRewardPoints?: number;
}

const bdDistricts = [
  { id: 'dhaka', name: { en: 'Dhaka (Inside City)', bn: 'ঢাকা (সিটি কর্পোরেশন)' }, fee: 60 },
  { id: 'chittagong', name: { en: 'Chittagong', bn: 'চট্টগ্রাম' }, fee: 120 },
  { id: 'sylhet', name: { en: 'Sylhet', bn: 'সিলেট' }, fee: 120 },
  { id: 'rajshahi', name: { en: 'Rajshahi', bn: 'রাজশাহী' }, fee: 120 },
  { id: 'khulna', name: { en: 'Khulna', bn: 'খুলনা' }, fee: 120 },
  { id: 'barisal', name: { en: 'বরিশাল' }, fee: 120 },
  { id: 'rangpur', name: { en: 'রংপুর' }, fee: 120 },
  { id: 'mymensingh', name: { en: 'Mymensingh', bn: 'ময়মনসিংহ' }, fee: 120 }
];

export default function CheckoutView({
  language,
  cartItems,
  cartTotal,
  freeShippingThreshold,
  onSubmitOrder,
  onNavigateHome,
  userRewardPoints = 0
}: CheckoutViewProps) {
  // Checkout States
  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState(bdDistricts[0]);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Cash on Delivery'>('bKash');
  const [usePoints, setUsePoints] = useState(false);

  // Interactive payment modal overlays simulation states
  const [showPaymentOverlay, setShowPaymentOverlay] = useState(false);
  const [overlayStep, setOverlayStep] = useState<1 | 2 | 3>(1); // 1: Number, 2: Verification Code, 3: PIN
  const [walletNumber, setWalletNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [pinNumber, setPinNumber] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Computed Values
  const deliverFee = cartTotal >= freeShippingThreshold ? 0 : selectedDistrict.fee;
  
  // Calculate reward points discount: 1 Pts = 1 BDT, up to total cart value minus BDT 10 (minimum basket price)
  const maxDeductiblePoints = Math.min(userRewardPoints, Math.max(0, cartTotal - 10));
  const pointsDiscount = usePoints ? maxDeductiblePoints : 0;
  
  const grandTotal = Math.max(10, cartTotal + deliverFee - pointsDiscount);

  const t = {
    checkoutHeader: language === 'en' ? 'Checkout & Secure Payment' : 'চেকআউট ও পেমেন্ট বিবরণী',
    contactTitle: language === 'en' ? 'Shipping Information' : 'ডেলিভারি ঠিকানা ও তথ্য',
    fullName: language === 'en' ? 'Full Name' : 'পূর্ণ নাম',
    phoneVal: language === 'en' ? 'Phone Number (bKash/General)' : 'সঠিক মোবাইল নম্বর',
    cityDist: language === 'en' ? 'District / Shipping Area' : 'জেলা বা ডেলিভারি এলাকা',
    detailAddress: language === 'en' ? 'House, Road, Apartment Details' : 'গ্রাম বা রোড নং, হাউজ নং এবং এলাকার নাম',
    paymentTitle: language === 'en' ? 'Select Payment Method' : 'পেমেন্ট গেটওয়ে নির্বাচন করুন',
    cod: language === 'en' ? 'Cash On Delivery' : 'ক্যাশ অন ডেলিভারি (হাতে পেয়ে মূল্য পরিশোধ)',
    subtotal: language === 'en' ? 'Subtotal' : 'সাবটোটাল',
    shipping: language === 'en' ? 'Shipping Fee' : 'ডেলিভারি চার্জ',
    total: language === 'en' ? 'Grand Total' : 'সর্বমোট মূল্য',
    submit: language === 'en' ? 'Secure Checkout & Complete Order' : 'পেমেন্ট সম্পন্ন করুন এবং অর্ডার নিশ্চিত করুন',
    backToHome: language === 'en' ? 'Back To Home' : 'হোমে ফিরে যান',
    trustNotice: language === 'en' ? 'Encrypted Connection. Double verified for SSL security protocol.' : 'আপনার পেমেন্ট তথ্য সম্পূর্ণ সুরক্ষিত ও এনক্রিপ্টেড।',
    walletPlaceholder: language === 'en' ? 'Enter 11-digit Wallet Number' : '১১ ডিজিটের ওয়ালেট নম্বর লিখুন',
    pinPlaceholder: language === 'en' ? 'Enter PIN Code' : 'পিন নম্বর প্রদান করুন',
    otpPlaceholder: language === 'en' ? 'Enter 6-digit SMS OTP' : '৬ ডিজিটের ওটিপি নম্বর লিখুন',
    processSuccess: language === 'en' ? 'Order processed successfully!' : 'অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!'
  };

  const handleDistrictChange = (distId: string) => {
    const dist = bdDistricts.find(d => d.id === distId);
    if (dist) setSelectedDistrict(dist);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address) {
      alert(language === 'en' ? 'Please fill out all mandatory fields!' : 'দয়া করে সবগুলো জরুরি ঘর পূরণ করুন!');
      return;
    }

    if (paymentMethod === 'Cash on Delivery') {
      setIsProcessingPayment(true);
      setTimeout(() => {
        executeOrderFinalization();
      }, 1500);
    } else {
      setWalletNumber(phone || '');
      setOverlayStep(1);
      setShowPaymentOverlay(true);
    }
  };

  const executeOrderFinalization = () => {
    const newOrder: Order = {
      id: `BD-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('eb-GB', { year: 'numeric', month: 'short', day: 'numeric' }),
      items: cartItems,
      total: grandTotal,
      status: 'Pending',
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Unpaid' : 'Paid',
      shippingAddress: {
        name: fullName,
        phone: phone,
        district: selectedDistrict.name[language],
        address: address
      },
      trackingStep: 0
    };
    onSubmitOrder(newOrder, pointsDiscount);
    setIsProcessingPayment(false);
    setShowPaymentOverlay(false);
  };

  const handleWalletNext = () => {
    if (walletNumber.length < 11) {
      alert(language === 'en' ? 'Wallet number must be 11 digits!' : 'মোবাইল ওয়ালেট নম্বরটি অবশ্যই ১১ ডিজিটের হতে হবে!');
      return;
    }
    setOverlayStep(2);
  };

  const handleOtpNext = () => {
    if (verificationCode.length < 4) {
      alert(language === 'en' ? 'Please enter valid verification code' : 'সঠিক ভেরিফিকেশন কোডটি কারেক্টলি লিখুন');
      return;
    }
    setOverlayStep(3);
  };

  const handlePinSubmit = () => {
    if (pinNumber.length < 4) {
      alert(language === 'en' ? 'Secure Pin required' : 'নিরাপদ পিন কোড প্রদান করুন');
      return;
    }
    setIsProcessingPayment(true);
    setTimeout(() => {
      executeOrderFinalization();
    }, 2000);
  };

  return (
    <div className="bg-[#F8FAFC] py-10 px-4 md:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Back and title */}
        <div className="flex items-center gap-4 mb-8">
          <button
            id="checkout-back-home"
            onClick={onNavigateHome}
            className="p-2 bg-white text-slate-700 hover:text-emerald-600 rounded-xl transition border border-slate-100 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-[#0F172A] leading-snug">
              {t.checkoutHeader}
            </h1>
            <p className="text-xs text-slate-400 font-medium">Secured SSL/TLS Encrypted Transactions</p>
          </div>
        </div>

        <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (Inputs) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Form details card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col gap-6">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 text-xs font-black bg-emerald-100 text-emerald-800 rounded-full">1</span>
                <h3 className="font-extrabold text-[#0F172A] text-sm md:text-base">
                  {t.contactTitle}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-650 block mb-1.5">{t.fullName} *</label>
                  <input
                    id="checkout-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tanvir Rahman"
                    className="w-full bg-[#F8FAFC] border border-slate-200 py-3 px-4 rounded-xl text-xs focus:outline-none focus:border-[#16A34A] focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-655 block mb-1.5">{t.phoneVal} *</label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 01712xxxxxx"
                    className="w-full bg-[#F8FAFC] border border-slate-200 py-3 px-4 rounded-xl text-xs focus:outline-none focus:border-[#16A34A] focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-650 block mb-1.5">{t.cityDist} *</label>
                  <select
                    id="checkout-district-selector"
                    value={selectedDistrict.id}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-slate-205 py-3 px-4 rounded-xl text-xs focus:outline-none focus:border-[#16A34A] focus:bg-white transition"
                  >
                    {bdDistricts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name[language]} - {d.fee === 0 ? 'Free' : `৳${d.fee}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-650 block mb-1.5">{t.detailAddress} *</label>
                  <input
                    id="checkout-address"
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Plot 15, Sector 4, Uttara, Dhaka"
                    className="w-full bg-[#F8FAFC] border border-slate-202 py-3 px-4 rounded-xl text-xs focus:outline-none focus:border-[#16A34A] focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            {/* Payment gateways selection */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col gap-5">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 text-xs font-black bg-emerald-100 text-emerald-800 rounded-full">2</span>
                <h3 className="font-extrabold text-[#0F172A] text-sm md:text-base">
                  {t.paymentTitle}
                </h3>
              </div>

              <div className="space-y-4">
                {/* 1 Full Width highlighted Cash on Delivery item */}
                <div
                  id="pay-choice-cod"
                  onClick={() => setPaymentMethod('Cash on Delivery')}
                  className={`border border-slate-200 rounded-xl md:rounded-2xl p-2.5 md:p-3.5 flex flex-row items-center justify-between gap-3 cursor-pointer transition-all duration-300 select-none ${
                    paymentMethod === 'Cash on Delivery'
                      ? 'border-emerald-600 bg-emerald-50/70 text-[#16A34A] shadow-xs ring-2 ring-emerald-500/20 translate-y-[-1px]'
                      : 'border-slate-150 hover:border-emerald-300 bg-white hover:bg-slate-50/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-left flex-1 min-w-0">
                    <div className="w-8 h-8 md:w-11 md:h-11 rounded-full bg-emerald-600 text-white font-sans font-black flex items-center justify-center text-[10px] md:text-xs shadow-xs shrink-0">
                      COD
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11.5px] md:text-sm font-black text-[#0F172A] block leading-tight truncate">
                        {language === 'en' ? 'Cash on Delivery (COD)' : 'ক্যাশ অন ডেলিভারি (হাতে পেয়ে মূল্য পরিশোধ)'}
                      </span>
                      <span className="text-[9px] md:text-[10px] text-slate-500 font-medium block mt-0.5 leading-snug line-clamp-1 md:line-clamp-none">
                        {language === 'en' ? 'Pay inside your doorstep on arrival' : 'ভিজিট বা পণ্য বুঝে পাওয়ার পর মূল্য পরিশোধ'}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 pl-1">
                    <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border flex items-center justify-center transition ${
                      paymentMethod === 'Cash on Delivery' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {paymentMethod === 'Cash on Delivery' && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                    </div>
                  </div>
                </div>

                {/* Or digital transfer methods */}
                <div className="pt-1">
                  <span className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2 px-1 font-sans text-left">
                    {language === 'en' ? 'Or Pay with Mobile Wallet' : 'অথবা মোবাইল ওয়ালেট পেমেন্ট'}
                  </span>
                  
                  <div className="grid grid-cols-3 gap-2 md:gap-3.5">
                    {/* bKash card logic */}
                    <div
                      id="pay-choice-bkash"
                      onClick={() => setPaymentMethod('bKash')}
                      className={`border rounded-xl md:rounded-2xl p-2 md:p-3 flex flex-col items-center justify-center gap-1 md:gap-1.5 cursor-pointer transition-all duration-300 select-none text-center ${
                        paymentMethod === 'bKash'
                          ? 'border-[#DE0D6C] bg-pink-50 text-[#DE0D6C] shadow-xs ring-2 ring-pink-500/15 translate-y-[-1px]'
                          : 'border-slate-150 hover:border-pink-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-[#DE0D6C] text-white font-sans font-black flex items-center justify-center text-[8.5px] md:text-[10px] shadow-xs">
                        bKash
                      </div>
                      <span className="text-[10.5px] md:text-xs font-extrabold font-sans leading-none">bKash</span>
                      <span className="text-[7.5px] md:text-[8.5px] text-[#DE0D6C] tracking-tight font-extrabold uppercase leading-none mt-0.5">Instant</span>
                    </div>

                    {/* Nagad choice logic */}
                    <div
                      id="pay-choice-nagad"
                      onClick={() => setPaymentMethod('Nagad')}
                      className={`border rounded-xl md:rounded-2xl p-2 md:p-3 flex flex-col items-center justify-center gap-1 md:gap-1.5 cursor-pointer transition-all duration-300 select-none text-center ${
                        paymentMethod === 'Nagad'
                          ? 'border-[#F25A2B] bg-orange-50 text-[#F25A2B] shadow-xs ring-2 ring-orange-500/15 translate-y-[-1px]'
                          : 'border-slate-150 hover:border-orange-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-[#F25A2B] text-white font-sans font-black flex items-center justify-center text-[8.5px] md:text-[10px] shadow-xs">
                        Nagad
                      </div>
                      <span className="text-[10.5px] md:text-xs font-extrabold font-sans leading-none">Nagad</span>
                      <span className="text-[7.5px] md:text-[8.5px] text-[#F25A2B] tracking-tight font-extrabold uppercase leading-none mt-0.5">Instant</span>
                    </div>

                    {/* Rocket choice logic */}
                    <div
                      id="pay-choice-rocket"
                      onClick={() => setPaymentMethod('Rocket')}
                      className={`border rounded-xl md:rounded-2xl p-2 md:p-3 flex flex-col items-center justify-center gap-1 md:gap-1.5 cursor-pointer transition-all duration-300 select-none text-center ${
                        paymentMethod === 'Rocket'
                          ? 'border-[#8C3494] bg-fuchsia-50 text-[#8C3494] shadow-xs ring-2 ring-[#8C3494]/15 translate-y-[-1px]'
                          : 'border-[#8C3494]/15 hover:border-[#8C3494]/30 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-[#8C3494] text-white font-sans font-black flex items-center justify-center text-[8.5px] md:text-[10px] shadow-xs">
                        Rocket
                      </div>
                      <span className="text-[10.5px] md:text-xs font-extrabold font-sans leading-none">Rocket</span>
                      <span className="text-[7.5px] md:text-[8.5px] text-[#8C3494] tracking-tight font-extrabold uppercase leading-none mt-0.5">Instant</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust notices block */}
              <div className="bg-slate-50 p-4 border border-slate-105 rounded-2xl flex items-center gap-3">
                <Lock className="w-5 h-5 text-slate-500" />
                <p className="text-[10px] md:text-xs text-slate-550 font-normal leading-relaxed">
                  {t.trustNotice}
                </p>
              </div>

            </div>

          </div>

          {/* Right Column (Item details breakdowns & confirmation trigger) */}
          <div className="lg:col-span-5">
            <div className="bg-[#0F172A] text-white rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-lg sticky top-38 border border-slate-800">
              
              <div>
                <h3 className="font-sans font-extrabold text-sm md:text-base border-b border-slate-800 pb-3 mb-4 uppercase tracking-widest text-slate-300">
                  {language === 'en' ? 'Order Summary' : 'অর্ডার সারসংক্ষেপ'}
                </h3>

                {/* Ordered Items Scroll */}
                <div className="flex flex-col gap-4 max-h-[220px] overflow-y-auto mb-6 pr-2">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 justify-between items-center bg-slate-900 border border-slate-800 p-2 rounded-xl">
                      <div className="flex items-center gap-2">
                        <img
                          src={item.product.image}
                          alt={item.product.title}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-850"
                          referrerPolicy="no-referrer"
                        />
                        <div className="text-left leading-normal font-sans">
                          <span className="text-xs font-bold line-clamp-1 text-slate-200">
                            {language === 'en' ? item.product.title : item.product.banglaTitle}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            Qty: {item.quantity} {item.selectedSize ? `| Size: ${item.selectedSize}` : ''}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold font-mono text-emerald-400">
                        {formatBDT(item.product.price * item.quantity, language)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Reward Points Discount Selector widget */}
                {userRewardPoints > 0 && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 text-left hover:border-emerald-500/25 transition">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base select-none">⭐</span>
                        <div className="leading-tight">
                          <span className="text-xs font-black text-slate-200 block">
                            {language === 'en' ? 'Use Reward Points' : 'রিওয়ার্ড পয়েন্ট ব্যবহার করুন'}
                          </span>
                          <span className="text-[10px] text-slate-450 font-mono block mt-0.5">
                            {language === 'en' ? `Available: ${userRewardPoints} Pts` : `ব্যালেন্স: ${userRewardPoints.toLocaleString('bn')} পয়েন্ট`}
                          </span>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={usePoints}
                          onChange={(e) => setUsePoints(e.target.checked)}
                          className="sr-only peer" 
                        />
                        <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#16A34A] relative">
                          <div className={`absolute top-[4px] left-[4px] w-3 h-3 rounded-full bg-white transition-all duration-200 ${usePoints ? 'transform translate-x-4' : ''}`} />
                        </div>
                      </label>
                    </div>

                    {usePoints && (
                      <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10.5px] text-slate-400 font-medium flex justify-between items-center animate-fade-in">
                        <span>{language === 'en' ? 'Points Applied Discount:' : 'পয়েন্ট বোনাস ছাড়:'}</span>
                        <span className="font-mono font-bold text-emerald-400">-{formatBDT(pointsDiscount, language)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Cost Calculations */}
                <div className="flex flex-col gap-3 font-sans text-xs border-t border-slate-800 pt-4 mb-6">
                  <div className="flex justify-between text-slate-400">
                    <span>{t.subtotal}</span>
                    <span className="font-mono">{formatBDT(cartTotal, language)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{t.shipping}</span>
                    <span className="font-mono">{deliverFee === 0 ? 'FREE' : formatBDT(deliverFee, language)}</span>
                  </div>

                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-slate-400 animate-fade-in">
                      <span>{language === 'en' ? 'Reward Points Discount' : 'রিওয়ার্ড পয়েন্ট ছাড়'}</span>
                      <span className="font-mono text-emerald-400">-{formatBDT(pointsDiscount, language)}</span>
                    </div>
                  )}

                  <div className="border-t border-slate-850 my-1"></div>
                  <div className="flex justify-between text-sm">
                    <span className="font-extrabold text-slate-200">{t.total}</span>
                    <span className="font-mono font-black text-[#16A34A] text-lg">
                      {formatBDT(grandTotal, language)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit triggers */}
              <button
                id="checkout-finalize-btn"
                type="submit"
                disabled={isProcessingPayment}
                className="w-full bg-[#16A34A] hover:bg-emerald-500 text-white font-sans text-xs md:text-sm font-black py-4 rounded-xl flex items-center justify-center gap-2 transition duration-200 shadow-md active:scale-98"
              >
                {isProcessingPayment && <RefreshCw className="w-4 h-4 animate-spin text-white" />}
                <span>{isProcessingPayment ? 'Processing...' : t.submit}</span>
                {!isProcessingPayment && <ArrowRight className="w-4 h-4" />}
              </button>

            </div>
          </div>

        </form>

        {/* INTERACTIVE PAYMENTS GATEWAY POPUP MODAL SIMULATION */}
        {showPaymentOverlay && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col border border-slate-100 font-sans relative">
              
              {/* Top Banner specific to BKASH / NAGAD / ROCKET */}
              <div 
                className={`py-6 px-6 text-white flex justify-between items-center ${
                  paymentMethod === 'bKash' 
                    ? 'bg-[#DE0D6C]' 
                    : paymentMethod === 'Nagad' 
                    ? 'bg-[#F25A2B]' 
                    : 'bg-[#8C3494]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-white text-slate-900 font-black flex items-center justify-center text-xs shadow-md">
                    {paymentMethod}
                  </div>
                  <div className="text-left">
                    <h4 className="font-extrabold text-sm tracking-wide uppercase leading-tight">{paymentMethod} Sandbox</h4>
                    <p className="text-[10px] text-white/80 font-mono tracking-tight">Security Protocol Live</p>
                  </div>
                </div>
                
                {/* Close Sandbox */}
                <button
                  id="checkout-sandbox-close"
                  onClick={() => setShowPaymentOverlay(false)}
                  className="rounded-full p-1 bg-black/10 hover:bg-black/20 text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Amount Display */}
              <div className="bg-slate-55 p-3 px-6 text-center border-b border-slate-105 flex justify-between items-center">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Amount Payable</span>
                <span className="font-mono font-extrabold text-sm text-slate-850">{formatBDT(grandTotal, language)}</span>
              </div>

              {/* Form panel based on step */}
              <div className="p-6 flex flex-col gap-4">
                
                {overlayStep === 1 && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <p className="text-slate-600 text-xs leading-normal font-sans">
                      Enter your {paymentMethod} Wallet mobile number to receive a secure 6-digit verification SMS OTP.
                    </p>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">Wallet Number</label>
                      <input
                        id="sandbox-wallet-input"
                        type="text"
                        maxLength={11}
                        value={walletNumber}
                        onChange={(e) => setWalletNumber(e.target.value)}
                        placeholder="e.g. 01712345678"
                        className="w-full bg-[#F8FAFC] border border-slate-200 py-3 px-4 rounded-xl text-center font-mono text-sm font-bold tracking-widest focus:outline-none focus:border-[#16A34A]"
                      />
                    </div>
                    <button
                      id="sandbox-step1-next"
                      onClick={handleWalletNext}
                      className={`w-full py-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition ${
                        paymentMethod === 'bKash' 
                          ? 'bg-[#DE0D6C] text-white hover:opacity-90' 
                          : paymentMethod === 'Nagad' 
                          ? 'bg-[#F25A2B] text-white hover:opacity-90' 
                          : 'bg-[#8C3494] text-white hover:opacity-90'
                      }`}
                    >
                      <span>Proceed to Verify</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {overlayStep === 2 && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <p className="text-slate-600 text-xs leading-normal font-sans text-center">
                      We have simulated a secure 6-digit SMS OTP code. Please enter it below.
                    </p>
                    <div className="bg-amber-50 border border-amber-100 p-2.5 rounded-xl text-center text-xs font-sans text-amber-800 font-bold mb-1">
                      OTP Simulated Key: <span className="font-mono text-sm font-black">123456</span>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1 text-center">SMS Verification OTP</label>
                      <input
                        id="sandbox-otp-input"
                        type="text"
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="123456"
                        className="w-full bg-[#F8FAFC] border border-slate-200 py-3 px-4 rounded-xl text-center font-mono text-sm font-bold tracking-widest focus:outline-none focus:border-[#16A34A]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setOverlayStep(1)}
                        className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 text-xs font-bold uppercase transition"
                      >
                        Back
                      </button>
                      <button
                        id="sandbox-step2-next"
                        onClick={handleOtpNext}
                        className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase transition ${
                          paymentMethod === 'bKash' 
                            ? 'bg-[#DE0D6C] text-white' 
                            : paymentMethod === 'Nagad' 
                            ? 'bg-[#F25A2B] text-white' 
                            : 'bg-[#8C3494] text-white'
                        }`}
                      >
                        Verify OTP
                      </button>
                    </div>
                  </div>
                )}

                {overlayStep === 3 && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <p className="text-slate-600 text-xs leading-normal font-sans text-center">
                      Enter your secret <span className="font-bold">{paymentMethod} Wallet PIN</span> to conclude the transaction securely.
                    </p>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1 text-center">Wallet PIN Number</label>
                      <input
                        id="sandbox-pin-input"
                        type="password"
                        maxLength={5}
                        value={pinNumber}
                        onChange={(e) => setPinNumber(e.target.value)}
                        placeholder="•••••"
                        className="w-full bg-[#F8FAFC] border border-slate-200 py-3 px-4 rounded-xl text-center font-mono text-lg font-black tracking-widest focus:outline-none focus:border-[#16A34A]"
                      />
                    </div>
                    <div className="bg-slate-50 border border-slate-150 rounded-xl p-2.5 text-center flex items-center justify-center gap-1 text-[10px] text-slate-500 font-bold font-sans">
                      <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                      <span>Pin encryption algorithm is 256-bit safe.</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setOverlayStep(2)}
                        disabled={isProcessingPayment}
                        className="flex-1 py-3 border border-slate-202 rounded-xl text-slate-500 hover:bg-slate-50 text-xs font-semibold uppercase transition disabled:opacity-50"
                      >
                        Back
                      </button>
                      <button
                        id="sandbox-step3-finalize"
                        onClick={handlePinSubmit}
                        disabled={isProcessingPayment}
                        className={`flex-1 py-3 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-1.5 transition ${
                          paymentMethod === 'bKash' 
                            ? 'bg-[#DE0D6C] text-white hover:opacity-90' 
                            : paymentMethod === 'Nagad' 
                            ? 'bg-[#F25A2B] text-white hover:opacity-90' 
                            : 'bg-[#8C3494] text-white hover:opacity-90'
                        }`}
                      >
                        {isProcessingPayment && <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />}
                        <span>{isProcessingPayment ? 'Securing...' : 'PAY NOW'}</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
