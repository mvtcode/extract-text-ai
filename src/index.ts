import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
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
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Routes
app.post('/api/compare', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const originalText = req.body.originalText;
    const template = req.body.template;

    // Transcribe audio to text
    const transcribedText = await transcribeAudio(req.file.path);

    // Extract keywords from template
    const templateKeywords = extractKeywords(template);
    const transcribedKeywords = extractKeywords(transcribedText);

    // Compare texts
    const similarity = compareTexts(originalText, transcribedText);

    // Compare variables using AI
    const variableComparison = await compareVariables(template, originalText, transcribedText);

    res.json({
      transcribedText,
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
