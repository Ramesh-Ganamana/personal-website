/* Optional presentation enhancements. Reading content and contact links work
   without this file; the workflow is explicitly an illustration, not a service. */
(() => {
  'use strict';

  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const motionButton = document.querySelector('.motion-toggle');
  const activeAnimations = new Set();
  let motionPaused = false;
  try { motionPaused = localStorage.getItem('rg-motion') === 'off'; } catch { /* Storage is optional. */ }
  const canAnimate = () => !reducedMotion.matches && !motionPaused;

  function updateMotion() {
    const enabled = canAnimate();
    root.dataset.motion = enabled ? 'on' : 'off';
    motionButton.hidden = false;
    motionButton.disabled = reducedMotion.matches;
    motionButton.setAttribute('aria-pressed', String(!enabled));
    motionButton.setAttribute('aria-label', reducedMotion.matches
      ? 'Your device’s reduced-motion preference is enabled'
      : enabled ? 'Pause visual effects' : 'Enable visual effects');
    motionButton.textContent = reducedMotion.matches ? 'Motion: reduced' : enabled ? 'Motion: on' : 'Motion: paused';
    if (!enabled) activeAnimations.forEach(animation => animation.cancel());
  }
  motionButton.addEventListener('click', () => {
    motionPaused = !motionPaused;
    try { localStorage.setItem('rg-motion', motionPaused ? 'off' : 'on'); } catch { /* No persistence required. */ }
    updateMotion();
  });
  reducedMotion.addEventListener('change', updateMotion);
  updateMotion();

  // Animate only when a section enters view, never hide waiting/offscreen text.
  if ('IntersectionObserver' in window && typeof Element.prototype.animate === 'function') {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        revealObserver.unobserve(entry.target);
        if (!canAnimate()) return;
        const animation = entry.target.animate([
          { opacity: .45, transform: 'translateY(18px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 550, easing: 'cubic-bezier(.2,.7,.3,1)' });
        activeAnimations.add(animation);
        animation.finished.then(() => activeAnimations.delete(animation), () => activeAnimations.delete(animation));
      });
    }, { threshold: .12 });
    document.querySelectorAll('.section-heading, .capability-card, .project-card, .agent-row, .profile-block')
      .forEach(element => revealObserver.observe(element));
  }

  // Passive, frame-limited reading position and section navigation.
  const header = document.querySelector('.site-header');
  const sectionLinks = [...document.querySelectorAll('#main-nav a[href^="#"]')];
  const sections = sectionLinks.map(link => document.querySelector(link.getAttribute('href')));
  let scrollFrame = 0;
  function updateReadingPosition() {
    scrollFrame = 0;
    const scrollable = Math.max(0, root.scrollHeight - window.innerHeight);
    const position = scrollable ? Math.max(0, Math.min(1, window.scrollY / scrollable)) : 0;
    root.style.setProperty('--reading-progress', String(position));
    header.classList.toggle('is-scrolled', window.scrollY > 12);
    let current = null;
    const threshold = header.getBoundingClientRect().bottom + 100;
    sections.forEach(section => {
      if (section && section.getBoundingClientRect().top <= threshold) current = '#' + section.id;
    });
    sectionLinks.forEach(link => {
      if (link.getAttribute('href') === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function scheduleReadingUpdate() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateReadingPosition);
  }
  window.addEventListener('scroll', scheduleReadingUpdate, { passive: true });
  window.addEventListener('resize', scheduleReadingUpdate);
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', scheduleReadingUpdate));
  if (document.fonts) document.fonts.ready.then(scheduleReadingUpdate);
  updateReadingPosition();

  // Deliberate pointer response, limited to precise pointers and enabled motion.
  document.querySelectorAll('.hero-lab, .project-card').forEach(element => {
    let pointerFrame = 0;
    function clearPointerEffect() {
      cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      ['--tilt-x', '--tilt-y', '--spot-x', '--spot-y'].forEach(property => element.style.removeProperty(property));
    }
    element.addEventListener('pointermove', event => {
      if (!canAnimate() || !finePointer.matches || event.pointerType === 'touch' || pointerFrame) return;
      const { clientX, clientY } = event;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        if (!canAnimate() || !finePointer.matches) return;
        const rect = element.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
        if (element.classList.contains('hero-lab')) {
          element.style.setProperty('--tilt-x', `${(y - .5) * -3}deg`);
          element.style.setProperty('--tilt-y', `${(x - .5) * 3}deg`);
        } else {
          element.style.setProperty('--spot-x', `${x * 100}%`);
          element.style.setProperty('--spot-y', `${y * 100}%`);
        }
      });
    }, { passive: true });
    element.addEventListener('pointerleave', clearPointerEffect);
    motionButton.addEventListener('click', clearPointerEffect);
    reducedMotion.addEventListener('change', clearPointerEffect);
  });

  // Short, user-triggered workflow illustration; no fabricated live results.
  const lab = document.querySelector('.hero-lab');
  const runButton = document.querySelector('.run-demo');
  const runLabel = document.querySelector('.demo-button-label');
  const demoStatus = document.querySelector('#demo-status');
  const demoHint = 'Try a short illustration of the process—not a live test run.';
  let demoTimers = [];
  let demoRunning = false;
  function resetDemo() {
    demoTimers.forEach(clearTimeout);
    demoTimers = [];
    demoRunning = false;
    lab.classList.remove('is-demo-running');
    lab.dataset.demoState = 'idle';
    lab.querySelectorAll('.is-demo-active').forEach(element => element.classList.remove('is-demo-active'));
    runButton.setAttribute('aria-disabled', 'false');
    runLabel.textContent = 'Run workflow';
    demoStatus.textContent = demoHint;
  }
  runButton.addEventListener('click', () => {
    if (demoRunning) return;
    resetDemo();
    const agents = !document.querySelector('#workflow-agents').hidden;
    const workflow = document.querySelector(agents ? '#workflow-agents' : '#workflow-quality');
    const stages = [...workflow.querySelectorAll('.workflow-top, .flow-branches, .workflow-bottom')];
    const messages = agents ? [
      '1 / 3 — Explore a task and define the workflow.',
      '2 / 3 — Consider accessibility, voice, or migration.',
      '3 / 3 — Iterate, validate, and review the result.'
    ] : [
      '1 / 3 — Understand the real user workflow.',
      '2 / 3 — Build coverage across the relevant systems.',
      '3 / 3 — Connect assertions, reports, and root-cause analysis.'
    ];
    demoRunning = true;
    lab.dataset.demoState = 'running';
    lab.classList.add('is-demo-running');
    runButton.setAttribute('aria-disabled', 'true');
    runLabel.textContent = 'Running…';
    function showStage(index) {
      stages.forEach((stage, stageIndex) => stage.classList.toggle('is-demo-active', stageIndex === index));
      demoStatus.textContent = messages[index];
    }
    function finish() {
      showStage(2);
      demoRunning = false;
      lab.dataset.demoState = 'complete';
      lab.classList.remove('is-demo-running');
      runButton.setAttribute('aria-disabled', 'false');
      runLabel.textContent = 'Replay workflow';
      demoStatus.textContent = 'Illustration complete. This is a process concept, not a live test or agent execution.';
      demoTimers = [];
    }
    if (!canAnimate()) { finish(); return; }
    showStage(0);
    demoTimers = [setTimeout(() => showStage(1), 850), setTimeout(() => showStage(2), 1700), setTimeout(finish, 2550)];
  });
  document.querySelectorAll('[data-lab]').forEach(button => button.addEventListener('click', resetDemo));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && demoRunning) resetDemo();
  });
  document.querySelector('.demo-controls').hidden = false;
  demoStatus.hidden = false;
  resetDemo();

  // Optional topic selection only prepares a link. Nothing is sent automatically.
  const emailLink = document.querySelector('.email-option>a');
  const whatsappLink = document.querySelector('.whatsapp-line>a');
  const originalEmail = emailLink.getAttribute('href');
  const originalWhatsapp = whatsappLink.getAttribute('href');
  const topicButtons = [...document.querySelectorAll('[data-contact-topic]')];
  topicButtons.forEach(button => button.addEventListener('click', () => {
    const selected = button.getAttribute('aria-pressed') !== 'true';
    const topic = selected ? button.dataset.contactTopic : '';
    topicButtons.forEach(item => item.setAttribute('aria-pressed', String(selected && item === button)));
    const message = `Hi Ramesh, I’d like to discuss ${topic.toLowerCase()}. Here is what I have in mind: `;
    emailLink.setAttribute('href', topic
      ? `${originalEmail}?subject=${encodeURIComponent(`Let's discuss ${topic}`)}&body=${encodeURIComponent(message)}`
      : originalEmail);
    whatsappLink.setAttribute('href', topic ? `${originalWhatsapp}?text=${encodeURIComponent(message)}` : originalWhatsapp);
    document.querySelector('#contact-topic-note').textContent = topic
      ? `${topic} selected. Choose email or WhatsApp below to continue; nothing has been sent.`
      : 'Choose a topic to prefill your email or WhatsApp message.';
  }));
  document.querySelector('.contact-topics').hidden = false;
})();
