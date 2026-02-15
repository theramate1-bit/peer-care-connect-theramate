import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Star, Filter, SortAsc, SortDesc } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ReviewDisplay from './ReviewDisplay';
import { useToast } from '@/hooks/use-toast';

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

interface ReviewsListProps {
  therapistId: string;
  showFilters?: boolean;
  maxReviews?: number;
  showClientNames?: boolean;
}

type SortOption = 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating' | 'most_helpful';
type FilterOption = 'all' | 'verified' | 'unverified';

const ReviewsList: React.FC<ReviewsListProps> = ({
  therapistId,
  showFilters = true,
  maxReviews = 10,
  showClientNames = false
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  const reviewsPerPage = maxReviews;

  useEffect(() => {
    fetchReviews();
  }, [therapistId, sortBy, filterBy, currentPage]);

  const fetchReviews = async () => {
    setLoading(true);

    try {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          detailed_ratings (
            rating_type,
            rating_value
          )
        `)
        .eq('therapist_id', therapistId)
        .eq('review_status', 'approved');

      // Apply filters
      if (filterBy === 'verified') {
        query = query.eq('is_verified_session', true);
      } else if (filterBy === 'unverified') {
        query = query.eq('is_verified_session', false);
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'highest_rating':
          query = query.order('overall_rating', { ascending: false });
          break;
        case 'lowest_rating':
          query = query.order('overall_rating', { ascending: true });
          break;
        case 'most_helpful':
          query = query.order('helpful_votes', { ascending: false });
          break;
      }

      // Apply pagination
      const from = (currentPage - 1) * reviewsPerPage;
      const to = from + reviewsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Get client names if needed
      let reviewsWithNames = data || [];
      if (showClientNames && data) {
        const clientIds = [...new Set(data.map(r => r.client_id))];
        const { data: userData } = await supabase
          .from('users')
          .select('id, first_name, last_name')
          .in('id', clientIds);

        if (userData) {
          const userMap = new Map(userData.map(u => [u.id, `${u.first_name} ${u.last_name}`]));
          reviewsWithNames = data.map(review => ({
            ...review,
            client_name: userMap.get(review.client_id)
          }));
        }
      }

      if (currentPage === 1) {
        setReviews(reviewsWithNames);
      } else {
        setReviews(prev => [...prev, ...reviewsWithNames]);
      }

      setTotalReviews(count || 0);
      setHasMore((data?.length || 0) === reviewsPerPage);

    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load reviews. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleReviewUpdated = () => {
    // Refresh reviews to get updated vote counts
    fetchReviews();
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.overall_rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.overall_rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const renderRatingDistribution = () => {
    const distribution = getRatingDistribution();
    const total = reviews.length;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map(rating => (
          <div key={rating} className="flex items-center gap-2">
            <div className="flex items-center gap-1 w-8">
              <span className="text-sm text-gray-600">{rating}</span>
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full"
                style={{
                  width: `${total > 0 ? (distribution[rating as keyof typeof distribution] / total) * 100 : 0}%`
                }}
              />
            </div>
            <span className="text-xs text-gray-500 w-8 text-right">
              {distribution[rating as keyof typeof distribution]}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading && currentPage === 1) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            Reviews & Ratings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{getAverageRating()}</div>
              <div className="flex justify-center my-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= parseFloat(getAverageRating())
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600">
                Based on {totalReviews} reviews
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="md:col-span-2">
              <h4 className="font-medium text-gray-900 mb-3">Rating Distribution</h4>
              {renderRatingDistribution()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sorting */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reviews</SelectItem>
                    <SelectItem value="verified">Verified Only</SelectItem>
                    <SelectItem value="unverified">Unverified Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                {sortBy.includes('asc') ? (
                  <SortAsc className="w-4 h-4 text-gray-500" />
                ) : (
                  <SortDesc className="w-4 h-4 text-gray-500" />
                )}
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="highest_rating">Highest Rating</SelectItem>
                    <SelectItem value="lowest_rating">Lowest Rating</SelectItem>
                    <SelectItem value="most_helpful">Most Helpful</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No reviews yet. Be the first to share your experience!
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <ReviewDisplay
              key={review.id}
              review={review}
              onReviewUpdated={handleReviewUpdated}
              showClientName={showClientNames}
            />
          ))
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More Reviews'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsList;
