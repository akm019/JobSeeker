import React from 'react';
import { Star, CheckCircle2, XCircle, AlertCircle, LineChart } from 'lucide-react';

function AnalysisResults  ({ analysisText })  {
  // Extract values from the analysis object
  const {
    matchScore,
    keySkillsMatch = [],
    missingSkills = [],
    improvements = [],
    overallFeedback = '',
    relevantExperience = []
  } = analysisText || {};

  return (
    <div className="space-y-6">
      {/* Score Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LineChart className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold">Match Score</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">{matchScore}</span>
            <span className="text-gray-600">/100</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matching Skills */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Matching Skills</h3>
          </div>
          <ul className="space-y-2">
            {keySkillsMatch.map((skill, index) => (
              <li key={index} className="flex items-center gap-2 text-gray-700">
                <span className="w-2 h-2 bg-green-600 rounded-full" />
                {skill}
              </li>
            ))}
          </ul>
        </div>

        {/* Missing Skills */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold">Missing Skills</h3>
          </div>
          <ul className="space-y-2">
            {missingSkills.map((skill, index) => (
              <li key={index} className="flex items-center gap-2 text-gray-700">
                <span className="w-2 h-2 bg-red-600 rounded-full" />
                {skill}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Relevant Experience */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Relevant Experience</h3>
        </div>
        <ul className="space-y-2">
          {relevantExperience.map((experience, index) => (
            <li key={index} className="flex items-start gap-2 text-gray-700">
              <span className="mt-1.5 w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
              <span>{experience}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Improvements */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold">Suggested Improvements</h3>
        </div>
        <ul className="space-y-2">
          {improvements.map((improvement, index) => (
            <li key={index} className="flex items-start gap-2 text-gray-700">
              <span className="mt-1.5 w-2 h-2 bg-yellow-600 rounded-full flex-shrink-0" />
              <span>{improvement}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Overall Assessment */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Overall Feedback</h3>
        </div>
        <div className="space-y-2 text-gray-700">
          <p>{overallFeedback}</p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;