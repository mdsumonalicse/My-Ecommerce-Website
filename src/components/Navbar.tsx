import React, { useState } from 'react';
import { Search, ShoppingBag, Heart, User, ChevronDown, Menu, X, Landmark, RefreshCw, Layers, Camera, Sparkles, Folder, Settings, Home, MessageSquare } from 'lucide-react';
import { Page, Product, UserAccount } from '../types';
import { formatBDT } from '../utils';

interface NavbarProps {
  language: 'en' | 'bn';
  setLanguage: (lang: 'en' | 'bn') => void;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  cartCount: number;
  cartTotal: number;
  wishlistCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onOpenCart: () => void;
  userRole: 'user' | 'admin';
  setUserRole: (role: 'user' | 'admin') => void;
  categoriesList: any[];
  siteConfigs: any;
  currentUser: UserAccount | null;
  onSignOut: () => void;
  onOpenAuth: () => void;
  allProducts?: Product[];
  onViewProduct?: (product: Product) => void;
  activeAdminTab?: 'metrics' | 'orders' | 'inventory' | 'sales' | 'account' | 'settings' | 'users' | 'forecasting';
  setActiveAdminTab?: (tab: 'metrics' | 'orders' | 'inventory' | 'sales' | 'account' | 'settings' | 'users' | 'forecasting') => void;
  onToggleSupport?: () => void;
}

export default function Navbar({
  language,
  setLanguage,
  currentPage,
  setCurrentPage,
  cartCount,
  cartTotal,
  wishlistCount,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onOpenCart,
  userRole,
  setUserRole,
  categoriesList,
  siteConfigs,
  currentUser,
  onSignOut,
  onOpenAuth,
  allProducts = [],
  onViewProduct,
  activeAdminTab,
  setActiveAdminTab,
  onToggleSupport
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isNavCategoryDropdownOpen, setIsNavCategoryDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [isAdminMoreOpen, setIsAdminMoreOpen] = useState(false);
  
  // Real-time Autocomplete States
  const [searchFocused, setSearchFocused] = useState(false);

  // Wishlist Heartbeat Trigger State
  const [isWishlistBeating, setIsWishlistBeating] = useState(false);
  const prevWishlistCountRef = React.useRef(wishlistCount);

  React.useEffect(() => {
    if (wishlistCount > prevWishlistCountRef.current) {
      setIsWishlistBeating(true);
      const timer = setTimeout(() => setIsWishlistBeating(false), 800);
      return () => clearTimeout(timer);
    }
    prevWishlistCountRef.current = wishlistCount;
  }, [wishlistCount]);

  // Visual Image Search States
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanningProgress, setScanningProgress] = useState(0);
  const [scanningStatus, setScanningStatus] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [visualSearchMatches, setVisualSearchMatches] = useState<{ product: Product; matchScore: number }[]>([]);

  // Autocomplete suggestions search matching
  const searchResults = searchQuery.trim()
    ? allProducts.filter(p => {
        const q = searchQuery.toLowerCase().trim();
        return (
          p.title.toLowerCase().includes(q) ||
          p.banglaTitle.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.banglaDescription && p.banglaDescription.includes(q))
        );
      }).slice(0, 5)
    : [];

  const handleSuggestionClick = (product: Product) => {
    setSearchQuery('');
    setSearchFocused(false);
    if (onViewProduct) {
      onViewProduct(product);
    }
  };

  // Image Upload and Visual Search Algorithm
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    startVisualSearchProcess(file);
  };

  const startVisualSearchProcess = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setUploadedImage(src);
      setUploadedFileName(file.name);
      setIsScanning(true);
      setScanningProgress(0);
      setVisualSearchMatches([]);

      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        if (progress > 100) {
          progress = 100;
        }
        setScanningProgress(progress);

        if (progress < 25) {
          setScanningStatus(language === 'en' ? 'Analyzing color spectrum...' : 'ছবির রঙের বিন্যাস বিশ্লেষণ করা হচ্ছে...');
        } else if (progress < 50) {
          setScanningStatus(language === 'en' ? 'Scanning texture details...' : 'প্যাটার্ন ও বুনন বৈশিষ্ট্য পরীক্ষা করা হচ্ছে...');
        } else if (progress < 75) {
          setScanningStatus(language === 'en' ? 'Matching against premium catalog...' : 'আমাদের সংগ্রহশালা থেকে মেলানো হচ্ছে...');
        } else if (progress < 100) {
          setScanningStatus(language === 'en' ? 'Calculating relevance score...' : 'নির্ভুলতা স্কোর গণনা করা হচ্ছে...');
        } else {
          clearInterval(interval);
          runVisualSearchAlgorithm(src, file.name);
        }
      }, 100);
    };
    reader.readAsDataURL(file);
  };

  const runVisualSearchAlgorithm = (imageSrc: string, nameOfFile: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        fallbackMatch(nameOfFile);
        return;
      }
      ctx.drawImage(img, 0, 0, 16, 16);
      const data = ctx.getImageData(0, 0, 16, 16).data;
      
      let rSum = 0, gSum = 0, bSum = 0;
      for (let i = 0; i < data.length; i += 4) {
        rSum += data[i];
        gSum += data[i+1];
        bSum += data[i+2];
      }
      const totalPixels = data.length / 4;
      const rAvg = rSum / totalPixels;
      const gAvg = gSum / totalPixels;
      const bAvg = bSum / totalPixels;

      let dominantColor = 'white';
      const brightness = (rAvg + gAvg + bAvg) / 3;
      
      if (brightness < 65) {
        dominantColor = 'dark';
      } else if (brightness > 215) {
        dominantColor = 'white';
      } else {
        if (rAvg > gAvg && rAvg > bAvg) {
          if (gAvg > 110 && bAvg < 110) dominantColor = 'yellow';
          else dominantColor = 'red';
        } else if (gAvg > rAvg && gAvg > bAvg) {
          dominantColor = 'green';
        } else if (Math.abs(rAvg - gAvg) < 25 && Math.abs(gAvg - bAvg) < 25) {
          dominantColor = 'gray';
        } else {
          dominantColor = 'dark';
        }
      }

      const matches = allProducts.map(p => {
        let score = 35;
        const pTitle = p.title.toLowerCase();
        const pCat = p.category.toLowerCase();
        const fName = nameOfFile.toLowerCase();

        const terms = [
          { keys: ['saree', 'shari', 'weaver', 'জামদানি', 'শাড়ি'], scoreBoost: 60, id: 'f2' },
          { keys: ['panjabi', 'পাঞ্জাবি', 'সিল্ক'], scoreBoost: 60, id: 'f1' },
          { keys: ['watch', 'clock', 'ঘড়ি', 'স্মার্টওয়াচ'], scoreBoost: 60, id: 'e1' },
          { keys: ['headphone', 'earphone', 'headset', 'এইচ৭', 'হেডফোন'], scoreBoost: 60, id: 'e2' },
          { keys: ['attar', 'perfume', 'আতর', 'সুবাস'], scoreBoost: 60, id: 'i1' },
          { keys: ['quran', 'koran', 'কুরআন', 'কোরআন', 'রেহাল'], scoreBoost: 60, id: 'i2' },
          { keys: ['rug', 'carpet', 'carpet', 'কার্পেট', 'জুট'], scoreBoost: 60, id: 'h1' },
          { keys: ['powerbank', 'power', 'পাওয়ার'], scoreBoost: 60, id: 'g1' },
          { keys: ['cctv', 'camera', 'সিসিটিভি', 'ক্যামেরা'], scoreBoost: 60, id: 'c1' },
          { keys: ['wood', 'block', 'toy', 'খেলনা', 'কাঠের'], scoreBoost: 60, id: 'k1' }
        ];

        terms.forEach(t => {
          if (t.id === p.id) {
            t.keys.forEach(k => {
              if (fName.includes(k) || pTitle.includes(k)) {
                score += t.scoreBoost;
              }
            });
          }
        });

        if (dominantColor === 'red') {
          if (p.id === 'f2') score += 40;
          if (p.id === 'k1') score += 20;
        } else if (dominantColor === 'green') {
          if (p.id === 'i2') score += 45;
          if (p.id === 'f1') score += 20;
        } else if (dominantColor === 'yellow') {
          if (p.id === 'i1') score += 45;
          if (p.id === 'h1' || p.id === 'f2') score += 30;
        } else if (dominantColor === 'dark') {
          if (p.id === 'e1' || p.id === 'e2' || p.id === 'g1') score += 40;
          if (p.id === 'f1') score += 20;
        } else if (dominantColor === 'gray') {
          if (p.id === 'e1' || p.id === 'g1' || p.id === 'e2') score += 35;
        } else if (dominantColor === 'white') {
          if (p.id === 'c1') score += 45;
          if (p.id === 'f1') score += 35;
          if (p.id === 'e2') score += 20;
        }

        const matchScore = Math.min(99, Math.max(50, Math.round(score)));
        return { product: p, matchScore };
      });

      matches.sort((a, b) => b.matchScore - a.matchScore);
      setVisualSearchMatches(matches);
      setIsScanning(false);
    };

    img.onerror = () => {
      fallbackMatch(nameOfFile);
    };
    img.src = imageSrc;
  };

  const fallbackMatch = (nameOfFile: string) => {
    const matches = allProducts.map(p => {
      const score = 55 + Math.random() * 25;
      return { product: p, matchScore: Math.round(score) };
    });
    setVisualSearchMatches(matches);
    setIsScanning(false);
  };

  const t = {
    searchPlaceholder: language === 'en' ? 'Search premium organic products, designer sarees...' : 'প্রিমিয়াম পণ্য, ডিজাইনার শাড়ি খুঁজুন...',
    allCategories: language === 'en' ? 'All Categories' : 'সকল ক্যাটাগরি',
    home: language === 'en' ? 'Home' : 'হোম',
    dashboard: language === 'en' ? 'Dashboard' : 'ড্যাশবোর্ড',
    admin: language === 'en' ? 'Admin Panel' : 'অ্যাডমিন প্যানেল',
    freeDelivery: language === 'en' ? 'Free Shipping on orders above ৳5,000' : '৫,০০০ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি',
    hotline: language === 'en' ? `Hotline: ${siteConfigs.hotline || '01712-345678'}` : `হটলাইন: ${siteConfigs.hotline || '০১৭১২-৩৪৫৬৭৮'}`,
    wishlist: language === 'en' ? 'Wishlist' : 'পছন্দের তালিকা',
    cart: language === 'en' ? 'Cart' : 'কার্ট',
    profile: language === 'en' ? 'My Account' : 'আমার অ্যাকাউন্ট',
    toggleLanguage: language === 'en' ? 'বাংলা' : 'English'
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage('home');
    setIsCategoryDropdownOpen(false);
    setIsNavCategoryDropdownOpen(false);
  };

  const handleHomeClick = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navFontFamilyClass = siteConfigs.navFontFamily === 'mono' ? 'font-mono' : siteConfigs.navFontFamily === 'serif' ? 'font-serif' : 'font-sans';
  const navFontSizeClass = siteConfigs.navFontSize === 'xs' ? 'text-xs' : siteConfigs.navFontSize === 'base' ? 'text-base' : siteConfigs.navFontSize === 'lg' ? 'text-lg' : 'text-sm';
  const navPaddingClass = siteConfigs.navButtonPadding || 'py-2 px-3';

  const navItems = siteConfigs.navItems || [
    { id: 'home', title: language === 'en' ? 'Home' : 'হোম', visible: true },
    { id: 'dashboard', title: language === 'en' ? 'Dashboard' : 'ড্যাশবোর্ড', visible: true },
    { id: 'admin', title: language === 'en' ? 'Admin Panel' : 'অ্যাডমিন প্যানেল', visible: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Dynamic Top Bar */}
      {currentPage !== 'admin-dashboard' && (
        <div 
          className="hidden md:flex text-white text-[10px] md:text-xs py-1.5 md:py-2 px-4 md:px-8 items-center justify-between font-sans tracking-wide gap-3"
          style={{ backgroundColor: siteConfigs.navBgColor || '#0F172A' }}
        >
          <div className="flex items-center gap-1.5 flex-1 overflow-hidden">
            <span className="bg-rose-600 text-white font-black text-[8px] md:text-[9px] px-1.5 py-0.5 rounded animate-pulse shrink-0">
              {language === 'en' ? 'HOT NEWS' : 'অফিশিয়াল খবর'}
            </span>
            <marquee scrollamount="3" className="text-[10px] md:text-xs text-white uppercase tracking-wider font-bold select-none cursor-pointer flex-1">
              {language === 'en' 
                ? (siteConfigs.newsHeadlinesEN || '🔥 Flash Deal: Special discounts on traditional sarees and smart gadgets! | 🚚 Free Shipping on orders above ৳5,000!') 
                : (siteConfigs.newsHeadlinesBN || '🔥 স্পেশাল অফার: টাঙ্গাইল শাড়ি ও স্মার্ট গ্যাজেটে বিশেষ ছাড়! | 🚚 ৫,০০০ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি!')}
            </marquee>
          </div>
          <div className="hidden md:flex items-center gap-6 shrink-0">
            <span className="text-slate-200 font-medium">{t.hotline}</span>
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div 
        className="backdrop-blur-md shadow-sm border-b border-slate-100 pt-9 pb-4 md:py-4 px-4 md:px-8"
        style={{ backgroundColor: siteConfigs.navMainBgColor || '#ffffff' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div 
            id="brand-logo"
            onClick={handleHomeClick} 
            className="flex items-center gap-2 cursor-pointer select-none group max-w-[280px] md:max-w-none flex-nowrap shrink-0"
          >
            {siteConfigs.logoImageUrl ? (
              <div className="flex items-center gap-2 flex-nowrap shrink-0 min-w-0">
                <img 
                  src={siteConfigs.logoImageUrl} 
                  alt="Logo" 
                  style={{ height: `${siteConfigs.logoSize || 48}px` }} 
                  className="w-auto object-contain max-h-[38px] sm:max-h-[44px] md:max-h-none max-w-[124px] sm:max-w-[200px] shrink-0 animate-fade-in" 
                  referrerPolicy="no-referrer" 
                />
                {currentPage === 'admin-dashboard' && (
                  <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-0.5 select-none shadow-xs whitespace-nowrap shrink-0">
                    <span className="inline-block w-1.5 bg-emerald-500 h-1.5 rounded-full animate-pulse shrink-0"></span>
                    <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider font-mono whitespace-nowrap">
                       🔒 {language === 'en' ? 'Admin Portal' : 'কন্ট্রোল প্যানেল'}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 overflow-hidden">
                <div 
                  className="text-white p-2 rounded-xl shadow-md transition-transform duration-300 group-hover:scale-105 shrink-0"
                  style={{ 
                    backgroundColor: siteConfigs.logoColor || '#16A34A',
                    boxShadow: `0 4px 6px -1px ${siteConfigs.logoColor || '#16A34A'}40`
                  }}
                >
                  <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-base md:text-2xl font-sans font-extrabold tracking-tight text-[#0F172A] leading-none block truncate">
                    {language === 'en' 
                      ? (siteConfigs.websiteNameEN || 'AmarBazar') 
                      : (siteConfigs.websiteNameBN || 'আমারবাজার')}
                  </span>
                  {currentPage === 'admin-dashboard' ? (
                    <div className="flex items-center gap-1 mt-1 font-mono">
                      <span className="inline-block w-1.5 bg-emerald-500 h-1.5 rounded-full animate-pulse shrink-0"></span>
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">
                         🔒 {language === 'en' ? 'Admin Portal' : 'অ্যাডমিন পোর্টাল'}
                      </span>
                    </div>
                  ) : (
                    <span 
                      className="text-[8px] md:text-[10px] uppercase tracking-widest font-mono block font-black truncate whitespace-nowrap"
                      style={{ color: siteConfigs.logoColor || '#94A3B8' }}
                    >
                      {language === 'en' 
                        ? (siteConfigs.subtextEN || 'Premium Heritage') 
                        : (siteConfigs.subtextBN || 'প্রিমিয়াম ঐতিহ্য')}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {currentPage !== 'admin-dashboard' ? (
            <>
              {/* Search Box */}
              <div className="hidden md:flex flex-1 max-w-xl relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  id="search-input"
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (currentPage !== 'home') {
                      setCurrentPage('home');
                    }
                  }}
                  className="w-full bg-[#F8FAFC] border border-slate-200 pl-10 pr-20 py-3 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all font-sans text-slate-850"
                />
                
                {/* Right widgets */}
                <div className="absolute inset-y-0 right-3 flex items-center gap-1.5">
                  {searchQuery && (
                    <button
                      id="search-clear"
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-slate-400 hover:text-slate-600 font-sans px-1"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsVisualSearchOpen(true)}
                    className="text-slate-400 hover:text-emerald-600 p-1 rounded-full hover:bg-slate-100/80 transition duration-150 cursor-pointer"
                    title={language === 'en' ? 'Search by Image (Visual Search)' : 'ছবি দিয়ে পণ্য খুঁজুন'}
                  >
                    <Camera className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* REAL-TIME SUGGESTIONS POPUP PANEL */}
                {searchFocused && (searchQuery.trim() !== '' || searchResults.length > 0) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 flex flex-col max-h-[380px]">
                    <div className="px-3 py-2 bg-slate-50 border-b border-secondary/5 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                        {language === 'en' ? 'Digital Search Suggestions' : 'ইনস্ট্যান্ট ম্যাচিং ক্যাটালগ'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {searchResults.length} {language === 'en' ? 'results' : 'টি প্রোডাক্ট'}
                      </span>
                    </div>

                    <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
                      {searchResults.length > 0 ? (
                        searchResults.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => handleSuggestionClick(p)}
                            className="flex items-center gap-3 p-3 hover:bg-emerald-50/20 cursor-pointer transition duration-150 group"
                          >
                            <img
                              src={p.image}
                              alt={p.title}
                              className="w-10 h-10 object-cover rounded-lg border border-slate-100 group-hover:scale-105 transition duration-200"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-600 transition-colors">
                                {language === 'en' ? p.title : p.banglaTitle}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] font-medium text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded">
                                  {p.brand}
                                </span>
                                <span className="text-[9px] font-medium text-slate-400 uppercase">
                                  {p.category}
                                </span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-black text-slate-900">
                                {formatBDT(p.price)}
                              </span>
                              {p.originalPrice > p.price && (
                                <div className="text-[9px] text-slate-400 line-through">
                                  {formatBDT(p.originalPrice)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center">
                          <p className="text-slate-400 text-xs font-bold font-sans">
                            {language === 'en' ? 'No matches found' : 'কোনো ম্যাচিং পণ্য পাওয়া যায়নি'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {language === 'en' ? 'Try spelling or searching other brands' : 'মডেল বা প্রকার দিয়ে খুঁজে দেখতে পারেন'}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 text-center font-sans">
                      💡 {language === 'en' 
                            ? 'Click product to select, or press enter to search globally.' 
                            : 'বিস্তারিত দেখতে প্রোডাক্টের ওপর ক্লিক করুন অথবা এন্টার টিপুন।'}
                    </div>
                  </div>
                )}
              </div>

              {/* Nav Icons */}
              <div className="flex items-center gap-4 lg:gap-6">
                {navItems.filter((item: any) => item.visible).map((item: any) => {
                  if (item.id === 'home') {
                    return (
                      <React.Fragment key="home-and-categories">
                        <button
                          key="home"
                          id="nav-home-btn"
                          onClick={handleHomeClick}
                          className={`hidden lg:flex items-center gap-1.5 ${navPaddingClass} rounded-lg ${navFontSizeClass} ${navFontFamilyClass} font-bold transition`}
                          style={{
                            color: currentPage === 'home' ? (siteConfigs.navButtonColor || '#16A34A') : '#475569',
                            backgroundColor: currentPage === 'home' ? `${siteConfigs.navButtonColor || '#16A34A'}15` : 'transparent',
                          }}
                        >
                          <span>{t.home}</span>
                        </button>

                        {/* Beautiful Dropdown Category Button in Navbar */}
                        <div className="relative hidden lg:block" key="navbar-categories-holder">
                          <button
                            id="nav-categories-dropdown-btn"
                            onClick={() => setIsNavCategoryDropdownOpen(!isNavCategoryDropdownOpen)}
                            className={`flex items-center gap-1.5 ${navPaddingClass} rounded-lg ${navFontSizeClass} ${navFontFamilyClass} font-bold transition hover:bg-slate-50 cursor-pointer text-[#0F172A] hover:text-[#16A34A]`}
                            style={{
                              color: isNavCategoryDropdownOpen ? (siteConfigs.navButtonColor || '#16A34A') : '#475569',
                              backgroundColor: isNavCategoryDropdownOpen ? `${siteConfigs.navButtonColor || '#16A34A'}15` : 'transparent',
                            }}
                          >
                            <Folder className="w-4 h-4 text-[#16A34A]" />
                            <span>{language === 'en' ? 'Categories' : 'ক্যাটাগরি'}</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isNavCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {/* Category Dropdown Menu */}
                          {isNavCategoryDropdownOpen && (
                            <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-100 shadow-2xl rounded-2xl p-2.5 z-50 animate-fade-in text-left">
                              <button
                                onClick={() => handleCategorySelect('all')}
                                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                                  selectedCategory === 'all' ? 'bg-emerald-50 text-[#16A34A]' : 'text-slate-700 hover:bg-[#F8FAFC]'
                                }`}
                              >
                                <span>🌟</span>
                                <span>{t.allCategories}</span>
                              </button>
                              <div className="my-1 border-t border-slate-100"></div>
                              {categoriesList.map((cat) => (
                                <button
                                  key={cat.id}
                                  onClick={() => handleCategorySelect(cat.id)}
                                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                                    selectedCategory === cat.id ? 'bg-emerald-50 text-[#16A34A]' : 'text-slate-700 hover:bg-[#F8FAFC]'
                                  }`}
                                >
                                  <span className="text-sm">
                                    {cat.id === 'fashion' ? '👕' : cat.id === 'electronics' ? '📱' : cat.id === 'islamic' ? '🌙' : cat.id === 'home' ? '🛋️' : cat.id === 'gadgets' ? '🔌' : cat.id === 'cctv' ? '🛡️' : '👶'}
                                  </span>
                                  <span>{cat.name[language]}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  }
                  if (item.id === 'dashboard') {
                    if (currentUser) {
                      return (
                        <div className="relative hidden lg:block" key="user-profile-menu-container">
                          <button
                            id="nav-profile-dropdown-trigger"
                            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                            className="relative p-2.5 rounded-full border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/50 cursor-pointer shadow-xs transition duration-200 flex items-center justify-center"
                            title={language === 'en' ? `Profile & Settings (${currentUser.name})` : `প্রোফাইল ও সেটিংস (${currentUser.name})`}
                          >
                            <User className="w-5 h-5 text-emerald-605" style={{ color: siteConfigs.navButtonColor || '#16A34A' }} />
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#16A34A] rounded-full border-2 border-white"></span>
                          </button>

                          {/* Profile Dropdown Menu */}
                          {isProfileDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-100 shadow-2xl rounded-2xl p-4 z-50 animate-fade-in text-left">
                              {/* User Profile Card */}
                              <div className="flex items-center gap-3 pb-3 mb-3 border-b border-slate-100">
                                <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center font-extrabold text-[#0F172A] relative ring-2 ring-emerald-100 shadow-inner shrink-0">
                                  {currentUser.avatar ? (
                                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <span className="text-sm font-bold text-white uppercase">{currentUser.name.slice(0, 2)}</span>
                                  )}
                                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#16A34A] rounded-full border-2 border-white"></span>
                                </div>
                                <div className="flex flex-col leading-tight min-w-0 flex-1">
                                  <span className="font-extrabold text-slate-800 text-sm truncate">{currentUser.name}</span>
                                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5 mt-0.5">
                                    {language === 'en' ? 'User Rank' : 'ক্রেতা পদবি'}: {currentUser.role === 'super_admin' ? (language === 'en' ? 'Super Admin' : 'সুপার মালিক') : currentUser.role === 'admin' ? (language === 'en' ? 'Staff Admin' : 'কর্মকর্তা') : (language === 'en' ? 'Shopper' : 'ক্রেতা')}
                                  </span>
                                  <span className="text-xs text-slate-500 truncate font-mono">{currentUser.email || currentUser.phone}</span>
                                </div>
                              </div>

                              {/* Menu Option buttons */}
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => {
                                    setCurrentPage('user-dashboard');
                                    setIsProfileDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 text-slate-705 hover:bg-slate-50 hover:text-[#16A34A]"
                                >
                                  <span className="text-sm text-slate-500">👤</span>
                                  <span>{language === 'en' ? 'My Dashboard' : 'আমার ড্যাশবোর্ড'}</span>
                                </button>

                                {/* If admin, show Admin Panel quick link */}
                                {(currentUser.role === 'admin' || currentUser.role === 'super_admin') && (
                                  <>
                                    <button
                                      onClick={() => {
                                        if (setActiveAdminTab) {
                                          setActiveAdminTab('metrics');
                                        }
                                        setCurrentPage('admin-dashboard');
                                        setIsProfileDropdownOpen(false);
                                      }}
                                      className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 text-slate-705 hover:bg-amber-50 hover:text-amber-700"
                                    >
                                      <span className="text-sm">🔑</span>
                                      <span>{language === 'en' ? 'Admin Panel' : 'অ্যাডমিন প্যানেল'}</span>
                                    </button>


                                  </>
                                )}

                                <div className="my-1 border-t border-slate-100 font-bold"></div>

                                {/* Beautiful Sign Out Action inside Profile Dropdown */}
                                <button
                                  id="profile-dropdown-signout"
                                  onClick={() => {
                                    setIsProfileDropdownOpen(false);
                                    onSignOut();
                                  }}
                                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2.5 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100"
                                >
                                  <span className="text-sm">🚪</span>
                                  <span>{language === 'en' ? 'Sign Out / Logout' : 'লগআউট করুন'}</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <button
                          key="dashboard"
                          id="nav-dashboard-btn"
                          onClick={() => setCurrentPage('user-dashboard')}
                          className={`hidden lg:flex items-center gap-1.5 ${navPaddingClass} rounded-lg ${navFontSizeClass} ${navFontFamilyClass} font-bold transition`}
                          style={{
                            color: '#475569',
                            backgroundColor: 'transparent',
                          }}
                        >
                          <User className="w-5 h-5 text-slate-500" />
                          <span>{t.dashboard}</span>
                        </button>
                      );
                    }
                  }
                  if (item.id === 'admin') {
                    return null;
                  }
                  return null;
                })}

                {/* Language Switcher */}
                <button
                  id="lang-switcher-btn"
                  onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
                  className="hidden md:flex items-center gap-1.5 text-slate-700 hover:text-[#16A34A] hover:bg-emerald-50 transition text-xs font-bold bg-slate-50 py-1.5 px-3 rounded-full border border-slate-200 cursor-pointer select-none shadow-xs"
                >
                  <span>🌐</span>
                  <span>{t.toggleLanguage}</span>
                </button>

                {/* Auth Actions */}
                {!currentUser && (
                  <button
                    id="signin-trigger-btn"
                    onClick={onOpenAuth}
                    className="hidden sm:flex items-center gap-1.5 text-[#16A34A] hover:text-[#15803D] hover:bg-emerald-100 transition text-xs font-bold bg-emerald-50 py-1.5 px-3.5 rounded-full border border-emerald-200 cursor-pointer select-none shadow-xs"
                  >
                    <span>🔐</span>
                    <span>{language === 'en' ? 'Login' : 'লগইন'}</span>
                  </button>
                )}

                {/* Wishlist Indicator */}
                <div className="relative group cursor-pointer" onClick={() => setCurrentPage('user-dashboard')}>
                  <div className={`p-2.5 rounded-full hover:bg-slate-100 transition ${isWishlistBeating ? 'text-rose-500' : 'text-slate-600'}`}>
                    <Heart className={`w-5.5 h-5.5 ${isWishlistBeating ? 'animate-wishlist-heartbeat fill-rose-500' : ''}`} />
                  </div>
                  {wishlistCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1 -translate-y-1 bg-amber-500 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </div>

                {/* Cart Quick Click */}
                <div 
                  id="nav-cart-trigger"
                  onClick={onOpenCart} 
                  className="relative flex items-center gap-2 cursor-pointer bg-emerald-50 hover:bg-emerald-100 text-[#16A34A] py-1.5 px-3 rounded-full border border-emerald-100 transition duration-300"
                >
                  <ShoppingBag className="w-5 h-5 flex-shrink-0" />
                  <div className="text-left leading-none font-sans hidden sm:block">
                    <span className="text-[10px] text-emerald-800 uppercase block font-semibold">{t.cart}</span>
                    <span className="text-xs font-bold font-mono">{formatBDT(cartTotal, language)}</span>
                  </div>
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-[#0F172A] rounded-full">
                      {cartCount}
                    </span>
                  )}
                </div>

                {/* Mobile Menu Icon */}
                <button
                  id="mobile-menu-toggle"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 text-slate-705 hover:bg-slate-100 rounded-xl"
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 select-none">
              {/* Language Switcher */}
              <button
                id="admin-lang-switcher-btn"
                onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
                className="hidden lg:flex items-center gap-1.5 text-slate-705 hover:text-[#16A34A] hover:bg-[#F0FDF4] transition text-xs font-bold bg-[#F8FAFC] py-2 px-3.5 rounded-xl border border-slate-200 cursor-pointer select-none"
              >
                <span>🌐</span>
                <span>{language === 'en' ? 'English' : 'বাংলা'}</span>
              </button>

              {/* Back to Store Action */}
              <button
                id="exit-admin-btn"
                onClick={handleHomeClick}
                className="flex items-center gap-2 bg-[#F8FAFC] border border-slate-200 hover:bg-[#F0FDF4] hover:text-[#16A34A] hover:border-emerald-250 text-slate-705 py-2 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs select-none uppercase tracking-wider"
              >
                <Home className="w-4 h-4 text-[#16A34A]" />
                <span>{language === 'en' ? 'Back to Store' : 'স্টোরফ্রন্টে ফিরুন'}</span>
              </button>

              {/* Desktop Admin Tabs directly integrated inside Navbar container - Hidden on Desktop to favor left sidebar menubar */}
              <div className="hidden">
                {/* Stats Panel */}
                <button
                  id="nav-tab-btn-metrics"
                  onClick={() => setActiveAdminTab && setActiveAdminTab('metrics')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none ${
                    activeAdminTab === 'metrics'
                      ? 'bg-slate-900 border border-slate-950 text-white shadow-md shadow-slate-950/10 scale-[1.01]'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="text-[13px]">📊</span>
                  <span>{language === 'en' ? 'Stats panel' : 'পরিসংখ্যান'}</span>
                </button>

                {/* Dispatch */}
                <button
                  id="nav-tab-btn-orders"
                  onClick={() => setActiveAdminTab && setActiveAdminTab('orders')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none ${
                    activeAdminTab === 'orders'
                      ? 'bg-slate-900 border border-slate-950 text-white shadow-md shadow-slate-950/10 scale-[1.01]'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="text-[13px]">📦</span>
                  <span>{language === 'en' ? 'Dispatch' : 'অর্ডার্স'}</span>
                </button>

                {/* Stock Room */}
                <button
                  id="nav-tab-btn-inventory"
                  onClick={() => setActiveAdminTab && setActiveAdminTab('inventory')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none ${
                    activeAdminTab === 'inventory'
                      ? 'bg-slate-900 border border-slate-950 text-white shadow-md shadow-slate-950/10 scale-[1.01]'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="text-[13px]">🏭</span>
                  <span>{language === 'en' ? 'Stock Room' : 'ইনভেন্টরি'}</span>
                </button>

                {/* Sales Log */}
                <button
                  id="nav-tab-btn-sales"
                  onClick={() => setActiveAdminTab && setActiveAdminTab('sales')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none ${
                    activeAdminTab === 'sales'
                      ? 'bg-slate-900 border border-slate-950 text-white shadow-md shadow-slate-950/10 scale-[1.01]'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="text-[13px]">📈</span>
                  <span>{language === 'en' ? 'Sales Log' : 'বিক্রয় রসিদ'}</span>
                </button>

                {/* Cash Book */}
                <button
                  id="nav-tab-btn-account"
                  onClick={() => setActiveAdminTab && setActiveAdminTab('account')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none ${
                    activeAdminTab === 'account'
                      ? 'bg-slate-900 border border-slate-950 text-white shadow-md shadow-slate-950/10 scale-[1.01]'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="text-[13px]">🏦</span>
                  <span>{language === 'en' ? 'Cash Book' : 'হিসাব খাতা'}</span>
                </button>

                {/* Page Settings */}
                <button
                  id="nav-tab-btn-settings"
                  onClick={() => setActiveAdminTab && setActiveAdminTab('settings')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none ${
                    activeAdminTab === 'settings'
                      ? 'bg-slate-900 border border-slate-950 text-white shadow-md shadow-slate-950/10 scale-[1.01]'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                  }`}
                >
                  <span className={`text-[13px] ${activeAdminTab === 'settings' ? 'animate-spin inline-block' : ''}`}>⚙️</span>
                  <span>{language === 'en' ? 'Page Settings' : 'পেজ সেটিংস'}</span>
                </button>

                {/* User Access */}
                <button
                  id="nav-tab-btn-users"
                  onClick={() => setActiveAdminTab && setActiveAdminTab('users')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none ${
                    activeAdminTab === 'users'
                      ? 'bg-slate-900 border border-slate-950 text-white shadow-md shadow-slate-950/10 scale-[1.01]'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="text-[13px]">👥</span>
                  <span>{language === 'en' ? 'User Access' : 'অ্যাডমিন পারমিশন'}</span>
                </button>

                {/* Forecasting */}
                <button
                  id="nav-tab-btn-forecasting"
                  onClick={() => setActiveAdminTab && setActiveAdminTab('forecasting')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none ${
                    activeAdminTab === 'forecasting'
                      ? 'bg-slate-900 border border-slate-950 text-white shadow-md shadow-slate-950/10 scale-[1.01]'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="text-[13px]">🔮</span>
                  <span>{language === 'en' ? 'Forecasting' : 'পূর্বাভাস'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>






      {/* Mobile Menu Panel */}
      {currentPage !== 'admin-dashboard' && isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-xl py-4 px-6 animate-slide-down flex flex-col gap-4">
          {/* Mobile search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (currentPage !== 'home') {
                  setCurrentPage('home');
                }
              }}
              className="w-full bg-[#F8FAFC]/90 border border-slate-200 pl-10 pr-20 py-2.5 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-850 font-sans"
            />
            
            {/* Mobile actions inside search block */}
            <div className="absolute inset-y-0 right-3 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-[10px] text-slate-400 font-sans px-1"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsVisualSearchOpen(true);
                }}
                className="text-slate-400 hover:text-emerald-600 p-1 rounded-full cursor-pointer"
                title={language === 'en' ? 'Camera Search' : 'ছবি দিয়ে খুঁজুন'}
              >
                <Camera className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Render autocomplete dropdown for mobile specifically */}
            {searchFocused && (searchQuery.trim() !== '' || searchResults.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-100 z-50 max-h-[260px] overflow-y-auto divide-y divide-slate-50 flex flex-col">
                {searchResults.length > 0 ? (
                  searchResults.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSuggestionClick(p)}
                      className="flex items-center gap-2.5 p-2.5 cursor-pointer hover:bg-slate-50"
                    >
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-8 h-8 object-cover rounded-md"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-slate-800 truncate">
                          {language === 'en' ? p.title : p.banglaTitle}
                        </div>
                        <div className="text-[9px] text-slate-400 truncate">
                          {p.brand} · {p.category}
                        </div>
                      </div>
                      <div className="text-[10px] font-extrabold text-slate-900 shrink-0">
                        {formatBDT(p.price)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-[10px] text-slate-400">
                    {language === 'en' ? 'No products found' : 'কোনো পণ্য পাওয়া যায়নি'}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 px-2">Navigation</span>
            <button
              onClick={() => {
                handleHomeClick();
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition ${
                currentPage === 'home' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              🏠 {t.home}
            </button>
            
            <button
              onClick={() => {
                setCurrentPage('user-dashboard');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition ${
                currentPage === 'user-dashboard' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              👤 {t.dashboard}
            </button>

            {(userRole === 'admin' || currentUser?.role === 'admin' || currentUser?.role === 'super_admin') && (
              <button
                onClick={() => {
                  if (setActiveAdminTab) setActiveAdminTab('metrics');
                  setCurrentPage('admin-dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  (currentPage as string) === 'admin-dashboard'
                    ? 'bg-amber-50 text-amber-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{t.admin}</span>
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 px-2">{language === 'en' ? 'Shop Categories' : 'ক্যাটাগরি সমূহ'}</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setCurrentPage('home');
                  setIsMobileMenuOpen(false);
                }}
                className={`px-3 py-2 text-left rounded-lg text-xs font-medium border ${
                  selectedCategory === 'all' ? 'bg-emerald-50 border-emerald-200 text-emerald-600 font-bold' : 'border-slate-100 text-slate-600'
                }`}
              >
                🌈 {t.allCategories}
              </button>
              {categoriesList.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setCurrentPage('home');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 text-left rounded-lg text-xs font-medium border ${
                    selectedCategory === cat.id ? 'bg-emerald-50 border-emerald-200 text-emerald-600 font-bold' : 'border-slate-100 text-slate-600'
                  }`}
                >
                  {cat.name[language]}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Login and Language switcher */}
          <div className="border-t border-slate-100 pt-3 flex flex-col gap-2 mt-2">
            {currentUser ? (
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-wide font-mono mb-1">
                    {currentUser.role === 'super_admin' ? (language === 'en' ? 'Super Admin' : 'সুপার মালিক') : currentUser.role === 'admin' ? (language === 'en' ? 'Staff Admin' : 'কর্মকর্তা') : (language === 'en' ? 'Shopper' : 'ক্রেতা')}
                  </span>
                  <span className="text-xs font-bold text-slate-800">{currentUser.name}</span>
                </div>
                <button
                  id="signout-button-mobile"
                  onClick={() => {
                    onSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-bold py-1.5 px-3.5 rounded-lg transition"
                >
                  {language === 'en' ? 'Sign Out' : 'লগআউট'}
                </button>
              </div>
            ) : (
              <button
                id="signin-trigger-mobile-btn"
                onClick={() => {
                  onOpenAuth();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 text-emerald-600 bg-emerald-50 py-2.5 rounded-xl border border-emerald-200 text-xs font-bold cursor-pointer font-sans"
              >
                <span>🔐</span>
                <span>{language === 'en' ? 'Login / Sign Up' : 'লগইন / সাইন আপ'}</span>
              </button>
            )}

            <button
              id="lang-switcher-mobile-btn"
              onClick={() => {
                setLanguage(language === 'en' ? 'bn' : 'en');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-1.5 text-slate-700 bg-slate-50 hover:bg-slate-100 py-2.5 rounded-xl border border-slate-200 text-xs font-medium cursor-pointer font-sans"
            >
              <span>🌐</span>
              <span>{language === 'en' ? 'Switch to Bengali' : 'English এ পরিবর্তন করুন'} ({t.toggleLanguage})</span>
            </button>
          </div>
        </div>
      )}

      {/* STUNNING VISUAL IMAGE CAMERA SCANNER OVERLAY MODAL */}
      {isVisualSearchOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
          {/* Keyframe scan laser animation definition */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes scan-laser {
              0% { top: 0%; opacity: 0.8; }
              50% { top: 100%; opacity: 1; }
              100% { top: 0%; opacity: 0.8; }
            }
          `}} />

          <div className="bg-white rounded-3xl w-full max-w-md border border-slate-100 shadow-2xl relative overflow-hidden animate-scale-up">
            {/* Laser light scan horizontal bar overlay */}
            {isScanning && (
              <div className="absolute left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 opacity-90 shadow-[0_0_12px_#10B981] z-30"
                   style={{
                     animation: 'scan-laser 2s infinite ease-in-out',
                     top: '0%'
                   }} />
            )}
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
                  <Camera className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                    {language === 'en' ? 'AI-Powered Visual Search' : 'এআই ভিত্তিক ভিজ্যুয়াল পণ্য অনুসন্ধান'}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold font-mono">
                    {language === 'en' ? 'CAMERA SCAN ACTIVE' : 'ক্যামেরা স্ক্যান সক্রিয়'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsVisualSearchOpen(false);
                  setUploadedImage(null);
                  setVisualSearchMatches([]);
                  setIsScanning(false);
                }}
                className="w-8 h-8 rounded-full border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-400 hover:text-slate-600 transition hover:bg-slate-50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {!uploadedImage ? (
                /* DRAG AND DROP BOX */
                <label className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/10 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition duration-150 group min-h-[220px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="w-14 h-14 bg-white shadow-md rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:scale-105 transition-all mb-4 border border-slate-100">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    {language === 'en' ? 'Select or Drop product image here' : 'প্রোডাক্টের ছবি ক্লিক করে আপলোড করুন'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 font-medium select-none">
                    Supports JPG, PNG, WEBP, GIF
                  </span>
                  
                  <div className="mt-5 flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full text-[9px] font-bold text-emerald-700 border border-emerald-100">
                    <Sparkles className="w-3 h-3 text-emerald-500 animate-pulse" />
                    <span>{language === 'en' ? 'Direct Bilingual Match Engine' : 'দ্বিভাষিক ইনস্ট্যান্ট ম্যাচ ইঞ্জিন'}</span>
                  </div>
                </label>
              ) : (
                /* SCANNING LOGS AND PREVIEW */
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4 items-start bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    {/* Source Image Panel with Glowing Effect */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-900 shadow-sm">
                      <img
                        src={uploadedImage}
                        alt="Target product"
                        className="w-full h-full object-cover"
                      />
                      {isScanning && (
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="text-[10px] text-white font-extrabold font-mono">
                            {scanningProgress}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Operational Scanning Log Lines */}
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-black text-amber-600 uppercase tracking-wider font-mono">
                        {language === 'en' ? 'Scanning Source' : 'স্ক্যান উৎস'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 truncate">
                        {uploadedFileName || 'Captured_Product_Image.jpg'}
                      </h4>
                      
                      <div className="mt-2.5 flex flex-col gap-1">
                        <div className="text-xs font-bold">
                          {isScanning ? (
                            <span className="flex items-center gap-1.5 text-emerald-600 animate-pulse">
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              {scanningStatus}
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              ✓ {language === 'en' ? 'Spectrum Scan Completed!' : 'রঙ ও বিন্যাস বিশ্লেষণ সম্পন্ন!'}
                            </span>
                          )}
                        </div>
                        {isScanning && (
                          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-1">
                            <div
                              className="bg-emerald-500 h-full transition-all duration-150"
                              style={{ width: `${scanningProgress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* VISUAL MATCH MATCHES LIST */}
                  {!isScanning && visualSearchMatches.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                        🎯 {language === 'en' ? 'Recommended Matches' : 'প্রস্তাবিত ম্যাচিং প্রোডাক্টসমূহ'}
                      </h4>
                      
                      <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
                        {visualSearchMatches.slice(0, 3).map(({ product, matchScore }) => (
                          <div
                            key={product.id}
                            onClick={() => {
                              setIsVisualSearchOpen(false);
                              setUploadedImage(null);
                              setVisualSearchMatches([]);
                              if (onViewProduct) {
                                onViewProduct(product);
                              }
                            }}
                            className="flex items-center gap-3 py-2 cursor-pointer hover:bg-slate-50 transition duration-150 group"
                          >
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-10 h-10 object-cover rounded-md border border-slate-150 group-hover:scale-105 transition"
                              referrerPolicy="no-referrer"
                            />
                            
                            <div className="flex-1 min-w-0">
                              <h5 className="text-[11px] font-bold text-slate-800 truncate group-hover:text-emerald-600">
                                {language === 'en' ? product.title : product.banglaTitle}
                              </h5>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] text-slate-400">
                                  {product.brand}
                                </span>
                                <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1 rounded">
                                  {matchScore}% {language === 'en' ? 'Match' : 'ম্যাচ'}
                                </span>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="text-[11px] font-black text-slate-950">
                                {formatBDT(product.price)}
                              </div>
                              <span className="text-[8px] font-bold uppercase tracking-wide text-indigo-600 hover:underline">
                                {language === 'en' ? 'View details' : 'বিস্তারিত'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Operational Controls Footer */}
                  <div className="flex justify-between items-center border-t border-slate-100 pt-3.5 mt-1">
                    <button
                      onClick={() => {
                        setUploadedImage(null);
                        setVisualSearchMatches([]);
                        setIsScanning(false);
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-extrabold py-2 px-3.5 rounded-xl transition cursor-pointer"
                    >
                      🔄 {language === 'en' ? 'Reset Snapshot' : 'অন্য ছবি দিন'}
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsVisualSearchOpen(false);
                        setUploadedImage(null);
                        setVisualSearchMatches([]);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold py-2 px-4.5 rounded-xl transition cursor-pointer"
                    >
                      {language === 'en' ? 'Apply Filter' : 'ঠিক আছে'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STYLES FOR PREMIUM BOUNCING MODAL DRAWER */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide-up-custom {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up-custom {
          animation: slide-up-custom 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div id="mobile-bottom-nav" className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200/60 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] z-50">
        {currentPage === 'admin-dashboard' ? (
          <div className="grid grid-cols-5 items-center justify-around h-16 pb-1 font-sans">
            {/* Stats Panel */}
            <button
              id="mobile-admin-metrics-btn"
              onClick={() => setActiveAdminTab && setActiveAdminTab('metrics')}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full transition duration-150 ${
                activeAdminTab === 'metrics'
                  ? 'text-emerald-600 font-extrabold'
                  : 'text-slate-500'
              }`}
            >
              <span className={`text-[17px] transition-transform duration-200 ${activeAdminTab === 'metrics' ? 'scale-110' : 'opacity-85'}`}>📊</span>
              <span className="text-[9px] tracking-tight truncate max-w-full px-1">
                {language === 'en' ? 'Stats panel' : 'পরিসংখ্যান'}
              </span>
            </button>

            {/* Dispatch */}
            <button
              id="mobile-admin-orders-btn"
              onClick={() => setActiveAdminTab && setActiveAdminTab('orders')}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full transition duration-150 ${
                activeAdminTab === 'orders'
                  ? 'text-emerald-600 font-extrabold'
                  : 'text-slate-500'
              }`}
            >
              <span className={`text-[17px] transition-transform duration-200 ${activeAdminTab === 'orders' ? 'scale-110' : 'opacity-85'}`}>📦</span>
              <span className="text-[9px] tracking-tight truncate max-w-full px-1">
                {language === 'en' ? 'Dispatch' : 'অর্ডার্স'}
              </span>
            </button>

            {/* Stock Room */}
            <button
              id="mobile-admin-inventory-btn"
              onClick={() => setActiveAdminTab && setActiveAdminTab('inventory')}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full transition duration-150 ${
                activeAdminTab === 'inventory'
                  ? 'text-emerald-600 font-extrabold'
                  : 'text-slate-500'
              }`}
            >
              <span className={`text-[17px] transition-transform duration-200 ${activeAdminTab === 'inventory' ? 'scale-110' : 'opacity-85'}`}>🏭</span>
              <span className="text-[9px] tracking-tight truncate max-w-full px-1">
                {language === 'en' ? 'Stock Room' : 'ইনভেন্টরি'}
              </span>
            </button>

            {/* More Console Options */}
            <button
              id="mobile-admin-more-btn"
              onClick={() => setIsAdminMoreOpen(true)}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full transition duration-150 ${
                ['sales', 'account', 'forecasting', 'users', 'settings'].includes(activeAdminTab || '')
                  ? 'text-emerald-600 font-extrabold'
                  : 'text-slate-500'
              }`}
            >
              <span className={`text-[17px] transition-transform duration-200 ${['sales', 'account', 'forecasting', 'users', 'settings'].includes(activeAdminTab || '') ? 'scale-110' : 'opacity-85'}`}>☰</span>
              <span className="text-[9px] tracking-tight truncate max-w-full px-1">
                {language === 'en' ? 'More' : 'আরও'}
              </span>
            </button>

            {/* Back to Home Store view */}
            <button
              id="mobile-admin-exit-btn"
              onClick={() => {
                setCurrentPage('home');
                setSelectedCategory('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex flex-col items-center justify-center gap-1 w-full h-full text-slate-500 hover:text-slate-700"
            >
              <span className="text-[17px]">🏠</span>
              <span className="text-[9px] tracking-tight truncate max-w-full px-1">
                {language === 'en' ? 'Exit Panel' : 'কনসোল বন্ধ'}
              </span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-5 items-center justify-around h-16 pb-1">
            {/* Home Tab */}
            <button
              id="mobile-nav-home"
              onClick={() => {
                setCurrentPage('home');
                setSelectedCategory('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full transition duration-150 ${
                currentPage === 'home' && selectedCategory === 'all'
                  ? 'text-emerald-600 font-extrabold'
                  : 'text-slate-450 hover:text-slate-700'
              }`}
            >
              <Home className={`w-5 h-5 transition-transform duration-200 ${currentPage === 'home' && selectedCategory === 'all' ? 'text-emerald-500 stroke-[2.5px]' : 'text-slate-450 stroke-[1.8px]'}`} />
              <span className="text-[9px] tracking-tight">{language === 'en' ? 'Home' : 'হোম'}</span>
            </button>

            {/* Categories Tab */}
            <button
              id="mobile-nav-categories"
              onClick={() => {
                setIsMobileCategoriesOpen(true);
              }}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full transition duration-150 ${
                currentPage === 'home' && selectedCategory !== 'all'
                  ? 'text-emerald-600 font-extrabold'
                  : 'text-slate-450 hover:text-slate-700'
              }`}
            >
              <Folder className={`w-5 h-5 transition-transform duration-200 ${currentPage === 'home' && selectedCategory !== 'all' ? 'text-emerald-500 stroke-[2.5px]' : 'text-slate-450 stroke-[1.8px]'}`} />
              <span className="text-[9px] tracking-tight">{language === 'en' ? 'Categories' : 'ক্যাটাগরি'}</span>
            </button>

            {/* Cart Tab with Elevated Circle Badge */}
            <button
              id="mobile-nav-cart"
              onClick={onOpenCart}
              className="flex flex-col items-center justify-center gap-1 w-full h-full relative"
            >
              <div className="relative p-3 text-white rounded-full -translate-y-4 shadow-[0_4px_16px_rgba(16,185,129,0.35)] hover:scale-110 active:scale-95 transition-all duration-200"
                   style={{ backgroundColor: siteConfigs.logoColor || '#16A34A' }}>
                <ShoppingBag className="w-5.5 h-5.5 stroke-[2.2px]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5.5 h-5.5 text-[9px] font-black text-white bg-slate-900 rounded-full border-2 border-white animate-pulse">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[9px] tracking-tight text-slate-500 hover:text-slate-705 -mt-3">{language === 'en' ? 'Cart' : 'কার্ট'}</span>
            </button>

            {/* Wishlist/Account Tab */}
            <button
              id="mobile-nav-profile"
              onClick={() => setCurrentPage('user-dashboard')}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full transition duration-150 relative ${
                currentPage === 'user-dashboard'
                  ? 'text-emerald-600 font-extrabold'
                  : 'text-slate-450 hover:text-slate-700'
              }`}
            >
              <User className={`w-5 h-5 transition-transform duration-200 ${currentPage === 'user-dashboard' ? 'text-emerald-500 stroke-[2.5px]' : 'text-slate-450 stroke-[1.8px]'}`} />
              {wishlistCount > 0 && (
                <span className="absolute top-2 right-6 w-2 h-2 bg-rose-500 rounded-full"></span>
              )}
              <span className="text-[9px] tracking-tight">{language === 'en' ? 'Account' : 'প্রোফাইল'}</span>
            </button>

            {/* Live Support / Chat Tab */}
            <button
              id="mobile-nav-support"
              onClick={onToggleSupport}
              className="flex flex-col items-center justify-center gap-1 w-full h-full text-slate-450 hover:text-emerald-600 transition"
            >
              <MessageSquare className="w-5 h-5 text-slate-450 stroke-[1.8px]" />
              <span className="text-[9px] tracking-tight">{language === 'en' ? 'Support' : 'সাপোর্ট'}</span>
            </button>
          </div>
        )}
      </div>

      {/* MOBILE CATEGORIES HALF-SHEET DRAWER */}
      {isMobileCategoriesOpen && (
        <div id="mobile-categories-drawer-overlay" className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-end justify-center animate-fade-in font-sans md:hidden">
          {/* Glass Overlay backdrop spacer to close sheet */}
          <div className="absolute inset-0 z-10" onClick={() => setIsMobileCategoriesOpen(false)} />
          
          <div className="bg-white rounded-t-[32px] w-full max-h-[85vh] overflow-hidden shadow-2xl relative z-20 flex flex-col border-t border-slate-100 animate-slide-up-custom pb-8">
            {/* Sheet Handle Accent */}
            <div className="w-12 h-1 bg-slate-200/80 rounded-full mx-auto my-3 shrink-0 cursor-pointer" onClick={() => setIsMobileCategoriesOpen(false)} />
            
            {/* Header */}
            <div className="px-6 pb-4 border-b border-slate-50 flex items-center justify-between shrink-0">
              <div className="text-left">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-0.5 animate-pulse">
                  {language === 'en' ? 'Shop Categories' : 'পণ্যসমূহ ব্রাউজ করুন'}
                </span>
                <h3 className="text-base font-extrabold text-[#0F172A]">
                  {language === 'en' ? 'Premium Heritage Catalog' : 'আমাদের প্রিমিয়াম কালেকশন'}
                </h3>
              </div>
              
              <button
                onClick={() => setIsMobileCategoriesOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Categories List */}
            <div className="overflow-y-auto px-6 py-4 flex-1">
              <div className="grid grid-cols-2 gap-3 pb-4">
                {/* All products button */}
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setCurrentPage('home');
                    setIsMobileCategoriesOpen(false);
                    const el = document.getElementById('products-explore-grid') || document.getElementById('root');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 flex flex-col items-center justify-center gap-1.5 ${
                    selectedCategory === 'all'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-black shadow-md shadow-emerald-100'
                      : 'border-slate-100 bg-slate-50/50 text-slate-700 hover:border-slate-200'
                  }`}
                >
                  <span className="text-3xl filter drop-shadow-xs">🌈</span>
                  <span className="text-xs font-bold">{language === 'en' ? 'All Products' : 'সব ক্যাটাগরি'}</span>
                </button>

                {categoriesList && categoriesList.map((cat: any) => {
                  /* Filter item icon */
                  const emoji = cat.id === 'fashion' ? '👕' : cat.id === 'electronics' ? '📱' : cat.id === 'islamic' ? '🌙' : cat.id === 'home' ? '🛋️' : cat.id === 'gadgets' ? '🔌' : cat.id === 'cctv' ? '🛡️' : '👶';
                  
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setCurrentPage('home');
                        setIsMobileCategoriesOpen(false);
                        const el = document.getElementById('products-explore-grid') || document.getElementById('root');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`p-4 rounded-2xl border-2 text-center transition-all duration-200 flex flex-col items-center justify-center gap-1.5 ${
                        selectedCategory === cat.id
                          ? 'border-emerald-[#16A34A] border-emerald-500 bg-emerald-50 text-emerald-800 font-extrabold shadow-md shadow-emerald-100'
                          : 'border-slate-105 bg-slate-50/50 text-slate-705 hover:border-slate-200'
                      }`}
                    >
                      <span className="text-3xl filter drop-shadow-xs">{emoji}</span>
                      <span className="text-xs font-bold leading-tight truncate w-full">{cat.name[language]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE ADMIN MORE OPTIONS SHEET */}
      {currentPage === 'admin-dashboard' && isAdminMoreOpen && (
        <div id="mobile-admin-more-drawer-overlay" className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-end justify-center animate-fade-in font-sans md:hidden">
          {/* Glass Overlay backdrop spacer to close sheet */}
          <div className="absolute inset-0 z-10" onClick={() => setIsAdminMoreOpen(false)} />
          
          <div className="bg-white rounded-t-[32px] w-full max-h-[85vh] overflow-hidden shadow-2xl relative z-20 flex flex-col border-t border-slate-100 animate-slide-up-custom pb-8">
            {/* Sheet Handle Accent */}
            <div className="w-12 h-1 bg-slate-200/80 rounded-full mx-auto my-3 shrink-0 cursor-pointer" onClick={() => setIsAdminMoreOpen(false)} />
            
            {/* Header */}
            <div className="px-6 pb-4 border-b border-slate-50 flex items-center justify-between shrink-0">
              <div className="text-left">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-0.5">
                  {language === 'en' ? 'Console Management' : 'কনসোল ম্যানেজমেন্ট'}
                </span>
                <h3 className="text-base font-extrabold text-[#0F172A]">
                  {language === 'en' ? 'More Console Options' : 'অন্যান্য কনসোল অপশনসমূহ'}
                </h3>
              </div>
              
              <button
                onClick={() => setIsAdminMoreOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Options List */}
            <div className="overflow-y-auto px-6 py-4 flex-1">
              <div className="grid grid-cols-2 gap-3 pb-4">
                {/* Sales Log */}
                <button
                  onClick={() => {
                    setActiveAdminTab && setActiveAdminTab('sales');
                    setIsAdminMoreOpen(false);
                  }}
                  className={`p-4 rounded-2xl border border-slate-100 text-center transition-all duration-200 flex flex-col items-center justify-center gap-1.5 ${
                    activeAdminTab === 'sales'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-black shadow-md shadow-emerald-100'
                      : 'bg-slate-50/55 text-slate-700 hover:border-slate-200'
                  }`}
                >
                  <span className="text-3xl filter drop-shadow-xs">📈</span>
                  <span className="text-xs font-bold">{language === 'en' ? 'Sales Log' : 'বিক্রয় রসিদ'}</span>
                </button>

                {/* Cash Book */}
                <button
                  onClick={() => {
                    setActiveAdminTab && setActiveAdminTab('account');
                    setIsAdminMoreOpen(false);
                  }}
                  className={`p-4 rounded-2xl border border-slate-100 text-center transition-all duration-200 flex flex-col items-center justify-center gap-1.5 ${
                    activeAdminTab === 'account'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-black shadow-md shadow-emerald-100'
                      : 'bg-slate-50/55 text-slate-700 hover:border-slate-200'
                  }`}
                >
                  <span className="text-3xl filter drop-shadow-xs">🏦</span>
                  <span className="text-xs font-bold">{language === 'en' ? 'Cash Book' : 'হিসাব খাতা'}</span>
                </button>

                {/* Forecasting */}
                <button
                  onClick={() => {
                    setActiveAdminTab && setActiveAdminTab('forecasting');
                    setIsAdminMoreOpen(false);
                  }}
                  className={`p-4 rounded-2xl border border-slate-100 text-center transition-all duration-200 flex flex-col items-center justify-center gap-1.5 ${
                    activeAdminTab === 'forecasting'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-black shadow-md shadow-emerald-100'
                      : 'bg-slate-50/55 text-slate-700 hover:border-slate-200'
                  }`}
                >
                  <span className="text-3xl filter drop-shadow-xs">🔮</span>
                  <span className="text-xs font-bold">{language === 'en' ? 'Forecasting' : 'পূর্বাভাস'}</span>
                </button>

                {/* User Access */}
                <button
                  onClick={() => {
                    setActiveAdminTab && setActiveAdminTab('users');
                    setIsAdminMoreOpen(false);
                  }}
                  className={`p-4 rounded-2xl border border-slate-100 text-center transition-all duration-200 flex flex-col items-center justify-center gap-1.5 ${
                    activeAdminTab === 'users'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-black shadow-md shadow-emerald-100'
                      : 'bg-slate-50/55 text-slate-700 hover:border-slate-200'
                  }`}
                >
                  <span className="text-3xl filter drop-shadow-xs">👥</span>
                  <span className="text-xs font-bold">{language === 'en' ? 'User Access' : 'অ্যাডমিন পারমিশন'}</span>
                </button>

                {/* Page Settings */}
                <button
                  onClick={() => {
                    setActiveAdminTab && setActiveAdminTab('settings');
                    setIsAdminMoreOpen(false);
                  }}
                  className={`p-4 rounded-2xl border border-slate-100 text-center transition-all duration-200 flex flex-col items-center justify-center gap-1.5 ${
                    activeAdminTab === 'settings'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-black shadow-md shadow-emerald-100'
                      : 'bg-slate-50/55 text-slate-700 hover:border-slate-200'
                  }`}
                >
                  <span className="text-3xl filter drop-shadow-xs">⚙️</span>
                  <span className="text-xs font-bold">{language === 'en' ? 'Page Settings' : 'পেজ সেটিংস'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
