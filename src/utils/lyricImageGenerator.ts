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

  // Calculate font size and line spacing
  const fontSize = 48;
  const lineHeight = fontSize * 1.8;
  ctx.font = `${fontSize}px Garamond`;

  // Split text into paragraphs and then into lines that fit the canvas width
  const paragraphs = customLyric.split('\n');
  const maxWidth = canvas.width * 0.8;
  const allLines: string[] = [];

  paragraphs.forEach((paragraph, pIndex) => {
    const words = paragraph.split(" ");
    let currentLine = words[0] || "";

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + " " + word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width < maxWidth) {
        currentLine = testLine;
      } else {
        allLines.push(currentLine);
        currentLine = word;
      }
    }
    allLines.push(currentLine);
    
    // Add an empty line between paragraphs, except for the last paragraph
    if (pIndex < paragraphs.length - 1) {
      allLines.push("");
    }
  });

  // Draw text centered both vertically and horizontally
  const totalTextHeight = allLines.length * lineHeight;
  const startY = (canvas.height - totalTextHeight) / 2;

  allLines.forEach((line, i) => {
    ctx.fillText(
      line,
      canvas.width / 2,
      startY + (i * lineHeight) + (lineHeight / 2)
    );
  });

  // Draw metadata
  ctx.font = "24px Inter";
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  const metadata = `${songTitle} - ${artist}`;
  ctx.fillText(metadata, canvas.width - 30, canvas.height - 30);

  return canvas.toDataURL("image/png");
};