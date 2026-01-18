import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageSquare, Send, Bot, User, Sparkles, 
  HelpCircle, BookOpen, Calendar, CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  { icon: <Calendar className="h-4 w-4" />, text: "What's my schedule for today?" },
  { icon: <BookOpen className="h-4 w-4" />, text: "Show my pending assignments" },
  { icon: <CreditCard className="h-4 w-4" />, text: "Check my fee status" },
  { icon: <HelpCircle className="h-4 w-4" />, text: "How do I submit an assignment?" },
];

const botResponses: Record<string, string> = {
  "schedule": "📅 **Today's Schedule:**\n\n• 09:00 AM - Mathematics (Room 301)\n• 10:30 AM - Physics Lab (Lab 102)\n• 12:00 PM - Computer Science (Room 205)\n• 02:00 PM - English (Room 101)\n\nYou have 4 classes scheduled for today!",
  "assignment": "📝 **Pending Assignments:**\n\n1. **Calculus Problem Set 5** - Due: Tomorrow (60% complete)\n2. **Physics Lab Report** - Due: In 3 days (30% complete)\n3. **Python Project** - Due: In 5 days (Not started)\n\nWould you like me to show more details about any of these?",
  "fee": "💰 **Fee Status:**\n\n• Total Fee: ₹45,000\n• Paid: ₹30,000\n• Pending: ₹15,000\n• Due Date: January 25, 2024\n\nYou can pay your pending fee through the Fee Management section.",
  "submit": "📤 **How to Submit an Assignment:**\n\n1. Go to the Assignments page\n2. Click on the assignment you want to submit\n3. Click the 'Submit' button\n4. Upload your file or enter your submission\n5. Click 'Confirm Submission'\n\nNeed help with anything else?",
  "default": "I'm here to help you with your academic queries! You can ask me about:\n\n• Your class schedule\n• Pending assignments\n• Fee status\n• Attendance information\n• Course materials\n\nWhat would you like to know?",
};

export default function QueryBot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'bot',
      content: `Hello! 👋 I'm your academic assistant. How can I help you today?\n\nYou can ask me about your schedule, assignments, fees, attendance, or any other academic queries.`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getBotResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('schedule') || lowerQuery.includes('today') || lowerQuery.includes('class')) {
      return botResponses.schedule;
    }
    if (lowerQuery.includes('assignment') || lowerQuery.includes('pending') || lowerQuery.includes('homework')) {
      return botResponses.assignment;
    }
    if (lowerQuery.includes('fee') || lowerQuery.includes('payment') || lowerQuery.includes('pay')) {
      return botResponses.fee;
    }
    if (lowerQuery.includes('submit') || lowerQuery.includes('how')) {
      return botResponses.submit;
    }
    return botResponses.default;
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot thinking
    await new Promise(resolve => setTimeout(resolve, 1000));

    const botMessage: Message = {
      id: messages.length + 2,
      role: 'bot',
      content: getBotResponse(inputValue),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
  };

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'U';

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Query Bot
          </h1>
          <p className="text-muted-foreground">Your AI-powered academic assistant</p>
        </div>

        <div className="flex-1 flex gap-6 min-h-0">
          {/* Chat Area */}
          <Card className="flex-1 flex flex-col shadow-card">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === 'user' ? "flex-row-reverse" : ""
                    )}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className={cn(
                        message.role === 'bot' 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      )}>
                        {message.role === 'bot' ? <Bot className="h-4 w-4" /> : userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        message.role === 'user'
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      )}
                    >
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                      <p className={cn(
                        "text-xs mt-1 opacity-60",
                        message.role === 'user' ? "text-right" : ""
                      )}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything about your academics..."
                  className="flex-1"
                />
                <Button type="submit" variant="hero" disabled={!inputValue.trim() || isTyping}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>

          {/* Sidebar */}
          <div className="w-80 hidden lg:block space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base font-display">Suggested Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => handleSuggestedQuestion(question.text)}
                  >
                    <span className="mr-2">{question.icon}</span>
                    <span className="text-sm">{question.text}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-card bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">AI-Powered Assistant</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      I can help you with academic queries, schedules, assignments, and more!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
