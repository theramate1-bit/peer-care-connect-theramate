import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, ThumbsDown, Flag, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Review {
  id: string;
  client_id: string;
  therapist_id: string;
  session_id?: string;
  overall_rating: number;
  title?: string;
  comment?: string;
  is_anonymous: boolean;
  created_at: string;
  review_status: string;
  is_verified_session: boolean;
  helpful_votes: number;
  unhelpful_votes: number;
  client: {
    first_name: string;
    last_name: string;
  };
}

interface ReviewSystemProps {
  practitionerId: string;
  practitionerName: string;
  sessionId?: string;
  onReviewSubmitted?: (review: Review) => void;
}

const ReviewSystem: React.FC<ReviewSystemProps> = ({
  practitionerId,
  practitionerName,
  sessionId,
  onReviewSubmitted
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({
    overall_rating: 0,
    title: '',
    comment: '',
    is_anonymous: false
  });

  useEffect(() => {
    fetchReviews();
  }, [practitionerId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          client:users!reviews_client_id_fkey(first_name, last_name)
        `)
        .eq('therapist_id', practitionerId)
        .eq('review_status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (newReview.overall_rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          client_id: user.id,
          therapist_id: practitionerId,
          session_id: sessionId,
          overall_rating: newReview.overall_rating,
          title: newReview.title,
          comment: newReview.comment,
          is_anonymous: newReview.is_anonymous,
          review_status: 'pending',
          is_verified_session: !!sessionId
        })
        .select(`
          *,
          client:users!reviews_client_id_fkey(first_name, last_name)
        `)
        .single();

      if (error) throw error;

      toast.success('Review submitted successfully!');
      setReviews(prev => [data, ...prev]);
      setNewReview({ overall_rating: 0, title: '', comment: '', is_anonymous: false });
      setShowForm(false);
      onReviewSubmitted?.(data);

    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const voteReview = async (reviewId: string, isHelpful: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('review_votes')
        .select('id, is_helpful')
        .eq('review_id', reviewId)
        .eq('voter_id', user.id)
        .single();

      if (existingVote) {
        if (existingVote.is_helpful === isHelpful) {
          // Remove vote
          await supabase
            .from('review_votes')
            .delete()
            .eq('id', existingVote.id);
        } else {
          // Update vote
          await supabase
            .from('review_votes')
            .update({ is_helpful })
            .eq('id', existingVote.id);
        }
      } else {
        // Create new vote
        await supabase
          .from('review_votes')
          .insert({
            review_id: reviewId,
            voter_id: user.id,
            is_helpful
          });
      }

      // Refresh reviews to get updated vote counts
      fetchReviews();

    } catch (error) {
      console.error('Error voting on review:', error);
      toast.error('Failed to vote on review');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number, interactive: boolean = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => onRatingChange?.(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const renderReviewForm = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Overall Rating *</Label>
          <div className="mt-2">
            {renderStars(newReview.overall_rating, true, (rating) => 
              setNewReview(prev => ({ ...prev, overall_rating: rating }))
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="title">Review Title</Label>
          <input
            id="title"
            type="text"
            value={newReview.title}
            onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Summarize your experience"
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <Label htmlFor="comment">Your Review</Label>
          <Textarea
            id="comment"
            value={newReview.comment}
            onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
            placeholder="Share your experience with this practitioner..."
            rows={4}
            className="mt-1"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="anonymous"
            checked={newReview.is_anonymous}
            onChange={(e) => setNewReview(prev => ({ ...prev, is_anonymous: e.target.checked }))}
            className="rounded"
          />
          <Label htmlFor="anonymous" className="text-sm">
            Submit anonymously
          </Label>
        </div>

        <div className="flex gap-2">
          <Button onClick={submitReview} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
          <Button variant="outline" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderReview = (review: Review) => (
    <Card key={review.id} className="mb-4">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {review.is_anonymous ? 'A' : review.client.first_name[0]}
              </span>
            </div>
            <div>
              <div className="font-medium">
                {review.is_anonymous ? 'Anonymous' : `${review.client.first_name} ${review.client.last_name}`}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDate(review.created_at)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {review.is_verified_session && (
              <Badge variant="outline" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
            {renderStars(review.overall_rating)}
          </div>
        </div>

        {review.title && (
          <h4 className="font-semibold mb-2">{review.title}</h4>
        )}

        {review.comment && (
          <p className="text-sm text-muted-foreground mb-4">{review.comment}</p>
        )}

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => voteReview(review.id, true)}
              className="h-8 px-2"
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              {review.helpful_votes}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => voteReview(review.id, false)}
              className="h-8 px-2"
            >
              <ThumbsDown className="h-3 w-3 mr-1" />
              {review.unhelpful_votes}
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Flag className="h-3 w-3 mr-1" />
            Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.overall_rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.overall_rating === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.overall_rating === rating).length / reviews.length) * 100 
      : 0
  }));

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/* Review Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Reviews for {practitionerName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{averageRating.toFixed(1)}</div>
              <div className="mb-2">{renderStars(Math.round(averageRating))}</div>
              <div className="text-sm text-muted-foreground">
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-8">{rating}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      {showForm ? (
        renderReviewForm()
      ) : (
        <div className="text-center mb-6">
          <Button onClick={() => setShowForm(true)}>
            Write a Review
          </Button>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold mb-4">All Reviews</h3>
          {reviews.map(renderReview)}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
              <p>Be the first to review {practitionerName}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReviewSystem;
