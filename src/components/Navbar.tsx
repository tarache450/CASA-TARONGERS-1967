import React from 'react';
import { Home, Lock, CalendarDays } from 'lucide-react';
import { Language, TRANSLATIONS } from '../translations';

interface NavbarProps {
  currentTab: 'guest' | 'dashboard';
  onChangeTab: (tab: 'guest' | 'dashboard') => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function Navbar({ currentTab, onChangeTab, language, onLanguageChange }: NavbarProps) {
  const t = TRANSLATIONS[language];

  const scrollToId = (id: string) => {
    if (currentTab !== 'guest') {
      onChangeTab('guest');
      // Delay slightly to allow component to render before scrolling
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-stone-50/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Elegant Minimalist Logo */}
        <button 
          onClick={() => {
            onChangeTab('guest');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 group cursor-pointer text-left focus:outline-none"
        >
          <span className="text-base md:text-lg tracking-[0.2em] font-light uppercase text-stone-900">
            Casa Tarongers <span className="font-semibold">1967</span>
          </span>
        </button>

        {/* Navigation Items */}
        <nav className="hidden lg:flex items-center gap-8 text-[11px] tracking-widest uppercase text-stone-800/70">
          <button 
            onClick={() => scrollToId('sobre-casa')} 
            className="hover:text-stone-900 transition-colors cursor-pointer font-sans"
          >
            {t.aboutHouse}
          </button>
          <button 
            onClick={() => scrollToId('servicios')} 
            className="hover:text-stone-900 transition-colors cursor-pointer font-sans"
          >
            {t.services}
          </button>
          <button 
            onClick={() => scrollToId('galeria')} 
            className="hover:text-stone-900 transition-colors cursor-pointer font-sans"
          >
            {t.gallery}
          </button>
          <button 
            onClick={() => scrollToId('ubicacion')} 
            className="hover:text-stone-900 transition-colors cursor-pointer font-sans"
          >
            {t.location}
          </button>
          
          <span className="h-4 w-[1px] bg-stone-300" />
          
          {/* Owner Portal Link */}
          <button 
            onClick={() => {
              onChangeTab(currentTab === 'dashboard' ? 'guest' : 'dashboard');
              setTimeout(() => {
                const el = document.getElementById('gestion-familiar');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className={`flex items-center gap-1.5 hover:text-stone-900 transition-colors font-sans tracking-widest uppercase cursor-pointer ${currentTab === 'dashboard' ? 'text-stone-900 font-bold' : 'text-stone-500'}`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{currentTab === 'dashboard' ? t.web : t.familyDashboard}</span>
          </button>
        </nav>

        {/* CTA Button and Language Selector */}
        <div className="flex items-center gap-4">
          {/* Elegant Language Selector */}
          <div className="flex items-center gap-2 border border-stone-200 bg-stone-100/40 rounded-full px-2.5 py-1 text-[10px] font-semibold font-sans tracking-wider">
            {(['es', 'ca', 'en'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`px-1.5 py-0.5 rounded transition-all duration-150 cursor-pointer uppercase ${
                  language === lang 
                    ? 'bg-white text-accent-terracotta shadow-[0_1px_3px_rgba(0,0,0,0.06)] font-bold' 
                    : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <button
            onClick={() => scrollToId('reservas')}
            className="text-[10px] md:text-xs tracking-widest uppercase bg-accent-terracotta hover:bg-accent-terracotta-hover text-white px-4 md:px-6 py-2.5 md:py-3 rounded-[4px] shadow-sm font-sans font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            {t.bookNow}
          </button>
        </div>
      </div>
    </header>
  );
}
