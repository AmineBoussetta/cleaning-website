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
        
        // Add keyboard navigation
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
        const swipeThreshold = 50; // minimum distance for swipe
        const diff = this.touchStartX - this.touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.navigate(1); // Swipe left, go next
            } else {
                this.navigate(-1); // Swipe right, go previous
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
        }, 400); // Match this with CSS transition duration
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

        // Ensure status element exists and is visible
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
//nav toggler
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

// Initialize all components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MobileMenu();
    const header = new Header();
    const carousel = new Carousel(document.querySelector('.carousel'));
    const contactForm = new ContactForm('my-form');
});