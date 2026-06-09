import React, { useState, useEffect } from 'react';
import { ArrowRight, Flame, ShieldCheck, Sparkles, Percent, Smartphone, Clock } from 'lucide-react';

interface HeroBannerProps {
  language: 'en' | 'bn';
  onNavigateToCategory: (categoryId: string) => void;
  onExploreFlashSale: () => void;
  siteBanners?: any[];
}

export default function HeroBanner({ language, onNavigateToCategory, onExploreFlashSale, siteBanners }: HeroBannerProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 34, seconds: 12 });

  const slides = (siteBanners && siteBanners.length > 0) ? siteBanners : [
    {
      titleEN: 'Shine in Elite Traditional Heritage',
      titleBN: 'আভিজাত্য আর ঐতিহ্যের রাজকীয় উৎসব',
      subtitleEN: 'UP TO 25% OFF ON RAJSHAHI SILK & TANGIAL WEAVES',
      subtitleBN: 'রাজশাহী সিলেক্টেড শাড়ি এবং পাঞ্জাবিতে ২৫% পর্যন্ত ছাড়',
      descEN: 'Experience pure mulberry silk embroidery luxury & lightweight elegance designed by top regional artisans of Bengal.',
      descBN: 'খাঁটি তুঁত রেশমের সূক্ষ্ম কাজ ও পালকের মতো হালকা আভিজাত্যময় ড্রেস কালেকশন, বোনা হয়েছে বাংলার নিপুণ কারিগরদের হাতে।',
      badgeEN: 'Eid-ul-Adha Special Edition',
      badgeBN: 'ঈদ-উল-আযহা বিশেষ কালেকশন',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200',
      ctaEN: 'Shop Silk Panjabis',
      ctaBN: 'সিল্ক পাঞ্জাবি কিনুন',
      category: 'fashion'
    },
    {
      titleEN: 'Modern Bangladeshi Smart Living',
      titleBN: 'স্মার্ট ডিভাইসে আধুনিক লাইফস্টাইল',
      subtitleEN: 'FLAT BDT 1,000 CASHBACK WITH BKASH & NAGAD',
      subtitleBN: 'বিকাশ ও রকেট পেমেন্টে ফ্ল্যাট ১০০০ টাকা ইনস্ট্যান্ট ক্যাশব্যাক',
      descEN: 'Get genuine high performance wearable gadgets, security alarms, and AMOLED smartwatches with native Bangla.',
      descBN: 'অরিজিনাল ও ওয়ারেন্টিযুক্ত আইটি প্রোডাক্ট, সিসিটিভি এবং বাংলা ফন্ট সংবলিত প্রিমিয়াম অ্যামোলেড ডিসপ্লে স্মার্টওয়াচ।',
      badgeEN: 'Next-Gen Wearables 2026',
      badgeBN: 'নেক্সট-জেন ওয়্যারেবলস ২০২৬',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200',
      ctaEN: 'View Premium Gadgets',
      ctaBN: 'গ্যাজেট কালেকশন দেখুন',
      category: 'gadgets'
    }
  ];

  // Carousel auto-rotate
  useEffect(() => {
    if (slides.length <= 1) return;
    const slideInterval = setInterval(() => {
      setActiveSlide((prev) => (prev >= slides.length - 1 ? 0 : prev + 1));
    }, 8000);
    return () => clearInterval(slideInterval);
  }, [slides.length]);

  // Countdown timer clock ticking simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 4, minutes: 0, seconds: 0 }; // Loop simulation
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeNum = (num: number) => {
    const str = num < 10 ? `0${num}` : num.toString();
    if (language === 'bn') {
      const bnDigits: Record<string, string> = {
        '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
      };
      return str.split('').map(d => bnDigits[d] || d).join('');
    }
    return str;
  };

  const currentSlide = slides[activeSlide] || slides[0];

  return (
    <section className="bg-slate-50 pt-3 pb-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Carousel Banner Selector (occupies 2 cols) in sleek 16:9 aspect ratio */}
        <div className="lg:col-span-2 relative aspect-[16/9] w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-slate-100 group bg-slate-900 text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent z-10"></div>
          
          {/* Background image zoom effect */}
          <div className="absolute inset-0">
            <img
              src={currentSlide.image}
              alt={language === 'en' ? currentSlide.titleEN : currentSlide.titleBN}
              className="w-full h-full object-cover object-center transition-transform duration-[8000ms] scale-105 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Banner content */}
          <div className="absolute inset-y-0 left-0 z-20 flex flex-col justify-center px-4 md:px-12 max-w-xl text-left">
            <span className="inline-flex items-center gap-1 bg-[#16A34A] text-white font-sans text-[8px] md:text-xs font-extrabold uppercase px-2 py-1 rounded-full mb-1 sm:mb-2.5 w-max">
              <Sparkles className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
              <span>{language === 'en' ? currentSlide.badgeEN : currentSlide.badgeBN}</span>
            </span>
            <p className="text-amber-400 font-mono text-[8px] md:text-xs font-bold uppercase tracking-widest leading-none mb-1 sm:mb-2">
              {language === 'en' ? currentSlide.subtitleEN : currentSlide.subtitleBN}
            </p>
            <h1 className="text-sm sm:text-xl md:text-3xl lg:text-4xl font-sans font-extrabold tracking-tight leading-tight mb-2 text-white">
              {language === 'en' ? currentSlide.titleEN : currentSlide.titleBN}
            </h1>
            <p className="text-slate-300 text-[10px] md:text-sm font-normal mb-4 leading-relaxed max-w-md hidden sm:block">
              {language === 'en' ? currentSlide.descEN : currentSlide.descBN}
            </p>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                id="hero-cta-btn"
                onClick={() => onNavigateToCategory(currentSlide.category)}
                className="bg-[#16A34A] hover:bg-emerald-500 text-white font-sans text-[9px] sm:text-xs md:text-sm font-bold py-1.5 px-3 sm:py-3 sm:px-6 rounded-lg sm:rounded-xl flex items-center gap-1 transition-all shadow-md active:scale-95 duration-200"
              >
                <span>{language === 'en' ? currentSlide.ctaEN : currentSlide.ctaBN}</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              
              <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 font-medium font-sans">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>{language === 'en' ? 'Genuine Local Warranty' : '১০০% জেনুইন ওয়ারেন্টি'}</span>
              </div>
            </div>
          </div>

          {/* Slider dot controls */}
          <div className="absolute bottom-3 right-4 sm:bottom-4 sm:right-6 z-30 flex gap-1.5">
            <button
              onClick={() => setActiveSlide(0)}
              className={`w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full transition-all ${activeSlide === 0 ? 'bg-[#16A34A] w-3.5 sm:w-5' : 'bg-white/40 hover:bg-white/60'}`}
            ></button>
            <button
              onClick={() => setActiveSlide(1)}
              className={`w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full transition-all ${activeSlide === 1 ? 'bg-[#16A34A] w-3.5 sm:w-5' : 'bg-white/40 hover:bg-white/60'}`}
            ></button>
          </div>
        </div>

        {/* Right column: Flash Sale Banner & Limited stock UI configured in slim 16:9 aspect ratio */}
        <div className="bg-[#0F172A] rounded-2xl md:rounded-3xl p-3 sm:p-5 text-white flex flex-col justify-between shadow-lg border border-slate-800 relative overflow-hidden group aspect-[16/9] lg:aspect-auto lg:h-full">
          <div className="absolute top-0 right-0 px-2 py-0.5 bg-amber-500 text-[#0F172A] font-extrabold text-[8px] sm:text-[10px] uppercase rounded-bl-xl tracking-wider font-mono flex items-center gap-1 pointer-events-none">
            <Percent className="w-2.5 h-2.5" />
            <span>{language === 'en' ? 'HOT DEALS' : 'হট ডিলস'}</span>
          </div>
          
          <div className="flex flex-col h-full justify-between gap-1">
            <div className="flex items-center gap-1.5 text-[#16A34A]">
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#16A34A] animate-pulse" />
              <span className="text-[8px] sm:text-[11px] uppercase font-extrabold tracking-wider font-mono">{language === 'en' ? 'Flash Sale of the Day' : 'আজকের ফ্ল্যাশ সেল'}</span>
            </div>

            <div className="flex flex-row lg:flex-col items-center lg:items-start justify-between gap-3 my-0.5 sm:my-1.5">
              <div className="text-left">
                <h3 className="text-xs sm:text-base md:text-lg font-sans font-bold leading-tight text-white animate-pulse">
                  {language === 'en' ? 'Grab Premium Bestsellers' : 'প্রিমিয়াম পণ্য লুফে নিন!'}
                </h3>
                <p className="text-[8px] sm:text-xs text-slate-400 font-normal leading-normal hidden md:block">
                  {language === 'en' ? 'Stock is running out extremely fast. Prices rise as countdown ends.' : 'স্টক দ্রুত শেষ হয়ে যাচ্ছে। সময় শেষ হওয়ার পূর্বেই অর্ডার কনফার্ম করুন।'}
                </p>
              </div>

              {/* Countdown layout */}
              <div className="flex items-center gap-1 justify-center shrink-0">
                <div className="flex flex-col items-center">
                  <span className="bg-slate-800 border border-slate-700 text-amber-500 font-mono text-[10px] sm:text-sm font-black p-1 rounded-md shadow-inner">
                    {formatTimeNum(timeLeft.hours)}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-500">:</span>
                <div className="flex flex-col items-center">
                  <span className="bg-slate-800 border border-slate-700 text-amber-500 font-mono text-[10px] sm:text-sm font-black p-1 rounded-md shadow-inner">
                    {formatTimeNum(timeLeft.minutes)}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-500">:</span>
                <div className="flex flex-col items-center">
                  <span className="bg-slate-800 border border-slate-700 text-amber-500 font-mono text-[10px] sm:text-sm font-black p-1 rounded-md shadow-inner">
                    {formatTimeNum(timeLeft.seconds)}
                  </span>
                </div>
              </div>
            </div>

            {/* Limited Stock Bar */}
            <div className="bg-slate-850 p-1.5 sm:p-2 rounded-lg border border-slate-800 text-[8px] sm:text-xs">
              <div className="flex justify-between items-center mb-1 font-sans">
                <span className="text-slate-400">{language === 'en' ? 'Campaign Claimed' : 'ক্যাম্পেইন দাবি করা হয়েছে'}</span>
                <span className="font-extrabold text-[#16A34A]">৮৭% {language === 'en' ? 'Sold' : 'বিক্রিত'}</span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-amber-500 h-full rounded-full w-[87%] animate-pulse"></div>
              </div>
            </div>
          </div>

          <button
            id="flash-sale-explore-btn"
            onClick={onExploreFlashSale}
            className="w-full bg-[#16A34A] hover:bg-emerald-500 transition-all text-white py-1 sm:py-2 rounded-lg text-[9px] sm:text-xs font-bold font-sans tracking-wide uppercase flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>{language === 'en' ? 'Explore Flash Sale Products' : 'ফ্ল্যাশ সেল প্রোডাক্ট দেখুন'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

      </div>
    </section>
  );
}
