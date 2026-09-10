// Project filter tabs
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card[data-category]');

filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const filter = this.getAttribute('data-filter');
        projectCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            if (filter === 'all' || cardCategory.includes(filter)) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    });
});

// Update active nav link based on scroll position
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveNav() {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Smooth scrolling for navigation links
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
                block: 'start'
            });
            
            navLinks.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Close mobile menu if open
            const menuToggle = document.getElementById('menu-toggle');
            if (menuToggle && menuToggle.checked) {
                menuToggle.checked = false;
            }
        }
    });
});

// Listen for scroll events
window.addEventListener('scroll', updateActiveNav);
window.addEventListener('load', updateActiveNav);
// Section entrance effects; cards remain visible without entrance animations.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealedSections = new WeakSet();
let stopScrollMotion = () => {};

function setupScrollMotion() {
    stopScrollMotion();
    if (motionPreference.matches || !('IntersectionObserver' in window)) return;

    // Observe the heading, not the whole long section, so transitions start at its entrance.
    const headings = [...document.querySelectorAll('main > section .section-title')];
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const section = entry.target.closest('section');
            if (!revealedSections.has(section)) {
                revealedSections.add(section);
                section.classList.add('section-entering');
            }
            // Stop observing before heading movement can retrigger the entrance.
            sectionObserver.unobserve(entry.target);
        });
    }, { threshold: 0.25, rootMargin: '0px 0px -24px 0px' });
    headings.forEach(heading => sectionObserver.observe(heading));

    stopScrollMotion = () => {
        sectionObserver.disconnect();
        headings.forEach(heading => heading.closest('section').classList.remove('section-entering'));
    };
}

setupScrollMotion();
motionPreference.addEventListener('change', setupScrollMotion);

// Grow the message field downward, retaining its original five-row minimum.
const messageField = document.getElementById('message');
if (messageField) {
    const minimumMessageHeight = messageField.getBoundingClientRect().height;
    messageField.style.overflowY = 'hidden';

    function fitMessageHeight() {
        messageField.style.height = 'auto';
        const styles = window.getComputedStyle(messageField);
        const borderHeight = parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth);
        messageField.style.height = `${Math.max(minimumMessageHeight, messageField.scrollHeight + borderHeight)}px`;
    }

    messageField.addEventListener('input', fitMessageHeight);
    window.addEventListener('resize', fitMessageHeight);
    window.addEventListener('pageshow', fitMessageHeight);
    messageField.form?.addEventListener('reset', () => requestAnimationFrame(fitMessageHeight));
    document.fonts?.ready.then(fitMessageHeight);
    fitMessageHeight();
}
