import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Star, Search, Filter, ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ReviewSystem from '@/components/reviews/ReviewSystem';

interface Practitioner {
  id: string;
  first_name: string;
  last_name: string;
  user_role: 'sports_therapist' | 'massage_therapist' | 'osteopath';
  average_rating: number;
  total_reviews: number;
}

const Reviews: React.FC = () => {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [filteredPractitioners, setFilteredPractitioners] = useState<Practitioner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPractitioner, setSelectedPractitioner] = useState<Practitioner | null>(null);

  useEffect(() => {
    fetchPractitioners();
  }, []);

  useEffect(() => {
    filterPractitioners();
  }, [practitioners, searchTerm, selectedType]);

  const fetchPractitioners = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          first_name,
          last_name,
          user_role,
          average_rating,
          total_reviews
        `)
        .in('user_role', ['sports_therapist', 'massage_therapist', 'osteopath'])
        .eq('is_active', true)
        .gt('total_reviews', 0); // Only show practitioners with reviews

      if (error) throw error;
      setPractitioners(data || []);
    } catch (error) {
      console.error('Error fetching practitioners:', error);
      toast.error('Failed to load practitioners');
    } finally {
      setLoading(false);
    }
  };

  const filterPractitioners = () => {
    let filtered = practitioners;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(p => p.user_role === selectedType);
    }

    setFilteredPractitioners(filtered);
  };

  const getRoleDisplayName = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'sports_therapist': return 'bg-blue-100 text-blue-800';
      case 'massage_therapist': return 'bg-green-100 text-green-800';
      case 'osteopath': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderPractitionerCard = (practitioner: Practitioner) => (
    <Card key={practitioner.id} className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">
              {practitioner.first_name} {practitioner.last_name}
            </h3>
            <Badge className={`${getRoleColor(practitioner.user_role)} mt-1`}>
              {getRoleDisplayName(practitioner.user_role)}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{practitioner.average_rating.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">
              {practitioner.total_reviews} review{practitioner.total_reviews !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {renderStars(Math.round(practitioner.average_rating))}
            <span className="text-sm text-muted-foreground">
              {practitioner.average_rating.toFixed(1)} out of 5
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedPractitioner(practitioner)}
          >
            View Reviews
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (selectedPractitioner) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => setSelectedPractitioner(null)}
            className="mb-4"
          >
            ← Back to All Practitioners
          </Button>
          <h1 className="text-3xl font-bold mb-2">
            Reviews for {selectedPractitioner.first_name} {selectedPractitioner.last_name}
          </h1>
        </div>
        
        <ReviewSystem
          practitionerId={selectedPractitioner.id}
          practitionerName={`${selectedPractitioner.first_name} ${selectedPractitioner.last_name}`}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Practitioner Reviews</h1>
        <p className="text-muted-foreground">
          Read reviews and ratings from clients about their experiences
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search practitioners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sports_therapist">Sports Therapist</SelectItem>
                <SelectItem value="massage_therapist">Massage Therapist</SelectItem>
                <SelectItem value="osteopath">Osteopath</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPractitioners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPractitioners.map(renderPractitionerCard)}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No practitioners found</h3>
              <p>Try adjusting your search criteria or filters</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {!loading && filteredPractitioners.length > 0 && (
        <div className="mt-8 text-center text-muted-foreground">
          Showing {filteredPractitioners.length} of {practitioners.length} practitioners with reviews
        </div>
      )}
    </div>
  );
};

export default Reviews;
