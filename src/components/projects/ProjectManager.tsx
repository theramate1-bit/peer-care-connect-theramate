import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Calendar, 
  DollarSign, 
  Target, 
  Clock, 
  Users,
  FileText,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  project_name: string;
  project_description: string;
  project_type: string;
  project_status: string;
  start_date: string;
  end_date?: string;
  estimated_duration_weeks: number;
  actual_duration_weeks?: number;
  budget_range: any;
  actual_cost?: number;
  project_goals: string[];
  success_metrics: any;
  special_requirements: string[];
  location_preference?: string;
  therapist: {
    first_name: string;
    last_name: string;
    profile_photo_url?: string;
  };
}

interface ProjectPhase {
  id: string;
  phase_name: string;
  phase_description: string;
  phase_order: number;
  phase_status: string;
  start_date: string;
  end_date?: string;
  estimated_duration_days: number;
  actual_duration_days?: number;
  deliverables: string[];
  acceptance_criteria: string[];
  phase_notes?: string;
  phase_rating?: number;
  phase_feedback?: string;
}

interface ProjectDocument {
  id: string;
  document_name: string;
  document_type: string;
  document_status: string;
  file_path?: string;
  file_size?: number;
  file_type?: string;
  version: string;
  uploaded_at: string;
  is_required: boolean;
  due_date?: string;
  tags: string[];
}

const ProjectManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  useEffect(() => {
    if (selectedProject) {
      fetchProjectDetails(selectedProject.id);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // First get client profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (profileError) throw profileError;

      // Then fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          therapist:users!projects_therapist_id_fkey(
            first_name,
            last_name,
            profile_photo_url
          )
        `)
        .eq('client_id', profileData.id)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      if (projectsData && projectsData.length > 0) {
        setSelectedProject(projectsData[0]);
      }

    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDetails = async (projectId: string) => {
    try {
      // Fetch project phases
      const { data: phasesData, error: phasesError } = await supabase
        .from('project_phases')
        .select('*')
        .eq('project_id', projectId)
        .order('phase_order', { ascending: true });

      if (phasesError) throw phasesError;
      setPhases(phasesData || []);

      // Fetch project documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (documentsError) throw documentsError;
      setDocuments(documentsData || []);

    } catch (error) {
      console.error('Error fetching project details:', error);
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'on_hold': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPhaseStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress': return <PlayCircle className="h-5 w-5 text-blue-600" />;
      case 'review': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'not_started': return <Clock className="h-5 w-5 text-gray-400" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPhaseStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'not_started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProjectProgress = () => {
    if (phases.length === 0) return 0;
    const completedPhases = phases.filter(phase => phase.phase_status === 'completed').length;
    return Math.round((completedPhases / phases.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Manager</h1>
          <p className="text-muted-foreground">Manage your therapy projects and track progress</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Project List Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Projects</CardTitle>
              <CardDescription>{projects.length} total projects</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`p-3 cursor-pointer border-l-4 transition-colors ${
                      selectedProject?.id === project.id
                        ? 'border-l-primary bg-primary/5'
                        : 'border-l-transparent hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{project.project_name}</h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {project.therapist.first_name} {project.therapist.last_name}
                        </p>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getStatusColor(project.project_status)}`}
                      >
                        {project.project_status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className="p-4 text-center">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No projects yet</p>
                    <Button size="sm" className="mt-2">
                      <Plus className="h-4 w-4 mr-1" />
                      Create Project
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Details */}
        <div className="lg:col-span-3">
          {selectedProject ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{selectedProject.project_name}</CardTitle>
                    <CardDescription className="text-base">
                      {selectedProject.project_description}
                    </CardDescription>
                  </div>
                  <Badge className={`text-sm ${getStatusColor(selectedProject.project_status)}`}>
                    {selectedProject.project_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="phases">Phases</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="messages">Messages</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    {/* Project Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">{phases.length}</div>
                        <div className="text-sm text-muted-foreground">Total Phases</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {phases.filter(p => p.phase_status === 'completed').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Completed</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedProject.estimated_duration_weeks}
                        </div>
                        <div className="text-sm text-muted-foreground">Weeks Estimated</div>
                      </div>
                    </div>

                    {/* Progress Overview */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {calculateProjectProgress()}%
                        </span>
                      </div>
                      <Progress value={calculateProjectProgress()} className="w-full" />
                    </div>

                    {/* Project Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold">Project Information</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <span>{selectedProject.project_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Start Date:</span>
                            <span>{new Date(selectedProject.start_date).toLocaleDateString()}</span>
                          </div>
                          {selectedProject.end_date && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">End Date:</span>
                              <span>{new Date(selectedProject.end_date).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Duration:</span>
                            <span>{selectedProject.estimated_duration_weeks} weeks</span>
                          </div>
                          {selectedProject.actual_cost && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Cost:</span>
                              <span>${selectedProject.actual_cost}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold">Therapist</h3>
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            {selectedProject.therapist.profile_photo_url ? (
                              <img 
                                src={selectedProject.therapist.profile_photo_url} 
                                alt="Therapist" 
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <Users className="h-6 w-6 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {selectedProject.therapist.first_name} {selectedProject.therapist.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">Assigned Therapist</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Project Goals */}
                    {selectedProject.project_goals && selectedProject.project_goals.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-semibold">Project Goals</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedProject.project_goals.map((goal, index) => (
                            <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                              <Target className="h-4 w-4 text-primary" />
                              <span className="text-sm">{goal}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="phases" className="space-y-4">
                    <div className="space-y-4">
                      {phases.map((phase) => (
                        <div key={phase.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-3">
                                {getPhaseStatusIcon(phase.phase_status)}
                                <div>
                                  <h4 className="font-semibold">{phase.phase_name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {phase.phase_description}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Order:</span>
                                  <span className="ml-1 font-medium">{phase.phase_order}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Duration:</span>
                                  <span className="ml-1 font-medium">{phase.estimated_duration_days} days</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Start:</span>
                                  <span className="ml-1 font-medium">
                                    {new Date(phase.start_date).toLocaleDateString()}
                                  </span>
                                </div>
                                {phase.end_date && (
                                  <div>
                                    <span className="text-muted-foreground">End:</span>
                                    <span className="ml-1 font-medium">
                                      {new Date(phase.end_date).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {phase.deliverables && phase.deliverables.length > 0 && (
                                <div>
                                  <span className="text-sm font-medium text-muted-foreground">Deliverables:</span>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {phase.deliverables.map((deliverable, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {deliverable}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                              <Badge className={getPhaseStatusColor(phase.phase_status)}>
                                {phase.phase_status.replace('_', ' ')}
                              </Badge>
                              {phase.phase_rating && (
                                <div className="flex items-center gap-1 text-sm">
                                  <span className="text-muted-foreground">Rating:</span>
                                  <span className="font-medium">{phase.phase_rating}/5</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {phases.length === 0 && (
                        <div className="text-center py-8">
                          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No phases defined yet</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Project phases will be created by your therapist
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="documents" className="space-y-4">
                    <div className="space-y-4">
                      {documents.map((document) => (
                        <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="font-medium">{document.document_name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {document.document_type} • v{document.version}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{document.document_status}</Badge>
                            {document.is_required && (
                              <Badge variant="destructive">Required</Badge>
                            )}
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {documents.length === 0 && (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No documents uploaded yet</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Project documents will appear here once uploaded
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="messages" className="space-y-4">
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Project messaging coming soon</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Communicate directly with your therapist about this project
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Project Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select a project from the sidebar to view details
                </p>
                {projects.length === 0 && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Project
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectManager;
