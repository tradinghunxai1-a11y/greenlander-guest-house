/**
 * Central business details, photo mappings, and WhatsApp URL builders
 * for Northlanders Guest House, Skardu.
 */

import img902348432 from './assets/photos/902348432.jpg';
import img902347950 from './assets/photos/902347950.jpg';
import img887379244 from './assets/photos/887379244.jpg';
import img869593098 from './assets/photos/869593098.jpg';
import img850050153 from './assets/photos/850050153.jpg';
import img844811595 from './assets/photos/844811595.jpg';
import img844811086 from './assets/photos/844811086.jpg';
import img836375437 from './assets/photos/836375437.jpg';
import img814442022 from './assets/photos/814442022.jpg';
import img814441758 from './assets/photos/814441758.jpg';
import img766401241 from './assets/photos/766401241.jpg';
import img726800997 from './assets/photos/726800997.jpg';
import img719970613 from './assets/photos/719970613.jpg';
import img719890294 from './assets/photos/719890294.jpg';
import img580440401 from './assets/photos/580440401.jpg';
import img574695684 from './assets/photos/574695684.jpg';

export const BUSINESS_INFO = {
  name: 'Northlanders Guest House',
  propertyType: 'Guest house',
  location: 'Skardu, Gilgit-Baltistan, Pakistan',
  address: 'Karphotok near Girls High School Skardu, Kargrong, Skardu, 16100',
  phoneDisplay: '+92 310 9102221',
  phoneHref: 'tel:+923109102221',
  whatsappNumber: '923109102221',
  whatsappBaseUrl: 'https://wa.me/923109102221',
  coordinates: {
    lat: 35.2961314,
    lng: 75.6395321,
    display: '35.2961314, 75.6395321',
  },
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=35.2961314,75.6395321',
  mapEmbedUrl: 'https://maps.google.com/maps?q=35.2961314,75.6395321&z=16&output=embed',
  rateNote: 'Contact us for current rates and availability.',
  inquiryDisclaimer: 'Availability and rates are confirmed by the guest house on WhatsApp.',
} as const;

/**
 * Reusable WhatsApp URL helper ensuring every CTA connects to https://wa.me/923109102221
 * with proper URL encoding.
 */
export function buildWhatsAppUrl(message: string): string {
  const encoded = encodeURIComponent(message.trim());
  return `${BUSINESS_INFO.whatsappBaseUrl}?text=${encoded}`;
}

/**
 * General booking prefilled WhatsApp URL:
 * “Hello Northlanders Guest House! I would like to ask about room availability and current rates.”
 */
export function getGeneralBookingWhatsAppUrl(): string {
  return buildWhatsAppUrl(
    'Hello Northlanders Guest House! I would like to ask about room availability and current rates.'
  );
}

/**
 * Stay inquiry form prefilled WhatsApp URL:
 * “Hello Northlanders Guest House! I would like to inquire about a stay.
 * Check-in: [selected date]
 * Check-out: [selected date]
 * Guests: [selected number]
 * Please share available rooms and current rates.”
 */
export function getStayInquiryWhatsAppUrl(params: {
  checkIn: string;
  checkOut: string;
  guests: number;
}): string {
  const message = `Hello Northlanders Guest House! I would like to inquire about a stay.
Check-in: ${params.checkIn}
Check-out: ${params.checkOut}
Guests: ${params.guests}
Please share available rooms and current rates.`;
  return buildWhatsAppUrl(message);
}

/**
 * Room preview inquiry prefilled WhatsApp URL including the specific preview identifier.
 */
export function getRoomInquiryWhatsAppUrl(roomIdentifier: string, photoId: string): string {
  const message = `Hello Northlanders Guest House! I would like to ask about ${roomIdentifier} (Ref: Photo ${photoId}). Please share current rates and availability.`;
  return buildWhatsAppUrl(message);
}

export interface PropertyPhoto {
  id: string;
  filename: string;
  src: string;
  publicPath: string;
  alt: string;
  caption: string;
  category: 'Exterior & Garden' | 'Rooms & Suites' | 'Winter & Evening';
  width: number;
  height: number;
  isOriginalDownload: boolean;
}

/**
 * Complete catalog of all 16 guest house photographs.
 */
export const PROPERTY_PHOTOS: PropertyPhoto[] = [
  {
    id: '836375437',
    filename: '836375437.jpg',
    src: img836375437,
    publicPath: '/images/836375437.jpg',
    alt: 'Outdoor garden seating under tall pine trees at Northlanders Guest House overlooking turquoise domes and Skardu mountains',
    caption: 'Garden lawn seating shaded by pine trees with views of Skardu peaks',
    category: 'Exterior & Garden',
    width: 1024,
    height: 768,
    isOriginalDownload: true,
  },
  {
    id: '902348432',
    filename: '902348432.jpg',
    src: img902348432,
    publicPath: '/images/902348432.jpg',
    alt: 'Daytime exterior of Northlanders Guest House with white staircase, balcony, and blooming daisies and roses in the garden',
    caption: 'Guest house facade and blooming summer flower garden',
    category: 'Exterior & Garden',
    width: 768,
    height: 1024,
    isOriginalDownload: false,
  },
  {
    id: '887379244',
    filename: '887379244.jpg',
    src: img887379244,
    publicPath: '/images/887379244.jpg',
    alt: 'Sunny green lawn with red roses, fruit trees, and white garden chairs at Northlanders Guest House',
    caption: 'Sunlit garden lawn with blooming red roses and outdoor seating',
    category: 'Exterior & Garden',
    width: 768,
    height: 1024,
    isOriginalDownload: false,
  },
  {
    id: '902347950',
    filename: '902347950.jpg',
    src: img902347950,
    publicPath: '/images/902347950.jpg',
    alt: 'Evening garden view at Northlanders Guest House with pink hollyhock flowers and lawn chairs under illuminated trees',
    caption: 'Tranquil evening atmosphere on the garden lawn',
    category: 'Winter & Evening',
    width: 768,
    height: 1024,
    isOriginalDownload: false,
  },
  {
    id: '766401241',
    filename: '766401241.jpg',
    src: img766401241,
    publicPath: '/images/766401241.jpg',
    alt: 'Nighttime exterior view of Northlanders Guest House illuminated by warm balcony lights behind stone walls and green trees',
    caption: 'Warm evening illumination across the stone terrace and balconies',
    category: 'Winter & Evening',
    width: 1024,
    height: 768,
    isOriginalDownload: true,
  },
  {
    id: '580440401',
    filename: '580440401.jpg',
    src: img580440401,
    publicPath: '/images/580440401.jpg',
    alt: 'Glowing garden lamp post surrounded by potted flowers and greenery with the Northlanders Guest House building at night',
    caption: 'Garden pathways and potted blooms illuminated at night',
    category: 'Winter & Evening',
    width: 576,
    height: 768,
    isOriginalDownload: true,
  },
  {
    id: '814442022',
    filename: '814442022.jpg',
    src: img814442022,
    publicPath: '/images/814442022.jpg',
    alt: 'Winter evening view of Northlanders Guest House framed by snow-dusted orchard branches',
    caption: 'Guest house exterior framed by snow-covered branches in winter',
    category: 'Winter & Evening',
    width: 576,
    height: 768,
    isOriginalDownload: true,
  },
  {
    id: '814441758',
    filename: '814441758.jpg',
    src: img814441758,
    publicPath: '/images/814441758.jpg',
    alt: 'Snow-blanketed garden lawn and outdoor chairs at Northlanders Guest House on a quiet winter night',
    caption: 'Peaceful snow-covered courtyard and garden seating in winter',
    category: 'Winter & Evening',
    width: 576,
    height: 768,
    isOriginalDownload: true,
  },
  {
    id: '719970613',
    filename: '719970613.jpg',
    src: img719970613,
    publicPath: '/images/719970613.jpg',
    alt: 'Guest suite interior featuring a dark upholstered bed, geometric yellow and grey rug, velvet bench, and patterned ceiling centerpiece',
    caption: 'Room Preview 01 — Suite with upholstered bed, seating bench, and adjoining lounge space',
    category: 'Rooms & Suites',
    width: 576,
    height: 768,
    isOriginalDownload: true,
  },
  {
    id: '719890294',
    filename: '719890294.jpg',
    src: img719890294,
    publicPath: '/images/719890294.jpg',
    alt: 'Alternate angle of guest suite showing illuminated wooden shelving divider, wardrobe wall, and bedroom area',
    caption: 'Room Preview 02 — Suite view from the lounge area toward the bedroom and shelving',
    category: 'Rooms & Suites',
    width: 576,
    height: 768,
    isOriginalDownload: true,
  },
  {
    id: '726800997',
    filename: '726800997.jpg',
    src: img726800997,
    publicPath: '/images/726800997.jpg',
    alt: 'Indoor sitting area with L-shaped sofa, patterned cushions, central ottoman, and decorative ceiling woodwork',
    caption: 'Room Preview 03 — Indoor lounge and sitting room with patterned rug and decorative ceiling',
    category: 'Rooms & Suites',
    width: 576,
    height: 768,
    isOriginalDownload: true,
  },
  {
    id: '574695684',
    filename: '574695684.jpg',
    src: img574695684,
    publicPath: '/images/574695684.jpg',
    alt: 'Cozy lounge seating area with tufted sectional sofa, embroidered cushions, upholstered ottoman, and full-length curtains',
    caption: 'Room Preview 04 — Tufted sectional seating area with traditional patterned cushions',
    category: 'Rooms & Suites',
    width: 576,
    height: 768,
    isOriginalDownload: true,
  },
  {
    id: '869593098',
    filename: '869593098.jpg',
    src: img869593098,
    publicPath: '/images/869593098.jpg',
    alt: 'Guest room featuring a light wood bed frame with decorative ironwork, white bedding, and warm gold curtains',
    caption: 'Room Preview 05 — Bright bedroom with wooden bed frame and warm drapery',
    category: 'Rooms & Suites',
    width: 768,
    height: 1024,
    isOriginalDownload: false,
  },
  {
    id: '850050153',
    filename: '850050153.jpg',
    src: img850050153,
    publicPath: '/images/850050153.jpg',
    alt: 'Spacious guest room with wooden bed, armchair, wooden side table, and full-height curtains',
    caption: 'Room Preview 06 — Guest room with wooden bed and private reading chair',
    category: 'Rooms & Suites',
    width: 768,
    height: 1024,
    isOriginalDownload: false,
  },
  {
    id: '844811595',
    filename: '844811595.jpg',
    src: img844811595,
    publicPath: '/images/844811595.jpg',
    alt: 'Guest room angle showing wooden double bed, bedside table, window, and pair of upholstered armchairs',
    caption: 'Room Preview 07 — Bedroom layout with double bed and paired armchairs',
    category: 'Rooms & Suites',
    width: 768,
    height: 1024,
    isOriginalDownload: false,
  },
  {
    id: '844811086',
    filename: '844811086.jpg',
    src: img844811086,
    publicPath: '/images/844811086.jpg',
    alt: 'Spacious room interior with two armchairs and coffee table in the foreground and wooden double bed in the background',
    caption: 'Room Preview 08 — Extended room layout with dedicated seating arrangement',
    category: 'Rooms & Suites',
    width: 768,
    height: 1024,
    isOriginalDownload: false,
  },
];

export interface RoomPreviewItem {
  id: string;
  previewLabel: string;
  title: string;
  subtitle: string;
  photo: PropertyPhoto;
}

export const ROOM_PREVIEWS: RoomPreviewItem[] = [
  {
    id: 'room-preview-1',
    previewLabel: 'Room Preview 01',
    title: 'Suite Interior & Bedroom',
    subtitle: 'Upholstered bed, footboard bench, and adjoining lounge space.',
    photo: PROPERTY_PHOTOS.find((p) => p.id === '719970613')!,
  },
  {
    id: 'room-preview-2',
    previewLabel: 'Room Preview 02',
    title: 'Suite Perspective & Storage',
    subtitle: 'Full-wall cabinetry, lighted display shelving, and sleeping area.',
    photo: PROPERTY_PHOTOS.find((p) => p.id === '719890294')!,
  },
  {
    id: 'room-preview-3',
    previewLabel: 'Room Preview 03',
    title: 'Indoor Sitting & Lounge Area',
    subtitle: 'L-shaped seating with patterned cushions and carved ceiling detail.',
    photo: PROPERTY_PHOTOS.find((p) => p.id === '726800997')!,
  },
  {
    id: 'room-preview-4',
    previewLabel: 'Room Preview 04',
    title: 'Tufted Sectional Seating Room',
    subtitle: 'Comfortable sectional sofa with embroidered pillows and center ottoman.',
    photo: PROPERTY_PHOTOS.find((p) => p.id === '574695684')!,
  },
  {
    id: 'room-preview-5',
    previewLabel: 'Room Preview 05',
    title: 'Timber Frame Guest Room',
    subtitle: 'Crafted wooden bed with ironwork detail and warm floor-to-ceiling curtains.',
    photo: PROPERTY_PHOTOS.find((p) => p.id === '869593098')!,
  },
  {
    id: 'room-preview-6',
    previewLabel: 'Room Preview 06',
    title: 'Guest Room with Seating Nook',
    subtitle: 'Clean wooden bed frame paired with an armchair and wooden side table.',
    photo: PROPERTY_PHOTOS.find((p) => p.id === '850050153')!,
  },
  {
    id: 'room-preview-7',
    previewLabel: 'Room Preview 07',
    title: 'Window-Side Guest Room',
    subtitle: 'Spacious tiled floor layout featuring a wooden bed and twin armchairs.',
    photo: PROPERTY_PHOTOS.find((p) => p.id === '844811595')!,
  },
  {
    id: 'room-preview-8',
    previewLabel: 'Room Preview 08',
    title: 'Extended Room with Lounge Table',
    subtitle: 'Generous room footprint combining a bed area with a two-chair coffee table set.',
    photo: PROPERTY_PHOTOS.find((p) => p.id === '844811086')!,
  },
];
