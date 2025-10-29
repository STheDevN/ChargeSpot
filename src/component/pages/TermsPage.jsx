import React from 'react';
import Header from '../layout/Header.jsx';
import Footer from '../layout/Footer.jsx';
import { Card, CardContent } from '../ui/card.jsx';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="w-full max-w-[120rem] mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-secondary mb-8">
            Terms of Service
          </h1>
          
          <Card>
            <CardContent className="p-8 space-y-6">
              <section>
                <h2 className="font-heading text-2xl font-semibold text-secondary mb-4">
                  Acceptance of Terms
                </h2>
                <p className="font-paragraph text-secondary/80 leading-relaxed">
                  By accessing and using ChargeSpot, you accept and agree to be bound by the terms and provision 
                  of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl font-semibold text-secondary mb-4">
                  Use License
                </h2>
                <p className="font-paragraph text-secondary/80 leading-relaxed">
                  Permission is granted to temporarily use ChargeSpot for personal, non-commercial transitory viewing only. 
                  This is the grant of a license, not a transfer of title, and under this license you may not modify or 
                  copy the materials, use the materials for any commercial purpose, or attempt to reverse engineer any software.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl font-semibold text-secondary mb-4">
                  User Account
                </h2>
                <p className="font-paragraph text-secondary/80 leading-relaxed">
                  When you create an account with us, you must provide information that is accurate, complete, and current 
                  at all times. You are responsible for safeguarding the password and for all activities that occur under 
                  your account.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl font-semibold text-secondary mb-4">
                  Booking and Payment
                </h2>
                <p className="font-paragraph text-secondary/80 leading-relaxed">
                  All bookings are subject to availability and confirmation. Payment is required at the time of booking. 
                  Cancellation policies vary by charging station and will be clearly displayed before booking confirmation.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl font-semibold text-secondary mb-4">
                  Limitation of Liability
                </h2>
                <p className="font-paragraph text-secondary/80 leading-relaxed">
                  In no event shall ChargeSpot or its suppliers be liable for any damages (including, without limitation, 
                  damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
                  to use ChargeSpot, even if ChargeSpot or its authorized representative has been notified of the possibility 
                  of such damage.
                </p>
              </section>

              <section>
                <h2 className="font-heading text-2xl font-semibold text-secondary mb-4">
                  Contact Information
                </h2>
                <p className="font-paragraph text-secondary/80 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at support@chargespot.com.
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
