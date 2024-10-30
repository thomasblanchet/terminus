import { Moon, Sun, Monitor } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { useTheme } from "@/context-providers/theme-context-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (value: any) => {
    if (value) {
      setTheme(value);
    }
  };

  return (
    <ToggleGroup
      type="single"
      value={theme}
      onValueChange={handleThemeChange}
      size="sm"
      className="w-full px-2 py-1"
    >
      <ToggleGroupItem value="light" className="text-xs flex-grow">
        <Sun className="w-4 h-4 mr-2" /> Light
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" className="text-xs flex-grow">
        <Moon className="w-4 h-4 mr-2" />
        Dark
      </ToggleGroupItem>
      <ToggleGroupItem value="system" className="text-xs flex-grow">
        <Monitor className="w-4 h-4 mr-2" />
        System
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
