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
const slides = document.querySelectorAll('.carousel-slide');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');
let currentSlide = 0;

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === index) {
            slide.classList.add('active');
        }
    });
}

prevBtn.addEventListener('click', () => {
    currentSlide = (currentSlide > 0) ? currentSlide - 1 : slides.length - 1;
    showSlide(currentSlide);
});

nextBtn.addEventListener('click', () => {
    currentSlide = (currentSlide < slides.length - 1) ? currentSlide + 1 : 0;
    showSlide(currentSlide);
});

// Affiche la première slide par défaut
showSlide(currentSlide);
