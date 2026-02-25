// script.js (stable: navbar scrolled + active link + discord + music player)

document.addEventListener("DOMContentLoaded", () => {
  // ---------- NAVBAR scrolled ----------
  const navbar = document.querySelector(".navbar");
  const navLinks = document.querySelectorAll(".nav-links a[href^='#']");
  const sections = document.querySelectorAll("section[id]");

  function onScrollUI() {
    if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 10);

    // active link
    let currentId = "";
    sections.forEach((sec) => {
      const top = sec.offsetTop;
      if (window.scrollY + 140 >= top) currentId = sec.id;
    });
    navLinks.forEach((a) => {
      const isActive = a.getAttribute("href") === `#${currentId}`;
      a.classList.toggle("active", isActive);
    });
  }
  window.addEventListener("scroll", onScrollUI);
  onScrollUI();

  // ---------- DISCORD (Lanyard) ----------
  const userId = "1066803508059312128";
  const avatarEl = document.getElementById("discord-avatar");
  const statusEl = document.getElementById("discord-status");
  const activityEl = document.getElementById("discord-activity");
  const discordCard = document.querySelector(".discord-card");

  async function updateDiscord() {
    try {
      const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
      const json = await res.json();
      const d = json?.data;
      if (!d) return;

      // avatar (gère null + gif)
      if (avatarEl && d.discord_user) {
        const u = d.discord_user;
        const hash = u.avatar;
        if (hash) {
          const ext = hash.startsWith("a_") ? "gif" : "png";
          avatarEl.src = `https://cdn.discordapp.com/avatars/${u.id}/${hash}.${ext}?size=256`;
        } else {
          avatarEl.src = `https://cdn.discordapp.com/embed/avatars/0.png`;
        }
      }

      // status
      if (statusEl) {
        const s = d.discord_status || "offline";
        statusEl.textContent = s;
      }

      // activity
      if (activityEl) {
        const acts = Array.isArray(d.activities) ? d.activities : [];
        const filtered = acts
          .filter(a => a && a.name && a.type !== 4) // ignore custom status if you want
          .map(a => a.name);

        activityEl.textContent = filtered.length ? filtered.join(", ") : "Aucune activité";
      }
    } catch (e) {
      // garde silencieux (pas de crash)
      if (statusEl) statusEl.textContent = "Erreur";
      if (activityEl) activityEl.textContent = "—";
    }
  }

  updateDiscord();
  setInterval(updateDiscord, 15000);

  // time
  const timeEl = document.getElementById("time");
  function updateTime() {
    if (!timeEl) return;
    timeEl.textContent = new Date().toLocaleTimeString();
  }
  updateTime();
  setInterval(updateTime, 1000);

  // hide discord when scrolling down (optional, no crash)
  let lastY = window.scrollY;
  window.addEventListener("scroll", () => {
    if (!discordCard) return;
    const y = window.scrollY;
    const goingDown = y > lastY;
    if (goingDown && y > 120) discordCard.classList.add("is-hidden");
    else discordCard.classList.remove("is-hidden");
    lastY = y;
  });

  // ---------- MUSIC PLAYER ----------
  const audio = document.getElementById("audio-player");
  const playBtn = document.getElementById("player-btn");
  const nextBtn = document.getElementById("next-btn");
  const titleEl = document.getElementById("player-title");
  const progress = document.getElementById("player-progress");
  const progressBar = document.getElementById("player-progress-bar");
  const volume = document.getElementById("volume-slider");

  // set your tracks here
  const playlist = [
    { title: "PLK - Demain", src: "music.mp4" },
    { title: "Damso - N. J Respect R", src: "music2.mp4" },
    { title: "Nossa - Amaru Commando", src: "music3.mp4" }
  ];

  let index = 0;
  let isReady = false;

  function loadTrack(i) {
    if (!audio) return;
    index = (i + playlist.length) % playlist.length;
    audio.src = playlist[index].src;
    if (titleEl) titleEl.textContent = playlist[index].title;
    isReady = true;
  }

  function setPlayIcon(isPlaying) {
    if (!playBtn) return;
    playBtn.textContent = isPlaying ? "⏸" : "▶";
  }

  function safePlay() {
    if (!audio || !isReady) return;
    audio.play().then(() => setPlayIcon(true)).catch(() => {
      // autoplay blocked: show play icon
      setPlayIcon(false);
    });
  }

  function safePause() {
    if (!audio) return;
    audio.pause();
    setPlayIcon(false);
  }

  if (audio) {
    loadTrack(0);
    audio.loop = false;

    audio.addEventListener("timeupdate", () => {
      if (!progressBar || !audio.duration) return;
      const pct = (audio.currentTime / audio.duration) * 100;
      progressBar.style.width = `${pct}%`;
    });

    audio.addEventListener("ended", () => {
      loadTrack(index + 1);
      safePlay();
    });
  }

  if (volume && audio) {
    audio.volume = Number(volume.value) / 100;
    volume.addEventListener("input", () => {
      audio.volume = Number(volume.value) / 100;
    });
  }

  if (playBtn && audio) {
    playBtn.addEventListener("click", () => {
      if (audio.paused) safePlay();
      else safePause();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      loadTrack(index + 1);
      safePlay();
    });
  }

  if (progress && audio) {
    progress.addEventListener("click", (e) => {
      if (!audio.duration) return;
      const rect = progress.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, x / rect.width));
      audio.currentTime = pct * audio.duration;
    });
  }
});

// AJOUT OPTIONNEL DANS script.js : rendre la navbar "active" pour Gallery/Brand
// (si tu ajoutes les liens #gallery et #brand dans la navbar)

document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-links a[href^='#']");
  const sections = document.querySelectorAll("section[id]");

  function setActiveLink() {
    let currentId = "";
    sections.forEach((sec) => {
      if (window.scrollY + 140 >= sec.offsetTop) currentId = sec.id;
    });
    navLinks.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === `#${currentId}`);
    });
  }

  window.addEventListener("scroll", setActiveLink);
  setActiveLink();
});


// ---------- LIGHTBOX ----------
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");

document.querySelectorAll(".gallery-item img").forEach(img => {
  img.addEventListener("click", () => {
    lightboxImg.src = img.src;
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden"; // bloque le scroll
  });
});

// Fermer au clic
lightbox.addEventListener("click", () => {
  lightbox.classList.remove("active");
  document.body.style.overflow = "";
});

// Fermer avec ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lightbox.classList.contains("active")) {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
  }
});
