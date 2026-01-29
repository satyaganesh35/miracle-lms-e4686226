import { useState } from 'react';
import { useClasses, useTimetable } from '@/hooks/useLMS';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  Wand2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  { start: '09:00', end: '10:00' },
  { start: '10:00', end: '11:00' },
  { start: '11:00', end: '12:00' },
  { start: '12:00', end: '13:00' },
  { start: '14:00', end: '15:00' },
  { start: '15:00', end: '16:00' },
  { start: '16:00', end: '17:00' },
];

const ROOMS = ['Room 101', 'Room 102', 'Room 103', 'Room 201', 'Room 202', 'Room 203', 'Lab 1', 'Lab 2'];

interface GeneratedSlot {
  class_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room: string;
  courseName: string;
  section: string;
}

export default function TimetableGenerator() {
  const { data: classes, isLoading: classesLoading } = useClasses();
  const { data: existingTimetable, isLoading: timetableLoading } = useTimetable();
  const queryClient = useQueryClient();

  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [generatedSchedule, setGeneratedSchedule] = useState<GeneratedSlot[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [classesPerWeek, setClassesPerWeek] = useState('3');

  const handleClassToggle = (classId: string) => {
    setSelectedClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const selectAllClasses = () => {
    if (classes) {
      setSelectedClasses(classes.map(c => c.id));
    }
  };

  const clearSelection = () => {
    setSelectedClasses([]);
    setGeneratedSchedule([]);
  };

  const generateTimetable = () => {
    if (selectedClasses.length === 0) {
      toast.error('Please select at least one class');
      return;
    }

    setIsGenerating(true);
    
    // Simulate generation delay for UX
    setTimeout(() => {
      const schedule: GeneratedSlot[] = [];
      const usedSlots = new Set<string>();
      
      // Get existing slots to avoid conflicts
      existingTimetable?.forEach(entry => {
        usedSlots.add(`${entry.day_of_week}-${entry.start_time}`);
      });

      const selectedClassData = classes?.filter(c => selectedClasses.includes(c.id)) || [];
      const numClassesPerWeek = parseInt(classesPerWeek);

      selectedClassData.forEach(classItem => {
        let assignedSlots = 0;
        const courseName = classItem.courses?.name || 'Unknown Course';
        const section = classItem.section || 'A';

        // Try to distribute classes across the week
        const shuffledDays = [...DAYS].sort(() => Math.random() - 0.5);
        const shuffledSlots = [...TIME_SLOTS].sort(() => Math.random() - 0.5);

        for (const day of shuffledDays) {
          if (assignedSlots >= numClassesPerWeek) break;

          for (const slot of shuffledSlots) {
            if (assignedSlots >= numClassesPerWeek) break;
            
            const slotKey = `${day}-${slot.start}`;
            
            // Check if slot is already used
            if (usedSlots.has(slotKey)) continue;

            // Skip lunch hour (13:00-14:00)
            if (slot.start === '13:00') continue;

            // Assign the slot
            const room = ROOMS[Math.floor(Math.random() * ROOMS.length)];
            
            schedule.push({
              class_id: classItem.id,
              day_of_week: day,
              start_time: slot.start,
              end_time: slot.end,
              room,
              courseName,
              section,
            });

            usedSlots.add(slotKey);
            assignedSlots++;
          }
        }
      });

      setGeneratedSchedule(schedule);
      setIsGenerating(false);
      
      if (schedule.length > 0) {
        toast.success(`Generated ${schedule.length} time slots`);
      } else {
        toast.warning('Could not generate any slots. All time slots may be occupied.');
      }
    }, 1000);
  };

  const saveGeneratedTimetable = async () => {
    if (generatedSchedule.length === 0) {
      toast.error('No schedule to save');
      return;
    }

    setIsSaving(true);

    try {
      const timetableEntries = generatedSchedule.map(slot => ({
        class_id: slot.class_id,
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
        room: slot.room,
      }));

      const { error } = await supabase
        .from('timetable')
        .insert(timetableEntries);

      if (error) throw error;

      toast.success(`Saved ${generatedSchedule.length} timetable entries`);
      setGeneratedSchedule([]);
      setSelectedClasses([]);
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
    } catch (error: any) {
      console.error('Error saving timetable:', error);
      toast.error(error.message || 'Failed to save timetable');
    } finally {
      setIsSaving(false);
    }
  };

  const removeSlot = (index: number) => {
    setGeneratedSchedule(prev => prev.filter((_, i) => i !== index));
  };

  const clearExistingTimetable = async () => {
    if (!confirm('Are you sure you want to clear all existing timetable entries? This cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('timetable')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;

      toast.success('Cleared all timetable entries');
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
    } catch (error: any) {
      console.error('Error clearing timetable:', error);
      toast.error(error.message || 'Failed to clear timetable');
    }
  };

  if (classesLoading || timetableLoading) {
    return (
      <Card className="shadow-card">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="shadow-card border-0 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Wand2 className="h-5 w-5 text-primary" />
            </div>
            Automatic Timetable Generator
          </CardTitle>
          <CardDescription>
            Select classes and generate an optimized timetable automatically
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Label>Classes per week:</Label>
              <Select value={classesPerWeek} onValueChange={setClassesPerWeek}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={selectAllClasses}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Clear
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={clearExistingTimetable}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear Existing
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Selection */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Select Classes
          </CardTitle>
          <CardDescription>
            Choose which classes to include in the generated timetable
          </CardDescription>
        </CardHeader>
        <CardContent>
          {classes && classes.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {classes.map(classItem => (
                <div
                  key={classItem.id}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md",
                    selectedClasses.includes(classItem.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => handleClassToggle(classItem.id)}
                >
                  <Checkbox
                    checked={selectedClasses.includes(classItem.id)}
                    onCheckedChange={() => handleClassToggle(classItem.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {classItem.courses?.name || 'Unknown Course'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {classItem.courses?.code} • Section {classItem.section}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {classItem.profiles?.full_name || 'No teacher assigned'}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {classItem.academic_year}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No classes found. Please create classes first.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={generateTimetable}
          disabled={selectedClasses.length === 0 || isGenerating}
          className="min-w-[200px]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5 mr-2" />
              Generate Timetable
            </>
          )}
        </Button>
      </div>

      {/* Generated Schedule Preview */}
      {generatedSchedule.length > 0 && (
        <Card className="shadow-card border-success/20 bg-success/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Generated Schedule Preview
                </CardTitle>
                <CardDescription>
                  Review and save the generated timetable ({generatedSchedule.length} slots)
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={generateTimetable} disabled={isGenerating}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Regenerate
                </Button>
                <Button onClick={saveGeneratedTimetable} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Save Timetable
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Course</th>
                    <th className="text-left p-3 font-medium">Section</th>
                    <th className="text-left p-3 font-medium">Day</th>
                    <th className="text-left p-3 font-medium">Time</th>
                    <th className="text-left p-3 font-medium">Room</th>
                    <th className="text-right p-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedSchedule.map((slot, index) => (
                    <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3 font-medium">{slot.courseName}</td>
                      <td className="p-3">
                        <Badge variant="outline">{slot.section}</Badge>
                      </td>
                      <td className="p-3">{slot.day_of_week}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {slot.start_time} - {slot.end_time}
                        </div>
                      </td>
                      <td className="p-3">{slot.room}</td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSlot(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Timetable Stats */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-lg">Current Timetable Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-2xl font-bold text-primary">
                {existingTimetable?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total Slots</p>
            </div>
            <div className="p-4 rounded-lg bg-success/5 border border-success/10">
              <p className="text-2xl font-bold text-success">
                {new Set(existingTimetable?.map(t => t.class_id)).size || 0}
              </p>
              <p className="text-sm text-muted-foreground">Classes Scheduled</p>
            </div>
            <div className="p-4 rounded-lg bg-info/5 border border-info/10">
              <p className="text-2xl font-bold text-info">
                {DAYS.length * TIME_SLOTS.length - (existingTimetable?.length || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Available Slots</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
