import React from 'react'; // Added for best practice
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx';
import { Badge } from '../ui/badge.jsx';
import { Image } from '../ui/image.jsx';
import Header from '../layout/Header.jsx';
import Footer from '../layout/Footer.jsx';
import { 
  Zap, 
  Users, 
  Globe, 
  Award,
  Target,
  Heart,
  Leaf,
  Shield,
  Lightbulb,
  TrendingUp
} from 'lucide-react';

export default function AboutPage() {
  const teamMembers = [
    {
      name: 'Sarah Chen',
      role: 'CEO & Founder',
      image: 'https://static.wixstatic.com/media/7f4fa4_b9ee3dbcc45d4d61b30fdd9b6d9749ac~mv2.png?originWidth=192&originHeight=192',
      bio: 'Former Tesla engineer with 10+ years in EV infrastructure. Passionate about sustainable transportation.'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'CTO',
      image: 'https://static.wixstatic.com/media/7f4fa4_51aeca57c69d4a80a3674c38f78cf9a0~mv2.png?originWidth=192&originHeight=192',
      bio: 'Tech visionary specializing in smart grid technology and renewable energy systems.'
    },
    {
      name: 'Emily Watson',
      role: 'Head of Operations',
      image: 'https://static.wixstatic.com/media/7f4fa4_a71ea5aa2b2649b4bf4b5d3a89d84309~mv2.png?originWidth=192&originHeight=192',
      bio: 'Operations expert with experience scaling infrastructure networks across North America.'
    },
    {
      name: 'David Kim',
      role: 'Lead Developer',
      image: 'https://static.wixstatic.com/media/7f4fa4_fda745d5ffb548a68590367be9d3bb78~mv2.png?originWidth=192&originHeight=192',
      bio: 'Full-stack developer focused on creating seamless user experiences for EV drivers.'
    }
  ];

  const milestones = [
    {
      year: '2020',
      title: 'Company Founded',
      description: 'ChargeSpot was born from a vision to make EV charging accessible to everyone.'
    },
    {
      year: '2021',
      title: 'First 100 Stations',
      description: 'Reached our first milestone with 100 charging stations across 5 cities.'
    },
    {
      year: '2022',
      title: 'Mobile App Launch',
      description: 'Launched our award-winning mobile app with real-time station tracking.'
    },
    {
      year: '2023',
      title: 'National Expansion',
      description: 'Expanded to 50 cities with over 1,000 charging stations nationwide.'
    },
    {
      year: '2024',
      title: 'Smart Grid Integration',
      description: 'Pioneered smart grid technology for optimized charging and renewable energy use.'
    }
  ];

  const values = [
    {
      icon: Leaf,
      title: 'Sustainability',
      description: 'Committed to reducing carbon emissions through clean energy and sustainable practices.'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building a community of EV drivers who share our vision for a cleaner future.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'Continuously developing cutting-edge technology to improve the charging experience.'
    },
    {
      icon: Shield,
      title: 'Reliability',
      description: 'Ensuring our charging network is dependable, secure, and always available when you need it.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="w-full max-w-[120rem] mx-auto px-6 py-24 bg-gradient-to-br from-secondary via-secondary/95 to-secondary/90">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-lg px-4 py-2">
                About ChargeSpot
              </Badge>
              <h1 className="font-heading text-5xl lg:text-6xl font-bold text-secondary-foreground leading-tight">
                Powering the Future of Transportation
              </h1>
              <p className="font-paragraph text-xl text-secondary-foreground/80 leading-relaxed">
                We're on a mission to accelerate the world's transition to sustainable transportation by making 
                electric vehicle charging accessible, reliable, and convenient for everyone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="font-heading text-3xl font-bold text-primary mb-2">1,000+</div>
                <div className="font-paragraph text-secondary-foreground/70">Charging Stations</div>
              </div>
              <div className="text-center">
                <div className="font-heading text-3xl font-bold text-primary mb-2">50+</div>
                <div className="font-paragraph text-secondary-foreground/70">Cities Served</div>
              </div>
              <div className="text-center">
                <div className="font-heading text-3xl font-bold text-primary mb-2">100K+</div>
                <div className="font-paragraph text-secondary-foreground/70">Happy Drivers</div>
              </div>
              <div className="text-center">
                <div className="font-heading text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="font-paragraph text-secondary-foreground/70">Support Available</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="w-80 h-80 lg:w-96 lg:h-96 bg-gradient-to-br from-primary/20 to-brandaccent/30 rounded-full blur-3xl absolute -top-10 -right-10"></div>
            <Image
              src="https://static.wixstatic.com/media/7f4fa4_f029354e41d24dc190a2c6fe3a3bf8f3~mv2.png?originWidth=448&originHeight=448"
              alt="ChargeSpot team working on sustainable transportation solutions"
              width={500}
              className="relative z-10 w-full h-auto rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="w-full max-w-[120rem] mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Card className="bg-subtlebackground border-brandaccent/20">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle className="font-heading text-2xl text-secondary">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-paragraph text-secondary/80 leading-relaxed">
                To accelerate the adoption of electric vehicles by creating the world's most comprehensive, 
                reliable, and user-friendly charging network. We believe that sustainable transportation 
                should be accessible to everyone, everywhere.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-subtlebackground border-brandaccent/20">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle className="font-heading text-2xl text-secondary">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-paragraph text-secondary/80 leading-relaxed">
                A world where clean, sustainable transportation is the norm, not the exception. We envision 
                a future where every journey is powered by renewable energy, and range anxiety is a thing 
                of the past.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Our Story */}
      <section className="w-full max-w-[120rem] mx-auto px-6 py-24 bg-subtlebackground/50">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl font-bold text-secondary mb-6">Our Story</h2>
          <p className="font-paragraph text-xl text-secondary/70 max-w-3xl mx-auto">
            From a small startup to a nationwide network, here's how we've grown to become 
            a leader in electric vehicle charging infrastructure.
          </p>
        </div>

        <div className="space-y-8">
          {milestones.map((milestone, index) => (
            <div key={milestone.year} className="flex items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <span className="font-heading text-lg font-bold text-primary-foreground">
                    {milestone.year.slice(-2)}
                  </span>
                </div>
              </div>
              <Card className="flex-1 bg-background border-brandaccent/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading text-xl font-semibold text-secondary mb-2">
                        {milestone.title}
                      </h3>
                      <p className="font-paragraph text-secondary/70">
                        {milestone.description}
                      </p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      {milestone.year}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Our Values */}
      <section className="w-full max-w-[120rem] mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl font-bold text-secondary mb-6">Our Values</h2>
          <p className="font-paragraph text-xl text-secondary/70 max-w-3xl mx-auto">
            These core values guide everything we do and shape the way we build our products and serve our community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <Card key={index} className="bg-background border-brandaccent/20 hover:shadow-lg transition-shadow text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-secondary mb-4">
                  {value.title}
                </h3>
                <p className="font-paragraph text-secondary/70 leading-relaxed">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="w-full max-w-[120rem] mx-auto px-6 py-24 bg-subtlebackground/50">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl font-bold text-secondary mb-6">Meet Our Team</h2>
          <p className="font-paragraph text-xl text-secondary/70 max-w-3xl mx-auto">
            Our diverse team of experts is passionate about creating innovative solutions for sustainable transportation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <Card key={index} className="bg-background border-brandaccent/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-12 h-12 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-secondary mb-1">
                  {member.name}
                </h3>
                <p className="font-paragraph text-primary font-medium mb-3">
                  {member.role}
                </p>
                <p className="font-paragraph text-sm text-secondary/70 leading-relaxed">
                  {member.bio}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Impact Section */}
      <section className="w-full max-w-[120rem] mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl font-bold text-secondary mb-6">Our Impact</h2>
          <p className="font-paragraph text-xl text-secondary/70 max-w-3xl mx-auto">
            Together with our community, we're making a real difference in the fight against climate change.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-gradient-to-br from-primary/10 to-brandaccent/20 border-primary/20 text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="font-heading text-3xl font-bold text-secondary mb-2">2.5M</div>
              <div className="font-paragraph text-secondary/70 mb-2">Tons of CO₂ Saved</div>
              <p className="font-paragraph text-sm text-secondary/60">
                Equivalent to planting 3 million trees
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-brandaccent/20 border-primary/20 text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="font-heading text-3xl font-bold text-secondary mb-2">50M</div>
              <div className="font-paragraph text-secondary/70 mb-2">kWh Delivered</div>
              <p className="font-paragraph text-sm text-secondary/60">
                Powering millions of clean miles
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-brandaccent/20 border-primary/20 text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="font-heading text-3xl font-bold text-secondary mb-2">95%</div>
              <div className="font-paragraph text-secondary/70 mb-2">Customer Satisfaction</div>
              <p className="font-paragraph text-sm text-secondary/60">
                Based on 50,000+ reviews
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full max-w-[120rem] mx-auto px-6 py-24">
        <Card className="bg-gradient-to-r from-primary to-brandaccent border-0">
          <CardContent className="p-16 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="font-heading text-4xl lg:text-5xl font-bold text-primary-foreground">
                Join the Electric Revolution
              </h2>
              <p className="font-paragraph text-xl text-primary-foreground/90 leading-relaxed">
                Be part of the movement towards sustainable transportation. Whether you're an EV driver, 
                a business owner, or someone who cares about the environment, there's a place for you in our community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-lg font-paragraph font-medium transition-colors"
                >
                  Partner With Us
                </a>
                <a 
                  href="/stations" 
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground rounded-lg font-paragraph font-medium transition-colors"
                >
                  Find Stations
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  );
}