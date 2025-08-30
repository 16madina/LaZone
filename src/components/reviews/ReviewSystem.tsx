import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, ThumbsUp, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  listing_id?: string;
  review_type: 'listing' | 'agent';
  rating: number;
  title?: string;
  comment?: string;
  created_at: string;
  reviewer?: {
    name: string;
    avatar?: string;
  };
  listing?: {
    title: string;
  };
}

interface ReviewSystemProps {
  userId?: string;
  listingId?: string;
  type?: 'agent' | 'listing';
  showAddReview?: boolean;
  className?: string;
}

export function ReviewSystem({ 
  userId, 
  listingId, 
  type = 'agent', 
  showAddReview = true, 
  className 
}: ReviewSystemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchReviews();
    }
  }, [userId]);

  const fetchReviews = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          listings!left (title)
        `)
        .eq('reviewed_user_id', userId)
        .eq('review_type', type)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les avis',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!user || !userId || newReview.rating === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une note',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          reviewer_id: user.id,
          reviewed_user_id: userId,
          listing_id: listingId,
          review_type: type,
          rating: newReview.rating,
          title: newReview.title.trim() || null,
          comment: newReview.comment.trim() || null
        });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Votre avis a été publié'
      });

      // Reset form and refresh reviews
      setNewReview({ rating: 0, title: '', comment: '' });
      setShowAddForm(false);
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de publier l\'avis',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "w-4 h-4 transition-colors",
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300",
              interactive && "cursor-pointer hover:text-yellow-400"
            )}
            onClick={() => interactive && onRatingChange?.(star)}
          />
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 
      : 0
  }));

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Avis et évaluations</span>
            {showAddReview && user && (
              <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Star className="w-4 h-4 mr-2" />
                    Laisser un avis
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Laisser un avis</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Note</Label>
                      <div className="mt-2">
                        {renderStars(newReview.rating, true, (rating) => 
                          setNewReview(prev => ({ ...prev, rating }))
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="review-title">Titre (optionnel)</Label>
                      <Input
                        id="review-title"
                        placeholder="Résumez votre expérience..."
                        value={newReview.title}
                        onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="review-comment">Commentaire (optionnel)</Label>
                      <Textarea
                        id="review-comment"
                        placeholder="Partagez votre expérience en détail..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                        rows={4}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAddForm(false)}
                      >
                        Annuler
                      </Button>
                      <Button 
                        onClick={submitReview}
                        disabled={submitting || newReview.rating === 0}
                      >
                        {submitting ? 'Publication...' : 'Publier l\'avis'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Average rating */}
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="mb-2">
                {renderStars(Math.round(averageRating))}
              </div>
              <p className="text-sm text-muted-foreground">
                Basé sur {reviews.length} avis
              </p>
            </div>

            {/* Rating distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-2">{rating}</span>
                  <Star className="w-3 h-3 text-yellow-400" />
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews list */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Aucun avis pour le moment. Soyez le premier à laisser un avis !
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">Utilisateur anonyme</p>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {review.title && (
                      <h4 className="font-medium mb-2">{review.title}</h4>
                    )}

                    {review.comment && (
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        {review.comment}
                      </p>
                    )}

                    {review.listing && (
                      <Badge variant="outline" className="text-xs">
                        {review.listing.title}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}