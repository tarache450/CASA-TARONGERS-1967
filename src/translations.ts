export type Language = 'es' | 'ca' | 'en';

export interface TranslationDict {
  // Navigation
  aboutHouse: string;
  services: string;
  gallery: string;
  location: string;
  familyDashboard: string;
  bookNow: string;
  web: string;

  // Hero
  heroWelcome: string;
  heroSub: string;
  checkAvailability: string;
  charmlabel: string;

  // About / Property Details
  aboutTitle: string;
  entireHome: string;
  capacityText: string;
  descParagraph1: string;
  descParagraph2: string;
  whatOffers: string;
  pillBedrooms: string;
  pillShowers: string;
  pillKitchen: string;
  pillParking: string;
  pillPool: string;
  pillTV: string;
  pillWiFi: string;
  pillAudio: string;
  pillTennis: string;
  pillGarden: string;

  // Specs Table
  specPropType: string;
  specPropVal: string;
  specYearBuilt: string;
  specYearVal: string;
  specRoomsBaths: string;
  specRoomsVal: string;
  specExactLoc: string;
  specLocVal: string;
  specMinStay: string;
  specMinStayVal: string;
  specPoolType: string;
  specPoolVal: string;

  // Guarantees
  guarPrivacyTitle: string;
  guarPrivacyDesc: string;
  guarFlexTitle: string;
  guarFlexDesc: string;

  // Gallery
  galleryTitle: string;
  gallerySub: string;
  galleryInstructions: string;
  galleryHeroDesc: string;
  galleryPoolDesc: string;
  galleryLivingDesc: string;
  galleryGardenDesc: string;

  // Location / Surroundings
  locTitle: string;
  locSub: string;
  locDesc: string;
  locContactTitle: string;
  locContactVal: string;
  locPhoneTitle: string;
  locPhoneVal: string;
  locEmailTitle: string;
  locRecTitle: string;
  locRec1: string;
  locRec2: string;
  locRec3: string;
  locRec4: string;

  // Booking Calendar
  calTitle: string;
  calSelectDates: string;
  calPriceCalc: string;
  calBookStay: string;
  calCheckIn: string;
  calCheckOut: string;
  calNumGuests: string;
  calPriceNight: string;
  calCleaning: string;
  calTotal: string;
  calFormTitle: string;
  calFullName: string;
  calEmail: string;
  calPhone: string;
  calNotes: string;
  calGateway: string;
  calCard: string;
  calBizum: string;
  calBank: string;
  calApplePay: string;
  calGooglePay: string;
  calOtherOptions: string;
  calPayBtn: string;
  calProcessing: string;
  calReadyApple: string;
  calDescApple: string;
  calReadyGoogle: string;
  calDescGoogle: string;
  calConfirmTransfer: string;
  calPaymentStatus: string;
  calBookingCompleted: string;
  calThanks: string;
  calBookingDetails: string;
  calPaymentMethod: string;
  calNights: string;
  calStatusPending: string;
  calSuccessMsg: string;

  // Footer
  footDesc: string;
  footInfo: string;
  footContact: string;
  footBackToTop: string;
  footFreeDates: string;
  footFamilyAccess: string;
  footRights: string;
  footPrivacy: string;
  footTerms: string;
  footMadeWith: string;
  // Gallery Filters & Mobile Nav
  filterAll: string;
  filterPanoramic: string;
  filterInteriors: string;
  filterExteriors: string;
  showMore: string;
  showLess: string;
  menuOpen: string;
  menuClose: string;

  // Cooperative & Renovations
  coopTitle: string;
  coopSub: string;
  coopDesc: string;
  coopRenovationsTitle: string;
  coopStatusCompleted: string;
  coopStatusOngoing: string;
  coopStatusPlanned: string;

  // Booking Stay Types
  stayTypeLabel: string;
  stayTypeGuest: string;
  stayTypeFamily: string;
  familyPinLabel: string;
  familyPinPlaceholder: string;
  familyPinSuccess: string;
  familyPinError: string;
  familyRegisterBtn: string;
}

export const TRANSLATIONS: Record<Language, TranslationDict> = {
  es: {
    aboutHouse: 'Sobre Casa',
    services: 'Servicios',
    gallery: 'Galería',
    location: 'Ubicación',
    familyDashboard: 'Panel Familiar',
    bookNow: 'RESERVA AHORA',
    web: 'Web Pública',

    heroWelcome: 'Bienvenidos a Casa Tarongers',
    heroSub: 'Un oasis de tranquilidad familiar en Gelida',
    checkAvailability: 'Ver disponibilidad',
    charmlabel: 'Estancia rural con encanto',

    aboutTitle: 'Casa Tarongers',
    entireHome: 'Casa Entera',
    capacityText: 'Capacidad 10 Personas',
    descParagraph1: 'Casa Tarongers es una encantadora villa rural de dos plantas en Gelida, Penedès, Cataluña. Presenta una cálida fachada de piedra y estuco con contraventanas de madera, balcones y una terraza cubierta enmarcada por palmeras. Se encuentra rodeada de un amplio y exuberante césped con árboles maduros y arbustos florales que aportan sombra y absoluta privacidad.',
    descParagraph2: 'La casa pertenece a una familia catalana que ha decidido abrir sus puertas para compartir este oasis de tranquilidad. Con detalles cuidados al milímetro, es el lugar idóneo tanto para desconectar bajo el sol mediterráneo como para organizar celebraciones familiares íntimas rodeados de viñedos y naturaleza.',
    whatOffers: 'Qué ofrece esta casa',
    pillBedrooms: 'Dormitorios',
    pillShowers: 'Baños / Duchas',
    pillKitchen: 'Cocina Equipada',
    pillParking: 'Aparcamiento',
    pillPool: 'Piscina Privada',
    pillTV: 'Smart TV',
    pillWiFi: 'Conexión WiFi',
    pillAudio: 'Audio Inteligente',
    pillTennis: 'Pista de Tenis',
    pillGarden: 'Jardín y Césped',

    specPropType: 'Tipo de propiedad',
    specPropVal: 'Villa Rural Familiar',
    specYearBuilt: 'Año de construcción',
    specYearVal: '1967',
    specRoomsBaths: 'Habitaciones/Baños',
    specRoomsVal: '5 Dorm. / 4 Baños',
    specExactLoc: 'Ubicación Exacta',
    specLocVal: 'Gelida, Penedès',
    specMinStay: 'Estancia mínima',
    specMinStayVal: '3 noches',
    specPoolType: 'Piscina',
    specPoolVal: 'Privada',

    guarPrivacyTitle: 'Privacidad Absoluta',
    guarPrivacyDesc: 'Toda la finca, piscina y jardines son exclusivamente para vosotros durante vuestra estancia.',
    guarFlexTitle: 'Check-in Flexible',
    guarFlexDesc: 'Coordinación directa con la familia para una acogida cálida, cómoda y personalizada.',

    galleryTitle: 'Un paseo por el paraíso',
    gallerySub: 'Fotografías Reales',
    galleryInstructions: 'Haz clic en cualquier imagen para abrir la visualización interactiva a pantalla completa y contemplar los rincones de nuestra villa familiar.',
    galleryHeroDesc: 'Fachada rústica de piedra y estuco',
    galleryPoolDesc: 'Rodeada de césped y palmeras mediterráneas',
    galleryLivingDesc: 'Hogar de leña acogedor y vigas de madera noble',
    galleryGardenDesc: 'Amplia explanada con vegetación exuberante',

    locTitle: 'En el corazón del Penedès',
    locSub: 'Ubicación y Entorno',
    locDesc: 'Gelida es un municipio encantador situado en la comarca del Alt Penedès, famoso por sus castillos medievales, sus paisajes repletos de viñedos y su proximidad a las bodegas de Cava más importantes del mundo.',
    locContactTitle: 'Dirección de Contacto',
    locContactVal: '08790 Gelida, Catalunya, España',
    locPhoneTitle: 'Teléfono Directo de Acogida',
    locPhoneVal: '+34 629 30 85 70 (Ángel / Familia)',
    locEmailTitle: 'Email Familiar',
    locRecTitle: 'Visitas recomendadas en la zona:',
    locRec1: 'Castillo de Gelida',
    locRec2: 'Bodegas de Cava Penedès',
    locRec3: 'Montserrat (25 min)',
    locRec4: 'Sitges y Playas (35 min)',

    calTitle: 'Reservas & Calendario',
    calSelectDates: 'Selecciona tus fechas en el calendario',
    calPriceCalc: 'Calculadora de precio instantánea',
    calBookStay: 'Reserva tu estancia',
    calCheckIn: 'Entrada',
    calCheckOut: 'Salida',
    calNumGuests: 'Huéspedes',
    calPriceNight: 'Precio por noche',
    calCleaning: 'Limpieza y preparación',
    calTotal: 'Costo total estimado',
    calFormTitle: 'Tus Datos de Reserva',
    calFullName: 'Nombre Completo',
    calEmail: 'Correo Electrónico',
    calPhone: 'Teléfono de Contacto',
    calNotes: 'Notas adicionales o peticiones (Opcional)',
    calGateway: 'Pasarela de Pago Segura',
    calCard: 'Tarjeta de Crédito',
    calBizum: 'Bizum',
    calBank: 'Transferencia Bancaria',
    calApplePay: 'Apple Pay ',
    calGooglePay: 'Google Pay',
    calOtherOptions: 'Otras opciones de pago',
    calPayBtn: 'Proceder al Pago Seguro',
    calProcessing: 'Procesando cargo seguro...',
    calReadyApple: 'Listo para pagar con Apple Pay',
    calDescApple: 'Usa tu dispositivo Apple para autorizar este pago con Face ID o Touch ID de forma inmediata.',
    calReadyGoogle: 'Listo para pagar con Google Pay',
    calDescGoogle: 'Confirma el pago con una de tus tarjetas guardadas en tu cuenta de Google de forma totalmente integrada.',
    calConfirmTransfer: 'Confirmar Transferencia Bancaria',
    calPaymentStatus: 'Estado de pago:',
    calBookingCompleted: '¡Reserva Completada con Éxito!',
    calThanks: '¡Muchas gracias por confiar en nuestra familia!',
    calBookingDetails: 'Resumen de tu estancia',
    calPaymentMethod: 'Forma de Pago:',
    calNights: 'noches',
    calStatusPending: 'La reserva se encuentra pendiente de aprobación final por la familia.',
    calSuccessMsg: 'Te hemos enviado un correo de confirmación. Ángel y la familia se pondrán en contacto contigo pronto.',

    footDesc: 'Una preciosa casa rústica familiar en Gelida, Catalunya. Ofrecemos paz, privacidad y una estancia impecable rodeados de viñedos para crear recuerdos eternos.',
    footInfo: 'Información',
    footContact: 'Contacto',
    footBackToTop: 'Inicio / Volver Arriba',
    footFreeDates: 'Fechas Libres',
    footFamilyAccess: '🔑 Acceso Familiares',
    footRights: 'Todos los derechos reservados.',
    footPrivacy: 'Política de Privacidad',
    footTerms: 'Términos de Servicio',
    footMadeWith: 'Hecho con amor por la familia ReneFiser',
    filterAll: 'Todas las Fotos',
    filterPanoramic: 'Panorámicas',
    filterInteriors: 'Interiores',
    filterExteriors: 'Exteriores',
    showMore: 'Ver más fotos',
    showLess: 'Ver menos fotos',
    menuOpen: 'Abrir menú',
    menuClose: 'Cerrar menú',
    coopTitle: 'Fondo de Conservación & Mantenimiento',
    coopSub: 'Modelo de Preservación Familiar',
    coopDesc: 'Casa Tarongers fue levantada en 1967. Para preservar su arquitectura e historia, la familia gestiona la finca de forma cooperativa y no lucrativa. El 100% de las aportaciones de los invitados se destina exclusivamente a financiar las reformas necesarias, el mantenimiento del jardín y la mejora de las instalaciones.',
    coopRenovationsTitle: 'Plan de Conservación y Reformas de la Finca',
    coopStatusCompleted: 'Completado',
    coopStatusOngoing: 'En curso',
    coopStatusPlanned: 'Planificado',
    stayTypeLabel: 'Tipo de Estancia',
    stayTypeGuest: 'Invitado (Estancia con Aportación)',
    stayTypeFamily: 'Familiar (Acceso Miembro de la Familia)',
    familyPinLabel: 'Código PIN Familiar',
    familyPinPlaceholder: 'Introduce el PIN de 4 dígitos',
    familyPinSuccess: 'PIN verificado. Reserva familiar sin coste de mantenimiento.',
    familyPinError: 'PIN familiar incorrecto.',
    familyRegisterBtn: 'Registrar Estancia Familiar'
  },
  ca: {
    aboutHouse: 'Sobre la Casa',
    services: 'Serveis',
    gallery: 'Galeria',
    location: 'Ubicació',
    familyDashboard: 'Espai Familiar',
    bookNow: 'RESERVA ARA',
    web: 'Web Pública',

    heroWelcome: 'Benvinguts a Casa Tarongers',
    heroSub: 'Un oasi de tranquil·litat familiar a Gelida',
    checkAvailability: 'Veure disponibilitat',
    charmlabel: 'Estada rural amb encant',

    aboutTitle: 'Casa Tarongers',
    entireHome: 'Casa Sencera',
    capacityText: 'Capacitat 10 Persones',
    descParagraph1: 'Casa Tarongers és una encantadora vil·la rural de dues plantes a Gelida, Penedès, Catalunya. Presenta una càlida façana de pedra i estuc amb tancaments de fusta, balcons i una terrassa coberta emmarcada per palmeres. Es troba enmig d\'una àmplia i exuberant gespa amb arbres madurs i arbustos florals que aporten ombra i absoluta privadesa.',
    descParagraph2: 'La casa pertany a una família catalana que ha decidit obrir les seves portes per compartir aquest oasi de pau. Amb detalls cuidats al mil·límetre, és el lloc idoni tant per desconnectar sota el sol mediterrani com per organitzar celebracions familiars íntimes envoltades de vinyes i natura.',
    whatOffers: 'Què ofereix aquesta casa',
    pillBedrooms: 'Dormitoris',
    pillShowers: 'Banys / Dutxes',
    pillKitchen: 'Cuina Equipada',
    pillParking: 'Aparcament',
    pillPool: 'Piscina Privada',
    pillTV: 'Smart TV',
    pillWiFi: 'Connexió WiFi',
    pillAudio: 'Àudio Intel·ligent',
    pillTennis: 'Pista de Tennis',
    pillGarden: 'Jardí i Gespa',

    specPropType: 'Tipus de propietat',
    specPropVal: 'Vil·la Rural Familiar',
    specYearBuilt: 'Any de construcció',
    specYearVal: '1967',
    specRoomsBaths: 'Habitacions/Banys',
    specRoomsVal: '5 Dorm. / 4 Banys',
    specExactLoc: 'Ubicació Exacta',
    specLocVal: 'Gelida, Penedès',
    specMinStay: 'Estada mínima',
    specMinStayVal: '3 nits',
    specPoolType: 'Piscina',
    specPoolVal: 'Privada',

    guarPrivacyTitle: 'Privadesa Absoluta',
    guarPrivacyDesc: 'Tota la finca, piscina i jardins són exclusius per a vosaltres durant la vostra estada.',
    guarFlexTitle: 'Check-in Flexible',
    guarFlexDesc: 'Coordinació directa amb la família per a una acollida càlida, còmoda i personalitzada.',

    galleryTitle: 'Un passeig pel paradís',
    gallerySub: 'Fotografies Reals',
    galleryInstructions: 'Fes clic a qualsevol imatge per obrir la visualització interactiva a pantalla completa i contemplar els racons de la nostra vil·la familiar.',
    galleryHeroDesc: 'Façana rústica de pedra i estuc',
    galleryPoolDesc: 'Envoltada de gespa i palmeres mediterrànies',
    galleryLivingDesc: 'Llar de foc acollidora i bigues de fusta noble',
    galleryGardenDesc: 'Àmplia esplanada amb vegetació exuberant',

    locTitle: 'Al cor del Penedès',
    locSub: 'Ubicació i Entorn',
    locDesc: 'Gelida és un municipi encantador situat a la comarca de l\'Alt Penedès, famós pels seus castells medievals, els seus paisatges plens de vinyes i la seva proximitat a les caves més importants del món.',
    locContactTitle: 'Adreça de Contacte',
    locContactVal: '08790 Gelida, Catalunya, Espanya',
    locPhoneTitle: 'Telèfon Directe d\'Acollida',
    locPhoneVal: '+34 629 30 85 70 (Àngel / Família)',
    locEmailTitle: 'Email Familiar',
    locRecTitle: 'Visites recomanades a la zona:',
    locRec1: 'Castell de Gelida',
    locRec2: 'Caves del Penedès',
    locRec3: 'Montserrat (25 min)',
    locRec4: 'Sitges i Platges (35 min)',

    calTitle: 'Reserves i Calendari',
    calSelectDates: 'Selecciona les teves dates al calendari',
    calPriceCalc: 'Calculadora de preu instantània',
    calBookStay: 'Reserva la teva estada',
    calCheckIn: 'Entrada',
    calCheckOut: 'Sortida',
    calNumGuests: 'Hostes',
    calPriceNight: 'Preu per nit',
    calCleaning: 'Neteja i preparació',
    calTotal: 'Cost total estimat',
    calFormTitle: 'Dades de la Reserva',
    calFullName: 'Nom Complet',
    calEmail: 'Correu Electrònic',
    calPhone: 'Telèfon de Contacte',
    calNotes: 'Notes addicionals o peticions (Opcional)',
    calGateway: 'Passarel·la de Pagament Segura',
    calCard: 'Targeta de Crèdit',
    calBizum: 'Bizum',
    calBank: 'Transferència Bancària',
    calApplePay: 'Apple Pay ',
    calGooglePay: 'Google Pay',
    calOtherOptions: 'Altres opcions de pagament',
    calPayBtn: 'Procedir al Pagament Segur',
    calProcessing: 'Processant pagament segur...',
    calReadyApple: 'Llest per pagar amb Apple Pay',
    calDescApple: 'Utilitza el teu dispositiu Apple per autoritzar aquest pagament amb Face ID o Touch ID de forma immediata.',
    calReadyGoogle: 'Llest per pagar com Google Pay',
    calDescGoogle: 'Confirma el pagament de forma segura amb les targetes desades al teu compte de Google.',
    calConfirmTransfer: 'Confirmar Transferència Bancària',
    calPaymentStatus: 'Estat de pagament:',
    calBookingCompleted: '¡Reserva Completada amb Èxit!',
    calThanks: '¡Moltes gràcies per confiar en la nostra família!',
    calBookingDetails: 'Resum de l\'estada',
    calPaymentMethod: 'Forma de Pagament:',
    calNights: 'nits',
    calStatusPending: 'La reserva es troba pendent d\'aprovació final per part de la família.',
    calSuccessMsg: 'T\'hem enviat un correu electrònic de confirmació. L\'Àngel i la família es posaran en contacte amb tu molt aviat.',

    footDesc: 'Una preciosa casa rústica familiar a Gelida, Catalunya. Oferim pau, privadesa i una estada impecable envoltats de vinyes per crear records eterns.',
    footInfo: 'Informació',
    footContact: 'Contacte',
    footBackToTop: 'Inici / Tornar a Dalt',
    footFreeDates: 'Dates Lliures',
    footFamilyAccess: '🔑 Espai Familiar',
    footRights: 'Tots els drets reservats.',
    footPrivacy: 'Política de Privadesa',
    footTerms: 'Termes de Servei',
    footMadeWith: 'Fet amb amor per la família ReneFiser',
    filterAll: 'Totes les Fotos',
    filterPanoramic: 'Panoràmiques',
    filterInteriors: 'Interiors',
    filterExteriors: 'Exteriors',
    showMore: 'Veure més fotos',
    showLess: 'Veure menys fotos',
    menuOpen: 'Obrir menú',
    menuClose: 'Tancar menú',
    coopTitle: 'Fons de Conservació & Manteniment',
    coopSub: 'Model de Preservació Familiar',
    coopDesc: 'Casa Tarongers va ser aixecada el 1967. Per tal de preservar la seva arquitectura i història, la família gestiona la finca de forma cooperativa i no lucrativa. El 100% de les aportacions dels convidats es destina exclusivament a finançar les reformes necessàres, el manteniment del jardí i la millora de les instal·lacions.',
    coopRenovationsTitle: 'Pla de Conservació i Reformes de la Finca',
    coopStatusCompleted: 'Completat',
    coopStatusOngoing: 'En curs',
    coopStatusPlanned: 'Planificat',
    stayTypeLabel: 'Tipus d\'Estada',
    stayTypeGuest: 'Convidat (Estada amb Aportació)',
    stayTypeFamily: 'Familiar (Accés Membre de la Família)',
    familyPinLabel: 'Codi PIN Familiar',
    familyPinPlaceholder: 'Introdueix el PIN de 4 dígits',
    familyPinSuccess: 'PIN verificat. Reserva familiar sense cost de manteniment.',
    familyPinError: 'PIN familiar incorrecte.',
    familyRegisterBtn: 'Registrar Estada Familiar'
  },
  en: {
    aboutHouse: 'About',
    services: 'Services',
    gallery: 'Gallery',
    location: 'Location',
    familyDashboard: 'Family Portal',
    bookNow: 'BOOK NOW',
    web: 'Public Web',

    heroWelcome: 'Welcome to Casa Tarongers',
    heroSub: 'A peaceful family oasis in Gelida',
    checkAvailability: 'Check availability',
    charmlabel: 'Charming countryside stay',

    aboutTitle: 'Casa Tarongers',
    entireHome: 'Entire Home',
    capacityText: 'Capacity 10 Guests',
    descParagraph1: 'Casa Tarongers is a charming two-story country villa in Gelida, Penedès, Catalunya. It features a warm stone-and-stucco façade with wooden shutters, balconies, and a covered terrace framed by palm trees. Set amid a spacious, lush lawn with mature trees and flowering shrubs that offer shade and absolute privacy.',
    descParagraph2: 'The house belongs to a local Catalan family who has decided to open their doors to share this oasis of tranquility. Thoughtfully designed down to the very last detail, it is the ideal spot to disconnect under the Mediterranean sun or organize intimate family gatherings surrounded by vineyards and nature.',
    whatOffers: 'What this house offers',
    pillBedrooms: 'Bedrooms',
    pillShowers: 'Showers / Baths',
    pillKitchen: 'Full Kitchen',
    pillParking: 'Private Parking',
    pillPool: 'Private Pool',
    pillTV: 'Smart TV',
    pillWiFi: 'WiFi Connection',
    pillAudio: 'Smart Audio',
    pillTennis: 'Tennis Court',
    pillGarden: 'Lawn & Garden',

    specPropType: 'Property type',
    specPropVal: 'Family Country Villa',
    specYearBuilt: 'Year of construction',
    specYearVal: '1967',
    specRoomsBaths: 'Bedrooms / Bathrooms',
    specRoomsVal: '5 Bed. / 4 Bath.',
    specExactLoc: 'Exact Location',
    specLocVal: 'Gelida, Penedès',
    specMinStay: 'Minimum stay',
    specMinStayVal: '3 nights',
    specPoolType: 'Swimming pool',
    specPoolVal: 'Private',

    guarPrivacyTitle: 'Absolute Privacy',
    guarPrivacyDesc: 'The entire property, swimming pool, and gardens are exclusively yours during your entire stay.',
    guarFlexTitle: 'Flexible Check-in',
    guarFlexDesc: 'Direct coordination with the host family for a warm, comfortable, and personalized arrival.',

    galleryTitle: 'A walk through paradise',
    gallerySub: 'Real Photographs',
    galleryInstructions: 'Click on any image to open the interactive full-screen light-box view and experience our family villa up close.',
    galleryHeroDesc: 'Rustic stone and stucco facade',
    galleryPoolDesc: 'Surrounded by lawn and Mediterranean palm trees',
    galleryLivingDesc: 'Cosy wood fireplace and hardwood beams',
    galleryGardenDesc: 'Spacious layout with lush vegetation',

    locTitle: 'In the heart of the Penedès',
    locSub: 'Location & Surroundings',
    locDesc: 'Gelida is an enchanting municipality located in the Alt Penedès region, famous for its medieval castles, landscapes covered in vineyards, and its closeness to the world\'s most famous Cava cellars.',
    locContactTitle: 'Contact Address',
    locContactVal: '08790 Gelida, Catalunya, Spain',
    locPhoneTitle: 'Direct Host Hotline',
    locPhoneVal: '+34 629 30 85 70 (Ángel / Family)',
    locEmailTitle: 'Family Email',
    locRecTitle: 'Recommended visits in the area:',
    locRec1: 'Gelida Medieval Castle',
    locRec2: 'Penedès Cava Cellars',
    locRec3: 'Montserrat Monastery (25 min)',
    locRec4: 'Sitges & Beaches (35 min)',

    calTitle: 'Reservas & Calendar',
    calSelectDates: 'Select your dates in the calendar',
    calPriceCalc: 'Instant price calculator',
    calBookStay: 'Book your stay',
    calCheckIn: 'Check-in',
    calCheckOut: 'Check-out',
    calNumGuests: 'Guests count',
    calPriceNight: 'Price per night',
    calCleaning: 'Cleaning & prep fee',
    calTotal: 'Total estimated cost',
    calFormTitle: 'Your Booking Details',
    calFullName: 'Full Name',
    calEmail: 'Email Address',
    calPhone: 'Phone Number',
    calNotes: 'Additional notes or special requests (Optional)',
    calGateway: 'Secure Payment Gateway',
    calCard: 'Credit Card',
    calBizum: 'Bizum Pay',
    calBank: 'Bank Wire Transfer',
    calApplePay: 'Apple Pay ',
    calGooglePay: 'Google Pay',
    calOtherOptions: 'Other payment methods',
    calPayBtn: 'Proceed to Secure Payment',
    calProcessing: 'Processing secure transaction...',
    calReadyApple: 'Ready to pay with Apple Pay',
    calDescApple: 'Use your Apple device to authorize this transaction with Face ID or Touch ID instantly.',
    calReadyGoogle: 'Ready to pay with Google Pay',
    calDescGoogle: 'Confirm the payment securely using cards stored in your Google Wallet account.',
    calConfirmTransfer: 'Confirm Bank Wire Transfer',
    calPaymentStatus: 'Payment status:',
    calBookingCompleted: 'Booking Completed Successfully!',
    calThanks: 'Thank you for trusting our family!',
    calBookingDetails: 'Your stay summary',
    calPaymentMethod: 'Payment Method:',
    calNights: 'nights',
    calStatusPending: 'The booking is currently pending final approval by the host family.',
    calSuccessMsg: 'We have sent you a confirmation email. Ángel and the family will be in touch with you very soon.',

    footDesc: 'A beautiful rustic family country home in Gelida, Catalunya. We offer peace, privacy, and an impeccable stay surrounded by vineyards to create lifelong memories.',
    footInfo: 'Information',
    footContact: 'Contact',
    footBackToTop: 'Back to Top',
    footFreeDates: 'Free Dates',
    footFamilyAccess: '🔑 Family Portal',
    footRights: 'All rights reserved.',
    footPrivacy: 'Privacy Policy',
    footTerms: 'Terms of Service',
    footMadeWith: 'Made with love by the ReneFiser family',
    filterAll: 'All Photos',
    filterPanoramic: 'Panoramic',
    filterInteriors: 'Interiors',
    filterExteriors: 'Exteriors',
    showMore: 'Show more photos',
    showLess: 'Show less photos',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    coopTitle: 'Conservation & Maintenance Fund',
    coopSub: 'Family Heritage Preservation Model',
    coopDesc: 'Casa Tarongers was built in 1967. To preserve its architecture and history, the family manages the estate in a non-profit cooperative way. 100% of guest contributions are directly allocated to funding necessary renovations, garden landscaping, and property improvements.',
    coopRenovationsTitle: 'Estate Conservation and Renovation Plan',
    coopStatusCompleted: 'Completed',
    coopStatusOngoing: 'In progress',
    coopStatusPlanned: 'Planned',
    stayTypeLabel: 'Stay Type',
    stayTypeGuest: 'Guest Stay (With Maintenance Contribution)',
    stayTypeFamily: 'Family Stay (Member Access Required)',
    familyPinLabel: 'Family PIN Code',
    familyPinPlaceholder: 'Enter 4-digit PIN code',
    familyPinSuccess: 'PIN verified. Family stay with zero maintenance rate.',
    familyPinError: 'Incorrect family PIN code.',
    familyRegisterBtn: 'Register Family Stay'
  }
};
