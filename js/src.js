let productData = {};
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

// Load product data
async function loadProductData() {
  try {
    const response = await fetch('./database/data.json');
    if (!response.ok) throw new Error('Network error');
    productData = await response.json();
  } catch (err) {
    console.error('Failed to load product data:', err);
  }
}

// Get all products
function getAllProducts() {
  const all = [];
  for (const category in productData) {
    productData[category].forEach(p => all.push({ ...p, category }));
  }
  return all;
}

// Filter products by search term
function filterProducts(query) {
  if (!query) return [];
  const term = query.toLowerCase();
  return getAllProducts().filter(p =>
    p.model.toLowerCase().includes(term) ||
    p.code.toLowerCase().includes(term) ||
    p.category.toLowerCase().includes(term)
  );
}

// Display results (max 5 with scroll)
function displayResults(products) {
  searchResults.innerHTML = '';

  if (products.length === 0) {
    searchResults.style.display = 'none';
    return;
  }

  products.slice(0, 26).forEach(product => {
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item';

    const imgSrc = (product.images?.[0]) || 'img/plaeholder.png';

    resultItem.innerHTML = `
      <div class="product-img">
        <img src="${imgSrc}" alt="${product.model}" onerror="this.src='img/placeholder.png'">
      </div>
      <div class="product-info">
        <div class="product-name">${product.model}</div>
        <div class="product-details">
          <span>$${product.price.toFixed(2)}</span>
          <span>ID: ${product.code}</span>
        </div>
      </div>
    `;

    resultItem.addEventListener('click', () => {
      window.location.href = `product-page.html?id=${product.code}`;
    });

    searchResults.appendChild(resultItem);
  });

  searchResults.style.display = 'block';
}



// Initialize search functionality
async function initSearch() {
  await loadProductData();

  searchInput.addEventListener('input', function () {
    const query = this.value.trim();
    if (query.length < 2) {
      searchResults.style.display = 'none';
      return;
    }

    const filtered = filterProducts(query);
    displayResults(filtered);
  });

  document.addEventListener('click', function (e) {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.style.display = 'none';
    }
  });

  searchInput.addEventListener('focus', function () {
    if (this.value.trim().length >= 2) {
      const filtered = filterProducts(this.value.trim());
      displayResults(filtered);
    }
  });
}

document.addEventListener('DOMContentLoaded', initSearch);
