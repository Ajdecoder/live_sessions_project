
import React from 'react';

export default function StreamStatusCard({ isAudioMuted, isVideoOff }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Stream Status
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Connection</span>
          <span className="text-green-400 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="3" />
            </svg>
            Live
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Audio</span>
          <span className={isAudioMuted ? "text-red-400" : "text-green-400"}>
            {isAudioMuted ? "Muted" : "Active"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Video</span>
          <span className={isVideoOff ? "text-red-400" : "text-green-400"}>
            {isVideoOff ? "Disabled" : "Active"}
          </span>
        </div>
      </div>
    </div>
  );
}