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
  Bell, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Settings,
  Trash2,
  Edit,
  Eye,
  Clock,
  Mail,
  Smartphone,
  Zap,
  Pause,
  Play
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsAlert {
  id: string;
  name: string;
  description: string;
  metric_name: string;
  condition: 'above' | 'below' | 'equals' | 'changes_by';
  threshold_value: number;
  time_window: '1h' | '6h' | '24h' | '7d' | '30d';
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  channels: string[];
  status: 'active' | 'paused' | 'draft';
  last_triggered?: string;
  created_at: string;
}

interface AlertNotification {
  id: string;
  alert_id: string;
  alert_name: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'unread' | 'read' | 'acknowledged';
  created_at: string;
  read_at?: string;
}

const AnalyticsAlerts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('alerts');
  const [alerts, setAlerts] = useState<AnalyticsAlert[]>([]);
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<AnalyticsAlert | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    metric_name: '',
    condition: 'above' as const,
    threshold_value: 0,
    time_window: '24h' as const,
    frequency: 'immediate' as const,
    channels: [] as string[]
  });

  const availableMetrics = [
    'project_completion_rate',
    'client_satisfaction_score',
    'response_time_hours',
    'total_revenue',
    'profit_margin',
    'login_frequency',
    'session_duration_minutes',
    'messages_sent'
  ];

  const conditionOptions = [
    { value: 'above', label: 'Above', icon: TrendingUp },
    { value: 'below', label: 'Below', icon: TrendingDown },
    { value: 'equals', label: 'Equals', icon: AlertTriangle },
    { value: 'changes_by', label: 'Changes by', icon: Zap }
  ];

  const timeWindowOptions = [
    { value: '1h', label: '1 hour' },
    { value: '6h', label: '6 hours' },
    { value: '24h', label: '24 hours' },
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' }
  ];

  const frequencyOptions = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' }
  ];

  const channelOptions = [
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'push', label: 'Push Notification', icon: Smartphone },
    { value: 'in_app', label: 'In-App', icon: Bell }
  ];

  useEffect(() => {
    if (user) {
      fetchAlerts();
      fetchNotifications();
    }
  }, [user]);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_alerts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: "Error",
        description: "Failed to load alerts",
        variant: "destructive"
      });
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('alert_notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async () => {
    try {
      if (!formData.name.trim() || !formData.metric_name) {
        toast({
          title: "Error",
          description: "Alert name and metric are required",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('analytics_alerts')
        .insert([{
          user_id: user?.id,
          name: formData.name,
          description: formData.description,
          metric_name: formData.metric_name,
          condition: formData.condition,
          threshold_value: formData.threshold_value,
          time_window: formData.time_window,
          frequency: formData.frequency,
          channels: formData.channels,
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Alert created successfully"
      });

      setShowCreateForm(false);
      resetForm();
      fetchAlerts();
    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        title: "Error",
        description: "Failed to create alert",
        variant: "destructive"
      });
    }
  };

  const handleUpdateAlert = async () => {
    if (!editingAlert) return;

    try {
      const { error } = await supabase
        .from('analytics_alerts')
        .update({
          name: formData.name,
          description: formData.description,
          metric_name: formData.metric_name,
          condition: formData.condition,
          threshold_value: formData.threshold_value,
          time_window: formData.time_window,
          frequency: formData.frequency,
          channels: formData.channels
        })
        .eq('id', editingAlert.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Alert updated successfully"
      });

      setEditingAlert(null);
      resetForm();
      fetchAlerts();
    } catch (error) {
      console.error('Error updating alert:', error);
      toast({
        title: "Error",
        description: "Failed to update alert",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('analytics_alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Alert deleted successfully"
      });

      fetchAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast({
        title: "Error",
        description: "Failed to delete alert",
        variant: "destructive"
      });
    }
  };

  const handleToggleAlertStatus = async (alert: AnalyticsAlert) => {
    try {
      const newStatus = alert.status === 'active' ? 'paused' : 'active';
      
      const { error } = await supabase
        .from('analytics_alerts')
        .update({ status: newStatus })
        .eq('id', alert.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Alert ${newStatus === 'active' ? 'activated' : 'paused'} successfully`
      });

      fetchAlerts();
    } catch (error) {
      console.error('Error updating alert status:', error);
      toast({
        title: "Error",
        description: "Failed to update alert status",
        variant: "destructive"
      });
    }
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('alert_notifications')
        .update({ 
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;

      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleAcknowledgeNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('alert_notifications')
        .update({ status: 'acknowledged' })
        .eq('id', notificationId);

      if (error) throw error;

      fetchNotifications();
    } catch (error) {
      console.error('Error acknowledging notification:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      metric_name: '',
      condition: 'above',
      threshold_value: 0,
      time_window: '24h',
      frequency: 'immediate',
      channels: []
    });
  };

  const handleEditAlert = (alert: AnalyticsAlert) => {
    setEditingAlert(alert);
    setFormData({
      name: alert.name,
      description: alert.description,
      metric_name: alert.metric_name,
      condition: alert.condition,
      threshold_value: alert.threshold_value,
      time_window: alert.time_window,
      frequency: alert.frequency,
      channels: alert.channels
    });
  };

  const toggleChannel = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
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

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge variant="secondary" className={variants[severity as keyof typeof variants]}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  const getConditionIcon = (condition: string) => {
    const option = conditionOptions.find(opt => opt.value === condition);
    return option ? <option.icon className="h-4 w-4" /> : null;
  };

  const getChannelIcon = (channel: string) => {
    const option = channelOptions.find(opt => opt.value === channel);
    return option ? <option.icon className="h-4 w-4" /> : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Alerts</h1>
          <p className="text-muted-foreground">Set up automated alerts for important metrics and trends</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Alert
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="alerts">My Alerts</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No alerts configured</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first alert to get notified about important changes in your metrics
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Alert
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {alerts.map((alert) => (
                <Card key={alert.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{alert.name}</CardTitle>
                        <CardDescription>{alert.description}</CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusBadge(alert.status)}
                          <Badge variant="outline">
                            {getConditionIcon(alert.condition)}
                            {alert.condition.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {alert.time_window}
                          </Badge>
                          <Badge variant="outline">
                            <Zap className="h-3 w-3 mr-1" />
                            {alert.frequency}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAlert(alert)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleAlertStatus(alert)}
                        >
                          {alert.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAlert(alert.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Metric:</span>
                        <div className="mt-1 font-medium">
                          {alert.metric_name.replace(/_/g, ' ')}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Threshold:</span>
                        <div className="mt-1 font-medium">
                          {alert.condition} {alert.threshold_value}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Channels:</span>
                        <div className="mt-1 flex gap-1">
                          {alert.channels.map((channel, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {getChannelIcon(channel)}
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    {alert.last_triggered && (
                      <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                        Last triggered: {new Date(alert.last_triggered).toLocaleString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                <p className="text-muted-foreground text-center">
                  You'll receive notifications here when your alerts are triggered
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Card key={notification.id} className={notification.status === 'unread' ? 'border-l-4 border-l-primary' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{notification.alert_name}</h4>
                          {getSeverityBadge(notification.severity)}
                          {notification.status === 'unread' && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(notification.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {notification.status === 'unread' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkNotificationRead(notification.id)}
                          >
                            Mark Read
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcknowledgeNotification(notification.id)}
                        >
                          Acknowledge
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Alert Form */}
      {(showCreateForm || editingAlert) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              {editingAlert ? 'Edit Alert' : 'Create New Alert'}
            </CardTitle>
            <CardDescription>
              Configure when and how you want to be notified about metric changes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Alert Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter alert name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metric">Metric to Monitor</Label>
                <Select
                  value={formData.metric_name}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, metric_name: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a metric" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMetrics.map((metric) => (
                      <SelectItem key={metric} value={metric}>
                        {metric.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
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
                placeholder="Describe what this alert monitors"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, condition: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold">Threshold Value</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={formData.threshold_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, threshold_value: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeWindow">Time Window</Label>
                <Select
                  value={formData.time_window}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, time_window: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeWindowOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Alert Frequency</Label>
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
                <Label>Notification Channels</Label>
                <div className="space-y-2">
                  {channelOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.value}
                        checked={formData.channels.includes(option.value)}
                        onCheckedChange={() => toggleChannel(option.value)}
                      />
                      <Label htmlFor={option.value} className="text-sm flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingAlert(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingAlert ? handleUpdateAlert : handleCreateAlert}
                disabled={!formData.name.trim() || !formData.metric_name || formData.channels.length === 0}
              >
                {editingAlert ? 'Update Alert' : 'Create Alert'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsAlerts;
