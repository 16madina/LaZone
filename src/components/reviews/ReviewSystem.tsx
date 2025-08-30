import React, { useState, useEffect } from 'react';
import { Star, User, MessageSquare, ThumbsUp, Flag, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  review_type: string;
  created_at: string;
  reviewer: {
    first_name?: string;
    last_name?: string;
    user_type: string;
  };
  listing?: {
    title: string;
    id: string;
  };
}

interface ReviewSystemProps {
  targetUserId?: string;
  listingId?: string;
  reviewType?: 'listing' | 'agent' | 'transaction';
  showAddReview?: boolean;
  compact?: boolean;
}

const ReviewSystem: React.FC<ReviewSystemProps> = ({
  targetUserId,
  listingId,
  reviewType = 'listing',
  showAddReview = true,
  compact = false
}) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [targetUserId, listingId, reviewType]);

  const fetchReviews = async () => {
    setLoading(true);
    
    let query = supabase
      .from('reviews')
      .select('*');

    if (targetUserId) {
      query = query.eq('reviewed_user_id', targetUserId);
    }
    
    if (listingId) {
      query = query.eq('listing_id', listingId);
    }
    
    query = query
      .eq('review_type', reviewType)
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching reviews:', error);
      setLoading(false);
      return;
    }

    const formattedReviews = data?.map(review => ({
      ...review,
      reviewer: { first_name: 'Utilisateur', last_name: '', user_type: 'particulier' },
      listing: null
    })) || [];

    setReviews(formattedReviews);
    setTotalReviews(formattedReviews.length);
    
    if (formattedReviews.length > 0) {
      const avg = formattedReviews.reduce((sum, review) => sum + review.rating, 0) / formattedReviews.length;
      setAverageRating(avg);
    } else {
      setAverageRating(0);
    }
    
    setLoading(false);
  };

  const submitReview = async () => {
    if (!user || newReview.rating === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez donner une note.",
        variant: "destructive"
      });
      return;
    }

    if (!targetUserId && !listingId) {
      toast({
        title: "Erreur",
        description: "Cible de l'avis non définie.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    const reviewData: any = {
      reviewer_id: user.id,
      rating: newReview.rating,
      title: newReview.title || null,
      comment: newReview.comment || null,
      review_type: reviewType
    };

    if (targetUserId) {
      reviewData.reviewed_user_id = targetUserId;
    }

    if (listingId) {
      reviewData.listing_id = listingId;
      // Pour les avis de listing, on récupère le user_id du propriétaire
      const { data: listing } = await supabase
        .from('listings')
        .select('user_id')
        .eq('id', listingId)
        .single();
      
      if (listing) {
        reviewData.reviewed_user_id = listing.user_id;
      }
    }

    const { error } = await supabase
      .from('reviews')
      .insert([reviewData]);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de publier l'avis.",
        variant: "destructive"
      });
      console.error('Error submitting review:', error);
    } else {
      toast({
        title: "Avis publié",
        description: "Votre avis a été publié avec succès."
      });
      
      setNewReview({ rating: 0, title: '', comment: '' });
      setShowReviewDialog(false);
      fetchReviews();
    }
    
    setIsSubmitting(false);
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRatingChange?.(star)}
          />
        ))}
      </div>
    );
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {renderStars(averageRating)}
        <span className="text-sm font-medium">
          {averageRating > 0 ? averageRating.toFixed(1) : '--'}
        </span>
        <span className="text-sm text-muted-foreground">
          ({totalReviews})
        </span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Avis et évaluations
          </CardTitle>
          {showAddReview && user && (
            <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Laisser un avis
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Laisser un avis</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Note *</Label>
                    <div className="mt-2">
                      {renderStars(newReview.rating, true, (rating) => 
                        setNewReview(prev => ({ ...prev, rating }))
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="title">Titre (optionnel)</Label>
                    <Input
                      id="title"
                      value={newReview.title}
                      onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Résumé de votre expérience"
                    />
                  </div>

                  <div>
                    <Label htmlFor="comment">Commentaire (optionnel)</Label>
                    <Textarea
                      id="comment"
                      value={newReview.comment}
                      onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Partagez votre expérience..."
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowReviewDialog(false)}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button 
                      onClick={submitReview}
                      disabled={isSubmitting || newReview.rating === 0}
                      className="flex-1"
                    >
                      {isSubmitting ? 'Publication...' : 'Publier'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {/* Rating Summary */}
        {totalReviews > 0 && (
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
              {renderStars(averageRating)}
            </div>
            <div className="text-sm text-muted-foreground">
              Basé sur {totalReviews} avis
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun avis pour le moment</p>
            <p className="text-sm text-muted-foreground mt-1">
              Soyez le premier à laisser un avis !
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <div key={review.id}>
                <div className="flex items-start gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {review.reviewer.first_name} {review.reviewer.last_name}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {review.reviewer.user_type === 'agence' ? 'Agence' : 'Particulier'}
                          </Badge>
                        </div>
                        {renderStars(review.rating)}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(review.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      
                      <Button variant="ghost" size="sm" className="p-1">
                        <Flag className="w-4 h-4" />
                      </Button>
                    </div>

                    {review.title && (
                      <h4 className="font-medium text-sm mt-3 mb-1">
                        {review.title}
                      </h4>
                    )}

                    {review.comment && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {review.comment}
                      </p>
                    )}

                    {review.listing && (
                      <div className="mt-3 p-2 bg-muted/50 rounded text-xs">
                        <span className="text-muted-foreground">Propriété: </span>
                        <span className="font-medium">{review.listing.title}</span>
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <Button variant="ghost" size="sm" className="text-xs h-8">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Utile
                      </Button>
                    </div>
                  </div>
                </div>
                
                {index < reviews.length - 1 && (
                  <Separator className="mt-6" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewSystem;