import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import jwt from 'jsonwebtoken';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Simple in-memory cache for questions
const questionsCache = new Map();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      console.error(error);
      res.status(403).json({ message: 'Invalid or expired token' });
    }
};

const cleanJsonResponse = (text) => {
  try {
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}') + 1;
    
    if (startIndex === -1 || endIndex === 0) {
      throw new Error('No JSON object found in response');
    }
    
    const jsonPart = text.slice(startIndex, endIndex);
    return JSON.parse(jsonPart);
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${error.message}`);
  }
};

router.post('/evaluate', authenticateToken, async (req, res) => {
  try {
    const { position, experienceLevel, topicsOfInterest, preferredQuestions, answers } = req.body;
    const userId = req.user._id;
    
    // If no answers provided, generate questions
    if (!answers) {
      const generatePrompt = `You are a technical quiz generator. Generate a quiz based on these parameters:
      Position: ${position}
      Experience Level: ${experienceLevel} years
      Topics: ${topicsOfInterest || 'general technical knowledge'}
      Number of questions: ${preferredQuestions || 5}

      IMPORTANT: Respond with ONLY a valid JSON object. No explanations or other text.
      The response must strictly follow this format:
      {
        "questions": [
          {
            "id": "q1",
            "type": "mcq",
            "question": "Question text here?",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correctAnswer": "Correct option here",
            "difficulty": "medium",
            "topic": "topic name"
          }
        ]
      }`;

      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(generatePrompt);
      const responseText = result.response.text();
      
      const parsedResponse = cleanJsonResponse(responseText);
      
      if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
        throw new Error('Invalid question format received from AI');
      }

      // Generate a unique quiz ID
      const quizId = Date.now().toString();
      
      // Store the complete questions in cache with user ID and quiz ID
      const cacheKey = `${userId}-${quizId}`;
      questionsCache.set(cacheKey, parsedResponse.questions);

      // Set a timeout to clean up the cache after 1 hour
      setTimeout(() => {
        questionsCache.delete(cacheKey);
      }, 3600000); // 1 hour in milliseconds

      // Create a client-safe version of questions (without correct answers)
      const clientQuestions = parsedResponse.questions.map(({ correctAnswer, ...rest }) => rest);
      
      return res.json({ 
        questions: clientQuestions,
        quizId: quizId // Send the quiz ID back to the client
      });
    }
    
    // If answers provided, evaluate the quiz
    const { quizId } = req.body;
    const cacheKey = `${userId}-${quizId}`;
    const questions = questionsCache.get(cacheKey);
    
    // Validate input
    if (!answers || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: 'Invalid quiz submission format or quiz expired' });
    }

    console.log('Evaluating quiz:', {
      answersReceived: answers,
      questionsCount: questions.length
    });
    
    // Calculate score and analyze responses
    let correctCount = 0;
    const topicPerformance = {};
    const questionResults = questions.map(question => {
      const userAnswer = answers[question.id];
      const correctAnswer = question.correctAnswer;
      
      const isCorrect = userAnswer === correctAnswer;
      if (isCorrect) {
        correctCount++;
      }
      
      const topic = question.topic || 'General';
      if (!topicPerformance[topic]) {
        topicPerformance[topic] = { correct: 0, total: 0 };
      }
      topicPerformance[topic].total++;
      if (isCorrect) {
        topicPerformance[topic].correct++;
      }
  
      return {
        questionId: question.id,
        question: question.question,
        correct: isCorrect,
        userAnswer: userAnswer,
        correctAnswer: correctAnswer,
        topic: topic,
        options: question.options // Include options for context
      };
    });
  

    const actualScore = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

    // Determine strong and weak areas
    const strongAreas = [];
    const improvementAreas = [];
    Object.entries(topicPerformance).forEach(([topic, performance]) => {
      const topicScore = (performance.correct / performance.total) * 100;
      if (topicScore >= 70) {
        strongAreas.push(topic);
      } else {
        improvementAreas.push(topic);
      }
    });

    if (strongAreas.length === 0) strongAreas.push("General Understanding");
    if (improvementAreas.length === 0) improvementAreas.push("Overall Concepts");

    console.log('Evaluation summary:', {
      score: actualScore,
      correctCount,
      totalQuestions: questions.length,
      strongAreas,
      improvementAreas
    });

    const evaluationPrompt = `You are a technical quiz evaluator for a ${position} position. 
    The candidate has ${experienceLevel} years of experience.
    
    Question Results: ${JSON.stringify(questionResults)}
    Score: ${actualScore}%
    Strong Areas: ${JSON.stringify(strongAreas)}
    Areas Needing Improvement: ${JSON.stringify(improvementAreas)}

    Generate a detailed evaluation following this EXACT JSON structure:
    {
      "overallScore": ${actualScore},
      "correctAnswers": ${correctCount},
      "totalQuestions": ${questions.length},
      "wrongAnswers": ${questions.length - correctCount},
      "strongAreas": ["Must list at least 2-3 specific strong areas"],
      "improvementAreas": ["Must list at least 2-3 specific areas to improve"],
      "recommendations": ["Must provide at least 3 specific learning resources or action items"],
      "detailedAnalysis": "Must provide 2-3 sentences analyzing the performance",
      "questionAnalysis": [
        {
          "questionId": "string",
          "feedback": "Must provide specific feedback for each question"
        }
      ]
    }`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(evaluationPrompt);
    const responseText = result.response.text();
    
    let evaluation = cleanJsonResponse(responseText);

    // Fallback values
    const fallbackEvaluation = {
      overallScore: actualScore,
      correctAnswers: correctCount,
      totalQuestions: questions.length,
      wrongAnswers: questions.length - correctCount,
      strongAreas: strongAreas.length > 0 ? strongAreas : ["General Technical Knowledge"],
      improvementAreas: improvementAreas.length > 0 ? improvementAreas : ["Core Concepts"],
      recommendations: [
        "Review fundamental concepts in your field",
        "Practice with hands-on projects",
        "Study industry best practices"
      ],
      detailedAnalysis: `Achieved a score of ${actualScore}% demonstrating ${actualScore >= 70 ? 'good' : 'developing'} understanding of the subject matter.`,
      questionAnalysis: questionResults.map(q => ({
        questionId: q.questionId,
        feedback: q.correct ? 
          "Correct answer demonstrates good understanding of this concept." :
          "Review this topic area to strengthen your understanding."
      }))
    };

    // Merge AI response with fallback values
    evaluation = {
      ...evaluation,
      questionResults: questionResults.map(q => ({
        questionId: q.questionId,
        question: q.question,
        userAnswer: q.userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect: q.correct,
        options: q.options,
        feedback: q.correct ? 
          "Correct! Well done." :
          `Incorrect. The correct answer was: ${q.correctAnswer}`
      }))
    };

    // Clean up the cache after evaluation
    questionsCache.delete(cacheKey);

    console.log('Sending evaluation response:', {
      score: evaluation.overallScore,
      correctAnswers: evaluation.correctAnswers,
      totalQuestions: evaluation.totalQuestions
    });

    res.json(evaluation);
  } catch (error) {
    console.error('Error in quiz evaluation:', error);
    res.status(500).json({ 
      error: 'Failed to process quiz request', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

export default router;