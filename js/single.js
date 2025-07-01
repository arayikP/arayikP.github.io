// DOM elements
let productGallery = document.querySelector('.product-gallery');
let productInfo = document.querySelector('.product-info');
let specsTableRows = document.querySelectorAll('.specs-table');

// Product options and pricing elements
const productId = location.href.split('=')[1];
const storageOptions = document.querySelectorAll('.storage-options');
const memoryOptions = storageOptions[0].querySelectorAll('.storage-option');
const ramOptions = storageOptions[1].querySelectorAll('.storage-option');
const priceElement = document.querySelector('.current-price');
let basePrice = 0;
let currentProduct = null;
let productType = '';
let productCategory = '';

// Add CSS for option styling and toast notifications
const styleElement = document.createElement('style');
styleElement.innerHTML = `
    .thumbnail.active {
        border: 2px solid #3498db;
        box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
    }
    .thumbnail {
        cursor: pointer;
        transition: transform 0.2s;
    }
    .thumbnail:hover {
        transform: scale(1.05);
    }
    .storage-option.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background-color: #f0f0f0;
    }
    .storage-option.selected {
        border-color: black;
    }
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
    .toast.warning { 
        background: linear-gradient(135deg, rgb(241, 73, 6) 0%, rgb(252, 65, 13) 100%); 
    }
`;
document.head.appendChild(styleElement);

// Toast notification function
function showToast(message, type = 'info') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Show toast with animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Hide and remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Helper function to generate dynamic product code
function generateDynamicCode(baseCode, ramValue, memoryValue, productType) {
    // Only generate dynamic codes for phones, laptops, computers, smartwatches
    if (!['phones', 'laptops', 'computers', 'smartwatches'].includes(productType)) {
        return baseCode;
    }
    
    // Get the lowest options based on product type
    let lowestMemory = '';
    let lowestRam = '';
    
    if (productType === 'phones') {
        lowestMemory = '128GB';
        lowestRam = '8 GB';
    } else if (productType === 'laptops' || productType === 'computers') {
        lowestMemory = '128GB';
        lowestRam = '8 GB';
    } else if (productType === 'smartwatches') {
        lowestMemory = '64GB';
        lowestRam = '4 GB';
    }
    
    // If both are lowest options, return original code
    if (ramValue === lowestRam && memoryValue === lowestMemory) {
        return baseCode;
    }
    
    // Extract numeric values from RAM and memory
    const ramNum = ramValue ? ramValue.replace(/[^0-9]/g, '') : '';
    const memoryNum = memoryValue ? memoryValue.replace(/[^0-9]/g, '') : '';
    
    return baseCode + ramNum + memoryNum;
}

// Function to update URL with new product code
function updateURL(newCode) {
    const currentURL = new URL(window.location.href);
    currentURL.searchParams.set('productId', newCode);
    
    // Update URL without refreshing the page
    window.history.replaceState({}, '', currentURL.toString());
}

// Helper function to save current price to localStorage
function saveCurrentPrice() {
    const currentPrice = parseInt(priceElement.textContent.replace('$', ''));
    const selectedRam = Array.from(ramOptions).find(opt => opt.classList.contains('selected'));
    const selectedMemory = Array.from(memoryOptions).find(opt => opt.classList.contains('selected'));
    
    const ramValue = selectedRam && !selectedRam.classList.contains('disabled') ? selectedRam.textContent.trim() : '';
    const memoryValue = selectedMemory && !selectedMemory.classList.contains('disabled') ? selectedMemory.textContent.trim() : '';
    
    const dynamicCode = generateDynamicCode(productId, ramValue, memoryValue, productType);
    
    const priceData = {
        code: dynamicCode,
        price: currentPrice,
        ram: ramValue,
        memory: memoryValue,
        timestamp: Date.now()
    };
    
    localStorage.setItem(`product_price_${dynamicCode}`, JSON.stringify(priceData));
    
    // Update URL with new code
    updateURL(dynamicCode);
}

// Fetch product data
fetch('../database/data.json')
    .then(res => res.json())
    .then(res => {
        let prod;
        // Find the current product
        for (const key in res) {
            let foundProduct = res[key].find((elm) => elm.code == productId);
            if (foundProduct) {
                prod = foundProduct;
                currentProduct = foundProduct;
                productType = key;
                basePrice = foundProduct.price;
                break;
            }
        }
        
        // Initialize product display
        printGallery(prod.images);
        prodInfo(prod);
        setupProductOptions(productType, prod);
    });

function printGallery(images) {
    let gallery = productGallery.querySelector('.thumbnails');
    gallery.innerHTML = '';  
    
    // Create thumbnails
    images.forEach((e, i) => {
        gallery.innerHTML += `
            <div class="thumbnail${i === 0 ? ' active' : ''}">
                <img src="${e}" alt="Product Thumbnail">
            </div>`;
    });

    // Set main image
    let bigImg = document.querySelector('.main-image');
    bigImg.innerHTML = `<img src="${images[0]}" alt="Main Product Image">`;

    // Add click events to thumbnails
    const thumbnails = gallery.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
            bigImg.innerHTML = `<img src="${images[index]}" alt="Main Product Image">`;
            thumbnails.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
    });
}





















// get product info 
function prodInfo(prod) {
    // Set product title and price
    productInfo.querySelector('.product-title').innerHTML = prod.model;
    productInfo.querySelector('.current-price').innerHTML = prod.price + '$';

    productCategory = prod.category;

    // Set summary specs
    let spaces = productInfo.querySelectorAll('.spec-value');
    spaces[0].innerHTML = prod.screen.size;
    spaces[1].innerHTML = prod.processor.model;
    spaces[2].innerHTML = prod.processor.cores;
    spaces[3].innerHTML = prod.camera.rear;
    spaces[4].innerHTML = prod.camera.front;
    spaces[5].innerHTML = prod.battery;




    // Set detailed specs
    // Screen details
    let specsTableRowsDatas = specsTableRows[0].querySelectorAll('.specs-value');
    specsTableRowsDatas[0].innerHTML = prod.screen.size;
    specsTableRowsDatas[1].innerHTML = prod.screen.resolution;
    specsTableRowsDatas[2].innerHTML = prod.screen.refresh_rate + ' HZ';
    specsTableRowsDatas[3].innerHTML = prod.screen.pixel_density + ' ppi';
    specsTableRowsDatas[4].innerHTML = prod.screen.type;
    specsTableRowsDatas[5].innerHTML = prod.screen.touchscreen;

    // CPU details
    let cpuData = specsTableRows[1].querySelectorAll('.specs-value');
    cpuData[0].innerHTML = prod.processor.model;
    cpuData[1].innerHTML = prod.processor.cores;

    // Camera details
    let cameraData = specsTableRows[2].querySelectorAll('.specs-value');
    cameraData[0].innerHTML = prod.camera.rear;
    cameraData[1].innerHTML = prod.camera.front;

    // Storage details
    let storgeData = specsTableRows[3].querySelectorAll('.specs-value');
    storgeData[0].innerHTML = prod.ram.internal;
    storgeData[1].innerHTML = prod.memory.external;

    // General details
    let generalData = specsTableRows[4].querySelectorAll('.specs-value');
    generalData[0].innerHTML = prod.year;

    // Power details
    let powerData = specsTableRows[5].querySelectorAll('.specs-value');
    powerData[0].innerHTML = prod.battery;
    powerData[1].innerHTML = prod.battery_life;
    powerData[2].innerHTML = prod.charging;

    // Features details
    let featuresData = specsTableRows[6].querySelectorAll('.specs-value');
    featuresData[0].innerHTML = prod.features.noise_cancellation;
    featuresData[1].innerHTML = prod.features.wireless_charging;
    featuresData[2].innerHTML = prod.features.water_resistance;
}


















let wishlist = localStorage.getItem('wishlist') ? JSON.parse(localStorage.getItem('wishlist')) : []

function addToWishlist(code,e) {
    console.log(code);
    
    let finalCode = code;
    let ram, ramSelected, ramSelectedValue;
    let memory, memorySelected, memorySelectedValue;
    
    // Generate dynamic code for products with RAM/Memory options
    if (['laptop', 'smartwatch', 'phone'].includes(productCategory)){
        ram = document.getElementsByClassName("storage-options-ram");
        if (ram.length > 0) {
            ramSelected = ram[0].getElementsByClassName("selected");
            ramSelectedValue = ramSelected.length > 0 ? ramSelected[0].innerHTML : '';
        }

        memory = document.getElementsByClassName("storage-options-memory");
        if (memory.length > 0) {
            memorySelected = memory[0].getElementsByClassName("selected");
            memorySelectedValue = memorySelected.length > 0 ? memorySelected[0].innerHTML : '';
        }

        finalCode = generateDynamicCode(code, ramSelectedValue, memorySelectedValue, productType);
    }
    
    let product = wishlist.find(e => e.code == finalCode)
    if (product) {
        showToast('Product is already in wishlist', 'info')
    } else {
        fetch('../database/data.json')
            .then(res => res.json())
            .then(res => {
                let product = res["phones"].find(e => e.code == code)
                || res["smartwatches"].find(e => e.code == code)
                || res["earbuds"].find(e => e.code == code)
                || res["laptops"].find(e => e.code == code)
                
                // Create a copy of the product with updated code and price
                product = {...product};
                product.code = finalCode;

                // Get current price from localStorage if available
                const savedPriceData = localStorage.getItem(`product_price_${finalCode}`);
                if (savedPriceData) {
                    const priceData = JSON.parse(savedPriceData);
                    product.price = priceData.price;
                }

                if (['laptop', 'smartwatch', 'phone'].includes(productCategory)){
                    product.ramSelected = ramSelectedValue ? ramSelectedValue : product.ram[0];
                    product.memorySelected = memorySelectedValue ? memorySelectedValue : product.memory[0];
                }
                    
                wishlist.push(product)
                localStorage.setItem('wishlist', JSON.stringify(wishlist))
                e.classList.add('active')
                showToast('Product added to wishlist', 'success')
            })
    }
}










//  selects memory
function setupProductOptions(type, product) {
    priceElement.innerHTML = basePrice + '$';

    const storageContainer = document.querySelectorAll('.storage-options')[0];
    const ramContainer = document.querySelectorAll('.storage-options')[1];

    if (type === 'phones') {
        setupMemoryOptions(['128GB', '256GB', '512GB', '1TB'], storageContainer);
        setupRamOptions(['8 GB'], ramContainer);
    } else if (type === 'laptops' || type === 'computers') {
        setupMemoryOptions(['128GB', '256GB', '512GB', '1TB'], storageContainer);
        setupRamOptions(['8 GB', '16 GB', '32 GB'], ramContainer);
    } else if (type === 'smartwatches') {
        setupMemoryOptions(['64GB'], storageContainer);
        setupRamOptions(['4 GB'], ramContainer);
    } else {
        disableOptions(storageContainer);
        disableOptions(ramContainer);
    }

    selectLowestOptions();
    updateSpecsTable();
    // Save initial price
    setTimeout(() => {
        saveCurrentPrice();
    }, 100);
}


function setupMemoryOptions(allowedOptions, container) {
    const options = container.querySelectorAll('.storage-option');
    
    options.forEach(option => {
        const optionText = option.textContent.trim();
        if (allowedOptions.includes(optionText)) {
            option.classList.remove('disabled');
            option.addEventListener('click', handleMemoryClick);
        } else {
            option.classList.add('disabled');
        }
    });
}

function setupRamOptions(allowedOptions, container) {
    const options = container.querySelectorAll('.storage-option');
    
    options.forEach(option => {
        const optionText = option.textContent.trim();
        if (allowedOptions.includes(optionText)) {
            option.classList.remove('disabled');
            option.addEventListener('click', handleRamClick);
        } else {
            option.classList.add('disabled');
        }
    });
}

function disableOptions(container) {
    const options = container.querySelectorAll('.storage-option');
    options.forEach(option => {
        option.classList.add('disabled');
    });
    
    container.style.display = 'none';
    const label = container.previousElementSibling;
    if (label && label.classList.contains('storage-text')) {
        label.style.display = 'none';
    }
}

function selectLowestOptions() {
    const activeMemoryOptions = Array.from(memoryOptions).filter(opt => !opt.classList.contains('disabled'));
    if (activeMemoryOptions.length > 0) {
        memoryOptions.forEach(opt => opt.classList.remove('selected'));
        activeMemoryOptions[0].classList.add('selected');
    }
    
    // Select lowest RAM option
    const activeRamOptions = Array.from(ramOptions).filter(opt => !opt.classList.contains('disabled'));
    if (activeRamOptions.length > 0) {
        ramOptions.forEach(opt => opt.classList.remove('selected'));
        activeRamOptions[0].classList.add('selected');
    }
}







function handleMemoryClick(e) {
    if (e.target.classList.contains('disabled')) return;
    
    const currentSelected = Array.from(memoryOptions).find(opt => opt.classList.contains('selected'));
    if (currentSelected === e.target) return; 
    
    const allActive = Array.from(memoryOptions).filter(opt => !opt.classList.contains('disabled'));
    const oldIndex = allActive.indexOf(currentSelected);
    const newIndex = allActive.indexOf(e.target);
    
    const priceDifference = (newIndex - oldIndex) * 100;
    const currentPrice = parseInt(priceElement.textContent.replace('$', ''));
    const newPrice = currentPrice + priceDifference;
    
    priceElement.innerHTML = newPrice + '$';
    currentSelected.classList.remove('selected');
    e.target.classList.add('selected');
    
    updateSpecsTable();
    saveCurrentPrice();
}

function handleRamClick(e) {
    if (e.target.classList.contains('disabled')) return;
    
    // Get currently selected RAM option
    const currentSelected = Array.from(ramOptions).find(opt => opt.classList.contains('selected'));
    if (currentSelected === e.target) return; 
    
    // Get indices to calculate price difference
    const allActive = Array.from(ramOptions).filter(opt => !opt.classList.contains('disabled'));
    const oldIndex = allActive.indexOf(currentSelected);
    const newIndex = allActive.indexOf(e.target);
    
    // Calculate price 
    const priceDifference = (newIndex - oldIndex) * 100;
    const currentPrice = parseInt(priceElement.textContent.replace('$', ''));
    const newPrice = currentPrice + priceDifference;
    
    // Update UI
    priceElement.innerHTML = newPrice + '$';
    currentSelected.classList.remove('selected');
    e.target.classList.add('selected');
    
    // Update specs table
    updateSpecsTable();
    saveCurrentPrice();
}

// Updates the specs table 
function updateSpecsTable() {
    // Update memory and RAM in specs table
    const storageData = document.querySelectorAll('.specs-table')[3].querySelectorAll('.specs-value');
    
    // Get selected values
    const selectedRam = Array.from(ramOptions).find(opt => opt.classList.contains('selected'));
    const selectedMemory = Array.from(memoryOptions).find(opt => opt.classList.contains('selected'));
    
    // Update RAM value
    if (selectedRam && !selectedRam.classList.contains('disabled')) {
        storageData[0].innerHTML = selectedRam.textContent.trim();
    }
    
    // Update Memory value
    if (selectedMemory && !selectedMemory.classList.contains('disabled')) {
        storageData[1].innerHTML = selectedMemory.textContent.trim();
    }
}












// Scrolling
fetch('../database/data.json')
    .then(res => res.json())
    .then(data => {
        let allProducts = [];
        for (let category in data) {
            allProducts = allProducts.concat(data[category]);
        }

        const otherProducts = allProducts.filter(p => p.code !== productId);
        
        // Shuffle and select random products
        const shuffled = otherProducts.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 6); // 6 random products
        
        const container = document.getElementById('related-container');
        
        // Generate product cards
        selected.forEach(prod => {
            container.innerHTML += `
            <div class="product-card" data-code="${prod.code}">
                <!--<button class="wishlist-btn"  onclick="addToWishlist('${prod.code}',this)"><i class="fa-solid fa-heart"></i></button>-->
                <div class="product-image">
                    <img src="${prod.images[0]}" alt="${prod.model}">
                </div>
                
                <div class="product-name">${prod.model}</div>
                <div class="product-storage">
            <span class="ram">${Array.isArray(prod.ram) ? prod.ram[0] : prod.ram || ''}${prod.ram ? ' |' : ''}</span> 
            <span class="memory">${Array.isArray(prod.memory) ? prod.memory[0] : prod.memory || ''}</span>  
          </div>  
                <div class="product-price-scroll">$${prod.price}</div>
                <!--<button class="buy-button" onclick="addToCart('${prod.code}','${prod.category}',this)">Add Cart</button>-->
                <a class="buy-button" href="../product-page.html?productId=${prod.code}">View More</a>
            </div>
            `;
        });
        
        document.querySelectorAll('.product-image').forEach(card => {
            card.addEventListener('click', function(e) {
                // hetoyi hamar
                // if (
                //     e.target.closest('.buy-button') ||
                //     e.target.closest('.wishlist-btn')
                // ) return;
                
                const code = this.parentNode.getAttribute('data-code');
                if (code) {
                    window.location.href = 'product-page.html?id=' + code;
                }
            });
        });
    });

function addToCart(code, category, e) {
    
    // e.classList.toggle('active');

    let cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];

    let product;
    let finalCode = code;
    
    let ram, ramSelected, ramSelectedValue;
    let memory, memorySelected, memorySelectedValue;
    
    if (category === 'laptop' || category === 'smartwatch' || category === "phone"){
        ram = document.getElementsByClassName("storage-options-ram");
        ramSelected = ram[0].getElementsByClassName("selected");
        ramSelectedValue = ramSelected[0].innerHTML;

        memory = document.getElementsByClassName("storage-options-memory");
        memorySelected = memory[0].getElementsByClassName("selected");
        memorySelectedValue = memorySelected[0].innerHTML;

        // Generate dynamic code for products with RAM/Memory options
        finalCode = generateDynamicCode(code, ramSelectedValue, memorySelectedValue, productType);

        product = cart.find(e => e.code == finalCode);
    } else {
        product = cart.find(e => e.code == code);
    }

    if (product) {
        showToast('Product is already in cart', 'info');
        
        // let index = cart.findIndex(e => e.code == code)
        // cart.splice(index, 1)
        // localStorage.setItem('cart', JSON.stringify(cart))
    } else {
        fetch('../database/data.json')
            .then(res => res.json())
            .then(res => {
                let product = res["phones"].find(e => e.code == code)
                    || res["smartwatches"].find(e => e.code == code)
                    || res["earbuds"].find(e => e.code == code)
                    || res["laptops"].find(e => e.code == code);
                
                // Create a copy of the product with updated code and price
                product = {...product};
                product.code = finalCode;
                product.count = 1;

                // Get current price from localStorage if available
                const savedPriceData = localStorage.getItem(`product_price_${finalCode}`);
                if (savedPriceData) {
                    const priceData = JSON.parse(savedPriceData);
                    product.price = priceData.price;
                }

                if (category === 'laptop' || category === 'smartwatch' || category === "phone"){
                    product.ramSelected = ramSelectedValue ? ramSelectedValue : product.ram[0];
                    product.memorySelected = memorySelectedValue ? memorySelectedValue : product.memory[0];
                }
                
                cart.push(product);
                
                localStorage.setItem('cart', JSON.stringify(cart))
                showToast('Product added to cart', 'success')
            })
    }
}

let addCartBtn = document.getElementById('addCartBtn')
let addWishBtn = document.getElementById('addWishBtn')

addCartBtn.addEventListener('click',()=>{
    addToCart(productId, productCategory, addCartBtn)
})
addWishBtn.addEventListener('click',()=>{
    addToWishlist(productId,addWishBtn)
})














 // Toggle burger menu
document.querySelector('.burger-menu').onclick = function() {
    document.querySelector('.burger-dropdown').classList.toggle('active');
};