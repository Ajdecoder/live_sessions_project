import React from 'react';

export default function SessionDetailsCard({ session, isCopied, handleCopy }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Session Details
      </h3>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-slate-400 block mb-1">Session URL</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={session.userurl}
              readOnly
              className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300"
            />
            <button
              onClick={handleCopy}
              className={`p-2 rounded-lg transition-all duration-300 ${isCopied
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              title={isCopied ? "Copied!" : "Copy to clipboard"}
            >
              {isCopied ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
          {isCopied && (
            <div className="text-green-400 text-xs mt-1 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied to clipboard!
            </div>
          )}
        </div>

        <a
          href={session.userurl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full px-4 py-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors text-center font-medium flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open Student View
        </a>
      </div>
    </div>
  );
}