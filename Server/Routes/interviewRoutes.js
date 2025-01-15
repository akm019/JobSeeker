import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Create analysis prompt
const createAnalysisPrompt = (question, transcript, jobRole, experienceLevel) => `
You are an expert technical interviewer evaluating a candidate for a ${jobRole} position with ${experienceLevel} years of experience.

Question: ${question}
Candidate's Response: ${transcript}

Provide a detailed evaluation in JSON format:
{
  "score": <0-100>,
  "analysis": {
    "technicalKnowledge": {
      "score": <0-100>,
      "strengths": [],
      "weaknesses": []
    },
    "communication": {
      "score": <0-100>,
      "feedback": ""
    }
  },
  "feedback": "",
  "followUpQuestions": []
}`;

// Analyze interview response
router.post('/analyze', upload.single('video'), async (req, res) => {
  try {
    const { question, transcript, jobRole, experienceLevel } = req.body;

    if (!transcript || !question) {
      return res.status(400).json({ error: 'Missing required data' });
    }

    // Analyze response using Gemini AI
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = createAnalysisPrompt(question, transcript, jobRole, experienceLevel);
    
    const result = await model.generateContent(prompt);
    const analysis = JSON.parse(result.response.text());

    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing response:', error);
    res.status(500).json({ error: 'Analysis failed: ' + error.message });
  }
});

// Generate interview questions
router.post('/question', async (req, res) => {
  try {
    const { jobRole, experienceLevel, previousQuestions = [] } = req.body;
    
    const prompt = `
    Generate a technical interview question for a ${jobRole} position with ${experienceLevel} years of experience.
    Previous questions: ${JSON.stringify(previousQuestions)}
    
    Return in JSON format:
    {
      "question": "the interview question",
      "context": "any additional context or hints",
      "expectedTopics": ["key topics to cover"],
      "evaluationCriteria": ["specific points to evaluate"]
    }`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const questionData = JSON.parse(result.response.text());
    
    res.json(questionData);
  } catch (error) {
    console.error('Error generating question:', error);
    res.status(500).json({ error: 'Failed to generate question' });
  }
});

// Generate final results
router.post('/final-results', async (req, res) => {
  try {
    const { responses } = req.body;
    
    const summaryPrompt = `
    Analyze these interview responses and provide a final assessment:
    ${JSON.stringify(responses)}
    
    Provide evaluation in JSON format:
    {
      "overallScore": <0-100>,
      "summary": "",
      "strengths": [],
      "improvementAreas": [],
      "recommendation": "hire/consider/do not hire",
      "feedback": ""
    }`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(summaryPrompt);
    const finalResults = JSON.parse(result.response.text());

    res.json(finalResults);
  } catch (error) {
    console.error('Error generating final results:', error);
    res.status(500).json({ error: 'Failed to generate results' });
  }
});

export default router;