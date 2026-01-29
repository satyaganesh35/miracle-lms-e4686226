import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameMonth, isToday, isSameDay } from 'date-fns';

interface AttendanceRecord {
  date: string;
  status: string;
}

interface AttendanceCalendarProps {
  attendanceRecords: AttendanceRecord[];
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AttendanceCalendar({ attendanceRecords }: AttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Get the day of week for the first day (0 = Sunday)
    const startDay = getDay(monthStart);
    
    // Create array with empty slots for days before the month starts
    const calendarGrid: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) {
      calendarGrid.push(null);
    }
    
    // Add all days of the month
    days.forEach(day => calendarGrid.push(day));
    
    return calendarGrid;
  }, [currentMonth]);

  const getAttendanceStatus = (date: Date | null) => {
    if (!date) return null;
    const dateStr = format(date, 'yyyy-MM-dd');
    const record = attendanceRecords.find(r => r.date === dateStr);
    return record?.status || null;
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'present':
        return 'bg-success text-success-foreground';
      case 'absent':
        return 'bg-destructive text-destructive-foreground';
      case 'late':
        return 'bg-warning text-warning-foreground';
      default:
        return '';
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="font-display text-lg">Attendance Calendar</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{format(currentMonth, 'MMMM yyyy')}</p>
      </CardHeader>
      <CardContent>
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const status = getAttendanceStatus(day);
            const statusColor = getStatusColor(status);
            const isDayToday = day && isToday(day);

            return (
              <div
                key={index}
                className={cn(
                  "aspect-square flex items-center justify-center rounded-lg text-sm transition-colors",
                  day ? "hover:bg-muted/50" : "",
                  isDayToday && !status && "ring-2 ring-primary",
                  status && statusColor,
                  !status && day && "text-foreground"
                )}
              >
                {day ? format(day, 'd') : ''}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success" />
            <span className="text-sm text-muted-foreground">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-destructive" />
            <span className="text-sm text-muted-foreground">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-warning" />
            <span className="text-sm text-muted-foreground">Late</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
