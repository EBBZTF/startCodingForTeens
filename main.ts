declare const hljs: { highlightElement(el: HTMLElement): void } | undefined;

// ---- reveal-on-scroll ----
function initReveal(): void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll<HTMLElement>('.reveal');
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add('in'));
  }
}

// ---- language switch (code stays English) ----
function initLangSwitch(): void {
  const nodes = document.querySelectorAll<HTMLElement>('[data-de]');
  const en = new Map<HTMLElement, string>();
  nodes.forEach((el) => en.set(el, el.innerHTML));

  const enBtn = document.getElementById('en-btn');
  const deBtn = document.getElementById('de-btn');
  if (!enBtn || !deBtn) return;

  function setLang(lang: 'en' | 'de'): void {
    nodes.forEach((el) => {
      const de = el.getAttribute('data-de');
      el.innerHTML = lang === 'de' && de !== null ? de : (en.get(el) ?? '');
    });
    document.documentElement.lang = lang;
    enBtn!.classList.toggle('on', lang === 'en');
    deBtn!.classList.toggle('on', lang === 'de');
  }

  enBtn.addEventListener('click', () => setLang('en'));
  deBtn.addEventListener('click', () => setLang('de'));

  const initial: 'en' | 'de' = (navigator.language || 'en').toLowerCase().indexOf('de') === 0 ? 'de' : 'en';
  setLang(initial);
}

// ---- movable sprite demo ----
function initSpriteDemo(): void {
  const arena = document.getElementById('arena');
  const sprite = document.getElementById('sprite');
  if (!arena || !sprite) return;

  const step = 22;

  function bounds(): { w: number; h: number } {
    return { w: arena!.clientWidth - sprite!.offsetWidth, h: arena!.clientHeight - sprite!.offsetHeight };
  }
  function pos(): { x: number; y: number } {
    return { x: parseInt(sprite!.style.left || '20', 10), y: parseInt(sprite!.style.top || '20', 10) };
  }
  function clamp(v: number, max: number): number {
    return Math.max(0, Math.min(v, max));
  }
  function move(dir: string): void {
    const b = bounds();
    const p = pos();
    if (dir === 'left') p.x -= step;
    if (dir === 'right') p.x += step;
    if (dir === 'up') p.y -= step;
    if (dir === 'down') p.y += step;
    sprite!.style.left = clamp(p.x, b.w) + 'px';
    sprite!.style.top = clamp(p.y, b.h) + 'px';
  }

  const keyDirs: Record<string, string> = {
    ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
    a: 'left', d: 'right', w: 'up', s: 'down',
  };
  arena.addEventListener('keydown', (e) => {
    const dir = keyDirs[e.key];
    if (dir) { e.preventDefault(); move(dir); }
  });
  document.querySelectorAll<HTMLButtonElement>('.dpad button').forEach((btn) => {
    btn.addEventListener('click', () => {
      move(btn.getAttribute('data-dir') || '');
      arena!.focus();
    });
  });
}

// ---- show the source code + copy / download ----
async function initGameSourceViewer(): Promise<void> {
  const codeEl = document.getElementById('game-code');
  const copyBtn = document.getElementById('copy-btn');
  const dlBtn = document.getElementById('dl-btn');
  if (!codeEl) return;

  const response = await fetch('platformer-demo.py');
  const raw = await response.text();
  codeEl.textContent = raw;
  if (typeof hljs !== 'undefined') {
    try { hljs.highlightElement(codeEl); } catch { /* highlighting is best-effort */ }
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (navigator.clipboard) navigator.clipboard.writeText(raw);
      const prev = copyBtn.textContent;
      copyBtn.textContent = document.documentElement.lang === 'de' ? 'kopiert!' : 'copied!';
      setTimeout(() => { copyBtn.textContent = prev; }, 1200);
    });
  }
  if (dlBtn) {
    dlBtn.addEventListener('click', () => {
      const blob = new Blob([raw], { type: 'text/x-python' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'platformer.py';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
}

// ---- playable browser version of the same game ----
interface PlayerState {
  x: number; y: number; w: number; h: number; vy: number; onGround: boolean;
}
interface GameState {
  p: PlayerState;
  platforms: number[][];
  coins: number[][];
  got: number[];
  won: boolean;
}

function initPlayableGame(): void {
  const canvas = document.getElementById('game') as HTMLCanvasElement | null;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = 800, H = 400, GRAVITY = 0.6, JUMP = -13, SPEED = 5;

  function start(): GameState {
    return {
      p: { x: 80, y: 200, w: 32, h: 44, vy: 0, onGround: false },
      platforms: [[0, 368, 800, 32], [180, 300, 140, 20], [380, 240, 140, 20], [600, 300, 140, 20]],
      coins: [[240, 270], [440, 210], [660, 270], [120, 330]],
      got: [],
      won: false,
    };
  }

  let g = start();
  const keys = { left: false, right: false };

  function jump(): void {
    if (g.p.onGround && !g.won) {
      g.p.vy = JUMP;
      g.p.onGround = false;
    }
  }

  canvas.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') { keys.left = true; e.preventDefault(); }
    else if (e.key === 'ArrowRight' || e.key === 'd') { keys.right = true; e.preventDefault(); }
    else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') { jump(); e.preventDefault(); }
    else if (e.key === 'r' || e.key === 'R') { g = start(); }
  });
  canvas.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
  });

  function hold(act: string, down: boolean): void {
    if (act === 'left') keys.left = down;
    if (act === 'right') keys.right = down;
    if (act === 'jump' && down) jump();
  }
  document.querySelectorAll<HTMLButtonElement>('.game-pad button').forEach((btn) => {
    const act = btn.getAttribute('data-act') || '';
    btn.addEventListener('pointerdown', (e) => { e.preventDefault(); canvas.focus(); hold(act, true); });
    btn.addEventListener('pointerup', () => hold(act, false));
    btn.addEventListener('pointerleave', () => hold(act, false));
  });
  canvas.addEventListener('pointerdown', () => canvas.focus());

  function update(): void {
    if (g.won) return;
    const p = g.p;
    if (keys.left) p.x -= SPEED;
    if (keys.right) p.x += SPEED;
    p.vy += GRAVITY;
    p.y += p.vy;
    p.onGround = false;
    g.platforms.forEach((pl) => {
      const overlap = p.x < pl[0] + pl[2] && p.x + p.w > pl[0] && p.y < pl[1] + pl[3] && p.y + p.h > pl[1];
      if (overlap && p.vy >= 0 && (p.y + p.h) - p.vy <= pl[1] + 1) {
        p.y = pl[1] - p.h;
        p.vy = 0;
        p.onGround = true;
      }
    });
    if (p.x < 0) p.x = 0;
    if (p.x + p.w > W) p.x = W - p.w;
    if (p.y > H) { p.x = 80; p.y = 200; p.vy = 0; }
    g.coins.forEach((c, i) => {
      if (g.got.indexOf(i) === -1 && p.x < c[0] + 8 && p.x + p.w > c[0] - 8 && p.y < c[1] + 8 && p.y + p.h > c[1] - 8) {
        g.got.push(i);
      }
    });
    if (g.got.length === g.coins.length) g.won = true;
  }

  function draw(): void {
    ctx!.fillStyle = '#14102a'; ctx!.fillRect(0, 0, W, H);
    ctx!.fillStyle = '#3fe0d0';
    g.platforms.forEach((pl) => ctx!.fillRect(pl[0], pl[1], pl[2], pl[3]));
    ctx!.fillStyle = '#ffcf4d';
    g.coins.forEach((c, i) => {
      if (g.got.indexOf(i) === -1) {
        ctx!.beginPath();
        ctx!.arc(c[0], c[1], 8, 0, 6.2832);
        ctx!.fill();
      }
    });
    ctx!.fillStyle = '#ff5ea8'; ctx!.fillRect(g.p.x, g.p.y, g.p.w, g.p.h);
    ctx!.fillStyle = '#f2eeff'; ctx!.font = '22px monospace'; ctx!.textAlign = 'left';
    ctx!.fillText('Coins: ' + g.got.length + '/' + g.coins.length, 12, 28);
    if (g.won) {
      ctx!.fillStyle = '#ffcf4d'; ctx!.font = '54px monospace'; ctx!.textAlign = 'center';
      ctx!.fillText('YOU WIN!', W / 2, H / 2 + 18);
    }
  }

  function loop(): void {
    update();
    draw();
    requestAnimationFrame(loop);
  }
  loop();
}

initReveal();
initLangSwitch();
initSpriteDemo();
initGameSourceViewer();
initPlayableGame();
