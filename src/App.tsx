import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import BookingCalendar from './components/BookingCalendar';
import OwnerDashboard from './components/OwnerDashboard';

import { Booking, Payment, PropertySettings, BookingStatus, PaymentStatus, PaymentMethod } from './types';
import { INITIAL_BOOKINGS, INITIAL_PAYMENTS, INITIAL_PROPERTY_SETTINGS, IMAGES } from './data';
import { Mail, Phone, MapPin, Calendar, Heart, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, TRANSLATIONS } from './translations';

export default function App() {
  // Navigation active tab: 'guest' (website) or 'dashboard' (family area)
  const [activeTab, setActiveTab] = useState<'guest' | 'dashboard'>('guest');

  // Core Persistent State
  const [language, setLanguage] = useState<Language>('ca');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [settings, setSettings] = useState<PropertySettings>(INITIAL_PROPERTY_SETTINGS);

  // Initialize from LocalStorage or seed data
  useEffect(() => {
    const localBookings = localStorage.getItem('tarongers_bookings_v1');
    const localPayments = localStorage.getItem('tarongers_payments_v1');
    const localSettings = localStorage.getItem('tarongers_settings_v1');
    const localLang = localStorage.getItem('tarongers_language_v1') as Language | null;

    if (localLang) {
      setLanguage(localLang);
    } else {
      localStorage.setItem('tarongers_language_v1', 'ca');
    }

    if (localBookings) {
      setBookings(JSON.parse(localBookings));
    } else {
      setBookings(INITIAL_BOOKINGS);
      localStorage.setItem('tarongers_bookings_v1', JSON.stringify(INITIAL_BOOKINGS));
    }

    if (localPayments) {
      setPayments(JSON.parse(localPayments));
    } else {
      setPayments(INITIAL_PAYMENTS);
      localStorage.setItem('tarongers_payments_v1', JSON.stringify(INITIAL_PAYMENTS));
    }

    if (localSettings) {
      setSettings(JSON.parse(localSettings));
    } else {
      setSettings(INITIAL_PROPERTY_SETTINGS);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = 'Casa Tarongers';
  }, [language]);

  // Save Bookings
  const saveBookingsState = (newBookings: Booking[]) => {
    setBookings(newBookings);
    localStorage.setItem('tarongers_bookings_v1', JSON.stringify(newBookings));
  };

  // Save Payments
  const savePaymentsState = (newPayments: Payment[]) => {
    setPayments(newPayments);
    localStorage.setItem('tarongers_payments_v1', JSON.stringify(newPayments));
  };

  // Save Settings
  const saveSettingsState = (newSettings: PropertySettings) => {
    setSettings(newSettings);
    localStorage.setItem('tarongers_settings_v1', JSON.stringify(newSettings));
  };

  // Guest booking form submissions
  const handleAddBookingFromGuest = (bookingData: Omit<Booking, 'id' | 'createdAt'>) => {
    const newBookingId = `B${(bookings.length + 1).toString().padStart(3, '0')}`;
    const newBooking: Booking = {
      ...bookingData,
      id: newBookingId,
      createdAt: new Date().toISOString()
    };

    const updatedBookings = [...bookings, newBooking];
    saveBookingsState(updatedBookings);

    // If it's a Guest booking, we automatically add a corresponding pending payment
    if (bookingData.status !== 'Family Use') {
      const newPaymentId = `P${(payments.length + 1).toString().padStart(3, '0')}`;
      const newPayment: Payment = {
        id: newPaymentId,
        bookingId: newBookingId,
        guestName: bookingData.guestName,
        amount: bookingData.totalPrice,
        method: bookingData.paymentMethod,
        status: bookingData.paymentStatus,
        date: bookingData.checkIn // Date scheduled
      };
      const updatedPayments = [...payments, newPayment];
      savePaymentsState(updatedPayments);
    }
  };

  // Owner manually adds a booking or blocks a date range
  const handleAddManualBooking = (manualBooking: Booking) => {
    const updatedBookings = [...bookings, manualBooking];
    saveBookingsState(updatedBookings);

    // If it's not family block, log associated payment ledger entry
    if (manualBooking.status !== 'Family Use') {
      const newPaymentId = `P${(payments.length + 1).toString().padStart(3, '0')}`;
      const newPayment: Payment = {
        id: newPaymentId,
        bookingId: manualBooking.id,
        guestName: manualBooking.guestName,
        amount: manualBooking.totalPrice,
        method: manualBooking.paymentMethod,
        status: manualBooking.paymentStatus,
        date: manualBooking.checkIn
      };
      const updatedPayments = [...payments, newPayment];
      savePaymentsState(updatedPayments);
    }
  };

  // Owner modifies status of a booking (approve/cancel)
  const handleUpdateBookingStatus = (id: string, status: BookingStatus) => {
    const updatedBookings = bookings.map(b => {
      if (b.id === id) {
        // If booking is Cancelled, mark paymentStatus as refunded or pending/cancelled
        return { 
          ...b, 
          status, 
          paymentStatus: status === 'Cancelled' ? 'Refunded' : b.paymentStatus 
        };
      }
      return b;
    });
    saveBookingsState(updatedBookings);

    // Keep payments in sync
    const updatedPayments = payments.map(p => {
      if (p.bookingId === id) {
        return { 
          ...p, 
          status: status === 'Cancelled' ? 'Refunded' as PaymentStatus : p.status 
        };
      }
      return p;
    });
    savePaymentsState(updatedPayments);
  };

  // Owner marks a payment as Received
  const handleUpdatePaymentStatus = (bookingId: string, status: PaymentStatus, method: PaymentMethod) => {
    // 1. Update Booking payment status
    const updatedBookings = bookings.map(b => {
      if (b.id === bookingId) {
        return { ...b, paymentStatus: status, paymentMethod: method };
      }
      return b;
    });
    saveBookingsState(updatedBookings);

    // 2. Update Payments log
    const updatedPayments = payments.map(p => {
      if (p.bookingId === bookingId) {
        return { ...p, status, method };
      }
      return p;
    });
    savePaymentsState(updatedPayments);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('tarongers_language_v1', lang);
  };

  const handleScrollToBooking = () => {
    const el = document.getElementById('reservas');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const ft = TRANSLATIONS[language];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-between selection:bg-primary-600 selection:text-white">
      {/* Dynamic Header */}
      <Navbar 
        currentTab={activeTab} 
        onChangeTab={setActiveTab} 
        language={language}
        onLanguageChange={handleLanguageChange}
      />

      {/* Main Container */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {activeTab === 'guest' ? (
            <motion.div
              key="guest-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Hero & Search availability */}
              <Hero onSearchClick={handleScrollToBooking} language={language} />

              {/* Detailed presentation section */}
              <About language={language} />

              {/* Calendar & booking form */}
              <BookingCalendar 
                bookings={bookings} 
                settings={settings} 
                onAddBooking={handleAddBookingFromGuest} 
                language={language}
              />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Owner internal control dashboard */}
              <OwnerDashboard 
                bookings={bookings}
                payments={payments}
                settings={settings}
                onUpdateSettings={saveSettingsState}
                onAddBooking={handleAddManualBooking}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onUpdatePaymentStatus={handleUpdatePaymentStatus}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Elegant, high-end design Footer in Warm Forest Green matching mockup */}
      <footer className="bg-[#1C2E15] text-stone-200 border-t border-stone-800/20 pt-10 pb-8 md:pt-16 md:pb-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          
          {/* Logo and signature */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-accent-terracotta rounded-[4px] flex items-center justify-center text-white font-serif font-bold text-base">
                CT
              </div>
              <span className="font-serif text-lg font-bold tracking-wider text-white">Casa Tarongers</span>
            </div>
            <p className="text-stone-300 text-sm max-w-sm leading-relaxed font-sans font-light">
              {ft.footDesc}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-serif font-medium text-white tracking-wide mb-4">{ft.footInfo}</h4>
            <ul className="space-y-2 text-sm text-stone-300">
              <li>
                <button onClick={() => { setActiveTab('guest'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-accent-terracotta transition-colors cursor-pointer text-left">
                  {ft.footBackToTop}
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('guest'); setTimeout(() => document.getElementById('sobre-casa')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-accent-terracotta transition-colors cursor-pointer text-left">
                  {ft.aboutHouse}
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('guest'); setTimeout(() => document.getElementById('reservas')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="hover:text-accent-terracotta transition-colors cursor-pointer text-left">
                  {ft.footFreeDates}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-accent-terracotta transition-colors text-xs font-mono font-bold flex items-center gap-1 mt-2 text-stone-200 cursor-pointer text-left">
                  <span>{ft.footFamilyAccess}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="font-serif font-medium text-white tracking-wide">{ft.footContact}</h4>
            <div className="space-y-3 text-sm text-stone-300 font-mono">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent-terracotta shrink-0" />
                <span>acivit@coac.net</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent-terracotta shrink-0" />
                <span>+34 629 30 85 70</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent-terracotta shrink-0" />
                <span className="font-serif text-xs">{language === 'ca' ? 'Gelida, Catalunya, Espanya' : language === 'en' ? 'Gelida, Catalonia, Spain' : 'Gelida, Catalunya, España'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto px-6 mt-10 md:mt-16 pt-6 md:pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-400">
          <div>
            &copy; {new Date().getFullYear()} Casa Tarongers. {ft.footRights}
          </div>
          <div className="flex gap-6">
            <a href="#about" className="hover:text-stone-200 transition-colors">{ft.footPrivacy}</a>
            <a href="#about" className="hover:text-stone-200 transition-colors">{ft.footTerms}</a>
          </div>
          <div className="flex items-center gap-1 font-sans">
            <span>{ft.footMadeWith}</span>
            <Heart className="w-3 h-3 text-accent-terracotta fill-accent-terracotta" />
          </div>
        </div>
      </footer>
    </div>
  );
}
