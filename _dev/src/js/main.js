import Slider from "./components/slider";
import Lightbox from "./components/lightbox";
import ScrollToTopBtn from "./components/scrolltotop-btn";

class Application {


    constructor() {
        this.initCommon();
        this.initSliders();
        this.initMobileViewPortHeight();
    }

    
    // Инициализации
    initCommon() {

        new Lightbox();

        new ScrollToTopBtn();
       
        // // Плавная прокрутка при переходе по якорю
        // const $root = $('html, body');
        // $('#main-menu a').click(function() {
        //     var href = $.attr(this, 'href');
        //     href = href.substring(1, href.length);
        //     //console.log(href);
        //     $root.animate({
        //         scrollTop: $(href).offset().top
        //     }, 1500, function () {
        //         window.location.hash = href;
        //     });
        //     return false;
        // });
        
    }

    
    // Инициализация всех слайдеров
    initSliders() {

        // Slider in content
        let $slider = $('.slider');
        if ($slider.length !== 0) {
            new Slider($slider, {
                counter: false,
                infinite: true,
                slidesToShow: 1,
                slidesToScroll: 1,
                adaptiveHeight: true,
                             
            });
        }

        // Carousel in content
        let $carousel = $('.carousel');
        if ($carousel.length !== 0) {
            new Slider($carousel, {
                counter: false,
                infinite: true,
                slidesToShow: 3,
                slidesToScroll: 1,                
                arrows: true,
                prevArrow: '<button class="carousel-prev"><span class="icon-left"></span></button>',
                nextArrow: '<button class="carousel-next"><span class="icon-right"></span></button>',
                adaptiveHeight: true,                
                
                responsive: [
                   
                    {
                        breakpoint: 767,
                        settings: {
                            slidesToShow: 2,
                            arrows: false
                        }
                    },
                ]
            });
        }

    }


    // 100vh для мобильников
    initMobileViewPortHeight() {

        // https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
        /*
        Прмиер как использовать эту фичу в стилях
        .module {
            height: 100vh; //Use vh as a fallback for browsers that do not support Custom Properties
            height: calc(var(--vh, 1vh) * 100);
            margin: 0 auto;
            max-width: 30%;
        }
        */

        // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
        let vh = window.innerHeight * 0.01;
        // Then we set the value in the --vh custom property to the root of the document
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        let document_width = window.innerWidth; 
        // We listen to the resize event (а ресайз в мобилках срабатывает и при скроле, когда исчезает строка ввода адреса в браузере)
        window.addEventListener('resize', () => {
            // We execute the same script as before
            if (document_width != window.innerWidth) {
                document_width = window.innerWidth; 
                let vh = window.innerHeight * 0.01;                    
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            }
        });
    }
    
}


// запуск приложения
$(() => {
    new Application();
});