import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { categoriesData } from "@/data/categories";
import { scrollToTopInstant } from "@/utils/scrollToTopInstant";

const Footer = () => {
  const navigate = useNavigate();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;

    if (email) {
      // Here you would typically send this to your backend
      console.log("Newsletter signup:", email);

      // Show success message (you could use toast here)
      alert("Thank you for subscribing to our newsletter!");

      // Reset the form
      (e.target as HTMLFormElement).reset();
    }
  };

  const socialLinks = [
    { icon: "f", label: "Facebook", href: "https://facebook.com" },
    { icon: "in", label: "Instagram", href: "https://instagram.com" },
    { icon: "tw", label: "Twitter", href: "https://twitter.com" },
    { icon: "yt", label: "YouTube", href: "https://youtube.com" },
  ];

  const supportLinks = [
    { label: "Delivery Info", path: "/delivery-info" },
    { label: "Returns & Refunds", path: "/returns" },
    { label: "FAQs", path: "/faq" },
    { label: "Contact Us", path: "/contact" },
    { label: "About Us", path: "/about" },
  ];

  const trustBadges = [
    { icon: "🔒", label: "Secure Payments" },
    { icon: "🚚", label: "Free Delivery over GH₵100" },
    { icon: "✓", label: "Quality Guaranteed" },
    { icon: "📱", label: "Mobile Money Accepted" },
  ];

  const paymentMethods = ["MTN MoMo", "Visa", "Mastercard", "Cash on Delivery"];

  const contactItems = [
    {
      label: "+233 24 123 4567",
      href: "tel:+233241234567",
      icon: (
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1 19.79 19.79 0 0 1 1.61 4.48 2 2 0 0 1 3.6 2.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 17.2v-.28z" />
        </svg>
      ),
    },
    {
      label: "hello@rollslandsplash.com",
      href: "mailto:hello@rollslandsplash.com",
      icon: (
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
    },
    {
      label: "Accra & Kumasi, Ghana",
      href: null,
      icon: (
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-[#0a2e1a] via-[#0d3d20] to-[#0a2415]">
      {/* Decorative blobs — smaller on mobile to avoid overflow */}
      <div
        className="pointer-events-none absolute top-0 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-primary/10 rounded-full blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-1/4 w-40 h-40 md:w-80 md:h-80 bg-secondary/[0.08] rounded-full blur-3xl"
        aria-hidden
      />

      <div className="relative container mx-auto px-4 lg:px-6 pt-10 lg:pt-14 pb-8">
        {/* TOP SECTION — Brand + Nav + Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand — full width on mobile, 4 cols on desktop */}
          <div className="lg:col-span-4">
            {/* Logo + Name */}
            <button
              type="button"
              onClick={() => {
                navigate("/");
                scrollToTopInstant();
              }}
              className="flex items-center gap-3 mb-4 text-left transition-opacity hover:opacity-90"
              aria-label="Go to home"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-green-dark rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-white font-bold text-sm">R&amp;S</span>
              </div>
              <div>
                <p className="text-lg font-bold font-display text-white leading-tight">
                  Rollsland &amp; <span className="text-secondary">Splash</span>
                </p>
                <p className="text-[11px] text-white/40">
                  Fresh · Local · Trusted
                </p>
              </div>
            </button>

            <p className="text-sm text-white/60 leading-relaxed mb-5 max-w-xs">
              Your trusted partner for fresh groceries, premium ingredients, and
              daily essentials across Ghana.
            </p>

            {/* Social */}
            <div>
              <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest mb-2.5">
                Follow Us
              </p>
              <div className="flex gap-2">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-9 h-9 rounded-xl bg-white/[0.08] border border-white/10 flex items-center justify-center text-white/50 hover:bg-primary/30 hover:text-white hover:border-primary/40 transition-all duration-200 text-xs font-bold"
                  >
                    {s.icon === "f" && (
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                    )}
                    {s.icon === "in" && (
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                        <rect x="2" y="2" width="20" height="20" rx="5" />
                        <circle cx="12" cy="12" r="4" />
                        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                      </svg>
                    )}
                    {s.icon === "tw" && (
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                      </svg>
                    )}
                    {s.icon === "yt" && (
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Nav Links — 2 col grid on mobile and desktop */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-6">
            {/* Shop */}
            <div>
              <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest mb-4">
                Shop
              </p>
              <ul className="space-y-2.5">
                {categoriesData.slice(0, 6).map((category) => (
                  <li key={category.id}>
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/category/${category.id}`);
                        scrollToTopInstant();
                      }}
                      className="flex items-start gap-1.5 text-sm text-white/60 hover:text-white transition-all duration-200 hover:translate-x-1 text-left py-0.5"
                    >
                      <span className="text-primary/50 text-xs leading-snug pt-0.5">
                        ›
                      </span>
                      <span className="leading-snug">{category.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest mb-4">
                Support
              </p>
              <ul className="space-y-2.5">
                {supportLinks.map((link) => (
                  <li key={link.path}>
                    <button
                      type="button"
                      onClick={() => {
                        navigate(link.path);
                        scrollToTopInstant();
                      }}
                      className="flex items-start gap-1.5 text-sm text-white/60 hover:text-white transition-all duration-200 hover:translate-x-1 text-left py-0.5"
                    >
                      <span className="text-primary/50 text-xs leading-snug pt-0.5">
                        ›
                      </span>
                      <span className="leading-snug">{link.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact + Newsletter — full width on mobile, 4 cols on desktop */}
          <div className="lg:col-span-4">
            <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest mb-4">
              Get In Touch
            </p>

            {/* Contact items */}
            <div className="space-y-3 mb-5">
              {contactItems.map((item) => {
                const inner = (
                  <>
                    <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/10 flex items-center justify-center flex-shrink-0 text-primary">
                      {item.icon}
                    </div>
                    <span className="text-sm text-white/65 break-all sm:break-normal">
                      {item.label}
                    </span>
                  </>
                );
                return item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 transition-colors hover:text-white"
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={item.label} className="flex items-center gap-3">
                    {inner}
                  </div>
                );
              })}
            </div>

            {/* WhatsApp button */}
            <button
              type="button"
              onClick={() => window.open("https://wa.me/233241234567", "_blank", "noopener,noreferrer")}
              className="flex items-center gap-2 bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-[#25D366]/25 transition-all mb-6"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.558 4.14 1.535 5.878L.057 23.6a.498.498 0 0 0 .61.635l5.878-1.538A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.893 9.893 0 0 1-5.045-1.378l-.362-.215-3.737.979.997-3.645-.236-.374A9.862 9.862 0 0 1 2.1 12c0-5.464 4.436-9.9 9.9-9.9s9.9 4.436 9.9 9.9-4.436 9.9-9.9 9.9z" />
              </svg>
              WhatsApp Chat
            </button>

            {/* Newsletter */}
            <div>
              <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest mb-1.5">
                Newsletter
              </p>
              <p className="text-xs text-white/45 mb-3">
                Get the latest deals and updates
              </p>
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row gap-2"
              >
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  className="flex-1 h-11 sm:h-10 rounded-xl bg-white/[0.08] border border-white/15 text-white placeholder:text-white/30 text-sm px-3.5 focus:outline-none focus:bg-white/[0.12] focus:border-primary/50 focus:ring-1 focus:ring-primary/30 min-w-0"
                />
                <Button
                  type="submit"
                  className="h-11 sm:h-10 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all shadow-sm whitespace-nowrap w-full sm:w-auto"
                >
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="border-t border-white/[0.08] mt-10 mb-6" />

        {/* TRUST BADGES */}
        <div className="grid grid-cols-2 md:flex md:flex-wrap md:items-center md:justify-center gap-3 md:gap-6 mb-6">
          {trustBadges.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2 justify-center md:justify-start bg-white/[0.05] md:bg-transparent rounded-xl md:rounded-none p-3 md:p-0 border border-white/[0.08] md:border-0"
            >
              <div
                aria-hidden
                className="w-6 h-6 rounded-lg bg-white/[0.06] md:bg-transparent flex items-center justify-center text-sm flex-shrink-0"
              >
                {badge.icon}
              </div>
              <span className="text-xs text-white/45 font-medium">
                {badge.label}
              </span>
            </div>
          ))}
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-white/[0.06] pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col items-center gap-2 text-center text-xs text-white/30 sm:flex-row sm:gap-3 sm:text-left">
            <p>© 2025 Rollsland &amp; Splash. All rights reserved.</p>
            <span className="hidden text-white/20 sm:inline">•</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  navigate("/privacy");
                  scrollToTopInstant();
                }}
                className="transition-colors hover:text-white/60"
              >
                Privacy
              </button>
              <span className="text-white/20">·</span>
              <button
                type="button"
                onClick={() => {
                  navigate("/terms");
                  scrollToTopInstant();
                }}
                className="transition-colors hover:text-white/60"
              >
                Terms
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/[0.08] text-white/45 text-[11px] font-medium"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
