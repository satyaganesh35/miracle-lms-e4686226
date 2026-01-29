import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  GraduationCap,
  LayoutDashboard,
  Calendar,
  BookOpen,
  FileText,
  ClipboardList,
  Bell,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  CreditCard,
  MessageSquare,
  Upload,
  CheckSquare,
  Calculator,
  CalendarDays,
  Megaphone,
  MessagesSquare,
  Star,
  Library,
  Search,
  PartyPopper,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  icon: ReactNode;
  href: string;
  roles: ('admin' | 'teacher' | 'student')[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, href: '/dashboard', roles: ['admin', 'teacher', 'student'] },
  { label: 'Timetable', icon: <Calendar className="h-5 w-5" />, href: '/timetable', roles: ['admin', 'teacher', 'student'] },
  { label: 'Syllabus', icon: <BookOpen className="h-5 w-5" />, href: '/syllabus', roles: ['teacher', 'student'] },
  { label: 'Assignments', icon: <ClipboardList className="h-5 w-5" />, href: '/assignments', roles: ['teacher', 'student'] },
  { label: 'Notes & Materials', icon: <FileText className="h-5 w-5" />, href: '/notes', roles: ['teacher', 'student'] },
  { label: 'Attendance', icon: <CheckSquare className="h-5 w-5" />, href: '/attendance', roles: ['admin', 'teacher', 'student'] },
  { label: 'Grades', icon: <BarChart3 className="h-5 w-5" />, href: '/grades', roles: ['teacher', 'student'] },
  { label: 'CGPA Calculator', icon: <Calculator className="h-5 w-5" />, href: '/cgpa-calculator', roles: ['student'] },
  { label: 'Exam Schedule', icon: <CalendarDays className="h-5 w-5" />, href: '/exam-schedule', roles: ['admin', 'teacher', 'student'] },
  { label: 'Academic Calendar', icon: <Calendar className="h-5 w-5" />, href: '/academic-calendar', roles: ['admin', 'teacher', 'student'] },
  { label: 'Previous Papers', icon: <FileText className="h-5 w-5" />, href: '/previous-papers', roles: ['admin', 'teacher', 'student'] },
  { label: 'Announcements', icon: <Megaphone className="h-5 w-5" />, href: '/announcements', roles: ['admin', 'teacher', 'student'] },
  { label: 'Discussion Forums', icon: <MessagesSquare className="h-5 w-5" />, href: '/discussion-forums', roles: ['admin', 'teacher', 'student'] },
  { label: 'Faculty Feedback', icon: <Star className="h-5 w-5" />, href: '/faculty-feedback', roles: ['admin', 'teacher', 'student'] },
  { label: 'Library', icon: <Library className="h-5 w-5" />, href: '/library', roles: ['admin', 'student'] },
  { label: 'Lost & Found', icon: <Search className="h-5 w-5" />, href: '/lost-and-found', roles: ['admin', 'teacher', 'student'] },
  { label: 'Events', icon: <PartyPopper className="h-5 w-5" />, href: '/events', roles: ['admin', 'teacher', 'student'] },
  { label: 'Notifications', icon: <Bell className="h-5 w-5" />, href: '/notifications', roles: ['admin', 'teacher', 'student'] },
  { label: 'Fee Management', icon: <CreditCard className="h-5 w-5" />, href: '/fees', roles: ['admin', 'student'] },
  { label: 'Courses & Classes', icon: <BookOpen className="h-5 w-5" />, href: '/courses', roles: ['admin'] },
  { label: 'Manage Users', icon: <Users className="h-5 w-5" />, href: '/users', roles: ['admin'] },
  { label: 'Upload Content', icon: <Upload className="h-5 w-5" />, href: '/upload', roles: ['admin', 'teacher'] },
  { label: 'Query Bot', icon: <MessageSquare className="h-5 w-5" />, href: '/query-bot', roles: ['admin', 'teacher', 'student'] },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, userRole, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const filteredNavItems = navItems.filter(item => 
    userRole && item.roles.includes(userRole)
  );

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'U';

  const roleLabels = {
    admin: 'Administrator',
    teacher: 'Faculty',
    student: 'B.Tech Student',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-screen w-64 bg-sidebar transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-6 border-b border-sidebar-border">
            <div className="p-2 rounded-lg bg-accent">
              <GraduationCap className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sidebar-foreground text-sm">Miracle B.Tech Portal</h1>
              <p className="text-xs text-sidebar-foreground/60">{roleLabels[userRole as keyof typeof roleLabels] || 'User'}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden ml-auto text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-3">
              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md" 
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User section */}
          <div className="p-4 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {user?.email}
                    </p>
                    <p className="text-xs text-sidebar-foreground/60 capitalize">{userRole}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-4 h-16 px-4 bg-background/95 backdrop-blur border-b">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex-1">
            <h2 className="font-display font-semibold text-lg">
              {filteredNavItems.find(item => item.href === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full"></span>
          </Button>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
