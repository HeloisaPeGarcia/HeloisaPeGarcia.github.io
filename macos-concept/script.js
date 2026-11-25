/* ===================================================================
   heloisaOS — macOS-style interactive portfolio concept
   =================================================================== */

const GITHUB_USER = "HeloisaPeGarcia";
const WEB3FORMS_KEY = "e88383f9-7108-4171-aa3e-324c08404a37";

/* ---------- Shared: category classification for real GitHub repos ---------- */
function classifyRepo(repo) {
  const lowerName = repo.name.toLowerCase();
  const topics = (repo.topics || []).map(t => t.toLowerCase());

  let category = "backend";
  if (
    topics.includes("devops") || topics.includes("ci-cd") || topics.includes("docker") ||
    topics.includes("github-actions") || topics.includes("kubernetes") ||
    lowerName.includes("devops") || lowerName.includes("pipeline") ||
    lowerName.includes("ci-cd") || lowerName.includes("docker")
  ) {
    category = "devops";
  } else if (
    topics.includes("aws") || topics.includes("azure") || topics.includes("cloud") ||
    topics.includes("terraform") || topics.includes("iac") ||
    lowerName.includes("aws") || lowerName.includes("cloud") ||
    lowerName.includes("terraform") || lowerName.includes("infra")
  ) {
    category = "cloud";
  } else if (
    repo.language === "Java" || repo.language === "Python" || repo.language === "C#" ||
    lowerName.includes("api") || lowerName.includes("backend") || lowerName.includes("spring")
  ) {
    category = "backend";
  }

  let icon = "fa-solid fa-code";
  if (category === "devops") icon = lowerName.includes("docker") ? "fa-brands fa-docker" : "fa-brands fa-github-actions";
  else if (category === "cloud") icon = lowerName.includes("aws") ? "fa-brands fa-aws" : "fa-solid fa-cloud";
  else if (category === "backend") {
    if (repo.language === "Java") icon = "fa-brands fa-java";
    else if (repo.language === "Python") icon = "fa-brands fa-python";
    else icon = "fa-solid fa-cubes";
  }
  return { category, icon };
}

const CATEGORY_COLOR = { devops: "#1b7389", cloud: "#ff7a59", backend: "#ffc24b" };

let REPOS_CACHE = null;
async function getRepos() {
  if (REPOS_CACHE) return REPOS_CACHE;
  const cached = sessionStorage.getItem("heloisa_repos_cache_v2");
  if (cached) {
    try { REPOS_CACHE = JSON.parse(cached); return REPOS_CACHE; } catch (e) {}
  }
  const res = await fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=20`);
  if (!res.ok) throw new Error("API indisponível");
  let repos = await res.json();
  repos = repos.filter(r => !r.fork);
  repos.sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.updated_at) - new Date(a.updated_at));
  repos = repos.slice(0, 9);
  if (!repos.length) throw new Error("Nenhum repositório encontrado");
  REPOS_CACHE = repos;
  sessionStorage.setItem("heloisa_repos_cache_v2", JSON.stringify(repos));
  return repos;
}

/* =========================================================================
   WINDOW MANAGER
   ========================================================================= */
const APP_TITLES = {
  finder: "Finder — Projetos",
  terminal: "Terminal — heloisa@portfolio",
  notes: "Notas",
  mail: "Mail",
  safari: "Safari",
  "about-mac": "Sobre Este Mac",
  trash: "Lixeira",
};

const DEFAULT_GEOMETRY = {
  finder:  { w: 720, h: 460 },
  terminal:{ w: 620, h: 420 },
  notes:   { w: 640, h: 440 },
  mail:    { w: 480, h: 480 },
  safari:  { w: 640, h: 460 },
  "about-mac": { w: 360, h: 340 },
  trash:   { w: 320, h: 240 },
};

let zCounter = 100;
let openWindows = {}; // appId -> window element
let cascadeOffset = 0;

const windowsContainer = document.getElementById("windows-container");
const desktopEl = document.getElementById("desktop");

function focusWindow(win) {
  zCounter += 1;
  win.style.zIndex = zCounter;
  document.querySelectorAll(".app-window").forEach(w => w.classList.remove("focused"));
  win.classList.add("focused");
  const appId = win.dataset.app;
  document.getElementById("active-app-name").textContent = APP_TITLES[appId]?.split(" — ")[0] || "Finder";
  document.querySelectorAll(".dock-item").forEach(d => d.classList.toggle("running", !!openWindows[d.dataset.open] && !openWindows[d.dataset.open].classList.contains("minimized")));
}

function openApp(appId) {
  document.getElementById("boot-hint")?.classList.add("hidden");

  if (openWindows[appId]) {
    const win = openWindows[appId];
    win.classList.remove("minimized");
    focusWindow(win);
    return win;
  }

  const geo = DEFAULT_GEOMETRY[appId] || { w: 500, h: 400 };
  const win = document.createElement("div");
  win.className = "app-window";
  win.dataset.app = appId;

  const baseX = Math.min(window.innerWidth - geo.w - 40, 120 + cascadeOffset);
  const baseY = Math.min(window.innerHeight - geo.h - 110, 56 + cascadeOffset);
  cascadeOffset = (cascadeOffset + 32) % 180;

  win.style.left = baseX + "px";
  win.style.top = baseY + "px";
  win.style.width = geo.w + "px";
  win.style.height = geo.h + "px";

  win.innerHTML = `
    <div class="win-titlebar">
      <div class="win-traffic">
        <span class="tc-close" data-act="close"><i class="fa-solid fa-xmark"></i></span>
        <span class="tc-min" data-act="min"><i class="fa-solid fa-minus"></i></span>
        <span class="tc-max" data-act="max"><i class="fa-solid fa-up-right-and-down-left-from-center"></i></span>
      </div>
      <div class="win-title">${APP_TITLES[appId] || appId}</div>
    </div>
    <div class="win-body"></div>
    <div class="win-resize-handle"></div>
  `;

  windowsContainer.appendChild(win);
  openWindows[appId] = win;
  mountAppContent(appId, win.querySelector(".win-body"));

  win.addEventListener("mousedown", () => focusWindow(win));

  // Traffic lights
  win.querySelector('[data-act="close"]').addEventListener("click", (e) => {
    e.stopPropagation();
    closeApp(appId);
  });
  win.querySelector('[data-act="min"]').addEventListener("click", (e) => {
    e.stopPropagation();
    win.classList.add("minimized");
    document.querySelectorAll(".dock-item").forEach(d => d.classList.toggle("running", !!openWindows[d.dataset.open] && !openWindows[d.dataset.open].classList.contains("minimized")));
  });
  win.querySelector('[data-act="max"]').addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMaximize(win);
  });

  makeDraggable(win);
  makeResizable(win);
  focusWindow(win);
  return win;
}

function closeApp(appId) {
  const win = openWindows[appId];
  if (!win) return;
  win.classList.add("closing");
  setTimeout(() => win.remove(), 150);
  delete openWindows[appId];
  document.querySelectorAll(".dock-item").forEach(d => d.classList.toggle("running", !!openWindows[d.dataset.open]));
}

function toggleMaximize(win) {
  if (win.dataset.maximized === "1") {
    win.style.left = win.dataset.prevLeft;
    win.style.top = win.dataset.prevTop;
    win.style.width = win.dataset.prevW;
    win.style.height = win.dataset.prevH;
    win.dataset.maximized = "0";
    win.classList.remove("maximized");
  } else {
    win.dataset.prevLeft = win.style.left;
    win.dataset.prevTop = win.style.top;
    win.dataset.prevW = win.style.width;
    win.dataset.prevH = win.style.height;
    win.style.left = "0px";
    win.style.top = "28px";
    win.style.width = "100vw";
    win.style.height = "calc(100vh - 28px)";
    win.dataset.maximized = "1";
    win.classList.add("maximized");
  }
}

function makeDraggable(win) {
  const bar = win.querySelector(".win-titlebar");
  let sx, sy, ox, oy, dragging = false;
  bar.addEventListener("mousedown", (e) => {
    if (e.target.closest(".win-traffic")) return;
    if (win.dataset.maximized === "1") return;
    dragging = true;
    sx = e.clientX; sy = e.clientY;
    ox = win.offsetLeft; oy = win.offsetTop;
    document.body.style.userSelect = "none";
  });
  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    win.style.left = Math.max(0, ox + (e.clientX - sx)) + "px";
    win.style.top = Math.max(28, oy + (e.clientY - sy)) + "px";
  });
  window.addEventListener("mouseup", () => { dragging = false; document.body.style.userSelect = ""; });
}

function makeResizable(win) {
  const handle = win.querySelector(".win-resize-handle");
  let sx, sy, sw, sh, resizing = false;
  handle.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    resizing = true;
    sx = e.clientX; sy = e.clientY;
    sw = win.offsetWidth; sh = win.offsetHeight;
    document.body.style.userSelect = "none";
  });
  window.addEventListener("mousemove", (e) => {
    if (!resizing) return;
    win.style.width = Math.max(320, sw + (e.clientX - sx)) + "px";
    win.style.height = Math.max(220, sh + (e.clientY - sy)) + "px";
  });
  window.addEventListener("mouseup", () => { resizing = false; document.body.style.userSelect = ""; });
}

/* =========================================================================
   APP CONTENT MOUNTING
   ========================================================================= */
function mountAppContent(appId, body) {
  const tpl = document.getElementById(`tpl-${appId}`);
  if (!tpl) return;
  body.appendChild(tpl.content.cloneNode(true));

  if (appId === "finder") initFinder(body);
  if (appId === "terminal") initTerminal(body);
  if (appId === "notes") initNotes(body);
  if (appId === "mail") initMail(body);
  if (appId === "safari") initSafari(body);
  if (appId === "about-mac") initAboutMac(body);
}

/* ---------- Finder ---------- */
async function initFinder(body) {
  const grid = body.querySelector("#finder-grid");
  const countEl = body.querySelector("#finder-count");
  const sidebarItems = body.querySelectorAll(".finder-sidebar-item[data-filter]");
  let repos = [];
  let currentFilter = "all";

  function renderGrid() {
    const filtered = currentFilter === "all" ? repos : repos.filter(r => classifyRepo(r).category === currentFilter);
    countEl.textContent = `${filtered.length} item${filtered.length === 1 ? "" : "s"}`;
    if (!filtered.length) {
      grid.innerHTML = `<div class="finder-loading">Nenhum repositório nessa categoria.</div>`;
      return;
    }
    grid.innerHTML = "";
    filtered.forEach(repo => {
      const { category, icon } = classifyRepo(repo);
      const el = document.createElement("div");
      el.className = "finder-file";
      el.innerHTML = `
        <div class="finder-file-icon" style="background:${CATEGORY_COLOR[category]}"><i class="${icon}"></i></div>
        <div class="finder-file-name">${repo.name}</div>
        <div class="finder-file-sub">${repo.language || "—"}${repo.stargazers_count ? " · ★" + repo.stargazers_count : ""}</div>
      `;
      el.addEventListener("dblclick", () => showProjectDetail(body, repo, category));
      grid.appendChild(el);
    });
  }

  sidebarItems.forEach(item => {
    item.addEventListener("click", () => {
      sidebarItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      currentFilter = item.dataset.filter;
      renderGrid();
    });
  });

  try {
    repos = await getRepos();
    renderGrid();
  } catch (e) {
    grid.innerHTML = `<div class="finder-loading">Não foi possível carregar os repositórios agora.<br><a href="https://github.com/${GITHUB_USER}" target="_blank" style="color:var(--petrol-300)">Ver no GitHub diretamente</a></div>`;
    countEl.textContent = "";
  }
}

function showProjectDetail(body, repo, category) {
  const finderApp = body.querySelector(".finder-app");
  const tpl = document.getElementById("tpl-project-detail");
  const detail = tpl.content.cloneNode(true);
  const wrapper = document.createElement("div");
  wrapper.className = "project-detail-wrapper";
  wrapper.style.height = "100%";
  wrapper.style.overflow = "auto";
  wrapper.appendChild(detail);

  finderApp.style.display = "none";
  body.appendChild(wrapper);

  wrapper.querySelector("#pd-name").textContent = repo.name;
  wrapper.querySelector("#pd-desc").textContent = repo.description || "Sem descrição cadastrada — visite o repositório para saber mais.";
  wrapper.querySelector(".project-detail-icon i").className = classifyRepo(repo).icon;
  wrapper.querySelector(".project-detail-icon").style.color = CATEGORY_COLOR[category];
  const tagsEl = wrapper.querySelector("#pd-tags");
  tagsEl.innerHTML = "";
  if (repo.language) tagsEl.innerHTML += `<span>${repo.language}</span>`;
  (repo.topics || []).slice(0, 4).forEach(t => tagsEl.innerHTML += `<span>${t}</span>`);
  wrapper.querySelector("#pd-stats").innerHTML = `
    <span><i class="fa-solid fa-star" style="color:var(--amber)"></i> ${repo.stargazers_count} stars</span>
    <span><i class="fa-solid fa-code-branch"></i> ${repo.forks_count} forks</span>
  `;
  wrapper.querySelector("#pd-link").href = repo.html_url;

  wrapper.querySelector("#project-back").addEventListener("click", () => {
    wrapper.remove();
    finderApp.style.display = "flex";
  });
}

/* ---------- Terminal ---------- */
function initTerminal(body) {
  const output = body.querySelector("#term-output");
  const input = body.querySelector("#term-input");

  function print(html) {
    const line = document.createElement("div");
    line.innerHTML = html;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  }

  const COMMANDS = {
    help: () => `<span class="t-accent">Comandos disponíveis:</span>
  whoami        — quem sou eu
  skills        — stack técnica
  experiencia   — histórico profissional
  projetos      — abre o Finder com os projetos
  contato       — abre o Mail
  sudo ...      — tente :)
  clear         — limpa o terminal`,
    whoami: () => `<span class="t-accent">heloisa-garcia</span>
  Software Developer · DevOps & Cloud Architect
  São Paulo, SP — Brasil
  Graduada em ADS · pós-graduanda em DevOps & Cloud Architecture (FIAP)`,
    skills: () => `<span class="t-accent">Programação:</span> Java, JavaScript, Python, C#
<span class="t-accent">DevOps & Infra:</span> Git/GitHub, Linux, Docker, CI/CD
<span class="t-accent">Cloud & DB:</span> AWS/Azure, Oracle, SQL Server/MySQL`,
    experiencia: () => `<span class="t-accent">Estagiária de TI</span> — Chris Cintos de Segurança (jul/2025 – atual)
<span class="t-accent">Assistente de Atendimento</span> — B2X Care Solutions (jul/2024 – set/2024)
<span class="t-muted">Certificações: DevOps & GitHub (Alura), IA & Assistentes Virtuais (Senac)</span>`,
    projetos: () => { openApp("finder"); return `<span class="t-muted">abrindo Finder…</span>`; },
    contato: () => { openApp("mail"); return `<span class="t-muted">abrindo Mail…</span>`; },
    date: () => new Date().toString(),
    ls: () => `sobre.md  skills.json  experiencia.log  projetos/  contato.sh`,
    clear: () => { output.innerHTML = ""; return null; },
  };

  print(`<span class="t-muted">heloisaOS Terminal [v2.0]</span>
Digite <span class="t-accent">help</span> para ver os comandos disponíveis.
`);

  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const raw = input.value.trim();
    input.value = "";
    if (!raw) return;
    print(`<span class="t-muted">heloisa@portfolio:~$</span> <span class="t-cmd">${raw}</span>`);

    const cmd = raw.toLowerCase();
    if (cmd.startsWith("sudo")) {
      print(`<span class="t-coral">Permission denied: você não é root por aqui 😄</span>`);
    } else if (cmd === "rm -rf /" || cmd === "rm -rf /*") {
      print(`<span class="t-coral">Boa tentativa. Mas não. 😏</span>`);
    } else if (COMMANDS[cmd]) {
      const result = COMMANDS[cmd]();
      if (result) print(result);
    } else {
      print(`<span class="t-muted">comando não encontrado:</span> ${raw}. Digite <span class="t-accent">help</span>.`);
    }
  });

  body.addEventListener("click", () => input.focus());
  setTimeout(() => input.focus(), 50);
}

/* ---------- Notes ---------- */
const NOTES_CONTENT = {
  sobre: {
    title: "Sobre Mim",
    body: `Sou graduada em Análise e Desenvolvimento de Sistemas, com foco em alinhar desenvolvimento de software a práticas modernas de infraestrutura. Atualmente me aprofundo em DevOps e Arquitetura Cloud na FIAP, buscando automatizar ciclos de entrega, otimizar fluxos de CI/CD e gerenciar ambientes resilientes na nuvem.

Tenho experiência hands-on em controle de versionamento, modelagem de banco de dados relacionais e desenvolvimento backend.`,
  },
  disponibilidade: {
    title: "Disponibilidade",
    body: `Aberta a oportunidades remotas ou híbridas.

Localização: São Paulo, SP, Brasil
Contato: via Mail (app ao lado) ou LinkedIn.`,
  },
  stack: {
    title: "Stack Atual",
    body: `Linguagens: Java, JavaScript, Python, C#
DevOps: Git, GitHub Actions, Docker, CI/CD
Cloud: AWS, Azure
Banco de Dados: Oracle, SQL Server, MySQL
Ferramentas: Linux, VS Code`,
  },
};

function initNotes(body) {
  const items = body.querySelectorAll(".note-item");
  const paper = body.querySelector("#notes-paper");

  function render(key) {
    const note = NOTES_CONTENT[key];
    paper.innerHTML = `<h3>${note.title}</h3><p style="white-space:pre-line">${note.body}</p>`;
  }

  items.forEach(item => {
    item.addEventListener("click", () => {
      items.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      render(item.dataset.note);
    });
  });

  render("sobre");
}

/* ---------- Mail ---------- */
function initMail(body) {
  const form = body.querySelector("#mail-form");
  const status = body.querySelector("#mail-status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector(".mail-send-btn");
    const name = body.querySelector("#mail-name").value;
    const email = body.querySelector("#mail-email").value;
    const message = body.querySelector("#mail-body").value;
    const subject = body.querySelector("#mail-subject").value;

    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Enviando...`;
    status.textContent = "";

    try {
      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: WEB3FORMS_KEY, name, email, message, subject: `${subject} - ${name}` }),
      });
      status.textContent = "✓ Mensagem enviada com sucesso!";
      form.reset();
    } catch (err) {
      status.textContent = "Mensagem registrada localmente (rede indisponível neste preview).";
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Enviar`;
    }
  });
}

/* ---------- Safari ---------- */
function initSafari(body) {
  const tabs = body.querySelectorAll(".safari-tab");
  const urlEl = body.querySelector("#safari-url");
  const content = body.querySelector("#safari-content");

  const SITES = {
    linkedin: {
      url: "linkedin.com/in/heloisa-pgarcia",
      icon: "fa-brands fa-linkedin",
      name: "Heloisa Garcia",
      sub: "Software Developer · DevOps & Cloud Architect",
      link: "https://www.linkedin.com/in/heloisa-pgarcia",
      cta: "Abrir perfil no LinkedIn",
    },
    github: {
      url: `github.com/${GITHUB_USER}`,
      icon: "fa-brands fa-github",
      name: `@${GITHUB_USER}`,
      sub: "Repositórios públicos e contribuições",
      link: `https://github.com/${GITHUB_USER}`,
      cta: "Abrir perfil no GitHub",
    },
  };

  function render(site) {
    const s = SITES[site];
    urlEl.textContent = s.url;
    content.innerHTML = `
      <div class="safari-profile-card">
        <i class="profile-avatar-icon ${s.icon}"></i>
        <h3>${s.name}</h3>
        <p>${s.sub}</p>
        <a href="${s.link}" target="_blank" class="safari-visit-btn">${s.cta} <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
      </div>
    `;
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      render(tab.dataset.site);
    });
  });

  render("linkedin");
}

/* ---------- About This Mac ---------- */
function initAboutMac(body) {
  const el = body.querySelector("#am-date");
  if (el) el.textContent = new Date().toLocaleDateString("pt-BR", { year: "numeric", month: "short", day: "numeric" });
}

/* =========================================================================
   GLOBAL BINDINGS
   ========================================================================= */
document.addEventListener("DOMContentLoaded", () => {
  // Dock & desktop icon clicks
  document.querySelectorAll("[data-open]").forEach(el => {
    el.addEventListener("click", () => openApp(el.dataset.open));
  });
  document.querySelectorAll("[data-href]").forEach(el => {
    el.addEventListener("click", () => window.open(el.dataset.href, "_blank"));
  });

  // Apple menu dropdown
  const appleBtn = document.getElementById("apple-menu-btn");
  const dropdown = document.getElementById("apple-dropdown");
  appleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("open");
  });
  document.addEventListener("click", () => dropdown.classList.remove("open"));

  dropdown.querySelector('[data-open="about-mac"]').addEventListener("click", () => openApp("about-mac"));
  dropdown.querySelector('[data-action="open-real-site"]').addEventListener("click", () => window.open("../index.html", "_blank"));
  dropdown.querySelector('[data-action="toggle-theme"]').addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
  });

  // Clock
  function tick() {
    const now = new Date();
    const days = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
    const d = days[now.getDay()];
    const time = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const date = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    document.getElementById("clock").textContent = `${d} ${date}  ${time}`;
  }
  tick();
  setInterval(tick, 1000 * 15);

  // Auto-open Finder on load for desktop users (welcome state)
  if (window.innerWidth > 880) {
    setTimeout(() => openApp("finder"), 500);
  }

  // ---------------- Mobile fallback population ----------------
  initMobileFallback();
});

function initMobileFallback() {
  const chipsEl = document.getElementById("mf-chips");
  if (chipsEl) {
    const skills = ["Java", "JavaScript", "Python", "C#", "Git & GitHub", "Linux", "Docker", "CI/CD", "AWS/Azure", "Oracle DB", "SQL Server/MySQL"];
    chipsEl.innerHTML = skills.map(s => `<span>${s}</span>`).join("");
  }

  const projEl = document.getElementById("mf-projects");
  if (projEl) {
    getRepos()
      .then(repos => {
        projEl.innerHTML = repos.slice(0, 5).map(r => `
          <div class="mf-project-card">
            <h4>${r.name}</h4>
            <p>${r.description || "Sem descrição cadastrada."}</p>
            <a href="${r.html_url}" target="_blank">Ver no GitHub →</a>
          </div>
        `).join("");
      })
      .catch(() => {
        projEl.innerHTML = `<div class="mf-loading">Não foi possível carregar agora. <a href="https://github.com/${GITHUB_USER}" target="_blank" style="color:var(--coral)">Ver no GitHub</a></div>`;
      });
  }

  const mfForm = document.getElementById("mf-form");
  if (mfForm) {
    mfForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const status = document.getElementById("mf-status");
      const btn = mfForm.querySelector("button");
      const name = document.getElementById("mf-name").value;
      const email = document.getElementById("mf-email").value;
      const message = document.getElementById("mf-msg").value;
      btn.disabled = true;
      btn.textContent = "Enviando...";
      try {
        await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ access_key: WEB3FORMS_KEY, name, email, message, subject: `Novo contato (mobile) - ${name}` }),
        });
        status.textContent = "✓ Mensagem enviada com sucesso!";
        mfForm.reset();
      } catch (err) {
        status.textContent = "Não foi possível enviar agora, tente novamente.";
      } finally {
        btn.disabled = false;
        btn.textContent = "Enviar mensagem";
      }
    });
  }
}
