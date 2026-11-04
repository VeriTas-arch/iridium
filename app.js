const showToast = (message) => {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { toast.hidden = true; }, 3000);
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

const printButton = document.querySelector('#print-page');
printButton.hidden = false;
printButton.addEventListener('click', () => window.print());
let closedBeforePrint = [];
window.addEventListener('beforeprint', () => {
  closedBeforePrint = [...document.querySelectorAll('details:not([open])')];
  closedBeforePrint.forEach((item) => { item.open = true; });
});
window.addEventListener('afterprint', () => {
  closedBeforePrint.forEach((item) => { item.open = false; });
});
