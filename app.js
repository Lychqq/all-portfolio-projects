/**
 * Portfolio Interactive Core
 * Replicating Jorge Toloza layout, 3D orbits, parallax & kinetic typography
 */

class PortfolioApp {
  constructor() {
    this.projects = [];
    this.mouse = {
      el: document.getElementById('mouse'),
      current: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      target: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      isHovering: false,
      activeLink: ''
    };
    this.scrollY = window.scrollY;
    this.init();
  }

  async init() {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    this.setupHoverLetters();
    await this.loadProjects();
    this.setupMouseFollower();
    this.setupScrollAndParallax();
    this.setupHeaderOrbit();

    // Force initial zero scroll state
    this.onScroll(0);

    // Close loading screen
    setTimeout(() => {
      const loader = document.getElementById('loading');
      if (loader) loader.classList.add('hide');
    }, 400);
  }

  setupHoverLetters() {
    document.querySelectorAll('.hover-letters').forEach(el => {
      const text = el.textContent;
      el.innerHTML = '';
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const spanContainer = document.createElement('span');
        spanContainer.className = char === ' ' ? 'letter-container space' : 'letter-container';
        const spanLetter = document.createElement('span');
        spanLetter.className = 'letter';
        spanLetter.textContent = char;
        spanContainer.appendChild(spanLetter);
        el.appendChild(spanContainer);
      }
    });
  }

  async loadProjects() {
    try {
      const res = await fetch('./projects/data.json?v=20261124_7');
      this.projects = await res.json();
    } catch (e) {
      console.warn('Fallback projects loading:', e);
      this.projects = [];
    }

    this.renderProjects();
  }

  renderProjects() {
    const feed = document.getElementById('projects-feed');
    if (!feed) return;
    feed.innerHTML = '';

    const attach3DTilt = el => {
      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `perspective(1200px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale3d(1.015, 1.015, 1.015)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)';
      });
    };

    this.projects.forEach((proj, idx) => {
      const card = document.createElement('article');
      card.className = 'project-card';
      card.dataset.id = proj.id;
      card.dataset.index = idx;

      // Header block (Meta, Title, Description)
      const header = document.createElement('div');
      header.className = 'project-header';

      const year = proj.tags[0] || '2026';
      const otherTags = proj.tags.slice(1).join(' • ');

      header.innerHTML = `
        <div class="project-meta">
          <span class="badge-year">${year}</span>
          <span>${otherTags}</span>
        </div>
        <h2 class="project-title">
          <a href="${proj.link}" target="_blank" rel="noopener">
            ${proj.name}
            <span class="arrow">↗</span>
          </a>
        </h2>
        <p class="project-desc">${proj.description}</p>
      `;

      // Visual block
      const visual = document.createElement('div');
      visual.className = 'project-visual';

      const hasMultiple = Array.isArray(proj.images) && proj.images.length > 1;

      // Frame
      const frame = document.createElement('div');
      frame.className = 'screenshot-frame';
      attach3DTilt(frame);

      let currentImgIdx = 0;
      const initialImg = proj.images[0].src || proj.images[0];
      const initialLabel = proj.images[0].label || `${proj.name} 1`;

      const imgEl = document.createElement('img');
      imgEl.src = `./assets/projects/${proj.id}/${initialImg}`;
      imgEl.alt = initialLabel;
      imgEl.loading = 'lazy';
      frame.appendChild(imgEl);

      frame.addEventListener('click', () => {
        if (!hasMultiple) {
          window.open(proj.link, '_blank');
        } else {
          // Cycle to next screen on click
          currentImgIdx = (currentImgIdx + 1) % proj.images.length;
          updateActiveScreen(currentImgIdx);
        }
      });

      frame.addEventListener('mouseenter', () => {
        this.onMediaHover(proj.link, true, hasMultiple ? 'Click to cycle screens ↗' : 'View Project ↗');
      });
      frame.addEventListener('mouseleave', () => {
        this.onMediaHover('', false);
      });

      visual.appendChild(frame);

      // Multi-screen Tabs switcher
      let updateActiveScreen = () => {};
      if (hasMultiple) {
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'showcase-tabs';

        const buttons = proj.images.map((imgObj, sIdx) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = sIdx === 0 ? 'tab-btn active' : 'tab-btn';
          btn.textContent = `Экран ${sIdx + 1}: ${imgObj.label || 'Скриншот'}`;

          btn.addEventListener('click', e => {
            e.stopPropagation();
            currentImgIdx = sIdx;
            updateActiveScreen(sIdx);
          });
          tabsContainer.appendChild(btn);
          return btn;
        });

        updateActiveScreen = sIdx => {
          const targetObj = proj.images[sIdx];
          imgEl.style.opacity = '0.4';
          setTimeout(() => {
            imgEl.src = `./assets/projects/${proj.id}/${targetObj.src}`;
            imgEl.alt = targetObj.label;
            imgEl.style.opacity = '1';
          }, 120);

          buttons.forEach((b, bIdx) => {
            if (bIdx === sIdx) {
              b.classList.add('active');
            } else {
              b.classList.remove('active');
            }
          });
        };

        visual.appendChild(tabsContainer);
      }

      card.appendChild(header);
      card.appendChild(visual);
      feed.appendChild(card);
    });
  }

  setupMouseFollower() {
    window.addEventListener('mousemove', e => {
      this.mouse.target.x = e.clientX;
      this.mouse.target.y = e.clientY;
    });

    const updateMouse = () => {
      const lerpFactor = 0.18;
      this.mouse.current.x += (this.mouse.target.x - this.mouse.current.x) * lerpFactor;
      this.mouse.current.y += (this.mouse.target.y - this.mouse.current.y) * lerpFactor;

      if (this.mouse.el) {
        this.mouse.el.style.transform = `translate(${this.mouse.current.x}px, ${this.mouse.current.y}px)`;
      }
      requestAnimationFrame(updateMouse);
    };
    requestAnimationFrame(updateMouse);
  }

  onMediaHover(link, isHovering, label = 'View Project ↗') {
    this.mouse.isHovering = isHovering;
    this.mouse.activeLink = link;
    if (isHovering) {
      document.body.classList.add('hover');
    } else {
      document.body.classList.remove('hover');
    }
    if (this.mouse.el) {
      if (isHovering) {
        this.mouse.el.textContent = label;
        this.mouse.el.classList.add('show');
      } else {
        this.mouse.el.classList.remove('show');
      }
    }
  }

  setupScrollAndParallax() {
    let lenis = null;
    if (typeof window.Lenis !== 'undefined') {
      lenis = new window.Lenis({
        duration: 1.2,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true
      });
      this.lenis = lenis;
      lenis.scrollTo(0, { immediate: true });

      const raf = time => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);

      lenis.on('scroll', e => {
        this.onScroll(e.scroll);
      });
    } else {
      window.addEventListener('scroll', () => {
        this.onScroll(window.scrollY);
      });
    }
  }

  onScroll(scrollY) {
    this.scrollY = scrollY;

    // Header parallax fade out
    const headerLogo = document.getElementById('header-logo');
    const headerWords = document.getElementById('header-words');

    if (scrollY > 50) {
      const factor = Math.min(1, scrollY / 450);
      const scale = 1 - factor * 0.25;
      const opacity = Math.max(0, 1 - factor * 1.8);
      if (headerLogo) {
        headerLogo.style.transform = `translate(-50%, -50%) scale(${scale})`;
        headerLogo.style.opacity = opacity;
        headerLogo.style.pointerEvents = opacity > 0.05 ? 'all' : 'none';
      }
      if (headerWords) {
        headerWords.style.transform = `translate(-50%, -50%) scale(${scale})`;
        headerWords.style.opacity = opacity;
        headerWords.style.pointerEvents = opacity > 0.05 ? 'all' : 'none';
      }
    } else {
      if (headerLogo) {
        headerLogo.style.transform = 'translate(-50%, -50%) scale(1)';
        headerLogo.style.opacity = 1;
        headerLogo.style.pointerEvents = 'all';
      }
      if (headerWords) {
        headerWords.style.transform = 'translate(-50%, -50%) scale(1)';
        headerWords.style.opacity = 1;
        headerWords.style.pointerEvents = 'none';
      }
    }
  }

  setupHeaderOrbit() {
    // Interactivity: tilt orbit on mousemove
    window.addEventListener('mousemove', e => {
      const x = (e.clientX / window.innerWidth - 0.5) * 16;
      const y = (e.clientY / window.innerHeight - 0.5) * 16;
      const words = document.getElementById('header-words');
      if (words && this.scrollY < 200) {
        words.style.perspectiveOrigin = `${50 + x}% ${50 + y}%`;
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PortfolioApp();
});
