// header bg reveal

const headerBg = () => {
    const header = document.querySelector('.js-header');

    window.addEventListener('scroll', function () {
        if(this.scrollY > 0){
            header.classList.add("bg-reveal");
        }else{
            header.classList.remove("bg-reveal");
        }
    });
}
headerBg();
// carousel
const carousel = () => {
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    let currentSlide = 0;
    let isAnimating = false;

    function showSlide(index, direction) {
        if (isAnimating) return;
        isAnimating = true;

        // Désactiver les boutons pendant la transition
        prevBtn.style.pointerEvents = 'none';
        nextBtn.style.pointerEvents = 'none';

        // Masquer la slide actuelle
        slides[currentSlide].classList.remove('active');
        
        // Gérer l'index des slides
        if (index >= slides.length) currentSlide = 0;
        else if (index < 0) currentSlide = slides.length - 1;
        else currentSlide = index;

        // Afficher la nouvelle slide après un délai
        setTimeout(() => {
            slides[currentSlide].classList.add('active');
            isAnimating = false;
            prevBtn.style.pointerEvents = 'auto';
            nextBtn.style.pointerEvents = 'auto';
        }, 600); // Doit correspondre à la durée de la transition CSS
    }

    prevBtn.addEventListener('click', () => showSlide(currentSlide - 1, 'prev'));
    nextBtn.addEventListener('click', () => showSlide(currentSlide + 1, 'next'));

    // Initialisation
    slides[currentSlide].classList.add('active');
}

// Initialiser le carrousel au chargement
document.addEventListener('DOMContentLoaded', carousel);

//mail form
    document.getElementById('my-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = e.target;
        const status = document.getElementById('form-status');
        const button = form.querySelector('button[type="submit"]');

        button.disabled = true;
        status.style.display = 'block';
        status.innerHTML = 'Envoi en cours...';

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                status.innerHTML = 'Message envoyé avec succès ! Nous vous répondrons bientôt.';
                form.reset(); // Reset form fields
            } else {
                status.innerHTML = "Une erreur s'est produite. Veuillez réessayer.";
            }
        } catch (error) {
            status.innerHTML = "Problème de connexion. Vérifiez votre internet.";
        }

        button.disabled = false;
        setTimeout(() => { status.style.display = 'none'; }, 5000);
    });

