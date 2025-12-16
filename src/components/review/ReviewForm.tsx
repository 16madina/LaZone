import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ReviewFormProps {
  reviewedUserId: string;
  currentUserId: string;
  existingReview?: {
    id: string;
    rating: number;
    comment: string | null;
  } | null;
  onReviewSubmitted: () => void;
}

export const ReviewForm = ({ 
  reviewedUserId, 
  currentUserId, 
  existingReview,
  onReviewSubmitted 
}: ReviewFormProps) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une note',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from('user_reviews')
          .update({ rating, comment: comment || null })
          .eq('id', existingReview.id);

        if (error) throw error;
        toast({ title: 'Avis modifié avec succès' });
      } else {
        // Create new review
        const { error } = await supabase
          .from('user_reviews')
          .insert({
            reviewer_id: currentUserId,
            reviewed_user_id: reviewedUserId,
            rating,
            comment: comment || null,
          });

        if (error) throw error;
        toast({ title: 'Avis publié avec succès' });
      }
      
      onReviewSubmitted();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de publier l\'avis',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-card rounded-xl border border-border space-y-4">
      <h4 className="font-medium text-sm">
        {existingReview ? 'Modifier votre avis' : 'Laisser un avis'}
      </h4>
      
      {/* Star Rating */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= (hoveredRating || rating)
                  ? 'text-primary fill-primary'
                  : 'text-muted-foreground'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {rating > 0 ? `${rating}/5` : 'Sélectionnez une note'}
        </span>
      </div>

      {/* Comment */}
      <Textarea
        placeholder="Partagez votre expérience (optionnel)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
      />

      <Button 
        onClick={handleSubmit} 
        disabled={submitting || rating === 0}
        className="w-full gradient-primary"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Publication...
          </>
        ) : existingReview ? (
          'Modifier mon avis'
        ) : (
          'Publier mon avis'
        )}
      </Button>
    </div>
  );
};