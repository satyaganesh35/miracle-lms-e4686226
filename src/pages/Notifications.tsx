import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, CheckCircle, AlertCircle, Info, Calendar, 
  MessageSquare, Send, Clock, Check, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const notifications = [
  { id: 1, type: 'info', title: 'New Assignment Posted', message: 'Calculus Problem Set 5 has been posted. Due date: Jan 20, 2024', time: '2 hours ago', read: false },
  { id: 2, type: 'success', title: 'Assignment Graded', message: 'Your English essay has been graded. Score: 45/50', time: '5 hours ago', read: false },
  { id: 3, type: 'warning', title: 'Fee Payment Reminder', message: 'Your semester fee payment is due in 5 days. Please make the payment to avoid late fees.', time: '1 day ago', read: true },
  { id: 4, type: 'info', title: 'Class Rescheduled', message: 'Physics class on Monday has been rescheduled to Tuesday 10:30 AM', time: '2 days ago', read: true },
  { id: 5, type: 'success', title: 'Attendance Updated', message: 'Your attendance for this week has been marked. Current attendance: 92%', time: '3 days ago', read: true },
  { id: 6, type: 'alert', title: 'Low Attendance Warning', message: 'Your attendance in Chemistry is below 75%. Please attend classes regularly.', time: '1 week ago', read: true },
];

const announcements = [
  { id: 1, title: 'Annual Day Celebration', message: 'Annual Day will be celebrated on February 15, 2024. All students are requested to participate.', date: 'Jan 15, 2024', from: 'Principal Office' },
  { id: 2, title: 'Sports Week Schedule', message: 'Sports week will be from Feb 20-25. Register for events by Feb 10.', date: 'Jan 12, 2024', from: 'Sports Department' },
  { id: 3, title: 'Library Hours Extended', message: 'Library will remain open until 9 PM during exam period (Feb 1-15).', date: 'Jan 10, 2024', from: 'Library' },
];

export default function Notifications() {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin';
  const [notificationList, setNotificationList] = useState(notifications);
  const [newNotification, setNewNotification] = useState({ title: '', message: '', type: 'info' });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'alert': return <AlertCircle className="h-5 w-5 text-destructive" />;
      default: return <Info className="h-5 w-5 text-info" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'success': return <Badge className="bg-success/10 text-success border-success/30">Success</Badge>;
      case 'warning': return <Badge className="bg-warning/10 text-warning border-warning/30">Warning</Badge>;
      case 'alert': return <Badge className="bg-destructive/10 text-destructive border-destructive/30">Alert</Badge>;
      default: return <Badge className="bg-info/10 text-info border-info/30">Info</Badge>;
    }
  };

  const markAsRead = (id: number) => {
    setNotificationList(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotificationList(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotificationList(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notificationList.filter(n => !n.read).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              {isAdmin ? 'Manage and send notifications' : 'Stay updated with the latest announcements'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Admin: Send Notification */}
        {isAdmin && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Send Notification
              </CardTitle>
              <CardDescription>Send notifications to students and teachers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input 
                    placeholder="Notification title" 
                    value={newNotification.title}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select 
                    value={newNotification.type} 
                    onValueChange={(value) => setNewNotification(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Information</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea 
                  placeholder="Write your notification message..." 
                  rows={3}
                  value={newNotification.message}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>
              <div className="flex gap-3">
                <Select defaultValue="all">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Send to" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="students">All Students</SelectItem>
                    <SelectItem value="teachers">All Teachers</SelectItem>
                    <SelectItem value="class">Specific Class</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="hero">
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="notifications" className="space-y-4">
          <TabsList>
            <TabsTrigger value="notifications" className="relative">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-destructive text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4">
            {notificationList.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="p-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium">No notifications</p>
                  <p className="text-muted-foreground">You're all caught up!</p>
                </CardContent>
              </Card>
            ) : (
              notificationList.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={cn(
                    "shadow-card transition-all",
                    !notification.read && "border-l-4 border-l-primary bg-primary/5"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={cn("font-semibold", !notification.read && "text-primary")}>
                            {notification.title}
                          </h3>
                          {getTypeBadge(notification.type)}
                          {!notification.read && (
                            <Badge className="bg-primary text-primary-foreground">New</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground">{notification.message}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {notification.time}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!notification.read && (
                          <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="announcements" className="space-y-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="shadow-card">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{announcement.title}</h3>
                        <Badge variant="outline">{announcement.from}</Badge>
                      </div>
                      <p className="text-muted-foreground">{announcement.message}</p>
                      <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {announcement.date}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
