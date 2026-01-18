import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useExamSchedule, useAddExamSchedule } from '@/hooks/useEnhancedLMS';
import { useCourses } from '@/hooks/useLMS';
import { useAuth } from '@/hooks/useAuth';
import { CalendarDays, Clock, MapPin, Plus, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';

const DEPARTMENTS = ['CSE', 'AI&DS', 'EEE', 'ECE', 'MECH'];
const SEMESTERS = ['1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'];
const EXAM_TYPES = [
  { value: 'mid1', label: 'Mid Term 1' },
  { value: 'mid2', label: 'Mid Term 2' },
  { value: 'final', label: 'Final Exam' },
  { value: 'internal', label: 'Internal Assessment' },
];

export default function ExamSchedule() {
  const { user, userRole } = useAuth();
  const [department, setDepartment] = useState<string>('');
  const [semester, setSemester] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { data: exams, isLoading } = useExamSchedule(department || undefined, semester || undefined);
  const { data: courses } = useCourses();
  const addExam = useAddExamSchedule();

  const [formData, setFormData] = useState({
    course_id: '',
    exam_type: '',
    exam_date: '',
    start_time: '',
    end_time: '',
    room: '',
    department: '',
    semester: '',
    max_marks: 100,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addExam.mutateAsync({
      ...formData,
      created_by: user?.id || '',
    });
    setDialogOpen(false);
    setFormData({
      course_id: '',
      exam_type: '',
      exam_date: '',
      start_time: '',
      end_time: '',
      room: '',
      department: '',
      semester: '',
      max_marks: 100,
    });
  };

  const getExamTypeLabel = (type: string) => EXAM_TYPES.find(t => t.value === type)?.label || type;
  
  const getExamTypeColor = (type: string) => {
    switch (type) {
      case 'final': return 'destructive';
      case 'mid1': case 'mid2': return 'default';
      case 'internal': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Exam Schedule</h1>
            <p className="text-muted-foreground">View upcoming examinations and schedules</p>
          </div>
          
          {userRole === 'admin' && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Exam
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Schedule New Exam</DialogTitle>
                  <DialogDescription>Add a new exam to the schedule</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Course</Label>
                      <Select value={formData.course_id} onValueChange={(v) => setFormData({ ...formData, course_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                        <SelectContent>
                          {courses?.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Exam Type</Label>
                      <Select value={formData.exam_type} onValueChange={(v) => setFormData({ ...formData, exam_type: v })}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          {EXAM_TYPES.map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select value={formData.department} onValueChange={(v) => setFormData({ ...formData, department: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Semester</Label>
                      <Select value={formData.semester} onValueChange={(v) => setFormData({ ...formData, semester: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {SEMESTERS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" value={formData.exam_date} onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Room</Label>
                      <Input value={formData.room} onChange={(e) => setFormData({ ...formData, room: e.target.value })} placeholder="e.g., Hall A" />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input type="time" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Marks</Label>
                      <Input type="number" value={formData.max_marks} onChange={(e) => setFormData({ ...formData, max_marks: parseInt(e.target.value) })} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={addExam.isPending}>
                      {addExam.isPending ? 'Saving...' : 'Schedule Exam'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={semester} onValueChange={setSemester}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Semesters</SelectItem>
                  {SEMESTERS.map(s => <SelectItem key={s} value={s}>Semester {s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Exam List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : exams && exams.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Badge variant={getExamTypeColor(exam.exam_type) as any}>
                      {getExamTypeLabel(exam.exam_type)}
                    </Badge>
                    <Badge variant="outline">{exam.max_marks} marks</Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">
                    {exam.courses?.code || 'Course'} - {exam.courses?.name || 'Unknown'}
                  </CardTitle>
                  <CardDescription>
                    {exam.department} • Semester {exam.semester}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    <span>{format(new Date(exam.exam_date), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{exam.start_time} - {exam.end_time}</span>
                  </div>
                  {exam.room && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{exam.room}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No exams scheduled</h3>
              <p className="text-muted-foreground">Check back later for exam schedules</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
