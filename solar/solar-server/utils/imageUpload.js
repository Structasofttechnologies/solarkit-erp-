import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const saveBase64Image = (base64String, folderPath = 'uploads/images') => {
  if (!base64String || !base64String.startsWith('data:image')) {
    return base64String; // Return as-is if it's not a base64 image (maybe already a URL)
  }

  try {
    // Extract format and base64 data
    const matches = base64String.match(/^data:image\/([a-zA-Z0-9+-]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64String;
    }

    let ext = matches[1];
    // Some formats like svg+xml need to be handled
    if (ext.includes('+xml')) {
      ext = ext.split('+')[0];
    }
    // Set a default to jpg/png if preferred, but keeping original format is better.
    // The user requested .png and .jpg.
    // Let's just use the extension from the mime type, or fallback to png.
    if (ext === 'jpeg') ext = 'jpg';

    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;
    
    // Create absolute path to save
    const uploadDir = path.join(__dirname, '..', folderPath);
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    // Return the relative URL to access the image
    return `/${folderPath}/${fileName}`;
  } catch (error) {
    console.error('Error saving base64 image:', error);
    return base64String;
  }
};
