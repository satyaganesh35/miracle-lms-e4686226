import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  GraduationCap,
  BookOpen,
  Users,
  Calendar,
  BarChart3,
  Shield,
  CheckCircle,
  ArrowRight,
  PlayCircle,
} from 'lucide-react';

export default function Index() {
  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Role-Based Access',
      description: 'Separate dashboards for students, teachers, and administrators with tailored features.',
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: 'Course Management',
      description: 'Upload syllabi, notes, and reference materials. Share YouTube videos and resources.',
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: 'Timetable & Scheduling',
      description: 'View class schedules, manage assignments deadlines, and track important dates.',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Grades & Analytics',
      description: 'Track academic performance, view grades, and monitor progress over time.',
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: 'Attendance Tracking',
      description: 'Easy attendance marking for teachers and real-time tracking for students.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with role-based permissions and data protection.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10 py-20 md:py-32">
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent shadow-lg">
                <GraduationCap className="h-8 w-8 text-accent-foreground" />
              </div>
              <div>
                <h1 className="font-display font-bold text-primary-foreground text-lg">Miracle LMS</h1>
                <p className="text-xs text-primary-foreground/70">Educational Society</p>
              </div>
            </div>
            <Link to="/auth">
              <Button variant="hero" size="lg">
                Login / Sign Up
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 text-accent">
                <PlayCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Welcome to the Future of Learning</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-tight">
                Miracle Educational Society
                <span className="block text-accent">Learning Portal</span>
              </h1>
              
              <p className="text-lg text-primary-foreground/80 max-w-xl">
                A comprehensive Learning Management System designed for students, teachers, and administrators. 
                Access courses, track attendance, manage assignments, and more - all in one place.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/auth">
                  <Button variant="hero" size="xl">
                    Get Started
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Learn More
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-primary-foreground/20">
                <div>
                  <p className="text-3xl font-display font-bold text-accent">2,500+</p>
                  <p className="text-sm text-primary-foreground/70">Active Students</p>
                </div>
                <div>
                  <p className="text-3xl font-display font-bold text-accent">100+</p>
                  <p className="text-sm text-primary-foreground/70">Expert Faculty</p>
                </div>
                <div>
                  <p className="text-3xl font-display font-bold text-accent">50+</p>
                  <p className="text-sm text-primary-foreground/70">Courses</p>
                </div>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="relative hidden lg:block animate-float">
              <div className="relative z-10">
                <Card className="shadow-2xl border-0 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-sidebar p-4 flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-destructive" />
                        <div className="w-3 h-3 rounded-full bg-warning" />
                        <div className="w-3 h-3 rounded-full bg-success" />
                      </div>
                      <span className="text-sm text-sidebar-foreground/70">Dashboard Preview</span>
                    </div>
                    <div className="p-6 bg-background space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                          <CheckCircle className="h-8 w-8 text-primary mb-2" />
                          <p className="font-semibold">92% Attendance</p>
                          <p className="text-sm text-muted-foreground">This semester</p>
                        </div>
                        <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                          <BarChart3 className="h-8 w-8 text-success mb-2" />
                          <p className="font-semibold">Grade: A</p>
                          <p className="text-sm text-muted-foreground">GPA: 3.8</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted space-y-2">
                        <p className="font-semibold">Today's Schedule</p>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-primary">09:00</span>
                          <span>Mathematics - Room 301</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-primary">10:30</span>
                          <span>Physics Lab - Lab 102</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/30 rounded-2xl blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/30 rounded-2xl blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Everything You Need to
              <span className="text-primary"> Excel</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Our LMS provides all the tools necessary for effective learning and teaching management.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-transparent hover:border-primary/20"
              >
                <CardContent className="p-6">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-6">
            Ready to Transform Your Learning Experience?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of students and teachers already using Miracle LMS to achieve academic excellence.
          </p>
          <Link to="/auth">
            <Button variant="accent" size="xl">
              Get Started Now
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent">
                <GraduationCap className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-display font-bold text-secondary-foreground">Miracle LMS</h3>
                <p className="text-xs text-secondary-foreground/70">Educational Society Group of Institutions</p>
              </div>
            </div>
            <p className="text-sm text-secondary-foreground/70">
              © {new Date().getFullYear()} Miracle Educational Society. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
