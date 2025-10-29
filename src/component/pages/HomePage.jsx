import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../layout/Header.jsx';
import Footer from '../layout/Footer.jsx';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import { Card, CardContent } from '../ui/card.jsx';
import { Badge } from '../ui/badge.jsx';
import { Image } from '../ui/image.jsx'; // Assuming this component exists
import InteractiveMap from '../ui/interactive-map.jsx';
import DebugMap from '../ui/debug-map.jsx';
import NearbyStationsList from '../ui/nearby-stations-list.jsx';
import {
  MapPin,
  Search,
  Zap,
  Filter,
  Users,
  ShieldCheck,
  Star,
  ChevronRight,
  Lightbulb, // For "Smart Filtering"
  SquareMousePointer, // For "Real-Time Mapping"
} from 'lucide-react';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  // Mock testimonials
  const testimonials = [
    {
      id: 1,
      text: "Outstanding charging experience! The station was easy to find, well-maintained, and provided a quick, highly recommend this location for a quick top-up.",
      author: "EV_Driver_23",
      rating: 5,
    },
    {
      id: 2,
      text: "A reliable charger, but it was a bit slow for a fast charger. Still, it got the job done while I grabbed a coffee. Clean area.",
      author: "ChargeMaster",
      rating: 4,
    },
    {
      id: 3,
      text: "Had a great experience with this station. One of the two chargers was out of order, but the available one worked perfectly fine. Had to wait, but not for too long.",
      author: "FrustratedEV",
      rating: 3, // Changed to 3 stars based on the design's visual cues
    },
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        fill={i < rating ? 'currentColor' : 'none'}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background text-secondary">
      <Header />

      {/* Hero Section */}
      <section className="relative w-full max-w-[120rem] mx-auto bg-gradient-to-br from-brandaccent/20 to-subtlebackground py-16 px-6 md:py-24 lg:py-32 overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Left Content */}
          <div className="flex-1 max-w-2xl text-center md:text-left space-y-6">
            <h1 className="font-heading text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
              Power Your Journey Forward
            </h1>
            <p className="font-paragraph text-xl md:text-2xl text-secondary/80">
              Discover charging stations in your area with real-time availability, smart filtering, and seamless payments, empowering EV drivers making sustainable choices.
            </p>
            <Link to="/stations">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 rounded-full shadow-lg">
                Find Stations Now <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Right Image */}
          <div className="flex-1 flex justify-center md:justify-end">
            <div className="relative w-[30rem] h-[30rem] lg:w-[40rem] lg:h-[40rem] rounded-full overflow-hidden flex items-center justify-center">
              <Image
                src="https://static.wixstatic.com/media/7f4fa4_36551b9e078749e794358896a2ecb005~mv2.jpg/v1/fill/w_1000,h_1000,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/7f4fa4_36551b9e078749e794358896a2ecb005~mv2.jpg" // Placeholder image URL for the charging station
                alt="Electric vehicle charging station"
                width={800}
                className="object-cover w-full h-full"
              />
              <Badge className="absolute bottom-6 right-6 bg-primary text-primary-foreground text-md px-4 py-2 rounded-full shadow-md">
                Available Now
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Find Stations Near You Section (Search & Map/List) */}
      <section className="w-full max-w-[120rem] mx-auto px-6 py-16 lg:py-24 bg-subtlebackground">
        <div className="text-center mb-12 space-y-4">
          <h2 className="font-heading text-4xl md:text-5xl font-bold">
            Find Stations Near You
          </h2>
          <p className="font-paragraph text-lg md:text-xl text-secondary/70 max-w-3xl mx-auto">
            Discover charging stations in your area with real-time availability and detailed information.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Search Bar & Location */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary/60 w-5 h-5" />
              <div className="bg-white p-4 rounded-lg shadow-sm border border-brandaccent/20 flex items-center">
                <span className="text-sm text-secondary/70">Your location: </span>
                <span className="font-medium text-secondary ml-1">19.4516, 73.8236</span> {/* Mocked coordinates */}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary/60 w-5 h-5" />
                <Input
                  placeholder="Search by station name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 border-brandaccent/30 focus:border-primary w-full"
                />
              </div>
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground h-12 px-6"
              >
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
              </Button>
            </div>

            {/* Live Interactive Map */}
            <div className="bg-white rounded-lg shadow-md border border-brandaccent/20 overflow-hidden">
              <div className="p-4 bg-green-50 border-b border-green-200">
                <p className="text-sm text-green-800">
                  ✅ <strong>Live Mode:</strong> Loading demo + live stations from APIs
                </p>
              </div>
              <InteractiveMap
                height="450px"
                showSearch={true}
                onStationSelect={(station) => {
                  console.log('Selected station:', station);
                  alert(`Selected: ${station.name}\nAddress: ${station.address}\nStatus: ${station.isAvailable ? 'Available' : 'Occupied'}`);
                }}
              />
            </div>
          </div>

          {/* Nearby Stations List (Right Side) */}
          <div className="lg:col-span-1">
            <NearbyStationsList
              userLocation={userLocation}
              maxStations={8}
              onStationSelect={(station) => {
                console.log('Selected station from list:', station);
              }}
            />
          </div>
        </div>
      </section>

      {/* Why Choose ChargeSpot Section */}
      <section className="w-full max-w-[120rem] mx-auto px-6 py-16 lg:py-24 bg-gradient-to-tl from-subtlebackground to-brandaccent/10">
        <div className="text-center mb-12 space-y-4">
          <h2 className="font-heading text-4xl md:text-5xl font-bold">
            Why Choose ChargeSpot?
          </h2>
          <p className="font-paragraph text-lg md:text-xl text-secondary/70 max-w-3xl mx-auto">
            Experience the future of electric vehicle charging with our comprehensive platform designed for modern drivers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature Card 1 */}
          <Card className="bg-white border-brandaccent/20 text-center p-8 space-y-4">
            <CardContent className="space-y-4 flex flex-col items-center">
              <SquareMousePointer className="w-16 h-16 text-primary" />
              <h3 className="font-heading text-xl font-semibold">Real-Time Mapping</h3>
              <p className="font-paragraph text-secondary/70">
                Find available charging stations instantly with live status, location, availability and detailed station information.
              </p>
            </CardContent>
          </Card>
          {/* Feature Card 2 */}
          <Card className="bg-white border-brandaccent/20 text-center p-8 space-y-4">
            <CardContent className="space-y-4 flex flex-col items-center">
              <Lightbulb className="w-16 h-16 text-primary" />
              <h3 className="font-heading text-xl font-semibold">Smart Filtering</h3>
              <p className="font-paragraph text-secondary/70">
                Filter stations by connector type, price, and amenities to find your perfect match.
              </p>
            </CardContent>
          </Card>
          {/* Feature Card 3 */}
          <Card className="bg-white border-brandaccent/20 text-center p-8 space-y-4">
            <CardContent className="space-y-4 flex flex-col items-center">
              <ShieldCheck className="w-16 h-16 text-primary" />
              <h3 className="font-heading text-xl font-semibold">Secure Booking</h3>
              <p className="font-paragraph text-secondary/70">
                Reserve charging spots with secure payment processing via trusted partnerships.
              </p>
            </CardContent>
          </Card>
          {/* Feature Card 4 */}
          <Card className="bg-white border-brandaccent/20 text-center p-8 space-y-4">
            <CardContent className="space-y-4 flex flex-col items-center">
              <Users className="w-16 h-16 text-primary" />
              <h3 className="font-heading text-xl font-semibold">Community Reviews</h3>
              <p className="font-paragraph text-secondary/70">
                Read and write reviews from fellow EV drivers to make informed charging decisions.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* What Our Users Say Section (Testimonials) */}
      <section className="w-full max-w-[120rem] mx-auto px-6 py-16 lg:py-24">
        <div className="text-center mb-12 space-y-4">
          <h2 className="font-heading text-4xl md:text-5xl font-bold">
            What Our Users Say
          </h2>
          <p className="font-paragraph text-lg md:text-xl text-secondary/70 max-w-3xl mx-auto">
            Join thousands of satisfied EV drivers who trust ChargeSpot for their charging needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-white border-brandaccent/20 p-6 shadow-sm">
              <CardContent className="space-y-4">
                <div className="flex items-center gap-1 mb-2">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="font-paragraph text-secondary/80 text-lg leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                <p className="font-paragraph text-sm font-semibold text-primary">
                  - {testimonial.author}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Ready to Power Your Journey CTA */}
      <section className="w-full max-w-[120rem] mx-auto px-6 py-24 lg:py-32 bg-primary flex flex-col items-center justify-center text-center space-y-6 rounded-t-lg shadow-xl">
        <h2 className="font-heading text-5xl md:text-6xl font-bold text-primary-foreground leading-tight">
          Ready to Power Your Journey?
        </h2>
        <p className="font-paragraph text-xl md:text-2xl text-primary-foreground/90 max-w-3xl">
          Join ChargeSpot today and discover a smarter way to charge your electric vehicle. Find, book, and pay for fast and reliable EV charging effortlessly.
        </p>
        <Link to="/stations">
          <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-8 py-6 rounded-full shadow-lg">
            Find Stations Now <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </section>

      <Footer />
    </div>
  );
}