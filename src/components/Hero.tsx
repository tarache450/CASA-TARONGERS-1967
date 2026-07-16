import React from 'react';
import { Calendar, Users, MapPin, Search } from 'lucide-react';
import { IMAGES } from '../data';
import { Language, TRANSLATIONS } from '../translations';

interface HeroProps {
  onSearchClick: () => void;
  language: Language;
}

export default function Hero({ onSearchClick, language }: HeroProps) {
  const t = TRANSLATIONS[language];

  return (
    <div className="relative h-[80vh] min-h-[550px] w-full flex items-center justify-center overflow-hidden">
      {/* Immersive background image with slight darken overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={IMAGES.hero}
          alt="Casa Tarongers 1967 Hero View"
          className="w-full h-full object-cover object-center scale-105 animate-subtle-zoom"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-stone-900/40 backdrop-brightness-[0.85]" />
      </div>

      {/* Floating details and headline */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white mt-12">
        <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-4 py-1.5 border border-white/20 mb-6 animate-fade-in rounded-none">
          <MapPin className="w-3.5 h-3.5 text-accent-terracotta" />
          <span className="text-xs font-sans tracking-[0.2em] font-semibold uppercase">{t.locContactVal} • {t.entireHome}</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-light tracking-wide mb-6 leading-none animate-slide-up">
          {t.aboutTitle}
        </h1>
        
        <p className="text-stone-200 text-xs md:text-sm max-w-xl mx-auto leading-relaxed font-sans mb-14 font-light animate-fade-in delay-200 uppercase tracking-[0.25em] opacity-90">
          {t.heroSub}
        </p>

        {/* Search Widget - Anchored over the hero bottom (Minimalist Sand & Border design matching screenshot) */}
        <div className="max-w-4xl mx-auto w-full bg-[#FAFAF5] text-stone-800 p-4 md:p-6 border border-[#E5E1D8] grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-[#E5E1D8] text-left animate-slide-up delay-300 shadow-lg">
          
          {/* Col 1: Availability check */}
          <div className="pb-3 md:pb-0 md:pr-6 flex flex-col justify-center cursor-pointer hover:bg-white/50 p-2 transition-colors" onClick={onSearchClick}>
            <span className="text-[9px] font-sans text-stone-400 uppercase tracking-[0.2em] font-semibold">{language === 'ca' ? 'Disponibilitat' : language === 'en' ? 'Availability' : 'Disponibilidad'}</span>
            <span className="text-sm font-medium text-[#2D2D2D] mt-1.5 flex items-center gap-1.5 font-sans text-stone-500">
              {t.checkAvailability}
            </span>
          </div>

          {/* Col 2: Check-In */}
          <div className="py-3 md:py-0 md:px-6 flex flex-col justify-center cursor-pointer hover:bg-white/50 p-2 transition-colors" onClick={onSearchClick}>
            <span className="text-[9px] font-sans text-stone-400 uppercase tracking-[0.2em] font-semibold">{t.calCheckIn}</span>
            <span className="text-sm font-medium text-stone-500 mt-1.5 flex items-center gap-1.5 font-sans">
              {language === 'ca' ? 'Afegir dates' : language === 'en' ? 'Add dates' : 'Añadir fechas'}
            </span>
          </div>

          {/* Col 3: Check-Out */}
          <div className="py-3 md:py-0 md:px-6 flex flex-col justify-center cursor-pointer hover:bg-white/50 p-2 transition-colors" onClick={onSearchClick}>
            <span className="text-[9px] font-sans text-stone-400 uppercase tracking-[0.2em] font-semibold">{t.calCheckOut}</span>
            <span className="text-sm font-medium text-stone-500 mt-1.5 flex items-center gap-1.5 font-sans">
              {language === 'ca' ? 'Afegir dates' : language === 'en' ? 'Add dates' : 'Añadir fechas'}
            </span>
          </div>

          {/* Col 4: Guests & Button */}
          <div className="pt-3 md:pt-0 md:pl-6 flex items-center justify-between gap-4">
            <div className="flex flex-col justify-center cursor-pointer hover:bg-white/50 p-2 transition-colors w-full" onClick={onSearchClick}>
              <span className="text-[9px] font-sans text-stone-400 uppercase tracking-[0.2em] font-semibold">{t.calNumGuests}</span>
              <span className="text-sm font-medium text-stone-500 mt-1.5 flex items-center gap-1.5 font-sans">
                {language === 'ca' ? 'Afegir hostes' : language === 'en' ? 'Add guests' : 'Añadir huéspedes'}
              </span>
            </div>
            
            <button
              onClick={onSearchClick}
              className="bg-accent-terracotta hover:bg-accent-terracotta-hover text-white p-4.5 shadow-sm transition-all hover:scale-105 shrink-0 cursor-pointer rounded-none"
              title="Buscar Disponibilidad"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
