// ✅ product-details-page.js
import products from './product-api-list.js';

// Utility to generate clean slug
function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}
const slug = window.location.search.substring(1);
const product = products.find(p => {
  const productSlug = p.slug ? generateSlug(p.slug) : generateSlug(p.title);
  return productSlug === slug;
});

if (!product) {
  document.getElementById('product-title').textContent = "Product Not Found";
  document.getElementById('product-detail').innerHTML = '<p>Sorry, this product does not exist.</p>';
  throw new Error('Product not found');
} 
// Title
const titleEl = document.getElementById('product-title');
titleEl.textContent = product.heading || product.title; 

const pagehead = document.getElementById('newheading') 
pagehead.textContent = product.heading || product.title; 

// Rating
const ratingDiv = document.getElementById('product-rating');
const fullStars = Math.floor(product.ratingStars);
const halfStar = product.ratingStars % 1 >= 0.5;
let starsHtml = '';
for (let i = 0; i < fullStars; i++) {
  starsHtml += '<i class="fas fa-star"></i>';
}
if (halfStar) starsHtml += '<i class="fas fa-star-half-alt"></i>';
ratingDiv.innerHTML = `${starsHtml}<span> ${product.ratingStars} (${product.ratingReviews} reviews)</span>`;

// Price
const priceEl = document.getElementById('product-price');
priceEl.innerHTML = `<div class="new-price">MRP:- <span>${product.newPrice}</span></div>`; 

// Description & Features
const detailDiv = document.getElementById('product-detail');
let featureList = '<ul>';
product.features.forEach(f => {
  featureList += `<li>${f}</li>`;
});
featureList += '</ul>';

detailDiv.innerHTML = `
  <h2>Description</h2>
  <p>${product.description}</p>
  <h2>Features</h2>
  ${featureList}
`;

// Product Details Table
const tableDiv = document.getElementById('product-table');
tableDiv.innerHTML = `
  <h2>Product Details</h2>
  <table class="product-table">
    ${product.table.map(row => `<tr><td>${row.label}</td><td>${row.value}</td></tr>`).join('')}
  </table>
`;

// ✅ Image slider
let currentColor = product.colors[0];
let currentIndex = 0;
const imgShowcase = document.getElementById('img-showcase');
const colorSelectDiv = document.getElementById('color-select');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

function updateImages() {
  const imgs = product.images[currentColor];
  if (!imgs) return;
  imgShowcase.innerHTML = '';
  const img = document.createElement('img');
  img.src = imgs[currentIndex];
  img.alt = `${product.heading || product.title} - ${currentColor} - Image ${currentIndex + 1}`;
  imgShowcase.appendChild(img);
}

function updateActiveColorBtn(color) {
  const btns = colorSelectDiv.querySelectorAll('button.color-btn');
  btns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.color === color);
  });
}

// Build color buttons
toSelectColors(product.colors);
function toSelectColors(colors) {
  colorSelectDiv.innerHTML = '';
  colors.forEach((color, index) => {
    const btn = document.createElement('button');
    btn.className = `color-btn ${color}` + (index === 0 ? ' active' : '');
    btn.dataset.color = color;
    btn.textContent = color.charAt(0).toUpperCase() + color.slice(1);
    btn.addEventListener('click', () => {
      if (currentColor !== color) {
        currentColor = color;
        currentIndex = 0;
        updateActiveColorBtn(color);
        updateImages();
      }
    });
    colorSelectDiv.appendChild(btn);
  });
}

prevBtn.addEventListener('click', () => {
  const imgs = product.images[currentColor];
  currentIndex = (currentIndex - 1 + imgs.length) % imgs.length;
  updateImages();
});

nextBtn.addEventListener('click', () => {
  const imgs = product.images[currentColor];
  currentIndex = (currentIndex + 1) % imgs.length;
  updateImages();
});

updateImages();
// ✅ Title
document.title = product.mtitle;

// ✅ Description Meta Tag
let metaDescription = document.querySelector('meta[name="description"]');
if (!metaDescription) {
  metaDescription = document.createElement('meta');
  metaDescription.setAttribute('name', 'description');
  document.head.appendChild(metaDescription);
}
metaDescription.setAttribute('content', `${product.mdescription.slice(0, 160)}...`);

// ✅ Keywords Meta Tag
let metaKeywords = document.querySelector('meta[name="keywords"]');
if (!metaKeywords) {
  metaKeywords = document.createElement('meta');
  metaKeywords.setAttribute('name', 'keywords');
  document.head.appendChild(metaKeywords);
}
metaKeywords.setAttribute('content', product.keyword);


document.getElementById('meta-title-display').textContent = product.mtitle;
document.getElementById('meta-description-display').textContent = product.metaDescriptionContent;
document.getElementById('meta-keyword-display').textContent = product.keyword;

// ✅ Google SEO: Inject Product Structured Data (Schema.org JSON-LD)

const productSchema = {
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": product.title,
  "image": [
    `https://www.petroindustech.com${product.main_image}`,
    ...product.images[product.colors[0]].map(img => `https://www.petroindustech.com${img}`)
  ],
  "description": product.description,
  "sku": product.slug || product.id.toString(),
  "mpn": product.id.toString(),
  "brand": {
    "@type": "Brand",
    "name": "Petro Industech"
  },
  "review": {
    "@type": "Review",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": product.ratingStars.toString(),
      "bestRating": "5"
    },
    "author": {
      "@type": "Organization",
      "name": "Petro Industech"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": product.ratingStars.toString(),
    "reviewCount": product.ratingReviews.toString()
  },
  "offers": {
    "@type": "Offer",
    "url": window.location.href,
    "priceCurrency": "INR",
    "price": product.newPrice.replace("₹", ""),
    "priceValidUntil": "2025-12-31",
    "itemCondition": "https://schema.org/NewCondition",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Petro Industech"
    }
  }
};

// Inject to <head>
const schemaScript = document.createElement('script');
schemaScript.type = 'application/ld+json';
schemaScript.text = JSON.stringify(productSchema);
document.head.appendChild(schemaScript);

// ✅ Canonical URL (same as browser URL)
if (slug) {
  const canonicalUrl =
    `https://www.petroindustech.com/bath-products/product.html?${slug}`;

  const canonicalTag = document.getElementById("canonicalTag");
  if (canonicalTag) {
    canonicalTag.setAttribute("href", canonicalUrl);
  }
}
