import React, { useState } from 'react';
import { Booking, PropertySettings } from '../types';
import { Language, TRANSLATIONS } from '../translations';
import {
  Calendar as CalendarIcon,
  Users,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Home,
  Sparkles,
  Phone,
  Mail,
  User,
  MessageSquare,
  AlertTriangle,
  RotateCcw,
  Info,
  CalendarCheck,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookingCalendarProps {
  bookings: Booking[];
  settings: PropertySettings;
  onAddBooking: (
    booking: Omit<Booking, 'id' | 'createdAt' | 'history' | 'internalNotes'>
  ) => Promise<string | void>;
  language: Language;
}

export default function BookingCalendar({
  bookings,
  settings,
  onAddBooking,
  language
}: BookingCalendarProps) {
  const t = TRANSLATIONS[language];

  // Current calendar view month
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Form selections
  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [message, setMessage] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // UX Feedback states
  const [formError, setFormError] = useState('');
  const [pendingOverlapWarning, setPendingOverlapWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedBookingId, setSubmittedBookingId] = useState<string | null>(null);

  // Today formatted as YYYY-MM-DD
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`;

  // Helper: Format Date to YYYY-MM-DD
  const formatDateString = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Days in current month & first day index (0 = Monday, 6 = Sunday)
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const rawFirstDay = new Date(year, month, 1).getDay();
  const firstDay = rawFirstDay === 0 ? 6 : rawFirstDay - 1;

  const monthNames =
    language === 'ca'
      ? ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre']
      : language === 'en'
      ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      : ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const weekDayLabels =
    language === 'ca'
      ? ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg']
      : language === 'en'
      ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
      : ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

  // Check state of a specific date in calendar
  const getDateStatus = (dateStr: string): {
    status: 'past' | 'available' | 'confirmed' | 'pending' | 'blocked';
    booking?: Booking;
  } => {
    if (dateStr < todayStr) {
      return { status: 'past' };
    }

    // Check confirmed or blocked bookings (hard collisions)
    const confirmedOrBlocked = bookings.find((b) => {
      if (b.status === 'rejected' || b.status === 'cancelled' || b.status === 'archived') return false;
      if (b.status === 'confirmed' || b.status === 'blocked') {
        return dateStr >= b.checkIn && dateStr < b.checkOut;
      }
      return false;
    });

    if (confirmedOrBlocked) {
      return {
        status: confirmedOrBlocked.status === 'blocked' ? 'blocked' : 'confirmed',
        booking: confirmedOrBlocked
      };
    }

    // Check if there is an active pending request on this date
    const pendingRequest = bookings.find((b) => {
      if (b.status === 'new_request' || b.status === 'pending_review' || b.status === 'contacted') {
        return dateStr >= b.checkIn && dateStr < b.checkOut;
      }
      return false;
    });

    if (pendingRequest) {
      return { status: 'pending', booking: pendingRequest };
    }

    return { status: 'available' };
  };

  // Check if a range has any hard-blocked days (confirmed or blocked)
  const hasHardOverlap = (start: string, end: string): boolean => {
    const [sYear, sMonth, sDay] = start.split('-').map(Number);
    const [eYear, eMonth, eDay] = end.split('-').map(Number);

    let curr = new Date(sYear, sMonth - 1, sDay);
    const targetEnd = new Date(eYear, eMonth - 1, eDay);

    while (curr < targetEnd) {
      const yyyy = curr.getFullYear();
      const mm = String(curr.getMonth() + 1).padStart(2, '0');
      const dd = String(curr.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const { status } = getDateStatus(dateStr);
      if (status === 'confirmed' || status === 'blocked') {
        return true;
      }
      curr.setDate(curr.getDate() + 1);
    }
    return false;
  };

  // Check if range has pending requests
  const hasPendingOverlap = (start: string, end: string): boolean => {
    const [sYear, sMonth, sDay] = start.split('-').map(Number);
    const [eYear, eMonth, eDay] = end.split('-').map(Number);

    let curr = new Date(sYear, sMonth - 1, sDay);
    const targetEnd = new Date(eYear, eMonth - 1, eDay);

    while (curr < targetEnd) {
      const yyyy = curr.getFullYear();
      const mm = String(curr.getMonth() + 1).padStart(2, '0');
      const dd = String(curr.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const { status } = getDateStatus(dateStr);
      if (status === 'pending') {
        return true;
      }
      curr.setDate(curr.getDate() + 1);
    }
    return false;
  };

  // Calculate nights count
  const calculateNights = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const [sY, sM, sD] = start.split('-').map(Number);
    const [eY, eM, eD] = end.split('-').map(Number);
    const startDate = new Date(sY, sM - 1, sD);
    const endDate = new Date(eY, eM - 1, eD);
    const diff = endDate.getTime() - startDate.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights(checkIn, checkOut);

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Day selection click
  const handleDayClick = (dayNum: number) => {
    setFormError('');
    const clickedDate = formatDateString(year, month, dayNum);
    const dateInfo = getDateStatus(clickedDate);

    if (dateInfo.status === 'past') {
      setFormError(t.errPastDate);
      return;
    }

    if (dateInfo.status === 'confirmed' || dateInfo.status === 'blocked') {
      setFormError(t.errDateUnavailable);
      return;
    }

    // Selecting first date (checkIn) or resetting if both are already picked
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(clickedDate);
      setCheckOut('');
      setPendingOverlapWarning(dateInfo.status === 'pending');
    } else {
      // User is selecting checkOut
      if (clickedDate <= checkIn) {
        // Reset checkIn to this earlier date
        setCheckIn(clickedDate);
        setCheckOut('');
        setPendingOverlapWarning(dateInfo.status === 'pending');
      } else {
        // Check collision in range
        if (hasHardOverlap(checkIn, clickedDate)) {
          setFormError(t.errDateUnavailable);
          return;
        }

        const nightsCount = calculateNights(checkIn, clickedDate);
        const minDays = settings.minStayNights || settings.minDays || 2;
        if (nightsCount < minDays) {
          setFormError(
            language === 'ca'
              ? `L’estada mínima és de ${minDays} nits.`
              : language === 'en'
              ? `Minimum stay is ${minDays} nights.`
              : `La estancia mínima es de ${minDays} noches.`
          );
          return;
        }

        setCheckOut(clickedDate);
        setPendingOverlapWarning(hasPendingOverlap(checkIn, clickedDate));
      }
    }
  };

  // Handle manual input changes for date fields
  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCheckIn(val);
    setFormError('');
    if (val < todayStr) {
      setFormError(t.errPastDate);
      return;
    }
    if (checkOut && val >= checkOut) {
      setCheckOut('');
    }
    if (checkOut && hasHardOverlap(val, checkOut)) {
      setFormError(t.errDateUnavailable);
    }
  };

  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCheckOut(val);
    setFormError('');
    if (checkIn && val <= checkIn) {
      setFormError(t.errInvalidRange);
      return;
    }
    if (checkIn && hasHardOverlap(checkIn, val)) {
      setFormError(t.errDateUnavailable);
      return;
    }
    if (checkIn && hasPendingOverlap(checkIn, val)) {
      setPendingOverlapWarning(true);
    } else {
      setPendingOverlapWarning(false);
    }
  };

  // Clear date selection helper
  const handleClearDates = () => {
    setCheckIn('');
    setCheckOut('');
    setPendingOverlapWarning(false);
    setFormError('');
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (!checkIn || !checkOut) {
      setFormError(
        language === 'ca'
          ? 'Si us plau, selecciona les dates d’entrada i sortida.'
          : language === 'en'
          ? 'Please select check-in and check-out dates.'
          : 'Por favor, selecciona las fechas de entrada y salida.'
      );
      return;
    }

    if (checkIn < todayStr) {
      setFormError(t.errPastDate);
      return;
    }

    if (checkOut <= checkIn) {
      setFormError(t.errInvalidRange);
      return;
    }

    if (hasHardOverlap(checkIn, checkOut)) {
      setFormError(t.errDateUnavailable);
      return;
    }

    const minDays = settings.minStayNights || settings.minDays || 2;
    if (nights < minDays) {
      setFormError(
        language === 'ca'
          ? `L’estada mínima és de ${minDays} nits.`
          : language === 'en'
          ? `Minimum stay is ${minDays} nights.`
          : `La estancia mínima es de ${minDays} noches.`
      );
      return;
    }

    if (!guestName.trim()) {
      setFormError(
        language === 'ca'
          ? 'Indica el teu nom complet.'
          : language === 'en'
          ? 'Please enter your full name.'
          : 'Por favor, indica tu nombre completo.'
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!guestEmail.trim() || !emailRegex.test(guestEmail)) {
      setFormError(
        language === 'ca'
          ? 'Introdueix un correu electrònic vàlid.'
          : language === 'en'
          ? 'Please enter a valid email address.'
          : 'Introduce un correo electrónico válido.'
      );
      return;
    }

    if (!guestPhone.trim() || guestPhone.trim().length < 7) {
      setFormError(
        language === 'ca'
          ? 'Introdueix un telèfon de contacte vàlid.'
          : language === 'en'
          ? 'Please enter a valid phone number.'
          : 'Introduce un teléfono de contacto válido.'
      );
      return;
    }

    if (guestsCount < 1 || guestsCount > settings.capacity) {
      setFormError(t.errMaxGuests);
      return;
    }

    if (!privacyAccepted || !termsAccepted) {
      setFormError(t.errConsentRequired);
      return;
    }

    // Anti-double-submit lock
    setIsSubmitting(true);

    try {
      const serverBookingId = await onAddBooking({
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        guestPhone: guestPhone.trim(),
        checkIn,
        checkOut,
        guestsCount,
        notes: message.trim(),
        status: 'new_request',
        privacyAccepted,
        termsAccepted
      });

      setSubmittedBookingId(serverBookingId || 'REQ-CONFIRMED');
    } catch (err: any) {
      setFormError(err?.message || (language === 'ca' ? 'Error en processar la reserva.' : language === 'en' ? 'Error processing booking request.' : 'Error al procesar la reserva.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedBookingId(null);
    setCheckIn('');
    setCheckOut('');
    setGuestsCount(2);
    setGuestName('');
    setGuestEmail('');
    setGuestPhone('');
    setMessage('');
    setPrivacyAccepted(false);
    setTermsAccepted(false);
    setPendingOverlapWarning(false);
    setFormError('');
  };

  const guestsWord = language === 'en' ? 'guests' : 'huéspedes';

  return (
    <section id="reservas" className="py-16 sm:py-24 bg-[#FAFAF5] relative overflow-hidden">
      {/* Subtle organic background gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-800/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-terracotta/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1C2E15]/10 text-[#1C2E15] text-xs font-serif font-bold tracking-widest uppercase mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-accent-terracotta" />
            <span>{t.bookNow}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-stone-900 font-bold tracking-tight">
            {t.calTitle}
          </h2>
          <p className="mt-4 text-stone-600 font-sans text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            {t.calSelectDates}
          </p>
        </div>

        {/* Success Confirmation Modal / Screen */}
        <AnimatePresence mode="wait">
          {submittedBookingId ? (
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-xl border border-stone-200/90 p-6 sm:p-12 max-w-2xl mx-auto text-center"
            >
              <div className="w-20 h-20 bg-[#1C2E15]/10 text-[#1C2E15] rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-[#1C2E15]/5">
                <CheckCircle2 className="w-11 h-11 text-[#1C2E15]" />
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-stone-100 rounded-full font-mono text-xs font-bold text-stone-800 mb-4 border border-stone-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t.calSuccessIdLabel}:</span>
                <span className="text-[#1C2E15]">{submittedBookingId}</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl text-stone-900 font-bold mb-3">
                {t.calSuccessTitle}
              </h3>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-8 max-w-md mx-auto">
                {t.calSuccessDesc}
              </p>

              {/* Summary Receipt Card */}
              <div className="bg-[#FAFAF5] border border-stone-200/90 rounded-2xl p-5 sm:p-6 text-left mb-8 space-y-3 text-xs sm:text-sm shadow-2xs">
                <div className="flex justify-between items-center border-b border-stone-200/80 pb-2.5">
                  <span className="text-stone-500 font-medium">{t.calFullName}</span>
                  <span className="font-semibold text-stone-900">{guestName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-stone-200/80 pb-2.5">
                  <span className="text-stone-500 font-medium">{t.calCheckIn} &rarr; {t.calCheckOut}</span>
                  <span className="font-mono font-bold text-stone-900 text-xs sm:text-sm">
                    {checkIn} &rarr; {checkOut} ({nights} {language === 'en' ? 'nights' : 'noches'})
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-stone-200/80 pb-2.5">
                  <span className="text-stone-500 font-medium">{t.calNumGuests}</span>
                  <span className="font-semibold text-stone-900">{guestsCount} {guestsWord}</span>
                </div>
                <div className="flex justify-between items-center pt-0.5">
                  <span className="text-stone-500 font-medium">{t.locContactTitle}</span>
                  <span className="font-mono text-stone-700 text-xs text-right">
                    {guestEmail} &bull; {guestPhone}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetForm}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#1C2E15] text-white rounded-xl font-sans font-semibold text-sm hover:bg-[#121C0E] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t.calSuccessNewBtn}</span>
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              {/* Left Column: Interactive Calendar & House Information */}
              <div className="lg:col-span-7 space-y-6">
                {/* Calendar Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-stone-200/90 p-5 sm:p-7 transition-all hover:shadow-md">
                  {/* Calendar Top Navigation */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200/80">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1C2E15]/10 text-[#1C2E15] flex items-center justify-center">
                        <CalendarIcon className="w-5 h-5 text-[#1C2E15]" />
                      </div>
                      <div>
                        <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                          {monthNames[month]} <span className="text-stone-500 font-normal">{year}</span>
                        </h3>
                        <p className="text-[11px] text-stone-500 hidden sm:block">
                          {checkIn && checkOut
                            ? `${checkIn} → ${checkOut} (${nights} ${language === 'en' ? 'nights' : 'noches'})`
                            : checkIn
                            ? (language === 'ca' ? 'Selecciona la data de sortida' : language === 'en' ? 'Select departure date' : 'Selecciona la fecha de salida')
                            : (language === 'ca' ? 'Fes clic sobre el dia d’arribada' : language === 'en' ? 'Click on arrival date' : 'Haz clic sobre el día de llegada')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {(checkIn || checkOut) && (
                        <button
                          type="button"
                          onClick={handleClearDates}
                          className="mr-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                        >
                          {language === 'ca' ? 'Netejar' : language === 'en' ? 'Clear' : 'Limpiar'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        aria-label="Previous Month"
                        className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer active:scale-95"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        aria-label="Next Month"
                        className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer active:scale-95"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 gap-1 text-center font-serif text-xs font-semibold text-stone-500 mb-2 uppercase tracking-wider">
                    {weekDayLabels.map((day, idx) => (
                      <div key={idx} className="py-1">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Day cells grid */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                    {/* Empty padding days */}
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} className="min-h-[42px] sm:min-h-[48px] rounded-xl" />
                    ))}

                    {/* Active Month Days */}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const dayNum = i + 1;
                      const dateStr = formatDateString(year, month, dayNum);
                      const { status } = getDateStatus(dateStr);

                      const isSelectedCheckIn = checkIn === dateStr;
                      const isSelectedCheckOut = checkOut === dateStr;
                      const isInSelectedRange =
                        checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;

                      // Styles determination
                      let btnStyle = 'bg-white text-stone-800 hover:bg-stone-100/90 border border-stone-200/80 shadow-2xs';
                      let statusDot = null;

                      if (status === 'past') {
                        btnStyle = 'bg-stone-50 text-stone-300 border-dashed border-stone-200/70 cursor-not-allowed';
                      } else if (status === 'confirmed') {
                        btnStyle = 'bg-emerald-50/70 text-emerald-900 border-emerald-300/80 line-through opacity-85 cursor-not-allowed';
                        statusDot = <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mx-auto mt-0.5" />;
                      } else if (status === 'blocked') {
                        btnStyle = 'bg-stone-200/70 text-stone-500 border-stone-300 line-through cursor-not-allowed';
                        statusDot = <span className="w-1.5 h-1.5 rounded-full bg-stone-500 mx-auto mt-0.5" />;
                      } else if (status === 'pending') {
                        btnStyle = 'bg-amber-50/80 text-amber-900 border-amber-300 hover:bg-amber-100';
                        statusDot = <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mx-auto mt-0.5" />;
                      }

                      if (isSelectedCheckIn) {
                        btnStyle = 'bg-[#1C2E15] text-white font-bold shadow-md border-[#1C2E15] rounded-l-xl';
                        statusDot = null;
                      } else if (isSelectedCheckOut) {
                        btnStyle = 'bg-[#1C2E15] text-white font-bold shadow-md border-[#1C2E15] rounded-r-xl';
                        statusDot = null;
                      } else if (isInSelectedRange) {
                        btnStyle = 'bg-[#1C2E15]/10 text-[#1C2E15] font-semibold border-[#1C2E15]/20 rounded-none';
                        statusDot = null;
                      }

                      return (
                        <button
                          key={`day-${dayNum}`}
                          type="button"
                          onClick={() => handleDayClick(dayNum)}
                          disabled={status === 'past' || status === 'confirmed' || status === 'blocked'}
                          className={`min-h-[42px] sm:min-h-[48px] rounded-xl flex flex-col items-center justify-center text-xs sm:text-sm transition-all relative cursor-pointer active:scale-95 disabled:active:scale-100 ${btnStyle}`}
                          title={
                            status === 'confirmed'
                              ? t.statusConfirmed
                              : status === 'blocked'
                              ? t.statusBlocked
                              : status === 'pending'
                              ? t.statusPendingReview
                              : t.legendAvailable
                          }
                        >
                          <span className="font-medium leading-none">{dayNum}</span>
                          {statusDot}
                        </button>
                      );
                    })}
                  </div>

                  {/* Calendar Legend */}
                  <div className="mt-6 pt-5 border-t border-stone-200/80 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-stone-600">
                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-stone-50">
                      <span className="w-3 h-3 rounded-md bg-white border border-stone-300 shrink-0" />
                      <span className="truncate">{t.legendAvailable}</span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-stone-50">
                      <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-400 shrink-0" />
                      <span className="truncate">{t.legendPending}</span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-stone-50">
                      <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-500 shrink-0" />
                      <span className="truncate">{t.statusConfirmed}</span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-stone-50">
                      <span className="w-3 h-3 rounded-md bg-stone-200 border border-stone-400 shrink-0" />
                      <span className="truncate">{t.legendBlocked}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Stay Philosophy Card */}
                <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-7 space-y-4 shadow-2xs">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-accent-terracotta/10 text-accent-terracotta flex items-center justify-center shrink-0 mt-0.5">
                      <Home className="w-5 h-5 text-accent-terracotta" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-bold text-stone-900">
                        {language === 'ca' ? 'Reserva directa sense comissions' : language === 'en' ? 'Direct booking without commissions' : 'Reserva directa sin comisiones'}
                      </h4>
                      <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                        {language === 'ca'
                          ? 'Les estades a Casa Tarongers es gestionen de manera familiar i personalitzada. Quan rebem la teva sol·licitud, revisem els detalls i ens posem en contacte amb tu en menys de 24 hores per confirmar la reserva.'
                          : language === 'en'
                          ? 'Stays at Casa Tarongers are managed personally by our family. Once we receive your request, we review the details and reach out within 24 hours to confirm your reservation.'
                          : 'Las estancias en Casa Tarongers se gestionan de forma familiar y personalizada. Tras recibir tu solicitud, revisamos los detalles y contactamos contigo en menos de 24 horas para formalizar tu reserva.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-stone-100 text-xs text-stone-700">
                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-stone-50">
                      <Users className="w-4 h-4 text-accent-terracotta shrink-0" />
                      <span>{language === 'ca' ? 'Fins a 10 persones' : language === 'en' ? 'Up to 10 guests' : 'Hasta 10 personas'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-stone-50">
                      <Clock className="w-4 h-4 text-accent-terracotta shrink-0" />
                      <span>{language === 'ca' ? 'Entrada 16h · Sortida 11h' : language === 'en' ? 'Check-in 16h · Out 11h' : 'Entrada 16h · Salida 11h'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-stone-50">
                      <CalendarCheck className="w-4 h-4 text-accent-terracotta shrink-0" />
                      <span>{language === 'ca' ? 'Mínim: 2 nits' : language === 'en' ? 'Min: 2 nights' : 'Mínimo: 2 noches'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Reservation Request Form */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-3xl shadow-sm border border-stone-200/90 p-6 sm:p-8 transition-all hover:shadow-md">
                  <div className="border-b border-stone-200/80 pb-4 mb-6">
                    <div className="flex items-center gap-2 mb-1 text-xs font-serif font-bold text-accent-terracotta uppercase tracking-wider">
                      <Info className="w-3.5 h-3.5" />
                      <span>{language === 'ca' ? 'Petició d’estada' : language === 'en' ? 'Stay request' : 'Petición de estancia'}</span>
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-stone-900">
                      {t.calFormTitle}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      {language === 'ca' ? 'Sense intermediaris ni pagaments per avançat' : language === 'en' ? 'No intermediaries or upfront payment' : 'Sin intermediarios ni pagos por adelantado'}
                    </p>
                  </div>

                  {/* Overlap / Collision Warnings */}
                  {pendingOverlapWarning && (
                    <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block mb-0.5">
                          {language === 'ca' ? 'Dates amb sol·licituds prèvies' : language === 'en' ? 'Dates with pending requests' : 'Fechas con solicitud previa'}
                        </span>
                        {language === 'ca'
                          ? 'Ja hi ha una sol·licitud en revisió per part de la família per a algun d’aquests dies. Pots continuar enviant la teva petició com a alternativa si ho desitges.'
                          : language === 'en'
                          ? 'There is already an inquiry being evaluated for some of these dates. You can still submit your request as an alternative if desired.'
                          : 'Ya existe una solicitud en revisión por parte de la familia para alguno de estos días. Puedes continuar enviando tu petición como alternativa si lo deseas.'}
                      </div>
                    </div>
                  )}

                  {/* Form Error Banner */}
                  {formError && (
                    <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block mb-0.5">{language === 'ca' ? 'Atenció' : language === 'en' ? 'Notice' : 'Atención'}</span>
                        {formError}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Date Pickers */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                          {t.calCheckIn} *
                        </label>
                        <input
                          type="date"
                          min={todayStr}
                          value={checkIn}
                          onChange={handleCheckInChange}
                          required
                          className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#1C2E15]/20 focus:border-[#1C2E15] outline-none bg-stone-50/60 transition-all font-sans"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                          {t.calCheckOut} *
                        </label>
                        <input
                          type="date"
                          min={checkIn || todayStr}
                          value={checkOut}
                          onChange={handleCheckOutChange}
                          required
                          className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#1C2E15]/20 focus:border-[#1C2E15] outline-none bg-stone-50/60 transition-all font-sans"
                        />
                      </div>
                    </div>

                    {/* Nights indicator pill */}
                    {nights > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-4 py-2 bg-[#1C2E15]/5 border border-[#1C2E15]/10 rounded-xl text-xs font-medium text-stone-800 flex items-center justify-between"
                      >
                        <span className="text-stone-600">
                          {language === 'ca' ? 'Durada de l’estada:' : language === 'en' ? 'Duration of stay:' : 'Duración de la estancia:'}
                        </span>
                        <span className="font-mono font-bold text-[#1C2E15]">
                          {nights} {language === 'en' ? 'nights' : 'noches'}
                        </span>
                      </motion.div>
                    )}

                    {/* Guests Count */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center justify-between">
                        <span>{t.calNumGuests} *</span>
                        <span className="text-stone-400 font-normal text-[11px]">
                          ({language === 'ca' ? `Màx. ${settings.capacity} persones` : language === 'en' ? `Max ${settings.capacity} guests` : `Máx. ${settings.capacity} personas`})
                        </span>
                      </label>
                      <div className="relative">
                        <Users className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                        <select
                          value={guestsCount}
                          onChange={(e) => setGuestsCount(Number(e.target.value))}
                          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#1C2E15]/20 focus:border-[#1C2E15] outline-none bg-stone-50/60 cursor-pointer transition-all font-sans"
                        >
                          {Array.from({ length: settings.capacity }).map((_, idx) => (
                            <option key={idx + 1} value={idx + 1}>
                              {idx + 1} {idx === 0 ? (language === 'en' ? 'guest' : 'huésped') : guestsWord}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Guest Name */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        {t.calFullName} *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          required
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder={language === 'ca' ? 'Ex. Carles Rovira' : language === 'en' ? 'e.g. John Doe' : 'Ej. Carlos Rovira'}
                          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#1C2E15]/20 focus:border-[#1C2E15] outline-none bg-stone-50/60 transition-all font-sans"
                        />
                      </div>
                    </div>

                    {/* Guest Email */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        {t.calEmail} *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                        <input
                          type="email"
                          required
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          placeholder="tu-email@ejemplo.com"
                          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#1C2E15]/20 focus:border-[#1C2E15] outline-none bg-stone-50/60 transition-all font-sans"
                        />
                      </div>
                    </div>

                    {/* Guest Phone */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        {t.calPhone} *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                        <input
                          type="tel"
                          required
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          placeholder="+34 600 000 000"
                          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#1C2E15]/20 focus:border-[#1C2E15] outline-none bg-stone-50/60 transition-all font-sans"
                        />
                      </div>
                    </div>

                    {/* Special Notes */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        {t.calMessageLabel}
                      </label>
                      <div className="relative">
                        <MessageSquare className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                        <textarea
                          rows={3}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={t.calMessagePlaceholder}
                          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#1C2E15]/20 focus:border-[#1C2E15] outline-none bg-stone-50/60 transition-all font-sans resize-none"
                        />
                      </div>
                    </div>

                    {/* Legal Checkboxes with clear touch padding */}
                    <div className="space-y-2.5 pt-2 border-t border-stone-100">
                      <label className="flex items-start gap-3 cursor-pointer text-xs text-stone-600 p-1 rounded-lg hover:bg-stone-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={privacyAccepted}
                          onChange={(e) => setPrivacyAccepted(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-stone-300 text-[#1C2E15] focus:ring-[#1C2E15] cursor-pointer"
                        />
                        <span className="leading-snug">
                          {t.calPrivacyConsent}{' '}
                          <a href="#about" className="underline hover:text-stone-900 font-medium">
                            {t.footPrivacy}
                          </a>
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer text-xs text-stone-600 p-1 rounded-lg hover:bg-stone-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-stone-300 text-[#1C2E15] focus:ring-[#1C2E15] cursor-pointer"
                        />
                        <span className="leading-snug">
                          {t.calTermsConsent}{' '}
                          <a href="#about" className="underline hover:text-stone-900 font-medium">
                            {t.footTerms}
                          </a>
                        </span>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-[#1C2E15] text-white font-sans font-semibold text-sm sm:text-base hover:bg-[#121C0E] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{t.calSubmitting}</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5 text-accent-terracotta" />
                          <span>{t.calSubmitRequestBtn}</span>
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-center text-stone-500 pt-1">
                      {language === 'ca'
                        ? 'Sense pagament per avançat. Respondrem a la teva petició personalment.'
                        : language === 'en'
                        ? 'No advance payment. We will respond to your request personally.'
                        : 'Sin pago por adelantado. Responderemos a tu solicitud personalmente.'}
                    </p>
                  </form>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
