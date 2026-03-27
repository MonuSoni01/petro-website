import products from './product-api-list.js';

const container = document.getElementById("product-sections");

// ===============================
// SELECTED PRODUCT IDs
// ===============================

const selectedProductIds = [48, 47, 45, 8, 10, 39, 36, 21];
// Example: [67, 66, 65, 64]

// ===============================
// SLUG GENERATOR
// ===============================

function generateSlug(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

// ===============================
// FILTER PRODUCTS BY ID
// ===============================

const productList = products.filter(product =>
    selectedProductIds.includes(product.id)
);

// ===============================
// RENDER PRODUCTS
// ===============================

function renderHomeProducts() {

    if (!container) return;

    const row = document.createElement("div");
    row.className = "row";

    productList.forEach(product => {

        const col = document.createElement("div");

        col.className =
            "col-lg-3 col-md-6 col-sm-6 mb-4";

        const cleanSlug = product.slug
            ? generateSlug(product.slug)
            : generateSlug(product.title);

        col.innerHTML = `

<a href="/bath-products/product.html?${cleanSlug}">

  <div class="product-card">

    <div class="product-image">

      <img
        src="${product.main_image}"
        alt="${product.title}"
        loading="lazy"
      >

    </div>

    <div class="product-info">

      <h5>
        ${product.title}
      </h5>

      <p class="price">

        MRP :- ${product.newPrice}

      </p>

    </div>

  </div>

</a>

`;

        row.appendChild(col);

    });

    container.appendChild(row);

}

renderHomeProducts();