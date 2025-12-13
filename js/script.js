// Toggle class active for navbar (defensive selectors)
const navbarNav = document.querySelector('.navBar-nav');
const menuBtn = document.querySelector('#menu');

if (menuBtn && navbarNav) {
  menuBtn.addEventListener('click', function (e) {
    e.preventDefault();
    navbarNav.classList.toggle('active');
  });
}

// Toggle search input pada desktop
const searchInputDesktop = document.querySelector('.search-input-desktop');
const searchIcon = document.querySelector('#search');
const navbarIcons = document.querySelector('.navbar-Icons');

if (searchIcon && searchInputDesktop && navbarIcons) {
  searchIcon.addEventListener('click', function(e) {
    e.preventDefault();
    navbarIcons.classList.toggle('search-active');
    searchInputDesktop.focus();
  });
}

// Tutup sidebar dan search saat klik diluar
document.addEventListener('click', function (e) {
  if (navbarNav && menuBtn) {
    if (!menuBtn.contains(e.target) && !navbarNav.contains(e.target)) {
      navbarNav.classList.remove('active');
    }
  }

  if (navbarIcons && searchIcon && !navbarIcons.contains(e.target)) {
    navbarIcons.classList.remove('search-active');
  }
});

// Highlight navbar menu on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.navBar-nav a');

window.addEventListener('scroll', () => {
  let current = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    const sectionHeight = section.offsetHeight;

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');

    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

// Manual Team Slider (vanilla JS)
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

  // Controls
  const prevBtn = slider.querySelector('.team-prev');
  const nextBtn = slider.querySelector('.team-next');
  prevBtn && prevBtn.addEventListener('click', () => moveTo(currentIndex - 1));
  nextBtn && nextBtn.addEventListener('click', () => moveTo(currentIndex + 1));

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
    // current offset percent based on currentIndex
    return currentIndex * (100 / itemsToShow);
  }

  function onPointerDown(e) {
    isDragging = true;
    startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    currentDelta = 0;
    startOffsetPercent = getTranslatePercent();
    track.style.transition = 'none';
    // pause autoplay while dragging
    clearInterval(autoplay);
    if (e.pointerId) slider.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    currentDelta = x - startX;
    const deltaPercent = (currentDelta / slider.clientWidth) * 100;
    // move track accordingly
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
        // swiped left -> next
        moveTo(currentIndex + 1);
      } else {
        // swiped right -> prev
        moveTo(currentIndex - 1);
      }
    } else {
      // snap back
      moveTo(currentIndex);
    }
    // restart autoplay
    autoplay = setInterval(() => moveTo(currentIndex + 1), 4000);
    try { if (e.pointerId) slider.releasePointerCapture(e.pointerId); } catch (err) {}
  }

  // Pointer events
  slider.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  // Fallback for touch (some browsers)
  slider.addEventListener('touchstart', onPointerDown, {passive: true});
  window.addEventListener('touchmove', onPointerMove, {passive: true});
  window.addEventListener('touchend', onPointerUp);

  window.addEventListener('resize', () => setSizes());

  // init
  setSizes();

  // re-run feather icons (prev/next added dynamically)
  if (window.feather) feather.replace();
});