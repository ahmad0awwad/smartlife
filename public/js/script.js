

let allProducts = [];
async function loadProducts() {
    try {
        const response = await fetch('http://localhost:3000/products');
        const products = await response.json();
allProducts = products;
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
        const cart = JSON.parse(localStorage.getItem('cart')) || {};
        Object.keys(cart).forEach(productId => updateProductCard(productId));

    } catch (error) {
        console.error('Error loading products:', error);
    }// After all renderCategory(...) calls
const cart = JSON.parse(localStorage.getItem('cart')) || {};

setTimeout(() => {
  Object.keys(cart).forEach(productId => {
    console.log('⏳ Delayed updateProductCard for:', productId);
    updateProductCard(productId);
  });
}, 0); // Delay just 1 frame to allow DOM to render

}

document.getElementById('searchInput').addEventListener('input', function() {
    const query = this.value.trim().toLowerCase();
    const resultsDiv = document.getElementById('searchResults');

    if (query === '') {
        resultsDiv.style.display = 'none';
        resultsDiv.innerHTML = '';
        return;
    }

    const filtered = allProducts.filter(product => 
        product.name.toLowerCase().includes(query)
    );

    if (filtered.length > 0) {
        resultsDiv.innerHTML = filtered.map(p => `
            
            <a href="product.html?id=${p._id}" style="text-decoration:none; color:inherit;">
                <div style="display:flex; align-items:center; margin-bottom:10px;">
                    <img src="${p.mainImageUrl}" style="width:50px; height:50px; object-fit:cover; margin-right:10px; border-radius:5px;">
                    <span style="font-size:1rem; color:#333;">${p.name}</span>
                </div>
            </a>
        `).join('');
        resultsDiv.style.display = 'block';
    } else {
        resultsDiv.innerHTML = '<p style="color:gray;">No matching products found.</p>';
        resultsDiv.style.display = 'block';
    }
});



// function renderCategory(title, productsList) {
//     return `
//         <div class="fashion_section" style="margin-top: 50px;">
//             <div class="container">
                
//                 <div style="
//                     background: linear-gradient(to left, #2563eb, #1d4ed8); 
//                     padding: 1px;
//                     border-radius: 8px;
//                     margin-bottom: 30px;
//                     text-align: center;
//                 ">
//                     <h1 class="fashion_taital" style="
//                         font-size: 2.5rem; 
//                         color: white; 
//                         margin: 0;
//                     ">
//                         ${title}
//                     </h1>
//                 </div>

//                 <div class="swiper-container" id="swiper-${title.replace(/\s+/g, '-')}">
//                     <div class="swiper-wrapper">
//                         ${productsList.map(product => `
//                             <div class="swiper-slide">
//                                 <div class="box_main" id="product-${product._id}" style="
//                                     padding: 10px; 
//                                     background: white; 
//                                     border-radius: 10px; 
//                                     box-shadow: 0 0 10px rgba(0,0,0,0.1); 
//                                     height: 100%; 
//                                     min-height: 350px;
//                                     display: flex;
//                                     flex-direction: column;
//                                     justify-content: space-between;
//                                 ">
//                                     <div style="text-align: center;">
//                                         <h4 class="shirt_text" style="font-size: 1rem;">${product.name}</h4>
//                                         <p class="price_text" style="font-size: 0.9rem;">Price <span style="color: #262626;">$${product.price}</span></p>
//                                     </div>
//                                     <div class="tshirt_img" style="height: 140px; overflow: hidden; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
//                                         <img src="http://localhost:3000/${product.mainImageUrl}" alt="${product.name}" style="max-height: 100%; width: auto;">
//                                     </div>
//                                     <div class="btn_main mt-2" style="text-align:center;">
//                                         <button class="add-to-cart-button btn btn-primary btn-sm" onclick="initCart('${product._id}')">Add to Cart</button>
//                                     </div>
//                                 </div>
//                             </div>
//                         `).join('')}
//                     </div>

//                 </div>
//             </div>
//         </div>
//     `;
// }
// function renderCategory(title, productsList) {
//   const id = title.replace(/\s+/g, '-').toLowerCase(); // safe swiper ID

//   return `
//     <div class="fashion_section" style="margin-top: 50px;">
//       <div class="container">
//         <div style="
//           background: linear-gradient(to left, #2563eb, #1d4ed8); 
//           padding: 1px;
//           border-radius: 8px;
//           margin-bottom: 30px;
//           text-align: center;
//         ">
//           <h1 class="fashion_taital" style="
//             font-size: 2rem; 
//             color: white; 
//             margin: 0;
//             padding: 10px 0;
//           ">
//             ${title}
//           </h1>
//         </div>

//         <div class="swiper-container" id="swiper-${id}">
//           <div class="swiper-wrapper">
//             ${productsList.map(product => `
//               <div class="swiper-slide">
//                 <div style="
//                   display: flex; 
//                   flex-direction: column; 
//                   align-items: center; 
//                   width: 180px; 
//                   padding: 8px; 
//                   text-align: center;
//                 ">
//                   <a href="product.html?id=${product._id}" style="text-decoration: none; color: inherit; width: 100%;">
//                     <div style="
//                       width: 160px;
//                       height: 160px;
//                       overflow: hidden;
//                       display: flex;
//                       align-items: center;
//                       justify-content: center;
//                       margin-bottom: 6px;
//                     ">
//                       <img src="http://localhost:3000/${product.mainImageUrl}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">
//                     </div>
//                     <div style="min-height: 36px; margin-bottom: 2px;">
//                       <span style="font-size: 14px; font-weight: 500; line-height: 1.2;">${product.name}</span>
//                     </div>
//                     <div style="font-size: 15px; color: #B12704; font-weight: bold; margin-bottom: 4px;">
//                       $${product.price}
//                     </div>
//                   </a>
//                   <button onclick="initCart('${product._id}'); event.stopPropagation(); return false;" 
//                     class="btn btn-primary btn-sm"
//                     style="border-radius: 20px; width: 100%; font-size: 13px; padding: 4px 0;">
//                     Add to Cart
//                   </button>
//                 </div>
//               </div>
//             `).join('')}
//           </div>

//           <!-- Optional: navigation -->
//           <div class="swiper-button-prev swiper-button-prev-${id}"></div>
//           <div class="swiper-button-next swiper-button-next-${id}"></div>
//           <div class="swiper-pagination swiper-pagination-${id}"></div>
//         </div>
//       </div>
//     </div>
//   `;
// }
function renderCategory(title, productsList) {
    const id = title.replace(/\s+/g, '-').toLowerCase();
  
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
              font-size: 2rem; 
              color: white; 
              margin: 0;
              padding: 10px 0;
            ">
              ${title}
            </h1>
          </div>
  
          <div class="swiper-container" id="swiper-${id}">
            <div class="swiper-wrapper">
              ${productsList.map(product => `
                <div class="swiper-slide">
                  <div id="product-${product._id}" style="
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    width: 180px; 
                    padding: 8px; 
                    text-align: center;
                  ">
                    <a href="product.html?id=${product._id}" style="text-decoration: none; color: inherit; width: 100%;">
                      <div style="
                        width: 160px;
                        height: 160px;
                        overflow: hidden;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-bottom: 6px;
                      ">
                        <img src="http://localhost:3000/${product.mainImageUrl}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">
                      </div>
                      <div style="min-height: 36px; margin-bottom: 2px;">
                        <span style="font-size: 14px; font-weight: 500; line-height: 1.2;">${product.name}</span>
                      </div>
                      <div style="font-size: 15px; color: #B12704; font-weight: bold; margin-bottom: 4px;">
                        $${product.price}
                      </div>
                    </a>
                    <div class="btn_main" style="width: 100%;">
                      <button onclick="addToCart('${product._id}'); event.stopPropagation(); return false;" 
                        class="btn btn-primary btn-sm"
                        style="border-radius: 20px; width: 100%; font-size: 13px; padding: 4px 0;">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
  

            <div class="swiper-pagination swiper-pagination-${id}"></div>
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
                                <img src="http://localhost:3000/${product.mainImageUrl}" alt="${product.name}"  style="max-height: 100%; max-width: 100%; object-fit: contain;">
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
            loop: false,
            watchOverflow: true,
            centeredSlides: false,
            spaceBetween: 20,
            slidesPerView: 3,
            slidesPerGroup: 3,
          
            // ✅ Add these for smoother swiping
            speed: 400, // default is 300ms – slightly slower = smoother
            resistanceRatio: 0.85, // less "rubber band" at edges
            threshold: 10, // required drag distance to trigger slide
            touchRatio: 1, // responsiveness to swiping
            touchAngle: 45, // degrees — ignore diagonal swipes
          
            autoplay: {
              delay: 10000,
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
              0: {
                slidesPerView: 1,
                slidesPerGroup: 1
              },
              576: {
                slidesPerView: 3,
                slidesPerGroup: 3
              },
              768: {
                slidesPerView: 3,
                slidesPerGroup: 3
              },
              1200: {
                slidesPerView: 3,
                slidesPerGroup: 3
              }
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
        // catContainer.innerHTML = `<a href="index.html">Home</a>`;

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

    // ✅ Fixes:
    updateCartCount();               // show updated icon count
    updateProductCard(productId);    // swap button for quantity UI

}

function initCart(productId) {
    console.log('🟢 initCart triggered for', productId);
  
    let cart = JSON.parse(localStorage.getItem('cart')) || {};
    cart[productId] = 1;
    localStorage.setItem('cart', JSON.stringify(cart));
  
    updateCartCount();              // 👈 missing before
    updateProductCard(productId);
    alert('✅ Product added to cart!');
  }
  

function updateCart(productId, change) {
    console.log(`🟡 updateCart() ➤ productId: ${productId}, change: ${change}`);
  
    let cart = JSON.parse(localStorage.getItem('cart')) || {};
    const currentQty = cart[productId] || 0;
    console.log(`📦 updateCart ➤ Current Qty: ${currentQty}`);
  
    cart[productId] = currentQty + change;
    if (cart[productId] <= 0) {
      console.log(`❌ updateCart ➤ Qty <= 0 ➤ Removing ${productId}`);
      delete cart[productId];
    }
  
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log(`💾 updateCart ➤ Cart Saved:`, cart);
  
    updateCartCount();
  
    const container = document.getElementById(`product-${productId}`);
    const qtySpan = document.getElementById(`qty-${productId}`);
    console.log(`🔍 updateCart ➤ container:`, container);
    console.log(`🔍 updateCart ➤ qtySpan:`, qtySpan);
  
    if (container && qtySpan) {
      const newQty = cart[productId] || 0;
      if (newQty === 0) {
        console.log(`🔁 updateCart ➤ Qty now 0 ➤ Re-render full button`);
        updateProductCard(productId);
      } else {
        qtySpan.textContent = newQty;
        console.log(`✅ updateCart ➤ Updated qty span to: ${newQty}`);
      }
    } else {
      console.warn(`⚠️ updateCart ➤ qtySpan missing ➤ Forcing full re-render`);
      updateProductCard(productId);
    }
  
    if (document.getElementById('cartItems')) {
      console.log('🛒 updateCart ➤ On cart page ➤ Refreshing cart UI');
      loadCart();
    }
  }
  
  




  function updateProductCard(productId) {
    console.log(`🛠️ updateProductCard() ➤ Product ID: ${productId}`);
  
    const container = document.getElementById(`product-${productId}`);
    if (!container) {
      console.warn(`❌ updateProductCard ➤ container NOT FOUND for #product-${productId}`);
      return;
    }
    console.log(`✅ updateProductCard ➤ Found container for #product-${productId}`);
  
    const cart = JSON.parse(localStorage.getItem('cart')) || {};
    const qty = cart[productId] || 0;
    console.log(`📦 updateProductCard ➤ Qty in cart: ${qty}`);
  
    const btnContainer = container.querySelector('.btn_main');
    if (!btnContainer) {
      console.warn(`❌ updateProductCard ➤ .btn_main NOT FOUND inside #product-${productId}`);
      return;
    }
    console.log(`✅ updateProductCard ➤ Found .btn_main inside #product-${productId}`);
  
    if (qty === 0) {
      console.log(`🔁 updateProductCard ➤ Rendering: Add to Cart Button`);
      btnContainer.innerHTML = `
      <button class="add-to-cart-button btn btn-sm btn-primary" style="width: 100%;" onclick="addToCart('${productId}'); event.stopPropagation(); return false;">
        Add to Cart
      </button>
    `;
    
    } else {
      console.log(`🔁 updateProductCard ➤ Rendering: Quantity Controls`);
      btnContainer.innerHTML = `
        <div class="quantity-controls d-flex justify-content-between align-items-center">
          <button class="btn btn-sm btn-danger" onclick="updateCart('${productId}', -1)">➖</button>
          <span id="qty-${productId}">${qty}</span>
          <button class="btn btn-sm btn-success" onclick="updateCart('${productId}', 1)">➕</button>
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
    const headerCart = document.getElementById('cart-count');
    const floatingCart = document.getElementById('floating-cart-count');
    if (headerCart) headerCart.innerText = totalItems;
    if (floatingCart) floatingCart.innerText = totalItems;
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
    updateCartCount();

    console.log('💰 Final total:', total);

    document.getElementById('cartTotal').innerText = `Total: $${total.toFixed(2)}`;

    console.log('✅ Cart rendering finished.');
}







document.addEventListener('DOMContentLoaded', () => {
    updateCartCount(); 
    loadCart();
    // Loop through all products on the page and update UI
    const cart = JSON.parse(localStorage.getItem('cart')) || {};
    Object.keys(cart).forEach(productId => {
        updateProductCard(productId);
    });

    const userPhone = localStorage.getItem('userPhone');
    if (userPhone) {
        const loginLink = document.querySelector('.login_menu a[href$="auth.html"]');
        if (loginLink) {
            const loginText = loginLink.querySelector('.padding_10');
            if (loginText) loginText.textContent = 'My Account';
            loginLink.href = '/account.html';
        }

        const sideNavLink = document.querySelector('#mySidenav a[href$="auth.html"]');
        if (sideNavLink) {
            sideNavLink.textContent = 'My Account';
            sideNavLink.href = '/account.html';
        }
    }
});



