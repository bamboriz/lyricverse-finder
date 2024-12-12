interface LyricPreviewProps {
  customLyric: string;
  setCustomLyric: (lyric: string) => void;
  gradientFrom: string;
  gradientTo: string;
}

export const LyricPreview = ({
  customLyric,
  setCustomLyric,
  gradientFrom,
  gradientTo,
}: LyricPreviewProps) => {
  return (
    <div 
      className="relative aspect-square rounded-lg overflow-hidden shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
      }}
    >
      <textarea
        value={customLyric}
        onChange={(e) => setCustomLyric(e.target.value)}
        className="absolute inset-0 w-full h-full bg-transparent text-white resize-none p-12 focus:outline-none font-serif"
        style={{
          background: 'transparent',
          border: 'none',
          fontSize: 'clamp(24px, 4vw, 48px)',
          lineHeight: '1.4',
          textAlign: 'left',
        }}
        placeholder="Enter or edit your lyric"
      />
    </div>
  );
};