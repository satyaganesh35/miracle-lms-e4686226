import { useAuth } from '@/hooks/useAuth';
import { useTimetable } from '@/hooks/useLMS';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TimetableGenerator from '@/components/timetable/TimetableGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, Wand2, Loader2, TableIcon, Phone, User, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const TIME_SLOTS = [
  { start: '09:15', end: '10:05', label: '9:15 - 10:05' },
  { start: '10:05', end: '10:55', label: '10:05 - 10:55' },
  { start: '11:05', end: '11:55', label: '11:05 - 11:55' },
  { start: '11:55', end: '12:45', label: '11:55 - 12:45' },
  { start: '12:45', end: '13:25', label: '12:45 - 1:25', isLunch: true },
  { start: '13:25', end: '14:15', label: '1:25 - 2:15' },
  { start: '14:15', end: '15:05', label: '2:15 - 3:05' },
  { start: '15:05', end: '15:55', label: '3:05 - 3:55' },
];

const subjectColors: Record<string, string> = {
  'Data Structures & Algorithms': 'bg-blue-100 text-blue-800 border-blue-300',
  'Database Management Systems': 'bg-purple-100 text-purple-800 border-purple-300',
  'Operating Systems': 'bg-green-100 text-green-800 border-green-300',
  'Computer Networks': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Software Engineering': 'bg-cyan-100 text-cyan-800 border-cyan-300',
  'Machine Learning': 'bg-pink-100 text-pink-800 border-pink-300',
  'Artificial Intelligence': 'bg-indigo-100 text-indigo-800 border-indigo-300',
  'default': 'bg-gray-100 text-gray-800 border-gray-300',
};

// Generate abbreviation from course name
const getAbbreviation = (name?: string): string => {
  if (!name) return '---';
  const words = name.split(' ').filter(w => w.length > 2 && !['and', 'the', 'for', 'with'].includes(w.toLowerCase()));
  if (words.length === 1) return words[0].substring(0, 3).toUpperCase();
  return words.map(w => w[0]).join('').toUpperCase().substring(0, 4);
};

export default function Timetable() {
  const { user, userRole } = useAuth();
  const isTeacherOrAdmin = userRole === 'teacher' || userRole === 'admin';
  
  const { data: timetableData, isLoading } = useTimetable(user?.id);

  const getScheduleForSlot = (day: string, slot: typeof TIME_SLOTS[0]) => {
    return timetableData?.find(entry => {
      const entryStart = entry.start_time.substring(0, 5);
      return entry.day_of_week.toUpperCase() === day && entryStart === slot.start;
    });
  };

  const getSubjectColor = (courseName?: string) => {
    if (!courseName) return subjectColors.default;
    return subjectColors[courseName] || subjectColors.default;
  };

  // Get unique subjects with faculty info for the legend
  const subjectFacultyMap = new Map<string, { name: string; code: string; faculty: string; phone?: string }>();
  timetableData?.forEach(t => {
    const courseName = t.classes?.courses?.name;
    const courseCode = t.classes?.courses?.code;
    const facultyName = t.classes?.profiles?.full_name;
    if (courseName && !subjectFacultyMap.has(courseName)) {
      subjectFacultyMap.set(courseName, {
        name: courseName,
        code: courseCode || getAbbreviation(courseName),
        faculty: facultyName || 'TBA',
        phone: undefined, // Phone not available in current schema
      });
    }
  });

  if (isLoading) {
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
            <h1 className="text-2xl font-display font-bold">Timetable</h1>
            <p className="text-muted-foreground">
              {isTeacherOrAdmin ? 'Manage and generate class schedules' : 'Your class schedule for this semester'}
            </p>
          </div>
        </div>

        {isTeacherOrAdmin ? (
          <Tabs defaultValue="view" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="view" className="flex items-center gap-2">
                <TableIcon className="h-4 w-4" />
                View Schedule
              </TabsTrigger>
              <TabsTrigger value="generate" className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Generate Timetable
              </TabsTrigger>
            </TabsList>

            <TabsContent value="view" className="space-y-6">
              <TimetableView 
                timetableData={timetableData}
                getScheduleForSlot={getScheduleForSlot}
                getSubjectColor={getSubjectColor}
                subjectFacultyMap={subjectFacultyMap}
              />
            </TabsContent>

            <TabsContent value="generate">
              <TimetableGenerator />
            </TabsContent>
          </Tabs>
        ) : (
          <TimetableView 
            timetableData={timetableData}
            getScheduleForSlot={getScheduleForSlot}
            getSubjectColor={getSubjectColor}
            subjectFacultyMap={subjectFacultyMap}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

interface TimetableViewProps {
  timetableData: any[] | undefined;
  getScheduleForSlot: (day: string, slot: typeof TIME_SLOTS[0]) => any;
  getSubjectColor: (courseName?: string) => string;
  subjectFacultyMap: Map<string, { name: string; code: string; faculty: string; phone?: string }>;
}

function TimetableView({ 
  timetableData, 
  getScheduleForSlot, 
  getSubjectColor, 
  subjectFacultyMap 
}: TimetableViewProps) {
  return (
    <>
      {/* College Header */}
      <Card className="shadow-card border-2 border-primary/20">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-xl font-display text-primary">
                DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                III YEAR II SEMESTER TIME TABLE | A.Y: 2025-2026
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Weekly Timetable Grid */}
      <Card className="shadow-card overflow-hidden">
        <CardContent className="p-0">
          {timetableData && timetableData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="p-3 text-center font-bold border border-primary-foreground/20 w-28">
                      DAY/TIME
                    </th>
                    {TIME_SLOTS.map((slot, idx) => (
                      <th 
                        key={idx} 
                        className={cn(
                          "p-2 text-center font-semibold text-xs border border-primary-foreground/20",
                          slot.isLunch && "bg-amber-500"
                        )}
                      >
                        {slot.isLunch ? (
                          <div className="flex flex-col">
                            <span>LUNCH</span>
                            <span>BREAK</span>
                          </div>
                        ) : (
                          slot.label
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day, dayIndex) => (
                    <tr key={day} className={dayIndex % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                      <td className="p-3 font-bold text-sm text-center border bg-muted/50">
                        {day}
                      </td>
                      {TIME_SLOTS.map((slot, slotIndex) => {
                        if (slot.isLunch) {
                          return (
                            <td 
                              key={slotIndex} 
                              className="p-2 text-center border bg-amber-50 dark:bg-amber-900/20"
                              rowSpan={1}
                            >
                              <span className="text-amber-600 dark:text-amber-400 font-medium text-xs">
                                🍽️
                              </span>
                            </td>
                          );
                        }
                        
                        const schedule = getScheduleForSlot(day, slot);
                        const courseName = schedule?.classes?.courses?.name;
                        const courseCode = schedule?.classes?.courses?.code;
                        const abbrev = courseCode || getAbbreviation(courseName);
                        
                        return (
                          <td 
                            key={slotIndex} 
                            className={cn(
                              "p-2 text-center border min-w-[80px]",
                              schedule && getSubjectColor(courseName)
                            )}
                          >
                            {schedule && (
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="font-bold text-sm">{abbrev}</span>
                                {schedule.room && (
                                  <span className="text-[10px] opacity-70">{schedule.room}</span>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">No timetable entries found</p>
              <p className="text-sm text-muted-foreground mt-1">Ask your administrator to generate a timetable</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subject Legend Table */}
      {subjectFacultyMap.size > 0 && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Subject & Faculty Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold">SUBJECT CODE</TableHead>
                  <TableHead className="font-bold">SUBJECT NAME</TableHead>
                  <TableHead className="font-bold">FACULTY</TableHead>
                  <TableHead className="font-bold">
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      CONTACT
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from(subjectFacultyMap.values()).map((subject, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Badge variant="outline" className={cn("font-mono", getSubjectColor(subject.name))}>
                        {subject.code || getAbbreviation(subject.name)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell>{subject.faculty}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {subject.phone || '---'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Footer Info */}
      <Card className="shadow-card">
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Time Table In-Charge</p>
              <p className="font-semibold">---</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Class In-Charge</p>
              <p className="font-semibold">---</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">HOD</p>
              <p className="font-semibold">---</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
