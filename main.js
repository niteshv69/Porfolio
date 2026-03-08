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

// ── VISITOR ADMIN DASHBOARD ──────────────────────────────────────────────────
// SETUP (one-time, free):
//  1. Go to https://console.firebase.google.com → Create a project
//  2. Build → Realtime Database → Create database → Start in test mode
//  3. Copy your database URL (looks like: https://xxx-default-rtdb.firebaseio.com)
//  4. Paste it below replacing YOUR_PROJECT_ID-default-rtdb
//  5. Change ADMIN_PASS to your own secret password
const FB_DB_URL = 'https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com';
const ADMIN_PASS = 'nitesh@admin2026'; // ← Change this!

const _fbReady = !FB_DB_URL.includes('YOUR_PROJECT_ID');

async function saveVisitorToDB(data) {
  if (!_fbReady) return;
  try {
    await fetch(`${FB_DB_URL}/visitors.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch { /* silent */ }
}

async function fetchAllVisitors() {
  const res = await fetch(`${FB_DB_URL}/visitors.json`);
  const data = await res.json();
  if (!data || typeof data !== 'object') return [];
  return Object.values(data).reverse(); // newest first
}

// ── Visitor tracking — fires once per browser session ────────────────────────
(async function trackVisitor() {
  if (sessionStorage.getItem('_vt')) return;
  sessionStorage.setItem('_vt', '1');

  try {
    const ua = navigator.userAgent;

    let browser = 'Unknown';
    if (ua.includes('Edg/'))                                   browser = 'Microsoft Edge';
    else if (ua.includes('OPR/') || ua.includes('Opera'))      browser = 'Opera';
    else if (ua.includes('Chrome/'))                           browser = 'Google Chrome';
    else if (ua.includes('Firefox/'))                          browser = 'Mozilla Firefox';
    else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Apple Safari';
    else if (ua.includes('MSIE') || ua.includes('Trident/'))   browser = 'Internet Explorer';

    let os = 'Unknown OS';
    if (/iPhone|iPad|iPod/.test(ua))  os = 'iOS';
    else if (/Android/.test(ua))       os = 'Android';
    else if (/Windows NT/.test(ua))    os = 'Windows';
    else if (/Macintosh/.test(ua))     os = 'macOS';
    else if (/Linux/.test(ua))         os = 'Linux';

    const device = /Mobi|Android|iPhone|iPad|iPod/.test(ua) ? 'Mobile / Tablet' : 'Desktop';

    const res = await fetch('https://ipapi.co/json/');
    const d = await res.json();

    const visitorData = {
      'IP Address':        d.ip            || 'N/A',
      'City / Region':     `${d.city || ''}, ${d.region || ''}`.replace(/^,\s*/, ''),
      'Country':           d.country_name  || 'N/A',
      'ISP / Network':     d.org           || 'N/A',
      'Browser':           browser,
      'Operating System':  os,
      'Device Type':       device,
      'Screen Resolution': `${screen.width}x${screen.height}`,
      'Visited At':        new Date().toLocaleString()
    };

    // Save to Firebase Realtime Database
    await saveVisitorToDB(visitorData);

    // Also send email notification via FormSubmit
    const form = new FormData();
    form.append('_subject', '🔔 New Portfolio Visitor');
    form.append('_captcha', 'false');
    for (const [k, v] of Object.entries(visitorData)) form.append(k, v);
    await fetch('https://formsubmit.co/ajax/niteshvishwa69@gmail.com', {
      method: 'POST',
      body: form
    });
  } catch { /* silent */ }
})();

// ── Admin Panel ───────────────────────────────────────────────────────────────
const adminOverlay    = document.getElementById('admin-overlay');
const adminDashboard  = document.getElementById('admin-dashboard-overlay');
const adminPassForm   = document.getElementById('admin-pass-form');
const adminPassInput  = document.getElementById('admin-pass-input');
const adminPassError  = document.getElementById('admin-pass-error');
const adminPassClose  = document.getElementById('admin-pass-close');
const adminDashClose  = document.getElementById('admin-dash-close');
const adminExportBtn  = document.getElementById('admin-export-btn');

function openAdminLogin() {
  if (!adminOverlay) return;
  adminPassInput.value = '';
  adminPassError.textContent = '';
  adminOverlay.setAttribute('aria-hidden', 'false');
  adminOverlay.classList.add('open');
  setTimeout(() => adminPassInput.focus(), 80);
}

function closeAdminLogin() {
  adminOverlay?.classList.remove('open');
  adminOverlay?.setAttribute('aria-hidden', 'true');
}

function openDashboard() {
  if (!adminDashboard) return;
  adminDashboard.setAttribute('aria-hidden', 'false');
  adminDashboard.classList.add('open');
  loadVisitorData();
}

function closeDashboard() {
  adminDashboard?.classList.remove('open');
  adminDashboard?.setAttribute('aria-hidden', 'true');
}

// Keyboard shortcut: Ctrl+Shift+V
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'V') {
    e.preventDefault();
    openAdminLogin();
  }
});

// Triple-click on footer
let footerClickCount = 0;
let footerClickTimer = null;
document.querySelector('.footer')?.addEventListener('click', () => {
  footerClickCount++;
  clearTimeout(footerClickTimer);
  footerClickTimer = setTimeout(() => { footerClickCount = 0; }, 600);
  if (footerClickCount >= 3) {
    footerClickCount = 0;
    openAdminLogin();
  }
});

adminPassClose?.addEventListener('click', closeAdminLogin);
adminDashClose?.addEventListener('click', closeDashboard);

// Close on overlay backdrop click
adminOverlay?.addEventListener('click', (e) => { if (e.target === adminOverlay) closeAdminLogin(); });
adminDashboard?.addEventListener('click', (e) => { if (e.target === adminDashboard) closeDashboard(); });

// Password check
adminPassForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (adminPassInput.value === ADMIN_PASS) {
    closeAdminLogin();
    openDashboard();
  } else {
    adminPassError.textContent = 'Incorrect password. Try again.';
    adminPassInput.value = '';
    adminPassInput.focus();
  }
});

// Load & render visitor data
async function loadVisitorData() {
  const loading  = document.getElementById('admin-loading');
  const table    = document.getElementById('admin-table');
  const tbody    = document.getElementById('admin-table-body');
  const empty    = document.getElementById('admin-empty');

  if (!_fbReady) {
    loading.hidden = true;
    empty.hidden = false;
    empty.textContent = 'Firebase not configured yet. See code comments in main.js to set it up.';
    return;
  }

  try {
    const visitors = await fetchAllVisitors();

    loading.hidden = true;

    if (visitors.length === 0) {
      empty.hidden = false;
      return;
    }

    // Stats
    const countries  = new Set(visitors.map(v => v['Country'])).size;
    const mobileCount = visitors.filter(v => v['Device Type']?.includes('Mobile')).length;
    const mobilePct  = Math.round((mobileCount / visitors.length) * 100);
    const browserMap = {};
    visitors.forEach(v => { const b = v['Browser'] || 'Unknown'; browserMap[b] = (browserMap[b] || 0) + 1; });
    const topBrowser = Object.entries(browserMap).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    document.getElementById('stat-total').textContent       = visitors.length;
    document.getElementById('stat-countries').textContent   = countries;
    document.getElementById('stat-mobile').textContent      = mobilePct + '%';
    document.getElementById('stat-top-browser').textContent = topBrowser;

    // Table rows
    tbody.innerHTML = '';
    visitors.forEach((v, i) => {
      const isMobile = v['Device Type']?.includes('Mobile');
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${visitors.length - i}</td>
        <td>${escHtml(v['IP Address'] || '—')}</td>
        <td>${escHtml(v['City / Region'] || '—')}</td>
        <td>${escHtml(v['Country'] || '—')}</td>
        <td>${escHtml(v['ISP / Network'] || '—')}</td>
        <td><span class="admin-badge">${escHtml(v['Browser'] || '—')}</span></td>
        <td>${escHtml(v['Operating System'] || '—')}</td>
        <td><span class="admin-badge${isMobile ? ' mobile' : ''}">${escHtml(v['Device Type'] || '—')}</span></td>
        <td>${escHtml(v['Screen Resolution'] || '—')}</td>
        <td>${escHtml(v['Visited At'] || '—')}</td>
      `;
      tbody.appendChild(tr);
    });

    table.hidden = false;

    // Store for CSV export
    adminDashboard._visitors = visitors;
  } catch (err) {
    loading.textContent = 'Failed to load visitor data. Check Firebase configuration.';
  }
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// CSV export
adminExportBtn?.addEventListener('click', () => {
  const visitors = adminDashboard._visitors;
  if (!visitors?.length) return;

  const headers = ['#','IP Address','City / Region','Country','ISP / Network','Browser','Operating System','Device Type','Screen Resolution','Visited At'];
  const rows = visitors.map((v, i) => [
    visitors.length - i,
    v['IP Address'] || '',
    v['City / Region'] || '',
    v['Country'] || '',
    v['ISP / Network'] || '',
    v['Browser'] || '',
    v['Operating System'] || '',
    v['Device Type'] || '',
    v['Screen Resolution'] || '',
    v['Visited At'] || ''
  ].map(c => `"${String(c).replace(/"/g,'""')}"`).join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `visitors_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
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
