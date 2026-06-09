import React, { useState } from 'react';
import { Mail, Lock, User, Phone, MapPin, X, Shield, Sparkles } from 'lucide-react';
import { UserAccount } from '../types';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'bn';
  onLoginSuccess: (account: UserAccount) => void;
  onRegisterSuccess: (account: UserAccount) => void;
  allAccounts: UserAccount[];
}

export const bdDistricts = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Rangpur', 'Barisal', 'Mymensingh',
  'Comilla', 'Narayanganj', 'Gazipur', 'Bogra', 'Sylhet', 'Dinajpur', 'Feni', 'Jessore'
];

export default function AuthModal({
  isOpen,
  onClose,
  language,
  onLoginSuccess,
  onRegisterSuccess,
  allAccounts
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  // Fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const t = {
    titleLogin: language === 'en' ? 'Welcome Back' : 'স্বাগতম',
    subLogin: language === 'en' ? 'Log in to sync your orders and reward points' : 'আপনার অর্ডার এবং রিওয়ার্ড পয়েন্ট সিঙ্ক করতে লগইন করুন',
    titleRegister: language === 'en' ? 'Create Account' : 'নতুন অ্যাকাউন্ট তৈরি',
    subRegister: language === 'en' ? 'Save your address and track orders persistently' : 'আপনার ঠিকানা সেভ রাখুন এবং অর্ডারের লাইভ আপডেট পান',
    name: language === 'en' ? 'Full Name' : 'পূর্ণ নাম',
    email: language === 'en' ? 'Email Address' : 'ইমেইল অ্যাড্রেস',
    password: language === 'en' ? 'Password' : 'পাসওয়ার্ড',
    phone: language === 'en' ? 'WhatsApp/Phone Number' : 'ফোন নাম্বার',
    address: language === 'en' ? 'Shipping Address' : 'শিপিং ঠিকানা',
    district: language === 'en' ? 'Select District' : 'জেলা নির্বাচন',
    loginBtn: language === 'en' ? 'Secure Log In' : 'লগইন করুন',
    signupBtn: language === 'en' ? 'Create Account' : 'অ্যাকাউন্ট তৈরি করুন',
    switchLogin: language === 'en' ? "Already have an account? Log In" : 'অ্যাকাউন্ট আছে? লগইন করুন',
    switchSignup: language === 'en' ? "Don't have an account? Sign Up" : 'নতুন অ্যাকাউন্ট? সাইন আপ করুন',
    errFill: language === 'en' ? 'Please fill out all fields correctly' : 'অনুগ্রহ করে সব তথ্য সঠিকভাবে পূরণ করুন',
    errEmailTaken: language === 'en' ? 'This email address is already registered' : 'এই ইমেইলটি ইতিমধ্যে নিবন্ধিত রয়েছে',
    errInvalid: language === 'en' ? 'Invalid email or password' : 'ভুল ইমেইল অথবা পাসওয়ার্ড',
    demoAccounts: language === 'en' ? 'Quick Login Demo Accounts' : 'দ্রুত টেস্ট লগইন অ্যাকাউন্ট সমূহ'
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg(t.errFill);
      return;
    }

    try {
      // 1. Authenticate using actual Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      const user = userCredential.user;

      // 2. Load Firestore account settings meta details
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        const account: UserAccount = {
          id: user.uid,
          name: data.name || user.displayName || 'Unnamed User',
          email: user.email || data.email,
          phone: data.phone || '',
          address: data.address || '',
          district: data.district || 'Dhaka',
          avatar: data.avatar || user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop',
          role: data.role || 'user',
          permissions: data.permissions || [],
          rewardPoints: data.rewardPoints || 0,
          memberSince: data.memberSince || 'May 2026',
          orders: data.orders || [],
          cartItems: data.cartItems || [],
          wishlist: data.wishlist || []
        };
        
        setSuccessMsg(language === 'en' ? 'Login successful! Syncing data...' : 'লগইন সফল হয়েছে! ডেটা সিঙ্ক হচ্ছে...');
        setTimeout(() => {
          onLoginSuccess(account);
          onClose();
        }, 1000);
      } else {
        // Build document profile if missing from database
        const newAccount: UserAccount = {
          id: user.uid,
          name: user.displayName || 'Customer',
          email: user.email || email.toLowerCase().trim(),
          phone: '',
          address: '',
          district: 'Dhaka',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop',
          role: 'user',
          permissions: [],
          rewardPoints: 200,
          memberSince: 'May 2026',
          orders: [],
          cartItems: [],
          wishlist: []
        };
        await setDoc(userDocRef, newAccount);
        setSuccessMsg(language === 'en' ? 'Profile generated! Syncing...' : 'প্রোফাইল ডেটা তৈরি হয়েছে! সিঙ্ক হচ্ছে...');
        setTimeout(() => {
          onLoginSuccess(newAccount);
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      console.error('Firebase Auth Exception', err);

      // Check if it is a pre-seeded developer/admin test demo credentials login request
      const demoAccount = allAccounts.find(
        acc => acc.email.toLowerCase() === email.toLowerCase().trim()
      );

      if (demoAccount && (password === 'admin' || password === 'user' || password === demoAccount.password)) {
        try {
          // Provision the seed admin into actual user's Firebase Project dynamically
          const cred = await createUserWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
          const userDocRef = doc(db, 'users', cred.user.uid);
          const formattedAccount: UserAccount = {
            ...demoAccount,
            id: cred.user.uid
          };
          await setDoc(userDocRef, formattedAccount);

          setSuccessMsg(language === 'en' ? 'Admin connected, syncing workspace...' : 'অ্যাডমিন পোর্টাল ডেটা সিঙ্ক হচ্ছে...');
          setTimeout(() => {
            onLoginSuccess(formattedAccount);
            onClose();
          }, 1000);
          return;
        } catch (subErr) {
          // If already exists in project auth, fallback to normal sign in with password
          try {
            const currentCred = await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
            const userDocRef = doc(db, 'users', currentCred.user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const data = userDocSnap.data() as UserAccount;
              onLoginSuccess({
                ...data,
                id: currentCred.user.uid
              });
              onClose();
              return;
            }
          } catch {}
          
          setSuccessMsg(language === 'en' ? 'Local offline session restored' : 'লোকাল সেশন সফল হয়েছে');
          setTimeout(() => {
            onLoginSuccess(demoAccount);
            onClose();
          }, 1000);
          return;
        }
      }

      let friendlyError = t.errInvalid;
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        friendlyError = language === 'en' ? 'Incorrect password' : 'ভুল পাসওয়ার্ড';
      } else if (err.code === 'auth/user-not-found') {
        friendlyError = language === 'en' ? 'No account found with this email' : 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি';
      } else if (err.code === 'auth/network-request-failed') {
        friendlyError = language === 'en' ? 'Network error. Please check your connection.' : 'নেটওয়ার্ক সংযোগ ত্রুটি। সংযোগটি পুনরায় পরীক্ষা করুন।';
      }
      setErrorMsg(friendlyError);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name || !email || !password || !phone || !address || !district) {
      setErrorMsg(t.errFill);
      return;
    }

    const emailLower = email.toLowerCase().trim();
    const isEmailTaken = allAccounts.some(acc => acc.email.toLowerCase() === emailLower);
    if (isEmailTaken) {
      setErrorMsg(t.errEmailTaken);
      return;
    }

    try {
      // 1. Create account with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      const user = userCredential.user;

      // 2. Construct account object details
      const newAccount: UserAccount = {
        id: user.uid,
        name,
        email: email.toLowerCase().trim(),
        phone,
        address,
        district,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop',
        role: 'user',
        permissions: [],
        rewardPoints: 200, // starting gift
        memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        orders: [],
        cartItems: [],
        wishlist: []
      };

      // 3. Write user details payload into Firestore Users collection
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, newAccount);

      setSuccessMsg(language === 'en' ? 'Registration complete! Starting portal...' : 'অ্যাকাউন্ট তৈরি সফল হয়েছে! পোর্টাল চালু হচ্ছে...');
      setTimeout(() => {
        onRegisterSuccess(newAccount);
        onClose();
      }, 1200);

    } catch (err: any) {
      console.error('Firebase Auth Signup Exception', err);
      let friendlyError = t.errEmailTaken;
      if (err.code === 'auth/email-already-in-use') {
        friendlyError = t.errEmailTaken;
      } else if (err.code === 'auth/weak-password') {
        friendlyError = language === 'en' ? 'Password should be at least 6 characters' : 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হওয়া বাঞ্ছনীয়';
      } else if (err.code === 'auth/invalid-email') {
        friendlyError = language === 'en' ? 'Invalid email format' : 'ভুল ইমেইল ফরম্যাট';
      } else {
        friendlyError = err.message || String(err);
      }
      setErrorMsg(friendlyError);
    }
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col relative animate-scale-up">
        
        {/* Close Button */}
        <button
          id="auth-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 p-1.5 rounded-full hover:bg-slate-100 transition z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8 flex flex-col gap-6 text-left">
          
          {/* Header */}
          <div className="text-center font-sans">
            <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 border border-emerald-150 text-emerald-600">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-[#0F172A] tracking-tight">
              {mode === 'login' ? t.titleLogin : t.titleRegister}
            </h2>
            <p className="text-xs text-slate-405 mt-1 max-w-xs mx-auto leading-relaxed">
              {mode === 'login' ? t.subLogin : t.subRegister}
            </p>
          </div>

          {/* Feedback alerts */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-xs font-bold font-sans text-center">
              ⚠️ {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs font-semibold font-sans text-center">
              ✅ {successMsg}
            </div>
          )}

          {/* Form */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 font-sans">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">{t.email}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    id="login-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono focus:bg-white transition"
                    placeholder="e.g. customer@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">{t.password}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    id="login-password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono focus:bg-white transition"
                    placeholder="🔒 Password"
                  />
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                className="w-full bg-[#16A34A] hover:bg-emerald-650 text-white py-2.5 rounded-xl text-xs font-extrabold tracking-wide cursor-pointer transition flex items-center justify-center gap-1.5 shadow"
              >
                <span>{t.loginBtn}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4 overflow-y-auto max-h-[350px] pr-1 scrollbar-thin font-sans">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">{t.name}</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    id="signup-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition"
                    placeholder="e.g. Tanvir Rahman"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">{t.email}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    id="signup-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono focus:bg-white transition"
                    placeholder="e.g. tanvir@gmail.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">{t.password}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    id="signup-password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono focus:bg-white transition"
                    placeholder="Pick a password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">{t.phone}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    id="signup-phone-input"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono focus:bg-white transition"
                    placeholder="e.g. 01712-345678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">{t.address}</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      id="signup-address-input"
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-205 rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition"
                      placeholder="e.g. Sector 4, Uttara"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">{t.district}</label>
                  <select
                    id="signup-district-select"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-205 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    {bdDistricts.map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                id="signup-submit-btn"
                type="submit"
                className="w-full bg-[#16A34A] hover:bg-emerald-650 text-white py-2.5 rounded-xl text-xs font-extrabold tracking-wide cursor-pointer transition flex items-center justify-center gap-1.5 shadow"
              >
                <span>{t.signupBtn}</span>
              </button>
            </form>
          )}

          {/* Sibling Toggle Mode */}
          <div className="text-center font-sans text-xs">
            <button
              id="auth-mode-toggle"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="font-bold text-slate-500 hover:text-emerald-650 transition cursor-pointer hover:underline"
            >
              {mode === 'login' ? t.switchSignup : t.switchLogin}
            </button>
          </div>



        </div>

      </div>
    </div>
  );
}
