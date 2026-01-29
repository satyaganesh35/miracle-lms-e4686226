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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  FlaskConical,
  Users,
  BookOpen,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DAYS,
  TIME_SLOTS,
  CLASS_SLOTS,
  ROOMS,
  LABS,
  generateOptimizedTimetable,
  getAbbreviation,
  type SelectedClass,
  type GeneratedSlot,
  type FacultyWorkload,
  type DayOfWeek,
} from '@/lib/timetableScheduler';

interface LocalSelectedClass {
  id: string;
  isLab: boolean;
  classesPerWeek: number;
}

export default function TimetableGenerator() {
  const { data: classes, isLoading: classesLoading } = useClasses();
  const { data: existingTimetable, isLoading: timetableLoading } = useTimetable();
  const queryClient = useQueryClient();

  const [selectedClasses, setSelectedClasses] = useState<Map<string, LocalSelectedClass>>(new Map());
  const [generatedSchedule, setGeneratedSchedule] = useState<GeneratedSlot[]>([]);
  const [facultyWorkloads, setFacultyWorkloads] = useState<FacultyWorkload[]>([]);
  const [justification, setJustification] = useState<string[]>([]);
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
    setFacultyWorkloads([]);
    setJustification([]);
  };

  const generateTimetable = () => {
    if (selectedClasses.size === 0) {
      toast.error('Please select at least one subject or lab');
      return;
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      // Convert local selection to SelectedClass format with class data
      const selectedWithData: SelectedClass[] = [];
      
      selectedClasses.forEach((selection, _key) => {
        const classData = classes?.find(c => c.id === selection.id);
        if (classData) {
          selectedWithData.push({
            ...selection,
            classData: {
              id: classData.id,
              teacher_id: classData.teacher_id,
              section: classData.section,
              courses: classData.courses,
              profiles: classData.profiles as { full_name?: string },
            },
          });
        }
      });

      const result = generateOptimizedTimetable(
        selectedWithData,
        existingTimetable || []
      );

      setGeneratedSchedule(result.schedule);
      setFacultyWorkloads(result.facultyWorkloads);
      setJustification(result.justification);
      setIsGenerating(false);
      
      if (result.schedule.length > 0) {
        toast.success(`Generated ${result.schedule.length} time slots with faculty-optimized scheduling`);
      } else {
        toast.warning('Could not generate any slots. All time slots may be occupied.');
      }
    }, 1500);
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
      setFacultyWorkloads([]);
      setJustification([]);
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
    const startSlotIndex = TIME_SLOTS.findIndex(s => s.start === slot.start_time);
    if (startSlotIndex !== -1) {
      previewGrid.set(`${slot.day_of_week}-${startSlotIndex}`, slot);
      // If it's a lab, also mark the next slot
      if (slot.isLab && slot.slotIndices.length > 1) {
        previewGrid.set(`${slot.day_of_week}-${startSlotIndex + 1}`, slot);
      }
    }
  });

  // Build subject-faculty mapping
  const subjectFacultyMap = new Map<string, { name: string; code: string; faculty: string; isLab: boolean }>();
  generatedSchedule.forEach(slot => {
    const key = `${slot.courseCode}-${slot.isLab ? 'lab' : 'theory'}`;
    if (!subjectFacultyMap.has(key)) {
      subjectFacultyMap.set(key, {
        name: slot.courseName,
        code: slot.courseCode,
        faculty: slot.facultyName,
        isLab: slot.isLab,
      });
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
            Faculty-Optimized Timetable Generator
          </CardTitle>
          <CardDescription className="space-y-2">
            <p>Generate an academic timetable optimized for faculty comfort and efficiency.</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="text-xs">Max 3 theory/faculty/day</Badge>
              <Badge variant="outline" className="text-xs">≤2 continuous periods</Badge>
              <Badge variant="outline" className="text-xs">Labs in afternoon</Badge>
              <Badge variant="outline" className="text-xs">Core subjects in morning</Badge>
              <Badge variant="outline" className="text-xs">Even workload distribution</Badge>
            </div>
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
                        {classItem.courses?.code} • {classItem.profiles?.full_name || 'TBA'}
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
            Choose labs to include (each lab takes 2 consecutive periods, preferably afternoon)
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
              Generate Optimized Timetable
            </>
          )}
        </Button>
      </div>

      {/* Generated Schedule Preview */}
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
                  Review the faculty-optimized timetable ({generatedSchedule.length} entries)
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
            <Tabs defaultValue="grid" className="space-y-4">
              <TabsList className="grid w-full max-w-md grid-cols-4">
                <TabsTrigger value="grid" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Grid
                </TabsTrigger>
                <TabsTrigger value="faculty" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Faculty
                </TabsTrigger>
                <TabsTrigger value="subjects" className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  Subjects
                </TabsTrigger>
                <TabsTrigger value="justification" className="flex items-center gap-1">
                  <Info className="h-4 w-4" />
                  Info
                </TabsTrigger>
              </TabsList>

              {/* Grid View */}
              <TabsContent value="grid">
                <TimetableGrid 
                  previewGrid={previewGrid} 
                  removeSlot={removeSlot}
                  generatedSchedule={generatedSchedule}
                />
              </TabsContent>

              {/* Faculty Workload View */}
              <TabsContent value="faculty">
                <FacultyWorkloadView workloads={facultyWorkloads} />
              </TabsContent>

              {/* Subject-Faculty Mapping */}
              <TabsContent value="subjects">
                <SubjectFacultyMapping mapping={subjectFacultyMap} />
              </TabsContent>

              {/* Justification */}
              <TabsContent value="justification">
                <JustificationView justification={justification} />
              </TabsContent>
            </Tabs>
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

// Timetable Grid Component
function TimetableGrid({ 
  previewGrid, 
  removeSlot,
  generatedSchedule 
}: { 
  previewGrid: Map<string, GeneratedSlot>;
  removeSlot: (index: number) => void;
  generatedSchedule: GeneratedSlot[];
}) {
  return (
    <div className="space-y-6">
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
                                {entry.courseCode}
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
                                {entry.courseCode}
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

      {/* Detailed List */}
      <div>
        <h4 className="font-semibold mb-3">Detailed List:</h4>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Course</th>
                <th className="text-left p-3 font-medium">Faculty</th>
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
                  <td className="p-3 text-muted-foreground">{slot.facultyName}</td>
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
    </div>
  );
}

// Faculty Workload View Component
function FacultyWorkloadView({ workloads }: { workloads: FacultyWorkload[] }) {
  return (
    <div className="space-y-6">
      {workloads.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No faculty workload data available</p>
        </div>
      ) : (
        <>
          {/* Summary Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold">Faculty</TableHead>
                  <TableHead className="font-bold text-center">Total Periods</TableHead>
                  <TableHead className="font-bold text-center">Morning</TableHead>
                  <TableHead className="font-bold text-center">Afternoon</TableHead>
                  {DAYS.map(day => (
                    <TableHead key={day} className="font-bold text-center text-xs">
                      {day.substring(0, 3)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {workloads.map((workload, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{workload.teacherName}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{workload.totalPeriods}</Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm">{workload.morningPeriods}</TableCell>
                    <TableCell className="text-center text-sm">{workload.afternoonPeriods}</TableCell>
                    {DAYS.map(day => (
                      <TableCell key={day} className="text-center text-sm">
                        {workload.periodsPerDay.get(day as DayOfWeek) || 0}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Individual Faculty Timetables */}
          <div className="space-y-4">
            <h4 className="font-semibold">Individual Faculty Schedules:</h4>
            {workloads.map((workload, idx) => (
              <Card key={idx} className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    {workload.teacherName}
                    <Badge variant="outline" className="ml-auto">
                      {workload.totalPeriods} periods/week
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="p-2 text-left font-medium border">Day</th>
                          <th className="p-2 text-left font-medium border">Schedule</th>
                        </tr>
                      </thead>
                      <tbody>
                        {DAYS.map(day => {
                          const daySchedule = workload.daySchedule.get(day as DayOfWeek) || [];
                          return (
                            <tr key={day}>
                              <td className="p-2 border font-medium w-24">{day}</td>
                              <td className="p-2 border">
                                {daySchedule.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {daySchedule.map((slot, i) => (
                                      <Badge
                                        key={i}
                                        variant={slot.isLab ? "secondary" : "outline"}
                                        className={cn(
                                          "text-xs",
                                          slot.isLab && "bg-purple-100 text-purple-800"
                                        )}
                                      >
                                        {slot.courseCode} ({slot.start_time}-{slot.end_time})
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-xs">Free</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Subject-Faculty Mapping Component
function SubjectFacultyMapping({ 
  mapping 
}: { 
  mapping: Map<string, { name: string; code: string; faculty: string; isLab: boolean }> 
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-bold">Subject Code</TableHead>
            <TableHead className="font-bold">Subject Name</TableHead>
            <TableHead className="font-bold">Type</TableHead>
            <TableHead className="font-bold">Faculty</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from(mapping.values()).map((subject, idx) => (
            <TableRow key={idx}>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "font-mono",
                    subject.isLab ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                  )}
                >
                  {subject.code}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{subject.name}</TableCell>
              <TableCell>
                <Badge variant={subject.isLab ? "secondary" : "outline"}>
                  {subject.isLab ? 'Lab' : 'Theory'}
                </Badge>
              </TableCell>
              <TableCell>{subject.faculty}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Justification View Component
function JustificationView({ justification }: { justification: string[] }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          How Faculty Comfort is Ensured
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {justification.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <span className="shrink-0">{item}</span>
            </li>
          ))}
        </ul>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h5 className="font-semibold mb-2">Applied Constraints:</h5>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Maximum 3 theory periods per faculty per day</li>
            <li>• No more than 2 continuous theory periods</li>
            <li>• At least 1 free period per faculty per day</li>
            <li>• Workload distributed evenly across the week</li>
            <li>• Labs scheduled in 2 consecutive periods (afternoon preferred)</li>
            <li>• No theory classes immediately before/after lab sessions</li>
            <li>• Core/heavy subjects scheduled in morning sessions</li>
            <li>• Seminar, soft skills on Friday/Saturday</li>
            <li>• Lunch break fixed at 12:45 PM - 1:25 PM</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
