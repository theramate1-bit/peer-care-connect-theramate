import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Download, 
  Calendar, 
  BarChart3, 
  PieChart, 
  LineChart,
  Trash2,
  Edit,
  Eye,
  Clock,
  Mail,
  FileText,
  Settings,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CustomReport {
  id: string;
  name: string;
  description: string;
  report_type: 'performance' | 'financial' | 'engagement' | 'custom';
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  metrics: string[];
  filters: Record<string, any>;
  recipients: string[];
  last_generated?: string;
  next_generation?: string;
  status: 'active' | 'paused' | 'draft';
  created_at: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  report_type: 'performance' | 'financial' | 'engagement' | 'custom';
  default_metrics: string[];
  default_filters: Record<string, any>;
}

const CustomReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('my-reports');
  const [reports, setReports] = useState<CustomReport[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReport, setEditingReport] = useState<CustomReport | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    report_type: 'performance' as const,
    frequency: 'weekly' as const,
    metrics: [] as string[],
    filters: {} as Record<string, any>,
    recipients: [] as string[]
  });

  const availableMetrics = {
    performance: [
      'project_completion_rate',
      'average_project_duration',
      'client_satisfaction_score',
      'response_time_hours',
      'project_success_rate',
      'total_projects_completed'
    ],
    financial: [
      'total_revenue',
      'total_expenses',
      'net_profit',
      'profit_margin',
      'average_project_value',
      'payment_collection_rate'
    ],
    engagement: [
      'login_frequency',
      'session_duration_minutes',
      'messages_sent',
      'documents_uploaded',
      'reviews_submitted',
      'support_tickets'
    ]
  };

  const frequencyOptions = [
    { value: 'once', label: 'One-time' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }
  ];

  useEffect(() => {
    if (user) {
      fetchReports();
      fetchTemplates();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_reports')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive"
      });
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_metrics')
        .select('*')
        .eq('is_template', true);

      if (error) throw error;
      
      // Convert metrics to report templates
      const reportTemplates: ReportTemplate[] = [
        {
          id: '1',
          name: 'Performance Overview',
          description: 'Comprehensive performance metrics for your projects',
          report_type: 'performance',
          default_metrics: availableMetrics.performance.slice(0, 4),
          default_filters: { time_range: '30d' }
        },
        {
          id: '2',
          name: 'Financial Summary',
          description: 'Key financial indicators and revenue analysis',
          report_type: 'financial',
          default_metrics: availableMetrics.financial.slice(0, 4),
          default_filters: { time_range: '90d' }
        },
        {
          id: '3',
          name: 'User Engagement',
          description: 'User activity and feature usage insights',
          report_type: 'engagement',
          default_metrics: availableMetrics.engagement.slice(0, 4),
          default_filters: { time_range: '30d' }
        }
      ];
      
      setTemplates(reportTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async () => {
    try {
      if (!formData.name.trim()) {
        toast({
          title: "Error",
          description: "Report name is required",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('custom_reports')
        .insert([{
          user_id: user?.id,
          name: formData.name,
          description: formData.description,
          report_type: formData.report_type,
          frequency: formData.frequency,
          metrics: formData.metrics,
          filters: formData.filters,
          recipients: formData.recipients,
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Report created successfully"
      });

      setShowCreateForm(false);
      resetForm();
      fetchReports();
    } catch (error) {
      console.error('Error creating report:', error);
      toast({
        title: "Error",
        description: "Failed to create report",
        variant: "destructive"
      });
    }
  };

  const handleUpdateReport = async () => {
    if (!editingReport) return;

    try {
      const { error } = await supabase
        .from('custom_reports')
        .update({
          name: formData.name,
          description: formData.description,
          report_type: formData.report_type,
          frequency: formData.frequency,
          metrics: formData.metrics,
          filters: formData.filters,
          recipients: formData.recipients
        })
        .eq('id', editingReport.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Report updated successfully"
      });

      setEditingReport(null);
      resetForm();
      fetchReports();
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: "Error",
        description: "Failed to update report",
        variant: "destructive"
      });
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('custom_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Report deleted successfully"
      });

      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive"
      });
    }
  };

  const handleToggleReportStatus = async (report: CustomReport) => {
    try {
      const newStatus = report.status === 'active' ? 'paused' : 'active';
      
      const { error } = await supabase
        .from('custom_reports')
        .update({ status: newStatus })
        .eq('id', report.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Report ${newStatus === 'active' ? 'activated' : 'paused'} successfully`
      });

      fetchReports();
    } catch (error) {
      console.error('Error updating report status:', error);
      toast({
        title: "Error",
        description: "Failed to update report status",
        variant: "destructive"
      });
    }
  };

  const handleUseTemplate = (template: ReportTemplate) => {
    setFormData({
      name: `${template.name} Report`,
      description: template.description,
      report_type: template.report_type,
      frequency: 'weekly',
      metrics: template.default_metrics,
      filters: template.default_filters,
      recipients: []
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      report_type: 'performance',
      frequency: 'weekly',
      metrics: [],
      filters: {},
      recipients: []
    });
  };

  const handleEditReport = (report: CustomReport) => {
    setEditingReport(report);
    setFormData({
      name: report.name,
      description: report.description,
      report_type: report.report_type,
      frequency: report.frequency,
      metrics: report.metrics,
      filters: report.filters,
      recipients: report.recipients
    });
  };

  const toggleMetric = (metric: string) => {
    setFormData(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metric)
        ? prev.metrics.filter(m => m !== metric)
        : [...prev.metrics, metric]
    }));
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      draft: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge variant="secondary" className={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getFrequencyLabel = (frequency: string) => {
    const option = frequencyOptions.find(opt => opt.value === frequency);
    return option?.label || frequency;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Custom Reports</h1>
          <p className="text-muted-foreground">Create and manage custom analytics reports</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Report
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-reports">My Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>

        <TabsContent value="my-reports" className="space-y-4">
          {reports.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first custom report to start tracking specific metrics
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Report
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{report.name}</CardTitle>
                        <CardDescription>{report.description}</CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusBadge(report.status)}
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            {getFrequencyLabel(report.frequency)}
                          </Badge>
                          <Badge variant="outline">
                            <BarChart3 className="h-3 w-3 mr-1" />
                            {report.report_type}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditReport(report)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleReportStatus(report)}
                        >
                          {report.status === 'active' ? 'Pause' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteReport(report.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Metrics:</span>
                        <div className="mt-1 space-y-1">
                          {report.metrics.slice(0, 3).map((metric, index) => (
                            <Badge key={index} variant="secondary" className="mr-1">
                              {metric.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                          {report.metrics.length > 3 && (
                            <Badge variant="secondary">+{report.metrics.length - 3} more</Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Generated:</span>
                        <div className="mt-1">
                          {report.last_generated ? 
                            new Date(report.last_generated).toLocaleDateString() : 
                            'Never'
                          }
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Next Generation:</span>
                        <div className="mt-1">
                          {report.next_generation ? 
                            new Date(report.next_generation).toLocaleDateString() : 
                            'Not scheduled'
                          }
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          {template.report_type}
                        </Badge>
                        <Badge variant="outline">
                          {template.default_metrics.length} metrics
                        </Badge>
                      </div>
                    </div>
                    <Button onClick={() => handleUseTemplate(template)}>
                      Use Template
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Default Metrics:</span>
                    <div className="flex flex-wrap gap-1">
                      {template.default_metrics.map((metric, index) => (
                        <Badge key={index} variant="secondary">
                          {metric.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          {(showCreateForm || editingReport) && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingReport ? 'Edit Report' : 'Create New Report'}
                </CardTitle>
                <CardDescription>
                  Configure your custom report settings and metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Report Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter report name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Report Type</Label>
                    <Select
                      value={formData.report_type}
                      onValueChange={(value: any) => setFormData(prev => ({ 
                        ...prev, 
                        report_type: value,
                        metrics: [] // Reset metrics when type changes
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="engagement">Engagement</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this report tracks"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={formData.frequency}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, frequency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {frequencyOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Recipients (Optional)</Label>
                    <Input
                      placeholder="email@example.com"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          e.preventDefault();
                          setFormData(prev => ({
                            ...prev,
                            recipients: [...prev.recipients, e.currentTarget.value]
                          }));
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    {formData.recipients.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {formData.recipients.map((email, index) => (
                          <Badge key={index} variant="secondary">
                            {email}
                            <button
                              className="ml-1 text-xs"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                recipients: prev.recipients.filter((_, i) => i !== index)
                              }))}
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Select Metrics</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {availableMetrics[formData.report_type as keyof typeof availableMetrics]?.map((metric) => (
                      <div key={metric} className="flex items-center space-x-2">
                        <Checkbox
                          id={metric}
                          checked={formData.metrics.includes(metric)}
                          onCheckedChange={() => toggleMetric(metric)}
                        />
                        <Label htmlFor={metric} className="text-sm">
                          {metric.replace(/_/g, ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingReport(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={editingReport ? handleUpdateReport : handleCreateReport}
                    disabled={!formData.name.trim() || formData.metrics.length === 0}
                  >
                    {editingReport ? 'Update Report' : 'Create Report'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomReports;
