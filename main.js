// Welcome popup
(function () {
  const overlay = document.getElementById('welcome-overlay');
  const closeBtn = document.getElementById('welcome-close');

  function dismiss() {
    overlay.classList.add('hide');
    overlay.addEventListener('animationend', () => overlay.remove(), { once: true });
  }

  // Auto-dismiss after 6.2s (matches 0.8s delay + 5s bar + small buffer)
  const autoTimer = setTimeout(dismiss, 6200);

  closeBtn?.addEventListener('click', () => {
    clearTimeout(autoTimer);
    dismiss();
  });
})();

// Theme toggle
const htmlElement = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle?.querySelector('.theme-icon');
const THEME_KEY = 'portfolio-theme';

function applyTheme(theme) {
  htmlElement.setAttribute('data-theme', theme);
  if (themeIcon) {
    themeIcon.textContent = theme === 'light' ? '☀️' : '🌙';
  }
  localStorage.setItem(THEME_KEY, theme);
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'dark');
  applyTheme(theme);
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = htmlElement.getAttribute('data-theme') || 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    applyTheme(next);
  });
}

initTheme();

// Scroll progress bar
const scrollProgress = document.getElementById('scroll-progress');

function updateScrollProgress() {
  const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (window.scrollY / windowHeight) * 100;
  if (scrollProgress) {
    scrollProgress.style.width = scrolled + '%';
  }
}

window.addEventListener('scroll', updateScrollProgress);

// Parallax effect on background orbs
const orbA = document.querySelector('.orb-a');
const orbB = document.querySelector('.orb-b');

function handleParallax() {
  const scrolled = window.scrollY;
  if (orbA) {
    orbA.style.transform = `translate(${scrolled * 0.15}px, ${scrolled * 0.1}px)`;
  }
  if (orbB) {
    orbB.style.transform = `translate(${-scrolled * 0.1}px, ${-scrolled * 0.15}px)`;
  }
}

window.addEventListener('scroll', handleParallax);

// Back to top button
const backToTopBtn = document.getElementById('back-to-top');

function toggleBackToTop() {
  if (window.scrollY > 500) {
    backToTopBtn?.classList.add('visible');
  } else {
    backToTopBtn?.classList.remove('visible');
  }
}

window.addEventListener('scroll', toggleBackToTop);

if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

const revealItems = document.querySelectorAll('[data-reveal]');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (!entry.isIntersecting) {
        return;
      }

      // Stagger reveal for a more intentional entrance rhythm.
      setTimeout(() => {
        entry.target.classList.add('in-view');
      }, Math.min(index * 70, 280));

      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.18,
    rootMargin: '0px 0px -40px 0px'
  }
);

revealItems.forEach((item) => {
  observer.observe(item);
});

const menuLinks = document.querySelectorAll('.menu a');
menuLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const id = link.getAttribute('href');
    if (!id || !id.startsWith('#')) {
      return;
    }

    const section = document.querySelector(id);
    if (!section) {
      return;
    }

    event.preventDefault();
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Add highlight animation to the target section
    section.classList.add('section-highlight');
    setTimeout(() => {
      section.classList.remove('section-highlight');
    }, 1800);
  });
});

const statNumbers = document.querySelectorAll('.stat-number');
const statsContainer = document.querySelector('.stats');

const animateValue = (element) => {
  const target = Number.parseFloat(element.dataset.target ?? '0');
  const decimals = Number.parseInt(element.dataset.decimals ?? '0', 10);
  const suffix = element.dataset.suffix ?? '';
  const duration = 1200;
  const start = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;
    element.textContent = `${current.toFixed(decimals)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

if (statsContainer && statNumbers.length > 0) {
  const statsObserver = new IntersectionObserver(
    (entries, observerInstance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        statNumbers.forEach((element, index) => {
          setTimeout(() => animateValue(element), index * 130);
        });

        observerInstance.unobserve(entry.target);
      });
    },
    {
      threshold: 0.35
    }
  );

  statsObserver.observe(statsContainer);
}

// Experience accordion toggle
const experienceToggles = document.querySelectorAll('[data-experience-toggle]');
experienceToggles.forEach(toggle => {
  toggle.addEventListener('click', (event) => {
    // Prevent company link from triggering if clicking on chip
    if (event.target.closest('.company-chip') && !event.target.classList.contains('toggle-btn')) {
      return;
    }
    
    event.preventDefault();
    event.stopPropagation();
    
    const targetId = toggle.dataset.experienceToggle;
    const targetCard = toggle.closest('.timeline-card');
    
    if (targetCard) {
      targetCard.classList.toggle('collapsed');
    }
  });
});

// Contact form handler
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const statusElement = document.getElementById('form-status');

    // Basic validation
    if (!name || !email || !message) {
      statusElement.textContent = 'Please fill in all fields.';
      statusElement.classList.add('error');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      statusElement.textContent = 'Please enter a valid email address.';
      statusElement.classList.add('error');
      return;
    }

    // Create mailto link
    const subject = `Message from ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    const mailtoLink = `mailto:niteshvishwa69@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open default email client
    window.location.href = mailtoLink;

    // Show success message
    statusElement.textContent = 'Opening your email client...';
    statusElement.classList.remove('error');

    // Reset form after a short delay
    setTimeout(() => {
      contactForm.reset();
      statusElement.textContent = '';
    }, 1500);
  });
}
