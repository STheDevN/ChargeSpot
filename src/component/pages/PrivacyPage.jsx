import React from 'react';
import Header from '../layout/Header.jsx';
import Footer from '../layout/Footer.jsx';
import { Card, CardContent } from '../ui/card.jsx';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="w-full max-w-[120rem] mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-secondary mb-8">
            Privacy Policy
          </h1>
          
          <Card>
            <CardContent className="p-8 space-y-6">
              <section>
                <h2 className="font-heading text-2xl font-semibold text-secondary mb-4">
                  Information We Collect
                </h2>
                <p className="font-paragraph text-secondary/80 leading-relaxed">
                  At ChargeSpot, we collect information you provide directly to us, such as when you create an account, 
                  book a charging station, or contact us for support. This may include your name, email address, 
                  phone number, and payment information.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl font-semibold text-secondary mb-4">
                  How We Use Your Information
                </h2>
                <p className="font-paragraph text-secondary/80 leading-relaxed">
                  We use the information we collect to provide, maintain, and improve our services, process transactions, 
                  send you technical notices and support messages, and communicate with you about products, services, 
                  and promotional offers.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl font-semibold text-secondary mb-4">
                  Information Sharing
                </h2>
                <p className="font-paragraph text-secondary/80 leading-relaxed">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
                  except as described in this policy. We may share your information with trusted service providers who assist 
                  us in operating our platform and conducting our business.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl font-semibold text-secondary mb-4">
                  Data Security
                </h2>
                <p className="font-paragraph text-secondary/80 leading-relaxed">
                  We implement appropriate security measures to protect your personal information against unauthorized access, 
                  alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic 
                  storage is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl font-semibold text-secondary mb-4">
                  Contact Us
                </h2>
                <p className="font-paragraph text-secondary/80 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at support@chargespot.com.
                </p>
              </section>

              <div className="text-sm text-secondary/60 pt-4 border-t border-brandaccent/20">
                Last updated: October 2024
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
