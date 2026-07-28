import React, { useState } from 'react';
import { Home, Lock, CalendarDays, Menu, X, Info, Sparkles, Image as ImageIcon, MapPin } from 'lucide-react';
import { Language, TRANSLATIONS } from '../translations';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  currentTab: 'guest' | 'dashboard';
  onChangeTab: (tab: 'guest' | 'dashboard') => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function Navbar({ currentTab, onChangeTab, language, onLanguageChange }: NavbarProps) {
  const t = TRANSLATIONS[language];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToId = (id: string) => {
    setMobileMenuOpen(false);
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
            className="hidden sm:block text-[10px] md:text-xs tracking-widest uppercase bg-accent-terracotta hover:bg-accent-terracotta-hover text-white px-4 md:px-6 py-2.5 md:py-3 rounded-[4px] shadow-sm font-sans font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            {t.bookNow}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-stone-700 hover:text-stone-900 focus:outline-none transition-colors cursor-pointer"
            aria-label={t.menuOpen}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-4/5 max-w-sm bg-stone-50 shadow-2xl p-6 flex flex-col justify-between border-l border-stone-200 lg:hidden"
            >
              <div className="space-y-8">
                {/* Header inside drawer */}
                <div className="flex justify-between items-center pb-6 border-b border-stone-200">
                  <span className="text-sm tracking-[0.2em] font-light uppercase text-stone-900">
                    Casa Tarongers <span className="font-semibold">1967</span>
                  </span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-stone-700 hover:text-stone-900 cursor-pointer"
                    aria-label={t.menuClose}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Nav Links */}
                <nav className="flex flex-col gap-3 text-xs tracking-widest uppercase">
                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      scrollToId('sobre-casa');
                    }}
                    className="flex items-center gap-3 py-3 px-3.5 hover:text-accent-terracotta hover:bg-stone-200/30 border-l-2 border-transparent hover:border-accent-terracotta transition-all duration-200 font-sans tracking-widest uppercase cursor-pointer text-stone-700 font-medium rounded-r-md text-left"
                  >
                    <Info className="w-4 h-4 text-stone-400 shrink-0" />
                    <span>{t.aboutHouse}</span>
                  </button>
                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      scrollToId('servicios');
                    }}
                    className="flex items-center gap-3 py-3 px-3.5 hover:text-accent-terracotta hover:bg-stone-200/30 border-l-2 border-transparent hover:border-accent-terracotta transition-all duration-200 font-sans tracking-widest uppercase cursor-pointer text-stone-700 font-medium rounded-r-md text-left"
                  >
                    <Sparkles className="w-4 h-4 text-stone-400 shrink-0" />
                    <span>{t.services}</span>
                  </button>
                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      scrollToId('galeria');
                    }}
                    className="flex items-center gap-3 py-3 px-3.5 hover:text-accent-terracotta hover:bg-stone-200/30 border-l-2 border-transparent hover:border-accent-terracotta transition-all duration-200 font-sans tracking-widest uppercase cursor-pointer text-stone-700 font-medium rounded-r-md text-left"
                  >
                    <ImageIcon className="w-4 h-4 text-stone-400 shrink-0" />
                    <span>{t.gallery}</span>
                  </button>
                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      scrollToId('ubicacion');
                    }}
                    className="flex items-center gap-3 py-3 px-3.5 hover:text-accent-terracotta hover:bg-stone-200/30 border-l-2 border-transparent hover:border-accent-terracotta transition-all duration-200 font-sans tracking-widest uppercase cursor-pointer text-stone-700 font-medium rounded-r-md text-left"
                  >
                    <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
                    <span>{t.location}</span>
                  </button>
                  
                  <span className="h-[1px] bg-stone-200 my-1" />

                  {/* Owner Portal Link */}
                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onChangeTab(currentTab === 'dashboard' ? 'guest' : 'dashboard');
                      setTimeout(() => {
                        const el = document.getElementById('gestion-familiar');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className={`flex items-center gap-3 py-3 px-3.5 hover:text-accent-terracotta hover:bg-stone-200/30 border-l-2 border-transparent hover:border-accent-terracotta transition-all duration-200 font-sans tracking-widest uppercase cursor-pointer font-medium rounded-r-md text-left ${currentTab === 'dashboard' ? 'text-accent-terracotta border-accent-terracotta bg-stone-200/20 font-semibold' : 'text-stone-500'}`}
                  >
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>{currentTab === 'dashboard' ? t.web : t.familyDashboard}</span>
                  </button>
                </nav>
              </div>

              {/* Footer info in Drawer */}
              <div className="pt-6 border-t border-stone-200 space-y-4">
                {/* CTA Button in Drawer */}
                <button
                  onClick={() => scrollToId('reservas')}
                  className="w-full text-center text-xs tracking-widest uppercase bg-accent-terracotta hover:bg-accent-terracotta-hover text-white py-4 rounded-[4px] shadow-sm font-sans font-medium transition-colors cursor-pointer"
                >
                  {t.bookNow}
                </button>
                
                {/* Contact phone/email */}
                <div className="text-[10px] text-stone-400 font-sans tracking-wider text-center">
                  +34 629 30 85 70 • acivit@coac.net
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
