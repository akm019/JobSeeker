import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';
import { PDFExtract } from 'pdf.js-extract';

const router = express.Router();

// Enhanced error logging
const logError = (error, context) => {
  console.error(`[${context}] Error:`, {
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: new Date().toISOString()
  });
};

// Validate environment variables on startup
if (!process.env.GEMINI_API_KEY) {
  console.error('CRITICAL: GEMINI_API_KEY environment variable is not set');
}

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
    console.log('Starting PDF text extraction, buffer size:', pdfBuffer.length);
    const data = await pdfExtract.extractBuffer(pdfBuffer);
    const extractedText = data.pages.map(page => 
      page.content.map(item => item.str).join(' ')
    ).join('\n');
    console.log('PDF extraction successful, text length:', extractedText.length);
    return extractedText;
  } catch (error) {
    logError(error, 'PDF_EXTRACTION');
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
    console.log('Raw AI response:', text.substring(0, 200) + '...');
    // Remove any markdown formatting or code blocks if present
    const jsonString = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(jsonString);
    console.log('Successfully parsed AI response');
    return parsed;
  } catch (error) {
    logError(error, 'JSON_PARSING');
    console.log('Failed to parse text:', text);
    throw new Error('Failed to parse AI response');
  }
};
// Add this to your main server file or as a separate route
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      platform: process.platform,
      memory: process.memoryUsage()
    }
  });
});

// Test the Gemini AI connection
router.get('/test-ai', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent('Say hello');
    const response = await result.response;
    
    res.json({
      status: 'AI connection successful',
      response: response.text()
    });
  } catch (error) {
    res.status(500).json({
      error: 'AI connection failed',
      message: error.message
    });
  }
});
// Route to analyze resume
router.post('/analyze', upload.single('resume'), async (req, res) => {
  console.log('Resume analysis request received');
  
  try {
    // Validate environment
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Validate request
    if (!req.file) {
      console.log('No file provided in request');
      return res.status(400).json({ error: 'No resume file provided' });
    }
    if (!req.body.jobDescription) {
      console.log('No job description provided');
      return res.status(400).json({ error: 'No job description provided' });
    }

    console.log('Request validation passed');
    console.log('File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.buffer.length
    });

    // Extract text from PDF
    const resumeText = await extractTextFromPDF(req.file.buffer);
    
    if (!resumeText || resumeText.trim().length === 0) {
      console.error('Extracted text is empty');
      return res.status(422).json({ error: 'Unable to extract text from PDF' });
    }

    // Generate analysis using Gemini AI
    console.log('Initializing Gemini AI model');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Updated model name
    const prompt = createAnalysisPrompt(resumeText, req.body.jobDescription);
    
    console.log('Sending request to Gemini AI');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    console.log('Received response from Gemini AI');
    
    // Parse and validate the AI response
    const analysis = extractJSONFromResponse(response.text());
    
    console.log('Analysis completed successfully');
    res.json(analysis);
    
  } catch (error) {
    logError(error, 'RESUME_ANALYSIS');
    
    // Send appropriate error response
    if (error.message === 'Only PDF files are allowed') {
      res.status(400).json({ error: error.message });
    } else if (error.message === 'Failed to extract text from PDF') {
      res.status(422).json({ error: 'Unable to process PDF file' });
    } else if (error.message === 'Failed to parse AI response') {
      res.status(500).json({ error: 'Failed to process AI response' });
    } else if (error.message.includes('API_KEY')) {
      res.status(500).json({ error: 'API configuration error' });
    } else {
      res.status(500).json({ 
        error: 'Failed to analyze resume',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

export default router;