
function openBook() {
    const pages = document.querySelector('#portfolio .pages');
    pages.style.transform = 'rotateY(0deg)';
}

const sections = document.querySelectorAll('section');
const options = {
    threshold: 0.25
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
    });
}, options);

sections.forEach(section => {
    observer.observe(section);
});

let lastScrollTop = 0;
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollSpeed = Math.abs(scrollTop - lastScrollTop);

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
});
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext('2d');

// for intro motion
let mouseMoved = false;

const pointer = {
    x: .5 * window.innerWidth,
    y: .5 * window.innerHeight,
}
const params = {
    pointsNumber: 40,
    widthFactor: .3,
    mouseThreshold: .6,
    spring: .4,
    friction: .5
};

const trail = new Array(params.pointsNumber);
for (let i = 0; i < params.pointsNumber; i++) {
    trail[i] = {
        x: pointer.x,
        y: pointer.y,
        dx: 0,
        dy: 0,
    }
}

window.addEventListener("click", e => {
    updateMousePosition(e.pageX, e.pageY);
});
window.addEventListener("mousemove", e => {
    mouseMoved = true;
    updateMousePosition(e.pageX, e.pageY);
});
window.addEventListener("touchmove", e => {
    mouseMoved = true;
    updateMousePosition(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
});

function updateMousePosition(eX, eY) {
    pointer.x = eX;
    pointer.y = eY;
}

