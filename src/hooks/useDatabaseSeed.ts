import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Sample courses for B.Tech program
const sampleCourses = [
  { code: 'CS101', name: 'Data Structures', semester: 3, credits: 4, department: 'Computer Science', description: 'Fundamental data structures and algorithms' },
  { code: 'CS102', name: 'Operating Systems', semester: 5, credits: 4, department: 'Computer Science', description: 'Operating system concepts and design' },
  { code: 'CS103', name: 'Database Management Systems', semester: 4, credits: 3, department: 'Computer Science', description: 'Database design and SQL' },
  { code: 'CS104', name: 'Computer Networks', semester: 6, credits: 4, department: 'Computer Science', description: 'Network protocols and architectures' },
  { code: 'CS105', name: 'Software Engineering', semester: 5, credits: 3, department: 'Computer Science', description: 'Software development lifecycle' },
  { code: 'CS106', name: 'Web Technologies', semester: 4, credits: 3, department: 'Computer Science', description: 'HTML, CSS, JavaScript, and frameworks' },
  { code: 'CS107', name: 'Machine Learning', semester: 7, credits: 4, department: 'Computer Science', description: 'Introduction to ML algorithms' },
  { code: 'EC101', name: 'Digital Electronics', semester: 3, credits: 3, department: 'Electronics', description: 'Digital logic and circuits' },
];

// Knowledge base entries
const sampleKnowledge = [
  { category: 'general', question: 'What are the library timings?', answer: 'The library is open from 8 AM to 10 PM on weekdays and 9 AM to 6 PM on weekends.', keywords: ['library', 'timings', 'hours'], priority: 10 },
  { category: 'academic', question: 'How do I apply for a leave?', answer: 'Submit a leave application through the student portal under "Leave Management". For medical leave, attach a medical certificate.', keywords: ['leave', 'apply', 'absence'], priority: 9 },
  { category: 'fees', question: 'What are the fee payment options?', answer: 'Fees can be paid online through the portal via UPI, credit/debit card, or net banking. Cash payments are accepted at the accounts office.', keywords: ['fees', 'payment', 'pay'], priority: 10 },
  { category: 'examination', question: 'When are the semester exams?', answer: 'Semester examinations are typically held in December (odd semester) and May (even semester). Check the academic calendar for exact dates.', keywords: ['exam', 'examination', 'semester'], priority: 10 },
  { category: 'general', question: 'What is the dress code?', answer: 'Students must wear the college uniform on all working days. ID cards are mandatory within campus premises.', keywords: ['dress', 'uniform', 'code'], priority: 8 },
  { category: 'academic', question: 'How is CGPA calculated?', answer: 'CGPA is calculated as the weighted average of grade points earned in all courses, weighted by their credits. Grade points range from O (10) to F (0).', keywords: ['cgpa', 'grade', 'calculate'], priority: 10 },
  { category: 'academic', question: 'What is the attendance requirement?', answer: 'A minimum of 75% attendance is required for each course to be eligible for end-semester examinations.', keywords: ['attendance', 'requirement', 'percentage'], priority: 10 },
  { category: 'general', question: 'How do I contact the placement cell?', answer: 'The placement cell is located in the Admin Block, Room 204. Email: placements@mesi.edu.in, Phone: 040-1234567.', keywords: ['placement', 'contact', 'job'], priority: 9 },
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const timeSlots = [
  { start: '09:00', end: '10:00' },
  { start: '10:00', end: '11:00' },
  { start: '11:15', end: '12:15' },
  { start: '12:15', end: '13:15' },
  { start: '14:00', end: '15:00' },
  { start: '15:00', end: '16:00' },
];

export function useSeedDatabase() {
  const queryClient = useQueryClient();
  const { user, userRole } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user || userRole !== 'admin') {
        throw new Error('Only admins can seed the database');
      }

      const results = {
        courses: 0,
        classes: 0,
        timetable: 0,
        knowledge: 0,
        materials: 0,
      };

      // 1. Seed Courses
      const { data: existingCourses } = await supabase.from('courses').select('code');
      const existingCodes = new Set(existingCourses?.map(c => c.code) || []);
      const newCourses = sampleCourses.filter(c => !existingCodes.has(c.code));
      
      if (newCourses.length > 0) {
        const { data: insertedCourses, error: courseError } = await supabase
          .from('courses')
          .insert(newCourses)
          .select();
        if (courseError) throw courseError;
        results.courses = insertedCourses?.length || 0;
      }

      // 2. Get all courses and a teacher for creating classes
      const { data: allCourses } = await supabase.from('courses').select('id');
      const { data: teachers } = await supabase.from('profiles').select('id').eq('role', 'teacher').limit(1);
      const teacherId = teachers?.[0]?.id || user.id; // Use admin as fallback

      // 3. Seed Classes (one per course)
      const { data: existingClasses } = await supabase.from('classes').select('course_id');
      const existingClassCourses = new Set(existingClasses?.map(c => c.course_id) || []);
      
      const newClasses = allCourses
        ?.filter(c => !existingClassCourses.has(c.id))
        .map((course, index) => ({
          course_id: course.id,
          teacher_id: teacherId,
          section: 'A',
          academic_year: '2024-25',
          room: `Room ${101 + index}`,
        })) || [];

      if (newClasses.length > 0) {
        const { data: insertedClasses, error: classError } = await supabase
          .from('classes')
          .insert(newClasses)
          .select();
        if (classError) throw classError;
        results.classes = insertedClasses?.length || 0;
      }

      // 4. Get all classes for timetable
      const { data: allClasses } = await supabase.from('classes').select('id, room');
      
      // 5. Seed Timetable entries
      const { data: existingTimetable } = await supabase.from('timetable').select('class_id, day_of_week, start_time');
      const existingSlots = new Set(
        existingTimetable?.map(t => `${t.class_id}-${t.day_of_week}-${t.start_time}`) || []
      );

      const timetableEntries: { class_id: string; day_of_week: string; start_time: string; end_time: string; room: string | null }[] = [];
      
      allClasses?.forEach((cls, classIndex) => {
        // Assign 2 slots per class spread across the week
        const day1 = daysOfWeek[classIndex % 5];
        const day2 = daysOfWeek[(classIndex + 2) % 5];
        const slot1 = timeSlots[classIndex % timeSlots.length];
        const slot2 = timeSlots[(classIndex + 1) % timeSlots.length];
        
        const key1 = `${cls.id}-${day1}-${slot1.start}`;
        const key2 = `${cls.id}-${day2}-${slot2.start}`;
        
        if (!existingSlots.has(key1)) {
          timetableEntries.push({
            class_id: cls.id,
            day_of_week: day1,
            start_time: slot1.start,
            end_time: slot1.end,
            room: cls.room,
          });
        }
        if (!existingSlots.has(key2)) {
          timetableEntries.push({
            class_id: cls.id,
            day_of_week: day2,
            start_time: slot2.start,
            end_time: slot2.end,
            room: cls.room,
          });
        }
      });

      if (timetableEntries.length > 0) {
        const { data: insertedTimetable, error: timetableError } = await supabase
          .from('timetable')
          .insert(timetableEntries)
          .select();
        if (timetableError) throw timetableError;
        results.timetable = insertedTimetable?.length || 0;
      }

      // 6. Seed Knowledge Base
      const { data: existingKnowledge } = await supabase.from('knowledge_base').select('question');
      const existingQuestions = new Set(existingKnowledge?.map(k => k.question) || []);
      const newKnowledge = sampleKnowledge
        .filter(k => !existingQuestions.has(k.question))
        .map(k => ({ ...k, created_by: user.id, active: true }));

      if (newKnowledge.length > 0) {
        const { data: insertedKnowledge, error: knowledgeError } = await supabase
          .from('knowledge_base')
          .insert(newKnowledge)
          .select();
        if (knowledgeError) throw knowledgeError;
        results.knowledge = insertedKnowledge?.length || 0;
      }

      // 7. Seed sample materials
      const { data: existingMaterials } = await supabase.from('materials').select('title');
      const existingTitles = new Set(existingMaterials?.map(m => m.title) || []);
      
      const sampleMaterials = allClasses?.slice(0, 4).map((cls, i) => ({
        class_id: cls.id,
        title: `Course Notes - Unit ${i + 1}`,
        description: 'Comprehensive lecture notes covering key concepts',
        type: 'pdf' as const,
        external_link: 'https://example.com/notes.pdf',
        uploaded_by: teacherId,
      })).filter(m => !existingTitles.has(m.title)) || [];

      if (sampleMaterials.length > 0) {
        const { data: insertedMaterials, error: materialsError } = await supabase
          .from('materials')
          .insert(sampleMaterials)
          .select();
        if (materialsError) throw materialsError;
        results.materials = insertedMaterials?.length || 0;
      }

      return results;
    },
    onSuccess: () => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge_base'] });
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });
}
