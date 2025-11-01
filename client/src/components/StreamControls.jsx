
import React from 'react';

export default function StreamControls({
  isAudioMuted,
  isVideoOff,
  isScreenSharing,
  toggleAudio,
  toggleVideo,
  startScreenShare,
  stopScreenShare,
}) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6">
      <h3 className="text-lg font-semibold mb-4">Stream Controls</h3>
      <div className="grid grid-cols-2 gap-4">
        {/* Microphone Button */}
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-xl transition-all duration-200 border ${isAudioMuted
            ? 'bg-red-500/20 border-red-500/50 text-red-400'
            : 'bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-600/50'
            }`}
        >
          <div className="flex flex-col items-center space-y-2">
            {isAudioMuted ? (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z M6 6l12 12" />
                </svg>
                <span className="text-xs">Unmute</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span className="text-xs">Mute</span>
              </>
            )}
          </div>
        </button>

        {/* Video Button */}
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-xl transition-all duration-200 border ${isVideoOff
            ? 'bg-red-500/20 border-red-500/50 text-red-400'
            : 'bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-600/50'
            }`}
        >
          <div className="flex flex-col items-center space-y-2">
            {isVideoOff ? (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 00-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M2.909 5.909A2.25 2.25 0 004.5 4.5h9A2.25 2.25 0 0115.75 6.75v9a2.25 2.25 0 01-1.409 2.091" />
                </svg>
                <span className="text-xs">Show Video</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <span className="text-xs">Stop Video</span>
              </>
            )}
          </div>
        </button>

        {!isScreenSharing ? (
          <button onClick={startScreenShare} className="col-span-2 py-3 bg-purple-600 rounded-xl">
            Share Screen
          </button>
        ) : (
          <button onClick={stopScreenShare} className="col-span-2 py-3 bg-purple-600 rounded-xl">
            Stop Screen
          </button>
        )}
      </div>
    </div>
  );
}