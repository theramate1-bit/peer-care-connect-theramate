import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  X, 
  Target, 
  Calendar, 
  DollarSign, 
  MapPin,
  Users,
  FileText,
  Clock,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Therapist {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  average_rating: number;
  total_reviews: number;
  profile_photo_url?: string;
}

interface ProjectFormData {
  project_name: string;
  project_description: string;
  project_type: string;
  estimated_duration_weeks: number;
  budget_range: {
    min: number;
    max: number;
    currency: string;
  };
  project_goals: string[];
  success_metrics: {
    primary_goal: string;
    secondary_goals: string[];
  };
  special_requirements: string[];
  location_preference: string;
  scheduling_preferences: {
    preferred_days: string[];
    preferred_times: string[];
    timezone: string;
  };
  communication_preferences: {
    preferred_method: string;
    frequency: string;
    response_time: string;
  };
  therapist_id?: string;
}

const ProjectCreator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(5);
  const [loading, setLoading] = useState(false);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<string>('');
  const [newGoal, setNewGoal] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newSecondaryGoal, setNewSecondaryGoal] = useState('');

  const [formData, setFormData] = useState<ProjectFormData>({
    project_name: '',
    project_description: '',
    project_type: '',
    estimated_duration_weeks: 4,
    budget_range: {
      min: 100,
      max: 1000,
      currency: 'USD'
    },
    project_goals: [],
    success_metrics: {
      primary_goal: '',
      secondary_goals: []
    },
    special_requirements: [],
    location_preference: 'remote',
    scheduling_preferences: {
      preferred_days: [],
      preferred_times: [],
      timezone: 'UTC'
    },
    communication_preferences: {
      preferred_method: 'email',
      frequency: 'weekly',
      response_time: '24h'
    }
  });

  useEffect(() => {
    if (user) {
      fetchTherapists();
    }
  }, [user]);

  const fetchTherapists = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          first_name,
          last_name,
          specializations,
          hourly_rate,
          location,
          bio
        `)
        .in('user_role', ['sports_therapist', 'massage_therapist', 'osteopath'])
        .eq('is_active', true)
        .order('average_rating', { ascending: false });

      if (error) throw error;
      setTherapists(data || []);
    } catch (error) {
      console.error('Error fetching therapists:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof ProjectFormData],
        [field]: value
      }
    }));
  };

  const addGoal = () => {
    if (newGoal.trim() && !formData.project_goals.includes(newGoal.trim())) {
      setFormData(prev => ({
        ...prev,
        project_goals: [...prev.project_goals, newGoal.trim()]
      }));
      setNewGoal('');
    }
  };

  const removeGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      project_goals: prev.project_goals.filter(g => g !== goal)
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.special_requirements.includes(newRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        special_requirements: [...prev.special_requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (requirement: string) => {
    setFormData(prev => ({
      ...prev,
      special_requirements: prev.special_requirements.filter(r => r !== requirement)
    }));
  };

  const addSecondaryGoal = () => {
    if (newSecondaryGoal.trim() && !formData.success_metrics.secondary_goals.includes(newSecondaryGoal.trim())) {
      setFormData(prev => ({
        ...prev,
        success_metrics: {
          ...prev.success_metrics,
          secondary_goals: [...prev.success_metrics.secondary_goals, newSecondaryGoal.trim()]
        }
      }));
      setNewSecondaryGoal('');
    }
  };

  const removeSecondaryGoal = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      success_metrics: {
        ...prev.success_metrics,
        secondary_goals: prev.success_metrics.secondary_goals.filter(g => g !== goal)
      }
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Get client profile ID
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (profileError) throw profileError;

      // Create project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          client_id: profileData.id,
          therapist_id: selectedTherapist || null,
          project_name: formData.project_name,
          project_description: formData.project_description,
          project_type: formData.project_type,
          project_status: 'planning',
          start_date: new Date().toISOString(),
          estimated_duration_weeks: formData.estimated_duration_weeks,
          budget_range: formData.budget_range,
          project_goals: formData.project_goals,
          success_metrics: formData.success_metrics,
          special_requirements: formData.special_requirements,
          location_preference: formData.location_preference,
          scheduling_preferences: formData.scheduling_preferences,
          communication_preferences: formData.communication_preferences
        })
        .select()
        .single();

      if (projectError) throw projectError;

      toast({
        title: "Success!",
        description: "Your project has been created successfully",
      });

      // Redirect to project manager
      navigate('/dashboard/projects');

    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="project_name">Project Name *</Label>
        <Input
          id="project_name"
          value={formData.project_name}
          onChange={(e) => handleInputChange('project_name', e.target.value)}
          placeholder="e.g., Rehabilitation Program for Sports Injury"
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="project_description">Project Description *</Label>
        <Textarea
          id="project_description"
          value={formData.project_description}
          onChange={(e) => handleInputChange('project_description', e.target.value)}
          placeholder="Describe your project goals, current situation, and what you hope to achieve..."
          className="mt-2"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="project_type">Project Type *</Label>
          <Select value={formData.project_type} onValueChange={(value) => handleInputChange('project_type', value)}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select project type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rehabilitation">Rehabilitation</SelectItem>
              <SelectItem value="pain_management">Pain Management</SelectItem>
              <SelectItem value="sports_therapy">Sports Therapy</SelectItem>
              <SelectItem value="post_surgery">Post-Surgery Recovery</SelectItem>
              <SelectItem value="chronic_condition">Chronic Condition Management</SelectItem>
              <SelectItem value="preventive">Preventive Care</SelectItem>
              <SelectItem value="wellness">General Wellness</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="duration">Estimated Duration (weeks) *</Label>
          <Input
            id="duration"
            type="number"
            min="1"
            max="52"
            value={formData.estimated_duration_weeks}
            onChange={(e) => handleInputChange('estimated_duration_weeks', parseInt(e.target.value))}
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label>Budget Range *</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div>
            <Label htmlFor="budget_min">Minimum</Label>
            <Input
              id="budget_min"
              type="number"
              min="0"
              value={formData.budget_range.min}
              onChange={(e) => handleNestedChange('budget_range', 'min', parseInt(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="budget_max">Maximum</Label>
            <Input
              id="budget_max"
              type="number"
              min="0"
              value={formData.budget_range.max}
              onChange={(e) => handleNestedChange('budget_range', 'max', parseInt(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select 
              value={formData.budget_range.currency} 
              onValueChange={(value) => handleNestedChange('budget_range', 'currency', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="CAD">CAD (C$)</SelectItem>
                <SelectItem value="AUD">AUD (A$)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <Label>Project Goals *</Label>
        <div className="space-y-3 mt-2">
          <div className="flex gap-2">
            <Input
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Add a project goal..."
              onKeyPress={(e) => e.key === 'Enter' && addGoal()}
            />
            <Button type="button" onClick={addGoal} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.project_goals.map((goal, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {goal}
                <button
                  type="button"
                  onClick={() => removeGoal(goal)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="primary_goal">Primary Success Metric *</Label>
        <Input
          id="primary_goal"
          value={formData.success_metrics.primary_goal}
          onChange={(e) => handleNestedChange('success_metrics', 'primary_goal', e.target.value)}
          placeholder="e.g., Reduce pain by 80% within 6 weeks"
          className="mt-2"
        />
      </div>

      <div>
        <Label>Secondary Success Metrics</Label>
        <div className="space-y-3 mt-2">
          <div className="flex gap-2">
            <Input
              value={newSecondaryGoal}
              onChange={(e) => setNewSecondaryGoal(e.target.value)}
              placeholder="Add a secondary metric..."
              onKeyPress={(e) => e.key === 'Enter' && addSecondaryGoal()}
            />
            <Button type="button" onClick={addSecondaryGoal} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.success_metrics.secondary_goals.map((goal, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {goal}
                <button
                  type="button"
                  onClick={() => removeSecondaryGoal(goal)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div>
        <Label>Special Requirements</Label>
        <div className="space-y-3 mt-2">
          <div className="flex gap-2">
            <Input
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              placeholder="Add a special requirement..."
              onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
            />
            <Button type="button" onClick={addRequirement} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.special_requirements.map((requirement, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {requirement}
                <button
                  type="button"
                  onClick={() => removeRequirement(requirement)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="location">Location Preference *</Label>
        <Select value={formData.location_preference} onValueChange={(value) => handleInputChange('location_preference', value)}>
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="remote">Remote/Online</SelectItem>
            <SelectItem value="in_person">In-Person</SelectItem>
            <SelectItem value="hybrid">Hybrid (Both)</SelectItem>
            <SelectItem value="home_visit">Home Visit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Preferred Days</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
            <div key={day} className="flex items-center space-x-2">
              <Checkbox
                id={day.toLowerCase()}
                checked={formData.scheduling_preferences.preferred_days.includes(day)}
                onCheckedChange={(checked) => {
                  const current = formData.scheduling_preferences.preferred_days;
                  if (checked) {
                    handleNestedChange('scheduling_preferences', 'preferred_days', [...current, day]);
                  } else {
                    handleNestedChange('scheduling_preferences', 'preferred_days', current.filter(d => d !== day));
                  }
                }}
              />
              <Label htmlFor={day.toLowerCase()} className="text-sm">{day}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Preferred Times</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          {['Morning', 'Afternoon', 'Evening', 'Flexible'].map((time) => (
            <div key={time} className="flex items-center space-x-2">
              <Checkbox
                id={time.toLowerCase()}
                checked={formData.scheduling_preferences.preferred_times.includes(time)}
                onCheckedChange={(checked) => {
                  const current = formData.scheduling_preferences.preferred_times;
                  if (checked) {
                    handleNestedChange('scheduling_preferences', 'preferred_times', [...current, time]);
                  } else {
                    handleNestedChange('scheduling_preferences', 'preferred_times', current.filter(t => t !== time));
                  }
                }}
              />
              <Label htmlFor={time.toLowerCase()} className="text-sm">{time}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="timezone">Timezone *</Label>
        <Select 
          value={formData.scheduling_preferences.timezone} 
          onValueChange={(value) => handleNestedChange('scheduling_preferences', 'timezone', value)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UTC">UTC</SelectItem>
            <SelectItem value="EST">Eastern Time (EST)</SelectItem>
            <SelectItem value="CST">Central Time (CST)</SelectItem>
            <SelectItem value="MST">Mountain Time (MST)</SelectItem>
            <SelectItem value="PST">Pacific Time (PST)</SelectItem>
            <SelectItem value="GMT">Greenwich Mean Time (GMT)</SelectItem>
            <SelectItem value="CET">Central European Time (CET)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <Label>Choose a Therapist (Optional)</Label>
        <p className="text-sm text-muted-foreground mt-1">
          You can select a specific therapist or let us recommend one based on your project requirements.
        </p>
        
        <div className="mt-4 space-y-3">
          {therapists.map((therapist) => (
            <div
              key={therapist.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedTherapist === therapist.id
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => setSelectedTherapist(therapist.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  {therapist.profile_photo_url ? (
                    <img 
                      src={therapist.profile_photo_url} 
                      alt="Therapist" 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <Users className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">
                    {therapist.first_name} {therapist.last_name}
                  </h4>
                  <p className="text-sm text-muted-foreground">{therapist.specialization}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{therapist.average_rating}</span>
                      <span className="text-sm text-muted-foreground">/5</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({therapist.total_reviews} reviews)
                    </span>
                  </div>
                </div>
                {selectedTherapist === therapist.id && (
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => setSelectedTherapist('')}
            className={selectedTherapist ? '' : 'hidden'}
          >
            Let us recommend a therapist
          </Button>
        </div>
      </div>

      <div>
        <Label>Communication Preferences</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div>
            <Label htmlFor="comm_method">Preferred Method</Label>
            <Select 
              value={formData.communication_preferences.preferred_method} 
              onValueChange={(value) => handleNestedChange('communication_preferences', 'preferred_method', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="video_call">Video Call</SelectItem>
                <SelectItem value="messaging">In-App Messaging</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="comm_frequency">Update Frequency</Label>
            <Select 
              value={formData.communication_preferences.frequency} 
              onValueChange={(value) => handleNestedChange('communication_preferences', 'frequency', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="as_needed">As Needed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="response_time">Response Time</Label>
            <Select 
              value={formData.communication_preferences.response_time} 
              onValueChange={(value) => handleNestedChange('communication_preferences', 'response_time', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Within 1 hour</SelectItem>
                <SelectItem value="4h">Within 4 hours</SelectItem>
                <SelectItem value="24h">Within 24 hours</SelectItem>
                <SelectItem value="48h">Within 48 hours</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return renderStep1();
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Basic Information';
      case 2: return 'Goals & Budget';
      case 3: return 'Success Metrics';
      case 4: return 'Scheduling & Location';
      case 5: return 'Therapist & Communication';
      default: return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/projects')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Project</h1>
          <p className="text-muted-foreground">Set up your therapy project with detailed requirements</p>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm text-muted-foreground">{getStepTitle(currentStep)}</span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{getStepTitle(currentStep)}</CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Tell us about your project and what you want to achieve'}
            {currentStep === 2 && 'Define your budget and primary project goals'}
            {currentStep === 3 && 'Set clear success metrics and special requirements'}
            {currentStep === 4 && 'Choose your preferred location and scheduling options'}
            {currentStep === 5 && 'Select a therapist and set communication preferences'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderCurrentStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {currentStep < totalSteps ? (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating Project...' : 'Create Project'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCreator;
