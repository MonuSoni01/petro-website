
import products from './product-api-list.js';

/* ==========================================
   PETRO PRODUCT CATALOGUE
   Complete Catalogue JavaScript
========================================== */

const $ = id => document.getElementById(id);

const productList = Array.isArray(products) ? products : [];

const state = {
    query: '',
    category: 'all',
    sort: 'featured',
    limit: 12,
    view: 'grid',
    favorites: new Set()
};

const PRODUCTS_PER_PAGE = 12;

const labels = {
    'stainless-steel': 'Stainless Steel',
    'acrylic': 'Acrylic',
    'aluminium': 'Aluminium',
    'aluminum': 'Aluminium',
    'brass': 'Brass',
    'mild-steel': 'Mild Steel',
    'nylon-sleeves': 'Nylon Sleeves',
    'hardware': 'Hardware'
};

const categorySymbols = {
    'stainless-steel': '◉',
    'acrylic': '◇',
    'aluminium': '▱',
    'aluminum': '▱',
    'brass': '✦',
    'mild-steel': '▤',
    'nylon-sleeves': '♧',
    'hardware': '⚙'
};

const popular = [
    'Toilet Paper Holder',
    'Soap Dispenser',
    'Towel Rack',
    'SS-1251',
    'Glass Shelf',
    'Liquid Dispenser'
];

/* ==========================================
   HELPER FUNCTIONS
========================================== */

const norm = value =>
    String(value ?? '')
        .toLowerCase()
        .trim();

const titleCase = value =>
    String(value ?? '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());

const label = value =>
    labels[value] || titleCase(value || 'Products');

const safe = value =>
    String(value ?? '').replace(
        /[&<>"']/g,
        char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[char]
    );

const price = product => {
    const raw = product.newPrice ?? product.price ?? 0;

    return Number(
        String(raw).replace(/[^\d.]/g, '')
    ) || 0;
};

const rating = product =>
    Math.max(
        0,
        Math.min(5, Number(product.ratingStars) || 0)
    );

const reviews = product =>
    Number(
        String(product.ratingReviews || 0)
            .replace(/\D/g, '')
    ) || 0;

/* ==========================================
   PRODUCT CODE / ITEM CODE
   Supports Item Code and Product Code
========================================== */

function code(product) {

    // First: direct database properties
    const directCode =
        product.itemCode ||
        product.item_code ||
        product.productCode ||
        product.product_code ||
        product.sku ||
        product.code;

    if (
        directCode != null &&
        String(directCode).trim()
    ) {
        return String(directCode).trim();
    }

    // Second: specifications table
    const codeRow = (product.table || []).find(row => {

        const field = String(row.label || '')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '');

        return [
            'itemcode',
            'productcode',
            'productid',
            'modelnumber',
            'modelno',
            'sku',
            'code'
        ].includes(field);

    });

    if (
        codeRow?.value != null &&
        String(codeRow.value).trim()
    ) {
        return String(codeRow.value).trim();
    }

    // Third: extract from slug
    const slugCode = String(product.slug || '')
        .match(/[a-z]{1,4}-?\d{3,5}(?:-[a-z0-9]+)?/i);

    if (slugCode) {
        return slugCode[0].toUpperCase();
    }

    return '—';
}

/* ==========================================
   PRODUCT IMAGE
========================================== */

function productImage(product) {

    if (product.main_image) {
        return product.main_image;
    }

    const images = product.images || {};

    for (const imageGroup of Object.values(images)) {

        if (
            Array.isArray(imageGroup) &&
            imageGroup.length
        ) {
            return imageGroup[0];
        }
    }

    return '';
}

/* ==========================================
   PRODUCT DETAIL URL
========================================== */

function detailUrl(product) {

    let slug = String(product.slug || '')
        .trim()
        .toLowerCase();

    if (!slug) {
        slug = String(product.title || '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '')
            .replace(/-+/g, '-');
    }

    return `/bath-products/product.html?${encodeURIComponent(slug)}`;
}

/* ==========================================
   SEARCH NORMALIZATION
========================================== */

function searchNormalize(value) {

    return norm(value)
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function searchText(product) {

    const specifications = (product.table || [])
        .flatMap(row => [
            row.label,
            row.value
        ]);

    const features = Array.isArray(product.features)
        ? product.features.map(feature =>
            typeof feature === 'object'
                ? JSON.stringify(feature)
                : feature
        )
        : [];

    const keywords = Array.isArray(product.keyword)
        ? product.keyword
        : [product.keyword || ''];

    return [
        product.title,
        product.slug,
        product.category,
        label(product.category),
        code(product),
        product.description,
        product.mtitle,
        product.mdescription,
        ...keywords,
        ...features,
        ...specifications
    ].filter(Boolean).join(' ');
}

/* ==========================================
   UNIVERSAL LIVE SEARCH
========================================== */

function matches(product) {

    // Category filtering
    if (
        state.category !== 'all' &&
        product.category !== state.category
    ) {
        return false;
    }

    if (!state.query) {
        return true;
    }

    const rawText = norm(searchText(product));
    const normalizedText = searchNormalize(
        searchText(product)
    );

    const rawQuery = norm(state.query);
    const normalizedQuery = searchNormalize(
        state.query
    );

    // Exact/partial text match
    if (rawText.includes(rawQuery)) {
        return true;
    }

    if (!normalizedQuery) {
        return false;
    }

    // Supports searches like:
    // SS-1251 / SS 1251 / SS1251
    const compactText = normalizedText.replace(/\s/g, '');
    const compactQuery = normalizedQuery.replace(/\s/g, '');

    if (compactText.includes(compactQuery)) {
        return true;
    }

    // Multi-word search
    return normalizedQuery
        .split(' ')
        .every(word => normalizedText.includes(word));
}

/* ==========================================
   SORT PRODUCTS
========================================== */

function sorted() {

    const result = productList.filter(matches);

    switch (state.sort) {

        case 'name':
            result.sort((a, b) =>
                String(a.title || '').localeCompare(
                    String(b.title || '')
                )
            );
            break;

        case 'priceLow':
            result.sort((a, b) =>
                price(a) - price(b)
            );
            break;

        case 'priceHigh':
            result.sort((a, b) =>
                price(b) - price(a)
            );
            break;

        case 'rating':
            result.sort((a, b) =>
                rating(b) - rating(a) ||
                reviews(b) - reviews(a)
            );
            break;

        default:
            // Keep original database order
            break;
    }

    return result;
}

/* ==========================================
   CATEGORY FILTER
========================================== */

const categories = [
    ...new Set(
        productList
            .map(product => product.category)
            .filter(Boolean)
    )
];

function drawCategories() {

    const container = $('catalogueCategories');

    if (!container) return;

    const counts = new Map();

    categories.forEach(category => {

        counts.set(
            category,
            productList.filter(
                product => product.category === category
            ).length
        );

    });

    const allButton = `
        <button
            type="button"
            class="category-tab ${state.category === 'all' ? 'selected' : ''}"
            data-category="all"
            aria-pressed="${state.category === 'all'}"
        >
            <span class="cat-symbol">▦</span>
            <span>
                All Products
                <small>(${productList.length})</small>
            </span>
        </button>
    `;

    const categoryButtons = categories.map(category => {

        const selected = state.category === category;

        return `
            <button
                type="button"
                class="category-tab ${selected ? 'selected' : ''}"
                data-category="${safe(category)}"
                aria-pressed="${selected}"
            >
                <span class="cat-symbol">
                    ${safe(categorySymbols[category] || '▣')}
                </span>

                <span>
                    ${safe(label(category))}
                    <small>(${counts.get(category)})</small>
                </span>
            </button>
        `;

    }).join('');

    container.innerHTML = allButton + categoryButtons;
}

/* ==========================================
   PRODUCT CARD
========================================== */

function card(product) {

    const itemCode = code(product);
    const stars = rating(product);
    const reviewCount = reviews(product);
    const image = productImage(product);
    const url = detailUrl(product);

    const favoriteId = String(
        product.id ?? product.slug ?? product.title
    );

    const isFavorite = state.favorites.has(favoriteId);

    const filledStars = Math.round(stars);
    const emptyStars = 5 - filledStars;

    const starHTML =
        '★'.repeat(filledStars) +
        '☆'.repeat(emptyStars);

    const displayPrice =
        product.newPrice ||
        product.price ||
        'Price on request';

    const imageHTML = image
        ? `
            <img
                loading="lazy"
                src="${safe(image)}"
                alt="${safe(product.title)} - ${safe(itemCode)}"
                onerror="this.onerror=null;this.style.opacity='.2'"
            >
          `
        : `
            <div class="catalogue-no-image">
                Image Coming Soon
            </div>
          `;

    return `
        <article class="catalogue-card">

            <div class="catalogue-image">

                <span class="category-pill">
                    ${safe(label(product.category))}
                </span>

                <button
                    class="favorite ${isFavorite ? 'saved' : ''}"
                    type="button"
                    data-fav="${safe(favoriteId)}"
                    aria-label="${isFavorite ? 'Remove favorite' : 'Add favorite'}"
                    aria-pressed="${isFavorite}"
                >
                    ${isFavorite ? '♥' : '♡'}
                </button>

                <a
                    href="${safe(url)}"
                    aria-label="View ${safe(product.title)}"
                >
                    ${imageHTML}
                </a>

            </div>

            <div class="catalogue-card-body">

                <div class="item-code">
                    ${safe(itemCode)}
                </div>

                <h2>
                    <a href="${safe(url)}">
                        ${safe(product.title)}
                    </a>
                </h2>

                <div class="rating-line">

                    <span
                        class="stars"
                        aria-label="${stars} out of 5 stars"
                    >
                        ${starHTML}
                    </span>

                    <span class="review-count">
                        (${reviewCount} Reviews)
                    </span>

                </div>

                <div class="card-price">
                    ${safe(displayPrice)}
                </div>

                <a
                    class="details-btn"
                    href="${safe(url)}"
                >
                    View Details
                    <span>→</span>
                </a>

            </div>

        </article>
    `;
}

/* ==========================================
   RENDER PRODUCTS
========================================== */

function render() {

    const result = sorted();

    const shown = result.slice(0, state.limit);

    const grid = $('catalogueGrid');

    if (!grid) return;

    grid.classList.toggle(
        'list-view',
        state.view === 'list'
    );

    grid.innerHTML = shown.map(card).join('');

    // Product count
    const countElement = $('catalogueCount');

    if (countElement) {

        countElement.textContent = result.length
            ? `Showing 1 – ${shown.length} of ${result.length} products`
            : 'Showing 0 products';

    }

    // No results
    const emptyElement = $('catalogueEmpty');

    if (emptyElement) {
        emptyElement.hidden = result.length !== 0;
    }

    // Load More
    const loadMoreButton = $('catalogueLoadMore');

    if (loadMoreButton) {
        loadMoreButton.hidden =
            shown.length >= result.length;
    }

    // Category state
    drawCategories();

    // View buttons
    const gridButton = $('gridView');
    const listButton = $('listView');

    if (gridButton) {

        gridButton.classList.toggle(
            'active',
            state.view === 'grid'
        );

        gridButton.setAttribute(
            'aria-pressed',
            String(state.view === 'grid')
        );
    }

    if (listButton) {

        listButton.classList.toggle(
            'active',
            state.view === 'list'
        );

        listButton.setAttribute(
            'aria-pressed',
            String(state.view === 'list')
        );
    }
}

/* ==========================================
   POPULAR SEARCHES
========================================== */

const popularContainer = $('popularSearches');

if (popularContainer) {

    popularContainer.insertAdjacentHTML(
        'beforeend',
        popular.map(text => `
            <button
                type="button"
                data-search="${safe(text)}"
            >
                ${safe(text)}
            </button>
        `).join('')
    );

    popularContainer.addEventListener('click', event => {

        const button = event.target.closest('[data-search]');

        if (!button) return;

        const query = button.dataset.search;

        const searchInput = $('catalogueQuery');

        if (searchInput) {
            searchInput.value = query;
        }

        state.query = norm(query);
        state.category = 'all';
        state.limit = PRODUCTS_PER_PAGE;

        render();
    });
}

/* ==========================================
   SEARCH FORM
========================================== */

const searchForm = $('catalogueSearch');

if (searchForm) {

    searchForm.addEventListener('submit', event => {

        event.preventDefault();

        state.query = norm(
            $('catalogueQuery')?.value
        );

        state.limit = PRODUCTS_PER_PAGE;

        render();
    });
}

/* ==========================================
   LIVE SEARCH
========================================== */

const searchInput = $('catalogueQuery');

if (searchInput) {

    searchInput.addEventListener('input', event => {

        state.query = norm(event.target.value);
        state.limit = PRODUCTS_PER_PAGE;

        render();
    });
}

/* ==========================================
   CATEGORY CLICK
========================================== */

const categoryContainer = $('catalogueCategories');

if (categoryContainer) {

    categoryContainer.addEventListener('click', event => {

        const button = event.target.closest(
            '[data-category]'
        );

        if (!button) return;

        state.category = button.dataset.category;
        state.limit = PRODUCTS_PER_PAGE;

        render();
    });
}

/* ==========================================
   SORT CHANGE
========================================== */

const sortSelect = $('catalogueSort');

if (sortSelect) {

    sortSelect.addEventListener('change', event => {

        state.sort = event.target.value;
        state.limit = PRODUCTS_PER_PAGE;

        render();
    });
}

/* ==========================================
   GRID / LIST VIEW
========================================== */

const gridButton = $('gridView');

if (gridButton) {

    gridButton.addEventListener('click', () => {

        state.view = 'grid';

        render();
    });
}

const listButton = $('listView');

if (listButton) {

    listButton.addEventListener('click', () => {

        state.view = 'list';

        render();
    });
}

/* ==========================================
   LOAD MORE
========================================== */

const loadMoreButton = $('catalogueLoadMore');

if (loadMoreButton) {

    loadMoreButton.addEventListener('click', () => {

        state.limit += PRODUCTS_PER_PAGE;

        render();
    });
}

/* ==========================================
   RESET FILTERS
========================================== */

const resetButton = $('catalogueReset');

if (resetButton) {

    resetButton.addEventListener('click', () => {

        state.query = '';
        state.category = 'all';
        state.sort = 'featured';
        state.limit = PRODUCTS_PER_PAGE;

        if ($('catalogueQuery')) {
            $('catalogueQuery').value = '';
        }

        if ($('catalogueSort')) {
            $('catalogueSort').value = 'featured';
        }

        render();
    });
}

/* ==========================================
   FAVORITES
========================================== */

const catalogueGrid = $('catalogueGrid');

if (catalogueGrid) {

    catalogueGrid.addEventListener('click', event => {

        const button = event.target.closest('[data-fav]');

        if (!button) return;

        const id = button.dataset.fav;

        if (state.favorites.has(id)) {
            state.favorites.delete(id);
        } else {
            state.favorites.add(id);
        }

        render();
    });
}

/* ==========================================
   INITIALIZE CATALOGUE
========================================== */

render();
