import React, { useState } from 'react';
import { IMAGES, ALL_GALLERY_IMAGES } from '../data';
import { GalleryImage } from '../types';
import { 
  Bed, Bath, ChefHat, Car, Waves, Tv, Wifi, Music, Activity, Trees, 
  MapPin, Phone, Mail, Clock, ShieldCheck, ChevronLeft, ChevronRight, X, Compass, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, TRANSLATIONS } from '../translations';
import { RECOMMENDATIONS, Recommendation } from '../recommendationsData';

interface AboutProps {
  language: Language;
}

export default function About({ language }: AboutProps) {
  const t = TRANSLATIONS[language];
  const [activeCategory, setActiveCategory] = useState<'all' | 'panoramic' | 'interiors' | 'exteriors'>('all');
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [mapType, setMapType] = useState<'satellite' | 'live'>('satellite');

  // Filter gallery images
  const filteredImages = ALL_GALLERY_IMAGES.filter(img => 
    activeCategory === 'all' ? true : img.category === activeCategory
  );

  // Set limits for collapsed states
  const initialLimit = activeCategory === 'all' ? 12 : 8;
  const displayLimit = showAllPhotos ? filteredImages.length : initialLimit;
  const displayedImages = filteredImages.slice(0, displayLimit);

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activePhotoIndex === null) return;
    const currentItem = ALL_GALLERY_IMAGES[activePhotoIndex];
    const filteredIndex = filteredImages.findIndex(item => item.src === currentItem.src);
    if (filteredIndex !== -1) {
      const prevFilteredIndex = filteredIndex === 0 ? filteredImages.length - 1 : filteredIndex - 1;
      const prevItem = filteredImages[prevFilteredIndex];
      setActivePhotoIndex(ALL_GALLERY_IMAGES.findIndex(item => item.src === prevItem.src));
    }
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activePhotoIndex === null) return;
    const currentItem = ALL_GALLERY_IMAGES[activePhotoIndex];
    const filteredIndex = filteredImages.findIndex(item => item.src === currentItem.src);
    if (filteredIndex !== -1) {
      const nextFilteredIndex = filteredIndex === filteredImages.length - 1 ? 0 : filteredIndex + 1;
      const nextItem = filteredImages[nextFilteredIndex];
      setActivePhotoIndex(ALL_GALLERY_IMAGES.findIndex(item => item.src === nextItem.src));
    }
  };

  // Keyboard navigation for lightbox
  React.useEffect(() => {
    if (activePhotoIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevPhoto();
      if (e.key === 'ArrowRight') handleNextPhoto();
      if (e.key === 'Escape') setActivePhotoIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIndex]);

  return (
    <div className="bg-white">
      
      {/* SECTION 1: ABOUT THE PROPERTY */}
      <section id="sobre-casa" className="py-20 border-b border-stone-200 scroll-mt-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="space-y-6 text-left">
            
            {/* Title & Subtitle exactly matching the screenshot style */}
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight">
              {t.aboutTitle}
            </h2>
            
            <p className="text-sm font-sans text-stone-500 tracking-wide">
              {t.locContactVal} • {t.entireHome}
            </p>

            {/* Description Paragraph 1 */}
            <p className="text-stone-700 leading-relaxed text-sm md:text-base font-sans">
              {t.descParagraph1}
            </p>

            {/* Description Paragraph 2 */}
            <p className="text-stone-600 leading-relaxed text-sm font-sans pt-2">
              {t.descParagraph2}
            </p>

            {/* What offers this house - Styled exactly like the screenshot with Lucide icons */}
            <div id="servicios" className="pt-8 border-t border-stone-100 scroll-mt-24">
              <h3 className="text-xl font-serif font-bold text-stone-900 mb-6">
                {t.whatOffers}
              </h3>
              
              <div className="flex flex-wrap gap-2.5">
                {[
                  { label: t.pillBedrooms, icon: Bed },
                  { label: t.pillShowers, icon: Bath },
                  { label: t.pillKitchen, icon: ChefHat },
                  { label: t.pillParking, icon: Car },
                  { label: t.pillPool, icon: Waves },
                  { label: t.pillTV, icon: Tv },
                  { label: t.pillWiFi, icon: Wifi },
                  { label: t.pillAudio, icon: Music },
                  { label: t.pillTennis, icon: Activity },
                  { label: t.pillGarden, icon: Trees }
                ].map((item, pIdx) => {
                  const Icon = item.icon;
                  return (
                    <span 
                      key={pIdx}
                      className="inline-flex items-center gap-2 text-xs font-sans text-stone-700 bg-stone-100 hover:bg-stone-200/60 border border-stone-200/30 px-4 py-2.5 transition-colors rounded-full font-medium"
                    >
                      <Icon className="w-4 h-4 text-accent-terracotta shrink-0" />
                      <span>{item.label}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Side-by-side Airbnb-style specs table matching the screenshot exactly */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-0 pt-12">
              {/* Left Column */}
              <div className="divide-y divide-stone-100">
                <div className="flex justify-between items-center py-4 border-t border-stone-100">
                  <span className="text-stone-850 font-semibold text-sm font-sans">{t.specPropType}</span>
                  <span className="text-stone-500 text-sm font-sans">{t.specPropVal}</span>
                </div>
                <div className="flex justify-between items-center py-4">
                  <span className="text-stone-850 font-semibold text-sm font-sans">{t.specYearBuilt}</span>
                  <span className="text-stone-500 text-sm font-sans">{t.specYearVal}</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-stone-100">
                  <span className="text-stone-850 font-semibold text-sm font-sans">{t.specRoomsBaths}</span>
                  <span className="text-stone-500 text-sm font-sans">{t.specRoomsVal}</span>
                </div>
              </div>

              {/* Right Column */}
              <div className="divide-y divide-stone-100">
                <div className="flex justify-between items-center py-4 border-t border-stone-100 md:border-t">
                  <span className="text-stone-850 font-semibold text-sm font-sans">{t.specExactLoc}</span>
                  <span className="text-stone-500 text-sm font-sans">{t.specLocVal}</span>
                </div>
                <div className="flex justify-between items-center py-4">
                  <span className="text-stone-850 font-semibold text-sm font-sans">{t.specMinStay}</span>
                  <span className="text-stone-500 text-sm font-sans">{t.specMinStayVal}</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-stone-100">
                  <span className="text-stone-850 font-semibold text-sm font-sans">{t.specPoolType}</span>
                  <span className="text-stone-500 text-sm font-sans">{t.specPoolVal}</span>
                </div>
              </div>
            </div>

            {/* Distinguishing bullet guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-12">
              <div className="flex items-start gap-3.5 p-5 bg-stone-50 border border-stone-200/50 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-accent-terracotta shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-stone-800">{t.guarPrivacyTitle}</h4>
                  <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">{t.guarPrivacyDesc}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-5 bg-stone-50 border border-stone-200/50 rounded-xl">
                <Clock className="w-5 h-5 text-accent-terracotta shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-stone-800">{t.guarFlexTitle}</h4>
                  <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">{t.guarFlexDesc}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: IMAGE GALLERY WITH LIGHTBOX (Screenshot Row Layout) */}
      <section id="galeria" className="py-20 border-b border-stone-200 bg-stone-50/50 scroll-mt-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
            <div>
              <span className="text-stone-500 text-xs uppercase tracking-[0.25em] font-sans block">{t.gallerySub}</span>
              <h2 className="text-3xl font-serif font-bold mt-2 text-stone-900">{t.galleryTitle}</h2>
            </div>
            <p className="text-stone-500 max-w-sm text-xs font-light leading-relaxed">
              {t.galleryInstructions}
            </p>
          </div>

          {/* Interactive Category Filters */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-stone-200/65 pb-5">
            {(['all', 'panoramic', 'interiors', 'exteriors'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setShowAllPhotos(false);
                }}
                className={`px-4 py-2 text-[10px] font-sans tracking-wider uppercase rounded-full cursor-pointer transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-stone-850 text-white font-bold shadow-xs'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/50'
                }`}
              >
                {cat === 'all' ? t.filterAll :
                 cat === 'panoramic' ? t.filterPanoramic :
                 cat === 'interiors' ? t.filterInteriors :
                 t.filterExteriors}
              </button>
            ))}
          </div>

          {/* Images Grid */}
          <div className={`grid gap-4 transition-all duration-300 ${
            activeCategory === 'panoramic'
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
          }`}>
            {displayedImages.map((img) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                key={img.src}
                onClick={() => setActivePhotoIndex(ALL_GALLERY_IMAGES.findIndex(item => item.src === img.src))}
                className={`overflow-hidden cursor-pointer group border border-stone-200 rounded-lg relative shadow-xs hover:shadow-md transition-shadow duration-300 ${
                  activeCategory === 'panoramic' ? 'aspect-[3/1] md:aspect-[2.4/1]' : 'aspect-square md:aspect-[4/3]'
                }`}
              >
                <img
                  src={img.src}
                  alt={img.alt[language]}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-stone-950/15 group-hover:bg-transparent transition-colors duration-300" />
                <div className="absolute bottom-2 left-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <p className="text-[9px] uppercase tracking-wider font-sans bg-stone-950/80 backdrop-blur-xs py-1 px-2 rounded truncate inline-block">
                    {img.alt[language]}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Show More / Show Less Toggle Button */}
          {filteredImages.length > initialLimit && (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={() => setShowAllPhotos(!showAllPhotos)}
                className="px-6 py-3 border border-stone-300 text-[10px] font-sans font-semibold uppercase tracking-widest text-stone-700 hover:text-stone-900 hover:border-stone-500 rounded-lg transition-colors cursor-pointer"
              >
                {showAllPhotos ? t.showLess : t.showMore}
              </button>
            </div>
          )}
        </div>

        {/* Lightbox Modal with dynamic details */}
        <AnimatePresence>
          {activePhotoIndex !== null && (() => {
            const currentItem = ALL_GALLERY_IMAGES[activePhotoIndex];
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-stone-950/95 z-50 flex flex-col items-center justify-center p-4 md:p-10 select-none"
                onClick={() => setActivePhotoIndex(null)}
              >
                {/* Close Button */}
                <button 
                  type="button" 
                  className="absolute top-6 right-6 p-2.5 text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer z-55"
                  onClick={() => setActivePhotoIndex(null)}
                  title={language === 'ca' ? 'Tancar' : language === 'en' ? 'Close' : 'Cerrar'}
                >
                  <X className="w-5 h-5" />
                </button>
                
                {/* Prev Button */}
                <button
                  type="button"
                  onClick={handlePrevPhoto}
                  className="absolute left-4 p-3 text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer z-55"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={handleNextPhoto}
                  className="absolute right-4 p-3 text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer z-55"
                  aria-label="Next"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                <div className="relative max-w-5xl max-h-[75vh] flex items-center justify-center">
                  <motion.img
                    key={currentItem.src}
                    initial={{ scale: 0.96, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.96, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    src={currentItem.src}
                    alt={currentItem.alt[language] || "Fullscreen View"}
                    className="max-w-full max-h-[72vh] object-contain shadow-2xl rounded-lg border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="mt-6 text-center text-white max-w-2xl px-6 pointer-events-none">
                  <span className="text-[10px] font-sans uppercase tracking-[0.2em] bg-white/10 backdrop-blur-md py-1.5 px-4 rounded-full border border-white/10 font-semibold inline-block">
                    {currentItem.alt[language]}
                  </span>
                  {currentItem.desc && (
                    <p className="text-xs font-sans mt-3 text-stone-300 font-light leading-relaxed">
                      {currentItem.desc[language]}
                    </p>
                  )}
                  <p className="text-[10px] font-mono text-stone-500 mt-2">
                    {activePhotoIndex + 1} / {ALL_GALLERY_IMAGES.length}
                  </p>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </section>

      {/* SECTION 4: LOCATION MAP & driving guide */}
      <section id="ubicacion" className="py-20 bg-white scroll-mt-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual map block */}
            <div className="lg:col-span-7">
              <div className="relative h-80 md:h-[400px] overflow-hidden border border-stone-200 rounded-xl shadow-sm">
                
                {/* Map Type Switcher */}
                <div className="absolute top-4 left-4 z-20 bg-stone-900/90 backdrop-blur-md p-1 border border-white/10 rounded-lg flex gap-1 text-[10px] font-sans font-semibold uppercase tracking-wider text-stone-400">
                  <button
                    type="button"
                    onClick={() => setMapType('satellite')}
                    className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${mapType === 'satellite' ? 'bg-accent-terracotta text-white' : 'hover:text-white'}`}
                  >
                    {language === 'ca' ? 'Satel·lit' : language === 'en' ? 'Satellite' : 'Satelital'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapType('live')}
                    className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${mapType === 'live' ? 'bg-accent-terracotta text-white' : 'hover:text-white'}`}
                  >
                    {language === 'ca' ? 'Interactiu' : language === 'en' ? 'Interactive' : 'Interactivo'}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {mapType === 'satellite' ? (
                    <motion.div 
                      key="satellite-map"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-stone-900 overflow-hidden"
                    >
                      <img 
                        src={IMAGES.garden} 
                        alt="Satellite view area"
                        className="absolute inset-0 w-full h-full object-cover scale-150 filter saturate-[1.4] brightness-[0.65] contrast-[1.15] hue-rotate-15"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Subtle Grid Overlay */}
                      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]" />
                      
                      {/* Terracotta pulsing circle indicating property outline */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[120px] h-[120px] border border-white/20 rounded-full flex items-center justify-center animate-pulse">
                          <div className="w-[70px] h-[70px] border-2 border-accent-terracotta bg-accent-terracotta/20 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-accent-terracotta rounded-full shadow-[0_0_12px_rgba(205,91,58,0.8)]" />
                          </div>
                        </div>
                      </div>

                      {/* Compass HUD decoration */}
                      <div className="absolute top-4 right-4 bg-stone-900/80 backdrop-blur-md p-2.5 border border-white/10 text-white font-mono text-[9px] uppercase tracking-widest hidden sm:block">
                        GPS TRACK: 41°26'15"N 1°52'08"E
                      </div>
                      
                      {/* Elegant Map Marker Info Pop */}
                      <div className="absolute bottom-6 left-6 right-6 sm:right-auto z-10 bg-stone-900/90 backdrop-blur-md p-4 border border-white/10 text-white shadow-lg text-xs max-w-xs font-sans space-y-1 rounded-lg">
                        <div className="font-serif italic font-semibold text-sm text-accent-terracotta">Casa Tarongers</div>
                        <div className="font-mono text-[9px] text-stone-400">Lat: 41.437457° N • Lon: 1.868791° E</div>
                        <div className="text-[10px] text-stone-300 leading-relaxed pt-1 border-t border-white/10 mt-1">
                          {language === 'ca' 
                            ? 'Ubicació excepcional a Gelida, Catalunya. Privadesa total a només 30 minuts de Barcelona.' 
                            : language === 'en' 
                              ? 'Exceptional location in Gelida, Catalunya. Total privacy just 30 minutes from Barcelona.' 
                              : 'Ubicación excepcional en Gelida, Catalunya. Privacidad total a solo 30 min de Barcelona.'}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="live-map"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 w-full h-full"
                    >
                      <iframe
                        src="https://maps.google.com/maps?q=41.437457,1.868791&z=16&output=embed"
                        className="w-full h-full border-0 filter saturate-[95%] contrast-[105%]"
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>

            {/* Address & Travel Info */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <span className="text-stone-500 text-xs uppercase tracking-[0.25em] font-sans block">{t.locSub}</span>
              <h2 className="text-3xl font-serif font-bold text-stone-900 leading-tight">{t.locTitle}</h2>
              <p className="text-stone-600 text-sm leading-relaxed font-light">
                {t.locDesc}
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-center text-stone-700 shrink-0">
                    <MapPin className="w-5 h-5 text-accent-terracotta" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-bold text-stone-800">{t.locContactTitle}</h4>
                    <p className="text-xs text-stone-500 mt-0.5">{t.locContactVal}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-center text-stone-700 shrink-0">
                    <Phone className="w-5 h-5 text-accent-terracotta" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-bold text-stone-800">{t.locPhoneTitle}</h4>
                    <p className="text-xs text-stone-500 mt-0.5 font-mono">{t.locPhoneVal}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-center text-stone-700 shrink-0">
                    <Mail className="w-5 h-5 text-accent-terracotta" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-bold text-stone-800">{t.locEmailTitle}</h4>
                    <p className="text-xs text-stone-500 mt-0.5 font-mono">acivit@coac.net</p>
                  </div>
                </div>
              </div>

              {/* Exact Location Link Trigger */}
              <div className="pt-2">
                <a 
                  href="https://www.google.com/maps/search/41.437457,+1.868791?entry=tts&g_ep=EgoyMDI2MDcxMy4wIPu8ASoASAFQAw%3D%3D&skid=cc351738-ffb4-42d0-8daa-936cdeb6eb8e"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-[10px] font-sans font-bold uppercase tracking-widest text-accent-terracotta hover:text-accent-terracotta-hover border border-accent-terracotta/40 hover:border-accent-terracotta py-3 px-4.5 bg-white transition-all shadow-sm hover:shadow rounded-lg cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-accent-terracotta shrink-0 animate-spin-slow" />
                  <span>
                    {language === 'ca' ? 'Obrir Ubicació Exacta' : language === 'en' ? 'Open Exact Location' : 'Abrir Ubicación Exacta'}
                  </span>
                </a>
              </div>

              {/* Tourism recommendations List */}
              <div className="pt-6 border-t border-stone-100 text-xs font-sans text-stone-500">
                <span className="block font-bold text-stone-800 uppercase tracking-wider mb-2">{t.locRecTitle}</span>
                <ul className="grid grid-cols-2 gap-2 text-[11px] uppercase tracking-wide">
                  <li 
                    onClick={() => setSelectedRecommendation(RECOMMENDATIONS.find(r => r.id === 'gelida-castle') || null)}
                    className="flex items-center gap-1 cursor-pointer hover:text-accent-terracotta transition-colors group"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-accent-terracotta shrink-0 group-hover:translate-x-0.5 transition-transform" /> 
                    <span className="underline decoration-dotted underline-offset-2 decoration-stone-300 group-hover:decoration-accent-terracotta">{t.locRec1}</span>
                  </li>
                  <li 
                    onClick={() => setSelectedRecommendation(RECOMMENDATIONS.find(r => r.id === 'cava-wineries') || null)}
                    className="flex items-center gap-1 cursor-pointer hover:text-accent-terracotta transition-colors group"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-accent-terracotta shrink-0 group-hover:translate-x-0.5 transition-transform" /> 
                    <span className="underline decoration-dotted underline-offset-2 decoration-stone-300 group-hover:decoration-accent-terracotta">{t.locRec2}</span>
                  </li>
                  <li 
                    onClick={() => setSelectedRecommendation(RECOMMENDATIONS.find(r => r.id === 'montserrat') || null)}
                    className="flex items-center gap-1 cursor-pointer hover:text-accent-terracotta transition-colors group"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-accent-terracotta shrink-0 group-hover:translate-x-0.5 transition-transform" /> 
                    <span className="underline decoration-dotted underline-offset-2 decoration-stone-300 group-hover:decoration-accent-terracotta">{t.locRec3}</span>
                  </li>
                  <li 
                    onClick={() => setSelectedRecommendation(RECOMMENDATIONS.find(r => r.id === 'sitges') || null)}
                    className="flex items-center gap-1 cursor-pointer hover:text-accent-terracotta transition-colors group"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-accent-terracotta shrink-0 group-hover:translate-x-0.5 transition-transform" /> 
                    <span className="underline decoration-dotted underline-offset-2 decoration-stone-300 group-hover:decoration-accent-terracotta">{t.locRec4}</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>

          {/* Visual Grid of Recommended Visits (Designated page triggers) */}
          <div className="mt-20 pt-16 border-t border-stone-200/60">
            <div className="text-left mb-10">
              <span className="text-stone-500 text-xs uppercase tracking-[0.25em] font-sans block">
                {language === 'ca' ? 'Guia Local de la Família' : language === 'en' ? 'Family Local Guide' : 'Guía Local de la Familia'}
              </span>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mt-2">
                {language === 'ca' ? 'Visites i Activitats Recomanades' : language === 'en' ? 'Recommended Visits & Activities' : 'Visitas y Actividades Recomendadas'}
              </h3>
              <p className="text-stone-500 text-xs font-light mt-1.5 max-w-xl leading-relaxed font-sans">
                {language === 'ca' 
                  ? 'Descobriu els tresors culturals, gastronòmics i naturals que envolten Casa Tarongers per fer de la vostra estada una experiència inoblidable.' 
                  : language === 'en' 
                    ? 'Discover the cultural, gastronomic, and natural treasures surrounding Casa Tarongers to make your stay an unforgettable experience.' 
                    : 'Descubrid los tesoros culturales, gastronómicos y naturales que rodean Casa Tarongers para hacer de vuestra estancia una experiencia inolvidable.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {RECOMMENDATIONS.map((rec) => (
                <div 
                  key={rec.id}
                  onClick={() => setSelectedRecommendation(rec)}
                  className="group bg-stone-50 border border-stone-200/70 overflow-hidden cursor-pointer flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-stone-300 rounded-xl"
                >
                  <div className="relative h-44 overflow-hidden bg-stone-100">
                    <img 
                      src={rec.image} 
                      alt={rec.title[language]} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[9px] font-sans uppercase tracking-wider bg-stone-950/80 backdrop-blur-md text-white py-1 px-2.5 font-semibold rounded-md border border-white/10">
                        {rec.category[language]}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 flex-grow text-left flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-stone-900 text-base group-hover:text-accent-terracotta transition-colors duration-200">
                        {rec.title[language]}
                      </h4>
                      <p className="text-[10px] text-stone-400 font-mono mt-1 tracking-wide uppercase">
                        📍 {rec.distance[language]}
                      </p>
                      <p className="text-xs text-stone-500 font-sans mt-3 line-clamp-3 leading-relaxed font-light">
                        {rec.description[language]}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-stone-200/50 flex items-center justify-between text-[10px] font-sans font-bold tracking-widest text-accent-terracotta uppercase">
                      <span>{language === 'ca' ? 'Saber més' : language === 'en' ? 'Learn more' : 'Saber más'}</span>
                      <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Recommendation Detail Modal (Designated Clean & Minimalist Details Page) */}
        <AnimatePresence>
          {selectedRecommendation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-950/50 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6"
              onClick={() => setSelectedRecommendation(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="bg-white border border-stone-200 w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative rounded-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedRecommendation(null)}
                  className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white backdrop-blur-sm border border-stone-200 text-stone-700 hover:text-stone-900 shadow-sm transition-all rounded-full cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Left Side: Image Banner */}
                <div className="md:w-5/12 h-48 md:h-auto relative bg-stone-100 shrink-0">
                  <img
                    src={selectedRecommendation.image}
                    alt={selectedRecommendation.title[language]}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:hidden from-stone-950/80 to-transparent" />
                  
                  <div className="absolute bottom-4 left-4 md:hidden text-white text-left">
                    <span className="text-[9px] font-sans uppercase tracking-wider bg-accent-terracotta px-2 py-1 rounded-md font-semibold">
                      {selectedRecommendation.category[language]}
                    </span>
                    <h3 className="text-xl font-serif font-bold mt-1.5">{selectedRecommendation.title[language]}</h3>
                  </div>
                </div>

                {/* Right Side: Information Details */}
                <div className="md:w-7/12 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[80vh] md:max-h-[580px] text-left">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="hidden md:block">
                      <span className="text-[10px] font-sans uppercase tracking-[0.15em] text-accent-terracotta font-bold">
                        {selectedRecommendation.category[language]}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mt-1">
                        {selectedRecommendation.title[language]}
                      </h3>
                      <p className="text-xs text-stone-400 italic font-sans mt-1">
                        {selectedRecommendation.subtitle[language]}
                      </p>
                    </div>

                    {/* Quick Specs */}
                    <div className="grid grid-cols-3 gap-2 py-3.5 border-y border-stone-100 font-sans text-[10px]">
                      <div className="space-y-0.5">
                        <span className="text-stone-400 block uppercase tracking-wider text-[8px] font-bold">
                          {language === 'ca' ? 'Distància' : language === 'en' ? 'Distance' : 'Distancia'}
                        </span>
                        <span className="font-semibold text-stone-800 leading-tight block">{selectedRecommendation.distance[language]}</span>
                      </div>
                      <div className="space-y-0.5 border-l border-stone-100 pl-3">
                        <span className="text-stone-400 block uppercase tracking-wider text-[8px] font-bold">
                          {language === 'ca' ? 'Durada' : language === 'en' ? 'Duration' : 'Duración'}
                        </span>
                        <span className="font-semibold text-stone-800 leading-tight block">{selectedRecommendation.duration[language]}</span>
                      </div>
                      <div className="space-y-0.5 border-l border-stone-100 pl-3">
                        <span className="text-stone-400 block uppercase tracking-wider text-[8px] font-bold">
                          {language === 'ca' ? 'Millor Hora' : language === 'en' ? 'Best Time' : 'Mejor Hora'}
                        </span>
                        <span className="font-semibold text-stone-800 leading-tight block">{selectedRecommendation.bestTime[language]}</span>
                      </div>
                    </div>

                    {/* Detailed description */}
                    <div className="space-y-3 font-sans text-stone-600 text-xs md:text-sm leading-relaxed font-light">
                      <p>{selectedRecommendation.description[language]}</p>
                      <p className="text-stone-400 text-xs">{selectedRecommendation.extraInfo[language]}</p>
                    </div>

                    {/* Family Tips */}
                    <div className="bg-stone-50 border border-stone-200/50 p-4 rounded-xl space-y-2.5">
                      <div className="flex items-center gap-1.5 text-stone-800 font-bold uppercase tracking-wider text-[9px] font-sans">
                        <Info className="w-3.5 h-3.5 text-accent-terracotta shrink-0" />
                        <span>
                          {language === 'ca' ? 'Consells de la Família' : language === 'en' ? 'Family Guest Tips' : 'Consejos de la Familia'}
                        </span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-stone-600 font-sans">
                        {selectedRecommendation.tips[language].map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 leading-relaxed">
                            <span className="text-accent-terracotta font-semibold mt-0.5 shrink-0">•</span>
                            <span className="font-light">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Footer Back/Close */}
                  <div className="pt-6 mt-6 border-t border-stone-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedRecommendation(null)}
                      className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-[10px] font-sans uppercase tracking-widest transition-colors rounded-lg cursor-pointer"
                    >
                      {language === 'ca' ? 'Tancar Detall' : language === 'en' ? 'Close Details' : 'Cerrar Detalle'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

    </div>
  );
}
