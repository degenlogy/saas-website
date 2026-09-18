
/**
 * NEXORA SaaS Landing Page
 * Full production-grade Vanilla JavaScript engine
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ========================================================================
  // 1. DOM ELEMENTS
  // ========================================================================
  const announcementBar = document.getElementById('announcementBar');
  const announcementCloseBtn = document.getElementById('announcementCloseBtn');
  
  const siteHeader = document.getElementById('siteHeader');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  
  const billingToggle = document.getElementById('billingToggle');
  const planPrices = document.querySelectorAll('.plan-price');
  const planBillingTexts = document.querySelectorAll('.plan-billing-text');
  
  const faqItems = document.querySelectorAll('.accordion-item');
  const counterElements = document.querySelectorAll('[data-counter]');
  const revealElements = document.querySelectorAll('.reveal');
  const backToTopBtn = document.getElementById('backToTopBtn');

  // Modal triggers and containers
  const modalOpenButtons = document.querySelectorAll('[data-modal-target]');
  const modalCloseButtons = document.querySelectorAll('[data-modal-close]');
  const modals = document.querySelectorAll('.modal-overlay');

  const signupForm = document.getElementById('signupForm');
  const demoForm = document.getElementById('demoForm');

  // ========================================================================
  // 2. ANNOUNCEMENT BAR (WITH LOCALSTORAGE MEMORY)
  // ========================================================================
  const ANNOUNCEMENT_STORAGE_KEY = 'nexora_announcement_closed';

  function initAnnouncement() {
    if (localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY) === 'true') {
      if (announcementBar) announcementBar.classList.add('closed');
    }

    if (announcementCloseBtn) {
      announcementCloseBtn.addEventListener('click', () => {
        announcementBar.classList.add('closed');
        localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, 'true');
      });
    }
  }

  // ========================================================================
  // 3. STICKY HEADER & SCROLL BEHAVIOR
  // ========================================================================
  function handleScroll() {
    const scrollY = window.scrollY || window.pageYOffset;

    // Header background blur intensification
    if (scrollY > 20) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }

    // Back to top button visibility
    if (scrollY > 500) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  // Back to top trigger
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ========================================================================
  // 4. MOBILE NAVIGATION DRAWER
  // ========================================================================
  function toggleMobileMenu() {
    const isOpen = mobileMenu.classList.contains('open');
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  function openMobileMenu() {
    mobileMenu.classList.add('open');
    hamburgerBtn.classList.add('active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    hamburgerBtn.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', toggleMobileMenu);
  }

  // Close mobile drawer when link clicked
  mobileNavLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (
      mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !hamburgerBtn.contains(e.target)
    ) {
      closeMobileMenu();
    }
  });

  // ========================================================================
  // 5. PRICING TOGGLE (MONTHLY VS YEARLY)
  // ========================================================================
  let isYearly = false;

  function initPricingToggle() {
    if (!billingToggle) return;

    billingToggle.addEventListener('click', () => {
      isYearly = !isYearly;
      billingToggle.classList.toggle('yearly', isYearly);
      billingToggle.setAttribute('aria-pressed', isYearly ? 'true' : 'false');

      planPrices.forEach((priceEl) => {
        const monthly = priceEl.getAttribute('data-monthly');
        const yearly = priceEl.getAttribute('data-yearly');
        priceEl.textContent = isYearly ? yearly : monthly;
      });

      planBillingTexts.forEach((textEl) => {
        textEl.textContent = isYearly ? 'Billed annually (Save 20%)' : 'Billed monthly';
      });
    });
  }

  // ========================================================================
  // 6. ACCORDION (FAQ)
  // ========================================================================
  function initFAQ() {
    faqItems.forEach((item) => {
      const trigger = item.querySelector('.accordion-trigger');
      if (!trigger) return;

      trigger.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all items
        faqItems.forEach((otherItem) => {
          otherItem.classList.remove('active');
          const otherTrigger = otherItem.querySelector('.accordion-trigger');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
        });

        // Toggle current
        if (!isActive) {
          item.classList.add('active');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // ========================================================================
  // 7. STAT COUNTERS ANIMATION (INTERSECTION OBSERVER)
  // ========================================================================
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-counter'), 10);
    const duration = 1500; // ms
    const startTime = performance.now();

    function updateCount(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const easedProgress = progress * (2 - progress);
      const currentVal = Math.floor(easedProgress * target);

      el.textContent = currentVal.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        el.textContent = target.toLocaleString();
      }
    }

    requestAnimationFrame(updateCount);
  }

  function initCounters() {
    if (!('IntersectionObserver' in window)) {
      counterElements.forEach((el) => {
        el.textContent = el.getAttribute('data-counter');
      });
      return;
    }

    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counterElements.forEach((el) => counterObserver.observe(el));
  }

  // ========================================================================
  // 8. SCROLL REVEAL ANIMATIONS
  // ========================================================================
  function initScrollReveal() {
    if (!('IntersectionObserver' in window)) {
      revealElements.forEach((el) => el.classList.add('active'));
      return;
    }

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, {
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.15
    });

    revealElements.forEach((el) => revealObserver.observe(el));
  }

  // ========================================================================
  // 9. MODAL SYSTEM
  // ========================================================================
  function openModal(modalId) {
    const targetModal = document.getElementById(modalId);
    if (!targetModal) return;

    targetModal.hidden = false;
    // Small timeout for CSS transition
    setTimeout(() => {
      targetModal.classList.add('open');
    }, 10);

    document.body.style.overflow = 'hidden';

    // Focus first input
    const firstInput = targetModal.querySelector('input');
    if (firstInput) firstInput.focus();
  }

  function closeModal(modal) {
    modal.classList.remove('open');
    setTimeout(() => {
      modal.hidden = true;
      document.body.style.overflow = '';
      resetForms(modal);
    }, 200);
  }

  function resetForms(modal) {
    const form = modal.querySelector('form');
    const successState = modal.querySelector('.modal-success-state');
    if (form) {
      form.reset();
      form.hidden = false;
      const errors = form.querySelectorAll('.form-error');
      errors.forEach((err) => (err.textContent = ''));
    }
    if (successState) {
      successState.hidden = true;
    }
  }

  modalOpenButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.getAttribute('data-modal-target');
      if (target) {
        if (mobileMenu.classList.contains('open')) closeMobileMenu();
        openModal(target);
      }
    });
  });

  modalCloseButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) closeModal(modal);
    });
  });

  modals.forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  // Escape key closes modals and mobile menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modals.forEach((modal) => {
        if (modal.classList.contains('open')) closeModal(modal);
      });
      if (mobileMenu.classList.contains('open')) closeMobileMenu();
    }
  });

  // ========================================================================
  // 10. FORM CLIENT-SIDE VALIDATION
  // ========================================================================
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Sign Up Form Handler
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      const nameInput = document.getElementById('signupName');
      const emailInput = document.getElementById('signupEmail');
      const passwordInput = document.getElementById('signupPassword');

      const nameError = document.getElementById('signupNameError');
      const emailError = document.getElementById('signupEmailError');
      const passwordError = document.getElementById('signupPasswordError');

      // Reset errors
      nameError.textContent = '';
      emailError.textContent = '';
      passwordError.textContent = '';

      if (!nameInput.value.trim()) {
        nameError.textContent = 'Please enter your full name.';
        isValid = false;
      }

      if (!emailInput.value.trim() || !validateEmail(emailInput.value.trim())) {
        emailError.textContent = 'Please enter a valid work email address.';
        isValid = false;
      }

      if (!passwordInput.value || passwordInput.value.length < 8) {
        passwordError.textContent = 'Password must contain at least 8 characters.';
        isValid = false;
      }

      if (isValid) {
        signupForm.hidden = true;
        document.getElementById('signupSuccess').hidden = false;
      }
    });
  }

  // Demo Booking Form Handler
  if (demoForm) {
    demoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      const nameInput = document.getElementById('demoName');
      const emailInput = document.getElementById('demoEmail');
      const companyInput = document.getElementById('demoCompany');

      const nameError = document.getElementById('demoNameError');
      const emailError = document.getElementById('demoEmailError');
      const companyError = document.getElementById('demoCompanyError');

      // Reset errors
      nameError.textContent = '';
      emailError.textContent = '';
      companyError.textContent = '';

      if (!nameInput.value.trim()) {
        nameError.textContent = 'Please enter your name.';
        isValid = false;
      }

      if (!emailInput.value.trim() || !validateEmail(emailInput.value.trim())) {
        emailError.textContent = 'Please enter a valid business email.';
        isValid = false;
      }

      if (!companyInput.value.trim()) {
        companyError.textContent = 'Please enter your company name.';
        isValid = false;
      }

      if (isValid) {
        demoForm.hidden = true;
        document.getElementById('demoSuccess').hidden = false;
      }
    });
  }

  // ========================================================================
  // 11. INITIALIZATION DISPATCH
  // ========================================================================
  initAnnouncement();
  initPricingToggle();
  initFAQ();
  initCounters();
  initScrollReveal();
  handleScroll();
});
