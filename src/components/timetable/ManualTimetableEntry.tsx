import { useState } from 'react';
import { useClasses, useTimetable } from '@/hooks/useLMS';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  Plus,
  Loader2, 
  Trash2,
  Save,
  Edit2,
  X,
  CheckCircle2
} from 'lucide-react';

const DAYS = [
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' },
];

const TIME_OPTIONS = [
  '09:00', '09:15', '09:30', '09:45',
  '10:00', '10:05', '10:15', '10:30', '10:45', '10:55',
  '11:00', '11:05', '11:15', '11:30', '11:45', '11:55',
  '12:00', '12:15', '12:30', '12:45',
  '13:00', '13:25', '13:30', '13:45',
  '14:00', '14:15', '14:30', '14:45',
  '15:00', '15:05', '15:15', '15:30', '15:45', '15:55',
  '16:00', '16:15', '16:30', '16:45',
  '17:00',
];

interface EditingEntry {
  id: string;
  class_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room: string;
}

export default function ManualTimetableEntry() {
  const { data: classes, isLoading: classesLoading } = useClasses();
  const { data: existingTimetable, isLoading: timetableLoading } = useTimetable();
  const queryClient = useQueryClient();

  const [classId, setClassId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [room, setRoom] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingEntry, setEditingEntry] = useState<EditingEntry | null>(null);

  const resetForm = () => {
    setClassId('');
    setDayOfWeek('');
    setStartTime('');
    setEndTime('');
    setRoom('');
    setEditingEntry(null);
  };

  const handleAddEntry = async () => {
    if (!classId || !dayOfWeek || !startTime || !endTime) {
      toast.error('Please fill all required fields');
      return;
    }

    if (startTime >= endTime) {
      toast.error('End time must be after start time');
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('timetable')
        .insert({
          class_id: classId,
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          room: room || null,
        });

      if (error) throw error;

      toast.success('Timetable entry added successfully');
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
    } catch (error: any) {
      console.error('Error adding timetable entry:', error);
      toast.error(error.message || 'Failed to add entry');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateEntry = async () => {
    if (!editingEntry) return;

    if (editingEntry.start_time >= editingEntry.end_time) {
      toast.error('End time must be after start time');
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('timetable')
        .update({
          class_id: editingEntry.class_id,
          day_of_week: editingEntry.day_of_week,
          start_time: editingEntry.start_time,
          end_time: editingEntry.end_time,
          room: editingEntry.room || null,
        })
        .eq('id', editingEntry.id);

      if (error) throw error;

      toast.success('Timetable entry updated');
      setEditingEntry(null);
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
    } catch (error: any) {
      console.error('Error updating entry:', error);
      toast.error(error.message || 'Failed to update entry');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const { error } = await supabase
        .from('timetable')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Entry deleted');
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
    } catch (error: any) {
      console.error('Error deleting entry:', error);
      toast.error(error.message || 'Failed to delete entry');
    }
  };

  const startEditing = (entry: any) => {
    setEditingEntry({
      id: entry.id,
      class_id: entry.class_id,
      day_of_week: entry.day_of_week,
      start_time: entry.start_time.substring(0, 5),
      end_time: entry.end_time.substring(0, 5),
      room: entry.room || '',
    });
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
      {/* Add Entry Form */}
      <Card className="shadow-card border-0 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            Add Timetable Entry
          </CardTitle>
          <CardDescription>
            Manually add individual class slots to the timetable
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label>Class/Course *</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.courses?.name} - {c.section}
                    </SelectItem>
                  ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Day *</Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map(d => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Time *</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Start time" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>End Time *</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger>
                  <SelectValue placeholder="End time" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Room</Label>
              <Input 
                placeholder="e.g., Room 101" 
                value={room} 
                onChange={(e) => setRoom(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={handleAddEntry} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Entries */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-lg">
            Existing Timetable Entries ({existingTimetable?.length || 0})
          </CardTitle>
          <CardDescription>
            View, edit, or delete existing timetable entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {existingTimetable && existingTimetable.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {existingTimetable.map(entry => (
                    <TableRow key={entry.id}>
                      {editingEntry?.id === entry.id ? (
                        <>
                          <TableCell colSpan={2}>
                            <Select 
                              value={editingEntry.class_id} 
                              onValueChange={(v) => setEditingEntry({...editingEntry, class_id: v})}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {classes?.map(c => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.courses?.name} - {c.section}
                                  </SelectItem>
                                ))
                                }
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={editingEntry.day_of_week} 
                              onValueChange={(v) => setEditingEntry({...editingEntry, day_of_week: v})}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DAYS.map(d => (
                                  <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                                ))
                                }
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Select 
                                value={editingEntry.start_time} 
                                onValueChange={(v) => setEditingEntry({...editingEntry, start_time: v})}
                              >
                                <SelectTrigger className="w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_OPTIONS.map(t => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                  ))
                                  }
                                </SelectContent>
                              </Select>
                              <span className="self-center">-</span>
                              <Select 
                                value={editingEntry.end_time} 
                                onValueChange={(v) => setEditingEntry({...editingEntry, end_time: v})}
                              >
                                <SelectTrigger className="w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_OPTIONS.map(t => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                  ))
                                  }
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input 
                              value={editingEntry.room} 
                              onChange={(e) => setEditingEntry({...editingEntry, room: e.target.value})}
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={handleUpdateEntry}
                                disabled={isSaving}
                              >
                                <CheckCircle2 className="h-4 w-4 text-success" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => setEditingEntry(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium">
                            {entry.classes?.courses?.name || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {entry.classes?.section || 'A'}
                            </Badge>
                          </TableCell>
                          <TableCell>{entry.day_of_week}</TableCell>
                          <TableCell>
                            {entry.start_time.substring(0, 5)} - {entry.end_time.substring(0, 5)}
                          </TableCell>
                          <TableCell>{entry.room || '-'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => startEditing(entry)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))
                  }
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No timetable entries yet. Add your first entry above.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
