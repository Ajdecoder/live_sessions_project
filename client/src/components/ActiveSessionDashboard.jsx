import React, { useEffect } from 'react';
import SessionDetailsCard from './SessionDetailsCard';
import StreamControls from './StreamControls';
import StreamStatusCard from './StreamStatusCard';

export default function ActiveSessionDashboard({
    session,
    isCopied,
    handleCopy,
    videoRef,
    isVideoOff,
    isAudioMuted,
    isScreenSharing,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    localStream
}) {


    useEffect(() => {
        if (videoRef?.current && localStream) {
            videoRef.current.srcObject = localStream;
            videoRef.current.play?.().catch(() => { });
        }
    }, [localStream]);



    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Stream */}
            <div className="lg:col-span-2">
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 overflow-hidden">
                    <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center">
                            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <circle cx="10" cy="10" r="3" />
                            </svg>
                            Live Stream
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Live</span>
                        </div>
                    </div>
                    <div className="aspect-video bg-black relative">
                        {/* Main Video */}
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full rounded-xl"
                        />
                        {isVideoOff && (
                            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                                <svg className="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 00-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M2.909 5.909A2.25 2.25 0 004.5 4.5h9A2.25 2.25 0 0115.75 6.75v9a2.25 2.25 0 01-1.409 2.091" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Session Info & Controls */}
            <div className="space-y-6">
                <SessionDetailsCard
                    session={session}
                    isCopied={isCopied}
                    handleCopy={handleCopy}
                />
                <StreamControls
                    isAudioMuted={isAudioMuted}
                    isVideoOff={isVideoOff}
                    isScreenSharing={isScreenSharing}
                    toggleAudio={toggleAudio}
                    toggleVideo={toggleVideo}
                    startScreenShare={startScreenShare}
                    stopScreenShare={stopScreenShare}
                />
                <StreamStatusCard
                    isAudioMuted={isAudioMuted}
                    isVideoOff={isVideoOff}
                />
            </div>
        </div>
    );
}