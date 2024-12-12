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

  // Set canvas dimensions
  canvas.width = 1080;
  canvas.height = 1080;

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
  let fontSize = 120; // Start with large font size
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
  } while (lines.length * (fontSize * 1.5) > canvas.height * 0.6 && fontSize > 40);

  // Draw text
  ctx.font = `bold ${fontSize}px Garamond`;
  const lineHeight = fontSize * 1.5;
  const totalTextHeight = lines.length * lineHeight;
  const startY = (canvas.height - totalTextHeight) / 2;

  lines.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, startY + (i * lineHeight));
  });

  // Draw metadata
  ctx.font = "400 32px Inter";
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  const metadata = `${songTitle} - ${artist}`;
  ctx.fillText(metadata, canvas.width - 40, canvas.height - 40);

  return canvas.toDataURL("image/png");
};