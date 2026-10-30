const form = document.getElementById("formDaftar");
const sukses = document.getElementById("sukses");
const mascot = document.getElementById("mascot");
const wajah = document.getElementById("wajah");
const gelembung = document.getElementById("gelembung");

/* =========================================================
   ANIMASI MASKOT — foto stiker diputar frame-by-frame (flipbook)
   Angka 1-12 = urutan stiker pada foto (kiri-kanan, atas-bawah)
   ========================================================= */
const ANIM = {
  diam:   { f: [12, 10, 12, 1, 12, 3], fps: 3 },   // santai
  dengar: { f: [10, 2, 10, 3], fps: 3 },           // mengisi nama / email / ekskul
  tutup:  { f: [4, 7, 4, 7], fps: 2.5 },           // mengisi password (mata tertutup)
  salah:  { f: [5, 6, 5, 6, 5, 6], fps: 8 },       // data salah
  marah:  { f: [6, 5, 6, 5, 6, 5], fps: 8 },       // submit gagal
  kedip:  { f: [3, 12, 3], fps: 6 },               // kolom benar
  kaget:  { f: [8, 9, 8], fps: 5 },                // kursor di tombol daftar
  senang: { f: [11, 1, 11, 12, 11, 1], fps: 8 },   // berhasil
  pilih:  { f: [1, 11, 1], fps: 6 },               // memilih ekskul
  tidur:  { f: [7], fps: 1 },                      // lama tidak disentuh
  joget:  { f: [1, 11, 12, 1, 11, 12], fps: 10 },  // joget
};
const KOLOM = [14, 238, 477], BARIS = [5, 267, 533, 800]; // posisi tiap stiker pada foto
const acak = (arr) => arr[Math.floor(Math.random() * arr.length)];

let jalan = "", idx = 0, tick, sibuk = false, timerAksi, timerKecil, bicara;
let tidur = false, terakhir = Date.now(), ketikan = 0, detik = 0;

function tampil(n) {
  n -= 1;
  const x = KOLOM[n % 3] / (736 - 236) * 100;
  const y = BARIS[Math.floor(n / 3)] / (1104 - 262) * 100;
  wajah.style.backgroundPosition = x + "% " + y + "%";
}

// Mainkan animasi bernama p (diulang terus sampai diganti)
function pose(p, paksa) {
  if (p === jalan && !paksa) return;
  jalan = p; idx = 0;
  mascot.dataset.pose = p; // dipakai CSS untuk ekspresi kucing
  clearInterval(tick);
  const a = ANIM[p];
  tampil(a.f[0]);
  tick = setInterval(() => { idx = (idx + 1) % a.f.length; tampil(a.f[idx]); }, 1000 / a.fps);
}

// Kembali ke pose yang cocok dengan kolom yang sedang aktif
function pulihkan() {
  if (sibuk) return;
  if (tidur) return pose("tidur");
  const a = document.activeElement;
  if (a === form.password || a === form.konfirmasi) pose("tutup");
  else if (a === form.nama || a === form.email || a === form.ekskul) pose("dengar");
  else pose("diam");
}

// Aksi besar (geleng / loncat): kelas CSS + pose, lalu kembali normal
function aksi(kelas, p, ms) {
  clearTimeout(timerAksi); clearTimeout(timerKecil);
  sibuk = true;
  mascot.classList.remove("geleng", "senang", ...Object.keys(GAYA).map((g) => "g-" + g));
  void mascot.getBoundingClientRect(); // restart animasi
  mascot.classList.add(kelas);
  pose(p, true);
  timerAksi = setTimeout(() => {
    mascot.classList.remove(kelas);
    sibuk = false;
    pulihkan();
  }, ms);
}
const gelengKepala = (marah = false) => aksi("geleng", marah ? "marah" : "salah", 1000);
const rayakan = () => aksi("senang", "senang", 1100);

// Gaya khusus karakter: putar, salto, goyang, joget, pusing
const GAYA = {
  putar:  { ms: 850,  p: "senang", kata: ["Wuuush! 🌀", "Tada! ✨"] },
  lompat: { ms: 1050, p: "senang", kata: ["Hup! Salto! 🤸", "Yihaa! 😆"] },
  goyang: { ms: 950,  p: "kedip",  kata: ["Hehe~ 😋", "Lalala 🎵"] },
  joget:  { ms: 1600, p: "joget",  kata: ["Joget dulu 💃", "Ayo goyang 🎶"] },
  meong:  { ms: 950,  p: "kedip",  kata: ["Meong~ 🐾", "Nyaa~ 😺", "Purr purr 💕"] },
  pusing: { ms: 1350, p: "marah",  kata: ["Aduh pusing... 😵‍💫"] },
};
function gaya(nama) {
  if (sibuk || tidur) return;
  const g = GAYA[nama];
  aksi("g-" + nama, g.p, g.ms);
  omong(acak(g.kata), 1400);
  burst(nama === "pusing" ? ["💫", "⭐"] : ["✨", "🎵", "💖"], nama === "joget" ? 5 : 3);
}

// Ganti pose sebentar (kedip, kaget, dll)
function sekejap(p, ms) {
  if (sibuk) return;
  clearTimeout(timerKecil);
  pose(p, true);
  timerKecil = setTimeout(pulihkan, ms);
}

// Hop kecil tiap mengetik
function loncatKecil() {
  mascot.classList.remove("ketik");
  void mascot.getBoundingClientRect();
  mascot.classList.add("ketik");
}
mascot.addEventListener("animationend", (e) => { if (e.animationName === "hop") mascot.classList.remove("ketik"); });

/* ---------- gelembung ucapan ---------- */
function omong(teks, ms = 2200) {
  clearTimeout(bicara);
  gelembung.textContent = teks;
  gelembung.hidden = false;
  gelembung.classList.remove("muncul");
  void gelembung.offsetWidth;
  gelembung.classList.add("muncul");
  if (ms) bicara = setTimeout(() => { gelembung.hidden = true; }, ms);
}

/* ---------- emoji beterbangan ---------- */
function burst(daftar, jumlah) {
  for (let i = 0; i < jumlah; i++) {
    const s = document.createElement("span");
    s.className = "partikel";
    s.textContent = acak(daftar);
    s.style.setProperty("--dx", (Math.random() * 170 - 85).toFixed(0) + "px");
    s.style.setProperty("--dy", -(55 + Math.random() * 90).toFixed(0) + "px");
    s.style.setProperty("--rot", (Math.random() * 60 - 30).toFixed(0) + "deg");
    s.style.animationDelay = (i * 0.04).toFixed(2) + "s";
    mascot.appendChild(s);
    setTimeout(() => s.remove(), 1500 + i * 40);
  }
}

/* ---------- tidur kalau lama tidak disentuh ---------- */
function aktif() {
  terakhir = Date.now();
  if (tidur) {
    tidur = false;
    mascot.classList.remove("tidur");
    pulihkan();
    omong("Halo lagi! 👋", 1500);
  }
}
["keydown", "pointerdown", "mousemove", "touchstart"].forEach((e) => document.addEventListener(e, aktif, { passive: true }));
setInterval(() => {
  detik++;
  if (!tidur && !sibuk && Date.now() - terakhir > 12000) {
    tidur = true;
    mascot.classList.add("tidur");
    pose("tidur");
    omong("Zzz... 💤", 0);
  }
  // sesekali karakter beraksi sendiri saat santai
  if (jalan === "diam" && !sibuk && !tidur && detik % 5 === 0 && Math.random() < 0.7) gaya(acak(["putar", "lompat", "goyang", "joget", "meong", "meong"]));
  if (tidur && detik % 3 === 0) burst(["💤"], 1);
}, 1000);

/* ---------- reaksi tiap kolom ---------- */
const SAPA = {
  nama: "Siapa namamu? 😊",
  email: "Emailnya apa nih? 📧",
  password: "Ssst... aku nggak ngintip 🙈",
  konfirmasi: "Ulangi sekali lagi ya 🔒",
  ekskul: "Pilih yang paling seru! ✨",
};
["nama", "email", "password", "konfirmasi", "ekskul"].forEach((nama) => {
  const el = form[nama];
  el.addEventListener("focus", () => { pulihkan(); if (!sibuk) omong(SAPA[nama]); }); // jangan hapus timer: aksi harus selesai sendiri
  el.addEventListener("input", () => {
    loncatKecil();
    if (++ketikan % 3 === 0) burst(["✨", "💖", "⭐"], 1);
  });
});
form.ekskul.addEventListener("change", () => {
  if (sibuk || !form.ekskul.value) return;
  sekejap("pilih", 900);
  omong(`Wah, ${form.ekskul.value}! Keren 😍`);
  burst(["⭐", "🎉"], 3);
});

// Kaget & semangat saat kursor di tombol daftar
const tombol = form.querySelector("button[type=submit]");
tombol.addEventListener("mouseenter", () => { if (!sibuk && !tidur) { pose("kaget"); omong("Klik klik klik! 🤩", 1500); } });
tombol.addEventListener("mouseleave", pulihkan);

// Kucing disentuh -> meong
document.getElementById("kucing").addEventListener("click", (e) => {
  e.stopPropagation();
  mascot.classList.remove("meong");
  void mascot.getBoundingClientRect();
  mascot.classList.add("meong");
  setTimeout(() => mascot.classList.remove("meong"), 950);
  omong(acak(["Meong! 🐱", "Nyaa~ 😺", "Mrrr... 💕", "Elus aku 🐾"]), 1500);
  burst(["🐾", "💖", "🐟"], 3);
});

// Maskot disentuh / diklik
let klik = 0, timerKlik;
mascot.addEventListener("click", () => {
  klik++;
  clearTimeout(timerKlik);
  timerKlik = setTimeout(() => { klik = 0; }, 1500);
  if (klik >= 4) { klik = 0; gaya("pusing"); return; } // klik beruntun -> pusing
  if (sibuk) return;
  sekejap(acak(["pilih", "kedip", "kaget"]), 1000);
  omong(acak(["Hehe, geli 🤭", "Halo! 👋", "Semangat ya! 💪", "Aku maskot ekskul~ ✨", "Ayo daftar! 🚀"]), 1800);
  burst(["💖", "✨"], 4);
  loncatKecil();
});

// Karakter menoleh mengikuti kursor (efek 3D)
const miring = mascot.querySelector(".miring");
document.addEventListener("pointermove", (e) => {
  const r = mascot.getBoundingClientRect();
  const dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / 300));
  const dy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / 300));
  miring.style.setProperty("--ry", (dx * 20).toFixed(1) + "deg");
  miring.style.setProperty("--rx", (-dy * 14).toFixed(1) + "deg");
}, { passive: true });
document.documentElement.addEventListener("mouseleave", () => {
  miring.style.setProperty("--ry", "0deg");
  miring.style.setProperty("--rx", "0deg");
});

pulihkan(); // pose awal
omong("Halo! Ayo daftar 👋", 2500);

/* =========================================================
   VALIDASI FORM
   ========================================================= */
const emailPola = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Aturan validasi tiap kolom: mengembalikan pesan error, atau "" jika benar
const aturan = {
  nama: (v) => {
    if (v.trim() === "") return "Nama lengkap tidak boleh kosong.";
    if (v.trim().length < 3) return "Nama minimal 3 karakter.";
    return "";
  },
  email: (v) => {
    if (v.trim() === "") return "Email tidak boleh kosong.";
    if (!emailPola.test(v.trim())) return "Format email tidak valid (contoh: nama@email.com).";
    return "";
  },
  password: (v) => {
    if (v === "") return "Password tidak boleh kosong.";
    if (v.length < 8) return "Password minimal 8 karakter.";
    return "";
  },
  konfirmasi: (v) => {
    if (v === "") return "Konfirmasi password tidak boleh kosong.";
    if (v !== form.password.value) return "Konfirmasi password tidak sama dengan password.";
    return "";
  },
  ekskul: (v) => (v === "" ? "Pilih salah satu ekstrakurikuler." : ""),
};

// Validasi satu kolom lalu tampilkan hasilnya (merah / hijau)
function validasi(nama) {
  const input = form[nama];
  const pesan = aturan[nama](input.value);
  const box = input.closest(".field");

  box.classList.toggle("invalid", pesan !== "");
  box.classList.toggle("valid", pesan === "");
  document.getElementById("err-" + nama).textContent = pesan;
  input.setAttribute("aria-invalid", pesan !== "");

  return pesan === "";
}

// Validasi real-time saat mengetik / mengganti pilihan
Object.keys(aturan).forEach((nama) => {
  const input = form[nama];
  input.addEventListener("input", () => {
    sukses.hidden = true;
    validasi(nama);
    // password berubah -> cek ulang konfirmasi jika sudah diisi
    if (nama === "password" && form.konfirmasi.value !== "") validasi("konfirmasi");
  });
  input.addEventListener("blur", () => {
    if (validasi(nama)) {
      if (!sibuk) { sekejap("kedip", 900); omong(acak(["Mantap! 👍", "Sip! ✨", "Oke, lanjut! 😎"]), 1200); }
    } else {
      gelengKepala();
      omong(acak(["Ups, ada yang salah 😢", "Cek lagi yuk 🧐", "Hmm, belum pas 🥺"]));
    }
  });
});

// Validasi saat tombol Submit diklik
form.addEventListener("submit", (event) => {
  event.preventDefault(); // halaman tidak refresh

  let semuaValid = true;
  Object.keys(aturan).forEach((nama) => {
    if (!validasi(nama)) semuaValid = false;
  });

  if (!semuaValid) {
    sukses.hidden = true;
    gelengKepala(true);
    omong("Eits! Lengkapi dulu ya 😤");
    const pertama = form.querySelector(".invalid input, .invalid select");
    if (pertama) pertama.focus();
    return;
  }

  sukses.textContent = `Pendaftaran Berhasil! Selamat bergabung di ${form.ekskul.value}, ${form.nama.value.trim()}.`;
  sukses.hidden = false;
  rayakan();
  omong("Yeay! Selamat bergabung! 🎉", 3000);
  burst(["🎉", "⭐", "💖", "✨", "🎊"], 14);
  form.reset();
  form.querySelectorAll(".field").forEach((f) => f.classList.remove("valid", "invalid"));
});