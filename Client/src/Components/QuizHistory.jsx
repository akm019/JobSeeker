import React, { useState, useEffect } from 'react';
import { Trash2, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

const QuizHistory = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchQuizHistory(currentPage);
  }, [currentPage]);

  const fetchQuizHistory = async (page) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`https://jobseeker-1-mg4e.onrender.com/api/quiz/history?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming you store token in localStorage
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quiz history');
      }

      const data = await response.json();
      setQuizzes(data.quizzes);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) {
      return;
    }

    try {
      const response = await fetch(`https://jobseeker-1-mg4e.onrender.com/api/quiz/history/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete quiz');
      }

      // Refresh the current page
      fetchQuizHistory(currentPage);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && quizzes.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Quiz History</h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {quizzes.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No quiz history found. Take a quiz to see your results here!
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <div key={quiz._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{quiz.position}</h3>
                    <p className="text-sm text-gray-500">
                      Taken on {formatDate(quiz.timestamp)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteQuiz(quiz._id)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                    title="Delete quiz"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-md">
                    <div className="text-sm font-medium text-blue-800">Score</div>
                    <div className="text-2xl font-bold text-blue-900">
                      {quiz.evaluation.overallScore}%
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-md">
                    <div className="text-sm font-medium text-green-800">Experience Level</div>
                    <div className="text-lg font-semibold text-green-900">
                      {quiz.experienceLevel} years
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Strong Areas</h4>
                    <ul className="list-disc list-inside text-gray-600">
                      {quiz.evaluation.strongAreas.map((area, idx) => (
                        <li key={idx}>{area}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Areas for Improvement</h4>
                    <ul className="list-disc list-inside text-gray-600">
                      {quiz.evaluation.improvementAreas.map((area, idx) => (
                        <li key={idx}>{area}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-full ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-full ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuizHistory;