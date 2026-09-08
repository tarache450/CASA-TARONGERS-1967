import { Booking, PropertySettings, Amenity, GalleryImage } from './types';

export const INITIAL_PROPERTY_SETTINGS: PropertySettings = {
  capacity: 10,
  minDays: 2,
  contactEmail: 'acivit@coac.net',
  contactPhone: '+34 629 30 85 70'
};

export const IMAGES = {
  hero: '/images/Exteriors/Exteriors  003.jpg',
  pool: '/images/Exteriors/Exteriors  004.jpg',
  living: '/images/Exteriors/Exteriors  012.jpg',
  garden: '/images/Exteriors/Exteriors  002.jpg',
  bedroom: '/images/Exteriors/Exteriors  012.jpg',
  kitchen: '/images/Exteriors/Exteriors  012.jpg',
  bathroom: '/images/Exteriors/Exteriors  008.jpg',
  tennis: '/images/Exteriors/Exteriors  002.jpg'
};

export const AMENITIES: Amenity[] = [
  { id: 'bedrooms', name: '5 Bedrooms (Capacity 10)', category: 'Space', icon: 'Bed' },
  { id: 'showers', name: '4 Bathrooms & Showers', category: 'Space', icon: 'ShowerHead' },
  { id: 'kitchen', name: 'Fully Equipped Kitchen', category: 'Food', icon: 'ChefHat' },
  { id: 'parking', name: 'Private Parking Lot', category: 'Facilities', icon: 'Car' },
  { id: 'pool', name: 'Private Swimming Pool', category: 'Outdoor', icon: 'Waves' },
  { id: 'tv', name: 'Smart TV & Cable', category: 'Entertainment', icon: 'Tv' },
  { id: 'wifi', name: 'High-speed WiFi Connection', category: 'Connectivity', icon: 'Wifi' },
  { id: 'audio', name: 'Smart Audio System', category: 'Entertainment', icon: 'Music' },
  { id: 'tennis', name: 'Tennis & Playground Area', category: 'Outdoor', icon: 'Activity' },
  { id: 'garden', name: 'Refreshing Garden & Lawn', category: 'Outdoor', icon: 'Trees' }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'REQ-2026-001',
    guestName: 'Jean-Luc Piccard',
    guestEmail: 'jl.piccard@enterprise.fr',
    guestPhone: '+33 6 1234 5678',
    checkIn: '2026-07-01',
    checkOut: '2026-07-08',
    guestsCount: 4,
    message: 'Prefiere auto check-in. Llegada en coche desde Francia.',
    privacyAccepted: true,
    termsAccepted: true,
    status: 'confirmed',
    internalNotes: [
      { id: 'n1', timestamp: '2026-06-15T10:45:00Z', author: 'Familia', content: 'Confirmada estancia de una semana.' }
    ],
    history: [
      { id: 'h1', timestamp: '2026-06-15T10:30:00Z', author: 'Jean-Luc Piccard', action: 'Solicitud enviada' },
      { id: 'h2', timestamp: '2026-06-15T10:45:00Z', author: 'Familia', action: 'Estado cambiado a Confirmada' }
    ],
    createdAt: '2026-06-15T10:30:00Z',
    updatedAt: '2026-06-15T10:45:00Z'
  },
  {
    id: 'REQ-2026-002',
    guestName: 'Reunión Familiar Jordi & Carmen',
    guestEmail: 'jordi.tarongers@gmail.com',
    guestPhone: '+34 611 22 33 44',
    checkIn: '2026-07-11',
    checkOut: '2026-07-15',
    guestsCount: 8,
    message: 'Reserva familiar anual. Se necesita cuna adicional.',
    privacyAccepted: true,
    termsAccepted: true,
    status: 'confirmed',
    internalNotes: [
      { id: 'n2', timestamp: '2026-06-18T14:30:00Z', author: 'Familia', content: 'Preparar cuna en la habitación verde.' }
    ],
    history: [
      { id: 'h3', timestamp: '2026-06-18T14:20:00Z', author: 'Familia', action: 'Reserva familiar confirmada' }
    ],
    createdAt: '2026-06-18T14:20:00Z',
    updatedAt: '2026-06-18T14:30:00Z'
  },
  {
    id: 'REQ-2026-003',
    guestName: 'Sofia Lindqvist',
    guestEmail: 'sofia.l@nordic-travel.se',
    guestPhone: '+46 70 987 6543',
    checkIn: '2026-07-18',
    checkOut: '2026-07-25',
    guestsCount: 6,
    message: 'Vacaciones familiares desde Suecia. Solicitan early check-in si es posible.',
    privacyAccepted: true,
    termsAccepted: true,
    status: 'confirmed',
    internalNotes: [],
    history: [
      { id: 'h4', timestamp: '2026-06-20T09:15:00Z', author: 'Sofia Lindqvist', action: 'Solicitud enviada' },
      { id: 'h5', timestamp: '2026-06-20T10:00:00Z', author: 'Familia', action: 'Estado cambiado a Confirmada' }
    ],
    createdAt: '2026-06-20T09:15:00Z',
    updatedAt: '2026-06-20T10:00:00Z'
  },
  {
    id: 'REQ-2026-004',
    guestName: 'Mark Webber',
    guestEmail: 'mwebber@ozmail.com.au',
    guestPhone: '+61 412 345 678',
    checkIn: '2026-08-01',
    checkOut: '2026-08-10',
    guestsCount: 10,
    message: 'Celebración de aniversario de boda con la familia.',
    privacyAccepted: true,
    termsAccepted: true,
    status: 'confirmed',
    internalNotes: [],
    history: [
      { id: 'h6', timestamp: '2026-06-28T16:45:00Z', author: 'Mark Webber', action: 'Solicitud enviada' },
      { id: 'h7', timestamp: '2026-06-29T11:20:00Z', author: 'Familia', action: 'Estado cambiado a Confirmada' }
    ],
    createdAt: '2026-06-28T16:45:00Z',
    updatedAt: '2026-06-29T11:20:00Z'
  },
  {
    id: 'REQ-2026-005',
    guestName: 'Familia Alsius',
    guestEmail: 'alsius.fam@coac.cat',
    guestPhone: '+34 600 99 88 77',
    checkIn: '2026-08-15',
    checkOut: '2026-08-20',
    guestsCount: 5,
    message: 'Amics de la família. Sol·liciten accés a la pista de tennis.',
    privacyAccepted: true,
    termsAccepted: true,
    status: 'confirmed',
    internalNotes: [],
    history: [
      { id: 'h8', timestamp: '2026-07-02T11:00:00Z', author: 'Familia', action: 'Reserva confirmada' }
    ],
    createdAt: '2026-07-02T11:00:00Z',
    updatedAt: '2026-07-02T11:00:00Z'
  },
  {
    id: 'REQ-2026-006',
    guestName: 'Sarah Jenkins',
    guestEmail: 'sarah.j@londontech.co.uk',
    guestPhone: '+44 7700 900077',
    checkIn: '2026-08-22',
    checkOut: '2026-08-29',
    guestsCount: 6,
    message: 'Interesados en visitar bodegas del Penedès durante la estancia.',
    privacyAccepted: true,
    termsAccepted: true,
    status: 'pending_review',
    internalNotes: [
      { id: 'n3', timestamp: '2026-07-10T16:00:00Z', author: 'Familia', content: 'Pendiente de coordinar fechas.' }
    ],
    history: [
      { id: 'h9', timestamp: '2026-07-10T15:30:00Z', author: 'Sarah Jenkins', action: 'Solicitud enviada' }
    ],
    createdAt: '2026-07-10T15:30:00Z',
    updatedAt: '2026-07-10T15:30:00Z'
  },
  {
    id: 'REQ-2026-007',
    guestName: 'Lucas Rossi',
    guestEmail: 'lucas.rossi@milano.it',
    guestPhone: '+39 335 123 4567',
    checkIn: '2026-09-05',
    checkOut: '2026-09-12',
    guestsCount: 4,
    message: 'Viaje enológico por el Alt Penedès.',
    privacyAccepted: true,
    termsAccepted: true,
    status: 'contacted',
    internalNotes: [
      { id: 'n4', timestamp: '2026-07-11T12:00:00Z', author: 'Familia', content: 'Contactado por WhatsApp. Esperando confirmación de vuelos.' }
    ],
    history: [
      { id: 'h10', timestamp: '2026-07-11T08:50:00Z', author: 'Lucas Rossi', action: 'Solicitud enviada' },
      { id: 'h11', timestamp: '2026-07-11T12:00:00Z', author: 'Familia', action: 'Estado cambiado a Contactada' }
    ],
    createdAt: '2026-07-11T08:50:00Z',
    updatedAt: '2026-07-11T12:00:00Z'
  }
];

export const ALL_GALLERY_IMAGES: GalleryImage[] = [
  {
    src: '/images/Exteriors/Exteriors  003.jpg',
    category: 'exteriors',
    alt: {
      ca: 'Vista principal de Casa Tarongers',
      es: 'Vista principal de Casa Tarongers',
      en: 'Main view of Casa Tarongers'
    },
    desc: {
      ca: 'Façana principal i jardí amb ginkgo biloba i palmeres.',
      es: 'Fachada principal y jardín con ginkgo biloba y palmeras.',
      en: 'Main facade and garden with ginkgo biloba and palm trees.'
    }
  },
  {
    src: '/images/Exteriors/Exteriors  002.jpg',
    category: 'exteriors',
    alt: {
      ca: 'Camí del jardí a Casa Tarongers',
      es: 'Camino del jardín en Casa Tarongers',
      en: 'Garden path at Casa Tarongers'
    },
    desc: {
      ca: 'Camí de pedra rodejat d\'arbres i vegetació exuberant.',
      es: 'Camino de piedra rodeado de árboles y exuberante vegetación.',
      en: 'Stone path surrounded by trees and lush vegetation.'
    }
  },
  {
    src: '/images/Exteriors/Exteriors  004.jpg',
    category: 'exteriors',
    alt: {
      ca: 'Vista de la finca des de la gespa',
      es: 'Vista de la finca desde el césped',
      en: 'Estate view from the lawn'
    },
    desc: {
      ca: 'Àmplia gespa i arbres d\'avet i ginkgo a la finca.',
      es: 'Amplio césped y variedad de árboles en la finca.',
      en: 'Spacious lawn and mature trees across the estate.'
    }
  },
  {
    src: '/images/Exteriors/Exteriors  012.jpg',
    category: 'interiors',
    alt: {
      ca: 'Porxo acollidor amb vistes al jardí',
      es: 'Porche acogedor con vistas al jardín',
      en: 'Cozy porch with garden views'
    },
    desc: {
      ca: 'Espai interior amb grans finestrals de fusta cap al jardí.',
      es: 'Espacio interior con grandes ventanales de madera hacia el jardín.',
      en: 'Interior space with large wooden windows overlooking the garden.'
    }
  },
  {
    src: '/images/Exteriors/Exteriors  008.jpg',
    category: 'exteriors',
    alt: {
      ca: 'Jardí posterior i escales de pedra',
      es: 'Jardín posterior y escaleras de piedra',
      en: 'Back garden and stone stairs'
    },
    desc: {
      ca: 'Rincón acollidor del jardí amb avet centenari i escales.',
      es: 'Rincón acogedor del jardín con gran abeto y escaleras de piedra.',
      en: 'Cozy garden corner with mature pine tree and stone stairs.'
    }
  },
  {
    src: '/images/Panoramiques Exteriors/Pan Exteriors  031.jpg',
    category: 'panoramic',
    alt: {
      ca: 'Vista panoràmica del porxo i taula exterior',
      es: 'Vista panorámica del porche y mesa exterior',
      en: 'Panoramic view of the porch and outdoor table'
    },
    desc: {
      ca: 'Àmplia perspectiva del porxo de fusta amb taula de menjador exterior i grans arbres.',
      es: 'Amplia perspectiva del porche de madera con mesa de comedor exterior y árboles maduros.',
      en: 'Wide perspective of the wooden porch with outdoor dining table and mature trees.'
    }
  },
  {
    src: '/images/Panoramiques Exteriors/Pan Exteriors  037.jpg',
    category: 'panoramic',
    alt: {
      ca: 'Vista panoràmica lateral de la façana de pedra',
      es: 'Vista panorámica lateral de la fachada de piedra',
      en: 'Panoramic side view of the stone facade'
    },
    desc: {
      ca: 'Panoràmica de la terrassa porxada de pedra i vegetació enfiladissa.',
      es: 'Panorámica de la terraza porchada de piedra y vegetación trepadora.',
      en: 'Panoramic view of the stone porch terrace and climbing vines.'
    }
  },
  {
    src: '/images/Panoramiques Exteriors/Pan Exteriors  039.jpg',
    category: 'panoramic',
    alt: {
      ca: 'Vista panoràmica frontal de la finca',
      es: 'Vista panorámica frontal de la finca',
      en: 'Panoramic front view of the estate'
    },
    desc: {
      ca: 'Vista completa de la façana de pedra, ginkgo biloba daurat i palmeres des del jardí.',
      es: 'Vista completa de la fachada de piedra, ginkgo biloba dorado y palmeras desde el jardín.',
      en: 'Full view of the stone facade, golden ginkgo biloba, and palm trees from the lawn.'
    }
  }
];
