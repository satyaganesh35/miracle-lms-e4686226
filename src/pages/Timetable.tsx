import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

const studentSchedule = [
  { day: 'Monday', time: '09:00', subject: 'Data Structures', teacher: 'Dr. Venkat', room: 'CS Lab 1', duration: 2 },
  { day: 'Monday', time: '11:00', subject: 'Database Systems', teacher: 'Prof. Ramesh', room: 'Room 302', duration: 2 },
  { day: 'Monday', time: '14:00', subject: 'Computer Networks', teacher: 'Dr. Priya', room: 'Room 201', duration: 1 },
  { day: 'Tuesday', time: '09:00', subject: 'Operating Systems', teacher: 'Dr. Suresh', room: 'CS Lab 2', duration: 2 },
  { day: 'Tuesday', time: '11:00', subject: 'Software Engineering', teacher: 'Prof. Lakshmi', room: 'Room 305', duration: 2 },
  { day: 'Tuesday', time: '14:00', subject: 'Data Structures', teacher: 'Dr. Venkat', room: 'Room 301', duration: 1 },
  { day: 'Wednesday', time: '09:00', subject: 'Database Systems', teacher: 'Prof. Ramesh', room: 'Room 302', duration: 1 },
  { day: 'Wednesday', time: '10:00', subject: 'Computer Networks', teacher: 'Dr. Priya', room: 'Network Lab', duration: 2 },
  { day: 'Wednesday', time: '13:00', subject: 'Operating Systems', teacher: 'Dr. Suresh', room: 'CS Lab 2', duration: 2 },
  { day: 'Thursday', time: '09:00', subject: 'Data Structures', teacher: 'Dr. Venkat', room: 'Room 301', duration: 2 },
  { day: 'Thursday', time: '11:00', subject: 'Software Engineering', teacher: 'Prof. Lakshmi', room: 'Room 305', duration: 2 },
  { day: 'Thursday', time: '14:00', subject: 'DS Lab', teacher: 'Dr. Venkat', room: 'CS Lab 1', duration: 2 },
  { day: 'Friday', time: '09:00', subject: 'Operating Systems', teacher: 'Dr. Suresh', room: 'Room 303', duration: 1 },
  { day: 'Friday', time: '10:00', subject: 'Computer Networks', teacher: 'Dr. Priya', room: 'Network Lab', duration: 2 },
  { day: 'Friday', time: '13:00', subject: 'Database Systems', teacher: 'Prof. Ramesh', room: 'Room 302', duration: 2 },
  { day: 'Saturday', time: '09:00', subject: 'Project Work', teacher: 'Various', room: 'Project Lab', duration: 3 },
];

const subjectColors: Record<string, string> = {
  'Data Structures': 'bg-blue-500/10 border-blue-500/30 text-blue-700',
  'Database Systems': 'bg-purple-500/10 border-purple-500/30 text-purple-700',
  'Operating Systems': 'bg-green-500/10 border-green-500/30 text-green-700',
  'Computer Networks': 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700',
  'Software Engineering': 'bg-cyan-500/10 border-cyan-500/30 text-cyan-700',
  'DS Lab': 'bg-blue-500/10 border-blue-500/30 text-blue-700',
  'Project Work': 'bg-gray-500/10 border-gray-500/30 text-gray-700',
};

export default function Timetable() {
  const { userRole } = useAuth();
  const isTeacher = userRole === 'teacher';

  const getScheduleForSlot = (day: string, time: string) => {
    return studentSchedule.find(s => s.day === day && s.time === time);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Timetable</h1>
            <p className="text-muted-foreground">
              {isTeacher ? 'Your teaching schedule' : 'Your class schedule for this semester'}
            </p>
          </div>
          {isTeacher && (
            <Button variant="hero">
              <Plus className="h-4 w-4" />
              Add Class
            </Button>
          )}
        </div>

        {/* Today's Classes Quick View */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Today's Classes
            </CardTitle>
            <CardDescription>Quick overview of your schedule for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {studentSchedule.filter(s => s.day === 'Monday').slice(0, 4).map((item, index) => (
                <div key={index} className={cn("p-4 rounded-lg border", subjectColors[item.subject] || 'bg-muted')}>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{item.time}</span>
                  </div>
                  <p className="font-semibold">{item.subject}</p>
                  <div className="mt-2 space-y-1 text-sm opacity-80">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {item.teacher}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {item.room}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Timetable */}
        <Card className="shadow-card overflow-hidden">
          <CardHeader>
            <CardTitle className="font-display">Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-3 text-left font-medium text-muted-foreground w-20">Time</th>
                    {days.map(day => (
                      <th key={day} className="p-3 text-left font-medium text-muted-foreground">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time, timeIndex) => (
                    <tr key={time} className={timeIndex % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                      <td className="p-3 font-medium text-sm text-muted-foreground border-r">{time}</td>
                      {days.map(day => {
                        const schedule = getScheduleForSlot(day, time);
                        return (
                          <td key={day} className="p-2 border-r last:border-r-0">
                            {schedule && (
                              <div className={cn(
                                "p-2 rounded-md border text-xs",
                                subjectColors[schedule.subject] || 'bg-muted'
                              )}>
                                <p className="font-semibold">{schedule.subject}</p>
                                <p className="opacity-70">{schedule.room}</p>
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
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-base">Subject Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(subjectColors).map(([subject, color]) => (
                <Badge key={subject} variant="outline" className={cn("font-normal", color)}>
                  {subject}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
