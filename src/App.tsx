import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import BookingCalendar from './components/BookingCalendar';
import OwnerDashboard from './components/OwnerDashboard';

import { Booking, PropertySettings, BookingStatus, BookingNote, BookingActivity } from './types';
import { INITIAL_BOOKINGS, INITIAL_PROPERTY_SETTINGS } from './data';
import { Mail, Phone, MapPin, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, TRANSLATIONS } from './translations';
import { notificationService } from './services/notificationService';

export default function App() {
  // Navigation active tab: 'guest' (website) or 'dashboard' (family area)
  const [activeTab, setActiveTab] = useState<'guest' | 'dashboard'>('guest');

  // Core Persistent State
  const [language, setLanguage] = useState<Language>('ca');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [settings, setSettings] = useState<PropertySettings>(INITIAL_PROPERTY_SETTINGS);

  // Initialize from LocalStorage or seed data with schema migration
  useEffect(() => {
    const localBookings = localStorage.getItem('tarongers_bookings_v1');
    const localSettings = localStorage.getItem('tarongers_settings_v1');
    const localLang = localStorage.getItem('tarongers_language_v1') as Language | null;

    if (localLang) {
      setLanguage(localLang);
    } else {
      localStorage.setItem('tarongers_language_v1', 'ca');
    }

    if (localBookings) {
      try {
        const rawBookings: any[] = JSON.parse(localBookings);
        // Migrate legacy statuses and fields safely
        const migrated: Booking[] = rawBookings.map((b) => {
          let status: BookingStatus = b.status;
          if (b.status === 'Pending') status = 'pending_review';
          else if (b.status === 'Confirmed') status = 'confirmed';
          else if (b.status === 'Cancelled') status = 'cancelled';
          else if (b.status === 'Family Use') status = 'blocked';

          const history: BookingActivity[] = Array.isArray(b.history) && b.history.length > 0
            ? b.history
            : [
                {
                  id: `act-${b.id || 'init'}-0`,
                  timestamp: b.createdAt || new Date().toISOString(),
                  action: 'created',
                  actor: b.guestName || 'Sistema',
                  description: 'Registro inicial de reserva'
                }
              ];

          const internalNotes: BookingNote[] = Array.isArray(b.internalNotes) ? b.internalNotes : [];

          return {
            id: b.id,
            guestName: b.guestName || 'Huésped',
            guestEmail: b.guestEmail || '',
            guestPhone: b.guestPhone || '',
            checkIn: b.checkIn,
            checkOut: b.checkOut,
            guestsCount: b.guestsCount || 2,
            notes: b.notes || '',
            internalNotes,
            status,
            createdAt: b.createdAt || new Date().toISOString(),
            updatedAt: b.updatedAt,
            privacyAccepted: b.privacyAccepted !== undefined ? b.privacyAccepted : true,
            termsAccepted: b.termsAccepted !== undefined ? b.termsAccepted : true,
            history
          };
        });
        setBookings(migrated);
        localStorage.setItem('tarongers_bookings_v1', JSON.stringify(migrated));
      } catch (err) {
        console.error('Error parsing stored bookings, using defaults:', err);
        setBookings(INITIAL_BOOKINGS);
        localStorage.setItem('tarongers_bookings_v1', JSON.stringify(INITIAL_BOOKINGS));
      }
    } else {
      setBookings(INITIAL_BOOKINGS);
      localStorage.setItem('tarongers_bookings_v1', JSON.stringify(INITIAL_BOOKINGS));
    }

    if (localSettings) {
      try {
        setSettings(JSON.parse(localSettings));
      } catch (e) {
        setSettings(INITIAL_PROPERTY_SETTINGS);
      }
    } else {
      setSettings(INITIAL_PROPERTY_SETTINGS);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = 'Casa Tarongers 1967';
  }, [language]);

  // Save Bookings
  const saveBookingsState = (newBookings: Booking[]) => {
    setBookings(newBookings);
    localStorage.setItem('tarongers_bookings_v1', JSON.stringify(newBookings));
  };

  // Save Settings
  const saveSettingsState = (newSettings: PropertySettings) => {
    setSettings(newSettings);
    localStorage.setItem('tarongers_settings_v1', JSON.stringify(newSettings));
  };

  // Guest booking form submissions
  const handleAddBookingFromGuest = (
    bookingData: Omit<Booking, 'id' | 'createdAt' | 'history' | 'internalNotes'>
  ) => {
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newBookingId = `REQ-${year}-${randomSuffix}`;
    const nowIso = new Date().toISOString();

    const initialActivity: BookingActivity = {
      id: `act-${Date.now()}`,
      timestamp: nowIso,
      action: 'created',
      actor: bookingData.guestName,
      description: 'Solicitud de reserva enviada desde la web pública'
    };

    const newBooking: Booking = {
      ...bookingData,
      id: newBookingId,
      createdAt: nowIso,
      status: 'new_request',
      history: [initialActivity],
      internalNotes: []
    };

    const updatedBookings = [newBooking, ...bookings];
    saveBookingsState(updatedBookings);

    // Notifications (prepared & logged)
    notificationService.sendGuestRequestReceived(newBooking);
    notificationService.sendFamilyNewRequestAlert(newBooking);
  };

  // Update booking status
  const handleUpdateBookingStatus = (id: string, status: BookingStatus, note?: string) => {
    const nowIso = new Date().toISOString();
    let updatedTarget: Booking | null = null;

    const updatedBookings = bookings.map((b) => {
      if (b.id === id) {
        const newActivity: BookingActivity = {
          id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: nowIso,
          action: 'status_changed',
          actor: 'Familia',
          description: `Estado actualizado a "${status}"${note ? `: ${note}` : ''}`
        };
        updatedTarget = {
          ...b,
          status,
          updatedAt: nowIso,
          history: [newActivity, ...(b.history || [])]
        };
        return updatedTarget;
      }
      return b;
    });

    saveBookingsState(updatedBookings);

    if (updatedTarget) {
      if (status === 'confirmed') {
        notificationService.sendGuestBookingConfirmed(updatedTarget);
      } else if (status === 'rejected') {
        notificationService.sendGuestBookingRejected(updatedTarget);
      } else if (status === 'cancelled') {
        notificationService.sendGuestBookingCancelled(updatedTarget);
      }
    }
  };

  // Update general booking details (dates, guests, notes)
  const handleUpdateBooking = (updatedBooking: Booking) => {
    const nowIso = new Date().toISOString();
    const newActivity: BookingActivity = {
      id: `act-${Date.now()}`,
      timestamp: nowIso,
      action: 'edited',
      actor: 'Familia',
      description: 'Datos de la reserva modificados manualmente'
    };

    const updatedBookings = bookings.map((b) => {
      if (b.id === updatedBooking.id) {
        return {
          ...updatedBooking,
          updatedAt: nowIso,
          history: [newActivity, ...(b.history || [])]
        };
      }
      return b;
    });

    saveBookingsState(updatedBookings);
  };

  // Add an internal note to a booking
  const handleAddNote = (bookingId: string, noteText: string, author: string) => {
    const nowIso = new Date().toISOString();
    const newNote: BookingNote = {
      id: `note-${Date.now()}`,
      createdAt: nowIso,
      author: author || 'Familia',
      text: noteText
    };

    const activity: BookingActivity = {
      id: `act-${Date.now()}`,
      timestamp: nowIso,
      action: 'note_added',
      actor: author || 'Familia',
      description: `Nota interna añadida: "${noteText.slice(0, 40)}${noteText.length > 40 ? '...' : ''}"`
    };

    const updatedBookings = bookings.map((b) => {
      if (b.id === bookingId) {
        return {
          ...b,
          internalNotes: [newNote, ...(b.internalNotes || [])],
          history: [activity, ...(b.history || [])]
        };
      }
      return b;
    });

    saveBookingsState(updatedBookings);
  };

  // Block dates manually
  const handleBlockDates = (block: { checkIn: string; checkOut: string; reason: string; createdBy: string }) => {
    const nowIso = new Date().toISOString();
    const id = `BLK-${Date.now().toString().slice(-6)}`;

    const newBlock: Booking = {
      id,
      guestName: block.reason.trim() || 'Bloqueo familiar',
      guestEmail: '',
      guestPhone: '',
      checkIn: block.checkIn,
      checkOut: block.checkOut,
      guestsCount: 0,
      notes: block.reason,
      status: 'blocked',
      createdAt: nowIso,
      privacyAccepted: true,
      termsAccepted: true,
      history: [
        {
          id: `act-${Date.now()}`,
          timestamp: nowIso,
          action: 'created',
          actor: block.createdBy || 'Familia',
          description: `Fechas bloqueadas manualmente: ${block.reason || 'Sin motivo especificado'}`
        }
      ],
      internalNotes: []
    };

    saveBookingsState([newBlock, ...bookings]);
  };

  // Unblock dates
  const handleUnblockDates = (id: string) => {
    saveBookingsState(bookings.filter((b) => b.id !== id));
  };

  // Delete booking permanently (requires explicit confirmation from UI)
  const handleDeleteBooking = (id: string) => {
    saveBookingsState(bookings.filter((b) => b.id !== id));
  };

  // Archive booking
  const handleArchiveBooking = (id: string) => {
    handleUpdateBookingStatus(id, 'archived', 'Reserva archivada');
  };

  // Restore archived booking
  const handleRestoreBooking = (id: string) => {
    handleUpdateBookingStatus(id, 'pending_review', 'Reserva restaurada a revisión');
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
                settings={settings}
                onUpdateSettings={saveSettingsState}
                onAddBooking={(b) => saveBookingsState([b, ...bookings])}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onUpdateBooking={handleUpdateBooking}
                onDeleteBooking={handleDeleteBooking}
                onArchiveBooking={handleArchiveBooking}
                onRestoreBooking={handleRestoreBooking}
                onAddNote={handleAddNote}
                onBlockDates={handleBlockDates}
                onUnblockDates={handleUnblockDates}
                language={language}
                onLanguageChange={handleLanguageChange}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Elegant, high-end design Footer */}
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
                  onClick={() => setActiveTab('dashboard')}
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
