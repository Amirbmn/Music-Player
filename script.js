const canvas=document.getElementById('bg-canvas'),ctx=canvas.getContext('2d');
let W,H;
const orbs=[
  {x:.15,y:.2,r:.38,c:'#3b1d7a',vx:.00018,vy:.00013},
  {x:.8,y:.7,r:.32,c:'#1a0f4a',vx:-.00016,vy:.00018},
  {x:.5,y:.5,r:.26,c:'#0d2060',vx:.00020,vy:-.00015},
];
function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight}
function drawBg(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#07050f';ctx.fillRect(0,0,W,H);
  for(const o of orbs){
    o.x+=o.vx;o.y+=o.vy;
    if(o.x<-.1||o.x>1.1)o.vx*=-1;
    if(o.y<-.1||o.y>1.1)o.vy*=-1;
    const g=ctx.createRadialGradient(o.x*W,o.y*H,0,o.x*W,o.y*H,o.r*Math.max(W,H));
    g.addColorStop(0,o.c+'bb');g.addColorStop(1,o.c+'00');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  }
}
resize();window.addEventListener('resize',resize);
(function loop(){drawBg();requestAnimationFrame(loop)})();

/* ══════════════════════════════════════════
   WAVEFORM VISUALIZER
══════════════════════════════════════════ */
const wvCanvas=document.getElementById('waveform-canvas');
const wvCtx=wvCanvas.getContext('2d');
let wvBars=32,wvData=new Array(wvBars).fill(0);
let wvTargets=new Array(wvBars).fill(0);
function resizeWv(){wvCanvas.width=wvCanvas.offsetWidth*devicePixelRatio;wvCanvas.height=wvCanvas.offsetHeight*devicePixelRatio}
function tickWv(){
  if(playing){
    wvTargets=wvTargets.map((_,i)=>Math.random()*(i%3===0?0.9:0.5)+0.1);
  } else {
    wvTargets=wvTargets.map(()=>0.05);
  }
}
function drawWv(){
  resizeWv();
  wvCtx.clearRect(0,0,wvCanvas.width,wvCanvas.height);
  const W2=wvCanvas.width,H2=wvCanvas.height,barW=W2/wvBars,gap=2*devicePixelRatio;
  for(let i=0;i<wvBars;i++){
    wvData[i]+=(wvTargets[i]-wvData[i])*0.15;
    const h=wvData[i]*H2*0.85;
    const x=i*barW+gap/2;
    const y=(H2-h)/2;
    const alpha=0.3+wvData[i]*0.7;
    wvCtx.fillStyle=`rgba(196,181,253,${alpha})`;
    wvCtx.beginPath();
    wvCtx.roundRect(x,y,barW-gap,h,3*devicePixelRatio);
    wvCtx.fill();
  }
}
setInterval(tickWv,120);
(function wvLoop(){drawWv();requestAnimationFrame(wvLoop)})();

/* ══════════════════════════════════════════
   PARTICLES on play
══════════════════════════════════════════ */
function spawnParticles(x,y){
  const colors=['#a78bfa','#c4b5fd','#f472b6','#60a5fa','#fff'];
  for(let i=0;i<14;i++){
    const el=document.createElement('div');
    el.className='particle';
    const size=4+Math.random()*8;
    const angle=Math.random()*Math.PI*2;
    const dist=60+Math.random()*80;
    el.style.cssText=`
      width:${size}px;height:${size}px;
      left:${x-size/2}px;top:${y-size/2}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      --tx:${Math.cos(angle)*dist}px;--ty:${Math.sin(angle)*dist}px;
      animation-duration:${0.5+Math.random()*0.5}s;
    `;
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),1000);
  }
}

/* ══════════════════════════════════════════
   DATA
══════════════════════════════════════════ */
let songs=[],nextId=1;
let curId=null,playing=false,shuffle=false,repeatMode=0;
let progVal=0,progTimer=null,selEmoji='🎵',currentTab='all';

function getSong(id){return songs.find(s=>s.id===id)}
function fmtSec(s){const m=Math.floor(s/60),x=Math.floor(s%60);return`${m}:${x.toString().padStart(2,'0')}`}
function durSec(d){
  if(!d)return 0;
  if(!String(d).includes(':'))return parseInt(d,10)||0;
  const p=String(d).split(':');return(+p[0]||0)*60+(+p[1]||0);
}
function visible(){
  const q=document.getElementById('search-input').value.toLowerCase();
  let list=currentTab==='favorites'?songs.filter(s=>s.fav):
           currentTab==='recent'?[...songs].slice(0,6):[...songs];
  if(q)list=list.filter(s=>s.title.toLowerCase().includes(q)||s.artist.toLowerCase().includes(q));
  return list;
}

/* ══════════════════════════════════════════
   RENDER LIBRARY
══════════════════════════════════════════ */
const labels={'all':'All songs','favorites':'Favourites','recent':'Recently added'};
function renderList(){
  const list=visible();
  document.getElementById('song-count').textContent=`${songs.length} song${songs.length!==1?'s':''}`;
  document.getElementById('section-label').textContent=labels[currentTab]||'';
  const el=document.getElementById('song-list');
  if(!list.length){
    el.innerHTML=`<div class="empty"><div class="ei">🎵</div><p>Nothing here yet.</p><small>Tap + to add your first track</small></div>`;
    return;
  }
  el.innerHTML=list.map(s=>`
    <div class="song-item ${s.id===curId?'playing':''}" data-id="${s.id}">
      <div class="cover-thumb" style="background:${s.c1}44" onclick="openPlayer(${s.id})">
        ${s.cover_image
          ?`<img src="/covers/${s.cover_image}" style="width:100%;height:100%;object-fit:cover;border-radius:12px"/>`
          :`<span>${s.cover}</span>`}
        <div class="eq-anim">
          <div class="eq-bar"></div><div class="eq-bar"></div>
          <div class="eq-bar"></div><div class="eq-bar"></div>
        </div>
      </div>
      <div class="song-info" onclick="openPlayer(${s.id})">
        <div class="song-title">${s.title}</div>
        <div class="song-meta">${s.artist} · ${s.album}</div>
      </div>
      <div class="song-right">
        <span class="song-dur">${s.duration}</span>
        <button class="icon-btn ${s.fav?'fav-active':''}" onclick="toggleFav(event,${s.id})">
          <svg width="15" height="15" fill="${s.fav?'#f472b6':'none'}" viewBox="0 0 24 24" stroke="${s.fav?'#f472b6':'currentColor'}" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <button class="icon-btn del" onclick="deleteSong(event,${s.id})">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>
    </div>`).join('');
}

/* ══════════════════════════════════════════
   PLAYER BG
══════════════════════════════════════════ */
function setPlayerBg(s){
  if(!s)return;
  [['blob1',s.c1,'.58'],['blob2',s.c2,'.46'],['blob3',s.c3,'.36']].forEach(([id,col,op])=>{
    const el=document.getElementById(id);
    el.style.background=col;el.style.opacity=op;
  });
  // update canvas orbs too
  orbs[0].c=s.c1||'#3b1d7a';
  orbs[1].c=s.c2||'#1a0f4a';
}

/* ══════════════════════════════════════════
   RENDER PLAYER
══════════════════════════════════════════ */
function renderPlayer(){
  const s=getSong(curId);if(!s)return;
  setPlayerBg(s);
  const aw=document.getElementById('p-artwork');
  if(s.cover_image){
    aw.innerHTML=`<img src="/covers/${s.cover_image}" style="width:100%;height:100%;object-fit:cover;border-radius:26px"/>`;
  } else {
    aw.textContent=s.cover;
  }
  aw.style.background=`linear-gradient(135deg,${s.c1}99,${s.c3}dd)`;
  document.getElementById('p-title').textContent=s.title;
  document.getElementById('p-artist').textContent=s.artist;
  document.getElementById('p-album').textContent=s.album;
  document.getElementById('t-total').textContent=s.duration;
  const fb=document.getElementById('fav-btn'),fi=document.getElementById('fav-icon');
  fb.classList.toggle('active',s.fav);
  fi.setAttribute('fill',s.fav?'#f472b6':'none');
  fi.setAttribute('stroke',s.fav?'#f472b6':'currentColor');
  renderQueue();updateMini();
}

function renderQueue(){
  const list=visible().length?visible():songs;
  const idx=list.findIndex(s=>s.id===curId);
  const next=[];
  for(let i=1;i<=3;i++)next.push(list[(idx+i)%list.length]);
  document.getElementById('queue-list').innerHTML=next.map(s=>`
    <div class="q-item" onclick="openPlayer(${s.id})">
      <div class="q-cover" style="background:${s.c1}55">
        ${s.cover_image
          ?`<img src="/covers/${s.cover_image}" style="width:100%;height:100%;object-fit:cover;border-radius:9px"/>`
          :s.cover}
      </div>
      <div class="q-text">
        <div class="q-title">${s.title}</div>
        <div class="q-artist">${s.artist}</div>
      </div>
      <span class="q-dur">${s.duration}</span>
    </div>`).join('');
}

function updateMini(){
  const s=getSong(curId);
  const mp=document.getElementById('mini-player');
  if(!s){mp.classList.add('hidden');return}
  mp.classList.remove('hidden');
  const mc=document.getElementById('mini-cover');
  if(s.cover_image){
    mc.innerHTML=`<img src="/covers/${s.cover_image}" style="width:100%;height:100%;object-fit:cover;border-radius:10px"/>`;
  } else {
    mc.textContent=s.cover;
  }
  mc.style.background=s.c1+'66';
  document.getElementById('mini-title').textContent=s.title;
  document.getElementById('mini-artist').textContent=s.artist;
  document.getElementById('mini-prog').style.width=progVal+'%';
  syncPlayIcons();
}

function syncPlayIcons(){
  const play=`<polygon points="5 3 19 12 5 21 5 3"/>`;
  const pause=`<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>`;
  document.getElementById('play-icon').innerHTML=playing?pause:play;
  document.getElementById('ml-play-icon').innerHTML=playing?pause:play;
  const aw=document.getElementById('p-artwork');
  aw.classList.toggle('big',playing);
  // vinyl
  const vd=document.getElementById('vinyl-disc');
  vd.classList.toggle('spinning',playing);
  // artwork ring glow
  document.getElementById('artwork-ring').classList.toggle('glow',playing);
}

/* ══════════════════════════════════════════
   PLAYBACK
══════════════════════════════════════════ */
const audioPlayer=document.getElementById('main-audio');

function openPlayer(id){
  curId=id;progVal=0;
  document.getElementById('seek-bar').value=0;setSeek(0);
  playing=true;startTimer();
  renderPlayer();renderList();syncPlayIcons();
  showScreen('screen-player');
  playSong(getSong(id));
  // show vinyl
  document.getElementById('vinyl-disc').classList.add('visible');
}

function startTimer(){
  clearInterval(progTimer);
  progTimer=setInterval(()=>{
    if(!playing)return;
    const s=getSong(curId);if(!s)return;
    const tot=durSec(s.duration);
    progVal=Math.min(progVal+100/tot,100);
    document.getElementById('seek-bar').value=progVal;
    setSeek(progVal);
    const curr=Math.floor(progVal/100*tot);
    document.getElementById('t-curr').textContent=fmtSec(curr);
    document.getElementById('mini-prog').style.width=progVal+'%';
    if(progVal>=100){repeatMode===2?progVal=0:nextSong()}
  },1000);
}

function setSeek(p){document.getElementById('seek-bar').style.backgroundSize=`${p}% 100%`}

function togglePlay(e){
  if(!curId){if(songs.length)openPlayer(songs[0].id);return}
  playing=!playing;
  if(playing){
    startTimer();audioPlayer.play();
    if(e){const r=document.getElementById('play-btn').getBoundingClientRect();spawnParticles(r.left+r.width/2,r.top+r.height/2)}
  } else {
    clearInterval(progTimer);audioPlayer.pause();
  }
  syncPlayIcons();
}

function playSong(song){
  if(!song||!song.file_path){console.error('No file_path:',song);return}
  const filename=song.file_path.replace(/^\/?(songs\/)?/,'');
  audioPlayer.src=`http://localhost:3000/songs/${filename}`;
  audioPlayer.play().catch(err=>console.error('Playback failed:',err));
}

function nextSong(){
  const list=visible().length?visible():songs;if(!list.length)return;
  let idx=list.findIndex(s=>s.id===curId);
  if(shuffle)idx=Math.floor(Math.random()*list.length)-1;
  audioPlayer.pause();audioPlayer.src='';
  curId=list[(idx+1)%list.length].id;
  progVal=0;renderPlayer();renderList();syncPlayIcons();
  if(playing){startTimer();playSong(getSong(curId))}
}

function prevSong(){
  if(progVal>8){progVal=0;document.getElementById('seek-bar').value=0;setSeek(0);audioPlayer.currentTime=0;return}
  const list=visible().length?visible():songs;if(!list.length)return;
  const idx=list.findIndex(s=>s.id===curId);
  audioPlayer.pause();audioPlayer.src='';
  curId=list[(idx-1+list.length)%list.length].id;
  progVal=0;renderPlayer();renderList();syncPlayIcons();
  if(playing){startTimer();playSong(getSong(curId))}
}

/* ══════════════════════════════════════════
   FAV / DELETE
══════════════════════════════════════════ */
function toggleFav(e,id){
  e.stopPropagation();
  const s=getSong(id);if(!s)return;
  s.fav=!s.fav;saveFav(id,s.fav);
  renderList();if(id===curId)renderPlayer();
}
function deleteSong(e,id){
  e.stopPropagation();
  deleteFromDB(id);
  const el=document.querySelector(`.song-item[data-id="${id}"]`);
  if(el){
    el.classList.add('out');
    setTimeout(()=>{
      songs=songs.filter(s=>s.id!==id);
      if(curId===id){playing=false;clearInterval(progTimer);audioPlayer.pause();curId=null;document.getElementById('mini-player').classList.add('hidden')}
      renderList();
    },220);
  }
}

/* ══════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════ */
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const scr=document.getElementById(id);
  scr.classList.add('active','screen-enter');
  setTimeout(()=>scr.classList.remove('screen-enter'),300);
  window.scrollTo(0,0);
}

/* ══════════════════════════════════════════
   MORE MENU
══════════════════════════════════════════ */
document.getElementById('more-btn').addEventListener('click',e=>{
  e.stopPropagation();
  document.getElementById('more-menu').classList.toggle('open');
});
document.addEventListener('click',()=>document.getElementById('more-menu').classList.remove('open'));
document.getElementById('menu-fav').addEventListener('click',()=>{
  const s=getSong(curId);if(!s)return;
  s.fav=!s.fav;saveFav(curId,s.fav);renderPlayer();renderList();
  document.getElementById('menu-fav').querySelector('span').textContent=s.fav?'Remove from favourites':'Add to favourites';
});
document.getElementById('menu-copy').addEventListener('click',()=>{
  const s=getSong(curId);if(!s)return;
  navigator.clipboard.writeText(`${s.title} - ${s.artist} (${s.album})`);
});
document.getElementById('menu-delete').addEventListener('click',()=>{
  if(!curId)return;
  deleteSong({stopPropagation:()=>{}},curId);
  showScreen('screen-library');
});

/* ══════════════════════════════════════════
   MODAL
══════════════════════════════════════════ */
const emojis=['🎸','🎹','🥁','🎷','🎺','🎻','🎵','🎶','🔥','💜','🌙','⭐','🌊','🌈','🍂','🏔️','🎤','🎧','🎼','🎙️','🍑','🌸'];
const colorPairs=[
  {c1:'#7b2d8b',c2:'#1a0630',c3:'#3d1460'},{c1:'#0e4d92',c2:'#051a40',c3:'#0a3060'},
  {c1:'#a03000',c2:'#250a00',c3:'#601800'},{c1:'#0f6e3a',c2:'#041a0e',c3:'#0a3d22'},
  {c1:'#6a1da0',c2:'#18042a',c3:'#3d0e60'},{c1:'#b45309',c2:'#271000',c3:'#7c2d12'},
  {c1:'#1d4ed8',c2:'#030e30',c3:'#1e3a8a'},{c1:'#374151',c2:'#060810',c3:'#1f2937'},
];
const emoRow=document.getElementById('emo-row');
emoRow.innerHTML=emojis.map((e,i)=>`<button class="emo-btn${i===6?' sel':''}" data-e="${e}">${e}</button>`).join('');
emoRow.querySelectorAll('.emo-btn').forEach(b=>{
  b.addEventListener('click',()=>{
    selEmoji=b.dataset.e;
    emoRow.querySelectorAll('.emo-btn').forEach(x=>x.classList.remove('sel'));
    b.classList.add('sel');
  });
});

document.getElementById('m-cancel').addEventListener('click',closeModal);
document.getElementById('modal-overlay').addEventListener('click',e=>{if(e.target.id==='modal-overlay')closeModal()});
function closeModal(){
  document.getElementById('modal-overlay').classList.remove('open');
  ['in-title','in-artist','in-album','in-dur'].forEach(id=>document.getElementById(id).value='');
  selEmoji='🎵';emoRow.querySelectorAll('.emo-btn').forEach((b,i)=>b.classList.toggle('sel',i===6));
}
document.getElementById('m-add').addEventListener('click',()=>{
  const t=document.getElementById('in-title').value.trim();
  const a=document.getElementById('in-artist').value.trim();
  if(!t||!a){
    document.getElementById('in-title').style.borderColor=t?'':'var(--danger)';
    document.getElementById('in-artist').style.borderColor=a?'':'var(--danger)';
    return;
  }
  const album=document.getElementById('in-album').value.trim()||'Unknown Album';
  const dur=document.getElementById('in-dur').value.trim()||'3:00';
  const cols=colorPairs[Math.floor(Math.random()*colorPairs.length)];
  saveNewSong({title:t,artist:a,album,duration:dur,cover_emoji:selEmoji,color1:cols.c1,color2:cols.c2,color3:cols.c3});
  closeModal();
});

/* ══════════════════════════════════════════
   CONTROLS
══════════════════════════════════════════ */
document.getElementById('back-btn').addEventListener('click',()=>{showScreen('screen-library');renderList()});
document.getElementById('play-btn').addEventListener('click',e=>togglePlay(e));
document.getElementById('next-btn').addEventListener('click',nextSong);
document.getElementById('prev-btn').addEventListener('click',prevSong);
document.getElementById('ml-play').addEventListener('click',e=>{e.stopPropagation();togglePlay(null)});
document.getElementById('ml-next').addEventListener('click',e=>{e.stopPropagation();nextSong()});
document.getElementById('ml-prev').addEventListener('click',e=>{e.stopPropagation();prevSong()});
document.getElementById('mini-player').addEventListener('click',()=>{if(curId){renderPlayer();showScreen('screen-player')}});
document.getElementById('fav-btn').addEventListener('click',()=>{
  const s=getSong(curId);if(!s)return;s.fav=!s.fav;saveFav(curId,s.fav);renderPlayer();renderList();
});
document.getElementById('shuffle-btn').addEventListener('click',()=>{
  shuffle=!shuffle;document.getElementById('shuffle-btn').classList.toggle('on',shuffle);
});
document.getElementById('repeat-btn').addEventListener('click',()=>{
  repeatMode=(repeatMode+1)%3;document.getElementById('repeat-btn').classList.toggle('on',repeatMode>0);
});
document.getElementById('seek-bar').addEventListener('input',e=>{
  progVal=parseFloat(e.target.value);setSeek(progVal);
  const s=getSong(curId);if(!s)return;
  const secs=progVal/100*durSec(s.duration);
  document.getElementById('t-curr').textContent=fmtSec(Math.floor(secs));
  if(audioPlayer)audioPlayer.currentTime=secs;
});
document.getElementById('vol-slider').addEventListener('input',e=>{
  document.getElementById('vol-slider').style.backgroundSize=`${e.target.value}% 100%`;
  if(audioPlayer)audioPlayer.volume=e.target.value/100;
});
document.querySelectorAll('.tab').forEach(t=>{
  t.addEventListener('click',()=>{
    currentTab=t.dataset.tab;
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');renderList();
  });
});
document.getElementById('search-input').addEventListener('input',renderList);

/* ══════════════════════════════════════════
   API
══════════════════════════════════════════ */
const API='http://localhost:3000/api';

async function loadSongs(){
  try{
    const res=await fetch(`${API}/songs`);
    const dbSongs=await res.json();
    songs=dbSongs.map(s=>({
      id:s.id,title:s.title||'Unknown Title',artist:s.artist||'Unknown Artist',
      album:s.album||'Single',duration:s.duration||'0:00',
      file_path:s.file_path,
      cover_image:s.cover_image||null,
      cover:s.cover_emoji||'🎵',
      c1:s.color1||'#7b2d8b',c2:s.color2||'#1a0630',c3:s.color3||'#3d1460',
      fav:!!s.is_favorite
    }));
    renderList();
  }catch(err){console.error('Could not load songs:',err)}
}

async function saveNewSong(data){
  try{
    const res=await fetch(`${API}/songs`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    const song=await res.json();
    songs.unshift({
      id:song.id,title:song.title,artist:song.artist,album:song.album,
      duration:song.duration,file_path:song.file_path,
      cover_image:song.cover_image||null,cover:song.cover_emoji||'🎵',
      c1:song.color1||'#7b2d8b',c2:song.color2||'#1a0630',c3:song.color3||'#3d1460',fav:false
    });
    renderList();
  }catch(err){console.error('Error adding song:',err)}
}

async function deleteFromDB(id){
  try{await fetch(`${API}/songs/${id}`,{method:'DELETE'})}
  catch(err){console.error('Error deleting:',err)}
}

async function saveFav(id,fav){
  try{
    await fetch(`${API}/songs/${id}/favorite`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fav})});
  }catch(err){console.error('Error saving fav:',err)}
}


loadSongs();
document.getElementById('vol-slider').style.backgroundSize='70% 100%';
