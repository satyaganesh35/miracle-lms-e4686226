import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, BookOpen, Users, Loader2, GraduationCap } from 'lucide-react';

const DEPARTMENTS = ['CSE', 'AI&DS', 'ECE', 'EEE', 'MECH', 'CIVIL'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

interface Course {
  id: string;
  code: string;
  name: string;
  department: string | null;
  semester: number;
  credits: number | null;
  description: string | null;
}

interface ClassItem {
  id: string;
  course_id: string;
  teacher_id: string;
  section: string;
  academic_year: string;
  room: string | null;
  courses?: { name: string; code: string };
  profiles?: { full_name: string | null };
}

export default function CoursesManagement() {
  const { userRole } = useAuth();
  const queryClient = useQueryClient();
  
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);

  // Form states for course
  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    department: 'CSE',
    semester: 1,
    credits: 3,
    description: '',
  });

  // Form states for class
  const [classForm, setClassForm] = useState({
    course_id: '',
    teacher_id: '',
    section: 'A',
    academic_year: '2025-26',
    room: '',
  });

  // Fetch courses
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('code');
      if (error) throw error;
      return data as Course[];
    },
  });

  // Fetch classes
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes-management'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          courses (name, code),
          profiles (full_name)
        `)
        .order('academic_year', { ascending: false });
      if (error) throw error;
      return data as ClassItem[];
    },
  });

  // Fetch teachers
  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('role', ['teacher', 'admin'])
        .order('full_name');
      if (error) throw error;
      return data;
    },
  });

  // Course mutations
  const createCourseMutation = useMutation({
    mutationFn: async (course: typeof courseForm) => {
      const { error } = await supabase.from('courses').insert([course]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Course created successfully');
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setCourseDialogOpen(false);
      resetCourseForm();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, ...course }: Course) => {
      const { error } = await supabase.from('courses').update(course).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Course updated successfully');
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setCourseDialogOpen(false);
      setEditingCourse(null);
      resetCourseForm();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Course deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (error: any) => toast.error(error.message),
  });

  // Class mutations
  const createClassMutation = useMutation({
    mutationFn: async (classData: typeof classForm) => {
      const { error } = await supabase.from('classes').insert([classData]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Class created successfully');
      queryClient.invalidateQueries({ queryKey: ['classes-management'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setClassDialogOpen(false);
      resetClassForm();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateClassMutation = useMutation({
    mutationFn: async ({ id, ...classData }: { id: string } & typeof classForm) => {
      const { error } = await supabase.from('classes').update(classData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Class updated successfully');
      queryClient.invalidateQueries({ queryKey: ['classes-management'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setClassDialogOpen(false);
      setEditingClass(null);
      resetClassForm();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteClassMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Class deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['classes-management'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (error: any) => toast.error(error.message),
  });

  const resetCourseForm = () => {
    setCourseForm({
      code: '',
      name: '',
      department: 'CSE',
      semester: 1,
      credits: 3,
      description: '',
    });
  };

  const resetClassForm = () => {
    setClassForm({
      course_id: '',
      teacher_id: '',
      section: 'A',
      academic_year: '2025-26',
      room: '',
    });
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      code: course.code,
      name: course.name,
      department: course.department || 'CSE',
      semester: course.semester,
      credits: course.credits || 3,
      description: course.description || '',
    });
    setCourseDialogOpen(true);
  };

  const handleEditClass = (classItem: ClassItem) => {
    setEditingClass(classItem);
    setClassForm({
      course_id: classItem.course_id,
      teacher_id: classItem.teacher_id,
      section: classItem.section,
      academic_year: classItem.academic_year,
      room: classItem.room || '',
    });
    setClassDialogOpen(true);
  };

  const handleCourseSubmit = () => {
    if (!courseForm.code || !courseForm.name) {
      toast.error('Please fill in required fields');
      return;
    }
    
    if (editingCourse) {
      updateCourseMutation.mutate({ id: editingCourse.id, ...courseForm } as Course);
    } else {
      createCourseMutation.mutate(courseForm);
    }
  };

  const handleClassSubmit = () => {
    if (!classForm.course_id || !classForm.teacher_id) {
      toast.error('Please select a course and teacher');
      return;
    }
    
    if (editingClass) {
      updateClassMutation.mutate({ id: editingClass.id, ...classForm });
    } else {
      createClassMutation.mutate(classForm);
    }
  };

  if (userRole !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Only admins can access this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Courses & Classes</h1>
          <p className="text-muted-foreground">Manage courses (subjects) and class assignments</p>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="classes" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Classes
            </TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-display flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    All Courses
                  </CardTitle>
                  <CardDescription>Manage subjects offered in your institution</CardDescription>
                </div>
                <Dialog open={courseDialogOpen} onOpenChange={(open) => {
                  setCourseDialogOpen(open);
                  if (!open) {
                    setEditingCourse(null);
                    resetCourseForm();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Course
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
                      <DialogDescription>
                        {editingCourse ? 'Update the course details below.' : 'Fill in the details to create a new course.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="code">Course Code *</Label>
                          <Input
                            id="code"
                            placeholder="CS301"
                            value={courseForm.code}
                            onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value.toUpperCase() })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="credits">Credits</Label>
                          <Select value={courseForm.credits.toString()} onValueChange={(v) => setCourseForm({ ...courseForm, credits: parseInt(v) })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map((c) => (
                                <SelectItem key={c} value={c.toString()}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name">Course Name *</Label>
                        <Input
                          id="name"
                          placeholder="Computer Networks"
                          value={courseForm.name}
                          onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Department</Label>
                          <Select value={courseForm.department} onValueChange={(v) => setCourseForm({ ...courseForm, department: v })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DEPARTMENTS.map((d) => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Semester</Label>
                          <Select value={courseForm.semester.toString()} onValueChange={(v) => setCourseForm({ ...courseForm, semester: parseInt(v) })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SEMESTERS.map((s) => (
                                <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Brief description of the course..."
                          value={courseForm.description}
                          onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCourseDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleCourseSubmit} disabled={createCourseMutation.isPending || updateCourseMutation.isPending}>
                        {(createCourseMutation.isPending || updateCourseMutation.isPending) && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        {editingCourse ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {coursesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : courses && courses.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Semester</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">{course.code}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{course.name}</TableCell>
                          <TableCell>{course.department || '-'}</TableCell>
                          <TableCell>Sem {course.semester}</TableCell>
                          <TableCell>{course.credits}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleEditCourse(course)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive"
                              onClick={() => {
                                if (confirm('Delete this course?')) {
                                  deleteCourseMutation.mutate(course.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No courses found. Add your first course!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-display flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    All Classes
                  </CardTitle>
                  <CardDescription>Assign courses to teachers and sections</CardDescription>
                </div>
                <Dialog open={classDialogOpen} onOpenChange={(open) => {
                  setClassDialogOpen(open);
                  if (!open) {
                    setEditingClass(null);
                    resetClassForm();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Class
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{editingClass ? 'Edit Class' : 'Add New Class'}</DialogTitle>
                      <DialogDescription>
                        {editingClass ? 'Update the class assignment.' : 'Assign a course to a teacher for a specific section.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Course *</Label>
                        <Select value={classForm.course_id} onValueChange={(v) => setClassForm({ ...classForm, course_id: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses?.map((course) => (
                              <SelectItem key={course.id} value={course.id}>
                                {course.code} - {course.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Teacher *</Label>
                        <Select value={classForm.teacher_id} onValueChange={(v) => setClassForm({ ...classForm, teacher_id: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            {teachers?.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.full_name || teacher.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Section</Label>
                          <Select value={classForm.section} onValueChange={(v) => setClassForm({ ...classForm, section: v })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {['A', 'B', 'C', 'D'].map((s) => (
                                <SelectItem key={s} value={s}>Section {s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Academic Year</Label>
                          <Select value={classForm.academic_year} onValueChange={(v) => setClassForm({ ...classForm, academic_year: v })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {['2024-25', '2025-26', '2026-27'].map((y) => (
                                <SelectItem key={y} value={y}>{y}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="room">Room</Label>
                        <Input
                          id="room"
                          placeholder="Room 301 or Lab 1"
                          value={classForm.room}
                          onChange={(e) => setClassForm({ ...classForm, room: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setClassDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleClassSubmit} disabled={createClassMutation.isPending || updateClassMutation.isPending}>
                        {(createClassMutation.isPending || updateClassMutation.isPending) && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        {editingClass ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {classesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : classes && classes.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classes.map((classItem) => (
                        <TableRow key={classItem.id}>
                          <TableCell>
                            <div>
                              <Badge variant="outline" className="font-mono">{classItem.courses?.code}</Badge>
                              <span className="ml-2 font-medium">{classItem.courses?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{classItem.profiles?.full_name || 'Not assigned'}</TableCell>
                          <TableCell>Section {classItem.section}</TableCell>
                          <TableCell>{classItem.academic_year}</TableCell>
                          <TableCell>{classItem.room || '-'}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleEditClass(classItem)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive"
                              onClick={() => {
                                if (confirm('Delete this class?')) {
                                  deleteClassMutation.mutate(classItem.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No classes found. Add courses first, then create classes!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
