import { useAuth } from '@/hooks/useAuth';
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
} from 'lucide-react';

// Student Dashboard Component
function StudentDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Attendance"
          value="92%"
          icon={<CheckSquare className="h-6 w-6" />}
          variant="success"
          description="This semester"
          trend={{ value: 3, isPositive: true }}
        />
        <StatsCard
          title="Assignments Due"
          value="5"
          icon={<ClipboardList className="h-6 w-6" />}
          variant="warning"
          description="This week"
        />
        <StatsCard
          title="Average Grade"
          value="A-"
          icon={<BarChart3 className="h-6 w-6" />}
          variant="primary"
          description="Current GPA: 3.7"
        />
        <StatsCard
          title="Courses Enrolled"
          value="6"
          icon={<BookOpen className="h-6 w-6" />}
          variant="info"
          description="Active courses"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Today's Schedule
            </CardTitle>
            <CardDescription>Your classes for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { time: '09:00 AM', subject: 'Mathematics', room: 'Room 301', teacher: 'Dr. Sharma' },
                { time: '10:30 AM', subject: 'Physics', room: 'Lab 102', teacher: 'Prof. Kumar' },
                { time: '12:00 PM', subject: 'Computer Science', room: 'Room 205', teacher: 'Mrs. Reddy' },
                { time: '02:00 PM', subject: 'English', room: 'Room 101', teacher: 'Mr. Ravi' },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex-shrink-0 w-20">
                    <p className="text-sm font-medium text-primary">{item.time}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.subject}</p>
                    <p className="text-sm text-muted-foreground">{item.teacher} • {item.room}</p>
                  </div>
                  <Badge variant="outline">Upcoming</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: 'Assignment Submitted', desc: 'Math homework graded', time: '2h ago', type: 'success' },
                { title: 'New Material', desc: 'Physics notes uploaded', time: '5h ago', type: 'info' },
                { title: 'Fee Reminder', desc: 'Payment due in 5 days', time: '1d ago', type: 'warning' },
              ].map((item, index) => (
                <div key={index} className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                    item.type === 'success' ? 'bg-success' : 
                    item.type === 'warning' ? 'bg-warning' : 'bg-info'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Assignments */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Pending Assignments
          </CardTitle>
          <CardDescription>Complete these before the deadline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { subject: 'Mathematics', title: 'Calculus Problem Set 5', due: 'Tomorrow', progress: 60 },
              { subject: 'Physics', title: 'Lab Report - Optics', due: 'In 3 days', progress: 30 },
              { subject: 'Computer Science', title: 'Python Project', due: 'In 5 days', progress: 0 },
            ].map((item, index) => (
              <div key={index} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Badge variant="secondary" className="mb-2">{item.subject}</Badge>
                    <p className="font-medium">{item.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {item.due}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Teacher Dashboard Component
function TeacherDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Students"
          value="156"
          icon={<Users className="h-6 w-6" />}
          variant="primary"
          description="Across all classes"
        />
        <StatsCard
          title="Assignments to Grade"
          value="23"
          icon={<ClipboardList className="h-6 w-6" />}
          variant="warning"
          description="Pending review"
        />
        <StatsCard
          title="Classes Today"
          value="4"
          icon={<Calendar className="h-6 w-6" />}
          variant="info"
          description="Next: Room 301"
        />
        <StatsCard
          title="Avg. Attendance"
          value="88%"
          icon={<CheckSquare className="h-6 w-6" />}
          variant="success"
          description="This month"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Quick Actions</CardTitle>
            <CardDescription>Common tasks and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                <span>Take Attendance</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <Upload className="h-5 w-5 text-primary" />
                <span>Upload Notes</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                <span>Create Assignment</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span>Grade Work</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pending Grading */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Pending Grading
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { class: 'Class 10-A', assignment: 'Math Quiz', submissions: 32, pending: 12 },
                { class: 'Class 11-B', assignment: 'Physics Lab', submissions: 28, pending: 8 },
                { class: 'Class 12-A', assignment: 'Final Project', submissions: 25, pending: 3 },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{item.assignment}</p>
                    <p className="text-sm text-muted-foreground">{item.class}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={item.pending > 10 ? "destructive" : "secondary"}>
                      {item.pending} pending
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{item.submissions} submitted</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Classes */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Today's Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { time: '09:00 AM', class: 'Class 10-A', subject: 'Mathematics', room: 'Room 301', students: 35 },
              { time: '10:30 AM', class: 'Class 11-B', subject: 'Mathematics', room: 'Room 302', students: 32 },
              { time: '12:00 PM', class: 'Class 12-A', subject: 'Mathematics', room: 'Room 303', students: 28 },
              { time: '02:00 PM', class: 'Class 10-B', subject: 'Mathematics', room: 'Room 301', students: 34 },
            ].map((item, index) => (
              <div key={index} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <p className="text-sm font-medium text-primary mb-2">{item.time}</p>
                <p className="font-semibold">{item.class}</p>
                <p className="text-sm text-muted-foreground">{item.subject}</p>
                <div className="flex items-center justify-between mt-3 text-sm">
                  <span className="text-muted-foreground">{item.room}</span>
                  <Badge variant="outline">{item.students} students</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Admin Dashboard Component
function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Students"
          value="2,450"
          icon={<GraduationCap className="h-6 w-6" />}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
          description="Active enrollments"
        />
        <StatsCard
          title="Total Teachers"
          value="85"
          icon={<Users className="h-6 w-6" />}
          variant="info"
          description="Faculty members"
        />
        <StatsCard
          title="Courses"
          value="124"
          icon={<BookOpen className="h-6 w-6" />}
          variant="success"
          description="Active courses"
        />
        <StatsCard
          title="Fee Collection"
          value="₹24.5L"
          icon={<TrendingUp className="h-6 w-6" />}
          variant="warning"
          trend={{ value: 8, isPositive: true }}
          description="This month"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                Manage Users
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Bell className="h-4 w-4" />
                Send Notification
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <BookOpen className="h-4 w-4" />
                Add New Course
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <BarChart3 className="h-4 w-4" />
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
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
                { action: 'New student registered', user: 'Rahul Kumar', time: '5 mins ago' },
                { action: 'Fee payment received', user: 'Priya Sharma', time: '15 mins ago' },
                { action: 'Course material uploaded', user: 'Dr. Reddy', time: '1 hour ago' },
                { action: 'Attendance marked', user: 'Prof. Kumar', time: '2 hours ago' },
                { action: 'New teacher added', user: 'Admin', time: '3 hours ago' },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">by {item.user}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Overview */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display">Department Overview</CardTitle>
          <CardDescription>Students and faculty distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Engineering', students: 850, teachers: 28, color: 'bg-primary' },
              { name: 'Medical', students: 620, teachers: 22, color: 'bg-success' },
              { name: 'Commerce', students: 540, teachers: 18, color: 'bg-info' },
              { name: 'Arts', students: 440, teachers: 17, color: 'bg-warning' },
            ].map((dept, index) => (
              <div key={index} className="p-4 rounded-lg border">
                <div className={`h-1 w-12 rounded-full ${dept.color} mb-3`} />
                <p className="font-semibold">{dept.name}</p>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <p>{dept.students} Students</p>
                  <p>{dept.teachers} Teachers</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  const { userRole, loading } = useAuth();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
          <p className="text-muted-foreground">Your account is being set up. Please wait or contact administrator.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
