// src/pages/Admin.jsx

import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';
import StartSessionCard from '../components/StartSessionCard';
import ActiveSessionDashboard from '../components/ActiveSessionDashboard';

const SERVER = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

export default function Admin() {
  const [session, setSession] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const videoRef = useRef(null);

  const pcRef = useRef(null);
  const socketRef = useRef(null);

  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const screenTrackRef = useRef(null);

  //  Socket Setup
  useEffect(() => {
    socketRef.current = io(SERVER);
    return () => socketRef.current.disconnect();
  }, []);

  //  Init Webcam
  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        localStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera init error:", err);
      }
    })();
  }, []);

  const handleCopy = async () => {
    try {
      if (session?.userurl) {
        await navigator.clipboard.writeText(session.userurl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (err) {
      console.error("Copy error:", err);
    }
  };

  //  Audio toggle
  const toggleAudio = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach(t => t.enabled = !t.enabled);
    setIsAudioMuted(a => !a);
  };

  //  Video toggle
  const toggleVideo = () => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach(t => t.enabled = !t.enabled);
    setIsVideoOff(v => !v);
    // setIsScreenSharing(s => !s);

  };

  //  Start session
  const startSession = async () => {
    try {
      setIsStreaming(true);

      const res = await fetch(`${SERVER}/api/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseUrl: window.location.origin }),
      });

      const data = await res.json();
      setSession(data.session);

      startStream(data.session.unique_id);
    } catch (err) {
      console.error("Start session error:", err);
      setIsStreaming(false);
    }
  };

  //  WebRTC stream handling
  const startStream = async (roomId) => {
    const local = localStreamRef.current;
    if (!local) return;

    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    local.getTracks().forEach(track => pc.addTrack(track, local));

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current.emit("ice-candidate", { roomId, candidate: e.candidate });
      }
    };

    socketRef.current.emit("join-room", roomId, "admin");

    socketRef.current.on("student-ready", async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit("offer", { roomId, offer });
    });

    socketRef.current.on("answer", ({ answer }) => {
      pc.setRemoteDescription(answer);
    });

    socketRef.current.on("ice-candidate", ({ candidate }) => {
      pc.addIceCandidate(candidate);
    });
  };

  //  Start Screen Share
  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];

      screenStreamRef.current = screenStream;
      screenTrackRef.current = screenTrack;

      videoRef.current.srcObject = screenStream;
      setIsScreenSharing(true);


      const sender = pcRef.current
        ?.getSenders()
        .find(s => s.track && s.track.kind === "video");

      if (sender) await sender.replaceTrack(screenTrack);

      screenTrack.onended = stopScreenShare;
    } catch (err) {
      console.error("Screen share error:", err);
    }
  };


  //  Stop Screen Share (FIXED)
  const stopScreenShare = async () => {
    console.log("Stopping screen share...");

    const screenStream = screenStreamRef.current;

    if (screenStream) {
      screenStream.getTracks().forEach(t => t.stop());
    }


    //  restore webcam
    const cam = localStreamRef.current;
    const camTrack = cam.getVideoTracks()[0];

    const sender = pcRef.current
      ?.getSenders()
      ?.find(s => s.track && s.track.kind === "video");

    if (sender) await sender.replaceTrack(camTrack);

    videoRef.current.srcObject = cam;

    setIsScreenSharing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 text-lg">Manage your live session</p>
        </div>

        <div className="max-w-6xl mx-auto">
          {!session ? (
            <StartSessionCard
              isStreaming={isStreaming}
              startSession={startSession}
            />
          ) : (
            <ActiveSessionDashboard
            localStream={localStreamRef.current}
              session={session}
              isCopied={isCopied}
              handleCopy={handleCopy}
              videoRef={videoRef}
              isVideoOff={isVideoOff}
              isAudioMuted={isAudioMuted}
              isScreenSharing={isScreenSharing}
              toggleAudio={toggleAudio}
              toggleVideo={toggleVideo}
              startScreenShare={startScreenShare}
              stopScreenShare={stopScreenShare}
            />
          )}
        </div>
      </div>
    </div>
  );
}
