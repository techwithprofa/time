import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DndContext, 
  DragOverlay, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  BarChart3, 
  Calendar as CalendarIcon, 
  Clock, 
  Play, 
  Square, 
  Filter,
  GripVertical,
  Plus,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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
  block_name: string;
  block_color: string;
  group_name?: string;
  timeBlock?: TimeBlock;
}

const mockTimeBlocks: TimeBlock[] = [
  {
    id: 1,
    name: "Morning Planning",
    color_code: "#8B5CF6",
    duration_min: 90,
    group_name: "Work",
    description: "Daily planning and task review"
  },
  {
    id: 2,
    name: "Development",
    color_code: "#06B6D4",
    duration_min: 120,
    group_name: "Work",
    description: "Coding and development tasks"
  },
  {
    id: 3,
    name: "Learning",
    color_code: "#10B981",
    duration_min: 60,
    group_name: "Personal",
    description: "Study and skill development"
  },
  {
    id: 4,
    name: "Exercise",
    color_code: "#F59E0B",
    duration_min: 45,
    group_name: "Health",
    description: "Physical exercise and workouts"
  },
  {
    id: 5,
    name: "Reading",
    color_code: "#EF4444",
    duration_min: 30,
    group_name: "Personal",
    description: "Reading books and articles"
  }
];

const mockEntries: TimelineEntry[] = [
  {
    id: 1,
    time_block_id: 1,
    start_time: "2024-01-15T09:00:00Z",
    end_time: "2024-01-15T10:30:00Z",
    block_name: "Morning Planning",
    block_color: "#8B5CF6",
    group_name: "Work"
  },
  {
    id: 2,
    time_block_id: 2,
    start_time: "2024-01-15T10:45:00Z",
    end_time: "2024-01-15T12:45:00Z",
    block_name: "Development",
    block_color: "#06B6D4",
    group_name: "Work"
  }
];

// Draggable Time Block Component
function DraggableTimeBlock({ timeBlock }: { timeBlock: TimeBlock }) {
  return (
    <div
      className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg cursor-grab hover:shadow-md transition-all duration-200 hover:scale-105"
      data-time-block-id={timeBlock.id}
    >
      <div 
        className="w-4 h-4 rounded-full flex-shrink-0"
        style={{ backgroundColor: timeBlock.color_code }}
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{timeBlock.name}</h4>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{timeBlock.duration_min}m</span>
          {timeBlock.group_name && (
            <Badge variant="secondary" className="text-xs py-0 px-1">
              {timeBlock.group_name}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

// Sortable Timeline Entry Component
function SortableTimelineEntry({ entry, onDelete }: { entry: TimelineEntry; onDelete: (id: number) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-4 p-4 bg-card border border-border rounded-lg transition-all duration-200",
        isDragging ? "opacity-50 shadow-lg scale-105" : "hover:shadow-md"
      )}
    >
      <button
        className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      
      <div 
        className="w-1 h-12 rounded-full flex-shrink-0"
        style={{ backgroundColor: entry.block_color }}
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-sm">{entry.block_name}</h4>
          {entry.group_name && (
            <Badge variant="secondary" className="text-xs">
              {entry.group_name}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{formatTime(entry.start_time)} - {formatTime(entry.end_time)}</span>
          <Badge variant="outline" className="text-xs">
            {formatDuration(entry.start_time, entry.end_time)}
          </Badge>
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => onDelete(entry.id)}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

// Drop Zone Component
function TimelineDropZone({ children, onDrop }: { children: React.ReactNode; onDrop: (timeBlockId: number) => void }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const timeBlockId = e.dataTransfer.getData("timeBlockId");
    if (timeBlockId) {
      onDrop(parseInt(timeBlockId));
    }
  };

  return (
    <div
      className={cn(
        "min-h-[400px] p-4 border-2 border-dashed rounded-lg transition-all duration-200",
        isDragOver 
          ? "border-primary bg-primary/5 shadow-lg" 
          : "border-border hover:border-muted-foreground/50"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
}

const Timeline = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>(mockEntries);
  const [activeId, setActiveId] = useState<number | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const timelineIds = useMemo(() => timelineEntries.map(entry => entry.id), [timelineEntries]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setTimelineEntries((entries) => {
        const oldIndex = entries.findIndex(entry => entry.id === active.id);
        const newIndex = entries.findIndex(entry => entry.id === over?.id);

        return arrayMove(entries, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  };

  const handleTimeBlockDrop = (timeBlockId: number) => {
    const timeBlock = mockTimeBlocks.find(block => block.id === timeBlockId);
    if (!timeBlock) return;

    const now = new Date();
    const endTime = new Date(now.getTime() + timeBlock.duration_min * 60000);

    const newEntry: TimelineEntry = {
      id: Date.now(),
      time_block_id: timeBlock.id,
      start_time: now.toISOString(),
      end_time: endTime.toISOString(),
      block_name: timeBlock.name,
      block_color: timeBlock.color_code,
      group_name: timeBlock.group_name,
      timeBlock
    };

    setTimelineEntries([...timelineEntries, newEntry]);
    
    toast({
      title: "Timeline entry created",
      description: `Added "${timeBlock.name}" to your timeline`,
    });
  };

  const handleDeleteEntry = (entryId: number) => {
    setTimelineEntries(timelineEntries.filter(entry => entry.id !== entryId));
    toast({
      title: "Entry deleted",
      description: "Timeline entry has been removed",
    });
  };

  const handleTimeBlockDragStart = (e: React.DragEvent, timeBlock: TimeBlock) => {
    e.dataTransfer.setData("timeBlockId", timeBlock.id.toString());
  };

  const getTotalDuration = () => {
    const total = timelineEntries.reduce((acc, entry) => {
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      return acc + (end.getTime() - start.getTime());
    }, 0);
    
    const hours = Math.floor(total / (1000 * 60 * 60));
    const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Interactive Timeline</h1>
            <p className="text-muted-foreground mt-1">
              Drag time blocks to create entries • Reorder by dragging
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-card border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{timelineEntries.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Time</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{getTotalDuration()}</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-50">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available Blocks</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{mockTimeBlocks.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-50">
                  <Play className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Time Blocks Panel */}
          <Card className="bg-gradient-card border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-primary" />
                Time Blocks
              </CardTitle>
              <CardDescription>
                Drag blocks to timeline to create entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {mockTimeBlocks.map((timeBlock) => (
                    <div
                      key={timeBlock.id}
                      draggable
                      onDragStart={(e) => handleTimeBlockDragStart(e, timeBlock)}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <DraggableTimeBlock timeBlock={timeBlock} />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Timeline Entries */}
          <div className="lg:col-span-3">
            <Card className="bg-gradient-card border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Timeline for {format(selectedDate, "MMMM dd, yyyy")}
                </CardTitle>
                <CardDescription>
                  Drop time blocks here • Drag to reorder entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TimelineDropZone onDrop={handleTimeBlockDrop}>
                  {timelineEntries.length > 0 ? (
                    <SortableContext items={timelineIds} strategy={verticalListSortingStrategy}>
                      <div className="space-y-3">
                        {timelineEntries.map((entry) => (
                          <SortableTimelineEntry
                            key={entry.id}
                            entry={entry}
                            onDelete={handleDeleteEntry}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center">
                      <BarChart3 className="w-16 h-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Empty Timeline</h3>
                      <p className="text-muted-foreground mb-4 max-w-md">
                        Drag time blocks from the left panel and drop them here to create timeline entries
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        Drop zone active
                      </div>
                    </div>
                  )}
                </TimelineDropZone>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <div className="bg-card border border-border rounded-lg p-4 shadow-lg rotate-3">
              <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <div className="w-1 h-8 bg-primary rounded-full" />
                <span className="font-medium">Moving entry...</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default Timeline;