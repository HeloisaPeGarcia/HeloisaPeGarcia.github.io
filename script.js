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
  if (charIndex < textArray[textArrayIndex].length) {
    typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
    charIndex++;
    setTimeout(type, typingSpeed);
  } else {
    setTimeout(erase, newTextDelay);
  }
}

function erase() {
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

// Mobile Menu Navigation Toggle
const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");
const navLinks = document.querySelectorAll("#nav-menu a");

menuToggle.addEventListener("click", () => {
  menuToggle.classList.toggle("active");
  navMenu.classList.toggle("active");
});

// Close mobile menu when a nav link is clicked
navLinks.forEach(link => {
  link.addEventListener("click", () => {
    menuToggle.classList.remove("active");
    navMenu.classList.remove("active");
  });
});

// Header Scrolled Style and Active Link Navigation Highlights
const header = document.getElementById("header");
const sections = document.querySelectorAll("section");

window.addEventListener("scroll", () => {
  // Toggle Header Style
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }

  // Set Active Link on Scroll
  let current = "";
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
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

// Scroll Reveal Observer
const revealElements = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      
      // If the section is "skills", trigger bar animations (optional custom animations)
      if (entry.target.id === "skills") {
        const skillBars = entry.target.querySelectorAll(".skill-bar");
        skillBars.forEach(bar => {
          // Simply ensures transition plays as width matches style tag or updates
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
    // Remove active state from current button
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

// Fetch Public Repositories from GitHub API
async function fetchGitHubProjects() {
  const grid = document.querySelector(".projects-grid");
  if (!grid) return;

  // Save static cards as fallback
  const fallbackHtml = grid.innerHTML;
  
  // Show a beautiful loader spinner
  grid.innerHTML = `
    <div class="loader-box" style="grid-column: 1 / -1; text-align: center; padding: 4rem 0;">
      <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2.5rem; color: var(--accent-cyan); margin-bottom: 1rem;"></i>
      <p style="color: var(--text-muted); font-size: 0.95rem;">Buscando projetos em github.com/HeloisaPeGarcia...</p>
    </div>
  `;

  try {
    const response = await fetch("https://api.github.com/users/HeloisaPeGarcia/repos?sort=updated&per_page=20");
    if (!response.ok) {
      throw new Error("Não foi possível conectar à API do GitHub (Rate limit excedido ou Sem internet)");
    }
    
    let repos = await response.json();
    
    // Filter out forks
    repos = repos.filter(repo => !repo.fork);
    
    // Sort primarily by stars (popularity), secondarily by last updated date
    repos.sort((a, b) => {
      if (b.stargazers_count !== a.stargazers_count) {
        return b.stargazers_count - a.stargazers_count;
      }
      return new Date(b.updated_at) - new Date(a.updated_at);
    });

    // Take the top 6 repos
    const topRepos = repos.slice(0, 6);
    if (topRepos.length === 0) {
      throw new Error("Nenhum repositório público próprio encontrado.");
    }

    grid.innerHTML = ""; // Clear loader

    topRepos.forEach(repo => {
      const name = repo.name;
      const lowerName = name.toLowerCase();
      const description = repo.description || "Sem descrição cadastrada. Visite o repositório para saber mais.";
      const topics = repo.topics || [];
      const lowerTopics = topics.map(t => t.toLowerCase());

      // Smart classification based on project language, topic tags or repo name
      let category = "backend"; // Fallback default
      
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
        lowerName.includes("actions") ||
        lowerName.includes("docker")
      ) {
        category = "devops";
      } else if (
        lowerTopics.includes("aws") ||
        lowerTopics.includes("azure") ||
        lowerTopics.includes("cloud") ||
        lowerTopics.includes("gcp") ||
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
        lowerName.includes("database") ||
        lowerName.includes("banco")
      ) {
        category = "backend";
      }

      // Premium visual icon selectors
      let iconClass = "fa-solid fa-code";
      if (category === "devops") {
        iconClass = "fa-brands fa-github-actions";
        if (lowerName.includes("docker") || lowerTopics.includes("docker")) {
          iconClass = "fa-brands fa-docker";
        }
      } else if (category === "cloud") {
        iconClass = "fa-solid fa-cloud";
        if (lowerName.includes("aws") || lowerTopics.includes("aws")) {
          iconClass = "fa-brands fa-aws";
        } else if (lowerName.includes("azure") || lowerTopics.includes("azure")) {
          iconClass = "fa-solid fa-circle-nodes";
        }
      } else if (category === "backend") {
        iconClass = "fa-solid fa-cubes";
        if (repo.language === "Java") {
          iconClass = "fa-brands fa-java";
        } else if (repo.language === "Python") {
          iconClass = "fa-brands fa-python";
        }
      }

      // Build tags markup
      let tagsHTML = "";
      if (repo.language) {
        tagsHTML += `<span class="project-tag">${repo.language}</span>`;
      }
      
      // Inject up to 2 specific topics
      topics.slice(0, 2).forEach(topic => {
        tagsHTML += `<span class="project-tag">${topic}</span>`;
      });

      // Show star rating if any
      if (repo.stargazers_count > 0) {
        tagsHTML += `<span class="project-tag"><i class="fa-solid fa-star" style="color: #ffd700; margin-right: 3px;"></i>${repo.stargazers_count}</span>`;
      }

      // Generate Card
      const card = document.createElement("div");
      card.className = "project-card glass reveal visible"; // Make active immediately
      card.setAttribute("data-category", category);
      card.style.opacity = "1";
      card.style.transform = "scale(1)";

      card.innerHTML = `
        <div class="project-icon"><i class="${iconClass}"></i></div>
        <h3>${name}</h3>
        <p>${description}</p>
        <div class="project-tags">
          ${tagsHTML}
        </div>
        <div class="project-links">
          <a href="${repo.html_url}" target="_blank" class="project-link">
            Repositório <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      `;

      grid.appendChild(card);
    });

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
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 2500);
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

// Form Submission handling
const contactForm = document.getElementById("portfolio-form");
const successModal = document.getElementById("success-modal");

function handleFormSubmit(event) {
  event.preventDefault();
  
  // Collect data
  const name = document.getElementById("form-name").value;
  const email = document.getElementById("form-email").value;
  const message = document.getElementById("form-msg").value;
  
  console.log("Mock Form Submit:", { name, email, message });
  
  // Show dialog modal
  if (successModal) {
    successModal.classList.add("active");
  }
  
  // Reset form inputs
  contactForm.reset();
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

// Initialize typing effect and fetch GitHub repos on document load
document.addEventListener("DOMContentLoaded", () => {
  if (textArray.length) setTimeout(type, newTextDelay - 1000);
  fetchGitHubProjects();
});

