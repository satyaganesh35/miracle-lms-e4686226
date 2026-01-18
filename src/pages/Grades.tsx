import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  BarChart3, TrendingUp, Award, BookOpen, Search, Save
} from 'lucide-react';
import { cn } from '@/lib/utils';

const studentGrades = {
  gpa: 8.7,
  cgpa: 8.45,
  rank: 12,
  totalStudents: 156,
  subjects: [
    { name: 'Data Structures & Algorithms', grade: 'A', marks: 92, maxMarks: 100, credits: 4 },
    { name: 'Database Management Systems', grade: 'A-', marks: 88, maxMarks: 100, credits: 4 },
    { name: 'Operating Systems', grade: 'B+', marks: 82, maxMarks: 100, credits: 3 },
    { name: 'Computer Networks', grade: 'A+', marks: 96, maxMarks: 100, credits: 4 },
    { name: 'Software Engineering', grade: 'A', marks: 90, maxMarks: 100, credits: 3 },
  ],
  exams: [
    { name: 'Mid-Semester Exam', subjects: [
      { name: 'Data Structures & Algorithms', marks: 45, maxMarks: 50 },
      { name: 'Database Management Systems', marks: 42, maxMarks: 50 },
      { name: 'Operating Systems', marks: 38, maxMarks: 50 },
    ]},
    { name: 'Internal Assessment 1', subjects: [
      { name: 'Data Structures & Algorithms', marks: 23, maxMarks: 25 },
      { name: 'Database Management Systems', marks: 22, maxMarks: 25 },
      { name: 'Operating Systems', marks: 20, maxMarks: 25 },
    ]},
    { name: 'Lab Practical', subjects: [
      { name: 'Computer Networks Lab', marks: 24, maxMarks: 25 },
      { name: 'DBMS Lab', marks: 22, maxMarks: 25 },
    ]},
  ],
};

const teacherGradingData = [
  { id: 1, name: 'Rahul Kumar', rollNo: '101', marks: '' },
  { id: 2, name: 'Priya Sharma', rollNo: '102', marks: '' },
  { id: 3, name: 'Amit Patel', rollNo: '103', marks: '' },
  { id: 4, name: 'Sneha Reddy', rollNo: '104', marks: '' },
  { id: 5, name: 'Vikram Singh', rollNo: '105', marks: '' },
];

const getGradeColor = (grade: string) => {
  if (grade.startsWith('A')) return 'text-success';
  if (grade.startsWith('B')) return 'text-info';
  if (grade.startsWith('C')) return 'text-warning';
  return 'text-destructive';
};

export default function Grades() {
  const { userRole } = useAuth();
  const isTeacher = userRole === 'teacher' || userRole === 'admin';
  const [gradingData, setGradingData] = useState(teacherGradingData);
  const [selectedAssignment, setSelectedAssignment] = useState('assignment1');

  const updateMarks = (studentId: number, marks: string) => {
    setGradingData(prev => prev.map(s => 
      s.id === studentId ? { ...s, marks } : s
    ));
  };

  if (isTeacher) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold">Grade Assignments</h1>
              <p className="text-muted-foreground">Enter marks for student submissions</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select assignment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assignment1">DSA Problem Set 5</SelectItem>
                  <SelectItem value="assignment2">DBMS Lab Report</SelectItem>
                  <SelectItem value="assignment3">OS Assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignment Info */}
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Assignment</p>
                  <p className="font-semibold">DSA Problem Set 5</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Section</p>
                  <p className="font-semibold">CSE 2nd Year - Sec A</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Max Marks</p>
                  <p className="font-semibold">100</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submissions</p>
                  <p className="font-semibold">28 / 35</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grading Table */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-display">Enter Marks</CardTitle>
                <Button variant="hero">
                  <Save className="h-4 w-4 mr-2" />
                  Save Grades
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {gradingData.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-medium">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">Roll No: {student.rollNo}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Marks"
                          className="w-24"
                          value={student.marks}
                          onChange={(e) => updateMarks(student.id, e.target.value)}
                        />
                        <span className="text-muted-foreground">/ 100</span>
                      </div>
                      <Button variant="outline" size="sm">View Submission</Button>
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
          <h1 className="text-2xl font-display font-bold">Grades & Performance</h1>
          <p className="text-muted-foreground">View your academic performance</p>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="shadow-card bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current SGPA</p>
                  <p className="text-3xl font-display font-bold">{studentGrades.gpa}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card bg-info/5 border-info/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">CGPA</p>
                  <p className="text-3xl font-display font-bold text-info">{studentGrades.cgpa}</p>
                </div>
                <div className="p-3 rounded-xl bg-info/10">
                  <TrendingUp className="h-6 w-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card bg-success/5 border-success/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Class Rank</p>
                  <p className="text-3xl font-display font-bold text-success">#{studentGrades.rank}</p>
                </div>
                <div className="p-3 rounded-xl bg-success/10">
                  <Award className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Credits</p>
                  <p className="text-3xl font-display font-bold">17</p>
                </div>
                <div className="p-3 rounded-xl bg-muted">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="subjects" className="space-y-4">
          <TabsList>
            <TabsTrigger value="subjects">Subject Grades</TabsTrigger>
            <TabsTrigger value="exams">Exam Results</TabsTrigger>
          </TabsList>

          <TabsContent value="subjects" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display">Current Semester Grades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentGrades.subjects.map((subject) => (
                    <div key={subject.name} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className={cn("text-2xl font-bold", getGradeColor(subject.grade))}>
                            {subject.grade}
                          </span>
                          <div>
                            <p className="font-semibold">{subject.name}</p>
                            <p className="text-sm text-muted-foreground">{subject.credits} Credits</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">{subject.marks}/{subject.maxMarks}</p>
                          <p className="text-sm text-muted-foreground">{subject.marks}%</p>
                        </div>
                      </div>
                      <Progress value={subject.marks} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams" className="space-y-4">
            {studentGrades.exams.map((exam, examIndex) => (
              <Card key={examIndex} className="shadow-card">
                <CardHeader>
                  <CardTitle className="font-display">{exam.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {exam.subjects.map((subject, subIndex) => (
                      <div key={subIndex} className="p-4 rounded-lg bg-muted/50">
                        <p className="font-medium mb-2">{subject.name}</p>
                        <div className="flex items-end justify-between">
                          <p className="text-2xl font-bold">{subject.marks}</p>
                          <p className="text-sm text-muted-foreground">/ {subject.maxMarks}</p>
                        </div>
                        <Progress value={(subject.marks / subject.maxMarks) * 100} className="h-2 mt-2" />
                      </div>
                    ))}
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
