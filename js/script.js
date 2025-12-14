// Toggle class active for navbar (defensive selectors)
const navbarNav = document.querySelector('.navBar-nav');
const menuBtn = document.querySelector('#menu');

if (menuBtn && navbarNav) {
  menuBtn.addEventListener('click', function (e) {
    e.preventDefault();
    navbarNav.classList.toggle('active');
  });
}

// Tutup sidebar saat klik diluar
document.addEventListener('click', function (e) {
  if (navbarNav && menuBtn) {
    if (!menuBtn.contains(e.target) && !navbarNav.contains(e.target)) {
      navbarNav.classList.remove('active');
    }
  }
});

// Highlight navbar menu on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.navBar-nav a');

function updateActiveNav() {
  let current = '';

  sections.forEach(section => {
    // Increased offset to account for Sticky Navbar (approx 100px) + Breathing room
    const sectionTop = section.offsetTop - 180;
    const sectionHeight = section.offsetHeight;

    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');

    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}

// Run on scroll
window.addEventListener('scroll', updateActiveNav);
document.addEventListener('DOMContentLoaded', updateActiveNav);

// Scroll Animations (IntersectionObserver)
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      // Stop observing once shown (optional, keeps it cleaner)
      // observer.unobserve(entry.target); 
    }
  });
}, observerOptions);

// Select elements to animate
// We will programmatically add .hidden class then observe them to avoid cluttering HTML
document.addEventListener('DOMContentLoaded', () => {
  const elementsToAnimate = document.querySelectorAll('.service-card, .team-card, .about-img, .about .content, .fakta-item, section h2, .calc-container');

  elementsToAnimate.forEach((el, index) => {
    el.classList.add('hidden');
    // Add stagger delay based on index within its container? 
    // Simple random stagger for natural feel or just let CSS handle base transition
    observer.observe(el);
  });

  // Stagger check
  document.querySelectorAll('.service-container, .fakta-container').forEach(container => {
    const children = Array.from(container.children);
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * 100}ms`;
    });
  });
});


// Manual Team Slider (vanilla JS) - Preserved & Optimized
document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.team-slider');
  if (!slider) return;

  const track = slider.querySelector('.team-track');
  let slides = Array.from(track.querySelectorAll('.team-card'));
  let currentIndex = 0;

  function getItemsToShow() {
    const w = window.innerWidth;
    if (w < 600) return 1;
    if (w < 1000) return 2;
    return 4;
  }

  let itemsToShow = getItemsToShow();

  function setSizes() {
    itemsToShow = getItemsToShow();
    slides.forEach(slide => {
      slide.style.flex = `0 0 ${100 / itemsToShow}%`;
    });
    moveTo(currentIndex);
    createDots();
  }

  function moveTo(index) {
    const maxIndex = Math.max(0, slides.length - itemsToShow);
    if (index < 0) index = maxIndex;
    if (index > maxIndex) index = 0;
    currentIndex = index;
    const offset = (currentIndex * (100 / itemsToShow));
    track.style.transform = `translateX(-${offset}%)`;
    updateDots();
  }

  // Controls - Fixed Logic
  const prevBtn = slider.querySelector('.team-prev');
  const nextBtn = slider.querySelector('.team-next');

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent bubbling issues
      moveTo(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      moveTo(currentIndex + 1);
    });
  }

  // Dots
  const dotsContainer = slider.querySelector('.team-dots');
  function createDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const count = Math.max(1, slides.length - itemsToShow + 1);
    for (let i = 0; i < count; i++) {
      const btn = document.createElement('button');
      btn.className = 'team-dot';
      btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
      btn.addEventListener('click', () => moveTo(i));
      dotsContainer.appendChild(btn);
    }
    updateDots();
  }

  function updateDots() {
    if (!dotsContainer) return;
    const dots = Array.from(dotsContainer.children);
    dots.forEach((d, idx) => d.classList.toggle('active', idx === currentIndex));
  }

  // Autoplay
  let autoplay = setInterval(() => moveTo(currentIndex + 1), 4000);
  slider.addEventListener('mouseenter', () => clearInterval(autoplay));
  slider.addEventListener('mouseleave', () => autoplay = setInterval(() => moveTo(currentIndex + 1), 4000));

  // Drag / swipe support (pointer events)
  let isDragging = false;
  let startX = 0;
  let currentDelta = 0;
  let startOffsetPercent = 0;

  function getTranslatePercent() {
    return currentIndex * (100 / itemsToShow);
  }

  function onPointerDown(e) {
    isDragging = true;
    startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    currentDelta = 0;
    startOffsetPercent = getTranslatePercent();
    track.style.transition = 'none';
    clearInterval(autoplay);
    if (e.pointerId) slider.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    currentDelta = x - startX;
    const deltaPercent = (currentDelta / slider.clientWidth) * 100;
    const newPercent = startOffsetPercent - deltaPercent;
    track.style.transform = `translateX(-${newPercent}%)`;
  }

  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = '';
    const threshold = Math.max(40, slider.clientWidth * 0.12); // px
    if (Math.abs(currentDelta) > threshold) {
      if (currentDelta < 0) {
        moveTo(currentIndex + 1);
      } else {
        moveTo(currentIndex - 1);
      }
    } else {
      moveTo(currentIndex);
    }
    autoplay = setInterval(() => moveTo(currentIndex + 1), 4000);
    try { if (e.pointerId) slider.releasePointerCapture(e.pointerId); } catch (err) { }
  }

  // Pointer events
  slider.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  slider.addEventListener('touchstart', onPointerDown, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
  window.addEventListener('touchend', onPointerUp);

  window.addEventListener('resize', () => setSizes());

  // init
  setSizes();

  if (window.feather) feather.replace();
});

// Stunting Calculator Logic
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('stuntingForm');
  const resultDiv = document.getElementById('calcResult');
  const ctaDiv = document.getElementById('calcCta');

  // Select elements that were created dynamically or need animation in new sections
  const newElements = document.querySelectorAll('.mpasi-card, .blog-card, .hpk-item, .imunisasi-wrapper');
  newElements.forEach(el => {
    el.classList.add('hidden');
    observer.observe(el);
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('calcName').value;
      const gender = document.getElementById('calcGender').value;
      const age = parseFloat(document.getElementById('calcAge').value);
      const height = parseFloat(document.getElementById('calcHeight').value);

      if (!name || isNaN(age) || isNaN(height)) {
        alert("Mohon isi semua data dengan benar.");
        return;
      }

      // Simplified WHO Logic (Demonstration)
      let threshold = 46; // base at 0
      if (age <= 6) threshold += (age * 2.5);
      else if (age <= 12) threshold = 61 + ((age - 6) * 1.6);
      else if (age <= 24) threshold = 71 + ((age - 12) * 0.8);
      else threshold = 81 + ((age - 24) * 0.5);

      if (gender === 'boy') threshold += 1;

      let status = "";
      let statusClass = "";
      let message = "";
      let showCta = false;

      if (height < threshold) {
        status = "Potensi Stunting";
        statusClass = "status-danger";
        message = `Perhatian: Tinggi anak (${height}cm) berada di bawah simulasi batas normal (${threshold.toFixed(1)}cm). Jangan panik, tapi segera konsultasikan.`;
        showCta = true;
      } else if (height < threshold + 3) {
        status = "Resiko Ringan";
        statusClass = "status-warning";
        message = `Waspada: Tinggi anak (${height}cm) mendekati batas bawah. Fokus pada perbaikan gizi protein hewani.`;
        showCta = true;
      } else {
        status = "Tumbuh Normal";
        statusClass = "status-normal";
        message = `Bagus! Tinggi anak (${height}cm) sesuai jalur pertumbuhan. Pertahankan pola makan sehat.`;
        showCta = false;
      }

      resultDiv.style.display = 'block';
      resultDiv.innerHTML = `
                <h3>Halo, Ayah/Bunda ${name}</h3>
                <p>Status Gizi (Simulasi): <span style="font-weight:bold; font-size:1.2rem;" class="${statusClass}">${status}</span></p>
                <p style="margin-top:0.5rem; font-size:0.95rem;">${message}</p>
            `;

      if (showCta) {
        ctaDiv.style.display = 'block';
      } else {
        ctaDiv.style.display = 'none';
      }

      // Scroll to result
      resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
});
