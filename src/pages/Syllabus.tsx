import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Download, FileText, Plus, ChevronDown, ChevronRight, CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

const syllabusData = [
  {
    subject: 'Mathematics',
    teacher: 'Dr. Sharma',
    progress: 65,
    units: [
      { name: 'Unit 1: Calculus', topics: ['Limits', 'Derivatives', 'Integration'], completed: true },
      { name: 'Unit 2: Algebra', topics: ['Matrices', 'Determinants', 'Linear Equations'], completed: true },
      { name: 'Unit 3: Trigonometry', topics: ['Identities', 'Equations', 'Applications'], completed: false },
      { name: 'Unit 4: Statistics', topics: ['Probability', 'Distributions', 'Hypothesis Testing'], completed: false },
    ]
  },
  {
    subject: 'Physics',
    teacher: 'Prof. Kumar',
    progress: 50,
    units: [
      { name: 'Unit 1: Mechanics', topics: ['Kinematics', 'Dynamics', 'Work & Energy'], completed: true },
      { name: 'Unit 2: Thermodynamics', topics: ['Laws of Thermodynamics', 'Heat Transfer'], completed: true },
      { name: 'Unit 3: Optics', topics: ['Reflection', 'Refraction', 'Interference'], completed: false },
      { name: 'Unit 4: Electromagnetism', topics: ['Electric Fields', 'Magnetic Fields', 'Induction'], completed: false },
    ]
  },
  {
    subject: 'Chemistry',
    teacher: 'Dr. Patel',
    progress: 40,
    units: [
      { name: 'Unit 1: Organic Chemistry', topics: ['Hydrocarbons', 'Functional Groups', 'Reactions'], completed: true },
      { name: 'Unit 2: Inorganic Chemistry', topics: ['Periodic Table', 'Chemical Bonding', 'Coordination Compounds'], completed: false },
      { name: 'Unit 3: Physical Chemistry', topics: ['Thermochemistry', 'Electrochemistry', 'Kinetics'], completed: false },
    ]
  },
  {
    subject: 'Computer Science',
    teacher: 'Mr. Ravi',
    progress: 75,
    units: [
      { name: 'Unit 1: Programming Fundamentals', topics: ['Variables', 'Control Flow', 'Functions'], completed: true },
      { name: 'Unit 2: Data Structures', topics: ['Arrays', 'Linked Lists', 'Trees'], completed: true },
      { name: 'Unit 3: Algorithms', topics: ['Sorting', 'Searching', 'Graph Algorithms'], completed: true },
      { name: 'Unit 4: Database Systems', topics: ['SQL', 'Normalization', 'Transactions'], completed: false },
    ]
  },
];

export default function Syllabus() {
  const { userRole } = useAuth();
  const isTeacher = userRole === 'teacher';
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>(['Mathematics']);

  const toggleSubject = (subject: string) => {
    setExpandedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Syllabus</h1>
            <p className="text-muted-foreground">
              {isTeacher ? 'Manage course syllabi and content' : 'Track your course progress and content'}
            </p>
          </div>
          {isTeacher && (
            <Button variant="hero">
              <Plus className="h-4 w-4" />
              Add Syllabus
            </Button>
          )}
        </div>

        {/* Progress Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {syllabusData.map((course) => (
            <Card key={course.subject} className="shadow-card hover:shadow-card-hover transition-shadow cursor-pointer" onClick={() => toggleSubject(course.subject)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <Badge variant={course.progress >= 70 ? "default" : course.progress >= 40 ? "secondary" : "outline"}>
                    {course.progress}%
                  </Badge>
                </div>
                <h3 className="font-semibold mb-1">{course.subject}</h3>
                <p className="text-sm text-muted-foreground mb-3">{course.teacher}</p>
                <Progress value={course.progress} className="h-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Syllabus */}
        <div className="space-y-4">
          {syllabusData.map((course) => (
            <Card key={course.subject} className="shadow-card overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleSubject(course.subject)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {expandedSubjects.includes(course.subject) ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <CardTitle className="font-display">{course.subject}</CardTitle>
                      <CardDescription>{course.teacher} • {course.units.length} Units</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{course.progress}% Complete</p>
                      <Progress value={course.progress} className="h-2 w-24" />
                    </div>
                    <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {expandedSubjects.includes(course.subject) && (
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {course.units.map((unit, unitIndex) => (
                      <div key={unitIndex} className={cn(
                        "p-4 rounded-lg border",
                        unit.completed ? "bg-success/5 border-success/20" : "bg-muted/30"
                      )}>
                        <div className="flex items-center gap-3 mb-3">
                          {unit.completed ? (
                            <CheckCircle className="h-5 w-5 text-success" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                          <h4 className="font-semibold">{unit.name}</h4>
                          {unit.completed && <Badge variant="outline" className="text-success border-success/50">Completed</Badge>}
                        </div>
                        <div className="ml-8 flex flex-wrap gap-2">
                          {unit.topics.map((topic, topicIndex) => (
                            <Badge key={topicIndex} variant="secondary" className="font-normal">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
