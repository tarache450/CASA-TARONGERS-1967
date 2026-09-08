import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import BookingCalendar from './components/BookingCalendar';
import OwnerDashboard from './components/OwnerDashboard';

import { Booking, PropertySettings, BookingStatus } from './types';
import { INITIAL_PROPERTY_SETTINGS } from './data';
import { Mail, Phone, MapPin, Heart, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, TRANSLATIONS } from './translations';
import { notificationService } from './services/notificationService';
import { apiClient } from './services/apiClient';

export default function App() {
  // Navigation active tab: 'guest' (website) or 'dashboard' (family area)
  const [activeTab, setActiveTab] = useState<'guest' | 'dashboard'>('guest');

  // Core State
  const [language, setLanguage] = useState<Language>('ca');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [settings, setSettings] = useState<PropertySettings>(INITIAL_PROPERTY_SETTINGS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [serverConnectionError, setServerConnectionError] = useState<string | null>(null);

  // Load public availability from backend
  const loadPublicAvailability = useCallback(async () => {
    try {
      const availability = await apiClient.getPublicAvailability();
      // Map availability to lightweight Booking objects for calendar display
      const mapped: Booking[] = availability.map((item, idx) => ({
        id: `AVAIL-${idx}`,
        guestName: item.status === 'blocked' ? 'Bloqueig Familiar' : 'Ocupat',
        guestEmail: '',
        guestPhone: '',
        checkIn: item.checkIn,
        checkOut: item.checkOut,
        guestsCount: 0,
        status: item.status,
        privacyAccepted: true,
        termsAccepted: true,
        createdAt: new Date().toISOString(),
        history: []
      }));
      setBookings(mapped);
      setServerConnectionError(null);
    } catch (err: any) {
      console.warn('[App] Could not load public availability from server:', err);
    }
  }, []);

  // Load complete real bookings from backend (requires family token)
  const loadAdminBookings = useCallback(async () => {
    if (!apiClient.getToken()) return;
    setIsRefreshing(true);
    try {
      const realBookings = await apiClient.getAdminBookings();
      setBookings(realBookings);
      setServerConnectionError(null);
    } catch (err: any) {
      console.error('[App] Error loading admin bookings:', err);
      if (err?.message?.includes('Sesión expirada')) {
        apiClient.setToken(null);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initialize Language and settings
  useEffect(() => {
    const localSettings = localStorage.getItem('tarongers_settings_v1');
    const localLang = localStorage.getItem('tarongers_language_v1') as Language | null;

    if (localLang) {
      setLanguage(localLang);
    } else {
      localStorage.setItem('tarongers_language_v1', 'ca');
    }

    if (localSettings) {
      try {
        setSettings(JSON.parse(localSettings));
      } catch (e) {
        setSettings(INITIAL_PROPERTY_SETTINGS);
      }
    }

    // Initial load of real public availability
    loadPublicAvailability();

    // If family token exists, also fetch admin bookings
    if (apiClient.getToken()) {
      loadAdminBookings();
    }
  }, [loadPublicAvailability, loadAdminBookings]);

  // Set page language and title
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = 'Casa Tarongers 1967';
  }, [language]);

  // Auto-polling when family dashboard is active
  useEffect(() => {
    if (activeTab === 'dashboard' && apiClient.getToken()) {
      loadAdminBookings();
      const interval = setInterval(() => {
        loadAdminBookings();
      }, 25000);
      return () => clearInterval(interval);
    }
  }, [activeTab, loadAdminBookings]);

  // Save Settings
  const saveSettingsState = (newSettings: PropertySettings) => {
    setSettings(newSettings);
    localStorage.setItem('tarongers_settings_v1', JSON.stringify(newSettings));
  };

  // Guest booking form submission connected to real server API
  const handleAddBookingFromGuest = async (
    bookingData: Omit<Booking, 'id' | 'createdAt' | 'history' | 'internalNotes'>
  ): Promise<string> => {
    setServerConnectionError(null);
    try {
      const res = await apiClient.createBookingRequest({
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        guestPhone: bookingData.guestPhone,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guestsCount: bookingData.guestsCount,
        message: bookingData.notes || bookingData.message || '',
        privacyAccepted: bookingData.privacyAccepted,
        termsAccepted: bookingData.termsAccepted
      });

      // Prepare local notification alerts
      if (res.booking) {
        notificationService.sendGuestRequestReceived(res.booking as Booking);
        notificationService.sendFamilyNewRequestAlert(res.booking as Booking);
      }

      // Refresh public availability
      await loadPublicAvailability();

      return res.bookingId;
    } catch (err: any) {
      console.error('Failed to create booking in backend:', err);
      setServerConnectionError(err.message || 'Error al conectar con el servidor.');
      throw err;
    }
  };

  // Update booking status via backend API
  const handleUpdateBookingStatus = async (id: string, status: BookingStatus, note?: string) => {
    try {
      const res = await apiClient.updateBookingStatus(id, status, note);
      if (res.booking) {
        setBookings((prev) => prev.map((b) => (b.id === id ? res.booking : b)));

        // Send notifications
        if (status === 'confirmed') {
          notificationService.sendGuestBookingConfirmed(res.booking);
        } else if (status === 'rejected') {
          notificationService.sendGuestBookingRejected(res.booking);
        } else if (status === 'cancelled') {
          notificationService.sendGuestBookingCancelled(res.booking);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Error al actualizar el estado.');
    }
  };

  // Update general booking details via backend API
  const handleUpdateBooking = async (updatedBooking: Booking) => {
    try {
      const res = await apiClient.updateBookingDetails(updatedBooking.id, updatedBooking);
      if (res.booking) {
        setBookings((prev) => prev.map((b) => (b.id === updatedBooking.id ? res.booking : b)));
      }
    } catch (err: any) {
      alert(err.message || 'Error al actualizar la reserva.');
    }
  };

  // Add internal private note via backend API
  const handleAddNote = async (bookingId: string, noteText: string, author: string) => {
    try {
      const res = await apiClient.addBookingNote(bookingId, noteText, author);
      if (res.booking) {
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? res.booking : b)));
      }
    } catch (err: any) {
      alert(err.message || 'Error al añadir la nota.');
    }
  };

  // Block dates manually via backend API
  const handleBlockDates = async (block: { checkIn: string; checkOut: string; reason: string; createdBy: string }) => {
    try {
      const res = await apiClient.createManualBlock(block);
      if (res.block) {
        setBookings((prev) => [res.block, ...prev]);
      }
    } catch (err: any) {
      alert(err.message || 'Error al bloquear fechas.');
    }
  };

  // Unblock dates / delete booking via backend API
  const handleDeleteBooking = async (id: string) => {
    try {
      await apiClient.deleteBooking(id);
      setBookings((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error al eliminar la reserva.');
    }
  };

  // Archive booking
  const handleArchiveBooking = async (id: string) => {
    await handleUpdateBookingStatus(id, 'archived', 'Reserva archivada');
  };

  // Restore archived booking
  const handleRestoreBooking = async (id: string) => {
    await handleUpdateBookingStatus(id, 'pending_review', 'Reserva restaurada');
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
    <div className="min-h-screen bg-[#FAFAF5] flex flex-col justify-between selection:bg-primary-800 selection:text-white">
      {/* Dynamic Header */}
      <Navbar
        currentTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'dashboard' && apiClient.getToken()) {
            loadAdminBookings();
          }
        }}
        language={language}
        onLanguageChange={handleLanguageChange}
      />

      {/* Main Container */}
      <main className="flex-grow">
        {serverConnectionError && (
          <div className="bg-red-50 border-b border-red-200 py-2.5 px-4 text-center text-xs text-red-800 flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4 text-red-600" />
            <span>{serverConnectionError}</span>
          </div>
        )}

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
                settings={settings}
                onUpdateSettings={saveSettingsState}
                onAddBooking={async (b) => {
                  await handleBlockDates({
                    checkIn: b.checkIn,
                    checkOut: b.checkOut,
                    reason: b.notes || 'Bloqueo manual',
                    createdBy: 'Familia'
                  });
                }}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onUpdateBooking={handleUpdateBooking}
                onDeleteBooking={handleDeleteBooking}
                onArchiveBooking={handleArchiveBooking}
                onRestoreBooking={handleRestoreBooking}
                onAddNote={handleAddNote}
                onBlockDates={handleBlockDates}
                onUnblockDates={handleDeleteBooking}
                onRefreshBookings={loadAdminBookings}
                isRefreshing={isRefreshing}
                language={language}
                onLanguageChange={handleLanguageChange}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Elegant Footer */}
      <footer className="bg-[#1C2E15] text-stone-200 border-t border-stone-800/20 pt-10 pb-8 md:pt-16 md:pb-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Logo and signature */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-accent-terracotta rounded-md flex items-center justify-center text-white font-serif font-bold text-base">
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
                <button
                  onClick={() => {
                    setActiveTab('guest');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-accent-terracotta transition-colors cursor-pointer text-left"
                >
                  {ft.footBackToTop}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('guest');
                    setTimeout(() => document.getElementById('sobre-casa')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                  className="hover:text-accent-terracotta transition-colors cursor-pointer text-left"
                >
                  {ft.aboutHouse}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('guest');
                    setTimeout(() => document.getElementById('reservas')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }}
                  className="hover:text-accent-terracotta transition-colors cursor-pointer text-left"
                >
                  {ft.footFreeDates}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    if (apiClient.getToken()) {
                      loadAdminBookings();
                    }
                  }}
                  className="hover:text-accent-terracotta transition-colors text-xs font-mono font-bold flex items-center gap-1 mt-2 text-stone-200 cursor-pointer text-left"
                >
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
                <span className="font-serif text-xs">
                  {language === 'ca'
                    ? 'Gelida, Catalunya, Espanya'
                    : language === 'en'
                    ? 'Gelida, Catalonia, Spain'
                    : 'Gelida, Catalunya, España'}
                </span>
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
            <a href="#about" className="hover:text-stone-200 transition-colors">
              {ft.footPrivacy}
            </a>
            <a href="#about" className="hover:text-stone-200 transition-colors">
              {ft.footTerms}
            </a>
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
