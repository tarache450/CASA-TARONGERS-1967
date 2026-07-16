import { Booking, Payment, PropertySettings, Amenity } from './types';

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
  hero: '/src/assets/images/casa_tarongers_hero_1784209307332.jpg',
  pool: '/src/assets/images/casa_tarongers_pool_1784209324340.jpg',
  living: '/src/assets/images/casa_tarongers_living_1784209336640.jpg',
  garden: '/src/assets/images/casa_tarongers_garden_1784209349861.jpg',
  bedroom: '/src/assets/images/casa_tarongers_bedroom_1784214032055.jpg',
  kitchen: '/src/assets/images/casa_tarongers_kitchen_1784214046842.jpg',
  bathroom: '/src/assets/images/casa_tarongers_bathroom_1784214061880.jpg',
  tennis: '/src/assets/images/casa_tarongers_tennis_1784214077486.jpg'
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
    totalPrice: 0,
    status: 'Family Use',
    paymentStatus: 'Paid',
    paymentMethod: 'None',
    notes: 'Blocked for the family mid-summer get-together. Need garden set ready.',
    createdAt: '2026-05-10T08:00:00Z'
  },
  {
    id: 'B003',
    guestName: 'Sofia Lindqvist',
    guestEmail: 'sofia.l@nordicdesign.se',
    guestPhone: '+46 8 123 45 67',
    checkIn: '2026-07-18',
    checkOut: '2026-07-25',
    guestsCount: 6,
    totalPrice: 2360, // 7 nights * 320 (high season) + 120 cleaning
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'Card',
    notes: 'Requested pool towels and baby cot.',
    createdAt: '2026-06-20T14:15:00Z'
  },
  {
    id: 'B004',
    guestName: 'Mark Webber',
    guestEmail: 'mark.webber@ozspeed.com',
    guestPhone: '+61 2 9876 5432',
    checkIn: '2026-08-01',
    checkOut: '2026-08-10',
    guestsCount: 5,
    totalPrice: 3000, // 9 nights * 320 (high season) + 120 cleaning
    status: 'Confirmed',
    paymentStatus: 'Paid',
    paymentMethod: 'Bank Transfer',
    notes: 'Enquiring about bicycle rentals in Gelida.',
    createdAt: '2026-06-28T09:12:00Z'
  },
  {
    id: 'B005',
    guestName: 'Vacaciones de Abuelos (Santi & Maria)',
    guestEmail: 'santi.tarongers@coac.net',
    guestPhone: '+34 629 30 85 70',
    checkIn: '2026-08-14',
    checkOut: '2026-08-20',
    guestsCount: 4,
    totalPrice: 0,
    status: 'Family Use',
    paymentStatus: 'Paid',
    paymentMethod: 'None',
    notes: 'Blocked for family use - grandparents rest days.',
    createdAt: '2026-04-01T12:00:00Z'
  },
  {
    id: 'B006',
    guestName: 'Sarah Jenkins',
    guestEmail: 'sarah.j@example.com',
    guestPhone: '+1 (555) 000-0000',
    checkIn: '2026-08-22',
    checkOut: '2026-08-29',
    guestsCount: 4,
    totalPrice: 2360, // 7 nights * 320 + 120 cleaning
    status: 'Pending',
    paymentStatus: 'Pending',
    paymentMethod: 'Bizum',
    notes: 'Pending confirmation of Bizum payment advance.',
    createdAt: '2026-07-15T18:40:00Z'
  },
  {
    id: 'B007',
    guestName: 'Lucas Rossi',
    guestEmail: 'lucas.rossi@milano.it',
    guestPhone: '+39 333 456 7890',
    checkIn: '2026-09-05',
    checkOut: '2026-09-12',
    guestsCount: 6,
    totalPrice: 1870, // 7 nights * 250 + 120 cleaning
    status: 'Confirmed',
    paymentStatus: 'Pending',
    paymentMethod: 'Bank Transfer',
    notes: 'Bank transfer is sent, waiting for it to arrive on account.',
    createdAt: '2026-07-10T11:00:00Z'
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
