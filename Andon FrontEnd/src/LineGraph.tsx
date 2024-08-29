import React, { useRef, useEffect } from 'react';

interface DataPoint {
  x: number;
  y: number;
}

interface LineGraphProps {
  data: DataPoint[];
}

const LineGraph: React.FC<LineGraphProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth * 0.95;
        canvas.height = parent.clientHeight * 0.95;
      }
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid lines in x-axis at steps of 1
      ctx.beginPath();
      ctx.strokeStyle = '#454545'; // Set grid color
      ctx.lineWidth = 5;
      for (let i = 0; i <= data.length; i++) {
        const xPos = (i / (data.length - 1)) * canvas.width;
        ctx.moveTo(xPos, 0);
        ctx.lineTo(xPos, canvas.height);
      }
      ctx.stroke();

      // Find maximum y value
      const maxY = Math.max(...data.map(p => p.y));

      // Draw data points and fill space underneath with gradient
      ctx.beginPath();
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#d4145a');
      gradient.addColorStop(1, '#4d4d4d');
      ctx.fillStyle = gradient;
      ctx.strokeStyle = '#d4145a';
      ctx.moveTo(0, canvas.height); // Start from bottom left corner
      for (const { x, y } of data) {
        const xPos = (x / (data.length - 1)) * canvas.width;
        const yPos = canvas.height - (y / maxY) * canvas.height;
        ctx.lineTo(xPos, yPos);
      }
      ctx.lineTo(canvas.width, canvas.height); // Connect to bottom right corner
      ctx.stroke();
      ctx.fill(); // Fill the area below the line

      // Draw axes with custom color
      ctx.beginPath();
      ctx.strokeStyle = '#454545'; // Set axes color
      ctx.lineWidth = 10;
      ctx.moveTo(0, canvas.height);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.stroke();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [data]);

  return <canvas ref={canvasRef}></canvas>;
};

export default LineGraph;
