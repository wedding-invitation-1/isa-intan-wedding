/* =============================================
   UNDANGAN PERNIKAHAN – Isa & Intan
   main.js – Semua logika JavaScript
   ============================================= */

/* ── CONFIG – Edit sesuai kebutuhan ── */
const CONFIG = {
  weddingDate: new Date('2025-06-14T08:00:00'),
  waNumber:    '6281219879171',   // Nomor WA tanpa tanda +
  email:       'muhamadisafirdaus123n@gmail.com',
  mapLat:      -6.3955,
  mapLng:      106.8272,
  mapZoom:     15,
};

/* =========================================
   COVER – Animasi kelopak bunga
   ========================================= */
const petalsEl = document.getElementById('petals');
for (let i = 0; i < 18; i++) {
  const p = document.createElement('div');
  p.className = 'petal';
  p.style.cssText = `
    left:${Math.random()*100}%;
    top:${Math.random()*-20}%;
    animation-duration:${5 + Math.random()*6}s;
    animation-delay:${Math.random()*6}s;
    transform:rotate(${Math.random()*360}deg) scale(${0.6+Math.random()*.8});
  `;
  petalsEl.appendChild(p);
}

/* ── Buka undangan ── */
function openInvitation() {
  document.getElementById('cover').classList.add('hidden');
  document.getElementById('navbar').classList.add('visible');
}

/* =========================================
   NAVBAR – Hamburger menu
   ========================================= */
function toggleMenu() {
  const navlinks   = document.getElementById('navlinks');
  const hamburger  = document.getElementById('hamburger');
  navlinks.classList.toggle('open');
  hamburger.classList.toggle('active');
}

function closeMenu() {
  document.getElementById('navlinks').classList.remove('open');
  document.getElementById('hamburger').classList.remove('active');
}

/* =========================================
   COUNTDOWN – Hitung mundur
   ========================================= */
function updateCountdown() {
  const now  = new Date();
  const diff = CONFIG.weddingDate - now;
  if (diff <= 0) {
    ['cd-days','cd-hours','cd-mins','cd-secs']
      .forEach(id => document.getElementById(id).textContent = '00');
    return;
  }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  document.getElementById('cd-days').textContent  = String(d).padStart(2,'0');
  document.getElementById('cd-hours').textContent = String(h).padStart(2,'0');
  document.getElementById('cd-mins').textContent  = String(m).padStart(2,'0');
  document.getElementById('cd-secs').textContent  = String(s).padStart(2,'0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

/* =========================================
   MAP – Leaflet lazy-init
   ========================================= */
let mapInitialized = false;
function initMap() {
  if (mapInitialized) return;
  mapInitialized = true;
  const map = L.map('map').setView([CONFIG.mapLat, CONFIG.mapLng], CONFIG.mapZoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  const icon = L.divIcon({
    html: '<div style="background:#c9a96e;color:#fff;padding:6px 10px;border-radius:4px;font-size:12px;white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,.3);">💍 Gedung Graha Pesona</div>',
    className: '', iconAnchor: [70, 36]
  });
  L.marker([CONFIG.mapLat, CONFIG.mapLng], { icon }).addTo(map);
}
const mapObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) initMap(); });
}, { threshold: 0.1 });
mapObserver.observe(document.getElementById('map'));

/* =========================================
   SCROLL REVEAL
   ========================================= */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* =========================================
   FAMILY TABS
   ========================================= */
function showFamily(side) {
  document.querySelectorAll('.family-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.family-panel').forEach(p => p.classList.remove('active'));
  document.querySelector(`[onclick="showFamily('${side}')"]`).classList.add('active');
  document.getElementById(`family-${side}`).classList.add('active');
}

/* =========================================
   UCAPAN / WISHES – Real-time
   ========================================= */
const defaultWishes = [
  { name:'Bunda Kartini', attend:'hadir', text:'Selamat menempuh hidup baru! Semoga sakinah, mawaddah, warahmah. Barakallahu lakuma.' },
  { name:'Pak Andi & Keluarga', attend:'hadir', text:'Bahagia sekali mendengar kabar bahagia ini. Semoga menjadi keluarga yang selalu diberkahi Allah SWT. Aamiin.' },
  { name:'Teman-teman Kampus', attend:'mungkin', text:'Congrats bestie! Wish you all the happiness in the world. Kalian memang jodoh sejati 🌸' },
];

let wishes = JSON.parse(localStorage.getItem('wedding_wishes') || 'null') || defaultWishes;

/** Render satu kartu ucapan */
function createWishCard(w, isNew = false) {
  const el = document.createElement('div');
  el.className = 'wish-card' + (isNew ? ' new-wish' : '');
  el.innerHTML = `
    <p class="wish-text">${escapeHtml(w.text)}</p>
    <div class="wish-meta">
      <span class="wish-name">— ${escapeHtml(w.name)}</span>
      <span class="wish-attend ${w.attend}">${
        w.attend === 'hadir'   ? '✅ Hadir' :
        w.attend === 'tidak'   ? '❌ Tidak Hadir' :
                                 '🤔 Mungkin'
      }</span>
    </div>`;
  return el;
}

/** Escape HTML untuk keamanan input */
function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/** Render semua ucapan */
function renderWishes() {
  const container = document.getElementById('wishes-container');
  container.innerHTML = '';
  [...wishes].reverse().forEach(w => {
    container.appendChild(createWishCard(w, false));
  });
}
renderWishes();

/** Kirim ucapan baru – tampil real-time tanpa reload */
function submitWish() {
  const name   = document.getElementById('wish-name').value.trim();
  const attend = document.getElementById('wish-attend').value;
  const text   = document.getElementById('wish-text').value.trim();

  if (!name || !attend || !text) {
    showToast('⚠ Harap isi semua kolom!');
    return;
  }

  const newWish = { name, attend, text };
  wishes.push(newWish);
  localStorage.setItem('wedding_wishes', JSON.stringify(wishes));

  /* Tampilkan real-time: sisipkan di atas tanpa rebuild semua */
  const container = document.getElementById('wishes-container');
  const card = createWishCard(newWish, true);
  container.insertBefore(card, container.firstChild);

  /* Scroll ke atas wishes grid */
  container.scrollTo({ top: 0, behavior: 'smooth' });

  /* Reset form */
  document.getElementById('wish-name').value    = '';
  document.getElementById('wish-attend').value  = '';
  document.getElementById('wish-text').value    = '';

  showToast('✓ Ucapan berhasil dikirim! 💌');
}

/* =========================================
   RSVP – WhatsApp & Email
   ========================================= */
function buildMessage() {
  const name  = document.getElementById('rsvp-name').value.trim() || '(Nama tidak diisi)';
  const count = document.getElementById('rsvp-count').value;
  const msg   = document.getElementById('rsvp-msg').value.trim() || '-';
  return `Assalamu'alaikum, saya *${name}* akan hadir dalam acara pernikahan Isa & Intan bersama *${count}* tamu.\n\nPesan: ${msg}\n\n_Terkirim dari undangan online_`;
}

function sendViaWA() {
  const text = encodeURIComponent(buildMessage());
  window.open(`https://wa.me/${CONFIG.waNumber}?text=${text}`, '_blank');
}

function sendViaEmail() {
  const name = document.getElementById('rsvp-name').value.trim() || '(Nama tidak diisi)';
  const body = encodeURIComponent(buildMessage());
  const sub  = encodeURIComponent(`RSVP Pernikahan Isa & Intan – ${name}`);
  window.open(`mailto:${CONFIG.email}?subject=${sub}&body=${body}`, '_blank');
}

/* =========================================
   COPY TEXT – Salin nomor rekening / alamat
   ========================================= */
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('✓ Nomor berhasil disalin!');
    const orig = btn.textContent;
    btn.textContent = '✓ Tersalin!';
    setTimeout(() => btn.textContent = orig, 2000);
  }).catch(() => {
    prompt('Salin teks berikut:', text);
  });
}

/* =========================================
   LIGHTBOX – Galeri foto
   ========================================= */
function openLightbox(item) {
  const img = item.querySelector('img');
  if (img) {
    document.getElementById('lightbox-img').src = img.src;
    document.getElementById('lightbox').classList.add('open');
  }
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
}
/* Tutup lightbox dengan tombol Escape */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

/* =========================================
   TOAST NOTIFICATION
   ========================================= */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
