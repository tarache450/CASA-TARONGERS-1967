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
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookingCalendarProps {
  bookings: Booking[];
  settings: PropertySettings;
  onAddBooking: (
    booking: Omit<Booking, 'id' | 'createdAt' | 'history' | 'internalNotes'>
  ) => void;
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

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
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

    const yearSuffix = new Date().getFullYear();
    const generatedId = `REQ-${yearSuffix}-${Math.floor(1000 + Math.random() * 9000)}`;

    setTimeout(() => {
      onAddBooking({
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

      setSubmittedBookingId(generatedId);
      setIsSubmitting(false);
    }, 600);
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
    <section id="reservas" className="py-20 bg-stone-100/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-800/10 text-primary-900 text-xs font-serif font-bold tracking-widest uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-accent-terracotta" />
            <span>{t.bookNow}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-stone-900 font-bold tracking-tight">
            {t.calTitle}
          </h2>
          <p className="mt-4 text-stone-600 font-sans text-base sm:text-lg leading-relaxed">
            {t.calSelectDates}
          </p>
        </div>

        {/* Success Confirmation Modal / Screen */}
        <AnimatePresence>
          {submittedBookingId ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl shadow-xl border border-stone-200/80 p-8 sm:p-12 max-w-2xl mx-auto text-center"
            >
              <div className="w-16 h-16 bg-primary-800/10 text-primary-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-9 h-9 text-primary-800" />
              </div>

              <div className="inline-block px-3 py-1 bg-stone-100 rounded-md font-mono text-xs font-bold text-stone-700 mb-2">
                {t.calSuccessIdLabel}: {submittedBookingId}
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl text-stone-900 font-bold mb-3">
                {t.calSuccessTitle}
              </h3>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-8">
                {t.calSuccessDesc}
              </p>

              {/* Summary card */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 text-left mb-8 space-y-2.5 text-sm">
                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="text-stone-500">{t.calFullName}:</span>
                  <span className="font-semibold text-stone-800">{guestName}</span>
                </div>
                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="text-stone-500">{t.calCheckIn} - {t.calCheckOut}:</span>
                  <span className="font-semibold text-stone-800 font-mono">
                    {checkIn} &rarr; {checkOut} ({nights} {language === 'en' ? 'nights' : 'noches'})
                  </span>
                </div>
                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="text-stone-500">{t.calNumGuests}:</span>
                  <span className="font-semibold text-stone-800">{guestsCount} {guestsWord}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">{t.locContactTitle}:</span>
                  <span className="font-mono text-stone-700 text-xs">{guestEmail} &bull; {guestPhone}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-6 py-3 bg-primary-800 text-white rounded-lg font-sans font-medium text-sm hover:bg-primary-900 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t.calSuccessNewBtn}</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Interactive Calendar & House Rules */}
              <div className="lg:col-span-7 space-y-6">
                {/* Calendar Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-6 sm:p-7">
                  {/* Calendar Top Navigation */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-5 h-5 text-primary-800" />
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                        {monthNames[month]} <span className="text-stone-500 font-normal">{year}</span>
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        aria-label="Previous Month"
                        className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        aria-label="Next Month"
                        className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 gap-1 text-center font-serif text-xs font-semibold text-stone-500 mb-2 uppercase tracking-wider">
                    {weekDayLabels.map((day, idx) => (
                      <div key={idx} className="py-1.5">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Day cells */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {/* Empty padding days */}
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-10 sm:h-12 rounded-lg" />
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
                      let btnStyle = 'bg-white text-stone-800 hover:bg-stone-100 border border-stone-200/70';
                      let statusDot = null;

                      if (status === 'past') {
                        btnStyle = 'bg-stone-50 text-stone-300 border-dashed border-stone-200 cursor-not-allowed';
                      } else if (status === 'confirmed') {
                        btnStyle = 'bg-emerald-50 text-emerald-900 border-emerald-300 line-through opacity-80 cursor-not-allowed';
                        statusDot = <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mx-auto mt-0.5" />;
                      } else if (status === 'blocked') {
                        btnStyle = 'bg-stone-200/80 text-stone-500 border-stone-300 line-through cursor-not-allowed';
                        statusDot = <span className="w-1.5 h-1.5 rounded-full bg-stone-500 mx-auto mt-0.5" />;
                      } else if (status === 'pending') {
                        btnStyle = 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100';
                        statusDot = <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mx-auto mt-0.5" />;
                      }

                      if (isSelectedCheckIn || isSelectedCheckOut) {
                        btnStyle = 'bg-primary-800 text-white font-bold shadow-md border-primary-900';
                        statusDot = null;
                      } else if (isInSelectedRange) {
                        btnStyle = 'bg-primary-100 text-primary-900 font-semibold border-primary-200';
                        statusDot = null;
                      }

                      return (
                        <button
                          key={`day-${dayNum}`}
                          type="button"
                          onClick={() => handleDayClick(dayNum)}
                          disabled={status === 'past' || status === 'confirmed' || status === 'blocked'}
                          className={`h-10 sm:h-12 rounded-lg flex flex-col items-center justify-center text-xs sm:text-sm transition-all relative ${btnStyle}`}
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
                  <div className="mt-6 pt-4 border-t border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-stone-600">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-md bg-white border border-stone-300" />
                      <span>{t.legendAvailable}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300" />
                      <span>{t.legendPending}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-400" />
                      <span>{t.statusConfirmed}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-md bg-stone-200 border border-stone-300" />
                      <span>{t.legendBlocked}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Booking Philosophy Card */}
                <div className="bg-primary-900/5 rounded-2xl border border-primary-900/15 p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary-800 text-white shrink-0 mt-0.5">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-bold text-stone-900">
                        {language === 'ca' ? 'Reserva directa sense comissions' : language === 'en' ? 'Direct booking without commissions' : 'Reserva directa sin comisiones'}
                      </h4>
                      <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                        {language === 'ca'
                          ? 'Les estades a Casa Tarongers es gestionen de manera familiar i personalitzada. Quan rebem la teva sol·licitud, revisem els detalls i ens posem en contacte amb tu en menys de 24 hores per confirmar la reserva.'
                          : language === 'en'
                          ? 'Stays at Casa Tarongers are managed personally by our family. Once we receive your request, we review the details and reach out within 24 hours to confirm your reservation.'
                          : 'Las estancias en Casa Tarongers se gestionan de forma familiar y personalizada. Tras recibir tu solicitud, revisamos los detalles y contactamos contigo en menos de 24 horas para formalizar tu reserva.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-primary-900/10 text-xs text-stone-700">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-accent-terracotta shrink-0" />
                      <span>{language === 'ca' ? 'Capacitat: fins a 10 persones' : language === 'en' ? 'Capacity: up to 10 guests' : 'Capacidad: hasta 10 personas'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent-terracotta shrink-0" />
                      <span>{language === 'ca' ? 'Entrada 16:00 · Sortida 11:00' : language === 'en' ? 'Check-in 16:00 · Out 11:00' : 'Entrada 16:00 · Salida 11:00'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-accent-terracotta shrink-0" />
                      <span>{language === 'ca' ? 'Estada mínima: 2 nits' : language === 'en' ? 'Min. stay: 2 nights' : 'Estancia mínima: 2 noches'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Reservation Request Form */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-6 sm:p-8">
                  <div className="border-b border-stone-200 pb-4 mb-6">
                    <h3 className="font-serif text-xl font-bold text-stone-900">
                      {t.calFormTitle}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      {t.calSelectDates}
                    </p>
                  </div>

                  {/* Collisions / Overlap Warnings */}
                  {pendingOverlapWarning && (
                    <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
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
                    <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3">
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
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          {t.calCheckIn} *
                        </label>
                        <input
                          type="date"
                          min={todayStr}
                          value={checkIn}
                          onChange={handleCheckInChange}
                          required
                          className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary-800 focus:border-transparent outline-none bg-stone-50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          {t.calCheckOut} *
                        </label>
                        <input
                          type="date"
                          min={checkIn || todayStr}
                          value={checkOut}
                          onChange={handleCheckOutChange}
                          required
                          className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary-800 focus:border-transparent outline-none bg-stone-50"
                        />
                      </div>
                    </div>

                    {/* Nights indicator */}
                    {nights > 0 && (
                      <div className="px-3 py-1.5 bg-stone-100 rounded-lg text-xs font-medium text-stone-700 flex items-center justify-between">
                        <span>{language === 'ca' ? 'Durada de l’estada:' : language === 'en' ? 'Duration of stay:' : 'Duración de la estancia:'}</span>
                        <span className="font-mono font-bold text-primary-900">
                          {nights} {language === 'en' ? 'nights' : 'noches'}
                        </span>
                      </div>
                    )}

                    {/* Guests Count */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
                        <span>{t.calNumGuests} *</span>
                        <span className="text-stone-400 font-normal text-[11px]">
                          ({language === 'ca' ? `Màx. ${settings.capacity} persones` : language === 'en' ? `Max ${settings.capacity} guests` : `Máx. ${settings.capacity} personas`})
                        </span>
                      </label>
                      <div className="relative">
                        <Users className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <select
                          value={guestsCount}
                          onChange={(e) => setGuestsCount(Number(e.target.value))}
                          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary-800 focus:border-transparent outline-none bg-stone-50 cursor-pointer"
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
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {t.calFullName} *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder={language === 'ca' ? 'Ex. Carles Rovira' : language === 'en' ? 'e.g. John Doe' : 'Ej. Carlos Rovira'}
                          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary-800 focus:border-transparent outline-none bg-stone-50"
                        />
                      </div>
                    </div>

                    {/* Guest Email */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {t.calEmail} *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          placeholder="tu-email@ejemplo.com"
                          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary-800 focus:border-transparent outline-none bg-stone-50"
                        />
                      </div>
                    </div>

                    {/* Guest Phone */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {t.calPhone} *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          required
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          placeholder="+34 600 000 000"
                          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary-800 focus:border-transparent outline-none bg-stone-50"
                        />
                      </div>
                    </div>

                    {/* Special Notes */}
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        {t.calMessageLabel}
                      </label>
                      <div className="relative">
                        <MessageSquare className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        <textarea
                          rows={3}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={t.calMessagePlaceholder}
                          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-primary-800 focus:border-transparent outline-none bg-stone-50"
                        />
                      </div>
                    </div>

                    {/* Legal Checkboxes */}
                    <div className="space-y-2 pt-2 border-t border-stone-100">
                      <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-600">
                        <input
                          type="checkbox"
                          checked={privacyAccepted}
                          onChange={(e) => setPrivacyAccepted(e.target.checked)}
                          className="mt-0.5 rounded border-stone-300 text-primary-800 focus:ring-primary-800 cursor-pointer"
                        />
                        <span>
                          {t.calPrivacyConsent}{' '}
                          <a href="#about" className="underline hover:text-stone-900">
                            {t.footPrivacy}
                          </a>
                        </span>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-600">
                        <input
                          type="checkbox"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          className="mt-0.5 rounded border-stone-300 text-primary-800 focus:ring-primary-800 cursor-pointer"
                        />
                        <span>
                          {t.calTermsConsent}{' '}
                          <a href="#about" className="underline hover:text-stone-900">
                            {t.footTerms}
                          </a>
                        </span>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-4 py-3 px-4 rounded-xl bg-primary-800 text-white font-sans font-semibold text-sm sm:text-base hover:bg-primary-900 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{t.calSubmitting}</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 text-accent-terracotta" />
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
