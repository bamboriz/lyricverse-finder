import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";

interface LyricCardsProps {
  lyrics: string;
}

export const LyricCards = ({ lyrics }: LyricCardsProps) => {
  const [selectedLyric, setSelectedLyric] = useState("");
  const [customLyric, setCustomLyric] = useState("");

  const handleLyricSelect = (line: string) => {
    setSelectedLyric(line);
    setCustomLyric(line);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "Shared Lyric",
        text: customLyric,
      });
      toast.success("Lyric shared successfully!");
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error("Failed to share lyric");
      }
    }
  };

  const handleDownload = () => {
    // In a real implementation, this would generate an image
    // For now, we'll just download the text
    const element = document.createElement("a");
    const file = new Blob([customLyric], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "lyric.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Lyric downloaded!");
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-primary">Create Lyric Card</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 bg-white/50 backdrop-blur-sm border-accent">
            <h3 className="font-semibold mb-2">Select a line</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {lyrics.split("\n").map((line, index) => (
                line.trim() && (
                  <div
                    key={index}
                    onClick={() => handleLyricSelect(line)}
                    className="p-2 hover:bg-accent cursor-pointer rounded transition-colors"
                  >
                    {line}
                  </div>
                )
              ))}
            </div>
          </Card>
          
          <Card className="p-4 bg-white/50 backdrop-blur-sm border-accent">
            <h3 className="font-semibold mb-2">Customize your lyric</h3>
            <div className="space-y-4">
              <Input
                value={customLyric}
                onChange={(e) => setCustomLyric(e.target.value)}
                placeholder="Enter or edit your lyric"
                className="w-full"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleShare}
                  className="flex-1"
                  variant="secondary"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  onClick={handleDownload}
                  className="flex-1"
                  variant="secondary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};