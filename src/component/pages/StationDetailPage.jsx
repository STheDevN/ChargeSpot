import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMember } from '../../integrations/index.js';
import { BaseCrudService } from '../../integrations/index.js';
// Entity imports removed as they were only for TypeScript types
import { Button } from '../ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx';
import { Badge } from '../ui/badge.jsx';
import { Image } from '../ui/image.jsx';
import { Textarea } from '../ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import { Input } from '../ui/input.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog.jsx';
import Header from '../layout/Header.jsx';
import Footer from '../layout/Footer.jsx';
import { 
  MapPin, 
  Zap, 
  Clock, 
  Star,
  Phone,
  Globe,
  ArrowLeft,
  Calendar,
  CreditCard,
  MessageSquare,
  ThumbsUp,
  Navigation,
  CheckCircle
} from 'lucide-react';

export default function StationDetailPage() {
  const { id } = useParams(); // Removed generic
  const { member, isAuthenticated } = useMember();
  const [station, setStation] = useState(null);       // Removed type
  const [reviews, setReviews] = useState([]);         // Removed type
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);  // Removed type
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // Booking states
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingStartTime, setBookingStartTime] = useState('');
  const [bookingEndTime, setBookingEndTime] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const [stationData, reviewsData] = await Promise.all([
          BaseCrudService.getById('stations', id), // Fixed endpoint name
          BaseCrudService.getAll('reviews')                // Removed generic
        ]);
        
        setStation(stationData);
        setReviews(reviewsData.reviews || reviewsData.items || []);
      } catch (error) {
        console.error('Error fetching station data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmitReview = async () => {
    if (!reviewText.trim() || !isAuthenticated) return;

    setSubmittingReview(true);
    try {
      const newReview = { // Removed type annotation
        _id: crypto.randomUUID(),
        rating: reviewRating,
        reviewText: reviewText.trim(),
        reviewerDisplayName: member?.profile?.nickname || member?.contact?.firstName || 'Anonymous User',
        submissionTimestamp: new Date(),
        isRecommended: reviewRating >= 4
      };

      await BaseCrudService.create('reviews', newReview);
      setReviews(prev => [newReview, ...prev]);
      setReviewText('');
      setReviewRating(5);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSubmitBooking = async () => {
    if (!bookingDate || !bookingStartTime || !bookingEndTime || !isAuthenticated || !station) return;

    setSubmittingBooking(true);
    try {
      const startDateTime = new Date(`${bookingDate}T${bookingStartTime}`);
      const endDateTime = new Date(`${bookingDate}T${bookingEndTime}`);
      
      // Generate booking reference
      const bookingReference = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      const newBooking = { // Removed type annotation
        _id: crypto.randomUUID(),
        stationName: station.stationName || 'Unknown Station',
        userName: member?.profile?.nickname || member?.contact?.firstName || 'Anonymous User',
        startTime: startDateTime,
        endTime: endDateTime,
        status: 'Confirmed',
        bookingReference
      };

      await BaseCrudService.create('bookings', newBooking);
      setBookingSuccess(true);
      
      // Reset form
      setBookingDate('');
      setBookingStartTime('');
      setBookingEndTime('');
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        setShowBookingDialog(false);
        setBookingSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting booking:', error);
    } finally {
      setSubmittingBooking(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length 
    : 0;

  // Generate time slots (every 30 minutes from 6 AM to 10 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="w-full max-w-[120rem] mx-auto px-6 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-brandaccent/20 rounded w-1/4"></div>
            <div className="h-64 bg-brandaccent/20 rounded"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-brandaccent/20 rounded"></div>
                <div className="h-48 bg-brandaccent/20 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-brandaccent/20 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!station) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="w-full max-w-[120rem] mx-auto px-6 py-16 text-center">
          <h1 className="font-heading text-3xl font-bold text-secondary mb-4">Station Not Found</h1>
          <p className="font-paragraph text-secondary/70 mb-8">The charging station you're looking for doesn't exist.</p>
          <Link to="/stations">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Stations
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Back Navigation */}
      <section className="w-full max-w-[120rem] mx-auto px-6 py-6">
        <Link to="/stations" className="inline-flex items-center gap-2 text-secondary/70 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-paragraph">Back to Stations</span>
        </Link>
      </section>

      {/* Station Hero */}
      <section className="w-full max-w-[120rem] mx-auto px-6 pb-8">
        <div className="relative overflow-hidden rounded-2xl">
          <Image
            src={station.stationImage || "https://static.wixstatic.com/media/7f4fa4_56acb5c35aec4965bda02c886692b419~mv2.png?originWidth=1152&originHeight=320"}
            alt={station.stationName || "Charging station"}
            width={1200}
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-secondary-foreground">
                  {station.stationName}
                </h1>
                <p className="font-paragraph text-secondary-foreground/90 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {station.address}
                </p>
              </div>
              <Badge className={`${station.isAvailable ? 'bg-primary' : 'bg-red-500'} text-white text-lg px-4 py-2`}>
                {station.isAvailable ? 'Available' : 'Occupied'}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full max-w-[120rem] mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Station Info */}
            <Card className="bg-background border-brandaccent/20">
              <CardHeader>
                <CardTitle className="font-heading text-2xl text-secondary">Station Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {station.description && (
                  <p className="font-paragraph text-secondary/80 leading-relaxed">
                    {station.description}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-paragraph text-sm text-secondary/70">Charging Speed</p>
                        <p className="font-paragraph font-semibold text-secondary">{station.chargingSpeedKw} kW</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-paragraph text-sm text-secondary/70">Price per kWh</p>
                        <p className="font-paragraph font-semibold text-secondary">${station.pricePerKwh}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-paragraph text-sm text-secondary/70">Operating Hours</p>
                        <p className="font-paragraph font-semibold text-secondary">{station.operatingHours || '24/7'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {station.stationType && (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                        </div>
                        <div>
                          <p className="font-paragraph text-sm text-secondary/70">Station Type</p>
                          <p className="font-paragraph font-semibold text-secondary">{station.stationType}</p>
                        </div>
                      </div>
                    )}

                    {station.contactPhone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-paragraph text-sm text-secondary/70">Contact</p>
                          <p className="font-paragraph font-semibold text-secondary">{station.contactPhone}</p>
                        </div>
                      </div>
                    )}

                    {station.websiteUrl && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-paragraph text-sm text-secondary/70">Website</p>
                          <a 
                            href={station.websiteUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-paragraph font-semibold text-primary hover:underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {station.connectorTypes && (
                  <div>
                    <p className="font-paragraph text-sm text-secondary/70 mb-2">Available Connectors</p>
                    <div className="flex flex-wrap gap-2">
                      {station.connectorTypes.split(',').map((type, index) => (
                        <Badge key={index} variant="outline" className="border-primary text-primary">
                          {type.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card className="bg-background border-brandaccent/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading text-2xl text-secondary">Reviews</CardTitle>
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.round(averageRating) ? 'text-primary fill-current' : 'text-secondary/30'}`} 
                          />
                        ))}
                      </div>
                      <span className="font-paragraph text-sm text-secondary/70">
                        {averageRating.toFixed(1)} ({reviews.length} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Review Form */}
                {isAuthenticated && (
                  <div className="space-y-4 p-4 bg-subtlebackground rounded-lg">
                    <h4 className="font-heading text-lg font-semibold text-secondary">Write a Review</h4>
                    
                    <div className="space-y-2">
                      <label className="font-paragraph text-sm font-medium text-secondary">Rating</label>
                      <Select value={reviewRating.toString()} onValueChange={(value) => setReviewRating(parseInt(value))}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 4, 3, 2, 1].map(rating => (
                            <SelectItem key={rating} value={rating.toString()}>
                              <div className="flex items-center gap-2">
                                <span>{rating}</span>
                                <div className="flex">
                                  {[...Array(rating)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 text-primary fill-current" />
                                  ))}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="font-paragraph text-sm font-medium text-secondary">Your Review</label>
                      <Textarea
                        placeholder="Share your experience with this charging station..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>

                    <Button 
                      onClick={handleSubmitReview}
                      disabled={!reviewText.trim() || submittingReview}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                      <MessageSquare className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="font-paragraph text-secondary/70 text-center py-8">
                      No reviews yet. Be the first to share your experience!
                    </p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review._id} className="border-b border-brandaccent/20 pb-4 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-paragraph font-medium text-secondary">{review.reviewerDisplayName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${i < (review.rating || 0) ? 'text-primary fill-current' : 'text-secondary/30'}`} 
                                  />
                                ))}
                              </div>
                              {review.isRecommended && (
                                <Badge className="bg-primary/10 text-primary border-primary/20">
                                  <ThumbsUp className="w-3 h-3 mr-1" />
                                  Recommended
                                </Badge>
                              )}
                            </div>
                          </div>
                          <span className="font-paragraph text-xs text-secondary/60">
                            {new Date(review.submissionTimestamp || '').toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-paragraph text-secondary/80 leading-relaxed">
                          {review.reviewText}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-background border-brandaccent/20">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-secondary">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90" 
                      size="lg"
                      disabled={!isAuthenticated || !station?.isAvailable}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {!isAuthenticated ? 'Sign In to Book' : !station?.isAvailable ? 'Station Unavailable' : 'Book Charging Slot'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-heading text-xl text-secondary">
                        Book Charging Slot
                      </DialogTitle>
                    </DialogHeader>
                    
                    {bookingSuccess ? (
                      <div className="text-center py-8 space-y-4">
                        <CheckCircle className="w-16 h-16 text-primary mx-auto" />
                        <h3 className="font-heading text-lg font-semibold text-secondary">Booking Confirmed!</h3>
                        <p className="font-paragraph text-secondary/70">
                          Your charging slot has been successfully reserved.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="font-paragraph text-sm font-medium text-secondary">Date</label>
                          <Input
                            type="date"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            min={today}
                            className="w-full"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="font-paragraph text-sm font-medium text-secondary">Start Time</label>
                            <Select value={bookingStartTime} onValueChange={setBookingStartTime}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeSlots.map(time => (
                                  <SelectItem key={time} value={time}>{time}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label className="font-paragraph text-sm font-medium text-secondary">End Time</label>
                            <Select value={bookingEndTime} onValueChange={setBookingEndTime}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeSlots.map(time => (
                                  <SelectItem key={time} value={time}>{time}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="bg-subtlebackground p-4 rounded-lg">
                          <h4 className="font-paragraph font-medium text-secondary mb-2">Booking Summary</h4>
                          <div className="space-y-1 text-sm">
                            <p className="font-paragraph text-secondary/70">Station: {station?.stationName}</p>
                            <p className="font-paragraph text-secondary/70">Date: {bookingDate || 'Not selected'}</p>
                            <p className="font-paragraph text-secondary/70">
                              Time: {bookingStartTime && bookingEndTime ? `${bookingStartTime} - ${bookingEndTime}` : 'Not selected'}
                            </p>
                            <p className="font-paragraph text-secondary/70">Rate: ${station?.pricePerKwh}/kWh</p>
                          </div>
                        </div>

                        <Button 
                          onClick={handleSubmitBooking}
                          disabled={!bookingDate || !bookingStartTime || !bookingEndTime || submittingBooking}
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          {submittingBooking ? 'Booking...' : 'Confirm Booking'}
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>

                {station.contactPhone && (
                  <Button variant="outline" className="w-full border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Station
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Location Info */}
            <Card className="bg-background border-brandaccent/20">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-secondary">Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="font-paragraph font-medium text-secondary">{station.stationName}</p>
                  <p className="font-paragraph text-secondary/70">{station.address}</p>
                </div>

                {station.latitude && station.longitude && (
                  <div className="space-y-2">
                    <p className="font-paragraph text-sm text-secondary/70">Coordinates</p>
                    <p className="font-paragraph text-sm font-mono text-secondary">
                      {station.latitude}, {station.longitude}
                    </p>
                  </div>
                )}

                <div className="h-32 bg-brandaccent/20 rounded-lg flex items-center justify-center">
                  <p className="font-paragraph text-secondary/60">Map View</p>
                </div>
              </CardContent>
            </Card>

            {/* Station Stats */}
            <Card className="bg-background border-brandaccent/20">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-secondary">Station Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="font-heading text-2xl font-bold text-primary">{reviews.length}</p>
                    <p className="font-paragraph text-sm text-secondary/70">Reviews</p>
                  </div>
                  <div className="text-center">
                    <p className="font-heading text-2xl font-bold text-primary">
                      {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
                    </p>
                    <p className="font-paragraph text-sm text-secondary/70">Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}