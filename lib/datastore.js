const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname,'..','data','db.json');

function readData(){
  if(!fs.existsSync(dbPath)) return {users:[],friends:[],messages:[],servers:[],channels:[],server_members:[],bots:[],games:[]};
  const txt = fs.readFileSync(dbPath,'utf8');
  try{ return JSON.parse(txt||'{}'); }catch(e){ return {users:[],friends:[],messages:[],servers:[],channels:[],server_members:[],bots:[],games:[]}; }
}

function writeData(data){ fs.writeFileSync(dbPath,JSON.stringify(data,null,2)); }

module.exports = {readData,writeData};