document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selections ---
    const cartIconLinks = document.querySelectorAll('.cart-icon-link');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const closeCartBtn = document.querySelector('.close-cart-btn');
    const cartOverlay = document.querySelector('.cart-overlay');
    const cartItemsContainer = document.querySelector('.cart-items');
    // Get total price element specific to the current page if multiple exist
    const cartTotalPriceElement = document.getElementById('cart-total-price') || document.getElementById('cart-total-price-about') || document.getElementById('cart-total-price-contact');
    const cartCountElements = document.querySelectorAll('.cart-count');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const productCards = document.querySelectorAll('.product-card');
    const checkoutBtn = document.querySelector('.checkout-btn');
    const cartEmptyMsg = document.querySelector('.cart-empty-message');

    const menuOpenBtn = document.querySelector('.open-menu-btn');
    const menuCloseBtn = document.querySelector('.close-menu-btn');
    const navMenu = document.querySelector('.nav__menu');
    const navContainer = document.querySelector('.nav__container');

    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    // --- Event Listeners ---
    if (cartIconLinks.length) {
        cartIconLinks.forEach(link => link.addEventListener('click', (e) => { e.preventDefault(); openCart(); }));
    }
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    if (addToCartButtons.length) {
        addToCartButtons.forEach(button => {
            button.addEventListener('click', () => {
                const id = button.dataset.id;
                const name = button.dataset.name;
                const price = parseFloat(button.dataset.price);
                const image = button.dataset.image;
                addToCart(id, name, price, image);
                button.textContent = 'Added!';
                setTimeout(() => { button.textContent = 'Add to Cart'; }, 1000);
            });
        });
    }

    if (categoryButtons.length) {
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.dataset.category;
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                filterProducts(category);
            });
        });
    }

    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (event) => {
            const target = event.target;
            const cartItemDiv = target.closest('.cart-item');
            if (!cartItemDiv) return;
            const id = cartItemDiv.dataset.id;

            if (target.classList.contains('quantity-increase') || target.closest('.quantity-increase')) {
                updateQuantity(id, 1);
            } else if (target.classList.contains('quantity-decrease') || target.closest('.quantity-decrease')) {
                updateQuantity(id, -1);
            } else if (target.classList.contains('remove-item-btn') || target.closest('.remove-item-btn')) {
                removeFromCart(id);
            }
        });
    }

    if (menuOpenBtn && menuCloseBtn && navMenu && navContainer) {
        menuOpenBtn.addEventListener('click', () => {
            navMenu.classList.add('active');
            navContainer.classList.add('nav-open');
        });
        menuCloseBtn.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navContainer.classList.remove('nav-open');
        });
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navContainer.classList.remove('nav-open');
                }
            });
        });
    }

    // --- Functions ---
    function openCart() {
        if (cartSidebar) cartSidebar.classList.add('active');
        if (cartOverlay) cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        if (cartSidebar) cartSidebar.classList.remove('active');
        if (cartOverlay) cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function addToCart(id, name, price, image) {
        const existingItemIndex = cart.findIndex(item => item.id === id);
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({ id, name, price, quantity: 1, image });
        }
        saveCart();
        updateCartUI();
        openCart();
    }

    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
        updateCartUI();
    }

    function updateQuantity(id, change) {
        const itemIndex = cart.findIndex(item => item.id === id);
        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;
            if (cart[itemIndex].quantity <= 0) {
                removeFromCart(id);
            } else {
                saveCart();
                updateCartUI();
            }
        }
    }

    function calculateTotal() {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    function calculateItemCount() {
        return cart.reduce((count, item) => count + item.quantity, 0);
    }

    function saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    }

    function updateCartUI() {
        if (!cartItemsContainer) return; // Exit if cart elements not on page

        renderCartItems();
        const totalPrice = calculateTotal();
        const totalCount = calculateItemCount();

        if (cartTotalPriceElement) cartTotalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
        if (cartCountElements) cartCountElements.forEach(el => el.textContent = totalCount);

        if (cartEmptyMsg && checkoutBtn) {
            if (cart.length === 0) {
                cartEmptyMsg.style.display = 'block';
                if (cartItemsContainer.contains(cartEmptyMsg)) { // ensure it's not added multiple times
                     // It's already there or will be added by renderCartItems
                } else {
                     cartItemsContainer.innerHTML = ''; // Clear other items
                     cartItemsContainer.appendChild(cartEmptyMsg);
                }
                checkoutBtn.disabled = true;
            } else {
                cartEmptyMsg.style.display = 'none';
                checkoutBtn.disabled = false;
            }
        }
    }

    function renderCartItems() {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = ''; // Clear previous items

        if (cart.length === 0) {
            if (cartEmptyMsg) {
                cartEmptyMsg.style.display = 'block';
                cartItemsContainer.appendChild(cartEmptyMsg);
            }
            return;
        }
        if (cartEmptyMsg) cartEmptyMsg.style.display = 'none';


        cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('cart-item');
            cartItemElement.dataset.id = item.id;
            cartItemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="price">$${item.price.toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button class="quantity-decrease" aria-label="Decrease quantity">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-increase" aria-label="Increase quantity">+</button>
                    </div>
                </div>
                <button class="remove-item-btn" aria-label="Remove item"><i class="fas fa-trash-alt"></i></button>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        });
    }

    function filterProducts(category) {
        if (!productCards.length) return;
        productCards.forEach(card => {
            const cardCategory = card.dataset.category;
            if (category === 'all' || cardCategory === category) {
                card.style.display = 'flex'; // Or 'block' based on your default
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Intersection Observer for general animated elements
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
    const animatedScrollElements = document.querySelectorAll(
        '.animated-section-item, .animated-section-content, .category-item, .brand-item, .footer-column, .footer-bottom, .need-help-content, .need-help-image-placeholder, .contact-content-wrapper, .special-offer-content, .special-offer-image-wrapper .drone-image, .hero, .categories, .products h2, .product-card, .ads-section, .features-section, .category-section, .brands-section, .newsletter-section, .newsletter-content-wrapper .form-group, .newsletter-content-wrapper .btn-subscribe, .newsletter-content-wrapper .newsletter-consent'
    );

    const intersectionCallback = (entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                let delay = 0;
                // Stagger specific groups
                if (entry.target.classList.contains('category-item') ||
                    entry.target.classList.contains('brand-item') ||
                    entry.target.classList.contains('footer-column') ||
                    entry.target.classList.contains('feature-item') ||
                    entry.target.classList.contains('product-card') ||
                    entry.target.closest('.special-offer-content')?.contains(entry.target) && !entry.target.classList.contains('special-offer-content') ||
                    entry.target.closest('.contact-content-wrapper')?.contains(entry.target) && !entry.target.classList.contains('contact-content-wrapper')) {

                    const parent = entry.target.parentNode;
                    // Filter to only count siblings of the same type for staggering index
                    const siblings = Array.from(parent.children).filter(child => child.classList.contains(entry.target.classList[0]));
                    const itemIndex = siblings.indexOf(entry.target);
                    delay = itemIndex * 0.08; // Stagger delay
                } else if (entry.target.classList.contains('footer-bottom') || entry.target.classList.contains('newsletter-content-wrapper') || entry.target.classList.contains('contact-content-wrapper')) {
                    delay = 0.3; // General delay for larger blocks
                } else if (entry.target.classList.contains('drone-image') || entry.target.classList.contains('need-help-image-placeholder')) {
                    delay = 0.2;
                }

                entry.target.style.transitionDelay = `${delay}s`;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    };
    const scrollObserver = new IntersectionObserver(intersectionCallback, observerOptions);
    animatedScrollElements.forEach(el => scrollObserver.observe(el));


    // Contact Page Specific JS
    const contactPageContainer = document.querySelector('.contact-page-container');
    if (contactPageContainer) {
        const shapes = contactPageContainer.querySelectorAll('.animated-background .animated-shape');
        shapes.forEach(shape => {
            shape.style.setProperty('--tx', `${Math.random() * 80 + 10}vw`);
            shape.style.setProperty('--ty', `${Math.random() * 80 + 10}vh`);
        });

        const animatedTexts = contactPageContainer.querySelectorAll('.animated-text');
        animatedTexts.forEach(text => {
            text.style.top = `${Math.random() * 80 + 5}%`; // Random top (5-85%)
            text.style.animationDuration = `${Math.random() * 15 + 20}s`; // Random speed (20-35s)
            // Make text start from random horizontal position initially for better spread
            text.style.transform = `translateX(${Math.random() * 100 - 50}vw)`;
        });

        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', function(event) {
                event.preventDefault();
                const name = document.getElementById('name').value.trim();
                const email = document.getElementById('email').value.trim();
                const message = document.getElementById('message').value.trim();
                if (!name || !email || !message) { alert('براہ کرم تمام ضروری خانے (*) پُر کریں۔'); return; }
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(email)) { alert('براہ کرم درست ای میل ایڈریس درج کریں۔'); return; }
                console.log('Contact Form:', { name, email, subject: document.getElementById('subject').value.trim(), message });
                alert('آپ کا پیغام موصول ہو گیا ہے!');
                contactForm.reset();
            });
        }
    }

    // Newsletter Form (general, ensure ID is unique or target more specifically if needed)
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]'); // More specific selector
            const consentCheckbox = newsletterForm.querySelector('input[type="checkbox"]');

            if (emailInput.value.trim() === '') { alert('Please enter your email address.'); return; }
            if (consentCheckbox && !consentCheckbox.checked) { alert('Please agree to subscribe.'); return; }
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(emailInput.value.trim())) { alert('Please enter a valid email.'); return; }

            console.log('Newsletter:', { email: emailInput.value, consent: consentCheckbox ? consentCheckbox.checked : true });
            alert('Thank you for subscribing!');
            newsletterForm.reset();
        });
    }

    // Set current year in footers
    const yearSpans = document.querySelectorAll('#currentYear, #currentYearAbout, #currentYearContact'); // Select all year spans
    if (yearSpans.length) {
        yearSpans.forEach(span => {
            if(span) span.textContent = new Date().getFullYear();
        });
    }

    // --- Initial UI Update ---
    updateCartUI(); // Initialize cart display
});