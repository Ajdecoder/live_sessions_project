import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import io from 'socket.io-client'

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'

export default function Student() {
  const { id } = useParams()
  const videoRef = useRef()
  const socketRef = useRef()
  const pcRef = useRef()
  const [isConnected, setIsConnected] = useState(false)
  const [isVideoLoading, setIsVideoLoading] = useState(true)

  useEffect(() => {
    socketRef.current = io(SERVER)

    socketRef.current.on('connect', () => {
      setIsConnected(true)
    })

    socketRef.current.on('disconnect', () => {
      setIsConnected(false)
    })

    return () => socketRef.current.disconnect()
  }, [])

  useEffect(() => {
    if (id) join(id)
  }, [id])

  const handleVideoLoad = () => {
    setIsVideoLoading(false)
  }

  const handleVideoError = () => {
    setIsVideoLoading(false)
    console.error("Failed to load video stream")
  }

  const join = async (roomId) => {
    const pc = new RTCPeerConnection()
    pcRef.current = pc

    pc.ontrack = ev => {
      console.log("Track received");
      setIsVideoLoading(true);

      const stream = ev.streams[0];
      videoRef.current.srcObject = stream;

      setTimeout(() => {
        videoRef.current
          .play()
          .then(() => console.log("Student stream playing"))
          .catch(err => console.error("Autoplay blocked:", err));
      }, 200);
    };


    pc.onicecandidate = e => {
      if (e.candidate) socketRef.current.emit("ice-candidate", { roomId, candidate: e.candidate })
    }

    socketRef.current.emit("join-room", roomId, "student")

    // Tell admin: student joined
    socketRef.current.emit("student-ready")

    socketRef.current.on("offer", async ({ offer }) => {
      console.log("Offer received");
      await pc.setRemoteDescription(offer);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketRef.current.emit("answer", { roomId, answer });

    });


    socketRef.current.on("ice-candidate", async ({ candidate }) => {
      await pc.addIceCandidate(candidate)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Student View
          </h1>
          <p className="text-slate-400">Watching live stream from instructor</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Connection Status */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <div>
                  <h3 className="font-semibold text-lg">Session Information</h3>
                  <p className="text-slate-400 text-sm">Room ID: {id}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isConnected
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>

          {/* Video Stream */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="3" />
                </svg>
                Live Stream
              </h3>
              <div className="flex items-center space-x-4 text-sm text-slate-400">
                {isVideoLoading && (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading stream...</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Live</span>
                </div>
              </div>
            </div>

            <div className="aspect-video bg-black relative">

              <video
                ref={videoRef}
                autoPlay
                muted
                controls
                playsInline
                onLoadedData={handleVideoLoad}
                onError={handleVideoError}
                className="w-full h-full object-cover"
              />


              {isVideoLoading && (
                <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <p className="text-slate-400">Waiting for stream to start...</p>
                    <p className="text-slate-500 text-sm mt-2">This may take a few moments</p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Controls Info */}
            <div className="p-4 bg-slate-900/50 border-t border-slate-700/50">
              <div className="flex items-center justify-center space-x-6 text-slate-400 text-sm">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  <span>Use controls for playback</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Right-click for more options</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Connection Guide
              </h3>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Ensure you have a stable internet connection</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Allow browser permissions for video playback</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Use video controls for playback options</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Troubleshooting
              </h3>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span>Refresh if stream doesn't load within 30 seconds</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span>Check your internet connection if video buffers</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span>Contact instructor if issues persist</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}