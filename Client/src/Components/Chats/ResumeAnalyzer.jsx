import React, { useState } from 'react';
import { Upload, CheckCircle, Loader } from 'lucide-react';
import  AnalysisResults from './AnalysisResults.jsx';

function ResumeAnalyzer  ()  {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setFile(null);
      setError('Only PDF files are allowed.');
    }
  };

  const handleAnalyze = async () => {
    if (!file || !jobDescription) {
      setError('Please provide both a resume and a job description.');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis('');

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    try {
      const response = await fetch('https://jobseeker1-6lnb.onrender.com/api/resume/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed.');
      }

      const data = await response.json();
      if (!data) {
        throw new Error('No analysis data received');
      }

      setAnalysis(data);
    } catch (err) {
      console.error('Error during analysis:', err);
      setError(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className='bg-[#051140]'>
      <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-5 bg-blue-600">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Resume Analyzer</h1>
          <p className="text-blue-100 mt-1">Upload your resume and job description for analysis</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* File Upload Section */}
          <div className="border-2 border-dashed border-blue-200 rounded-xl p-8 text-center bg-blue-50 hover:bg-blue-100/50 transition-colors">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              id="resume-upload"
              className="hidden"
            />
            <label htmlFor="resume-upload" className="cursor-pointer block">
              <Upload className="mx-auto h-12 w-12 text-blue-500" />
              <p className="mt-2 text-blue-700 font-medium">Upload Resume (PDF)</p>
              <p className="text-sm text-blue-500 mt-1">Click or drag and drop</p>
            </label>
            {file && (
              <div className="mt-4 flex items-center justify-center gap-2 text-emerald-600">
                <CheckCircle className="h-5 w-5" />
                <span>{file.name}</span>
              </div>
            )}
          </div>

          {/* Job Description Section */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none"
              placeholder="Paste job description here..."
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-center p-3 bg-red-50 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!file || !jobDescription || loading}
            className={`w-full py-4 px-6 rounded-xl font-medium text-white transition-all duration-200 ${
              loading || !file || !jobDescription
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 shadow-lg hover:shadow-blue-500/25'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <Loader className="h-5 w-5 animate-spin" />
                <span>Analyzing...</span>
              </div>
            ) : (
              'Analyze Resume'
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="mt-8">
          <AnalysisResults analysisText={analysis} />
        </div>
      )}
    </div>
  </div>
  );
};

export default ResumeAnalyzer