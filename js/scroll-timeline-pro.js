/**
 * ScrollTimelinePro — scroll-driven company history timeline
 * Vanilla JS port inspired by Timeline Scroll Pro interaction patterns.
 */
(function () {
  'use strict';

  function initScrollTimelinePro(root) {
    const track = root.querySelector('.scroll-timeline-pro__track');
    const progress = root.querySelector('.scroll-timeline-pro__line-progress');
    const milestones = Array.from(root.querySelectorAll('.scroll-timeline-pro__milestone'));
    if (!track || !progress || !milestones.length) return;

    let ticking = false;

    function updateProgress() {
      const rect = track.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      const start = viewHeight * 0.15;
      const end = viewHeight * 0.85;
      const total = rect.height + start - end;
      const scrolled = start - rect.top;
      const ratio = Math.min(1, Math.max(0, scrolled / Math.max(total, 1)));
      progress.style.height = `${ratio * 100}%`;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateProgress();
        ticking = false;
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-active', entry.isIntersecting);
          entry.target.classList.toggle('is-past', !entry.isIntersecting && entry.boundingClientRect.top < 0);
        });
      },
      { root: null, rootMargin: '-20% 0px -35% 0px', threshold: 0.15 }
    );

    milestones.forEach((item) => observer.observe(item));

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateProgress();
  }

  function boot() {
    document.querySelectorAll('[data-scroll-timeline-pro]').forEach(initScrollTimelinePro);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
