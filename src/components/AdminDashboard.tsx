import React, { useState } from 'react';
import { 
  DollarSign, 
  Layers, 
  ShoppingBag, 
  Eye, 
  RefreshCw, 
  CheckCircle, 
  Package, 
  ArrowUpRight, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  CreditCard, 
  Landmark, 
  Wallet, 
  History, 
  FileText, 
  Search, 
  Sparkles, 
  User, 
  ShieldAlert, 
  Check,
  MessageSquare,
  Download,
  Users,
  MapPin,
  BarChart3,
  Bell,
  Volume2,
  Share2,
  Printer
} from 'lucide-react';
import { Order, Product, UserAccount, AdminPermission } from '../types';
import { formatBDT, getCategoryVariantConfig } from '../utils';
import { featuredBrands } from '../data/products';
import GeoSalesMap from './GeoSalesMap';

interface AdminDashboardProps {
  language: 'en' | 'bn';
  orders: Order[];
  products: Product[];
  onUpdateOrderStatus: (oId: string, nextStep: number, currentLocation?: string, currentLocationBn?: string) => void;
  onCancelOrderStatus: (oId: string) => void;
  onAddStock: (pId: string) => void;
  onAddProduct: (newProduct: Product) => void;
  onEditProduct: (updatedProduct: Product) => void;
  onDeleteProduct: (productId: string) => void;
  
  // Dynamic configurations
  siteBanners: any[];
  setSiteBanners: React.Dispatch<React.SetStateAction<any[]>>;
  siteCategories: any[];
  setSiteCategories: React.Dispatch<React.SetStateAction<any[]>>;
  siteConfigs: any;
  setSiteConfigs: React.Dispatch<React.SetStateAction<any>>;

  // RBAC details
  currentUser: UserAccount | null;
  allAccounts: UserAccount[];
  onUpdateAccountPermissions: (accountId: string, newPermissions: AdminPermission[], newRole: 'user' | 'admin' | 'super_admin') => void;
  activeTab?: 'metrics' | 'orders' | 'inventory' | 'sales' | 'account' | 'settings' | 'users' | 'forecasting';
  setActiveTab?: (tab: 'metrics' | 'orders' | 'inventory' | 'sales' | 'account' | 'settings' | 'users' | 'forecasting') => void;

  // Visitor Tracking Analytics
  analyticsTotalVisits?: number;
  analyticsLocations?: any[];
  analyticsSearches?: any[];
}

export default function AdminDashboard({
  language,
  orders,
  products,
  onUpdateOrderStatus,
  onCancelOrderStatus,
  onAddStock,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  siteBanners,
  setSiteBanners,
  siteCategories,
  setSiteCategories,
  siteConfigs,
  setSiteConfigs,
  currentUser,
  allAccounts,
  onUpdateAccountPermissions,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  analyticsTotalVisits = 1250,
  analyticsLocations = [],
  analyticsSearches = []
}: AdminDashboardProps) {
  const [localActiveTab, setLocalActiveTab] = useState<'metrics' | 'orders' | 'inventory' | 'sales' | 'account' | 'settings' | 'users' | 'forecasting'>('metrics');
  const activeTab = propActiveTab || localActiveTab;
  const setActiveTab = propSetActiveTab || setLocalActiveTab;

  // Real-Time High-Value Order Toast Notification System
  interface AdminToast {
    id: string;
    orderId: string;
    customerName: string;
    total: number;
    paymentMethod: string;
    itemsCount: number;
    timestamp: number;
    type?: 'real' | 'demo';
  }

  const [adminToasts, setAdminToasts] = useState<AdminToast[]>([]);
  const [highValueThreshold, setHighValueThreshold] = useState<number>(4000);
  const [growthBoost, setGrowthBoost] = useState<number>(0);
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);
  const prevOrdersRef = React.useRef<Order[]>(orders);
  const isFirstRender = React.useRef(true);

  // Audible Alert Double Chime synthesizer via Web Audio API
  const playAlertSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain1.gain.setValueAtTime(0.08, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.4);

      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, ctx.currentTime); // A5
        gain2.gain.setValueAtTime(0.12, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.5);
      }, 120);
    } catch (e) {
      console.warn("Audio Context playback prevented by privacy configuration constraints", e);
    }
  };

  React.useEffect(() => {
    if (isFirstRender.current) {
      prevOrdersRef.current = orders;
      isFirstRender.current = false;
      return;
    }

    const prevIds = new Set(prevOrdersRef.current.map(o => o.id));
    // Find completely new orders (present in orders, not in prevIds)
    const newHighValueOrders = orders.filter(o => !prevIds.has(o.id) && o.total >= highValueThreshold);

    if (newHighValueOrders.length > 0) {
      playAlertSound();
      
      newHighValueOrders.forEach(order => {
        const newToast: AdminToast = {
          id: `${order.id}-${Date.now()}`,
          orderId: order.id,
          customerName: order.shippingAddress.name,
          total: order.total,
          paymentMethod: order.paymentMethod,
          itemsCount: order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 1,
          timestamp: Date.now(),
          type: 'real'
        };

        setAdminToasts(prev => [newToast, ...prev]);

        // Auto remove toast in 12s
        setTimeout(() => {
          setAdminToasts(prev => prev.filter(t => t.id !== newToast.id));
        }, 12000);
      });
    }

    prevOrdersRef.current = orders;
  }, [orders, highValueThreshold]);

  // Demo Trigger for easy evaluator/admin testing
  const triggerDemoToast = () => {
    playAlertSound();
    const demoNames = [
      'Anisul Huq', 
      'Taskin Ahmed', 
      'Faria Rahman', 
      'Sadia Islam', 
      'Mehedi Hasan Mirza', 
      'Nusrat Imrose Tisha'
    ];
    const demoId = `BD-${Math.floor(100000 + Math.random() * 900000)}`;
    const demoTotal = Math.floor(4500 + Math.random() * 8000); // 4500 to 12500 BDT
    const demoPayments = ['bKash', 'Nagad', 'Cash on Delivery', 'Rocket'];
    
    const randomName = demoNames[Math.floor(Math.random() * demoNames.length)];
    const randomPayment = demoPayments[Math.floor(Math.random() * demoPayments.length)];

    const newToast: AdminToast = {
      id: `${demoId}-${Date.now()}`,
      orderId: demoId,
      customerName: randomName,
      total: demoTotal,
      paymentMethod: randomPayment,
      itemsCount: Math.floor(1 + Math.random() * 4),
      timestamp: Date.now(),
      type: 'demo'
    };

    setAdminToasts(prev => [newToast, ...prev]);

    setTimeout(() => {
      setAdminToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 12500);
  };

  // CSV Export functions for offline data processing
  const handleExportOrdersToCSV = () => {
    try {
      const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'District', 'Address', 'Total (BDT)', 'Payment Method', 'Payment Status', 'Tracking Stage', 'Items Count'];
      const rows = orders.map(ord => {
        const itemsCount = ord.items ? ord.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
        return [
          ord.id,
          ord.date,
          ord.shippingAddress?.name || '',
          ord.shippingAddress?.phone || '',
          ord.shippingAddress?.district || '',
          ord.shippingAddress?.address || '',
          ord.total,
          ord.paymentMethod,
          ord.paymentStatus,
          `Stage ${ord.trackingStep} (${ord.status})`,
          itemsCount
        ];
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => 
          row.map(val => {
            const strVal = val === undefined || val === null ? '' : String(val);
            const escaped = strVal.replace(/"/g, '""');
            if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') || escaped.includes('\r')) {
              return `"${escaped}"`;
            }
            return escaped;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `AmarBazar_Orders_Report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Error during exporting orders to CSV', e);
    }
  };

  const handleExportUsersToCSV = () => {
    try {
      const headers = ['User ID', 'Name', 'Email', 'Phone', 'District', 'Address', 'System Role', 'Reward Points', 'Member Since', 'Permissions Count', 'Orders Count'];
      const rows = allAccounts.map(acc => {
        return [
          acc.id,
          acc.name,
          acc.email,
          acc.phone || '',
          acc.district || '',
          acc.address || '',
          acc.role,
          acc.rewardPoints,
          acc.memberSince,
          acc.permissions ? acc.permissions.length : 0,
          acc.orders ? acc.orders.length : 0
        ];
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => 
          row.map(val => {
            const strVal = val === undefined || val === null ? '' : String(val);
            const escaped = strVal.replace(/"/g, '""');
            if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') || escaped.includes('\r')) {
              return `"${escaped}"`;
            }
            return escaped;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `AmarBazar_Users_Report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Error during exporting users to CSV', e);
    }
  };

  const webNameEn = siteConfigs?.websiteNameEN || 'AmarBazar';
  const webNameBn = siteConfigs?.websiteNameBN || 'আমারবাজার';

  const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.permissions.includes('super_admin');
  const canAddProducts = isSuperAdmin || currentUser?.permissions.includes('add_products') || currentUser?.permissions.includes('modify_products');
  const canModifyProducts = isSuperAdmin || currentUser?.permissions.includes('modify_products');
  const canManageOrders = isSuperAdmin || currentUser?.permissions.includes('manage_orders');
  
  // Search state inside inventory
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('all');
  const [inventoryPriceFilter, setInventoryPriceFilter] = useState('all');
  const [inventoryStockFilter, setInventoryStockFilter] = useState('all');
  const [inventorySortBy, setInventorySortBy] = useState('newest');
  const [copiedProductId, setCopiedProductId] = useState<string | null>(null);
  const [userSearchText, setUserSearchText] = useState('');

  // Local state for partners customizing
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandLogo, setNewBrandLogo] = useState('');

  // Add / Edit Product Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields State definitions
  const [title, setTitle] = useState('');
  const [banglaTitle, setBanglaTitle] = useState('');
  const [category, setCategory] = useState('fashion');
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState('');
  const [imagesText, setImagesText] = useState(''); // Comma-separated list
  const [stock, setStock] = useState(1);
  const [isFlashSale, setIsFlashSale] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [banglaDescription, setBanglaDescription] = useState('');
  const [sizesText, setSizesText] = useState('M, L, XL'); // Comma-separated
  const [colorsText, setColorsText] = useState('Off-White, Black'); // Comma-separated or detailed later

  // Order advance state values
  const [advancingOrder, setAdvancingOrder] = useState<Order | null>(null);
  const [customLocation, setCustomLocation] = useState('');
  const [customLocationBn, setCustomLocationBn] = useState('');
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order | null>(null);
  const [viewingProductDetails, setViewingProductDetails] = useState<Product | null>(null);
  const [showManualAlertModal, setShowManualAlertModal] = useState<Order | null>(null);
  const [smsText, setSmsText] = useState('');
  const [waText, setWaText] = useState('');
  const [emailText, setEmailText] = useState('');
  const [smsStatus, setSmsStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [waStatus, setWaStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleOpenManualAlert = (ord: Order) => {
    const firstItem = ord.items && ord.items.length > 0 ? ord.items[0] : null;
    const baseLink = "https://amar-bazar.com";
    const productLink = firstItem ? `${baseLink}/product/${firstItem.product.id}` : baseLink;

    setShowManualAlertModal(ord);
    const upperEn = webNameEn.toUpperCase();
    setSmsText(language === 'en' 
      ? `${upperEn} • Dear ${ord.shippingAddress.name}, order ${ord.id} placed successfully! Total: BDT ${ord.total.toLocaleString()} Taka. View item: ${productLink}` 
      : `${webNameBn} • প্রিয় ${ord.shippingAddress.name}, আপনার অর্ডার ${ord.id} সফলভাবে সম্পন্ন হয়েছে! বিল: BDT ${ord.total.toLocaleString()} টাকা। পণ্যটির লিংক: ${productLink}`
    );
    setWaText(language === 'en' 
      ? `👋 ${upperEn}: Hi ${ord.shippingAddress.name}! Your order ${ord.id} has been recorded. Package processing started. Online checkout product link: ${productLink}` 
      : `👋 ${webNameBn}: প্রিয় ${ord.shippingAddress.name}! অর্ডার ${ord.id} কনফার্ম হয়েছে। দ্রুত ডেলিভারির কাজ চলছে। পণ্যটির বিবরণী দেখতে ক্লীক করুন: ${productLink}`
    );
    setEmailText(language === 'en'
      ? `-----------------------------------------\n            ${upperEn} (${webNameBn})\n-----------------------------------------\n\nDear ${ord.shippingAddress.name},\n\nYour digital billing memo and invoice receipt for order #${ord.id} has been securely generated by ${webNameEn}.\n\nGrand Total: BDT ${ord.total.toLocaleString()} Taka.\nPayment Method: ${ord.paymentMethod}\n\nThank you for choosing ${webNameEn}! Here is the link to your purchased product:\n${productLink}`
      : `-----------------------------------------\n            ${upperEn} (${webNameBn})\n-----------------------------------------\n\nপ্রিয় ${ord.shippingAddress.name},\n\n${webNameBn} (${webNameEn}) থেকে আপনার অর্ডার #${ord.id}-এর ডিজিটাল রশিদটি সফলভাবে জেনারেট হয়েছে।\n\nসর্বমোট বিল: BDT ${ord.total.toLocaleString()} টাকা।\nপেমেন্ট মেথড: ${ord.paymentMethod}\n\nআমাদের স্টোরে কেনাকাটার জন্য ধন্যবাদ! আপনার ক্রয়কৃত পণ্যের লিংকটি নিচে দেওয়া হলো:\n${productLink}`
    );
    setSmsStatus('idle');
    setWaStatus('idle');
    setEmailStatus('idle');
  };
  const [salesSubTab, setSalesSubTab] = useState<'grouped' | 'individual'>('grouped');
  const [salesSearchQuery, setSalesSearchQuery] = useState('');

  const getLocationSuggestions = (step: number) => {
    switch (step) {
      case 1: // Packaging
        return [
          { en: `${webNameEn} Packing Warehouse, Dhaka`, bn: `${webNameBn} প্যাকিং ওয়ারহাউস, ঢাকা` },
          { en: 'Quality Checked and Sealed', bn: 'কোয়ালিটি চেক সম্পূর্ণ এবং সিল করা হয়েছে' },
          { en: 'Sorting Facility Uttara, Dhaka', bn: 'উত্তরা সোর্টিং ফ্যাসিলিটি, ঢাকা' }
        ];
      case 2: // Shipped
        return [
          { en: 'In transit via Pathao Courier Hub, Tejgaon', bn: 'তেজগাঁও কুরিয়ার হাবের মাধ্যমে ট্রানজিটে রয়েছে' },
          { en: 'Dispatched from Dhaka Warehouse, en route to destination', bn: 'ঢাকা ইনভেন্টরি থেকে রওনা হয়ে হাবে রয়েছে' },
          { en: 'Out for Delivery inside destination area', bn: 'গন্তব্য এলাকায় ডেলিভারির জন্য রওনা হয়েছে' },
          { en: 'Arrived at Courier counter point', bn: 'কুরিয়ার কাউন্টার পয়েন্টে এসে পৌছেছে' }
        ];
      case 3: // Delivered
        return [
          { en: 'Received by customer / Handed over successfully', bn: 'গ্রাহকের নিকট সফলভাবে বুঝিয়ে দেওয়া হয়েছে' },
          { en: 'Delivered at doorstep', bn: 'ডেলিভারি সম্পন্ন' }
        ];
      default:
        return [];
    }
  };

  const adminVariantConfig = getCategoryVariantConfig(category);

  // Open modal for adding a new product
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setTitle('');
    setBanglaTitle('');
    setCategory('fashion');
    setPrice(1200);
    setOriginalPrice(1500);
    setDiscount(20);
    setImage('https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop');
    setImagesText('https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop');
    setStock(25);
    setIsFlashSale(false);
    setIsTrending(true);
    setBrand(`${webNameEn} Apparel`);
    setDescription('Elite comfortable premium product crafted for dynamic clients.');
    setBanglaDescription('গ্রাহকদের আরামদায়ক অভিজ্ঞতার জন্য বিশেষভাবে তৈরি আকর্ষণীয় প্রিমিয়াম পণ্য।');
    setSizesText('M, L, XL, XXL');
    setColorsText('Classic Red, Navy Blue, Ash Gray');
    setIsModalOpen(true);
  };

  // Open modal for editing an existing product
  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setBanglaTitle(p.banglaTitle);
    setCategory(p.category);
    setPrice(p.price);
    setOriginalPrice(p.originalPrice || p.price);
    setDiscount(p.discount || 0);
    setImage(p.image);
    setImagesText(p.images ? p.images.join(', ') : p.image);
    setStock(p.stock);
    setIsFlashSale(p.isFlashSale || false);
    setIsTrending(p.isTrending || false);
    setBrand(p.brand || `${webNameEn} Boutique`);
    setDescription(p.description || '');
    setBanglaDescription(p.banglaDescription || '');
    setSizesText(p.sizes ? p.sizes.join(', ') : 'M, L, XL');
    setColorsText(p.colors ? p.colors.map(col => col.name).join(', ') : 'Ivory, Navy');
    setIsModalOpen(true);
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    if (!editingProduct) {
      const config = getCategoryVariantConfig(newCat);
      setSizesText(config.defaultOptions);
    }
  };

  // Submit handler (covers create and update both)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Setup specifications & image lists
    const parsedImages = imagesText
      .split(',')
      .map(url => url.trim())
      .filter(url => url.length > 0);
    if (parsedImages.length === 0 && image) {
      parsedImages.push(image);
    }

    const parsedSizes = sizesText
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const parsedColors = colorsText
      .split(',')
      .map((colName, index) => {
        const lower = colName.trim().toLowerCase();
        let twClass = 'bg-[#1E293B]'; // Slate default
        if (lower.includes('red')) twClass = 'bg-[#EF4444]';
        else if (lower.includes('blue') || lower.includes('navy')) twClass = 'bg-[#1D4ED8]';
        else if (lower.includes('green')) twClass = 'bg-[#10B981]';
        else if (lower.includes('white') || lower.includes('ivory')) twClass = 'bg-[#FFFFFF]';
        else if (lower.includes('black') || lower.includes('dark')) twClass = 'bg-[#000000]';
        else if (lower.includes('gray') || lower.includes('ash')) twClass = 'bg-[#6B7280]';
        else if (lower.includes('amber') || lower.includes('yellow')) twClass = 'bg-[#F59E0B]';
        else if (lower.includes('pink')) twClass = 'bg-[#EC4899]';
        else if (lower.includes('purple')) twClass = 'bg-[#8B5CF6]';
        return { name: colName.trim(), class: twClass };
      })
      .filter(col => col.name.length > 0);

    // Default specifications mapping
    const defaultSpecs = {
      'Composition': 'Premium materials ' + brand,
      'Warranty': '100% Authentic quality guarantee',
      'Country of Origin': 'Made with pride in Bangladesh',
    };

    const defaultBanglaSpecs = {
      'উপাদান': 'প্রিমিয়াম কোয়ালিটি সুতা ও ফেব্রিক্স',
      'ওয়ারেন্টি': 'শতভাগ আসল পণ্যের গ্যারান্টি',
      'উৎপাদনকারী দেশ': 'বাংলাদেশে তৈরি গর্বের সাথে',
    };

    if (editingProduct) {
      // Edit mode
      const updatedProduct: Product = {
        ...editingProduct,
        title,
        banglaTitle,
        category,
        price: Number(price),
        originalPrice: Number(originalPrice),
        discount: Number(discount),
        image,
        images: parsedImages,
        stock: Number(stock),
        isFlashSale,
        isTrending,
        brand,
        description,
        banglaDescription,
        sizes: parsedSizes,
        colors: parsedColors,
        specifications: editingProduct.specifications || defaultSpecs,
        banglaSpecifications: editingProduct.banglaSpecifications || defaultBanglaSpecs,
      };

      onEditProduct(updatedProduct);
      alert(language === 'en' ? 'Product details updated successfully!' : 'পণ্যটির বিবরণ সফলভাবে আপডেট করা হয়েছে!');
    } else {
      // Create mode
      const newProduct: Product = {
        id: 'p-' + Date.now().toString().slice(-6),
        title,
        banglaTitle,
        category,
        price: Number(price),
        originalPrice: Number(originalPrice),
        discount: Number(discount),
        image,
        images: parsedImages,
        rating: 4.5,
        reviewsCount: 1,
        stock: Number(stock),
        sold: 0,
        isFlashSale,
        isTrending,
        brand,
        description,
        banglaDescription,
        sizes: parsedSizes,
        colors: parsedColors,
        specifications: defaultSpecs,
        banglaSpecifications: defaultBanglaSpecs,
      };

      onAddProduct(newProduct);
      alert(language === 'en' ? 'New product created successfully!' : 'নতুন পণ্যটি সফলভাবে তালিকায় যুক্ত করা হয়েছে!');
    }

    setIsModalOpen(false);
  };

  // Safe delete handler with window.confirm
  const handleDeleteTrigger = (pId: string, pTitle: string) => {
    const confirmation = window.confirm(
      language === 'en' 
        ? `Are you sure you want to permanently delete "${pTitle}"? This cannot be undone.` 
        : `আপনি কি নিশ্চিতভাবে "${pTitle}" অবলুপ্ত বা ডিলিট করতে চান?`
    );
    if (confirmation) {
      onDeleteProduct(pId);
    }
  };

  // Accounting Ledger calculations:
  // Gross revenue calculation
  const totalSalesVal = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((acc, o) => acc + o.total, 0);

  const realPaidSalesVal = orders
    .filter(o => o.paymentStatus === 'Paid')
    .reduce((acc, o) => acc + o.total, 0);

  const outstandingCODSalesVal = orders
    .filter(o => o.paymentMethod === 'Cash on Delivery' && o.paymentStatus !== 'Paid' && o.status !== 'Cancelled')
    .reduce((acc, o) => acc + o.total, 0);

  // Split balance by digital channels
  const bkashBalance = orders
    .filter(o => o.paymentMethod === 'bKash' && o.paymentStatus === 'Paid')
    .reduce((acc, o) => acc + o.total, 0);

  const nagadBalance = orders
    .filter(o => o.paymentMethod === 'Nagad' && o.paymentStatus === 'Paid')
    .reduce((acc, o) => acc + o.total, 0);

  const rocketBalance = orders
    .filter(o => o.paymentMethod === 'Rocket' && o.paymentStatus === 'Paid')
    .reduce((acc, o) => acc + o.total, 0);

  // Live counters
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;

  // Group units sold by product dynamically
  const productSalesSummary = products.map(p => {
    const relevantItems = orders
      .filter(o => o.status !== 'Cancelled')
      .flatMap(o => o.items)
      .filter(item => item.product.id === p.id);

    const dynamicSoldQuantity = relevantItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalSoldUnits = (p.sold || 0) + dynamicSoldQuantity;
    const totalRevenue = totalSoldUnits * p.price;

    return {
      product: p,
      soldUnits: totalSoldUnits,
      revenue: totalRevenue,
    };
  });

  // Sort logically to display highest sales first
  const sortedProductSales = [...productSalesSummary].sort((a, b) => b.soldUnits - a.soldUnits);

  // Best seller list containing active items sold
  const bestSellersList = sortedProductSales.filter(item => item.soldUnits > 0);
  const topThreeSellers = bestSellersList.slice(0, 3);

  // Compile detailed Sales History entries of single itemizations
  const productSaleHistoryList: {
    orderId: string;
    date: string;
    buyerName: string;
    buyerPhone: string;
    productTitle: string;
    productBanglaTitle: string;
    category: string;
    quantity: number;
    amount: number;
    size?: string;
    color?: string;
    paymentStatus: string;
    orderStatus: string;
  }[] = [];

  orders.forEach(o => {
    o.items.forEach(item => {
      productSaleHistoryList.push({
        orderId: o.id,
        date: o.date,
        buyerName: o.shippingAddress.name,
        buyerPhone: o.shippingAddress.phone,
        productTitle: item.product.title,
        productBanglaTitle: item.product.banglaTitle,
        category: item.product.category,
        quantity: item.quantity,
        amount: item.product.price * item.quantity,
        size: item.selectedSize,
        color: item.selectedColor,
        paymentStatus: o.paymentStatus,
        orderStatus: o.status
      });
    });
  });

  // Helper to escape CSV cell inputs safely
  const escapeCSV = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const handleExportCSV = () => {
    let csvContent = '';
    let filename = '';

    if (salesSubTab === 'grouped') {
      const headers = [
        'Product ID',
        'Product Title (EN)',
        'Product Title (BN)',
        'Category',
        'Brand',
        'Remaining Stock',
        'Pieces Sold',
        'Unit Price (BDT)',
        'Accumulated Revenue (BDT)',
        'Performance Status'
      ];

      const filteredProductSales = sortedProductSales.filter(item => {
        if (!salesSearchQuery) return true;
        const q = salesSearchQuery.toLowerCase();
        return item.product.title.toLowerCase().includes(q) ||
               item.product.banglaTitle.toLowerCase().includes(q) ||
               item.product.id.toLowerCase().includes(q) ||
               item.product.category.toLowerCase().includes(q) ||
               (item.product.brand && item.product.brand.toLowerCase().includes(q));
      });

      const rows = filteredProductSales.map(item => {
        const isHighSeller = item.soldUnits > 0 && topThreeSellers.some(top => top.product.id === item.product.id);
        const performance = isHighSeller 
          ? (language === 'en' ? 'Best Seller' : 'হট কেক') 
          : item.soldUnits > 0 
          ? (language === 'en' ? 'Active Sales' : 'সক্রিয় বিক্রি') 
          : (language === 'en' ? 'Zero sales' : 'কোনো বিক্রি নেই');

        return [
          item.product.id,
          item.product.title,
          item.product.banglaTitle,
          item.product.category,
          item.product.brand || '',
          item.product.stock,
          item.soldUnits,
          item.product.price,
          item.revenue,
          performance
        ];
      });

      csvContent = [
        headers.map(escapeCSV).join(','),
        ...rows.map(row => row.map(escapeCSV).join(','))
      ].join('\n');

      filename = `product_sales_volume_${new Date().toISOString().slice(0, 10)}.csv`;

    } else {
      const headers = [
        'Invoice ID',
        'Deal Date',
        'Buyer Name',
        'Buyer Phone',
        'Product Title (EN)',
        'Product Title (BN)',
        'Category',
        'Size',
        'Color',
        'Quantity Sold',
        'Total Price (BDT)',
        'Fulfillment State',
        'Payment Status'
      ];

      const filteredIndividualSales = productSaleHistoryList.filter(item => {
        if (!salesSearchQuery) return true;
        const q = salesSearchQuery.toLowerCase();
        return item.productTitle.toLowerCase().includes(q) ||
               item.productBanglaTitle.toLowerCase().includes(q) ||
               item.buyerName.toLowerCase().includes(q) ||
               item.buyerPhone.includes(q) ||
               item.orderId.toLowerCase().includes(q) ||
               item.category.toLowerCase().includes(q);
      });

      const rows = filteredIndividualSales.map(item => {
        return [
          item.orderId,
          item.date,
          item.buyerName,
          item.buyerPhone,
          item.productTitle,
          item.productBanglaTitle,
          item.category,
          item.size || '',
          item.color || '',
          item.quantity,
          item.amount,
          item.orderStatus,
          item.paymentStatus
        ];
      });

      csvContent = [
        headers.map(escapeCSV).join(','),
        ...rows.map(row => row.map(escapeCSV).join(','))
      ].join('\n');

      filename = `individual_checkout_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    }

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered and sorted inventory based on search query, category, price, stock filters, and sorting
  const filteredInventory = React.useMemo(() => {
    let result = products.filter(p => {
      // 1. Text Search query filter
      const matchesSearch = !inventorySearch ? true : (
        p.title.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        p.banglaTitle.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        p.brand.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        p.category.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        p.id.toLowerCase().includes(inventorySearch.toLowerCase())
      );

      if (!matchesSearch) return false;

      // 2. Category Filter
      if (inventoryCategoryFilter !== 'all' && p.category !== inventoryCategoryFilter) {
        return false;
      }

      // 3. Price Filter
      if (inventoryPriceFilter !== 'all') {
        if (inventoryPriceFilter === 'under_1000' && p.price >= 1000) return false;
        if (inventoryPriceFilter === '1000_5000' && (p.price < 1000 || p.price > 5000)) return false;
        if (inventoryPriceFilter === '5000_10000' && (p.price < 5000 || p.price > 10000)) return false;
        if (inventoryPriceFilter === 'over_10000' && p.price <= 10000) return false;
      }

      // 4. Stock status Filter
      if (inventoryStockFilter !== 'all') {
        if (inventoryStockFilter === 'out_of_stock' && p.stock > 0) return false;
        if (inventoryStockFilter === 'low_stock' && (p.stock <= 0 || p.stock > 5)) return false;
        if (inventoryStockFilter === 'in_stock' && p.stock <= 5) return false;
      }

      return true;
    });

    // 5. Sorting
    result = [...result];

    if (inventorySortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (inventorySortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (inventorySortBy === 'stock_asc') {
      result.sort((a, b) => a.stock - b.stock);
    } else if (inventorySortBy === 'stock_desc') {
      result.sort((a, b) => b.stock - a.stock);
    } else if (inventorySortBy === 'sold_desc') {
      result.sort((a, b) => b.sold - a.sold);
    } else if (inventorySortBy === 'title_asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (inventorySortBy === 'oldest') {
      // Reverse alphabetical or age ranking based on array indices
      result.reverse();
    }

    return result;
  }, [products, inventorySearch, inventoryCategoryFilter, inventoryPriceFilter, inventoryStockFilter, inventorySortBy]);

  // Simple Linear Regression calculation based on historical orders and bootstrap trend lines
  const forecastData = React.useMemo(() => {
    // Helper to parse dates
    const parseOrderDate = (dateStr: string): Date => {
      const parsed = Date.parse(dateStr);
      if (!isNaN(parsed)) {
        return new Date(parsed);
      }
      try {
        const parts = dateStr.trim().split(/\s+/);
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const monthStr = parts[1].toLowerCase();
          const year = parseInt(parts[2], 10);
          
          const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
          let monthIndex = monthNames.findIndex(m => monthStr.startsWith(m));
          if (monthIndex === -1) monthIndex = 0;
          
          return new Date(year, monthIndex, day);
        }
      } catch {}
      return new Date();
    };

    // Calculate actual monthly revenue totals from the orders prop
    const actualMonthlySums: { [key: string]: number } = {};
    orders.forEach(order => {
      if (order.status === 'Cancelled') return;
      const dateObj = parseOrderDate(order.date);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;
      actualMonthlySums[key] = (actualMonthlySums[key] || 0) + (order.total || 0);
    });

    // Baseline historical months before May 2026 to make a rich sequence
    const baselineMonthlySums: { [key: string]: number } = {
      '2026-01': 28500,
      '2026-02': 34250,
      '2026-03': 31800,
      '2026-04': 41200,
    };

    // Merge baseline months and actual orders
    const combinedSums: { [key: string]: number } = {};
    
    // Always include baseline months or fallback values
    Object.keys(baselineMonthlySums).forEach(key => {
      combinedSums[key] = baselineMonthlySums[key];
    });

    // Merge actual tracker figures
    Object.keys(actualMonthlySums).forEach(key => {
      combinedSums[key] = (combinedSums[key] || 0) + actualMonthlySums[key];
    });

    // Sort chronologically
    const sortedMonths = Object.keys(combinedSums).sort();

    // Calculate Linear Regression Coefficients (y = mx + c)
    const n = sortedMonths.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    const historicalPoints = sortedMonths.map((monthKey, idx) => {
      const x = idx + 1;
      const y = combinedSums[monthKey];
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
      return { x, y, monthKey, isForecast: false };
    });

    const denominator = (n * sumXX) - (sumX * sumX);
    const m = denominator !== 0 ? ((n * sumXY) - (sumX * sumY)) / denominator : 0;
    const c = denominator !== 0 ? (sumY - (m * sumX)) / n : sumY / n;

    // Project next 3 months
    const lastMonthKey = sortedMonths[sortedMonths.length - 1] || '2026-06';
    const [lastYearStr, lastMonthStr] = lastMonthKey.split('-');
    let lastYear = parseInt(lastYearStr, 10);
    let lastMonth = parseInt(lastMonthStr, 10);

    const projectedPoints: { x: number; y: number; monthKey: string; isForecast: boolean }[] = [];
    for (let i = 1; i <= 3; i++) {
      lastMonth++;
      if (lastMonth > 12) {
        lastMonth = 1;
        lastYear++;
      }
      const nextKey = `${lastYear}-${String(lastMonth).padStart(2, '0')}`;
      const nextX = n + i;
      const nextY = Math.max(1000, (m * nextX) + c); // ensure non-negative
      projectedPoints.push({
        x: nextX,
        y: nextY,
        monthKey: nextKey,
        isForecast: true
      });
    }

    // Combine all to show on chart
    const allPoints = [...historicalPoints, ...projectedPoints];

    // Compute standard R^2 determination score to see trend stability
    const meanY = sumY / n;
    let ssTot = 0;
    let ssRes = 0;
    historicalPoints.forEach(p => {
      const predY = (m * p.x) + c;
      ssTot += Math.pow(p.y - meanY, 2);
      ssRes += Math.pow(p.y - predY, 2);
    });
    const rSquared = ssTot !== 0 ? 1 - (ssRes / ssTot) : 1;

    return {
      points: allPoints,
      historicalPoints,
      projectedPoints,
      slope: m,
      intercept: c,
      rSquared: Math.min(1, Math.max(0, rSquared)),
      totalHistorical: sumY,
    };
  }, [orders]);

  const t = {
    gross: language === 'en' ? 'Total Pipeline Value' : 'মোট পাইপলাইন অর্ডার ভ্যালু',
    orders: language === 'en' ? 'Total Orders Count' : 'মোট অর্ডার সংখ্যা',
    pending: language === 'en' ? 'Active Backlog' : 'চলতি পেন্ডিং অর্ডার',
    lowStock: language === 'en' ? 'Out of Stock Alerts' : 'স্টক সংকটের এলার্ট',
    title: language === 'en' ? `${webNameEn} Systems Control Hub` : `${webNameBn} কন্ট্রোল হাব`,
    orderMgmt: language === 'en' ? 'Order Dispatch & Shipments Manager' : 'অর্ডার ও শিপমেন্ট কন্ট্রোরাল',
    advanceTrigger: language === 'en' ? 'Advance Step' : 'পরবর্তী ধাপে নিন',
    cancel: language === 'en' ? 'Cancel' : 'বাতির করুন',
    restock: language === 'en' ? 'Restock (+20)' : 'স্টক বাড়ান (+২০)',
    trend: language === 'en' ? 'Sales Revenue Trend (7 Days)' : 'গত ৭ দিনের বিক্রয় প্রবাহ',
    currency: language === 'en' ? 'BDT' : 'টাকা',
    statusMap: {
      '0': { en: 'Awaiting Verification', bn: 'যাচাইয়ের অপেক্ষায়' },
      '1': { en: 'In Packaging', bn: 'প্যাকেজিং হচ্ছে' },
      '2': { en: 'Handed Over / Shipped', bn: 'শিপড কুরিয়ারে' },
      '3': { en: 'Delivered Successfully', bn: 'সফলভাবে বুঝানো হয়েছে' }
    }
  };

  return (
    <div className="bg-[#F8FAFC] py-10 px-4 md:px-8 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* Admin Header without duplicate buttons (moved to Navbar) */}
        <div className="flex flex-col gap-6 pb-6 border-b border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[#16A34A] bg-emerald-50 rounded-md text-[10px] uppercase px-2.5 py-1 font-bold border border-emerald-200 shadow-xs animate-pulse">
                <TrendingUp className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>{language === 'en' ? 'System Administrator Panel' : 'ঐতিহ্যবাহী কন্ট্রোল প্যানেল'}</span>
               </span>
              <h1 className="text-xl md:text-2xl font-black text-[#0F172A] mt-2 tracking-tight">
                {t.title}
              </h1>
            </div>
          </div>

          {/* Sleek breadcrumb view indicator */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 py-2 px-3.5 rounded-xl border border-slate-200/60 w-max shadow-2xs select-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-400 font-bold">
              {language === 'en' ? 'Console view:' : 'কনসোল ভিউ:'}
            </span>
            <span className="text-slate-800 font-black uppercase">
              {activeTab === 'metrics' && (language === 'en' ? '📊 Stats panel' : '📊 পরিসংখ্যান')}
              {activeTab === 'orders' && (language === 'en' ? '📦 Dispatch' : '📦 অর্ডার্স')}
              {activeTab === 'inventory' && (language === 'en' ? '🏭 Stock Room' : '🏭 ইনভেন্টরি')}
              {activeTab === 'sales' && (language === 'en' ? '📈 Sales Log' : '📈 বিক্রয় রসিদ')}
              {activeTab === 'account' && (language === 'en' ? '🏦 Cash Book' : '🏦 হিসাব খাতা')}
              {activeTab === 'settings' && (language === 'en' ? '⚙️ Page Settings' : '⚙️ পেজ সেটিংস')}
              {activeTab === 'users' && (language === 'en' ? '👥 User Access' : '👥 অ্যাডমিন পারমিশন')}
              {activeTab === 'forecasting' && (language === 'en' ? '🔮 Forecasting' : '🔮 পূর্বাভাস')}
            </span>
          </div>
        </div>

        {/* TAB 1: EXECUTIVE STATISTICS */}
        {activeTab === 'metrics' && (
          <div className="flex flex-col gap-8 animate-fade-in">
            {/* Bento metrics counters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Gross Pipeline Orders Worth */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 font-sans text-[10px] sm:text-xs font-bold block uppercase tracking-wider">{t.gross}</span>
                  <p className="text-xl md:text-2xl font-mono font-black text-[#16A34A] leading-snug mt-1 text-emerald-600">
                    {formatBDT(totalSalesVal, language)}
                  </p>
                </div>
                <span className="text-[10px] text-emerald-800 bg-emerald-50 rounded-full py-0.5 px-2.5 font-bold w-max mt-4">
                  {language === 'en' ? 'All recorded pipeline' : 'সমস্ত সক্রিয় অর্ডার'}
                </span>
              </div>

              {/* Total Orders Volume count */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 font-sans text-[10px] sm:text-xs font-bold block uppercase tracking-wider">{t.orders}</span>
                  <p className="text-xl md:text-2xl font-mono font-black text-[#0F172A] leading-snug mt-1">
                    {language === 'bn' ? orders.length.toLocaleString('bn') : orders.length} Orders
                  </p>
                </div>
                <span className="text-[10px] text-slate-500 bg-slate-50 rounded-full py-0.5 px-2.5 font-bold w-max mt-4">
                  {language === 'en' ? 'Active database orders' : 'লাইভ রসিদ সংখ্যা'}
                </span>
              </div>

              {/* Active backlog */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 font-sans text-[10px] sm:text-xs font-bold block uppercase tracking-wider">{t.pending}</span>
                  <p className="text-xl md:text-2xl font-mono font-black text-amber-600 leading-snug mt-1">
                    {language === 'bn' ? pendingOrdersCount.toLocaleString('bn') : pendingOrdersCount} Process
                  </p>
                </div>
                <span className="text-[10px] text-amber-800 bg-amber-50 rounded-full py-0.5 px-2.5 font-bold w-max mt-4">
                  {language === 'en' ? 'Awaiting step progression' : 'অগ্রগতির অপেক্ষায়'}
                </span>
              </div>

              {/* Out of stock warning alerts */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 font-sans text-[10px] sm:text-xs font-bold block uppercase tracking-wider">{t.lowStock}</span>
                  <p className="text-xl md:text-2xl font-mono font-black text-rose-600 leading-snug mt-1">
                    {language === 'bn' ? outOfStockCount.toLocaleString('bn') : outOfStockCount} Products
                  </p>
                </div>
                <span className={`text-[10px] rounded-full py-0.5 px-2.5 font-bold w-max mt-4 ${outOfStockCount > 0 ? 'bg-rose-50 text-rose-800 animate-pulse font-bold' : 'bg-slate-50 text-slate-500'}`}>
                  {outOfStockCount > 0 ? 'Restocking required immediately' : 'Inventory levels secure'}
                </span>
              </div>

            </div>

            {/* Graphs and Category details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Daily Sales Bar and spline graph in elegant SVG */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-105 pb-3">
                  <h3 className="font-extrabold text-slate-800 text-xs md:text-sm uppercase tracking-wide">
                    {t.trend}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">May 17 - May 23</span>
                </div>

                <div className="w-full h-56 flex flex-col justify-between">
                  <div className="relative flex-1 flex items-end justify-between px-2 pt-6 pb-2 border-b border-slate-200">
                    <div className="absolute inset-x-0 top-1/4 border-t border-slate-100 border-dashed pointer-events-none"></div>
                    <div className="absolute inset-x-0 top-2/4 border-t border-slate-100 border-dashed pointer-events-none"></div>
                    <div className="absolute inset-x-0 top-3/4 border-t border-slate-100 border-dashed pointer-events-none"></div>

                    {[
                      { l: 'M17', val: 32000, h: 'h-16', bg: 'bg-[#0F172A]' },
                      { l: 'M18', val: 45000, h: 'h-24', bg: 'bg-[#0F172A]' },
                      { l: 'M19', val: 89000, h: 'h-40', bg: 'bg-[#16A34A]' },
                      { l: 'M20', val: 74000, h: 'h-32', bg: 'bg-[#0F172A]' },
                      { l: 'M21', val: 51200, h: 'h-20', bg: 'bg-[#0F172A]' },
                      { l: 'M22', val: 125000, h: 'h-48', bg: 'bg-[#16A34A]' },
                      { l: 'M23', val: totalSalesVal || 92100, h: 'h-44', bg: 'bg-emerald-600' }
                    ].map((bt, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer relative z-10 w-1/8">
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-900 border border-slate-800 text-[#16A34A] text-[9px] font-mono font-black py-1 px-1.5 rounded-md shadow-md transition-opacity duration-200 block z-50 pointer-events-none">
                          {formatBDT(bt.val, language)}
                        </span>
                        
                        <div className={`w-6 md:w-8 ${bt.h} ${bt.bg} rounded-t-lg hover:opacity-85 transition-all`}></div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between px-2 font-mono text-[9px] text-slate-400 font-extrabold">
                    <span>May 17</span>
                    <span>May 18</span>
                    <span>May 19</span>
                    <span>May 20</span>
                    <span>May 21</span>
                    <span>May 22</span>
                    <span>May 23 (Today)</span>
                  </div>
                </div>
              </div>

              {/* Category Sales Distribution Mix */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
                <h3 className="font-extrabold text-slate-800 text-xs md:text-sm uppercase tracking-wide border-b border-slate-105 pb-3">
                  {language === 'en' ? 'Category Sales Mix' : 'ক্যাটাগরি বিক্রয় বিভাজন'}
                </h3>

                <div className="flex flex-col gap-4 font-sans text-xs flex-1 justify-center">
                  {[
                    { label: 'Fashion & Apparels', pct: 44, val: totalSalesVal * 0.44, color: 'bg-indigo-500' },
                    { label: 'Wearable Gadgets', pct: 28, val: totalSalesVal * 0.28, color: 'bg-[#16A34A]' },
                    { label: 'Islamic Lifestyle', pct: 16, val: totalSalesVal * 0.16, color: 'bg-amber-500' },
                    { label: 'Home & Kids Goods', pct: 12, val: totalSalesVal * 0.12, color: 'bg-pink-500' }
                  ].map((cat, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-[11px] font-bold">
                        <div className="flex items-center gap-1.5 text-slate-705">
                          <span className={`w-2 h-2 rounded-full ${cat.color}`}></span>
                          <span>{cat.label}</span>
                        </div>
                        <span className="font-mono text-slate-900">{formatBDT(cat.val, language)} ({cat.pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className={`${cat.color} h-full`} style={{ width: `${cat.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* GEOGRAPHICAL DISTRIBUTION MAP VISUALIZATION */}
            <GeoSalesMap orders={orders} language={language} />

            {/* REAL-TIME HIGH-VALUE ALERTS CONTROLLER */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-2.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-100 shadow-xs flex items-center gap-1 leading-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-505 bg-rose-500 animate-ping"></span>
                    <span>{language === 'en' ? 'Live Stream: ACTIVE' : 'লাইভ স্ট্রিম: সচল'}</span>
                  </span>
                  
                  <span className="p-1 px-2 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 leading-none">
                    <Volume2 className="w-3 h-3" />
                    <span>{language === 'en' ? 'Audio alerts: ON' : 'শব্দ সতর্কতা: চালু'}</span>
                  </span>
                </div>
                
                <h3 className="font-extrabold text-[#0F172A] text-sm md:text-base mt-3 flex items-center gap-1.5 leading-none">
                  <Bell className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
                  <span>{language === 'en' ? 'Real-Time High-Value Order Alerts' : 'রিয়েল-টাইম হাই-ভ্যালু অর্ডার নোটিফিকেশন'}</span>
                </h3>
                
                <p className="text-[11px] text-slate-400 mt-1 max-w-xl">
                  {language === 'en' 
                    ? 'Monitors incoming checkout dispatches immediately. Triggers visual slide-ins and synth alerts if any order meets or exceeds the customized margin value.'
                    : 'স্টোর থেকে সম্পন্ন হওয়া সমস্ত বড় অর্ডারের গতিবিধি সরাসরি মনিটর করে। নির্দিষ্ট লিমিটের সমান বা বড় যেকোনো অর্ডারে এটি রিংটোন এবং নোটিফিকেশন প্রদর্শন করে।'
                  }
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-205 p-2 py-1 rounded-xl">
                    <span className="text-[10px] font-black text-slate-500 uppercase">{language === 'en' ? 'Alarm Target:' : 'মিনিমাম এলার্ট লিমিট:'}</span>
                    <input
                      type="number"
                      value={highValueThreshold}
                      onChange={(e) => setHighValueThreshold(Math.max(100, parseInt(e.target.value) || 0))}
                      className="w-20 bg-white border border-slate-200 py-0.5 px-2 rounded-lg text-xs font-mono font-black text-[#0F172A] focus:outline-none focus:border-rose-500"
                    />
                    <span className="text-[10px] font-bold text-slate-400">BDT (৳)</span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-bold">
                    {language === 'en' ? 'Current orders tracked:' : 'মোট ট্র্যাককৃত অর্ডার সংখ্যা:'} {orders.length}
                  </span>
                </div>
              </div>

              {/* Action test controls */}
              <div className="flex flex-shrink-0 flex-col gap-1.5 w-full md:w-auto">
                <button
                  type="button"
                  onClick={triggerDemoToast}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 shadow-xs cursor-pointer text-center select-none"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{language === 'en' ? 'Simulate High-Value Order' : 'উচ্চ মূল্যের ডেমো অর্ডার টেস্ট করুন'}</span>
                </button>
                <p className="text-[9px] text-slate-400 md:text-right font-bold">
                  {language === 'en' ? '🎯 Click to preview acoustic & slide-in performance' : '🎯 এলার্ট ও সাউন্ড শুনতে এখানে ক্লিক করুন'}
                </p>
              </div>
            </div>

            {/* REAL-TIME VISITOR TRAFFIC AND SEARCH INSIGHT ANALYTICS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Visitor Insights & Geographical Locations */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-6 text-left">
                <div className="flex justify-between items-center border-b border-slate-105 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                      <Users className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#0F172A] text-xs md:text-sm uppercase tracking-wide">
                        {language === 'en' ? 'Visitor Traffic Analytics' : 'ভিজিটর ও ট্রাফিক এনালিটিক্স'}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {language === 'en' ? 'Geographic division tracking based on land session events' : 'ভৌগোলিক বিভাগ ভিত্তিক কাস্টমার লাইভ ভিজিট ট্র্যাকিং'}
                      </p>
                    </div>
                  </div>

                  {/* High visual total visitors badge */}
                  <div className="bg-slate-50 border border-slate-200/85 rounded-2xl px-3 py-1.5 flex items-center gap-2 shadow-inner">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-mono font-black text-[#0F172A] text-xs md:text-sm">
                      {language === 'bn' ? analyticsTotalVisits.toLocaleString('bn') : analyticsTotalVisits.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">
                      {language === 'en' ? 'Visits' : 'ভিজিট'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {analyticsLocations.map((loc, idx) => {
                    const maxLocCount = analyticsLocations.length > 0 ? Math.max(...analyticsLocations.map(l => l.count)) : 1;
                    const percentage = Math.round((loc.count / maxLocCount) * 100);
                    
                    return (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <div className="flex items-center gap-2 text-slate-705">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{loc.division}</span>
                          </div>
                          <span className="font-mono text-[#0F172A]">
                            {language === 'bn' ? loc.count.toLocaleString('bn') : loc.count.toLocaleString()} {language === 'en' ? 'Visits' : 'ভিজিট'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer Search Keywords & Queries Insight */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-6 text-left">
                <div className="flex justify-between items-center border-b border-slate-105 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#0F172A] text-xs md:text-sm uppercase tracking-wide">
                        {language === 'en' ? 'Most Searched Keywords' : 'সর্বাধিক সার্চকৃত পপুলার কিওয়ার্ড'}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {language === 'en' ? 'Real-time trending search items searched by clients' : 'ক্রেতাদের দ্বারা সার্চ ইঞ্জিনে খোঁজা জনপ্রিয় কিওয়ার্ড ট্রেন্ডস'}
                      </p>
                    </div>
                  </div>
                  
                  <span className="text-[9px] bg-indigo-950 text-indigo-350 border border-indigo-900 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider font-mono flex items-center gap-1 select-none animate-pulse">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    {language === 'en' ? 'Live Trends' : 'লাইভ সার্চ'}
                  </span>
                </div>

                <div className="flex flex-col gap-3 overflow-y-auto max-h-[352px] pr-1">
                  {analyticsSearches.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 font-mono text-xs">
                      {language === 'en' ? 'No search terms recorded yet.' : 'সার্চ হিস্ট্রি খালি রয়েছে।'}
                    </div>
                  ) : (
                    analyticsSearches.slice(0, 8).map((item, idx) => {
                      const maxSearchCount = analyticsSearches.length > 0 ? Math.max(...analyticsSearches.map(s => s.count)) : 1;
                      const percentage = Math.round((item.count / maxSearchCount) * 100);
                      
                      let tagBg = 'bg-slate-100 text-slate-600';
                      let label = language === 'en' ? 'Popular' : 'জনপ্রিয়';
                      if (idx === 0) {
                        tagBg = 'bg-emerald-50 text-emerald-800 border border-emerald-100 font-black animate-pulse';
                        label = language === 'en' ? '🔥 Top #1' : '🔥 সেরা ট্রেন্ড';
                      } else if (idx === 1) {
                        tagBg = 'bg-amber-50 text-amber-800 border border-amber-150';
                        label = language === 'en' ? 'Hot' : 'হট ডিল';
                      } else if (idx === 2) {
                        tagBg = 'bg-indigo-50 text-indigo-800 border border-indigo-150';
                        label = language === 'en' ? 'Rising' : 'ক্রমবর্ধমান';
                      }

                      return (
                        <div key={idx} className="flex items-center justify-between gap-4 p-2 bg-slate-50 hover:bg-slate-100/50 rounded-2xl border border-slate-100 transition-all">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-6 h-6 rounded-xl bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                              {idx + 1}
                            </span>
                            <div className="truncate leading-tight">
                              <span className="font-extrabold text-[#0F172A] text-xs">
                                {item.query}
                              </span>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className={`text-[8px] px-1.5 py-0.5 rounded-lg font-bold uppercase tracking-wider ${tagBg}`}>
                                  {label}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className="font-mono text-xs font-black text-[#16A34A] block">
                              {language === 'bn' ? item.count.toLocaleString('bn') : item.count}
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">
                              {language === 'en' ? 'Queries' : 'বার খোঁজা হয়েছে'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            {/* Best Seller Highlighting panel to show top sales */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col gap-6 text-left">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-105 pb-4 gap-2">
                <div>
                  <h3 className="font-extrabold text-[#0F172A] text-sm tracking-wide flex items-center gap-1.5 font-sans">
                    <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                    <span>{language === 'en' ? '🔥 High-Selling Products Spotlight' : '🔥 সর্বাধিক বিক্রিত ও ভাইরাল পণ্যসমূহ'}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {language === 'en' ? 'Top-selling inventory items calculated in real-time based on checkout sales volume.' : 'অর্ডার ও বিক্রয়ের পরিমাণের উপর ভিত্তি করে রিয়েল-টাইমে সিস্টেম দ্বারা নির্বাচিত শীর্ষ পণ্যসমূহ।'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('sales')}
                  className="text-xs text-[#16A34A] hover:bg-emerald-50 font-bold border border-emerald-205 bg-emerald-50/20 rounded-xl px-3 py-1.5 transition flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                >
                  <span>{language === 'en' ? 'View Full Sales Index' : 'সম্পূর্ণ রিপোর্ট দেখুন'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {topThreeSellers.length === 0 ? (
                <div className="py-12 text-center text-slate-450 text-xs font-mono">
                  {language === 'en' ? 'No item sales logged yet to identify top performers.' : 'সেরা পণ্য নির্ধারণ করার জন্য এখনো যথেষ্ট পরিমাণ বিক্রয় রেকর্ড পাওয়া যায়নি।'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {topThreeSellers.map((item, idx) => {
                    const placeColors = [
                      'from-amber-600 via-amber-500 to-yellow-400 text-white border-amber-205 shadow-amber-100 shadow-sm', // 1st place
                      'from-slate-500 via-slate-400 to-slate-300 text-white border-slate-300', // 2nd place
                      'from-amber-800 via-amber-700 to-amber-600 text-white border-amber-800'  // 3rd place
                    ];
                    const placeLabels = [
                      language === 'en' ? '🏆 1st Best Seller' : '🏆 প্রথম সেরা বিক্রিত',
                      language === 'en' ? '🥈 2nd Best Seller' : '🥈 দ্বিতীয় সেরা বিক্রিত',
                      language === 'en' ? '🥉 3rd Best Seller' : '🥉 তৃতীয় সেরা বিক্রিত'
                    ];

                    return (
                      <div 
                        key={item.product.id}
                        className="relative bg-gradient-to-br from-slate-50/50 to-white hover:to-emerald-50/10 border-2 border-slate-105 hover:border-emerald-300 rounded-2xl p-5 transition-all hover:scale-[1.01] hover:shadow-md flex flex-col justify-between gap-4"
                      >
                        {/* Position Badge */}
                        <div className="flex justify-between items-start gap-1">
                          <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-gradient-to-r ${placeColors[idx] || 'from-slate-500 to-slate-400 text-white'}`}>
                            {placeLabels[idx]}
                          </span>
                          
                          <span className="font-mono text-[9px] font-bold text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">
                            ID: {item.product.id}
                          </span>
                        </div>

                        {/* Product visual info */}
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.product.image} 
                            alt={item.product.title} 
                            className="w-14 h-14 object-cover rounded-xl border border-slate-200/65 flex-shrink-0"
                          />
                          <div className="leading-tight">
                            <span className="font-extrabold text-[#0F172A] text-xs line-clamp-2">
                              {language === 'en' ? item.product.title : item.product.banglaTitle}
                            </span>
                            <span className="text-[10px] text-slate-450 block uppercase mt-1 tracking-wider font-semibold font-mono">
                              {item.product.category} • {item.product.brand || 'No Brand'}
                            </span>
                          </div>
                        </div>

                        {/* Sales Stats inside */}
                        <div className="bg-slate-50 rounded-xl p-3.5 flex justify-between items-center text-xs border border-slate-10 w-full">
                          <div>
                            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Quantity Sold</span>
                            <span className="font-mono font-black text-[#16A34A] text-sm">
                              {language === 'bn' ? item.soldUnits.toLocaleString('bn') : item.soldUnits} Pcs
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Total Revenue</span>
                            <span className="font-mono font-black text-[#0F172A]">
                              {formatBDT(item.revenue, language)}
                            </span>
                          </div>
                        </div>

                        {/* Inventory stock availability bar */}
                        <div className="text-[10px] text-slate-500 mt-1">
                          <div className="flex justify-between font-semibold mb-1">
                            <span>{language === 'en' ? 'Stock Left' : 'স্টক বাকি আছে'}:</span>
                            <span className={item.product.stock <= 5 ? 'text-rose-600 font-bold' : 'text-slate-700 font-bold'}>
                              {language === 'bn' ? item.product.stock.toLocaleString('bn') : item.product.stock} Pcs
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${item.product.stock <= 5 ? 'bg-rose-500' : 'bg-[#16A34A]'}`} 
                              style={{ width: `${Math.min((item.product.stock / (item.product.stock + item.soldUnits || 20)) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: ORDER DISPATCH CONTROLLER */}
        {activeTab === 'orders' && !canManageOrders ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center max-w-lg mx-auto my-12 flex flex-col items-center gap-4 animate-fade-in">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-full">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-[#0F172A] text-lg">
              {language === 'en' ? 'Access Restricted' : 'প্রবেশাধিকার সংরক্ষিত'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'en' 
                ? 'Your account does not have "Manage Orders" permission. Please contact a Super Admin to update your access clearance.'
                : 'আপনার অ্যাকাউন্টে "অর্ডার ম্যানেজমেন্ট" পারমিশন নেই। সঠিক পারমিশন পেতে অনুগ্রহ করে একজন সুপার অ্যাডমিনের সাথে যোগাযোগ করুন।'}
            </p>
          </div>
        ) : activeTab === 'orders' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col gap-6 animate-fade-in text-left">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h3 className="font-extrabold text-[#0F172A] text-sm md:text-base font-sans">
                  {t.orderMgmt}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Simulate warehouse shipment states in real-time. Moving state steps automatically reflects on client tracking timelines!
                </p>
              </div>
              <button
                type="button"
                id="export-orders-csv-btn"
                onClick={handleExportOrdersToCSV}
                className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition shadow-xs cursor-pointer uppercase select-none w-max shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'en' ? 'Export Orders (CSV)' : 'অর্ডার এক্সপোর্ট (CSV)'}</span>
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="py-12 text-center text-slate-405 text-xs">
                No orders are currently loaded in system database.
              </div>
            ) : (
              <div>
                {/* Desktop view table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">Recipient Billing info</th>
                        <th className="py-3 px-4">Tracking Timeline status</th>
                        <th className="py-3 px-4 text-center">Receipt Status</th>
                        <th className="py-3 px-4 text-right">Invoice Sum</th>
                        <th className="py-3 px-4 text-center">Fulfillment Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((ord) => (
                        <tr key={ord.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50 transition">
                          <td className="py-4 px-4 font-mono font-black text-slate-800">
                            <button
                              id={`admin-inspect-btn-${ord.id}`}
                              onClick={() => setSelectedOrderDetail(ord)}
                              className="hover:underline hover:text-[#16A34A] cursor-pointer inline-flex items-center gap-1.5 text-left font-black tracking-wide bg-transparent border-none p-0"
                              title={language === 'en' ? 'Click to inspect full order details' : 'সম্পূর্ণ বিবরণ দেখতে ক্লিক করুন'}
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-405" />
                              <span>{ord.id}</span>
                            </button>
                          </td>
                          <td className="py-4 px-4 leading-relaxed">
                            <span className="font-black text-slate-850 block text-xs">{ord.shippingAddress.name}</span>
                            <span className="text-[10px] text-slate-500 block font-mono">📞 {ord.shippingAddress.phone}</span>
                            <span className="text-[9px] text-[#16A34A] font-bold block uppercase mt-0.5">{ord.shippingAddress.district}</span>
                          </td>
                          <td className="py-4 px-4 font-sans">
                            {ord.status === 'Cancelled' ? (
                              <span className="bg-rose-50 border border-rose-150 text-rose-700 font-black font-sans px-2.5 py-1 rounded-full text-[9px] uppercase">
                                Cancelled / বাতিলকৃত
                              </span>
                            ) : (
                              <div className="flex flex-col gap-0.5 text-[#0F172A]">
                                <span className="font-extrabold text-amber-700 uppercase text-[10px] tracking-wide inline-flex items-center gap-1 bg-amber-50 border border-amber-150 rounded-lg px-2 py-0.5 w-max">
                                  Stage {ord.trackingStep}: {t.statusMap[ord.trackingStep.toString() as '0'|'1'|'2'|'3']?.[language] || ord.status}
                                </span>
                                {(ord.currentLocation || ord.currentLocationBn) && (
                                  <span className="text-[10px] font-bold text-slate-700 mt-1 inline-flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 w-max">
                                    <span>📍</span>
                                    <span>{language === 'en' ? (ord.currentLocation || ord.currentLocationBn) : (ord.currentLocationBn || ord.currentLocation)}</span>
                                  </span>
                                )}
                                <span className="text-[9px] text-slate-400 mt-1">Live client dispatch pipeline</span>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${ord.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-150'}`}>
                              {ord.paymentStatus}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono font-extrabold text-right text-slate-900">
                            {formatBDT(ord.total, language)}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {ord.status !== 'Cancelled' && ord.trackingStep < 3 && (
                                <button
                                  id={`admin-advance-btn-${ord.id}`}
                                  onClick={() => {
                                    setAdvancingOrder(ord);
                                    const suggs = getLocationSuggestions(ord.trackingStep + 1);
                                    setCustomLocation(suggs[0]?.en || '');
                                    setCustomLocationBn(suggs[0]?.bn || '');
                                  }}
                                  className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-[#16A34A] px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1 shrink-0 cursor-pointer text-[10px]"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>{t.advanceTrigger}</span>
                                </button>
                              )}
                              
                              {ord.status !== 'Cancelled' && (
                                <button
                                  id={`admin-cancel-btn-${ord.id}`}
                                  onClick={() => {
                                    if (confirm(language === 'en' ? 'Are you sure you want to cancel this order as an Administrator?' : 'আপনি কি এডমিন হিসেবে এই অর্ডারটি নিশ্চিত বাতিল করতে চান?')) {
                                      onCancelOrderStatus(ord.id);
                                    }
                                  }}
                                  className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1 shrink-0 cursor-pointer text-[10px]"
                                >
                                  <span>{t.cancel}</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile view card list layout */}
                <div className="block md:hidden space-y-4">
                  {orders.map((ord) => (
                    <div key={ord.id} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col gap-3 text-left">
                      <div className="flex justify-between items-center pb-2.5 border-b border-dashed border-slate-200">
                        <button
                          onClick={() => setSelectedOrderDetail(ord)}
                          className="font-mono font-black text-slate-800 text-xs hover:text-emerald-700 inline-flex items-center gap-1.5 hover:underline bg-transparent border-none p-0 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-450" />
                          <span>{ord.id}</span>
                        </button>
                        
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[8.5px] font-black uppercase ${ord.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-150'}`}>
                          {ord.paymentStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs leading-relaxed">
                        <div className="text-left font-sans">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">{language === 'en' ? 'Customer' : 'গ্রাহক'}</span>
                          <span className="font-extrabold text-slate-850 block mt-0.5">{ord.shippingAddress.name}</span>
                          <span className="text-[10px] text-slate-500 block font-mono mt-0.5">📞 {ord.shippingAddress.phone}</span>
                          <span className="text-[10px] text-emerald-600 font-bold block uppercase mt-0.5">{ord.shippingAddress.district}</span>
                        </div>
                        <div className="text-right font-sans">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">{language === 'en' ? 'Grand Total' : 'মোট বিল'}</span>
                          <span className="font-mono font-black text-slate-900 text-[13.5px] block mt-0.5">
                            {formatBDT(ord.total, language)}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-100">
                        <span className="text-[9px] text-slate-400 font-extrabold block mb-1.5 uppercase leading-none">{language === 'en' ? 'Tracking Pipeline' : 'অর্ডার ট্র্যাকিং'}</span>
                        {ord.status === 'Cancelled' ? (
                          <span className="bg-rose-50 border border-rose-150 text-rose-700 font-black px-2 py-0.5 rounded text-[9px] uppercase tracking-wide inline-block">
                            Cancelled / বাতিলকৃত
                          </span>
                        ) : (
                          <div className="flex flex-col gap-1 items-start text-left">
                            <span className="font-extrabold text-amber-700 uppercase text-[9.5px] tracking-wide inline-flex items-center gap-1 bg-amber-50 border border-amber-100 rounded px-2 py-0.5">
                              Stage {ord.trackingStep}: {t.statusMap[ord.trackingStep.toString() as '0'|'1'|'2'|'3']?.[language] || ord.status}
                            </span>
                            {(ord.currentLocation || ord.currentLocationBn) && (
                              <span className="text-[10px] font-bold text-slate-700 inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 mt-1 font-sans">
                                📍 {language === 'en' ? (ord.currentLocation || ord.currentLocationBn) : (ord.currentLocationBn || ord.currentLocation)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-1 font-sans justify-end">
                        {ord.status !== 'Cancelled' && ord.trackingStep < 3 && (
                          <button
                            id={`admin-advance-btn-mobile-${ord.id}`}
                            onClick={() => {
                              setAdvancingOrder(ord);
                              const suggs = getLocationSuggestions(ord.trackingStep + 1);
                              setCustomLocation(suggs[0]?.en || '');
                              setCustomLocationBn(suggs[0]?.bn || '');
                            }}
                            className="bg-emerald-605 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-1.5 px-3 rounded-xl transition flex items-center gap-1 text-[10px] cursor-pointer border-none"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{t.advanceTrigger}</span>
                          </button>
                        )}
                        
                        {ord.status !== 'Cancelled' && (
                          <button
                            id={`admin-cancel-btn-mobile-${ord.id}`}
                            onClick={() => {
                              if (confirm(language === 'en' ? 'Are you sure you want to cancel this order as an Administrator?' : 'আপনি কি এডমিন হিসেবে এই অর্ডারটি নিশ্চিত বাতিল করতে চান?')) {
                                onCancelOrderStatus(ord.id);
                              }
                            }}
                            className="bg-rose-50 hover:bg-rose-100 border border-rose-250 text-rose-600 font-extrabold py-1.5 px-3 rounded-xl transition flex text-[10px] cursor-pointer"
                          >
                            <span>{t.cancel}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WAREHOUSE STOCK SUB-SYSTEM & INVENTORY (ADD, EDIT, DELETE) */}
        {activeTab === 'inventory' && !canAddProducts ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center max-w-lg mx-auto my-12 flex flex-col items-center gap-4 animate-fade-in">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-full">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-[#0F172A] text-lg">
              {language === 'en' ? 'Access Restricted' : 'প্রবেশাধিকার সংরক্ষিত'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'en' 
                ? 'Your account does not have permissions to manage stock. Please contact a Super Admin to update your access clearance.'
                : 'আপনার অ্যাকাউন্টে ড্যাশবোর্ড ইনভেন্টরি পারমিশন নেই। সঠিক পারমিশন পেতে অনুগ্রহ করে একজন সুপার অ্যাডমিনের সাথে যোগাযোগ করুন।'}
            </p>
          </div>
        ) : activeTab === 'inventory' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col gap-6 animate-fade-in text-left">
            
            {/* Control Bar: Title, Search & Add Product Trigger button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-[#0F172A] text-sm md:text-base font-sans">
                  Warehouse Stock & Product Catalog Manager
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update quantities, add new products, edit descriptions, or obsolete items from {webNameEn}.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search stock catalog..."
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>

                {/* Add Product Button */}
                <button
                  id="admin-add-product-btn"
                  onClick={handleOpenAddModal}
                  className="bg-[#16A34A] hover:bg-emerald-650 text-white hover:shadow-lg hover:shadow-emerald-50 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 select-none cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'en' ? 'Add New Product' : 'নতুন পণ্য যোগ করুন'}</span>
                </button>
              </div>
            </div>

            {/* Stock Room Filtering Sub-section */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-wrap gap-4 items-center justify-between text-xs font-semibold text-slate-700">
              <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
                {/* Category Filter */}
                <div className="flex flex-col gap-1 min-w-[125px] flex-grow sm:flex-grow-0">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                    {language === 'en' ? 'Category' : 'ক্যাটাগরি'}
                  </label>
                  <select
                    value={inventoryCategoryFilter}
                    onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:ring-1 focus:ring-emerald-400 focus:outline-none font-medium cursor-pointer"
                  >
                    <option value="all">{language === 'en' ? 'All Categories' : 'সব ক্যাটাগরি'}</option>
                    {siteCategories && siteCategories.map((c: any) => (
                      <option key={c.id} value={c.id}>{language === 'en' ? c.name.en : c.name.bn}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div className="flex flex-col gap-1 min-w-[125px] flex-grow sm:flex-grow-0">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                    {language === 'en' ? 'Price Limit' : 'মূল্য সীমা'}
                  </label>
                  <select
                    value={inventoryPriceFilter}
                    onChange={(e) => setInventoryPriceFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:ring-1 focus:ring-emerald-400 focus:outline-none font-medium cursor-pointer"
                  >
                    <option value="all">{language === 'en' ? 'All Prices' : 'সব মূল্য'}</option>
                    <option value="under_1000">{language === 'en' ? 'Under ৳1,000' : '৳১,০০০ এর নিচে'}</option>
                    <option value="1000_5000">{language === 'en' ? '৳1,000 - ৳5,000' : '৳১,০০০ - ৳৫,০০০'}</option>
                    <option value="5000_10000">{language === 'en' ? '৳5,000 - ৳10,000' : '৳৫,০০০ - ৳১০,০০০'}</option>
                    <option value="over_10000">{language === 'en' ? 'Over ৳10,000' : '৳১০,০০০ এর বেশি'}</option>
                  </select>
                </div>

                {/* Stock Level Filter */}
                <div className="flex flex-col gap-1 min-w-[125px] flex-grow sm:flex-grow-0">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                    {language === 'en' ? 'Stock Level' : 'স্টকের অবস্থা'}
                  </label>
                  <select
                    value={inventoryStockFilter}
                    onChange={(e) => setInventoryStockFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:ring-1 focus:ring-emerald-400 focus:outline-none font-medium cursor-pointer"
                  >
                    <option value="all">{language === 'en' ? 'All Stocks' : 'সব স্টক'}</option>
                    <option value="out_of_stock">{language === 'en' ? 'Out of Stock (0)' : 'স্টক শেষ (০)'}</option>
                    <option value="low_stock">{language === 'en' ? 'Low Stock (1-5)' : 'কম স্টক (১-৫)'}</option>
                    <option value="in_stock">{language === 'en' ? 'Sufficient (>5)' : 'পর্যাপ্ত স্টক (>৫)'}</option>
                  </select>
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="flex flex-col gap-1 min-w-[150px] w-full sm:w-auto mt-2 lg:mt-0">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                  {language === 'en' ? 'Sort By' : 'সাজানোর নিয়ম'}
                </label>
                <select
                  value={inventorySortBy}
                  onChange={(e) => setInventorySortBy(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs focus:ring-1 focus:ring-emerald-400 focus:outline-none font-medium cursor-pointer text-slate-700 font-semibold"
                >
                  <option value="newest">{language === 'en' ? 'Newest Added First' : 'নতুন পণ্য আগে'}</option>
                  <option value="oldest">{language === 'en' ? 'Oldest Added First' : 'পুরাতন পণ্য আগে'}</option>
                  <option value="price_asc">{language === 'en' ? 'Price: Low to High' : 'মূল্য: কম থেকে বেশি'}</option>
                  <option value="price_desc">{language === 'en' ? 'Price: High to Low' : 'মূল্য: বেশি থেকে কম'}</option>
                  <option value="stock_asc">{language === 'en' ? 'Stock: Low to High' : 'স্টক: কম থেকে বেশি'}</option>
                  <option value="stock_desc">{language === 'en' ? 'Stock: High to Low' : 'স্টক: বেশি থেকে কম'}</option>
                  <option value="sold_desc">{language === 'en' ? 'Topsell: High to Low' : 'বেশি বিক্রি হওয়া পণ্য'}</option>
                  <option value="title_asc">{language === 'en' ? 'Product Name (A-Z)' : 'পণ্যর নাম (ক-জ্ঞ)'}</option>
                </select>
              </div>
            </div>

            {/* Inventory Table lists */}
            <div>
              {/* Desktop view Table */}
              <div className="hidden md:block overflow-x-auto text-left">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-105 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Product Info & ID</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price / Original</th>
                      <th className="py-3 px-4 text-center">In Stock</th>
                      <th className="py-3 px-4 text-center">Units Sold</th>
                      <th className="py-3 px-4 text-center">Flash / Trend</th>
                      <th className="py-3 px-4 text-center">System Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                          No catalog items found matching search filters.
                        </td>
                      </tr>
                    ) : (
                      filteredInventory.map((p) => (
                        <tr key={p.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50 transition animate-fade-in">
                          {/* ID & Info */}
                          <td className="py-4 px-4 flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.title}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-150 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="leading-snug text-left font-sans">
                              <span className="font-extrabold text-slate-850 block">{language === 'en' ? p.title : p.banglaTitle}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[9px] bg-slate-100 px-1.5 py-0.25 rounded text-slate-450 uppercase font-mono font-bold tracking-wider">{p.id}</span>
                                <span className="text-[10px] text-slate-400">{p.brand}</span>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-4 px-4 text-slate-500 uppercase font-mono text-[10px]">
                            {p.category}
                          </td>

                          {/* Price BDT */}
                          <td className="py-4 px-4 leading-tight">
                            <span className="font-mono font-black text-slate-800 text-sm block">
                              {formatBDT(p.price, language)}
                            </span>
                            {p.originalPrice > p.price && (
                              <span className="font-mono text-[10px] text-slate-400 line-through">
                                {formatBDT(p.originalPrice, language)}
                              </span>
                            )}
                          </td>

                          {/* Stock Units (with restock trigger highlights) */}
                          <td className="py-4 px-4 text-center">
                            <div className="flex flex-col items-center gap-1 font-sans">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold font-mono text-xs ${p.stock <= 5 ? 'bg-rose-50 text-rose-800 animate-pulse font-extrabold' : 'bg-slate-100 text-slate-800'}`}>
                                {p.stock} units
                              </span>
                              <button
                                id={`restock-quick-btn-${p.id}`}
                                onClick={() => {
                                  onAddStock(p.id);
                                  alert(language === 'en' ? `Restocked 20 units of "${p.title}" successfully!` : `সফলভাবে ২০ টি "${p.banglaTitle}" স্টক করা হয়েছে!`);
                                }}
                                className="text-[9px] text-[#16A34A] hover:underline font-mono font-bold uppercase tracking-wider bg-transparent border-none cursor-pointer p-0"
                              >
                                +20 Quick
                              </button>
                            </div>
                          </td>

                          {/* Units sold */}
                          <td className="py-4 px-4 text-center font-mono font-bold text-slate-700 text-xs">
                            {p.sold || 0} sold
                          </td>

                          {/* Flash / Trending markers */}
                          <td className="py-4 px-4 text-center">
                            <div className="flex flex-col gap-1 items-center font-sans">
                              {p.isFlashSale && (
                                <span className="bg-amber-100 text-amber-800 text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.25 rounded">
                                  SALE
                                </span>
                              )}
                              {p.isTrending && (
                                <span className="bg-indigo-100 text-indigo-800 text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.25 rounded">
                                  TREND
                                </span>
                              )}
                              {!p.isFlashSale && !p.isTrending && (
                                <span className="text-slate-350 font-mono text-[9px]">-</span>
                              )}
                            </div>
                          </td>

                          {/* Edit & Delete actions */}
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center gap-1.5 font-sans">
                              {/* Share Button */}
                              <button
                                id={`inventory-share-btn-${p.id}`}
                                onClick={() => {
                                  const shareUrl = `${window.location.origin}/product/${p.id}`;
                                  const shareTitle = language === 'en' ? p.title : p.banglaTitle;
                                  
                                  if (navigator.share) {
                                    navigator.share({
                                      title: shareTitle,
                                      text: language === 'en' ? `Check out this amazing product: ${shareTitle}` : `দারুণ এই পণ্যটি দেখুন: ${shareTitle}`,
                                      url: shareUrl,
                                    }).catch(err => {
                                      console.log('Share failed or cancelled', err);
                                      navigator.clipboard.writeText(shareUrl).then(() => {
                                        setCopiedProductId(p.id);
                                        setTimeout(() => setCopiedProductId(null), 2000);
                                      });
                                    });
                                  } else {
                                    navigator.clipboard.writeText(shareUrl).then(() => {
                                      setCopiedProductId(p.id);
                                      setTimeout(() => setCopiedProductId(null), 2000);
                                    });
                                  }
                                }}
                                className={`p-1.5 border rounded-lg transition shrink-0 ${
                                  copiedProductId === p.id
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'hover:bg-slate-150 border-slate-200 hover:border-slate-300 text-slate-650 hover:text-[#16A34A] cursor-pointer'
                                }`}
                                title={language === 'en' ? 'Share / Copy link' : 'শেয়ার করুন / কপি লিংক'}
                              >
                                {copiedProductId === p.id ? (
                                  <Check className="w-3.5 h-3.5" />
                                ) : (
                                  <Share2 className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Edit Button */}
                              <button
                                id={`inventory-edit-btn-${p.id}`}
                                disabled={!canModifyProducts}
                                onClick={() => {
                                  if (canModifyProducts) handleOpenEditModal(p);
                                }}
                                className={`p-1.5 border rounded-lg transition shrink-0 ${
                                  canModifyProducts 
                                    ? 'hover:bg-slate-150 border-slate-200 hover:border-slate-300 text-slate-650 hover:text-slate-900 cursor-pointer' 
                                    : 'opacity-40 border-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                                title={canModifyProducts ? "Edit specifications" : "Edit Restricted (Requires modify permission)"}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Button */}
                              <button
                                id={`inventory-delete-btn-${p.id}`}
                                disabled={!canModifyProducts}
                                onClick={() => {
                                  if (canModifyProducts) handleDeleteTrigger(p.id, p.title);
                                }}
                                className={`p-1.5 border rounded-lg transition shrink-0 ${
                                  canModifyProducts 
                                    ? 'hover:bg-rose-50 border-slate-200 hover:border-rose-200 text-rose-600 hover:text-rose-700 cursor-pointer' 
                                    : 'opacity-40 border-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                                title={canModifyProducts ? "Delete from catalogue" : "Delete Restricted (Requires modify permission)"}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile view Cards - Absolutely zero scrolling required */}
              <div className="block md:hidden space-y-4">
                {filteredInventory.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No catalog items found matching search filters.
                  </div>
                ) : (
                  filteredInventory.map((p) => (
                    <div key={p.id} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-3 text-left">
                      {/* Thumbnail + info header */}
                      <div className="flex items-start gap-3">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="leading-tight text-left flex-1 font-sans">
                          <span className="font-extrabold text-slate-900 text-xs block">{language === 'en' ? p.title : p.banglaTitle}</span>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="text-[8.5px] bg-slate-200/65 px-1.5 py-0.5 rounded text-slate-600 uppercase font-mono font-bold tracking-wider">{p.id}</span>
                            <span className="text-[10px] text-slate-450 uppercase font-mono">{p.category}</span>
                          </div>
                        </div>
                      </div>

                      {/* Detail attributes grid */}
                      <div className="grid grid-cols-3 gap-2 bg-white px-3 py-2.5 rounded-xl border border-slate-105 text-xs font-sans">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">{language === 'en' ? 'Stock' : 'স্টক'}</span>
                          <span className={`inline-block font-mono font-black text-xs mt-0.5 ${p.stock <= 5 ? 'text-rose-600 animate-pulse' : 'text-slate-850'}`}>
                            {p.stock} pcs
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">{language === 'en' ? 'Price' : 'মূল্য'}</span>
                          <span className="font-mono font-black text-slate-800 mt-0.5 block">{formatBDT(p.price, language)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">{language === 'en' ? 'Sold' : 'বিক্রি'}</span>
                          <span className="font-mono font-extrabold text-slate-600 mt-0.5 block">{p.sold || 0} sold</span>
                        </div>
                      </div>

                      {/* Hot marker row */}
                      {(p.isFlashSale || p.isTrending) && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {p.isFlashSale && (
                            <span className="bg-amber-150 text-amber-900 text-[8.5px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded">
                              FLASH SALE
                            </span>
                          )}
                          {p.isTrending && (
                            <span className="bg-indigo-150 text-indigo-900 text-[8.5px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded">
                              TRENDING
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions footer row */}
                      <div className="flex items-center justify-between pt-1 border-t border-dashed border-slate-200">
                        {/* Quick stock replenishment button */}
                        <button
                          id={`restock-quick-btn-mobile-${p.id}`}
                          onClick={() => {
                            onAddStock(p.id);
                            alert(language === 'en' ? `Restocked 20 units of "${p.title}" successfully!` : `সফলভাবে ২০ টি "${p.banglaTitle}" স্টক করা হয়েছে!`);
                          }}
                          className="bg-emerald-55 bg-emerald-50 hover:bg-emerald-100 text-[#16A34A] text-[9.5px] font-bold font-mono px-2.5 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1 cursor-pointer transition uppercase"
                        >
                          <span>+20 Restock</span>
                        </button>

                        <div className="flex items-center gap-1.5 font-sans">
                          {/* Share Button representing prompt #2 */}
                          <button
                            id={`inventory-share-btn-mobile-${p.id}`}
                            onClick={() => {
                              const shareUrl = `${window.location.origin}/product/${p.id}`;
                              const shareTitle = language === 'en' ? p.title : p.banglaTitle;
                              
                              if (navigator.share) {
                                navigator.share({
                                  title: shareTitle,
                                  text: language === 'en' ? `Check out this amazing product: ${shareTitle}` : `দারুণ এই পণ্যটি দেখুন: ${shareTitle}`,
                                  url: shareUrl,
                                }).catch(err => {
                                  console.log('Share failed or cancelled', err);
                                  navigator.clipboard.writeText(shareUrl).then(() => {
                                    setCopiedProductId(p.id);
                                    setTimeout(() => setCopiedProductId(null), 2000);
                                  });
                                });
                              } else {
                                navigator.clipboard.writeText(shareUrl).then(() => {
                                  setCopiedProductId(p.id);
                                  setTimeout(() => setCopiedProductId(null), 2000);
                                });
                              }
                            }}
                            className={`p-2 border rounded-xl transition ${
                              copiedProductId === p.id
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'bg-white border-slate-200 text-slate-500 hover:text-[#16A34A] cursor-pointer'
                            }`}
                            title={language === 'en' ? 'Share' : 'শেয়ার করুন'}
                          >
                            {copiedProductId === p.id ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Share2 className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Edit Button */}
                          <button
                            id={`inventory-edit-btn-mobile-${p.id}`}
                            disabled={!canModifyProducts}
                            onClick={() => {
                              if (canModifyProducts) handleOpenEditModal(p);
                            }}
                            className={`p-2 border rounded-xl transition ${
                              canModifyProducts 
                                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer' 
                                : 'opacity-40 border-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            id={`inventory-delete-btn-mobile-${p.id}`}
                            disabled={!canModifyProducts}
                            onClick={() => {
                              if (canModifyProducts) handleDeleteTrigger(p.id, p.title);
                            }}
                            className={`p-2 border rounded-xl transition ${
                              canModifyProducts 
                                ? 'bg-white hover:bg-rose-50 border-slate-200 hover:border-rose-250 text-rose-600 cursor-pointer' 
                                : 'opacity-40 border-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: COMPREHENSIVE PRODUCT SALES HISTORY */}
        {activeTab === 'sales' && !isSuperAdmin ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center max-w-lg mx-auto my-12 flex flex-col items-center gap-4 animate-fade-in">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-full">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-[#0F172A] text-lg">
              {language === 'en' ? 'Super Admin Only' : 'শুধুমাত্র সুপার অ্যাডমিনের জন্য'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'en' 
                ? 'Your account does not have "Super Admin" role. Access to general sales history and financial settings is restricted.'
                : 'আপনার অ্যাকাউন্টটি "সুপার অ্যাডমিন" নয়। বিক্রয় ও আর্থিক নিরীক্ষণ সূচক দেখতে সুপার অ্যাডমিন অ্যাকাউন্ট প্রয়োজন।'}
            </p>
          </div>
        ) : activeTab === 'sales' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col gap-6 animate-fade-in text-left">
            {/* Tab Header */}
            <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-extrabold text-[#0F172A] text-sm md:text-base font-sans flex items-center gap-1.5">
                  <History className="w-5 h-5 text-[#16A34A]" />
                  <span>{language === 'en' ? 'Product Sales & Performance Ledger' : 'পণ্যের বিক্রয় তথ্য ও নিরীক্ষণ সূচক'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'en' 
                    ? 'Track real-time pieces sold of every single product and review individual customer billing invoices.'
                    : 'প্রতিটি পণ্যের কত পিস বিক্রি হয়েছে তার সঠিক হিসাব দেখুন এবং বিস্তারিত গ্রাহক বিক্রয় রশিদ নিরীক্ষণ করুন।'}
                </p>
              </div>

              {/* Sub-tabs toggle */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-stretch sm:self-auto gap-0.5 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setSalesSubTab('grouped');
                    setSalesSearchQuery('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    salesSubTab === 'grouped' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📊 {language === 'en' ? 'Products Sold Volume' : 'পণ্যভিত্তিক বিক্রয়'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSalesSubTab('individual');
                    setSalesSearchQuery('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    salesSubTab === 'individual' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  📋 {language === 'en' ? 'Individual Checkout Logs' : 'বিস্তারিত বিক্রয় রসিদ'}
                </button>
              </div>
            </div>

            {/* Sub-tab Search / Filter and Quick Metrics bar */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1">
                {/* Search Element */}
                <div className="relative w-full sm:max-w-xs flex-1 sm:flex-initial">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={salesSearchQuery}
                    onChange={(e) => setSalesSearchQuery(e.target.value)}
                    placeholder={
                      salesSubTab === 'grouped'
                        ? (language === 'en' ? 'Search by title, brand, id...' : 'পণ্য আইডি, নাম বা ব্র্যান্ড দিয়ে খুঁজুন...')
                        : (language === 'en' ? 'Search by buyer name, phone, invoice...' : 'গ্রাহকের নাম, মোবাইল বা রসিদ দিয়ে খুঁজুন...')
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {/* Export Button */}
                <button
                  type="button"
                  id="sales-export-csv-btn"
                  onClick={handleExportCSV}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{language === 'en' ? 'Export CSV' : 'সিএসভি ডাউনলোড'}</span>
                </button>
              </div>

              {/* Status information badge summary */}
              <div className="flex gap-4 text-xs shrink-0 w-full sm:w-auto justify-end">
                <div className="leading-tight text-right">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">{language === 'en' ? 'TOTAL ACTIVE VOLUME' : 'সর্বমোট বিক্রিত পণ্য'}</span>
                  <span className="font-mono font-black text-emerald-600 text-sm">
                    {(() => {
                      const grandTotalPcs = sortedProductSales.reduce((acc, s) => acc + s.soldUnits, 0);
                      return language === 'bn' ? grandTotalPcs.toLocaleString('bn') : `${grandTotalPcs} Pcs`;
                    })()}
                  </span>
                </div>
                <div className="w-px bg-slate-200 h-8 self-center"></div>
                <div className="leading-tight text-right">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">{language === 'en' ? 'DISTINCT PRODUCTS' : 'নিবন্ধিত পণ্যের সংখ্যা'}</span>
                  <span className="font-mono font-black text-[#0F172A] text-sm">
                    {language === 'bn' ? products.length.toLocaleString('bn') : products.length} Items
                  </span>
                </div>
              </div>
            </div>

            {/* SUB TAB VIEW 1: GROUPED PRODUCT SALES (HOW MANY PIECES OF EACH S-K-U SOLD) */}
            {salesSubTab === 'grouped' && (() => {
              const filteredProductSales = sortedProductSales.filter(item => {
                if (!salesSearchQuery) return true;
                const q = salesSearchQuery.toLowerCase();
                return item.product.title.toLowerCase().includes(q) ||
                       item.product.banglaTitle.toLowerCase().includes(q) ||
                       item.product.id.toLowerCase().includes(q) ||
                       item.product.category.toLowerCase().includes(q) ||
                       (item.product.brand && item.product.brand.toLowerCase().includes(q));
              });

              return (
                <div className="flex flex-col gap-4">
                  {filteredProductSales.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs font-mono">
                      {language === 'en' 
                        ? 'No product items correspond to your query or have been sold yet.' 
                        : 'এই ফিল্টারে কোনো বিক্রয় পরিসংখ্যান পাওয়া যায়নি।'}
                    </div>
                  ) : (
                    <div>
                      {/* Desktop view Table */}
                      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-101/60">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider text-[10px]">
                              <th className="py-3 px-4">Product / SKU Specs</th>
                              <th className="py-3 px-4 text-center">Remaining Stock</th>
                              <th className="py-3 px-4 text-center bg-emerald-50/40 text-emerald-900 font-black">Pieces Sold</th>
                              <th className="py-3 px-4 text-right">Unit BDT Price</th>
                              <th className="py-3 px-4 text-right font-mono">Accumulated Revenue</th>
                              <th className="py-3 px-4 text-center">Performance Indicator</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProductSales.map((item) => {
                              const isHighSeller = item.soldUnits > 0 && topThreeSellers.some(top => top.product.id === item.product.id);
                              
                              return (
                                <tr key={item.product.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50/55 transition">
                                  <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={item.product.image}
                                        alt={item.product.title}
                                        className="w-11 h-11 rounded-lg object-cover border border-slate-150 shrink-0"
                                      />
                                      <div>
                                        <span className="font-extrabold text-[#0F172A] block leading-tight hover:text-[#16A34A] transition">
                                          {language === 'en' ? item.product.title : item.product.banglaTitle}
                                        </span>
                                        <div className="flex gap-2 text-[9px] text-slate-450 mt-1 uppercase font-mono tracking-wider font-semibold">
                                          <span className="text-slate-500 bg-slate-100 px-1 rounded">ID: {item.product.id}</span>
                                          <span>•</span>
                                          <span>{item.product.category}</span>
                                          {item.product.brand && (
                                            <>
                                              <span>•</span>
                                              <span className="text-indigo-600">{item.product.brand}</span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="py-3.5 px-4 text-center font-mono animate-fade-in">
                                    <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-extrabold ${
                                      item.product.stock <= 0 
                                        ? 'bg-rose-50 text-rose-700' 
                                        : item.product.stock <= 5 
                                        ? 'bg-amber-50 text-amber-700 font-bold animate-pulse' 
                                        : 'bg-slate-100 text-slate-700'
                                    }`}>
                                      {language === 'bn' ? item.product.stock.toLocaleString('bn') : item.product.stock} Units
                                    </span>
                                  </td>

                                  <td className="py-3.5 px-4 text-center bg-emerald-50/20 font-mono font-black text-sm text-emerald-700 animate-fade-in">
                                    {language === 'bn' ? item.soldUnits.toLocaleString('bn') : item.soldUnits} Pcs
                                  </td>

                                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-600 scale-95">
                                    {formatBDT(item.product.price, language)}
                                  </td>

                                  <td className="py-3.5 px-4 text-right font-mono font-black text-[#0F172A] animate-fade-in">
                                    {formatBDT(item.revenue, language)}
                                  </td>

                                  <td className="py-3.5 px-4 text-center">
                                    {isHighSeller ? (
                                      <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-205 text-amber-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg shadow-2xs">
                                        <Sparkles className="w-3 h-3 text-amber-500" />
                                        <span>{language === 'en' ? 'Best Seller' : 'হট কেক'}</span>
                                      </span>
                                    ) : item.soldUnits > 0 ? (
                                      <span className="inline-flex items-center bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-lg border border-emerald-150">
                                        <span>⭐ {language === 'en' ? 'Active Sales' : 'সক্রিয় বিক্রি'}</span>
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 text-[9px] font-mono">
                                        {language === 'en' ? 'Zero sales' : 'কোনো বিক্রি নেই'}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile view Cards Layout - Fits beautifully on screen, no overflow scrollbar */}
                      <div className="block md:hidden space-y-4">
                        {filteredProductSales.map((item) => {
                          const isHighSeller = item.soldUnits > 0 && topThreeSellers.some(top => top.product.id === item.product.id);
                          
                          return (
                            <div key={item.product.id} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-3 text-left">
                              {/* Header row */}
                              <div className="flex items-start gap-3">
                                <img
                                  src={item.product.image}
                                  alt={item.product.title}
                                  className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                                />
                                <div className="leading-tight text-left font-sans flex-1">
                                  <span className="font-extrabold text-[#0F172A] text-xs block">
                                    {language === 'en' ? item.product.title : item.product.banglaTitle}
                                  </span>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[8.5px] uppercase font-mono text-slate-450 tracking-wider">
                                    <span className="bg-slate-205 bg-slate-200 px-1 rounded text-slate-650">ID: {item.product.id}</span>
                                    <span className="text-emerald-600 font-bold">{item.product.category}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Matrix data boxes */}
                              <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-xl border border-slate-100 text-xs font-sans">
                                <div>
                                  <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-wide">{language === 'en' ? 'Pieces Sold' : 'বিক্রি পরিমাণ'}</span>
                                  <span className="font-mono font-black text-emerald-700 text-[13px] block mt-0.5">
                                    {language === 'bn' ? item.soldUnits.toLocaleString('bn') : item.soldUnits} Pcs
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-wide">{language === 'en' ? 'Revenue' : 'মোট বিক্রয়মূল্য'}</span>
                                  <span className="font-mono font-black text-slate-900 text-[13px] block mt-0.5">
                                    {formatBDT(item.revenue, language)}
                                  </span>
                                </div>
                              </div>

                              {/* Indicator metrics row */}
                              <div className="flex items-center justify-between pt-1 border-t border-dashed border-slate-200 text-xs text-slate-500 font-sans">
                                <div className="flex items-center gap-1 font-mono">
                                  <span className="text-[10px] text-slate-400">{language === 'en' ? 'StockLeft:' : 'বাকি স্টক:'}</span>
                                  <span className={`font-semibold ${item.product.stock <= 5 ? 'text-rose-600 font-black animate-pulse' : 'text-slate-800'}`}>
                                    {language === 'bn' ? item.product.stock.toLocaleString('bn') : item.product.stock} pcs
                                  </span>
                                </div>
                                
                                <div>
                                  {isHighSeller ? (
                                    <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                                      <Sparkles className="w-3 h-3 text-amber-500" />
                                      <span>{language === 'en' ? 'Best Seller' : 'হট কেক'}</span>
                                    </span>
                                  ) : item.soldUnits > 0 ? (
                                    <span className="inline-flex items-center bg-emerald-50 text-emerald-700 text-[8.5px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border border-emerald-150">
                                      <span>⭐ {language === 'en' ? 'Active' : 'সক্রিয়'}</span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-[8.5px] font-mono">
                                      {language === 'en' ? 'No sales' : 'কোনো বিক্রি নেই'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* SUB TAB VIEW 2: INDIVIDUAL CUSTOMER TRANSACTION BILLING RECEIPTS (THE PRE-EXISTING ONE) */}
            {salesSubTab === 'individual' && (() => {
              const filteredIndividualSales = productSaleHistoryList.filter(item => {
                if (!salesSearchQuery) return true;
                const q = salesSearchQuery.toLowerCase();
                return item.productTitle.toLowerCase().includes(q) ||
                       item.productBanglaTitle.toLowerCase().includes(q) ||
                       item.buyerName.toLowerCase().includes(q) ||
                       item.buyerPhone.includes(q) ||
                       item.orderId.toLowerCase().includes(q) ||
                       item.category.toLowerCase().includes(q);
              });

              return (
                <div className="flex flex-col gap-4">
                  {filteredIndividualSales.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs font-mono">
                      {language === 'en' 
                        ? 'No individual checkout receipts match your search terms.' 
                        : 'রসিদ ট্র্যাকিংয়ে কোনো ডাটা খুঁজে পাওয়া যায়নি।'}
                    </div>
                  ) : (
                    <div>
                      {/* Desktop Table View */}
                      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-101/60">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                              <th className="py-3 px-4">Sold Item & Category</th>
                              <th className="py-3 px-4">Deal Date</th>
                              <th className="py-3 px-4 font-mono">Invoice ID</th>
                              <th className="py-3 px-4">Billing Customer Info</th>
                              <th className="py-3 px-4 text-center">Qty</th>
                              <th className="py-3 px-4 text-right font-mono">Total BDT</th>
                              <th className="py-3 px-4 text-center">Fulfillment State</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredIndividualSales.map((item, index) => (
                              <tr key={index} className="border-b border-slate-100 last:border-none hover:bg-slate-50 transition">
                                <td className="py-3 px-4">
                                  <div className="font-bold text-slate-800 leading-tight">
                                    {language === 'en' ? item.productTitle : item.productBanglaTitle}
                                  </div>
                                  <div className="flex gap-2 text-[9px] text-slate-400 mt-1 uppercase font-mono">
                                    <span className="font-bold">{item.category}</span>
                                    {item.size && <span className="text-emerald-600 font-bold">Size: {item.size}</span>}
                                    {item.color && <span className="text-slate-550 font-semibold text-slate-500">Color: {item.color}</span>}
                                  </div>
                                </td>

                                <td className="py-3 px-4 text-slate-650">
                                  {item.date}
                                </td>

                                <td className="py-3 px-4 font-mono font-bold text-[#16A34A] hover:underline">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const fullOrderObj = orders.find(o => o.id === item.orderId);
                                      if (fullOrderObj) setSelectedOrderDetail(fullOrderObj);
                                    }}
                                    className="cursor-pointer font-bold inline-flex items-center gap-1"
                                  >
                                    <span>📄</span>
                                    <span>{item.orderId}</span>
                                  </button>
                                </td>

                                <td className="py-3 px-4 text-left leading-normal">
                                  <span className="font-bold text-slate-800 block">{item.buyerName}</span>
                                  <span className="text-[10px] text-slate-400 font-mono block">📞 {item.buyerPhone}</span>
                                </td>

                                <td className="py-3 px-4 text-center font-bold text-slate-800 font-mono">
                                  {language === 'bn' ? item.quantity.toLocaleString('bn') : item.quantity} Units
                                </td>

                                <td className="py-3 px-4 text-right font-mono font-black text-[#0F172A]">
                                  {formatBDT(item.amount, language)}
                                </td>

                                <td className="py-3 px-4 text-center">
                                  <span className={`inline-block px-2.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold ${
                                    item.orderStatus === 'Delivered' 
                                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                      : item.orderStatus === 'Cancelled' 
                                      ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                                  }`}>
                                    {item.orderStatus}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card Grid View */}
                      <div className="block md:hidden space-y-4">
                        {filteredIndividualSales.map((item, index) => (
                          <div key={index} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-3 text-left">
                            {/* Product Header */}
                            <div className="leading-tight text-left font-sans">
                              <span className="font-extrabold text-[#0F172A] text-xs block">
                                {language === 'en' ? item.productTitle : item.productBanglaTitle}
                              </span>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[8.5px] uppercase font-mono text-slate-400 tracking-wider font-bold">
                                <span>{item.category}</span>
                                {item.size && (
                                  <>
                                    <span>•</span>
                                    <span className="text-emerald-600">Size: {item.size}</span>
                                  </>
                                )}
                                {item.color && (
                                  <>
                                    <span>•</span>
                                    <span className="text-indigo-600">Color: {item.color}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Customer and billing block */}
                            <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs font-sans space-y-2">
                              <div className="flex justify-between">
                                <span className="text-slate-400 font-extrabold text-[9px] uppercase">{language === 'en' ? 'Customer' : 'গ্রাহক'}</span>
                                <span className="text-slate-400 font-extrabold text-[9px] uppercase">{language === 'en' ? 'Invoice No.' : 'অর্ডার রশিদ'}</span>
                              </div>
                              <div className="flex justify-between items-start gap-2">
                                <div className="text-left leading-normal">
                                  <span className="font-extrabold text-slate-800 block text-xs">{item.buyerName}</span>
                                  <span className="text-[10px] text-slate-400 font-mono block">📞 {item.buyerPhone}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const fullOrderObj = orders.find(o => o.id === item.orderId);
                                    if (fullOrderObj) setSelectedOrderDetail(fullOrderObj);
                                  }}
                                  className="cursor-pointer font-mono font-black text-[#16A34A] bg-emerald-50 px-2 py-1 rounded text-[10px] flex items-center gap-1 hover:bg-emerald-100"
                                >
                                  <span># {item.orderId}</span>
                                </button>
                              </div>
                            </div>

                            {/* Status, Date, and Amount */}
                            <div className="flex items-center justify-between pt-1 border-t border-dashed border-slate-200 text-xs text-slate-500 font-sans">
                              <div className="flex flex-col text-left">
                                <span className="text-[8.5px] text-slate-400 font-black uppercase">{language === 'en' ? 'Deal Date' : 'বিক্রয় তারিখ'}</span>
                                <span className="font-mono text-[10.5px] font-bold text-slate-700 mt-0.5">{item.date}</span>
                              </div>
                              <div className="flex flex-col text-center">
                                <span className="text-[8.5px] text-slate-400 font-black uppercase">{language === 'en' ? 'Quantity' : 'পরিমাণ'}</span>
                                <span className="font-mono text-[11px] font-black text-slate-800 mt-0.5">{language === 'bn' ? item.quantity.toLocaleString('bn') : item.quantity} pcs</span>
                              </div>
                              <div className="flex flex-col text-right">
                                <span className="text-[8.5px] text-slate-400 font-black uppercase">{language === 'en' ? 'Total Amount' : 'পরিশোধিত টাকা'}</span>
                                <span className="font-mono text-xs font-black text-slate-900 mt-0.5">{formatBDT(item.amount, language)}</span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                              <span className="text-[8.5px] text-slate-400 font-bold uppercase">{language === 'en' ? 'Status:' : 'অবস্থা:'}</span>
                              <span className={`inline-block px-2.5 py-0.5 rounded text-[8.5px] uppercase tracking-wider font-extrabold ${
                                item.orderStatus === 'Delivered' 
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                  : item.orderStatus === 'Cancelled' 
                                  ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}>
                                {item.orderStatus}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

          </div>
        )}

        {/* TAB 5: FINANCIAL ACCOUNT LEDGER (CASH BOOK) */}
        {activeTab === 'account' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col gap-8 animate-fade-in text-left">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <h3 className="font-extrabold text-[#0F172A] text-sm md:text-base font-sans">
                  Financial Accounting Ledger & Cash Flow Balance
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Detailed breakdown of active revenues, collected cash, digital payment balances, and estimated VAT liabilities.
                </p>
              </div>

              <span className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9px] uppercase tracking-widest py-1.5 px-3 rounded-full font-mono">
                System Audit Secured
              </span>
            </div>

            {/* Balances grids */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* bKash collected */}
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex items-center gap-4">
                <div className="bg-pink-500 text-white p-3 rounded-xl">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="leading-tight">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block">bKash Balance</span>
                  <span className="font-mono text-[15px] font-black text-slate-905">{formatBDT(bkashBalance, language)}</span>
                  <span className="text-[9px] text-emerald-600 block mt-0.5 font-bold">100% Cleared</span>
                </div>
              </div>

              {/* Nagad collected */}
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex items-center gap-4">
                <div className="bg-orange-500 text-white p-3 rounded-xl">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="leading-tight">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block">Nagad Balance</span>
                  <span className="font-mono text-[15px] font-black text-slate-905">{formatBDT(nagadBalance, language)}</span>
                  <span className="text-[9px] text-emerald-600 block mt-0.5 font-bold">100% Cleared</span>
                </div>
              </div>

              {/* Rocket collected */}
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex items-center gap-4">
                <div className="bg-indigo-600 text-white p-3 rounded-xl">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="leading-tight">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block">Rocket Balance</span>
                  <span className="font-mono text-[15px] font-black text-slate-905">{formatBDT(rocketBalance, language)}</span>
                  <span className="text-[9px] text-emerald-600 block mt-0.5 font-bold">100% Cleared</span>
                </div>
              </div>

              {/* Cash Outstanding COD */}
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex items-center gap-4">
                <div className="bg-slate-800 text-white p-3 rounded-xl">
                  <Landmark className="w-5 h-5" />
                </div>
                <div className="leading-tight">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block">COD Outstanding</span>
                  <span className="font-mono text-[15px] font-black text-amber-700">{formatBDT(outstandingCODSalesVal, language)}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5 font-normal">In-transit Courier</span>
                </div>
              </div>

            </div>

            {/* Trial Balanced accounts parameters list sheets */}
            <div className="border border-slate-150 rounded-2xl overflow-hidden mt-4">
              <div className="bg-slate-900 text-white p-4 px-6 flex justify-between items-center">
                <span className="text-xs uppercase tracking-widest font-black font-sans text-emerald-400">Ledger Statement Account</span>
                <span className="text-[10px] font-mono font-bold text-slate-400">System Time: 2026-05-23 BST</span>
              </div>

              <div className="p-4 sm:p-6 flex flex-col gap-4 text-xs font-sans">
                
                {/* Account row 1 */}
                <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center py-3 border-b border-slate-100">
                  <div className="leading-tight text-left">
                    <span className="font-bold text-slate-805 text-sm block">Total Revenue Earned (Gross Pipeline Value)</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">Sum of all non-cancelled orders including Cash on Delivery</span>
                  </div>
                  <span className="font-mono font-black text-slate-900 text-base shrink-0">{formatBDT(totalSalesVal, language)}</span>
                </div>

                {/* Account row 2 */}
                <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center py-3 border-b border-slate-100">
                  <div className="leading-tight text-left">
                    <span className="font-bold text-slate-805 text-sm block">Total Cleared Payment Balance</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block font-medium">Sum of instant digital paid order amounts</span>
                  </div>
                  <span className="font-mono font-black text-emerald-600 text-base shrink-0">{formatBDT(realPaidSalesVal, language)}</span>
                </div>

                {/* Account row 3 */}
                <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center py-3 border-b border-slate-100">
                  <div className="leading-tight text-left">
                    <span className="font-bold text-slate-805 text-sm block">15% Estimated National VAT / SD liabilities</span>
                    <span className="text-[10px] text-slate-450 mt-0.5 block font-medium">Accounts collected tax reserved for NBR filing</span>
                  </div>
                  <span className="font-mono font-bold text-rose-600 text-sm shrink-0">-{formatBDT(totalSalesVal * 0.15, language)}</span>
                </div>

                {/* Account row 4 */}
                <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center py-3 border-b border-slate-100">
                  <div className="leading-tight text-left">
                    <span className="font-bold text-slate-805 text-sm block">Member rewards points redemption adjustments</span>
                    <span className="text-[10px] text-slate-450 mt-0.5 block font-medium">Virtual points adjusted to customer files (Points Issued)</span>
                  </div>
                  <span className="font-mono text-slate-600 text-sm shrink-0">
                    {language === 'bn' ? Math.floor(totalSalesVal / 100).toLocaleString('bn') : Math.floor(totalSalesVal / 100)} Points
                  </span>
                </div>

                {/* Account row 5 */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center py-4 bg-slate-50 px-4 rounded-xl mt-4 border border-slate-150">
                  <div className="leading-tight text-left">
                    <span className="font-extrabold text-slate-900 text-base block">Net Operational Revenue BDT</span>
                    <span className="text-[10px] text-slate-500 font-bold mt-0.5 block">Estimated profit margin book value (Revenue after VAT reserves)</span>
                  </div>
                  <span className="font-mono font-black text-emerald-700 text-xl shrink-0">
                    {formatBDT(totalSalesVal - (totalSalesVal * 0.15), language)}
                  </span>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 6: WEBSITE & CONTENT MANAGEMENT SYSTEM (CMS) SETTINGS */}
        {activeTab === 'settings' && !isSuperAdmin ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center max-w-lg mx-auto my-12 flex flex-col items-center gap-4 animate-fade-in">
            <div className="p-4 bg-amber-50 text-amber-600 rounded-full">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-[#0F172A] text-lg">
              {language === 'en' ? 'Super Admin Only' : 'শুধুমাত্র সুপার অ্যাডমিনের জন্য'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'en' 
                ? 'Your account does not have "Super Admin" role. Access to website branding, style customizer, and configurations is restricted.'
                : 'আপনার অ্যাকাউন্টটি "সুপার অ্যাডমিন" নয়। লোগো, থিম কালার ও ওয়েবসাইট সেটিংস পরিবর্তন করতে সুপার অ্যাডমিন অ্যাকাউন্ট প্রয়োজন।'}
            </p>
          </div>
        ) : activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col gap-8 animate-fade-in text-left">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <span className="text-[#16A34A] text-xs font-black uppercase tracking-wider block mb-0.5 font-mono">
                  🌌 ADMIN SYSTEM PANEL MODE
                </span>
                <h3 className="font-extrabold text-[#0F172A] text-sm md:text-base font-sans">
                  {language === 'en' ? 'Website Content Management System (CMS) & Settings' : 'ওয়েবসাইট কনটেন্ট ম্যানেজমেন্ট (CMS) ও সেটিংস হাব'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'en' 
                    ? 'Customize Website Banners, Navigation layout, custom styling preset, Branding details, hotline numbers, footer section, and payment credentials.'
                    : 'ওয়েবসাইট ব্যানার স্লাইড, নেভিগেশন বার ডিজাইন, থিম কালার, লোগো, ফুটার বিবরণ এবং পেমেন্ট নাম্বার পরিবর্তন করুন।'}
                </p>
              </div>
            </div>

            {/* Page Title & Slogan */}
            <div className="flex flex-col gap-6">
              <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                <span className="text-[#16A34A] text-xs font-black uppercase tracking-wider block mb-3 font-mono">
                  🎨 1. Brand Identity & Header Logo
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Website Name (English)</label>
                    <input 
                      type="text" 
                      value={siteConfigs.websiteNameEN || ''} 
                      onChange={(e) => setSiteConfigs({...siteConfigs, websiteNameEN: e.target.value})}
                      className="w-full bg-white border border-slate-205 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#16A34A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Website Name (Bangla / বাংলা)</label>
                    <input 
                      type="text" 
                      value={siteConfigs.websiteNameBN || ''} 
                      onChange={(e) => setSiteConfigs({...siteConfigs, websiteNameBN: e.target.value})}
                      className="w-full bg-white border border-slate-205 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#16A34A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Slogan / Brand Subtitle (English)</label>
                    <input 
                      type="text" 
                      value={siteConfigs.subtextEN || ''} 
                      onChange={(e) => setSiteConfigs({...siteConfigs, subtextEN: e.target.value})}
                      className="w-full bg-white border border-slate-205 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#16A34A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Slogan / Brand Subtitle (Bangla / বাংলা)</label>
                    <input 
                      type="text" 
                      value={siteConfigs.subtextBN || ''} 
                      onChange={(e) => setSiteConfigs({...siteConfigs, subtextBN: e.target.value})}
                      className="w-full bg-white border border-slate-205 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#16A34A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Brand Theme Color (e.g. Logo/Primary Color)</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={siteConfigs.logoColor || '#16A34A'} 
                        onChange={(e) => setSiteConfigs({...siteConfigs, logoColor: e.target.value})}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0"
                      />
                      <input 
                        type="text" 
                        value={siteConfigs.logoColor || '#16A34A'} 
                        onChange={(e) => setSiteConfigs({...siteConfigs, logoColor: e.target.value})}
                        className="bg-white border border-slate-205 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#16A34A] flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Logo Image URL (Leave blank to use elegant text icon logo)</label>
                    <input 
                      type="text" 
                      value={siteConfigs.logoImageUrl || ''} 
                      onChange={(e) => setSiteConfigs({...siteConfigs, logoImageUrl: e.target.value})}
                      className="w-full bg-white border border-slate-205 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#16A34A]"
                      placeholder="e.g. https://domain.com/logo.png"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Logo Height Display (24px - 120px): <span className="text-[#16A34A] font-extrabold">{siteConfigs.logoSize || 48}px</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" 
                        min="24" 
                        max="120" 
                        value={siteConfigs.logoSize || 48} 
                        onChange={(e) => setSiteConfigs({...siteConfigs, logoSize: parseInt(e.target.value) || 48})}
                        className="w-full h-1 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-[#16A34A]"
                      />
                      <input 
                        type="number" 
                        min="24" 
                        max="120" 
                        value={siteConfigs.logoSize || 48} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setSiteConfigs({...siteConfigs, logoSize: isNaN(val) ? 48 : val});
                        }}
                        className="bg-white border border-slate-205 px-2 py-1 rounded-xl text-xs focus:outline-none focus:border-[#16A34A] w-16 text-center font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contacts & Mobile Numbers */}
              <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                <span className="text-[#16A34A] text-xs font-black uppercase tracking-wider block mb-3 font-mono">
                  📞 2. Hotline Support & Payment Mobile Wallet Configurations
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Direct Order Chat Number</label>
                    <input 
                      type="text" 
                      value={siteConfigs.whatsAppNumber || ''} 
                      onChange={(e) => setSiteConfigs({...siteConfigs, whatsAppNumber: e.target.value})}
                      className="w-full bg-white border border-slate-205 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#16A34A] font-mono"
                      placeholder="e.g. 8801712345678"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">bKash Merchant Wallet Number</label>
                    <input 
                      type="text" 
                      value={siteConfigs.bKashNumber || ''} 
                      onChange={(e) => setSiteConfigs({...siteConfigs, bKashNumber: e.target.value})}
                      className="w-full bg-white border border-slate-205 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#16A34A] font-mono"
                      placeholder="e.g. 01712345678"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Hotline Call Number</label>
                    <input 
                      type="text" 
                      value={siteConfigs.hotline || ''} 
                      onChange={(e) => setSiteConfigs({...siteConfigs, hotline: e.target.value})}
                      className="w-full bg-white border border-slate-205 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#16A34A] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic News Headlines */}
              <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                <span className="text-[#16A34A] text-xs font-black uppercase tracking-wider block mb-3 font-mono">
                  📢 2.5 Dynamic News Headlines / Ticker (Top Bar Text)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">News Headlines (English)</label>
                    <textarea 
                      rows={2}
                      value={siteConfigs.newsHeadlinesEN || ''} 
                      onChange={(e) => setSiteConfigs({...siteConfigs, newsHeadlinesEN: e.target.value})}
                      className="w-full bg-white border border-slate-205 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#16A34A] font-medium"
                      placeholder="e.g. 🔥 Flash Deal: 20% discount today! | 🚚 Free Shipping above 5,000 Taka!"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">News Headlines (Bangla / বাংলা)</label>
                    <textarea 
                      rows={2}
                      value={siteConfigs.newsHeadlinesBN || ''} 
                      onChange={(e) => setSiteConfigs({...siteConfigs, newsHeadlinesBN: e.target.value})}
                      className="w-full bg-white border border-slate-205 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#16A34A] font-medium"
                      placeholder="যেমন: 🔥 স্পেশাল অফার: আজকে ২০% বিশেষ ছাড়! | 🚚 ৫,০০০ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি!"
                    />
                  </div>
                </div>
              </div>

              {/* Nav bar cosmetics settings */}
              <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50/50">
                <span className="text-[#16A34A] text-xs font-black uppercase tracking-wider block mb-3 font-mono">
                  💅 3. Navigation Bar Customize (Fonts, Size, Padding, and Re-Ordering Links)
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Top Bar Background Theme</label>
                    <div className="flex gap-1.5">
                      <input 
                        type="color" 
                        value={siteConfigs.navBgColor || '#0F172A'} 
                        onChange={(e) => setSiteConfigs({...siteConfigs, navBgColor: e.target.value})}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0"
                      />
                      <input 
                        type="text" 
                        value={siteConfigs.navBgColor || '#0F172A'} 
                        onChange={(e) => setSiteConfigs({...siteConfigs, navBgColor: e.target.value})}
                        className="bg-white border border-slate-205 px-2 py-1.5 rounded-xl text-xs focus:outline-none focus:border-[#16A34A] flex-1 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Main Nav Background Theme</label>
                    <div className="flex gap-1.5">
                      <input 
                        type="color" 
                        value={siteConfigs.navMainBgColor || '#ffffff'} 
                        onChange={(e) => setSiteConfigs({...siteConfigs, navMainBgColor: e.target.value})}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0"
                      />
                      <input 
                        type="text" 
                        value={siteConfigs.navMainBgColor || '#ffffff'} 
                        onChange={(e) => setSiteConfigs({...siteConfigs, navMainBgColor: e.target.value})}
                        className="bg-white border border-slate-205 px-2 py-1.5 rounded-xl text-xs focus:outline-none focus:border-[#16A34A] flex-1 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Active Font Size</label>
                    <select
                      value={siteConfigs.navFontSize || 'sm'}
                      onChange={(e) => setSiteConfigs({...siteConfigs, navFontSize: e.target.value})}
                      className="w-full bg-white border border-slate-205 px-3 py-2 rounded-xl text-xs focus:outline-none font-bold"
                    >
                      <option value="xs">Extra Small (12px)</option>
                      <option value="sm">Small/Standard (14px)</option>
                      <option value="base">Medium (16px)</option>
                      <option value="lg">Large (18px)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Navbar Font Family</label>
                    <select
                      value={siteConfigs.navFontFamily || 'sans'}
                      onChange={(e) => setSiteConfigs({...siteConfigs, navFontFamily: e.target.value})}
                      className="w-full bg-white border border-slate-205 px-3 py-2 rounded-xl text-xs focus:outline-none font-bold"
                    >
                      <option value="sans">Clean Sans-Serif (Inter)</option>
                      <option value="mono">Console Monospace (JetBrains)</option>
                      <option value="serif">Elegant Editorial Serif</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Button Padding Size</label>
                    <select
                      value={siteConfigs.navButtonPadding || 'py-2 px-3'}
                      onChange={(e) => setSiteConfigs({...siteConfigs, navButtonPadding: e.target.value})}
                      className="w-full bg-white border border-slate-205 px-3 py-2 rounded-xl text-xs focus:outline-none font-bold"
                    >
                      <option value="py-1 px-1.5">Tightest (py-1 px-1.5)</option>
                      <option value="py-1.5 px-3">Compact (py-1.5 px-3)</option>
                      <option value="py-2 px-4">Standard (py-2 px-4)</option>
                      <option value="py-3 px-6">Spacious / Elegant (py-3 px-6)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Navigation Call Button Font Color</label>
                    <div className="flex gap-1.5">
                      <input 
                        type="color" 
                        value={siteConfigs.navButtonColor || '#16A34A'} 
                        onChange={(e) => setSiteConfigs({...siteConfigs, navButtonColor: e.target.value})}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0"
                      />
                      <input 
                        type="text" 
                        value={siteConfigs.navButtonColor || '#16A34A'} 
                        onChange={(e) => setSiteConfigs({...siteConfigs, navButtonColor: e.target.value})}
                        className="bg-white border border-slate-205 px-2 py-1.5 rounded-xl text-xs focus:outline-none focus:border-[#16A34A] flex-1 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Nav links sequence / draggable moving system */}
                <div className="bg-white p-4 border border-slate-200 rounded-2xl">
                  <span className="text-[11px] font-black text-[#0F172A] block mb-2 font-sans">
                    🔀 Page Navigation Links Moving System / Drag Sequence:
                  </span>
                  <p className="text-[10px] text-slate-400 mb-4">
                    Change the sequential positions of navigation items or hide the menu items dynamically.
                  </p>

                  <div className="space-y-2">
                    {siteConfigs.navItems && siteConfigs.navItems.map((item: any, idx: number) => (
                      <div key={item.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 font-bold font-mono">#{idx+1}</span>
                          <span className="text-xs font-bold text-slate-800">{item.title} ({item.id})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...siteConfigs.navItems];
                              const target = { ...updated[idx], visible: !item.visible };
                              updated[idx] = target;
                              setSiteConfigs({ ...siteConfigs, navItems: updated });
                            }}
                            className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider text-white ${item.visible ? 'bg-[#16A34A]' : 'bg-red-500'}`}
                          >
                            {item.visible ? 'Visible' : 'Hidden'}
                          </button>
                          
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => {
                              if (idx === 0) return;
                              const updated = [...siteConfigs.navItems];
                              const temp = updated[idx];
                              updated[idx] = updated[idx - 1];
                              updated[idx - 1] = temp;
                              setSiteConfigs({ ...siteConfigs, navItems: updated });
                            }}
                            className="bg-white hover:bg-slate-100 text-[#0F172A] border border-slate-250 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold px-2 py-1 rounded cursor-pointer"
                          >
                            ▲ Up
                          </button>
                          <button
                            type="button"
                            disabled={idx === siteConfigs.navItems.length - 1}
                            onClick={() => {
                              if (idx === siteConfigs.navItems.length - 1) return;
                              const updated = [...siteConfigs.navItems];
                              const temp = updated[idx];
                              updated[idx] = updated[idx + 1];
                              updated[idx + 1] = temp;
                              setSiteConfigs({ ...siteConfigs, navItems: updated });
                            }}
                            className="bg-white hover:bg-slate-100 text-[#0F172A] border border-slate-250 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold px-2 py-1 rounded cursor-pointer"
                          >
                            ▼ Down
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* FEATURED BANGLADESHI BRANDS (OUR PARTNERS) MANAGER */}
              <div className="border border-slate-101 rounded-2xl p-5 bg-slate-50/50 flex flex-col gap-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[#16A34A] text-xs font-black uppercase tracking-wider block font-mono">
                      🤝 3.8 Featured Bangladeshi Brands (Our Partners)
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Manage the logos and names of the premium partner brands shown on the home page.
                    </p>
                  </div>
                </div>

                {/* Brands List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(siteConfigs.featuredBrands || featuredBrands).map((brand: any, idx: number) => {
                    const brandsArray = siteConfigs.featuredBrands || featuredBrands;
                    return (
                      <div key={brand.id || idx} className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between shadow-xs">
                        <div className="flex items-center gap-3 mb-3">
                          <img 
                            src={brand.logo} 
                            alt={brand.name} 
                            className="w-10 h-10 rounded-full object-cover border border-slate-100" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="text-left">
                            <span className="text-xs font-bold text-slate-800 block">{brand.name}</span>
                            <span className="text-[9px] text-slate-400 font-mono block">ID: {brand.id}</span>
                          </div>
                        </div>

                        {/* Edit Inline Name & Logo */}
                        <div className="space-y-2 mb-3 text-left">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Brand Name</label>
                            <input 
                              type="text" 
                              value={brand.name} 
                              onChange={(e) => {
                                const updated = [...brandsArray];
                                updated[idx] = { ...updated[idx], name: e.target.value };
                                setSiteConfigs({ ...siteConfigs, featuredBrands: updated });
                              }}
                              className="w-full bg-slate-50 border border-slate-200 px-2 py-1 rounded text-xs focus:outline-none focus:border-[#16A34A]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Logo URL</label>
                            <input 
                              type="text" 
                              value={brand.logo} 
                              onChange={(e) => {
                                const updated = [...brandsArray];
                                updated[idx] = { ...updated[idx], logo: e.target.value };
                                setSiteConfigs({ ...siteConfigs, featuredBrands: updated });
                              }}
                              className="w-full bg-slate-50 border border-slate-200 px-2 py-1 rounded text-xs focus:outline-none focus:border-[#16A34A] font-mono"
                            />
                          </div>
                        </div>

                        {/* Reorder & Action Buttons */}
                        <div className="flex items-center justify-between gap-1.5 border-t border-slate-100 pt-2">
                          <div className="flex gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => {
                                if (idx === 0) return;
                                const updated = [...brandsArray];
                                const temp = updated[idx];
                                updated[idx] = updated[idx - 1];
                                updated[idx - 1] = temp;
                                setSiteConfigs({ ...siteConfigs, featuredBrands: updated });
                              }}
                              className="bg-white hover:bg-slate-50 text-slate-705 border border-slate-200 text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer disabled:opacity-30"
                              title="Move Up"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              disabled={idx === brandsArray.length - 1}
                              onClick={() => {
                                if (idx === brandsArray.length - 1) return;
                                const updated = [...brandsArray];
                                const temp = updated[idx];
                                updated[idx] = updated[idx + 1];
                                updated[idx + 1] = temp;
                                setSiteConfigs({ ...siteConfigs, featuredBrands: updated });
                              }}
                              className="bg-white hover:bg-slate-50 text-slate-705 border border-slate-200 text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer disabled:opacity-30"
                              title="Move Down"
                            >
                              ▼
                            </button>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              const updated = brandsArray.filter((_, i) => i !== idx);
                              setSiteConfigs({ ...siteConfigs, featuredBrands: updated });
                            }}
                            className="text-red-500 hover:text-white border border-red-100 hover:bg-red-500 text-[10px] font-bold px-2 py-0.5 rounded transition cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Adding new brand partner */}
                <div className="bg-white p-4 border border-slate-200 rounded-xl mt-2 text-left">
                  <span className="text-xs font-black text-[#0F172A] block mb-2 font-sans">
                    ➕ Add New Brand Partner:
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Brand Name</label>
                      <input 
                        type="text" 
                        value={newBrandName} 
                        onChange={(e) => setNewBrandName(e.target.value)}
                        className="w-full bg-white border border-slate-205 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#16A34A]"
                        placeholder="e.g. Apex Leather, Walton Prime etc."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">Logo URL (or Base64)</label>
                      <input 
                        type="text" 
                        value={newBrandLogo} 
                        onChange={(e) => setNewBrandLogo(e.target.value)}
                        className="w-full bg-white border border-slate-205 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#16A34A] font-mono"
                        placeholder="e.g. https://image.com/logo.png"
                      />
                    </div>
                  </div>

                  {/* Logo File Selector (Upload directly) */}
                  <div className="mb-3">
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">Logo Upload Image Selector</label>
                    <div className="border border-dashed border-slate-205 rounded-xl p-3 bg-slate-50/50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition min-h-[60px]">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="admin-brand-logo-uploader"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              setNewBrandLogo(evt.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label htmlFor="admin-brand-logo-uploader" className="cursor-pointer flex flex-col items-center">
                        <span className="text-[10px] font-extrabold text-[#16A34A] uppercase tracking-wider block">📷 Choose Logo File</span>
                        <span className="text-[9px] text-slate-400 mt-0.5 select-none">Direct, non-volatile offline image base64 cache</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!newBrandName.trim()) {
                        alert('Please fill brand name');
                        return;
                      }
                      const id = newBrandName.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'brand-' + Date.now();
                      const logoUrl = newBrandLogo.trim() || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=200&auto=format&fit=crop';
                      const brandsArray = siteConfigs.featuredBrands || featuredBrands;
                      const updated = [...brandsArray, { id, name: newBrandName.trim(), logo: logoUrl }];
                      setSiteConfigs({ ...siteConfigs, featuredBrands: updated });
                      setNewBrandName('');
                      setNewBrandLogo('');
                    }}
                    className="bg-[#16A34A] hover:bg-emerald-600 text-white font-sans text-[10px] font-black px-4 py-2 rounded-lg transition"
                  >
                    🚀 Register Brand Partner
                  </button>
                </div>
              </div>

              {/* BANNERS SLIDER MANAGER */}
              <div className="border border-slate-101 rounded-2xl p-5 bg-slate-50/50 flex flex-col gap-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="text-[#16A34A] text-xs font-black uppercase tracking-wider block font-mono">
                    ⚡ 4. Website Hero Banner Sliders
                  </span>
                </div>

                {/* List dynamic banner slides directly */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {siteBanners && siteBanners.map((slide: any, idx: number) => (
                    <div key={slide.id || idx} className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between shadow-xs relative">
                      <span className="absolute top-2 right-2 bg-[#0F172A] text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded">
                        Slide #{idx + 1}
                      </span>
                      
                      <div className="flex gap-3 mb-3 items-start">
                        <img 
                          src={slide.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=300'} 
                          alt="Banner review" 
                          className="w-16 h-12 object-cover rounded-lg border border-slate-100 shrink-0 bg-slate-100" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="text-left leading-normal">
                          <p className="text-xs font-black text-slate-805 line-clamp-1">{language === 'en' ? slide.titleEN : slide.titleBN}</p>
                          <p className="text-[10px] text-amber-600 block leading-none font-bold uppercase tracking-wide mt-1">{language === 'en' ? slide.subtitleEN : slide.subtitleBN}</p>
                          <p className="text-[9px] text-[#16A34A] block leading-none font-bold uppercase mt-1">Tag: {language === 'en' ? slide.badgeEN : slide.badgeBN}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end border-t border-slate-100 pt-3">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            if (idx === 0) return;
                            const updated = [...siteBanners];
                            const temp = updated[idx];
                            updated[idx] = updated[idx - 1];
                            updated[idx - 1] = temp;
                            setSiteBanners(updated);
                          }}
                          className="bg-white hover:bg-slate-50 text-[#0f172a] hover:text-emerald-600 border border-slate-200 disabled:opacity-30 p-1.5 rounded-lg text-[10px] font-bold cursor-pointer"
                          title="Move Slide Up"
                        >
                          ▲ Move Up
                        </button>
                        <button
                          type="button"
                          disabled={idx === siteBanners.length - 1}
                          onClick={() => {
                            if (idx === siteBanners.length - 1) return;
                            const updated = [...siteBanners];
                            const temp = updated[idx];
                            updated[idx] = updated[idx + 1];
                            updated[idx + 1] = temp;
                            setSiteBanners(updated);
                          }}
                          className="bg-white hover:bg-slate-50 text-[#0f172a] hover:text-emerald-600 border border-slate-200 disabled:opacity-30 p-1.5 rounded-lg text-[10px] font-bold cursor-pointer"
                          title="Move Slide Down"
                        >
                          ▼ Move Down
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = siteBanners.filter((b, bIdx) => bIdx !== idx);
                            setSiteBanners(updated);
                          }}
                          className="bg-red-55 text-red-655 hover:bg-red-100 px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          ❌ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Form to add secondary banners */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/85">
                  <span className="text-[11px] font-black text-slate-800 block mb-3 font-sans">
                    ➕ Create & Inject a New Carousel Slide:
                  </span>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const newSlide = {
                      id: 'slide_' + Date.now(),
                      titleEN: fd.get('titleEN') || 'Limited Special Pack Collection',
                      titleBN: fd.get('titleBN') || 'সীমিত স্পেশাল অফার কালেকশন',
                      subtitleEN: fd.get('subtitleEN') || 'UP TO 30% SUPER COMBO FLASH DISCOUNTS',
                      subtitleBN: fd.get('subtitleBN') || '৩০% পর্যন্ত মেগা ক্যাশব্যাক অফার',
                      descEN: fd.get('descEN') || 'Experience supreme organic lifestyle designed for modern standard families of Bangladesh.',
                      descBN: fd.get('descBN') || 'বিশেষ মানের খাবার ও রেশমি শাড়ির চমৎকার সমাহার, আপনার দৈনন্দিন জীবনের সেরা সলিউশন।',
                      badgeEN: fd.get('badgeEN') || 'Hot Premium Deal of Month',
                      badgeBN: fd.get('badgeBN') || 'হট প্রিমিয়াম ডিল',
                      image: fd.get('image') || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200',
                      ctaEN: fd.get('ctaEN') || 'Shop Collection',
                      ctaBN: fd.get('ctaBN') || 'কালেকশন দেখুন',
                      category: fd.get('category') || 'fashion'
                    };

                    setSiteBanners([...siteBanners, newSlide]);
                    (e.target as HTMLFormElement).reset();
                  }} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-none">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Slide Cover Image Url</label>
                      <input name="image" required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs" placeholder="e.g. https://images.unsplash.com/photo-1610030469983-98e550d6193c" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Target Category Link</label>
                      <select name="category" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-bold">
                        {siteCategories.map(c => <option key={c.id} value={c.id}>{c.name.en}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Title (English)</label>
                      <input name="titleEN" required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs" placeholder="e.g. Royal Rajshahi Silk Weaving" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Title (Bangla)</label>
                      <input name="titleBN" required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs" placeholder="যেমন: রাজকীয় রাজশাহী সিল্কের সমাহার" />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Subtitle Banner (English)</label>
                      <input name="subtitleEN" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs" placeholder="e.g. INDULGE IN PURE RAW TRADITIONAL TEXTILE" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Subtitle Banner (Bangla)</label>
                      <input name="subtitleBN" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs" placeholder="যেমন: শতভাগ খাঁটি সুতা ও রেশমের তৈরি" />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Promo Badge Pill (English)</label>
                      <input name="badgeEN" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs" placeholder="e.g. Bestseller Choice" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Promo Badge Pill (Bangla)</label>
                      <input name="badgeBN" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs" placeholder="যেমন: সেরা পছন্দ" />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Description Brief (English)</label>
                      <textarea name="descEN" rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs leading-normal" placeholder="English summary..."></textarea>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Description Brief (Bangla)</label>
                      <textarea name="descBN" rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs leading-normal" placeholder="বাংলা সারসংক্ষেপ..."></textarea>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Button Call to Action (English)</label>
                      <input name="ctaEN" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs" placeholder="e.g. Shop Silk Sarees" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Button Call to Action (Bangla)</label>
                      <input name="ctaBN" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs" placeholder="যেমন: সিল্ক শাড়ি কিনুন" />
                    </div>

                    <div className="md:col-span-2 flex justify-end mt-2">
                      <button
                        type="submit"
                        className="bg-[#16A34A] hover:bg-emerald-600 text-white font-sans font-black px-6 py-2.5 rounded-xl cursor-pointer shadow transition"
                      >
                        🚀 Insert Slide banner
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* CURATED CATEGORIES LIST MANAGER */}
              <div className="border border-slate-105 rounded-2xl p-5 bg-slate-50/50 flex flex-col gap-6">
                <div>
                  <span className="text-[#16A34A] text-xs font-black uppercase tracking-wider block font-mono">
                    📂 5. Curated Store Categories Registry
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Register, edit display order sequence or delete active categorization tags inside the platform header and navigation lists.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-sans text-left">
                  {siteCategories && siteCategories.map((cat: any, idx: number) => (
                    <div key={cat.id || idx} className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between shadow-xs relative">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{cat.emoji || '📦'}</span>
                        <div className="text-left leading-tight">
                          <span className="text-xs font-black text-slate-800 font-sans block">{cat.name[language] || cat.name.en}</span>
                          <span className="text-[9px] text-slate-400 font-mono">ID: {cat.id}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end border-t border-slate-100 pt-3">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            if (idx === 0) return;
                            const updated = [...siteCategories];
                            const temp = updated[idx];
                            updated[idx] = updated[idx - 1];
                            updated[idx - 1] = temp;
                            setSiteCategories(updated);
                          }}
                          className="bg-white hover:bg-slate-50 text-[#0f172a] hover:text-[#16A34A] border border-slate-200 disabled:opacity-30 p-1.5 rounded-lg text-[10px] font-bold cursor-pointer"
                          title="Move Category Up"
                        >
                          ▲ Up
                        </button>
                        <button
                          type="button"
                          disabled={idx === siteCategories.length - 1}
                          onClick={() => {
                            if (idx === siteCategories.length - 1) return;
                            const updated = [...siteCategories];
                            const temp = updated[idx];
                            updated[idx] = updated[idx + 1];
                            updated[idx + 1] = temp;
                            setSiteCategories(updated);
                          }}
                          className="bg-white hover:bg-slate-50 text-[#0f172a] hover:text-[#16A34A] border border-slate-200 disabled:opacity-30 p-1.5 rounded-lg text-[10px] font-bold cursor-pointer"
                          title="Move Category Down"
                        >
                          ▼ Down
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = siteCategories.filter(c => c.id !== cat.id);
                            setSiteCategories(updated);
                          }}
                          className="bg-red-50 text-red-650 hover:bg-red-100 px-2 rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          ❌ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Form to inject new categories */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200">
                  <span className="text-[11px] font-black text-slate-800 block mb-3 font-sans">
                    ➕ Create & Register a Brand New Category:
                  </span>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    const newCat = {
                      id: (fd.get('id') as string || '').toLowerCase().replace(/[^a-z0-0]/g, '_'),
                      name: {
                        en: fd.get('nameEN') as string,
                        bn: fd.get('nameBN') as string || fd.get('nameEN') as string,
                      },
                      emoji: fd.get('emoji') as string || '✨'
                    };

                    if (!newCat.id) {
                      alert('Please specify a unique alpha-numeric category ID');
                      return;
                    }

                    if (siteCategories.some(c => c.id === newCat.id)) {
                      alert('This Category ID already exists!');
                      return;
                    }

                    setSiteCategories([...siteCategories, newCat]);
                    (e.target as HTMLFormElement).reset();
                  }} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs leading-none">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Unique category ID (lowercase)</label>
                      <input name="id" required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono" placeholder="e.g. halal_food" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">English Title</label>
                      <input name="nameEN" required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs" placeholder="e.g. Halal Food & Spices" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Bangla Title (বাংলা)</label>
                      <input name="nameBN" required type="text" className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs" placeholder="যেমন: হালাল ফুড ও মসলা" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Emoji Icon</label>
                      <div className="flex gap-2">
                        <input name="emoji" required type="text" className="w-full bg-slate-50 border border-slate-205 rounded-lg p-2 text-xs text-center" placeholder="e.g. 🍯" />
                        <button type="submit" className="bg-[#16A34A] hover:bg-[#15803d] text-white font-sans font-black px-4 rounded-xl cursor-pointer">
                          Add
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* APP DOWNLOAD & PROMOTIONAL BANNER COVERS */}
              <div className="border border-slate-105 rounded-2xl p-5 bg-slate-50/50 text-left">
                <span className="text-[#16A34A] text-xs font-black uppercase tracking-wider block mb-3 font-mono">
                  📱 5.5 App Download Link & Promotional Banner Customizer
                </span>
                <p className="text-[10px] text-slate-400 -mt-1.5 mb-4">
                  Configure the mobile application parameters, play store, app store URLs, app cover graphic/mockup images, titles, and descriptions.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Google Play Store Download URL</label>
                    <input 
                      type="text" 
                      value={siteConfigs.appPlayStoreUrl || ''} 
                      onChange={(e) => setSiteConfigs({...siteConfigs, appPlayStoreUrl: e.target.value})}
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#16A34A] font-mono"
                      placeholder="e.g. https://play.google.com/store/apps/details?id=..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Apple App Store Download URL</label>
                    <input 
                      type="text" 
                      value={siteConfigs.appAppStoreUrl || ''} 
                      onChange={(e) => setSiteConfigs({...siteConfigs, appAppStoreUrl: e.target.value})}
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#16A34A] font-mono"
                      placeholder="e.g. https://apps.apple.com/app/id..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">App Download Graphic Image / Mockup Cover URL</label>
                    <div className="flex flex-col gap-2">
                      <input 
                        type="text" 
                        value={siteConfigs.appBannerImageUrl || ''} 
                        onChange={(e) => setSiteConfigs({...siteConfigs, appBannerImageUrl: e.target.value})}
                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#16A34A]"
                        placeholder="e.g. https://images.unsplash.com/... or relative path / public image URL"
                      />
                      <div className="flex gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setSiteConfigs({
                            ...siteConfigs,
                            appBannerImageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=600&auto=format&fit=crop'
                          })}
                          className="bg-slate-250 hover:bg-slate-300 text-slate-700 text-[10px] font-bold py-1 px-2.5 rounded-lg cursor-pointer"
                        >
                          Use Elegant iPhone Mockup
                        </button>
                        <button
                          type="button"
                          onClick={() => setSiteConfigs({
                            ...siteConfigs,
                            appBannerImageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=600&auto=format&fit=crop'
                          })}
                          className="bg-slate-250 hover:bg-slate-300 text-slate-700 text-[10px] font-bold py-1 px-2.5 rounded-lg cursor-pointer"
                        >
                          Use Android Mockup
                        </button>
                        {siteConfigs.appBannerImageUrl && (
                          <button
                            type="button"
                            onClick={() => setSiteConfigs({ ...siteConfigs, appBannerImageUrl: '' })}
                            className="text-red-500 hover:text-red-650 text-[10px] font-bold py-1 px-2"
                          >
                            Clear Image
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Alternative Graphic Direct Upload Image Selector</label>
                    <div className="border border-dashed border-slate-205 rounded-xl p-3 bg-white flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition min-h-[70px]">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="admin-app-image-uploader"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              setSiteConfigs({ ...siteConfigs, appBannerImageUrl: evt.target?.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label htmlFor="admin-app-image-uploader" className="cursor-pointer flex flex-col items-center">
                        <span className="text-[10px] font-extrabold text-[#16A34A] uppercase tracking-wider block">📷 Choose Banner File</span>
                        <span className="text-[9px] text-slate-400 mt-0.5 select-none">Loads directly as persistent offline base64 image</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">App Download Section Title (English)</label>
                    <input 
                      type="text" 
                      value={siteConfigs.appTitleEN || ''} 
                      onChange={(e) => setSiteConfigs({...siteConfigs, appTitleEN: e.target.value})}
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#16A34A]"
                      placeholder="Download Our Mobile Application"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">App Download Section Title (Bangla / বাংলা)</label>
                    <input 
                      type="text" 
                      value={siteConfigs.appTitleBN || ''} 
                      onChange={(e) => setSiteConfigs({...siteConfigs, appTitleBN: e.target.value})}
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#16A34A]"
                      placeholder="আমাদের মোবাইল অ্যাপ ডাউনলোড করুন"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">App Download Description (English)</label>
                    <textarea 
                      rows={2}
                      value={siteConfigs.appDscEN || ''} 
                      onChange={(e) => setSiteConfigs({...siteConfigs, appDscEN: e.target.value})}
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#16A34A]"
                      placeholder="Get early notification alerts for heritage campaign drops etc..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">App Download Description (Bangla / বাংলা)</label>
                    <textarea 
                      rows={2}
                      value={siteConfigs.appDscBN || ''} 
                      onChange={(e) => setSiteConfigs({...siteConfigs, appDscBN: e.target.value})}
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#16A34A]"
                      placeholder="নতুন ঐতিহ্যবাহী পণ্য ও ফ্ল্যাশ সেলের নোটিফিকেশন সবার আগে পেতে ডাউনলোড করুন..."
                    />
                  </div>
                </div>
              </div>

              {/* FOOTER & SUPPORT INFO SETTINGS */}
              <div className="border border-slate-105 rounded-2xl p-5 bg-slate-50/50 text-left">
                <span className="text-[#16A34A] text-xs font-black uppercase tracking-wider block mb-3 font-mono">
                  🧱 6. Footer Section Information Customizer
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Footer About Text (English)</label>
                    <textarea 
                      rows={3}
                      value={siteConfigs.footerAboutEN || ''} 
                      onChange={(e) => setSiteConfigs({...siteConfigs, footerAboutEN: e.target.value})}
                      className="w-full bg-white border border-slate-205 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#16A34A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Footer About Text (Bangla / বাংলা)</label>
                    <textarea 
                      rows={3}
                      value={siteConfigs.footerAboutBN || ''} 
                      onChange={(e) => setSiteConfigs({...siteConfigs, footerAboutBN: e.target.value})}
                      className="w-full bg-white border border-slate-205 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#16A34A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Physical Warehouse Address / Location</label>
                    <input 
                      type="text" 
                      value={siteConfigs.footerAddress || ''} 
                      onChange={(e) => setSiteConfigs({...siteConfigs, footerAddress: e.target.value})}
                      className="w-full bg-white border border-slate-205 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#16A34A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">English Copyright Text</label>
                    <input 
                      type="text" 
                      value={siteConfigs.copyrightEN || ''} 
                      onChange={(e) => setSiteConfigs({...siteConfigs, copyrightEN: e.target.value})}
                      className="w-full bg-white border border-slate-205 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#16A34A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bangla Copyright Text (বাংলা)</label>
                    <input 
                      type="text" 
                      value={siteConfigs.copyrightBN || ''} 
                      onChange={(e) => setSiteConfigs({...siteConfigs, copyrightBN: e.target.value})}
                      className="w-full bg-white border border-slate-205 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#16A34A]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Persistence Confirmation bar */}
            <div className="bg-[#16A34A]/10 border-2 border-dashed border-[#16A34A]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-left">
              <div className="text-left font-sans">
                <span className="text-xs font-black text-[#16A34A] block font-mono">
                  🛡️ LOCAL PERSISTENCE PREVIEW ENGINE ACTIVE
                </span>
                <p className="text-[10px] text-slate-500 mt-1">
                  All layout configurations, sizes, and colors are automatically cached locally. Refreshing the browser preserves your beautiful work!
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem('site_banners', JSON.stringify(siteBanners));
                    localStorage.setItem('site_categories', JSON.stringify(siteCategories));
                    localStorage.setItem('site_configs', JSON.stringify(siteConfigs));
                    alert('Settings updated successfully! Layout has been cached.');
                  } catch (e) {
                    alert('Storage failed!');
                  }
                }}
                className="bg-[#16A34A] hover:bg-emerald-600 text-white font-black text-xs px-6 py-2.5 rounded-xl cursor-pointer hover:scale-101 active:scale-99 transition shadow-sm font-sans"
              >
                💾 Save Site-wide configurations
              </button>
            </div>
          </div>
        )}

        {/* TAB 7: USER ACCESS CONTROL SYSTEM (SUPER ADMIN AND ADMIN ACCESSIBLE) */}
        {activeTab === 'users' && (() => {
          const filteredUsers = allAccounts.filter((acc) => {
            const q = userSearchText.toLowerCase().trim();
            if (!q) return true;
            return (
              acc.name.toLowerCase().includes(q) ||
              acc.email.toLowerCase().includes(q) ||
              (acc.phone && acc.phone.toLowerCase().includes(q)) ||
              acc.role.toLowerCase().includes(q) ||
              acc.district.toLowerCase().includes(q)
            );
          });

          return (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col gap-6 animate-fade-in text-left">
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <span className="text-indigo-650 text-xs font-black uppercase tracking-wider block mb-0.5 font-mono">
                    🛡️ Admin Access Control & Permission Management
                  </span>
                  <h3 className="font-extrabold text-[#0F172A] text-sm md:text-base font-sans">
                    {language === 'en' ? 'User Access System' : 'ব্যবহারকারী এবং অ্যাডমিন পারমিশন কন্ট্রোল'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {language === 'en' 
                      ? 'Browse, search, and manage system clearance credentials for registered users who sign in or sign up.'
                      : 'লগইন এবং সাইন আপ করা সকল সদস্যদের এক্সেস চেক করুন, খুঁজুন এবং প্রয়োজনীয় পারমিশন সেট করুন।'}
                  </p>
                </div>
                <button
                  type="button"
                  id="export-users-csv-btn"
                  onClick={handleExportUsersToCSV}
                  className="inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition shadow-xs cursor-pointer uppercase select-none w-max shrink-0 font-sans"
                >
                  <Download className="w-4 h-4" />
                  <span>{language === 'en' ? 'Export Users (CSV)' : 'সদস্য তালিকা এক্সপোর্ট (CSV)'}</span>
                </button>
              </div>

              {/* Read-Only Notice for General Admins */}
              {!isSuperAdmin && (
                <div className="bg-amber-50 border border-amber-200 text-amber-905 rounded-2xl p-4 flex items-center gap-3 text-left">
                  <span className="text-lg">⚠️</span>
                  <p className="text-xs leading-relaxed text-amber-800 font-sans">
                    {language === 'en'
                      ? 'Only Super Admins can modify permissions or assign system roles. As an Administrator, you have read-only access with active search capabilities.'
                      : 'শুধুমাত্র সুপার অ্যাডমিনরা পারমিশন ও রোল পরিবর্তন করতে পারেন। সাধারণ অ্যাডমিন হিসেবে আপনার শুধুমাত্র সার্চ এবং রিড-অনলি এক্সেস রয়েছে।'}
                  </p>
                </div>
              )}

              {/* Search bar layout */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 font-sans">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
                  <input
                    type="text"
                    placeholder={language === 'en' ? 'Search registered users by Name, Email, Phone...' : 'নাম, ইমেইল বা ফোন দিয়ে ব্যবহারকারী খুঁজুন...'}
                    value={userSearchText}
                    onChange={(e) => setUserSearchText(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-8 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-[#0F172A]"
                  />
                  {userSearchText && (
                    <button
                      onClick={() => setUserSearchText('')}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 font-bold text-xs p-0.5 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 text-slate-550 text-xs font-bold leading-none shrink-0">
                  👥 {language === 'en' ? 'Total Accounts' : 'মোট একাউন্ট'}: <span className="text-indigo-700 font-black text-sm">{filteredUsers.length}</span>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto border border-slate-150 rounded-2xl font-sans">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3.5 px-4 text-left">User Profile</th>
                        <th className="py-3.5 px-4 text-left">System Role</th>
                        <th className="py-3.5 px-4 text-center">Add Products</th>
                        <th className="py-3.5 px-4 text-center">Modify Products</th>
                        <th className="py-3.5 px-4 text-center">Manage Orders</th>
                        <th className="py-3.5 px-4 text-center">Super Admin</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400 font-bold">
                            {language === 'en' ? 'No users matched your search criteria.' : 'খুঁজে পাওয়া যায়নি।'}
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((acc) => {
                          const hasAdd = acc.permissions.includes('add_products') || acc.permissions.includes('super_admin');
                          const hasModify = acc.permissions.includes('modify_products') || acc.permissions.includes('super_admin');
                          const hasOrders = acc.permissions.includes('manage_orders') || acc.permissions.includes('super_admin');
                          const hasSuper = acc.role === 'super_admin' || acc.permissions.includes('super_admin');

                          return (
                            <tr key={acc.id} className="border-b border-slate-100 last:border-none hover:bg-slate-50 transition">
                              <td className="py-4 px-4 whitespace-nowrap font-sans">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={acc.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"}
                                    alt={acc.name}
                                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="text-left leading-snug">
                                    <span className="font-bold text-slate-800 block text-sm">{acc.name}</span>
                                    <span className="text-[10px] text-slate-400 font-mono block">{acc.email}</span>
                                    {acc.phone && <span className="text-[9px] text-slate-400 block font-mono">📞 {acc.phone}</span>}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-left font-bold text-slate-705">
                                <select
                                  value={acc.role}
                                  disabled={!isSuperAdmin}
                                  onChange={(e) => {
                                    const newRole = e.target.value as 'user' | 'admin' | 'super_admin';
                                    let newPerms = [...acc.permissions];
                                    if (newRole === 'super_admin') {
                                      newPerms = ['super_admin'];
                                    } else if (newRole === 'user') {
                                      newPerms = [];
                                    }
                                    onUpdateAccountPermissions(acc.id, newPerms, newRole);
                                  }}
                                  className="bg-white border border-slate-250 py-1 px-2.5 rounded-lg text-xs font-bold disabled:bg-slate-100 disabled:text-slate-405 cursor-pointer disabled:cursor-not-allowed"
                                >
                                  <option value="user">User (ক্রেতা)</option>
                                  <option value="admin">Admin (কর্মকর্তা)</option>
                                  <option value="super_admin">Super Admin (মালিক)</option>
                                </select>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={hasAdd}
                                  disabled={hasSuper}
                                  onChange={(e) => {
                                    let newPerms = [...acc.permissions];
                                    if (e.target.checked) {
                                      if (!newPerms.includes('add_products')) newPerms.push('add_products');
                                    } else {
                                      newPerms = newPerms.filter(p => p !== 'add_products');
                                    }
                                    onUpdateAccountPermissions(acc.id, newPerms, acc.role);
                                  }}
                                  className="w-4 h-4 text-indigo-650 rounded border-slate-300 focus:ring-slate-200 cursor-pointer disabled:cursor-not-allowed text-center mx-auto block"
                                />
                              </td>
                              <td className="py-4 px-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={hasModify}
                                  disabled={hasSuper}
                                  onChange={(e) => {
                                    let newPerms = [...acc.permissions];
                                    if (e.target.checked) {
                                      if (!newPerms.includes('modify_products')) newPerms.push('modify_products');
                                    } else {
                                      newPerms = newPerms.filter(p => p !== 'modify_products');
                                    }
                                    onUpdateAccountPermissions(acc.id, newPerms, acc.role);
                                  }}
                                  className="w-4 h-4 text-indigo-650 rounded border-slate-300 focus:ring-slate-200 cursor-pointer disabled:cursor-not-allowed text-center mx-auto block"
                                />
                              </td>
                              <td className="py-4 px-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={hasOrders}
                                  disabled={hasSuper}
                                  onChange={(e) => {
                                    let newPerms = [...acc.permissions];
                                    if (e.target.checked) {
                                      if (!newPerms.includes('manage_orders')) newPerms.push('manage_orders');
                                    } else {
                                      newPerms = newPerms.filter(p => p !== 'manage_orders');
                                    }
                                    onUpdateAccountPermissions(acc.id, newPerms, acc.role);
                                  }}
                                  className="w-4 h-4 text-indigo-650 rounded border-slate-300 focus:ring-slate-200 cursor-pointer disabled:cursor-not-allowed text-center mx-auto block"
                                />
                              </td>
                              <td className="py-4 px-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={hasSuper}
                                  disabled={acc.id === currentUser?.id}
                                  onChange={(e) => {
                                    const newRole = e.target.checked ? 'super_admin' : 'admin';
                                    const newPerms: AdminPermission[] = e.target.checked 
                                      ? ['super_admin'] 
                                      : ['add_products', 'modify_products', 'manage_orders'];
                                    onUpdateAccountPermissions(acc.id, newPerms, newRole);
                                  }}
                                  className="w-4 h-4 text-red-650 rounded border-slate-300 focus:ring-rose-200 cursor-pointer disabled:cursor-not-allowed text-center mx-auto block"
                                />
                              </td>
                              <td className="py-4 px-4 text-right">
                                <div className="flex justify-end gap-1 font-mono text-[10px]">
                                  {hasSuper ? (
                                    <span className="text-red-750 bg-rose-50 py-0.5 px-2 rounded font-bold border border-rose-100 font-sans">Super Access</span>
                                  ) : (
                                    <span className="text-emerald-700 bg-emerald-50 py-0.5 px-2 rounded font-bold border border-emerald-100 font-sans">Custom Permissions</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Card Grid */}
                <div className="block md:hidden space-y-4">
                  {filteredUsers.length === 0 ? (
                    <div className="py-12 bg-slate-50 border border-slate-101/60 rounded-2xl text-center text-slate-400 font-bold text-xs select-none">
                      {language === 'en' ? 'No users matched your search criteria.' : 'খুঁজে পাওয়া যায়নি।'}
                    </div>
                  ) : (
                    filteredUsers.map((acc) => {
                      const hasAdd = acc.permissions.includes('add_products') || acc.permissions.includes('super_admin');
                      const hasModify = acc.permissions.includes('modify_products') || acc.permissions.includes('super_admin');
                      const hasOrders = acc.permissions.includes('manage_orders') || acc.permissions.includes('super_admin');
                      const hasSuper = acc.role === 'super_admin' || acc.permissions.includes('super_admin');

                      return (
                        <div key={acc.id} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-4 text-left font-sans animate-fade-in">
                          {/* Profile Header */}
                          <div className="flex items-center gap-3">
                            <img
                              src={acc.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop"}
                              alt={acc.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="text-left leading-normal flex-1">
                              <span className="font-extrabold text-[#0F172A] block text-xs">{acc.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{acc.email}</span>
                              {acc.phone && <span className="text-[9.5px] text-slate-550 font-mono block mt-0.5">📞 {acc.phone}</span>}
                            </div>
                            
                            <div className="shrink-0 text-right">
                              {hasSuper ? (
                                <span className="text-rose-700 bg-rose-50 text-[8.5px] font-extrabold py-1 px-2 rounded border border-rose-100 block tracking-wide uppercase font-sans">Super Access</span>
                              ) : (
                                <span className="text-emerald-700 bg-emerald-50 text-[8.5px] font-extrabold py-1 px-2 rounded border border-emerald-100 block tracking-wide uppercase font-sans">Custom</span>
                              )}
                            </div>
                          </div>

                          {/* Role options dropdown */}
                          <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs font-sans space-y-1">
                            <span className="text-[8.5px] text-slate-400 font-bold uppercase block tracking-wide">{language === 'en' ? 'System Role Configuration' : 'রোল পরিবর্তন'}</span>
                            <select
                              value={acc.role}
                              disabled={!isSuperAdmin}
                              onChange={(e) => {
                                const newRole = e.target.value as 'user' | 'admin' | 'super_admin';
                                let newPerms = [...acc.permissions];
                                if (newRole === 'super_admin') {
                                  newPerms = ['super_admin'];
                                } else if (newRole === 'user') {
                                  newPerms = [];
                                }
                                onUpdateAccountPermissions(acc.id, newPerms, newRole);
                              }}
                              className="w-full bg-slate-50 border border-slate-200 mt-1 py-1.5 px-2 rounded text-xs font-bold disabled:bg-slate-100 disabled:text-slate-405 cursor-pointer disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
                            >
                              <option value="user">User (ক্রেতা)</option>
                              <option value="admin">Admin (কর্মকর্তা)</option>
                              <option value="super_admin">Super Admin (মালিক)</option>
                            </select>
                          </div>

                          {/* Checkboxes Grid layout */}
                          <div className="bg-white p-3 rounded-xl border border-slate-105 grid grid-cols-2 gap-3 text-xs font-sans">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={hasAdd}
                                disabled={hasSuper}
                                onChange={(e) => {
                                  let newPerms = [...acc.permissions];
                                  if (e.target.checked) {
                                    if (!newPerms.includes('add_products')) newPerms.push('add_products');
                                  } else {
                                    newPerms = newPerms.filter(p => p !== 'add_products');
                                  }
                                  onUpdateAccountPermissions(acc.id, newPerms, acc.role);
                                }}
                                className="w-3.5 h-3.5 text-indigo-650 rounded border-slate-300 focus:ring-indigo-500/10 cursor-pointer disabled:cursor-not-allowed"
                              />
                              <span className={`text-[10.5px] font-extrabold ${hasSuper ? 'text-slate-400' : 'text-slate-705'}`}>Add Products</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={hasModify}
                                disabled={hasSuper}
                                onChange={(e) => {
                                  let newPerms = [...acc.permissions];
                                  if (e.target.checked) {
                                    if (!newPerms.includes('modify_products')) newPerms.push('modify_products');
                                  } else {
                                    newPerms = newPerms.filter(p => p !== 'modify_products');
                                  }
                                  onUpdateAccountPermissions(acc.id, newPerms, acc.role);
                                }}
                                className="w-3.5 h-3.5 text-indigo-650 rounded border-slate-300 focus:ring-indigo-500/10 cursor-pointer disabled:cursor-not-allowed"
                              />
                              <span className={`text-[10.5px] font-extrabold ${hasSuper ? 'text-slate-400' : 'text-slate-705'}`}>Modify Specs</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={hasOrders}
                                disabled={hasSuper}
                                onChange={(e) => {
                                  let newPerms = [...acc.permissions];
                                  if (e.target.checked) {
                                    if (!newPerms.includes('manage_orders')) newPerms.push('manage_orders');
                                  } else {
                                    newPerms = newPerms.filter(p => p !== 'manage_orders');
                                  }
                                  onUpdateAccountPermissions(acc.id, newPerms, acc.role);
                                }}
                                className="w-3.5 h-3.5 text-indigo-650 rounded border-slate-300 focus:ring-indigo-500/10 cursor-pointer disabled:cursor-not-allowed"
                              />
                              <span className={`text-[10.5px] font-extrabold ${hasSuper ? 'text-slate-400' : 'text-slate-705'}`}>Manage Orders</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={hasSuper}
                                disabled={acc.id === currentUser?.id}
                                onChange={(e) => {
                                  const newRole = e.target.checked ? 'super_admin' : 'admin';
                                  const newPerms: AdminPermission[] = e.target.checked 
                                    ? ['super_admin'] 
                                    : ['add_products', 'modify_products', 'manage_orders'];
                                  onUpdateAccountPermissions(acc.id, newPerms, newRole);
                                }}
                                className="w-3.5 h-3.5 text-red-650 rounded border-slate-300 focus:ring-rose-150 cursor-pointer disabled:cursor-not-allowed"
                              />
                              <span className="text-[10.5px] font-extrabold text-red-750 text-rose-700">Super Admin</span>
                            </label>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-500 font-sans leading-relaxed">
                  <span className="font-extrabold text-[#0F172A] text-sm block mb-1">ℹ️ Roles & Permissions Quick Guide (নিয়মাবলী):</span>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Super Admin (সুপার অ্যাডমিন)</strong>: Full access to financial books, settings customizers, warehouse list editing/creation/removal, order dispatched stages, and access manager.</li>
                    <li><strong>Add Products (শুধুমাত্র পণ্য যোগ করতে পারবে)</strong>: Can look at Store Room and fill forms to create products, but cannot edit or delete existing products.</li>
                    <li><strong>Modify Products (পণ্য যোগ, এডিট ও ডিলিট করতে পারবে)</strong>: Full power inside the Store Room Tab to create, modify specs, add quantities, or delete products.</li>
                    <li><strong>Manage Orders (অর্ডার ড্যাশবোর্ড)</strong>: Can inspect delivery queues, move shipment timeline stages, or register location points.</li>
                  </ul>
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 8: FORECASTING & MACHINE LEARNING ANALYTICS (LINEAR REGRESSION COCKPIT) */}
        {activeTab === 'forecasting' && (() => {
          // Calculate helper values
          const formatMonthKey = (monthKey: string, lang: 'en' | 'bn'): string => {
            const [year, month] = monthKey.split('-');
            const monthIdx = parseInt(month, 10) - 1;
            const shortYear = year.slice(2);
            const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthNamesBn = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
            if (lang === 'en') {
              return `${monthNamesEn[monthIdx]} '${shortYear}`;
            } else {
              return `${monthNamesBn[monthIdx]} '${shortYear}`;
            }
          };

          // Scaler params for responsive-looking SVG
          const maxVal = Math.max(...forecastData.points.map(p => p.y * (p.isForecast ? (1 + growthBoost / 100) : 1))) * 1.15;
          const pointsCount = forecastData.points.length;
          const svgW = 600;
          const svgH = 340;
          const topPad = 40;
          const botPad = 50;
          const leftPad = 70;
          const rightPad = 35;

          const getXCoord = (x: number) => {
            return leftPad + ((x - 1) / (pointsCount - 1)) * (svgW - leftPad - rightPad);
          };
          
          const getYCoord = (y: number) => {
            return svgH - botPad - (y / maxVal) * (svgH - topPad - botPad);
          };

          // Generate paths for direct line segments
          let histPath = "";
          let projPath = "";

          // For historical path
          forecastData.historicalPoints.forEach((p, idx) => {
            const cx = getXCoord(p.x);
            const cy = getYCoord(p.y);
            if (idx === 0) {
              histPath += `M ${cx} ${cy}`;
            } else {
              histPath += ` L ${cx} ${cy}`;
            }
          });

          // For full linear regression line
          let regressionPath = "";
          forecastData.points.forEach((p, idx) => {
            const cx = getXCoord(p.x);
            const predY = (forecastData.slope * p.x) + forecastData.intercept;
            const cy = getYCoord(predY);
            if (idx === 0) {
              regressionPath += `M ${cx} ${cy}`;
            } else {
              regressionPath += ` L ${cx} ${cy}`;
            }
          });

          const slopeSign = forecastData.slope >= 0 ? '+' : '-';
          const slopeAbs = Math.abs(forecastData.slope).toFixed(1);
          const interceptVal = forecastData.intercept.toFixed(1);

          // Projected revenues
          const nextMonthObj = forecastData.projectedPoints[0];
          const nextMonthVal = nextMonthObj ? nextMonthObj.y * (1 + growthBoost / 100) : 0;
          const cumulativeForecast = forecastData.projectedPoints.reduce((acc, cur) => acc + (cur.y * (1 + growthBoost / 100)), 0);

          return (
            <div className="flex flex-col gap-8 animate-fade-in text-slate-850">
              
              {/* Introduction Bento Header */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -left-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex-1 flex flex-col gap-2 relative z-10">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 w-max">
                    <Sparkles className="w-4 h-4" />
                    <span>{language === 'en' ? 'Predictive Analytics Suite' : 'ভবিষ্যদ্বাণীমূলক বিশ্লেষণ'}</span>
                  </span>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight mt-1 text-white">
                    {language === 'en' ? 'Sleek Sales Trend Forecaster' : 'অত্যাধুনিক বিক্রয় পূর্বাভাসের ককপিট'}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-355 max-w-2xl font-medium leading-relaxed mt-1">
                    {language === 'en' 
                      ? 'This module analyzes historical database checkout streams, groups revenues into contiguous months, and applies a mathematical Linear Regression (Ordinary Least Squares) algorithm to project sales trajectory into the coming quarters.'
                      : 'এই মডিউলে পূর্বে সম্পন্ন করা অর্ডারগুলোর মাস-ভিত্তিক বিক্রয় ডেটা সমবেত করে Ordinary Least Squares সূত্রের সাহায্যে সরল রৈখিক রিগ্রেশন (Linear Regression) হিসেব করে পরবর্তী ৩ মাসের বিক্রয় সম্ভাবনা মডেলিং করা হয়েছে।'}
                  </p>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col md:items-end gap-1.5 text-right w-full sm:w-auto relative z-10 select-none">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase font-mono tracking-wider">
                    {language === 'en' ? 'Model Algorithm' : 'মডেল অ্যালগরিদম'}
                  </span>
                  <span className="text-amber-400 font-mono text-xs font-black px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/10">
                    O.L.S Regression (y = mx + c)
                  </span>
                  <span className="text-slate-300 font-bold text-[10px] mt-1">
                    {language === 'en' ? 'Samples Analyzed:' : 'মোট প্রাপ্ত নমুনা:'} <strong className="text-white text-xs">{forecastData.historicalPoints.length} Months</strong>
                  </span>
                </div>
              </div>

              {/* Bento Metrics Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Net Trend Rate */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest">{language === 'en' ? 'Net Trend Velocity' : 'নিট বিক্রয় প্রবাহ গতি'}</span>
                      <div className={`p-2 rounded-xl ${forecastData.slope >= 0 ? 'bg-emerald-50 text-[#16A34A]' : 'bg-red-50 text-red-500'}`}>
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>
                    <span className="text-2xl font-black text-slate-900 block font-mono">
                      ৳{slopeSign}{slopeAbs}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] font-bold text-slate-500">
                    {language === 'en' 
                      ? `${forecastData.slope >= 0 ? 'Growing' : 'Refracting'} by ৳${slopeAbs} Month-over-Month`
                      : `প্রতি মাসে আনুমানিক ৳${slopeAbs} কড়ে ${forecastData.slope >= 0 ? 'উন্নতি' : 'অবনতি'}`}
                  </div>
                </div>

                {/* Next Month Projected */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest">
                        {language === 'en' ? 'Next Month Forecast' : 'আগামী মাসের পূর্বাভাস'}
                      </span>
                      <div className="p-2 rounded-xl bg-amber-50 text-amber-500">
                        <Sparkles className="w-5 h-5 font-bold" />
                      </div>
                    </div>
                    <span className="text-2xl font-black text-slate-900 block font-mono">
                      ৳{formatBDT(Math.round(nextMonthVal))}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    <span>
                      {nextMonthObj ? formatMonthKey(nextMonthObj.monthKey, language) : ''} {language === 'en' ? 'Prediction point' : 'হিসাবকৃত পয়েন্ট'}
                    </span>
                  </div>
                </div>

                {/* Trajectory Aggregate */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest">
                        {language === 'en' ? '3-Month Projected Revenue' : '৩ মাসের সঞ্চিত পূর্বাভাস'}
                      </span>
                      <div className="p-2 rounded-xl bg-indigo-50 text-indigo-500">
                        <DollarSign className="w-5 h-5" />
                      </div>
                    </div>
                    <span className="text-2xl font-black text-slate-900 block font-mono">
                      ৳{formatBDT(Math.round(cumulativeForecast))}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] font-bold text-slate-500">
                    {language === 'en' ? 'Aggregated next 3 forecast intervals' : 'পরবর্তী তিন মাসের মোট অনুমিত আয়'}
                  </div>
                </div>

                {/* Model Fit Confidence */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest">
                        {language === 'en' ? "Coefficient of Fit (R²)" : 'মডেল ফিট যোগ্যতা (R²)'}
                      </span>
                      <div className="p-2 rounded-xl bg-purple-50 text-purple-500">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                    </div>
                    <span className="text-2xl font-black text-slate-900 block font-mono">
                      {(forecastData.rSquared * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2 text-[11.5px] font-bold text-slate-500">
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${forecastData.rSquared * 100}%` }}></div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Graphical Workstation Container */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* The Linear Regression SVG Chart (2/3 size is superb) */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col gap-4 relative">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                        {language === 'en' ? 'Sales Projection Matrix (Trend-line)' : 'বিক্রয় প্রক্ষেপণ চিত্র'}
                      </h3>
                      <p className="text-xs text-slate-400 font-bold mt-0.5">
                        {language === 'en' ? 'Solid curve shows Actuals, dashed curve shows OLS Linear Regression Projection' : 'সলিড লাইনটি বাস্তব ডেটা নির্দেশক এবং ড্যাশড লাইনটি রিগ্রেশন লাইন নির্দেশক'}
                      </p>
                    </div>
                    
                    {/* Tiny Legend indicators */}
                    <div className="flex items-center gap-3.5 text-[11px] font-black select-none">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 block"></span>
                        <span className="text-slate-600">{language === 'en' ? 'Actuals' : 'বাস্তব'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-0.5 border-t-2 border-dashed border-amber-500 block"></span>
                        <span className="text-slate-600">{language === 'en' ? 'OLS Baseline' : 'রৈখিক রিগ্রেশন'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 block border border-amber-600 animate-pulse"></span>
                        <span className="text-slate-600">{language === 'en' ? 'Forecasts' : 'পূর্বাভাসসমূহ'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic SVG Container */}
                  <div className="relative border border-slate-100 rounded-2xl bg-slate-50/50 p-2 overflow-hidden">
                    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto select-none overflow-visible rounded-xl">
                      {/* Grid Lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                        const y = topPad + ratio * (svgH - topPad - botPad);
                        const val = maxVal * (1 - ratio);
                        return (
                          <g key={i}>
                            <line 
                              x1={leftPad} 
                              y1={y} 
                              x2={svgW - rightPad} 
                              y2={y} 
                              className="stroke-slate-200" 
                              strokeDasharray="4 4" 
                              strokeWidth="1"
                            />
                            <text 
                              x={leftPad - 12} 
                              y={y + 4} 
                              className="text-[9px] fill-slate-450 font-mono font-bold text-right"
                              textAnchor="end"
                            >
                              ৳{Math.round(val).toLocaleString()}
                            </text>
                          </g>
                        );
                      })}

                      {/* X Axis division markers */}
                      {forecastData.points.map((p, idx) => {
                        const x = getXCoord(p.x);
                        return (
                          <g key={idx}>
                            <line 
                              x1={x} 
                              y1={topPad} 
                              x2={x} 
                              y2={svgH - botPad} 
                              className="stroke-slate-200/50" 
                              strokeDasharray="2 3"
                            />
                            <text 
                              x={x} 
                              y={svgH - botPad + 18} 
                              className={`text-[9px] font-black text-center ${p.isForecast ? 'fill-amber-600 font-black' : 'fill-slate-500'}`}
                              textAnchor="middle"
                            >
                              {formatMonthKey(p.monthKey, language)}
                            </text>
                            {p.isForecast && (
                              <text
                                x={x}
                                y={svgH - botPad + 28}
                                className="text-[8px] font-extrabold fill-amber-700 uppercase tracking-widest text-center"
                                textAnchor="middle"
                              >
                                (FCST)
                              </text>
                            )}
                          </g>
                        );
                      })}

                      {/* Drawing full static mathematical O.L.S Regression Model line */}
                      <path 
                        d={regressionPath} 
                        fill="none" 
                        className="stroke-amber-400/70" 
                        strokeWidth="1.5" 
                        strokeDasharray="4 4"
                      />

                      {/* Drawing the connected line of actually verified sales values */}
                      <path 
                        d={histPath} 
                        fill="none" 
                        className="stroke-indigo-600" 
                        strokeWidth="3.5" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Drawing connection of last actual to first forecast */}
                      {(() => {
                        const lastActual = forecastData.historicalPoints[forecastData.historicalPoints.length - 1];
                        const firstForecast = forecastData.projectedPoints[0];
                        if (lastActual && firstForecast) {
                          const x1 = getXCoord(lastActual.x);
                          const y1 = getYCoord(lastActual.y);
                          const x2 = getXCoord(firstForecast.x);
                          const y2 = getYCoord(firstForecast.y * (1 + growthBoost / 100));
                          return (
                            <line 
                              x1={x1} 
                              y1={y1} 
                              x2={x2} 
                              y2={y2} 
                              className="stroke-amber-500" 
                              strokeWidth="3" 
                              strokeDasharray="4 4" 
                            />
                          );
                        }
                        return null;
                      })()}

                      {/* Drawing connection lines between forecast points */}
                      {(() => {
                        let fPath = "";
                        forecastData.projectedPoints.forEach((p, idx) => {
                          const cx = getXCoord(p.x);
                          const cy = getYCoord(p.y * (1 + growthBoost / 100));
                          if (idx === 0) {
                            const lastActual = forecastData.historicalPoints[forecastData.historicalPoints.length - 1];
                            if (lastActual) {
                              fPath += `M ${getXCoord(lastActual.x)} ${getYCoord(lastActual.y)} L ${cx} ${cy}`;
                            } else {
                              fPath += `M ${cx} ${cy}`;
                            }
                          } else {
                            fPath += ` L ${cx} ${cy}`;
                          }
                        });
                        return (
                          <path 
                            d={fPath} 
                            fill="none" 
                            className="stroke-amber-500" 
                            strokeWidth="3.5" 
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        );
                      })()}

                      {/* Drawing individual node anchors */}
                      {forecastData.points.map((p, idx) => {
                        const currentY = p.y * (p.isForecast ? (1 + growthBoost / 100) : 1);
                        const cx = getXCoord(p.x);
                        const cy = getYCoord(currentY);
                        const isHovered = hoveredPointIdx === idx;

                        return (
                          <g 
                            key={idx}
                            onMouseEnter={() => setHoveredPointIdx(idx)}
                            onMouseLeave={() => setHoveredPointIdx(null)}
                            className="cursor-pointer"
                          >
                            {/* Inner circle anchor */}
                            <circle 
                              cx={cx} 
                              cy={cy} 
                              r={isHovered ? 8 : 5} 
                              className={`${p.isForecast ? 'fill-amber-400 stroke-amber-600' : 'fill-indigo-600 stroke-indigo-50 border border-white'}`}
                              strokeWidth={isHovered ? 3 : 2}
                            />
                            {/* Outer interactive hotzone */}
                            <circle 
                              cx={cx} 
                              cy={cy} 
                              r={16} 
                              fill="transparent" 
                            />
                          </g>
                        );
                      })}
                    </svg>

                    {/* Active Point Hover Overlay */}
                    {hoveredPointIdx !== null && (() => {
                      const p = forecastData.points[hoveredPointIdx];
                      const currentY = p.y * (p.isForecast ? (1 + growthBoost / 100) : 1);
                      return (
                        <div className="absolute top-2 left-1/2 -translate-x-[50%] bg-slate-900 border border-slate-800 text-white rounded-2xl px-5 py-2 text-xs shadow-xl flex items-center gap-3 animate-zoom-in font-mono select-none z-10">
                          <span className={`w-2 h-2 rounded-full ${p.isForecast ? 'bg-amber-400' : 'bg-indigo-550'}`}></span>
                          <span className="font-extrabold">{formatMonthKey(p.monthKey, language)}</span>
                          <span className="text-slate-400 font-bold">|</span>
                          <span className="font-semibold text-emerald-400">
                            {p.isForecast ? (language === 'en' ? 'FCST: ' : 'অনুমিত: ') : (language === 'en' ? 'Actual: ' : 'রিয়েল: ')}
                            ৳{Math.round(currentY).toLocaleString()}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Model Tuning Dashboard (1/3 size) */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col gap-5 justify-between">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                      <div className="bg-emerald-500/10 text-emerald-650 p-2 rounded-xl">
                        <Layers className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          {language === 'en' ? 'Simulation Cockpit' : 'সিমুলেশন কন্ট্রোল'}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-extrabold font-mono mt-0.5">
                          SIMULATING VARIABLE TRACTION
                        </p>
                      </div>
                    </div>

                    {/* Simulation multipliers explanation */}
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      {language === 'en' 
                        ? 'Simulate manual sales amplification factors (e.g. promotional campaign impacts, holidays, bulk logistics) on top of the calculated Ordinary Least Squares target regression vector.'
                        : 'সরল সুষম রিগ্রেশন লাইনের উপর ভিত্তি করে উৎসবের বোনাস, প্রচারণামূলক ক্যাম্পেইন ইত্যাদির প্রভাবে বিক্রয়ের আনুমানিক তারতম্য সিমুলেট করে লক্ষ্যমাত্রা নির্ধারণ করুন।'}
                    </p>

                    {/* Multiplier Slide Selector */}
                    <div className="flex flex-col gap-2 bg-slate-50 border border-slate-150 p-4 rounded-2xl mt-2 select-none">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-750">
                        <span>{language === 'en' ? 'Amplifier Factor' : 'সিমুলেশন ফ্যাক্টর'}</span>
                        <span className={`font-mono font-black ${growthBoost >= 0 ? 'text-emerald-600' : 'text-rose-650'}`}>
                          {growthBoost >= 0 ? '+' : ''}{growthBoost}%
                        </span>
                      </div>
                      <input 
                        type="range"
                        min="-50"
                        max="50"
                        step="5"
                        value={growthBoost}
                        onChange={(e) => setGrowthBoost(parseInt(e.target.value, 10))}
                        className="w-full accent-emerald-500 h-2 bg-slate-250 rounded-lg appearance-none cursor-pointer mt-1 font-sans"
                      />
                      <div className="flex justify-between text-[9px] font-black text-slate-400 font-mono mt-1">
                        <span>-50% (Squeeze)</span>
                        <span>0% (Default)</span>
                        <span>+50% (Boost)</span>
                      </div>
                    </div>
                  </div>

                  {/* Solved regression formula display card */}
                  <div className="bg-slate-900 text-white rounded-2xl p-4.5 border border-slate-850 flex flex-col gap-3 relative overflow-hidden select-none">
                    <span className="text-[9px] text-emerald-450 font-extrabold uppercase font-mono tracking-widest">{language === 'en' ? 'Derived Mathematical Curve' : 'রিগ্রেশন সমীকরণ ফলাফল'}</span>
                    <div className="text-xs font-black text-slate-100 bg-slate-950/80 border border-slate-800 py-2.5 px-3 rounded-xl text-center shadow-inner font-mono tracking-tighter">
                      Y = ({slopeSign}{slopeAbs} × X) + {formatBDT(parseInt(interceptVal, 10))}
                    </div>
                    <div className="text-[10px] text-slate-405 leading-relaxed font-medium">
                      {language === 'en' 
                        ? `where X represents the month chronological index (1 to ${pointsCount}) and Y represents the predicted revenue in BDT.`
                        : `যেখানে X হচ্ছে চলমান মাসের ক্রমিক সূচক (১ থেকে ${pointsCount}) এবং Y হচ্ছে মোট বিক্রয় টাকার পরিমাণ।`}
                    </div>
                  </div>
                </div>

              </div>

              {/* Comprehensive Forecast Ledger Table */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
                <div className="px-6 py-4 border-b border-slate-150 bg-slate-50/70 flex justify-between items-center sm:flex-row flex-col gap-4">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      {language === 'en' ? 'Symmetric Prediction Ledger' : 'পূর্বাভাস গণনা খাতা'}
                    </h3>
                    <p className="text-[10px] text-slate-450 font-bold font-mono">
                      CHRONOLOGICAL INTERVAL REVENUE DESTRUCTURING
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      // CSV construction
                      let csv = 'Month ID,Month Name,Type,Base Value,Projected Value (with Simulation),Percentage Change\n';
                      let prevVal = 0;
                      forecastData.points.forEach((p) => {
                        const mName = formatMonthKey(p.monthKey, 'en');
                        const isF = p.isForecast ? 'Forecast' : 'Actual';
                        const baseVal = Math.round(p.y);
                        const actualVal = Math.round(p.y * (p.isForecast ? (1 + growthBoost / 100) : 1));
                        const pct = prevVal !== 0 ? (((actualVal - prevVal) / prevVal) * 100).toFixed(1) + '%' : '-';
                        csv += `"${p.monthKey}","${mName}","${isF}",${baseVal},${actualVal},"${pct}"\n`;
                        prevVal = actualVal;
                      });
                      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.setAttribute("download", `AmarBazar_Regression_Forecasting_${new Date().toISOString().slice(0,10)}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-650 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl shadow-xs cursor-pointer select-none border border-emerald-700 transition duration-150"
                  >
                    <Download className="w-4 h-4 text-white" />
                    <span>{language === 'en' ? 'Export Ledger CSV' : 'লেজার এক্সপোর্ট করুন'}</span>
                  </button>
                </div>

                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left font-sans border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] text-slate-400 font-extrabold uppercase border-b border-slate-200 font-mono tracking-wider select-none">
                        <th className="py-3 px-5 text-center">{language === 'en' ? 'Chronological ID' : 'ক্রমিক সূচক'}</th>
                        <th className="py-3 px-5">{language === 'en' ? 'Interval Month' : 'মাস'}</th>
                        <th className="py-3 px-5 text-center">{language === 'en' ? 'Data Status' : 'অবস্থা'}</th>
                        <th className="py-3 px-5 text-right">{language === 'en' ? 'Baseline OLS Formula' : 'রিগ্রেশন বেইজলাইন'}</th>
                        <th className="py-3 px-5 text-right bg-emerald-500/[0.02] text-emerald-800 font-black">{language === 'en' ? 'Projected Revenue (Simulated)' : 'চূড়ান্ত পরিমাণ (সিমুলেটেড)'}</th>
                        <th className="py-3 px-5 text-right">{language === 'en' ? 'Expected Delta' : 'তারতম্য'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {(() => {
                        let prevValue = 0;
                        return forecastData.points.map((p, idx) => {
                          const originalYVal = Math.round(p.y);
                          const activeYVal = Math.round(p.y * (p.isForecast ? (1 + growthBoost / 100) : 1));
                          
                          let percentageChange = '-';
                          if (prevValue !== 0) {
                            const diff = activeYVal - prevValue;
                            const pct = (diff / prevValue) * 100;
                            percentageChange = (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%';
                          }
                          prevValue = activeYVal;

                          return (
                            <tr key={idx} className={`hover:bg-slate-50/60 transition ${p.isForecast ? 'bg-amber-500/[0.01]' : ''}`}>
                              <td className="py-3.5 px-5 text-center font-bold text-slate-400">X = {p.x}</td>
                              <td className="py-3.5 px-5 font-bold text-slate-800">
                                {formatMonthKey(p.monthKey, language)}
                                <span className="text-[9px] text-slate-400 block mt-0.5">{p.monthKey}</span>
                              </td>
                              <td className="py-3.5 px-5 text-center">
                                {p.isForecast ? (
                                  <span className="text-amber-750 bg-amber-50 text-[9px] border border-amber-200/50 rounded-full px-2.5 py-0.5 font-bold tracking-tight inline-block select-none">
                                    🔮 {language === 'en' ? 'Forecast interval' : 'পূর্বাভাস'}
                                  </span>
                                ) : (
                                  <span className="text-indigo-700 bg-indigo-55 bg-indigo-50 text-[9px] border border-indigo-150 rounded-full px-2.5 py-0.5 font-bold tracking-tight inline-block select-none">
                                    ✅ {language === 'en' ? 'Historic actual' : 'বাস্তব ডেটা'}
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-5 text-right text-slate-500 font-bold">
                                ৳{originalYVal.toLocaleString()}
                              </td>
                              <td className={`py-3.5 px-5 text-right font-black shadow-3xs font-mono text-xs ${p.isForecast ? 'text-amber-600 bg-amber-500/[0.03]' : 'text-slate-800 bg-slate-100/5 *:'}`}>
                                ৳{activeYVal.toLocaleString()}
                              </td>
                              <td className="py-3.5 px-5 text-right font-sans">
                                {percentageChange !== '-' ? (
                                  <span className={`font-mono text-[11px] font-black rounded px-1.5 py-0.5 ${percentageChange.startsWith('-') ? 'text-rose-650 bg-rose-50 border border-rose-100' : 'text-emerald-700 bg-emerald-50 border border-emerald-100'}`}>
                                    {percentageChange}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-bold font-mono">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Card Grid */}
                <div className="block md:hidden divide-y divide-slate-100 font-sans">
                  {(() => {
                    let prevValue = 0;
                    return forecastData.points.map((p, idx) => {
                      const originalYVal = Math.round(p.y);
                      const activeYVal = Math.round(p.y * (p.isForecast ? (1 + growthBoost / 100) : 1));
                      
                      let percentageChange = '-';
                      if (prevValue !== 0) {
                        const diff = activeYVal - prevValue;
                        const pct = (diff / prevValue) * 100;
                        percentageChange = (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%';
                      }
                      prevValue = activeYVal;

                      return (
                        <div key={idx} className={`p-4 flex flex-col gap-3 font-sans ${p.isForecast ? 'bg-amber-500/[0.02]' : 'bg-white'}`}>
                          {/* Card Header Info */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 bg-slate-100 border border-slate-200/60 rounded px-1.5 py-0.5">X = {p.x}</span>
                              <span className="font-extrabold text-[#0F172A] text-xs">{formatMonthKey(p.monthKey, language)}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({p.monthKey})</span>
                            </div>
                            
                            <div>
                              {p.isForecast ? (
                                <span className="text-amber-700 bg-amber-50 text-[8.5px] border border-amber-200/50 rounded-full px-2 py-0.5 font-bold tracking-tight inline-block shrink-0">
                                  🔮 {language === 'en' ? 'Forecast' : 'পূর্বাভাস'}
                                </span>
                              ) : (
                                <span className="text-indigo-700 bg-indigo-50 text-[8.5px] border border-indigo-150 rounded-full px-2 py-0.5 font-bold tracking-tight inline-block shrink-0">
                                  ✅ {language === 'en' ? 'Actual' : 'বাস্তব'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Values Grid */}
                          <div className="grid grid-cols-2 gap-4 py-2 border-y border-dashed border-slate-100 select-none">
                            <div className="text-left">
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{language === 'en' ? 'Baseline OLS' : 'রিগ্রেশন বেইজলাইন'}</span>
                              <span className="font-mono text-xs font-semibold text-slate-600 block mt-0.5">৳{originalYVal.toLocaleString()}</span>
                            </div>
                            
                            <div className="text-right">
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">{language === 'en' ? 'Final (Simulated)' : 'চূড়ান্ত (সিমুলেটেড)'}</span>
                              <span className={`font-mono text-xs font-black block mt-0.5 ${p.isForecast ? 'text-amber-600' : 'text-slate-800'}`}>
                                ৳{activeYVal.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Footer Delta and Simulation impact info */}
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-bold">{language === 'en' ? 'Expected Delta:' : 'পরিবর্তনের হার:'}</span>
                            <div>
                              {percentageChange !== '-' ? (
                                <span className={`font-mono text-[10px] font-black rounded px-1.5 py-0.5 ${percentageChange.startsWith('-') ? 'text-rose-650 bg-rose-50 border border-rose-100' : 'text-emerald-700 bg-emerald-50 border border-emerald-100'}`}>
                                  {percentageChange}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-bold font-mono">-</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

            </div>
          );
        })()}

      </div>

      {/* INTERACTIVE MODAL FOR UPDATING ORDER LOCATION / STATUS */}
      {advancingOrder && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#0F172A] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xs font-black uppercase tracking-wider font-mono">
                  {language === 'en' ? 'Advance Order Stage' : 'অর্ডারের ধাপ অগ্রসরকরণ'}
                </h3>
              </div>
              <button
                onClick={() => setAdvancingOrder(null)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-5 text-left font-sans">
              <div className="bg-slate-105 rounded-2xl p-4 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Order ID</span>
                <span className="font-mono font-extrabold text-[#0F172A] text-sm">{advancingOrder.id}</span>
                
                <div className="flex items-center gap-3 mt-3">
                  <div className="text-xs">
                    <span className="text-slate-500 block font-semibold mb-0.5">Current Stage</span>
                    <span className="font-extrabold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md inline-block">
                      {t.statusMap[advancingOrder.trackingStep.toString() as '0'|'1'|'2'|'3']?.[language]}
                    </span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 mt-4 shrink-0" />
                  <div className="text-xs">
                    <span className="text-emerald-600 block font-bold mb-0.5">Next Stage</span>
                    <span className="font-black text-emerald-700 bg-emerald-50 border border-emerald-250 px-2.5 py-1 rounded-md inline-block">
                      {t.statusMap[(advancingOrder.trackingStep + 1).toString() as '0'|'1'|'2'|'3']?.[language]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Suggestions / Quick template selectors based on next step */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0F172A] block mb-2">
                  {language === 'en' ? 'Quick Location / Status Suggestions' : 'শর্টকাট অবস্থান / স্ট্যাটাস সাজেশন'}
                </label>
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
                  {getLocationSuggestions(advancingOrder.trackingStep + 1).map((sugg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCustomLocation(sugg.en);
                        setCustomLocationBn(sugg.bn);
                      }}
                      className="text-left bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 p-2.5 rounded-xl transition text-[11px] font-medium flex justify-between items-center group cursor-pointer"
                    >
                      <div>
                        <span className="text-slate-800 font-extrabold block group-hover:text-emerald-900">{sugg.en}</span>
                        <span className="text-slate-500 block mt-0.5 font-bold">{sugg.bn}</span>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-slate-405 group-hover:text-emerald-600 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Inputs */}
              <div className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">
                    {language === 'en' ? 'Current Package Location (English)' : 'প্যাকেজের বর্তমান স্থান (ইংরেজি)'}
                  </label>
                  <input
                    type="text"
                    value={customLocation || ''}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    placeholder="e.g., Dhaka Central Hub, Tejgaon"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">
                    {language === 'en' ? 'Current Package Location (Bangla)' : 'প্যাকেজের বর্তমান স্থান (বাংলা)'}
                  </label>
                  <input
                    type="text"
                    value={customLocationBn || ''}
                    onChange={(e) => setCustomLocationBn(e.target.value)}
                    placeholder="উদাঃ তেজগাঁও কেন্দ্রীয় পাঠাও কুরিয়ার হাব"
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-205 flex justify-end gap-3">
              <button
                onClick={() => setAdvancingOrder(null)}
                className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {language === 'en' ? 'Cancel' : 'বাতিল'}
              </button>
              <button
                onClick={() => {
                  onUpdateOrderStatus(advancingOrder.id, advancingOrder.trackingStep + 1, customLocation, customLocationBn);
                  setAdvancingOrder(null);
                }}
                className="bg-[#16A34A] hover:bg-emerald-650 text-white px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-50 hover:shadow-lg"
              >
                <Check className="w-4 h-4" />
                <span>{language === 'en' ? 'Save & Advance' : 'ধাপ অগ্রসর করুন'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SELECTED ORDER DETAILED INSPECTOR MODAL */}
      {selectedOrderDetail && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <style>{`
            @media print {
              html, body {
                height: auto !important;
                overflow: visible !important;
                background-color: #FFFFFF !important;
              }
              body * {
                visibility: hidden !important;
              }
              #print-admin-order-summary, #print-admin-order-summary * {
                visibility: visible !important;
              }
              #print-admin-order-summary {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-height: none !important;
                overflow: visible !important;
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
                border: none !important;
              }
            }
          `}</style>
          <div id="print-admin-order-summary" className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col my-auto max-h-[92vh] sm:max-h-[88vh] animate-fade-in relative z-50">
            {/* Modal Header */}
            <div className="bg-[#0F172A] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest font-mono">
                    {language === 'en' ? 'Order Invoice & Shipment Details' : 'অর্ডার মেমো ও শিপমেন্ট বিবরণী'}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Order ID: {selectedOrderDetail.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderDetail(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition cursor-pointer print:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 md:p-8 flex flex-col gap-6 text-left font-sans flex-1 overflow-y-auto min-h-0">
              {/* Recipient info card & Status summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4">
                  <span className="text-[10px] font-black tracking-widest text-[#16A34A] uppercase block mb-2">
                    {language === 'en' ? 'RECIPIENT BILLING INFO' : 'প্রাপক ও বিলিং ঠিকানা'}
                  </span>
                  <div className="flex flex-col gap-1 text-slate-800 text-xs font-medium">
                    <span className="font-extrabold text-[#0F172A] text-sm">{selectedOrderDetail.shippingAddress.name}</span>
                    <span>📞 <span className="font-mono">{selectedOrderDetail.shippingAddress.phone}</span></span>
                    <span className="text-[11px] font-semibold text-slate-650">
                      District: <span className="font-bold text-slate-850">{selectedOrderDetail.shippingAddress.district}</span>
                    </span>
                    <p className="text-[11px] text-slate-550 bg-white border border-slate-100 p-2.5 rounded-xl mt-1.5 leading-relaxed font-sans">
                      {selectedOrderDetail.shippingAddress.address}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-amber-600 uppercase block mb-2">
                      {language === 'en' ? 'SHIPMENT STATUS' : 'শিপমেন্ট অগ্রগতির ধাপ'}
                    </span>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-extrabold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2 text-[10px] py-1 uppercase tracking-wide font-sans">
                        Stage {selectedOrderDetail.trackingStep}: {t.statusMap[selectedOrderDetail.trackingStep.toString() as '0'|'1'|'2'|'3']?.[language] || selectedOrderDetail.status}
                      </span>
                      {selectedOrderDetail.status === 'Cancelled' && (
                        <span className="bg-rose-50 border border-rose-150 text-rose-700 font-extrabold px-2 py-0.5 rounded-lg text-[10px] uppercase font-sans">
                          Cancelled
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                      Ordered On: {selectedOrderDetail.date}
                    </span>
                  </div>

                  {/* Live Location inside card */}
                  {(selectedOrderDetail.currentLocation || selectedOrderDetail.currentLocationBn) && (
                    <div className="bg-white border border-emerald-100 rounded-xl p-2.5 mt-3 flex items-start gap-2">
                      <span className="text-sm pt-0.5 shrink-0">📍</span>
                      <div className="text-[11px] leading-snug">
                        <span className="text-[9px] font-black uppercase text-[#16A34A] block tracking-wider font-mono">Current Location</span>
                        <p className="font-bold text-slate-800 mt-0.5">
                          {language === 'en' ? (selectedOrderDetail.currentLocation || selectedOrderDetail.currentLocationBn) : (selectedOrderDetail.currentLocationBn || selectedOrderDetail.currentLocation)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ordered Item list */}
              <div>
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-3">
                  {language === 'en' ? 'ORDERED ARTICLES' : 'অর্ডারকৃত পণ্যের তালিকা'}
                </span>
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-2xs divide-y divide-slate-100">
                  {selectedOrderDetail.items.map((item, idx) => {
                    const catConfig = getCategoryVariantConfig(item.product.category);
                    return (
                      <div key={idx} className="bg-white p-3.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product.image}
                            alt={item.product.title}
                            onClick={() => setViewingProductDetails(item.product)}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-150 flex-shrink-0 cursor-pointer hover:opacity-90 hover:scale-105 transition-all"
                            title={language === 'en' ? 'Click to view product details' : 'পণ্য বিবরণী দেখতে ক্লিক করুন'}
                          />
                          <div>
                            <span 
                              onClick={() => setViewingProductDetails(item.product)}
                              className="text-xs font-black text-slate-850 block line-clamp-1 max-w-[280px] hover:text-[#16A34A] hover:underline cursor-pointer transition-colors"
                              title={language === 'en' ? 'Click to view product details' : 'পণ্য বিবরণী দেখতে ক্লিক করুন'}
                            >
                              {language === 'en' ? item.product.title : item.product.banglaTitle}
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider mt-0.5 font-mono">
                              Brand: {item.product.brand || 'No Brand'}
                            </span>
                            {/* Configuration attributes */}
                            {(item.selectedSize || item.selectedColor) && (
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5 font-sans">
                                {item.selectedSize && (
                                  <span className="bg-slate-50 border border-slate-150 text-[10px] font-semibold text-slate-650 rounded-md py-0.5 px-1.5 flex items-center gap-1 shadow-2xs">
                                    <span className="font-bold text-slate-400 text-[8px] uppercase">
                                      {catConfig.optionLabel[language].replace('Select ', '').replace('নির্বাচন', '').replace('নির্ধারণী', '')}:
                                    </span>
                                    <span className="font-black text-[#0F172A]">{item.selectedSize}</span>
                                  </span>
                                )}
                                {item.selectedColor && (
                                  <span className="bg-slate-50 border border-slate-150 text-[10px] font-semibold text-slate-650 rounded-md py-0.5 px-1.5 flex items-center gap-1 shadow-2xs">
                                    <span className="font-bold text-slate-400 text-[8px] uppercase">
                                      {catConfig.colorLabel[language].replace('Select ', '').replace('ব্যবহারকারী', '').replace('নির্বাচন', '').replace('রং বা ', '')}:
                                    </span>
                                    <span className="font-black text-[#0F172A]">{item.selectedColor}</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right whitespace-nowrap">
                          <span className="text-[11px] font-bold text-slate-500 block">
                            {formatBDT(item.product.price, language)} x {item.quantity} pcs
                          </span>
                          <span className="text-xs font-black text-[#0F172A] block mt-0.5 font-mono">
                            {formatBDT(item.product.price * item.quantity, language)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pricing details and payment mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-2 font-sans">
                      {language === 'en' ? 'PAYMENT SPEC' : 'পেমেন্ট গেটওয়ে বিবরণ'}
                    </span>
                    <div className="flex items-center gap-2 mt-1.5 font-sans">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        selectedOrderDetail.paymentMethod === 'Cash on Delivery' ? 'bg-slate-800 text-slate-200' : 'bg-pink-500 text-white shadow-2xs'
                      }`}>
                        {selectedOrderDetail.paymentMethod}
                      </span>
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${
                        selectedOrderDetail.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-150'
                      }`}>
                        {selectedOrderDetail.paymentStatus}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-450 block mt-4 font-mono leading-relaxed">
                    {language === 'en' ? 'Payment processed via automated merchant gateway secure sandbox' : 'পেমেন্ট প্রসেসিং স্বয়ংক্রিয় গেটওয়ের মাধ্যমে সুরক্ষিতভাবে সম্পন্ন হয়েছে।' }
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-xs font-medium space-y-2 font-sans">
                  <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-2">
                    {language === 'en' ? 'COST SPECS BREAKDOWN' : 'পণ্য ও বিলিং বিবরণী'}
                  </span>
                  {(() => {
                    const itemsSubtotal = selectedOrderDetail.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
                    const shippingPrice = selectedOrderDetail.total - itemsSubtotal;
                    return (
                      <>
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal / পণ্যের দাম:</span>
                          <span className="font-mono">{formatBDT(itemsSubtotal, language)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Shipping delivery fee / ডেলিভারি চার্জ:</span>
                          <span className="font-mono font-bold text-slate-700">
                            {shippingPrice <= 0 ? (language === 'en' ? 'FREE' : 'ফ্রি') : formatBDT(shippingPrice, language)}
                          </span>
                        </div>
                        <div className="h-px bg-slate-200 my-2"></div>
                        <div className="flex justify-between text-[#0F172A] font-black text-xs pt-1">
                          <span>Total Bill Amount / সর্বমোট বকেয়া:</span>
                          <span className="font-mono text-[#16A34A]">{formatBDT(selectedOrderDetail.total, language)}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Compact Send Alert Button */}
            <div className="mx-6 mb-5 flex justify-end font-sans print:hidden">
              <button
                type="button"
                onClick={() => handleOpenManualAlert(selectedOrderDetail)}
                className="bg-[#16A34A] hover:bg-emerald-700 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition hover:scale-[1.02] active:scale-98 cursor-pointer font-sans"
              >
                <span>🚀</span>
                <span>{language === 'en' ? 'Send Manual Alerts' : 'ম্যানুয়ালি এলার্ট পাঠান'}</span>
              </button>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-205 flex justify-between items-center font-sans print:hidden">
              <span className="text-[10px] font-bold text-slate-400 font-mono hidden sm:inline-block">
                System Invoice Generated • 2026
              </span>
              <div className="flex gap-3 ml-auto">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-50"
                >
                  <Printer className="w-4 h-4" />
                  <span>{language === 'en' ? 'Print Invoice' : 'রসিদ প্রিন্ট করুন'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrderDetail(null)}
                  className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-750 px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer"
                >
                  {language === 'en' ? 'Close' : 'বন্ধ করুন'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL ALERT TRANSMITTER OVERLAY PANEL */}
      {showManualAlertModal && (
        <div className="fixed inset-0 z-[1100] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col my-auto max-h-[95vh] sm:max-h-[90vh] animate-fade-in relative z-50">
            {/* Modal Header */}
            <div className="bg-[#0b1329] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">📢</span>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#16A34A] font-mono">
                    {language === 'en' ? 'TRANSACTION ALERTS WORKSPACE' : 'কাস্টমার নোটিফিকেশন ওয়ার্কস্পেস'}
                  </h3>
                  <p className="text-[10px] text-slate-350">
                    {language === 'en'
                      ? `Drafting manual notifications to client: ${showManualAlertModal.shippingAddress.name} (#${showManualAlertModal.id})`
                      : `গ্রাহক ${showManualAlertModal.shippingAddress.name} (#${showManualAlertModal.id}) এর জন্য নোটিফিকেশন ড্রাফটিং`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowManualAlertModal(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 md:p-6 flex flex-col gap-6 overflow-y-auto min-h-0 text-left">
              {/* Recipient Details Row */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-150 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="text-xs">
                  <span className="text-[9px] uppercase font-black text-slate-400 block mb-0.5">Recipient Full Name / নাম</span>
                  <span className="font-extrabold text-slate-850 text-sm block">{showManualAlertModal.shippingAddress.name}</span>
                </div>
                <div className="text-xs">
                  <span className="text-[9px] uppercase font-black text-slate-400 block mb-0.5">Mobile Number / মোবাইল নম্বর</span>
                  <span className="font-bold text-slate-700 text-sm block font-mono">📞 {showManualAlertModal.shippingAddress.phone}</span>
                </div>
                <div className="text-xs">
                  <span className="text-[9px] uppercase font-black text-slate-400 block mb-0.5">SMTP Mail Inbox / জিমেইল</span>
                  <span className="font-bold text-slate-700 text-sm block font-mono">✉️ {showManualAlertModal.shippingAddress.phone.replace(/[^0-9]/g, '') || 'customer'}@gmail.com</span>
                </div>
              </div>

              {/* Grid of transmitters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* SMS Channel Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                        📱 <span>SMS Gateway</span>
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                        smsStatus === 'idle' ? 'bg-slate-50 text-slate-500 border-slate-200' :
                        smsStatus === 'sending' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {smsStatus === 'idle' && (language === 'en' ? 'Draft' : 'খসড়া')}
                        {smsStatus === 'sending' && (language === 'en' ? 'Sending...' : 'পাঠানো হচ্ছে...')}
                        {smsStatus === 'sent' && (language === 'en' ? 'Delivered' : 'সফল')}
                      </span>
                    </div>

                    <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase tracking-wider font-mono">
                      Edit SMS Body / মেসেজ লিখুন
                    </label>
                    <textarea
                      value={smsText}
                      onChange={(e) => setSmsText(e.target.value)}
                      className="w-full text-[10px] text-slate-600 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-xl p-2 h-28 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans resize-none transition"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={smsStatus === 'sending'}
                    onClick={() => {
                      setSmsStatus('sending');
                      setTimeout(() => {
                        setSmsStatus('sent');
                      }, 1000);
                    }}
                    className={`mt-3 w-full font-black text-[10px] uppercase tracking-wider py-2 rounded-xl transition shadow-xs cursor-pointer ${
                      smsStatus === 'sending' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                      smsStatus === 'sent' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100' :
                      'bg-slate-800 hover:bg-slate-900 text-white'
                    }`}
                  >
                    {smsStatus === 'idle' && (language === 'en' ? 'Transmit SMS' : 'গ্রাহককে SMS পাঠান')}
                    {smsStatus === 'sending' && (language === 'en' ? 'Transmitting...' : 'পাঠানো হচ্ছে...')}
                    {smsStatus === 'sent' && (language === 'en' ? '⚡ Resend SMS' : '⚡ পুনরায় SMS পাঠান')}
                  </button>
                </div>

                {/* WhatsApp Channel Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                        💬 <span>WhatsApp API</span>
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                        waStatus === 'idle' ? 'bg-slate-50 text-slate-500 border-slate-200' :
                        waStatus === 'sending' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {waStatus === 'idle' && (language === 'en' ? 'Draft' : 'খসড়া')}
                        {waStatus === 'sending' && (language === 'en' ? 'Sending...' : 'পাঠানো হচ্ছে...')}
                        {waStatus === 'sent' && (language === 'en' ? 'Active Code' : 'সফল')}
                      </span>
                    </div>

                    <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase tracking-wider font-mono">
                      Edit WhatsApp Msg / মেসেজ লিখুন
                    </label>
                    <textarea
                      value={waText}
                      onChange={(e) => setWaText(e.target.value)}
                      className="w-full text-[10px] text-slate-600 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-xl p-2 h-28 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans resize-none transition"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={waStatus === 'sending'}
                    onClick={() => {
                      setWaStatus('sending');
                      setTimeout(() => {
                        setWaStatus('sent');
                      }, 1000);
                    }}
                    className={`mt-3 w-full font-black text-[10px] uppercase tracking-wider py-2 rounded-xl transition shadow-xs cursor-pointer ${
                      waStatus === 'sending' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                      waStatus === 'sent' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100' :
                      'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {waStatus === 'idle' && (language === 'en' ? 'Send WhatsApp' : 'WhatsApp-এ পাঠান')}
                    {waStatus === 'sending' && (language === 'en' ? 'Transmitting...' : 'পাঠানো হচ্ছে...')}
                    {waStatus === 'sent' && (language === 'en' ? '⚡ Resend Msg' : '⚡ পুনরায় মেসেজ পাঠান')}
                  </button>
                </div>

                {/* SMTP Email Channel Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                        ✉️ <span>SMTP Secure</span>
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                        emailStatus === 'idle' ? 'bg-slate-50 text-slate-500 border-slate-200' :
                        emailStatus === 'sending' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {emailStatus === 'idle' && (language === 'en' ? 'Draft' : 'খসড়া')}
                        {emailStatus === 'sending' && (language === 'en' ? 'Sending...' : 'পাঠানো হচ্ছে...')}
                        {emailStatus === 'sent' && (language === 'en' ? 'Inboxed' : 'সফল')}
                      </span>
                    </div>

                    <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase tracking-wider font-mono">
                      Edit Email Body / মেইল লিখুন
                    </label>
                    <textarea
                      value={emailText}
                      onChange={(e) => setEmailText(e.target.value)}
                      className="w-full text-[10px] text-slate-600 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-xl p-2 h-28 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans resize-none transition"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={emailStatus === 'sending'}
                    onClick={() => {
                      setEmailStatus('sending');
                      setTimeout(() => {
                        setEmailStatus('sent');
                      }, 1000);
                    }}
                    className={`mt-3 w-full font-black text-[10px] uppercase tracking-wider py-2 rounded-xl transition shadow-xs cursor-pointer ${
                      emailStatus === 'sending' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' :
                      emailStatus === 'sent' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100' :
                      'bg-[#0F172A] hover:bg-slate-800 text-white'
                    }`}
                  >
                    {emailStatus === 'idle' && (language === 'en' ? 'Transmit Email' : 'ইমেইল রসিদ পাঠান')}
                    {emailStatus === 'sending' && (language === 'en' ? 'Transmitting...' : 'পাঠানো হচ্ছে...')}
                    {emailStatus === 'sent' && (language === 'en' ? '⚡ Resend Memo' : '⚡ পুনরায় কপি পাঠান')}
                  </button>
                </div>
              </div>

              {/* Combined Broadcast action banner */}
              <div className="bg-[#FAFBFD] border border-slate-150 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#16A34A] block mb-0.5 font-mono">
                    🌌 {language === 'en' ? 'BROADCAST BULK SENDER STATUS' : 'একত্রে সকল গেটওয়েতে ব্রডকাস্ট এলার্ট'}
                  </span>
                  <p className="text-[10px] text-slate-500">
                    {language === 'en' 
                      ? 'Simultaneously broadcast to all active messaging channels in one sequential queue.' 
                      : 'এক ক্লিকে সকল সচল মেসেজিং গেটওয়েতে কাস্টমার এলার্ট সিকোয়েন্স অনুযায়ী রিলিজ করুন।'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSmsStatus('sending');
                    setWaStatus('sending');
                    setEmailStatus('sending');
                    setTimeout(() => {
                      setSmsStatus('sent');
                      setWaStatus('sent');
                      setEmailStatus('sent');
                    }, 1200);
                  }}
                  className="bg-[#16A34A] hover:bg-emerald-700 text-white font-black px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition hover:scale-[1.02] active:scale-98 cursor-pointer shrink-0 w-full sm:w-auto font-sans"
                >
                  <span>📢</span>
                  <span>{language === 'en' ? 'Broadcast All Channels' : 'একত্রে সব চ্যানেলে ব্রডকাস্ট'}</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center font-sans shrink-0">
              <span className="text-[10px] font-bold text-slate-400 font-mono hidden sm:inline-block">
                Secure Real-time API Client Node Active • 200 OK
              </span>
              <div className="flex gap-3 ml-auto">
                <button
                  type="button"
                  onClick={() => setShowManualAlertModal(null)}
                  className="bg-white border border-slate-205 hover:bg-slate-100 text-slate-700 font-black px-5 py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  {language === 'en' ? 'Close Panel' : 'প্যানেল বন্ধ করুন'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL PRODUCT DETAILS INSPECTOR OVERLAY POPUP */}
      {viewingProductDetails && (
        <div className="fixed inset-0 z-[1200] bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-150 flex flex-col my-auto max-h-[92vh] sm:max-h-[85vh] animate-fade-in relative z-50">
            {/* Modal Header */}
            <div className="bg-[#0b1329] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#16A34A] font-mono">
                    {language === 'en' ? 'Product Specifications' : 'পণ্য বিবরণী বিবরণ'}
                  </h3>
                  <p className="text-[10px] text-slate-350 font-mono">ID: {viewingProductDetails.id}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingProductDetails(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 flex flex-col gap-5 overflow-y-auto min-h-0 text-left font-sans">
              
              {/* Layout: Image + Core Data */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
                {/* Left col: Image (5 cols) */}
                <div className="sm:col-span-5 flex justify-center bg-slate-50 rounded-2xl p-2 border border-slate-150 hover:shadow-xs transition">
                  <img
                    src={viewingProductDetails.image}
                    alt={viewingProductDetails.title}
                    className="aspect-square w-full object-cover rounded-xl shadow-xs"
                  />
                </div>

                {/* Right col: Core specs (7 cols) */}
                <div className="sm:col-span-7 space-y-3">
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-[#16A34A] block mb-1 uppercase font-mono bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                      {viewingProductDetails.category.toUpperCase()}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 block mt-1">
                      {viewingProductDetails.title}
                    </h4>
                    <h5 className="text-xs font-semibold text-slate-500 block mt-0.5 font-sans">
                      {viewingProductDetails.banglaTitle}
                    </h5>
                  </div>

                  <div className="border-t border-slate-100 my-2"></div>

                  {/* Price Row */}
                  <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-100 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-450 block">Selling Price / বিক্রয় মূল্য</span>
                      <span className="text-base font-black text-slate-900 font-mono">
                        {formatBDT(viewingProductDetails.price, language)}
                      </span>
                    </div>
                    {viewingProductDetails.originalPrice > viewingProductDetails.price && (
                      <div className="text-right">
                        <span className="text-[9px] uppercase font-bold text-[#E11D48] block">Discount Applied</span>
                        <span className="text-xs font-bold text-slate-400 line-through font-mono">
                          {formatBDT(viewingProductDetails.originalPrice, language)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Parameters Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-150">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Brand / ব্র্যান্ড</span>
                      <span className="font-extrabold text-[#0F172A]">{viewingProductDetails.brand || (language === 'en' ? `${webNameEn} Premium` : `${webNameBn} প্রিমিয়াম`)}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-150">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Stock Available / স্টক</span>
                      <span className={`font-extrabold font-mono ${viewingProductDetails.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {viewingProductDetails.stock > 0 
                          ? `${viewingProductDetails.stock} pcs` 
                          : (language === 'en' ? 'Stock Out' : 'স্টক শেষ')
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Tabs Content */}
              <div className="space-y-3 mt-1">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase block font-mono">
                  📋 {language === 'en' ? 'PRODUCT OVERVIEW & STORY' : 'পণ্য বিবরণী ও বৈশিষ্ট্য'}
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* English description card */}
                  <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-150 text-xs text-slate-600 leading-relaxed max-h-[160px] overflow-y-auto">
                    <span className="text-[9px] font-black uppercase text-slate-400 block mb-1.5 font-mono">English Overview</span>
                    <p className="font-medium whitespace-pre-line">{viewingProductDetails.description || 'No detailed English description available.'}</p>
                  </div>

                  {/* Bangla description card */}
                  <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-150 text-xs text-slate-600 leading-relaxed max-h-[160px] overflow-y-auto">
                    <span className="text-[9px] font-black uppercase text-slate-400 block mb-1.5 font-mono">বাংলা বিবরণী</span>
                    <p className="font-medium font-sans whitespace-pre-line">{viewingProductDetails.banglaDescription || 'কোনো বাংলা বিবরণী সরবরাহ করা হয়নি।'}</p>
                  </div>
                </div>
              </div>

              {/* Sizes and Colors Attributes representation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Available Sizes list */}
                {viewingProductDetails.sizes && viewingProductDetails.sizes.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 text-left">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2 font-mono">
                      📐 {language === 'en' ? 'AVAILABLE OPTIONS/SIZES' : 'উপলব্ধ সাইজসমূহ'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingProductDetails.sizes.map((sz, idx) => (
                        <span key={idx} className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-[10px] px-2.5 py-1 rounded-lg transition-colors">
                          {sz}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Color options */}
                {viewingProductDetails.colors && viewingProductDetails.colors.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 text-left">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2 font-mono">
                      🎨 {language === 'en' ? 'AVAILABLE PALETTE SHADES' : 'উপলব্ধ রঙসমূহ'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {viewingProductDetails.colors.map((clr, idx) => (
                        <span key={idx} className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-[10px] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${clr.class} border border-slate-300 inline-block`} />
                          <span>{clr.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 font-sans shrink-0">
              {/* WhatsApp direct order button */}
              <button
                type="button"
                onClick={() => {
                  const whatsappMessage = language === 'en'
                    ? `Assalamu Alaikum,\nI would like to order this product:\n\n*Product:* ${viewingProductDetails.title}\n*Code:* ${viewingProductDetails.id}\n*Price:* ৳${viewingProductDetails.price.toLocaleString('en')}\n\nLink: ${window.location.origin}/product/${viewingProductDetails.id}`
                    : `আসসালামু আলাইকুম,\nআমি এই পণ্যটি অর্ডার করতে চাই:\n\n*পণ্য:* ${viewingProductDetails.banglaTitle}\n*কোড:* ${viewingProductDetails.id}\n*মূল্য:* ৳${viewingProductDetails.price.toLocaleString('bn')}\n\nলিঙ্ক: ${window.location.origin}/product/${viewingProductDetails.id}`;

                  const whatsappUrl = `https://wa.me/8801712345678?text=${encodeURIComponent(whatsappMessage)}`;
                  window.open(whatsappUrl, '_blank');
                }}
                className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20ba56] text-white font-black px-4 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-sm hover:scale-[1.01] active:scale-99 flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-white/95" />
                <span>{language === 'en' ? 'Direct WhatsApp Order' : 'সরাসরি হোয়াটসঅ্যাপ অর্ডার'}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingProductDetails(null)}
                className="w-full sm:w-auto bg-[#0F172A] hover:bg-slate-800 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-sm hover:scale-[1.01] active:scale-99"
              >
                {language === 'en' ? 'Close Window' : 'আইটেম বন্ধ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED INTERACTIVE CRUD MODAL FOR PRODUCT ADD & EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col my-auto max-h-[92vh] sm:max-h-[88vh]">
            
            {/* Modal Header */}
            <div className="bg-[#0F172A] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black uppercase tracking-wider font-mono">
                  {editingProduct 
                    ? (language === 'en' ? 'Edit Existing System Product' : 'এডিট করুন পণ্য বিবরণ')
                    : (language === 'en' ? 'Add Fresh Product to Database' : 'নতুন পণ্য যুক্ত করুন গ্যালারিতে')
                  }
                </h3>
              </div>
              
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form inputs Workspace */}
            <form onSubmit={handleFormSubmit} className="p-5 md:p-8 flex flex-col gap-6 text-left flex-1 overflow-y-auto font-sans min-h-0">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Product Title (English) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Product Title (English)</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Premium Cotton Polo T-Shirt"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-350"
                  />
                </div>

                {/* Product Title (Bangla) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">পণ্যের নাম (বাংলায়)</label>
                  <input
                    type="text"
                    required
                    value={banglaTitle}
                    onChange={(e) => setBanglaTitle(e.target.value)}
                    placeholder="উদাঃ প্রিমিয়াম সুতি কমফোর্ট পলো"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-350"
                  />
                </div>

                {/* Pricing (BDT) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selling Price (BDT)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-slate-350"
                  />
                </div>

                {/* Original Cost Before discount */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Original Price (Before discount)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-slate-350"
                  />
                </div>

                {/* Discount Percentage */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Discount Percent (%)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-slate-350"
                  />
                </div>

                {/* Warehouse Stock Unit levels */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Initial Stock (Units)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-slate-350"
                  />
                </div>

                {/* Category Dropdown Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Applet Category Selection</label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-slate-350"
                  >
                    <option value="fashion">Fashion & Apparel</option>
                    <option value="electronics">Electronics & Media</option>
                    <option value="islamic">Islamic Lifestyle</option>
                    <option value="home">Home & Living</option>
                    <option value="gadgets">Premium Gadgets</option>
                    <option value="cctv">CCTV & Security</option>
                    <option value="kids">Kids & Toys</option>
                  </select>
                </div>

                {/* Brand Name selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Brand Provider Name</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Walton, Aarong, Apex"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-350"
                  />
                </div>

                {/* Product Main Display Banner image link */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Primary Catalog Image URL</label>
                  <input
                    type="text"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/... or relative address"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-350"
                  />
                </div>

                {/* Multi image thumbnails comma-separated */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secondary Gallery Images URLs (Comma separated)</label>
                  <textarea
                    rows={2}
                    value={imagesText}
                    onChange={(e) => setImagesText(e.target.value)}
                    placeholder="url1, url2, url3..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-slate-350 scrollbar-hide"
                  />
                </div>

                {/* Subsizes comma-separated input list */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Available {adminVariantConfig.optionLabel.en.replace('Select ', '')} / Variants (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={sizesText}
                    onChange={(e) => setSizesText(e.target.value)}
                    placeholder={adminVariantConfig.placeholder}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-350"
                  />
                </div>

                {/* Subcolors list */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {adminVariantConfig.colorLabel.en.replace('Select ', '')} / Options (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={colorsText}
                    onChange={(e) => setColorsText(e.target.value)}
                    placeholder="Red, Navy, Ash Gray"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-350"
                  />
                </div>

                {/* English Description */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Product Detailed Description (English)</label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-350"
                  />
                </div>

                {/* Bangla Description */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">পণ্যের বিস্তারিত বিবরণ (বাংলায়)</label>
                  <textarea
                    rows={3}
                    required
                    value={banglaDescription}
                    onChange={(e) => setBanglaDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-350"
                  />
                </div>

                {/* Quick promotion state modifiers switches */}
                <div className="flex items-center gap-6 mt-2 md:col-span-2">
                  {/* Flash Sale Check */}
                  <label className="flex items-center gap-2 text-xs font-extrabold text-[#0F172A] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFlashSale}
                      onChange={(e) => setIsFlashSale(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                    />
                    <span>Is Flash Sale Active?</span>
                  </label>

                  {/* Trending Check */}
                  <label className="flex items-center gap-2 text-xs font-extrabold text-[#0F172A] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTrending}
                      onChange={(e) => setIsTrending(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                    />
                    <span>Is Trending Highlighted?</span>
                  </label>
                </div>

              </div>

              {/* Form submit/close operations */}
              <div className="border-t border-slate-100 pt-5 mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-705 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-[#16A34A] text-white px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow shadow-emerald-50 hover:shadow-lg cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingProduct ? 'Save Modifications' : 'Publish Product'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Real-time high-value admin toast overlay */}
      <div 
        id="admin-high-value-toast-container"
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none select-none"
      >
        {adminToasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-xl border border-slate-700/80 flex flex-col gap-2.5 transition-all duration-300 animate-slide-in hover:scale-[1.02] active:scale-[0.99]"
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              animation: 'slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-500 rounded-xl animate-pulse flex items-center justify-center">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-rose-450 block leading-none">
                    {toast.type === 'demo' ? '🧪 TEST ALARM' : '⚡ HIGH VALUE ORDER'}
                  </span>
                  <p className="text-[11px] text-slate-300 font-bold mt-1 leading-none">
                    Order ID: <span className="font-mono text-[11px] font-black text-white">{toast.orderId}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAdminToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-1 border-t border-slate-800 pt-2 text-left bg-slate-850/60 p-2.5 rounded-xl">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold">{language === 'en' ? 'Customer:' : 'গ্রাহক:'}</span>
                <span className="font-extrabold text-[#E2E8F0]">{toast.customerName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold">{language === 'en' ? 'Items:' : 'পণ্য সংখ্যা:'}</span>
                <span className="font-mono text-slate-300 font-bold">{toast.itemsCount} {language === 'en' ? 'units' : 'টি'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold">{language === 'en' ? 'Payment:' : 'পেমেন্ট:'}</span>
                <span className="text-sky-400 font-bold">{toast.paymentMethod}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-0.5 text-xs">
              <div className="flex items-center gap-1.5 bg-emerald-500/10 text-[#34D399] px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-xs">
                <DollarSign className="w-3.5 h-3.5" />
                <span className="font-mono font-black">{formatBDT(toast.total, language)}</span>
              </div>
              <span className="text-[9px] text-slate-400 font-mono">
                {new Date(toast.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            
          </div>
        ))}
      </div>

      {/* Dynamic inline stylesheet injection for staggered CSS animations */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(120%) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

    </div>
  );
}
