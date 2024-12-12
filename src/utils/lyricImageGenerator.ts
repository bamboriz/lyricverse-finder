export const generateLyricImage = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  customLyric: string,
  gradientFrom: string,
  gradientTo: string,
  songTitle: string,
  artist: string
) => {
  const canvas = canvasRef.current;
  if (!canvas) return null;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Set smaller canvas dimensions (reduced from 1080x1080)
  canvas.width = 800;
  canvas.height = 800;

  // Draw gradient background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, gradientFrom);
  gradient.addColorStop(1, gradientTo);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Text settings
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Calculate font size based on text length and canvas width
  const maxWidth = canvas.width * 0.8; // 80% of canvas width
  const words = customLyric.split(" ");
  let fontSize = 90; // Slightly reduced from 120
  let lines: string[] = [];
  
  // Adjust font size and wrap text
  do {
    ctx.font = `bold ${fontSize}px Garamond`;
    lines = [];
    let currentLine = words[0];
    
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + " " + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width < maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    
    fontSize -= 2;
  } while (lines.length * (fontSize * 1.5) > canvas.height * 0.6 && fontSize > 30);

  // Draw text
  ctx.font = `bold ${fontSize}px Garamond`;
  const lineHeight = fontSize * 1.5;
  const totalTextHeight = lines.length * lineHeight;
  const startY = (canvas.height - totalTextHeight) / 2;

  lines.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, startY + (i * lineHeight));
  });

  // Draw metadata
  ctx.font = "400 24px Inter"; // Reduced from 32px
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  const metadata = `${songTitle} - ${artist}`;
  ctx.fillText(metadata, canvas.width - 30, canvas.height - 30);

  return canvas.toDataURL("image/png");
};