


async function loadProducts() {
    try {
        const response = await fetch('http://localhost:3000/products');
        const products = await response.json();

        const container = document.getElementById('productsContainer');
        container.innerHTML = '';

        const bestSellers = products.filter(p => p.specialCategory === 'Best Sellers');
        const newArrivals = products.filter(p => p.specialCategory === 'New Arrivals');
        const otherCategories = {};

        products.forEach(product => {
                if (!otherCategories[product.category]) {
                    otherCategories[product.category] = [];
                }
                otherCategories[product.category].push(product);
            
        });

        // --- All Categories will use CAROUSEL now ---

        if (bestSellers.length > 0) {
            container.innerHTML += renderCategory('🔥 Best Sellers', bestSellers);
        }
        if (newArrivals.length > 0) {
            container.innerHTML += renderCategory('🆕 New Arrivals', newArrivals);
        }
        for (let category in otherCategories) {
            container.innerHTML += renderCategory(category, otherCategories[category]);
        }

    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function renderCategory(title, productsList) {
    return `
        <div class="fashion_section" style="margin-top: 50px;">
            <div class="container">
                
                <div style="
                    background: linear-gradient(to left, #2563eb, #1d4ed8); 
                    padding: 1px;
                    border-radius: 8px;
                    margin-bottom: 30px;
                    text-align: center;
                ">
                    <h1 class="fashion_taital" style="
                        font-size: 2.5rem; 
                        color: white; 
                        margin: 0;
                    ">
                        ${title}
                    </h1>
                </div>

                <div class="swiper-container" id="swiper-${title.replace(/\s+/g, '-')}">
                    <div class="swiper-wrapper">
                        ${productsList.map(product => `
                            <div class="swiper-slide">
                                <div class="box_main" id="product-${product._id}" style="
                                    padding: 10px; 
                                    background: white; 
                                    border-radius: 10px; 
                                    box-shadow: 0 0 10px rgba(0,0,0,0.1); 
                                    height: 100%; 
                                    min-height: 350px;
                                    display: flex;
                                    flex-direction: column;
                                    justify-content: space-between;
                                ">
                                    <div style="text-align: center;">
                                        <h4 class="shirt_text" style="font-size: 1rem;">${product.name}</h4>
                                        <p class="price_text" style="font-size: 0.9rem;">Price <span style="color: #262626;">$${product.price}</span></p>
                                    </div>
                                    <div class="tshirt_img" style="height: 140px; overflow: hidden; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                                        <img src="http://localhost:3000/${product.mainImageUrl}" alt="${product.name}" style="max-height: 100%; width: auto;">
                                    </div>
                                    <div class="btn_main mt-2" style="text-align:center;">
                                        <button class="add-to-cart-button btn btn-primary btn-sm" onclick="initCart('${product._id}')">Add to Cart</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Arrows -->
                    <div class="swiper-button-next"></div>
                    <div class="swiper-button-prev"></div>

                    <div class="swiper-pagination"></div>
                </div>
            </div>
        </div>
    `;
}












function renderSection(title, productsList) {
    return `
        <div class="fashion_section">
            <h2 class="fashion_taital">${title}</h2>
            <div class="row">
                ${productsList.map(product => `
                    <div class="col-lg-4 col-sm-6 mb-4">
                        <div class="box_main" id="product-${product._id}">
                            <h4 class="shirt_text">${product.name}</h4>
                            <p class="price_text">Price: $${product.price}</p>
                            <div class="tshirt_img">
                                <img src="http://localhost:3000/${product.mainImageUrl}" alt="${product.name}" style="max-height:300px;">
                            </div>
                            <div class="btn_main">
                                <button class="add-to-cart-button" onclick="initCart('${product._id}')">Add to Cart</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}



function initializeSwipers() {
    document.querySelectorAll('.swiper-container').forEach(container => {
        new Swiper(container, {
            slidesPerView: 3,
            spaceBetween: 20,
            loop: true,
            centeredSlides: false,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            },
            navigation: {
                nextEl: container.querySelector('.swiper-button-next'),
                prevEl: container.querySelector('.swiper-button-prev'),
            },
            pagination: {
                el: container.querySelector('.swiper-pagination'),
                clickable: true,
            },
            breakpoints: {
                0: { slidesPerView: 1 },
                576: { slidesPerView: 2 },
                992: { slidesPerView: 3 },
            }
        });
    });
}




// Call it
(async function() {
    await loadProducts();
    initializeSwipers();
})();

async function loadCategories() {
    try {
        const response = await fetch('http://localhost:3000/categories');
        const categories = await response.json();

        const catContainer = document.getElementById('categoryLinks');
        catContainer.innerHTML = `<a href="index.html">Home</a>`;

        categories.forEach(category => {
            const catName = encodeURIComponent(category.name); // Important!
            catContainer.innerHTML += `<a href="category.html?cat=${catName}">${category.name}</a>`;
        });

    } catch (error) {
        console.error('Error loading categories:', error);
    }
}


// Call it
loadCategories();


function addToCart(productId, qty = 1) {
    let cart = JSON.parse(localStorage.getItem('cart')) || {};

    if (cart[productId]) {
        cart[productId] += qty;
    } else {
        cart[productId] = qty;
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert('✅ Product added to cart!');
}
function initCart(productId) {
    // When first clicked "Add to Cart"
    let cart = JSON.parse(localStorage.getItem('cart')) || {};
    cart[productId] = 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateProductCard(productId);
}

function updateCart(productId, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || {};

    if (!cart[productId]) {
        cart[productId] = 0;
    }

    cart[productId] += change;

    if (cart[productId] <= 0) {
        delete cart[productId];
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    updateCartCount(); // Update cart icon
    loadCart();        // Refresh cart page items
    updateProductCard(productId); // Refresh quantity on product card
}



async function updateProductCard(productId) {
    const container = document.getElementById(`product-${productId}`);
    if (!container) return;

    const cart = JSON.parse(localStorage.getItem('cart')) || {};
    const qty = cart[productId] || 0;

    if (qty === 0) {
        container.querySelector('.btn_main').innerHTML = `
            <button class="add-to-cart-button" onclick="initCart('${productId}')">Add to Cart</button>
        `;
    } else {
        container.querySelector('.btn_main').innerHTML = `
            <div class="quantity-controls">
                <button onclick="updateCart('${productId}', -1)">➖</button>
                <span id="qty-${productId}">${qty}</span>
                <button onclick="updateCart('${productId}', 1)">➕</button>
            </div>
        `;
    }
}
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || {};
    let totalItems = 0;
    for (let id in cart) {
        totalItems += cart[id];
    }
    document.getElementById('cart-count').innerText = totalItems;
}
async function loadCart() {
    console.log('🔵 Loading cart...');

    const cartContainer = document.getElementById('cartItems');
    if (!cartContainer) {
        console.warn('⚠️ No cart container found. Skipping loadCart.');
        return; // Don't continue if we are not on cart page
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || {};
    console.log('🛒 Cart loaded from localStorage:', cart);

    const response = await fetch('http://localhost:3000/products');
    const products = await response.json();
    console.log('📦 Products fetched from server:', products);

    let total = 0;
    cartContainer.innerHTML = '';

    const cartIds = Object.keys(cart);
    console.log('🆔 Cart product IDs:', cartIds);

    for (let cartId of cartIds) {
        console.log(`🔍 Searching for product with id: ${cartId}`);

        const product = products.find(p => p._id.toString() == cartId.toString());

        if (!product) {
            console.warn(`⚠️ No product found for id: ${cartId}`);
        } else {
            console.log('✅ Found product:', product);

            const quantity = cart[cartId];
            const subtotal = quantity * product.price;
            total += subtotal;

            console.log(`➕ Adding product to cart view: ${product.name}, quantity: ${quantity}, subtotal: ${subtotal}`);

            cartContainer.innerHTML += `
                <div class="cart-item">
                    <img src="http://localhost:3000/${product.mainImageUrl}" alt="${product.name}">
                    <div>
                        <h3>${product.name}</h3>
                        <p>Price: $${product.price}</p>
                        <p>Quantity: ${quantity}</p>
                        <p>Subtotal: $${subtotal}</p>
                    </div>
                </div>
            `;
        }
    }

    console.log('💰 Final total:', total);

    document.getElementById('cartTotal').innerText = `Total: $${total.toFixed(2)}`;

    console.log('✅ Cart rendering finished.');
}





// Call it when page loads
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount(); // show correct cart count in header
    loadCart();        // show cart items on cart.html
});


