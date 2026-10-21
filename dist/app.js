const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  nav.classList.toggle('is-open', open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  nav.classList.remove('is-open');
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    menuToggle.click();
    menuToggle.focus();
  }
});

document.querySelectorAll('[data-lab]').forEach(button => {
  button.addEventListener('click', () => {
    const mode = button.dataset.lab;
    document.querySelectorAll('[data-lab]').forEach(item => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    document.querySelector('#workflow-quality').hidden = mode !== 'quality';
    document.querySelector('#workflow-agents').hidden = mode !== 'agents';
    document.querySelector('#lab-caption').textContent = mode === 'quality'
      ? 'A way of thinking, from intent to evidence.'
      : 'Three agent projects. One curious engineer.';
  });
});

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(item => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    let count = 0;
    document.querySelectorAll('.project-card').forEach(card => {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
      if (!card.hidden) count++;
    });
    document.querySelector('#project-count').textContent = `${String(count).padStart(2, '0')} PROJECT${count === 1 ? '' : 'S'}`;
  });
});

const projects = {
  accessibility: {
    title: 'Clarity — Accessibility Agent', kicker: 'AI AGENT / IN DEVELOPMENT WITH CODEX',
    summary: 'A local accessibility crawler and reporting dashboard, combining deterministic checks with optional AI-assisted exploration and human review.',
    tags: ['JavaScript', 'Playwright', 'axe-core', 'NVDA', 'AI-assisted exploration'],
    challenge: 'Make accessibility findings actionable across pages, dialogs, and interactive states, with explicit coverage and evidence for reviewers.',
    contributions: ['Developing a crawler that discovers pages, dialogs, and interactive application states using Playwright.', 'Combining axe-core scanning with keyboard traversal, focus, zoom, reflow, and text-spacing checks.', 'Integrating an optional NVDA workflow to capture real screen-reader observations.', 'Using conditional vision AI for uncertain image descriptions and stalled discovery.', 'Building a dashboard, remediation backlog, and JSON, CSV, and draft VPAT/ACR exports.'],
    takeaway: 'In active development. Automated findings support accessibility review; complete conformance decisions still require documented human assessment.'
  },
  migration: {
    title: 'Universal Testing Migration Agent', kicker: 'AI AGENT / IN DEVELOPMENT WITH CODEX',
    summary: 'A local Python application for analyzing repositories, planning migrations, and generating a separate target project with deterministic guardrails.',
    tags: ['Python', 'Framework migration', 'Repository analysis', 'Multi-provider AI'],
    challenge: 'Help move repositories between languages, frameworks, and tools while preserving source code and making uncertain conversions reviewable.',
    contributions: ['Building a shared analyze → plan → approve → generate → validate workflow, with a local UI, API, and CLI.', 'Detecting languages, frameworks, tests, locators, dependencies, and project structure before migration.', 'Generating into a separate staging area with source fingerprint checks and locator-preservation guardrails.', 'Adding structural and runtime validation, bounded repair, and explicit needs-review outcomes.', 'Supporting AI provider adapters for Ollama, OpenAI-compatible services, Anthropic, and Gemini.'],
    takeaway: 'In active development. Universal migration is the direction; route accuracy depends on available parsers and validators, and AI-generated conversions require review.'
  },
  encore: {
    title: 'Encore', kicker: 'WEB AUTOMATION / SELECTED WORK',
    summary: 'A reusable Playwright automation framework designed around the Page Object Model, with clear reporting and recurring regression execution.',
    tags: ['JavaScript', 'Playwright', 'Page Object Model', 'Allure', 'Jenkins'],
    challenge: 'Cover client-defined functional workflows while keeping the automation modular, maintainable, and easy to debug.',
    contributions: ['Executed client-provided test cases manually to establish functional coverage.', 'Built a Playwright framework with reusable page objects and modular components.', 'Integrated Allure reports for test insights and failure traceability.', 'Connected execution to Jenkins for weekly regression cycles.', 'Investigated automation failures and maintained script stability.'],
    takeaway: 'A structured test suite is only useful when the team can understand its results. This work connects reusable test architecture with actionable reporting.'
  },
  otor: {
    title: 'OTOR', kicker: 'MOBILE + VOICE / SELECTED WORK',
    summary: 'An Appium and Python-PyTest mobile automation framework, extended with cross-device execution and dynamic voice assertions.',
    tags: ['Python', 'PyTest', 'Appium', 'BrowserStack', 'Voice assertions'],
    challenge: 'Validate mobile application workflows across devices and operating systems, including audio responses that traditional UI assertions cannot cover.',
    contributions: ['Built a Page Object Model framework using Python and PyTest.', 'Automated critical end-to-end mobile scenarios and executed client-defined manual tests.', 'Integrated BrowserStack for cross-device, cross-OS regression and parallel execution.', 'Added PyTest-HTML reporting with automatic screenshot capture and embedded evidence.', 'Designed voice assertions that capture audio, convert it to text, and validate the expected response.', 'Analyzed regression failures and collaborated with developers on root-cause resolution.'],
    takeaway: 'Quality extends beyond what appears on screen. Audio validation brings another part of the real user experience into automated coverage.'
  },
  fastrac: {
    title: 'FasTrac', kicker: 'UI + DATABASE / SELECTED WORK',
    summary: 'A Selenium and Python-PyTest framework that connects interface workflows with SQL validation, OCR checks, and Azure DevOps test reporting.',
    tags: ['Python', 'PyTest', 'Selenium', 'SQL', 'EasyOCR', 'Azure DevOps'],
    challenge: 'Verify that UI actions and underlying database state agree, while covering content with limited locator access and keeping test outcomes traceable.',
    contributions: ['Built a modular Page Object Model automation framework using Python and PyTest.', 'Developed a reusable SQL utility to retrieve data, use it in UI workflows, update values, and verify the resulting database state.', 'Used the Azure DevOps API to update test-case pass/fail status from automation results.', 'Implemented EasyOCR text extraction for on-screen content without direct locator access.', 'Enhanced PyTest-HTML reports with embedded screenshots for debugging.'],
    takeaway: 'A passing interface check is stronger when it is backed by the correct database state and visible evidence.'
  },
  midscene: {
    title: 'AI-powered automation', kicker: 'AI AUTOMATION / PROFESSIONAL EXPERIENCE',
    summary: 'An AI-powered automation framework built with MidScene.js to support intelligent element recognition and AI-based automation flows.',
    tags: ['MidScene.js', 'Intelligent element recognition', 'Web automation'],
    challenge: 'Explore AI-driven interaction as part of practical automation framework development.',
    contributions: ['Created an AI-powered framework using MidScene.js during work at Feuji.', 'Used intelligent element recognition and AI-based automation flows.', 'Brought framework development and automation debugging experience to AI-powered testing.'],
    takeaway: 'This professional work is part of the foundation for my current exploration of Accessibility, Dynamic Voice Call, and Universal Testing Migration agents.'
  }
};
const dialog = document.querySelector('#project-dialog');
document.querySelectorAll('[data-project]').forEach(button => {
  button.addEventListener('click', () => {
    const project = projects[button.dataset.project];
    document.querySelector('#dialog-content').innerHTML = `
      <p class="dialog-kicker">${project.kicker}</p>
      <h2 id="dialog-title">${project.title}</h2>
      <p class="dialog-summary">${project.summary}</p>
      <div class="tags">${project.tags.map(tag => `<span>${tag}</span>`).join('')}</div>
      <h3>The focus</h3><p>${project.challenge}</p>
      <h3>My contributions</h3><ul>${project.contributions.map(item => `<li>${item}</li>`).join('')}</ul>
      <p class="dialog-context">${project.takeaway}</p>
      <div class="dialog-contact-options">
        <a class="text-link" href="mailto:rameshganamana799@gmail.com?subject=${encodeURIComponent(`Let's talk about ${project.title}`)}">Email about this project <span aria-hidden="true">↗</span></a>
        <a class="text-link" href="https://wa.me/917993897925?text=${encodeURIComponent(`Hi Ramesh, let's talk about ${project.title}.`)}" target="_blank" rel="noopener noreferrer">WhatsApp <span aria-hidden="true">↗</span></a>
      </div>`;
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('dialog-open');
  });
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  }
});
dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));

document.querySelectorAll('[data-copy-value]').forEach(button => {
  button.addEventListener('click', async () => {
    const status = document.querySelector('#copy-status');
    try {
      await navigator.clipboard.writeText(button.dataset.copyValue);
      status.textContent = button.dataset.copyMessage;
    } catch {
      status.textContent = `Copy: ${button.dataset.copyValue}`;
    }
  });
});
document.querySelector('#year').textContent = new Date().getFullYear();
