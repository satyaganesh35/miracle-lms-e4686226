import { Card } from '@/components/ui/card';
import { GraduationCap, Sparkles } from 'lucide-react';

interface WelcomeCardProps {
  userName: string;
  role: string;
  greeting?: string;
}

export default function WelcomeCard({ userName, role, greeting }: WelcomeCardProps) {
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
        return "Ready to learn something new today?";
      case 'teacher':
        return "Inspire your students today!";
      case 'admin':
        return "Here's your system overview.";
      default:
        return "Welcome back!";
    }
  };

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-primary via-primary to-secondary text-primary-foreground">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
      <div className="absolute top-4 right-4">
        <Sparkles className="h-6 w-6 text-accent animate-pulse" />
      </div>
      <div className="relative p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <p className="text-primary-foreground/80 text-sm font-medium">{getGreeting()}</p>
            <h1 className="text-2xl md:text-3xl font-display font-bold mt-1">
              {userName || 'Student'}
            </h1>
            <p className="text-primary-foreground/70 mt-2">{getRoleMessage()}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
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