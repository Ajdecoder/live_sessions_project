const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const LiveSession = require('./models/LiveSession');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/live_sessions_db')
  .then(() => console.log(" Mongo connected"))
  .catch(err => console.log(" Mongo error:", err));

app.post('/api/sessions', async (req, res) => {
  const unique_id = uuidv4().slice(0,8);
  const userurl = `${req.body.baseUrl || req.protocol + '://' + req.get('host')}/session/${unique_id}`;
  const session = new LiveSession({ type:'admin', unique_id, userurl });
  await session.save();
  res.json({ ok:true, session });
});

app.get('/api/sessions/:unique_id', async (req,res)=>{
  const s = await LiveSession.findOne({ unique_id:req.params.unique_id });
  if(!s) return res.status(404).json({ ok:false });
  res.json({ ok:true, session:s });
});

io.on('connection', (socket) => {

  socket.on('join-room', (roomId, role) => {
    socket.join(roomId);
    socket.data.role = role;

    console.log(role, "joined", roomId);

    // NEW: student join -> admin ko bol do
    if (role === 'student') {
      socket.to(roomId).emit('student-ready');
    }

    if (role === 'admin') {
      socket.to(roomId).emit('admin-ready');
    }
  });

  socket.on('offer', (d) => socket.to(d.roomId).emit('offer', d));
  socket.on('answer', (d) => socket.to(d.roomId).emit('answer', d));
  socket.on('ice-candidate', (d) => socket.to(d.roomId).emit('ice-candidate', d));
});


server.listen(4000);