import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Database, Palette, Clock, Download, Upload, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [settings, setSettings] = useState({
    apiUrl: "http://localhost:3000/api",
    defaultTimerDuration: 25,
    autoStartTimer: false,
    showNotifications: true,
    darkMode: false,
    compactView: false,
    backupFrequency: "weekly"
  });
  const { toast } = useToast();

  const handleSaveSettings = () => {
    // Save settings logic here
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleExportData = () => {
    // Export data logic here
    toast({
      title: "Data exported",
      description: "Your data has been exported successfully.",
    });
  };

  const handleImportData = () => {
    // Import data logic here
    toast({
      title: "Data imported",
      description: "Your data has been imported successfully.",
    });
  };

  const handleClearData = () => {
    // Clear data logic here
    toast({
      title: "Data cleared",
      description: "All data has been cleared from the application.",
      variant: "destructive",
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your TimeBlock preferences and manage your data
        </p>
      </div>

      <div className="grid gap-6">
        {/* API Configuration */}
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              API Configuration
            </CardTitle>
            <CardDescription>
              Configure connection to your TimeBlock API backend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="api-url">API Base URL</Label>
              <Input
                id="api-url"
                value={settings.apiUrl}
                onChange={(e) => setSettings({ ...settings, apiUrl: e.target.value })}
                placeholder="http://localhost:3000/api"
              />
              <p className="text-xs text-muted-foreground">
                The base URL for your TimeBlock API backend
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                Test Connection
              </Button>
              <span className="text-sm text-muted-foreground">
                Status: <span className="text-green-600 font-medium">Connected</span>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Timer Settings */}
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Timer Settings
            </CardTitle>
            <CardDescription>
              Customize your time tracking experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="default-duration">Default Timer Duration (minutes)</Label>
              <Input
                id="default-duration"
                type="number"
                value={settings.defaultTimerDuration}
                onChange={(e) => setSettings({ ...settings, defaultTimerDuration: parseInt(e.target.value) || 0 })}
                min="1"
                max="480"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-start">Auto-start timer</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically start timer when creating a new time block
                </p>
              </div>
              <Switch
                id="auto-start"
                checked={settings.autoStartTimer}
                onCheckedChange={(checked) => setSettings({ ...settings, autoStartTimer: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Show notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Get notified when timers start, stop, or complete
                </p>
              </div>
              <Switch
                id="notifications"
                checked={settings.showNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, showNotifications: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark mode</Label>
                <p className="text-xs text-muted-foreground">
                  Switch to dark theme for better visibility in low light
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={settings.darkMode}
                onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="compact-view">Compact view</Label>
                <p className="text-xs text-muted-foreground">
                  Use more compact spacing and smaller components
                </p>
              </div>
              <Switch
                id="compact-view"
                checked={settings.compactView}
                onCheckedChange={(checked) => setSettings({ ...settings, compactView: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Data Management
            </CardTitle>
            <CardDescription>
              Backup, restore, and manage your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="backup-frequency">Automatic backup frequency</Label>
              <Select 
                value={settings.backupFrequency} 
                onValueChange={(value) => setSettings({ ...settings, backupFrequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h4 className="font-medium">Manual Actions</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" onClick={handleImportData}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </Button>
                <Button variant="destructive" onClick={handleClearData}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
            onClick={handleSaveSettings}
          >
            <SettingsIcon className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;