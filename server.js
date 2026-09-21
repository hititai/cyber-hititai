import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

dotenv.config();
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const dataDir=path.join(__dirname,'data');
const settingsFile=path.join(dataDir,'settings.json');
const logsFile=path.join(dataDir,'logs.json');
const app=express();
app.use(express.urlencoded({extended:false})); app.use(express.json());
app.use(session({secret:process.env.SESSION_SECRET||'dev-only-secret',resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:8*60*60*1000}}));
app.use(express.static(path.join(__dirname,'public')));
const read=async file=>JSON.parse(await fs.readFile(file,'utf8'));
const write=async(file,value)=>fs.writeFile(file,JSON.stringify(value,null,2));
const admin=(req,res,next)=>req.session.admin?next():res.redirect('/admin');
function page(title,body){return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><link rel="stylesheet" href="/admin.css"></head><body><main class="panel">${body}</main></body></html>`}
app.get('/api/site',async(req,res)=>{const s=await read(settingsFile);res.json(s)});
app.get('/api/visitor',async(req,res)=>{const ip=(req.headers['x-forwarded-for']||req.socket.remoteAddress||'').split(',')[0].trim().replace('::ffff:','');let location='Yaklaşık konum bulunamadı';try{const r=await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,city,country,query`);const d=await r.json();if(d.status==='success')location=[d.city,d.country].filter(Boolean).join(', ')}catch{}const logs=await read(logsFile);logs.unshift({ip,location,time:new Date().toISOString()});await write(logsFile,logs.slice(0,100));res.json({ip,location})});
app.get('/admin',(req,res)=>{if(!req.session.admin)return res.send(page('Admin giriş',`<h1>Yönetim paneli</h1><form method="post" action="/admin/login"><input type="password" name="password" placeholder="Admin şifresi" required autofocus><button>Giriş yap</button>${req.query.error?'<p class="error">Şifre hatalı.</p>':''}</form>`));res.redirect('/admin/panel')});
app.post('/admin/login',(req,res)=>{if(req.body.password&&req.body.password===(process.env.ADMIN_PASSWORD||'change-this-password')){req.session.admin=true;return res.redirect('/admin/panel')}res.redirect('/admin?error=1')});
app.post('/admin/logout',(req,res)=>req.session.destroy(()=>res.redirect('/admin')));
app.get('/admin/panel',admin,async(req,res)=>{const s=await read(settingsFile),logs=await read(logsFile);res.send(page('Admin panel',`<div class="head"><h1>Club Site / Admin</h1><form method="post" action="/admin/logout"><button>Çıkış</button></form></div><form class="settings" method="post" action="/admin/settings"><label>Logo URL veya dosya yolu<input name="logo" value="${s.logo}"></label><label>WhatsApp bağlantısı<input name="whatsappUrl" type="url" value="${s.whatsappUrl}"></label><label>Karşılama mesajı <small>{location} konumla değiştirilir</small><textarea name="welcomeTemplate">${s.welcomeTemplate}</textarea></label><button>Kaydet</button></form><h2>Ziyaretçi logları</h2><table><tr><th>IP</th><th>Yaklaşık konum</th><th>Zaman</th></tr>${logs.map(x=>`<tr><td>${x.ip}</td><td>${x.location}</td><td>${new Date(x.time).toLocaleString('tr-TR')}</td></tr>`).join('')}</table>`))});
app.post('/admin/settings',admin,async(req,res)=>{await write(settingsFile,{logo:req.body.logo||'/logo.png',whatsappUrl:req.body.whatsappUrl||'#',welcomeTemplate:req.body.welcomeTemplate||''});res.redirect('/admin/panel')});
await fs.mkdir(dataDir,{recursive:true});
const port=Number(process.env.PORT||3000);app.listen(port,()=>console.log(`Club Site: http://localhost:${port}`));
