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



const slides = document.querySelectorAll('.slide');
const buttons = document.querySelectorAll('.slider-btn');

let currentSlide = 0;
let slideInterval = setInterval(nextSlide, 5000);

let wishlist = localStorage.getItem('wishlist') ? JSON.parse(localStorage.getItem('wishlist')) : []
console.log(wishlist);

function addToWishlist(code, e) {
  console.log(code);
  let product = wishlist.find(e => e.code == code)
  if (product) {
    showToast('Product is already in wishlist!', 'info')
  } else {
    fetch('../database/data.json')
      .then(res => res.json())
      .then(res => {
        let product = res["phones"].find(e => e.code == code)
          || res["smartwatches"].find(e => e.code == code)
          || res["earbuds"].find(e => e.code == code)
          || res["laptops"].find(e => e.code == code)

        if (product) {
          e.classList.add('active')
          wishlist.push(product)
          localStorage.setItem('wishlist', JSON.stringify(wishlist))
          showToast('Product added to wishlist!', 'success')
        }
      })
  }
}

function nextSlide() {
  slides[currentSlide].classList.remove('active');
  buttons[currentSlide].classList.remove('active');
  currentSlide = (currentSlide + 1) % slides.length;
  slides[currentSlide].classList.add('active');
  buttons[currentSlide].classList.add('active');
}

buttons.forEach((button, index) => {
  button.addEventListener('click', () => {
    clearInterval(slideInterval);
    slides[currentSlide].classList.remove('active');
    buttons[currentSlide].classList.remove('active');
    currentSlide = index;
    slides[currentSlide].classList.add('active');
    buttons[currentSlide].classList.add('active');
    slideInterval = setInterval(nextSlide, 5000);
  });
});

const currentProductId = location.href.split('=')[1];

fetch('../database/data.json')
  .then(res => res.json())
  .then(data => {
    let allProducts = [];
    for (let category in data) {
      allProducts = allProducts.concat(data[category]);
    }

    const otherProducts = allProducts.filter(p => p.code !== currentProductId);

    //min memory
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

    const memoryValues = otherProducts
      .map(getSmallestMemoryValue)
      .filter(value => value !== null);

    let minMemory = null;
    if (memoryValues.length > 0) {
      minMemory = Math.min(...memoryValues);
      console.log('Smallest memory capacity (related products):', minMemory + ' GB');

      const memoryElement = document.getElementById('min-memory');
      if (memoryElement) {
        memoryElement.innerText = `Minimum Memory: ${minMemory} GB`;
      }
    }






    

    //Scrolling
    const shuffled = otherProducts.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 6);
    const container = document.getElementById('related-container');

    selected.forEach(prod => {
      container.innerHTML += `
        <div class="product-card" data-code="${prod.code}">
          <button class="wishlist-btn" onclick="addToWishlist('${prod.code}',this)"><i class="fa-solid fa-heart"></i></button>
          <div class="product-image">
            <img src="${prod.images[0]}" alt="${prod.model}">
          </div>
          <div class="product-name">${prod.model}</div>
          <div class="product-storage">
            <span class="ram">${Array.isArray(prod.ram) ? prod.ram[0] : prod.ram || ''}${prod.ram ? ' |' : ''}</span> 
            <span class="memory">${Array.isArray(prod.memory) ? prod.memory[0] : prod.memory || ''}</span>  
          </div>  
          <div class="product-price-scroll">$${prod.price}</div>
          <button class="buy-button" onclick="addToCart('${prod.code}',this)">Add Cart</button>
        </div>
      `;
    });

    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', function (e) {
        if (
          e.target.closest('.buy-button') ||
          e.target.closest('.wishlist-btn')
        ) return;

        const code = this.getAttribute('data-code');
        if (code) {
          window.location.href = 'product-page.html?id=' + code;
        }
      });
    });
  });

let cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []

function addToCart(code, e) {
  let product = cart.find(e => e.code == code)
  if (product) {
    showToast('Product is already in cart!', 'info')
  } else {
    fetch('../database/data.json')
      .then(res => res.json())
      .then(res => {
        let product = res["phones"].find(e => e.code == code)
          || res["smartwatches"].find(e => e.code == code)
          || res["earbuds"].find(e => e.code == code)
          || res["laptops"].find(e => e.code == code)

        if (product) {
          e.classList.add('active')
          product.count = 1
          console.log(product);
          cart.push(product)
          localStorage.setItem('cart', JSON.stringify(cart))
          showToast('Product added to cart!', 'success')
        }
      })
  }
}








// Toggle burger menu

document.querySelector('.burger-menu').onclick = function() {
    document.querySelector('.burger-dropdown').classList.toggle('active');
};