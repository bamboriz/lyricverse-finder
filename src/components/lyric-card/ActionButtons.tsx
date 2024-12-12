import { Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "./ColorPicker";

interface ActionButtonsProps {
  onShare: () => void;
  onDownload: () => void;
  onColorSelect: (from: string, to: string) => void;
  colorSuggestions: Array<{ name: string; from: string; to: string; }>;
}

export const ActionButtons = ({ 
  onShare, 
  onDownload, 
  onColorSelect,
  colorSuggestions 
}: ActionButtonsProps) => {
  return (
    <div className="flex items-center gap-2">
      <ColorPicker onColorSelect={onColorSelect} colorSuggestions={colorSuggestions} />
      <Button
        onClick={onShare}
        className="flex-1"
        variant="secondary"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
      <Button
        onClick={onDownload}
        className="flex-1"
        variant="secondary"
      >
        <Download className="w-4 h-4 mr-2" />
        Download
      </Button>
    </div>
  );
};