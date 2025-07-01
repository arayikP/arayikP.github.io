// CSS styles for toast notification
const toastStyles = `
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
    background: linear-gradient(135deg, #FF9800  0%, #F57C00 100%);
}

.toast.warning {
    background: linear-gradient(135deg,rgb(241, 73, 6) 0%,rgb(252, 65, 13) 100%);
}
`;

// Add CSS to document
const styleSheet = document.createElement('style');
styleSheet.textContent = toastStyles;
document.head.appendChild(styleSheet);

// Toast notification function
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

let products = document.getElementById('products');
let categoryCards = document.querySelectorAll('.category-card');
let wishlist = localStorage.getItem('wishlist') ? JSON.parse(localStorage.getItem('wishlist')) : [];

console.log(wishlist);

function addToWishlist(code, e) {
    console.log(code);
    let product = wishlist.find(e => e.code == code);
    if (product) {
        showToast('Product is already in wishlist!', 'info')
    } else {
        fetch('../database/data.json')
            .then(res => res.json())
            .then(res => {
                let product = res[slug].find(e => e.code == code);
                if (product) {
                    e.classList.add('active');
                    wishlist.push(product);
                    localStorage.setItem('wishlist', JSON.stringify(wishlist));
                    showToast('Product added to wishlist!', 'success');
                }
            });
    }
}

let slug = location.href.split('=')[1];
console.log(slug);

fetch('../database/data.json')
    .then(res => res.json())
    .then(res => printProducts(res[slug]));

function productItem(code, img, name, price, memory, ram) {

    let displayRam = Array.isArray(ram) ? ram[0] : (ram || '');
    let displayMemory = Array.isArray(memory) ? memory[0] : (memory || '');

    let storageHTML = `
        <div class="product-storage">
            ${displayRam ? `<span class="ram">${displayRam}</span>${displayMemory ? ' | ' : ''}` : ''}
            ${displayMemory ? `<span class="memory">${displayMemory}</span>` : ''}
        </div>  
    `;

    let productCard = document.createElement('div');
    productCard.classList.add('product-card');
    productCard.innerHTML = `
        <button class="wishlist-btn" onclick="addToWishlist('${code}',this)">
            <i class="fa-solid fa-heart"></i>
        </button>
        <a href="../product-page.html?productId=${code}">
            <img src="${img.startsWith('/') ? img : '/' + img}" alt="${name}">
        </a>
        <h3>${name}</h3>
        ${storageHTML}
        <p class="price">$ ${price}</p>
        <button class="buy-now" onclick="addToCart('${code}',this)">Add Cart</button>
    `;
    return productCard;
}

function printProducts(arr) {
    products.innerHTML = '';



    

    // min memory
    const getSmallestMemoryValue = (product) => {
        if (!product.memory) return null;
        if (Array.isArray(product.memory)) {
            const memoryValues = product.memory.map(memStr => {
                const memVal = parseInt(memStr);
                return isNaN(memVal) ? Infinity : memVal;
            });
            return Math.min(...memoryValues);
        } else {
            const memVal = parseInt(product.memory);
            return isNaN(memVal) ? Infinity : memVal;
        }
    };

    const memoryValues = arr.map(getSmallestMemoryValue).filter(v => v !== null);
    let minMemory = null;
    if (memoryValues.length > 0) {
        minMemory = Math.min(...memoryValues);
        // console.log('Smallest memory capacity:', minMemory + ' GB');

        const memoryElement = document.getElementById('min-memory');
        if (memoryElement) {
            memoryElement.innerText = `Minimum Memory: ${minMemory} GB`;
        }
    }

    arr.forEach((e) => {
        products.append(productItem(e.code, e.images[0], e.model, e.price, e.memory, e.ram));
    });
}

categoryCards.forEach((e) => {

    e.addEventListener('click', () => {
        // console.log(e.dataset.type);
        location.href = `Prod-category.html?category=${e.dataset.type}`;

        fetch('../database/data.json')
            .then(res => res.json())
            .then(res => printProducts(res[e.dataset.type]));
    });
});

let cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];

function addToCart(code, e) {
    let product = cart.find(e => e.code == code);

    if (product) {
        showToast('Product is already in cart!', 'info')
    } else {
        fetch('../database/data.json')
            .then(res => res.json())
            .then(res => {
                let product = res[slug].find(e => {
                    return e.code == code
                });
                
                if (product) {
                    e.classList.add('active');
                    product.count = 1;
                    cart.push(product);
                    localStorage.setItem('cart', JSON.stringify(cart));
                    showToast('Product added to cart!', 'success');
                }
            });
    }
}











 // Toggle burger menu
document.querySelector('.burger-menu').onclick = function() {
    document.querySelector('.burger-dropdown').classList.toggle('active');
};