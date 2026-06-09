import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Truck, RotateCcw, ThumbsUp, Landmark, Smartphone, RefreshCw, Mail, Phone, MapPin, ExternalLink, ArrowUpRight, Award, HelpCircle, ShoppingBag } from 'lucide-react';
import { CartItem, Order, Page, Product, UserProfile, UserAccount, AdminPermission } from './types';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, onSnapshot, deleteDoc } from 'firebase/firestore';
import { initialProducts, categoriesList, featuredBrands, allReviews } from './data/products';
import { formatBDT } from './utils';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import CheckoutView from './components/CheckoutView';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import ProductDetailPage from './components/ProductDetailPage';
import InvoiceModal from './components/InvoiceModal';
import AuthModal from './components/AuthModal';


const searchSynonyms: Record<string, string[]> = {
  'panjabi': ['panjabi', 'punjabi', 'পাঞ্জাবি', 'পাঞ্জাবী', 'পোশাক', 'ethnic'],
  'punjabi': ['panjabi', 'punjabi', 'পাঞ্জাবি', 'পাঞ্জাবী', 'পোশাক', 'ethnic'],
  'পাঞ্জাবি': ['পাঞ্জাবি', 'পাঞ্জাবী', 'panjabi', 'punjabi', 'পোশাক'],
  'পাঞ্জাবী': ['পাঞ্জাবি', 'পাঞ্জাবী', 'panjabi', 'punjabi', 'পোশাক'],
  'silk': ['silk', 'সিল্ক', 'শাড়ি', 'সারি', 'শাড়ী'],
  'সিল্ক': ['সিল্ক', 'silk', 'শাড়ি', 'সারি', 'শাড়ী'],
  'saree': ['saree', 'sari', 'shari', 'শাড়ি', 'শাড়ী', 'জামদানি', 'কাতান', 'সিল্ক'],
  'sari': ['saree', 'sari', 'shari', 'শাড়ি', 'শাড়ী', 'জামদানি', 'কাতান', 'সিল্ক'],
  'shari': ['saree', 'sari', 'shari', 'শাড়ি', 'শাড়ী', 'জামদানি', 'কাতান', 'সিল্ক'],
  'শাড়ি': ['শাড়ি', 'shari', 'saree', 'sari', 'জামদানি', 'কাতান'],
  'শাড়ী': ['শাড়ি', 'shari', 'saree', 'sari', 'জামদানি', 'কাতান'],
  'gadget': ['gadget', 'গ্যাজেট', 'ওয়াচ', 'watch', 'স্মার্টওয়াচ', 'ঘড়ি', 'ঘড়ী', 'amoled', 'device', 'ডিভাইস'],
  'গ্যাজেট': ['গ্যাজেট', 'gadget', 'স্মার্টওয়াচ', 'watch', 'ঘড়ি', 'ডিভাইস'],
  'watch': ['watch', 'স্মার্টওয়াচ', 'ঘড়ি', 'ঘড়ী', 'অ্যামোলেড', 'amoled', 'fit', 'ফিট'],
  'ঘড়ি': ['ঘড়ি', 'ঘড়ী', 'watch', 'স্মার্টওয়াচ', 'গ্যাজেট'],
  'ঘড়ী': ['ঘড়ি', 'ঘড়ী', 'watch', 'স্মার্টওয়াচ', 'গ্যাজেট'],
  'camera': ['camera', 'সিসিটিভি', 'ক্যামেরা', 'cctv', 'security', 'সিকিউরিটি', 'নিরাপত্তা'],
  'cctv': ['cctv', 'সিসিটিভি', 'ক্যামেরা', 'camera', 'security', 'নিরাপত্তা', 'সিকিউরিটি'],
  'ক্যামেরা': ['ক্যামেরা', 'camera', 'cctv', 'সিসিটিভি', 'নিরাপত্তা', 'সিকিউরিটি'],
  'সিসিটিভি': ['সিসিটিভি', 'cctv', 'camera', 'ক্যামেরা', 'নিরাপত্তা', 'সিকিউরিটি'],
  'honey': ['honey', 'মধু', 'organic', 'বিশুদ্ধ', 'খাদ্য', 'ঘি'],
  'ghee': ['ghee', 'ঘি', 'organic', 'বিশুদ্ধ', 'খাদ্য'],
  'মধু': ['মধু', 'honey', 'ঘি', 'বিশুদ্ধ', 'খাদ্য'],
  'ঘি': ['ঘি', 'ghee', 'মধু', 'বিশুদ্ধ', 'খাদ্য'],
  'organic': ['organic', 'বিশুদ্ধ', 'খাদ্য', 'খাদ্যপণ্য', 'মধু', 'ঘি', 'অর্গানিক'],
  'অর্গানিক': ['organic', 'বিশুদ্ধ', 'খাদ্য', 'খাদ্যপণ্য', 'মধু', 'ঘি'],
  'shirt': ['shirt', 'শার্ট', 'শাট', 'tshirt', 'টিশার্ট', 'পোশাক'],
  'শার্ট': ['শার্ট', 'shirt', 'শাট', 'পোশাক'],
  'toy': ['toy', 'খেলনা', 'baby', 'বাচ্চা', 'বাচ্চাদের'],
  'খেলনা': ['খেলনা', 'toy', 'বাচ্চা', 'বাচ্চাদের'],
  'baby': ['baby', 'বাচ্চা', 'বাচ্চাদের', 'খেলনা', 'kids', 'কিডস'],
  'বাচ্চা': ['বাচ্চা', 'বাচ্চাদের', 'baby', 'খেলনা', 'kids'],
  'কিডস': ['kids', 'কিডস', 'বাচ্চা', 'বাচ্চাদের', 'baby', 'খেলনা'],
  'shoe': ['shoe', 'জুতো', 'জুতা', 'স্যান্ডেল', 'sandal', 'apex', 'এপেক্স'],
  'জুতা': ['shoe', 'জুতো', 'জুতা', 'স্যান্ডেল', 'sandal', 'এপেক্স'],
  'জুতো': ['shoe', 'জুতো', 'জুতা', 'স্যান্ডেল', 'sandal', 'এপেক্স']
};

const scoreProductForSearch = (p: Product, query: string): number => {
  if (!query.trim()) return 1;
  
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean).map(tok => {
    return tok.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "").trim();
  }).filter(Boolean);
  
  if (tokens.length === 0) return 1;

  const expandedTokens = new Set<string>();
  tokens.forEach(tok => {
    expandedTokens.add(tok);
    Object.keys(searchSynonyms).forEach(k => {
      if (k.includes(tok) || tok.includes(k)) {
        searchSynonyms[k].forEach(syn => expandedTokens.add(syn.toLowerCase()));
      }
    });
  });

  const searchableText = [
    p.title,
    p.banglaTitle,
    p.category,
    p.brand,
    p.description || '',
    p.banglaDescription || '',
    JSON.stringify(p.specifications || {}),
    JSON.stringify(p.banglaSpecifications || {})
  ].join(' ').toLowerCase();

  let matchedTokens = 0;
  expandedTokens.forEach(token => {
    if (searchableText.includes(token)) {
      matchedTokens++;
    }
  });

  const directMatch = searchableText.includes(query.toLowerCase().trim());
  if (matchedTokens === 0 && !directMatch) return 0;

  let score = matchedTokens * 10;
  if (directMatch) score += 50;

  tokens.forEach(tok => {
    if (p.title.toLowerCase().includes(tok)) score += 30;
    if (p.banglaTitle.toLowerCase().includes(tok)) score += 30;
  });

  return score;
};

export default function App() {
  // Common App State configurations
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [currentPage, _setCurrentPage] = useState<Page>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleProductsCount, setVisibleProductsCount] = useState<number>(8);

  useEffect(() => {
    setVisibleProductsCount(8);
  }, [selectedCategory, searchQuery]);

  // Visitor Tracking System Analytics for Admin dashboard
  const [analyticsTotalVisits, setAnalyticsTotalVisits] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('visitor_total_count');
      if (stored) return parseInt(stored, 10);
      localStorage.setItem('visitor_total_count', '1258');
      return 1258;
    } catch {
      return 1258;
    }
  });

  const [analyticsLocations, setAnalyticsLocations] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('visitor_locations');
      if (stored) return JSON.parse(stored);
      
      const defaultLocs = [
        { division: 'Dhaka / ঢাকা', count: 642 },
        { division: 'Chittagong / চট্টগ্রাম', count: 314 },
        { division: 'Sylhet / সিলেট', count: 146 },
        { division: 'Rajshahi / রাজশাহী', count: 114 },
        { division: 'Khulna / খুলনা', count: 83 },
        { division: 'Barisal / বরিশাল', count: 49 },
        { division: 'Rangpur / রংপুর', count: 42 },
        { division: 'Mymensingh / ময়মনসিংহ', count: 35 }
      ];
      localStorage.setItem('visitor_locations', JSON.stringify(defaultLocs));
      return defaultLocs;
    } catch {
      return [];
    }
  });

  const [analyticsSearches, setAnalyticsSearches] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('visitor_searches');
      if (stored) return JSON.parse(stored);
      
      const defaultSearches = [
        { query: 'Panjabi (পাঞ্জাবি)', count: 245 },
        { query: 'Tangail Saree (টাঙ্গাইল শাড়ি)', count: 184 },
        { query: 'Katan (কাতান শাড়ি)', count: 142 },
        { query: 'Honey (মধু)', count: 115 },
        { query: 'Smart Watch (স্মার্ট ওয়াচ)', count: 94 },
        { query: 'Ghee (ঘি)', count: 88 },
        { query: 'Saree (শাড়ি)', count: 76 },
        { query: 'T-shirt (টি-শার্ট)', count: 55 }
      ];
      localStorage.setItem('visitor_searches', JSON.stringify(defaultSearches));
      return defaultSearches;
    } catch {
      return [];
    }
  });

  // Track page visits on load
  useEffect(() => {
    try {
      const sessionTracked = sessionStorage.getItem('session_tracked');
      if (!sessionTracked) {
        const nextVisits = analyticsTotalVisits + 1;
        setAnalyticsTotalVisits(nextVisits);
        localStorage.setItem('visitor_total_count', nextVisits.toString());

        // Increment a random location count
        const locIndex = Math.floor(Math.random() * analyticsLocations.length);
        const updatedLocations = analyticsLocations.map((loc, idx) => {
          if (idx === locIndex) {
            return { ...loc, count: loc.count + 1 };
          }
          return loc;
        });
        setAnalyticsLocations(updatedLocations);
        localStorage.setItem('visitor_locations', JSON.stringify(updatedLocations));

        sessionStorage.setItem('session_tracked', 'true');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Track search keyword inputs with debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 3) return;

    const timer = setTimeout(() => {
      try {
        const queryText = searchQuery.trim();
        const trackedSearchesStr = sessionStorage.getItem('tracked_searches') || '[]';
        const trackedSearches = JSON.parse(trackedSearchesStr);
        
        if (!trackedSearches.includes(queryText.toLowerCase())) {
          trackedSearches.push(queryText.toLowerCase());
          sessionStorage.setItem('tracked_searches', JSON.stringify(trackedSearches));

          let matchFound = false;
          const updatedSearches = analyticsSearches.map(item => {
            if (item.query.toLowerCase().includes(queryText.toLowerCase()) || queryText.toLowerCase().includes(item.query.toLowerCase())) {
              matchFound = true;
              return { ...item, count: item.count + 1 };
            }
            return item;
          });

          if (!matchFound) {
            updatedSearches.push({ query: queryText, count: 1 });
          }

          updatedSearches.sort((a, b) => b.count - a.count);

          setAnalyticsSearches(updatedSearches);
          localStorage.setItem('visitor_searches', JSON.stringify(updatedSearches));
        }
      } catch (e) {
        console.error(e);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [searchQuery, analyticsSearches]);

  // Dynamic CMS state hooks
  const [siteBanners, _setSiteBanners] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('site_banners');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [siteCategories, setSiteCategories] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('site_categories');
      return stored ? JSON.parse(stored) : categoriesList;
    } catch {
      return categoriesList;
    }
  });

  const [siteConfigs, _setSiteConfigs] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('site_configs');
      return stored ? JSON.parse(stored) : {
        websiteNameEN: 'AmarBazar',
        websiteNameBN: 'আমারবাজার',
        subtextEN: 'Premium Heritage',
        subtextBN: 'প্রিমিয়াম অনলাইন শপ',
        newsHeadlinesEN: '🔥 Flash Deal: Special discounts on traditional sarees and smart gadgets! | 🚚 Free Shipping on orders above ৳5,000!',
        newsHeadlinesBN: '🔥 স্পেশাল অফার: টাঙ্গাইল শাড়ি ও স্মার্ট গ্যাজেটে বিশেষ ছাড়! | 🚚 ৫,০০০ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি!',
        logoColor: '#16A34A',
        logoImageUrl: '',
        logoSize: 48,
        whatsAppNumber: '01712-345678',
        bKashNumber: '01712-345678',
        hotline: '09612-AMARBD',
        navBgColor: '#0F172A',
        navMainBgColor: '#ffffff',
        navFontSize: 'sm',
        navFontFamily: 'sans',
        navButtonPadding: 'py-2 px-4',
        navButtonColor: '#16A34A',
        footerAboutEN: 'AmarBazar is Bangladesh\'s ultimate destination for authentic native traditional wear, pure organic items, and reliable IoT gadgets with robust after-sales warranties.',
        footerAboutBN: 'আমারবাজার ঐতিহ্য এবং আধুনিকতার এক অপূর্ব সমন্বয়। আমরা সরবরাহ করছি সম্পূর্ণ প্রিমিয়াম রাজশাহী সিল্ক, টাঙ্গাইল শাড়ি, এবং ১০০% দেশি বিশুদ্ধ খাদ্যপণ্য ও গ্যারান্টিযুক্ত গ্যাজেট।',
        footerAddress: 'Dhaka Head Office: House 14, Gause Pak Avenue, Sector 4, Uttara, Dhaka, Bangladesh',
        copyrightEN: '© 2026 AmarBazar Ltd. Built with pure state-of-the-art tech.',
        copyrightBN: '© ২০২৬ আমারবাজার লিমিটেড। সর্বস্বত্ব সংরক্ষিত।',
        navItems: [
          { id: 'home', title: 'Home / কালেকশন', visible: true },
          { id: 'dashboard', title: 'My Orders / কাস্টমার ড্যাশবোর্ড', visible: true },
          { id: 'admin', title: 'Admin CMS / অ্যাডমিন প্যানেল', visible: true },
        ]
      };
    } catch {
      return {};
    }
  });

  // State wrappers to automatically write config updates to Firestore
  const setSiteConfigs = (newConfigs: any) => {
    const resolved = typeof newConfigs === 'function' ? newConfigs(siteConfigs) : newConfigs;
    _setSiteConfigs(resolved);
    try {
      localStorage.setItem('site_configs', JSON.stringify(resolved));
    } catch {}
    setDoc(doc(db, 'configs', 'site'), resolved).catch(e => console.error("Error saving configs to Firestore", e));
  };

  const setSiteBanners = (newBanners: any) => {
    const resolved = typeof newBanners === 'function' ? newBanners(siteBanners) : newBanners;
    _setSiteBanners(resolved);
    try {
      localStorage.setItem('site_banners', JSON.stringify(resolved));
    } catch {}
    setDoc(doc(db, 'configs', 'banners'), { banners: resolved }).catch(e => console.error("Error saving banners to Firestore", e));
  };
  
  // Dynamic User registration & Session Management list
  const [allAccounts, setAllAccounts] = useState<UserAccount[]>(() => {
    let list: UserAccount[] = [];
    try {
      const stored = localStorage.getItem('site_accounts');
      if (stored) {
        list = JSON.parse(stored);
      }
    } catch {}
    
    const targetSuperAdmin: UserAccount = {
      id: 'ACC-001',
      name: 'Md Sumon Ali',
      email: 'mdsumonali.cse@gmail.com',
      phone: '01711-123456',
      address: 'House 5, Road 2, Dhanmondi',
      district: 'Dhaka',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&auto=format&fit=crop',
      role: 'super_admin',
      permissions: ['super_admin'],
      password: 'sumon@6720',
      rewardPoints: 5000,
      memberSince: 'Jan 2024',
      orders: [],
      cartItems: [],
      wishlist: []
    };

    if (list && list.length > 0) {
      // Make sure the super_admin is updated or exists
      const superAdminIdx = list.findIndex(a => a.role === 'super_admin' || a.email === 'mdsumonali.cse@gmail.com' || a.id === 'ACC-001');
      if (superAdminIdx !== -1) {
        list[superAdminIdx] = {
          ...list[superAdminIdx],
          name: 'Md Sumon Ali',
          email: 'mdsumonali.cse@gmail.com',
          password: 'sumon@6720',
          role: 'super_admin',
          permissions: ['super_admin']
        };
      } else {
        list.unshift(targetSuperAdmin);
      }
    } else {
      // Bootstrap seeded accounts matching requested admin granular roles & buyer account
      list = [
        targetSuperAdmin,
        {
          id: 'ACC-002',
          name: 'Anisur Rahman',
          email: 'addonly@amarbazar.com',
          phone: '01819-234567',
          address: 'Sector 3, Uttara',
          district: 'Dhaka',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop',
          role: 'admin',
          permissions: ['add_products'],
          password: 'admin',
          rewardPoints: 1200,
          memberSince: 'Mar 2025',
          orders: [],
          cartItems: [],
          wishlist: []
        },
        {
          id: 'ACC-003',
          name: 'Niloy Chowdhury',
          email: 'products@amarbazar.com',
          phone: '01911-345678',
          address: 'Andarkilla',
          district: 'Chittagong',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=150&auto=format&fit=crop',
          role: 'admin',
          permissions: ['add_products', 'modify_products'],
          password: 'admin',
          rewardPoints: 1500,
          memberSince: 'Jun 2025',
          orders: [],
          cartItems: [],
          wishlist: []
        },
        {
          id: 'ACC-004',
          name: 'Sayeeda Islam',
          email: 'orders@amarbazar.com',
          phone: '01552-456789',
          address: 'Subidbazar',
          district: 'Sylhet',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop',
          role: 'admin',
          permissions: ['manage_orders'],
          password: 'admin',
          rewardPoints: 1100,
          memberSince: 'Aug 2025',
          orders: [],
          cartItems: [],
          wishlist: []
        },
        {
          id: 'ACC-005',
          name: 'Tanvir Rahman',
          email: 'customer@amarbazar.com',
          phone: '01712-345678',
          address: 'Plot 14, Gause Pak Avenue, Sector 4',
          district: 'Dhaka',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
          role: 'user',
          permissions: [],
          password: 'admin',
          rewardPoints: 1250,
          memberSince: 'Oct 2024',
          orders: [],
          cartItems: [],
          wishlist: []
        }
      ];
    }

    try {
      localStorage.setItem('site_accounts', JSON.stringify(list));
    } catch {}
    return list;
  });

  // Cached active user session token
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const cached = localStorage.getItem('site_active_session');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Storage simulation arrays
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeDetailProduct, _setActiveDetailProduct] = useState<Product | null>(null);

  // Custom routing wrappers linking state change to URL hash
  const setCurrentPage = (page: Page) => {
    if (page === 'product-detail') {
      if (activeDetailProduct) {
        window.location.hash = `#/product/${activeDetailProduct.id}`;
      } else {
        window.location.hash = '#/home';
      }
    } else {
      window.location.hash = `#/${page}`;
    }
  };

  const setActiveDetailProduct = (product: Product | null) => {
    if (product) {
      window.location.hash = `#/product/${product.id}`;
    } else {
      if (window.location.hash.startsWith('#/product/')) {
        window.location.hash = '#/home';
      }
    }
  };

  // Custom premium interactive features state declarations
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      sender: 'bot',
      textEN: "👋 Welcome to AmarBazar Premium Support! Select any of our popular questions below or type yours for instant automated dispatch answers:",
      textBN: "👋 আমারবাজার গ্রাহক সেবায় আপনাকে স্বাগতম! যেকোনো তথ্যের জন্য নিচের প্রশ্নগুলো নির্বাচন করুন অথবা মেসেজ পাঠান:",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Helper method to raise customized automated sliding notification banners
  const showToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToast(null);
    setTimeout(() => {
      setToast({ message: msg, type });
    }, 50);
  };

  // Auto clear toast banners after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // 1. On application start, check and ensure a hash is present immediately page-load replacement
  useEffect(() => {
    if (!window.location.hash || window.location.hash === '#/') {
      window.location.replace('#/home');
    }
  }, []);

  // 2. Hashchange routing listener - Single source of truth for all page transitions and history pop/push
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      if (!hash || hash === '#/') {
        window.location.replace('#/home');
        return;
      }

      if (hash.startsWith('#/product/')) {
        const prodId = hash.replace('#/product/', '');
        const prod = products.find(p => String(p.id) === prodId);
        if (prod) {
          _setActiveDetailProduct(prod);
          _setCurrentPage('product-detail');
        } else {
          _setCurrentPage('home');
          _setActiveDetailProduct(null);
        }
      } else if (hash === '#/checkout') {
        _setCurrentPage('checkout');
        _setActiveDetailProduct(null);
      } else if (hash === '#/cart') {
        _setCurrentPage('cart');
        _setActiveDetailProduct(null);
      } else if (hash === '#/user-dashboard') {
        _setCurrentPage('user-dashboard');
        _setActiveDetailProduct(null);
      } else if (hash === '#/admin-dashboard') {
        _setCurrentPage('admin-dashboard');
        _setActiveDetailProduct(null);
      } else if (hash === '#/home') {
        _setCurrentPage('home');
        _setActiveDetailProduct(null);
      } else {
        _setCurrentPage('home');
        _setActiveDetailProduct(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Direct initial call on load to parse current URL hash
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [products]);

  // 3. Real-time Firestore synchronizer for products
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), async (snapshot) => {
      if (snapshot.empty) {
        console.log("Seeding initial products to Firestore...");
        for (const prod of initialProducts) {
          try {
            await setDoc(doc(db, 'products', String(prod.id)), prod);
          } catch (e) {
            console.error("Error seeding product", prod.id, e);
          }
        }
      } else {
        const prodList: Product[] = [];
        snapshot.forEach((d) => {
          prodList.push(d.data() as Product);
        });
        setProducts(prodList);
      }
    }, (error) => {
      console.error("Firestore products snapshot error: ", error);
    });

    return () => unsubscribe();
  }, []);

  // 4. Real-time Firestore synchronizer for site configs
  useEffect(() => {
    const defaultConfigs = {
      websiteNameEN: 'AmarBazar',
      websiteNameBN: 'আমারবাজার',
      subtextEN: 'Premium Heritage',
      subtextBN: 'প্রিমিয়াম অনলাইন শপ',
      newsHeadlinesEN: '🔥 Flash Deal: Special discounts on traditional sarees and smart gadgets! | 🚚 Free Shipping on orders above ৳5,000!',
      newsHeadlinesBN: '🔥 স্পেশাল অফার: টাঙ্গাইল শাড়ি ও স্মার্ট গ্যাজেটে বিশেষ ছাড়! | 🚚 ৫,০০০ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি!',
      logoColor: '#16A34A',
      logoImageUrl: '',
      logoSize: 48,
      whatsAppNumber: '01712-345678',
      bKashNumber: '01712-345678',
      hotline: '09612-AMARBD',
      navBgColor: '#0F172A',
      navMainBgColor: '#ffffff',
      navFontSize: 'sm',
      navFontFamily: 'sans',
      navButtonPadding: 'py-2 px-4',
      navButtonColor: '#16A34A',
      footerAboutEN: 'AmarBazar is Bangladesh\'s ultimate destination for authentic native traditional wear, pure organic items, and reliable IoT gadgets with robust after-sales warranties.',
      footerAboutBN: 'আমারবাজার ঐতিহ্য এবং আধুনিকতার এক অপূর্ব সমন্বয়। আমরা সরবরাহ করছি সম্পূর্ণ প্রিমিয়াম রাজশাহী সিল্ক, টাঙ্গাইল শাড়ি, এবং ১০০% দেশি বিশুদ্ধ খাদ্যপণ্য ও গ্যারান্টিযুক্ত গ্যাজেট।',
      footerAddress: 'Dhaka Head Office: House 14, Gause Pak Avenue, Sector 4, Uttara, Dhaka, Bangladesh',
      copyrightEN: '© 2026 AmarBazar Ltd. Built with pure state-of-the-art tech.',
      copyrightBN: '© ২০২৬ আমারবাজার লিমিটেড। সর্বস্বত্ব সংরক্ষিত।',
      navItems: [
        { id: 'home', title: 'Home / কালেকশন', visible: true },
        { id: 'dashboard', title: 'My Orders / কাস্টমার ড্যাশবোর্ড', visible: true },
        { id: 'admin', title: 'Admin CMS / অ্যাডমিন প্যানেল', visible: true },
      ]
    };

    const unsubscribe = onSnapshot(doc(db, 'configs', 'site'), async (docSnap) => {
      if (!docSnap.exists()) {
        console.log("Seeding default site configs to Firestore...");
        try {
          await setDoc(doc(db, 'configs', 'site'), defaultConfigs);
        } catch (e) {
          console.error("Error seeding configs to Firestore", e);
        }
      } else {
        _setSiteConfigs(docSnap.data());
      }
    }, (error) => {
      console.error("Firestore configs snapshot error: ", error);
    });

    return () => unsubscribe();
  }, []);

  // 5. Real-time Firestore synchronizer for banners
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'configs', 'banners'), async (docSnap) => {
      if (docSnap.exists()) {
        _setSiteBanners(docSnap.data().banners || []);
      }
    }, (error) => {
      console.error("Firestore banners snapshot error: ", error);
    });

    return () => unsubscribe();
  }, []);

  // 6. Real-time Firestore synchronizer for orders
  useEffect(() => {
    const defaultOrders = [
      {
        id: 'BD-847291',
        date: '15 May 2026',
        items: [
          {
            product: initialProducts[1], // Tangail Jamdani
            quantity: 1,
            selectedSize: 'Standard 5.5 Yards',
            selectedColor: 'Crimson Red'
          }
        ],
        total: 12500,
        status: 'Delivered',
        paymentMethod: 'bKash',
        paymentStatus: 'Paid',
        shippingAddress: {
          name: 'Tanvir Rahman',
          phone: '01712-345678',
          district: 'Dhaka',
          address: 'House 14, Gause Pak Avenue, Sector 4, Uttara'
        },
        trackingStep: 3 // Delivered
      },
      {
        id: 'BD-391827',
        date: '21 May 2026',
        items: [
          {
            product: initialProducts[2], // Watch
            quantity: 1,
            selectedSize: 'Regular 46mm',
            selectedColor: 'Carbon Black'
          }
        ],
        total: 3350,
        status: 'Shipped',
        paymentMethod: 'Nagad',
        paymentStatus: 'Paid',
        shippingAddress: {
          name: 'Tanvir Rahman',
          phone: '01712-345678',
          district: 'Dhaka',
          address: 'House 14, Gause Pak Avenue, Sector 4, Uttara'
        },
        trackingStep: 2 // Shipped
      }
    ];

    const unsubscribe = onSnapshot(collection(db, 'orders'), async (snapshot) => {
      if (snapshot.empty) {
        console.log("Seeding default bootstrap orders to Firestore...");
        for (const ord of defaultOrders) {
          try {
            await setDoc(doc(db, 'orders', ord.id), ord);
          } catch (e) {
            console.error("Error seeding order", ord.id, e);
          }
        }
      } else {
        const orderList: Order[] = [];
        snapshot.forEach((d) => {
          orderList.push(d.data() as Order);
        });
        // Sort orders so newer ones are on top (by parsing dates or IDs)
        orderList.sort((a, b) => b.id.localeCompare(a.id));
        setOrders(orderList);
      }
    }, (error) => {
      console.error("Firestore orders snapshot error: ", error);
    });

    return () => unsubscribe();
  }, []);

  // Countdown clock state for Flash Sale matching
  const [timeLeft, setTimeLeft] = useState({ hrs: 12, mins: 44, secs: 19 });

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft({ hrs: 24, mins: 0, secs: 0 });
      } else {
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hrs, mins, secs });
      }
    };
    
    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  // Dynamics to update document title reactively with the website name config and update the favicon
  useEffect(() => {
    const currentName = language === 'en'
      ? (siteConfigs?.websiteNameEN || 'AmarBazar')
      : (siteConfigs?.websiteNameBN || 'আমারবাজার');
    document.title = currentName;

    // Update browser tab favicon dynamically based on logo image or fallback
    const faviconUrl = siteConfigs?.logoImageUrl || 'https://i.postimg.cc/7ZLXY6VF/SMS-SHOPGEN-LOGO-3.png';
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = faviconUrl;
  }, [siteConfigs, language]);
  
  // Set fallback userRole for system compatibility
  const [userRole, setUserRole] = useState<'user' | 'admin'>(() => {
    try {
      const cached = localStorage.getItem('site_active_session');
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.role === 'user' ? 'user' : 'admin';
      }
    } catch {}
    return 'user';
  });

  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<Order | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<'metrics' | 'orders' | 'inventory' | 'sales' | 'account' | 'settings' | 'users' | 'forecasting'>('metrics');

  // Maintain and restore authenticated session with active Firebase Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          let data: any = {};
          if (userDocSnap.exists()) {
            data = userDocSnap.data();
          }

          const emailLower = (fbUser.email || data.email || '').toLowerCase().trim();
          let role = data.role || 'user';
          let permissions = data.permissions || [];

          // Enforce super_admin & demo admins by email
          if (emailLower === 'mdsumonali.cse@gmail.com') {
            role = 'super_admin';
            permissions = ['super_admin'];
          } else if (emailLower === 'addonly@amarbazar.com') {
            role = 'admin';
            permissions = ['add_products'];
          } else if (emailLower === 'products@amarbazar.com') {
            role = 'admin';
            permissions = ['add_products', 'modify_products'];
          } else if (emailLower === 'orders@amarbazar.com') {
            role = 'admin';
            permissions = ['manage_orders'];
          }

          // If role/permissions or other fields were different in Firestore, update Firestore to stay in sync
          if (!userDocSnap.exists() || data.role !== role || !data.permissions?.includes('super_admin') && role === 'super_admin') {
            const updatedProfile = {
              id: fbUser.uid,
              name: data.name || fbUser.displayName || (emailLower === 'mdsumonali.cse@gmail.com' ? 'Md Sumon Ali' : 'Unnamed User'),
              email: fbUser.email || data.email || emailLower,
              phone: data.phone || '',
              address: data.address || '',
              district: data.district || 'Dhaka',
              avatar: data.avatar || fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop',
              role,
              permissions,
              rewardPoints: data.rewardPoints || (role === 'super_admin' ? 5000 : 200),
              memberSince: data.memberSince || 'May 2026',
              orders: data.orders || [],
              cartItems: data.cartItems || [],
              wishlist: data.wishlist || []
            };
            await setDoc(userDocRef, updatedProfile, { merge: true });
            data = updatedProfile;
          }

          const account: UserAccount = {
            id: fbUser.uid,
            name: data.name || fbUser.displayName || 'Unnamed User',
            email: fbUser.email || data.email,
            phone: data.phone || '',
            address: data.address || '',
            district: data.district || 'Dhaka',
            avatar: data.avatar || fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop',
            role,
            permissions,
            rewardPoints: data.rewardPoints || 0,
            memberSince: data.memberSince || 'May 2026',
            orders: data.orders || [],
            cartItems: data.cartItems || [],
            wishlist: data.wishlist || []
          };
          
          setCurrentUser(account);
          setUserRole(account.role === 'user' ? 'user' : 'admin');
          localStorage.setItem('site_active_session', JSON.stringify(account));

          // Also keep in sync with local site_accounts ledger
          setAllAccounts(prev => {
            const idx = prev.findIndex(a => a.email.toLowerCase() === emailLower);
            if (idx !== -1) {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], id: fbUser.uid, role, permissions };
              localStorage.setItem('site_accounts', JSON.stringify(updated));
              return updated;
            } else {
              const updated = [...prev, account];
              localStorage.setItem('site_accounts', JSON.stringify(updated));
              return updated;
            }
          });

        } catch (err) {
          console.error("Error restoring Firebase session", err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Track previous page to clear active product details when navigating away from the details page
  const prevPageRef = useRef<Page>(currentPage);

  // Automatically scroll to the top of the viewport on any page navigation or tab/category selection
  useEffect(() => {
    if (prevPageRef.current === 'product-detail' && currentPage !== 'product-detail') {
      setActiveDetailProduct(null);
    }
    prevPageRef.current = currentPage;

    const performScroll = () => {
      window.scrollTo(0, 0);
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }
    };

    // Phase 1: Action completed immediately
    performScroll();

    // Phase 2: Action repeated on the next browser frame/macro-task layout paint (0ms delay)
    const t1 = setTimeout(performScroll, 0);

    // Phase 3: Action executed with a minor delay (50ms) to ensure animated transitions & content loading have complete reflow
    const t2 = setTimeout(performScroll, 50);

    // Phase 4: Full rendering fallback delay (150ms) to guarantee viewport reset on slower devices
    const t3 = setTimeout(performScroll, 150);

    // Phase 5: Long-tail fallback delay (300ms) to deal with dynamic data populations
    const t4 = setTimeout(performScroll, 300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [currentPage, activeAdminTab, activeDetailProduct?.id, selectedCategory]);

  // Syncing helper to modify details of an account inside local registry database
  const updateAccountData = (updatedAcc: UserAccount) => {
    setAllAccounts(prev => {
      const next = prev.map(a => a.id === updatedAcc.id ? updatedAcc : a);
      try {
        localStorage.setItem('site_accounts', JSON.stringify(next));
      } catch {}
      return next;
    });

    // Mirror updates back to live session parameters
    if (currentUser && currentUser.id === updatedAcc.id) {
      setCurrentUser(updatedAcc);
      try {
        localStorage.setItem('site_active_session', JSON.stringify(updatedAcc));
      } catch {}
    }
  };

  // Initial guest/anonymous user fallback state profile representation
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Guest Browser',
    email: 'guest@amarbazar.com',
    phone: 'Not connected',
    address: 'Not connected',
    district: 'Dhaka',
    rewardPoints: 0,
    memberSince: 'May 2026',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop'
  });

  // Dynamic Shipping threshold values (৳5,000 taka free ship)
  const freeShippingThreshold = 5000;
  const shippingCost = 60; // Standard Dhaka shipping charge

  // Starting bootstrap orders to populate user dashboard tracking timeline
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'BD-847291',
      date: '15 May 2026',
      items: [
        {
          product: initialProducts[1], // Tangail Jamdani
          quantity: 1,
          selectedSize: 'Standard 5.5 Yards',
          selectedColor: 'Crimson Red'
        }
      ],
      total: 12500,
      status: 'Delivered',
      paymentMethod: 'bKash',
      paymentStatus: 'Paid',
      shippingAddress: {
        name: 'Tanvir Rahman',
        phone: '01712-345678',
        district: 'Dhaka',
        address: 'House 14, Gause Pak Avenue, Sector 4, Uttara'
      },
      trackingStep: 3 // Delivered
    },
    {
      id: 'BD-391827',
      date: '21 May 2026',
      items: [
        {
          product: initialProducts[2], // Watch
          quantity: 1,
          selectedSize: 'Regular 46mm',
          selectedColor: 'Carbon Black'
        }
      ],
      total: 3350,
      status: 'Shipped',
      paymentMethod: 'Nagad',
      paymentStatus: 'Paid',
      shippingAddress: {
        name: 'Tanvir Rahman',
        phone: '01712-345678',
        district: 'Dhaka',
        address: 'House 14, Gause Pak Avenue, Sector 4, Uttara'
      },
      trackingStep: 2 // Shipped
    }
  ]);

  // Dynamically resolve active userProfile based on active session
  const activeProfile: UserProfile = currentUser ? {
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
    address: currentUser.address,
    district: currentUser.district,
    rewardPoints: currentUser.rewardPoints,
    memberSince: currentUser.memberSince,
    avatar: currentUser.avatar
  } : userProfile;

  // Dynamically resolve active orders list based on active session
  const displayedOrders: Order[] = currentUser ? currentUser.orders : orders;

  // General Shopping Handlers
  const handleAddToCart = (product: Product, qty: number = 1, size?: string, color?: string) => {
    // Pick default configurations if not defined
    const pickedSize = size || product.sizes?.[0] || '';
    const pickedColor = color || product.colors?.[0]?.name || '';

    setCartItems(prev => {
      const match = prev.find(
        i => i.product.id === product.id && i.selectedSize === pickedSize && i.selectedColor === pickedColor
      );

      if (match) {
        return prev.map(i =>
          i.product.id === product.id && i.selectedSize === pickedSize && i.selectedColor === pickedColor
            ? { ...i, quantity: Math.min(product.stock, i.quantity + qty) }
            : i
        );
      }
      return [...prev, { product, quantity: qty, selectedSize: pickedSize, selectedColor: pickedColor }];
    });

    // Fire decorative Toast notification
    showToast(
      language === 'en' 
        ? `Added ${qty}x "${product.brand} ${product.title}" to Cart.` 
        : `"${product.banglaTitle}" (${qty}টি) আপনার শপিং কার্টে যুক্ত হয়েছে।`,
      'success'
    );

    // Animate cart popup drawer open
    setIsCartOpen(true);
    // Close detail modal if not on product-detail page
    if (currentPage !== 'product-detail') {
      setActiveDetailProduct(null);
    }
  };

  const handleOrderNow = (product: Product, qty: number = 1, size?: string, color?: string) => {
    const pickedSize = size || product.sizes?.[0] || '';
    const pickedColor = color || product.colors?.[0]?.name || '';

    setCartItems(prev => {
      const match = prev.find(
        i => i.product.id === product.id && i.selectedSize === pickedSize && i.selectedColor === pickedColor
      );

      if (match) {
        return prev.map(i =>
          i.product.id === product.id && i.selectedSize === pickedSize && i.selectedColor === pickedColor
            ? { ...i, quantity: Math.min(product.stock, i.quantity + qty) }
            : i
        );
      }
      return [...prev, { product, quantity: qty, selectedSize: pickedSize, selectedColor: pickedColor }];
    });

    setActiveDetailProduct(null);
    setCurrentPage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateCartQty = (pId: string, delta: number, size?: string, color?: string) => {
    setCartItems(prev =>
      prev
        .map(i => {
          if (i.product.id === pId && i.selectedSize === size && i.selectedColor === color) {
            const nextQty = i.quantity + delta;
            return { ...i, quantity: Math.max(1, Math.min(i.product.stock, nextQty)) };
          }
          return i;
        })
    );
  };

  const handleRemoveCartItem = (pId: string, size?: string, color?: string) => {
    setCartItems(prev => {
      const target = prev.find(i => i.product.id === pId && i.selectedSize === size && i.selectedColor === color);
      if (target) {
        showToast(
          language === 'en'
            ? `Removed "${target.product.title}" from Cart.`
            : `"${target.product.banglaTitle}" কার্ট থেকে সরানো হয়েছে।`,
          'info'
        );
      }
      return prev.filter(i => !(i.product.id === pId && i.selectedSize === size && i.selectedColor === color));
    });
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const isAdded = !prev.includes(product.id);
      showToast(
        isAdded
          ? (language === 'en' ? `Love! Added "${product.title}" to Wishlist.` : `দারুণ! "${product.banglaTitle}" উইচলিস্টে যুক্ত হয়েছে।`)
          : (language === 'en' ? `Removed "${product.title}" from Wishlist.` : `"${product.banglaTitle}" উইচলিস্ট থেকে সরানো হয়েছে।`),
        'success'
      );
      return isAdded ? [...prev, product.id] : prev.filter(id => id !== product.id);
    });
  };

  const handlePlaceOrder = (newOrder: Order, pointsDeducted?: number) => {
    // Clear shopping cart
    setCartItems([]);

    const pointsDeduct = pointsDeducted || 0;
    // Award loyalty reward points based on order sum (1% points)
    const earnedPoints = Math.floor(newOrder.total / 100);

    if (currentUser) {
      const orderWithUserId: Order = {
        ...newOrder,
        userId: currentUser.id
      };
      const updatedPoints = Math.max(0, currentUser.rewardPoints - pointsDeduct + earnedPoints);
      const updatedUser: UserAccount = {
        ...currentUser,
        orders: [orderWithUserId, ...currentUser.orders],
        rewardPoints: updatedPoints
      };
      
      // Update local state registry
      updateAccountData(updatedUser);

      // Persist order with current user UID securely to backend database (Firestore)
      setDoc(doc(db, 'orders', orderWithUserId.id), orderWithUserId)
        .catch(e => console.error("Error persisting order in Firestore: ", e));

      // Persist expanded loyalty and order history changes in the customer profile
      updateDoc(doc(db, 'users', currentUser.id), {
        orders: updatedUser.orders,
        rewardPoints: updatedUser.rewardPoints
      }).catch(e => console.error("Error updating reward points in Firestore: ", e));

    } else {
      // Guest orders persist in standard orders cache array fallback and we write to firestore
      const guestOrder: Order = {
        ...newOrder,
        userId: 'guest'
      };
      setDoc(doc(db, 'orders', guestOrder.id), guestOrder)
        .catch(e => console.error("Error persisting guest order in Firestore: ", e));

      setUserProfile(prev => ({
        ...prev,
        rewardPoints: Math.max(0, prev.rewardPoints - pointsDeduct + earnedPoints)
      }));
    }

    // Trigger toast alerts for loyalty points earned!
    if (pointsDeduct > 0) {
      showToast(
        language === 'en'
          ? `Success! Used ${pointsDeduct} points for cash discounts + gained ${earnedPoints} new points!`
          : `সফলভাবে ${pointsDeduct} পয়েন্ট ছাড় হিসেবে ব্যবহার হয়েছে এবং ${earnedPoints}টি নতুন পয়েন্ট যোগ হয়েছে!`,
        'success'
      );
    } else {
      showToast(
        language === 'en'
          ? `Order placed! Gained ${earnedPoints} new shopper reward points.`
          : `অর্ডার সম্পন্ন হয়েছে! আপনি ${earnedPoints}টি শপিং বোনাস পয়েন্ট পেয়েছেন।`,
        'success'
      );
    }

    // Redirect to shopper's dashboard panel
    setCurrentPage('user-dashboard');
    // Set active invoice order to auto-open it immediately
    setActiveInvoiceOrder(newOrder);
  };

  // Administrator Controls Handlers
  const handleUpdateOrderStatus = async (oId: string, nextStep: number, currentLocation?: string, currentLocationBn?: string) => {
    const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    
    // Find the original order to update in Firestore
    const originalOrder = orders.find(o => o.id === oId);
    if (originalOrder) {
      const updated = {
        ...originalOrder,
        trackingStep: nextStep,
        status: statuses[nextStep] as any,
        paymentStatus: nextStep === 3 ? 'Paid' : originalOrder.paymentStatus,
        currentLocation: currentLocation || '',
        currentLocationBn: currentLocationBn || ''
      };
      try {
        await setDoc(doc(db, 'orders', oId), updated, { merge: true });
        showToast(language === 'en' ? "Order status updated!" : "অর্ডারের স্ট্যাটাস আপডেট হয়েছে!", "success");
      } catch (e) {
        console.error("Firestore order update error: ", e);
      }
    }

    // 2. Scan and update order status inside matches across all persistent customer accounts too
    setAllAccounts(prev => {
      const updated = prev.map(acc => {
        const orderIdx = acc.orders.findIndex(o => o.id === oId);
        if (orderIdx !== -1) {
          const updatedOrders = [...acc.orders];
          updatedOrders[orderIdx] = {
            ...updatedOrders[orderIdx],
            trackingStep: nextStep,
            status: statuses[nextStep] as any,
            paymentStatus: nextStep === 3 ? 'Paid' : updatedOrders[orderIdx].paymentStatus,
            currentLocation: currentLocation,
            currentLocationBn: currentLocationBn
          };
          return { ...acc, orders: updatedOrders };
        }
        return acc;
      });

      try {
        localStorage.setItem('site_accounts', JSON.stringify(updated));
      } catch {}

      // Keep active session synchronously matching if current logged-in user changed
      if (currentUser) {
        const matchingCached = updated.find(a => a.id === currentUser.id);
        if (matchingCached) {
          setCurrentUser(matchingCached);
          try {
            localStorage.setItem('site_active_session', JSON.stringify(matchingCached));
          } catch {}
        }
      }

      return updated;
    });
  };

  const handleCancelOrderStatus = async (oId: string) => {
    const originalOrder = orders.find(o => o.id === oId);
    if (originalOrder) {
      const updated = {
        ...originalOrder,
        status: 'Cancelled' as any
      };
      try {
        await setDoc(doc(db, 'orders', oId), updated, { merge: true });
        showToast(language === 'en' ? "Order cancelled!" : "অর্ডার বাতিল করা হয়েছে!", "info");
      } catch (e) {
        console.error("Firestore order cancel error: ", e);
      }
    }
  };

  const handleRestockProduct = async (pId: string) => {
    const prod = products.find(p => p.id === pId);
    if (prod) {
      const updated = { ...prod, stock: prod.stock + 20 };
      try {
        await setDoc(doc(db, 'products', String(pId)), updated);
        showToast(language === 'en' ? "Product restocked successfully!" : "পণ্য রি-স্টক করা হয়েছে!", "success");
      } catch (e) {
        console.error("Error restocking", e);
      }
    }
  };

  const handleUpdateAccountPermissions = (accId: string, permissions: AdminPermission[], role: 'user' | 'admin' | 'super_admin') => {
    setAllAccounts(prev => {
      const updated = prev.map(a => {
        if (a.id === accId) {
          return {
            ...a,
            permissions,
            role
          };
        }
        return a;
      });
      try {
        localStorage.setItem('site_accounts', JSON.stringify(updated));
      } catch {}

      // Keep live active session in sync if modified account belongs to current user
      if (currentUser && currentUser.id === accId) {
        const matchingCurrent = updated.find(a => a.id === accId);
        if (matchingCurrent) {
          setCurrentUser(matchingCurrent);
          try {
            localStorage.setItem('site_active_session', JSON.stringify(matchingCurrent));
          } catch {}
        }
      }

      return updated;
    });
  };

  const handleLoginSuccess = (account: UserAccount) => {
    setCurrentUser(account);
    setUserRole(account.role === 'user' ? 'user' : 'admin');
    try {
      localStorage.setItem('site_active_session', JSON.stringify(account));
    } catch {}
  };

  const handleRegisterSuccess = (account: UserAccount) => {
    setAllAccounts(prev => {
      const next = [...prev, account];
      try {
        localStorage.setItem('site_accounts', JSON.stringify(next));
      } catch {}
      return next;
    });
    setCurrentUser(account);
    setUserRole(account.role === 'user' ? 'user' : 'admin');
    try {
      localStorage.setItem('site_active_session', JSON.stringify(account));
    } catch {}
  };

  const handleSignOut = () => {
    fbSignOut(auth).catch(e => console.error("Firebase Signout Error", e));
    setCurrentUser(null);
    setUserRole('user');
    setCurrentPage('home');
    try {
      localStorage.removeItem('site_active_session');
    } catch {}
  };

  const handleAddProduct = async (newProduct: Product) => {
    try {
      await setDoc(doc(db, 'products', String(newProduct.id)), newProduct);
      showToast(language === 'en' ? "Product added successfully!" : "পণ্য সফলভাবে যুক্ত হয়েছে!", "success");
    } catch (e) {
      console.error("Error adding product", e);
      showToast("Error adding product", "info");
    }
  };

  const handleEditProduct = async (updatedProduct: Product) => {
    try {
      await setDoc(doc(db, 'products', String(updatedProduct.id)), updatedProduct);
      showToast(language === 'en' ? "Product updated successfully!" : "পণ্য সফলভাবে আপডেট করা হয়েছে!", "success");
    } catch (e) {
      console.error("Error updating product", e);
      showToast("Error updating product", "info");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', String(productId)));
      showToast(language === 'en' ? "Product deleted successfully!" : "পণ্য সফলভাবে ডিলিট করা হয়েছে!", "success");
    } catch (e) {
      console.error("Error deleting product", e);
      showToast("Error deleting product", "info");
    }
  };

  // Computations
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Filter Products based on category selection AND search queries (with smart scoring & phonetic/bilingual search support)
  const filteredProducts = products.map(p => {
    const score = scoreProductForSearch(p, searchQuery);
    return { product: p, score };
  })
  .filter(item => {
    if (item.score === 0) return false;
    // Bypasses current category lock when search query is typed, so searching globally always works.
    const matchesCategory = selectedCategory === 'all' || searchQuery.trim() !== '' || item.product.category === selectedCategory;
    return matchesCategory;
  })
  .sort((a, b) => {
    // Sort by score descending
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // If scores are equal and search is active, prioritize active category
    if (selectedCategory !== 'all' && searchQuery.trim() !== '') {
      const aInCat = a.product.category === selectedCategory ? 1 : 0;
      const bInCat = b.product.category === selectedCategory ? 1 : 0;
      return bInCat - aInCat;
    }
    return 0;
  })
  .map(item => item.product);

  const flashSaleProducts = products.filter(p => p.isFlashSale);

  const t = {
    trendingTitle: language === 'en' ? 'Trending Bestsellers' : 'ট্রেন্ডিং ও সর্বাধিক বিক্রীত',
    trendingDsc: language === 'en' ? 'Experience pure traditional luxury handlooms & premium, high-utility wearable accessories.' : 'চমত্কার দেশীয় তাঁত বসন এবং দৈনন্দিন জীবনের আধুনিক ও টেকসই স্মার্ট গ্যাজেটস।',
    flashTitle: language === 'en' ? 'Mega Premium Flash Sale' : 'মেগা প্রিমিয়াম ফ্ল্যাশ সেল',
    flashDsc: language === 'en' ? 'Limited stocks across fashion and luxury Islamic essentials. Price jumps as clock ticks.' : 'সীমিত অফার! সময়ের সাথে স্টক ফুরিয়ে যাওয়ার পূর্বেই আজই অর্ডার ডিল করুন।',
    whyUs: language === 'en' ? 'Shopping Simplified For Bangladesh' : 'কেন আপনি আমাদের বেছে নেবেন?',
    appTitle: language === 'en' 
      ? (siteConfigs.appTitleEN || 'Download Our Mobile Application') 
      : (siteConfigs.appTitleBN || 'আমাদের মোবাইল অ্যাপ ডাউনলোড করুন'),
    appDsc: language === 'en' 
      ? (siteConfigs.appDscEN || 'Get early notification alerts for heritage campaign drops. Easy tracking straight to your phone screen.') 
      : (siteConfigs.appDscBN || 'নতুন ঐতিহ্যবাহী পণ্য ও ফ্ল্যাশ সেলের নোটিফিকেশন সবার আগে পেতে ডাউনলোড করুন আমাদের অ্যান্ড্রয়েড আইওএস মোবাইল অ্যাপ্লিকেশান।'),
    copyright: language === 'en' 
      ? (siteConfigs.copyrightEN || '© 2026 AmarBazar Premium Ltd. Registered under Bangladesh Commerce Registry.') 
      : (siteConfigs.copyrightBN || '© ২০২৬ আমারবাজার প্রিমিয়াম লিমিটেড। বাংলাদেশ কমার্স এসোসিয়েশনের নিবন্ধিত অনলাইন প্ল্যাটফর্ম।')
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans selection:bg-[#16A34A] selection:text-white">
      {/* Header Sticky menu */}
      <Navbar
        language={language}
        setLanguage={setLanguage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        cartCount={cartCount}
        cartTotal={cartTotal}
        wishlistCount={wishlist.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onOpenCart={() => setIsCartOpen(true)}
        userRole={userRole}
        setUserRole={setUserRole}
        categoriesList={siteCategories}
        siteConfigs={siteConfigs}
        currentUser={currentUser}
        onSignOut={handleSignOut}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        allProducts={products}
        onViewProduct={setActiveDetailProduct}
        activeAdminTab={activeAdminTab}
        setActiveAdminTab={setActiveAdminTab}
        onToggleSupport={() => setIsChatbotOpen(!isChatbotOpen)}
      />

      {/* Pages Router View switcher */}
      <main className="flex-1 w-full pb-24 md:pb-0">
        {currentPage === 'home' && (
          <div className="flex flex-col gap-12 font-sans animate-fade-in">
            {/* Promo Banner and countdown elements */}
            {selectedCategory === 'all' && searchQuery.trim() === '' && (
              <HeroBanner
                language={language}
                onNavigateToCategory={(cat) => {
                  setSelectedCategory(cat);
                  const section = document.getElementById('products-explore-grid');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
                onExploreFlashSale={() => {
                  const section = document.getElementById('flash-sale-dedicated-grid');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
                siteBanners={siteBanners}
              />
            )}

            {/* Categories Selection Section (Horizontal Grid) */}
            {selectedCategory === 'all' && searchQuery.trim() === '' && (
              <section className="px-4 md:px-8 max-w-7xl mx-auto w-full">
                <div className="border-b border-slate-105 pb-3 mb-4 text-left">
                  <span className="text-[#16A34A] text-xs font-black uppercase tracking-widest block mb-1">
                    {language === 'en' ? 'Quick Explorations' : 'ক্যাটাগরি সমূহ'}
                  </span>
                  <h2 className="text-sm md:text-lg font-bold font-sans text-[#0F172A]">
                    {language === 'en' ? 'Premium Curated Categories' : 'আমাদের জনপ্রিয় ক্যাটাগরি'}
                  </h2>
                </div>

                <div className="flex md:grid md:grid-cols-7 gap-3 md:gap-4 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0 snap-x">
                  {siteCategories.map((cat) => {
                    const itemsCount = products.filter(p => p.category === cat.id).length;
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-2.5 w-[92px] sm:w-[105px] md:w-auto rounded-xl border text-center cursor-pointer select-none transition-all duration-300 flex flex-col justify-between items-center gap-1.5 aspect-square snap-start shrink-0 ${
                          selectedCategory === cat.id
                            ? 'border-[#16A34A] bg-emerald-50 text-emerald-800 font-extrabold shadow-sm'
                            : 'border-slate-100 bg-white text-slate-705 hover:border-[#16A34A]'
                        }`}
                      >
                        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-lg sm:text-2xl transition-all duration-300 ${
                          selectedCategory === cat.id ? 'bg-emerald-100/70 scale-105' : 'bg-slate-50'
                        }`}>
                          {cat.id === 'fashion' ? '👕' : cat.id === 'electronics' ? '📱' : cat.id === 'islamic' ? '🌙' : cat.id === 'home' ? '🛋️' : cat.id === 'gadgets' ? '🔌' : cat.id === 'cctv' ? '🛡️' : '👶'}
                        </div>
                        <div className="leading-tight w-full">
                          <span className="text-[10px] md:text-xs font-bold font-sans block leading-tight text-slate-700 truncate max-w-full">{cat.name[language]}</span>
                          <span className="text-[8px] md:text-[9.5px] text-slate-400 block font-mono mt-0.5">
                            {language === 'en' ? `${itemsCount} Pcs` : `${itemsCount}টি`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
            {/* Flash Sale Grid (Active filtered items) */}
            {selectedCategory === 'all' && searchQuery.trim() === '' && (
              <section id="flash-sale-dedicated-grid" className="px-4 md:px-8 max-w-7xl mx-auto w-full">
                <div className="border-b border-slate-100 pb-3.5 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
                    <div>
                      <span className="bg-[#DE0D6C] text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mb-1.5 inline-block">
                        {language === 'en' ? 'LIMITED OFFER' : 'সীমিত অফার'}
                      </span>
                      <h2 className="text-[#DE0D6C] text-sm md:text-lg font-bold font-sans uppercase tracking-tight block">
                        {t.flashTitle}
                      </h2>
                      <p className="text-slate-400 text-xs hidden sm:block">{t.flashDsc}</p>
                    </div>

                    {/* Highly Visual Ticking Countdown Boxes */}
                    <div className="flex items-center gap-1.5 font-mono text-xs font-black select-none text-white shrink-0 mt-0.5">
                      <span className="text-slate-500 font-sans font-black text-[9.5px] uppercase tracking-wider mr-1">
                        {language === 'en' ? 'ENDS IN:' : 'শেষ হতে বাকি:'}
                      </span>
                      <div className="bg-[#DE0D6C] px-2 py-1 rounded-lg min-w-[28px] text-center shadow-xs text-xs font-bold font-mono">
                        {timeLeft.hrs.toString().padStart(2, '0')}
                      </div>
                      <span className="text-[#DE0D6C] font-extrabold animate-pulse">:</span>
                      <div className="bg-[#DE0D6C] px-2 py-1 rounded-lg min-w-[28px] text-center shadow-xs text-xs font-bold font-mono">
                        {timeLeft.mins.toString().padStart(2, '0')}
                      </div>
                      <span className="text-[#DE0D6C] font-extrabold animate-pulse">:</span>
                      <div className="bg-[#DE0D6C] px-2 py-1 rounded-lg min-w-[28px] text-center shadow-xs text-xs font-bold font-mono">
                        {timeLeft.secs.toString().padStart(2, '0')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[#DE0D6C] font-sans text-[11px] font-extrabold uppercase bg-[#DE0D6C]/5 border border-[#DE0D6C]/10 px-3 py-1 rounded-full self-start md:self-center">
                    <span>⚡ {language === 'en' ? 'Free Delivery on ৳5,000+' : '৳৫,০০০+ চেকআউটে ফ্রি ডেলিভারি'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                  {flashSaleProducts.slice(0, 4).map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      language={language}
                      onAddToCart={(prod) => handleAddToCart(prod)}
                      onQuickView={(prod) => setActiveDetailProduct(prod)}
                      onSelectProduct={(prod) => {
                        setActiveDetailProduct(prod);
                        window.scrollTo({ top: 0, behavior: 'instant' });
                      }}
                      isWishlisted={wishlist.includes(p.id)}
                      onToggleWishlist={(prod) => handleToggleWishlist(prod)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Trending / Explore Grid */}
            <section id="products-explore-grid" className="px-4 md:px-8 max-w-7xl mx-auto w-full">
              <div className="border-b border-slate-105 pb-4 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-left">
                <div>
                  <span className="text-[#16A34A] text-xs font-black uppercase tracking-widest block mb-1">
                    {selectedCategory !== 'all' 
                      ? (language === 'en' ? 'Category Filter' : 'ক্যাটাগরি ফিল্টার')
                      : searchQuery.trim() !== ''
                        ? (language === 'en' ? 'Search Results' : 'অনুসন্ধানের ফলাফল')
                        : t.trendingTitle
                    }
                  </span>
                  <h2 className="text-xl md:text-3xl font-extrabold text-[#0F172A] flex items-center gap-2">
                    {selectedCategory !== 'all' ? (
                      <>
                        <span>📂</span>
                        <span>{siteCategories.find(c => c.id === selectedCategory)?.name[language]}</span>
                      </>
                    ) : searchQuery.trim() !== '' ? (
                      <>
                        <span>🔍</span>
                        <span>"{searchQuery}"</span>
                      </>
                    ) : (
                      language === 'en' ? 'Our Exclusive Products' : 'আমাদের এক্সক্লুসিভ পণ্যসমূহ'
                    )}
                  </h2>
                  <p className="text-slate-500 text-xs mt-1 max-w-xl">
                    {selectedCategory !== 'all'
                      ? (language === 'en' 
                          ? `Showing products registered under ${siteCategories.find(c => c.id === selectedCategory)?.name.en}.` 
                          : `${siteCategories.find(c => c.id === selectedCategory)?.name.bn} ক্যাটাগরির পণ্যগুলো দেখানো হচ্ছে।`)
                      : searchQuery.trim() !== ''
                        ? (language === 'en' ? `We found ${filteredProducts.length} items matching your query.` : `আপনার অনুসন্ধানের সাথে মিলে যাওয়া ${filteredProducts.length}টি পণ্য পাওয়া গেছে।`)
                        : t.trendingDsc
                    }
                  </p>
                </div>
                
                {(selectedCategory !== 'all' || searchQuery.trim() !== '') && (
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-205 text-slate-707 text-xs font-extrabold shadow-xs border border-slate-200 transition shrink-0 select-none cursor-pointer"
                  >
                    <span>🔄</span>
                    <span>{language === 'en' ? 'Clear Filters' : 'ফিল্টার মুছুন'}</span>
                  </button>
                )}
              </div>

              {filteredProducts.length === 0 ? (
                <div className="bg-slate-50 border border-slate-201 rounded-2xl py-12 px-6 text-center text-slate-450 text-xs font-sans">
                  {language === 'en' ? 'No matching products found under selection. Broaden your words!' : 'দুঃখিত, এই ক্যাটাগরি বা কিওয়ার্ড অনুযায়ী কোনো পণ্য পাওয়া যায়নি।'}
                </div>
              ) : (
                <div className="flex flex-col gap-6.5">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                    {filteredProducts.slice(0, visibleProductsCount).map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        language={language}
                        onAddToCart={(prod) => handleAddToCart(prod)}
                        onQuickView={(prod) => setActiveDetailProduct(prod)}
                        onSelectProduct={(prod) => {
                          setActiveDetailProduct(prod);
                          window.scrollTo({ top: 0, behavior: 'instant' });
                        }}
                        isWishlisted={wishlist.includes(p.id)}
                        onToggleWishlist={(prod) => handleToggleWishlist(prod)}
                      />
                    ))}
                  </div>
                  
                  {visibleProductsCount < filteredProducts.length && (
                    <div className="flex justify-center mt-3 pt-2">
                      <button
                        onClick={() => setVisibleProductsCount(prev => prev + 8)}
                        className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-[#16A34A] text-white text-xs font-extrabold shadow-md cursor-pointer transition-all active:scale-95 select-none"
                      >
                        <span>👇</span>
                        <span>{language === 'en' ? 'More Products' : 'আরো পণ্য দেখুন'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Brands Showcase Section - Compact Single Line with 5 small items */}
            {selectedCategory === 'all' && searchQuery.trim() === '' && (
              <section className="px-4 md:px-8 max-w-7xl mx-auto w-full bg-white py-6 rounded-2xl border border-slate-100">
                <div className="text-center max-w-xs mx-auto mb-4">
                  <span className="text-[#16A34A] text-[10px] font-black uppercase tracking-widest block mb-0.5">Our Partners</span>
                  <h3 className="text-xs sm:text-sm font-extrabold font-sans text-slate-800">
                    {language === 'en' ? 'Featured Bangladeshi Brands' : 'আমাদের বিশ্বস্ত পার্টনার ও ব্র্যান্ড'}
                  </h3>
                </div>

                <div className="grid grid-cols-5 gap-1.5 sm:gap-4 max-w-xl mx-auto">
                  {(siteConfigs.featuredBrands || featuredBrands).slice(0, 5).map((brand: any) => (
                    <div key={brand.id} className="border border-slate-50 p-1 md:p-2.5 rounded-xl hover:shadow-xs hover:border-emerald-100 transition flex flex-col justify-center items-center gap-1 bg-slate-50/50">
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-8 h-8 rounded-full object-cover grayscale opacity-70 group-hover:grayscale-0 hover:opacity-100 transition shadow-inner bg-white"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[8px] md:text-[10px] font-bold text-slate-650 truncate w-full text-center leading-none mt-0.5">{brand.name}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Buyer Trust Matrix: Why Choose Us */}
            {selectedCategory === 'all' && searchQuery.trim() === '' && (
              <section className="px-4 md:px-8 max-w-7xl mx-auto w-full bg-[#0F172A] text-white py-12 rounded-3xl border border-slate-800">
                <div className="text-center max-w-xl mx-auto mb-10">
                  <h3 className="text-lg md:text-2xl font-bold font-sans text-emerald-400">
                    {t.whyUs}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
                  {[
                    { icon: Truck, title: { en: 'Next-Day Fast Delivery', bn: '১ দিনে দ্রুত ডেলিভারি' }, desc: { en: 'In Dhaka metro area', bn: 'সমগ্র ঢাকা সিটিতে ২৪ ঘণ্টার মধ্যে' } },
                    { icon: ShieldCheck, title: { en: 'Trust & Authenticity', bn: '১০০% বিশ্বস্ত ও জেনুইন' }, desc: { en: 'Direct source guarantees', bn: 'সরাসরি নিজস্ব কচ্ছ কারখানায় তৈরি' } },
                    { icon: RotateCcw, title: { en: 'Easy 7-Day Returns', bn: '৭ দিনে সহজ ফেরত পলিসি' }, desc: { en: 'Hassle-free direct refunds', bn: 'পছন্দ না হলে সাথে সাথেই টাকা ফেরত' } },
                    { icon: ThumbsUp, title: { en: 'Cash on Delivery', bn: 'ক্যাশ অন ডেলিভারি' }, desc: { en: 'Pay after check & satisfaction', bn: 'পণ্য হাতে পেয়ে টাকা বুঝিয়ে দিন' } }
                  ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                      <div key={idx} className="border border-slate-850 p-5 rounded-2xl flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-emerald-950 text-[#16A34A] border border-emerald-900 flex-shrink-0">
                          <Icon className="w-5 h-5 text-[#16A34A]" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm font-bold text-slate-200">{stat.title[language]}</h4>
                          <p className="text-[11px] text-slate-400 leading-normal mt-1">{stat.desc[language]}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* App Promotion section - Reduced compact size */}
            {selectedCategory === 'all' && searchQuery.trim() === '' && (
              <section className="px-4 md:px-8 max-w-7xl mx-auto w-full">
                <div className="bg-gradient-to-br from-[#16A34A] to-emerald-900 text-white p-5 md:p-8 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-md border border-emerald-700/20">
                  <div className="md:max-w-lg text-left">
                    <span className="bg-[#0F172A] text-white text-[8px] uppercase px-2.5 py-1 rounded-full font-sans font-black tracking-widest block w-max mb-2">
                      SHOP ON THE GO
                    </span>
                    <h3 className="text-base md:text-xl font-extrabold tracking-tight mb-2">
                      {t.appTitle}
                    </h3>
                    <p className="text-[11px] md:text-xs text-emerald-100 font-medium leading-relaxed">
                      {t.appDsc}
                    </p>

                    {/* Highly Compact Simulated App Store badges */}
                    <div className="flex gap-2.5 mt-5 max-w-xs">
                      <a
                        href={siteConfigs.appPlayStoreUrl || "https://play.google.com"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-950 border border-slate-900 p-1.5 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer select-none hover:bg-slate-900 transition"
                      >
                        <span className="text-sm border-0">🤖</span>
                        <div className="text-left text-[8px] font-sans font-bold text-slate-400">
                          GET IT ON <span className="text-[10px] font-black text-white block leading-none">Google Play</span>
                        </div>
                      </a>
                      <a
                        href={siteConfigs.appAppStoreUrl || "https://apps.apple.com"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-slate-950 border border-slate-900 p-1.5 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer select-none hover:bg-slate-900 transition"
                      >
                        <span className="text-sm border-0">🍎</span>
                        <div className="text-left text-[8px] font-sans font-bold text-slate-400">
                          Download on <span className="text-[10px] font-black text-white block leading-none">App Store</span>
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* Slimmer Graphic container mock phone UI */}
                  {siteConfigs.appBannerImageUrl ? (
                    <div className="hidden md:block w-36 h-48 rounded-2xl overflow-hidden relative shadow-lg border-2 border-white/10 bg-slate-900 flex-shrink-0 group">
                      <img
                        src={siteConfigs.appBannerImageUrl}
                        alt="App Preview Banner"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-2.5 flex flex-col justify-end text-left">
                        <span className="text-[8px] font-black tracking-widest text-[#16A34A] uppercase font-mono bg-white/90 px-1 py-0.5 rounded w-max">Official App</span>
                        <span className="text-[9px] font-bold text-white mt-1 leading-none">Scan & Check</span>
                      </div>
                    </div>
                  ) : (
                    <div className="hidden md:flex w-28 h-36 border-4 border-[#0F172A] bg-[#0F172A] rounded-t-2xl overflow-hidden relative shadow-sm flex-col justify-between p-2.5 flex-shrink-0">
                      <div className="bg-slate-850 p-2 rounded-lg border border-slate-800">
                        <div className="w-3 h-3 rounded-full bg-[#16A34A]" />
                        <div className="h-1 bg-slate-700 w-12 rounded mt-1" />
                      </div>
                      <div className="w-full bg-[#16A34A] py-1 rounded-sm text-[6px] font-bold text-white text-center font-sans tracking-wide">
                        Verified Order
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}

        {currentPage === 'checkout' && (
          <CheckoutView
            language={language}
            cartItems={cartItems}
            cartTotal={cartTotal}
            freeShippingThreshold={freeShippingThreshold}
            onSubmitOrder={handlePlaceOrder}
            onNavigateHome={() => setCurrentPage('home')}
            userRewardPoints={activeProfile.rewardPoints}
          />
        )}

        {currentPage === 'product-detail' && activeDetailProduct && (
          <ProductDetailPage
            product={activeDetailProduct}
            language={language}
            onAddToCart={handleAddToCart}
            onOrderNow={handleOrderNow}
            isWishlisted={wishlist.includes(activeDetailProduct.id)}
            onToggleWishlist={() => handleToggleWishlist(activeDetailProduct)}
            onNavigateHome={() => setCurrentPage('home')}
            allProducts={products}
            onSelectProduct={(p) => setActiveDetailProduct(p)}
            onNavigateToCategory={(cat) => {
              setSelectedCategory(cat);
              setCurrentPage('home');
              setTimeout(() => {
                const section = document.getElementById('products-explore-grid');
                section?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
          />
        )}

        {currentPage === 'user-dashboard' && (
          <UserDashboard
            language={language}
            orders={displayedOrders}
            userProfile={activeProfile}
            onViewInvoice={setActiveInvoiceOrder}
            onCancelOrder={handleCancelOrderStatus}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentPage === 'admin-dashboard' && (
          <AdminDashboard
            language={language}
            orders={orders}
            products={products}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onCancelOrderStatus={handleCancelOrderStatus}
            onAddStock={handleRestockProduct}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            siteBanners={siteBanners}
            setSiteBanners={setSiteBanners}
            siteCategories={siteCategories}
            setSiteCategories={setSiteCategories}
            siteConfigs={siteConfigs}
            setSiteConfigs={setSiteConfigs}
            currentUser={currentUser}
            allAccounts={allAccounts}
            onUpdateAccountPermissions={handleUpdateAccountPermissions}
            activeTab={activeAdminTab}
            setActiveTab={setActiveAdminTab}
            analyticsTotalVisits={analyticsTotalVisits}
            analyticsLocations={analyticsLocations}
            analyticsSearches={analyticsSearches}
          />
        )}
      </main>

      {/* FOOTER SECTION */}
      <footer className="bg-[#0F172A] text-slate-400 font-sans text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* About & Localized support contacts */}
          <div className="flex flex-col gap-4 text-left">
            <div className="flex items-center gap-2">
              {siteConfigs.logoImageUrl ? (
                <img 
                  src={siteConfigs.logoImageUrl} 
                  alt="Logo" 
                  style={{ height: `${Math.min(54, siteConfigs.logoSize || 45)}px` }} 
                  className="w-auto object-contain shrink-0 rounded-lg animate-fade-in" 
                  referrerPolicy="no-referrer" 
                />
              ) : (
                <>
                  <div className="bg-[#16A34A] text-white p-2 rounded-lg" style={{ backgroundColor: siteConfigs.logoColor || '#16A34A' }}>
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="text-lg font-bold text-white tracking-tight">
                    {language === 'en' ? (siteConfigs.websiteNameEN || 'AmarBazar') : (siteConfigs.websiteNameBN || 'আমারবাজার')}
                  </span>
                </>
              )}
            </div>
            <p className="text-slate-400 font-normal leading-relaxed">
              {language === 'en'
                ? (siteConfigs.footerAboutEN || 'High-end multi-category traditional lifestyle and tech gadgets. We pride ourselves on authentic sources, premium materials, and instant dispatching across Bangladesh.')
                : (siteConfigs.footerAboutBN || 'বিশ্বস্ত ও রাজকীয় ঐতিহ্যবাহী কোয়ালিটি শপ। আমরা সরবরাহ করি রাজশাহী সিল্ক, টাঙ্গাইল তাঁত শাড়ি এবং আধুনিক সিকিউরিটি গ্যাজেটস।')}
            </p>

            <div className="flex flex-col gap-2 mt-2">
              <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-400" /> Hotline: {siteConfigs.hotline || '01712-345678'}</span>
              <span className="flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-400" /> WhatsApp: {siteConfigs.whatsAppNumber || '01712-345678'}</span>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-400" /> {siteConfigs.footerAddress || 'Sector 4, Uttara, Dhaka-1230'}</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-col gap-3.5 text-left">
            <span className="text-white font-extrabold text-sm uppercase tracking-wider block mb-1">
              {language === 'en' ? 'Fulfillment Services' : 'গ্রাহক সেবা'}
            </span>
            <button onClick={() => setCurrentPage('home')} className="hover:text-white transition w-max">Homepage View</button>
            <button onClick={() => setCurrentPage('user-dashboard')} className="hover:text-white transition w-max">Active Order Tracking</button>
            <button onClick={() => setCurrentPage('user-dashboard')} className="hover:text-white transition w-max">Profile Setting</button>
            <button onClick={() => { setUserRole('admin'); setCurrentPage('admin-dashboard'); }} className="hover:text-white transition text-amber-500 font-bold w-max">Admin Panel Simulator</button>
          </div>

          {/* Guidelines info */}
          <div className="flex flex-col gap-3.5 text-left">
            <span className="text-white font-extrabold text-sm uppercase tracking-wider block mb-1">
              {language === 'en' ? 'Islamic & Social Care' : 'নীতিমালা ও সামাজিক দায়বদ্ধতা'}
            </span>
            <span>১০০% হালাল ও অ্যালকোহলমুক্ত প্রসাধন</span>
            <span>গ্রামীণ তাঁতি ও কারিগর ফান্ড ট্রাস্ট</span>
            <span>ক্যাশ অন ডেলিভারি সেফ প্রোফাইল</span>
            <span>৭ দিনের রিফান্ড ও রিটার্ন অধিকার</span>
          </div>

          {/* Gateway integration showcase logs (bKash, Nagad, Mastercard, Visa) */}
          <div className="flex flex-col gap-4 text-left">
            <span className="text-white font-extrabold text-sm uppercase tracking-wider block mb-1">
              {language === 'en' ? 'Secured Gateway Partners' : 'নিরাপদ পেমেন্ট পার্টনারস'}
            </span>
            
            {/* Visual payment badge icons */}
            <div className="grid grid-cols-2 gap-2 max-w-xs font-mono font-bold text-[10px]">
              <div className="bg-[#DE0D6C] text-white p-2 rounded-lg text-center shadow-inner select-none uppercase">bKash</div>
              <div className="bg-[#F25A2B] text-white p-2 rounded-lg text-center shadow-inner select-none uppercase">Nagad</div>
              <div className="bg-[#8C3494] text-white p-2 rounded-lg text-center shadow-inner select-none uppercase">Rocket</div>
              <div className="bg-slate-800 text-slate-300 p-2 rounded-lg text-center shadow-inner select-none uppercase">COD</div>
            </div>

            <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl mt-2 flex items-center gap-1.5 text-slate-450 leading-relaxed">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>Complies with local central bank regulations. Verification protected by SSL.</span>
            </div>
          </div>

        </div>

        {/* copyright metadata section bottom line */}
        <div className="bg-slate-950/60 py-6 text-center border-t border-slate-900 px-4">
          <p className="text-slate-500 text-[11px] leading-relaxed">
            {t.copyright}
          </p>
        </div>
      </footer>

      {/* PRODUCT DETAIL OVERLAY MODAL */}
      {activeDetailProduct && currentPage !== 'product-detail' && (
        <ProductDetailModal
          product={activeDetailProduct}
          language={language}
          onClose={() => setActiveDetailProduct(null)}
          onAddToCart={handleAddToCart}
          onOrderNow={handleOrderNow}
          isWishlisted={wishlist.includes(activeDetailProduct.id)}
          onToggleWishlist={() => handleToggleWishlist(activeDetailProduct)}
        />
      )}

      {/* INVOICE MODAL OVERLAY */}
      {activeInvoiceOrder && (
        <InvoiceModal
          order={activeInvoiceOrder}
          language={language}
          onClose={() => setActiveInvoiceOrder(null)}
          siteConfigs={siteConfigs}
        />
      )}

      {/* SHOPPING BAG SIDEBAR DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        language={language}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onNavigateToCheckout={() => {
          setIsCartOpen(false);
          setCurrentPage('checkout');
        }}
        shippingCost={shippingCost}
        freeShippingThreshold={freeShippingThreshold}
      />

      {/* AUTHENTICATION POPUP OVERLAY */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        language={language}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
        allAccounts={allAccounts}
      />

      {/* DYNAMIC SHARP TOAST BANNER */}
      {toast && (
        <div className="fixed top-24 right-6 z-[100] max-w-sm hover:scale-105 transition-all">
          <div className={`p-4 rounded-2xl shadow-xl border flex items-center gap-3 ${
            toast.type === 'success' 
              ? 'bg-[#16A34A] text-white border-emerald-500' 
              : 'bg-slate-900 text-slate-100 border-slate-800'
          }`}>
            <span className="text-base select-none">{toast.type === 'success' ? '✅' : 'ℹ️'}</span>
            <span className="text-xs font-bold font-sans tracking-wide">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-auto text-white/70 hover:text-white transition focus:outline-none">
              <span className="text-xs font-black">✕</span>
            </button>
          </div>
        </div>
      )}

      {/* CUSTOMER SUPPORT CHAT FLOAT PANEL */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-[95] flex-col gap-3">
        {/* Customer chat box floating trigger */}
        <button 
          onClick={() => setIsChatbotOpen(!isChatbotOpen)}
          className="w-14 h-14 rounded-full bg-[#16A34A] text-white shadow-2xl hover:shadow-emerald-250 flex items-center justify-center transition active:scale-95 hover:scale-[1.05] cursor-pointer"
          title={language === 'en' ? 'Live Support Assistant' : 'লাইভ সাপোর্ট অ্যাসিস্ট্যান্ট'}
        >
          {isChatbotOpen ? (
            <span className="text-sm font-black">✕</span>
          ) : (
            <span className="text-xl">💬</span>
          )}
        </button>
      </div>

      {/* AUTOMATED HELPER CHAT DIALOG */}
      {isChatbotOpen && (
        <div className="fixed bottom-24 right-6 z-[95] w-full max-w-sm bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col font-sans">
          {/* Support Header */}
          <div className="bg-[#16A34A] text-white p-4 flex justify-between items-center text-left">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl select-none">🤖</span>
              <div>
                <h4 className="font-extrabold text-xs tracking-wide uppercase leading-tight">AmarBazar Helper Bot</h4>
                <p className="text-[10px] text-emerald-100 font-medium tracking-tight">Support Agent Auto-Pilot Active</p>
              </div>
            </div>
            <button 
              onClick={() => setIsChatbotOpen(false)}
              className="text-white/85 hover:text-white text-xs font-bold font-sans"
            >
              ✕
            </button>
          </div>

          {/* Response window log */}
          <div className="p-4 flex-grow h-[260px] overflow-y-auto bg-slate-50 flex flex-col gap-3">
            {chatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto text-right' : 'mr-auto text-left'}`}
              >
                <div 
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-slate-900 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-100 text-[#0F172A] rounded-tl-none shadow-xs'
                  }`}
                >
                  {language === 'en' ? (msg.textEN || msg.textBN) : (msg.textBN || msg.textEN)}
                </div>
                <span className="text-[9px] text-slate-400 font-mono mt-1 font-medium block">
                  {msg.time}
                </span>
              </div>
            ))}
          </div>

          {/* Quick FAQ suggestion buttons */}
          <div className="px-4 py-2 bg-white border-t border-slate-100 overflow-x-auto flex gap-1.5 max-w-full">
            {[
              { labelEN: '🚚 Delivery Cost', labelBN: '🚚 ডেলিভারি কত?', qEN: 'What is the delivery charge and timeline across Bangladesh?', qBN: 'ডেলিভারি চার্জ কত এবং কতদিনের মধ্যে হাতে পাব?' },
              { labelEN: '💵 Easy COD', labelBN: '💵 ক্যাশঅনডেলিভারি', qEN: 'Do you support Cash on Delivery (COD)?', qBN: 'আপনাদের এখানে কি ক্যাশ অন ডেলিভারি (হাতে পেয়ে মূল্য পরিশোধ) সুবিধা আছে?' },
              { labelEN: '⭐ Points Discount', labelBN: '⭐ রিওয়ার্ড ছাড়', qEN: 'How do I use and earn my reward points for discounts?', qBN: 'রিওয়ার্ড পয়েন্ট কীভাবে ডিসকাউন্টের জন্য ব্যবহার করা যায়?' },
              { labelEN: '📦 Return Window', labelBN: '📦 পণ্য ফেরত', qEN: 'What is your product return & replacement policy?', qBN: 'পণ্য পছন্দ না হলে কি রিটার্ন করা যাবে?' }
            ].map((faq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const userMsg = { sender: 'user', textEN: faq.qEN, textBN: faq.qBN, time: timeStr };
                  
                  let botMsgTextEN = "Thank you! Our custom representative team is offline right now, but your query has been flagged. Hot line: 01712-345678.";
                  let botMsgTextBN = "আপনার জিজ্ঞাসার জন্য ধন্যবাদ! সাহায্য করতে আমাদের সাপোর্ট এজেন্ট শীঘ্রই যুক্ত হচ্ছেন। গরম হটলাইন: 01712-345678।";
                  
                  if (faq.labelEN.includes('Delivery')) {
                    botMsgTextEN = "🚚 Inside Dhaka city, delivery charge is ৳60 (24 hrs). Outside Dhaka, the charge is ৳120 (2-3 days). FREE shipping is auto-applied for orders ৳5,000+!";
                    botMsgTextBN = "🚚 ঢাকা সিটিতে ডেলিভারি চার্জ ৬০ টাকা (সময় সর্বোচ্চ ২৪ ঘণ্টা)। ঢাকার বাইরে ডেলিভারি চার্জ ১২০ টাকা (সময় ২-৩ দিন)। ৫,০০০ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি সরাসরি প্রদেয়!";
                  } else if (faq.labelEN.includes('COD')) {
                    botMsgTextEN = "💵 Yes, we support Cash on Delivery across all districts of Bangladesh. You can check the package content and size upon arrival and pay the delivery rider.";
                    botMsgTextBN = "💵 জী হ্যাঁ! সমগ্র বাংলাদেশে আমরা কুরিয়ারের মাধ্যমে ক্যাশ অন ডেলিভারি সেবায় পণ্য পাঠিয়ে থাকি। পণ্য খুলে দেখে সন্তুষ্ট হয়ে ডেলিভারি ম্যানে কাছে টাকা দিন।";
                  } else if (faq.labelEN.includes('Points')) {
                    botMsgTextEN = "⭐ You gain checkout cash reward points on every order (1% value). Click 'Use Reward Points' slider inside Checkout billing summary anytime to pay using points!";
                    botMsgTextBN = "⭐ প্রত্যেকটি অর্ডারে মূল মূল্যের ১% রিওয়ার্ড পয়েন্ট বোনাস হিসেবে আপনার প্রোফাইলে যোগ হয়। চেকআউট করার সময় চমৎকার অন-অফ স্লইডার অন করে রিওয়ার্ড সরাসরি মাইনাস কেটে ক্যাশ ছাড় নিন!";
                  } else if (faq.labelEN.includes('Return')) {
                    botMsgTextEN = "📦 We are happy to offer a 7-day hassle-free return window. If you find any sizing mismatch or authentic defects, WhatsApp us, and we will refund you.";
                    botMsgTextBN = "📦 আমরা দিচ্ছি ৭ দিনের উইদাউট-কোয়েশ্চন রিটার্ন গ্যারান্টি! কোনো কালার বা সাইজে সমস্যা থাকলে রাজশাহীর ঐতিহ্যবাহী সিল্ক বা গ্যাজেট ফেরত দিয়ে সাথে সাথেই সম্পূর্ণ রিফান্ড বুঝে নিন।";
                  }

                  const botMsg = { sender: 'bot', textEN: botMsgTextEN, textBN: botMsgTextBN, time: timeStr };
                  setChatMessages(prev => [...prev, userMsg, botMsg]);
                }}
                className="shrink-0 text-[10.5px] px-2.5 py-1 bg-emerald-50 text-[#16A34A] border border-emerald-100 rounded-full font-bold hover:bg-[#16A34A] hover:text-white transition cursor-pointer"
              >
                {language === 'en' ? faq.labelEN : faq.labelBN}
              </button>
            ))}
          </div>

          {/* Chat user manual submission form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const inputEl = document.getElementById('chatbot-user-input') as HTMLInputElement;
              const text = inputEl?.value?.trim();
              if (!text) return;
              
              const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const userMsg = { sender: 'user', textEN: text, textBN: text, time: timeStr };
              
              let botMsgTextEN = "Got it! Our staff support dispatching team is busy right now. We will answer this shortly. Feel free to ring our hotline: 01712-345678.";
              let botMsgTextBN = "আপনার মেসেজটি আমাদের সাপোর্ট সিস্টেমে জমা হয়েছে। আমরা শীঘ্রই যোগাযোগ করবো। হটলাইন নাম্বার: 01712-345678।";
              
              const lowText = text.toLowerCase();
              if (lowText.includes('discount') || lowText.includes('promo') || lowText.includes('ছাড়') || lowText.includes('অফার')) {
                botMsgTextEN = "🎟️ Spin our Lucky Wheel once everyday to score sweet dynamic promo discounts! You can also use code 'SAVE10'.";
                botMsgTextBN = "🎟️ আমাদের চমৎকার লাকি স্পিন হুইলটি দৈনিক ঘুরিয়ে জিতে নিতে পারেন আকর্ষণীয় ডিসকাউন্ট ভাউচার বা ক্যাশ বোনাস প্রোমো কোড!";
              } else if (lowText.includes('silk') || lowText.includes(' রাজশাহ') || lowText.includes('শাড়ি') || lowText.includes('saree')) {
                botMsgTextEN = "Sarees are hand-woven in রাজশাহ mills are verified 100% genuine silk with safety tags.";
                botMsgTextBN = "রাজশাহী সিল্ক শাড়ি সরাসরি রাজশাহীর ঐতিহ্যবাহী তাঁত মিলে মিহি সুতোয় বোনা। শাড়িগুলো রাজকীয় মোড়কে দ্রুত ঢাকা ও ঢাকার বাইরে ক্যাশঅনডেলিভারি দেওয়া হয়।";
              }

              const botMsg = { sender: 'bot', textEN: botMsgTextEN, textBN: botMsgTextBN, time: timeStr };
              setChatMessages(prev => [...prev, userMsg, botMsg]);
              if (inputEl) inputEl.value = '';
            }}
            className="p-3 border-t border-slate-100 flex gap-2 bg-slate-50"
          >
            <input 
              id="chatbot-user-input"
              type="text"
              placeholder={language === 'en' ? "Ask about orders, silk, returns..." : "ডেলিভারি, সিল্ক বা ডিসকাউন্ট নিয়ে জিজ্ঞেস করুন..."}
              className="flex-1 bg-white border border-slate-200 text-xs py-2 px-3.5 rounded-xl focus:outline-none focus:border-[#16A34A]"
            />
            <button 
              type="submit"
              className="bg-[#16A34A] text-white px-3 py-2 rounded-xl text-xs font-black hover:bg-emerald-600 transition"
            >
              ➔
            </button>
          </form>
        </div>
      )}


    </div>
  );
}
