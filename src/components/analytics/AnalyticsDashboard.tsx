import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart3, 
  PieChart, 
  LineChart,
  Calendar,
  DollarSign,
  Target,
  Users,
  Clock,
  Star,
  AlertTriangle,
  Download,
  RefreshCw,
  Settings,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PerformanceMetrics {
  project_completion_rate: number;
  average_project_duration: number;
  client_satisfaction_score: number;
  response_time_hours: number;
  project_success_rate: number;
  total_projects_completed: number;
  total_revenue: number;
}

interface FinancialAnalytics {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  profit_margin: number;
  average_project_value: number;
  payment_collection_rate: number;
  outstanding_invoices: number;
}

interface EngagementAnalytics {
  login_frequency: number;
  session_duration_minutes: number;
  features_used: string[];
  messages_sent: number;
  documents_uploaded: number;
  reviews_submitted: number;
  support_tickets: number;
}

interface TrendData {
  date: string;
  value: number;
  change: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [financialAnalytics, setFinancialAnalytics] = useState<FinancialAnalytics | null>(null);
  const [engagementAnalytics, setEngagementAnalytics] = useState<EngagementAnalytics | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);

  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch performance metrics
      const { data: perfData, error: perfError } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('user_id', user?.id)
        .order('metric_date', { ascending: false })
        .limit(1);

      if (perfError) throw perfError;
      setPerformanceMetrics(perfData?.[0] || null);

      // Fetch financial analytics for the selected time range
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const { data: finData, error: finError } = await supabase
        .from('financial_analytics')
        .select('*')
        .eq('user_id', user?.id)
        .gte('period_start', startDate.toISOString().split('T')[0])
        .lte('period_end', endDate.toISOString().split('T')[0])
        .order('period_start', { ascending: false })
        .limit(1);

      if (finError) throw finError;
      setFinancialAnalytics(finData?.[0] || null);

      // Fetch engagement analytics
      const { data: engData, error: engError } = await supabase
        .from('engagement_analytics')
        .select('*')
        .eq('user_id', user?.id)
        .order('metric_date', { ascending: false })
        .limit(1);

      if (engError) throw engError;
      setEngagementAnalytics(engData?.[0] || null);

      // Generate mock trend data for demonstration
      generateTrendData();

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTrendData = () => {
    const mockData: TrendData[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const baseValue = 75 + Math.random() * 25;
      const change = (Math.random() - 0.5) * 10;
      const trend: 'increasing' | 'decreasing' | 'stable' = 
        change > 2 ? 'increasing' : change < -2 ? 'decreasing' : 'stable';
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(baseValue + change),
        change: Math.round(change * 10) / 10,
        trend
      });
    }
    
    setTrendData(mockData);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600';
      case 'decreasing':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDuration = (hours: number) => {
    if (hours < 24) {
      return `${hours.toFixed(1)}h`;
    }
    const days = hours / 24;
    return `${days.toFixed(1)}d`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Data-driven insights for your therapy projects</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Project Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics?.project_completion_rate ? 
                formatPercentage(performanceMetrics.project_completion_rate) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {performanceMetrics?.total_projects_completed || 0} projects completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics?.total_revenue ? 
                formatCurrency(performanceMetrics.total_revenue) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {financialAnalytics?.average_project_value ? 
                `Avg: ${formatCurrency(financialAnalytics.average_project_value)}` : 'No projects yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics?.client_satisfaction_score ? 
                `${performanceMetrics.client_satisfaction_score.toFixed(1)}/5` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {performanceMetrics?.total_projects_completed || 0} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceMetrics?.response_time_hours ? 
                formatDuration(performanceMetrics.response_time_hours) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Project Performance Trends</CardTitle>
              <CardDescription>30-day performance overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-end justify-between gap-2">
                {trendData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-1 text-xs">
                      {getTrendIcon(data.trend)}
                      <span className={getTrendColor(data.trend)}>
                        {data.change > 0 ? '+' : ''}{data.change}%
                      </span>
                    </div>
                    <div 
                      className="w-8 bg-primary/20 rounded-t"
                      style={{ height: `${(data.value / 100) * 200}px` }}
                    ></div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(data.date).getDate()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceMetrics?.response_time_hours && performanceMetrics.response_time_hours > 24 && (
                    <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                      <span className="text-sm">Response time is above target</span>
                      <Badge variant="secondary">24h+</Badge>
                    </div>
                  )}
                  {performanceMetrics?.project_success_rate && performanceMetrics.project_success_rate < 80 && (
                    <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                      <span className="text-sm">Project success rate below target</span>
                      <Badge variant="secondary">{formatPercentage(performanceMetrics.project_success_rate)}</Badge>
                    </div>
                  )}
                  {(!performanceMetrics?.project_completion_rate || performanceMetrics.project_completion_rate < 70) && (
                    <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                      <span className="text-sm">Low project completion rate</span>
                      <Badge variant="secondary">
                        {performanceMetrics?.project_completion_rate ? 
                          formatPercentage(performanceMetrics.project_completion_rate) : 'N/A'}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Positive Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceMetrics?.client_satisfaction_score && performanceMetrics.client_satisfaction_score >= 4 && (
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm">High client satisfaction</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {performanceMetrics.client_satisfaction_score.toFixed(1)}/5
                      </Badge>
                    </div>
                  )}
                  {performanceMetrics?.total_projects_completed && performanceMetrics.total_projects_completed > 0 && (
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm">Active project completion</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {performanceMetrics.total_projects_completed} projects
                      </Badge>
                    </div>
                  )}
                  {financialAnalytics?.total_revenue && financialAnalytics.total_revenue > 0 && (
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm">Revenue generation</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {formatCurrency(financialAnalytics.total_revenue)}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completion Rate</span>
                  <span className="font-medium">
                    {performanceMetrics?.project_completion_rate ? 
                      formatPercentage(performanceMetrics.project_completion_rate) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Success Rate</span>
                  <span className="font-medium">
                    {performanceMetrics?.project_success_rate ? 
                      formatPercentage(performanceMetrics.project_success_rate) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Duration</span>
                  <span className="font-medium">
                    {performanceMetrics?.average_project_duration ? 
                      `${performanceMetrics.average_project_duration.toFixed(1)} days` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Response Time</span>
                  <span className="font-medium">
                    {performanceMetrics?.response_time_hours ? 
                      formatDuration(performanceMetrics.response_time_hours) : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Performance visualization coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Revenue</span>
                  <span className="font-medium">
                    {financialAnalytics?.total_revenue ? 
                      formatCurrency(financialAnalytics.total_revenue) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Net Profit</span>
                  <span className="font-medium">
                    {financialAnalytics?.net_profit ? 
                      formatCurrency(financialAnalytics.net_profit) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Profit Margin</span>
                  <span className="font-medium">
                    {financialAnalytics?.profit_margin ? 
                      formatPercentage(financialAnalytics.profit_margin) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Collection Rate</span>
                  <span className="font-medium">
                    {financialAnalytics?.payment_collection_rate ? 
                      formatPercentage(financialAnalytics.payment_collection_rate) : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 mx-auto mb-2" />
                    <p>Revenue visualization coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Login Frequency</span>
                  <span className="font-medium">
                    {engagementAnalytics?.login_frequency || 0} times/day
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Session Duration</span>
                  <span className="font-medium">
                    {engagementAnalytics?.session_duration_minutes || 0} minutes
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Messages Sent</span>
                  <span className="font-medium">
                    {engagementAnalytics?.messages_sent || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Documents Uploaded</span>
                  <span className="font-medium">
                    {engagementAnalytics?.documents_uploaded || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Features Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {engagementAnalytics?.features_used?.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm capitalize">{feature.replace('_', ' ')}</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  )) || (
                    <div className="text-center text-muted-foreground py-4">
                      No feature usage data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 pt-6">
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Customize Dashboard
        </Button>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Widget
        </Button>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
