import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckSquare, Calendar, TrendingUp, AlertCircle, 
  Check, X, Clock, Users, Save
} from 'lucide-react';
import { cn } from '@/lib/utils';

const studentAttendance = {
  overall: 92,
  thisMonth: 95,
  subjects: [
    { name: 'Mathematics', present: 28, total: 30, percentage: 93 },
    { name: 'Physics', present: 26, total: 28, percentage: 93 },
    { name: 'Chemistry', present: 24, total: 26, percentage: 92 },
    { name: 'Computer Science', present: 22, total: 24, percentage: 92 },
    { name: 'English', present: 20, total: 22, percentage: 91 },
  ],
  recentClasses: [
    { date: '2024-01-18', subject: 'Mathematics', status: 'present' },
    { date: '2024-01-18', subject: 'Physics', status: 'present' },
    { date: '2024-01-17', subject: 'Chemistry', status: 'present' },
    { date: '2024-01-17', subject: 'English', status: 'absent' },
    { date: '2024-01-16', subject: 'Computer Science', status: 'present' },
    { date: '2024-01-16', subject: 'Mathematics', status: 'present' },
    { date: '2024-01-15', subject: 'Physics', status: 'late' },
    { date: '2024-01-15', subject: 'Chemistry', status: 'present' },
  ],
};

const classStudents = [
  { id: 1, name: 'Rahul Kumar', rollNo: '101', present: false },
  { id: 2, name: 'Priya Sharma', rollNo: '102', present: false },
  { id: 3, name: 'Amit Patel', rollNo: '103', present: false },
  { id: 4, name: 'Sneha Reddy', rollNo: '104', present: false },
  { id: 5, name: 'Vikram Singh', rollNo: '105', present: false },
  { id: 6, name: 'Ananya Gupta', rollNo: '106', present: false },
  { id: 7, name: 'Karthik Nair', rollNo: '107', present: false },
  { id: 8, name: 'Divya Menon', rollNo: '108', present: false },
];

export default function Attendance() {
  const { userRole } = useAuth();
  const isTeacher = userRole === 'teacher' || userRole === 'admin';
  const [students, setStudents] = useState(classStudents);
  const [selectedClass, setSelectedClass] = useState('10-A');

  const toggleAttendance = (studentId: number) => {
    setStudents(prev => prev.map(s => 
      s.id === studentId ? { ...s, present: !s.present } : s
    ));
  };

  const markAllPresent = () => {
    setStudents(prev => prev.map(s => ({ ...s, present: true })));
  };

  const presentCount = students.filter(s => s.present).length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <Check className="h-4 w-4 text-success" />;
      case 'absent': return <X className="h-4 w-4 text-destructive" />;
      case 'late': return <Clock className="h-4 w-4 text-warning" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present': return <Badge className="bg-success/10 text-success border-success/30">Present</Badge>;
      case 'absent': return <Badge className="bg-destructive/10 text-destructive border-destructive/30">Absent</Badge>;
      case 'late': return <Badge className="bg-warning/10 text-warning border-warning/30">Late</Badge>;
      default: return null;
    }
  };

  if (isTeacher) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold">Take Attendance</h1>
              <p className="text-muted-foreground">Mark attendance for your classes</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10-A">Class 10-A</SelectItem>
                  <SelectItem value="10-B">Class 10-B</SelectItem>
                  <SelectItem value="11-A">Class 11-A</SelectItem>
                  <SelectItem value="11-B">Class 11-B</SelectItem>
                  <SelectItem value="12-A">Class 12-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{students.length}</p>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card bg-success/5 border-success/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/20">
                    <Check className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-success">{presentCount}</p>
                    <p className="text-sm text-muted-foreground">Present</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card bg-destructive/5 border-destructive/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/20">
                    <X className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-destructive">{students.length - presentCount}</p>
                    <p className="text-sm text-muted-foreground">Absent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance List */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-display">Class {selectedClass} - Mathematics</CardTitle>
                  <CardDescription>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={markAllPresent}>Mark All Present</Button>
                  <Button variant="hero">
                    <Save className="h-4 w-4 mr-2" />
                    Save Attendance
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {students.map((student) => (
                  <div 
                    key={student.id} 
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors",
                      student.present ? "bg-success/5 border-success/20" : "hover:bg-muted/50"
                    )}
                    onClick={() => toggleAttendance(student.id)}
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox checked={student.present} />
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">Roll No: {student.rollNo}</p>
                      </div>
                    </div>
                    {student.present ? (
                      <Badge className="bg-success text-success-foreground">Present</Badge>
                    ) : (
                      <Badge variant="outline">Absent</Badge>
                    )}
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
          <h1 className="text-2xl font-display font-bold">Attendance</h1>
          <p className="text-muted-foreground">Track your class attendance</p>
        </div>

        {/* Overall Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-card bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Attendance</p>
                  <p className="text-3xl font-display font-bold">{studentAttendance.overall}%</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <CheckSquare className="h-6 w-6 text-primary" />
                </div>
              </div>
              <Progress value={studentAttendance.overall} className="h-2 mt-4" />
            </CardContent>
          </Card>
          <Card className="shadow-card bg-success/5 border-success/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-3xl font-display font-bold text-success">{studentAttendance.thisMonth}%</p>
                </div>
                <div className="p-3 rounded-xl bg-success/10">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-xl font-display font-bold text-success">Good Standing</p>
                </div>
                <div className="p-3 rounded-xl bg-success/10">
                  <Check className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject-wise Attendance */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Subject-wise Attendance</CardTitle>
            <CardDescription>Your attendance breakdown by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentAttendance.subjects.map((subject) => (
                <div key={subject.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{subject.name}</span>
                      {subject.percentage < 75 && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "font-semibold",
                        subject.percentage >= 90 ? "text-success" : 
                        subject.percentage >= 75 ? "text-warning" : "text-destructive"
                      )}>
                        {subject.percentage}%
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({subject.present}/{subject.total} classes)
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={subject.percentage} 
                    className={cn(
                      "h-2",
                      subject.percentage >= 90 ? "[&>div]:bg-success" : 
                      subject.percentage >= 75 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"
                    )} 
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Attendance */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display">Recent Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {studentAttendance.recentClasses.map((cls, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(cls.status)}
                    <div>
                      <p className="font-medium">{cls.subject}</p>
                      <p className="text-sm text-muted-foreground">{cls.date}</p>
                    </div>
                  </div>
                  {getStatusBadge(cls.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
