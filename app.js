/* Express + Socket.IO app using lowdb (JSON) for storage to avoid native build issues */
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { nanoid } = require('nanoid');
const cors = require('cors');
const fs = require('fs');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const PORT = process.env.PORT || 8080;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ensure JSON DB exists
require('./scripts/migrate');
const { readData, writeData } = require('./lib/datastore');


const upload = multer({ dest: 'uploads/' });

function authMiddleware(req,res,next){
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({error:'missing token'});
  const token = auth.split(' ')[1];
  try{ const payload = jwt.verify(token,JWT_SECRET); req.user = payload; next(); }catch(e){ return res.status(401).json({error:'invalid token'}); }
}

app.post('/api/signup', async (req,res) => {
  const { username,email,password,phone } = req.body;
  if(!email || !password || !username) return res.status(400).json({error:'missing fields'});
  const d = readData();
  if(d.users.find(u=>u.email===email || u.username===username)) return res.status(400).json({error:'user exists'});
  const hashed = await bcrypt.hash(password,10);
  const id = nanoid();
  const user = {id,username,email,password:hashed,phone,preferences:{theme:'dark'},avatar:null,role:'user',created_at:new Date().toISOString()};
  // create default onboarding resources: a server with a general channel and a starter game
  const serverId = nanoid();
  const channelId = nanoid();
  const gameId = nanoid();
  const serv = {id:serverId,owner:id,name:`${username}'s Server`,meta:{onboarding:true},created_at:new Date().toISOString()};
  const chan = {id:channelId,server_id:serverId,name:'general',type:'text',meta:{onboarding:true},created_at:new Date().toISOString()};
  const g = {id:gameId,owner:id,name:`${username}'s First Game`,meta:{thumbnail:null,description:'Welcome to your first game'},created_at:new Date().toISOString()};
  d.users.push(user);
  d.servers.push(serv);
  d.channels.push(chan);
  d.games.push(g);
  writeData(d);
  const token = jwt.sign({id,username,email},JWT_SECRET,{expiresIn:'7d'});
  res.json({token,user:{id,username,email,phone,preferences:user.preferences}});
});

app.post('/api/login', async(req,res)=>{
  const {email,password} = req.body;
  if(!email || !password) return res.status(400).json({error:'missing fields'});
  const d = readData();
  const row = d.users.find(u=>u.email===email);
  if(!row) return res.status(400).json({error:'invalid credentials'});
  const ok = await bcrypt.compare(password,row.password);
  if(!ok) return res.status(400).json({error:'invalid credentials'});
  const token = jwt.sign({id:row.id,username:row.username,email:row.email},JWT_SECRET,{expiresIn:'7d'});
  res.json({token,user:{id:row.id,username:row.username,email:row.email,phone:row.phone,preferences:row.preferences}});
});

app.get('/api/me', authMiddleware, async (req,res)=>{
  const d = readData();
  const row = d.users.find(u=>u.id===req.user.id);
  if(!row) return res.status(404).json({error:'not found'});
  res.json({id:row.id,username:row.username,email:row.email,phone:row.phone,preferences:row.preferences,avatar:row.avatar,role:row.role});
});

app.post('/api/upload', authMiddleware, upload.single('file'), (req,res)=>{
  if(!req.file) return res.status(400).json({error:'no file'});
  // store under uploads/ as is
  res.json({url:`/uploads/${req.file.filename}`,original:req.file.originalname});
});

app.post('/api/servers', authMiddleware, async (req,res)=>{
  const {name} = req.body;
  if(!name) return res.status(400).json({error:'missing name'});
  const d = readData();
  const count = d.servers.filter(s=>s.owner===req.user.id).length;
  if(count >= 100) return res.status(403).json({error:'server limit reached (100)'});
  const id = nanoid();
  const serv = {id,owner:req.user.id,name,meta:{},created_at:new Date().toISOString()};
  d.servers.push(serv);
  // add owner as server member
  d.server_members.push({id:nanoid(),server_id:id,user_id:req.user.id,role:'owner',joined_at:new Date().toISOString()});
  // create a default general channel for the server
  const channelId = nanoid();
  d.channels.push({id:channelId,server_id:id,name:'general',type:'text',meta:{},created_at:new Date().toISOString()});
  writeData(d);
  res.json({id,name});
});

// list servers for current user
app.get('/api/servers', authMiddleware, (req,res)=>{
  const d = readData();
  const rows = d.servers.filter(s=>s.owner===req.user.id);
  res.json({servers:rows});
});

// games endpoints
app.post('/api/games', authMiddleware, (req,res)=>{
  const {name,meta} = req.body || {};
  if(!name) return res.status(400).json({error:'missing name'});
  const d = readData();
  const id = nanoid();
  const g = {id,owner:req.user.id,name,meta:meta||{},created_at:new Date().toISOString()};
  d.games.push(g); writeData(d);
  res.json(g);
});

app.get('/api/games', authMiddleware, (req,res)=>{
  const d = readData();
  const rows = d.games.filter(g=>g.owner===req.user.id);
  res.json({games:rows});
});

// Channels and server membership
app.get('/api/channels', authMiddleware, (req,res)=>{
  const { server_id } = req.query;
  if(!server_id) return res.status(400).json({error:'missing server_id'});
  const d = readData();
  const rows = d.channels.filter(c=>c.server_id===server_id);
  res.json({channels:rows});
});

app.post('/api/channels', authMiddleware, (req,res)=>{
  const { server_id,name,type } = req.body;
  if(!server_id || !name) return res.status(400).json({error:'missing fields'});
  const d = readData();
  const serv = d.servers.find(s=>s.id===server_id);
  if(!serv) return res.status(404).json({error:'server not found'});
  const member = d.server_members.find(m=>m.server_id===server_id && m.user_id===req.user.id);
  const allowed = serv.owner===req.user.id || (member && (member.role==='admin' || member.role==='moderator'));
  if(!allowed) return res.status(403).json({error:'not allowed'});
  const id = nanoid();
  d.channels.push({id,server_id,name,type:type||'text',meta:{},created_at:new Date().toISOString()});
  writeData(d);
  res.json({id,server_id,name});
});

app.post('/api/servers/:id/join', authMiddleware, (req,res)=>{
  const sid = req.params.id;
  const d = readData();
  const serv = d.servers.find(s=>s.id===sid);
  if(!serv) return res.status(404).json({error:'server not found'});
  if(d.server_members.find(m=>m.server_id===sid && m.user_id===req.user.id)) return res.status(400).json({error:'already a member'});
  const id = nanoid();
  d.server_members.push({id,server_id:sid,user_id:req.user.id,role:'member',joined_at:new Date().toISOString()});
  writeData(d);
  res.json({ok:true});
});

app.get('/api/servers/:id', authMiddleware, (req,res)=>{
  const sid = req.params.id;
  const d = readData();
  const serv = d.servers.find(s=>s.id===sid);
  if(!serv) return res.status(404).json({error:'server not found'});
  const members = d.server_members.filter(m=>m.server_id===sid);
  const channels = d.channels.filter(c=>c.server_id===sid);
  res.json({server:serv,members,channels});
});

// Messages endpoints
app.get('/api/messages', authMiddleware, (req,res)=>{
  const { conversation, limit } = req.query;
  if(!conversation) return res.status(400).json({error:'missing conversation'});
  const d = readData();
  const rows = d.messages.filter(m=>m.conversation_id===conversation).sort((a,b)=> new Date(a.created_at)-new Date(b.created_at));
  const l = parseInt(limit||50,10);
  res.json({messages: rows.slice(-l)});
});

app.post('/api/messages', authMiddleware, (req,res)=>{
  const { conversation, content, type, metadata } = req.body;
  if(!conversation || !content) return res.status(400).json({error:'missing fields'});
  const d = readData();
  const id = nanoid();
  const msg = {id,conversation_id:conversation,sender:req.user.id,content,type:type||'text',metadata:metadata||{},created_at:new Date().toISOString()};
  d.messages.push(msg); writeData(d);
  io.to(conversation).emit('message',msg);
  res.json(msg);
});

app.post('/api/friends/request', authMiddleware, async (req,res)=>{
  const {userId} = req.body;
  if(!userId) return res.status(400).json({error:'missing userId'});
  const d = readData();
  const user = d.users.find(u=>u.id===userId);
  if(!user) return res.status(404).json({error:'user not found'});
  const id = nanoid();
  d.friends.push({id,requester:req.user.id,requestee:userId,status:'pending',created_at:new Date().toISOString()});
  writeData(d);
  io.to(userId).emit('friend_request',{from:req.user.id});
  res.json({ok:true});
});

app.get('/api/friends', authMiddleware, async (req,res)=>{
  const d = readData();
  const rows = d.friends.filter(f=>f.requester===req.user.id || f.requestee===req.user.id);
  res.json({friends:rows});
});

app.use('/uploads', express.static(path.join(__dirname,'uploads')));

io.use((socket,next)=>{
  const token = socket.handshake.auth?.token;
  if(!token) return next(new Error('auth error'));
  try{ const payload = jwt.verify(token,JWT_SECRET); socket.user = payload; next(); }catch(e){ next(new Error('auth error')); }
});

io.on('connection',(socket)=>{
  const uid = socket.user.id;
  socket.join(uid);

  socket.on('join_dm',(otherId)=>{
    const conv = [uid,otherId].sort().join(':');
    socket.join('dm:'+conv);
  });

  socket.on('send_message', async (msg)=>{
    const id = nanoid();
    const d = readData();
    const conv = msg.conversation || ('dm:'+[uid,msg.to].sort().join(':'));
    d.messages.push({id,conversation_id:conv,sender:uid,content:msg.content,type:msg.type||'text',metadata:msg.metadata||{},created_at:new Date().toISOString()});
    writeData(d);
    io.to(conv).emit('message', {id,conversation:conv,sender:uid,content:msg.content,type:msg.type,metadata:msg.metadata,created_at: new Date().toISOString()});
  });

  socket.on('call_request',(payload)=>{ const target = payload.to; io.to(target).emit('call_request',{from:uid,offer:payload.offer}); });

  socket.on('disconnect', ()=>{ socket.leave(uid); });
});

app.get('/health', (req,res)=>{
  res.json({ok:true,uptime:process.uptime(),time:new Date().toISOString()});
});

server.listen(PORT, ()=>console.log(`App listening on http://localhost:${PORT}`));
