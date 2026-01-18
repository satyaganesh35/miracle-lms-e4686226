import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, Download, Upload, Search, Filter, Folder, 
  Video, BookOpen, File, ExternalLink, Plus, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

const materials = [
  { id: 1, title: 'DSA Notes - Trees & Graphs', subject: 'Data Structures', type: 'pdf', size: '2.4 MB', uploadedBy: 'Dr. Venkat', date: '2026-01-15' },
  { id: 2, title: 'DBMS Normalization Cheat Sheet', subject: 'Database Systems', type: 'pdf', size: '1.1 MB', uploadedBy: 'Prof. Ramesh', date: '2026-01-14' },
  { id: 3, title: 'OS Memory Management', subject: 'Operating Systems', type: 'pdf', size: '3.2 MB', uploadedBy: 'Dr. Suresh', date: '2026-01-12' },
  { id: 4, title: 'TCP/IP Protocol Tutorial', subject: 'Computer Networks', type: 'video', size: '45 min', uploadedBy: 'Dr. Priya', date: '2026-01-10', link: 'https://youtube.com/watch?v=example' },
  { id: 5, title: 'SDLC Models Explained', subject: 'Software Engineering', type: 'video', size: '1h 20min', uploadedBy: 'Prof. Lakshmi', date: '2026-01-08', link: 'https://youtube.com/watch?v=example2' },
  { id: 6, title: 'SQL Commands Reference', subject: 'Database Systems', type: 'pdf', size: '1.8 MB', uploadedBy: 'Prof. Ramesh', date: '2026-01-05' },
];

const referenceBooks = [
  { id: 1, title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest, Stein', subject: 'Data Structures', isbn: '978-0262033848' },
  { id: 2, title: 'Database System Concepts', author: 'Silberschatz, Korth, Sudarshan', subject: 'Database Systems', isbn: '978-0078022159' },
  { id: 3, title: 'Operating System Concepts', author: 'Galvin, Gagne, Silberschatz', subject: 'Operating Systems', isbn: '978-1119800361' },
  { id: 4, title: 'Computer Networks', author: 'Andrew S. Tanenbaum', subject: 'Computer Networks', isbn: '978-0132126953' },
];

const subjects = ['All', 'Data Structures', 'Database Systems', 'Operating Systems', 'Computer Networks', 'Software Engineering'];

export default function Notes() {
  const { userRole } = useAuth();
  const isTeacher = userRole === 'teacher' || userRole === 'admin';
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMaterials = materials.filter(m => {
    const matchesSubject = selectedSubject === 'All' || m.subject === selectedSubject;
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-5 w-5 text-destructive" />;
      case 'video': return <Video className="h-5 w-5 text-info" />;
      default: return <File className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Notes & Materials</h1>
            <p className="text-muted-foreground">
              {isTeacher ? 'Upload and manage study materials' : 'Access your study materials and resources'}
            </p>
          </div>
          {isTeacher && (
            <Button variant="hero">
              <Upload className="h-4 w-4" />
              Upload Material
            </Button>
          )}
        </div>

        {/* Search and Filter */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search materials..." 
                  className="pl-9" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {subjects.map((subject) => (
                  <Button
                    key={subject}
                    variant={selectedSubject === subject ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSubject(subject)}
                  >
                    {subject}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="notes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="notes">PDF Notes</TabsTrigger>
            <TabsTrigger value="videos">Video Lectures</TabsTrigger>
            <TabsTrigger value="books">Reference Books</TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMaterials.filter(m => m.type === 'pdf').map((material) => (
                <Card key={material.id} className="shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-lg bg-destructive/10">
                        <FileText className="h-6 w-6 text-destructive" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{material.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">{material.subject}</Badge>
                          <span className="text-xs text-muted-foreground">{material.size}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          By {material.uploadedBy} • {material.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMaterials.filter(m => m.type === 'video').map((material) => (
                <Card key={material.id} className="shadow-card hover:shadow-card-hover transition-all hover:-translate-y-1">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-lg bg-info/10">
                        <Video className="h-6 w-6 text-info" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{material.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">{material.subject}</Badge>
                          <span className="text-xs text-muted-foreground">{material.size}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          By {material.uploadedBy} • {material.date}
                        </p>
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Watch on YouTube
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="books" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {referenceBooks.filter(b => selectedSubject === 'All' || b.subject === selectedSubject).map((book) => (
                <Card key={book.id} className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{book.title}</h3>
                        <p className="text-sm text-muted-foreground">by {book.author}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{book.subject}</Badge>
                          <span className="text-xs text-muted-foreground">ISBN: {book.isbn}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
