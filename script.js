// Futuristic interactions for Volt landing
(function(){
  const nav = document.getElementById('nav');
  const navToggle = document.querySelector('.nav-toggle');
  const statusEl = document.getElementById('formStatus');
  const yearEl = document.getElementById('year');

  // Footer year
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
      // NEW LINE: Toggle 'nav-open' class on the body to disable background scrolling
      document.body.classList.toggle('nav-open', open); 
    });
  }

  // Reveal on scroll using IntersectionObserver
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries)=>{
      for (const e of entries) if (e.isIntersecting) e.target.classList.add('visible');
    }, { threshold: 0.15 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('visible'));
  }

  // Smooth scroll for internal links
  document.addEventListener('click', (e)=>{
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target){
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (nav && nav.classList.contains('open')) {
        nav.classList.remove('open');
        // UPDATED: Remove 'nav-open' class from body when nav closes
        document.body.classList.remove('nav-open'); 
      }
    }
  });

  // Contact form → Endpoint (supports JSON for Make/Flow or FormData fallback)
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const endpoint = form.getAttribute('data-endpoint');
      const format = (form.getAttribute('data-format') || 'form').toLowerCase();
      const fd = new FormData(form);
      // Honeypot check
      if ((fd.get('website') || '').toString().trim() !== ''){
        if (statusEl) statusEl.textContent = 'Submission blocked.';
        return;
      }
      if (statusEl) statusEl.textContent = 'Sending…';
      try {
        let res;
        if (format === 'json') {
          const payload = {
            name: fd.get('name'),
            email: fd.get('email'),
            message: fd.get('message'),
            timestamp: new Date().toISOString(),
            time: new Date().toISOString()
          };
          res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            mode: 'cors'
          });
        } else {
          const nowIso = new Date().toISOString();
          if (!fd.has('timestamp')) fd.append('timestamp', nowIso);
          if (!fd.has('time')) fd.append('time', nowIso);
          res = await fetch(endpoint, { method: 'POST', body: fd, mode: 'cors' });
        }
        if (!res.ok) throw new Error('Network error');
        await res.text();
        if (statusEl) statusEl.textContent = 'Thanks! Your message has been recorded.';
        form.reset();
      } catch (err){
        console.error(err);
        if (statusEl) statusEl.textContent = 'Sorry, something went wrong. Please try again later.';
      }
    });
  }

  // Card hover video preview (play on hover, pause on leave)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.card-media').forEach(media => {
    const video = media.querySelector('.preview');
    if (!video) return;
    // Ensure correct playback flags regardless of markup
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    let playing = false;
    const playVideo = async () => {
      if (prefersReducedMotion) return; // respect user setting
      try {
        // Reset to start for consistent preview
        if (video.currentTime > 0.1) video.currentTime = 0;
        await video.play();
        playing = true;
      } catch (e) {
        // Some browsers require a user gesture; silently ignore
      }
    };
    const stopVideo = () => {
      if (!playing) return;
      video.pause();
      video.currentTime = 0;
      playing = false;
    };
    media.addEventListener('pointerenter', playVideo);
    media.addEventListener('pointerleave', stopVideo);
    // Fallback for mouseenter/leave if pointer events not supported
    media.addEventListener('mouseenter', playVideo);
    media.addEventListener('mouseleave', stopVideo);
  });

  // Parallax effect for hero
  const hero = document.querySelector('.hero');
  if (hero && !prefersReducedMotion){
    hero.addEventListener('mousemove', (e)=>{
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      const bg = hero.querySelector('.grid-bg');
      if (bg){ bg.style.transform = `translate(${x * 12}px, ${y * 12}px)`; }
    });
    hero.addEventListener('mouseleave', ()=>{
      const bg = hero.querySelector('.grid-bg');
      if (bg){ bg.style.transform = 'translate(0,0)'; }
    });
  }

  // Magnetic hover for primary buttons
  document.querySelectorAll('.btn.primary').forEach(btn =>{
    if (prefersReducedMotion) return;
    btn.style.willChange = 'transform';
    btn.addEventListener('mousemove', (e)=>{
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left) - r.width/2;
      const y = (e.clientY - r.top) - r.height/2;
      btn.style.transform = `translate(${x*0.03}px, ${y*0.03}px)`;
    });
    btn.addEventListener('mouseleave', ()=>{
      btn.style.transform = 'translate(0,0)';
    });
  });
})();
