import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, ThumbsDown, Flag, User, Calendar, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Review {
  id: string;
  overall_rating: number;
  review_text: string;
  review_status: string;
  is_verified_session: boolean;
  helpful_votes: number;
  unhelpful_votes: number;
  created_at: string;
  client_id: string;
  therapist_id: string;
  client_name?: string;
  detailed_ratings?: DetailedRating[];
}

interface DetailedRating {
  rating_type: string;
  rating_value: number;
}

interface ReviewDisplayProps {
  review: Review;
  onReviewUpdated?: () => void;
  showClientName?: boolean;
}

const ReviewDisplay: React.FC<ReviewDisplayProps> = ({
  review,
  onReviewUpdated,
  showClientName = false
}) => {
  const [isVoting, setIsVoting] = useState(false);
  const [isFlagging, setIsFlagging] = useState(false);
  const [userVote, setUserVote] = useState<'helpful' | 'unhelpful' | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleVote = async (voteType: 'helpful' | 'unhelpful') => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to vote on reviews.",
        variant: "destructive"
      });
      return;
    }

    if (user.id === review.client_id) {
      toast({
        title: "Cannot Vote",
        description: "You cannot vote on your own review.",
        variant: "destructive"
      });
      return;
    }

    setIsVoting(true);

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('review_votes')
        .select('*')
        .eq('review_id', review.id)
        .eq('voter_id', user.id)
        .single();

      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from('review_votes')
          .update({ is_helpful: voteType === 'helpful' })
          .eq('id', existingVote.id);

        if (error) throw error;

        // Update local state
        if (existingVote.is_helpful && voteType === 'unhelpful') {
          // Switching from helpful to unhelpful
          review.helpful_votes = Math.max(0, review.helpful_votes - 1);
          review.unhelpful_votes += 1;
        } else if (!existingVote.is_helpful && voteType === 'helpful') {
          // Switching from unhelpful to helpful
          review.unhelpful_votes = Math.max(0, review.unhelpful_votes - 1);
          review.helpful_votes += 1;
        }
      } else {
        // Create new vote
        const { error } = await supabase
          .from('review_votes')
          .insert({
            review_id: review.id,
            voter_id: user.id,
            is_helpful: voteType === 'helpful'
          });

        if (error) throw error;

        // Update local state
        if (voteType === 'helpful') {
          review.helpful_votes += 1;
        } else {
          review.unhelpful_votes += 1;
        }
      }

      setUserVote(voteType);
      onReviewUpdated?.();

      toast({
        title: "Vote Recorded",
        description: `Your ${voteType} vote has been recorded.`,
        variant: "default"
      });

    } catch (error) {
      console.error('Error recording vote:', error);
      toast({
        title: "Error",
        description: "Failed to record your vote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVoting(false);
    }
  };

  const handleFlag = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to flag reviews.",
        variant: "destructive"
      });
      return;
    }

    if (user.id === review.client_id) {
      toast({
        title: "Cannot Flag",
        description: "You cannot flag your own review.",
        variant: "destructive"
      });
      return;
    }

    setIsFlagging(true);

    try {
      const { error } = await supabase
        .from('review_flags')
        .insert({
          review_id: review.id,
          flagged_by: user.id,
          flag_reason: 'Inappropriate content',
          flag_details: 'Review flagged by user'
        });

      if (error) throw error;

      toast({
        title: "Review Flagged",
        description: "Thank you for flagging this review. Our team will review it shortly.",
        variant: "default"
      });

    } catch (error) {
      console.error('Error flagging review:', error);
      toast({
        title: "Error",
        description: "Failed to flag review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsFlagging(false);
    }
  };

  const getRatingTypeLabel = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                {showClientName ? (
                  <span className="font-medium text-gray-900">
                    {review.client_name || 'Anonymous Client'}
                  </span>
                ) : (
                  <span className="font-medium text-gray-900">Anonymous Client</span>
                )}
                {review.is_verified_session && (
                  <Badge variant="secondary" className="text-xs">
                    Verified Session
                  </Badge>
                  )}
                {review.review_status === 'flagged' && (
                  <Badge variant="destructive" className="text-xs">
                    Flagged
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(review.created_at)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(review.created_at)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="flex items-center gap-1">
                {renderStars(review.overall_rating)}
                <span className="text-sm font-medium text-gray-900 ml-1">
                  {review.overall_rating}/5
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Detailed Ratings */}
        {review.detailed_ratings && review.detailed_ratings.length > 0 && (
          <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
            {review.detailed_ratings.map((rating) => (
              <div key={rating.rating_type} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">
                  {getRatingTypeLabel(rating.rating_type)}
                </span>
                <div className="flex items-center gap-1">
                  {renderStars(rating.rating_value)}
                  <span className="text-xs text-gray-500">{rating.rating_value}/5</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Text */}
        <div className="text-gray-700 leading-relaxed">
          {review.review_text}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            {/* Helpful Vote */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('helpful')}
              disabled={isVoting || userVote === 'helpful'}
              className={`flex items-center gap-2 ${
                userVote === 'helpful' ? 'text-green-600 bg-green-50' : ''
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm">{review.helpful_votes}</span>
            </Button>

            {/* Unhelpful Vote */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('unhelpful')}
              disabled={isVoting || userVote === 'unhelpful'}
              className={`flex items-center gap-2 ${
                userVote === 'unhelpful' ? 'text-red-600 bg-red-50' : ''
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              <span className="text-sm">{review.unhelpful_votes}</span>
            </Button>
          </div>

          {/* Flag Button */}
          {user && user.id !== review.client_id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFlag}
              disabled={isFlagging}
              className="text-gray-500 hover:text-red-600"
            >
              <Flag className="w-4 h-4 mr-1" />
              Flag
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewDisplay;
