import JSZip from "jszip";
import { saveAs } from "file-saver";
import { ExtractedIconResult } from "./gemini";

export interface ProcessedIcon extends ExtractedIconResult {
  dataUrl: string;
}

function hexToRgb(hex: string) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
}

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number) {
  return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
}

export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      resolve(img);
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = reject;
    img.src = objectUrl;
  });
}

export async function processAndCropIcons(
  file: File,
  boxes: ExtractedIconResult[]
): Promise<ProcessedIcon[]> {
  const img = await loadImage(file);
  const results: ProcessedIcon[] = [];

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) throw new Error("Canvas 2d context not supported");

  for (let item of boxes) {
    const [ymin, xmin, ymax, xmax] = item.box;

    const pxYmin = Math.floor((ymin / 1000) * img.naturalHeight);
    const pxXmin = Math.floor((xmin / 1000) * img.naturalWidth);
    const pxYmax = Math.ceil((ymax / 1000) * img.naturalHeight);
    const pxXmax = Math.ceil((xmax / 1000) * img.naturalWidth);

    const cropWidth = pxXmax - pxXmin;
    const cropHeight = pxYmax - pxYmin;

    if (cropWidth > 0 && cropHeight > 0) {
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, pxXmin, pxYmin, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      const imageData = ctx.getImageData(0, 0, cropWidth, cropHeight);
      const data = imageData.data;

      const bgColor = hexToRgb(item.bg_color);
      const iconColor = hexToRgb(item.icon_color);
      const textColor = item.has_text ? hexToRgb(item.text_color) : null;
      
      const tolerance = 40; // generous tolerance for background/text variations and anti-aliasing

      // We'll use a simple flood-fill approach from edges to remove background safely
      const visited = new Uint8Array(cropWidth * cropHeight);
      const queue: number[] = [];

      // Add border pixels that match background color to the queue
      for (let y = 0; y < cropHeight; y++) {
        for (let x = 0; x < cropWidth; x++) {
          if (x === 0 || x === cropWidth - 1 || y === 0 || y === cropHeight - 1) {
            const i = (y * cropWidth + x) * 4;
            if (colorDistance(data[i], data[i+1], data[i+2], bgColor.r, bgColor.g, bgColor.b) < tolerance) {
              queue.push(x, y);
              visited[y * cropWidth + x] = 1;
            }
          }
        }
      }

      let tail = 0;
      while (tail < queue.length) {
        const x = queue[tail++];
        const y = queue[tail++];
        
        // Make transparent
        const i = (y * cropWidth + x) * 4;
        data[i + 3] = 0; 
        
        // Check 4 neighbors
        const neighbors = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        for (let [dx, dy] of neighbors) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < cropWidth && ny >= 0 && ny < cropHeight) {
            const nIdx = ny * cropWidth + nx;
            if (!visited[nIdx]) {
              const ni = nIdx * 4;
              if (colorDistance(data[ni], data[ni+1], data[ni+2], bgColor.r, bgColor.g, bgColor.b) < tolerance) {
                visited[nIdx] = 1;
                queue.push(nx, ny);
              }
            }
          }
        }
      }

      // Process Text removal (inpainting with icon_color)
      if (item.has_text && textColor) {
        for (let i = 0; i < data.length; i += 4) {
          // If pixel is not transparent, check if it's text
          if (data[i + 3] > 0) {
            if (colorDistance(data[i], data[i+1], data[i+2], textColor.r, textColor.g, textColor.b) < tolerance) {
              data[i] = iconColor.r;
              data[i+1] = iconColor.g;
              data[i+2] = iconColor.b;
              // Make fully opaque if we are healing it
              data[i+3] = 255;
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      results.push({
        ...item,
        dataUrl: canvas.toDataURL("image/png"),
      });
    }
  }

  return results;
}

export async function downloadAllIconsAsPNG(icons: ProcessedIcon[]) {
  const zip = new JSZip();
  const folder = zip.folder("icons_png");

  if (!folder) return;

  icons.forEach((icon) => {
    const base64Data = icon.dataUrl.split(",")[1];
    let filename = icon.name;
    if (!filename.endsWith(".png")) {
        filename += ".png";
    }
    folder.file(filename, base64Data, { base64: true });
  });

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "extracted_icons_png.zip");
}
