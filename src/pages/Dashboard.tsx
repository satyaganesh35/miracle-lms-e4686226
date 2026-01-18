import { useAuth } from '@/hooks/useAuth';
import { useAttendance, useAssignments, useSubmissions, useNotifications, useFees, useTimetable, useMaterials } from '@/hooks/useLMS';
import DashboardLayout from '@/components/layout/DashboardLayout';
import WelcomeCard from '@/components/dashboard/WelcomeCard';
import StatsGrid from '@/components/dashboard/StatsGrid';
import AttendanceChart from '@/components/dashboard/AttendanceChart';
import GradesChart from '@/components/dashboard/GradesChart';
import UpcomingSchedule from '@/components/dashboard/UpcomingSchedule';
import QuickActions from '@/components/dashboard/QuickActions';
import AssignmentsList from '@/components/dashboard/AssignmentsList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  MessageSquare,
  DollarSign,
  Activity,
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

  // Calculate attendance stats
  const totalClasses = attendance?.length || 0;
  const presentClasses = attendance?.filter(a => a.status === 'present').length || 0;
  const absentClasses = attendance?.filter(a => a.status === 'absent').length || 0;
  const lateClasses = attendance?.filter(a => a.status === 'late').length || 0;
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

  // Calculate grades data from submissions
  const gradesData = submissions?.filter(s => s.marks !== null).map(s => {
    const assignment = assignments?.find(a => a.id === s.assignment_id);
    return {
      subject: (assignment?.classes as any)?.courses?.name?.substring(0, 15) || 'Subject',
      marks: s.marks || 0,
      maxMarks: assignment?.max_marks || 100,
    };
  }).slice(0, 5) || [];

  if (attendanceLoading || assignmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Format assignments for the list component
  const formattedAssignments = pendingAssignments.map(a => ({
    id: a.id,
    title: a.title,
    course: (a.classes as any)?.courses?.name || 'Course',
    dueDate: a.due_date,
    maxMarks: a.max_marks,
    status: 'pending' as const,
  }));

  // Format schedule for the component
  const scheduleItems = todaySchedule.map((item, index) => ({
    id: String(index),
    time: item.start_time?.substring(0, 5) || '',
    endTime: item.end_time?.substring(0, 5),
    subject: (item.classes as any)?.courses?.name || 'Class',
    teacher: (item.classes as any)?.profiles?.full_name,
    room: item.room || 'TBA',
    status: 'upcoming' as const,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Card */}
      <WelcomeCard 
        userName={user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'} 
        role="student" 
      />

      {/* Stats Grid */}
      <StatsGrid stats={[
        {
          title: 'Attendance',
          value: `${attendancePercentage}%`,
          icon: <CheckSquare className="h-6 w-6" />,
          variant: attendancePercentage >= 75 ? 'success' : 'warning',
          description: `${presentClasses}/${totalClasses} classes`,
        },
        {
          title: 'Assignments Due',
          value: pendingAssignments.length,
          icon: <ClipboardList className="h-6 w-6" />,
          variant: pendingAssignments.length > 0 ? 'warning' : 'success',
          description: pendingAssignments.length > 0 ? 'Pending submission' : 'All submitted',
        },
        {
          title: 'Notifications',
          value: unreadNotifications,
          icon: <Bell className="h-6 w-6" />,
          variant: 'info',
          description: 'Unread messages',
        },
        {
          title: 'Fee Pending',
          value: pendingFees > 0 ? `₹${pendingFees.toLocaleString()}` : '₹0',
          icon: <DollarSign className="h-6 w-6" />,
          variant: pendingFees > 0 ? 'destructive' : 'success',
          description: pendingFees > 0 ? 'Due soon' : 'All paid',
        },
      ]} />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AttendanceChart 
          present={presentClasses} 
          absent={absentClasses} 
          late={lateClasses} 
        />
        <GradesChart data={gradesData} />
      </div>

      {/* Schedule and Assignments */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UpcomingSchedule 
            title="Today's Schedule" 
            date={today}
            items={scheduleItems}
          />
        </div>
        <QuickActions 
          columns={2}
          actions={[
            { label: 'Assignments', icon: ClipboardList, href: '/assignments', variant: 'default' },
            { label: 'Attendance', icon: CheckSquare, href: '/attendance', variant: 'default' },
            { label: 'Study Materials', icon: FileText, href: '/notes', variant: 'default' },
            { label: 'AI Assistant', icon: GraduationCap, href: '/query-bot', variant: 'accent' },
          ]}
        />
      </div>

      {/* Pending Assignments */}
      <AssignmentsList assignments={formattedAssignments} />
    </div>
  );
}

function TeacherDashboard() {
  const { user } = useAuth();
  const { data: assignments, isLoading } = useAssignments();
  const { data: materials } = useMaterials();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Card */}
      <WelcomeCard 
        userName={user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Teacher'} 
        role="teacher" 
      />

      {/* Stats Grid */}
      <StatsGrid stats={[
        {
          title: 'Active Assignments',
          value: assignments?.length || 0,
          icon: <ClipboardList className="h-6 w-6" />,
          variant: 'primary',
        },
        {
          title: 'Materials Uploaded',
          value: materials?.length || 0,
          icon: <FileText className="h-6 w-6" />,
          variant: 'info',
        },
        {
          title: 'Classes Today',
          value: '4',
          icon: <Calendar className="h-6 w-6" />,
          variant: 'success',
        },
        {
          title: 'Pending Grading',
          value: '12',
          icon: <BarChart3 className="h-6 w-6" />,
          variant: 'warning',
        },
      ]} />

      {/* Quick Actions and Recent Assignments */}
      <div className="grid gap-6 lg:grid-cols-2">
        <QuickActions 
          columns={2}
          actions={[
            { label: 'Take Attendance', icon: CheckSquare, href: '/attendance', variant: 'primary' },
            { label: 'Upload Notes', icon: Upload, href: '/upload', variant: 'default' },
            { label: 'Assignments', icon: ClipboardList, href: '/assignments', variant: 'default' },
            { label: 'Grade Work', icon: BarChart3, href: '/grades', variant: 'default' },
            { label: 'View Timetable', icon: Calendar, href: '/timetable', variant: 'default' },
            { label: 'AI Assistant', icon: GraduationCap, href: '/query-bot', variant: 'accent' },
          ]}
        />

        <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              Recent Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignments?.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No assignments created yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments?.slice(0, 4).map((assignment) => (
                  <div key={assignment.id} className="p-4 rounded-xl border hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-sm">{assignment.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary">{assignment.max_marks} marks</Badge>
                    </div>
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
  const { user } = useAuth();
  const { data: notifications } = useNotifications();
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Card */}
      <WelcomeCard 
        userName={user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin'} 
        role="admin" 
      />

      {/* Stats Grid */}
      <StatsGrid stats={[
        {
          title: 'Total Users',
          value: '2,535',
          icon: <Users className="h-6 w-6" />,
          variant: 'primary',
          trend: { value: 12, isPositive: true },
        },
        {
          title: 'Active Courses',
          value: '124',
          icon: <BookOpen className="h-6 w-6" />,
          variant: 'success',
        },
        {
          title: 'Notifications Sent',
          value: notifications?.length || 0,
          icon: <Bell className="h-6 w-6" />,
          variant: 'info',
        },
        {
          title: 'Fee Collection',
          value: '₹24.5L',
          icon: <TrendingUp className="h-6 w-6" />,
          variant: 'warning',
          trend: { value: 8, isPositive: true },
        },
      ]} />

      {/* Quick Actions and Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <QuickActions 
          columns={2}
          actions={[
            { label: 'Manage Users', icon: Users, href: '/users', variant: 'primary' },
            { label: 'Notifications', icon: Bell, href: '/notifications', variant: 'default' },
            { label: 'Fee Management', icon: DollarSign, href: '/fees', variant: 'default' },
            { label: 'AI Assistant', icon: GraduationCap, href: '/query-bot', variant: 'accent' },
          ]}
        />

        <Card className="lg:col-span-2 shadow-lg border-0 bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-info/10">
                <Activity className="h-5 w-5 text-info" />
              </div>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: 'New student registration', time: '2 mins ago', type: 'success' },
                { action: 'Fee payment received - ₹15,000', time: '15 mins ago', type: 'info' },
                { action: 'Assignment submitted by 45 students', time: '1 hour ago', type: 'default' },
                { action: 'New course material uploaded', time: '2 hours ago', type: 'default' },
                { action: 'System backup completed', time: '3 hours ago', type: 'success' },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className={`h-2.5 w-2.5 rounded-full ${
                    item.type === 'success' ? 'bg-success' : 
                    item.type === 'info' ? 'bg-info' : 'bg-primary'
                  }`} />
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

      {/* System Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Status</p>
                <p className="text-2xl font-bold font-display mt-1">Healthy</p>
                <p className="text-xs text-success mt-2 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-success inline-block"></span>
                  All services operational
                </p>
              </div>
              <div className="p-4 rounded-xl bg-success/10">
                <Activity className="h-8 w-8 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-info/5 to-info/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Chatbot</p>
                <p className="text-2xl font-bold font-display mt-1">Active</p>
                <p className="text-xs text-muted-foreground mt-2">
                  156 queries resolved today
                </p>
              </div>
              <div className="p-4 rounded-xl bg-info/10">
                <MessageSquare className="h-8 w-8 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-warning/5 to-warning/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Database</p>
                <p className="text-2xl font-bold font-display mt-1">Connected</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Last sync: Just now
                </p>
              </div>
              <div className="p-4 rounded-xl bg-warning/10">
                <BookOpen className="h-8 w-8 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { userRole, user, loading } = useAuth();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
          <div className="p-6 rounded-full bg-primary/10 mb-6">
            <GraduationCap className="h-16 w-16 text-primary" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-2">Welcome to Miracle LMS</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Your profile is being set up. This may take a moment. If this persists, please try signing out and back in.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => window.location.reload()} variant="outline">
              Refresh Page
            </Button>
            <Link to="/auth">
              <Button>Go to Login</Button>
            </Link>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}