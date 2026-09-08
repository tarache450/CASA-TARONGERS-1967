import React, { useState, useMemo, useEffect } from 'react';
import { Booking, PropertySettings, BookingStatus, ReservationActivity, AvailabilityBlock } from '../types';
import { Language, TRANSLATIONS } from '../translations';
import { apiClient } from '../services/apiClient';
import {
  Lock,
  Calendar as CalendarIcon,
  Search,
  Download,
  Copy,
  Phone,
  Mail,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  Clock,
  Archive,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  PhoneCall,
  History,
  FileText,
  Sliders,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  Check,
  Trash2,
  User,
  Sparkles,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OwnerDashboardProps {
  bookings: Booking[];
  settings: PropertySettings;
  onUpdateSettings: (settings: PropertySettings) => void;
  onAddBooking: (booking: Booking) => void;
  onUpdateBookingStatus: (id: string, status: BookingStatus, note?: string) => void;
  onUpdateBooking: (booking: Booking) => void;
  onDeleteBooking: (id: string) => void;
  onArchiveBooking: (id: string) => void;
  onRestoreBooking: (id: string) => void;
  onAddNote: (id: string, noteText: string, author: string) => void;
  onBlockDates: (block: { checkIn: string; checkOut: string; reason: string; createdBy: string }) => void;
  onUnblockDates: (id: string) => void;
  onRefreshBookings?: () => Promise<void>;
  isRefreshing?: boolean;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function OwnerDashboard({
  bookings,
  settings,
  onUpdateSettings,
  onUpdateBookingStatus,
  onDeleteBooking,
  onArchiveBooking,
  onRestoreBooking,
  onAddNote,
  onBlockDates,
  onRefreshBookings,
  isRefreshing = false,
  language
}: OwnerDashboardProps) {
  const t = TRANSLATIONS[language];

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!apiClient.getToken());
  const [authMode, setAuthMode] = useState<'pin' | 'email'>('pin');
  const [adminEmail, setAdminEmail] = useState('');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'calendar' | 'activity' | 'settings'>('dashboard');

  // Activity Audit Log
  const [activityList, setActivityList] = useState<ReservationActivity[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

  // Load activity log when tab is active or authenticated
  const loadActivityData = async () => {
    try {
      setIsLoadingActivity(true);
      const data = await apiClient.getReservationActivity();
      setActivityList(data);
    } catch (e) {
      console.warn('Could not load activity log:', e);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadActivityData();
    }
  }, [isAuthenticated, activeTab]);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilterFrom, setDateFilterFrom] = useState('');
  const [dateFilterTo, setDateFilterTo] = useState('');
  const [sortBy, setSortBy] = useState<'checkIn' | 'createdAt' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selected Booking Detail Modal / Drawer
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);

  // Manual Block Dates Modal State
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockCheckIn, setBlockCheckIn] = useState('');
  const [blockCheckOut, setBlockCheckOut] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [blockAuthor, setBlockAuthor] = useState('');
  const [blockError, setBlockError] = useState('');

  // New Note State inside Detail View
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteAuthor, setNewNoteAuthor] = useState('');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Calendar tab navigation state
  const [calendarDate, setCalendarDate] = useState(() => new Date());

  // Settings Edit State
  const [tempCapacity, setTempCapacity] = useState(settings.capacity);
  const [tempMinNights, setTempMinNights] = useState(settings.minStayNights || settings.minDays || 2);
  const [tempCheckInTime, setTempCheckInTime] = useState(settings.checkInTime || '16:00');
  const [tempCheckOutTime, setTempCheckOutTime] = useState(settings.checkOutTime || '11:00');
  const [tempContactEmail, setTempContactEmail] = useState(settings.contactEmail || 'acivit@coac.net');
  const [tempContactPhone, setTempContactPhone] = useState(settings.contactPhone || '+34 629 30 85 70');
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // Format date helper
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const guestsWord = language === 'en' ? 'guests' : 'huéspedes';

  // Login handler connected to backend & admin_users verification
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setPinError('');
    try {
      if (authMode === 'pin') {
        await apiClient.verifyFamilyPin(pin);
      } else {
        await apiClient.verifyFamilyPin(undefined, adminEmail);
      }
      setIsAuthenticated(true);
      if (onRefreshBookings) {
        await onRefreshBookings();
      }
      loadActivityData();
    } catch (err: any) {
      setPinError(err.message || t.dashPinError);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    apiClient.setToken(null);
    setIsAuthenticated(false);
    setPin('');
    setAdminEmail('');
  };

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  // Compute stats strictly with real data (no fake numbers)
  const metrics = useMemo(() => {
    const totalCount = bookings.length;
    const newRequests = bookings.filter((b) => b.status === 'pending' || b.status === 'new_request');
    const pendingReview = bookings.filter((b) => b.status === 'pending' || b.status === 'pending_review');
    const contacted = bookings.filter((b) => b.status === 'contacted');
    const confirmed = bookings.filter((b) => b.status === 'confirmed');
    const rejected = bookings.filter((b) => b.status === 'rejected');
    const cancelled = bookings.filter((b) => b.status === 'cancelled');
    const blocked = bookings.filter((b) => b.status === 'blocked' || b.isManualBlock);

    // Upcoming arrivals (confirmed, checkIn >= today)
    const upcomingArrivals = confirmed
      .filter((b) => b.checkIn >= todayStr)
      .sort((a, b) => a.checkIn.localeCompare(b.checkIn));

    // Upcoming departures (confirmed, checkOut >= today)
    const upcomingDepartures = confirmed
      .filter((b) => b.checkOut >= todayStr)
      .sort((a, b) => a.checkOut.localeCompare(b.checkOut));

    // Calculate nights for confirmed bookings
    let totalConfirmedNights = 0;
    const occupiedDaysSet = new Set<string>();

    confirmed.forEach((b) => {
      const [sY, sM, sD] = b.checkIn.split('-').map(Number);
      const [eY, eM, eD] = b.checkOut.split('-').map(Number);
      const start = new Date(sY, sM - 1, sD);
      const end = new Date(eY, eM - 1, eD);
      const nights = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      totalConfirmedNights += nights;

      let curr = new Date(start);
      while (curr < end) {
        const y = curr.getFullYear();
        const m = String(curr.getMonth() + 1).padStart(2, '0');
        const d = String(curr.getDate()).padStart(2, '0');
        occupiedDaysSet.add(`${y}-${m}-${d}`);
        curr.setDate(curr.getDate() + 1);
      }
    });

    const occupiedDaysCount = occupiedDaysSet.size;

    // Average nights per confirmed booking
    const avgNights = confirmed.length > 0 ? (totalConfirmedNights / confirmed.length).toFixed(1) : null;

    // Current month bookings
    const currentYear = new Date().getFullYear();
    const currentMonthNum = String(new Date().getMonth() + 1).padStart(2, '0');
    const currentMonthPrefix = `${currentYear}-${currentMonthNum}`;

    const currentMonthBookings = bookings.filter(
      (b) => b.checkIn.startsWith(currentMonthPrefix) || b.createdAt.startsWith(currentMonthPrefix)
    );

    // Previous month comparison
    const prevMonthDate = new Date(currentYear, new Date().getMonth() - 1, 1);
    const prevMonthPrefix = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
    const prevMonthBookings = bookings.filter(
      (b) => b.checkIn.startsWith(prevMonthPrefix) || b.createdAt.startsWith(prevMonthPrefix)
    );

    return {
      totalCount,
      newRequestsCount: newRequests.length,
      pendingCount: pendingReview.length,
      contactedCount: contacted.length,
      confirmedCount: confirmed.length,
      rejectedCount: rejected.length,
      cancelledCount: cancelled.length,
      blockedCount: blocked.length,
      upcomingArrivals,
      upcomingDepartures,
      totalConfirmedNights,
      occupiedDaysCount,
      avgNights,
      currentMonthCount: currentMonthBookings.length,
      prevMonthCount: prevMonthBookings.length
    };
  }, [bookings, todayStr]);

  // Filtered & Sorted bookings
  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        // Status filter
        if (statusFilter !== 'all' && b.status !== statusFilter) {
          return false;
        }

        // Date range filter
        if (dateFilterFrom && b.checkOut < dateFilterFrom) {
          return false;
        }
        if (dateFilterTo && b.checkIn > dateFilterTo) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const nameMatch = b.guestName.toLowerCase().includes(q);
          const emailMatch = b.guestEmail?.toLowerCase().includes(q);
          const phoneMatch = b.guestPhone?.toLowerCase().includes(q);
          const idMatch = b.id.toLowerCase().includes(q);
          return nameMatch || emailMatch || phoneMatch || idMatch;
        }

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'checkIn') {
          comp = a.checkIn.localeCompare(b.checkIn);
        } else if (sortBy === 'createdAt') {
          comp = a.createdAt.localeCompare(b.createdAt);
        } else if (sortBy === 'status') {
          comp = a.status.localeCompare(b.status);
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [bookings, statusFilter, dateFilterFrom, dateFilterTo, searchQuery, sortBy, sortOrder]);

  // Selected booking object
  const activeSelectedBooking = useMemo(() => {
    if (!selectedBookingId) return null;
    return bookings.find((b) => b.id === selectedBookingId) || null;
  }, [bookings, selectedBookingId]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Huésped',
      'Email',
      'Teléfono',
      'Check-In',
      'Check-Out',
      'Huéspedes',
      'Estado',
      'Fecha Creación',
      'Mensaje Huésped',
      'Notas Internas'
    ];

    const rows = filteredBookings.map((b) => [
      `"${b.id}"`,
      `"${(b.guestName || '').replace(/"/g, '""')}"`,
      `"${(b.guestEmail || '').replace(/"/g, '""')}"`,
      `"${(b.guestPhone || '').replace(/"/g, '""')}"`,
      `"${b.checkIn}"`,
      `"${b.checkOut}"`,
      b.guestsCount,
      `"${b.status}"`,
      `"${b.createdAt}"`,
      `"${(b.notes || '').replace(/"/g, '""')}"`,
      `"${(b.internalNotes || []).map((n) => `[${n.author}: ${n.text}]`).join('; ').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reservas_tarongers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add internal note
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId || !newNoteText.trim()) return;
    onAddNote(selectedBookingId, newNoteText.trim(), newNoteAuthor.trim() || 'Familia');
    setNewNoteText('');
  };

  // Manual block submit
  const handleBlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBlockError('');

    if (!blockCheckIn || !blockCheckOut) {
      setBlockError('Selecciona las fechas de inicio y fin.');
      return;
    }

    if (blockCheckOut <= blockCheckIn) {
      setBlockError(t.errInvalidRange);
      return;
    }

    // Check collision with confirmed bookings
    const hasCollision = bookings.some((b) => {
      if (b.status !== 'confirmed') return false;
      return !(blockCheckOut <= b.checkIn || blockCheckIn >= b.checkOut);
    });

    if (hasCollision) {
      setBlockError('Existen reservas confirmadas en el rango de fechas que deseas bloquear.');
      return;
    }

    onBlockDates({
      checkIn: blockCheckIn,
      checkOut: blockCheckOut,
      reason: blockReason || 'Bloqueo manual',
      createdBy: blockAuthor || 'Familia'
    });

    setShowBlockModal(false);
    setBlockCheckIn('');
    setBlockCheckOut('');
    setBlockReason('');
    setBlockAuthor('');
  };

  // Settings submit
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      capacity: tempCapacity,
      minDays: tempMinNights,
      minStayNights: tempMinNights,
      checkInTime: tempCheckInTime,
      checkOutTime: tempCheckOutTime,
      contactEmail: tempContactEmail,
      contactPhone: tempContactPhone
    });
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  // Status badge renderer
  const renderStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'new_request':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100/80 text-blue-900 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            {t.statusNewRequest}
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100/80 text-amber-900 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-700" />
            {t.statusPendingReview}
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-100/80 text-purple-900 border border-purple-200">
            <PhoneCall className="w-3 h-3 text-purple-700" />
            {t.statusContacted}
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100/80 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            {t.statusConfirmed}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-stone-200/70 text-stone-700 border border-stone-300">
            <XCircle className="w-3 h-3 text-stone-500" />
            {t.statusRejected}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-100/80 text-red-900 border border-red-200">
            <XCircle className="w-3 h-3 text-red-700" />
            {t.statusCancelled}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-100/80 text-teal-900 border border-teal-200">
            <Check className="w-3 h-3 text-teal-700" />
            {t.statusCompleted}
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-stone-200 text-stone-700 border border-stone-300">
            <Archive className="w-3 h-3 text-stone-600" />
            {t.statusArchived}
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-stone-200 text-stone-800 border border-stone-400">
            <Lock className="w-3 h-3 text-stone-600" />
            {t.statusBlocked}
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  // Unauthenticated screen (PIN Protection)
  if (!isAuthenticated) {
    return (
      <section className="min-h-[85vh] flex items-center justify-center py-16 px-4 bg-[#FAFAF5] relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#1C2E15]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-stone-200/90 p-8 sm:p-10 text-center relative z-10">
          <div className="w-16 h-16 bg-[#1C2E15]/10 text-[#1C2E15] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xs ring-8 ring-[#1C2E15]/5">
            <Lock className="w-8 h-8 text-[#1C2E15]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-[11px] font-mono mb-3">
            <span>Casa Tarongers 1967</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
            {t.familyDashboard}
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm mb-5 leading-relaxed">
            {authMode === 'pin' ? t.dashPinDesc : 'Accede utilizando tu correo autorizado en la tabla admin_users de Supabase.'}
          </p>

          {/* Auth Mode Toggle */}
          <div className="flex bg-stone-100 p-1 rounded-xl mb-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setAuthMode('pin'); setPinError(''); }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${authMode === 'pin' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-900'}`}
            >
              PIN Familiar (1967)
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('email'); setPinError(''); }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${authMode === 'email' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-900'}`}
            >
              Email Autorizado
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              {authMode === 'pin' ? (
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    disabled={isLoggingIn}
                    className="w-full text-center tracking-[0.6em] text-2xl font-mono py-3.5 px-4 rounded-2xl border border-stone-300 focus:ring-2 focus:ring-[#1C2E15]/20 focus:border-[#1C2E15] outline-none bg-stone-50/60 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3.5 top-4 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="acivit@coac.net"
                    disabled={isLoggingIn}
                    className="w-full text-center text-sm font-sans py-3.5 px-4 rounded-2xl border border-stone-300 focus:ring-2 focus:ring-[#1C2E15]/20 focus:border-[#1C2E15] outline-none bg-stone-50/60 transition-all"
                  />
                  <p className="text-[11px] text-stone-400 mt-1.5">Verifica si el email está registrado en <code>admin_users</code></p>
                </div>
              )}

              {pinError && (
                <p className="text-red-600 text-xs mt-2.5 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {pinError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#1C2E15] text-white font-sans font-semibold text-sm hover:bg-[#121C0E] transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <span>{t.dashPinBtn}</span>
              )}
            </button>
          </form>

          <p className="text-[11px] text-stone-400 mt-6 font-mono">
            {language === 'ca' ? 'Ús exclusiu de la família Civit' : language === 'en' ? 'Civit family exclusive access' : 'Uso exclusivo de la familia Civit'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen py-8 sm:py-12 bg-[#FAFAF5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Top Header Bar */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200/90 p-5 sm:p-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C2E15]/10 text-[#1C2E15] text-xs font-serif font-bold uppercase tracking-wider mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-terracotta" />
              <span>{language === 'ca' ? 'Gestió Familiar' : language === 'en' ? 'Family Management' : 'Gestión Familiar'}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
              {t.familyDashboard}
            </h1>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {onRefreshBookings && (
              <button
                type="button"
                onClick={async () => {
                  await onRefreshBookings();
                  loadActivityData();
                }}
                disabled={isRefreshing}
                className="px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-sans font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                title="Actualizar datos desde la base de datos real"
              >
                <RefreshCw className={`w-4 h-4 text-stone-600 ${isRefreshing ? 'animate-spin text-[#1C2E15]' : ''}`} />
                <span className="hidden sm:inline">{isRefreshing ? 'Sincronizando...' : 'Actualizar'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowBlockModal(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-sans font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 border border-stone-300 cursor-pointer active:scale-95"
            >
              <Lock className="w-4 h-4 text-stone-600" />
              <span>{t.btnBlockDates}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-red-50 hover:text-red-700 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              {language === 'ca' ? 'Tancar sessió' : language === 'en' ? 'Sign out' : 'Cerrar sesión'}
            </button>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex border border-stone-200/90 bg-white rounded-2xl p-1.5 shadow-2xs overflow-x-auto gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#1C2E15] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{t.dashSummary}</span>
            {metrics.newRequestsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-accent-terracotta text-white">
                {metrics.newRequestsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-[#1C2E15] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t.dashTabBookings}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700">
              {metrics.totalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-[#1C2E15] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>{t.dashTabCalendar}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'activity'
                ? 'bg-[#1C2E15] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{language === 'ca' ? 'Activitat' : language === 'en' ? 'Activity' : 'Actividad'}</span>
            {activityList.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700">
                {activityList.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#1C2E15] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>{t.dashTabSettings}</span>
          </button>
        </div>

        {/* TAB 1: DASHBOARD (Metrics strictly from real data) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Primary Status Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
              <div className="bg-white rounded-3xl p-5 border border-blue-200/80 shadow-2xs">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block mb-1">
                  {t.metricNewRequests}
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-serif font-bold text-blue-950">
                    {metrics.newRequestsCount}
                  </span>
                  {metrics.newRequestsCount > 0 && (
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                  )}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-amber-200/80 shadow-2xs">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block mb-1">
                  {t.metricPendingReview}
                </span>
                <span className="text-3xl font-serif font-bold text-amber-950">
                  {metrics.pendingCount}
                </span>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-emerald-200/80 shadow-2xs">
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
                  {t.metricConfirmed}
                </span>
                <span className="text-3xl font-serif font-bold text-emerald-950">
                  {metrics.confirmedCount}
                </span>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-2xs">
                <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider block mb-1">
                  {t.metricRejected}
                </span>
                <span className="text-3xl font-serif font-bold text-stone-800">
                  {metrics.rejectedCount}
                </span>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-2xs col-span-2 sm:col-span-1">
                <span className="text-xs font-semibold text-red-700 uppercase tracking-wider block mb-1">
                  {t.metricCancelled}
                </span>
                <span className="text-3xl font-serif font-bold text-red-950">
                  {metrics.cancelledCount}
                </span>
              </div>
            </div>

            {/* Operational Stay Real Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-2xs">
                <span className="text-xs text-stone-500 block mb-1 font-medium">{t.metricNightsBooked}</span>
                <span className="text-2xl font-mono font-bold text-stone-900">
                  {metrics.totalConfirmedNights}{' '}
                  <span className="text-xs font-sans text-stone-500 font-normal">
                    {language === 'en' ? 'nights' : 'noches'}
                  </span>
                </span>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-2xs">
                <span className="text-xs text-stone-500 block mb-1 font-medium">{t.metricOccupiedDays}</span>
                <span className="text-2xl font-mono font-bold text-stone-900">
                  {metrics.occupiedDaysCount}{' '}
                  <span className="text-xs font-sans text-stone-500 font-normal">
                    {language === 'en' ? 'days' : 'días'}
                  </span>
                </span>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-2xs">
                <span className="text-xs text-stone-500 block mb-1 font-medium">{t.metricAvgNights}</span>
                <span className="text-2xl font-mono font-bold text-stone-900">
                  {metrics.avgNights ? (
                    <>
                      {metrics.avgNights}{' '}
                      <span className="text-xs font-sans text-stone-500 font-normal">
                        {language === 'en' ? 'nights/res' : 'noches/res'}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-sans font-normal text-stone-400">
                      {t.metricNoData}
                    </span>
                  )}
                </span>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-2xs">
                <span className="text-xs text-stone-500 block mb-1 font-medium">
                  {language === 'ca' ? 'Comparativa mensual' : language === 'en' ? 'Monthly comparison' : 'Comparativa mensual'}
                </span>
                <div className="text-xs text-stone-700 space-y-1 pt-0.5">
                  <div className="flex justify-between">
                    <span>{t.metricCurrentMonth}:</span>
                    <span className="font-mono font-bold text-stone-900">{metrics.currentMonthCount}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>{language === 'ca' ? 'Mes anterior' : language === 'en' ? 'Previous month' : 'Mes anterior'}:</span>
                    <span className="font-mono">{metrics.prevMonthCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Arrivals and Departures Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Arrivals */}
              <div className="bg-white rounded-3xl shadow-sm border border-stone-200/90 p-5 sm:p-7">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <CalendarIcon className="w-4 h-4 text-emerald-800" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      {t.metricUpcomingArrivals}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {metrics.upcomingArrivals.length}
                  </span>
                </div>

                {metrics.upcomingArrivals.length === 0 ? (
                  <p className="text-xs text-stone-400 py-8 text-center">{t.metricNoData}</p>
                ) : (
                  <div className="space-y-2.5">
                    {metrics.upcomingArrivals.slice(0, 5).map((b) => (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBookingId(b.id)}
                        className="p-3.5 rounded-2xl bg-stone-50/80 hover:bg-stone-100/90 border border-stone-200/80 flex items-center justify-between cursor-pointer transition-all hover:shadow-2xs active:scale-[0.99]"
                      >
                        <div>
                          <span className="text-xs font-mono font-bold text-emerald-800 block">
                            {b.checkIn}
                          </span>
                          <span className="font-semibold text-stone-900 text-sm">{b.guestName}</span>
                          <span className="text-xs text-stone-500 block">
                            {b.guestsCount} {guestsWord} &bull; {b.id}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Departures */}
              <div className="bg-white rounded-3xl shadow-sm border border-stone-200/90 p-5 sm:p-7">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-amber-800" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      {t.metricUpcomingDepartures}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    {metrics.upcomingDepartures.length}
                  </span>
                </div>

                {metrics.upcomingDepartures.length === 0 ? (
                  <p className="text-xs text-stone-400 py-8 text-center">{t.metricNoData}</p>
                ) : (
                  <div className="space-y-2.5">
                    {metrics.upcomingDepartures.slice(0, 5).map((b) => (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBookingId(b.id)}
                        className="p-3.5 rounded-2xl bg-stone-50/80 hover:bg-stone-100/90 border border-stone-200/80 flex items-center justify-between cursor-pointer transition-all hover:shadow-2xs active:scale-[0.99]"
                      >
                        <div>
                          <span className="text-xs font-mono font-bold text-amber-800 block">
                            {b.checkOut}
                          </span>
                          <span className="font-semibold text-stone-900 text-sm">{b.guestName}</span>
                          <span className="text-xs text-stone-500 block">
                            {b.guestsCount} {guestsWord} &bull; {b.id}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-stone-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOOKINGS LIST & MANAGEMENT */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200/90 p-5 sm:p-7 space-y-6">
            {/* Filter and Action Header */}
            <div className="flex flex-col lg:flex-row gap-3.5 justify-between items-stretch lg:items-center">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.btnSearchPlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-stone-300 focus:ring-2 focus:ring-[#1C2E15]/20 focus:border-[#1C2E15] outline-none bg-stone-50/70 transition-all font-sans"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filters & Export */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Status selector */}
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-stone-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 outline-none text-stone-700 font-medium cursor-pointer"
                  >
                    <option value="all">{t.btnFilterAll}</option>
                    <option value="new_request">{t.statusNewRequest}</option>
                    <option value="pending_review">{t.statusPendingReview}</option>
                    <option value="contacted">{t.statusContacted}</option>
                    <option value="confirmed">{t.statusConfirmed}</option>
                    <option value="rejected">{t.statusRejected}</option>
                    <option value="cancelled">{t.statusCancelled}</option>
                    <option value="completed">{t.statusCompleted}</option>
                    <option value="archived">{t.statusArchived}</option>
                    <option value="blocked">{t.statusBlocked}</option>
                  </select>
                </div>

                {/* Date range filter */}
                <input
                  type="date"
                  value={dateFilterFrom}
                  onChange={(e) => setDateFilterFrom(e.target.value)}
                  title="Desde"
                  className="px-2.5 py-1.5 rounded-xl border border-stone-300 bg-stone-50 outline-none text-stone-700 text-xs"
                />
                <span className="text-stone-400">&rarr;</span>
                <input
                  type="date"
                  value={dateFilterTo}
                  onChange={(e) => setDateFilterTo(e.target.value)}
                  title="Hasta"
                  className="px-2.5 py-1.5 rounded-xl border border-stone-300 bg-stone-50 outline-none text-stone-700 text-xs"
                />

                {/* Sort selector */}
                <div className="flex items-center gap-1">
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="px-2.5 py-2 rounded-xl border border-stone-300 bg-stone-50 outline-none text-stone-700 font-medium cursor-pointer"
                  >
                    <option value="createdAt">
                      {language === 'ca' ? 'Data de creació' : language === 'en' ? 'Creation date' : 'Fecha de solicitud'}
                    </option>
                    <option value="checkIn">
                      {language === 'ca' ? 'Data d’arribada' : language === 'en' ? 'Check-in date' : 'Fecha de llegada'}
                    </option>
                    <option value="status">
                      {language === 'ca' ? 'Estat' : language === 'en' ? 'Status' : 'Estado'}
                    </option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-600 cursor-pointer"
                    title={sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Export CSV Button */}
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium flex items-center gap-1.5 transition-colors border border-stone-300 cursor-pointer active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-stone-600" />
                  <span>{t.btnExportCsv}</span>
                </button>
              </div>
            </div>

            {/* RESPONSIVE VIEW 1: Mobile Cards List (hidden on desktop md:) */}
            <div className="block md:hidden space-y-3">
              {filteredBookings.length === 0 ? (
                <div className="py-12 text-center text-stone-400 text-xs">
                  {t.metricNoData}
                </div>
              ) : (
                filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBookingId(b.id)}
                    className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 space-y-3 transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-stone-500">{b.id}</span>
                      {renderStatusBadge(b.status)}
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-stone-900 text-base">{b.guestName}</h4>
                      <p className="text-xs font-mono text-stone-600 mt-0.5">
                        {b.checkIn} &rarr; {b.checkOut}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-200/60" onClick={(e) => e.stopPropagation()}>
                      <span>{b.guestsCount > 0 ? `${b.guestsCount} ${guestsWord}` : '—'}</span>

                      <div className="flex items-center gap-2">
                        {b.guestPhone && (
                          <a
                            href={`https://wa.me/${b.guestPhone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg bg-emerald-50 text-emerald-700"
                            title="WhatsApp"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {b.guestPhone && (
                          <a
                            href={`tel:${b.guestPhone}`}
                            className="p-2 rounded-lg bg-stone-200/70 text-stone-700"
                            title="Llamar"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {b.guestEmail && (
                          <a
                            href={`mailto:${b.guestEmail}`}
                            className="p-2 rounded-lg bg-stone-200/70 text-stone-700"
                            title="Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedBookingId(b.id)}
                          className="px-3 py-1.5 rounded-lg bg-stone-800 text-white text-[11px] font-medium"
                        >
                          {language === 'ca' ? 'Detalls' : language === 'en' ? 'Details' : 'Detalles'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* RESPONSIVE VIEW 2: Desktop Table (hidden on mobile < md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-serif uppercase tracking-wider text-stone-500">
                    <th className="py-3 px-3">ID</th>
                    <th className="py-3 px-3">{t.calFullName}</th>
                    <th className="py-3 px-3">
                      {language === 'ca' ? 'Dates' : language === 'en' ? 'Dates' : 'Fechas'}
                    </th>
                    <th className="py-3 px-3">{t.calNumGuests}</th>
                    <th className="py-3 px-3">
                      {language === 'ca' ? 'Estat' : language === 'en' ? 'Status' : 'Estado'}
                    </th>
                    <th className="py-3 px-3">
                      {language === 'ca' ? 'Contacte' : language === 'en' ? 'Contact' : 'Contacto'}
                    </th>
                    <th className="py-3 px-3 text-right">
                      {language === 'ca' ? 'Accions' : language === 'en' ? 'Actions' : 'Acciones'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-stone-400">
                        {t.metricNoData}
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr
                        key={b.id}
                        className="hover:bg-stone-50/80 transition-colors group cursor-pointer"
                        onClick={() => setSelectedBookingId(b.id)}
                      >
                        <td className="py-3.5 px-3 font-mono text-stone-500 font-bold text-[11px]">
                          {b.id}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-stone-900">{b.guestName}</div>
                          {b.internalNotes && b.internalNotes.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium mt-0.5">
                              <FileText className="w-2.5 h-2.5" />
                              {b.internalNotes.length} {t.notesTitle.toLowerCase()}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-stone-700">
                          <div>{b.checkIn} &rarr; {b.checkOut}</div>
                        </td>
                        <td className="py-3.5 px-3 text-stone-600">
                          {b.guestsCount > 0 ? `${b.guestsCount} ${guestsWord}` : '—'}
                        </td>
                        <td className="py-3.5 px-3">{renderStatusBadge(b.status)}</td>
                        <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            {b.guestEmail && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(b.guestEmail, `email-${b.id}`)}
                                className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-600 cursor-pointer"
                                title={`Copiar email: ${b.guestEmail}`}
                              >
                                {copiedItem === `email-${b.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Mail className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}

                            {b.guestPhone && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(b.guestPhone, `phone-${b.id}`)}
                                className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-600 cursor-pointer"
                                title={`Copiar teléfono: ${b.guestPhone}`}
                              >
                                {copiedItem === `phone-${b.id}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Phone className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}

                            {b.guestPhone && (
                              <a
                                href={`https://wa.me/${b.guestPhone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-700 cursor-pointer"
                                title="Abrir WhatsApp"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {b.status === 'new_request' || b.status === 'pending_review' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onUpdateBookingStatus(b.id, 'confirmed')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold text-[11px] cursor-pointer"
                                  title={t.btnConfirm}
                                >
                                  {t.btnConfirm}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onUpdateBookingStatus(b.id, 'rejected')}
                                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-[11px] cursor-pointer"
                                  title={t.btnReject}
                                >
                                  {t.btnReject}
                                </button>
                              </>
                            ) : null}

                            <button
                              type="button"
                              onClick={() => setSelectedBookingId(b.id)}
                              className="px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 text-[11px] cursor-pointer"
                            >
                              {language === 'ca' ? 'Veure detalls' : language === 'en' ? 'View details' : 'Ver detalle'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: VISUAL CALENDAR */}
        {activeTab === 'calendar' && (
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200/90 p-5 sm:p-7 space-y-6">
            {/* Calendar Month Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1C2E15]/10 text-[#1C2E15] flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-[#1C2E15]" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-stone-900">
                  {calendarDate.toLocaleString(language === 'ca' ? 'ca-ES' : language === 'en' ? 'en-US' : 'es-ES', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))
                  }
                  className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarDate(new Date())}
                  className="px-3.5 py-1.5 rounded-xl border border-stone-200 text-xs font-medium hover:bg-stone-50 cursor-pointer"
                >
                  {language === 'ca' ? 'Avui' : language === 'en' ? 'Today' : 'Hoy'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))
                  }
                  className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 cursor-pointer active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Grid Days */}
            {(() => {
              const calYear = calendarDate.getFullYear();
              const calMonth = calendarDate.getMonth();
              const calDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
              const rawFirst = new Date(calYear, calMonth, 1).getDay();
              const calFirstDay = rawFirst === 0 ? 6 : rawFirst - 1;

              const weekLabels =
                language === 'ca'
                  ? ['Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte', 'Diumenge']
                  : language === 'en'
                  ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                  : ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

              return (
                <div>
                  <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-serif font-bold text-stone-500 uppercase tracking-wider">
                    {weekLabels.map((wl, i) => (
                      <div key={i} className="py-2">
                        {wl.slice(0, 3)}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {Array.from({ length: calFirstDay }).map((_, i) => (
                      <div key={`cal-pad-${i}`} className="min-h-[70px] sm:min-h-[95px] rounded-2xl bg-stone-50/50" />
                    ))}

                    {Array.from({ length: calDaysInMonth }).map((_, i) => {
                      const dayNum = i + 1;
                      const dStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(
                        dayNum
                      ).padStart(2, '0')}`;

                      // Find all bookings covering this day
                      const dayBookings = bookings.filter((b) => {
                        if (b.status === 'cancelled' || b.status === 'rejected' || b.status === 'archived') {
                          return false;
                        }
                        return dStr >= b.checkIn && dStr < b.checkOut;
                      });

                      const isToday = dStr === todayStr;

                      return (
                        <div
                          key={`cal-day-${dayNum}`}
                          className={`min-h-[70px] sm:min-h-[95px] p-1.5 sm:p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                            isToday
                              ? 'border-[#1C2E15] bg-[#1C2E15]/5'
                              : 'border-stone-200/80 bg-white hover:border-stone-400'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`text-xs font-mono font-bold ${
                                isToday ? 'text-[#1C2E15] bg-[#1C2E15]/10 px-1.5 py-0.5 rounded-md' : 'text-stone-700'
                              }`}
                            >
                              {dayNum}
                            </span>
                          </div>

                          <div className="space-y-1">
                            {dayBookings.map((b) => {
                              let badgeClass = 'bg-stone-100 text-stone-800 border-stone-300';
                              if (b.status === 'confirmed') {
                                badgeClass = 'bg-emerald-100 text-emerald-900 border-emerald-300';
                              } else if (b.status === 'new_request') {
                                badgeClass = 'bg-blue-100 text-blue-900 border-blue-300';
                              } else if (b.status === 'pending_review' || b.status === 'contacted') {
                                badgeClass = 'bg-amber-100 text-amber-900 border-amber-300';
                              } else if (b.status === 'blocked') {
                                badgeClass = 'bg-stone-200 text-stone-700 border-stone-400';
                              }

                              return (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => setSelectedBookingId(b.id)}
                                  className={`w-full text-left p-1 rounded-lg text-[9px] sm:text-[10px] font-medium border truncate block cursor-pointer ${badgeClass}`}
                                  title={`${b.guestName} (${b.status})`}
                                >
                                  {b.guestName}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Calendar Legend */}
            <div className="pt-4 border-t border-stone-200/80 flex flex-wrap items-center gap-4 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-100 border border-emerald-400" />
                <span>{t.statusConfirmed}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-blue-100 border border-blue-400" />
                <span>{t.statusNewRequest}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-amber-100 border border-amber-400" />
                <span>{t.statusPendingReview}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-stone-200 border border-stone-400" />
                <span>{t.statusBlocked}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200/90 p-6 sm:p-8 max-w-2xl mx-auto space-y-6">
            <div className="border-b border-stone-200/80 pb-4">
              <h3 className="font-serif text-2xl font-bold text-stone-900">
                {t.dashTabSettings}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {language === 'ca'
                  ? 'Ajusta les regles generals del refugi i les dades de contacte de la família.'
                  : language === 'en'
                  ? 'Adjust general accommodation rules and family contact info.'
                  : 'Ajusta las reglas generales del alojamiento y los datos de contacto familiar.'}
              </p>
            </div>

            {settingsSavedMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{language === 'ca' ? 'Configuració guardada correctament.' : language === 'en' ? 'Settings saved successfully.' : 'Configuración guardada correctamente.'}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">
                  {language === 'ca' ? 'Capacitat màxima d’hostes' : language === 'en' ? 'Maximum guest capacity' : 'Capacidad máxima de huéspedes'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={tempCapacity}
                  onChange={(e) => setTempCapacity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50/70 outline-none focus:ring-2 focus:ring-[#1C2E15]/20 focus:border-[#1C2E15]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">
                  {language === 'ca' ? 'Estada mínima (nits)' : language === 'en' ? 'Minimum stay (nights)' : 'Estancia mínima (noches)'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={tempMinNights}
                  onChange={(e) => setTempMinNights(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50/70 outline-none focus:ring-2 focus:ring-[#1C2E15]/20 focus:border-[#1C2E15]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">
                    {language === 'ca' ? 'Hora d’entrada (Check-in)' : language === 'en' ? 'Check-in time' : 'Hora de entrada (Check-in)'}
                  </label>
                  <input
                    type="text"
                    value={tempCheckInTime}
                    onChange={(e) => setTempCheckInTime(e.target.value)}
                    placeholder="16:00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50/70 outline-none focus:ring-2 focus:ring-[#1C2E15]/20 focus:border-[#1C2E15]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">
                    {language === 'ca' ? 'Hora de sortida (Check-out)' : language === 'en' ? 'Check-out time' : 'Hora de salida (Check-out)'}
                  </label>
                  <input
                    type="text"
                    value={tempCheckOutTime}
                    onChange={(e) => setTempCheckOutTime(e.target.value)}
                    placeholder="11:00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50/70 outline-none focus:ring-2 focus:ring-[#1C2E15]/20 focus:border-[#1C2E15]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">
                  {language === 'ca' ? 'Email de contacte familiar' : language === 'en' ? 'Family contact email' : 'Email de contacto familiar'}
                </label>
                <input
                  type="email"
                  value={tempContactEmail}
                  onChange={(e) => setTempContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50/70 outline-none focus:ring-2 focus:ring-[#1C2E15]/20 focus:border-[#1C2E15]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">
                  {language === 'ca' ? 'Telèfon de contacte familiar' : language === 'en' ? 'Family contact phone' : 'Teléfono de contacto familiar'}
                </label>
                <input
                  type="text"
                  value={tempContactPhone}
                  onChange={(e) => setTempContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50/70 outline-none focus:ring-2 focus:ring-[#1C2E15]/20 focus:border-[#1C2E15]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-[#1C2E15] text-white font-semibold text-sm hover:bg-[#121C0E] transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-[0.99]"
              >
                {language === 'ca' ? 'Guardar configuració' : language === 'en' ? 'Save settings' : 'Guardar configuración'}
              </button>
            </form>
          </div>
        )}

        {/* TAB: ACTIVITY LOG (Supabase: reservation_activity) */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-3xl shadow-sm border border-stone-200/90 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#1C2E15]/10 text-[#1C2E15] text-xs font-mono font-semibold">
                    Supabase: reservation_activity
                  </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  {language === 'ca' ? 'Historial d’Activitat i Auditoria' : language === 'en' ? 'Activity and Audit History' : 'Historial de Actividad y Auditoría'}
                </h3>
              </div>
              <button
                type="button"
                onClick={loadActivityData}
                disabled={isLoadingActivity}
                className="px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingActivity ? 'animate-spin text-[#1C2E15]' : ''}`} />
                <span>{isLoadingActivity ? 'Actualitzant...' : 'Recarregar'}</span>
              </button>
            </div>

            {isLoadingActivity && activityList.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-sm flex flex-col items-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-[#1C2E15]" />
                <span>Carregant registre d’auditoria...</span>
              </div>
            ) : activityList.length === 0 ? (
              <div className="py-12 text-center text-stone-500 text-sm bg-[#FAFAF5] rounded-2xl border border-dashed border-stone-200">
                <History className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="font-medium">Encara no hi ha activitat registrada.</p>
                <p className="text-xs text-stone-400 mt-1">Qualsevol sol·licitud o canvi d'estat es guardarà a la base de dades.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activityList.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-stone-200/90 bg-[#FAFAF5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase tracking-wider ${
                          item.action === 'created'
                            ? 'bg-blue-100 text-blue-800'
                            : item.action === 'status_changed'
                            ? 'bg-purple-100 text-purple-800'
                            : item.action === 'note_added'
                            ? 'bg-amber-100 text-amber-800'
                            : item.action === 'block_created' || item.action === 'block_deleted'
                            ? 'bg-stone-200 text-stone-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.action}
                        </span>
                        {item.reservationId && (
                          <span className="font-mono text-[11px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                            {item.reservationId}
                          </span>
                        )}
                        <span className="text-stone-400">per</span>
                        <span className="font-semibold text-stone-800">{item.actor}</span>
                      </div>

                      {item.details && (
                        <p className="text-stone-600 font-sans">
                          {typeof item.details === 'string' ? item.details : JSON.stringify(item.details)}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0 text-stone-400 font-mono text-[11px]">
                      {new Date(item.createdAt).toLocaleString(language === 'ca' ? 'ca-ES' : language === 'en' ? 'en-US' : 'es-ES')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL: DETAIL & NOTES & AUDIT DRAWER */}
        <AnimatePresence>
          {activeSelectedBooking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto"
              >
                {/* Drawer Header */}
                <div className="flex items-start justify-between border-b border-stone-200/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                        {activeSelectedBooking.id}
                      </span>
                      {renderStatusBadge(activeSelectedBooking.status)}
                    </div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                      {activeSelectedBooking.guestName}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedBookingId(null)}
                    className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Stay Info & Contact Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#FAFAF5] p-5 rounded-2xl border border-stone-200/80">
                  <div>
                    <span className="text-stone-400 block mb-1 font-medium">
                      {language === 'ca' ? 'Dates d’estada' : language === 'en' ? 'Stay dates' : 'Fechas de estancia'}
                    </span>
                    <span className="font-mono font-bold text-stone-900 text-sm">
                      {activeSelectedBooking.checkIn} &rarr; {activeSelectedBooking.checkOut}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-400 block mb-1 font-medium">{t.calNumGuests}</span>
                    <span className="font-bold text-stone-900 text-sm">
                      {activeSelectedBooking.guestsCount > 0
                        ? `${activeSelectedBooking.guestsCount} ${guestsWord}`
                        : '—'}
                    </span>
                  </div>

                  {activeSelectedBooking.guestEmail && (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-stone-400 block mb-1 font-medium">Email</span>
                        <a
                          href={`mailto:${activeSelectedBooking.guestEmail}`}
                          className="font-mono text-[#1C2E15] hover:underline font-semibold"
                        >
                          {activeSelectedBooking.guestEmail}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(activeSelectedBooking.guestEmail, 'modal-email')}
                        className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-500 cursor-pointer"
                        title="Copiar"
                      >
                        {copiedItem === 'modal-email' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  {activeSelectedBooking.guestPhone && (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-stone-400 block mb-1 font-medium">{t.calPhone}</span>
                        <a
                          href={`tel:${activeSelectedBooking.guestPhone}`}
                          className="font-mono text-[#1C2E15] hover:underline font-semibold"
                        >
                          {activeSelectedBooking.guestPhone}
                        </a>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(activeSelectedBooking.guestPhone, 'modal-phone')}
                          className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-500 cursor-pointer"
                          title="Copiar"
                        >
                          {copiedItem === 'modal-phone' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={`https://wa.me/${activeSelectedBooking.guestPhone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          title="WhatsApp"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Guest Message */}
                {activeSelectedBooking.notes && (
                  <div>
                    <h4 className="font-semibold text-xs text-stone-700 mb-1.5 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
                      <span>{t.calMessageLabel}</span>
                    </h4>
                    <p className="text-xs text-stone-700 bg-stone-50 p-3.5 rounded-xl border border-stone-200 whitespace-pre-wrap leading-relaxed font-sans">
                      {activeSelectedBooking.notes}
                    </p>
                  </div>
                )}

                {/* Status Action Buttons */}
                <div className="border-t border-b border-stone-200/80 py-4 space-y-2.5">
                  <span className="text-xs font-semibold text-stone-700 block">
                    {language === 'ca' ? 'Canviar estat de la sol·licitud' : language === 'en' ? 'Update request status' : 'Cambiar estado de la solicitud'}:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateBookingStatus(activeSelectedBooking.id, 'confirmed')}
                      className="px-3 py-2 rounded-xl bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {t.btnConfirm}
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateBookingStatus(activeSelectedBooking.id, 'contacted')}
                      className="px-3 py-2 rounded-xl bg-purple-100 text-purple-900 font-semibold text-xs hover:bg-purple-200 flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      {language === 'ca' ? 'Marcar contactada' : language === 'en' ? 'Mark contacted' : 'Marcar contactada'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateBookingStatus(activeSelectedBooking.id, 'rejected')}
                      className="px-3 py-2 rounded-xl bg-stone-200 text-stone-800 font-semibold text-xs hover:bg-stone-300 flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <X className="w-3.5 h-3.5" />
                      {t.btnReject}
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateBookingStatus(activeSelectedBooking.id, 'cancelled')}
                      className="px-3 py-2 rounded-xl bg-red-100 text-red-900 font-semibold text-xs hover:bg-red-200 flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {t.btnCancel}
                    </button>

                    {activeSelectedBooking.status !== 'archived' ? (
                      <button
                        type="button"
                        onClick={() => onArchiveBooking(activeSelectedBooking.id)}
                        className="px-3 py-2 rounded-xl border border-stone-300 text-stone-600 text-xs hover:bg-stone-100 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        {t.btnArchive}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onRestoreBooking(activeSelectedBooking.id)}
                        className="px-3 py-2 rounded-xl border border-stone-300 text-stone-600 text-xs hover:bg-stone-100 flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {t.btnRestore}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setBookingToDelete(activeSelectedBooking);
                      }}
                      className="px-3 py-2 rounded-xl bg-red-50 text-red-700 text-xs hover:bg-red-100 flex items-center gap-1.5 ml-auto cursor-pointer"
                      title={t.btnDelete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t.btnDelete}
                    </button>
                  </div>
                </div>

                {/* Internal Private Notes Section */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-xs text-stone-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-stone-600" />
                    <span>{t.notesTitle}</span>
                  </h4>

                  {/* Add note form */}
                  <form onSubmit={handleCreateNote} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newNoteAuthor}
                        onChange={(e) => setNewNoteAuthor(e.target.value)}
                        placeholder={language === 'ca' ? 'Autor' : language === 'en' ? 'Author' : 'Autor'}
                        className="w-1/3 px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50/70"
                      />
                      <input
                        type="text"
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder={t.notesPlaceholder}
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 bg-stone-50/70"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!newNoteText.trim()}
                      className="px-4 py-2 rounded-xl bg-stone-800 text-white font-medium text-xs hover:bg-stone-900 disabled:opacity-50 cursor-pointer"
                    >
                      {t.notesAddBtn}
                    </button>
                  </form>

                  {/* Notes list */}
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {(activeSelectedBooking.internalNotes || []).length === 0 ? (
                      <p className="text-xs text-stone-400 italic">No hay notas internas todavía.</p>
                    ) : (
                      activeSelectedBooking.internalNotes?.map((n) => (
                        <div key={n.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                          <div className="flex justify-between text-[11px] text-stone-500 mb-1">
                            <span className="font-semibold text-stone-800">{n.author}</span>
                            <span>{new Date(n.createdAt || n.timestamp || '').toLocaleString(language === 'ca' ? 'ca-ES' : 'es-ES')}</span>
                          </div>
                          <p className="text-stone-800">{n.text || n.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Chronological Activity History */}
                <div className="border-t border-stone-200/80 pt-4 space-y-3">
                  <h4 className="font-semibold text-xs text-stone-800 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-stone-600" />
                    <span>{t.historyTitle}</span>
                  </h4>

                  <div className="space-y-2.5 max-h-44 overflow-y-auto">
                    {(activeSelectedBooking.history || []).map((act) => (
                      <div key={act.id} className="text-xs flex items-start gap-2.5 text-stone-600">
                        <span className="w-2 h-2 rounded-full bg-stone-400 mt-1.5 shrink-0" />
                        <div>
                          <span className="font-medium text-stone-900">{act.description}</span>
                          <span className="text-[10px] text-stone-400 block font-mono mt-0.5">
                            {new Date(act.timestamp).toLocaleString(language === 'ca' ? 'ca-ES' : 'es-ES')} &bull;{' '}
                            {act.actor || act.author}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL: MANUAL DATE BLOCK */}
        <AnimatePresence>
          {showBlockModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-md w-full p-6 sm:p-7 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-stone-200/80 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-stone-700" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-stone-900">
                      {t.btnBlockDates}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBlockModal(false)}
                    className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {blockError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{blockError}</span>
                  </div>
                )}

                <form onSubmit={handleBlockSubmit} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Check-in *</label>
                      <input
                        type="date"
                        value={blockCheckIn}
                        onChange={(e) => setBlockCheckIn(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50/70 outline-none focus:ring-2 focus:ring-[#1C2E15]/20 focus:border-[#1C2E15]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Check-out *</label>
                      <input
                        type="date"
                        value={blockCheckOut}
                        onChange={(e) => setBlockCheckOut(e.target.value)}
                        required
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50/70 outline-none focus:ring-2 focus:ring-[#1C2E15]/20 focus:border-[#1C2E15]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      {t.blockReasonPlaceholder}
                    </label>
                    <input
                      type="text"
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      placeholder="Ex: Manteniment, ús familiar..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50/70 outline-none focus:ring-2 focus:ring-[#1C2E15]/20 focus:border-[#1C2E15]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      {language === 'ca' ? 'Responsable' : language === 'en' ? 'Created by' : 'Responsable'}
                    </label>
                    <input
                      type="text"
                      value={blockAuthor}
                      onChange={(e) => setBlockAuthor(e.target.value)}
                      placeholder="Familia"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50/70 outline-none focus:ring-2 focus:ring-[#1C2E15]/20 focus:border-[#1C2E15]"
                    />
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowBlockModal(false)}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 font-medium hover:bg-stone-50 cursor-pointer"
                    >
                      {language === 'ca' ? 'Cancel·lar' : language === 'en' ? 'Cancel' : 'Cancelar'}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#1C2E15] text-white font-medium hover:bg-[#121C0E] cursor-pointer shadow-sm"
                    >
                      {t.btnBlockDates}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL: EXPLICIT DELETE CONFIRMATION */}
        <AnimatePresence>
          {bookingToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-sm w-full p-6 text-center space-y-4"
              >
                <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-7 h-7 text-red-600" />
                </div>

                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-900">
                    {t.deleteConfirmTitle}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                    {t.deleteConfirmDesc}
                  </p>
                  <p className="text-xs font-mono font-bold text-stone-900 mt-2.5 p-2 bg-stone-100 rounded-lg">
                    {bookingToDelete.guestName} &bull; {bookingToDelete.id}
                  </p>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingToDelete(null)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 text-xs font-medium hover:bg-stone-50 cursor-pointer"
                  >
                    {language === 'ca' ? 'Cancel·lar' : language === 'en' ? 'Cancel' : 'Cancelar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteBooking(bookingToDelete.id);
                      setBookingToDelete(null);
                      if (selectedBookingId === bookingToDelete.id) {
                        setSelectedBookingId(null);
                      }
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 cursor-pointer shadow-sm"
                  >
                    {t.btnDelete}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
