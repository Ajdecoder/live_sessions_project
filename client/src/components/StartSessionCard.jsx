
import React from 'react';

export default function StartSessionCard({ isStreaming, startSession }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-8 text-center">
      <div className="w-24 h-24 mx-auto mb-6 bg-slate-700/50 rounded-full flex items-center justify-center">
        <svg className="w-12 h-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Start New Session</h2>
      <p className="text-slate-400 mb-8 max-w-md mx-auto">
        Create a new streaming session and share the link with students to begin the live stream.
      </p>

      <button
        className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${isStreaming
          ? 'bg-blue-500 cursor-not-allowed'
          : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105'
          } shadow-lg hover:shadow-blue-500/25`}
        onClick={startSession}
        disabled={isStreaming}
      >
        {isStreaming ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Starting Session...
          </span>
        ) : 'START STREAMING SESSION'}
      </button>
    </div>
  );
}