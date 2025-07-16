import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, FolderKanban, Play, Square, BarChart3 } from "lucide-react";

interface Group {
  id: number;
  name: string;
}

interface TimeBlock {
  id: number;
  name: string;
  color_code: string;
  description?: string;
  duration_min: number;
  group_id?: number;
  group_name?: string;
}

interface TimelineEntry {
  id: number;
  time_block_id: number;
  start_time: string;
  end_time: string;
}

const Dashboard = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [recentEntries, setRecentEntries] = useState<TimelineEntry[]>([]);
  const [activeTimer, setActiveTimer] = useState<TimeBlock | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update current time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    {
      title: "Total Groups",
      value: groups.length,
      icon: FolderKanban,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Time Blocks",
      value: timeBlocks.length,
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Active Sessions",
      value: activeTimer ? 1 : 0,
      icon: Play,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Today's Entries",
      value: recentEntries.length,
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="text-2xl font-mono text-primary">
          {currentTime.toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-gradient-card border-0 shadow-md hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Timer */}
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" />
              Active Timer
            </CardTitle>
            <CardDescription>
              Current time tracking session
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeTimer ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: activeTimer.color_code }}
                  />
                  <span className="font-semibold">{activeTimer.name}</span>
                  <Badge variant="secondary">{activeTimer.group_name}</Badge>
                </div>
                <div className="text-2xl font-mono text-primary">00:15:42</div>
                <Button variant="destructive" size="sm">
                  <Square className="w-4 h-4 mr-2" />
                  Stop Timer
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No active timer</p>
                <Button variant="outline" size="sm" className="mt-3">
                  Start New Session
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest time tracking entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentEntries.length > 0 ? (
              <div className="space-y-3">
                {recentEntries.slice(0, 5).map((entry, index) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="font-medium">Task Name</span>
                    </div>
                    <Badge variant="outline">2h 30m</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No recent activity</p>
                <Button variant="outline" size="sm" className="mt-3">
                  Start Tracking
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-card border-0 shadow-md">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Frequently used actions to get started quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-24 bg-gradient-primary hover:shadow-glow transition-all duration-300">
              <div className="text-center">
                <Clock className="w-6 h-6 mx-auto mb-2" />
                <div className="font-semibold">New Time Block</div>
              </div>
            </Button>
            <Button variant="outline" className="h-24 hover:bg-accent transition-colors">
              <div className="text-center">
                <FolderKanban className="w-6 h-6 mx-auto mb-2" />
                <div className="font-semibold">Create Group</div>
              </div>
            </Button>
            <Button variant="outline" className="h-24 hover:bg-accent transition-colors">
              <div className="text-center">
                <Play className="w-6 h-6 mx-auto mb-2" />
                <div className="font-semibold">Start Timer</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;