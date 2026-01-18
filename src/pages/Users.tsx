import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, UserPlus, Search, Filter, MoreVertical, 
  GraduationCap, BookOpen, Shield, Edit, Trash2, Mail
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const usersData = {
  students: [
    { id: 1, name: 'Rahul Kumar', email: 'rahul@example.com', class: '10-A', rollNo: '101', status: 'active' },
    { id: 2, name: 'Priya Sharma', email: 'priya@example.com', class: '10-A', rollNo: '102', status: 'active' },
    { id: 3, name: 'Amit Patel', email: 'amit@example.com', class: '10-B', rollNo: '103', status: 'active' },
    { id: 4, name: 'Sneha Reddy', email: 'sneha@example.com', class: '11-A', rollNo: '104', status: 'inactive' },
    { id: 5, name: 'Vikram Singh', email: 'vikram@example.com', class: '11-B', rollNo: '105', status: 'active' },
  ],
  teachers: [
    { id: 1, name: 'Dr. Sharma', email: 'sharma@example.com', department: 'Mathematics', subjects: ['Calculus', 'Algebra'], status: 'active' },
    { id: 2, name: 'Prof. Kumar', email: 'kumar@example.com', department: 'Physics', subjects: ['Mechanics', 'Optics'], status: 'active' },
    { id: 3, name: 'Dr. Patel', email: 'patel@example.com', department: 'Chemistry', subjects: ['Organic', 'Inorganic'], status: 'active' },
    { id: 4, name: 'Mrs. Reddy', email: 'reddy@example.com', department: 'English', subjects: ['Grammar', 'Literature'], status: 'active' },
    { id: 5, name: 'Mr. Ravi', email: 'ravi@example.com', department: 'Computer Science', subjects: ['Programming', 'Data Structures'], status: 'on-leave' },
  ],
  admins: [
    { id: 1, name: 'Admin User', email: 'admin@miracle.edu', role: 'Super Admin', status: 'active' },
    { id: 2, name: 'Office Staff', email: 'office@miracle.edu', role: 'Staff', status: 'active' },
  ],
};

export default function UsersManagement() {
  const { userRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-success/10 text-success border-success/30">Active</Badge>;
      case 'inactive': return <Badge className="bg-muted text-muted-foreground">Inactive</Badge>;
      case 'on-leave': return <Badge className="bg-warning/10 text-warning border-warning/30">On Leave</Badge>;
      default: return null;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student': return <GraduationCap className="h-4 w-4" />;
      case 'teacher': return <BookOpen className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Manage Users</h1>
            <p className="text-muted-foreground">Add, edit, and manage all users in the system</p>
          </div>
          <Button variant="hero">
            <UserPlus className="h-4 w-4" />
            Add New User
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="shadow-card bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">2,535</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card bg-info/5 border-info/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info/20">
                  <GraduationCap className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-info">2,450</p>
                  <p className="text-sm text-muted-foreground">Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card bg-success/5 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/20">
                  <BookOpen className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">85</p>
                  <p className="text-sm text-muted-foreground">Teachers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card bg-warning/5 border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/20">
                  <Shield className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">5</p>
                  <p className="text-sm text-muted-foreground">Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search users by name, email, or ID..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="students" className="space-y-4">
          <TabsList>
            <TabsTrigger value="students" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              Students ({usersData.students.length})
            </TabsTrigger>
            <TabsTrigger value="teachers" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Teachers ({usersData.teachers.length})
            </TabsTrigger>
            <TabsTrigger value="admins" className="gap-2">
              <Shield className="h-4 w-4" />
              Admins ({usersData.admins.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-4">
            <Card className="shadow-card">
              <CardContent className="p-0">
                <div className="divide-y">
                  {usersData.students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-medium">{student.class}</p>
                          <p className="text-xs text-muted-foreground">Roll: {student.rollNo}</p>
                        </div>
                        {getStatusBadge(student.status)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers" className="space-y-4">
            <Card className="shadow-card">
              <CardContent className="p-0">
                <div className="divide-y">
                  {usersData.teachers.map((teacher) => (
                    <div key={teacher.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-success/10 text-success">
                            {teacher.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{teacher.name}</p>
                          <p className="text-sm text-muted-foreground">{teacher.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-medium">{teacher.department}</p>
                          <div className="flex gap-1">
                            {teacher.subjects.map((subject, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">{subject}</Badge>
                            ))}
                          </div>
                        </div>
                        {getStatusBadge(teacher.status)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admins" className="space-y-4">
            <Card className="shadow-card">
              <CardContent className="p-0">
                <div className="divide-y">
                  {usersData.admins.map((admin) => (
                    <div key={admin.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-warning/10 text-warning">
                            {admin.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{admin.name}</p>
                          <p className="text-sm text-muted-foreground">{admin.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <Badge variant="outline">{admin.role}</Badge>
                        {getStatusBadge(admin.status)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
