import { Booking, Payment, PropertySettings, Amenity, GalleryImage } from './types';

export const INITIAL_PROPERTY_SETTINGS: PropertySettings = {
  basePrice: 250, // per night (euros)
  cleaningFee: 120,
  highSeasonPrice: 320, // July-August
  minDays: 3,
  capacity: 10,
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
    id: 'B001',
    guestName: 'Jean-Luc Piccard',
    guestEmail: 'jl.piccard@enterprise.fr',
    guestPhone: '+33 6 1234 5678',
    checkIn: '2026-07-01',
    checkOut: '2026-07-08',
    guestsCount: 4,
    totalPrice: 1870, // 7 nights * 250 + 120 cleaning
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'Bank Transfer',
    notes: 'Prefers self check-in. Arriving by car from France.',
    createdAt: '2026-06-15T10:30:00Z'
  },
  {
    id: 'B002',
    guestName: 'Reunión Familiar Jordi & Carmen',
    guestEmail: 'jordi.tarongers@gmail.com',
    guestPhone: '+34 611 22 33 44',
    checkIn: '2026-07-11',
    checkOut: '2026-07-15',
    guestsCount: 8,
    totalPrice: 1400,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'Bizum',
    notes: 'Reserva familiar anual. Se necesita cuna adicional.',
    createdAt: '2026-06-18T14:20:00Z'
  },
  {
    id: 'B003',
    guestName: 'Sofia Lindqvist',
    guestEmail: 'sofia.l@nordic-travel.se',
    guestPhone: '+46 70 987 6543',
    checkIn: '2026-07-18',
    checkOut: '2026-07-25',
    guestsCount: 6,
    totalPrice: 2360, // High season: 7 * 320 + 120
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'Card',
    notes: 'Family vacation from Sweden. Requested early check-in if available.',
    createdAt: '2026-06-20T09:15:00Z'
  },
  {
    id: 'B004',
    guestName: 'Mark Webber',
    guestEmail: 'mwebber@ozmail.com.au',
    guestPhone: '+61 412 345 678',
    checkIn: '2026-08-01',
    checkOut: '2026-08-10',
    guestsCount: 10,
    totalPrice: 3000, // High season
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'Bank Transfer',
    notes: 'Full house capacity booking. Wedding anniversary celebration.',
    createdAt: '2026-06-28T16:45:00Z'
  },
  {
    id: 'B005',
    guestName: 'Familia Alsius',
    guestEmail: 'alsius.fam@coac.cat',
    guestPhone: '+34 600 99 88 77',
    checkIn: '2026-08-15',
    checkOut: '2026-08-20',
    guestsCount: 5,
    totalPrice: 1720,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'Bank Transfer',
    notes: 'Amics de la família. Sol·liciten accés a la pista de tennis.',
    createdAt: '2026-07-02T11:00:00Z'
  },
  {
    id: 'B006',
    guestName: 'Sarah Jenkins',
    guestEmail: 'sarah.j@londontech.co.uk',
    guestPhone: '+44 7700 900077',
    checkIn: '2026-08-22',
    checkOut: '2026-08-29',
    guestsCount: 6,
    totalPrice: 2360,
    status: 'Confirmed',
    paymentStatus: 'Pending',
    paymentMethod: 'Bizum',
    notes: 'Awaiting final transfer verification.',
    createdAt: '2026-07-10T15:30:00Z'
  },
  {
    id: 'B007',
    guestName: 'Lucas Rossi',
    guestEmail: 'lucas.rossi@milano.it',
    guestPhone: '+39 335 123 4567',
    checkIn: '2026-09-05',
    checkOut: '2026-09-12',
    guestsCount: 4,
    totalPrice: 1870,
    status: 'Confirmed',
    paymentStatus: 'Pending',
    paymentMethod: 'Bank Transfer',
    notes: 'Wine tasting trip in Penedès.',
    createdAt: '2026-07-11T08:50:00Z'
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'P001',
    bookingId: 'B001',
    guestName: 'Jean-Luc Piccard',
    amount: 1870,
    method: 'Bank Transfer',
    status: 'Paid',
    date: '2026-06-17'
  },
  {
    id: 'P002',
    bookingId: 'B003',
    guestName: 'Sofia Lindqvist',
    amount: 2360,
    method: 'Card',
    status: 'Paid',
    date: '2026-06-21'
  },
  {
    id: 'P003',
    bookingId: 'B004',
    guestName: 'Mark Webber',
    amount: 3000,
    method: 'Bank Transfer',
    status: 'Paid',
    date: '2026-06-30'
  },
  {
    id: 'P004',
    bookingId: 'B007',
    guestName: 'Lucas Rossi',
    amount: 1870,
    method: 'Bank Transfer',
    status: 'Pending',
    date: '2026-07-11'
  },
  {
    id: 'P005',
    bookingId: 'B006',
    guestName: 'Sarah Jenkins',
    amount: 2360,
    method: 'Bizum',
    status: 'Pending',
    date: '2026-07-15'
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
