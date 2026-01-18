import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  ClipboardList, Clock, Upload, CheckCircle, AlertCircle, 
  FileText, Calendar, Plus, Search, Filter, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

const studentAssignments = [
  { id: 1, title: 'Calculus Problem Set 5', subject: 'Mathematics', dueDate: '2024-01-20', status: 'pending', progress: 60, maxMarks: 100 },
  { id: 2, title: 'Physics Lab Report - Optics', subject: 'Physics', dueDate: '2024-01-22', status: 'pending', progress: 30, maxMarks: 50 },
  { id: 3, title: 'Python Data Structures Project', subject: 'Computer Science', dueDate: '2024-01-25', status: 'pending', progress: 0, maxMarks: 100 },
  { id: 4, title: 'Essay on Climate Change', subject: 'English', dueDate: '2024-01-18', status: 'submitted', progress: 100, maxMarks: 50, marks: 45 },
  { id: 5, title: 'Organic Chemistry Worksheet', subject: 'Chemistry', dueDate: '2024-01-15', status: 'graded', progress: 100, maxMarks: 50, marks: 42 },
  { id: 6, title: 'Trigonometry Quiz', subject: 'Mathematics', dueDate: '2024-01-10', status: 'graded', progress: 100, maxMarks: 30, marks: 28 },
];

const teacherAssignments = [
  { id: 1, title: 'Calculus Problem Set 5', class: 'Class 10-A', dueDate: '2024-01-20', totalStudents: 35, submitted: 28, graded: 15 },
  { id: 2, title: 'Algebra Quiz', class: 'Class 11-B', dueDate: '2024-01-18', totalStudents: 32, submitted: 32, graded: 32 },
  { id: 3, title: 'Statistics Assignment', class: 'Class 12-A', dueDate: '2024-01-25', totalStudents: 28, submitted: 12, graded: 0 },
];

export default function Assignments() {
  const { userRole } = useAuth();
  const isTeacher = userRole === 'teacher' || userRole === 'admin';
  const [activeTab, setActiveTab] = useState('pending');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning border-warning/30';
      case 'submitted': return 'bg-info/10 text-info border-info/30';
      case 'graded': return 'bg-success/10 text-success border-success/30';
      case 'overdue': return 'bg-destructive/10 text-destructive border-destructive/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const pendingAssignments = studentAssignments.filter(a => a.status === 'pending');
  const submittedAssignments = studentAssignments.filter(a => a.status === 'submitted');
  const gradedAssignments = studentAssignments.filter(a => a.status === 'graded');

  if (isTeacher) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold">Assignments</h1>
              <p className="text-muted-foreground">Create and manage assignments for your classes</p>
            </div>
            <Button variant="hero">
              <Plus className="h-4 w-4" />
              Create Assignment
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="shadow-card bg-warning/5 border-warning/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/20">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">23</p>
                    <p className="text-sm text-muted-foreground">Pending Grading</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card bg-info/5 border-info/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-info/20">
                    <Upload className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">72</p>
                    <p className="text-sm text-muted-foreground">Total Submissions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card bg-success/5 border-success/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/20">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">47</p>
                    <p className="text-sm text-muted-foreground">Graded</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assignments List */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-display">Active Assignments</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search assignments..." className="pl-9 w-64" />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teacherAssignments.map((assignment) => (
                  <div key={assignment.id} className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{assignment.title}</h3>
                          <Badge variant="outline">{assignment.class}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due: {assignment.dueDate}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm">Grade</Button>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="text-center p-2 rounded bg-muted/50">
                        <p className="text-lg font-semibold">{assignment.totalStudents}</p>
                        <p className="text-xs text-muted-foreground">Total Students</p>
                      </div>
                      <div className="text-center p-2 rounded bg-info/10">
                        <p className="text-lg font-semibold text-info">{assignment.submitted}</p>
                        <p className="text-xs text-muted-foreground">Submitted</p>
                      </div>
                      <div className="text-center p-2 rounded bg-success/10">
                        <p className="text-lg font-semibold text-success">{assignment.graded}</p>
                        <p className="text-xs text-muted-foreground">Graded</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold">Assignments</h1>
          <p className="text-muted-foreground">View and submit your assignments</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-card bg-warning/5 border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-warning" />
                <div>
                  <p className="text-2xl font-bold">{pendingAssignments.length}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card bg-info/5 border-info/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Upload className="h-8 w-8 text-info" />
                <div>
                  <p className="text-2xl font-bold">{submittedAssignments.length}</p>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card bg-success/5 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-success" />
                <div>
                  <p className="text-2xl font-bold">{gradedAssignments.length}</p>
                  <p className="text-sm text-muted-foreground">Graded</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingAssignments.length})</TabsTrigger>
            <TabsTrigger value="submitted">Submitted ({submittedAssignments.length})</TabsTrigger>
            <TabsTrigger value="graded">Graded ({gradedAssignments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingAssignments.map((assignment) => (
              <Card key={assignment.id} className="shadow-card hover:shadow-card-hover transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{assignment.subject}</Badge>
                        <Badge variant="outline" className={getStatusColor(assignment.status)}>
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg">{assignment.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Due: {assignment.dueDate}
                        </span>
                        <span>Max Marks: {assignment.maxMarks}</span>
                      </div>
                    </div>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Submit
                    </Button>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{assignment.progress}%</span>
                    </div>
                    <Progress value={assignment.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="submitted" className="space-y-4">
            {submittedAssignments.map((assignment) => (
              <Card key={assignment.id} className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{assignment.subject}</Badge>
                        <Badge variant="outline" className={getStatusColor(assignment.status)}>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Submitted
                        </Badge>
                      </div>
                      <h3 className="font-semibold">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground">Awaiting grade</p>
                    </div>
                    <Button variant="outline">View Submission</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="graded" className="space-y-4">
            {gradedAssignments.map((assignment) => (
              <Card key={assignment.id} className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{assignment.subject}</Badge>
                        <Badge variant="outline" className={getStatusColor(assignment.status)}>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Graded
                        </Badge>
                      </div>
                      <h3 className="font-semibold">{assignment.title}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-success">{assignment.marks}/{assignment.maxMarks}</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round((assignment.marks! / assignment.maxMarks) * 100)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
