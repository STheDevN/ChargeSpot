import React, { useState, useEffect } from 'react'; // Added React for best practice
import { useMember } from '../../integrations/index.js';
import { BaseCrudService } from '../../integrations/index.js';
// The 'Reviews' import is removed as it was only used for TypeScript types
import { Button } from '../ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx';
import { Badge } from '../ui/badge.jsx';
import { Input } from '../ui/input.jsx';
import { Label } from '../ui/label.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.jsx';
import Header from '../layout/Header.jsx';
import Footer from '../layout/Footer.jsx';
import { 
  User, 
  Mail, 
  Calendar, 
  Star,
  MessageSquare,
  Zap,
  MapPin,
  Settings,
  Activity,
  Award,
  Leaf
} from 'lucide-react';

export default function ProfilePage() {
  const { member } = useMember();
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [nickname, setNickname] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        const reviewsData = await BaseCrudService.getAll('reviews'); // Removed <Reviews> generic
        const memberDisplayName = member?.profile?.nickname || member?.contact?.firstName || 'Anonymous User';
        const filteredReviews = reviewsData.items.filter(
          review => review.reviewerDisplayName === memberDisplayName
        );
        setUserReviews(filteredReviews);
      } catch (error) {
        console.error('Error fetching user reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    if (member) {
      setNickname(member.profile?.nickname || '');
      setFirstName(member.contact?.firstName || '');
      setLastName(member.contact?.lastName || '');
      fetchUserReviews();
    }
  }, [member]);

  const averageRating = userReviews.length > 0 
    ? userReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / userReviews.length 
    : 0;

  const totalChargingSessions = Math.floor(Math.random() * 50) + 10; // Mock data
  const totalEnergyCharged = Math.floor(Math.random() * 1000) + 200; // Mock data
  const co2Saved = Math.floor(totalEnergyCharged * 0.4); // Mock calculation

  const getInitials = () => {
    const first = member?.contact?.firstName || member?.profile?.nickname || '';
    const last = member?.contact?.lastName || '';
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || 'U';
  };

  const getMemberSince = () => {
    if (member?._createdDate) {
      return new Date(member._createdDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
    }
    return 'Recently';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Profile Header */}
      <section className="w-full max-w-[120rem] mx-auto px-6 py-16 bg-gradient-to-r from-subtlebackground to-brandaccent/20">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <Avatar className="w-24 h-24 border-4 border-primary">
            <AvatarImage src={member?.profile?.photo?.url} alt="Profile" />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center md:text-left space-y-2">
            <h1 className="font-heading text-4xl font-bold text-secondary">
              {member?.profile?.nickname || member?.contact?.firstName || 'EV Driver'}
            </h1>
            <p className="font-paragraph text-xl text-secondary/70">
              {member?.loginEmail}
            </p>
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Calendar className="w-3 h-3 mr-1" />
                Member since {getMemberSince()}
              </Badge>
              {userReviews.length > 0 && (
                <Badge className="bg-brandaccent/20 text-secondary border-brandaccent/40">
                  <Star className="w-3 h-3 mr-1" />
                  {averageRating.toFixed(1)} avg rating
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="w-full max-w-[120rem] mx-auto px-6 py-16">
        <Tabs defaultValue="activity" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>



          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-8">
            <Card className="bg-background border-brandaccent/20">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-secondary">Charging History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-subtlebackground rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <Zap className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-paragraph font-medium text-secondary">Downtown Station</p>
                          <p className="font-paragraph text-sm text-secondary/70">
                            {new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-paragraph font-medium text-secondary">{25 + i * 5} kWh</p>
                        <p className="font-paragraph text-sm text-secondary/70">${(0.35 * (25 + i * 5)).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-8">
            <Card className="bg-background border-brandaccent/20">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-secondary">My Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse space-y-2">
                        <div className="h-4 bg-brandaccent/20 rounded w-1/4"></div>
                        <div className="h-16 bg-brandaccent/20 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : userReviews.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-secondary/30 mx-auto mb-4" />
                    <p className="font-paragraph text-secondary/70">You haven't written any reviews yet.</p>
                    <p className="font-paragraph text-sm text-secondary/60 mt-2">
                      Visit charging stations and share your experience with the community!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {userReviews.map((review) => (
                      <div key={review._id} className="border-b border-brandaccent/20 pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
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
                                Recommended
                              </Badge>
                            )}
                          </div>
                          <span className="font-paragraph text-xs text-secondary/60">
                            {new Date(review.submissionTimestamp || '').toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-paragraph text-secondary/80 leading-relaxed">
                          {review.reviewText}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-8">
            <Card className="bg-background border-brandaccent/20">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-secondary">Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nickname">Display Name</Label>
                    <Input
                      id="nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      disabled={!editMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={member?.loginEmail || ''}
                      disabled
                      className="bg-secondary/5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={!editMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  {editMode ? (
                    <>
                      <Button 
                        onClick={() => setEditMode(false)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Save Changes
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setEditMode(false)}
                        className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={() => setEditMode(true)}
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background border-brandaccent/20">
              <CardHeader>
                <CardTitle className="font-heading text-xl text-secondary">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-paragraph font-medium text-secondary">Member Since</p>
                    <p className="font-paragraph text-sm text-secondary/70">{getMemberSince()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-paragraph font-medium text-secondary">Account Status</p>
                    <p className="font-paragraph text-sm text-secondary/70">
                      {member?.status === 'APPROVED' ? 'Active' : member?.status || 'Unknown'}
                    </p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {member?.status === 'APPROVED' ? 'Verified' : 'Pending'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-paragraph font-medium text-secondary">Email Verified</p>
                    <p className="font-paragraph text-sm text-secondary/70">
                      {member?.loginEmailVerified ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <Badge className={member?.loginEmailVerified ? 'bg-primary/10 text-primary border-primary/20' : 'bg-red-100 text-red-600 border-red-200'}>
                    {member?.loginEmailVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      <Footer />
    </div>
  );
}