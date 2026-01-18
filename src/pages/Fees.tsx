import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, IndianRupee, Calendar, CheckCircle, AlertCircle, 
  Clock, Download, Search, Filter, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

const studentFees = {
  totalDue: 45000,
  paid: 30000,
  pending: 15000,
  dueDate: '2024-01-25',
  history: [
    { id: 1, description: 'Tuition Fee - Semester 2', amount: 30000, status: 'paid', date: '2024-01-10', transactionId: 'TXN123456' },
    { id: 2, description: 'Library Fee', amount: 2000, status: 'paid', date: '2024-01-10', transactionId: 'TXN123457' },
    { id: 3, description: 'Lab Fee', amount: 5000, status: 'pending', dueDate: '2024-01-25' },
    { id: 4, description: 'Exam Fee', amount: 3000, status: 'pending', dueDate: '2024-01-25' },
    { id: 5, description: 'Sports Fee', amount: 2000, status: 'pending', dueDate: '2024-01-25' },
    { id: 6, description: 'Transport Fee', amount: 3000, status: 'pending', dueDate: '2024-01-25' },
  ],
  breakdown: [
    { category: 'Tuition', amount: 30000 },
    { category: 'Lab Fees', amount: 5000 },
    { category: 'Library', amount: 2000 },
    { category: 'Exam', amount: 3000 },
    { category: 'Sports', amount: 2000 },
    { category: 'Transport', amount: 3000 },
  ],
};

const adminFeeData = [
  { id: 1, name: 'Rahul Kumar', rollNo: '101', class: '10-A', total: 45000, paid: 45000, pending: 0, status: 'paid' },
  { id: 2, name: 'Priya Sharma', rollNo: '102', class: '10-A', total: 45000, paid: 30000, pending: 15000, status: 'partial' },
  { id: 3, name: 'Amit Patel', rollNo: '103', class: '10-A', total: 45000, paid: 0, pending: 45000, status: 'unpaid' },
  { id: 4, name: 'Sneha Reddy', rollNo: '104', class: '10-A', total: 45000, paid: 45000, pending: 0, status: 'paid' },
  { id: 5, name: 'Vikram Singh', rollNo: '105', class: '10-A', total: 45000, paid: 15000, pending: 30000, status: 'partial' },
];

export default function Fees() {
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-success/10 text-success border-success/30">Paid</Badge>;
      case 'partial': return <Badge className="bg-warning/10 text-warning border-warning/30">Partial</Badge>;
      case 'pending': return <Badge className="bg-destructive/10 text-destructive border-destructive/30">Pending</Badge>;
      case 'unpaid': return <Badge className="bg-destructive/10 text-destructive border-destructive/30">Unpaid</Badge>;
      default: return null;
    }
  };

  if (isAdmin) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold">Fee Management</h1>
              <p className="text-muted-foreground">Track and manage student fee payments</p>
            </div>
            <Button variant="hero">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="shadow-card bg-success/5 border-success/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/20">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-success">₹24.5L</p>
                    <p className="text-sm text-muted-foreground">Collected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card bg-warning/5 border-warning/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/20">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-warning">₹8.2L</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card bg-destructive/5 border-destructive/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/20">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-destructive">45</p>
                    <p className="text-sm text-muted-foreground">Defaulters</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <IndianRupee className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">₹32.7L</p>
                    <p className="text-sm text-muted-foreground">Total Expected</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Fee List */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-display">Student Fee Status</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search students..." className="pl-9 w-64" />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {adminFeeData.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-medium">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">Roll: {student.rollNo} • {student.class}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Paid</p>
                        <p className="font-semibold text-success">₹{student.paid.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Pending</p>
                        <p className={cn("font-semibold", student.pending > 0 ? "text-destructive" : "text-success")}>
                          ₹{student.pending.toLocaleString()}
                        </p>
                      </div>
                      {getStatusBadge(student.status)}
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold">Fee Details</h1>
          <p className="text-muted-foreground">View your fee structure and payment history</p>
        </div>

        {/* Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-card bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Fee</p>
                  <p className="text-3xl font-display font-bold">₹{studentFees.totalDue.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <IndianRupee className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card bg-success/5 border-success/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Paid</p>
                  <p className="text-3xl font-display font-bold text-success">₹{studentFees.paid.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-success/10">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card bg-warning/5 border-warning/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-display font-bold text-warning">₹{studentFees.pending.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-warning/10">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-warning">
                <Calendar className="h-4 w-4" />
                Due: {studentFees.dueDate}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pay Now */}
        {studentFees.pending > 0 && (
          <Card className="shadow-card border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Pay your pending fee</p>
                    <p className="text-sm text-muted-foreground">Amount due: ₹{studentFees.pending.toLocaleString()}</p>
                  </div>
                </div>
                <Button variant="hero" size="lg">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="history" className="space-y-4">
          <TabsList>
            <TabsTrigger value="history">Payment History</TabsTrigger>
            <TabsTrigger value="breakdown">Fee Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display">Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {studentFees.history.map((item) => (
                    <div key={item.id} className={cn(
                      "flex items-center justify-between p-4 rounded-lg border",
                      item.status === 'paid' ? "bg-success/5" : "bg-warning/5"
                    )}>
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-2 rounded-lg",
                          item.status === 'paid' ? "bg-success/10" : "bg-warning/10"
                        )}>
                          {item.status === 'paid' ? (
                            <CheckCircle className="h-5 w-5 text-success" />
                          ) : (
                            <Clock className="h-5 w-5 text-warning" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.status === 'paid' ? `Paid on ${item.date}` : `Due on ${item.dueDate}`}
                          </p>
                          {item.transactionId && (
                            <p className="text-xs text-muted-foreground">ID: {item.transactionId}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-semibold">₹{item.amount.toLocaleString()}</p>
                        {getStatusBadge(item.status)}
                        {item.status === 'paid' && (
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display">Fee Structure</CardTitle>
                <CardDescription>Breakdown of your semester fee</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {studentFees.breakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{item.category}</span>
                      </div>
                      <span className="font-semibold">₹{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 mt-4">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold">₹{studentFees.totalDue.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
