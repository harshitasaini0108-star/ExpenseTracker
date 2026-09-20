/* ==========================================================
   Expense Tracker – Pro Animation & Micro-interaction Engine
   ========================================================== */

(() => {
  'use strict';

  const LOCALE = 'en-IN';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================
     1. Interactive Ambient Particle Canvas
     ========================================================== */
  function initParticleCanvas() {
    if (reducedMotion) return;

    let canvas = document.getElementById('bg-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'bg-canvas';
      document.body.prepend(canvas);
    }

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = Math.min(window.innerWidth < 768 ? 25 : 55, 60);

    const mouse = { x: -1000, y: -1000, radius: 130 };

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    }, { passive: true });

    const colors = [
      'rgba(56, 189, 248, 0.45)', // Sky blue
      'rgba(99, 102, 241, 0.45)', // Indigo
      'rgba(168, 85, 247, 0.45)', // Purple
      'rgba(16, 185, 129, 0.35)'  // Emerald
    ];

    class Particle {
      constructor() {
        this.reset(true);
      }
      reset(initial = false) {
        this.x = initial ? Math.random() * width : (Math.random() > 0.5 ? 0 : width);
        this.y = Math.random() * height;
        this.radius = Math.random() * 2.2 + 1;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.5 + 0.3;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off screen borders gently
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Subtle mouse repulsion
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x -= Math.cos(angle) * force * 3.5;
          this.y -= Math.sin(angle) * force * 3.5;
        }
      }
      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let animId;
    function render() {
      if (document.hidden) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(147, 197, 253, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Update & draw particles
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animId = requestAnimationFrame(render);
    }
    render();
  }

  /* ==========================================================
     2. 3D Tilt Micro-interactions
     ========================================================== */
  function initTilt() {
    if (reducedMotion) return;

    const tiltTargets = document.querySelectorAll(
      '[data-tilt], .stat-card, .feature-card, .login-card, .expense-card, .profile-card'
    );

    tiltTargets.forEach((card) => {
      let bounds;

      function onMouseEnter() {
        bounds = card.getBoundingClientRect();
      }

      function onMouseMove(e) {
        if (!bounds) bounds = card.getBoundingClientRect();
        const mouseX = e.clientX - bounds.left;
        const mouseY = e.clientY - bounds.top;

        const xPct = (mouseX / bounds.width) - 0.5;
        const yPct = (mouseY / bounds.height) - 0.5;

        const rotateX = -yPct * 12; // Max 12 deg tilt
        const rotateY = xPct * 12;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      }

      function onMouseLeave() {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        bounds = null;
      }

      card.addEventListener('mouseenter', onMouseEnter);
      card.addEventListener('mousemove', onMouseMove);
      card.addEventListener('mouseleave', onMouseLeave);
    });
  }

  /* ==========================================================
     3. Smooth Easing Count-Up Numbers (₹ format)
     ========================================================== */
  function countUp(el) {
    const rawVal = el.dataset.count;
    if (rawVal === undefined || rawVal === '') return;

    const target = parseFloat(rawVal);
    if (Number.isNaN(target)) return;

    const decimals = el.dataset.decimals !== undefined
      ? parseInt(el.dataset.decimals, 10)
      : (Number.isInteger(target) ? 0 : 2);
    const prefix = el.dataset.prefix !== undefined ? el.dataset.prefix : '₹ ';
    const suffix = el.dataset.suffix || '';

    const format = (v) =>
      (v < 0 ? '-' : '') +
      prefix +
      Math.abs(v).toLocaleString(LOCALE, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }) +
      suffix;

    if (reducedMotion) {
      el.textContent = format(target);
      return;
    }

    const duration = 1200;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease Out Expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      el.textContent = format(target * eased);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = format(target);
      }
    };
    requestAnimationFrame(tick);
  }

  /* ==========================================================
     4. Scroll-Driven Entrance Reveals (IntersectionObserver)
     ========================================================== */
  function initScrollReveals() {
    const reveals = document.querySelectorAll('.reveal, .feature-card, .chart-box, [data-reveal]');
    if (!reveals.length) return;

    if (reducedMotion) {
      reveals.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach((el) => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  /* ==========================================================
     5. Button Click Ripple Effect
     ========================================================== */
  function initButtonRipples() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn, .btn-custom');
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.classList.add('ripple-wave');

      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  }

  /* ==========================================================
     6. Flash Alerts Auto-Dismiss & Stagger
     ========================================================== */
  function initAlerts() {
    document.querySelectorAll('.alert').forEach((alert) => {
      if (alert.hasAttribute('data-persist')) return;

      setTimeout(() => {
        if (!alert.isConnected) return;
        alert.classList.add('alert-leaving');
        setTimeout(() => alert.remove(), 420);
      }, 4500);
    });
  }

  /* ==========================================================
     7. Table Delete Row Slide-Out Animation
     ========================================================== */
  function initDeleteAnimations() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href*="/delete_expense/"]');
      if (!link || e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;

      const row = link.closest('tr, .list-group-item, .card');
      if (!row) return;

      e.preventDefault();
      if (row.classList.contains('leaving')) return;

      row.classList.add('leaving');
      setTimeout(() => {
        window.location.href = link.href;
      }, reducedMotion ? 0 : 400);
    });
  }

  /* ==========================================================
     8. Form Submit Button Loading State
     ========================================================== */
  function initSubmitLoading() {
    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (e.defaultPrevented) return;
      if ((form.method || 'get').toLowerCase() === 'get') return;

      const btn = form.querySelector('[type="submit"]');
      if (!btn || btn.disabled) return;

      setTimeout(() => {
        btn.dataset.originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML =
          '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>' +
          (btn.dataset.loadingText || 'Processing...');
      }, 0);
    });

    window.addEventListener('pageshow', (e) => {
      if (!e.persisted) return;
      document.querySelectorAll('button[data-original-html]').forEach((btn) => {
        btn.innerHTML = btn.dataset.originalHtml;
        btn.disabled = false;
        delete btn.dataset.originalHtml;
      });
    });
  }

  /* ==========================================================
     9. Real-Time Dynamic Expense Preview (Add & Edit Expense)
     ========================================================== */
  function initExpenseLivePreview() {
    const amountInput = document.getElementById('amount') || document.querySelector('input[name="amount"]');
    const categoryInput = document.getElementById('category') || document.querySelector('select[name="category"]');
    const descInput = document.getElementById('description') || document.querySelector('input[name="description"]');
    const previewAmount = document.querySelector('.amount-preview');
    const previewDesc = document.querySelector('.preview-description');
    const iconBox = document.querySelector('.icon-box i, .preview-icon');

    const categoryIcons = {
      'Food': 'fa-utensils',
      'Travel': 'fa-plane',
      'Transport': 'fa-car',
      'Bills': 'fa-file-invoice-dollar',
      'Utilities': 'fa-bolt',
      'Shopping': 'fa-bag-shopping',
      'Entertainment': 'fa-film',
      'Health': 'fa-heart-pulse',
      'Education': 'fa-graduation-cap',
      'Groceries': 'fa-cart-shopping',
      'Salary': 'fa-money-bill-wave',
      'Investment': 'fa-chart-line'
    };

    if (amountInput && previewAmount) {
      const updateAmount = () => {
        const val = parseFloat(amountInput.value) || 0;
        previewAmount.textContent = '₹ ' + val.toLocaleString(LOCALE, { minimumFractionDigits: 0 });
        previewAmount.classList.add('preview-pulse');
        setTimeout(() => previewAmount.classList.remove('preview-pulse'), 300);
      };
      amountInput.addEventListener('input', updateAmount);
    }

    if (categoryInput && iconBox) {
      const updateCategory = () => {
        const selected = categoryInput.value;
        const iconClass = categoryIcons[selected] || 'fa-wallet';
        iconBox.className = `fa-solid ${iconClass}`;
        iconBox.style.transform = 'scale(1.25) rotate(10deg)';
        setTimeout(() => {
          iconBox.style.transform = 'scale(1) rotate(0deg)';
        }, 250);
      };
      categoryInput.addEventListener('change', updateCategory);
    }

    if (descInput && previewDesc) {
      descInput.addEventListener('input', () => {
        previewDesc.textContent = descInput.value.trim() || 'No description provided';
      });
    }
  }

  /* ==========================================================
     10. Lightweight Celebratory Confetti Burst
     ========================================================== */
  function triggerConfetti() {
    if (reducedMotion) return;

    // Check if confetti CDN is available, else render lightweight CSS/canvas particles
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f472b6']
      });
    }
  }

  // Trigger celebration if there is a success alert on page load!
  function checkCelebration() {
    const successAlert = document.querySelector('.alert-success');
    if (successAlert) {
      setTimeout(triggerConfetti, 300);
    }
  }

  /* ==========================================================
     Initialization
     ========================================================== */
  function initAll() {
    initParticleCanvas();
    initTilt();
    document.querySelectorAll('[data-count]').forEach(countUp);
    initScrollReveals();
    initButtonRipples();
    initAlerts();
    initDeleteAnimations();
    initSubmitLoading();
    initExpenseLivePreview();
    checkCelebration();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();