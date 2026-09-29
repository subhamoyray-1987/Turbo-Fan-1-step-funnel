/**
 * AERO-FORCE Funnel Application Scripts (app.js)
 * 
 * Modular architecture supporting all funnel views:
 * - Module 1: Mobile Hamburger Navigation (Index / Landing)
 * - Module 2: Splide.js Testimonial Slider (Index / Landing)
 * - Module 3: Privacy Policy Sidebar Navigation & ScrollSpy (Privacy Policy)
 * - Module 4: Order Confirmation Print Receipt Handler (Confirmation)
 * - Module 5: Upsell Button Interactions & Session Tracking (Upsell)
 * 
 * All initializers are fully guarded for safe multi-page loading.
 */

'use strict';

/**
 * 1. Responsive Hamburger Menu Toggle (index.html)
 */
function initMobileMenu() {
  const hamburgerBtn = document.querySelector('.unify-hamburger-btn');
  const unifyHeader = document.querySelector('.unify-header');
  const mobileMenu = document.querySelector('.unify-mobile-menu');
  const mobileLinks = document.querySelectorAll('.unify-mobile-nav-link');

  if (!hamburgerBtn || !unifyHeader) return;

  const toggleMenu = () => {
    const isOpen = unifyHeader.classList.toggle('menu-open');
    hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (mobileMenu) {
      mobileMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    }
  };

  const closeMenu = () => {
    unifyHeader.classList.remove('menu-open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    if (mobileMenu) {
      mobileMenu.setAttribute('aria-hidden', 'true');
    }
  };

  hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close when clicking any mobile nav link
  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close when clicking outside header
  document.addEventListener('click', (e) => {
    if (!unifyHeader.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && unifyHeader.classList.contains('menu-open')) {
      closeMenu();
    }
  });

  // Close on resize to desktop (1024px)
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024 && unifyHeader.classList.contains('menu-open')) {
      closeMenu();
    }
  });
}

/**
 * 2. Splide.js Testimonial Slider (index.html)
 */
function initProsSlider() {
  const prosSliderEl = document.getElementById('pros-slider');
  if (!prosSliderEl || typeof Splide === 'undefined') return;

  new Splide('#pros-slider', {
    type: 'loop',
    perPage: 2,
    perMove: 1,
    gap: '20px',
    autoplay: true,
    interval: 4000,
    pauseOnHover: true,
    pauseOnFocus: true,
    resetProgress: false,
    arrows: false,
    pagination: false,
    drag: true,
    speed: 600,
    breakpoints: {
      767.98: {
        perPage: 1,
        gap: '16px',
      },
    },
  }).mount();
}

/**
 * 3. Privacy Policy Sidebar Navigation & ScrollSpy (privacy-policy.html)
 */
function initPrivacyPolicyNav() {
  const links = document.querySelectorAll('.privacy-nav-link');
  const sections = document.querySelectorAll('.policy-section, .policy-security-card');

  if (!links.length || !sections.length) return;

  let isTicking = false;

  const updateActiveSection = () => {
    const scrollPosition = window.scrollY || window.pageYOffset || 0;
    let currentId = '';

    // If near bottom of the document, activate the last section
    const windowBottom = scrollPosition + window.innerHeight;
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );

    if (windowBottom >= documentHeight - 60) {
      const lastSection = sections[sections.length - 1];
      if (lastSection) {
        currentId = lastSection.getAttribute('id');
      }
    } else {
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (scrollPosition >= sectionTop - 140) {
          currentId = section.getAttribute('id');
        }
      });
    }

    if (!currentId && sections[0]) {
      currentId = sections[0].getAttribute('id');
    }

    links.forEach((link) => {
      const targetHash = link.getAttribute('href');
      const isMatch = targetHash === '#' + currentId;
      link.classList.toggle('is-active', isMatch);
      if (isMatch) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    isTicking = false;
  };

  const onScroll = () => {
    if (!isTicking) {
      window.requestAnimationFrame(updateActiveSection);
      isTicking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  // Smooth scroll click handler for sidebar links with sticky offset handling
  links.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const targetOffset = targetElement.offsetTop - 30;
          window.scrollTo({
            top: Math.max(0, targetOffset),
            behavior: 'smooth'
          });

          // Instantly highlight active link
          links.forEach((l) => {
            l.classList.remove('is-active');
            l.removeAttribute('aria-current');
          });
          link.classList.add('is-active');
          link.setAttribute('aria-current', 'true');

          // Update URL hash cleanly
          if (history.pushState) {
            history.pushState(null, '', targetId);
          }
        }
      }
    });
  });

  // Initial calculation on page load
  updateActiveSection();
}

/**
 * 4. Order Confirmation Actions (confirmation.html)
 */
function initPrintReceipt() {
  const printButtons = document.querySelectorAll('.btn-print-receipt');
  if (!printButtons.length) return;

  printButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.print();
    });
  });
}

/**
 * 5. Upsell Page CTA Actions (upsell.html)
 */
function initUpsellActions() {
  const addUpsellBtn = document.getElementById('addUpsellToOrder');
  const declineUpsellLink = document.getElementById('declineUpsellOffer');

  if (addUpsellBtn) {
    addUpsellBtn.addEventListener('click', () => {
      try {
        sessionStorage.setItem('turbofan_upsell_accepted', 'true');
      } catch (err) {
        // Safe fallback in sandboxed / private modes
      }
    });
  }

  if (declineUpsellLink) {
    declineUpsellLink.addEventListener('click', () => {
      try {
        sessionStorage.setItem('turbofan_upsell_accepted', 'false');
      } catch (err) {
        // Safe fallback
      }
    });
  }
}

/**
 * Main Application Orchestrator
 */
function initApp() {
  initMobileMenu();
  initProsSlider();
  initPrivacyPolicyNav();
  initPrintReceipt();
  initUpsellActions();
}

// Safely execute on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
