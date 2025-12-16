import { Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    reviewer: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  };
}

export const ReviewCard = ({ review }: ReviewCardProps) => {
  return (
    <div className="p-4 bg-card rounded-xl border border-border">
      <div className="flex items-start gap-3">
        <img
          src={review.reviewer?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop'}
          alt={review.reviewer?.full_name || 'Utilisateur'}
          className="w-10 h-10 rounded-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop';
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm">{review.reviewer?.full_name || 'Utilisateur'}</p>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: fr })}
            </span>
          </div>
          
          {/* Stars */}
          <div className="flex items-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= review.rating 
                    ? 'text-primary fill-primary' 
                    : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
          
          {review.comment && (
            <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
          )}
        </div>
      </div>
    </div>
  );
};