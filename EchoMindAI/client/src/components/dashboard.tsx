import { useQuery } from "@tanstack/react-query";
import { Task, Reminder } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Calendar, 
  CheckSquare, 
  Sun, 
  Newspaper,
  RefreshCw
} from "lucide-react";

interface NewsArticle {
  title: string;
  description: string;
  source: string;
  publishedAt: string;
}

interface WeatherData {
  location: string;
  temperature: string;
  condition: string;
  humidity: string;
}

export function Dashboard() {
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: reminders = [] } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
  });

  const { data: weatherData } = useQuery<WeatherData>({
    queryKey: ["/api/weather"],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const { data: newsData = [], refetch: refetchNews } = useQuery<NewsArticle[]>({
    queryKey: ["/api/news"],
    refetchInterval: 15 * 60 * 1000, // Refresh every 15 minutes
  });

  const pendingTasks = tasks.filter(task => !task.isCompleted);
  const upcomingReminders = reminders.filter(reminder => 
    !reminder.isCompleted && new Date(reminder.scheduledAt) > new Date()
  );

  const today = new Date();

  return (
    <div className="w-80 bg-card border-l border-border h-full overflow-y-auto" data-testid="dashboard">
      <div className="p-6">
        {/* Dashboard Header */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">Dashboard</h3>
          <p className="text-sm text-muted-foreground">Quick access to your information</p>
        </div>

        {/* Today's Overview */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-4 text-primary-foreground">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Today</h4>
                <Calendar className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold" data-testid="today-date">
                {today.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-sm opacity-90" data-testid="today-summary">
                {pendingTasks.length} tasks • {upcomingReminders.length} reminders
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Current Weather */}
        {weatherData && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <Sun className="mr-2 w-4 h-4" />
                Current Weather
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium" data-testid="weather-location">
                      {weatherData.location}
                    </p>
                    <p className="text-2xl font-bold" data-testid="weather-temperature">
                      {weatherData.temperature}
                    </p>
                    <p className="text-sm opacity-90" data-testid="weather-condition">
                      {weatherData.condition}
                    </p>
                  </div>
                  <div className="text-4xl opacity-80">
                    <Sun className="w-10 h-10" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Tasks */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center">
                <CheckSquare className="mr-2 w-4 h-4" />
                Pending Tasks
              </CardTitle>
              <span className="text-xs text-muted-foreground" data-testid="tasks-count">
                {pendingTasks.length} items
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2">
              {pendingTasks.slice(0, 3).map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center space-x-3 p-3 bg-secondary rounded-lg"
                  data-testid={`task-${task.id}`}
                >
                  <Checkbox className="w-4 h-4" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground" data-testid="task-title">
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <p className="text-xs text-muted-foreground" data-testid="task-due-date">
                        {new Date(task.dueDate).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {pendingTasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No pending tasks
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent News */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center">
                <Newspaper className="mr-2 w-4 h-4" />
                Tech News
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => refetchNews()}
                data-testid="button-refresh-news"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3">
              {newsData.slice(0, 3).map((article, index) => (
                <div 
                  key={index}
                  className="p-3 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80 transition-colors"
                  data-testid={`news-article-${index}`}
                >
                  <h5 className="text-sm font-medium text-foreground leading-tight" data-testid="article-title">
                    {article.title}
                  </h5>
                  <p className="text-xs text-muted-foreground mt-1" data-testid="article-source">
                    {article.source} • {new Date(article.publishedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {newsData.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No news available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
