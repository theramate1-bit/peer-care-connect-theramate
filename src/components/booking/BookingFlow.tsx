import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, User, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { MARKETPLACE_SERVICES, calculatePaymentBreakdown, formatCurrency } from '@/config/payments';

interface BookingFlowProps {
  practitionerId: string;
  practitionerName: string;
  practitionerType: 'sports_therapist' | 'massage_therapist' | 'osteopath';
  onBookingComplete?: (sessionId: string) => void;
  onCancel?: () => void;
}

interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_available: boolean;
}

const BookingFlow: React.FC<BookingFlowProps> = ({
  practitionerId,
  practitionerName,
  practitionerType,
  onBookingComplete,
  onCancel
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  // Get available services for this practitioner type
  const availableServices = MARKETPLACE_SERVICES.filter(service => 
    service.category === practitionerType || service.category === 'general'
  );

  useEffect(() => {
    fetchAvailability();
  }, [practitionerId]);

  const fetchAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('therapist_id', practitionerId)
        .eq('is_available', true);

      if (error) throw error;
      setAvailability(data || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to load availability');
    }
  };

  const getAvailableTimes = (date: Date) => {
    const dayOfWeek = date.getDay();
    const daySlots = availability.filter(slot => slot.day_of_week === dayOfWeek);
    
    const times: string[] = [];
    daySlots.forEach(slot => {
      const startTime = new Date(`2000-01-01T${slot.start_time}`);
      const endTime = new Date(`2000-01-01T${slot.end_time}`);
      const duration = slot.duration_minutes;
      
      let currentTime = new Date(startTime);
      while (currentTime < endTime) {
        times.push(currentTime.toTimeString().slice(0, 5));
        currentTime.setMinutes(currentTime.getMinutes() + duration);
      }
    });
    
    return times.sort();
  };

  const handleBookingSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedService) {
      toast.error('Please complete all required fields');
      return;
    }

    setLoading(true);
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Get service details
      const service = MARKETPLACE_SERVICES.find(s => s.id === selectedService);
      if (!service) {
        throw new Error('Service not found');
      }

      const price = service.prices[0]; // Use first price tier
      const paymentBreakdown = calculatePaymentBreakdown(price.amount);

      // Create session booking
      const { data: session, error: sessionError } = await supabase
        .from('client_sessions')
        .insert({
          therapist_id: practitionerId,
          client_id: user.id,
          client_name: clientInfo.name || user.user_metadata?.full_name || 'Client',
          client_email: clientInfo.email || user.email,
          client_phone: clientInfo.phone,
          session_date: selectedDate.toISOString().split('T')[0],
          start_time: selectedTime,
          duration_minutes: 60,
          session_type: service.name,
          status: 'scheduled',
          price: price.amount / 100, // Convert from pence to pounds
          payment_status: 'pending',
          notes: clientInfo.notes,
          platform_fee_amount: paymentBreakdown.marketplaceFee / 100,
          practitioner_amount: paymentBreakdown.practitionerPayout / 100
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Create payment intent
      const { data: payment, error: paymentError } = await supabase.functions.invoke('stripe-payment', {
        body: {
          amount: price.amount,
          currency: price.currency,
          payment_type: 'one_time',
          therapist_id: practitionerId,
          session_id: session.id,
          metadata: {
            service_name: service.name,
            practitioner_name: practitionerName,
            session_date: selectedDate.toISOString().split('T')[0],
            session_time: selectedTime
          }
        }
      });

      if (paymentError) throw paymentError;

      toast.success('Booking created successfully!');
      onBookingComplete?.(session.id);
      
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Service & Time</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="service">Service Type</Label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a service" />
              </SelectTrigger>
              <SelectContent>
                {availableServices.map(service => (
                  <SelectItem key={service.id} value={service.id}>
                    <div className="flex justify-between items-center w-full">
                      <span>{service.name}</span>
                      <Badge variant="secondary">
                        {formatCurrency(service.prices[0].amount, service.prices[0].currency)}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Select Date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>

          {selectedDate && (
            <div>
              <Label htmlFor="time">Available Times</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a time" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableTimes(selectedDate).map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Client Information</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={clientInfo.name}
              onChange={(e) => setClientInfo(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={clientInfo.email}
              onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={clientInfo.phone}
              onChange={(e) => setClientInfo(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={clientInfo.notes}
              onChange={(e) => setClientInfo(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any specific requirements or notes for your session"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const service = MARKETPLACE_SERVICES.find(s => s.id === selectedService);
    const price = service?.prices[0];
    const paymentBreakdown = price ? calculatePaymentBreakdown(price.amount) : null;

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
          
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{practitionerName}</span>
                  <Badge variant="outline">{practitionerType.replace('_', ' ')}</Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{selectedDate?.toLocaleDateString()} at {selectedTime}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Session Duration: 60 minutes</span>
                </div>

                {service && price && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{service.name}</span>
                      <span className="font-semibold">{formatCurrency(price.amount, price.currency)}</span>
                    </div>
                    
                    {paymentBreakdown && (
                      <div className="text-sm text-muted-foreground mt-2">
                        <div className="flex justify-between">
                          <span>Platform fee (3%)</span>
                          <span>{formatCurrency(paymentBreakdown.marketplaceFee, price.currency)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Practitioner receives</span>
                          <span>{formatCurrency(paymentBreakdown.practitionerPayout, price.currency)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Book Session with {practitionerName}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Step {step} of 3</span>
            <div className="flex-1 bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={step === 1 ? onCancel : () => setStep(step - 1)}
              disabled={loading}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>

            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && (!selectedDate || !selectedTime || !selectedService)) ||
                  (step === 2 && (!clientInfo.name || !clientInfo.email))
                }
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleBookingSubmit}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                {loading ? 'Creating Booking...' : 'Complete Booking'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingFlow;
