import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GraduationCap, Sparkles } from 'lucide-react';

interface WelcomeCardProps {
  userName: string;
  role: string;
  rollNumber?: string;
  department?: string;
  greeting?: string;
  avatarUrl?: string | null;
}

export default function WelcomeCard({ userName, role, rollNumber, department, greeting, avatarUrl }: WelcomeCardProps) {
  const getGreeting = () => {
    if (greeting) return greeting;
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRoleMessage = () => {
    switch (role) {
      case 'student':
        return "Ready to ace your B.Tech semester?";
      case 'teacher':
        return "Empower future engineers today!";
      case 'admin':
        return "Here's your college overview.";
      default:
        return "Welcome back!";
    }
  };

  // Format display name - show roll number with name or just name
  const displayName = rollNumber ? rollNumber : userName;
  const subtitle = rollNumber && userName ? userName : null;

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-primary via-primary to-secondary text-primary-foreground">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
      <div className="absolute top-4 right-4">
        <Sparkles className="h-6 w-6 text-accent animate-pulse" />
      </div>
      <div className="relative p-6 md:p-8">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 border-2 border-white/20">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
            <AvatarFallback className="bg-white/10 text-primary-foreground text-xl">
              {userName?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-primary-foreground/80 text-sm font-medium">{getGreeting()}</p>
            <h1 className="text-2xl md:text-3xl font-display font-bold mt-1">
              {displayName || 'Student'}
            </h1>
            {subtitle && (
              <p className="text-primary-foreground/90 text-lg mt-1">{subtitle}</p>
            )}
            <p className="text-primary-foreground/70 mt-2">{getRoleMessage()}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {department && (
            <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium">
              {department}
            </div>
          )}
          <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm">
            <span className="capitalize">{role}</span> Dashboard
          </div>
          <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>
    </Card>
  );
}
