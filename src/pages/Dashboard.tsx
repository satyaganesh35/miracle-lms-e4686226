import { useAuth } from '@/hooks/useAuth';
import { useAttendance, useAssignments, useSubmissions, useNotifications, useFees, useTimetable } from '@/hooks/useLMS';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  BookOpen,
  ClipboardList,
  CheckSquare,
  BarChart3,
  Calendar,
  Bell,
  FileText,
  Clock,
  TrendingUp,
  GraduationCap,
  Upload,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

function StudentDashboard() {
  const { user } = useAuth();
  const { data: attendance, isLoading: attendanceLoading } = useAttendance(user?.id);
  const { data: assignments, isLoading: assignmentsLoading } = useAssignments();
  const { data: submissions } = useSubmissions(user?.id);
  const { data: notifications } = useNotifications(user?.id);
  const { data: fees } = useFees(user?.id);
  const { data: timetable } = useTimetable(user?.id);

  // Calculate attendance percentage
  const totalClasses = attendance?.length || 0;
  const presentClasses = attendance?.filter(a => a.status === 'present').length || 0;
  const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

  // Get pending assignments
  const pendingAssignments = assignments?.filter(a => {
    const submission = submissions?.find(s => s.assignment_id === a.id);
    return !submission && new Date(a.due_date) > new Date();
  }) || [];

  // Get unread notifications
  const unreadNotifications = notifications?.filter(n => !n.read).length || 0;

  // Calculate fee status
  const totalFees = fees?.reduce((sum, f) => sum + Number(f.amount), 0) || 0;
  const paidFees = fees?.filter(f => f.status === 'paid').reduce((sum, f) => sum + Number(f.amount), 0) || 0;
  const pendingFees = totalFees - paidFees;

  // Get today's schedule
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todaySchedule = timetable?.filter(t => t.day_of_week === today) || [];

  if (attendanceLoading || assignmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Attendance"
          value={`${attendancePercentage}%`}
          icon={<CheckSquare className="h-6 w-6" />}
          variant={attendancePercentage >= 75 ? "success" : "warning"}
          description={`${presentClasses}/${totalClasses} classes`}
        />
        <StatsCard
          title="Assignments Due"
          value={pendingAssignments.length}
          icon={<ClipboardList className="h-6 w-6" />}
          variant="warning"
          description="Pending submission"
        />
        <StatsCard
          title="Notifications"
          value={unreadNotifications}
          icon={<Bell className="h-6 w-6" />}
          variant="info"
          description="Unread messages"
        />
        <StatsCard
          title="Fee Pending"
          value={`₹${pendingFees.toLocaleString()}`}
          icon={<TrendingUp className="h-6 w-6" />}
          variant={pendingFees > 0 ? "warning" : "success"}
          description={pendingFees > 0 ? "Due soon" : "All paid"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Today's Schedule ({today})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaySchedule.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No classes scheduled for today</p>
            ) : (
              <div className="space-y-3">
                {todaySchedule.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="flex-shrink-0 w-20">
                      <p className="text-sm font-medium text-primary">{item.start_time}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{(item.classes as any)?.courses?.name || 'Class'}</p>
                      <p className="text-sm text-muted-foreground">
                        {(item.classes as any)?.profiles?.full_name} • {item.room || 'TBA'}
                      </p>
                    </div>
                    <Badge variant="outline">Upcoming</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/assignments">
              <Button variant="outline" className="w-full justify-start gap-2">
                <ClipboardList className="h-4 w-4" />
                View Assignments
              </Button>
            </Link>
            <Link to="/attendance">
              <Button variant="outline" className="w-full justify-start gap-2">
                <CheckSquare className="h-4 w-4" />
                Check Attendance
              </Button>
            </Link>
            <Link to="/notes">
              <Button variant="outline" className="w-full justify-start gap-2">
                <FileText className="h-4 w-4" />
                Study Materials
              </Button>
            </Link>
            <Link to="/query-bot">
              <Button variant="hero" className="w-full justify-start gap-2">
                <GraduationCap className="h-4 w-4" />
                Ask AI Assistant
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Pending Assignments */}
      {pendingAssignments.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Pending Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingAssignments.slice(0, 3).map((assignment) => (
                <div key={assignment.id} className="p-4 rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="secondary" className="mb-2">
                        {(assignment.classes as any)?.courses?.name || 'Course'}
                      </Badge>
                      <p className="font-medium">{assignment.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(assignment.due_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm font-medium">{assignment.max_marks} marks</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TeacherDashboard() {
  const { data: assignments, isLoading } = useAssignments();
  const { data: materials } = useMaterials();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Assignments"
          value={assignments?.length || 0}
          icon={<ClipboardList className="h-6 w-6" />}
          variant="primary"
        />
        <StatsCard
          title="Materials Uploaded"
          value={materials?.length || 0}
          icon={<FileText className="h-6 w-6" />}
          variant="info"
        />
        <StatsCard
          title="Classes Today"
          value="4"
          icon={<Calendar className="h-6 w-6" />}
          variant="success"
        />
        <StatsCard
          title="Pending Grading"
          value="12"
          icon={<BarChart3 className="h-6 w-6" />}
          variant="warning"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/attendance">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <CheckSquare className="h-5 w-5 text-primary" />
                  <span>Take Attendance</span>
                </Button>
              </Link>
              <Link to="/upload">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  <span>Upload Notes</span>
                </Button>
              </Link>
              <Link to="/assignments">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  <span>Assignments</span>
                </Button>
              </Link>
              <Link to="/grades">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span>Grade Work</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Recent Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {assignments?.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No assignments created yet</p>
            ) : (
              <div className="space-y-3">
                {assignments?.slice(0, 3).map((assignment) => (
                  <div key={assignment.id} className="p-3 rounded-lg bg-muted/50">
                    <p className="font-medium">{assignment.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(assignment.due_date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { data: notifications } = useNotifications();
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value="2,535"
          icon={<Users className="h-6 w-6" />}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Active Courses"
          value="124"
          icon={<BookOpen className="h-6 w-6" />}
          variant="success"
        />
        <StatsCard
          title="Notifications Sent"
          value={notifications?.length || 0}
          icon={<Bell className="h-6 w-6" />}
          variant="info"
        />
        <StatsCard
          title="Fee Collection"
          value="₹24.5L"
          icon={<TrendingUp className="h-6 w-6" />}
          variant="warning"
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/users">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                Manage Users
              </Button>
            </Link>
            <Link to="/notifications">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Bell className="h-4 w-4" />
                Send Notification
              </Button>
            </Link>
            <Link to="/fees">
              <Button variant="outline" className="w-full justify-start gap-2">
                <TrendingUp className="h-4 w-4" />
                Fee Management
              </Button>
            </Link>
            <Link to="/query-bot">
              <Button variant="hero" className="w-full justify-start gap-2">
                <GraduationCap className="h-4 w-4" />
                AI Assistant
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'System initialized', time: 'Just now' },
                { action: 'Database connected', time: '1 min ago' },
                { action: 'AI Chatbot activated', time: '2 mins ago' },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.action}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Need to import useMaterials
import { useMaterials } from '@/hooks/useLMS';

export default function Dashboard() {
  const { userRole, loading } = useAuth();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {userRole === 'student' && <StudentDashboard />}
      {userRole === 'teacher' && <TeacherDashboard />}
      {userRole === 'admin' && <AdminDashboard />}
      {!userRole && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-display font-bold mb-2">Welcome to Miracle LMS</h2>
          <p className="text-muted-foreground mb-4">Your profile is being set up. This may take a moment.</p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      )}
    </DashboardLayout>
  );
}
