import products from './product-api-list.js';

const container = document.getElementById("product-sections");
const loadMoreBtn = document.getElementById("loadMoreBtn");

// ========================================
// STAINLESS STEEL PRODUCTS FILTER
// ========================================

const productList = products.filter(
  product => product.category === "stainless-steel"
);

let currentIndex = 0;

const productsPerLoad = 20;
const initialLoad = 20;


// ========================================
// SEO FRIENDLY SLUG
// ========================================

function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}


// ========================================
// RENDER PRODUCTS
// ========================================

function renderProducts(start, end) {

  const chunk = productList.slice(start, end);

  // Agar koi product nahi hai
  if (chunk.length === 0) {
    return;
  }

  const row = document.createElement("div");
  row.className = "row";

  chunk.forEach(product => {

    const col = document.createElement("div");

    col.className = "col-lg-3 col-md-6 mt-4";

    const cleanSlug = product.slug
      ? generateSlug(product.slug)
      : generateSlug(product.title);


    // ========================================
    // PRODUCT CARD
    // ========================================

    col.innerHTML = `
      <a href="/bath-products/product.html?${cleanSlug}">

        <div class="product-card text-center">

          ${
            product.main_video
              ? `
                <video
                  width="100%"
                  autoplay
                  muted
                  loop
                  playsinline
                >
                  <source
                    src="${product.main_video}"
                    type="video/mp4"
                  />
                </video>
              `
              : `
                <img
                  src="${product.main_image}"
                  alt="${product.title}"
                  class="img-fluid"
                  loading="lazy"
                />
              `
          }

          <h5 class="mt-3">
            ${product.title}
          </h5>

          <p>
            MRP :- ${product.newPrice || "Price on Request"}
          </p>

        </div>

      </a>
    `;

    row.appendChild(col);

  });

  container.appendChild(row);
}


// ========================================
// INITIAL LOAD
// ========================================

renderProducts(0, initialLoad);

currentIndex = initialLoad;


// Hide button if products <= 20
if (productList.length <= initialLoad) {
  loadMoreBtn.style.display = "none";
}


// ========================================
// LOAD MORE
// ========================================

loadMoreBtn.addEventListener("click", () => {

  renderProducts(
    currentIndex,
    currentIndex + productsPerLoad
  );

  currentIndex += productsPerLoad;

  if (currentIndex >= productList.length) {
    loadMoreBtn.style.display = "none";
  }

});