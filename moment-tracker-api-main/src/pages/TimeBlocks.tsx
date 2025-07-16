import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Clock, Plus, Play, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const mockGroups = [
  { id: 1, name: "Work" },
  { id: 2, name: "Personal" },
  { id: 3, name: "Learning" }
];

const colorOptions = [
  "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#EC4899"
];

const TimeBlocks = () => {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration_min: 30,
    group_id: "",
    color_code: colorOptions[0]
  });
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      duration_min: 30,
      group_id: "",
      color_code: colorOptions[0]
    });
  };

  const handleCreateBlock = () => {
    if (!formData.name.trim()) return;
    
    const newBlock: TimeBlock = {
      id: Date.now(),
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      duration_min: formData.duration_min,
      group_id: formData.group_id ? parseInt(formData.group_id) : undefined,
      group_name: formData.group_id ? mockGroups.find(g => g.id === parseInt(formData.group_id))?.name : undefined,
      color_code: formData.color_code
    };
    
    setTimeBlocks([...timeBlocks, newBlock]);
    resetForm();
    setIsCreateOpen(false);
    
    toast({
      title: "Time block created",
      description: `"${newBlock.name}" has been created successfully.`,
    });
  };

  const handleEditBlock = (block: TimeBlock) => {
    setEditingBlock(block);
    setFormData({
      name: block.name,
      description: block.description || "",
      duration_min: block.duration_min,
      group_id: block.group_id?.toString() || "",
      color_code: block.color_code
    });
  };

  const handleUpdateBlock = () => {
    if (!editingBlock || !formData.name.trim()) return;
    
    const updatedBlock: TimeBlock = {
      ...editingBlock,
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      duration_min: formData.duration_min,
      group_id: formData.group_id ? parseInt(formData.group_id) : undefined,
      group_name: formData.group_id ? mockGroups.find(g => g.id === parseInt(formData.group_id))?.name : undefined,
      color_code: formData.color_code
    };
    
    setTimeBlocks(timeBlocks.map(b => 
      b.id === editingBlock.id ? updatedBlock : b
    ));
    
    setEditingBlock(null);
    resetForm();
    
    toast({
      title: "Time block updated",
      description: "Time block has been updated successfully.",
    });
  };

  const handleDeleteBlock = (blockId: number) => {
    setTimeBlocks(timeBlocks.filter(b => b.id !== blockId));
    toast({
      title: "Time block deleted",
      description: "Time block has been deleted successfully.",
    });
  };

  const startTimer = (block: TimeBlock) => {
    toast({
      title: "Timer started",
      description: `Started timer for "${block.name}"`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Time Blocks</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your time blocks for efficient tracking
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
              <Plus className="w-4 h-4 mr-2" />
              Create Time Block
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Time Block</DialogTitle>
              <DialogDescription>
                Add a new time block for tracking your activities
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter block name..."
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration_min}
                    onChange={(e) => setFormData({ ...formData, duration_min: parseInt(e.target.value) || 0 })}
                    min="1"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="group">Group</Label>
                  <Select value={formData.group_id} onValueChange={(value) => setFormData({ ...formData, group_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select group..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id.toString()}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.color_code === color ? "border-foreground scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color_code: color })}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBlock} disabled={!formData.name.trim()}>
                Create Block
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Time Blocks Grid */}
      {timeBlocks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {timeBlocks.map((block) => (
            <Card key={block.id} className="bg-gradient-card border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: block.color_code }}
                    />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{block.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {block.duration_min}m
                        {block.group_name && (
                          <Badge variant="secondary" className="text-xs">
                            {block.group_name}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => startTimer(block)}>
                        <Play className="w-4 h-4 mr-2" />
                        Start Timer
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditBlock(block)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteBlock(block.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              {block.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {block.description}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Clock className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Time Blocks Yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Create your first time block to start tracking your activities. Time blocks help you organize and measure your productivity.
            </p>
            <Button 
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Time Block
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingBlock} onOpenChange={() => setEditingBlock(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Time Block</DialogTitle>
            <DialogDescription>
              Update the time block details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter block name..."
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-duration">Duration (min)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={formData.duration_min}
                  onChange={(e) => setFormData({ ...formData, duration_min: parseInt(e.target.value) || 0 })}
                  min="1"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-group">Group</Label>
                <Select value={formData.group_id} onValueChange={(value) => setFormData({ ...formData, group_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select group..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color_code === color ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color_code: color })}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingBlock(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBlock} disabled={!formData.name.trim()}>
              Update Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimeBlocks;