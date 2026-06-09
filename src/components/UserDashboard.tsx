import React, { useState } from 'react';
import { User, Award, ShoppingBag, MapPin, Phone, Mail, CheckCircle, Package, Truck, Smile, Eye, FileText } from 'lucide-react';
import { Order, UserProfile, UserAccount } from '../types';
import { formatBDT } from '../utils';

function MiniOrderStepper({ trackingStep, isCancelled, language }: { trackingStep: number; isCancelled: boolean; language: 'en' | 'bn' }) {
  const steps = [
    { label: language === 'en' ? 'Placed' : 'গৃহীত', icon: CheckCircle },
    { label: language === 'en' ? 'Packing' : 'প্যাকিং', icon: Package },
    { label: language === 'en' ? 'Shipped' : 'শিপড', icon: Truck },
    { label: language === 'en' ? 'Delivered' : 'ডেলিভারি', icon: Smile },
  ];

  if (isCancelled) {
    return (
      <div className="w-full bg-rose-50/65 border border-rose-100 rounded-lg py-1 px-2.5 flex items-center justify-between">
        <span className="text-[10px] font-extrabold text-rose-600 block flex items-center gap-1">
          ❌ {language === 'en' ? 'Cancelled / Void' : 'অর্ডারটি বাতিল করা হয়েছে'}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full py-1">
      <div className="relative flex items-center justify-between w-full max-w-sm mx-auto">
        {/* Background Line */}
        <div className="absolute top-[10px] left-0 right-0 h-[2px] bg-slate-100 -translate-y-1/2 rounded-full" />
        
        {/* Active Fill Line */}
        <div 
          className="absolute top-[10px] left-0 h-[2px] bg-emerald-500 -translate-y-1/2 rounded-full transition-all duration-500" 
          style={{ width: `${(trackingStep / 3) * 100}%` }}
        />

        {steps.map((st, idx) => {
          const isCompleted = trackingStep >= idx;
          const isActive = trackingStep === idx;
          const Icon = st.icon;

          return (
            <div key={idx} className="relative flex flex-col items-center z-10 w-1/4">
              {/* Dot badge */}
              <div 
                className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all duration-300 ${
                  isActive
                    ? 'border-[#16A34A] bg-emerald-50 text-[#16A34A] scale-110 shadow-xs ring-4 ring-emerald-500/10'
                    : isCompleted
                    ? 'border-[#16A34A] bg-[#16A34A] text-white'
                    : 'border-slate-200 bg-white text-slate-350'
                }`}
              >
                <Icon className="w-2.5 h-2.5" />
              </div>
              <span className={`text-[8.5px] font-bold mt-1 scale-90 md:scale-100 leading-none truncate max-w-full inline-block ${
                isActive ? 'text-emerald-700 font-extrabold font-sans' : isCompleted ? 'text-slate-800 font-sans' : 'text-slate-400 font-sans'
              }`}>
                {st.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface UserDashboardProps {
  language: 'en' | 'bn';
  orders: Order[];
  userProfile: UserProfile;
  onViewInvoice: (order: Order) => void;
  onCancelOrder?: (orderId: string) => void;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
}

export default function UserDashboard({
  language,
  orders,
  userProfile,
  onViewInvoice,
  onCancelOrder,
  currentUser,
  onOpenAuth
}: UserDashboardProps) {
  const [selectedTrackOrder, setSelectedTrackOrder] = useState<Order | null>(orders[0] || null);

  const t = {
    dash: language === 'en' ? 'My Shopper Dashboard' : 'আমার ক্রেতা ড্যাশবোর্ড',
    member: language === 'en' ? 'Loyal Member Since' : 'নিবন্ধিত সদস্য',
    rewards: language === 'en' ? 'Loyalty Reward Points' : 'রিওয়ার্ড পয়েন্ট ব্যালেন্স',
    activeShipments: language === 'en' ? 'Active Shipments' : 'চলতি শিপমেন্ট',
    ordersTitle: language === 'en' ? 'Order History' : 'অর্ডারের ইতিহাস',
    trackTitle: language === 'en' ? 'Live Order Tracking' : 'লাইভ অর্ডার ট্র্যাকার',
    trackDsc: language === 'en' ? 'Select an order from your history below to inspect its live shipping stage.' : 'যেকোনো অর্ডারের লাইভ শিপিং অগ্রগতি দেখতে নিচের তালিকা থেকে সিলেক্ট করুন।',
    status: language === 'en' ? 'Status' : 'অবস্থা',
    payment: language === 'en' ? 'Payment' : 'পেমেন্ট ধরণ',
    totalAmt: language === 'en' ? 'Amount' : 'সর্বমোট মূল্য',
    id: language === 'en' ? 'ID' : 'অর্ডার আইডি',
    date: language === 'en' ? 'Date' : 'তারিখ',
    noOrders: language === 'en' ? 'No orders recorded yet. Begin shopping!' : 'এখনো কোনো অর্ডার করা হয়নি। প্রথম অর্ডারটি বুক করুন!',
    actionTrack: language === 'en' ? 'Track Order' : 'ট্র্যাক করুন',
    actionInvoice: language === 'en' ? 'Receipt / Invoice' : 'ইনভয়েস / রশিদ',
    pointsNotice: language === 'en' ? 'Use points for discounts on your next checkout.' : 'পরবর্তী কেনাকাটায় এই পয়েন্ট দিয়ে আকর্ষণীয় ছাড় পান।'
  };

  const stepsList = [
    { label: { en: 'Order Placed', bn: 'অর্ডার গৃহীত' }, desc: { en: 'Awaiting shop verification', bn: 'দোকানদার কর্তৃক যাচাই চলছে' }, icon: CheckCircle },
    { label: { en: 'Packaging', bn: 'প্যাকেজিং চলছে' }, desc: { en: 'Product sanitized & quality checked', bn: 'মান যাচাই ও সিল করা হচ্ছে' }, icon: Package },
    { label: { en: 'Shipped', bn: 'শিপড করা হয়েছে' }, desc: { en: 'Handed over to Pathao/RedX delivery', bn: 'পাঠাও বা রেডএক্স কুরিয়ারের পথে' }, icon: Truck },
    { label: { en: 'Delivered', bn: 'ডেলিভারি সম্পন্ন' }, desc: { en: 'Received by customer. Happy shopping!', bn: 'গ্রাহক বুঝে পেয়েছেন। শুভ কামনায়!' }, icon: Smile }
  ];

  return (
    <div className="bg-[#F8FAFC] py-10 px-4 md:px-8 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {!currentUser && (
          <div className="bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border border-emerald-500/20 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in text-left">
            <div className="max-w-lg">
              <span className="text-emerald-700 text-xs font-black uppercase tracking-wider block font-mono">
                ✨ Guest Browsing Active / স্থানীয় ব্রাউজার স্টোরেজ সচল
              </span>
              <h4 className="font-extrabold text-[#0F172A] text-sm md:text-base mt-2">
                {language === 'en' ? 'Register / Log in to secure your shopping points persistently' : 'সব ডেটা আজীবন সেভ রাখতে সাইন আপ / লগইন করুন'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {language === 'en'
                  ? 'Your current orders are temporarily saved in this browser. Create an account to permanently sync, earn 200 welcome reward points, and track shipments across devices!'
                  : 'আপনার করা অর্ডার সাময়িকভাবে এই ব্রাউজারে সংরক্ষিত আছে। অ্যাকাউন্ট তৈরি করলে অর্ডার হারানোর কোনো ভয় থাকবে না এবং ডিভাইস পরিবর্তন করলেও সব ডেটা ফেরত পাবেন।'}
              </p>
            </div>
            <button
              id="dash-auth-btn"
              type="button"
              onClick={onOpenAuth}
              className="bg-[#16A34A] hover:bg-emerald-600 text-white font-extrabold text-xs px-6 py-2.5 rounded-2xl cursor-pointer hover:scale-101 active:scale-99 transition shadow-sm font-sans whitespace-nowrap shrink-0"
            >
              🔐 {language === 'en' ? 'Connect Account Now' : 'পোর্টাল কানেক্ট করুন'}
            </button>
          </div>
        )}
        
        {/* Profile Card Summary & Reward points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main User Meta */}
          <div className="md:col-span-2 bg-gradient-to-br from-[#0F172A] to-slate-850 text-white rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-md border border-slate-800">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full text-[8px] font-black uppercase tracking-widest text-center shadow-md">VIP</span>
              </div>
              
              <div className="text-left">
                <h2 className="text-lg md:text-xl font-extrabold leading-tight block">{userProfile.name}</h2>
                <span className="text-slate-400 text-xs font-normal font-sans block mt-1">{t.member}: {userProfile.memberSince}</span>
                
                {/* Specific mobile profile contacts */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-3 text-slate-300 text-[10px] sm:text-xs">
                  <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-400" /> {userProfile.phone}</span>
                  <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-emerald-400" /> {userProfile.email}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-slate-350 text-xs sm:text-right border-t sm:border-t-0 border-slate-800 pt-4 sm:pt-0 w-full sm:w-auto">
              <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{userProfile.address}, {userProfile.district}</span>
            </div>
          </div>

          {/* Points Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 bg-amber-100 text-amber-700 rounded-bl-2xl font-black text-xs font-mono">
              ★ EARN
            </div>
            
            <div>
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold mb-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>{t.rewards}</span>
              </div>
              <p className="text-3xl font-mono font-black text-[#0F172A] leading-none mb-1.5">
                {language === 'bn' ? userProfile.rewardPoints.toLocaleString('bn') : userProfile.rewardPoints} <span className="text-xs uppercase text-slate-400 font-bold font-sans">Pts</span>
              </p>
            </div>
            
            <p className="text-[10px] text-slate-400 font-bold leading-normal font-sans">
              {t.pointsNotice}
            </p>
          </div>
        </div>

        {/* Live Order tracking section (If an order is active/selected) */}
        {selectedTrackOrder && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-md flex flex-col gap-6">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="text-left">
                <span className="inline-block bg-[#16A34A]/10 text-[#16A34A] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md mb-1.5">
                  Live Dispatch Status
                </span>
                <h3 className="font-extrabold text-[#0F172A] text-sm md:text-base font-sans">
                  {t.trackTitle} - <span className="font-mono text-amber-600">{selectedTrackOrder.id}</span>
                </h3>
              </div>

              <div className="flex flex-col sm:items-end gap-2 text-left sm:text-right">
                <div className="mb-1">
                  <span className="text-xs text-slate-400 block font-normal font-sans">
                    {language === 'en' ? 'Payment Method:' : 'পেমেন্ট গেটওয়ে:'} <strong className="text-slate-700">{selectedTrackOrder.paymentMethod}</strong>
                  </span>
                  <span className="text-sm font-mono font-black text-[#0F172A] block">{formatBDT(selectedTrackOrder.total, language)}</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                  <button
                    id={`view-invoice-track-${selectedTrackOrder.id}`}
                    onClick={() => onViewInvoice(selectedTrackOrder)}
                    className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#16A34A] px-3 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition hover:scale-102 active:scale-98 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{t.actionInvoice}</span>
                  </button>

                  {selectedTrackOrder.status !== 'Cancelled' && (
                    selectedTrackOrder.trackingStep === 0 ? (
                      <button
                        id={`user-cancel-track-${selectedTrackOrder.id}`}
                        onClick={() => {
                          if (confirm(language === 'en' ? 'Are you sure you want to cancel this order?' : 'আপনি কি নিশ্চিত যে এই অর্ডারটি বাতিল করতে চান?')) {
                            onCancelOrder?.(selectedTrackOrder.id);
                            // Update local state to reflect cancellaton immediately
                            setSelectedTrackOrder(prev => prev ? { ...prev, status: 'Cancelled' } : null);
                          }
                        }}
                        className="bg-rose-50 hover:bg-rose-100 border border-rose-250 text-rose-600 px-3.5 py-1.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1 shadow-xs transition hover:scale-[1.01] active:scale-98 cursor-pointer animate-pulse"
                      >
                        <span>❌ {language === 'en' ? 'Cancel Order' : 'বাতিল করুন'}</span>
                      </button>
                    ) : (
                      <span 
                        className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200/50 cursor-not-allowed select-none font-bold" 
                        title={language === 'en' ? 'Merchant processed your order. Cancel is locked.' : 'মার্চেন্ট আপনার অর্ডারটি ইতিমধ্যে গ্রহণ করেছে। বাতিল বোতাম নিষ্ক্রিয়।'}
                      >
                        🔒 {language === 'en' ? 'Cancel Locked' : 'বাতিল নিষ্ক্রিয়'}
                      </span>
                    )
                  )}

                  {selectedTrackOrder.status === 'Cancelled' && (
                    <span className="bg-rose-100/80 border border-rose-320 text-rose-700 px-3 py-1.5 rounded-xl font-black text-xs inline-flex items-center">
                      🛑 {language === 'en' ? 'Cancelled' : 'বাতিলকৃত'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Live Location Update Alert banner */}
            {(selectedTrackOrder.currentLocation || selectedTrackOrder.currentLocationBn) && (
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3 flex-col sm:flex-row shadow-xs">
                <div className="bg-[#16A34A] text-white rounded-xl p-2 shrink-0 flex items-center justify-center">
                  <span className="text-sm font-sans">📍</span>
                </div>
                <div className="leading-normal font-sans">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#16A34A] block mb-0.5">
                    {language === 'en' ? 'LIVE SHIPMENT LOCATION UPDATE' : 'শিপমেন্টের লাইভ অবস্থান আপডেট'}
                  </span>
                  <p className="text-xs font-black text-slate-800">
                    {language === 'en' 
                      ? (selectedTrackOrder.currentLocation || selectedTrackOrder.currentLocationBn) 
                      : (selectedTrackOrder.currentLocationBn || selectedTrackOrder.currentLocation)}
                  </p>
                  <span className="text-[9px] text-slate-450 block mt-1 font-mono">
                    {language === 'en' ? 'Package is scanned and tracked in real-time' : 'পার্সেলটি স্ক্যান করা হয়েছে এবং লাইভ ট্র্যাক করা হচ্ছে'}
                  </span>
                </div>
              </div>
            )}

            {/* Steps Timeline Stepper */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {stepsList.map((stepItem, idx) => {
                const isCompleted = selectedTrackOrder.trackingStep >= idx;
                const StepIcon = stepItem.icon;

                return (
                  <div key={idx} className="flex md:flex-col gap-4 md:items-center md:text-center relative group z-10">
                    {/* Visual Connector Line (Desktop) */}
                    {idx < 3 && (
                      <div className="hidden md:block absolute top-6 left-1/2 w-full h-1 bg-slate-100 -z-10">
                        <div
                          className="bg-[#16A34A] h-full transition-all duration-500"
                          style={{ width: selectedTrackOrder.trackingStep > idx ? '100%' : '0%' }}
                        ></div>
                      </div>
                    )}

                    {/* Step Circle Bubble */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-3 transition-all duration-300 ${
                        isCompleted
                          ? 'border-[#16A34A] bg-emerald-50 text-[#16A34A] scale-110 shadow-md shadow-emerald-100'
                          : 'border-slate-200 bg-white text-slate-350'
                      }`}
                    >
                      <StepIcon className="w-5 h-5" />
                    </div>

                    <div className="text-left md:text-center">
                      <h4
                        className={`text-xs font-black tracking-wide ${
                          isCompleted ? 'text-[#0F172A]' : 'text-slate-400'
                        }`}
                      >
                        {stepItem.label[language]}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-normal leading-relaxed mt-0.5 max-w-xs md:max-w-none">
                        {stepItem.desc[language]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Simulated Alerts status */}
            <div className="bg-slate-50 rounded-2xl p-4 md:p-5 border border-slate-105 mt-2 text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#16A34A] block mb-2 font-mono">
                📢 {language === 'en' ? 'AUTOMATED TRANSACTION DISPATCH SENT' : 'স্বয়ংক্রিয় অর্ডার নোটিফিকেশন তথ্য'}
              </span>
              <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                {language === 'en' 
                  ? 'Upon checkout, critical delivery status notifications are automatically sent to customer contacts.' 
                  : 'অর্ডার সফল হওয়ার পর কাস্টমারের দেওয়া কন্টাক্ট ইনফোতে নিচের মেসেজগুলো স্বয়ংক্রিয়ভাবে পাঠানো হয়েছে:'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* SMS Channel */}
                <div className="bg-white border border-slate-200/80 p-3.5 rounded-xl flex flex-col justify-between shadow-2xs hover:border-[#16A34A]/45 transition">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-extrabold mb-1">
                      <span className="text-[#0F172A] flex items-center gap-1">📱 <span>SMS Gateway</span></span>
                      <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-bold text-[9px] border border-emerald-200">Sent</span>
                    </div>
                    <span className="text-[9px] text-[#16A34A] font-bold font-mono block mb-1.5">📞 {selectedTrackOrder.shippingAddress.phone}</span>
                    <p className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg italic leading-relaxed font-sans font-medium">
                      {language === 'en' 
                        ? `Dear ${selectedTrackOrder.shippingAddress.name}, your order ${selectedTrackOrder.id} for BDT ${selectedTrackOrder.total.toLocaleString()} has been placed successfully. Thank you!` 
                        : `প্রিয় ${selectedTrackOrder.shippingAddress.name}, আপনার অর্ডার ${selectedTrackOrder.id} সফল হয়েছে! সর্বমোট মূল্য: BDT ${selectedTrackOrder.total.toLocaleString()} টাকা। ধন্যবাদ!`}
                    </p>
                  </div>
                  <span className="text-[8px] text-slate-400 block mt-2 font-mono">Status: Delivered (100% Signal)</span>
                </div>

                {/* WhatsApp Channel */}
                <div className="bg-white border border-slate-200/80 p-3.5 rounded-xl flex flex-col justify-between shadow-2xs hover:border-emerald-500/40 transition">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-extrabold mb-1">
                      <span className="text-[#0F172A] flex items-center gap-1 font-sans">💬 <span className="text-emerald-600">WhatsApp App</span></span>
                      <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-bold text-[9px] border border-emerald-200">Active</span>
                    </div>
                    <span className="text-[9px] text-emerald-600 font-bold font-mono block mb-1.5">🟢 {selectedTrackOrder.shippingAddress.phone}</span>
                    <p className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg italic leading-relaxed font-sans font-medium">
                      {language === 'en'
                        ? `👋 Hello! Your order ${selectedTrackOrder.id} has been logged in our merchant system. We will contact you soon.`
                        : `👋 প্রিয় ${selectedTrackOrder.shippingAddress.name}! অর্ডার ${selectedTrackOrder.id} গ্রহণ করা হয়েছে। দ্রুত ডেলিভারির কাজ চলছে।`}
                    </p>
                  </div>
                  <span className="text-[8px] text-slate-400 block mt-2 font-mono">Channel: WA Cloud Business API</span>
                </div>

                {/* Email Channel */}
                <div className="bg-white border border-slate-200/80 p-3.5 rounded-xl flex flex-col justify-between shadow-2xs hover:border-blue-500/45 transition">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-extrabold mb-1">
                      <span className="text-[#0F172A] flex items-center gap-1">✉️ <span>SMTP Email</span></span>
                      <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-bold text-[9px] border border-emerald-200">Inboxed</span>
                    </div>
                    <span className="text-[9px] text-slate-450 font-mono block mb-1.5">📧 {selectedTrackOrder.shippingAddress.phone.replace(/[^0-9]/g, '') || 'customer'}@gmail.com</span>
                    <p className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg italic leading-relaxed font-sans font-medium">
                      {language === 'en'
                        ? `Digital invoice receipt has been compiled and emailed. Grand value: ${formatBDT(selectedTrackOrder.total, 'en')}.`
                        : `অর্ডারের ডিজিটাল কপি পিডিএফ গ্রাহকের জিমেইল-এ সফলভাবে ইনবক্স করা হয়েছে।`}
                    </p>
                  </div>
                  <span className="text-[8px] text-slate-400 block mt-2 font-mono">Mail Engine: TLS Secure Crypt</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* List of Previous Orders */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col gap-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-[#0F172A] text-sm md:text-base font-sans">
              {t.ordersTitle}
            </h3>
            <p className="text-xs text-slate-400 leading-normal font-sans mt-0.5">
              {t.trackDsc}
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-sans">
              {t.noOrders}
            </div>
          ) : (
            <>
              {/* Desktop view (Table layout with inline progression track) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-105 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">{t.id}</th>
                      <th className="py-3 px-4">{t.date}</th>
                      <th className="py-3 px-4">{t.status}</th>
                      <th className="py-3 px-4 hidden lg:table-cell">{language === 'en' ? 'Progress Tracker' : 'শিপমেন্ট ট্র্যাকিং'}</th>
                      <th className="py-3 px-4">{t.payment}</th>
                      <th className="py-3 px-4 text-right">{t.totalAmt}</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => (
                      <tr
                        key={ord.id}
                        onClick={() => setSelectedTrackOrder(ord)}
                        className={`border-b border-slate-101 last:border-none hover:bg-slate-50 cursor-pointer transition ${
                          selectedTrackOrder?.id === ord.id ? 'bg-emerald-50/50' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          {ord.id}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-sans">
                          {ord.date}
                        </td>
                        <td className="py-3.5 px-4 font-sans">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold ${
                              ord.status === 'Delivered'
                                ? 'bg-emerald-55 text-emerald-800'
                                : ord.status === 'Cancelled'
                                ? 'bg-rose-55 text-rose-800'
                                : ord.status === 'Shipped'
                                ? 'bg-blue-55 text-blue-800'
                                : 'bg-amber-55 text-amber-800'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 hidden lg:table-cell min-w-[200px]">
                          <MiniOrderStepper trackingStep={ord.trackingStep} isCancelled={ord.status === 'Cancelled'} language={language} />
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-sans font-medium">
                          {ord.paymentMethod}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800 text-right">
                          {formatBDT(ord.total, language)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex flex-wrap items-center justify-center gap-1.5">
                            <button
                              id={`track-button-${ord.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTrackOrder(ord);
                              }}
                              className="bg-white border border-slate-205 text-[#0F172A] hover:bg-[#0F172A] hover:text-white px-2 py-1 rounded-lg font-bold transition flex items-center justify-center gap-1 text-[11px]"
                            >
                              <Eye className="w-3 h-3" />
                              <span>{t.actionTrack}</span>
                            </button>
                            
                            <button
                              id={`invoice-button-${ord.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewInvoice(ord);
                              }}
                              className="bg-emerald-50 border border-emerald-205 text-[#16A34A] hover:bg-[#16A34A] hover:text-white px-2 py-1 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer text-[11px]"
                            >
                              <FileText className="w-3 h-3" />
                              <span>{language === 'en' ? 'Invoice' : 'রসিদ'}</span>
                            </button>

                            {ord.status !== 'Cancelled' && (
                              ord.trackingStep === 0 ? (
                                <button
                                  id={`row-cancel-button-${ord.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(language === 'en' ? 'Are you sure you want to cancel this order?' : 'আপনি কি নিশ্চিত যে এই অর্ডারটি বাতিল করতে চান?')) {
                                      onCancelOrder?.(ord.id);
                                      if (selectedTrackOrder?.id === ord.id) {
                                        setSelectedTrackOrder(prev => prev ? { ...prev, status: 'Cancelled' } : null);
                                      }
                                    }
                                  }}
                                  className="bg-rose-50 hover:bg-rose-500 hover:text-white border border-rose-200 text-rose-600 px-2.5 py-1 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer text-[11px]"
                                >
                                  <span>{language === 'en' ? 'Cancel' : 'বাতিল'}</span>
                                </button>
                              ) : (
                                <span 
                                  className="text-[10px] text-slate-400 bg-slate-100 font-bold py-1 px-2 rounded-lg cursor-not-allowed select-none border border-slate-200/50" 
                                  title={language === 'en' ? 'Order accepted by store. Cannot cancel.' : 'অর্ডারটি মার্চেন্ট গ্রহণ করেছে। বাতিল করতে কাস্টমার কেয়ারে কল করুন।'}
                                >
                                  🔒 {language === 'en' ? 'Locked' : 'লকড'}
                                </span>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View: High-fidelity card layout with visible tracking steps progress */}
              <div className="block md:hidden flex flex-col gap-4">
                {orders.map((ord) => {
                  const isSelected = selectedTrackOrder?.id === ord.id;
                  return (
                    <div
                      key={ord.id}
                      onClick={() => setSelectedTrackOrder(ord)}
                      className={`border rounded-2xl p-4 flex flex-col gap-3.5 transition-all duration-300 select-none cursor-pointer ${
                        isSelected
                          ? 'border-[#16A34A] bg-emerald-50/15 shadow-xs ring-2 ring-[#16A34A]/8'
                          : 'border-slate-150 bg-white hover:border-slate-250 hover:bg-slate-50/50'
                      }`}
                    >
                      {/* Header row metadata */}
                      <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                        <div className="text-left">
                          <span className="font-mono text-xs font-bold text-[#0F172A] block">
                            #{ord.id}
                          </span>
                          <span className="text-[10.5px] text-slate-400 font-sans block mt-0.5">
                            {ord.date}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-mono font-black text-slate-800 block">
                            {formatBDT(ord.total, language)}
                          </span>
                          <span className="text-[10px] text-slate-450 font-bold uppercase block mt-0.5">
                            {ord.paymentMethod}
                          </span>
                        </div>
                      </div>

                      {/* Micro Stepper Progression Stage Container */}
                      <div className="bg-slate-50/50 rounded-xl px-3 py-3 border border-slate-100">
                        <div className="flex justify-between items-center mb-2.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 font-sans">
                            {language === 'en' ? 'Real-Time Delivery Stage:' : 'ডেলিভারি ধাপ:'}
                          </span>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase ${
                            ord.status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'Cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : ord.status === 'Shipped'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                        <MiniOrderStepper trackingStep={ord.trackingStep} isCancelled={ord.status === 'Cancelled'} language={language} />
                      </div>

                      {/* Touch Friendly Action Tray */}
                      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100/60">
                        <button
                          id={`mob-track-button-${ord.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTrackOrder(ord);
                          }}
                          className="bg-white border border-slate-200 text-[#0F172A] hover:bg-slate-50 active:bg-[#0F172A] active:text-white px-2.5 py-2 rounded-xl font-extrabold transition flex items-center justify-center gap-1 text-[11px] flex-1 min-h-[38px]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{t.actionTrack}</span>
                        </button>
                        
                        <button
                          id={`mob-invoice-button-${ord.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewInvoice(ord);
                          }}
                          className="bg-emerald-50 border border-emerald-150 text-[#16A34A] hover:bg-emerald-100/50 active:bg-[#16A34A] active:text-white px-2.5 py-2 rounded-xl font-extrabold transition flex items-center justify-center gap-1 cursor-pointer text-[11px] flex-1 min-h-[38px]"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{language === 'en' ? 'Invoice' : 'রসিদ'}</span>
                        </button>

                        {ord.status !== 'Cancelled' && (
                          ord.trackingStep === 0 ? (
                            <button
                              id={`mob-cancel-button-${ord.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(language === 'en' ? 'Are you sure you want to cancel this order?' : 'আপনি কি নিশ্চিত যে এই অর্ডারটি বাতিল করতে চান?')) {
                                  onCancelOrder?.(ord.id);
                                  if (selectedTrackOrder?.id === ord.id) {
                                    setSelectedTrackOrder(prev => prev ? { ...prev, status: 'Cancelled' } : null);
                                  }
                                }
                              }}
                              className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 px-2.5 py-2 rounded-xl font-extrabold transition flex items-center justify-center gap-1 cursor-pointer text-[11px] flex-1 min-h-[38px]"
                            >
                              <span>{language === 'en' ? 'Cancel' : 'বাতিল'}</span>
                            </button>
                          ) : (
                            <span 
                              className="text-[9.5px] text-slate-400 bg-slate-100 font-extrabold py-2 px-3 rounded-xl cursor-not-allowed select-none border border-slate-200/50 flex-1 text-center flex items-center justify-center min-h-[38px]" 
                              title={language === 'en' ? 'Order accepted by store. Cannot cancel.' : 'অর্ডারটি মার্চেন্ট গ্রহণ করেছে। বাতিল করতে কাস্টমার কেয়ারে কল করুন।'}
                            >
                              🔒 {language === 'en' ? 'Locked' : 'লকড'}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
