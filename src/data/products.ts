import { Product, Review } from '../types';

export const categoriesList = [
  { id: 'fashion', name: { en: 'Fashion & Apparel', bn: 'ফ্যাশন ও লাইফস্টাইল' }, icon: 'Shirt' },
  { id: 'electronics', name: { en: 'Electronics & Media', bn: 'ইলেকট্রনিক্স ও মিডিয়া' }, icon: 'Laptop' },
  { id: 'islamic', name: { en: 'Islamic Lifestyle', bn: 'ইসলামিক লাইফস্টাইল' }, icon: 'BookOpen' },
  { id: 'home', name: { en: 'Home & Living', bn: 'হোম অ্যান্ড লিভিং' }, icon: 'Home' },
  { id: 'gadgets', name: { en: 'Premium Gadgets', bn: 'প্রিমিয়াম গ্যাজেট' }, icon: 'Smartphone' },
  { id: 'cctv', name: { en: 'CCTV & Security', bn: 'সিসিটিভি ও নিরাপত্তা' }, icon: 'ShieldCheck' },
  { id: 'kids', name: { en: 'Kids & Toys', bn: 'বাচ্চাদের খেলনা ও যত্ন' }, icon: 'Baby' },
];

export const featuredBrands = [
  { id: 'apex', name: 'Apex Leather', logo: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=200&auto=format&fit=crop' },
  { id: 'aarong', name: 'Aarong Handkraft', logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=200&auto=format&fit=crop' },
  { id: 'walton', name: 'Walton Prime', logo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=200&auto=format&fit=crop' },
  { id: 'jamuna', name: 'Jamuna Life', logo: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=200&auto=format&fit=crop' },
  { id: 'mi-bd', name: 'Xiaomi Bangladesh', logo: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=200&auto=format&fit=crop' },
  { id: 'phulkari', name: 'Phulkari Premium', logo: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=200&auto=format&fit=crop' }
];

export const initialProducts: Product[] = [
  {
    id: 'f1',
    title: 'Heritage Rajshahi Silk Embroidered Panjabi',
    banglaTitle: 'ঐতিহ্যবাহী রাজশাহী সিল্ক এমব্রয়ডারি পাঞ্জাবি',
    category: 'fashion',
    price: 4850,
    originalPrice: 6500,
    discount: 25,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop', // Royal ethnic attire
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1608748010899-18f300247112?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.8,
    reviewsCount: 142,
    stock: 24,
    sold: 185,
    isFlashSale: true,
    isTrending: true,
    brand: 'Aarong Handkraft',
    description: 'A premium-quality Rajshahi Silk Panjabi featuring elite hand-embroidery around the collar and placket. Perfect for Eid, wedding receptions, and elite cultural gatherings in Bangladesh.',
    banglaDescription: 'কলার ও প্লাকেটে সূক্ষ্ম হাতের কাজ করা প্রিমিয়াম রাজশাহী সিল্কের রাজকীয় পাঞ্জাবি। ঈদ, বিয়ের অনুষ্ঠান এবং বিশেষ সামাজিক উৎসবের জন্য সেরা পছন্দ।',
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Royal Ivory', class: 'bg-[#FDFBF7]' },
      { name: 'Midnight Navy', class: 'bg-[#0F172A]' },
      { name: 'Forest Teal', class: 'bg-[#0D9488]' }
    ],
    specifications: {
      'Fabric Material': 'Rajshahi Mulberry Silk (80%) & Cotton Blend (20%)',
      'Embroidery Type': 'Hand Zardozi with Silk Threads',
      'Fit Cut': 'Regular Classic Fit',
      'Care Instructions': 'Dry cleaning recommended'
    },
    banglaSpecifications: {
      'কাপড়ের ধরন': 'রাজশাহী তুঁত সিল্ক (৮০%) ও কটন ব্লেন্ড (২০%)',
      'সূচিশিল্পের ধরন': 'রেশম সুতা দিয়ে হাতে জারদৌসি',
      'ফিটিং': 'রেগুলার ক্লাসিক ফিট',
      'যত্ন নির্দেশিকা': 'শুধুমাত্র ড্রাই ক্লিন'
    }
  },
  {
    id: 'f2',
    title: 'Premium Handloom Tangail Jamdani Weave Saree',
    banglaTitle: 'হস্তচালিত তাঁতের প্রিমিয়াম টাঙ্গাইল জামদানি শাড়ি',
    category: 'fashion',
    price: 12500,
    originalPrice: 15800,
    discount: 21,
    image: 'https://images.unsplash.com/photo-1610030470298-408a0d9eef58?q=80&w=600&auto=format&fit=crop', // Beautiful elegant traditional saree
    images: [
      'https://images.unsplash.com/photo-1610030470298-408a0d9eef58?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583391265517-35bbadd01209?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1561053720-76cd73ff22c3?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.9,
    reviewsCount: 89,
    stock: 8,
    sold: 45,
    isFlashSale: false,
    isTrending: true,
    brand: 'Phulkari Premium',
    description: 'Exquisitely woven by master artisans in Tangail. Stitched with pure gold zari threads and super fine combed cotton block details. Represents the luxury heritage of Bangladesh.',
    banglaDescription: 'টাঙ্গাইলের দক্ষ কারিগরদের বোনা এক্সক্লুসিভ সুতি জামদানি শাড়ি। খাঁটি সোনা রঙের জরি সুতা ও সুপার ফাইন কম্বড কটন দিয়ে বোনা। বাঙালি ঐতিহ্য ও আভিজাত্যের প্রতীক।',
    sizes: ['Standard 5.5 Yards'],
    colors: [
      { name: 'Crimson Red', class: 'bg-[#E11D48]' },
      { name: 'Marigold Gold', class: 'bg-[#F59E0B]' },
      { name: 'Emerald Emerald', class: 'bg-[#059669]' }
    ],
    specifications: {
      'Weave Count': '80/80 Combed Soft Thread',
      'Zari Work': 'Premium Golden Lurex',
      'Total Length': '5.5 meters (including blouse piece)',
      'Origin': 'Tangail, Bangladesh'
    },
    banglaSpecifications: {
      'সুতার কাউন্ট': '৮০/৮০ কম্বড নরম সুতা',
      'জরি সুতা': 'প্রিমিয়াম সোনালী লাউরেক্স',
      'মোট দৈর্ঘ্য': '৫.৫ মিটার (ব্লাউজ পিসসহ)',
      'উৎপত্তি': 'টাঙ্গাইল, বাংলাদেশ'
    }
  },
  {
    id: 'e1',
    title: 'Aura Pro AMOLED Bluetooth Calling Smartwatch',
    banglaTitle: 'অরা প্রো অ্যামোলেড ব্লুটুথ কলিং স্মার্টওয়াচ',
    category: 'electronics',
    price: 3290,
    originalPrice: 5500,
    discount: 40,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=600&auto=format&fit=crop', // Smart watch showing interface
    images: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517502884422-41eaaced0168?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.7,
    reviewsCount: 236,
    stock: 55,
    sold: 412,
    isFlashSale: true,
    isTrending: true,
    brand: 'Xiaomi Bangladesh',
    description: 'An advanced smartwatch designed for modern Bangladeshis. Active Bluetooth calling, SpO2 fitness tracking, Bangla UI & notification support, and up to 10 days of solid battery life.',
    banglaDescription: 'আধুনিক বাংলাদেশীদের জন্য উন্নত স্মার্টওয়াচ। সরাসরি ব্লুটুথ কলিং সুবিধা, রিদমিক হেলথ ট্র্যাকিং, সম্পূর্ণ বাংলা ইউজার ইন্টারফেস সাপোর্ট এবং ১০ দিনের দীর্ঘ ব্যাটারি লাইফ।',
    sizes: ['Regular 46mm'],
    colors: [
      { name: 'Space Gray', class: 'bg-[#4B5563]' },
      { name: 'Carbon Black', class: 'bg-[#1F2937]' }
    ],
    specifications: {
      'Screen Size': '1.43 inch Always-on AMOLED Display',
      'Waterproof Standard': 'IP68 Certified Dust & Splash',
      'Bangla Support': 'Yes (Full Font and notifications)',
      'Battery Power': '380mAh Lithium-Polymer'
    },
    banglaSpecifications: {
      'স্ক্রিনের সাইজ': '১.৪৩ ইঞ্চি অলওয়েজ-অন অ্যামোলেড ডিসপ্লে',
      'ওয়াটারপ্রুফ রেটিং': 'IP68 সার্টিফাইড ডাস্ট ও স্প্ল্যাশপ্রুফ',
      'বাংলা সাপোর্ট': 'হ্যাঁ (সম্পূর্ণ বাংলা ফন্ট ও নোটিফিকেশন)',
      'ব্যাটারি ক্ষমতা': '৩৮০mAh লিথিয়াম-পলিমার'
    }
  },
  {
    id: 'e2',
    title: 'SonicBlast H7 Noise-Cancelling Wireless Headphones',
    banglaTitle: 'সনিকব্লাস্ট এইচ৭ নয়েজ-ক্যান্সেলিং ওয়্যারলেস হেডফোন',
    category: 'electronics',
    price: 4500,
    originalPrice: 6500,
    discount: 31,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop', // Premium headphones
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.6,
    reviewsCount: 95,
    stock: 15,
    sold: 110,
    isFlashSale: false,
    isTrending: false,
    brand: 'Walton Prime',
    description: 'Experience pure sonic performance with 40dB Active Noise Cancellation. Made with sweatproof ergonomic ear cushions perfect for humid Bangladeshi summers.',
    banglaDescription: '৪০dB অ্যাক্টিভ নয়েজ ক্যান্সেলেশন সহ নিখুঁত সাউন্ড স্পেকট্রাম উপভোগ করুন। বাংলাদেশের গরম ও আর্দ্র আবহাওয়ার জন্য উপযুক্ত ঘাম-প্রতিরোধী কুশন দিয়ে তৈরি।',
    sizes: ['Adjustable Strap'],
    colors: [
      { name: 'Matte Matte Charcoal', class: 'bg-[#1E293B]' },
      { name: 'Arctic Platinum', class: 'bg-[#E2E8F0]' }
    ],
    specifications: {
      'Noise Cancellation': 'Active Hybrid ANC up to 40dB',
      'Driver Unit': '40mm Neodymium dynamic drivers',
      'Playtime Life': 'Up to 45 hours (ANC OFF)',
      'Bluetooth Core': 'v5.3 Low Latency 38ms'
    },
    banglaSpecifications: {
      'নয়েজ অ্যাক্টিভেশন': 'অ্যাক্টিভ হাইব্রিড ANC (৪০dB পর্যন্ত)',
      'ড্রাইভার ইউনিট': '৪০মিমি নিওডাইমিয়াম ডায়নামিক',
      'প্লে-ব্যাক সময়': '৪৫ ঘণ্টা পর্যন্ত (ANC বন্ধ থাকলে)',
      'ব্লুটুথ সংস্করণ': 'v৫.৩ লো-লেটেন্সি (৩৮ms)'
    }
  },
  {
    id: 'i1',
    title: 'Royal Kaaba Black Stone Premium Attar Roller',
    banglaTitle: 'রয়্যাল কাবা ব্ল্যাক স্টোন প্রিমিয়াম আতর রোলার',
    category: 'islamic',
    price: 1450,
    originalPrice: 2200,
    discount: 34,
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=600&auto=format&fit=crop', // Elegant luxury perfume bottle
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1528740561666-ac2479603f2d?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.9,
    reviewsCount: 312,
    stock: 40,
    sold: 920,
    isFlashSale: true,
    isTrending: true,
    brand: 'Deen Essentials',
    description: 'An elite non-alcoholic fragrance reminiscent of the direct fragrance of Al-Kaaba Kiswah. Features rich notes of Oudh (agarwood), Amber, and royal Taif Rose. Long-lasting for up to 48 hours.',
    banglaDescription: 'কাবা শরীফের গিলাফের পবিত্র ও সুগন্ধি স্মৃতির ছোঁয়া সমৃদ্ধ এলকোহলমুক্ত রাজকীয় সুবাস। এতে রয়েছে খাঁটি ওদ, আম্বার ও বিলাসবহুল তায়েফ গোলাপের মিশ্রণ। স্থায়িত্ব ৪৮ ঘণ্টা পর্যন্ত।',
    sizes: ['12ml Rollerbottle'],
    colors: [
      { name: 'Gilded Vial', class: 'bg-[#D97706]' }
    ],
    specifications: {
      'Alcohol Content': '0% (Totally Alcohol-Free)',
      'Fragrance Longevity': 'Up to 24-48 hours on cotton',
      'Top Base Notes': 'Agarwood Oud, Musk, Turkish Rose, Sweet Amber',
      'Recommended Use': 'Sermon, Jummah Prayers, Festive Occasions'
    },
    banglaSpecifications: {
      'অ্যালকোহল উপাদান': '০% (সম্পূর্ণ হালাল ও অ্যালকোহলমুক্ত)',
      'সুগন্ধির স্থায়িত্ব': '২৪ থেকে ৪৮ ঘণ্টা (সুতি কাপড়ে)',
      'মূল ঘ্রাণ উপাদান': 'ওদ, কস্তুরী, তুর্কি গোলাপ ও মিষ্টি আম্বার',
      'ব্যবহারের পরামর্শ': 'জুমা নামাজ, মিলাদ মাহফিল ও ধর্মীয় উৎসব'
    }
  },
  {
    id: 'i2',
    title: 'Bilingual Al-Quran Al-Kareem & Handcrafted Rehal',
    banglaTitle: 'অনুবাদসহ আল-কুরআন আল-কারিম ও কাঠের রেহাল',
    category: 'islamic',
    price: 1850,
    originalPrice: 2500,
    discount: 26,
    image: 'https://images.unsplash.com/photo-1609599006353-e629f1d40e4a?q=80&w=600&auto=format&fit=crop', // Elegant open quran image
    images: [
      'https://images.unsplash.com/photo-1609599006353-e629f1d40e4a?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 5.0,
    reviewsCount: 167,
    stock: 22,
    sold: 234,
    isFlashSale: false,
    isTrending: true,
    brand: 'Sulaiman Publishers',
    description: 'A premium hardbound Al-Quran set featuring word-by-word Bangla translations alongside authentic Arabic script. Comes packaged with a foldable, hand-carved Walnut-wood Rehal stand.',
    banglaDescription: 'শব্দে শব্দে বাংলা অর্থ ও শানে নুযূল সংবলিত প্রিমিয়াম হার্ডবাউন্ড আল-কোরআন মাজীদ। সাথে মিলবে একটি কাঠের ভাঁজ করা সুন্দর কারুকার্যময় রেহাল আর্ট স্ট্যান্ড।',
    sizes: ['Medium B5 Size Book'],
    colors: [
      { name: 'Royal Emerald Quran', class: 'bg-[#047857]' }
    ],
    specifications: {
      'Paper Grade Quality': 'Premium Cream Royal Paper (Matt Finish)',
      'Translation Team': 'Islamic Foundation Bangladesh',
      'Rehal Wood Material': 'Premium Solid Walnut with Arabesque Carvings',
      'Key Highlights': 'Word-by-word separation, Tajweed marked color codes'
    },
    banglaSpecifications: {
      'পাতার মান': 'প্রিমিয়াম ক্রিম আর্ট পেপার (ম্যাট ফিনিশ)',
      'অনুবাদ প্যানেল': 'ইসলামিক ফাউন্ডেশন বাংলাদেশ',
      'রেহাল কাঠ': 'খাঁটি মেহগনি/আখরোটে রাজকীয় নকশা',
      'বিশেষ বৈশিষ্ট্য': 'শব্দভেদে অর্থ ও তাজবিদ কালার কোড চিহ্নিত'
    }
  },
  {
    id: 'h1',
    title: 'Sitalpati Inspired Elegant Handloom Jute Rug',
    banglaTitle: 'শীতলপাটি ডিজাইন হস্তশিল্প কটন-জুট রাগ',
    category: 'home',
    price: 2450,
    originalPrice: 3800,
    discount: 35,
    image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=600&auto=format&fit=crop', // Stylish handcrafted flatweave rug
    images: [
      'https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.8,
    reviewsCount: 53,
    stock: 12,
    sold: 72,
    isFlashSale: false,
    isTrending: false,
    brand: 'Rural Craft BD',
    description: 'Handwoven in rural Rangpur using 100% natural organic golden jute and combed cotton cords. Heavy duty flatweave, highly durable, and biodegradable. Adds eco-friendly luxury to your living room.',
    banglaDescription: '১০০% প্রাকৃতিক সোনালী পাট ও কটন সুতা দিয়ে রংপুরের গ্রামীণ নারীদের হাতে বোনা শীতলপাটি ডিজাইনের আভিজাত্যময় কার্পেট। পরিবেশবান্ধব ও অত্যন্ত টেকসই।',
    sizes: ['4 x 6 Feet', '5 x 7 Feet'],
    colors: [
      { name: 'Natural Khaki', class: 'bg-[#D97706]' },
      { name: 'Clay Teracotta', class: 'bg-[#C2410C]' }
    ],
    specifications: {
      'Eco Fiber Type': '100% Biodegradable Golden Jute & Organic Cotton',
      'Weave Type': 'Thick double-knotted flatweave',
      'Floor Grip Support': 'Antiskid natural latex-treated backing',
      'Weight Capacity': '3.2 Kg heavy-feel laydown flat'
    },
    banglaSpecifications: {
      'আঁশের ধরন': '১০০% রিসাইকেল্ড পাট ও সুতি তন্তু',
      'বুনন শৈলী': 'পুরু ডাবল নোটেড সমতল বুনন',
      'নিচের স্তর': 'অ্যান্টি-স্কিড অ্যান্টি-স্লিপ ল্যাটেক্স কোটিং',
      'মোট ওজন': '৩.২ কেজি (কার্পেট সহজে নড়াচড়া করবে না)'
    }
  },
  {
    id: 'g1',
    title: 'Titanium Pro 20000mAh Magnetic Charging Power Bank',
    banglaTitle: 'টাইটানিয়াম প্রো ২০০০০mAh ম্যাগনেটিক পাওয়ার ব্যাংক',
    category: 'gadgets',
    price: 2190,
    originalPrice: 3500,
    discount: 37,
    image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b17c?q=80&w=600&auto=format&fit=crop', // Stylish power bank gadget
    images: [
      'https://images.unsplash.com/photo-1609592424109-dd9892f1b17c?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600541519463-ee174dc0905e?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.8,
    reviewsCount: 184,
    stock: 35,
    sold: 210,
    isFlashSale: true,
    isTrending: true,
    brand: 'Xiaomi Bangladesh',
    description: 'High-speed 22.5W Power Delivery battery backup featuring 15W MagSafe compatible wireless induction rings. Protected with multi-layer surge protection safe on domestic flights.',
    banglaDescription: '২২.৫W সুপারফাস্ট চার্জিং পাওয়ার ব্যাকআপ সহ ১৫W ম্যাগসেফ ওয়্যারলেস চার্জ ড্রাইভ। নিরাপদ যাতায়াতের জন্য মাল্টি-লেয়ার ভোল্টেজ প্রটেক্টরযুক্ত। বিমান ভ্রমণের জন্য সম্পূর্ণ নিরাপদ।',
    sizes: ['Standard 20K'],
    colors: [
      { name: 'Titanium Matte Silver', class: 'bg-[#94A3B8]' },
      { name: 'Matte Jet Black', class: 'bg-[#0F172A]' }
    ],
    specifications: {
      'Battery Rating': '20000mAh Lithium-Polymer Cell',
      'Wired Output Type': 'Type-C PD (22.5W Max) + 2x USB-A ports',
      'Magnetic Charge Strength': '15W Wireless Qi compatible induction ring',
      'Smart Controller Screen': 'Dynamic status LCD showing percentages'
    },
    banglaSpecifications: {
      'ব্যাটারি ক্ষমতা': '২০০০mAh লিথিয়াম পলিমার সেল',
      'ওয়্যার্ড আউটপুট': 'টাইপ-সি PD (২২.৫W সর্বোচ্চ) ও ২টি USB-এ পোর্ট',
      'ওয়্যারলেস আউটপুট': '১৫W ম্যাগসেফ ম্যাগনেটিক চার্জিং',
      'স্মার্ট ইন্ডিকেটর': 'সুস্পষ্ট ডিজিটাল পার্সেন্টেজ ডিসপ্লে'
    }
  },
  {
    id: 'c1',
    title: 'Sentinel 360° WiFi Smart Human-Tracking CCTV Cam',
    banglaTitle: 'সেন্টিনেল ৩৬০° ওয়াইফাই স্মার্ট হিউম্যান-ট্র্যাকিং সিসিটিভি',
    category: 'cctv',
    price: 2890,
    originalPrice: 4200,
    discount: 31,
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=600&auto=format&fit=crop', // CCTV Camera or security system
    images: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.7,
    reviewsCount: 78,
    stock: 18,
    sold: 140,
    isFlashSale: false,
    isTrending: true,
    brand: 'WatchDog Security',
    description: 'Protect your home in Bangladesh with full remote 3MP Ultra HD live transmission. Automatic human motion detection, real-time warning alarms, and clear full-color night infrared vision.',
    banglaDescription: '৩ মেগাপিক্সেল আল্ট্রা এইচডি দূরবর্তী লাইভ মনিটরিংয়ে আপনার বাড়ি রাখুন নিরাপদ। পাবেন স্বয়ংক্রিয় হিউম্যান ট্র্যাকিং, অ্যাপ নোটিফিকেশন অ্যালার্ম এবং কালার নাইট ভিশন সুবিধা।',
    sizes: ['3MP Dome Cam'],
    colors: [
      { name: 'Snow Orchid White', class: 'bg-[#F8FAFC]' }
    ],
    specifications: {
      'Signal Resolution': '2304x1296 (3MP) Cinematic HD Lens',
      'Pan & Tilt Reach': '355° Horizontal sweep, 110° Vertical tilt angle',
      'Storage Support': 'Supports MicroSD Card up to 256GB and Cloud Recording',
      'Talkback Feature': 'Two-way duplex real-time voice response mic'
    },
    banglaSpecifications: {
      'ভিডিও রেজোলিউশন': '২৩০৪x১২৯৬ (৩ মেগাপিক্সেল) আল্ট্রা এইচডি',
      'ঘূর্ণন ক্ষমতা': '৩৬০ ডিগ্রি হরাইজন্টাল এবং ৯০ ডিগ্রি ভার্টিকাল',
      'স্টোরেজ': 'সর্বোচ্চ ২৫৬জিবি মাইক্রো এসডি কার্ড সাপোর্ট',
      'দ্বিমুখী অডিও': 'মাইক্রোফোন ও স্পিকারসহ সরাসরি যোগাযোগের সুবিধা'
    }
  },
  {
    id: 'k1',
    title: 'Montessori Natural Pine Multi-Shape Kids Wood Block Set',
    banglaTitle: 'মনটেসরি পাইন কাঠের জ্যামিতিক ব্লক খেলনা সেট',
    category: 'kids',
    price: 1190,
    originalPrice: 1850,
    discount: 35,
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600&auto=format&fit=crop', // Colorful children wooden blocks
    images: [
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515488042361-404e9250afef?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?q=80&w=600&auto=format&fit=crop'
    ],
    rating: 4.9,
    reviewsCount: 41,
    stock: 15,
    sold: 112,
    isFlashSale: false,
    isTrending: false,
    brand: 'Sishu Care BD',
    description: 'Nontoxic, non-allergenic Montessori intelligence development toy made from solid organic pine wood. Coated with organic vegetable water-based dye. Highly safe for infant play.',
    banglaDescription: 'শিশুর মেধা বিকাশে নিরাপদ মনটেসরি উডেন খেলনা সেট। বাচ্চাদের জন্য ক্ষতিকারক নয় এমন প্রাকৃতিক উপাদান ও ফুড-গ্রেড রঙের কোটিং দিয়ে তৈরি।',
    sizes: ['40 Piece Set'],
    colors: [
      { name: 'Pastel Rainbow Wood', class: 'bg-[#FBCFE8]' }
    ],
    specifications: {
      'Base Wood Material': 'Premium hand-polished organic Siberian Pine Wood',
      'Tested Dye Paints': '100% Nontoxic Water Based Organic Food Dye',
      'Safety Standards': 'CE & ASTM International Child Safety Certified',
      'Skill Developer': 'Enhances 3D Spatial Coordination, fine motor skills'
    },
    banglaSpecifications: {
      'কাঠের উপাদান': 'হস্তশিল্পে পালিশ করা পাইন কাঠ',
      'রঙের স্থায়িত্ব': '১০০% টক্সিনহীন ভেজিটেবল ওয়াটার ডাই কোটিং',
      'শিশুর বয়সসীমা': '১৮ মাস থেকে ৬ বছর বয়সী বাচ্চাদের জন্য উপযোগী',
      'দক্ষতা উন্নয়ন': 'বাচ্চাদের জটিল ধারণক্ষমতা ও সূক্ষ্ম পেশি মজবুত করে'
    }
  }
];

export const allReviews: Review[] = [
  {
    id: 'r1',
    userName: 'Tanvir Rahman',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop',
    rating: 5,
    date: '2026-05-18',
    comment: 'The Mulberry Silk Panjabi exceeded my expectations. The stitching quality matches international designer stores and the ivory color reflects light beautifully. Delivery was extremely prompt, arriving in Banani within only 18 hours. Highly recommended!',
    banglaComment: 'রাজশাহী সিল্কের পাঞ্জাবির মান আমার প্রত্যাশার চেয়েও দুর্দান্ত লেগেছে। সেলাই ও এমব্রয়ডারি খুবই নিখুঁত। ঢাকার বনানীতে মাত্র ১৮ ঘণ্টার মধ্যে অত্যন্ত দ্রুত হোম ডেলিভারি পেয়েছি। রাজকীয় লুকে ধন্যবাদ!',
    verified: true
  },
  {
    id: 'r2',
    userName: 'Nusrat Jahan',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop',
    rating: 5,
    date: '2026-05-20',
    comment: 'Gorgeous Tangail Jamdani! It is featherlight and the authentic gold thread zari weave glows elegantly. Traditional luxury at its absolute finest. I will buy another one in crimson for my mother.',
    banglaComment: 'অসাধারণ টাঙ্গাইলের সুতি জামদানি শাড়ি! এটি পরতে খুবই আরামদায়ক এবং জরি সুতার কাজগুলো ভীষণ মার্জিত ও রাজকীয় দেখায়। এত প্রিমিয়াম কোয়ালিটির শাড়ি সত্যি দেশের আর কোথাও মেলা কঠিন!',
    verified: true
  },
  {
    id: 'r3',
    userName: 'Fahim Ahmed',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop',
    rating: 4,
    date: '2026-05-22',
    comment: 'Great fitness tracking band. Bluetooth calling output is surprisingly clear in the busy traffic of Mirpur Road. The Bangla font renders perfectly without issues. Excellent value for money product.',
    banglaComment: 'মিরপুর রোডের ব্যস্ত ট্রাফিকের মাঝেও ব্লুটুথ কলিং স্পিকারের সাউন্ড অনেক ক্লিয়ার লেগেছে। স্মার্টওয়াচটিতে বাংলা নোটিফিকেশন ফন্ট একদম নিখুঁত দেখায়। টাকা উসুল গ্যাজেট!',
    verified: true
  }
];
