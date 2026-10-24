/* ==========================================================
   🔑 Gemini API key এখানে বসাও
   ========================================================== */
const GEMINI_API_KEY = 'AQ.Ab8RN6KMYRvjzrkqQ7P33D54nzUOgN8eeEg0slubylAENwkZAw';
const GEMINI_MODEL = 'gemini-3.5-flash';

/* ================= 4D BACKGROUND ================= */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let W, H;
function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
resize();
addEventListener('resize', resize);

const particles = [];
const NUM = 70;
class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.z = Math.random() * 2 + 0.4;
    this.size = Math.random() * 1.8 + 0.6;
    this.sx = (Math.random() - 0.5) * 0.4;
    this.sy = (Math.random() - 0.5) * 0.4;
    this.hue = Math.random() * 80 + 175;
  }
  update() {
    this.x += this.sx * this.z;
    this.y += this.sy * this.z;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * this.z, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${this.hue}, 100%, 65%, 0.65)`;
    ctx.shadowBlur = 14;
    ctx.shadowColor = `hsl(${this.hue}, 100%, 65%)`;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
for (let i = 0; i < NUM; i++) particles.push(new Particle());

let angle4d = 0;
const verts = [];
for (let i = 0; i < 16; i++) verts.push([(i&1)?1:-1,(i&2)?1:-1,(i&4)?1:-1,(i&8)?1:-1]);
const edges = [];
for (let i = 0; i < 16; i++)
  for (let j = i+1; j < 16; j++)
    if (((i^j) & ((i^j)-1)) === 0) edges.push([i,j]);

function rot(v, a1, a2) {
  const c1 = Math.cos(a1), s1 = Math.sin(a1);
  const c2 = Math.cos(a2), s2 = Math.sin(a2);
  const x = v[0]*c1 - v[1]*s1;
  const y = v[0]*s1 + v[1]*c1;
  const z2 = v[2]*c2 - v[3]*s2;
  const w2 = v[2]*s2 + v[3]*c2;
  return [x,y,z2,w2];
}
function proj(v, s, cx, cy) {
  const d = 3;
  const k = d / (d - v[3]);
  return { x: cx + v[0]*s*k, y: cy + v[1]*s*k, s: k };
}
function drawTesseract() {
  angle4d += 0.006;
  const cx = W/2, cy = H/2;
  const s = Math.min(W,H) * 0.22;
  const r = verts.map(v => rot(v, angle4d, angle4d*0.7));
  const p = r.map(v => proj(v, s, cx, cy));
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.14)';
  ctx.lineWidth = 1;
  edges.forEach(([a,b]) => {
    ctx.beginPath();
    ctx.moveTo(p[a].x, p[a].y);
    ctx.lineTo(p[b].x, p[b].y);
    ctx.stroke();
  });
  p.forEach(pt => {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 2.4 * pt.s, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(124, 92, 255, 0.8)';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#7c5cff';
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}
function animate() {
  ctx.fillStyle = document.body.classList.contains('light-mode')
    ? 'rgba(238, 242, 255, 0.18)'
    : 'rgba(5, 7, 15, 0.18)';
  ctx.fillRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  drawTesseract();
  requestAnimationFrame(animate);
}
animate();

/* ================= THEME ================= */
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  themeIcon.textContent = document.body.classList.contains('light-mode') ? '☀️' : '🌙';
});

/* ================= CHAT ================= */
const chatBox = document.getElementById('chat-box');
const input = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const imageUpload = document.getElementById('image-upload');
const previewContainer = document.getElementById('preview-container');

let uploadedImage = null;
let uploadedImageMime = null;
let chatHistory = [];

input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 130) + 'px';
});
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
sendBtn.addEventListener('click', sendMessage);

imageUpload.addEventListener('change', (e) => {
  const f = e.target.files[0];
  if (!f) return;
  if (f.size > 6 * 1024 * 1024) { alert('Max 6MB'); imageUpload.value = ''; return; }
  uploadedImageMime = f.type;
  const r = new FileReader();
  r.onload = (ev) => { uploadedImage = ev.target.result; renderPreview(); };
  r.readAsDataURL(f);
});

function renderPreview() {
  previewContainer.innerHTML = '';
  if (!uploadedImage) return;
  const w = document.createElement('div');
  w.className = 'preview-wrap';
  w.innerHTML = `<img src="${uploadedImage}" alt="preview"><button class="remove-img">&times;</button>`;
  w.querySelector('.remove-img').addEventListener('click', () => {
    uploadedImage = null; uploadedImageMime = null;
    imageUpload.value = ''; renderPreview();
  });
  previewContainer.appendChild(w);
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function formatText(text) {
  if (!text) return '';
  const parts = text.split(/```/);
  let html = '';
  parts.forEach((part, i) => {
    if (i % 2 === 1) {
      html += `<pre><code>${esc(part.replace(/^\w*\n/, '').trim())}</code></pre>`;
    } else {
      let t = esc(part);
      t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      t = t.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
      t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
      t = t.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');
      t = t.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
      t = t.replace(/\n/g, '<br>');
      html += t;
    }
  });
  return html;
}

function addMessage(role, text, image = null) {
  const msg = document.createElement('div');
  msg.className = `message ${role}`;
  const av = document.createElement('div');
  av.className = role === 'user' ? 'user-avatar' : 'ai-avatar';
  av.textContent = role === 'user' ? '👤' : '◈';
  const ct = document.createElement('div');
  ct.className = 'msg-content';
  ct.innerHTML = formatText(text);
  if (image) {
    const im = document.createElement('img');
    im.src = image;
    ct.appendChild(im);
  }
  msg.appendChild(av); msg.appendChild(ct);
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addTyping() {
  const m = document.createElement('div');
  m.className = 'message ai';
  m.id = 'typing-msg';
  m.innerHTML = `<div class="ai-avatar">◈</div><div class="msg-content"><div class="typing"><span></span><span></span><span></span></div></div>`;
  chatBox.appendChild(m);
  chatBox.scrollTop = chatBox.scrollHeight;
}
function removeTyping() { document.getElementById('typing-msg')?.remove(); }

async function getAIResponse(userText, img, mime) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('YOUR_GEMINI')) {
    return `⚠️ **API Key Missing**\n\nSet your Gemini API key at the top of \`script.js\`.\n\nGet one free: https://aistudio.google.com/apikey`;
  }
  const parts = [];
  if (userText?.trim()) parts.push({ text: userText.trim() });
  if (img && mime) parts.push({ inline_data: { mime_type: mime, data: img.split(',')[1] } });
  if (!parts.length) parts.push({ text: 'Hello' });

  const sys = `You are FAIZAN AI, an intelligent assistant by Md. Faizan Islam. Solve ANY problem: math, coding, science, translation, writing, general knowledge. If an image is provided, analyze it carefully — read text, solve equations, describe diagrams, explain code. Match the user's language (Bangla or English). Format clearly.`;

  const body = {
    system_instruction: { parts: [{ text: sys }] },
    contents: chatHistory.concat([{ role: 'user', parts }]),
    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
  };

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      let m = `HTTP ${res.status}`;
      try { m = (await res.json()).error?.message || m; } catch (_) {}
      if (res.status === 429) return `⏳ Rate limit reached. Wait a moment.`;
      if (res.status === 404) return `⚠️ Model unavailable. Check GEMINI_MODEL.`;
      return `⚠️ **Error ${res.status}**\n\n${m}`;
    }
    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.map(p => p.text).filter(Boolean).join('\n') || '';
    if (!reply) return `🤔 Empty response. Try again.`;
    chatHistory.push({ role: 'user', parts: [{ text: userText || '[image]' }] });
    chatHistory.push({ role: 'model', parts: [{ text: reply }] });
    if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
    return reply;
  } catch (err) {
    return `❌ **Connection Error**\n\n${err.message}`;
  }
}

async function sendMessage() {
  const text = input.value.trim();
  const img = uploadedImage;
  const mime = uploadedImageMime;
  if (!text && !img) return;

  addMessage('user', text || '📷 [Image sent]', img);
  input.value = ''; input.style.height = 'auto';
  uploadedImage = null; uploadedImageMime = null;
  imageUpload.value = ''; renderPreview();

  sendBtn.disabled = true;
  addTyping();
  const reply = await getAIResponse(text, img, mime);
  removeTyping();
  addMessage('ai', reply);
  sendBtn.disabled = false;
  input.focus();
}
