import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-secondary text-secondary-foreground">
      <div className="max-w-[120rem] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-xl font-bold">ChargeSpot</span>
            </div>
            <p className="font-paragraph text-secondary-foreground/80 leading-relaxed">
              Your trusted companion for finding and booking electric vehicle charging stations. 
              Join the sustainable mobility revolution.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="font-heading text-lg font-semibold">Quick Links</h3>
            <div className="space-y-3">
              <Link to="/" className="block font-paragraph text-secondary-foreground/80 hover:text-primary transition-colors">
                Find Stations
              </Link>
              <Link to="/owner/dashboard" className="block font-paragraph text-secondary-foreground/80 hover:text-primary transition-colors">
                Host Station
              </Link>
              <Link to="/profile" className="block font-paragraph text-secondary-foreground/80 hover:text-primary transition-colors">
                My Profile
              </Link>
              <Link to="/contact" className="block font-paragraph text-secondary-foreground/80 hover:text-primary transition-colors">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <h3 className="font-heading text-lg font-semibold">Features</h3>
            <div className="space-y-3">
              <div className="font-paragraph text-secondary-foreground/80">Real-time Availability</div>
              <div className="font-paragraph text-secondary-foreground/80">Smart Filtering</div>
              <div className="font-paragraph text-secondary-foreground/80">User Reviews</div>
              <div className="font-paragraph text-secondary-foreground/80">Station Details</div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="font-heading text-lg font-semibold">Get in Touch</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <span className="font-paragraph text-secondary-foreground/80">support@chargespot.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <span className="font-paragraph text-secondary-foreground/80">1-800-CHARGE</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-primary" />
                <span className="font-paragraph text-secondary-foreground/80">Available 24/7</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-paragraph text-secondary-foreground/60 text-sm">
              © 2024 ChargeSpot. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="font-paragraph text-secondary-foreground/60 hover:text-primary text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="font-paragraph text-secondary-foreground/60 hover:text-primary text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}