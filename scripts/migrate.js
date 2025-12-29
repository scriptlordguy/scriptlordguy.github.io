const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname,'..','data','db.json');

console.log('Initializing JSON datastore...');
const baseDir = path.join(__dirname,'..','data');
if(!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, {recursive:true});
if(!fs.existsSync(dbPath)){
  const init = {
    users: [],
    friends: [],
    messages: [],
    servers: [],
    channels: [],
    server_members: [],
    bots: []
  };
  fs.writeFileSync(dbPath, JSON.stringify(init,null,2));
  console.log('Created data/db.json');
} else console.log('data/db.json already exists');
console.log('Done.');
