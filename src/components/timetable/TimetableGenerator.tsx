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
  RefreshCw,
  FlaskConical
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Exact time slots matching the reference timetable
const TIME_SLOTS = [
  { start: '09:15', end: '10:05', label: '9:15 - 10:05', index: 0 },
  { start: '10:05', end: '10:55', label: '10:05 - 10:55', index: 1 },
  { start: '11:05', end: '11:55', label: '11:05 - 11:55', index: 2 },
  { start: '11:55', end: '12:45', label: '11:55 - 12:45', index: 3 },
  { start: '12:45', end: '13:25', label: '12:45 - 1:25', isLunch: true, index: 4 },
  { start: '13:25', end: '14:15', label: '1:25 - 2:15', index: 5 },
  { start: '14:15', end: '15:05', label: '2:15 - 3:05', index: 6 },
  { start: '15:05', end: '15:55', label: '3:05 - 3:55', index: 7 },
];

// Regular class slots (excluding lunch)
const CLASS_SLOTS = TIME_SLOTS.filter(s => !s.isLunch);

const ROOMS = ['Room 101', 'Room 102', 'Room 103', 'Room 201', 'Room 202', 'Room 203'];
const LABS = ['Lab 1', 'Lab 2', 'Lab 3', 'Lab 4'];

interface GeneratedSlot {
  class_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room: string;
  courseName: string;
  section: string;
  isLab?: boolean;
}

interface SelectedClass {
  id: string;
  isLab: boolean;
  classesPerWeek: number;
}

// Get abbreviation from course name
const getAbbreviation = (name?: string): string => {
  if (!name) return '---';
  const words = name.split(' ').filter(w => w.length > 2 && !['and', 'the', 'for', 'with'].includes(w.toLowerCase()));
  if (words.length === 1) return words[0].substring(0, 3).toUpperCase();
  return words.map(w => w[0]).join('').toUpperCase().substring(0, 4);
};

export default function TimetableGenerator() {
  const { data: classes, isLoading: classesLoading } = useClasses();
  const { data: existingTimetable, isLoading: timetableLoading } = useTimetable();
  const queryClient = useQueryClient();

  const [selectedClasses, setSelectedClasses] = useState<Map<string, SelectedClass>>(new Map());
  const [generatedSchedule, setGeneratedSchedule] = useState<GeneratedSlot[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleClassToggle = (classId: string, isLab: boolean = false) => {
    setSelectedClasses(prev => {
      const newMap = new Map(prev);
      const key = `${classId}-${isLab ? 'lab' : 'subject'}`;
      
      if (newMap.has(key)) {
        newMap.delete(key);
      } else {
        newMap.set(key, { id: classId, isLab, classesPerWeek: isLab ? 1 : 3 });
      }
      return newMap;
    });
  };

  const updateClassesPerWeek = (key: string, value: number) => {
    setSelectedClasses(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(key);
      if (existing) {
        newMap.set(key, { ...existing, classesPerWeek: value });
      }
      return newMap;
    });
  };

  const selectAllSubjects = () => {
    if (classes) {
      const newMap = new Map(selectedClasses);
      classes.forEach(c => {
        const key = `${c.id}-subject`;
        if (!newMap.has(key)) {
          newMap.set(key, { id: c.id, isLab: false, classesPerWeek: 3 });
        }
      });
      setSelectedClasses(newMap);
    }
  };

  const selectAllLabs = () => {
    if (classes) {
      const newMap = new Map(selectedClasses);
      classes.forEach(c => {
        const key = `${c.id}-lab`;
        if (!newMap.has(key)) {
          newMap.set(key, { id: c.id, isLab: true, classesPerWeek: 1 });
        }
      });
      setSelectedClasses(newMap);
    }
  };

  const clearSelection = () => {
    setSelectedClasses(new Map());
    setGeneratedSchedule([]);
  };

  const generateTimetable = () => {
    if (selectedClasses.size === 0) {
      toast.error('Please select at least one subject or lab');
      return;
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      const schedule: GeneratedSlot[] = [];
      // Track used slots: day -> slot index -> true if occupied
      const usedSlots = new Map<string, Set<number>>();
      
      // Initialize used slots map
      DAYS.forEach(day => usedSlots.set(day, new Set()));
      
      // Mark existing timetable slots as used
      existingTimetable?.forEach(entry => {
        const daySlots = usedSlots.get(entry.day_of_week);
        if (daySlots) {
          const slotIndex = TIME_SLOTS.findIndex(s => s.start === entry.start_time.substring(0, 5));
          if (slotIndex !== -1) {
            daySlots.add(slotIndex);
          }
        }
      });

      // Mark lunch slot as always used
      DAYS.forEach(day => {
        const lunchSlot = TIME_SLOTS.find(s => s.isLunch);
        if (lunchSlot) {
          usedSlots.get(day)?.add(lunchSlot.index);
        }
      });

      // Separate labs and subjects
      const labs: Array<SelectedClass & { classData: any }> = [];
      const subjects: Array<SelectedClass & { classData: any }> = [];

      selectedClasses.forEach((selection, key) => {
        const classData = classes?.find(c => c.id === selection.id);
        if (classData) {
          if (selection.isLab) {
            labs.push({ ...selection, classData });
          } else {
            subjects.push({ ...selection, classData });
          }
        }
      });

      // First, schedule labs (they need 2 consecutive periods)
      labs.forEach(lab => {
        const courseName = lab.classData.courses?.name || 'Unknown Course';
        const section = lab.classData.section || 'A';
        let assignedCount = 0;

        // Shuffle days for randomness
        const shuffledDays = [...DAYS].sort(() => Math.random() - 0.5);

        for (const day of shuffledDays) {
          if (assignedCount >= lab.classesPerWeek) break;

          const daySlots = usedSlots.get(day)!;
          
          // Find 2 consecutive available slots (not crossing lunch)
          // Morning slots: 0-3, Afternoon slots: 5-7
          const morningPairs = [[0, 1], [1, 2], [2, 3]];
          const afternoonPairs = [[5, 6], [6, 7]];
          const allPairs = [...morningPairs, ...afternoonPairs].sort(() => Math.random() - 0.5);

          for (const [slot1, slot2] of allPairs) {
            if (!daySlots.has(slot1) && !daySlots.has(slot2)) {
              const room = LABS[Math.floor(Math.random() * LABS.length)];
              
              schedule.push({
                class_id: lab.id,
                day_of_week: day,
                start_time: TIME_SLOTS[slot1].start,
                end_time: TIME_SLOTS[slot2].end,
                room,
                courseName: `${courseName} LAB`,
                section,
                isLab: true,
              });

              daySlots.add(slot1);
              daySlots.add(slot2);
              assignedCount++;
              break;
            }
          }
        }
      });

      // Then, schedule regular subjects (single periods)
      subjects.forEach(subject => {
        const courseName = subject.classData.courses?.name || 'Unknown Course';
        const section = subject.classData.section || 'A';
        let assignedCount = 0;

        const shuffledDays = [...DAYS].sort(() => Math.random() - 0.5);

        for (const day of shuffledDays) {
          if (assignedCount >= subject.classesPerWeek) break;

          const daySlots = usedSlots.get(day)!;
          
          // Get available single slot indices (excluding lunch)
          const availableSlots = CLASS_SLOTS
            .map(s => s.index)
            .filter(idx => !daySlots.has(idx))
            .sort(() => Math.random() - 0.5);

          for (const slotIdx of availableSlots) {
            if (assignedCount >= subject.classesPerWeek) break;
            
            const slot = TIME_SLOTS[slotIdx];
            const room = ROOMS[Math.floor(Math.random() * ROOMS.length)];
            
            schedule.push({
              class_id: subject.id,
              day_of_week: day,
              start_time: slot.start,
              end_time: slot.end,
              room,
              courseName,
              section,
              isLab: false,
            });

            daySlots.add(slotIdx);
            assignedCount++;
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
      setSelectedClasses(new Map());
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
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      toast.success('Cleared all timetable entries');
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
    } catch (error: any) {
      console.error('Error clearing timetable:', error);
      toast.error(error.message || 'Failed to clear timetable');
    }
  };

  // Build preview grid
  const previewGrid = new Map<string, GeneratedSlot>();
  generatedSchedule.forEach(slot => {
    const slotIndex = TIME_SLOTS.findIndex(s => s.start === slot.start_time);
    if (slotIndex !== -1) {
      previewGrid.set(`${slot.day_of_week}-${slotIndex}`, slot);
      // If it's a lab, also mark the next slot
      if (slot.isLab) {
        previewGrid.set(`${slot.day_of_week}-${slotIndex + 1}`, slot);
      }
    }
  });

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
            Select subjects and labs, then generate an optimized timetable matching your institution's time slots
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={selectAllSubjects}>
                Select All Subjects
              </Button>
              <Button variant="outline" size="sm" onClick={selectAllLabs}>
                <FlaskConical className="h-4 w-4 mr-1" />
                Select All Labs
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

      {/* Subjects Selection */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Select Subjects
          </CardTitle>
          <CardDescription>
            Choose subjects to include (each takes 1 period per class)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {classes && classes.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {classes.map(classItem => {
                const key = `${classItem.id}-subject`;
                const isSelected = selectedClasses.has(key);
                const selection = selectedClasses.get(key);
                
                return (
                  <div
                    key={key}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => handleClassToggle(classItem.id, false)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleClassToggle(classItem.id, false)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {classItem.courses?.name || 'Unknown Course'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {classItem.courses?.code} • Section {classItem.section}
                      </p>
                      {isSelected && (
                        <div className="mt-2 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <Label className="text-xs">Classes/week:</Label>
                          <Select 
                            value={selection?.classesPerWeek.toString() || '3'} 
                            onValueChange={(v) => updateClassesPerWeek(key, parseInt(v))}
                          >
                            <SelectTrigger className="h-7 w-16 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6].map(num => (
                                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {getAbbreviation(classItem.courses?.name)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No classes found. Please create classes first.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Labs Selection */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-purple-500" />
            Select Labs
          </CardTitle>
          <CardDescription>
            Choose labs to include (each lab takes 2 consecutive periods)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {classes && classes.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {classes.map(classItem => {
                const key = `${classItem.id}-lab`;
                const isSelected = selectedClasses.has(key);
                const selection = selectedClasses.get(key);
                
                return (
                  <div
                    key={key}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md",
                      isSelected
                        ? "border-purple-500 bg-purple-500/5"
                        : "border-border hover:border-purple-500/50"
                    )}
                    onClick={() => handleClassToggle(classItem.id, true)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleClassToggle(classItem.id, true)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {classItem.courses?.name} LAB
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {classItem.courses?.code}-LAB • 2 periods
                      </p>
                      {isSelected && (
                        <div className="mt-2 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <Label className="text-xs">Labs/week:</Label>
                          <Select 
                            value={selection?.classesPerWeek.toString() || '1'} 
                            onValueChange={(v) => updateClassesPerWeek(key, parseInt(v))}
                          >
                            <SelectTrigger className="h-7 w-16 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3].map(num => (
                                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 shrink-0">
                      {getAbbreviation(classItem.courses?.name)}-LAB
                    </Badge>
                  </div>
                );
              })}
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
          disabled={selectedClasses.size === 0 || isGenerating}
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

      {/* Generated Schedule Preview - Grid Format */}
      {generatedSchedule.length > 0 && (
        <Card className="shadow-card border-success/20 bg-success/5">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Generated Schedule Preview
                </CardTitle>
                <CardDescription>
                  Review and save the generated timetable ({generatedSchedule.length} entries)
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
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="p-2 text-center font-bold border border-primary-foreground/20 w-24">
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
                        {slot.isLunch ? 'LUNCH' : slot.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day, dayIndex) => {
                    const renderedSlots = new Set<number>();
                    
                    return (
                      <tr key={day} className={dayIndex % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                        <td className="p-2 font-bold text-sm text-center border bg-muted/50 uppercase">
                          {day}
                        </td>
                        {TIME_SLOTS.map((slot, slotIndex) => {
                          if (renderedSlots.has(slotIndex)) return null;
                          
                          if (slot.isLunch) {
                            return (
                              <td 
                                key={slotIndex} 
                                className="p-2 text-center border bg-amber-50 dark:bg-amber-900/20"
                              >
                                <span className="text-amber-600 dark:text-amber-400 font-medium text-xs">
                                  🍽️ BREAK
                                </span>
                              </td>
                            );
                          }
                          
                          const cellKey = `${day}-${slotIndex}`;
                          const entry = previewGrid.get(cellKey);
                          
                          if (entry) {
                            // Check if this is a lab that spans 2 periods
                            if (entry.isLab && entry.start_time === slot.start) {
                              renderedSlots.add(slotIndex + 1);
                              return (
                                <td 
                                  key={slotIndex} 
                                  colSpan={2}
                                  className="p-2 text-center border bg-purple-100 dark:bg-purple-900/30 min-w-[80px]"
                                >
                                  <div className="flex flex-col items-center gap-0.5">
                                    <span className="font-bold text-sm text-purple-800 dark:text-purple-200">
                                      {getAbbreviation(entry.courseName.replace(' LAB', ''))} LAB
                                    </span>
                                    <span className="text-[10px] text-purple-600 dark:text-purple-300">
                                      {entry.room}
                                    </span>
                                  </div>
                                </td>
                              );
                            } else if (!entry.isLab) {
                              return (
                                <td 
                                  key={slotIndex} 
                                  className="p-2 text-center border bg-blue-100 dark:bg-blue-900/30 min-w-[80px]"
                                >
                                  <div className="flex flex-col items-center gap-0.5">
                                    <span className="font-bold text-sm text-blue-800 dark:text-blue-200">
                                      {getAbbreviation(entry.courseName)}
                                    </span>
                                    <span className="text-[10px] text-blue-600 dark:text-blue-300">
                                      {entry.room}
                                    </span>
                                  </div>
                                </td>
                              );
                            }
                            return null;
                          }
                          
                          return (
                            <td 
                              key={slotIndex} 
                              className="p-2 text-center border min-w-[80px]"
                            />
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* List view for details */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3">Detailed List:</h4>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Course</th>
                      <th className="text-left p-3 font-medium">Type</th>
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
                          <Badge variant={slot.isLab ? "secondary" : "outline"} 
                            className={slot.isLab ? "bg-purple-100 text-purple-800" : ""}>
                            {slot.isLab ? 'Lab' : 'Theory'}
                          </Badge>
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
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Timetable Stats */}
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
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {DAYS.length * CLASS_SLOTS.length - (existingTimetable?.length || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Available Slots</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
