import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronRight, Brain, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
const AIQuiz = () => {
  const [quizState, setQuizState] = useState('setup');
  const [formData, setFormData] = useState({
    position: '',
    experienceLevel: '',
    topicsOfInterest: '',
    preferredQuestions: 5
  });
  
  const token = localStorage.getItem('token');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizId, setQuizId] = useState(null);

  const startQuiz = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch('https://jobseeker1-6lnb.onrender.com/api/quiz/evaluate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }
  
      const data = await response.json();
      
      if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error('Invalid quiz data received');
      }
  
      setQuestions(data.questions);
      setQuizId(data.quizId); // Store the quiz ID
      setCurrentQuestionIndex(0);
      setAnswers({});
      setQuizState('quiz');
    } catch (error) {
      console.error('Error starting quiz:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  

  // const renderQuestion = () => {
  //   // Add safety checks
  //   if (!Array.isArray(questions) || questions.length === 0) {
  //   setQuizState('setup');
  //   setError('No questions available. Please try again.');
  //   return null;
  //   }
    
    
  //   const question = questions[currentQuestionIndex];
  //   if (!question) {
  //     setQuizState('setup');
  //     setError('Invalid question index. Please try again.');
  //     return null;
  //   }
  // }
  // Modify the submitQuiz function:
  const submitQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/quiz/evaluate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          answers,
          questions,
          quizId, // Include the quiz ID
          position: formData.position,
          experienceLevel: formData.experienceLevel
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to evaluate quiz');
      }
  
      const results = await response.json();
      setResults(results);
      setQuizState('results');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const renderSetupForm = () => (
    <motion.div 
      {...fadeInUp}
      transition={{ duration: 0.5 }}
      className="relative bg-[#0A0F1C] rounded-2xl shadow-2xl max-w-md mx-auto p-8 space-y-6 border border-indigo-500/10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-purple-600/5" />
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Brain className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Quiz Setup</h2>
        </div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20 mb-6"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-indigo-200">Position You're Preparing For</label>
            <input
              className="w-full px-4 py-3 bg-[#0F1629] border border-indigo-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-white placeholder-indigo-300/30 transition-all duration-200"
              value={formData.position}
              onChange={(e) => setFormData({...formData, position: e.target.value})}
              placeholder="e.g., Frontend Developer, Data Scientist"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-indigo-200">Experience Level (years)</label>
            <input
              className="w-full px-4 py-3 bg-[#0F1629] border border-indigo-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-white transition-all duration-200"
              type="number"
              value={formData.experienceLevel}
              onChange={(e) => setFormData({...formData, experienceLevel: e.target.value})}
              min="0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-indigo-200">Specific Topics of Interest</label>
            <textarea
              className="w-full px-4 py-3 bg-[#0F1629] border border-indigo-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-white placeholder-indigo-300/30 transition-all duration-200"
              value={formData.topicsOfInterest}
              onChange={(e) => setFormData({...formData, topicsOfInterest: e.target.value})}
              placeholder="e.g., React, Node.js, Data Structures"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-indigo-200">Number of Questions</label>
            <input
              className="w-full px-4 py-3 bg-[#0F1629] border border-indigo-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-white transition-all duration-200"
              type="number"
              value={formData.preferredQuestions}
              onChange={(e) => setFormData({...formData, preferredQuestions: parseInt(e.target.value)})}
              min="5"
              max="20"
            />
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full mt-8 py-3 px-4 rounded-xl text-white font-medium transition-all duration-200 ${
            loading || !formData.position || !formData.experienceLevel
              ? 'bg-indigo-900/50 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg shadow-indigo-500/25'
          }`}
          onClick={startQuiz}
          disabled={loading || !formData.position || !formData.experienceLevel}
        >
          <span className="flex items-center justify-center gap-2">
            {loading ? (
              'Generating Quiz...'
            ) : (
              <>
                Start Quiz
                <Sparkles className="w-4 h-4" />
              </>
            )}
          </span>
        </motion.button>
      </div>
    </motion.div>
  );


  
  const renderQuestion = () => {
    // Add safety checks
    if (!Array.isArray(questions) || questions.length === 0) {
    setQuizState('setup');
    setError('No questions available. Please try again.');
    return null;
    }
    
    
    const question = questions[currentQuestionIndex];
    if (!question) {
      setQuizState('setup');
      setError('Invalid question index. Please try again.');
      return null;
    }
    
    return (
      <div className="bg-white rounded-lg shadow-md max-w-2xl mx-auto p-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
    
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <h3 className="text-xl font-bold mb-4">{question.question}</h3>
          
          {question.type === 'mcq' ? (
            <div className="space-y-3">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  className={`w-full py-2 px-4 rounded-md text-left ${
                    answers[question.id] === option
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleAnswerSubmit(question.id, option)}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your answer here..."
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerSubmit(question.id, e.target.value)}
              rows={6}
            />
          )}
        </div>
    
        <div className="flex justify-between">
          <button
            className={`px-4 py-2 rounded-md border border-gray-300 ${
              currentQuestionIndex === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </button>
          
          {currentQuestionIndex === questions.length - 1 ? (
            <button
              className={`px-4 py-2 rounded-md text-white ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
              onClick={submitQuiz}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button 
              className={`px-4 py-2 rounded-md text-white flex items-center ${
                !answers[question.id]
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              disabled={!answers[question.id]}
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
    };
    
    const renderResults = () => (
    <div className="bg-white rounded-lg shadow-md max-w-2xl mx-auto p-6">
    <h2 className="text-2xl font-bold mb-6">Quiz Results</h2>
    
    
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
    
      {results && (
        <>
          <div className="mb-6">
            <div className="text-4xl font-bold text-center mb-2">
              {results.overallScore}%
            </div>
            <div className="text-center text-gray-600">
              Overall Score
            </div>
          </div>
    
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-2">Strong Areas</h3>
              <ul className="space-y-2">
                {results.strongAreas.map((area, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
    
            <div>
              <h3 className="font-bold text-lg mb-2">Areas for Improvement</h3>
              <ul className="space-y-2">
                {results.improvementAreas.map((area, idx) => (
                  <li key={idx} className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
    
            <div>
              <h3 className="font-bold text-lg mb-2">Recommended Resources</h3>
              <ul className="list-disc pl-5 space-y-2">
                {results.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    
      <button 
        className="w-full mt-6 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        onClick={() => {
          setQuizState('setup');
          setAnswers({});
          setQuestions([]);
          setResults(null);
          setError(null);
        }}
      >
        Start New Quiz
      </button>
    </div>
    );
    
    const renderContent = () => {
    switch (quizState) {
    case 'setup':
    return renderSetupForm();
    case 'quiz':
    return renderQuestion();
    case 'results':
    return renderResults();
    default:
    return null;
    }
    };
  // ... rest of the component remains the same but with updated styles to match the new theme ...

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-[#060818] bg-gradient-to-b from-indigo-950 to-[#060818] py-8 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDk5LDEwMiwyNDEsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
      <div className="relative">
        {renderContent()}
      </div>
    </div>
  );
};

export default AIQuiz;