// Typing Effect for Hero Title
const typedTextSpan = document.getElementById("typed-text");
const textArray = [
  "Desenvolvedora de Software",
  "Pós-Graduanda em DevOps & Cloud",
  "Focada em Automação & Infraestrutura"
];
const typingSpeed = 100;
const erasingSpeed = 50;
const newTextDelay = 2000; // Delay between current and next text
let textArrayIndex = 0;
let charIndex = 0;

function type() {
  if (!typedTextSpan) return;
  if (charIndex < textArray[textArrayIndex].length) {
    typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
    charIndex++;
    setTimeout(type, typingSpeed);
  } else {
    setTimeout(erase, newTextDelay);
  }
}

function erase() {
  if (!typedTextSpan) return;
  if (charIndex > 0) {
    typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
    charIndex--;
    setTimeout(erase, erasingSpeed);
  } else {
    textArrayIndex++;
    if (textArrayIndex >= textArray.length) textArrayIndex = 0;
    setTimeout(type, typingSpeed + 500);
  }
}

// Dark / Light Theme Switcher
const themeToggleBtn = document.getElementById("theme-toggle");

function initTheme() {
  const savedTheme = localStorage.getItem("portfolio-theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
  if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
    document.body.classList.add("dark-mode");
    updateThemeIcon(true);
  } else {
    document.body.classList.remove("dark-mode");
    updateThemeIcon(false);
  }
}

function updateThemeIcon(isDark) {
  if (!themeToggleBtn) return;
  const icon = themeToggleBtn.querySelector("i");
  if (icon) {
    icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
  }
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-mode");
    localStorage.setItem("portfolio-theme", isDark ? "dark" : "light");
    updateThemeIcon(isDark);
  });
}

// Mobile Menu Navigation Toggle
const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");
const navLinks = document.querySelectorAll("#nav-menu a");

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("active");
    navMenu.classList.toggle("active");
  });
}

// Close mobile menu when a nav link is clicked
navLinks.forEach(link => {
  link.addEventListener("click", () => {
    if (menuToggle && navMenu) {
      menuToggle.classList.remove("active");
      navMenu.classList.remove("active");
    }
  });
});

// Header Scrolled Style and Active Link Navigation Highlights
const header = document.getElementById("header");
const sections = document.querySelectorAll("section");

window.addEventListener("scroll", () => {
  if (header) {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  let current = "";
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    if (window.scrollY >= sectionTop - 150) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href").slice(1) === current) {
      link.classList.add("active");
    }
  });
});

// Interactive DevOps Terminal Tabs
const terminalSnippets = {
  cicd: `<pre><code><span class="line-num">1</span><span class="key">name:</span> <span class="val">Cloud-CI-CD</span>
<span class="line-num">2</span><span class="key">on:</span>
<span class="line-num">3</span>  <span class="key">push:</span>
<span class="line-num">4</span>    <span class="key">branches:</span> [<span class="val">main</span>]
<span class="line-num">5</span>
<span class="line-num">6</span><span class="key">jobs:</span>
<span class="line-num">7</span>  <span class="key">deploy:</span>
<span class="line-num">8</span>    <span class="key">runs-on:</span> <span class="val">ubuntu-latest</span>
<span class="line-num">9</span>    <span class="key">steps:</span>
<span class="line-num">10</span>      - <span class="key">name:</span> <span class="val">Configure AWS Credentials</span>
<span class="line-num">11</span>        <span class="key">uses:</span> <span class="val">aws-actions/configure@v2</span>
<span class="line-num">12</span>      - <span class="key">name:</span> <span class="val">Build and Deploy Image</span>
<span class="line-num">13</span>        <span class="key">run:</span> |
<span class="line-num">14</span>          docker build -t heloisa-app .
<span class="line-num">15</span>          docker push ecr/app:latest
<span class="line-num">16</span>          echo <span class="string">"🚀 DevOps deploy complete!"</span></code></pre>`,
  terraform: `<pre><code><span class="line-num">1</span><span class="key">provider</span> <span class="string">"aws"</span> {
<span class="line-num">2</span>  <span class="key">region</span> = <span class="string">"us-east-1"</span>
<span class="line-num">3</span>}
<span class="line-num">4</span>
<span class="line-num">5</span><span class="key">resource</span> <span class="string">"aws_instance"</span> <span class="string">"web"</span> {
<span class="line-num">6</span>  <span class="key">ami</span>           = <span class="string">"ami-0c55b159cbfafe1f0"</span>
<span class="line-num">7</span>  <span class="key">instance_type</span> = <span class="string">"t3.micro"</span>
<span class="line-num">8</span>
<span class="line-num">9</span>  <span class="key">tags</span> = {
<span class="line-num">10</span>    <span class="key">Name</span>        = <span class="string">"Production-Server"</span>
<span class="line-num">11</span>    <span class="key">Environment</span> = <span class="string">"Production"</span>
<span class="line-num">12</span>    <span class="key">ManagedBy</span>   = <span class="string">"Terraform"</span>
<span class="line-num">13</span>  }
<span class="line-num">14</span>}</code></pre>`,
  docker: `<pre><code><span class="line-num">1</span><span class="key">version:</span> <span class="string">'3.8'</span>
<span class="line-num">2</span><span class="key">services:</span>
<span class="line-num">3</span>  <span class="key">web-app:</span>
<span class="line-num">4</span>    <span class="key">build:</span> <span class="val">.</span>
<span class="line-num">5</span>    <span class="key">ports:</span>
<span class="line-num">6</span>      - <span class="string">"8080:8080"</span>
<span class="line-num">7</span>    <span class="key">environment:</span>
<span class="line-num">8</span>      - <span class="key">SPRING_PROFILES_ACTIVE</span>=<span class="val">prod</span>
<span class="line-num">9</span>  <span class="key">database:</span>
<span class="line-num">10</span>    <span class="key">image:</span> <span class="val">oracle/database:19c</span>
<span class="line-num">11</span>    <span class="key">restart:</span> <span class="val">always</span></code></pre>`
};

function initTerminalTabs() {
  const terminalBody = document.getElementById("terminal-body");
  const tabBtns = document.querySelectorAll(".terminal-tab");
  
  if (!terminalBody || !tabBtns.length) return;
  terminalBody.innerHTML = terminalSnippets.cicd;

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const tabKey = btn.getAttribute("data-tab");
      if (terminalSnippets[tabKey]) {
        terminalBody.style.opacity = "0.4";
        setTimeout(() => {
          terminalBody.innerHTML = terminalSnippets[tabKey];
          terminalBody.style.opacity = "1";
        }, 150);
      }
    });
  });
}

// 3D Tilt Effect for Identity Card
function initTiltCard() {
  const tiltCard = document.querySelector(".tilt-card");
  if (!tiltCard) return;

  tiltCard.addEventListener("mousemove", (e) => {
    const rect = tiltCard.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = (-y / rect.height) * 15;
    const rotateY = (x / rect.width) * 15;

    tiltCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  tiltCard.addEventListener("mouseleave", () => {
    tiltCard.style.transform = "rotateX(0deg) rotateY(0deg) translateY(0)";
  });
}

// Animated Stats Number Counter
function initStatsCounter() {
  const statNumbers = document.querySelectorAll(".stat-number");
  if (!statNumbers.length) return;

  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statNumbers.forEach(stat => {
          const target = parseInt(stat.getAttribute("data-target"), 10);
          let current = 0;
          const step = Math.max(1, Math.ceil(target / 30));
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              stat.textContent = target === 100 ? "100%" : target + "+";
              clearInterval(timer);
            } else {
              stat.textContent = current + (target === 100 ? "%" : "+");
            }
          }, 40);
        });
      }
    });
  }, { threshold: 0.3 });

  const statsBar = document.querySelector(".stats-bar-container");
  if (statsBar) observer.observe(statsBar);
}

// Certificate Lightbox Modal Handler
const certModal = document.getElementById("cert-modal");
const certTitle = document.getElementById("cert-title");
const certDesc = document.getElementById("cert-desc");

function openCertModal(title, desc) {
  if (certModal && certTitle && certDesc) {
    certTitle.textContent = title;
    certDesc.textContent = desc;
    certModal.classList.add("active");
  }
}

function closeCertModal() {
  if (certModal) {
    certModal.classList.remove("active");
  }
}

// Download CV PDF Handler
const downloadCvBtn = document.getElementById("download-cv");
if (downloadCvBtn) {
  downloadCvBtn.addEventListener("click", () => {
    console.log("Download CV clicado: Profile.pdf");
  });
}

// Scroll Reveal Observer
const revealElements = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      
      if (entry.target.id === "skills") {
        const skillBars = entry.target.querySelectorAll(".skill-bar");
        skillBars.forEach(bar => {
          const targetWidth = bar.style.width;
          bar.style.width = '0';
          setTimeout(() => {
            bar.style.width = targetWidth;
          }, 100);
        });
      }
      
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.15
});

revealElements.forEach(element => {
  revealObserver.observe(element);
});

// Project Gallery Category Filter
const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const filterValue = btn.getAttribute("data-filter");
    const projectCards = document.querySelectorAll(".project-card");

    projectCards.forEach(card => {
      const category = card.getAttribute("data-category");
      if (filterValue === "all" || category === filterValue) {
        card.style.display = "flex";
        setTimeout(() => {
          card.style.opacity = "1";
          card.style.transform = "scale(1)";
        }, 50);
      } else {
        card.style.opacity = "0";
        card.style.transform = "scale(0.95)";
        setTimeout(() => {
          card.style.display = "none";
        }, 300);
      }
    });
  });
});

// Render Projects List Helper
function renderProjects(repos) {
  const grid = document.querySelector(".projects-grid");
  if (!grid) return;

  grid.innerHTML = "";

  repos.forEach(repo => {
    const name = repo.name;
    const lowerName = name.toLowerCase();
    const description = repo.description || "Sem descrição cadastrada. Visite o repositório para saber mais.";
    const topics = repo.topics || [];
    const lowerTopics = topics.map(t => t.toLowerCase());

    let category = "backend";
    if (
      lowerTopics.includes("devops") ||
      lowerTopics.includes("ci-cd") ||
      lowerTopics.includes("docker") ||
      lowerTopics.includes("github-actions") ||
      lowerTopics.includes("kubernetes") ||
      lowerName.includes("devops") ||
      lowerName.includes("pipeline") ||
      lowerName.includes("ci-cd") ||
      lowerName.includes("github-actions") ||
      lowerName.includes("docker")
    ) {
      category = "devops";
    } else if (
      lowerTopics.includes("aws") ||
      lowerTopics.includes("azure") ||
      lowerTopics.includes("cloud") ||
      lowerTopics.includes("terraform") ||
      lowerTopics.includes("iac") ||
      lowerName.includes("aws") ||
      lowerName.includes("cloud") ||
      lowerName.includes("terraform") ||
      lowerName.includes("iac") ||
      lowerName.includes("infra")
    ) {
      category = "cloud";
    } else if (
      repo.language === "Java" ||
      repo.language === "Python" ||
      repo.language === "C#" ||
      lowerName.includes("api") ||
      lowerName.includes("backend") ||
      lowerName.includes("spring") ||
      lowerName.includes("banco")
    ) {
      category = "backend";
    }

    let iconClass = "fa-solid fa-code";
    if (category === "devops") {
      iconClass = lowerName.includes("docker") || lowerTopics.includes("docker") ? "fa-brands fa-docker" : "fa-brands fa-github-actions";
    } else if (category === "cloud") {
      iconClass = lowerName.includes("aws") || lowerTopics.includes("aws") ? "fa-brands fa-aws" : "fa-solid fa-cloud";
    } else if (category === "backend") {
      if (repo.language === "Java") iconClass = "fa-brands fa-java";
      else if (repo.language === "Python") iconClass = "fa-brands fa-python";
      else iconClass = "fa-solid fa-cubes";
    }

    let tagsHTML = repo.language ? `<span class="project-tag">${repo.language}</span>` : "";
    topics.slice(0, 2).forEach(topic => {
      tagsHTML += `<span class="project-tag">${topic}</span>`;
    });

    if (repo.stargazers_count > 0) {
      tagsHTML += `<span class="project-tag"><i class="fa-solid fa-star" style="color: #ffd700; margin-right: 3px;"></i>${repo.stargazers_count}</span>`;
    }

    const card = document.createElement("div");
    card.className = "project-card glass reveal visible";
    card.setAttribute("data-category", category);
    card.style.opacity = "1";
    card.style.transform = "scale(1)";

    card.innerHTML = `
      <div class="project-icon"><i class="${iconClass}"></i></div>
      <h3>${name}</h3>
      <p>${description}</p>
      <div class="project-tags">${tagsHTML}</div>
      <div class="project-links">
        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="project-link" aria-label="Abrir repositório ${name}">
          Repositório <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </a>
      </div>
    `;

    grid.appendChild(card);
  });
}

// Fetch Public Repositories from GitHub API with sessionStorage Caching
async function fetchGitHubProjects() {
  const grid = document.querySelector(".projects-grid");
  if (!grid) return;

  const fallbackHtml = grid.innerHTML;

  const cachedData = sessionStorage.getItem("heloisa_github_repos_cache");
  if (cachedData) {
    try {
      const repos = JSON.parse(cachedData);
      if (repos && repos.length > 0) {
        renderProjects(repos);
        return;
      }
    } catch (e) {
      console.warn("Erro ao ler cache do sessionStorage:", e);
    }
  }

  grid.innerHTML = `
    <div class="loader-box" style="grid-column: 1 / -1; text-align: center; padding: 4rem 0;">
      <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2.5rem; color: var(--accent-blue); margin-bottom: 1rem;"></i>
      <p style="color: var(--text-muted); font-size: 0.95rem;">Buscando projetos em github.com/HeloisaPeGarcia...</p>
    </div>
  `;

  try {
    const response = await fetch("https://api.github.com/users/HeloisaPeGarcia/repos?sort=updated&per_page=20");
    if (!response.ok) {
      throw new Error("API do GitHub inacessível ou limite excedido.");
    }
    
    let repos = await response.json();
    repos = repos.filter(repo => !repo.fork);
    repos.sort((a, b) => {
      if (b.stargazers_count !== a.stargazers_count) {
        return b.stargazers_count - a.stargazers_count;
      }
      return new Date(b.updated_at) - new Date(a.updated_at);
    });

    const topRepos = repos.slice(0, 6);
    if (topRepos.length === 0) {
      throw new Error("Nenhum repositório público próprio encontrado.");
    }

    sessionStorage.setItem("heloisa_github_repos_cache", JSON.stringify(topRepos));
    renderProjects(topRepos);

  } catch (err) {
    console.warn("Utilizando projetos estáticos devido à falha na API: ", err);
    grid.innerHTML = fallbackHtml;
  }
}

// Copy to Clipboard feature for Email and Phone numbers
const copyEmailCard = document.getElementById("copy-email");
const copyPhoneCard = document.getElementById("copy-phone");
const toast = document.getElementById("toast");

function copyTextToClipboard(text, message) {
  navigator.clipboard.writeText(text).then(() => {
    if (toast) {
      toast.textContent = message;
      toast.classList.add("show");
      setTimeout(() => {
        toast.classList.remove("show");
      }, 2500);
    }
  }).catch(err => {
    console.error("Falha ao copiar texto: ", err);
  });
}

if (copyEmailCard) {
  copyEmailCard.addEventListener("click", () => {
    const email = document.getElementById("email-text").textContent.trim();
    copyTextToClipboard(email, "E-mail copiado para a área de transferência!");
  });
}

if (copyPhoneCard) {
  copyPhoneCard.addEventListener("click", () => {
    const phone = document.getElementById("phone-text").textContent.trim();
    copyTextToClipboard(phone, "Telefone copiado para a área de transferência!");
  });
}

// Form Submission Handling (with Web3Forms integration)
const contactForm = document.getElementById("portfolio-form");
const successModal = document.getElementById("success-modal");

async function handleFormSubmit(event) {
  event.preventDefault();
  
  const name = document.getElementById("form-name").value;
  const email = document.getElementById("form-email").value;
  const message = document.getElementById("form-msg").value;
  const submitBtn = contactForm ? contactForm.querySelector("button[type='submit']") : null;
  const originalBtnText = submitBtn ? submitBtn.innerHTML : "";

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Enviando...`;
  }
  
  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        access_key: "e88383f9-7108-4171-aa3e-324c08404a37",
        name: name,
        email: email,
        message: message,
        subject: `Novo Contato do Portfólio - ${name}`
      })
    });

    const result = await response.json();
    console.log("Envio Web3Forms:", result);

  } catch (err) {
    console.warn("Simulação de envio bem sucedida:", err);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
    if (successModal) {
      successModal.classList.add("active");
    }
    if (contactForm) {
      contactForm.reset();
    }
  }
}

function closeModal() {
  if (successModal) {
    successModal.classList.remove("active");
  }
}

// Automatically Update Footer Year
const footerYear = document.getElementById("footer-year");
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initTerminalTabs();
  initTiltCard();
  initStatsCounter();
  if (textArray.length) setTimeout(type, newTextDelay - 1000);
  fetchGitHubProjects();
});
