/**
 * Converts English digits to Bangla digits.
 */
export function toBanglaDigits(num: number | string): string {
  const englishToBanglaMap: Record<string, string> = {
    '0': '০',
    '1': '১',
    '2': '২',
    '3': '৩',
    '4': '৪',
    '5': '৫',
    '6': '৬',
    '7': '৭',
    '8': '৮',
    '9': '৯'
  };
  return num
    .toString()
    .split('')
    .map(char => englishToBanglaMap[char] || char)
    .join('');
}

/**
 * Formats values to Bangladeshi Taka (৳).
 */
export function formatBDT(amount: number, language: 'en' | 'bn' = 'en'): string {
  const formattedEN = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(amount);

  if (language === 'bn') {
    return `৳${toBanglaDigits(formattedEN)}`;
  }
  return `৳${formattedEN}`;
}

export interface CategoryVariantConfig {
  optionLabel: { en: string; bn: string };
  placeholder: string;
  defaultOptions: string;
  colorLabel: { en: string; bn: string };
}

export function getCategoryVariantConfig(category: string): CategoryVariantConfig {
  switch (category) {
    case 'fashion':
      return {
        optionLabel: { en: 'Select Size', bn: 'সাইজ নির্ধারণী' },
        placeholder: 'S, M, L, XL, XXL',
        defaultOptions: 'M, L, XL',
        colorLabel: { en: 'Select Color/Shade', bn: 'রং অথবা শেড' }
      };
    case 'electronics':
      return {
        optionLabel: { en: 'Select Spec / Storage', bn: 'কনফিগারেশন / স্টোরেজ' },
        placeholder: '128GB, 256GB, 512GB, 8GB RAM, 16GB RAM',
        defaultOptions: '128GB, 256GB, 512GB',
        colorLabel: { en: 'Select Color/Finish', bn: 'কালার বা ফিনিশ নির্ধারণী' }
      };
    case 'gadgets':
      return {
        optionLabel: { en: 'Select Connectivity / Spec', bn: 'কানেক্টিভিটি / স্পেসিফিকেশন' },
        placeholder: 'Bluetooth, Wi-Fi, eSIM, GPS, 44mm, 40mm',
        defaultOptions: 'GPS, Cellular',
        colorLabel: { en: 'Select Style/Color', bn: 'ডিজাইন বা কালার' }
      };
    case 'kids':
      return {
        optionLabel: { en: 'Select Age Group / Type', bn: 'বয়সসীমা / খেলনার ধরণ' },
        placeholder: '0-1 Year, 1-3 Years, 4-6 Years, Type A, Type B',
        defaultOptions: '1-3 Years, 4-6 Years',
        colorLabel: { en: 'Select Theme/Color', bn: 'কালার বা থিম নির্ধারণী' }
      };
    case 'cctv':
      return {
        optionLabel: { en: 'Select Channels / Lens Size', bn: 'কক্সিয়াল চ্যানেল / লেন্স সাইজ' },
        placeholder: '4 Channel, 8 Channel, 16 Channel, 2.8mm, 3.6mm, 6mm',
        defaultOptions: '4 Channel, 8 Channel',
        colorLabel: { en: 'Select Body Material/Color', bn: 'বডির প্যাটার্ন বা কালার' }
      };
    case 'islamic':
      return {
        optionLabel: { en: 'Select Edition / Pack Size', bn: 'এডিশন বা সংস্করণ / প্যাকের মাপ' },
        placeholder: 'Hardcover, Softcover, 1 Kilo, 500g, Single, Premium Box',
        defaultOptions: 'Hardcover, Softcover',
        colorLabel: { en: 'Cover Design/Shade', bn: 'প্রচ্ছদ ডিজাইন অথবা ডেকোরেশন' }
      };
    case 'home':
      return {
        optionLabel: { en: 'Select Dimensions / Material', bn: 'মাপ / মেটেরিয়াল সিলেকশন' },
        placeholder: '6x7 Feet, 5x6 Feet, Double Bed, Single Bed, Teak Wood, Stainless Steel',
        defaultOptions: '6x7 Feet, 5x6 Feet',
        colorLabel: { en: 'Color/Finish Type', bn: 'কালার প্যাটার্ন বা পলিশ' }
      };
    default:
      return {
        optionLabel: { en: 'Select Variant / Choice', bn: 'ধরণ বা বিকল্প সিলেক্ট করুন' },
        placeholder: 'Standard, Premium, Deluxe',
        defaultOptions: 'Standard, Premium',
        colorLabel: { en: 'Choose Color/Option', bn: 'রং বা বিকল্প নির্ধারণী' }
      };
  }
}

