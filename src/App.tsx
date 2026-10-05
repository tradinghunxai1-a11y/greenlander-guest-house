/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin,
  Phone,
  ArrowRight,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  Navigation,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
} from 'lucide-react';
import {
  BUSINESS_INFO,
  PROPERTY_PHOTOS,
  ROOM_PREVIEWS,
  PropertyPhoto,
  getGeneralBookingWhatsAppUrl,
  getStayInquiryWhatsAppUrl,
  getRoomInquiryWhatsAppUrl,
} from './data';

/**
 * Helper to return the visitor's local calendar date formatted as YYYY-MM-DD.
 */
function getLocalDateString(offsetDays = 0): string {
  const now = new Date();
  now.setDate(now.getDate() + offsetDays);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function App() {
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const mobileMenuBtnRef = useRef<HTMLButtonElement>(null);
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null);

  // Stay inquiry form state
  const [todayLocal, setTodayLocal] = useState<string>(() => getLocalDateString(0));
  const [checkIn, setCheckIn] = useState<string>(() => getLocalDateString(1));
  const [checkOut, setCheckOut] = useState<string>(() => getLocalDateString(3));
  const [guests, setGuests] = useState<string>('2');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccessUrl, setFormSuccessUrl] = useState<string | null>(null);

  // Gallery filter & Lightbox state
  const [galleryCategory, setGalleryCategory] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightboxCloseBtnRef = useRef<HTMLButtonElement>(null);
  const touchStartXRef = useRef<number | null>(null);

  // Keep todayLocal fresh
  useEffect(() => {
    setTodayLocal(getLocalDateString(0));
  }, []);

  // Sticky header background transition on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Escape key and focus for Mobile Menu
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        mobileMenuBtnRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    setTimeout(() => firstMobileLinkRef.current?.focus(), 50);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const filteredGalleryPhotos =
    galleryCategory === 'All'
      ? PROPERTY_PHOTOS
      : PROPERTY_PHOTOS.filter((photo) => photo.category === galleryCategory);

  const openLightboxByPhotoId = useCallback((photoId: string) => {
    const idx = PROPERTY_PHOTOS.findIndex((p) => p.id === photoId);
    if (idx !== -1) {
      setLightboxIndex(idx);
    }
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const showPrevPhoto = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? null : (prev - 1 + PROPERTY_PHOTOS.length) % PROPERTY_PHOTOS.length
    );
  }, []);

  const showNextPhoto = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? null : (prev + 1) % PROPERTY_PHOTOS.length
    );
  }, []);

  // Keyboard navigation & scroll lock for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        showPrevPhoto();
      } else if (e.key === 'ArrowRight') {
        showNextPhoto();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    setTimeout(() => lightboxCloseBtnRef.current?.focus(), 50);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxIndex, closeLightbox, showPrevPhoto, showNextPhoto]);

  // Validate stay inquiry form using visitor's local calendar date
  const validateStayForm = (): { valid: boolean; error?: string; parsedGuests?: number } => {
    const currentLocalToday = getLocalDateString(0);

    if (!checkIn) {
      return { valid: false, error: 'Please select a check-in date.' };
    }
    if (checkIn < currentLocalToday) {
      return {
        valid: false,
        error: `Check-in date cannot be in the past (today is ${currentLocalToday}).`,
      };
    }
    if (!checkOut) {
      return { valid: false, error: 'Please select a check-out date.' };
    }
    if (checkOut <= checkIn) {
      return {
        valid: false,
        error: 'Check-out date must be after the check-in date.',
      };
    }

    const parsedGuests = Number(guests);
    if (!Number.isInteger(parsedGuests) || parsedGuests < 1) {
      return {
        valid: false,
        error: 'Number of guests must be a positive whole number (1 or more).',
      };
    }

    return { valid: true, parsedGuests };
  };

  const handleStayInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccessUrl(null);

    const validation = validateStayForm();
    if (!validation.valid || !validation.parsedGuests) {
      setFormError(validation.error || 'Please check your inquiry details.');
      return;
    }

    const whatsappUrl = getStayInquiryWhatsAppUrl({
      checkIn,
      checkOut,
      guests: validation.parsedGuests,
    });

    setFormSuccessUrl(whatsappUrl);

    // Navigate using an anchor click so it works cleanly in all browsers and iframe environments
    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Hero & About section specific real photographs
  const heroPhoto = PROPERTY_PHOTOS.find((p) => p.id === '836375437')!;
  const diamondTopPhoto = PROPERTY_PHOTOS.find((p) => p.id === '902348432')!;
  const diamondRightPhoto = PROPERTY_PHOTOS.find((p) => p.id === '887379244')!;
  const diamondBottomPhoto = PROPERTY_PHOTOS.find((p) => p.id === '766401241')!;
  const finalCtaPhoto = PROPERTY_PHOTOS.find((p) => p.id === '814441758')!;

  const activeLightboxPhoto: PropertyPhoto | null =
    lightboxIndex !== null ? PROPERTY_PHOTOS[lightboxIndex] : null;

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Rooms', href: '#rooms' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Location', href: '#location' },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#0F1713] text-[#F4F1EA] flex flex-col selection:bg-[#E2B857] selection:text-[#0F1713]">
      {/* 1. STICKY HEADER (Strict 3-Zone Top Bar Contract) */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-200 ${
          isScrolled || mobileMenuOpen
            ? 'bg-[#0F1713]/95 backdrop-blur-md border-b border-[#26382E] shadow-lg'
            : 'bg-gradient-to-b from-[#0F1713]/90 via-[#0F1713]/60 to-transparent border-b border-white/10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Zone 1: Single text element brand identity */}
          <a
            href="#home"
            className="font-display text-xl sm:text-2xl font-semibold tracking-wider text-[#F4F1EA] hover:text-[#E2B857] transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E2B857]"
          >
            NORTHLANDERS GUEST HOUSE
          </a>

          {/* Zone 2: Desktop Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-7 lg:gap-9 text-sm font-medium text-[#D5D1C8]"
          >
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="py-1 hover:text-[#E2B857] transition-colors whitespace-nowrap relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#E2B857] hover:after:w-full after:transition-all focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E2B857]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Zone 3: Primary Action & Mobile Menu Trigger */}
          <div className="flex items-center gap-3">
            <a
              href={getGeneralBookingWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E2B857] hover:bg-[#eabfff] hover:bg-[#ebd089] text-[#0F1713] font-semibold text-xs sm:text-sm tracking-wide transition-transform duration-150 active:scale-[0.98] whitespace-nowrap shrink-0 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2B857]"
            >
              <span>Book on WhatsApp</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>

            <button
              ref={mobileMenuBtnRef}
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-menu"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-full border border-[#26382E] bg-[#16211B]/90 text-[#F4F1EA] hover:border-[#E2B857] hover:text-[#E2B857] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2B857]"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav
            id="mobile-navigation-menu"
            aria-label="Mobile Navigation"
            className="md:hidden bg-[#0F1713] border-b border-[#26382E] px-4 pt-3 pb-6 shadow-2xl"
          >
            <ul className="flex flex-col space-y-1">
              {navLinks.map((item, idx) => (
                <li key={item.href}>
                  <a
                    ref={idx === 0 ? firstMobileLinkRef : undefined}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg text-base font-medium text-[#F4F1EA] hover:bg-[#16211B] hover:text-[#E2B857] transition-colors focus-visible:outline-2 focus-visible:outline-[#E2B857]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-[#26382E] flex flex-col gap-3">
              <a
                href={getGeneralBookingWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#E2B857] hover:bg-[#ebd089] text-[#0F1713] font-semibold text-sm transition-colors whitespace-nowrap"
              >
                <span>Book on WhatsApp</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href={BUSINESS_INFO.phoneHref}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#26382E] bg-[#16211B] text-[#F4F1EA] hover:border-[#E2B857] text-sm font-medium transition-colors whitespace-nowrap"
              >
                <Phone className="w-4 h-4 text-[#E2B857]" aria-hidden="true" />
                <span>Call {BUSINESS_INFO.phoneDisplay}</span>
              </a>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-grow">
        {/* 2. HERO SECTION */}
        <section
          id="home"
          className="relative min-h-[90vh] lg:min-h-[92vh] pt-28 pb-16 lg:pb-24 flex items-center overflow-hidden border-b border-[#26382E]"
        >
          {/* Full-bleed real property photograph with multi-layered dark forest scrim */}
          <div className="absolute inset-0 z-0 bg-[#0F1713]">
            <img
              src={heroPhoto.src}
              alt={heroPhoto.alt}
              width={heroPhoto.width}
              height={heroPhoto.height}
              fetchPriority="high"
              decoding="async"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center scale-100 lg:scale-105 transition-transform duration-1000 opacity-55 lg:opacity-65"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-[#0F1713] via-[#0F1713]/85 to-[#0F1713]/45"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#0F1713] via-transparent to-[#0F1713]/60"
              aria-hidden="true"
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Editorial Headline & Primary Actions (matching reference layout) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 text-xs sm:text-sm tracking-widest uppercase text-[#E2B857] font-medium">
                  <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{BUSINESS_INFO.location}</span>
                </div>

                <h1 className="font-display text-4xl sm:text-6xl lg:text-[4.25rem] font-semibold leading-[1.08] tracking-tight text-[#F4F1EA] text-balance">
                  Your Skardu Escape Starts Here.
                </h1>

                <p className="text-base sm:text-lg lg:text-xl text-[#D5D1C8] max-w-xl leading-relaxed font-normal">
                  Discover Northlanders Guest House and plan your stay in the heart of Gilgit-Baltistan.
                </p>

                {/* Quiet unboxed property highlights with typographic separators */}
                <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-[#B8B4AA]">
                  <span>Karphotok, Kargrong</span>
                  <span aria-hidden="true" className="text-[#E2B857]">·</span>
                  <span>Near Girls High School Skardu</span>
                  <span aria-hidden="true" className="text-[#E2B857]">·</span>
                  <span>Direct WhatsApp Inquiry</span>
                </div>

                {/* Primary & Secondary CTAs */}
                <div className="pt-3 flex flex-col sm:flex-row sm:items-center gap-4">
                  <a
                    href={getGeneralBookingWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 px-7 py-4 rounded-xl bg-[#E2B857] hover:bg-[#ebd089] text-[#0F1713] font-semibold text-base tracking-wide transition-all duration-150 shadow-lg hover:shadow-xl active:scale-[0.99] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2B857]"
                  >
                    <span>Book Your Stay</span>
                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </a>

                  <a
                    href="#rooms"
                    className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl border border-[#E2B857]/50 bg-[#16211B]/80 hover:bg-[#1E2D24] hover:border-[#E2B857] text-[#F4F1EA] font-medium text-base transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2B857]"
                  >
                    <span>Explore Rooms</span>
                  </a>
                </div>

                {/* Rate transparency note matching reference placement */}
                <p className="pt-2 text-xs sm:text-sm text-[#A5A198] italic">
                  {BUSINESS_INFO.rateNote}
                </p>
              </div>

              {/* Right Column: Framed Property Feature Card */}
              <div className="lg:col-span-5">
                <div className="relative rounded-2xl overflow-hidden border border-[#E2B857]/30 bg-[#15201B]/90 shadow-2xl">
                  <div className="aspect-[4/3] w-full overflow-hidden bg-[#15201B]">
                    <img
                      src={heroPhoto.src}
                      alt={heroPhoto.alt}
                      width={heroPhoto.width}
                      height={heroPhoto.height}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="p-5 sm:p-6 bg-[#141F1A] border-t border-[#26382E] flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[#E2B857] font-medium">
                        {BUSINESS_INFO.name}
                      </p>
                      <p className="text-sm text-[#D5D1C8] mt-1">
                        Garden lawn &amp; mountain views in Skardu
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openLightboxByPhotoId(heroPhoto.id)}
                      aria-label="Open hero photograph in gallery lightbox"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#26382E] hover:border-[#E2B857] text-xs font-medium text-[#F4F1EA] hover:text-[#E2B857] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#E2B857]"
                    >
                      <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>View Photo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. STAY INQUIRY PANEL */}
        <section
          id="inquiry"
          aria-labelledby="stay-inquiry-heading"
          className="relative z-20 -mt-8 sm:-mt-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="rounded-2xl bg-[#15201B] border border-[#E2B857]/35 shadow-2xl p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#26382E]">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase tracking-[0.2em] text-[#E2B857] font-semibold">
                    Direct Stay Inquiry
                  </span>
                  <span className="w-8 h-[1px] bg-[#E2B857]/60" aria-hidden="true" />
                </div>
                <h2
                  id="stay-inquiry-heading"
                  className="font-display text-2xl sm:text-3xl font-semibold text-[#F4F1EA] mt-1"
                >
                  Plan Your Dates in Skardu
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#B8B4AA]">
                {BUSINESS_INFO.inquiryDisclaimer}
              </p>
            </div>

            <form onSubmit={handleStayInquirySubmit} noValidate className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
                {/* Check-in Date */}
                <div>
                  <label
                    htmlFor="check-in-date"
                    className="block text-xs uppercase tracking-wider text-[#D5D1C8] font-medium mb-2"
                  >
                    Check-in Date
                  </label>
                  <div className="relative">
                    <input
                      id="check-in-date"
                      name="checkIn"
                      type="date"
                      required
                      min={todayLocal}
                      value={checkIn}
                      onChange={(e) => {
                        const newCheckIn = e.target.value;
                        setCheckIn(newCheckIn);
                        setFormError(null);
                        if (checkOut && newCheckIn >= checkOut) {
                          const nextDay = new Date(newCheckIn + 'T00:00:00');
                          if (!isNaN(nextDay.getTime())) {
                            nextDay.setDate(nextDay.getDate() + 1);
                            const y = nextDay.getFullYear();
                            const m = String(nextDay.getMonth() + 1).padStart(2, '0');
                            const d = String(nextDay.getDate()).padStart(2, '0');
                            setCheckOut(`${y}-${m}-${d}`);
                          }
                        }
                      }}
                      className="w-full h-12 px-4 rounded-xl bg-[#0F1713] border border-[#2C4035] text-[#F4F1EA] text-sm font-medium focus:border-[#E2B857] focus:outline-none focus:ring-1 focus:ring-[#E2B857] tabular-nums"
                    />
                  </div>
                </div>

                {/* Check-out Date */}
                <div>
                  <label
                    htmlFor="check-out-date"
                    className="block text-xs uppercase tracking-wider text-[#D5D1C8] font-medium mb-2"
                  >
                    Check-out Date
                  </label>
                  <div className="relative">
                    <input
                      id="check-out-date"
                      name="checkOut"
                      type="date"
                      required
                      min={checkIn || todayLocal}
                      value={checkOut}
                      onChange={(e) => {
                        setCheckOut(e.target.value);
                        setFormError(null);
                      }}
                      className="w-full h-12 px-4 rounded-xl bg-[#0F1713] border border-[#2C4035] text-[#F4F1EA] text-sm font-medium focus:border-[#E2B857] focus:outline-none focus:ring-1 focus:ring-[#E2B857] tabular-nums"
                    />
                  </div>
                </div>

                {/* Number of Guests */}
                <div>
                  <label
                    htmlFor="guests-count"
                    className="block text-xs uppercase tracking-wider text-[#D5D1C8] font-medium mb-2"
                  >
                    Number of Guests
                  </label>
                  <div className="relative flex items-center">
                    <Users
                      className="w-4 h-4 text-[#E2B857] absolute left-4 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      id="guests-count"
                      name="guests"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={30}
                      step={1}
                      required
                      value={guests}
                      onChange={(e) => {
                        setGuests(e.target.value);
                        setFormError(null);
                      }}
                      className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#0F1713] border border-[#2C4035] text-[#F4F1EA] text-sm font-medium focus:border-[#E2B857] focus:outline-none focus:ring-1 focus:ring-[#E2B857] tabular-nums"
                    />
                  </div>
                </div>

                {/* Submit CTA */}
                <div>
                  <button
                    type="submit"
                    className="w-full h-12 px-5 rounded-xl bg-[#E2B857] hover:bg-[#ebd089] text-[#0F1713] font-semibold text-sm tracking-wide inline-flex items-center justify-center gap-2 transition-all duration-150 shadow-md active:scale-[0.99] whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2B857]"
                  >
                    <span>Check Availability on WhatsApp</span>
                    <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Validation Error or Confirmation Feedback */}
              {formError && (
                <div
                  role="alert"
                  className="mt-4 p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs sm:text-sm flex items-center gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccessUrl && !formError && (
                <div
                  role="status"
                  className="mt-4 p-3.5 rounded-xl bg-[#1A2B22] border border-[#E2B857]/40 text-[#F4F1EA] text-xs sm:text-sm flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#E2B857] shrink-0" aria-hidden="true" />
                    <span>
                      Your inquiry for check-in <strong>{checkIn}</strong>, check-out{' '}
                      <strong>{checkOut}</strong> ({guests}{' '}
                      {Number(guests) === 1 ? 'guest' : 'guests'}) is ready on WhatsApp.
                    </span>
                  </div>
                  <a
                    href={formSuccessUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E2B857] underline hover:text-[#ebd089] font-medium whitespace-nowrap"
                  >
                    Open WhatsApp link directly →
                  </a>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#A5A198]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#E2B857]" aria-hidden="true" />
                  <span>{BUSINESS_INFO.inquiryDisclaimer}</span>
                </span>
                <span>{BUSINESS_INFO.rateNote}</span>
              </div>
            </form>
          </div>
        </section>

        {/* 4. ABOUT SECTION (With Reference-Inspired Diamond Photo Composition) */}
        <section
          id="about"
          aria-labelledby="about-heading"
          className="py-20 sm:py-28 lg:py-32 bg-topographic overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Hospitality Narrative & Verified Property Details */}
              <div className="lg:col-span-6 space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-xs uppercase tracking-[0.22em] text-[#E2B857] font-semibold">
                    Welcome to Skardu
                  </span>
                  <span className="w-12 h-[1px] bg-[#E2B857]/60" aria-hidden="true" />
                </div>

                <h2
                  id="about-heading"
                  className="font-display text-3xl sm:text-5xl font-semibold text-[#F4F1EA] leading-[1.12] text-balance"
                >
                  A Peaceful Haven in the Heart of Gilgit-Baltistan
                </h2>

                <p className="text-base sm:text-lg text-[#D5D1C8] leading-relaxed">
                  Situated at{' '}
                  <strong className="font-medium text-[#F4F1EA]">
                    {BUSINESS_INFO.address}
                  </strong>
                  , {BUSINESS_INFO.name} welcomes travelers seeking a calm setting surrounded by
                  trees, seasonal blossoms, and views of the Skardu mountains.
                </p>

                <p className="text-sm sm:text-base text-[#B8B4AA] leading-relaxed">
                  Whether you are spending a quiet afternoon on the sunlit lawn under the pines,
                  returning from exploring the valleys of Gilgit-Baltistan, or relaxing indoors in
                  our comfortable guest rooms and sitting areas, our team is ready to assist you
                  personally with your stay arrangements.
                </p>

                {/* Verified Property Highlights Grid (matching reference 2-column feature layout) */}
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 border-t border-[#26382E]">
                  <div className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#E2B857] mt-2 shrink-0" aria-hidden="true" />
                    <div>
                      <h3 className="font-sans text-sm font-semibold text-[#F4F1EA]">
                        Garden &amp; Outdoor Seating
                      </h3>
                      <p className="text-xs text-[#A5A198] mt-0.5">
                        Green lawn shaded by pine and orchard trees
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#E2B857] mt-2 shrink-0" aria-hidden="true" />
                    <div>
                      <h3 className="font-sans text-sm font-semibold text-[#F4F1EA]">
                        Comfortable Guest Rooms
                      </h3>
                      <p className="text-xs text-[#A5A198] mt-0.5">
                        Furnished bedrooms and indoor lounge seating areas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#E2B857] mt-2 shrink-0" aria-hidden="true" />
                    <div>
                      <h3 className="font-sans text-sm font-semibold text-[#F4F1EA]">
                        Karphotok, Skardu Location
                      </h3>
                      <p className="text-xs text-[#A5A198] mt-0.5">
                        Located near Girls High School Skardu, Kargrong
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#E2B857] mt-2 shrink-0" aria-hidden="true" />
                    <div>
                      <h3 className="font-sans text-sm font-semibold text-[#F4F1EA]">
                        Direct Host Communication
                      </h3>
                      <p className="text-xs text-[#A5A198] mt-0.5">
                        Confirm dates and current rates directly on WhatsApp
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <a
                    href="#rooms"
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl border border-[#E2B857]/60 text-[#F4F1EA] hover:bg-[#E2B857] hover:text-[#0F1713] text-sm font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#E2B857]"
                  >
                    <span>Explore Our Rooms</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </a>
                  <a
                    href={getGeneralBookingWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-medium text-[#E2B857] hover:text-[#ebd089] transition-colors whitespace-nowrap"
                  >
                    <span>Inquire on WhatsApp →</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Diamond Photographic Composition (Reference Signature Detail) */}
              <div className="lg:col-span-6">
                {/* Desktop / Tablet Elaborate Diamond Collage (lg and up) */}
                <div className="hidden lg:block relative w-full h-[540px] max-w-[540px] mx-auto select-none">
                  {/* Top-Left Large Diamond */}
                  <button
                    type="button"
                    onClick={() => openLightboxByPhotoId(diamondTopPhoto.id)}
                    aria-label={`View ${diamondTopPhoto.caption} in lightbox`}
                    className="group absolute top-[35px] left-[45px] w-[240px] h-[240px] rotate-45 overflow-hidden rounded-2xl border-2 border-[#E2B857]/40 bg-[#15201B] shadow-2xl cursor-pointer focus-visible:outline-2 focus-visible:outline-[#E2B857] z-10"
                  >
                    <img
                      src={diamondTopPhoto.src}
                      alt={diamondTopPhoto.alt}
                      width={diamondTopPhoto.width}
                      height={diamondTopPhoto.height}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover -rotate-45 scale-[1.45] group-hover:scale-[1.52] transition-transform duration-500"
                    />
                  </button>

                  {/* Right Medium Diamond */}
                  <button
                    type="button"
                    onClick={() => openLightboxByPhotoId(diamondRightPhoto.id)}
                    aria-label={`View ${diamondRightPhoto.caption} in lightbox`}
                    className="group absolute top-[145px] right-[35px] w-[215px] h-[215px] rotate-45 overflow-hidden rounded-2xl border-2 border-[#E2B857]/40 bg-[#15201B] shadow-2xl cursor-pointer focus-visible:outline-2 focus-visible:outline-[#E2B857] z-10"
                  >
                    <img
                      src={diamondRightPhoto.src}
                      alt={diamondRightPhoto.alt}
                      width={diamondRightPhoto.width}
                      height={diamondRightPhoto.height}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover -rotate-45 scale-[1.45] group-hover:scale-[1.52] transition-transform duration-500"
                    />
                  </button>

                  {/* Bottom Diamond */}
                  <button
                    type="button"
                    onClick={() => openLightboxByPhotoId(diamondBottomPhoto.id)}
                    aria-label={`View ${diamondBottomPhoto.caption} in lightbox`}
                    className="group absolute bottom-[35px] left-[125px] w-[195px] h-[195px] rotate-45 overflow-hidden rounded-2xl border-2 border-[#E2B857]/40 bg-[#15201B] shadow-2xl cursor-pointer focus-visible:outline-2 focus-visible:outline-[#E2B857] z-10"
                  >
                    <img
                      src={diamondBottomPhoto.src}
                      alt={diamondBottomPhoto.alt}
                      width={diamondBottomPhoto.width}
                      height={diamondBottomPhoto.height}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover -rotate-45 scale-[1.45] group-hover:scale-[1.52] transition-transform duration-500"
                    />
                  </button>

                  {/* Center Gold Emblem Crest (Matching Reference Center Diamond) */}
                  <div
                    aria-hidden="true"
                    className="absolute top-[225px] left-[220px] w-[68px] h-[68px] rotate-45 rounded-xl bg-[#0F1713] border border-[#E2B857] shadow-2xl flex items-center justify-center z-20"
                  >
                    <svg
                      viewBox="0 0 36 36"
                      className="w-8 h-8 -rotate-45 text-[#E2B857]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path d="M18 4L29 26H7L18 4Z" strokeLinejoin="round" />
                      <path d="M18 11L25 26H11L18 11Z" strokeLinejoin="round" opacity="0.6" />
                      <line x1="18" y1="9" x2="18" y2="31" />
                    </svg>
                  </div>
                </div>

                {/* Mobile & Tablet Adapted Composition (Zero horizontal overflow, readable & balanced) */}
                <div className="lg:hidden grid grid-cols-2 gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => openLightboxByPhotoId(diamondTopPhoto.id)}
                    className="col-span-2 relative aspect-[16/10] rounded-2xl overflow-hidden border border-[#E2B857]/35 bg-[#15201B] text-left group"
                  >
                    <img
                      src={diamondTopPhoto.src}
                      alt={diamondTopPhoto.alt}
                      width={diamondTopPhoto.width}
                      height={diamondTopPhoto.height}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F1713]/80 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3.5 right-3.5 text-xs text-[#F4F1EA] font-medium">
                      {diamondTopPhoto.caption}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openLightboxByPhotoId(diamondRightPhoto.id)}
                    className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#E2B857]/35 bg-[#15201B] text-left group"
                  >
                    <img
                      src={diamondRightPhoto.src}
                      alt={diamondRightPhoto.alt}
                      width={diamondRightPhoto.width}
                      height={diamondRightPhoto.height}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F1713]/80 via-transparent to-transparent" />
                    <span className="absolute bottom-2.5 left-3 right-3 text-[11px] text-[#F4F1EA] font-medium line-clamp-1">
                      Sunlit Garden Lawn
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openLightboxByPhotoId(diamondBottomPhoto.id)}
                    className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#E2B857]/35 bg-[#15201B] text-left group"
                  >
                    <img
                      src={diamondBottomPhoto.src}
                      alt={diamondBottomPhoto.alt}
                      width={diamondBottomPhoto.width}
                      height={diamondBottomPhoto.height}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F1713]/80 via-transparent to-transparent" />
                    <span className="absolute bottom-2.5 left-3 right-3 text-[11px] text-[#F4F1EA] font-medium line-clamp-1">
                      Evening Exterior View
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. ROOMS SECTION */}
        <section
          id="rooms"
          aria-labelledby="rooms-heading"
          className="py-20 sm:py-28 bg-[#121C17] border-y border-[#26382E]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-xs uppercase tracking-[0.22em] text-[#E2B857] font-semibold">
                    Accommodations
                  </span>
                  <span className="w-12 h-[1px] bg-[#E2B857]/60" aria-hidden="true" />
                </div>
                <h2
                  id="rooms-heading"
                  className="font-display text-3xl sm:text-5xl font-semibold text-[#F4F1EA]"
                >
                  Explore Our Rooms
                </h2>
                <p className="text-sm sm:text-base text-[#B8B4AA] max-w-2xl">
                  Browse actual interior photographs of our guest rooms, suites, and indoor lounge
                  spaces at {BUSINESS_INFO.name}.
                </p>
              </div>

              <div className="bg-[#16231C] border border-[#E2B857]/30 rounded-xl px-5 py-3.5 shrink-0">
                <p className="text-xs uppercase tracking-wider text-[#E2B857] font-semibold">
                  Rates &amp; Availability
                </p>
                <p className="text-sm text-[#F4F1EA] mt-0.5 font-medium">
                  {BUSINESS_INFO.rateNote}
                </p>
              </div>
            </div>

            {/* Room Previews Grid (All 8 interior room photographs) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {ROOM_PREVIEWS.map((room) => (
                <article
                  key={room.id}
                  className="rounded-2xl bg-[#16221C] border border-[#26382E] hover:border-[#E2B857]/50 transition-colors overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Image container with aspect ratio to prevent layout shift */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0F1713]">
                      <img
                        src={room.photo.src}
                        alt={room.photo.alt}
                        width={room.photo.width}
                        height={room.photo.height}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        type="button"
                        onClick={() => openLightboxByPhotoId(room.photo.id)}
                        aria-label={`Inspect ${room.previewLabel} full photograph`}
                        className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-[#0F1713]/80 hover:bg-[#0F1713] text-[#F4F1EA] hover:text-[#E2B857] border border-white/15 flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#E2B857]"
                      >
                        <Maximize2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-[#E2B857] font-medium">
                        <span>{room.previewLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#A5A198] tabular-nums">Ref #{room.photo.id}</span>
                      </div>
                      <h3 className="font-display text-xl font-semibold text-[#F4F1EA] mt-1.5">
                        {room.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#B8B4AA] mt-2 leading-relaxed">
                        {room.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-[#23332A] flex flex-col gap-3">
                    <p className="text-[11px] text-[#A5A198]">
                      {BUSINESS_INFO.rateNote}
                    </p>
                    <a
                      href={getRoomInquiryWhatsAppUrl(
                        `${room.previewLabel} (${room.title})`,
                        room.photo.id
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-[#1E2E26] hover:bg-[#E2B857] text-[#F4F1EA] hover:text-[#0F1713] border border-[#E2B857]/40 font-semibold text-xs tracking-wide inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#E2B857]"
                    >
                      <span>Ask About This Room</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 6. GALLERY SECTION (All 16 Photographs + Accessible Lightbox) */}
        <section
          id="gallery"
          aria-labelledby="gallery-heading"
          className="py-20 sm:py-28 bg-[#0F1713]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-xs uppercase tracking-[0.22em] text-[#E2B857] font-semibold">
                    Property Gallery
                  </span>
                  <span className="w-12 h-[1px] bg-[#E2B857]/60" aria-hidden="true" />
                </div>
                <h2
                  id="gallery-heading"
                  className="font-display text-3xl sm:text-5xl font-semibold text-[#F4F1EA]"
                >
                  All 16 Property Photographs
                </h2>
                <p className="text-sm sm:text-base text-[#B8B4AA] max-w-2xl">
                  Explore daytime gardens, mountain backdrops, winter snowfalls, and guest room
                  interiors at {BUSINESS_INFO.name}. Select any photograph to view full size.
                </p>
              </div>

              {/* Interactive Category Filter Controls */}
              <div
                role="group"
                aria-label="Filter gallery photographs by category"
                className="inline-flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-[#15201B] border border-[#26382E] self-start md:self-auto"
              >
                {(['All', 'Exterior & Garden', 'Rooms & Suites', 'Winter & Evening'] as const).map(
                  (cat) => {
                    const active = galleryCategory === cat;
                    const count =
                      cat === 'All'
                        ? PROPERTY_PHOTOS.length
                        : PROPERTY_PHOTOS.filter((p) => p.category === cat).length;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setGalleryCategory(cat)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                          active
                            ? 'bg-[#E2B857] text-[#0F1713] font-semibold shadow-sm'
                            : 'text-[#D5D1C8] hover:text-[#F4F1EA] hover:bg-[#1E2D24]'
                        }`}
                      >
                        {cat} ({count})
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Responsive 16-Photo Grid with Fixed Aspect Ratio Containers (Zero Layout Shift) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredGalleryPhotos.map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => openLightboxByPhotoId(photo.id)}
                  aria-label={`Open photo ${index + 1}: ${photo.caption}`}
                  className="group relative rounded-2xl overflow-hidden bg-[#15201B] border border-[#26382E] hover:border-[#E2B857]/60 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2B857] cursor-pointer"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-[#15201B]">
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      width={photo.width}
                      height={photo.height}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3.5 bg-[#141F1A] border-t border-[#23332A] flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#F4F1EA] truncate">
                        {photo.caption}
                      </p>
                      <p className="text-[11px] text-[#A5A198] mt-0.5 tabular-nums">
                        {photo.category} · #{photo.id}
                      </p>
                    </div>
                    <Maximize2
                      className="w-4 h-4 text-[#E2B857] shrink-0 opacity-80 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 7. LOCATION SECTION */}
        <section
          id="location"
          aria-labelledby="location-heading"
          className="py-20 sm:py-28 bg-[#121C17] border-t border-[#26382E]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              {/* Left Column: Address, Coordinates & Direct Contact Actions */}
              <div className="lg:col-span-5 space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-xs uppercase tracking-[0.22em] text-[#E2B857] font-semibold">
                    Location &amp; Directions
                  </span>
                  <span className="w-12 h-[1px] bg-[#E2B857]/60" aria-hidden="true" />
                </div>

                <h2
                  id="location-heading"
                  className="font-display text-3xl sm:text-5xl font-semibold text-[#F4F1EA] text-balance"
                >
                  Find Us in Skardu
                </h2>

                <p className="text-sm sm:text-base text-[#D5D1C8] leading-relaxed">
                  {BUSINESS_INFO.name} is located in Karphotok near Girls High School Skardu,
                  Kargrong. Use the interactive map or open turn-by-turn directions directly in
                  Google Maps.
                </p>

                <div className="rounded-2xl bg-[#16221C] border border-[#26382E] p-6 space-y-5">
                  <div className="flex items-start gap-3.5">
                    <MapPin className="w-5 h-5 text-[#E2B857] mt-0.5 shrink-0" aria-hidden="true" />
                    <div>
                      <h3 className="font-sans text-xs uppercase tracking-wider text-[#A5A198] font-semibold">
                        Property Address
                      </h3>
                      <p className="text-sm sm:text-base text-[#F4F1EA] font-medium mt-1">
                        {BUSINESS_INFO.address}
                      </p>
                      <p className="text-xs text-[#B8B4AA] mt-0.5">
                        {BUSINESS_INFO.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 pt-4 border-t border-[#23332A]">
                    <Navigation
                      className="w-5 h-5 text-[#E2B857] mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="font-sans text-xs uppercase tracking-wider text-[#A5A198] font-semibold">
                        GPS Coordinates
                      </h3>
                      <p className="text-sm text-[#F4F1EA] font-mono tabular-nums mt-1">
                        {BUSINESS_INFO.coordinates.display}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 pt-4 border-t border-[#23332A]">
                    <Phone className="w-5 h-5 text-[#E2B857] mt-0.5 shrink-0" aria-hidden="true" />
                    <div>
                      <h3 className="font-sans text-xs uppercase tracking-wider text-[#A5A198] font-semibold">
                        Phone &amp; WhatsApp
                      </h3>
                      <a
                        href={BUSINESS_INFO.phoneHref}
                        className="inline-block text-sm sm:text-base text-[#F4F1EA] hover:text-[#E2B857] font-medium mt-1 tabular-nums transition-colors"
                      >
                        {BUSINESS_INFO.phoneDisplay}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Directions, Call, WhatsApp */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
                  <a
                    href={BUSINESS_INFO.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#E2B857] hover:bg-[#ebd089] text-[#0F1713] font-semibold text-sm transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#E2B857]"
                  >
                    <Navigation className="w-4 h-4" aria-hidden="true" />
                    <span>Get Directions</span>
                  </a>

                  <a
                    href={BUSINESS_INFO.phoneHref}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-[#2C4035] bg-[#16221C] hover:border-[#E2B857] text-[#F4F1EA] font-medium text-sm transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#E2B857]"
                  >
                    <Phone className="w-4 h-4 text-[#E2B857]" aria-hidden="true" />
                    <span>Call Guest House</span>
                  </a>

                  <a
                    href={getGeneralBookingWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-[#E2B857]/40 bg-[#1A2821] hover:bg-[#22342B] text-[#E2B857] font-medium text-sm transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[#E2B857]"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    <span>Message on WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Responsive Google Maps Embed Centered on 35.2961314, 75.6395321 */}
              <div className="lg:col-span-7">
                <div className="rounded-2xl overflow-hidden border border-[#E2B857]/30 bg-[#16221C] shadow-2xl">
                  <div className="aspect-[16/11] w-full relative">
                    <iframe
                      title="Northlanders Guest House Skardu Google Map Location"
                      src={BUSINESS_INFO.mapEmbedUrl}
                      width="100%"
                      height="100%"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  </div>
                  <div className="px-5 py-3.5 bg-[#141F1A] border-t border-[#26382E] flex flex-wrap items-center justify-between gap-2 text-xs text-[#B8B4AA]">
                    <span>Karphotok near Girls High School Skardu, Kargrong, Skardu</span>
                    <a
                      href={BUSINESS_INFO.directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#E2B857] hover:underline font-medium whitespace-nowrap"
                    >
                      Open in Google Maps →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. FINAL BOOKING SECTION (Closely following the Reference Bottom Card Layout) */}
        <section
          aria-labelledby="final-cta-heading"
          className="relative py-24 sm:py-32 overflow-hidden border-t border-[#26382E]"
        >
          {/* Background Real Property Photo with Dark Forest Overlay */}
          <div className="absolute inset-0 z-0 bg-[#0F1713]">
            <img
              src={finalCtaPhoto.src}
              alt={finalCtaPhoto.alt}
              width={finalCtaPhoto.width}
              height={finalCtaPhoto.height}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center opacity-40"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-[#0F1713] via-[#0F1713]/85 to-[#0F1713]/70"
              aria-hidden="true"
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Side Editorial Summary */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-xs uppercase tracking-[0.22em] text-[#E2B857] font-semibold">
                    Northlanders Guest House
                  </span>
                  <span className="w-12 h-[1px] bg-[#E2B857]/60" aria-hidden="true" />
                </div>

                <h2
                  id="final-cta-heading"
                  className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#F4F1EA] leading-tight text-balance"
                >
                  Ready to Plan Your Stay?
                </h2>

                <p className="text-base sm:text-lg text-[#D5D1C8] max-w-xl leading-relaxed">
                  Reach out to us directly on WhatsApp to ask about your travel dates, view room
                  options, and receive current rates for your visit to Skardu.
                </p>

                <ul className="space-y-3 text-sm text-[#D5D1C8] pt-2">
                  <li className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#E2B857] shrink-0" aria-hidden="true" />
                    <span>{BUSINESS_INFO.address}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#E2B857] shrink-0" aria-hidden="true" />
                    <span className="tabular-nums">{BUSINESS_INFO.phoneDisplay}</span>
                  </li>
                </ul>
              </div>

              {/* Right Side Floating Dark Forest Card (Matching Reference Bottom Card) */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl bg-[#141F1A]/95 backdrop-blur-md border border-[#E2B857]/35 p-7 sm:p-8 shadow-2xl space-y-6">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#E2B857] font-semibold">
                      Direct Guest House Inquiry
                    </p>
                    <p className="font-display text-2xl sm:text-3xl font-semibold text-[#F4F1EA] mt-2">
                      {BUSINESS_INFO.rateNote}
                    </p>
                  </div>

                  <div className="space-y-3 text-sm text-[#D5D1C8] border-y border-[#26382E] py-4">
                    <p>• Ask about available dates for solo, couple, or family stays</p>
                    <p>• Inquire about specific room previews shown on this page</p>
                    <p>• Confirm current seasonal rates directly with the property</p>
                  </div>

                  <a
                    href={getGeneralBookingWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-4 px-6 rounded-xl bg-[#E2B857] hover:bg-[#ebd089] text-[#0F1713] font-semibold text-base tracking-wide inline-flex items-center justify-center gap-3 transition-all shadow-lg active:scale-[0.99] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2B857]"
                  >
                    <span>Book on WhatsApp</span>
                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 9. FOOTER */}
      <footer className="bg-[#0B110E] border-t border-[#223128] text-[#B8B4AA] py-14 pb-24 sm:pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-[#1E2C24]">
            {/* Brand & Address */}
            <div className="md:col-span-5 space-y-3">
              <a
                href="#home"
                className="font-display text-2xl font-semibold tracking-wider text-[#F4F1EA] hover:text-[#E2B857] transition-colors"
              >
                {BUSINESS_INFO.name.toUpperCase()}
              </a>
              <p className="text-sm text-[#A5A198] max-w-sm leading-relaxed">
                {BUSINESS_INFO.address}
              </p>
              <p className="text-xs text-[#8C887F]">
                {BUSINESS_INFO.location}
              </p>
            </div>

            {/* Section Links */}
            <div className="md:col-span-4 space-y-3">
              <h3 className="font-sans text-xs uppercase tracking-widest text-[#E2B857] font-semibold">
                Navigation
              </h3>
              <ul className="grid grid-cols-2 gap-2 text-sm">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="hover:text-[#E2B857] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="#inquiry"
                    className="hover:text-[#E2B857] transition-colors"
                  >
                    Stay Inquiry
                  </a>
                </li>
              </ul>
            </div>

            {/* Direct Contact Links */}
            <div className="md:col-span-3 space-y-3">
              <h3 className="font-sans text-xs uppercase tracking-widest text-[#E2B857] font-semibold">
                Direct Contact
              </h3>
              <div className="flex flex-col space-y-2.5 text-sm">
                <a
                  href={BUSINESS_INFO.phoneHref}
                  className="inline-flex items-center gap-2 text-[#F4F1EA] hover:text-[#E2B857] transition-colors tabular-nums"
                >
                  <Phone className="w-4 h-4 text-[#E2B857]" aria-hidden="true" />
                  <span>{BUSINESS_INFO.phoneDisplay}</span>
                </a>
                <a
                  href={getGeneralBookingWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#F4F1EA] hover:text-[#E2B857] transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#E2B857]" aria-hidden="true" />
                  <span>WhatsApp Inquiry</span>
                </a>
                <a
                  href={BUSINESS_INFO.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#F4F1EA] hover:text-[#E2B857] transition-colors"
                >
                  <Navigation className="w-4 h-4 text-[#E2B857]" aria-hidden="true" />
                  <span>Google Maps Directions</span>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C887F]">
            <p>
              © {currentYear} {BUSINESS_INFO.name}. All rights reserved.
            </p>
            <p>{BUSINESS_INFO.rateNote}</p>
          </div>
        </div>
      </footer>

      {/* FLOATING WHATSAPP CTA BUTTON (All screen sizes, unobtrusive placement) */}
      <a
        href={getGeneralBookingWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Northlanders Guest House on WhatsApp"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 inline-flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-[#1F352A] hover:bg-[#274436] text-[#F4F1EA] border border-[#E2B857]/60 shadow-2xl transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2B857]"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#E2B857]" aria-hidden="true" />
        <MessageCircle className="w-4 h-4 text-[#E2B857]" aria-hidden="true" />
        <span className="text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap">
          WhatsApp Us
        </span>
      </a>

      {/* ACCESSIBLE LIGHTBOX DIALOG (Keyboard, TouchSwipe, Next/Prev, Escape) */}
      {activeLightboxPhoto && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photograph viewer: ${activeLightboxPhoto.caption}`}
          className="fixed inset-0 z-50 bg-[#0A100D]/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 select-none"
          onClick={closeLightbox}
          onTouchStart={(e) => {
            touchStartXRef.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            if (touchStartXRef.current === null) return;
            const deltaX = (e.changedTouches[0]?.clientX ?? 0) - touchStartXRef.current;
            if (deltaX > 50) {
              showPrevPhoto();
            } else if (deltaX < -50) {
              showNextPhoto();
            }
            touchStartXRef.current = null;
          }}
        >
          {/* Top Lightbox Bar */}
          <div
            className="max-w-6xl w-full mx-auto flex items-center justify-between gap-4 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs sm:text-sm text-[#D5D1C8] font-mono tabular-nums">
              Photo {lightboxIndex + 1} of {PROPERTY_PHOTOS.length} · #{activeLightboxPhoto.id}
            </div>
            <button
              ref={lightboxCloseBtnRef}
              type="button"
              onClick={closeLightbox}
              aria-label="Close photograph viewer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#16221C] hover:bg-[#E2B857] text-[#F4F1EA] hover:text-[#0F1713] border border-[#2C4035] text-xs sm:text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#E2B857]"
            >
              <span>Close</span>
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Center Image & Next/Prev Controls */}
          <div
            className="relative flex-1 flex items-center justify-center my-2 sm:my-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={showPrevPhoto}
              aria-label="Previous photograph"
              className="absolute left-1 sm:left-4 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#15201B]/90 hover:bg-[#E2B857] text-[#F4F1EA] hover:text-[#0F1713] border border-[#E2B857]/40 flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#E2B857]"
            >
              <ChevronLeft className="w-6 h-6" aria-hidden="true" />
            </button>

            <img
              src={activeLightboxPhoto.src}
              alt={activeLightboxPhoto.alt}
              width={activeLightboxPhoto.width}
              height={activeLightboxPhoto.height}
              referrerPolicy="no-referrer"
              className="max-h-[72vh] max-w-[88vw] sm:max-w-[80vw] w-auto h-auto object-contain rounded-xl border border-[#26382E] shadow-2xl"
            />

            <button
              type="button"
              onClick={showNextPhoto}
              aria-label="Next photograph"
              className="absolute right-1 sm:right-4 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#15201B]/90 hover:bg-[#E2B857] text-[#F4F1EA] hover:text-[#0F1713] border border-[#E2B857]/40 flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#E2B857]"
            >
              <ChevronRight className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          {/* Bottom Caption & Direct Inquiry Action */}
          <div
            className="max-w-4xl w-full mx-auto bg-[#15201B] border border-[#26382E] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <p className="text-sm font-medium text-[#F4F1EA]">
                {activeLightboxPhoto.caption}
              </p>
              <p className="text-xs text-[#A5A198] mt-0.5">
                {activeLightboxPhoto.category} · {BUSINESS_INFO.name}
              </p>
            </div>
            <a
              href={getRoomInquiryWhatsAppUrl(
                activeLightboxPhoto.caption,
                activeLightboxPhoto.id
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-lg bg-[#E2B857] hover:bg-[#ebd089] text-[#0F1713] font-semibold text-xs whitespace-nowrap inline-flex items-center gap-1.5 shrink-0"
            >
              <span>Inquire About This Photo</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
