const showToast = (message) => {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { toast.hidden = true; }, 3500);
};

document.querySelectorAll('[data-tabs]').forEach((group) => {
  const tabs = [...group.querySelectorAll('[role="tab"]')];
  const activate = (selected) => {
    tabs.forEach((tab) => {
      const active = tab === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      activate(tabs[next]);
      tabs[next].focus();
    });
  });
  activate(tabs[0]);
});

const judgments = {
  accept: '这版改写将长度 4 的结果也归入了“零样本泛化”，与仍需额外训练的事实不符。下方分析给出了一种保留两类结果及其条件的短版。',
  reject: '长度 4 仍需额外训练，改写却将它归入了“零样本泛化”，扩大了结论的适用范围。拒绝这版表述后，仍可尝试保留条件的压缩方式。',
  partial: '可以接受“压缩句子”的方向，但不能接受当前措辞。短版仍需区分较短序列的零样本表现与长度 4 的再训练结果。'
};
const decisionButtons = document.querySelector('.decision-buttons');
if (decisionButtons) decisionButtons.hidden = false;
document.querySelectorAll('[data-decision]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-decision]').forEach((item) => {
      item.setAttribute('aria-pressed', String(item === button));
    });
    const feedback = document.querySelector('#decision-feedback');
    feedback.textContent = judgments[button.dataset.decision];
    feedback.hidden = false;
  });
});

document.querySelectorAll('[data-copy]').forEach((button) => {
  button.hidden = false;
  const original = button.textContent;
  button.addEventListener('click', async () => {
    const source = document.getElementById(button.dataset.copy);
    try {
      await navigator.clipboard.writeText(source.textContent.trim());
      button.textContent = '已复制';
      showToast('指令已复制，可替换材料后使用。');
      setTimeout(() => { button.textContent = original; }, 2000);
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(source);
      selection.removeAllRanges();
      selection.addRange(range);
      showToast('已选中文字，请按 Ctrl/Cmd+C，或长按复制。');
    }
  });
});

const tocLinks = [...document.querySelectorAll('.toc nav a')];
const sections = tocLinks.map((link) => document.querySelector(link.getAttribute('href')));
const header = document.querySelector('.site-header');
let scheduled = false;
const updateReading = () => {
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  const fraction = distance > 0 ? window.scrollY / distance : 0;
  const sectionOffset = header.getBoundingClientRect().height + 32;
  document.querySelector('#progress').style.width = `${Math.max(0, Math.min(100, fraction * 100))}%`;
  let activeIndex = 0;
  sections.forEach((section, index) => {
    if (section.getBoundingClientRect().top <= sectionOffset) activeIndex = index;
  });
  if (distance > 0 && window.scrollY >= distance - 4) activeIndex = sections.length - 1;
  tocLinks.forEach((link, index) => {
    const active = index === activeIndex;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scheduled = false;
};
const scheduleReading = () => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(updateReading);
};
window.addEventListener('scroll', scheduleReading, { passive: true });
window.addEventListener('resize', scheduleReading);
new ResizeObserver(() => {
  document.documentElement.style.setProperty('--header-height', `${header.getBoundingClientRect().height}px`);
  scheduleReading();
}).observe(header);
document.querySelectorAll('details').forEach((item) => item.addEventListener('toggle', scheduleReading));
updateReading();

// Reveal an anchored source even when it lives in a collapsed disclosure.
const revealHash = () => {
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (!target) return;
  let parent = target.parentElement;
  let expanded = false;
  while (parent) {
    if (parent.tagName === 'DETAILS' && !parent.open) { parent.open = true; expanded = true; }
    parent = parent.parentElement;
  }
  if (expanded) requestAnimationFrame(() => target.scrollIntoView());
};
window.addEventListener('hashchange', revealHash);
revealHash();

// Editorial print & PDF export (single page + three-part combined booklet).
const PAGES = [
  { file: 'index.html', part: '第一篇', title: '写作原则', prefix: 'p1', url: 'https://veritas-arch.github.io/iridium/' },
  { file: 'case.html', part: '第二篇', title: '写作案例', prefix: 'p2', url: 'https://veritas-arch.github.io/iridium/case.html' },
  { file: 'astra.html', part: '第三篇', title: '与 Astra 协作', prefix: 'p3', url: 'https://veritas-arch.github.io/iridium/astra.html' }
];
const currentFile = PAGES.find((p) => location.pathname.endsWith(`/${p.file}`))?.file || 'index.html';
const currentPageMeta = PAGES.find((p) => p.file === currentFile);
const pageByFile = Object.fromEntries(PAGES.map((p) => [p.file, p]));

const stampSectionNumbers = (tocRoot, articleRoot) => {
  if (!tocRoot || !articleRoot) return;
  tocRoot.querySelectorAll('nav a[href^="#"]').forEach((link) => {
    const num = link.querySelector('span')?.textContent.trim();
    const secId = link.getAttribute('href').slice(1);
    const heading = articleRoot.querySelector(`#${CSS.escape(secId)} h2`);
    if (num && heading) heading.dataset.printNum = num;
  });
};

const prepareCurrentPageMasthead = () => {
  const main = document.querySelector('main#top');
  if (!main) return;
  stampSectionNumbers(main.querySelector('.toc'), main.querySelector('article'));
  if (!main.querySelector('.print-masthead')) {
    const masthead = document.createElement('div');
    masthead.className = 'print-masthead';
    masthead.setAttribute('aria-hidden', 'true');
    masthead.innerHTML = `<div class="print-masthead-brand"><span class="print-badge">Ir 77</span><span>IRIDIUM · AI 辅助论文写作</span></div><div class="print-masthead-part">${currentPageMeta.part} · ${currentPageMeta.title}</div>`;
    main.prepend(masthead);
  }
  const meta = main.querySelector('.article-meta');
  if (meta && !meta.querySelector('.print-url')) {
    const urlSpan = document.createElement('span');
    urlSpan.className = 'print-url';
    urlSpan.textContent = currentPageMeta.url.replace(/^https?:\/\//, '');
    meta.append(urlSpan);
  }
};
prepareCurrentPageMasthead();

let closedBeforePrint = [];
const openDetailsForPrint = () => {
  closedBeforePrint = [...document.querySelectorAll('main details:not([open])')];
  closedBeforePrint.forEach((item) => { item.open = true; });
};
const cleanupAfterPrint = () => {
  closedBeforePrint.forEach((item) => { item.open = false; });
  closedBeforePrint = [];
  delete document.body.dataset.printActive;
};
window.addEventListener('beforeprint', () => {
  if (!document.body.dataset.printActive) document.body.dataset.printActive = 'single';
  if (document.body.dataset.printActive === 'single') openDetailsForPrint();
});
window.addEventListener('afterprint', cleanupAfterPrint);

let bookletPromise = null;
const buildBooklet = async () => {
  if (bookletPromise) return bookletPromise;
  bookletPromise = (async () => {
    const parser = new DOMParser();
    const docs = await Promise.all(PAGES.map(async (meta) => {
      if (meta.file === currentFile) return { meta, doc: document };
      const response = await fetch(meta.file);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      return { meta, doc: parser.parseFromString(html, 'text/html') };
    }));

    const booklet = document.createElement('div');
    booklet.id = 'print-booklet';
    booklet.className = 'print-booklet';
    booklet.setAttribute('aria-hidden', 'true');

    const cover = document.createElement('section');
    cover.className = 'booklet-cover';
    cover.innerHTML = `
      <div class="print-masthead">
        <div class="print-masthead-brand"><span class="print-badge">Ir 77</span><span>IRIDIUM · RESEARCH WRITING GUIDE</span></div>
        <div class="print-masthead-part">全三篇合订本</div>
      </div>
      <header class="booklet-cover-head">
        <h1>AI 辅助论文写作<br><span>原则、案例与协作</span></h1>
        <p class="standfirst">围绕科研写作中的读者、问题、概念、证据、结构与表达，讨论 AI 如何参与起草、审读与修改。本合订本收录《写作原则》《写作案例》《与 Astra 协作》全部三篇正文、真实稿件对照与起始指令。</p>
        <p class="article-meta"><time datetime="2026-11-04">2026 年 11 月 4 日</time><span class="print-url">veritas-arch.github.io/iridium/</span></p>
      </header>
      <p class="booklet-toc-title">全书总目录 · CONTENTS</p>
    `;

    const partsFragment = document.createDocumentFragment();
    docs.forEach(({ meta, doc }) => {
      const tocSource = doc.querySelector('.toc');
      const headSource = doc.querySelector('.article-head');
      const articleSource = doc.querySelector('article');

      const headClone = headSource.cloneNode(true);
      headClone.querySelector('.print-url')?.remove();
      const articleClone = articleSource.cloneNode(true);
      stampSectionNumbers(tocSource, articleClone);

      // Build Master TOC block for this part
      const tocPart = document.createElement('div');
      tocPart.className = 'booklet-toc-part';
      const tocHead = document.createElement('div');
      tocHead.className = 'booklet-toc-part-head';
      tocHead.innerHTML = `<a href="#${meta.prefix}-part">${meta.part} · ${meta.title}</a><span>${meta.url.replace(/^https?:\/\//, '')}</span>`;
      const tocGrid = document.createElement('div');
      tocGrid.className = 'booklet-toc-grid';
      tocSource.querySelectorAll('nav a[href^="#"]').forEach((a) => {
        const item = a.cloneNode(true);
        item.classList.remove('active');
        item.removeAttribute('aria-current');
        item.setAttribute('href', `#${meta.prefix}-${a.getAttribute('href').slice(1)}`);
        tocGrid.append(item);
      });
      tocPart.append(tocHead, tocGrid);
      cover.append(tocPart);

      // Namespace IDs, ARIA links, details, and cross-page links inside the cloned part
      const partSection = document.createElement('section');
      partSection.className = `booklet-part ${meta.file === 'case.html' ? 'case-page' : ''}`.trim();
      partSection.id = `${meta.prefix}-part`;
      const kicker = document.createElement('div');
      kicker.className = 'booklet-part-kicker';
      kicker.innerHTML = `<span>${meta.part} · ${meta.title}</span><span>${meta.url.replace(/^https?:\/\//, '')}</span>`;
      partSection.append(kicker, headClone, articleClone);

      partSection.querySelectorAll('[id]').forEach((el) => {
        if (el === partSection) return;
        el.id = `${meta.prefix}-${el.id}`;
      });
      ['aria-labelledby', 'aria-controls'].forEach((attr) => {
        partSection.querySelectorAll(`[${attr}]`).forEach((el) => {
          el.setAttribute(attr, el.getAttribute(attr).split(/\s+/).map((id) => `${meta.prefix}-${id}`).join(' '));
        });
      });
      partSection.querySelectorAll('details').forEach((d) => { d.open = true; });
      partSection.querySelectorAll('[data-copy], .decision-buttons, .download-link').forEach((el) => el.remove());
      partSection.querySelectorAll('a[href]').forEach((a) => {
        const raw = a.getAttribute('href');
        if (!raw || raw.startsWith('http://') || raw.startsWith('https://')) return;
        const [filePart, hashPart] = raw.split('#');
        const targetMeta = filePart ? pageByFile[filePart] : meta;
        if (!targetMeta) return;
        a.setAttribute('href', hashPart ? `#${targetMeta.prefix}-${hashPart}` : `#${targetMeta.prefix}-part`);
      });

      partsFragment.append(partSection);
    });

    booklet.append(cover, partsFragment);
    document.body.append(booklet);
    return booklet;
  })().catch((err) => {
    bookletPromise = null;
    throw err;
  });
  return bookletPromise;
};

const printMenu = document.querySelector('#print-menu');
if (printMenu) {
  printMenu.hidden = false;
  const toggle = printMenu.querySelector('#print-toggle');
  const popover = printMenu.querySelector('#print-popover');
  const options = [...popover.querySelectorAll('[data-print-mode]')];

  const closeMenu = (restoreFocus = false) => {
    popover.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    if (restoreFocus) toggle.focus();
  };
  const openMenu = () => {
    popover.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
  };

  toggle.addEventListener('click', () => {
    if (popover.hidden) openMenu();
    else closeMenu();
  });
  document.addEventListener('click', (event) => {
    if (!popover.hidden && !printMenu.contains(event.target)) closeMenu();
  });
  printMenu.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !popover.hidden) {
      event.preventDefault();
      closeMenu(true);
    } else if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && !popover.hidden) {
      event.preventDefault();
      const idx = options.indexOf(document.activeElement);
      const next = event.key === 'ArrowDown'
        ? options[(idx + 1) % options.length]
        : options[(idx - 1 + options.length) % options.length];
      next.focus();
    }
  });

  options.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const mode = btn.dataset.printMode;
      closeMenu();
      if (mode === 'single') {
        document.body.dataset.printActive = 'single';
        openDetailsForPrint();
        requestAnimationFrame(() => window.print());
        return;
      }
      const label = toggle.querySelector('.print-label');
      const originalText = label.textContent;
      try {
        label.textContent = '正在准备…';
        toggle.disabled = true;
        await buildBooklet();
        document.body.dataset.printActive = 'booklet';
        requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
      } catch {
        showToast('合订本需通过网页服务（http/https）加载其余两篇；本地直接打开时请选择“当前页面”。');
      } finally {
        label.textContent = originalText;
        toggle.disabled = false;
      }
    });
  });
}
