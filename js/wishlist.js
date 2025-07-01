// Wishlist page with showToast notifications

// Add toast CSS
const styleElement = document.createElement('style');
styleElement.innerHTML = `
    .toast { 
        position: fixed; 
        top: 20px; 
        right: 20px; 
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
        color: white; 
        padding: 12px 24px; 
        border-radius: 8px; 
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); 
        font-size: 14px; 
        font-weight: 500; 
        z-index: 10000; 
        opacity: 0; 
        transform: translateX(100%); 
        transition: all 0.3s ease; 
        max-width: 300px; 
        word-wrap: break-word; 
    }
    .toast.show { 
        opacity: 1; 
        transform: translateX(0); 
    }
    .toast.success { 
        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); 
    }
    .toast.info { 
        background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); 
    }


`;
document.head.appendChild(styleElement);

// Toast notification function
function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// DOM elements and data
let main = document.getElementById('wishlist');
let wishlist_items = JSON.parse(localStorage.getItem('wishlist')) || [];

// Render wishlist items
function printItems() {
    main.innerHTML = "";
    if (wishlist_items.length > 0) {
        wishlist_items.forEach((elm) => {
            main.innerHTML += `<div class="product-card">
                <button class="wishlist-btn" onclick="removeItem('${elm.code}')"> <i class="fa-solid fa-circle-xmark" style="color: #666666;"></i> </button>
                <a href="../product-page.html?productId=${elm.code}">
                  <img src="${elm.images[0]}" alt="">
                </a>
                <h3>${elm.model}</h3>
                <div class="item-sku">${elm.ramSelected ? elm.ramSelected : (elm.ram && elm.ram[0] ? elm.ram[0] : '')} | ${elm.memorySelected ? elm.memorySelected : (elm.memory && elm.memory[0] ? elm.memory[0] : '')}</div>
                <div class="item-sku-code">${elm.code}</div>
                <p class="price">$ ${elm.price}</p>
                <button class="buy-now" onclick="addToCartFromWishlist('${elm.code}')">Add Cart</button>
            </div>`;
        });
    } else {
        main.innerHTML = `
          <div class="products-list" id="wishlistContainer">
            <p id="emptyMessage" class="empty">No items in wishlist.</p>
          </div>`;
    }
}

printItems();

// Remove item from wishlist
function removeItem(code) {
    wishlist_items = wishlist_items.filter((elm) => elm.code !== code);
    localStorage.setItem('wishlist', JSON.stringify(wishlist_items));
    printItems();

}

// Add item to cart from wishlist
function addToCartFromWishlist(code) {
    let cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];

    let product = wishlist_items.find(p => p.code === code);
    if (!product) return;

    let exists = cart.find(p => p.code === product.code);
    if (exists) {
        showToast('Product is already in cart', 'info');
        return;
    }

    let copy = {...product};
    copy.count = 1;

    cart.push(copy);
    localStorage.setItem('cart', JSON.stringify(cart));
    showToast('Product added to cart', 'success');
}













 // Toggle burger menu
document.querySelector('.burger-menu').onclick = function() {
    document.querySelector('.burger-dropdown').classList.toggle('active');
};