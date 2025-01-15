import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';
import { PDFExtract } from 'pdf.js-extract';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const pdfExtract = new PDFExtract();

// Configure multer for PDF uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Helper function to extract text from PDF
const extractTextFromPDF = async (pdfBuffer) => {
  try {
    const data = await pdfExtract.extractBuffer(pdfBuffer);
    return data.pages.map(page => page.content.map(item => item.str).join(' ')).join('\n');
  } catch (error) {
    throw new Error('Failed to extract text from PDF');
  }
};

// Helper function to create analysis prompt
const createAnalysisPrompt = (resumeText, jobDescription) => `
You are a professional resume analyzer. Analyze the following resume against the job description provided.
Consider skills match, experience relevance, and potential areas for improvement.

Resume:
${resumeText}

Job Description:
${jobDescription}

Respond with a JSON object without any markdown formatting or code blocks. The JSON should have this exact structure:
{
  "matchScore": "score out of 100",
  "keySkillsMatch": ["matching skills found in both resume and job description"],
  "missingSkills": ["important skills from job description not found in resume"],
  "relevantExperience": ["relevant experience highlights"],
  "improvements": ["suggested improvements for resume"],
  "overallFeedback": "detailed feedback about the match and suggestions"
}
Important: Provide only the JSON object without any additional text, markdown formatting, or code blocks.`;

// Helper function to extract JSON from AI response
const extractJSONFromResponse = (text) => {
  try {
    // Remove any markdown formatting or code blocks if present
    const jsonString = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error('Failed to parse AI response');
  }
};

// Route to analyze resume
router.post('/analyze', upload.single('resume'), async (req, res) => {
  try {
    // Validate request
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file provided' });
    }
    if (!req.body.jobDescription) {
      return res.status(400).json({ error: 'No job description provided' });
    }

    // Extract text from PDF
    const resumeText = await extractTextFromPDF(req.file.buffer);

    // Generate analysis using Gemini AI
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = createAnalysisPrompt(resumeText, req.body.jobDescription);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Parse and validate the AI response
    const analysis = extractJSONFromResponse(response.text());
    
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing resume:', error);
    
    // Send appropriate error response
    if (error.message === 'Only PDF files are allowed') {
      res.status(400).json({ error: error.message });
    } else if (error.message === 'Failed to extract text from PDF') {
      res.status(422).json({ error: 'Unable to process PDF file' });
    } else if (error.message === 'Failed to parse AI response') {
      res.status(500).json({ error: 'Failed to process AI response' });
    } else {
      res.status(500).json({ error: 'Failed to analyze resume' });
    }
  }
});

export default router;