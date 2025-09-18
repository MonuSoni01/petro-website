import products from './product-api-list.js';

const container = document.getElementById("product-sections");
const loadMoreBtn = document.getElementById("loadMoreBtn");

let currentIndex = 0;
const productsPerLoad = 20;
const initialLoad = 20;

// Slugify function for SEO-friendly slug generation
function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');        // Replace multiple - with single -
}

function renderProducts(start, end) {
  const row = document.createElement("div");
  row.className = "row";

  const chunk = products.slice(start, end);
  chunk.forEach(product => {
    const col = document.createElement("div");
    col.className = "col-lg-3 col-md-6 mt-4";

    // Generate clean slug automatically if not present
    // Use clean slug only in URL
const cleanSlug = product.slug
    ? generateSlug(product.slug)
    : generateSlug(product.title);

col.innerHTML = `
<a href="/bath-products/product.html?${cleanSlug}">
  <div class="product-card text-center">
    ${
      product.main_video
        ? `<video width="100%" autoplay muted loop>
             <source src="${product.main_video}" type="video/mp4" />
           </video>`
        : `<img src="${product.main_image}" alt="${product.title}" class="img-fluid" />`
    }
    <h5 class="mt-3">${product.title}</h5>
    <p>MRP :- ${product.newPrice}</p>
  </div>
</a>
`;




    row.appendChild(col);
  });

  container.appendChild(row);
}

// Initial Load
renderProducts(0, initialLoad);
currentIndex = initialLoad;

// Load More Button Functionality
loadMoreBtn.addEventListener("click", () => {
  renderProducts(currentIndex, currentIndex + productsPerLoad);
  currentIndex += productsPerLoad;

  if (currentIndex >= products.length) {
    loadMoreBtn.style.display = "none"; // Hide when all products are loaded
  }
});
