const feed=document.querySelector('#security-feed');
const matrix=document.querySelector('#matrix-log');
const matrixEvents=['[OK] encrypted channel verified','[INFO] visitor session anonymized','[SCAN] firewall rules loaded','[PASS] TLS handshake complete','[TRACE] packet route secured','[WATCH] monitoring active','[OK] no anomalous traffic'];
function streamLog(){const line=`${new Date().toLocaleTimeString()}  ${matrixEvents[Math.floor(Math.random()*matrixEvents.length)]}\n`;matrix.textContent=(line+matrix.textContent).slice(0,4200)}
for(let i=0;i<18;i++)streamLog();setInterval(streamLog,650);
const events=['TLS el sıkışması doğrulandı','Ziyaretçi oturumu anonimleştirildi','Güvenlik başlıkları kontrol edildi','İstek hızı normal aralıkta','İstemci bağlantısı güvenli','Şüpheli trafik engellendi','Anonim olay kaydedildi'];
function renderFeed(){feed.innerHTML=events.map((e,i)=>`<div class="feed-row"><b><span class="green">✓</span> ${e}</b><span>${String(i+1).padStart(2,'0')}s önce</span></div>`).join('')}
renderFeed();
fetch('https://ipapi.co/json/').then(r=>r.ok?r.json():Promise.reject()).then(d=>{document.querySelector('#hero-ip').textContent=d.ip||'Gizlilik modu';document.querySelector('#hero-location').textContent=[d.city,d.country_name].filter(Boolean).join(', ')||'Yaklaşık konum bulunamadı'}).catch(()=>{document.querySelector('#hero-ip').textContent='Gizlilik modu';document.querySelector('#hero-location').textContent='Konum kullanılamıyor'});
setInterval(()=>{document.querySelector('#event-count').textContent=128+Math.floor(Math.random()*8);renderFeed()},5000);
document.querySelector('#location-btn').addEventListener('click',()=>{const out=document.querySelector('#visitor-location');if(!navigator.geolocation){out.textContent='Tarayıcınız konum özelliğini desteklemiyor.';return}navigator.geolocation.getCurrentPosition(p=>{out.textContent=`Yaklaşık koordinat: ${p.coords.latitude.toFixed(2)}, ${p.coords.longitude.toFixed(2)} (yalnızca bu oturumda)`},()=>{out.textContent='Konum izni verilmedi; gizlilik modu korunuyor.'});});
