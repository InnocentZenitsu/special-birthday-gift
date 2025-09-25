// script.js

/* ---------------- GLOBAL ---------------- */
let bgAudio = null;
let roseTimer = null;

/* ---------------- COUNTDOWN (Dhaka Time) ---------------- */
function initCountdown() {
  const el = document.getElementById('countdown');
  const chapterBtns = document.getElementById('chapter-buttons');

 // Target: Oct 17, 2025 00:00 Dhaka (UTC+6)
const targetUTC = Date.UTC(2025, 9, 16, 18, 0, 0);




  function pad(n){ return String(n).padStart(2,'0'); }

  function update(){
    const nowUTC = Date.now();
    const diff = targetUTC - nowUTC;
    if (diff <= 0){
      if (el) el.textContent = '00d 00h 00m 00s';
      if (chapterBtns) chapterBtns.style.display = 'block';
      clearInterval(timer);
      return;
    }
    const s = Math.floor(diff / 1000);
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    if (el) el.textContent = `${days}d ${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`;
  }

  update();
  const timer = setInterval(update, 1000);
}

/* ---------------- MUSIC ---------------- */
function initAudioElement(){
  bgAudio = document.getElementById('bgMusic');
  if (!bgAudio) return;
  bgAudio.loop = true;
  bgAudio.preload = 'auto';
  if (localStorage.getItem('bgMusicPlaying') === '1'){
    bgAudio.play().catch(()=>{});
  }
}

function setBtnState(isPlaying, btn){
  if (!btn) return;
  btn.textContent = isPlaying ? '⏸️ Pause' : '▶️ Play';
  btn.classList.toggle('playing', isPlaying);
}

function initMusicBindings(){
  if (!bgAudio) return;
  // reset listeners
  document.querySelectorAll('[data-play-music]').forEach(btn=>{
    setBtnState(!bgAudio.paused && !bgAudio.ended, btn);
    btn.replaceWith(btn.cloneNode(true));
  });

  document.querySelectorAll('[data-play-music]').forEach(btn=>{
    setBtnState(!bgAudio.paused && !bgAudio.ended, btn);
    btn.addEventListener('click', ()=>{
      if (bgAudio.paused){
        bgAudio.play().then(()=>{
          localStorage.setItem('bgMusicPlaying','1');
          setBtnState(true, btn);
        });
      } else {
        bgAudio.pause();
        localStorage.setItem('bgMusicPlaying','0');
        setBtnState(false, btn);
      }
    });
  });

  bgAudio.addEventListener('play', ()=> {
    document.querySelectorAll('[data-play-music]').forEach(b=> setBtnState(true,b));
  });
  bgAudio.addEventListener('pause', ()=> {
    document.querySelectorAll('[data-play-music]').forEach(b=> setBtnState(false,b));
  });
}

/* ---------------- ROSE RAIN ---------------- */
function spawnRose(){
  const r = document.createElement('div');
  r.className = 'rose';
  r.style.backgroundImage = "url('assets/images/rose.png')";
  const startX = Math.random() * (window.innerWidth - 40);
  r.style.left = startX + 'px';
  r.style.top = '-80px';
  const dur = 4500 + Math.random()*3000;
  const rot = (Math.random()*80)-40;
  const scale = 0.6 + Math.random()*0.9;
  r.style.transform = `rotate(${rot}deg) scale(${scale})`;
  document.body.appendChild(r);

  r.style.transition = `transform ${dur}ms linear, top ${dur}ms linear, opacity 1s linear`;
  r.getBoundingClientRect();
  r.style.top = (window.innerHeight + 120) + 'px';
  r.style.left = (startX + (Math.random()*160-80)) + 'px';
  r.style.opacity = '0';

  setTimeout(()=> r.remove(), dur + 900);
}

function startRoseRain(){
  if (roseTimer) return;
  roseTimer = setInterval(spawnRose, 350);
}
function stopRoseRain(){
  if (roseTimer) clearInterval(roseTimer);
  roseTimer = null;
  document.querySelectorAll('.rose').forEach(r=> r.style.opacity = '0');
}

/* ---------------- SPA CHAPTER LOADER ---------------- */
function loadChapter(file){
  const main = document.getElementById('main-container');
  if (main) main.style.display = 'none';

  const content = document.getElementById('content');
  if (!content) return;

  fetch(file)
    .then(res => res.text())
    .then(html => {
      content.innerHTML = html;
      initMusicBindings();
      if (file === 'birthday.html' || content.querySelector('.birthday-page')) {
        startRoseRain();
      } else {
        stopRoseRain();
      }
      content.classList.remove('fade-out');
    })
    .catch(err => {
      console.error(err);
      content.innerHTML = `<div class="container"><p>Sorry, couldn't load the page.</p><button class="btn" onclick="goHome()">Back</button></div>`;
    });
}

function goTo(nextPage){
  document.body.classList.add('fade-out');
  setTimeout(()=> {
    loadChapter(nextPage);
    document.body.classList.remove('fade-out');
  }, 250);
}

function goHome(){
  stopRoseRain();
  const main = document.getElementById('main-container');
  const content = document.getElementById('content');
  if (content) content.innerHTML = '';
  if (main) main.style.display = 'block';
}

/* ---------------- INIT ---------------- */
document.addEventListener('DOMContentLoaded', ()=>{
  initAudioElement();
  initMusicBindings();
  if (document.getElementById('countdown')) initCountdown();
});


