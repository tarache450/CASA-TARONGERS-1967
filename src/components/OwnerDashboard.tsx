import React, { useState } from 'react';
import { Booking, Payment, PropertySettings, BookingStatus, PaymentStatus, PaymentMethod } from '../types';
import { 
  Lock, TrendingUp, Calendar, CreditCard, Users, Plus, Check, X, 
  Trash2, Sliders, DollarSign, Receipt, RefreshCw, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OwnerDashboardProps {
  bookings: Booking[];
  payments: Payment[];
  settings: PropertySettings;
  onUpdateSettings: (settings: PropertySettings) => void;
  onAddBooking: (booking: Booking) => void;
  onUpdateBookingStatus: (id: string, status: BookingStatus) => void;
  onUpdatePaymentStatus: (bookingId: string, status: PaymentStatus, method: PaymentMethod) => void;
}

export default function OwnerDashboard({
  bookings,
  payments,
  settings,
  onUpdateSettings,
  onAddBooking,
  onUpdateBookingStatus,
  onUpdatePaymentStatus
}: OwnerDashboardProps) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'payments' | 'settings' | 'preservation'>('overview');

  // New manual booking state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newCheckIn, setNewCheckIn] = useState('');
  const [newCheckOut, setNewCheckOut] = useState('');
  const [newGuestsCount, setNewGuestsCount] = useState(2);
  const [newType, setNewType] = useState<'guest' | 'family'>('guest');
  const [newMethod, setNewMethod] = useState<PaymentMethod>('Bank Transfer');
  const [newNotes, setNewNotes] = useState('');
  const [newPriceManual, setNewPriceManual] = useState<number | ''>('');
  const [addError, setAddError] = useState('');

  // Rate Editing state
  const [baseRate, setBaseRate] = useState(settings.basePrice);
  const [highSeasonRate, setHighSeasonRate] = useState(settings.highSeasonPrice);
  const [cleaningFee, setCleaningFee] = useState(settings.cleaningFee);
  const [capacity, setCapacity] = useState(settings.capacity);

  // Auth Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1967') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Código PIN familiar incorrecto. Pista: Es el año de la casa.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPin('');
  };

  // Calculations for Stats
  const activeBookings = bookings.filter(b => b.status !== 'Cancelled');
  
  // Total Revenue: Confirmed & Paid bookings
  const paidBookings = bookings.filter(b => b.status === 'Confirmed' && b.paymentStatus === 'Paid');
  const totalRevenue = paidBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  // Pending approval list
  const pendingApprovalsCount = bookings.filter(b => b.status === 'Pending').length;

  // Unpaid/Pending payments total
  const pendingPaymentsAmount = bookings
    .filter(b => b.status === 'Confirmed' && b.paymentStatus === 'Pending')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  // Occupancy Calculation (percentage of days booked from July 1st to Sept 30th 2026 - 92 days)
  const calculateOccupancy = () => {
    const totalDays = 92; // July, August, Sept
    const bookedDaysSet = new Set<string>();

    activeBookings.forEach(b => {
      const [sYear, sMonth, sDay] = b.checkIn.split('-').map(Number);
      const [eYear, eMonth, eDay] = b.checkOut.split('-').map(Number);
      
      let current = new Date(sYear, sMonth - 1, sDay);
      const end = new Date(eYear, eMonth - 1, eDay);
      while (current < end) {
        const yyyy = current.getFullYear();
        const mm = String(current.getMonth() + 1).padStart(2, '0');
        const dd = String(current.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        // Only count within July-Sept 2026
        if (dateStr >= '2026-07-01' && dateStr <= '2026-09-30') {
          bookedDaysSet.add(dateStr);
        }
        current.setDate(current.getDate() + 1);
      }
    });

    const bookedCount = bookedDaysSet.size;
    return Math.round((bookedCount / totalDays) * 100);
  };

  const occupancyRate = calculateOccupancy();

  // Helper to calculate total price for manual additions
  const getCalculatedPrice = (start: string, end: string, type: 'guest' | 'family') => {
    if (type === 'family') return 0;
    if (!start || !end) return 0;
    
    let total = 0;
    const [sYear, sMonth, sDay] = start.split('-').map(Number);
    const [eYear, eMonth, eDay] = end.split('-').map(Number);
    
    let current = new Date(sYear, sMonth - 1, sDay);
    const targetEnd = new Date(eYear, eMonth - 1, eDay);

    while (current < targetEnd) {
      const m = current.getMonth();
      const isHigh = m === 6 || m === 7; // July or August
      total += isHigh ? settings.highSeasonPrice : settings.basePrice;
      current.setDate(current.getDate() + 1);
    }
    return total + settings.cleaningFee;
  };

  const handleAddManualBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');

    if (!newGuestName || !newCheckIn || !newCheckOut) {
      setAddError('Por favor completa las fechas y el nombre.');
      return;
    }

    if (newCheckOut <= newCheckIn) {
      setAddError('La fecha de salida debe ser posterior a la de entrada.');
      return;
    }

    // Check overlaps
    const hasOverlap = bookings.some(b => {
      if (b.status === 'Cancelled') return false;
      // Overlap formula: (start1 < end2) && (start2 < end1)
      return (b.checkIn < newCheckOut) && (newCheckIn < b.checkOut);
    });

    if (hasOverlap) {
      setAddError('Las fechas seleccionadas se solapan con una reserva existente.');
      return;
    }

    const calculatedPrice = getCalculatedPrice(newCheckIn, newCheckOut, newType);
    const finalPrice = newType === 'family' ? 0 : (newPriceManual !== '' ? Number(newPriceManual) : calculatedPrice);

    const manualBooking: Booking = {
      id: `M${Date.now().toString().slice(-4)}`,
      guestName: newType === 'family' ? `Uso Familiar - ${newGuestName}` : newGuestName,
      guestEmail: newType === 'family' ? 'familiar@tarongers.es' : 'manual-booking@example.com',
      guestPhone: '+34 --- -- -- --',
      checkIn: newCheckIn,
      checkOut: newCheckOut,
      guestsCount: newGuestsCount,
      totalPrice: finalPrice,
      status: newType === 'family' ? 'Family Use' : 'Confirmed',
      paymentStatus: newType === 'family' ? 'Paid' : 'Pending',
      paymentMethod: newType === 'family' ? 'None' : newMethod,
      notes: newNotes || (newType === 'family' ? 'Bloqueo manual de fechas familiar' : 'Reserva manual de huéspedes'),
      createdAt: new Date().toISOString()
    };

    onAddBooking(manualBooking);

    // Reset Form
    setNewGuestName('');
    setNewCheckIn('');
    setNewCheckOut('');
    setNewNotes('');
    setNewPriceManual('');
    setShowAddForm(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      basePrice: Number(baseRate),
      highSeasonPrice: Number(highSeasonRate),
      cleaningFee: Number(cleaningFee),
      capacity: Number(capacity)
    });
    alert('Configuración y tarifas guardadas correctamente.');
  };

  // Monthly stats for custom SVG charts
  const getMonthlyEarnings = () => {
    const data = { Jul: 0, Ago: 0, Sep: 0 };
    bookings.forEach(b => {
      if (b.status === 'Confirmed' && b.paymentStatus === 'Paid') {
        const monthStr = b.checkIn.slice(5, 7);
        if (monthStr === '07') data.Jul += b.totalPrice;
        if (monthStr === '08') data.Ago += b.totalPrice;
        if (monthStr === '09') data.Sep += b.totalPrice;
      }
    });
    return data;
  };

  const monthlyEarnings = getMonthlyEarnings();
  const maxEarningsVal = Math.max(...Object.values(monthlyEarnings), 1000);

  if (!isAuthenticated) {
    return (
      <section id="gestion-familiar" className="py-24 bg-[#2D2D2D] text-white min-h-[80vh] flex items-center justify-center relative scroll-mt-20">
        <div className="max-w-md w-full px-6">
          <div className="text-center mb-10">
            <span className="text-stone-400 text-xs font-sans uppercase tracking-[0.2em] block mb-2">Acceso de Propietarios</span>
            <h2 className="text-3xl font-serif italic font-normal text-stone-100">Portal Familiar</h2>
            <p className="text-stone-300 text-xs mt-3 font-light leading-relaxed">
              Área privada para que la familia administre el calendario, gestione el dinero y lleve el orden de Casa Tarongers.
            </p>
          </div>

          <div className="bg-[#1A1A1A] border border-stone-700 p-8 rounded-none">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-[#2D2D2D] border border-stone-700 flex items-center justify-center">
                <Lock className="w-5 h-5 text-stone-300" />
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-[10px] font-sans uppercase tracking-[0.15em] text-stone-300 mb-2">Código PIN Familiar</label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    required
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Escribe el PIN de 4 dígitos"
                    className="w-full bg-[#2D2D2D] border border-stone-700 rounded-none pl-4 pr-11 py-3 text-center text-lg font-mono tracking-[0.3em] text-white focus:outline-none focus:ring-1 focus:ring-stone-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {pinError && (
                <div className="text-red-400 text-xs bg-red-950/30 border border-red-900/40 p-3 rounded-none flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{pinError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#F9F7F2] hover:bg-white text-[#2D2D2D] font-semibold text-xs uppercase tracking-widest py-3.5 px-6 rounded-none shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                <span>Acceder al Panel</span>
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-stone-500 mt-6 uppercase tracking-wider font-sans">
            Pista: Es el año del nombre de la casa (4 dígitos)
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="gestion-familiar" className="py-16 bg-[#F9F7F2] min-h-screen text-stone-800 border-t border-[#E5E1D8] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Dashboard Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E5E1D8] pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 bg-[#2D2D2D] text-[#F9F7F2] text-[10px] font-sans font-semibold uppercase tracking-widest rounded-none">Familia</span>
              <h2 className="text-3xl font-serif italic font-normal text-[#1A1A1A]">Panel Casa Tarongers</h2>
            </div>
            <p className="text-stone-500 text-xs mt-1 font-light">Gestión familiar interna y finanzas en tiempo real.</p>
          </div>

          <div className="flex items-center gap-3 font-sans">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-xs uppercase tracking-wider rounded-none transition-all cursor-pointer ${activeTab === 'overview' ? 'bg-[#2D2D2D] text-white' : 'bg-transparent hover:bg-stone-200 border border-stone-300 text-stone-600'}`}
            >
              Resumen
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs uppercase tracking-wider bg-stone-800 hover:bg-stone-950 text-white rounded-none transition-colors cursor-pointer border border-transparent"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Dynamic Navigation Tabs inside dashboard */}
        <div className="flex overflow-x-auto gap-1 border-b border-[#E5E1D8] pb-0.5 mb-8 scrollbar-none font-sans">
          {[
            { id: 'overview', name: 'Estadísticas & Gráficos', icon: TrendingUp },
            { id: 'bookings', name: 'Reservas & Bloqueos', icon: Calendar },
            { id: 'payments', name: 'Libro de Pagos', icon: CreditCard },
            { id: 'settings', name: 'Tarifas y Ajustes', icon: Sliders },
            { id: 'preservation', name: 'Fondo y Reformas', icon: Receipt },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-widest border-b-2 transition-all whitespace-nowrap cursor-pointer rounded-none ${
                  activeTab === tab.id 
                    ? 'border-[#2D2D2D] text-[#2D2D2D] font-bold' 
                    : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* MAIN PANEL CONTENT */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {/* TAB 1: OVERVIEW & REAL-TIME FINANCIAL GRAPHICS */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Real-time stats cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {/* Total Revenue card */}
                  <div className="bg-white p-6 border border-[#E5E1D8] flex items-start justify-between">
                    <div>
                      <span className="text-stone-400 text-[10px] font-sans uppercase tracking-widest">Cobrado Real</span>
                      <h3 className="text-2xl font-mono font-bold text-[#2D2D2D] mt-2">€{totalRevenue}</h3>
                      <p className="text-[10px] text-stone-500 mt-1 leading-normal">Confirmado y pagado en cuenta familiar.</p>
                    </div>
                    <div className="p-3 bg-[#F9F7F2] text-stone-700 border border-[#E5E1D8]">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Occupancy Rate Card */}
                  <div className="bg-white p-6 border border-[#E5E1D8] flex items-start justify-between">
                    <div>
                      <span className="text-stone-400 text-[10px] font-sans uppercase tracking-widest">Tasa Ocupación</span>
                      <h3 className="text-2xl font-mono font-bold text-[#2D2D2D] mt-2">{occupancyRate}%</h3>
                      <p className="text-[10px] text-stone-500 mt-1 leading-normal">Días ocupados del total verano.</p>
                    </div>
                    <div className="p-3 bg-[#F9F7F2] text-stone-700 border border-[#E5E1D8]">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Pending approvals card */}
                  <div className="bg-white p-6 border border-[#E5E1D8] flex items-start justify-between">
                    <div>
                      <span className="text-stone-400 text-[10px] font-sans uppercase tracking-widest">Pendientes Aprobación</span>
                      <h3 className="text-2xl font-mono font-bold text-[#2D2D2D] mt-2">{pendingApprovalsCount}</h3>
                      <p className="text-[10px] text-stone-500 mt-1 leading-normal">Esperando confirmación de fechas.</p>
                    </div>
                    <div className="p-3 bg-[#F9F7F2] text-stone-700 border border-[#E5E1D8]">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Unpaid Bookings Amount card */}
                  <div className="bg-white p-6 border border-[#E5E1D8] flex items-start justify-between">
                    <div>
                      <span className="text-stone-400 text-[10px] font-sans uppercase tracking-widest">Pagos Pendientes</span>
                      <h3 className="text-2xl font-mono font-bold text-[#2D2D2D] mt-2">€{pendingPaymentsAmount}</h3>
                      <p className="text-[10px] text-stone-500 mt-1 leading-normal">Confirmados con cobro pendiente.</p>
                    </div>
                    <div className="p-3 bg-[#F9F7F2] text-[#A69E8F] border border-[#E5E1D8]">
                      <Receipt className="w-4 h-4" />
                    </div>
                  </div>

                </div>

                {/* Real-time Analytics Visual Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
                  {/* Earnings Chart (Custom SVG bar chart) */}
                  <div className="bg-white p-6 border border-[#E5E1D8]">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-base font-serif italic text-stone-800">Ingresos Mensuales Cobrados (2026)</h4>
                      <span className="text-[9px] font-sans uppercase tracking-widest text-stone-500 bg-[#F9F7F2] px-2.5 py-0.5 border border-[#E5E1D8]">Real-time</span>
                    </div>

                    <div className="h-64 flex items-end justify-around pt-6 pb-2 px-4 relative">
                      {/* Grid Lines */}
                      <div className="absolute inset-x-0 top-0 border-t border-dashed border-[#E5E1D8]" />
                      <div className="absolute inset-x-0 top-1/3 border-t border-dashed border-[#E5E1D8]" />
                      <div className="absolute inset-x-0 top-2/3 border-t border-dashed border-[#E5E1D8]" />
                      
                      {Object.entries(monthlyEarnings).map(([monthName, value]) => {
                        const pct = value > 0 ? (value / maxEarningsVal) * 80 + 10 : 0; // scale between 10% and 90%
                        return (
                          <div key={monthName} className="flex flex-col items-center w-24 group relative z-10">
                            <span className="text-[9px] uppercase tracking-widest text-stone-200 opacity-0 group-hover:opacity-100 absolute -top-8 bg-[#2D2D2D] px-2 py-1 transition-opacity pointer-events-none">
                              €{value}
                            </span>
                            <div 
                              style={{ height: `${pct}%` }} 
                              className="w-12 bg-[#2D2D2D] hover:bg-stone-700 transition-colors cursor-pointer relative rounded-none"
                            />
                            <span className="text-[10px] font-mono tracking-wider uppercase text-stone-500 mt-3">{monthName}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#E5E1D8] flex items-center justify-between text-[10px] text-stone-500 italic uppercase tracking-wider">
                      <span>Representa el cobro completo de reservas confirmadas y pagadas.</span>
                    </div>
                  </div>

                  {/* Calendar Distribution overview & upcoming events list */}
                  <div className="bg-white p-6 border border-[#E5E1D8]">
                    <h4 className="text-base font-serif italic text-stone-800 mb-6">Próximas Entradas (Orden Cronológico)</h4>
                    
                    <div className="space-y-4">
                      {activeBookings
                        .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
                        .slice(0, 4)
                        .map(booking => {
                          const isFamily = booking.status === 'Family Use';
                          return (
                            <div key={booking.id} className="flex items-center justify-between p-3.5 bg-[#F9F7F2] border border-[#E5E1D8] hover:bg-[#E5E1D8]/40 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 ${isFamily ? 'bg-[#D1C7B7]' : booking.status === 'Pending' ? 'bg-stone-400' : 'bg-[#2D2D2D]'}`} />
                                <div>
                                  <h5 className="text-xs font-semibold text-stone-800 leading-tight uppercase tracking-wider">{booking.guestName}</h5>
                                  <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                                    {booking.checkIn} → {booking.checkOut}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                {isFamily ? (
                                  <span className="text-[9px] uppercase tracking-wider font-semibold bg-[#D1C7B7] text-stone-800 px-2 py-0.5">Uso Familiar</span>
                                ) : (
                                  <div className="flex flex-col items-end">
                                    <span className="text-xs font-mono font-bold text-stone-800">€{booking.totalPrice}</span>
                                    <span className={`text-[9px] font-sans uppercase tracking-wider px-1.5 py-0.5 mt-0.5 ${booking.paymentStatus === 'Paid' ? 'bg-[#2D2D2D] text-white font-semibold' : 'bg-stone-200 text-stone-700'}`}>
                                      {booking.paymentStatus === 'Paid' ? 'Cobrado' : 'Pendiente'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BOOKING CONTROL & CALENDAR BLOCKING */}
            {activeTab === 'bookings' && (
              <div className="space-y-8 font-sans">
                {/* Header Action Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 border border-[#E5E1D8]">
                  <div>
                    <h4 className="text-base font-serif italic text-stone-800">Gestor de Fechas</h4>
                    <p className="text-xs text-stone-500 font-light">Bloquea fechas para la familia o añade reservas manuales externas.</p>
                  </div>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 bg-[#2D2D2D] hover:bg-stone-800 text-white text-xs font-sans uppercase tracking-widest py-2.5 px-4 rounded-none cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{showAddForm ? 'Cancelar Registro' : 'Añadir Bloqueo / Reserva'}</span>
                  </button>
                </div>

                {/* Add Manual Form Section */}
                <AnimatePresence>
                  {showAddForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-white border border-[#E5E1D8] p-6 rounded-none overflow-hidden"
                    >
                      <h4 className="text-base font-serif italic mb-4 text-stone-800">Añadir Reserva Manual o Bloqueo</h4>
                      
                      <form onSubmit={handleAddManualBooking} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">Tipo de Registro</label>
                          <select
                            value={newType}
                            onChange={(e) => setNewType(e.target.value as any)}
                            className="w-full bg-[#F9F7F2] border border-[#E5E1D8] rounded-none px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                          >
                            <option value="guest">Reserva de Huésped Externa</option>
                            <option value="family">Uso Familiar (Bloquear)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">
                            {newType === 'family' ? 'Miembro Familiar / Motivo' : 'Nombre del Huésped'}
                          </label>
                          <input
                            type="text"
                            required
                            value={newGuestName}
                            onChange={(e) => setNewGuestName(e.target.value)}
                            placeholder={newType === 'family' ? 'Ej. Jordi Tarongers' : 'Ej. Clara Müller'}
                            className="w-full bg-[#F9F7F2] border border-[#E5E1D8] rounded-none px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">Nº Personas</label>
                          <input
                            type="number"
                            min={1}
                            max={settings.capacity}
                            value={newGuestsCount}
                            onChange={(e) => setNewGuestsCount(Number(e.target.value))}
                            className="w-full bg-[#F9F7F2] border border-[#E5E1D8] rounded-none px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">Fecha de Entrada</label>
                          <input
                            type="date"
                            required
                            value={newCheckIn}
                            onChange={(e) => setNewCheckIn(e.target.value)}
                            className="w-full bg-[#F9F7F2] border border-[#E5E1D8] rounded-none px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-stone-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">Fecha de Salida</label>
                          <input
                            type="date"
                            required
                            value={newCheckOut}
                            onChange={(e) => setNewCheckOut(e.target.value)}
                            className="w-full bg-[#F9F7F2] border border-[#E5E1D8] rounded-none px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-stone-400"
                          />
                        </div>

                        {newType === 'guest' ? (
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">Método de Pago Preferido</label>
                            <select
                              value={newMethod}
                              onChange={(e) => setNewMethod(e.target.value as any)}
                              className="w-full bg-[#F9F7F2] border border-[#E5E1D8] rounded-none px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                            >
                              <option value="Bank Transfer">Transferencia Bancaria</option>
                              <option value="Bizum">Bizum</option>
                              <option value="Cash">Metálico / Efectivo</option>
                              <option value="Card">Tarjeta</option>
                            </select>
                          </div>
                        ) : (
                          <div className="flex items-center text-xs text-stone-700 bg-[#F9F7F2] px-4 py-2 border border-[#E5E1D8] h-10 mt-4 rounded-none">
                            <span className="font-sans uppercase tracking-wider text-[9px] font-semibold">Las reservas familiares tienen coste cero (€0)</span>
                          </div>
                        )}

                        {newType === 'guest' && (
                          <div className="md:col-span-3">
                            <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">Precio Total Manual (Dejar en blanco para cálculo automático + limpieza)</label>
                            <input
                              type="number"
                              value={newPriceManual}
                              onChange={(e) => setNewPriceManual(e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder={`Cálculo automático: €${getCalculatedPrice(newCheckIn, newCheckOut, 'guest')}`}
                              className="w-full bg-[#F9F7F2] border border-[#E5E1D8] rounded-none px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-stone-400"
                            />
                          </div>
                        )}

                        <div className="md:col-span-3">
                          <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">Notas Internas de la Familia</label>
                          <textarea
                             value={newNotes}
                             onChange={(e) => setNewNotes(e.target.value)}
                             placeholder="Ej. Les dejamos las llaves en la maceta..."
                             rows={2}
                             className="w-full bg-[#F9F7F2] border border-[#E5E1D8] rounded-none px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400 resize-none"
                          />
                        </div>

                        {addError && (
                          <div className="md:col-span-3 text-red-600 text-xs bg-red-50 p-3 rounded-none border border-red-100 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{addError}</span>
                          </div>
                        )}

                        <div className="md:col-span-3 flex justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="px-4 py-2 text-[10px] font-sans uppercase tracking-widest hover:bg-stone-100 rounded-none border border-stone-300 cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="bg-[#2D2D2D] hover:bg-stone-800 text-white px-5 py-2.5 rounded-none text-xs font-sans uppercase tracking-widest cursor-pointer transition-colors"
                          >
                            Registrar Fechas
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Booking List Table */}
                <div className="bg-white border border-[#E5E1D8] rounded-none overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#E5E1D8] bg-[#F9F7F2] flex justify-between items-center">
                    <h4 className="text-[10px] font-sans uppercase tracking-widest font-bold text-stone-500">Historial Completo de Estancias</h4>
                    <span className="text-[10px] font-sans uppercase tracking-widest text-stone-400">Total: {bookings.length} registros</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F9F7F2] text-stone-500 font-sans text-[10px] uppercase tracking-widest border-b border-[#E5E1D8]">
                          <th className="py-4 px-6 font-semibold">ID / Solicitud</th>
                          <th className="py-4 px-6 font-semibold">Huésped / Miembro</th>
                          <th className="py-4 px-6 font-semibold">Entrada → Salida</th>
                          <th className="py-4 px-6 font-semibold">Personas</th>
                          <th className="py-4 px-6 text-right font-semibold">Precio Total</th>
                          <th className="py-4 px-6 text-center font-semibold">Estado</th>
                          <th className="py-4 px-6 text-right font-semibold">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-sm">
                        {bookings
                          .sort((a, b) => b.checkIn.localeCompare(a.checkIn)) // newest check-ins first
                          .map(booking => {
                            const isFamily = booking.status === 'Family Use';
                            const isCancelled = booking.status === 'Cancelled';
                            
                            return (
                              <tr key={booking.id} className={`hover:bg-[#F9F7F2]/30 transition-colors ${isCancelled ? 'opacity-50 line-through' : ''}`}>
                                <td className="py-4 px-6 font-mono text-xs font-bold text-stone-500">
                                  {booking.id}
                                </td>
                                <td className="py-4 px-6">
                                  <div className="font-medium text-stone-800">{booking.guestName}</div>
                                  <div className="text-xs text-stone-400 font-mono">{booking.guestEmail}</div>
                                </td>
                                <td className="py-4 px-6 font-mono text-xs text-stone-600">
                                  {booking.checkIn} <span className="text-stone-300">|</span> {booking.checkOut}
                                </td>
                                <td className="py-4 px-6 font-mono text-stone-600">
                                  {booking.guestsCount} {booking.guestsCount === 1 ? 'pers.' : 'pers.'}
                                </td>
                                <td className="py-4 px-6 text-right font-mono text-stone-800 font-medium">
                                  {isFamily ? '—' : `€${booking.totalPrice}`}
                                </td>
                                <td className="py-4 px-6 text-center">
                                  <span className={`inline-block text-[9px] font-sans uppercase tracking-wider font-semibold px-2.5 py-1 rounded-none ${
                                    isFamily ? 'bg-[#E5E1D8] text-stone-700' :
                                    booking.status === 'Confirmed' ? 'bg-[#2D2D2D] text-[#F9F7F2]' :
                                    booking.status === 'Pending' ? 'bg-white border border-[#E5E1D8] text-stone-600' :
                                    'bg-stone-100 text-stone-400'
                                  }`}>
                                    {isFamily ? 'Familia' : booking.status === 'Confirmed' ? 'Confirmado' : booking.status === 'Pending' ? 'Pendiente' : 'Cancelado'}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {booking.status === 'Pending' && (
                                      <button
                                        onClick={() => onUpdateBookingStatus(booking.id, 'Confirmed')}
                                        title="Aprobar Solicitud"
                                        className="p-1.5 bg-[#F9F7F2] hover:bg-stone-100 text-stone-800 border border-[#E5E1D8] rounded-none cursor-pointer transition-colors"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    {!isCancelled && booking.status !== 'Family Use' && (
                                      <button
                                        onClick={() => onUpdateBookingStatus(booking.id, 'Cancelled')}
                                        title="Cancelar Reserva"
                                        className="p-1.5 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-stone-500 border border-[#E5E1D8] rounded-none cursor-pointer transition-colors"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    {isCancelled && (
                                      <button
                                        onClick={() => onUpdateBookingStatus(booking.id, 'Pending')}
                                        title="Restaurar a Pendiente"
                                        className="p-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-[#E5E1D8] rounded-none cursor-pointer transition-colors"
                                      >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PAYMENTS LEDGER */}
            {activeTab === 'payments' && (
              <div className="space-y-8 font-sans">
                {/* Statistics banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-[#E5E1D8] p-5 rounded-none flex items-center justify-between">
                    <div>
                      <span className="text-stone-500 text-[10px] font-sans font-bold uppercase tracking-widest">Total Cobrado Real</span>
                      <h4 className="text-2xl font-mono font-medium text-stone-800 mt-1">€{totalRevenue}</h4>
                    </div>
                    <Check className="w-5 h-5 text-stone-700" />
                  </div>
 
                  <div className="bg-white border border-[#E5E1D8] p-5 rounded-none flex items-center justify-between">
                    <div>
                      <span className="text-stone-500 text-[10px] font-sans font-bold uppercase tracking-widest">Esperando Confirmación</span>
                      <h4 className="text-2xl font-mono font-medium text-stone-800 mt-1">€{pendingPaymentsAmount}</h4>
                    </div>
                    <CreditCard className="w-5 h-5 text-stone-700" />
                  </div>
 
                  <div className="bg-white border border-[#E5E1D8] p-5 rounded-none flex items-center justify-between">
                    <div>
                      <span className="text-stone-500 text-[10px] font-sans font-bold uppercase tracking-widest">Huéspedes Totales</span>
                      <h4 className="text-2xl font-mono font-medium text-stone-800 mt-1">
                        {bookings.filter(b => b.status === 'Confirmed').length} Reservas
                      </h4>
                    </div>
                    <Users className="w-5 h-5 text-stone-700" />
                  </div>
                </div>
 
                {/* Ledger section */}
                <div className="bg-white border border-[#E5E1D8] rounded-none overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#E5E1D8] bg-[#F9F7F2] flex justify-between items-center">
                    <h4 className="text-[10px] font-sans uppercase tracking-widest font-bold text-stone-500">Libro de Pagos de Alquiler en Tiempo Real</h4>
                    <span className="text-[9px] font-sans uppercase tracking-wider text-stone-700 bg-[#E5E1D8] px-2.5 py-1 rounded-none font-semibold">Bizum / Transferencias</span>
                  </div>
 
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F9F7F2] text-stone-500 font-sans text-[10px] uppercase tracking-widest border-b border-[#E5E1D8]">
                          <th className="py-4 px-6 font-semibold">ID Pago</th>
                          <th className="py-4 px-6 font-semibold">Huésped</th>
                          <th className="py-4 px-6 font-semibold">Fecha Registro</th>
                          <th className="py-4 px-6 font-semibold">Vía / Método</th>
                          <th className="py-4 px-6 text-right font-semibold">Cantidad</th>
                          <th className="py-4 px-6 text-center font-semibold">Estado Cobro</th>
                          <th className="py-4 px-6 text-right font-semibold">Confirmar Recepción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-sm">
                        {payments
                          .sort((a, b) => b.date.localeCompare(a.date))
                          .map(payment => {
                            return (
                              <tr key={payment.id} className="hover:bg-[#F9F7F2]/30 transition-colors">
                                <td className="py-4 px-6 font-mono text-xs font-bold text-stone-500">
                                  {payment.id}
                                </td>
                                <td className="py-4 px-6">
                                  <div className="font-medium text-stone-800">{payment.guestName}</div>
                                  <div className="text-[11px] text-stone-400 font-mono">Ref Reserva: {payment.bookingId}</div>
                                </td>
                                <td className="py-4 px-6 font-mono text-xs text-stone-600">
                                  {payment.date}
                                </td>
                                <td className="py-4 px-6 font-mono text-xs">
                                  <span className="px-2 py-1 bg-[#F9F7F2] border border-[#E5E1D8] rounded-none text-stone-600 text-[10px]">
                                    {payment.method}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-right font-mono font-bold text-stone-800">
                                  €{payment.amount}
                                </td>
                                <td className="py-4 px-6 text-center">
                                  <span className={`inline-block text-[9px] font-sans uppercase tracking-wider font-semibold px-2.5 py-1 rounded-none ${
                                    payment.status === 'Paid' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                                    'bg-amber-50 text-amber-800 border border-amber-100 animate-pulse'
                                  }`}>
                                    {payment.status === 'Paid' ? 'Recibido ✓' : 'Esperando Bizum'}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                  {payment.status === 'Pending' ? (
                                    <button
                                      onClick={() => onUpdatePaymentStatus(payment.bookingId, 'Paid', payment.method)}
                                      className="bg-[#2D2D2D] hover:bg-stone-800 text-white text-[10px] font-sans uppercase tracking-widest px-3 py-1.5 rounded-none cursor-pointer transition-colors"
                                    >
                                      Confirmar Pago
                                    </button>
                                  ) : (
                                    <span className="text-xs font-mono text-stone-400">Completado ✓</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CONFIGURATION & PRICES */}
            {activeTab === 'settings' && (
              <div className="bg-white border border-[#E5E1D8] p-8 max-w-2xl mx-auto rounded-none font-sans">
                <div className="flex items-center gap-3 mb-6 border-b border-[#E5E1D8] pb-4">
                  <Sliders className="w-4 h-4 text-stone-800" />
                  <h4 className="text-base font-serif italic text-stone-800">Tarifas y Ajustes de Casa Tarongers</h4>
                </div>
 
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1.5 font-sans">Precio Base por Noche (€)</label>
                      <input
                        type="number"
                        required
                        value={baseRate}
                        onChange={(e) => setBaseRate(Number(e.target.value))}
                        className="w-full bg-[#F9F7F2] border border-[#E5E1D8] rounded-none px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-stone-400"
                      />
                      <p className="text-[9px] text-stone-400 mt-1 uppercase tracking-wider font-sans">Temporada normal (Septiembre - Junio)</p>
                    </div>
 
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1.5 font-sans">Precio Temporada Alta (€)</label>
                      <input
                        type="number"
                        required
                        value={highSeasonRate}
                        onChange={(e) => setHighSeasonRate(Number(e.target.value))}
                        className="w-full bg-[#F9F7F2] border border-[#E5E1D8] rounded-none px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-stone-400"
                      />
                      <p className="text-[9px] text-stone-400 mt-1 uppercase tracking-wider font-sans">Temporada alta (Julio - Agosto)</p>
                    </div>
 
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1.5 font-sans">Gastos de Limpieza (€)</label>
                      <input
                        type="number"
                        required
                        value={cleaningFee}
                        onChange={(e) => setCleaningFee(Number(e.target.value))}
                        className="w-full bg-[#F9F7F2] border border-[#E5E1D8] rounded-none px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-stone-400"
                      />
                      <p className="text-[9px] text-stone-400 mt-1 uppercase tracking-wider font-sans">Pago único por estancia</p>
                    </div>
 
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1.5 font-sans">Capacidad Máxima (Personas)</label>
                      <input
                        type="number"
                        required
                        value={capacity}
                        onChange={(e) => setCapacity(Number(e.target.value))}
                        className="w-full bg-[#F9F7F2] border border-[#E5E1D8] rounded-none px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-stone-400"
                      />
                    </div>
                  </div>
 
                  <div className="bg-[#F9F7F2] p-4 border border-[#E5E1D8] rounded-none flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
                    <p className="text-xs text-stone-600 leading-relaxed font-sans font-light">
                      <strong>Nota sobre la temporada alta:</strong> El sistema aplica de forma inteligente la tarifa de temporada alta (<strong>€{highSeasonRate}/noche</strong>) a los días reservados correspondientes a los meses de Julio y Agosto de 2026 de forma automática en el formulario de cara al huésped.
                    </p>
                  </div>
 
                  <div className="flex justify-end pt-4 border-t border-[#E5E1D8]">
                    <button
                      type="submit"
                      className="bg-[#2D2D2D] hover:bg-stone-800 text-white text-xs font-sans uppercase tracking-widest py-3 px-6 rounded-none cursor-pointer transition-colors"
                    >
                      Guardar Tarifas
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 5: PRESERVATION FUND & REFORMS LOG */}
            {activeTab === 'preservation' && (
              <div className="bg-white border border-[#E5E1D8] p-8 rounded-none space-y-6 text-left">
                <div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">Fondo de Conservación & Mantenimiento</h3>
                  <p className="text-stone-600 text-xs leading-relaxed max-w-3xl font-light">
                    Área familiar para planificar las mejoras físicas de Casa Tarongers. Los ingresos obtenidos de las reservas de invitados (recaudados a través del fondo de mantenimiento) se asignan íntegramente a estas reformas estructurales, de jardinería y sostenibilidad.
                  </p>
                </div>

                <div className="h-[1px] bg-stone-200" />

                <div className="space-y-4">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-stone-850 font-sans">
                    Planificación y Estado de Reformas
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Reform 1 */}
                    <div className="p-4 border border-stone-200 bg-[#F9F7F2] flex justify-between items-center">
                      <div>
                        <p className="text-sm font-semibold text-stone-800">Restauración de Contraventanas</p>
                        <p className="text-[10px] text-stone-400 mt-0.5 font-light">Madera original de 1967 restaurada a mano y barnizada.</p>
                      </div>
                      <span className="px-2.5 py-1 text-[9px] font-sans font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 rounded border border-emerald-100 shrink-0">
                        Completado
                      </span>
                    </div>

                    {/* Reform 2 */}
                    <div className="p-4 border border-stone-200 bg-[#F9F7F2] flex justify-between items-center">
                      <div>
                        <p className="text-sm font-semibold text-stone-800">Placas Solares (Energía Sostenible)</p>
                        <p className="text-[10px] text-stone-400 mt-0.5 font-light">Instalación solar fotovoltaica para autoconsumo familiar.</p>
                      </div>
                      <span className="px-2.5 py-1 text-[9px] font-sans font-bold uppercase tracking-wider bg-amber-50 text-amber-700 rounded border border-amber-100 animate-pulse shrink-0">
                        En Curso
                      </span>
                    </div>

                    {/* Reform 3 */}
                    <div className="p-4 border border-stone-200 bg-[#F9F7F2] flex justify-between items-center">
                      <div>
                        <p className="text-sm font-semibold text-stone-800">Pista de Tenis y Parque Infantil</p>
                        <p className="text-[10px] text-stone-400 mt-0.5 font-light">Repavimentación de resina y zona de juegos infantil.</p>
                      </div>
                      <span className="px-2.5 py-1 text-[9px] font-sans font-bold uppercase tracking-wider bg-stone-100 text-stone-500 rounded border border-stone-200 shrink-0">
                        Planificado
                      </span>
                    </div>

                    {/* Reform 4 */}
                    <div className="p-4 border border-stone-200 bg-[#F9F7F2] flex justify-between items-center">
                      <div>
                        <p className="text-sm font-semibold text-stone-800">Motor y Depuradora Ecológica</p>
                        <p className="text-[10px] text-stone-400 mt-0.5 font-light">Cambio de bomba por una de bajo consumo y filtrado salino.</p>
                      </div>
                      <span className="px-2.5 py-1 text-[9px] font-sans font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 rounded border border-emerald-100 shrink-0">
                        Completado
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#E5E1D8] flex items-center justify-between text-xs text-stone-500 font-sans">
                  <span>Balance Acumulado para Reformas: <strong>€{totalRevenue.toLocaleString()}</strong></span>
                  <span>Presupuesto Estimado Pendiente: <strong>€4,500</strong></span>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
 
      </div>
    </section>
  );
}
