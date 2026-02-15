import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  Receipt,
  FileText,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '@/config/payments';

interface Payment {
  id: string;
  user_id: string;
  therapist_id?: string;
  amount: number;
  currency: string;
  status: string;
  payment_type: string;
  created_at: string;
  updated_at: string;
  stripe_payment_intent_id?: string;
  description?: string;
  metadata?: any;
  therapist_name?: string;
  service_type?: string;
}

interface PaymentFilters {
  status: string;
  paymentType: string;
  dateRange: string;
  amountRange: string;
  therapistId: string;
}

const PaymentHistory: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PaymentFilters>({
    status: '',
    paymentType: '',
    dateRange: '',
    amountRange: '',
    therapistId: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  useEffect(() => {
    if (user) {
      loadPayments();
    }
  }, [user, filters]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('payments')
        .select(`
          *,
          therapist:users!payments_therapist_id_fkey(
            first_name,
            last_name
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.paymentType) {
        query = query.eq('payment_type', filters.paymentType);
      }
      if (filters.therapistId) {
        query = query.eq('therapist_id', filters.therapistId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process the data to include therapist names
      const processedPayments = (data || []).map(payment => ({
        ...payment,
        therapist_name: payment.therapist 
          ? `${payment.therapist.first_name} ${payment.therapist.last_name}`
          : 'Unknown Therapist'
      }));

      // Apply additional filters
      let filteredPayments = processedPayments;
      
      if (filters.dateRange) {
        const now = new Date();
        const daysAgo = parseInt(filters.dateRange);
        const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        
        filteredPayments = filteredPayments.filter(payment => 
          new Date(payment.created_at) >= cutoffDate
        );
      }

      if (filters.amountRange) {
        const [min, max] = filters.amountRange.split('-').map(Number);
        filteredPayments = filteredPayments.filter(payment => {
          if (max) {
            return payment.amount >= min && payment.amount <= max;
          }
          return payment.amount >= min;
        });
      }

      setPayments(filteredPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast({
        title: "Error",
        description: "Failed to load payment history. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: keyof PaymentFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      paymentType: '',
      dateRange: '',
      amountRange: '',
      therapistId: ''
    });
  };

  const filteredPayments = payments.filter(payment => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const description = payment.description?.toLowerCase() || '';
      const therapistName = payment.therapist_name?.toLowerCase() || '';
      const serviceType = payment.service_type?.toLowerCase() || '';
      
      if (!description.includes(query) && !therapistName.includes(query) && !serviceType.includes(query)) {
        return false;
      }
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <Badge className="bg-green-100 text-green-800">✓ Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">✗ Failed</Badge>;
      case 'canceled':
        return <Badge className="bg-gray-100 text-gray-800">✗ Canceled</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">🔄 Processing</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'canceled':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'subscription':
        return <TrendingUp className="h-4 w-4" />;
      case 'one_time':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Receipt className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotals = () => {
    const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const successful = payments.filter(p => p.status === 'succeeded').reduce((sum, p) => sum + p.amount, 0);
    const pending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    const failed = payments.filter(p => p.status === 'failed').reduce((sum, p) => sum + p.amount, 0);

    return { total, successful, pending, failed };
  };

  const exportPayments = () => {
    const csvContent = [
      ['Date', 'Description', 'Amount', 'Status', 'Type', 'Therapist', 'Payment ID'],
      ...filteredPayments.map(payment => [
        formatDate(payment.created_at),
        payment.description || 'N/A',
        formatCurrency(payment.amount * 100),
        payment.status,
        payment.payment_type,
        payment.therapist_name || 'N/A',
        payment.stripe_payment_intent_id || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Payment history has been exported to CSV",
    });
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment History
            </h1>
            <p className="text-gray-600">
              View and manage all your payment transactions
            </p>
          </div>
          <div className="flex space-x-2 mt-4 lg:mt-0">
            <Button variant="outline" onClick={exportPayments}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => loadPayments()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totals.total * 100)}</div>
              <p className="text-xs text-muted-foreground">
                {payments.length} total payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totals.successful * 100)}
              </div>
              <p className="text-xs text-muted-foreground">
                {payments.filter(p => p.status === 'succeeded').length} payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(totals.pending * 100)}
              </div>
              <p className="text-xs text-muted-foreground">
                {payments.filter(p => p.status === 'pending').length} payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totals.failed * 100)}
              </div>
              <p className="text-xs text-muted-foreground">
                {payments.filter(p => p.status === 'failed').length} payments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search payments by description, therapist, or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Button onClick={clearFilters} variant="ghost">
              Clear All
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="succeeded">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Type</Label>
                <Select value={filters.paymentType} onValueChange={(value) => handleFilterChange('paymentType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="one_time">One-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All time</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 3 months</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amount Range</Label>
                <Select value={filters.amountRange} onValueChange={(value) => handleFilterChange('amountRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any amount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any amount</SelectItem>
                    <SelectItem value="0-50">Under £50</SelectItem>
                    <SelectItem value="50-100">£50-100</SelectItem>
                    <SelectItem value="100-200">£100-200</SelectItem>
                    <SelectItem value="200-999">£200+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Therapist</Label>
                <Input
                  placeholder="Therapist name"
                  value={filters.therapistId}
                  onChange={(e) => handleFilterChange('therapistId', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `Showing ${filteredPayments.length} of ${payments.length} payments`}
          </p>
        </div>

        {/* Payments List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Receipt className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <Card key={payment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(payment.status)}
                        {getStatusBadge(payment.status)}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {getPaymentTypeIcon(payment.payment_type)}
                        <Badge variant="outline">{payment.payment_type}</Badge>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {formatCurrency(payment.amount * 100)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(payment.created_at)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Description</Label>
                      <p className="text-sm font-medium">
                        {payment.description || 'No description provided'}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-500">Therapist</Label>
                      <p className="text-sm font-medium">
                        {payment.therapist_name || 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-500">Payment ID</Label>
                      <p className="text-sm font-mono text-gray-600">
                        {payment.stripe_payment_intent_id || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowPaymentDetails(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    
                    {payment.stripe_payment_intent_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://dashboard.stripe.com/payments/${payment.stripe_payment_intent_id}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Stripe
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {showPaymentDetails && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Payment Details
              </CardTitle>
              <CardDescription>
                Detailed information about this payment transaction
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Amount</Label>
                  <p className="text-lg font-semibold">
                    {formatCurrency(selectedPayment.amount * 100)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Status</Label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedPayment.status)}
                    {getStatusBadge(selectedPayment.status)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Payment Type</Label>
                  <p className="text-sm font-medium capitalize">
                    {selectedPayment.payment_type.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Currency</Label>
                  <p className="text-sm font-medium uppercase">
                    {selectedPayment.currency}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Created</Label>
                  <p className="text-sm font-medium">
                    {formatDate(selectedPayment.created_at)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Updated</Label>
                  <p className="text-sm font-medium">
                    {formatDate(selectedPayment.updated_at)}
                  </p>
                </div>
              </div>

              {selectedPayment.description && (
                <div>
                  <Label className="text-sm text-gray-500">Description</Label>
                  <p className="text-sm font-medium">
                    {selectedPayment.description}
                  </p>
                </div>
              )}

              {selectedPayment.therapist_name && (
                <div>
                  <Label className="text-sm text-gray-500">Therapist</Label>
                  <p className="text-sm font-medium">
                    {selectedPayment.therapist_name}
                  </p>
                </div>
              )}

              {selectedPayment.stripe_payment_intent_id && (
                <div>
                  <Label className="text-sm text-gray-500">Stripe Payment Intent</Label>
                  <p className="text-sm font-mono text-gray-600 break-all">
                    {selectedPayment.stripe_payment_intent_id}
                  </p>
                </div>
              )}

              {selectedPayment.metadata && Object.keys(selectedPayment.metadata).length > 0 && (
                <div>
                  <Label className="text-sm text-gray-500">Metadata</Label>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(selectedPayment.metadata, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentDetails(false)}
                >
                  Close
                </Button>
                
                {selectedPayment.stripe_payment_intent_id && (
                  <Button
                    onClick={() => window.open(`https://dashboard.stripe.com/payments/${selectedPayment.stripe_payment_intent_id}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View in Stripe
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
