import React, { useState, useEffect } from 'react';
import { Booking, PropertySettings, PaymentMethod } from '../types';
import { Language, TRANSLATIONS } from '../translations';
import { 
  Calendar as CalendarIcon, 
  Users, 
  CreditCard, 
  Check, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Smartphone, 
  Building2, 
  ShieldCheck, 
  Copy, 
  Upload, 
  Lock, 
  Loader2, 
  ArrowRight, 
  FileText, 
  CheckCircle2, 
  X,
  CreditCard as CardIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Premium SVG-based Apple Pay Logo
const ApplePayLogo = ({ className = "" }: { className?: string }) => (
  <span className={`inline-flex items-center justify-center px-2 py-1.5 rounded-md border border-stone-850 bg-black text-white shadow-sm h-6 min-w-[54px] ${className}`}>
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white fill-current inline-block mr-0.5" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05 1.88-3.08 1.88-1.02 0-1.35-.62-2.52-.62-1.18 0-1.55.6-2.52.62-1.01.02-2.2-1.01-3.18-1.97-2-1.97-3.06-4.99-3.06-7.85 0-4.53 2.94-6.92 5.81-6.92 1.01 0 1.9.59 2.52.59.61 0 1.58-.62 2.76-.62 1.24 0 2.36.45 3.1 1.43-3 1.8-2.52 5.76.45 6.96-.86 2.1-1.98 4.54-2.48 4.51zm-3.07-15.9c.77-.94 1.25-2.22 1.11-3.5-1.1.04-2.44.73-3.23 1.65-.68.79-1.28 2.09-1.12 3.35 1.22.1 2.47-.56 3.24-1.5z" />
    </svg>
    <span className="text-[11px] font-sans font-semibold tracking-tight text-white select-none">Pay</span>
  </span>
);

// Premium SVG-based Google Pay Logo
const GooglePayLogo = ({ className = "" }: { className?: string }) => (
  <span className={`inline-flex items-center justify-center px-2 py-1.5 rounded-md border border-stone-200 bg-white text-stone-800 shadow-sm h-6 min-w-[54px] ${className}`}>
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 inline-block" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.67-.35-1.37-.35-2.1c0-.73.13-1.43.35-2.09z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
    </svg>
    <span className="text-[11px] font-sans font-medium tracking-tight ml-1 text-stone-700 select-none">Pay</span>
  </span>
);

interface BookingCalendarProps {
  bookings: Booking[];
  settings: PropertySettings;
  onAddBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  language: Language;
}

export default function BookingCalendar({ bookings, settings, onAddBooking, language }: BookingCalendarProps) {
  const t = TRANSLATIONS[language];
  // Date State for Calendar UI
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); // Start on July 2026
  
  // Selection State
  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestsCount, setGuestsCount] = useState(2);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Cooperative stay states
  const [stayType, setStayType] = useState<'guest' | 'family'>('guest');
  const [familyPin, setFamilyPin] = useState('');
  const [isPinVerified, setIsPinVerified] = useState(false);

  // Payment Selection States
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('Card');
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'checkout' | 'success'>('form');

  // Credit Card Simulation States
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardFocus, setCardFocus] = useState<'number' | 'name' | 'expiry' | 'cvc' | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [paymentStatusMessage, setPaymentStatusMessage] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Bizum States
  const [bizumPhone, setBizumPhone] = useState('');
  const [bizumReference, setBizumReference] = useState('');

  // Bank Transfer States
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [uploadedReceipt, setUploadedReceipt] = useState<{ name: string; size: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [transferRef, setTransferRef] = useState('');

  // Auto-fill Bizum Phone when guest fills phone
  useEffect(() => {
    if (guestPhone && !bizumPhone) {
      setBizumPhone(guestPhone);
    }
  }, [guestPhone]);

  // Flip card automatically when CVC is focused
  useEffect(() => {
    if (cardFocus === 'cvc') {
      setIsFlipped(true);
    } else {
      setIsFlipped(false);
    }
  }, [cardFocus]);

  // Helper: Format Date to YYYY-MM-DD
  const formatDateString = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Helper: Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper: Get first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthNames = language === 'ca'
    ? ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre']
    : language === 'en'
      ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      : ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // Check state of a specific date
  const getDateStatus = (dateStr: string): { status: 'available' | 'booked' | 'family'; booking?: Booking } => {
    const matchingBooking = bookings.find(b => {
      if (b.status === 'Cancelled') return false;
      const start = b.checkIn;
      const end = b.checkOut;
      return dateStr >= start && dateStr < end;
    });

    if (matchingBooking) {
      if (matchingBooking.status === 'Family Use') {
        return { status: 'family', booking: matchingBooking };
      }
      return { status: 'booked', booking: matchingBooking };
    }
    return { status: 'available' };
  };

  // Check if a range has any booked/family days
  // Check if a range has any booked/family days
  const isRangeBlocked = (start: string, end: string): boolean => {
    const [sYear, sMonth, sDay] = start.split('-').map(Number);
    const [eYear, eMonth, eDay] = end.split('-').map(Number);
    
    let current = new Date(sYear, sMonth - 1, sDay);
    const targetEnd = new Date(eYear, eMonth - 1, eDay);

    while (current < targetEnd) {
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, '0');
      const dd = String(current.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const { status } = getDateStatus(dateStr);
      if (status !== 'available') {
        return true;
      }
      current.setDate(current.getDate() + 1);
    }
    return false;
  };

  // Calculate Nights
  const getNightsCount = () => {
    if (!checkIn || !checkOut) return 0;
    const [sYear, sMonth, sDay] = checkIn.split('-').map(Number);
    const [eYear, eMonth, eDay] = checkOut.split('-').map(Number);
    const start = new Date(sYear, sMonth - 1, sDay);
    const end = new Date(eYear, eMonth - 1, eDay);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Price Calculation
  const nights = getNightsCount();
  const isHighSeason = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length < 2) return false;
    const m = parseInt(parts[1], 10) - 1;
    return m === 6 || m === 7; // July (6) or August (7)
  };

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0;
    if (stayType === 'family') return 0;
    let total = 0;
    
    const [sYear, sMonth, sDay] = checkIn.split('-').map(Number);
    const [eYear, eMonth, eDay] = checkOut.split('-').map(Number);
    
    let current = new Date(sYear, sMonth - 1, sDay);
    const targetEnd = new Date(eYear, eMonth - 1, eDay);

    while (current < targetEnd) {
      const m = current.getMonth();
      const pricePerNight = (m === 6 || m === 7) ? settings.highSeasonPrice : settings.basePrice;
      total += pricePerNight;
      current.setDate(current.getDate() + 1);
    }
    return total + settings.cleaningFee;
  };

  const totalCost = calculateTotal();

  // Generate Reference Code
  const generateReferenceCode = () => {
    if (!guestName) return `CT-${Math.floor(1000 + Math.random() * 9000)}`;
    const initials = guestName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 3);
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `TARONGERS-${initials}-${rand}`;
  };

  // Handle day click
  const handleDayClick = (day: number) => {
    setFormError('');
    setIsSuccess(false);
    const selectedDateStr = formatDateString(year, month, day);
    const { status } = getDateStatus(selectedDateStr);

    if (status !== 'available') {
      setFormError(language === 'ca' ? 'Aquest dia ja està reservat o bloquejat per a ús familiar.' : language === 'en' ? 'This day is already booked or blocked for family use.' : 'Este día ya está reservado o bloqueado para uso familiar.');
      return;
    }

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(selectedDateStr);
      setCheckOut('');
    } else {
      if (selectedDateStr <= checkIn) {
        setCheckIn(selectedDateStr);
      } else {
        if (isRangeBlocked(checkIn, selectedDateStr)) {
          setFormError(language === 'ca' ? 'El rang seleccionat conté dies que ja estan reservats.' : language === 'en' ? 'The selected range contains days that are already booked.' : 'El rango seleccionado contiene días que ya están reservados.');
          return;
        }

        const nightsCount = Math.ceil((new Date(selectedDateStr).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
        if (nightsCount < settings.minDays) {
          setFormError(language === 'ca' ? `L'estada mínima és de ${settings.minDays} nits.` : language === 'en' ? `The minimum stay is ${settings.minDays} nights.` : `La estancia mínima es de ${settings.minDays} noches.`);
          return;
        }

        setCheckOut(selectedDateStr);
      }
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Card Formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.substring(i, i + 4));
    }
    setCardNumber(parts.join(' '));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length >= 2) {
      value = `${value.substring(0, 2)}/${value.substring(2)}`;
    }
    setCardExpiry(value);
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCardCvc(value);
  };

  // Card Type Identifier
  const getCardType = (num: string) => {
    const cleanNum = num.replace(/\s/g, '');
    if (cleanNum.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(cleanNum)) return 'Mastercard';
    if (/^3[47]/.test(cleanNum)) return 'Amex';
    return 'CreditCard';
  };

  // Copy Clipboard Helper
  const handleCopyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // File drag & drop simulator
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedReceipt({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      });
    }
  };

  const simulateReceiptSelection = () => {
    setUploadedReceipt({
      name: `justificante_transferencia_${transferRef.toLowerCase()}.pdf`,
      size: '1.4 MB'
    });
  };

  // First step submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!checkIn || !checkOut) {
      setFormError(language === 'ca' ? 'Si us plau, selecciona les dates d\'entrada i sortida al calendari.' : language === 'en' ? 'Please select check-in and check-out dates on the calendar.' : 'Por favor selecciona las fechas de entrada y salida en el calendario.');
      return;
    }
    if (!guestName || !guestEmail || !guestPhone) {
      setFormError(language === 'ca' ? 'Si us plau, omple tots els camps de contacte.' : language === 'en' ? 'Please complete all contact fields.' : 'Por favor completa todos los campos de contacto.');
      return;
    }

    if (isRangeBlocked(checkIn, checkOut)) {
      setFormError(language === 'ca' ? 'El rang seleccionat ja està reservat o bloquejat.' : language === 'en' ? 'The selected dates are already booked or blocked.' : 'El rango seleccionado ya está reservado o bloqueado.');
      return;
    }

    if (stayType === 'family') {
      if (!isPinVerified) {
        setFormError(language === 'ca' ? 'Heu de verificar el PIN familiar primer.' : language === 'en' ? 'You must verify the family PIN first.' : 'Debes verificar el PIN familiar primero.');
        return;
      }

      // Complete family registration directly
      onAddBooking({
        guestName,
        guestEmail,
        guestPhone,
        checkIn,
        checkOut,
        guestsCount,
        totalPrice: 0,
        status: 'Family Use',
        paymentStatus: 'Paid',
        paymentMethod: 'None',
        notes: notes ? `[Familiar] ${notes}` : '[Familiar]'
      });

      setCheckoutStep('success');
      setIsSuccess(true);
      return;
    }

    // Set defaults and prepare checkout for guest stay
    setBizumPhone(guestPhone);
    setTransferRef(generateReferenceCode());
    setCheckoutStep('checkout');
  };

  // Complete Payment Action
  const handleCompletePayment = async () => {
    setIsProcessingPayment(true);
    setFormError('');

    try {
      if (selectedPaymentMethod === 'Card') {
        if (!cardNumber || !cardHolder || !cardExpiry || !cardCvc) {
          throw new Error('Por favor completa todos los campos de tu tarjeta.');
        }
        if (cardNumber.replace(/\s/g, '').length < 16) {
          throw new Error('El número de tarjeta debe tener 16 dígitos.');
        }
        if (cardCvc.length < 3) {
          throw new Error('El código CVC debe tener al menos 3 dígitos.');
        }
        
        setPaymentStatusMessage('Estableciendo conexión encriptada SSL con Stripe...');
        await new Promise(resolve => setTimeout(resolve, 1200));
        setPaymentStatusMessage('Verificando credenciales de la tarjeta...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPaymentStatusMessage(`Procesando cargo seguro de €${totalCost}...`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setPaymentStatusMessage('¡Autorización concedida por CaixaBank!');
        await new Promise(resolve => setTimeout(resolve, 600));
      } else if (selectedPaymentMethod === 'Apple Pay') {
        setPaymentStatusMessage('Estableciendo conexión segura con Apple Wallet...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPaymentStatusMessage('Iniciando verificación biométrica Face ID / Touch ID...');
        await new Promise(resolve => setTimeout(resolve, 1400));
        setPaymentStatusMessage(`Procesando cargo seguro de €${totalCost} con Apple Pay...`);
        await new Promise(resolve => setTimeout(resolve, 1200));
        setPaymentStatusMessage('¡Transacción aprobada por Apple Pay!');
        await new Promise(resolve => setTimeout(resolve, 600));
      } else if (selectedPaymentMethod === 'Google Pay') {
        setPaymentStatusMessage('Estableciendo comunicación segura con Google Pay...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPaymentStatusMessage('Validando credenciales de Google Wallet...');
        await new Promise(resolve => setTimeout(resolve, 1200));
        setPaymentStatusMessage(`Procesando cargo seguro de €${totalCost} con Google Pay...`);
        await new Promise(resolve => setTimeout(resolve, 1200));
        setPaymentStatusMessage('¡Transacción autorizada por Google Pay!');
        await new Promise(resolve => setTimeout(resolve, 600));
      } else if (selectedPaymentMethod === 'Bizum') {
        if (!bizumPhone) {
          throw new Error('Por favor introduce tu número de Bizum.');
        }
        setPaymentStatusMessage('Consultando pasarela Bizum España para la referencia...');
        await new Promise(resolve => setTimeout(resolve, 1800));
        setPaymentStatusMessage('¡Pago verificado! Bizum recibido correctamente.');
        await new Promise(resolve => setTimeout(resolve, 800));
      } else if (selectedPaymentMethod === 'Bank Transfer') {
        setPaymentStatusMessage('Procesando datos de la transferencia...');
        await new Promise(resolve => setTimeout(resolve, 1200));
      }

      // Save Booking
      onAddBooking({
        guestName,
        guestEmail,
        guestPhone,
        checkIn,
        checkOut,
        guestsCount,
        totalPrice: totalCost,
        status: selectedPaymentMethod === 'Bank Transfer' && !uploadedReceipt ? 'Pending' : 'Confirmed',
        paymentStatus: selectedPaymentMethod === 'Bank Transfer' && !uploadedReceipt ? 'Pending' : 'Paid',
        paymentMethod: selectedPaymentMethod,
        notes: notes + (selectedPaymentMethod === 'Bank Transfer' ? ` [Ref: ${transferRef}]` : '')
      });

      setCheckoutStep('success');
      setIsSuccess(true);
    } catch (err: any) {
      setFormError(err.message || 'Error al procesar el pago. Por favor, compruébelo.');
    } finally {
      setIsProcessingPayment(false);
      setPaymentStatusMessage('');
    }
  };

  const handleResetForm = () => {
    setGuestName('');
    setGuestEmail('');
    setGuestPhone('');
    setCheckIn('');
    setCheckOut('');
    setNotes('');
    setCardNumber('');
    setCardHolder('');
    setCardExpiry('');
    setCardCvc('');
    setUploadedReceipt(null);
    setCheckoutStep('form');
    setIsSuccess(false);
    setStayType('guest');
    setFamilyPin('');
    setIsPinVerified(false);
  };

  // Generate calendar days grid
  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-11"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatDateString(year, month, d);
      const { status } = getDateStatus(dateStr);
      
      const isSelectedCheckIn = checkIn === dateStr;
      const isSelectedCheckOut = checkOut === dateStr;
      const isInRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;

      let cellStyle = "relative h-11 flex items-center justify-center text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer rounded-none ";
      let dotStyle = "absolute bottom-1 w-1.5 h-1.5 rounded-full ";

      if (status === 'booked') {
        cellStyle += "bg-stone-200 text-stone-400 line-through cursor-not-allowed";
        dotStyle += "bg-stone-400";
      } else if (status === 'family') {
        cellStyle += "bg-[#E5E1D8]/60 text-stone-700 font-bold cursor-not-allowed";
        dotStyle += "bg-stone-500";
      } else if (isSelectedCheckIn || isSelectedCheckOut) {
        cellStyle += "bg-accent-terracotta text-white z-10 scale-105 font-bold";
        dotStyle += "bg-white";
      } else if (isInRange) {
        cellStyle += "bg-accent-terracotta/10 text-stone-900 border-y border-dashed border-accent-terracotta/20";
        dotStyle += "bg-transparent";
      } else {
        cellStyle += "bg-white hover:bg-[#E5E1D8]/50 text-stone-800 hover:scale-[1.02]";
        dotStyle += "bg-transparent";
      }

      days.push(
        <button
          key={`day-${d}`}
          type="button"
          onClick={() => handleDayClick(d)}
          className={cellStyle}
          disabled={status === 'booked' || status === 'family'}
          title={status === 'family' ? 'Uso Familiar' : status === 'booked' ? 'Reservado' : 'Disponible'}
        >
          <span>{d}</span>
          {status !== 'available' && <span className={dotStyle} />}
        </button>
      );
    }

    return days;
  };

  return (
    <section id="reservas" className="py-24 bg-[#FAFAF5] border-b border-[#E5E1D8] scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-stone-500 text-xs uppercase tracking-[0.25em] font-sans block">
            {language === 'ca' ? 'Disponibilitat i Reserves' : language === 'en' ? 'Availability & Bookings' : 'Disponibilidad & Reservas'}
          </span>
          <h2 className="text-3xl md:text-4xl font-serif italic font-normal mt-2 text-[#1A1A1A]">
            {language === 'ca' ? 'Planifica la teva Estada' : language === 'en' ? 'Plan your Stay' : 'Planifica tu Estancia'}
          </h2>
          <p className="text-stone-600 max-w-xl mx-auto mt-4 text-sm font-light">
            {language === 'ca' 
              ? 'Consulta el calendari interactiu de la casa per veure els dies disponibles. Tria les teves dates i envia una sol·licitud de reserva segura.' 
              : language === 'en' 
                ? 'Check the interactive calendar of the house to see available days. Choose your dates and send a secure booking request.' 
                : 'Consulta el calendario interactivo de la casa para ver los días disponibles. Elige tus fechas y envía una solicitud de reserva segura.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Calendar Widget (7 cols on large screens) */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 border border-[#E5E1D8] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-serif italic font-medium text-stone-800">
                  {monthNames[month]} {year}
                </h3>
                <p className="text-xs text-stone-500 font-sans mt-0.5 uppercase tracking-wider">Gelida, Catalunya</p>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-2 border border-stone-300 hover:bg-stone-100 hover:text-stone-900 transition-colors text-stone-700 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 border border-stone-300 hover:bg-stone-100 hover:text-stone-900 transition-colors text-stone-700 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {(language === 'ca' ? ['Diu', 'Dil', 'Dim', 'Dme', 'Dju', 'Div', 'Dis'] : language === 'en' ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']).map(day => (
                <div key={day} className="text-[10px] font-sans font-semibold text-stone-400 uppercase py-1 tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 border border-stone-100 bg-stone-50">
              {renderDays()}
            </div>

            {/* Calendar Legend */}
            <div className="mt-8 pt-6 border-t border-[#E5E1D8] flex flex-wrap gap-6 text-[10px] font-sans uppercase tracking-wider text-stone-500 justify-center">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-white border border-stone-300 inline-block mr-2" />
                <span>{language === 'ca' ? 'Disponible' : language === 'en' ? 'Available' : 'Disponible'}</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-[#E5E1D8]/60 border border-[#E5E1D8] inline-block mr-2" />
                <span>{language === 'ca' ? 'Espai Familiar' : language === 'en' ? 'Family Use' : 'Uso Familiar'}</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-stone-200 border border-stone-300 inline-block mr-2 line-through" />
                <span>{language === 'ca' ? 'Reservat' : language === 'en' ? 'Booked' : 'Reservado'}</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-accent-terracotta inline-block mr-2" />
                <span>{language === 'ca' ? 'Selecció' : language === 'en' ? 'Selection' : 'Selección'}</span>
              </div>
            </div>
          </div>

          {/* Secure Booking Form (5 cols on large screens) */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 border border-[#E5E1D8] shadow-md relative overflow-hidden">
              
              <h3 className="text-2xl font-serif italic font-normal mb-6 text-stone-900 text-center">{t.calFormTitle}</h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Dates display */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#FAFAF5] p-3.5 border border-[#E5E1D8]">
                    <label className="block text-[9px] font-sans uppercase tracking-[0.15em] text-stone-500 font-semibold">{t.calCheckIn}</label>
                    <div className="flex items-center mt-1.5 text-xs font-semibold tracking-wide text-stone-800">
                      <CalendarIcon className="w-4 h-4 text-accent-terracotta mr-2 shrink-0" />
                      {checkIn ? (
                        <span className="font-mono">{checkIn}</span>
                      ) : (
                        <span className="text-stone-400 italic">{language === 'ca' ? 'Tria dia' : language === 'en' ? 'Add date' : 'Elige día'}</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#FAFAF5] p-3.5 border border-[#E5E1D8]">
                    <label className="block text-[9px] font-sans uppercase tracking-[0.15em] text-stone-500 font-semibold">{t.calCheckOut}</label>
                    <div className="flex items-center mt-1.5 text-xs font-semibold tracking-wide text-stone-800">
                      <CalendarIcon className="w-4 h-4 text-accent-terracotta mr-2 shrink-0" />
                      {checkOut ? (
                        <span className="font-mono">{checkOut}</span>
                      ) : (
                        <span className="text-stone-400 italic">{language === 'ca' ? 'Tria dia' : language === 'en' ? 'Add date' : 'Elige día'}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pricing Calculation */}
                {checkIn && checkOut && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-[#FAFAF5] p-4 border border-[#E5E1D8] text-xs space-y-2 font-sans text-stone-700"
                  >
                    <div className="flex justify-between">
                      <span>{language === 'ca' ? 'Estada' : language === 'en' ? 'Stay' : 'Estancia'} ({nights} {nights === 1 ? (language === 'ca' ? 'nit' : language === 'en' ? 'night' : 'noche') : (language === 'ca' ? 'nits' : language === 'en' ? 'nights' : 'noches')}):</span>
                      <span className="font-mono font-medium">€{totalCost - settings.cleaningFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t.calCleaning}:</span>
                      <span className="font-mono font-medium">€{settings.cleaningFee}</span>
                    </div>
                    <div className="h-[1px] bg-stone-200 my-1.5" />
                    <div className="flex justify-between text-stone-900 font-semibold text-sm">
                      <span>{language === 'ca' ? 'Total Estimat' : language === 'en' ? 'Estimated Total' : 'Total Estimado'}:</span>
                      <span className="font-mono text-accent-terracotta text-base">€{totalCost}</span>
                    </div>
                    <p className="text-[10px] text-stone-400 italic font-mono mt-1">
                      * {language === 'ca' ? 'Tarifes ajustades automàticament segons temporada.' : language === 'en' ? 'Rates adjusted automatically based on season.' : 'Tarifas ajustadas automáticamente según temporada.'}
                    </p>
                  </motion.div>
                )}
                <div className="space-y-4">
                  {/* Stay Type Selection (Cooperative vs Guest) */}
                  <div className="space-y-2.5 p-4 bg-stone-50 border border-stone-200">
                    <label className="block text-[9px] font-sans uppercase tracking-[0.15em] text-stone-500 font-bold">
                      {t.stayTypeLabel}
                    </label>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setStayType('guest');
                          setIsPinVerified(false);
                          setFamilyPin('');
                          setFormError('');
                        }}
                        className={`py-2 px-3 text-[10px] font-sans uppercase tracking-wider font-semibold border text-center transition-all cursor-pointer ${
                          stayType === 'guest'
                            ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        {t.stayTypeGuest}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setStayType('family');
                          setFormError('');
                        }}
                        className={`py-2 px-3 text-[10px] font-sans uppercase tracking-wider font-semibold border text-center transition-all cursor-pointer ${
                          stayType === 'family'
                            ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                            : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        {t.stayTypeFamily}
                      </button>
                    </div>

                    {/* Family PIN input if type === 'family' */}
                    <AnimatePresence>
                      {stayType === 'family' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden space-y-2"
                        >
                          <div className="h-[1px] bg-stone-200 my-2" />
                          <label className="block text-[9px] font-sans uppercase tracking-widest text-stone-500 font-semibold mb-1">
                            {t.familyPinLabel}
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="password"
                              maxLength={4}
                              value={familyPin}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setFamilyPin(val);
                                if (val === '1967') {
                                  setIsPinVerified(true);
                                  setFormError('');
                                } else {
                                  setIsPinVerified(false);
                                }
                              }}
                              placeholder={t.familyPinPlaceholder}
                              className="w-full bg-white border border-stone-200 rounded-none px-4 py-2.5 text-xs text-stone-850 focus:outline-none tracking-widest text-center"
                            />
                          </div>
                          {familyPin.length === 4 && (
                            <p className={`text-[10px] font-medium font-sans ${isPinVerified ? 'text-emerald-600 font-bold' : 'text-red-500'}`}>
                              {isPinVerified ? t.familyPinSuccess : t.familyPinError}
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label className="block text-[9px] font-sans uppercase tracking-widest text-stone-500 font-semibold mb-1">{t.calFullName}</label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Sarah Jenkins"
                      className="w-full bg-white border border-stone-200 rounded-none px-4 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-accent-terracotta focus:border-accent-terracotta transition-all font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-sans uppercase tracking-widest text-stone-500 font-semibold mb-1">{t.calEmail}</label>
                      <input
                        type="email"
                        required
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="sarah@example.com"
                        className="w-full bg-white border border-stone-200 rounded-none px-4 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-accent-terracotta focus:border-accent-terracotta transition-all font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-sans uppercase tracking-widest text-stone-500 font-semibold mb-1">{t.calPhone}</label>
                      <input
                        type="tel"
                        required
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="+34 600 000 000"
                        className="w-full bg-white border border-stone-200 rounded-none px-4 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-accent-terracotta focus:border-accent-terracotta transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-sans uppercase tracking-widest text-stone-500 font-semibold mb-1">{t.calNumGuests}</label>
                      <div className="relative">
                        <Users className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <select
                          value={guestsCount}
                          onChange={(e) => setGuestsCount(Number(e.target.value))}
                          className="w-full bg-white border border-stone-200 rounded-none pl-10 pr-4 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-accent-terracotta focus:border-accent-terracotta transition-all appearance-none cursor-pointer font-sans"
                        >
                          {Array.from({ length: settings.capacity }, (_, i) => i + 1).map(num => (
                            <option key={num} value={num} className="bg-white text-stone-800">
                              {num} {num === 1 
                                ? (language === 'ca' ? 'persona' : language === 'en' ? 'person' : 'persona') 
                                : (language === 'ca' ? 'persones' : language === 'en' ? 'people' : 'personas')}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {stayType === 'guest' ? (
                      <div>
                        <label className="block text-[9px] font-sans uppercase tracking-widest text-stone-500 font-semibold mb-1">{language === 'ca' ? 'Mètode de Pagament' : language === 'en' ? 'Payment Method' : 'Método de Pago'}</label>
                        <div className="relative">
                          <CreditCard className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <select
                            value={selectedPaymentMethod}
                            onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                            className="w-full bg-white border border-stone-200 rounded-none pl-10 pr-8 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-accent-terracotta focus:border-accent-terracotta appearance-none cursor-pointer font-sans"
                          >
                            <option value="Card">{language === 'ca' ? 'Targeta de Crèdit' : language === 'en' ? 'Credit Card' : 'Tarjeta de Crédito'}</option>
                            <option value="Apple Pay">Apple Pay</option>
                            <option value="Google Pay">Google Pay</option>
                            <option value="Bizum">Bizum</option>
                            <option value="Bank Transfer">{language === 'ca' ? 'Transferència Bancària' : language === 'en' ? 'Bank Transfer' : 'Transferencia Bancaria'}</option>
                          </select>
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none w-2 h-2 border-r border-b border-stone-500 rotate-45" />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[9px] font-sans uppercase tracking-widest text-stone-500 font-semibold mb-1">{language === 'ca' ? 'Registre Familiar' : language === 'en' ? 'Family Registry' : 'Registro Familiar'}</label>
                        <div className="w-full bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs text-emerald-700 font-semibold font-sans flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{language === 'ca' ? 'Ús Familiar Autoritza' : language === 'en' ? 'Authorized Family Use' : 'Uso Familiar Autorizado'}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[9px] font-sans uppercase tracking-widest text-stone-500 font-semibold mb-1">{language === 'ca' ? 'Notes (Opcional)' : language === 'en' ? 'Notes (Optional)' : 'Notas (Opcional)'}</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={language === 'ca' ? 'Ex. Arribada tard, bressol per a nadó...' : language === 'en' ? 'E.g. Late arrival, baby cot...' : 'Ej. Llegada tarde, cuna para bebé...'}
                      rows={2}
                      className="w-full bg-white border border-stone-200 rounded-none px-4 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-accent-terracotta focus:border-accent-terracotta transition-all resize-none font-sans"
                    />
                  </div>
                </div>

                {formError && checkoutStep === 'form' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-3 border border-red-200"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="w-full bg-accent-terracotta hover:bg-accent-terracotta-hover text-white py-4 px-6 rounded-none text-xs font-semibold uppercase tracking-widest shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2 hover:scale-[1.01]"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>{stayType === 'family' ? t.familyRegisterBtn : t.calPayBtn}</span>
                </button>

                <p className="text-[10px] text-center text-stone-400 mt-4 tracking-wider uppercase leading-relaxed">
                  {language === 'ca' 
                    ? 'Passarel·la xifrada SSL. Pots pagar amb targeta, Bizum o transferència bancària.' 
                    : language === 'en' 
                      ? 'SSL Encrypted Gateway. You can pay via credit card, Bizum or bank wire transfer.' 
                      : 'Pasarela cifrada SSL. Puedes pagar mediante tarjeta, Bizum o transferencia.'}
                </p>
              </form>
            </div>
          </div>

        </div>
      </div>

      {/* FULL SCREEN SECURE CHECKOUT MODAL OVERLAY */}
      <AnimatePresence>
        {checkoutStep === 'checkout' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-md overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white w-full max-w-4xl border border-[#E5E1D8] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 max-h-[90vh] md:max-h-none"
            >
              
              {/* Left Column: Order details & Payment Method tabs (5 cols) */}
              <div className="md:col-span-5 bg-[#FAFAF5] p-6 md:p-8 border-b md:border-b-0 md:border-r border-[#E5E1D8] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-accent-terracotta" />
                      <span className="text-[10px] uppercase font-sans tracking-[0.2em] font-bold text-stone-800">
                        {language === 'ca' ? 'Pagament 100% Segur' : language === 'en' ? '100% Secure Payment' : 'Pago 100% Seguro'}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono bg-stone-200 text-stone-800 px-2.5 py-1">SSL 256-BIT</span>
                  </div>

                  <h3 className="text-xl font-serif italic text-stone-900 mb-6">
                    {language === 'ca' ? 'La teva Reserva' : language === 'en' ? 'Your Reservation' : 'Tu Reserva'}
                  </h3>
                  
                  {/* Reservation details list */}
                  <div className="space-y-4 font-sans text-xs text-stone-700">
                    <div className="flex justify-between py-2 border-b border-stone-200/60">
                      <span className="text-stone-400">{language === 'ca' ? 'Casa Rústica' : language === 'en' ? 'Country House' : 'Casa Rústica'}</span>
                      <span className="font-semibold text-stone-900">Casa Tarongers</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-stone-200/60">
                      <span className="text-stone-400">{t.calCheckIn}</span>
                      <span className="font-mono font-medium text-stone-900">{checkIn}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-stone-200/60">
                      <span className="text-stone-400">{t.calCheckOut}</span>
                      <span className="font-mono font-medium text-stone-900">{checkOut}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-stone-200/60">
                      <span className="text-stone-400">{language === 'ca' ? 'Estada' : language === 'en' ? 'Stay' : 'Estancia'}</span>
                      <span className="font-medium text-stone-900">
                        {nights} {nights === 1 ? (language === 'ca' ? 'nit' : language === 'en' ? 'night' : 'noche') : (language === 'ca' ? 'nits' : language === 'en' ? 'nights' : 'noches')}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-stone-200/60">
                      <span className="text-stone-400">{language === 'ca' ? 'Hostes' : language === 'en' ? 'Guests' : 'Huéspedes'}</span>
                      <span className="font-medium text-stone-900">
                        {guestsCount} {guestsCount === 1 ? (language === 'ca' ? 'persona' : language === 'en' ? 'person' : 'persona') : (language === 'ca' ? 'persones' : language === 'en' ? 'people' : 'personas')}
                      </span>
                    </div>
                  </div>

                  {/* Express Checkout section - Beautiful side-by-side buttons like the user's image */}
                  <div className="mt-8 pt-6 border-t border-stone-200/60">
                    <span className="text-[10px] font-sans uppercase tracking-[0.15em] text-stone-500 font-semibold block mb-3">
                      {language === 'ca' ? 'Pagament Ràpid Express' : language === 'en' ? 'Express Checkout' : 'Pago Rápido Express'}
                    </span>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Apple Pay Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (!isProcessingPayment) {
                            setSelectedPaymentMethod('Apple Pay');
                            setFormError('');
                          }
                        }}
                        disabled={isProcessingPayment}
                        className={`group relative flex flex-col items-center justify-center p-4 border rounded-xl transition-all duration-200 cursor-pointer ${
                          selectedPaymentMethod === 'Apple Pay'
                            ? 'border-black bg-stone-50 ring-2 ring-black/10'
                            : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="mb-2">
                          <ApplePayLogo className="scale-110" />
                        </div>
                        <span className="text-[10px] font-sans text-stone-500 group-hover:text-stone-700 transition-colors">
                          {language === 'ca' ? 'Pagar amb Apple Pay' : language === 'en' ? 'Pay with Apple Pay' : 'Pagar con Apple Pay'}
                        </span>
                        {selectedPaymentMethod === 'Apple Pay' && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-black animate-pulse" />
                        )}
                      </button>

                      {/* Google Pay Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (!isProcessingPayment) {
                            setSelectedPaymentMethod('Google Pay');
                            setFormError('');
                          }
                        }}
                        disabled={isProcessingPayment}
                        className={`group relative flex flex-col items-center justify-center p-4 border rounded-xl transition-all duration-200 cursor-pointer ${
                          selectedPaymentMethod === 'Google Pay'
                            ? 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/10'
                            : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="mb-2">
                          <GooglePayLogo className="scale-110" />
                        </div>
                        <span className="text-[10px] font-sans text-stone-500 group-hover:text-stone-700 transition-colors">
                          {language === 'ca' ? 'Pagar amb GPay' : language === 'en' ? 'Pay with GPay' : 'Pagar con GPay'}
                        </span>
                        {selectedPaymentMethod === 'Google Pay' && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Payment Tabs Selector Inside Checkout */}
                  <div className="mt-8 pt-6 border-t border-stone-200/60">
                    <span className="text-[9px] font-sans uppercase tracking-widest text-stone-400 font-semibold block mb-3">
                      {language === 'ca' ? 'Altres opcions de pagament' : language === 'en' ? 'Other payment options' : 'Otras opciones de pago'}
                    </span>
                    <div className="space-y-2">
                      {[
                        { 
                          id: 'Card', 
                          label: language === 'ca' ? 'Targeta de Crèdit' : language === 'en' ? 'Credit Card' : 'Tarjeta de Crédito', 
                          desc: language === 'ca' ? 'Pagament immediat amb Stripe' : language === 'en' ? 'Instant payment with Stripe' : 'Pago inmediato con Stripe', 
                          icon: <CreditCard className="w-4 h-4" /> 
                        },
                        { 
                          id: 'Apple Pay', 
                          label: 'Apple Pay ', 
                          desc: language === 'ca' ? 'Express amb el teu Apple Wallet' : language === 'en' ? 'Express with your Apple Wallet' : 'Express con tu Apple Wallet', 
                          icon: <ApplePayLogo className="scale-90" /> 
                        },
                        { 
                          id: 'Google Pay', 
                          label: 'Google Pay', 
                          desc: language === 'ca' ? 'Express amb el teu Google Wallet' : language === 'en' ? 'Express with your Google Wallet' : 'Express con tu Google Wallet', 
                          icon: <GooglePayLogo className="scale-90" /> 
                        },
                        { 
                          id: 'Bizum', 
                          label: 'Bizum', 
                          desc: language === 'ca' ? 'Transferència mòbil immediata' : language === 'en' ? 'Instant mobile transfer' : 'Transferencia móvil inmediata', 
                          icon: <Smartphone className="w-4 h-4" /> 
                        },
                        { 
                          id: 'Bank Transfer', 
                          label: language === 'ca' ? 'Transferència Bancària' : language === 'en' ? 'Bank Transfer' : 'Transferencia Bancaria', 
                          desc: language === 'ca' ? 'Aprovació després de la recepció' : language === 'en' ? 'Approval upon receipt' : 'Aprobación tras recepción', 
                          icon: <Building2 className="w-4 h-4" /> 
                        }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (!isProcessingPayment) {
                              setSelectedPaymentMethod(item.id as PaymentMethod);
                              setFormError('');
                            }
                          }}
                          disabled={isProcessingPayment}
                          className={`w-full flex items-center justify-between p-3 border text-left cursor-pointer transition-all ${
                            selectedPaymentMethod === item.id 
                              ? 'border-accent-terracotta bg-white shadow-sm ring-1 ring-accent-terracotta' 
                              : 'border-stone-200 bg-white/50 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`${selectedPaymentMethod === item.id ? 'text-accent-terracotta' : 'text-stone-400'}`}>
                              {item.icon}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-stone-800 flex items-center gap-2">
                                {item.id === 'Apple Pay' ? 'Apple Pay' : item.id === 'Google Pay' ? 'Google Pay' : item.label}
                              </div>
                              <div className="text-[9px] text-stone-400 font-sans">{item.desc}</div>
                            </div>
                          </div>
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            selectedPaymentMethod === item.id ? 'border-accent-terracotta bg-accent-terracotta' : 'border-stone-300'
                          }`}>
                            {selectedPaymentMethod === item.id && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-stone-200">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                      {language === 'ca' ? 'Total a Pagar' : language === 'en' ? 'Total to Pay' : 'Total a Pagar'}
                    </span>
                    <span className="text-2xl font-mono font-bold text-accent-terracotta">€{totalCost}</span>
                  </div>
                  <p className="text-[9px] text-stone-400 italic">
                    {language === 'ca' ? 'Preus amb IVA i taxes locals de Gelida inclosos.' : language === 'en' ? 'Prices including VAT and local Gelida taxes.' : 'Precios con IVA y tasas locales de Gelida incluidos.'}
                  </p>
                </div>
              </div>

              {/* Right Column: Payment Details form (7 cols) */}
              <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between relative overflow-y-auto max-h-[60vh] md:max-h-none">
                
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isProcessingPayment) {
                      setCheckoutStep('form');
                      setFormError('');
                    }
                  }}
                  disabled={isProcessingPayment}
                  className="absolute top-4 right-4 p-1.5 hover:bg-stone-100 text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
                  title={language === 'ca' ? 'Tancar passarel·la' : language === 'en' ? 'Close gateway' : 'Cerrar pasarela'}
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Form header */}
                <div className="mb-6">
                  <span className="text-[9px] font-sans uppercase tracking-[0.2em] font-semibold text-accent-terracotta">
                    {language === 'ca' ? 'Passarel·la de Pagament Segura' : language === 'en' ? 'Secure Payment Gateway' : 'Pasarela de Pago Segura'}
                  </span>
                  <h4 className="text-xl font-serif italic text-stone-900 mt-1">
                    {selectedPaymentMethod === 'Card' && (language === 'ca' ? 'Pagament amb Targeta' : language === 'en' ? 'Card Payment' : 'Pago con Tarjeta')}
                    {selectedPaymentMethod === 'Apple Pay' && (language === 'ca' ? 'Pagament Express amb Apple Pay' : language === 'en' ? 'Express Payment with Apple Pay' : 'Pago Express con Apple Pay')}
                    {selectedPaymentMethod === 'Google Pay' && (language === 'ca' ? 'Pagament Express amb Google Pay' : language === 'en' ? 'Express Payment with Google Pay' : 'Pago Express con Google Pay')}
                    {selectedPaymentMethod === 'Bizum' && (language === 'ca' ? 'Pagament Express Bizum' : language === 'en' ? 'Express Bizum Payment' : 'Pago Express Bizum')}
                    {selectedPaymentMethod === 'Bank Transfer' && (language === 'ca' ? 'Transferència Bancària SEPA' : language === 'en' ? 'SEPA Bank Transfer' : 'Transferencia Bancaria SEPA')}
                  </h4>
                </div>

                {/* ERROR PANEL inside checkout */}
                {formError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex items-start gap-2.5 text-xs text-red-600 bg-red-50 p-3.5 border border-red-200"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </motion.div>
                )}

                {/* ACTIVE CONTENT BY PAYMENT METHOD */}
                <div className="flex-1 pb-8">
                  
                  {/* METHOD 1: CARD (STRIPE CHECKOUT) */}
                  {selectedPaymentMethod === 'Card' && (
                    <div className="space-y-6">
                      
                      {/* VIRTUAL CREDIT CARD 3D FLIP */}
                      <div className="perspective-[1000px] py-4">
                        <div 
                          className={`w-full max-w-[320px] h-[190px] mx-auto relative transition-transform duration-700 [transform-style:preserve-3d] shadow-xl rounded-2xl ${
                            isFlipped ? '[transform:rotateY(180deg)]' : ''
                          }`}
                        >
                          {/* Front Face */}
                          <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 p-6 text-white flex flex-col justify-between [backface-visibility:hidden]">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <span className="text-[9px] tracking-widest text-stone-400 font-sans uppercase">CASA TARONGERS</span>
                                <div className="w-9 h-7 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-300 rounded-[4px] opacity-95 flex items-center justify-center overflow-hidden">
                                  {/* Chip Lines */}
                                  <div className="grid grid-cols-3 gap-0.5 w-6 h-5 opacity-40">
                                    <div className="border border-stone-900"></div>
                                    <div className="border border-stone-900"></div>
                                    <div className="border border-stone-900"></div>
                                    <div className="border border-stone-900"></div>
                                    <div className="border border-stone-900"></div>
                                    <div className="border border-stone-900"></div>
                                  </div>
                                </div>
                              </div>
                              <span className="text-sm font-bold tracking-widest italic text-stone-200">
                                {getCardType(cardNumber)}
                              </span>
                            </div>

                            <div className="space-y-4">
                              {/* Card Number */}
                              <div className="text-lg font-mono tracking-widest text-center py-1">
                                {cardNumber || '•••• •••• •••• ••••'}
                              </div>

                              <div className="flex justify-between items-end">
                                <div className="space-y-0.5">
                                  <span className="text-[7px] text-stone-400 uppercase tracking-wider block">{language === 'ca' ? 'Titular' : language === 'en' ? 'Cardholder' : 'Titular'}</span>
                                  <div className="text-xs font-mono uppercase truncate max-w-[160px]">
                                    {cardHolder || (language === 'ca' ? 'NOM COMPLET' : language === 'en' ? 'FULL NAME' : 'NOMBRE COMPLETO')}
                                  </div>
                                </div>
                                <div className="space-y-0.5 text-right">
                                  <span className="text-[7px] text-stone-400 uppercase tracking-wider block">{language === 'ca' ? 'Expira' : language === 'en' ? 'Expires' : 'Expira'}</span>
                                  <div className="text-xs font-mono">
                                    {cardExpiry || 'MM/YY'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Back Face */}
                          <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-stone-950 via-stone-900 to-stone-850 py-6 text-white flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)]">
                            <div className="w-full h-10 bg-stone-950"></div>
                            
                            <div className="px-6 space-y-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-8 bg-stone-100 flex items-center justify-end px-3">
                                  <span className="text-xs font-mono text-stone-800 tracking-widest font-bold select-none italic">
                                    {cardCvc || '•••'}
                                  </span>
                                </div>
                                <span className="text-[9px] text-stone-400 uppercase tracking-wider">CVC</span>
                              </div>

                              <p className="text-[7px] text-stone-500 leading-normal text-justify">
                                {language === 'ca' 
                                  ? 'Aquesta targeta virtual simula de forma segura una passarel·la Stripe autoritzada. No es realitzaran càrrecs reals al seu compte bancari. Totes les comunicacions viatgen xifrades per canal HTTPS.' 
                                  : language === 'en' 
                                    ? 'This virtual card securely simulates an authorized Stripe gateway. No real charges will be made to your bank account. All communications are encrypted over HTTPS.' 
                                    : 'Esta tarjeta virtual simula de forma segura una pasarela Stripe autorizada. No se realizarán cargos reales a su cuenta bancaria. Todas las comunicaciones viajan cifradas por canal HTTPS.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card form inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-12">
                          <label className="block text-[10px] font-sans uppercase tracking-widest text-stone-500 font-semibold mb-1">
                            {language === 'ca' ? 'Número de Targeta' : language === 'en' ? 'Card Number' : 'Número de Tarjeta'}
                          </label>
                          <div className="relative">
                            <CreditCard className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              required
                              value={cardNumber}
                              onChange={handleCardNumberChange}
                              onFocus={() => setCardFocus('number')}
                              onBlur={() => setCardFocus(null)}
                              placeholder="4000 1234 5678 9010"
                              className="w-full bg-white border border-stone-200 rounded-none pl-10 pr-4 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-accent-terracotta focus:border-accent-terracotta transition-all font-mono"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-12">
                          <label className="block text-[10px] font-sans uppercase tracking-widest text-stone-500 font-semibold mb-1">
                            {language === 'ca' ? 'Nom del Titular' : language === 'en' ? 'Cardholder Name' : 'Nombre del Titular'}
                          </label>
                          <input
                            type="text"
                            required
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            onFocus={() => setCardFocus('name')}
                            onBlur={() => setCardFocus(null)}
                            placeholder="SERENA RENE FISER"
                            className="w-full bg-white border border-stone-200 rounded-none px-4 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-accent-terracotta focus:border-accent-terracotta transition-all font-mono uppercase"
                          />
                        </div>

                        <div className="md:col-span-6">
                          <label className="block text-[10px] font-sans uppercase tracking-widest text-stone-500 font-semibold mb-1">
                            {language === 'ca' ? 'Data de Venciment' : language === 'en' ? 'Expiration Date' : 'Fecha de Vencimiento'}
                          </label>
                          <input
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            onFocus={() => setCardFocus('expiry')}
                            onBlur={() => setCardFocus(null)}
                            placeholder="MM/YY"
                            className="w-full bg-white border border-stone-200 rounded-none px-4 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-accent-terracotta focus:border-accent-terracotta transition-all font-mono"
                          />
                        </div>

                        <div className="md:col-span-6">
                          <label className="block text-[10px] font-sans uppercase tracking-widest text-stone-500 font-semibold mb-1">
                            CVC / {language === 'ca' ? 'Codi de Seguretat' : language === 'en' ? 'Security Code' : 'Código de Seguridad'}
                          </label>
                          <input
                            type="text"
                            required
                            value={cardCvc}
                            onChange={handleCvcChange}
                            onFocus={() => setCardFocus('cvc')}
                            onBlur={() => setCardFocus(null)}
                            placeholder="123"
                            className="w-full bg-white border border-stone-200 rounded-none px-4 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-accent-terracotta focus:border-accent-terracotta transition-all font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* METHOD: APPLE PAY */}
                  {selectedPaymentMethod === 'Apple Pay' && (
                    <div className="space-y-6 flex flex-col items-center justify-center py-6">
                      <div className="bg-[#1A1A1A] text-white p-6 rounded-2xl w-full max-w-[340px] shadow-lg border border-stone-800 flex flex-col items-center text-center space-y-6">
                        <div className="flex justify-between items-center w-full border-b border-stone-800 pb-4">
                          <span className="text-[10px] tracking-wider text-stone-400 font-semibold uppercase">Apple Pay Express</span>
                          <span className="text-sm font-bold"> Pay</span>
                        </div>

                        {/* Interactive Sensor Ring/Indicator */}
                        <div className="relative flex items-center justify-center w-24 h-24">
                          {/* Outer Pulsing Aura */}
                          <motion.div 
                            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute inset-0 bg-accent-terracotta/10 rounded-full"
                          />
                          <motion.div 
                            animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.4, 0.15] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute inset-[-10px] bg-accent-terracotta/5 rounded-full"
                          />
                          <div className="w-16 h-16 rounded-full bg-stone-900 border-2 border-accent-terracotta flex items-center justify-center shadow-inner">
                            <Smartphone className="w-8 h-8 text-accent-terracotta" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h5 className="text-sm font-semibold text-stone-100">
                            {language === 'ca' ? 'A punt per pagar amb Apple Pay' : language === 'en' ? 'Ready to pay with Apple Pay' : 'Listo para pagar con Apple Pay'}
                          </h5>
                          <p className="text-[11px] text-stone-400 max-w-[240px] mx-auto leading-relaxed">
                            {language === 'ca' ? 'Utilitza el teu dispositiu Apple per autoritzar aquest pagament amb la teva empremta digital o Face ID de forma immediata.' : language === 'en' ? 'Use your Apple device to authorize this payment with your fingerprint or Face ID instantly.' : 'Usa tu dispositivo Apple para autorizar este pago con tu huella digital o Face ID de forma inmediata.'}
                          </p>
                        </div>

                        {/* Credit card preview list of mock wallet cards */}
                        <div className="bg-stone-900 border border-stone-800 p-3 rounded-xl w-full flex items-center justify-between text-left text-xs text-stone-300">
                          <div className="flex items-center gap-3">
                            <div className="bg-stone-800 px-2.5 py-1.5 rounded text-[10px] font-mono tracking-widest font-bold border border-stone-700"> Card</div>
                            <div>
                              <div className="font-semibold">Visa {language === 'ca' ? 'Dèbit' : language === 'en' ? 'Debit' : 'Débito'}</div>
                              <div className="text-[10px] text-stone-500">
                                {language === 'ca' ? 'Acabada en' : language === 'en' ? 'Ending in' : 'Terminada en'} •••• 1967
                              </div>
                            </div>
                          </div>
                          <Check className="w-4 h-4 text-accent-terracotta" />
                        </div>
                      </div>

                      <p className="text-[10px] text-stone-400 text-center max-w-[320px] leading-relaxed">
                        {language === 'ca' 
                          ? '* En fer clic al botó de pagament, es simularà l\'autenticació amb la teva empremta dactilar o Face ID i es completarà el procés de forma totalment segura.' 
                          : language === 'en' 
                            ? '* By clicking the payment button, authentication with your fingerprint or Face ID will be simulated and the process completed securely.' 
                            : '* Al hacer clic en el botón de pago, se simulará la autenticación con tu huella dactilar o Face ID y se completará el proceso de forma totalmente segura.'}
                      </p>
                    </div>
                  )}

                  {/* METHOD: GOOGLE PAY */}
                  {selectedPaymentMethod === 'Google Pay' && (
                    <div className="space-y-6 flex flex-col items-center justify-center py-6">
                      <div className="bg-white p-6 rounded-2xl w-full max-w-[340px] shadow-lg border border-stone-200 flex flex-col items-center text-center space-y-6">
                        <div className="flex justify-between items-center w-full border-b border-stone-100 pb-4">
                          <span className="text-[10px] tracking-wider text-stone-400 font-semibold uppercase">Google Pay Express</span>
                          {/* Styled GPay icon */}
                          <span className="text-sm font-sans font-bold flex items-center gap-1 text-stone-800">
                            <span className="text-blue-500">G</span>
                            <span className="text-red-500">o</span>
                            <span className="text-yellow-500">o</span>
                            <span className="text-blue-500">g</span>
                            <span className="text-green-500">l</span>
                            <span className="text-red-500">e</span>
                            <span className="text-stone-500 font-medium text-xs ml-1">Pay</span>
                          </span>
                        </div>

                        {/* Animated Card Slide / Ripple */}
                        <div className="relative flex items-center justify-center w-24 h-24">
                          <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.4, 0.1] }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute inset-0 bg-blue-500/10 rounded-full"
                          />
                          <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-500 flex items-center justify-center shadow-inner">
                            <CreditCard className="w-8 h-8 text-blue-500" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h5 className="text-sm font-semibold text-stone-800">
                            {language === 'ca' ? 'A punt per pagar amb Google Pay' : language === 'en' ? 'Ready to pay with Google Pay' : 'Listo para pagar con Google Pay'}
                          </h5>
                          <p className="text-[11px] text-stone-500 max-w-[240px] mx-auto leading-relaxed">
                            {language === 'ca' ? 'Selecciona una targeta desada del teu compte de Google i confirma el pagament amb total seguretat.' : language === 'en' ? 'Select a saved card from your Google account and confirm payment securely.' : 'Selecciona una tarjeta guardada de tu cuenta de Google y confirma el pago con total seguridad.'}
                          </p>
                        </div>

                        {/* List of mock cards inside Google Pay account */}
                        <div className="w-full space-y-2">
                          <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl w-full flex items-center justify-between text-left text-xs text-stone-700 cursor-pointer hover:bg-stone-100/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="bg-white px-2.5 py-1.5 rounded text-[10px] font-mono tracking-widest font-bold border border-stone-200">GPay</div>
                              <div>
                                <div className="font-semibold">Mastercard Premium</div>
                                <div className="text-[10px] text-stone-400">
                                  {language === 'ca' ? 'Acabada en' : language === 'en' ? 'Ending in' : 'Terminada en'} •••• 4242
                                </div>
                              </div>
                            </div>
                            <Check className="w-4 h-4 text-blue-500" />
                          </div>
                        </div>
                      </div>

                      <p className="text-[10px] text-stone-400 text-center max-w-[320px] leading-relaxed">
                        {language === 'ca' 
                          ? '* En fer clic al botó inferior es simularà el diàleg integrat de Google Pay i es processarà el càrrec segur contra la teva targeta seleccionada.' 
                          : language === 'en' 
                            ? '* By clicking the button below, the integrated Google Pay dialogue will be simulated and the secure charge will be processed against your selected card.' 
                            : '* Al hacer clic en el botón inferior se simulará el diálogo integrado de Google Pay y se procesará el cargo seguro contra tu tarjeta seleccionada.'}
                      </p>
                    </div>
                  )}

                  {/* METHOD 2: BIZUM */}
                  {selectedPaymentMethod === 'Bizum' && (
                    <div className="space-y-6">
                      <div className="bg-[#FAFAF5] border border-[#E5E1D8] p-5 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#CD5B3A]/10 flex items-center justify-center shrink-0">
                          <Smartphone className="w-5 h-5 text-accent-terracotta" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-sans uppercase tracking-widest text-stone-400 font-semibold">
                            Bizum {language === 'ca' ? 'Directe' : language === 'en' ? 'Direct' : 'Directo'}
                          </span>
                          <h5 className="text-sm font-semibold text-stone-900">
                            {language === 'ca' ? 'Pas 1: Realitza el Bizum des de la teva app mòbil' : language === 'en' ? 'Step 1: Send the Bizum from your mobile app' : 'Paso 1: Realiza el Bizum desde tu app móvil'}
                          </h5>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            {language === 'ca' ? 'Obre la teva aplicació bancària de confiança, accedeix a la secció de Bizum i envia l\'import exacte al nostre contacte oficial.' : language === 'en' ? 'Open your trusted banking app, access the Bizum section and send the exact amount to our official contact.' : 'Abre tu aplicación bancaria de confianza, accede a la sección de Bizum y envía el importe exacto a nuestro contacto oficial.'}
                          </p>
                        </div>
                      </div>

                      {/* Virtual Smartphone interface */}
                      <div className="max-w-[280px] mx-auto bg-stone-900 p-3.5 pb-4 rounded-[28px] shadow-lg border-4 border-stone-800 text-white font-sans text-xs space-y-4">
                        <div className="w-16 h-3 bg-stone-800 rounded-full mx-auto mb-1"></div>
                        
                        <div className="bg-[#00A896] p-4 text-center rounded-xl space-y-2">
                          <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase">BIZUM ESPAÑA</div>
                          <div className="text-[10px] text-teal-100 uppercase tracking-widest">
                            {language === 'ca' ? 'Enviar Bizum A' : language === 'en' ? 'Send Bizum To' : 'Enviar Bizum A'}
                          </div>
                          <div className="text-base font-bold font-mono tracking-wide flex items-center justify-center gap-1">
                            <span>+34 629 334 000</span>
                            <button
                              type="button"
                              onClick={() => handleCopyText('+34 629 334 000', 'phone')}
                              className="p-1 text-teal-200 hover:text-white transition-colors cursor-pointer"
                              title={language === 'ca' ? 'Copiar número' : language === 'en' ? 'Copy number' : 'Copiar número'}
                            >
                              {copiedField === 'phone' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <div className="text-[10px] italic opacity-90 font-sans">Albert C. (Casa Tarongers)</div>
                        </div>

                        <div className="bg-stone-800/80 p-3.5 space-y-2.5 rounded-lg border border-stone-700">
                          <div className="flex justify-between border-b border-stone-700/60 pb-1.5 text-[10px]">
                            <span className="text-stone-400">{language === 'ca' ? 'Import:' : language === 'en' ? 'Amount:' : 'Importe:'}</span>
                            <span className="font-mono font-bold text-accent-terracotta">€{totalCost}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-stone-400">{language === 'ca' ? 'Concepte / Ref:' : language === 'en' ? 'Concept / Ref:' : 'Concepto / Ref:'}</span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono font-bold text-stone-200">{transferRef}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyText(transferRef, 'ref')}
                                className="p-0.5 text-stone-400 hover:text-stone-200 cursor-pointer"
                                title={language === 'ca' ? 'Copiar referència' : language === 'en' ? 'Copy reference' : 'Copiar referencia'}
                              >
                                {copiedField === 'ref' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-100">
                        <label className="block text-[10px] font-sans uppercase tracking-widest text-stone-500 font-semibold mb-1.5">
                          {language === 'ca' ? 'Pas 2: Introdueix el teu telèfon d\'enviament' : language === 'en' ? 'Step 2: Enter your sender phone number' : 'Paso 2: Introduce tu teléfono de envío'}
                        </label>
                        <div className="relative">
                          <Smartphone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            required
                            value={bizumPhone}
                            onChange={(e) => setBizumPhone(e.target.value)}
                            placeholder="+34 600 000 000"
                            className="w-full bg-white border border-stone-200 rounded-none pl-10 pr-4 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-accent-terracotta focus:border-accent-terracotta transition-all font-sans"
                          />
                        </div>
                        <p className="text-[10px] text-stone-400 mt-1">
                          {language === 'ca' 
                            ? 'Associarem el Bizum rebut des d\'aquest número a la teva sol·licitud de reserva en segons.' 
                            : language === 'en' 
                              ? 'We will match the Bizum received from this number to your booking request in seconds.' 
                              : 'Asociaremos el Bizum recibido desde este número a tu solicitud de reserva en segundos.'}
                        </p>
                      </div>

                    </div>
                  )}

                  {/* METHOD 3: BANK TRANSFER */}
                  {selectedPaymentMethod === 'Bank Transfer' && (
                    <div className="space-y-6">
                      <div className="bg-[#FAFAF5] border border-[#E5E1D8] p-4 text-xs space-y-4 text-stone-700">
                        
                        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                          <div>
                            <span className="text-[8px] font-sans uppercase tracking-widest text-stone-400 font-semibold block">
                              {language === 'ca' ? 'Compte Beneficiari' : language === 'en' ? 'Beneficiary Account' : 'Cuenta Beneficiario'}
                            </span>
                            <span className="font-serif italic font-semibold text-stone-900 text-sm">Albert Civit i Llobera</span>
                          </div>
                          <span className="text-[9px] font-sans bg-stone-200 px-2 py-0.5 font-bold uppercase tracking-wider">CaixaBank</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <span className="text-[8px] font-sans uppercase tracking-widest text-stone-400 font-semibold block mb-0.5">IBAN España</span>
                            <div className="flex items-center gap-1.5 bg-white border border-stone-200 px-2.5 py-1.5 font-mono text-xs font-bold text-stone-800 justify-between">
                              <span className="truncate">ES84 2100 0487 5602 0012 3456</span>
                              <button
                                type="button"
                                onClick={() => handleCopyText('ES8421000487560200123456', 'iban')}
                                className="p-1 text-stone-400 hover:text-stone-800 cursor-pointer"
                                title="Copiar IBAN"
                              >
                                {copiedField === 'iban' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <span className="text-[8px] font-sans uppercase tracking-widest text-stone-400 font-semibold block mb-0.5">
                              {language === 'ca' ? 'Referència Obligatòria' : language === 'en' ? 'Required Reference' : 'Referencia Obligatoria'}
                            </span>
                            <div className="flex items-center gap-1.5 bg-white border border-stone-200 px-2.5 py-1.5 font-mono text-xs font-bold text-stone-800 justify-between">
                              <span>{transferRef}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyText(transferRef, 'bankref')}
                                className="p-1 text-stone-400 hover:text-stone-800 cursor-pointer"
                                title="Copiar Referencia"
                              >
                                {copiedField === 'bankref' ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="text-[10px] text-stone-500 leading-relaxed bg-white/50 p-2.5 border border-[#E5E1D8]">
                          {language === 'ca' ? (
                            <>* Si us plau, realitza la transferència SEPA pel total de <strong className="text-accent-terracotta">€{totalCost}</strong> indicant la referència exacta perquè puguem validar la teva reserva amb rapidesa.</>
                          ) : language === 'en' ? (
                            <>* Please make the SEPA transfer for the total of <strong className="text-accent-terracotta">€{totalCost}</strong> indicating the exact reference so we can validate your reservation quickly.</>
                          ) : (
                            <>* Por favor, realiza la transferencia SEPA por el total de <strong className="text-accent-terracotta">€{totalCost}</strong> indicando la referencia exacta para que podamos validar tu reserva con rapidez.</>
                          )}
                        </div>
                      </div>

                      {/* File upload receipt block */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-sans uppercase tracking-widest text-stone-500 font-semibold">
                          {language === 'ca' ? 'Adjuntar Justificant de Pagament (Opcional)' : language === 'en' ? 'Attach Payment Receipt (Optional)' : 'Adjuntar Justificante de Pago (Opcional)'}
                        </label>
                        
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-none p-6 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                            isDragging 
                              ? 'border-accent-terracotta bg-accent-terracotta/5' 
                              : uploadedReceipt 
                                ? 'border-green-300 bg-green-50/20' 
                                : 'border-stone-300 bg-white hover:bg-[#FAFAF5] hover:border-stone-400'
                          }`}
                        >
                          <input
                            type="file"
                            id="receipt-file"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const f = e.target.files[0];
                                setUploadedReceipt({ name: f.name, size: `${(f.size / (1024 * 1024)).toFixed(2)} MB` });
                              }
                            }}
                          />
                          
                          {uploadedReceipt ? (
                            <div className="space-y-2">
                              <FileText className="w-10 h-10 text-green-600 mx-auto" />
                              <div>
                                <div className="text-xs font-bold text-stone-800 truncate max-w-[240px]">{uploadedReceipt.name}</div>
                                <div className="text-[10px] text-stone-400 font-mono">{uploadedReceipt.size}</div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUploadedReceipt(null);
                                }}
                                className="text-[10px] uppercase font-sans text-red-500 font-bold tracking-wider hover:underline block mx-auto pt-1 cursor-pointer"
                              >
                                {language === 'ca' ? 'Treure Justificant' : language === 'en' ? 'Remove Receipt' : 'Quitar Justificante'}
                              </button>
                            </div>
                          ) : (
                            <label htmlFor="receipt-file" className="space-y-2.5 cursor-pointer w-full h-full block">
                              <Upload className="w-8 h-8 text-stone-400 mx-auto" />
                              <div className="space-y-1">
                                <p className="text-xs font-semibold text-stone-700">
                                  {language === 'ca' ? 'Arrossega o selecciona el PDF de transferència' : language === 'en' ? 'Drag or select the transfer PDF' : 'Arrastra o selecciona el PDF de transferencia'}
                                </p>
                                <p className="text-[10px] text-stone-400">
                                  {language === 'ca' ? 'Formats admesos: PDF, JPG, PNG (Màx 5MB)' : language === 'en' ? 'Supported formats: PDF, JPG, PNG (Max 5MB)' : 'Formatos admitidos: PDF, JPG, PNG (Max 5MB)'}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  simulateReceiptSelection();
                                }}
                                className="inline-flex text-[9px] uppercase font-sans font-bold tracking-widest text-accent-terracotta hover:text-accent-terracotta-hover border border-accent-terracotta/40 hover:border-accent-terracotta py-1.5 px-3 bg-white mt-1"
                              >
                                {language === 'ca' ? 'Generar Justificant Demo' : language === 'en' ? 'Generate Demo Receipt' : 'Generar Justificante Demo'}
                              </button>
                            </label>
                          )}
                        </div>

                        <p className="text-[10px] text-stone-400 leading-normal italic">
                          {language === 'ca' 
                            ? '* Si adjuntes el comprovant bancari, la família pre-aprobarà la teva estada immediatament sense haver d\'esperar que els diners arribin al compte de destí.' 
                            : language === 'en' 
                              ? '* If you attach the bank receipt, the family will pre-approve your stay immediately without waiting for the money to arrive at the destination account.' 
                              : '* Si adjuntas el comprobante bancario, la familia pre-aprobará tu estancia inmediatamente sin tener que esperar a que el dinero llegue a la cuenta de destino.'}
                        </p>
                      </div>
                    </div>
                  )}

                </div>

                {/* Secure Gateway footer branding */}
                <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[10px] text-stone-400 font-sans uppercase">
                    <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                    <span>{language === 'ca' ? 'Connexió Protegida SSL • Dades Xifrades' : language === 'en' ? 'SSL Protected Connection • Encrypted Data' : 'Conexión Protegida SSL • Datos Cifrados'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCompletePayment}
                    disabled={isProcessingPayment}
                    className={`w-full sm:w-auto py-3 px-8 rounded-none text-xs font-semibold uppercase tracking-widest shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:bg-stone-300 disabled:cursor-not-allowed hover:scale-[1.01] ${
                      selectedPaymentMethod === 'Apple Pay' 
                        ? 'bg-black hover:bg-stone-900 text-white border border-stone-800' 
                        : selectedPaymentMethod === 'Google Pay'
                          ? 'bg-white hover:bg-stone-50 text-stone-900 border border-stone-300'
                          : 'bg-accent-terracotta hover:bg-accent-terracotta-hover text-white'
                    }`}
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className={`w-4 h-4 animate-spin ${selectedPaymentMethod === 'Google Pay' ? 'text-stone-800' : 'text-white'}`} />
                        <span>{language === 'ca' ? 'Processant...' : language === 'en' ? 'Processing...' : 'Procesando...'}</span>
                      </>
                    ) : (
                      <>
                        <Lock className={`w-3.5 h-3.5 ${selectedPaymentMethod === 'Google Pay' ? 'text-stone-800' : 'text-white'}`} />
                        <span>
                          {selectedPaymentMethod === 'Bank Transfer' && (language === 'ca' ? 'Confirmar Transferència' : language === 'en' ? 'Confirm Transfer' : 'Confirmar Transferencia')}
                          {selectedPaymentMethod === 'Apple Pay' && (language === 'ca' ? 'Pagar amb Apple Pay ' : language === 'en' ? 'Pay with Apple Pay ' : 'Pagar con Apple Pay ')}
                          {selectedPaymentMethod === 'Google Pay' && (language === 'ca' ? 'Pagar amb Google Pay' : language === 'en' ? 'Pay with Google Pay' : 'Pagar con Google Pay')}
                          {selectedPaymentMethod === 'Card' && (language === 'ca' ? `Pagar €${totalCost}` : language === 'en' ? `Pay €${totalCost}` : `Pagar €${totalCost}`)}
                          {selectedPaymentMethod === 'Bizum' && (language === 'ca' ? `Confirmar Pagament €${totalCost}` : language === 'en' ? `Confirm Payment €${totalCost}` : `Confirmar Pago €${totalCost}`)}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {/* Interactive Status overlay during payment processing */}
                <AnimatePresence>
                  {isProcessingPayment && paymentStatusMessage && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center z-30"
                    >
                      <Loader2 className="w-12 h-12 text-accent-terracotta animate-spin mb-6" />
                      <h4 className="text-lg font-serif italic text-stone-900 mb-2">
                        {language === 'ca' ? 'Processant Transacció Segura' : language === 'en' ? 'Processing Secure Transaction' : 'Procesando Transacción Segura'}
                      </h4>
                      <p className="text-xs text-stone-500 font-mono tracking-wide max-w-sm">
                        {paymentStatusMessage}
                      </p>
                      <span className="text-[9px] text-stone-400 uppercase font-sans tracking-[0.25em] mt-8 block">PASARELA DE PAGO STRIPE V3</span>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FINAL SUCCESS OVERLAY */}
      <AnimatePresence>
        {isSuccess && checkoutStep === 'success' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border border-[#E5E1D8] shadow-2xl p-8 md:p-12 text-center max-w-md w-full relative"
            >
              <div className="w-20 h-20 bg-[#FAFAF5] rounded-full border border-stone-200 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-accent-terracotta" />
              </div>

              <h4 className="text-2xl md:text-3xl font-serif italic text-stone-900 mb-2">
                {language === 'ca' ? '¡Pagament Confirmat!' : language === 'en' ? 'Payment Confirmed!' : '¡Pago Confirmado!'}
              </h4>
              <p className="text-xs text-accent-terracotta uppercase font-sans tracking-[0.2em] font-semibold mb-4">
                {language === 'ca' ? 'Reserva Pre-Aprovada' : language === 'en' ? 'Reservation Pre-Approved' : 'Reserva Pre-Aprobada'}
              </p>
              
              <div className="bg-[#FAFAF5] p-4 border border-stone-200/60 rounded-none text-left space-y-2 text-xs text-stone-700 mb-6 font-sans">
                <div className="flex justify-between">
                  <span className="text-stone-400">{language === 'ca' ? 'Hoste:' : language === 'en' ? 'Guest:' : 'Huésped:'}</span>
                  <span className="font-semibold text-stone-900">{guestName || 'Serena Rene Fiser'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">{language === 'ca' ? 'Total Transacció:' : language === 'en' ? 'Transaction Total:' : 'Total Transacción:'}</span>
                  <span className="font-mono font-bold text-accent-terracotta">€{totalCost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">{language === 'ca' ? 'Forma de Pagament:' : language === 'en' ? 'Payment Method:' : 'Forma de Pago:'}</span>
                  <span className="font-semibold text-stone-900">
                    {selectedPaymentMethod === 'Card' && (language === 'ca' ? 'Targeta (Stripe)' : language === 'en' ? 'Card (Stripe)' : 'Tarjeta (Stripe)')}
                    {selectedPaymentMethod === 'Apple Pay' && 'Apple Pay '}
                    {selectedPaymentMethod === 'Google Pay' && 'Google Pay'}
                    {selectedPaymentMethod === 'Bizum' && `Bizum ${language === 'ca' ? 'Directe' : language === 'en' ? 'Direct' : 'Directo'}`}
                    {selectedPaymentMethod === 'Bank Transfer' && (language === 'ca' ? 'Transferència Bancària' : language === 'en' ? 'Bank Transfer' : 'Transferencia Bancaria')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">{language === 'ca' ? 'Estat de la Sol·licitud:' : language === 'en' ? 'Request Status:' : 'Estado Solicitud:'}</span>
                  <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-[3px] border border-green-200 text-[10px]">
                    {selectedPaymentMethod === 'Bank Transfer' && !uploadedReceipt 
                      ? (language === 'ca' ? 'PENDENT' : language === 'en' ? 'PENDING' : 'PENDIENTE') 
                      : (language === 'ca' ? 'APROVADA' : language === 'en' ? 'APPROVED' : 'APROVADA')}
                  </span>
                </div>
              </div>

              <p className="text-stone-600 text-xs font-light leading-relaxed mb-8">
                {selectedPaymentMethod === 'Bank Transfer' && !uploadedReceipt ? (
                  language === 'ca' 
                    ? 'La teva sol·licitud ha estat registrada. Un cop confirmem l\'abonament de la transferència, validarem definitivament la teva estada. ¡Gràcies per confiar en la nostra vila!' 
                    : language === 'en' 
                      ? 'Your request has been registered. Once we confirm receipt of the bank transfer, we will definitely validate your stay. Thank you for trusting our villa!' 
                      : 'Tu solicitud ha sido registrada. Una vez confirmemos el abono de la transferencia, validaremos definitivamente tu estancia. ¡Gracias por confiar en nuestra villa!'
                ) : (
                  language === 'ca' 
                    ? 'Hem rebut el teu pagament amb total èxit. La teva reserva a Casa Tarongers queda pre-aprovada automàticament. Rebràs un correu electrònic detallat amb les dades d\'accés i la guia rústica en breus moments.' 
                    : language === 'en' 
                      ? 'We have successfully received your payment. Your reservation at Casa Tarongers is automatically pre-approved. You will receive a detailed email with access data and the rustic guide in a few moments.' 
                      : 'Hemos recibido tu pago con total éxito. Tu reserva en Casa Tarongers queda pre-aprovada automáticamente. Recibirás un correo electrónico detallado con los datos de acceso y la guía rústica en breves momentos.'
                )}
              </p>

              <button
                type="button"
                onClick={handleResetForm}
                className="w-full bg-accent-terracotta hover:bg-accent-terracotta-hover text-white py-3 px-6 rounded-none text-xs font-semibold uppercase tracking-widest shadow-sm transition-all duration-200 cursor-pointer"
              >
                {language === 'ca' ? 'Tornar a l\'Inici' : language === 'en' ? 'Return Home' : 'Volver al Inicio'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
