
import products from './product-api-list.js';

/* ==========================================
   PETRO SS COLLECTION - V4
   Complete Updated JavaScript
========================================== */

const all = Array.isArray(products) ? products : [];

const data = all.filter(p =>
  ['stainless-steel', 'stainless steel', 'ss']
    .includes(String(p.category || '').trim().toLowerCase())
);

const $ = id => document.getElementById(id);

const esc = v => String(v ?? '').replace(
  /[&<>"']/g,
  c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c])
);

/* ==========================================
   PRODUCT DATA HELPERS
========================================== */

const getImage = p =>
  p.main_image ||
  Object.values(p.images || {})
    .find(v => Array.isArray(v) && v.length)?.[0] ||
  '';

function code(p) {
  const direct =
    p.itemCode ||
    p.item_code ||
    p.productCode ||
    p.product_code ||
    p.sku ||
    p.code;

  if (direct) return String(direct);

  const row = (
    Array.isArray(p.table) ? p.table : []
  ).find(r =>
    [
      'itemcode',
      'productcode',
      'productid',
      'modelnumber',
      'modelno',
      'sku',
      'code'
    ].includes(
      String(r.label || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
    )
  );

  return String(
    row?.value ||
    String(p.slug || '')
      .match(/[a-z]{1,4}-?\d{3,5}(?:-[a-z0-9]+)?/i)?.[0] ||
    ''
  );
}

const numericPrice = p =>
  Number(
    String(p.newPrice ?? p.price ?? '')
      .replace(/[^\d.]/g, '')
  ) || 0;

const displayPrice = p =>
  p.newPrice ?? p.price ?? '';

/* ==========================================
   REAL PRODUCT RATINGS
   JSON: ratingStars / ratingReviews
========================================== */

function rating(p) {
  const value =
    p.ratingStars ??
    p.rating?.value ??
    p.rating?.average ??
    p.rating?.ratingValue ??
    (typeof p.rating === 'number' ? p.rating : null) ??
    p.averageRating ??
    p.average_rating;

  if (value === null || value === undefined || value === '') {
    return null;
  }

  const r = Number(value);

  return Number.isFinite(r) && r >= 1 && r <= 5
    ? r
    : null;
}

function reviewCount(p) {
  const value =
    p.ratingReviews ??
    p.rating?.count ??
    p.rating?.reviewCount ??
    p.reviewCount ??
    p.review_count;

  if (value === null || value === undefined || value === '') {
    return null;
  }

  const n = Number(value);

  return Number.isInteger(n) && n > 0
    ? n
    : null;
}

/* ==========================================
   FIVE STAR RATING HTML
========================================== */

function ratingHTML(p) {
  const r = rating(p);
  const n = reviewCount(p);

  if (r === null) return '';

  const stars = Array.from({ length: 5 }, (_, i) => {
    const fill = Math.max(
      0,
      Math.min(100, (r - i) * 100)
    );

    return `
      <span
        class="pl-rating-star"
        style="--fill:${fill}%"
        aria-hidden="true"
      >★</span>
    `;
  }).join('');

  return `
    <div
      class="pl-card-rating"
      aria-label="${r.toFixed(1)} out of 5 stars${
        n !== null ? `, ${n} reviews` : ''
      }"
    >
      <span class="pl-rating-stars">
        ${stars}
      </span>

      <strong>${r.toFixed(1)}</strong>

      ${
        n !== null
          ? `<span class="pl-rating-reviews">
               (${n} Reviews)
             </span>`
          : ''
      }
    </div>
  `;
}

/* ==========================================
   PRODUCT DETAIL URL
========================================== */

function detail(p) {
  const slug = String(p.slug || p.title || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-');

  return '/bath-products/product.html?' +
    encodeURIComponent(slug);
}

/* ==========================================
   STATE
========================================== */

const BATCH = 8;

const state = {
  query: '',
  sort: 'featured',
  price: 'all',
  minRating: 'all',
  limit: BATCH
};

let filtered = [];
let observer = null;
let busy = false;

/* ==========================================
   SEARCH
========================================== */

function searchText(p) {
  return [
    p.title,
    p.slug,
    p.category,
    code(p),
    p.description,
    p.mtitle,
    p.mdescription,
    ...(Array.isArray(p.keyword)
      ? p.keyword
      : [p.keyword])
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/* ==========================================
   FILTER MATCHING
========================================== */

function matches(p) {
  const q = state.query.trim().toLowerCase();

  if (
    q &&
    !q.split(/\s+/)
      .every(word => searchText(p).includes(word))
  ) {
    return false;
  }

  const v = numericPrice(p);

  if (
    state.price === '700-1500' &&
    !(v >= 700 && v <= 1500)
  ) return false;

  if (
    state.price === 'under700' &&
    !(v > 0 && v < 700)
  ) return false;

  if (
    state.price === 'over1500' &&
    !(v > 1500)
  ) return false;

  if (state.minRating !== 'all') {
    const r = rating(p);

    if (r === null || r < Number(state.minRating)) {
      return false;
    }
  }

  return true;
}

/* ==========================================
   FILTER AND SORT
========================================== */

function filteredList() {
  const list = data.filter(matches);

  if (state.sort === 'name') {
    list.sort((a, b) =>
      String(a.title || '')
        .localeCompare(String(b.title || ''))
    );
  }

  if (state.sort === 'priceLow') {
    list.sort((a, b) =>
      numericPrice(a) - numericPrice(b)
    );
  }

  if (state.sort === 'priceHigh') {
    list.sort((a, b) =>
      numericPrice(b) - numericPrice(a)
    );
  }

  if (state.sort === 'rating') {
    list.sort((a, b) =>
      (rating(b) ?? -1) - (rating(a) ?? -1)
    );
  }

  return list;
}


/* ==========================================
   PRODUCT CARD
========================================== */

function card(p) {
  const name = esc(p.title || 'PETRO Product');
  const item = code(p);
  const url = detail(p);
  const im = getImage(p);

  const msg = encodeURIComponent(
    'Hello PETRO, I want details about ' +
    (p.title || 'this product') +
    (item ? ` (${item})` : '')
  );

  return `
    <article class="pl-card">

      <div class="pl-card-media">

        <a
          class="pl-card-image"
          href="${esc(url)}"
          aria-label="View ${name}"
        >
          ${
            im
              ? `<img
                  src="${esc(im)}"
                  alt="${name}"
                  loading="lazy"
                  decoding="async"
                >`
              : '<span>Image coming soon</span>'
          }
        </a>

        <span class="pl-ss-badge">
          SS Collection
        </span>

      </div>

      <div class="pl-card-body">

        <div class="pl-name-line">

          <h3>
            <a href="${esc(url)}">
              ${name}
            </a>
          </h3>

          ${
            item
              ? `<span class="pl-inline-code">
                   ${esc(item)}
                 </span>`
              : ''
          }

        </div>

        ${ratingHTML(p)}

        ${
          displayPrice(p) !== ''
            ? `<p class="pl-card-price">
                 ${esc(displayPrice(p))}
               </p>`
            : ''
        }

        <div class="pl-card-actions">

          <a
            class="pl-details-btn"
            href="${esc(url)}"
          >
            Details
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>

          <a
            class="pl-inquiry-btn"
            href="https://wa.me/918000007336?text=${msg}"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i class="fa-brands fa-whatsapp"></i>
            Inquiry Now
          </a>

        </div>

      </div>

    </article>
  `;
}

/* ==========================================
   INFINITE SCROLL STATUS
========================================== */

function status() {
  const more = state.limit < filtered.length;

  const loader = $('petroScrollLoader');
  const trigger = $('petroScrollTrigger');

  if (loader) loader.hidden = !more;
  if (trigger) trigger.hidden = !more;

  if (observer && trigger) {
    observer.disconnect();

    if (more) observer.observe(trigger);
  }
}

/* ==========================================
   RENDER PRODUCTS
========================================== */

function render(append = false) {
  const grid = $('plGrid');
  if (!grid) return;

  filtered = filteredList();

  const shown = filtered.slice(0, state.limit);

  if (append) {
    const current = grid.children.length;

    grid.insertAdjacentHTML(
      'beforeend',
      shown.slice(current).map(card).join('')
    );
  } else {
    grid.innerHTML = shown.map(card).join('');
  }

  if ($('plCount')) {
    $('plCount').textContent =
      `Showing ${shown.length} of ${filtered.length} Products`;
  }

  if ($('plEmpty')) {
    $('plEmpty').hidden = filtered.length !== 0;
  }

  if ($('plRatingNote')) {
    $('plRatingNote').hidden =
      state.minRating === 'all';
  }

  status();
}

function resetLimit() {
  state.limit = BATCH;
  render();
}

/* ==========================================
   AUTO INFINITE SCROLL
========================================== */

function setupScroll() {
  const trigger = $('petroScrollTrigger');

  if (!trigger) return;

  if (!('IntersectionObserver' in window)) {
    const loader = $('petroScrollLoader');

    if (loader) {
      loader.innerHTML = `
        <button type="button" id="plFallbackMore">
          Load more products
        </button>
      `;

      loader.addEventListener('click', e => {
        if (!e.target.closest('#plFallbackMore')) return;

        state.limit = Math.min(
          state.limit + BATCH,
          filtered.length
        );

        render(true);
      });
    }

    status();
    return;
  }

  observer = new IntersectionObserver(
    entries => {
      if (
        !entries[0].isIntersecting ||
        busy ||
        state.limit >= filtered.length
      ) return;

      busy = true;

      state.limit = Math.min(
        state.limit + BATCH,
        filtered.length
      );

      render(true);

      busy = false;
    },
    {
      root: null,
      rootMargin: '0px 0px 300px 0px',
      threshold: 0
    }
  );

  status();
}

/* ==========================================
   SEARCH / FILTER EVENTS
========================================== */

$('plSearch')?.addEventListener('input', e => {
  state.query = e.target.value;
  resetLimit();
});

$('plPrice')?.addEventListener('change', e => {
  state.price = e.target.value;
  resetLimit();
});

$('plRating')?.addEventListener('change', e => {
  state.minRating = e.target.value;
  resetLimit();
});

$('plSort')?.addEventListener('change', e => {
  state.sort = e.target.value;
  resetLimit();
});

/* ==========================================
   RESET FILTERS
========================================== */

$('plReset')?.addEventListener('click', () => {
  Object.assign(state, {
    query: '',
    sort: 'featured',
    price: 'all',
    minRating: 'all',
    limit: BATCH
  });

  for (const [id, value] of [
    ['plSearch', ''],
    ['plSort', 'featured'],
    ['plPrice', 'all'],
    ['plRating', 'all']
  ]) {
    if ($(id)) $(id).value = value;
  }

  render();
});

/* ==========================================
   INITIALIZE
========================================== */

render();
setupScroll();


/* ==========================================
   PETRO CUSTOMER REVIEW SLIDER
   Auto Slide + Dots + Arrows + Swipe
========================================== */

function initPetroReviewSlider() {
  const viewport = document.getElementById('petroReviewViewport');
  const track = document.getElementById('petroReviewTrack');
  const prev = document.getElementById('petroReviewPrev');
  const next = document.getElementById('petroReviewNext');
  const dotsBox = document.getElementById('petroReviewDots');

  if (!viewport || !track || !prev || !next || !dotsBox) {
    return;
  }

  const cards = Array.from(track.querySelectorAll('.petro-review-card'));

  if (!cards.length) return;

  let index = 0;
  let timer = null;
  let startX = null;

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  );

  function visibleCards() {
    if (window.innerWidth <= 700) return 1;
    if (window.innerWidth <= 1050) return 2;
    return 3;
  }

  function maxIndex() {
    return Math.max(0, cards.length - visibleCards());
  }

  function update() {
    index = Math.max(0, Math.min(index, maxIndex()));

    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const cardWidth = cards[0].getBoundingClientRect().width;

    track.style.transform =
      `translateX(-${index * (cardWidth + gap)}px)`;

    prev.disabled = index === 0;
    next.disabled = index === maxIndex();

    dotsBox.innerHTML = '';

    for (let i = 0; i <= maxIndex(); i++) {
      const dot = document.createElement('button');

      dot.type = 'button';
      dot.className =
        'petro-review-dot' + (i === index ? ' active' : '');

      dot.setAttribute('aria-label', `Go to review position ${i + 1}`);
      dot.setAttribute('aria-pressed', String(i === index));

      dot.addEventListener('click', () => {
        index = i;
        update();
        restartAuto();
      });

      dotsBox.appendChild(dot);
    }
  }

  function goNext() {
    index = index >= maxIndex() ? 0 : index + 1;
    update();
  }

  function goPrev() {
    index = index <= 0 ? maxIndex() : index - 1;
    update();
  }

  function stopAuto() {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  }

  function startAuto() {
    stopAuto();

    if (
      reducedMotion.matches ||
      document.hidden ||
      maxIndex() === 0
    ) return;

    timer = setInterval(goNext, 4500);
  }

  function restartAuto() {
    startAuto();
  }

  next.addEventListener('click', () => {
    goNext();
    restartAuto();
  });

  prev.addEventListener('click', () => {
    goPrev();
    restartAuto();
  });

  viewport.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse') return;
    startX = e.clientX;
    stopAuto();
  });

  viewport.addEventListener('pointerup', e => {
    if (startX === null) return;

    const distance = e.clientX - startX;

    if (Math.abs(distance) > 45) {
      if (distance < 0) goNext();
      else goPrev();
    }

    startX = null;
    restartAuto();
  });

  viewport.addEventListener('pointercancel', () => {
    startX = null;
    restartAuto();
  });

  viewport.addEventListener('mouseenter', stopAuto);
  viewport.addEventListener('mouseleave', startAuto);

  viewport.addEventListener('focusin', stopAuto);
  viewport.addEventListener('focusout', e => {
    if (!viewport.contains(e.relatedTarget)) startAuto();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAuto();
    else startAuto();
  });

  window.addEventListener('resize', () => {
    update();
    startAuto();
  });

  reducedMotion.addEventListener?.('change', startAuto);

  update();
  startAuto();
}

/* FAQ - only one answer open at a time */

function initPetroFAQ() {
  const items = document.querySelectorAll(
    '.petro-faq-list .petro-faq-item'
  );

  items.forEach(item => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;

      items.forEach(other => {
        if (other !== item) other.open = false;
      });
    });
  });
}

/* INITIALIZE */

function initPetroReviewsFAQ() {
  initPetroReviewSlider();
  initPetroFAQ();
}

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    initPetroReviewsFAQ,
    { once: true }
  );
} else {
  initPetroReviewsFAQ();
}
