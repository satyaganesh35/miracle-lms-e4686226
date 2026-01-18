import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useClasses, useCourses, useAssignments, useSubmissions } from '@/hooks/useLMS';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Download, Plus, ChevronDown, ChevronRight, CheckCircle, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Syllabus() {
  const { user, userRole } = useAuth();
  const isTeacher = userRole === 'teacher';
  
  const { data: courses, isLoading: loadingCourses } = useCourses();
  const { data: classes } = useClasses();
  const { data: assignments } = useAssignments();
  const { data: submissions } = useSubmissions(user?.id);
  
  const [expandedCourses, setExpandedCourses] = useState<string[]>([]);

  // Calculate course progress based on completed assignments
  const courseProgress = useMemo(() => {
    if (!courses || !assignments || !submissions) return {};

    const progress: Record<string, { completed: number; total: number; percentage: number }> = {};

    courses.forEach(course => {
      const courseClasses = classes?.filter(c => c.course_id === course.id) || [];
      const classIds = courseClasses.map(c => c.id);
      
      const courseAssignments = assignments.filter(a => classIds.includes(a.class_id));
      const completedAssignments = courseAssignments.filter(a => 
        submissions?.some(s => s.assignment_id === a.id && s.marks !== null)
      );

      const total = courseAssignments.length;
      const completed = completedAssignments.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      progress[course.id] = { completed, total, percentage };
    });

    return progress;
  }, [courses, classes, assignments, submissions]);

  const toggleCourse = (courseId: string) => {
    setExpandedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  if (loadingCourses) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

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
        {courses && courses.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {courses.slice(0, 4).map((course) => {
                const progress = courseProgress[course.id] || { completed: 0, total: 0, percentage: 0 };
                return (
                  <Card 
                    key={course.id} 
                    className="shadow-card hover:shadow-card-hover transition-shadow cursor-pointer" 
                    onClick={() => toggleCourse(course.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <Badge variant={progress.percentage >= 70 ? "default" : progress.percentage >= 40 ? "secondary" : "outline"}>
                          {progress.percentage}%
                        </Badge>
                      </div>
                      <h3 className="font-semibold mb-1 truncate">{course.name}</h3>
                      <p className="text-sm text-muted-foreground">{course.credits} Credits • Sem {course.semester}</p>
                      <Progress value={progress.percentage} className="h-2 mt-3" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Detailed Syllabus */}
            <div className="space-y-4">
              {courses.map((course) => {
                const progress = courseProgress[course.id] || { completed: 0, total: 0, percentage: 0 };
                const courseClasses = classes?.filter(c => c.course_id === course.id) || [];
                const classIds = courseClasses.map(c => c.id);
                const courseAssignments = assignments?.filter(a => classIds.includes(a.class_id)) || [];

                return (
                  <Card key={course.id} className="shadow-card overflow-hidden">
                    <CardHeader 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleCourse(course.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {expandedCourses.includes(course.id) ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div>
                            <CardTitle className="font-display">{course.name}</CardTitle>
                            <CardDescription>
                              {course.code} • {course.credits} Credits • Semester {course.semester}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">{progress.percentage}% Complete</p>
                            <Progress value={progress.percentage} className="h-2 w-24" />
                          </div>
                          <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {expandedCourses.includes(course.id) && (
                      <CardContent className="pt-0">
                        {course.description && (
                          <p className="text-muted-foreground mb-4">{course.description}</p>
                        )}
                        
                        {courseAssignments.length > 0 ? (
                          <div className="space-y-4">
                            <h4 className="font-semibold">Assignments & Assessments</h4>
                            {courseAssignments.map((assignment) => {
                              const hasSubmission = submissions?.some(s => 
                                s.assignment_id === assignment.id && s.marks !== null
                              );
                              
                              return (
                                <div key={assignment.id} className={cn(
                                  "p-4 rounded-lg border",
                                  hasSubmission ? "bg-success/5 border-success/20" : "bg-muted/30"
                                )}>
                                  <div className="flex items-center gap-3">
                                    {hasSubmission ? (
                                      <CheckCircle className="h-5 w-5 text-success" />
                                    ) : (
                                      <Circle className="h-5 w-5 text-muted-foreground" />
                                    )}
                                    <div className="flex-1">
                                      <h5 className="font-semibold">{assignment.title}</h5>
                                      {assignment.description && (
                                        <p className="text-sm text-muted-foreground">{assignment.description}</p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <Badge variant="outline">{assignment.max_marks} marks</Badge>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-center py-4">
                            No assignments available for this course
                          </p>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        ) : (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No courses available</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
