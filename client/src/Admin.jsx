import React, { useState, useRef, useEffect } from 'react'
import io from 'socket.io-client'

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'

export default function Admin() {
  const [session, setSession] = useState(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const videoRef = useRef()
  const pcRef = useRef()
  const socketRef = useRef()
  const localStreamRef = useRef()

  useEffect(() => {
    socketRef.current = io(SERVER)
    return () => socketRef.current.disconnect()
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(session.userurl)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000) // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks()
      audioTracks.forEach(track => {
        track.enabled = !track.enabled
      })
      setIsAudioMuted(!isAudioMuted)
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks()
      videoTracks.forEach(track => {
        track.enabled = !track.enabled
      })
      setIsVideoOff(!isVideoOff)
    }
  }

  const startSession = async () => {
    try {
      setIsStreaming(true)
      const res = await fetch(`${SERVER}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl: window.location.origin })
      })

      const data = await res.json()
      setSession(data.session)
      startStream(data.session.unique_id)
    } catch (error) {
      console.error('Failed to start session:', error)
      setIsStreaming(false)
    }
  }

  const startStream = async (roomId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      localStreamRef.current = stream
      videoRef.current.srcObject = stream

      const pc = new RTCPeerConnection()
      pcRef.current = pc

      stream.getTracks().forEach(t => pc.addTrack(t, stream))

      pc.onicecandidate = e => {
        if (e.candidate) socketRef.current.emit('ice-candidate', { roomId, candidate: e.candidate })
      }

      socketRef.current.emit('join-room', roomId, 'admin')

      socketRef.current.on("student-ready", async () => {
        console.log("Student connected. Sending offer...")

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        socketRef.current.emit("offer", { roomId, offer })
      })

      socketRef.current.on('answer', async ({ answer }) => {
        await pc.setRemoteDescription(answer)
      })

      socketRef.current.on('ice-candidate', async ({ candidate }) => {
        await pc.addIceCandidate(candidate)
      })
    } catch (error) {
      console.error('Failed to start stream:', error)
      setIsStreaming(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 text-lg">Start and manage your streaming sessions</p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {!session ? (
            /* Start Session Card */
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
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  isStreaming 
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
          ) : (
            /* Active Session */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Video Stream */}
              <div className="lg:col-span-2">
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 overflow-hidden">
                  <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="3"/>
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
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
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

              {/* Session Info */}
              <div className="space-y-6">
                {/* Session Details Card */}
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
                          className={`p-2 rounded-lg transition-all duration-300 ${
                            isCopied 
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
                      className="block w-full px-4 py-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors text-center font-medium flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open Student View
                    </a>
                  </div>
                </div>

                {/* Stream Controls */}
                <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6">
                  <h3 className="text-lg font-semibold mb-4">Stream Controls</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Microphone Button */}
                    <button 
                      onClick={toggleAudio}
                      className={`p-4 rounded-xl transition-all duration-200 border ${
                        isAudioMuted 
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
                      className={`p-4 rounded-xl transition-all duration-200 border ${
                        isVideoOff 
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
                  </div>
                </div>

                {/* Status Card */}
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
                          <circle cx="10" cy="10" r="3"/>
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}