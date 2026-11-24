/**
 * Portfolio Interactive Core
 * Replicating Jorge Toloza layout, 3D orbits, parallax & kinetic typography
 */

class PortfolioApp {
  constructor() {
    this.projects = [];
    this.activeIndex = -1;
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
      const res = await fetch('./projects/data.json');
      this.projects = await res.json();
    } catch (e) {
      console.warn('Fallback projects loading:', e);
      this.projects = [];
    }

    this.renderMedias();
    this.renderProjectsInfo();
  }

  renderMedias() {
    const container = document.getElementById('medias');
    if (!container) return;
    container.innerHTML = '';

    this.projects.forEach((proj, idx) => {
      const projectDiv = document.createElement('div');
      projectDiv.className = 'project';
      projectDiv.dataset.id = proj.id;
      projectDiv.dataset.index = idx;
      projectDiv.dataset.link = proj.link;

      // Small image
      const smallDiv = document.createElement('div');
      smallDiv.className = 'small image-container elastic-image';
      smallDiv.dataset.speed = '0.2';
      smallDiv.innerHTML = `<div class="elastic-image-mask"><img src="./assets/projects/${proj.id}/${proj.images[2]}" alt="${proj.name} 3" loading="lazy"></div>`;
      smallDiv.addEventListener('click', () => window.open(proj.link, '_blank'));
      smallDiv.addEventListener('mouseenter', () => this.onMediaHover(proj.link, true));
      smallDiv.addEventListener('mouseleave', () => this.onMediaHover('', false));

      // Group (Large + Medium)
      const groupDiv = document.createElement('div');
      groupDiv.className = 'group';

      const largeDiv = document.createElement('div');
      largeDiv.className = 'large image-container elastic-image';
      largeDiv.dataset.speed = '0.55';
      largeDiv.innerHTML = `<div class="elastic-image-mask"><img src="./assets/projects/${proj.id}/${proj.images[0]}" alt="${proj.name} 1" loading="lazy"></div>`;
      largeDiv.addEventListener('click', () => window.open(proj.link, '_blank'));
      largeDiv.addEventListener('mouseenter', () => this.onMediaHover(proj.link, true));
      largeDiv.addEventListener('mouseleave', () => this.onMediaHover('', false));

      const mediumDiv = document.createElement('div');
      mediumDiv.className = 'medium image-container elastic-image';
      mediumDiv.dataset.speed = '0.38';
      mediumDiv.innerHTML = `<div class="elastic-image-mask"><img src="./assets/projects/${proj.id}/${proj.images[1]}" alt="${proj.name} 2" loading="lazy"></div>`;
      mediumDiv.addEventListener('click', () => window.open(proj.link, '_blank'));
      mediumDiv.addEventListener('mouseenter', () => this.onMediaHover(proj.link, true));
      mediumDiv.addEventListener('mouseleave', () => this.onMediaHover('', false));

      groupDiv.appendChild(largeDiv);
      groupDiv.appendChild(mediumDiv);

      projectDiv.appendChild(smallDiv);
      projectDiv.appendChild(groupDiv);

      // Mobile inline info fallback
      const mobileInfo = document.createElement('div');
      mobileInfo.className = 'mobile-project-info';
      mobileInfo.innerHTML = `
        <h2><a href="${proj.link}" target="_blank">${proj.name} ↗</a></h2>
        <div class="tags">${proj.tags.join(' • ')}</div>
        <p>${proj.description}</p>
      `;
      projectDiv.appendChild(mobileInfo);

      container.appendChild(projectDiv);
    });
  }

  renderProjectsInfo() {
    const container = document.getElementById('projects-info');
    if (!container) return;
    container.innerHTML = '';

    this.projects.forEach((proj, idx) => {
      const projDiv = document.createElement('div');
      projDiv.className = idx === 0 ? 'project active' : 'project';
      projDiv.dataset.id = proj.id;
      projDiv.dataset.index = idx;

      // Smart title with split lines
      const h1 = document.createElement('h1');
      h1.className = 'h1';
      const a = document.createElement('a');
      a.href = proj.link;
      a.target = '_blank';
      a.rel = 'noopener';

      const lineSpan = document.createElement('span');
      lineSpan.className = 'line';
      lineSpan.dataset.index = 0;
      const textSpan = document.createElement('span');
      textSpan.className = 'text';
      textSpan.textContent = proj.name;
      lineSpan.appendChild(textSpan);
      a.appendChild(lineSpan);
      h1.appendChild(a);

      // Tags
      const ul = document.createElement('ul');
      proj.tags.forEach((t, tIdx) => {
        const li = document.createElement('li');
        li.className = 'line';
        li.dataset.index = tIdx + 1;
        const liText = document.createElement('span');
        liText.className = 'text';
        liText.textContent = t;
        li.appendChild(liText);
        ul.appendChild(li);
      });

      // Description
      const p = document.createElement('p');
      p.className = 'line';
      p.dataset.index = proj.tags.length + 1;
      const pText = document.createElement('span');
      pText.className = 'text';
      pText.textContent = proj.description;
      p.appendChild(pText);

      projDiv.appendChild(h1);
      projDiv.appendChild(ul);
      projDiv.appendChild(p);

      container.appendChild(projDiv);
    });

    this.activeIndex = 0;
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

  onMediaHover(link, isHovering) {
    this.mouse.isHovering = isHovering;
    this.mouse.activeLink = link;
    if (isHovering) {
      document.body.classList.add('hover');
    } else {
      document.body.classList.remove('hover');
    }
    if (this.mouse.el) {
      if (isHovering) {
        this.mouse.el.textContent = 'View Project ↗';
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
    const windowH = window.innerHeight;

    // Header parallax fade out
    const headerLogo = document.getElementById('header-logo');
    const headerWords = document.getElementById('header-words');

    if (scrollY > 50) {
      const factor = Math.min(1, scrollY / 600);
      const scale = 1 - factor * 0.2;
      const logoOpacity = Math.max(0, 1 - factor * 1.8);
      if (headerLogo) {
        headerLogo.style.transform = `translate(-50%, -50%) scale(${scale})`;
        headerLogo.style.opacity = logoOpacity;
      }
      if (headerWords) {
        // Words retain their difference blend mode and rotate cleanly
        headerWords.style.transform = `translate(-50%, -50%) scale(${scale})`;
      }
    } else {
      if (headerLogo) {
        headerLogo.style.transform = 'translate(-50%, -50%) scale(1)';
        headerLogo.style.opacity = 1;
      }
      if (headerWords) {
        headerWords.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    }

    // Parallax on masks
    const projects = document.querySelectorAll('#medias .project');
    let bestIndex = 0;
    let minDistance = Infinity;

    projects.forEach((projEl, idx) => {
      const rect = projEl.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const distFromCenter = Math.abs(centerY - windowH * 0.45);

      if (distFromCenter < minDistance) {
        minDistance = distFromCenter;
        bestIndex = idx;
      }

      // Parallax masks
      const masks = projEl.querySelectorAll('.elastic-image');
      masks.forEach(maskEl => {
        const speed = parseFloat(maskEl.dataset.speed || '0.3');
        const offset = (rect.top - windowH * 0.5) * speed * 0.25;
        const innerMask = maskEl.querySelector('.elastic-image-mask');
        if (innerMask) {
          innerMask.style.transform = `translateY(${offset}px)`;
        }
      });
    });

    // Update active project info
    const infoContainer = document.getElementById('projects-info');
    if (infoContainer) {
      if (scrollY < 180) {
        infoContainer.style.opacity = '0';
        infoContainer.style.pointerEvents = 'none';
      } else {
        infoContainer.style.opacity = '1';
        infoContainer.style.pointerEvents = 'all';
      }
    }

    if (bestIndex !== this.activeIndex && bestIndex >= 0) {
      this.activeIndex = bestIndex;
      const infoProjects = document.querySelectorAll('#projects-info .project');
      infoProjects.forEach((p, i) => {
        if (i === bestIndex) {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });
    }
  }

  setupHeaderOrbit() {
    // Interactivity: tilt orbit on mousemove
    window.addEventListener('mousemove', e => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
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
