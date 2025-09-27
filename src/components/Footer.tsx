import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { categoriesData } from "@/data/categories";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";

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

  return (
    <footer className="bg-gradient-to-br from-slate-800/95 via-slate-700/90 to-slate-900/95 border-t border-slate-600/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2 xl:col-span-2 space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-green-medium bg-clip-text text-transparent">
                Roseland & Splash
              </h2>
              <p className="text-muted-foreground leading-relaxed max-w-md">
                Your trusted partner for fresh groceries, premium ingredients,
                and daily essentials. Delivering quality from farm to your
                doorstep across Ghana.
              </p>
            </div>

            {/* Social Media */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Follow Us</h4>
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  className="w-10 h-10 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                >
                  <Facebook
                    size={18}
                    className="text-primary group-hover:text-primary-hover"
                  />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                >
                  <Instagram
                    size={18}
                    className="text-primary group-hover:text-primary-hover"
                  />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                >
                  <Twitter
                    size={18}
                    className="text-primary group-hover:text-primary-hover"
                  />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                >
                  <Youtube
                    size={18}
                    className="text-primary group-hover:text-primary-hover"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Shop Categories */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-foreground border-b border-primary/20 pb-2">
              Shop
            </h3>
            <ul className="space-y-3">
              {categoriesData.slice(0, 5).map((category) => (
                <li key={category.id}>
                  <button
                    onClick={() => navigate(`/category/${category.id}`)}
                    className="text-muted-foreground hover:text-primary text-left font-medium hover:translate-x-1 transition-all duration-200"
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Help & Support */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-foreground border-b border-primary/20 pb-2">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => navigate("/delivery-info")}
                  className="text-muted-foreground hover:text-primary font-medium hover:translate-x-1 transition-all duration-200"
                >
                  Delivery Info
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/returns")}
                  className="text-muted-foreground hover:text-primary font-medium hover:translate-x-1 transition-all duration-200"
                >
                  Returns & Refunds
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/faq")}
                  className="text-muted-foreground hover:text-primary font-medium hover:translate-x-1 transition-all duration-200"
                >
                  FAQs
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/contact")}
                  className="text-muted-foreground hover:text-primary font-medium hover:translate-x-1 transition-all duration-200"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/about")}
                  className="text-muted-foreground hover:text-primary font-medium hover:translate-x-1 transition-all duration-200"
                >
                  About Us
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-foreground border-b border-primary/20 pb-2">
              Contact
            </h3>

            {/* Contact Info */}
            <div className="space-y-4">
              <a
                href="tel:+233241234567"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Phone size={14} className="text-primary" />
                </div>
                <span>+233 24 123 4567</span>
              </a>
              <a
                href="mailto:hello@roselandsplash.com"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Mail size={14} className="text-primary" />
                </div>
                <span>hello@roselandsplash.com</span>
              </a>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin size={14} className="text-primary" />
                </div>
                <span>Accra & Kumasi, Ghana</span>
              </div>
              <a
                href="https://wa.me/233241234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-primary hover:text-primary-hover transition-colors group bg-primary/5 rounded-lg p-2 hover:bg-primary/10"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <MessageCircle size={14} className="text-primary" />
                </div>
                <span className="font-medium">WhatsApp Chat</span>
              </a>
            </div>

            {/* Newsletter Signup */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Newsletter</h4>
              <p className="text-xs text-muted-foreground">
                Get the latest deals and updates
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  className="h-10 bg-background/50 border-border/50 focus:border-primary"
                />
                <Button
                  type="submit"
                  className="w-full h-10 font-medium rounded-lg"
                >
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/50 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <p className="text-sm text-muted-foreground text-center">
                © 2024 Roseland & Splash. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/privacy")}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </button>
                <span className="text-muted-foreground">•</span>
                <button
                  onClick={() => navigate("/terms")}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms of Service
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 text-center">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Secure payments:</span>
                <div className="flex gap-1 flex-wrap justify-center">
                  <span className="bg-primary/10 px-3 py-1 rounded-full font-medium text-xs">
                    Mobile Money
                  </span>
                  <span className="bg-primary/10 px-3 py-1 rounded-full font-medium text-xs">
                    Visa
                  </span>
                  <span className="bg-primary/10 px-3 py-1 rounded-full font-medium text-xs">
                    Mastercard
                  </span>
                  <span className="bg-primary/10 px-3 py-1 rounded-full font-medium text-xs">
                    Bank Transfer
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs flex-wrap justify-center">
                <span className="bg-green-500/10 px-3 py-1 rounded-full text-green-500 font-medium border border-green-500/20">
                  🔒 SSL Secured
                </span>
                <span className="bg-primary/10 px-3 py-1 rounded-full text-primary font-medium border border-primary/20">
                  ✓ Trusted
                </span>
                <span className="bg-blue-500/10 px-3 py-1 rounded-full text-blue-500 font-medium border border-blue-500/20">
                  🚚 Fast Delivery
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
