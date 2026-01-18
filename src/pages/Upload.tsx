import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, FileText, Video, Link, Plus, Trash2, 
  CheckCircle, File, Image
} from 'lucide-react';
import { cn } from '@/lib/utils';

const recentUploads = [
  { id: 1, title: 'Calculus Chapter 5 Notes', type: 'pdf', class: '10-A', date: '2024-01-18', size: '2.4 MB' },
  { id: 2, title: 'Physics Lab Instructions', type: 'pdf', class: '11-B', date: '2024-01-17', size: '1.1 MB' },
  { id: 3, title: 'Python Basics Tutorial', type: 'video', class: '10-A', date: '2024-01-15', link: 'youtube.com/...' },
];

export default function UploadContent() {
  const { userRole } = useAuth();
  const [uploadType, setUploadType] = useState('pdf');
  const [selectedClass, setSelectedClass] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoLink, setVideoLink] = useState('');

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
        <div>
          <h1 className="text-2xl font-display font-bold">Upload Content</h1>
          <p className="text-muted-foreground">Share study materials with your students</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Upload Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Upload New Material
                </CardTitle>
                <CardDescription>Add PDFs, videos, or reference links for your classes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Content Type Selection */}
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={uploadType === 'pdf' ? 'default' : 'outline'}
                      className="h-auto py-4 flex-col gap-2"
                      onClick={() => setUploadType('pdf')}
                    >
                      <FileText className={cn("h-6 w-6", uploadType === 'pdf' ? "" : "text-destructive")} />
                      <span>PDF Notes</span>
                    </Button>
                    <Button
                      variant={uploadType === 'video' ? 'default' : 'outline'}
                      className="h-auto py-4 flex-col gap-2"
                      onClick={() => setUploadType('video')}
                    >
                      <Video className={cn("h-6 w-6", uploadType === 'video' ? "" : "text-info")} />
                      <span>Video Link</span>
                    </Button>
                    <Button
                      variant={uploadType === 'link' ? 'default' : 'outline'}
                      className="h-auto py-4 flex-col gap-2"
                      onClick={() => setUploadType('link')}
                    >
                      <Link className={cn("h-6 w-6", uploadType === 'link' ? "" : "text-success")} />
                      <span>Reference Link</span>
                    </Button>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter material title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Class Selection */}
                <div className="space-y-2">
                  <Label>Select Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10-A">Class 10-A</SelectItem>
                      <SelectItem value="10-B">Class 10-B</SelectItem>
                      <SelectItem value="11-A">Class 11-A</SelectItem>
                      <SelectItem value="11-B">Class 11-B</SelectItem>
                      <SelectItem value="12-A">Class 12-A</SelectItem>
                      <SelectItem value="all">All Classes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add a brief description..."
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Upload Area / Link Input */}
                {uploadType === 'pdf' ? (
                  <div className="space-y-2">
                    <Label>Upload File</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="font-medium">Drag and drop your file here</p>
                      <p className="text-sm text-muted-foreground mt-1">or click to browse (PDF, max 10MB)</p>
                      <Button variant="outline" className="mt-4">
                        Choose File
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="link">
                      {uploadType === 'video' ? 'YouTube Video URL' : 'Reference URL'}
                    </Label>
                    <Input
                      id="link"
                      type="url"
                      placeholder={uploadType === 'video' ? 'https://youtube.com/watch?v=...' : 'https://example.com/resource'}
                      value={videoLink}
                      onChange={(e) => setVideoLink(e.target.value)}
                    />
                  </div>
                )}

                {/* Submit Button */}
                <Button variant="hero" className="w-full" size="lg">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Material
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Uploads */}
          <div>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display text-base">Recent Uploads</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentUploads.map((upload) => (
                  <div key={upload.id} className="p-3 rounded-lg border hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        upload.type === 'pdf' ? "bg-destructive/10" : "bg-info/10"
                      )}>
                        {getTypeIcon(upload.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{upload.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">{upload.class}</Badge>
                          <span className="text-xs text-muted-foreground">{upload.date}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full mt-4">
                  View All Uploads
                </Button>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="shadow-card mt-4 bg-info/5 border-info/20">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-2">Tips for Uploading</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Use clear, descriptive titles</li>
                  <li>• Keep PDF files under 10MB</li>
                  <li>• Add descriptions for context</li>
                  <li>• Select the right class for visibility</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
