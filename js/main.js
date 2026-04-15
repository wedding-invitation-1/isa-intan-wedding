/* =============================================
   UNDANGAN PERNIKAHAN – Isa & Intan
   main.js – Semua logika JavaScript
   ============================================= */

/* ══════════════════════════════════════════════
   ✏️  CONFIG – Edit semua data di sini
   ══════════════════════════════════════════════
   HITUNG MUNDUR: Cukup ubah weddingDate di bawah.
   Format: 'YYYY-MM-DDTHH:MM:SS'
   Contoh:  '2025-12-25T08:00:00'  = 25 Des 2025 pukul 08.00
   ══════════════════════════════════════════════ */
const CONFIG = {
  // ▼ Tanggal & jam pernikahan – ubah di sini, hitung mundur otomatis menyesuaikan
  weddingDate: new Date('2030-11-22T08:00:00'),

  waNumber:    '6281219879171',   // Nomor WA tanpa tanda + (contoh: 6281219879171)
  email:       'muhamadisafirdaus123@gmail.com',
  mapLat:      -6.3955,
  mapLng:      106.8272,
  mapZoom:     15,

  // ▼ Firebase Realtime Database URL
  // Daftar gratis di https://firebase.google.com → buat project → Realtime Database
  // Ganti URL di bawah dengan URL database Anda (akhiri dengan /)
  firebaseUrl: 'https://couple-gallery-isa-default-rtdb.asia-southeast1.firebasedatabase.app//',
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
   UCAPAN / WISHES – Firebase Real-time Database
   Semua tamu bisa melihat ucapan secara langsung
   ========================================= */

/** Escape HTML untuk keamanan input */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/** Buat elemen kartu ucapan */
function createWishCard(w, isNew = false) {
  const el = document.createElement('div');
  el.className = 'wish-card' + (isNew ? ' new-wish' : '');
  const attendLabel = w.attend === 'hadir' ? '✅ Hadir'
                    : w.attend === 'tidak' ? '❌ Tidak Hadir'
                    : '🤔 Mungkin';
  el.innerHTML = `
    <p class="wish-text">${escapeHtml(w.text)}</p>
    <div class="wish-meta">
      <span class="wish-name">— ${escapeHtml(w.name)}</span>
      <span class="wish-attend ${w.attend}">${attendLabel}</span>
    </div>`;
  return el;
}

/* ─── Firebase REST listener ─── */
let wishesCache = {};    // key → wish object
let firstLoad   = true;

/** Mulai mendengarkan perubahan dari Firebase secara real-time (SSE) */
function startRealtimeListener() {
  const url = CONFIG.firebaseUrl + 'wishes.json';

  // Gunakan EventSource (Server-Sent Events) bawaan Firebase
  try {
    const es = new EventSource(url);

    es.addEventListener('put', (e) => {
      const data = JSON.parse(e.data);
      if (data.path === '/' && data.data) {
        // Load awal: semua data
        wishesCache = data.data;
        renderAllWishes();
        firstLoad = false;
      } else if (data.path !== '/' && data.data) {
        // Data baru ditambahkan
        const key = data.path.replace('/', '');
        wishesCache[key] = data.data;
        if (!firstLoad) {
          prependWishCard(data.data);
        }
      } else if (data.path === '/' && !data.data) {
        // Database kosong
        wishesCache = {};
        renderAllWishes();
        firstLoad = false;
      }
    });

    es.addEventListener('patch', (e) => {
      const data = JSON.parse(e.data);
      if (data.data) {
        Object.assign(wishesCache, data.data);
        renderAllWishes();
      }
    });

    es.onerror = () => {
      // Fallback ke polling jika SSE gagal
      es.close();
      pollWishes();
    };
  } catch (err) {
    pollWishes();
  }
}

/** Fallback: polling tiap 5 detik jika SSE tidak tersedia */
function pollWishes() {
  fetchWishes();
  setInterval(fetchWishes, 5000);
}

async function fetchWishes() {
  try {
    const res  = await fetch(CONFIG.firebaseUrl + 'wishes.json');
    const data = await res.json();
    wishesCache = data || {};
    renderAllWishes();
  } catch (e) { /* silent */ }
}

/** Render semua ucapan dari cache (terbaru di atas) */
function renderAllWishes() {
  const container = document.getElementById('wishes-container');
  const entries = Object.values(wishesCache);
  if (!entries.length) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-light);font-size:.85rem;padding:2rem;">Belum ada ucapan. Jadilah yang pertama! 💌</p>';
    return;
  }
  // Urutkan: terbaru di atas (berdasarkan timestamp)
  entries.sort((a, b) => (b.ts || 0) - (a.ts || 0));
  container.innerHTML = '';
  entries.forEach(w => container.appendChild(createWishCard(w, false)));
}

/** Sisipkan satu kartu baru di atas (real-time dari orang lain) */
function prependWishCard(w) {
  const container = document.getElementById('wishes-container');
  // Hapus pesan "belum ada ucapan" jika ada
  const empty = container.querySelector('p');
  if (empty) container.innerHTML = '';
  const card = createWishCard(w, true);
  container.insertBefore(card, container.firstChild);
  container.scrollTo({ top: 0, behavior: 'smooth' });
}

/** Kirim ucapan ke Firebase */
async function submitWish() {
  const name   = document.getElementById('wish-name').value.trim();
  const attend = document.getElementById('wish-attend').value;
  const text   = document.getElementById('wish-text').value.trim();

  if (!name || !attend || !text) {
    showToast('⚠ Harap isi semua kolom!');
    return;
  }

  const btn = document.querySelector('#ucapan .btn-primary');
  btn.disabled = true;
  btn.textContent = 'Mengirim...';

  const wish = { name, attend, text, ts: Date.now() };

  try {
    const res = await fetch(CONFIG.firebaseUrl + 'wishes.json', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(wish),
    });

    if (!res.ok) throw new Error('Firebase error');

    // Tampilkan langsung di UI (optimistic update)
    prependWishCard(wish);

    // Reset form
    document.getElementById('wish-name').value   = '';
    document.getElementById('wish-attend').value = '';
    document.getElementById('wish-text').value   = '';

    showToast('✓ Ucapan berhasil dikirim! 💌');
  } catch (err) {
    // Fallback ke localStorage jika offline
    let local = JSON.parse(localStorage.getItem('wedding_wishes') || '[]');
    local.push(wish);
    localStorage.setItem('wedding_wishes', JSON.stringify(local));
    prependWishCard(wish);
    document.getElementById('wish-name').value   = '';
    document.getElementById('wish-attend').value = '';
    document.getElementById('wish-text').value   = '';
    showToast('⚠ Tersimpan lokal (offline). Akan sync saat online.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Kirim Ucapan ✉';
  }
}

// Mulai listener saat halaman siap
startRealtimeListener();

/* =========================================
   RSVP – WhatsApp (langsung terkirim) & Email
   ========================================= */
function buildMessage() {
  const name  = document.getElementById('rsvp-name').value.trim() || '(Nama tidak diisi)';
  const count = document.getElementById('rsvp-count').value;
  const msg   = document.getElementById('rsvp-msg').value.trim() || '-';
  return `Assalamu'alaikum, saya *${name}* akan hadir dalam acara pernikahan Isa & Intan bersama *${count}*.\n\nPesan: ${msg}\n\n_Terkirim dari undangan online_`;
}

/** WA: buka langsung ke chat dengan pesan terisi */
function sendViaWA() {
  const name  = document.getElementById('rsvp-name').value.trim();
  const count = document.getElementById('rsvp-count').value;
  const msg   = document.getElementById('rsvp-msg').value.trim() || '-';
  if (!name) { showToast('⚠ Isi nama terlebih dahulu!'); return; }

  const text = encodeURIComponent(
    `Assalamu'alaikum, saya *${name}* akan hadir dalam acara pernikahan Isa & Intan bersama *${count}*.\n\nPesan: ${msg}\n\n_Terkirim dari undangan online_`
  );
  // wa.me membuka WA langsung ke chat tanpa perlu simpan kontak
  window.open(`https://wa.me/${CONFIG.waNumber}?text=${text}`, '_blank');
}

/** Email: gunakan mailto yang sudah diformat lengkap */
function sendViaEmail() {
  const name  = document.getElementById('rsvp-name').value.trim() || '(Nama tidak diisi)';
  const count = document.getElementById('rsvp-count').value;
  const msg   = document.getElementById('rsvp-msg').value.trim() || '-';

  const subject = encodeURIComponent(`RSVP Pernikahan Isa & Intan – ${name}`);
  // Gunakan %0D%0A (CRLF) untuk baris baru di mailto yang kompatibel lintas client
  const body = encodeURIComponent(
    `Assalamu'alaikum,\r\n\r\nSaya ${name} akan hadir dalam acara pernikahan Isa & Intan bersama ${count}.\r\n\r\nPesan: ${msg}\r\n\r\nTerkirim dari undangan online.`
  );

  const mailtoUrl = `mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
  const a = document.createElement('a');
  a.href = mailtoUrl;
  a.click();
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
