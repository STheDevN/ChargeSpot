import React, { useState } from 'react'; // Added React for best practice
import { useMember } from '../../integrations/index.js';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { Textarea } from '../ui/textarea.jsx';
import { Label } from '../ui/label.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import Header from '../layout/Header.jsx';
import Footer from '../layout/Footer.jsx';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  MessageSquare,
  HelpCircle,
  Bug,
  Lightbulb
} from 'lucide-react';

export default function ContactPage() {
  const { member, isAuthenticated } = useMember();
  const [formData, setFormData] = useState({
    name: member?.profile?.nickname || member?.contact?.firstName || '',
    email: member?.loginEmail || '',
    subject: '',
    category: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field, value) => { // Removed type annotations
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => { // Removed type annotation
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: member?.profile?.nickname || member?.contact?.firstName || '',
        email: member?.loginEmail || '',
        subject: '',
        category: '',
        message: ''
      });
    }, 3000);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      contact: 'support@chargespot.com',
      action: 'Send Email'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak with our team directly',
      contact: '1-800-CHARGE (1-800-242-7434)',
      action: 'Call Now'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Chat with us in real-time',
      contact: 'Available 24/7',
      action: 'Start Chat'
    }
  ];

  const faqItems = [
    {
      question: 'How do I find charging stations near me?',
      answer: 'Use our interactive map on the homepage or browse all stations. You can filter by location, charging speed, and availability.'
    },
    {
      question: 'Can I book charging slots in advance?',
      answer: 'Yes! Click on any available station and select "Book Charging Slot" to reserve your spot ahead of time.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, and digital wallets like Apple Pay and Google Pay.'
    },
    {
      question: 'How do I leave a review for a charging station?',
      answer: 'Visit the station detail page and scroll down to the reviews section. You can rate and write a review if you\'re signed in.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <section className="w-full max-w-[120rem] mx-auto px-6 py-16 bg-gradient-to-r from-subtlebackground to-brandaccent/20">
        <div className="text-center space-y-6">
          <h1 className="font-heading text-5xl font-bold text-secondary">
            Get in Touch
          </h1>
          <p className="font-paragraph text-xl text-secondary/70 max-w-3xl mx-auto">
            Have questions about ChargeSpot? Need help finding charging stations? 
            Our support team is here to help you power your journey.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="w-full max-w-[120rem] mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold text-secondary mb-4">
            How Can We Help You?
          </h2>
          <p className="font-paragraph text-lg text-secondary/70">
            Choose the best way to reach us based on your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {contactMethods.map((method, index) => (
            <Card key={index} className="bg-background border-brandaccent/20 hover:shadow-lg transition-shadow text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <method.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-secondary mb-3">
                  {method.title}
                </h3>
                <p className="font-paragraph text-secondary/70 mb-4">
                  {method.description}
                </p>
                <p className="font-paragraph font-medium text-secondary mb-6">
                  {method.contact}
                </p>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {method.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="w-full max-w-[120rem] mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <Card className="bg-background border-brandaccent/20">
            <CardHeader>
              <CardTitle className="font-heading text-2xl text-secondary">Send Us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-secondary mb-3">
                    Message Sent Successfully!
                  </h3>
                  <p className="font-paragraph text-secondary/70">
                    Thank you for contacting us. We'll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">
                            <div className="flex items-center gap-2">
                              <HelpCircle className="w-4 h-4" />
                              General Inquiry
                            </div>
                          </SelectItem>
                          <SelectItem value="technical">
                            <div className="flex items-center gap-2">
                              <Bug className="w-4 h-4" />
                              Technical Support
                            </div>
                          </SelectItem>
                          <SelectItem value="feedback">
                            <div className="flex items-center gap-2">
                              <Lightbulb className="w-4 h-4" />
                              Feedback & Suggestions
                            </div>
                          </SelectItem>
                          <SelectItem value="billing">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Billing & Payments
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="Brief description of your inquiry"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Please provide details about your inquiry..."
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !formData.name || !formData.email || !formData.message}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Contact Info & FAQ */}
          <div className="space-y-8">
            {/* Contact Information */}
            <Card className="bg-background border-brandaccent/20">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-secondary">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-paragraph font-medium text-secondary">Office Address</p>
                    <p className="font-paragraph text-secondary/70">
                      123 Electric Avenue<br />
                      San Francisco, CA 94105<br />
                      United States
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-paragraph font-medium text-secondary">Support Hours</p>
                    <p className="font-paragraph text-secondary/70">
                      Monday - Friday: 8:00 AM - 8:00 PM PST<br />
                      Saturday - Sunday: 10:00 AM - 6:00 PM PST<br />
                      Emergency Support: 24/7
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-paragraph font-medium text-secondary">Phone Numbers</p>
                    <p className="font-paragraph text-secondary/70">
                      General Support: 1-800-CHARGE<br />
                      Technical Support: 1-800-TECH-EV<br />
                      Emergency: 1-800-HELP-NOW
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card className="bg-background border-brandaccent/20">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-secondary">Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqItems.map((item, index) => (
                  <div key={index} className="border-b border-brandaccent/20 pb-4 last:border-b-0">
                    <h4 className="font-paragraph font-medium text-secondary mb-2">
                      {item.question}
                    </h4>
                    <p className="font-paragraph text-sm text-secondary/70 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}