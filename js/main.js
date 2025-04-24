// ===================
// FONCTIONNALITÉS EXISTANTES
// ===================

// Constants
const CAROUSEL_CONFIG = {
  TRANSITION_DURATION: 600,
  AUTO_PLAY_INTERVAL: 5000
};

const FORM_CONFIG = {
  STATUS_DISPLAY_DURATION: 5000,
  MESSAGES: {
    SENDING: 'Envoi en cours...',
    SUCCESS: 'Message envoyé avec succès !',
    ERROR: "Une erreur s'est produite. Veuillez réessayer.",
    NETWORK_ERROR: "Problème de connexion. Vérifiez votre internet."
  }
};

// Utility Functions
const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

// Header Component
class Header {
  constructor() {
    this.header = document.querySelector('.js-header');
    this.init();
  }

  init() {
    this.handleScroll = debounce(() => {
      this.header.classList.toggle('bg-reveal', window.scrollY > 0);
    }, 100);

    window.addEventListener('scroll', this.handleScroll);
  }

  destroy() {
    window.removeEventListener('scroll', this.handleScroll);
  }
}

// Carousel Component
class Carousel {
  constructor(element) {
    this.element = element;
    this.slides = element.querySelectorAll('.carousel-slide');
    this.prevBtn = element.querySelector('.prev');
    this.nextBtn = element.querySelector('.next');
    this.currentSlide = 0;
    this.isAnimating = false;
    this.touchStartX = 0;
    this.touchEndX = 0;

    this.init();
  }

  init() {
    if (!this.element || this.slides.length === 0) return;

    this.showSlide(this.currentSlide);
    this.bindEvents();
    this.setupTouchEvents();
    this.setupResizeHandler();
  }

  bindEvents() {
    this.prevBtn?.addEventListener('click', () => this.navigate(-1));
    this.nextBtn?.addEventListener('click', () => this.navigate(1));

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.navigate(-1);
      if (e.key === 'ArrowRight') this.navigate(1);
    });
  }

  setupTouchEvents() {
    this.element.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX;
    }, { passive: true });

    this.element.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].clientX;
      this.handleSwipe();
    }, { passive: true });
  }

  handleSwipe() {
    const swipeThreshold = 50; // distance minimum pour un swipe
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        this.navigate(1); // Swipe gauche
      } else {
        this.navigate(-1); // Swipe droite
      }
    }
  }

  setupResizeHandler() {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.adjustHeight();
      }, 250);
    });
  }

  adjustHeight() {
    const activeSlide = this.slides[this.currentSlide];
    if (activeSlide) {
      this.element.style.height = `${activeSlide.offsetHeight}px`;
    }
  }

  navigate(direction) {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.toggleControls(false);

    const nextIndex = this.getNextIndex(this.currentSlide + direction);
    this.slides[this.currentSlide].classList.remove('active');

    setTimeout(() => {
      this.slides[nextIndex].classList.add('active');
      this.currentSlide = nextIndex;
      this.isAnimating = false;
      this.toggleControls(true);
      this.adjustHeight();
    }, 400);
  }

  getNextIndex(index) {
    const length = this.slides.length;
    return ((index % length) + length) % length;
  }

  toggleControls(enabled) {
    const pointerEvents = enabled ? 'auto' : 'none';
    [this.prevBtn, this.nextBtn].forEach(btn => {
      if (btn) btn.style.pointerEvents = pointerEvents;
    });
  }

  showSlide(index) {
    if (this.isAnimating) return;

    this.slides[this.currentSlide].classList.remove('active');
    this.slides[index].classList.add('active');
    this.currentSlide = index;
    this.adjustHeight();
  }
}

// Contact Form Component
class ContactForm {
  constructor(formId) {
    this.form = document.getElementById(formId);
    this.status = document.getElementById('form-status');
    this.submitButton = this.form?.querySelector('button[type="submit"]');

    if (this.form) this.init();
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();
    if (!this.status) return;

    this.submitButton.disabled = true;
    this.status.style.display = 'block';
    this.status.innerHTML = FORM_CONFIG.MESSAGES.SENDING;

    try {
      const response = await fetch(this.form.action, {
        method: 'POST',
        body: new FormData(this.form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        this.status.innerHTML = FORM_CONFIG.MESSAGES.SUCCESS;
        this.form.reset();
      } else {
        this.status.innerHTML = FORM_CONFIG.MESSAGES.ERROR;
      }
    } catch (error) {
      this.status.innerHTML = FORM_CONFIG.MESSAGES.NETWORK_ERROR;
    } finally {
      this.submitButton.disabled = false;
      setTimeout(() => {
        this.status.style.display = 'none';
      }, FORM_CONFIG.STATUS_DISPLAY_DURATION);
    }
  }
}

// Mobile Menu Component
class MobileMenu {
  constructor() {
    this.toggler = document.querySelector('.js-nav-toggler');
    this.nav = document.querySelector('.js-nav');
    this.body = document.body;
    this.init();
  }

  init() {
    this.toggler.addEventListener('click', () => this.toggleMenu());
    this.nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });
    document.addEventListener('click', (e) => this.handleOutsideClick(e));
  }

  toggleMenu() {
    this.toggler.classList.toggle('active');
    this.nav.classList.toggle('active');
    this.body.classList.toggle('menu-open');
    const isExpanded = this.toggler.getAttribute('aria-expanded') === 'true';
    this.toggler.setAttribute('aria-expanded', !isExpanded);
  }

  closeMenu() {
    this.toggler.classList.remove('active');
    this.nav.classList.remove('active');
    this.body.classList.remove('menu-open');
    this.toggler.setAttribute('aria-expanded', 'false');
  }

  handleOutsideClick(e) {
    if (this.nav.classList.contains('active') &&
      !this.nav.contains(e.target) &&
      !this.toggler.contains(e.target)) {
      this.closeMenu();
    }
  }
}

// Initialisation des composants existants
document.addEventListener('DOMContentLoaded', () => {
  new MobileMenu();
  new Header();
  const carouselElem = document.querySelector('.carousel');
  if (carouselElem) new Carousel(carouselElem);
  new ContactForm('my-form');
});

// ===================
// MODULE DE TRADUCTION
// ===================

const translations = {
  en: {
    "nav.home": "Home",
    "nav.about": "About",
    "nav.specialty": "Expertise",
    "nav.services": "Services",
    "nav.contact": "Booking & Contact",
    "home.title": "Tailored Cleaning Solutions for Large Companies",
    "home.text1": "Specialized in cleaning shopping centers, stores, factories, and large areas, we guarantee immaculate spaces and impeccable quality.",
    "home.text2": "We also offer residential cleaning services to meet all your needs.",
    "home.btn": "Book an Appointment",
    "about.title": "About",
    "about.subtitle": "Expertise Built Over the Years",
    "about.text1": "With long experience, we are experts in servicing large companies: shopping centers, factories, grocery stores, and more. Our mission is to ensure a clean and welcoming environment for your clients and employees.",
    "about.text2": "We use modern equipment to offer efficient cleaning that respects environmental standards.",
    "specialty.title": "Specialties",
    "specialty.subtitle": "Our Expertise",
    "specialty.office": "Office Cleaning",
    "specialty.commercial": "Commercial Cleaning",
    "specialty.residential": "Residential Cleaning",
    "services.title": "Services",
    "services.subtitle": "Our Services",
    "services.regular": "Regular Cleaning",
    "services.windows": "Window Cleaning",
    "services.parking": "Parking Cleaning",
    "services.carpet": "Carpet Cleaning",
    "services.decapage": "Strip and Wax",
    "services.commercial_cleaning": "Full Commercial Cleaning",
    "services.butcher": "Butcher Shop Cleaning",
    "services.fishmarket": "Fish Market Cleaning",
    "contact.title": "Booking & Contact",
    "contact.subtitle": "Contact Us",
    "contact.address.title": "Address",
    "contact.address.text": "8876 Boul. Henri-Bourassa #100, Québec, QC G1G 3W9",
    "contact.phone.title": "Call Us",
    "contact.phone.number1": "(+1) 418 561 5415",
    "contact.phone.number2": "(+1) 581 777 3133",
    "contact.email.title": "Email",
    "contact.email.link": "direction@partenaireservicegeneral.com",
    "form.name": "Name",
    "form.email": "Email",
    "form.phone": "Phone",
    "form.message": "Message",
    "form.submit": "Send Message",
    "footer.follow": "Follow Us",
    "lang.fr": "Français",
    "lang.en": "English"
  },
  fr: {
    "nav.home": "Accueil",
    "nav.about": "À propos",
    "nav.specialty": "Expertises",
    "nav.services": "Services",
    "nav.contact": "Réservation & Contact",
    "home.title": "Des solutions de nettoyage adaptées aux grandes entreprises",
    "home.text1": "Spécialisés dans l'entretien des centres commerciaux, magasins, usines et grandes surfaces, nous garantissons des espaces impeccables et une qualité irréprochable.",
    "home.text2": "Nous offrons également des services de nettoyage résidentiel pour répondre à tous vos besoins.",
    "home.btn": "Réserver un rendez-vous",
    "about.title": "à propos",
    "about.subtitle": "Une expertise bâtie au fil des années",
    "about.text1": "Forts d’une longue expérience, nous sommes experts dans l'entretien des grandes entreprises : centres commerciaux, usines, épiceries, et bien plus. Notre mission est de garantir un environnement propre et accueillant pour vos clients et employés.",
    "about.text2": "Nous utilisons des équipements modernes pour offrir un nettoyage efficace et respectueux des normes environnementales.",
    "specialty.title": "spécialités",
    "specialty.subtitle": "notre expertise",
    "specialty.office": "bureautique",
    "specialty.commercial": "commercialle",
    "specialty.residential": "résidentielle",
    "services.title": "services",
    "services.subtitle": "nos services",
    "services.regular": "Entretien ménager régulier",
    "services.windows": "Lavage de vitres",
    "services.parking": "Nettoyage de parkings",
    "services.carpet": "Lavage de tapis",
    "services.decapage": "Décapage et cirage",
    "services.commercial_cleaning": "Entretien commercial complet",
    "services.butcher": "Nettoyage de boucheries",
    "services.fishmarket": "Nettoyage de poissonneries",
    "contact.title": "Réservation & Contact",
    "contact.subtitle": "contactez-nous",
    "contact.address.title": "Adresse",
    "contact.address.text": "8876 Boul. Henri-Bourassa #100, Québec, QC G1G 3W9",
    "contact.phone.title": "Appelez-nous",
    "contact.phone.number1": "(+1) 418 561 5415",
    "contact.phone.number2": "(+1) 581 777 3133",
    "contact.email.title": "Courriel",
    "contact.email.link": "direction@partenaireservicegeneral.com",
    "form.name": "Nom et Prénom",
    "form.email": "Email",
    "form.phone": "Téléphone",
    "form.message": "Message",
    "form.submit": "Envoyer le message",
    "footer.follow": "suivez-nous",
    "lang.fr": "Français",
    "lang.en": "English"
  }
};

// Fonction de traduction
function translatePage(lang) {
  // Traduire les éléments avec data-i18n
  document.querySelectorAll('[data-i18n]').forEach(elem => {
    const key = elem.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      elem.textContent = translations[lang][key];
    }
  });

  // Traduire les placeholders avec data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
    const key = elem.getAttribute('data-i18n-placeholder');
    if (translations[lang] && translations[lang][key]) {
      elem.placeholder = translations[lang][key];
    }
  });

  // Mettre à jour les options de select si nécessaire
  document.querySelectorAll('option[data-i18n]').forEach(elem => {
    const key = elem.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      elem.textContent = translations[lang][key];
    }
  });
}

// Écouteur d'événement pour le sélecteur de langue
document.addEventListener('DOMContentLoaded', () => {
  const langSelect = document.getElementById('lang-select');
  if (langSelect) {
    langSelect.addEventListener('change', function () {
      translatePage(this.value);
    });
    // Définir la langue par défaut
    translatePage(langSelect.value);
  }
});

// Toggle FR↔EN sur le bouton unique
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('lang-toggle');
  if (!toggle) return;

  // Met à jour le texte du bouton pour indiquer la langue cible
  function updateButton(currentLang) {
    const target = currentLang === 'fr' ? 'en' : 'fr';
    toggle.textContent = translations[target][`lang.${target}`];
  }

  // Lecture initiale depuis <html lang="…">
  let currentLang = document.documentElement.lang || 'fr';
  updateButton(currentLang);

  // Au clic, on bascule la langue
  toggle.addEventListener('click', () => {
    const newLang = document.documentElement.lang === 'fr' ? 'en' : 'fr';
    document.documentElement.lang = newLang;      // change l’attribut lang
    translatePage(newLang);                       // retraduit tous les data-i18n
    updateButton(newLang);                        // ajuste le libellé du bouton
  });
});

