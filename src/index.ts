import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { compareTexts, extractKeywords, compareVariables } from './utils/textUtils';
import { transcribeAudio } from './services/sttService';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac', 'audio/webm', 'audio/flac', 'audio/mpeg', 'audio/mp4'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio files are allowed.'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
});

// Routes
app.post('/api/compare', upload.single('audio'), async (req, res) => {
  try {
    const { originalText, template, inputType, transcribedText } = req.body;

    if (!originalText || !template) {
      return res.status(400).json({ error: 'Missing required fields: originalText and template' });
    }

    let transcribedTextToUse: string;

    if (inputType === 'audio') {
      if (!req.file) {
        return res.status(400).json({ error: 'No audio file uploaded' });
      }

      try {
        transcribedTextToUse = await transcribeAudio(req.file.path);
        
        // Clean up uploaded file
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      } catch (error) {
        console.error('Error processing audio:', error);
        // Clean up file on error
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
        return res.status(500).json({ error: 'Error processing audio file' });
      }
    } else {
      if (!transcribedText) {
        return res.status(400).json({ error: 'No transcribed text provided' });
      }
      transcribedTextToUse = transcribedText;
    }

    // Process comparison
    const templateKeywords = extractKeywords(template);
    const transcribedKeywords = extractKeywords(transcribedTextToUse);
    const similarity = compareTexts(originalText, transcribedTextToUse);
    const variableComparison = await compareVariables(template, originalText, transcribedTextToUse);

    res.json({
      transcribedText: transcribedTextToUse,
      templateKeywords,
      transcribedKeywords,
      similarity,
      variableComparison,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
