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
    <div className="w-full flex justify-center">
      <div 
        className="relative w-full max-w-[400px] aspect-square rounded-md overflow-hidden shadow-md"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        }}
      >
        <textarea
          value={customLyric}
          onChange={(e) => setCustomLyric(e.target.value)}
          className="absolute inset-0 w-full h-full bg-transparent text-white resize-none p-8 focus:outline-none whitespace-pre-wrap"
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '24px',
            lineHeight: '1.8',
            textAlign: 'center',
          }}
          placeholder="Enter or edit your lyric"
        />
      </div>
    </div>
  );
};