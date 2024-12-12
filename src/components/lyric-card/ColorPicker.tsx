import { Palette } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface ColorPickerProps {
  onColorSelect: (from: string, to: string) => void;
  colorSuggestions: Array<{ name: string; from: string; to: string; }>;
}

export const ColorPicker = ({ onColorSelect, colorSuggestions }: ColorPickerProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex-1">
          <Palette className="w-4 h-4 mr-2" />
          Change Colors
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-2">
          {colorSuggestions.map((color, index) => (
            <div
              key={index}
              onClick={() => onColorSelect(color.from, color.to)}
              className="p-2 cursor-pointer hover:bg-accent rounded flex items-center gap-2"
            >
              <div
                className="w-8 h-8 rounded"
                style={{
                  background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
                }}
              />
              <span>{color.name}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};