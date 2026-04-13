const API = 'https://dummyjson.com/recipes?limit=50';
let allRecipes = [];
let activeMeal = 'all';
let searchQ = '';
let toastTimer;
let sortState = 'none';
let likedRecipes = new Set(JSON.parse(localStorage.getItem('platePaletteLikes') || '[]'));

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

async function fetchRecipes() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error();
    const data = await res.json();
    allRecipes = data.recipes;
    document.getElementById('exploreLoading').classList.add('hidden');
    document.getElementById('exploreContent').classList.remove('hidden');
    renderAll();
  } catch (e) {
    document.getElementById('exploreLoading').innerHTML = '<p style="color:#e53">Failed to load recipes. Check your connection.</p>';
  }
}

function renderAll() {
  renderSection('featuredRow',  allRecipes.slice().sort((a,b) => b.rating - a.rating).slice(0, 6));
  renderSection('breakfastRow', byMeal('Breakfast').slice(0, 5));
  renderSection('lunchRow',     byMeal('Lunch').slice(0, 5));
  renderSection('dinnerRow',    byMeal('Dinner').slice(0, 5));
  renderSection('dessertRow',   byMeal('Dessert').slice(0, 5));
  renderFilterGrid();
}

function byMeal(type) {
  return allRecipes.filter(r => (r.mealType || []).includes(type));
}

function renderSection(id, recipes) {
  const el = document.getElementById(id);
  if (!recipes.length) {
    el.closest('.exp-section').style.display = 'none';
    return;
  }
  el.innerHTML = recipes.map(r => cardHTML(r)).join('');
  bindCardClicks(el);
}

function renderFilterGrid() {
  const grid = document.getElementById('filterGrid');
  const empty = document.getElementById('emptySearch');
  const title = document.getElementById('filterSectionTitle');
  const badge = document.getElementById('filterCount');

  let list = allRecipes;

  if (activeMeal !== 'all') {
    list = list.filter(r => (r.mealType || []).includes(activeMeal));
  }
  if (searchQ) {
    list = list.filter(r =>
      r.name.toLowerCase().includes(searchQ) ||
      r.cuisine.toLowerCase().includes(searchQ) ||
      (r.tags || []).some(t => t.toLowerCase().includes(searchQ)) ||
      (r.ingredients || []).some(i => i.toLowerCase().includes(searchQ))
    );
  }

  if (sortState === 'alpha_asc') {
    list = list.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortState === 'alpha_desc') {
    list = list.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortState === 'rating_desc') {
    list = list.sort((a, b) => b.rating - a.rating);
  } else if (sortState === 'rating_asc') {
    list = list.sort((a, b) => a.rating - b.rating);
  } else if (sortState === 'time_asc') {
    list = list.sort((a, b) => (a.prepTimeMinutes + a.cookTimeMinutes) - (b.prepTimeMinutes + b.cookTimeMinutes));
  }

  const label = activeMeal !== 'all' ? activeMeal.toUpperCase() : 'ALL';
  title.textContent = `${label} RECIPES`;
  badge.textContent = `${list.length} found`;

  if (!list.length) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  grid.innerHTML = list.map(r => cardHTML(r)).join('');
  bindCardClicks(grid);

  const sectionFilter = document.getElementById('sectionFilter');
  if (activeMeal !== 'all' || searchQ) {
    sectionFilter.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function cardHTML(r) {
  const stars = renderStars(r.rating);
  const time = r.prepTimeMinutes + r.cookTimeMinutes;
  const diff = r.difficulty || 'Easy';
  const diffClass = diff.toLowerCase();
  const isLiked = likedRecipes.has(r.id.toString());
  const favClass = isLiked ? 'liked' : '';
  return `
    <article class="exp-card" data-id="${r.id}">
      <div class="exp-card-img">
        <div class="exp-like-btn ${favClass}" data-like-id="${r.id}">
          <svg fill="currentColor" viewBox="0 0 24 24" width="20" height="20">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <img src="${r.image}" alt="${r.name}" loading="lazy" />
        <span class="exp-diff diff-${diffClass}">${diff}</span>
        <span class="exp-meal">${(r.mealType||[]).join(' · ')}</span>
      </div>
      <div class="exp-card-body">
        <div class="exp-cuisine">${r.cuisine}</div>
        <h3 class="exp-name">${r.name}</h3>
        <div class="exp-card-meta">
          <span class="exp-stars">${stars} <strong>${r.rating}</strong></span>
          <span class="exp-time">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            ${time} min
          </span>
        </div>
        <div class="exp-card-footer">
          <span class="exp-cal">🔥 ${r.caloriesPerServing} cal</span>
          <button class="exp-view-btn">View →</button>
        </div>
      </div>
    </article>`;
}

function renderStars(rating) {
  return Array.from({ length: 5 }).map((_, i) => {
    if (i < Math.floor(rating)) return '<span class="s-full">★</span>';
    if (i === Math.floor(rating) && rating % 1 >= 0.5) return '<span class="s-half">★</span>';
    return '<span class="s-empty">☆</span>';
  }).join('');
}

function bindCardClicks(container) {
  Array.from(container.querySelectorAll('.exp-card')).map(card => {
    const likeBtn = card.querySelector('.exp-like-btn');
    if (likeBtn) {
      likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = likeBtn.dataset.likeId;
        if (likedRecipes.has(id)) {
          likedRecipes.delete(id);
          likeBtn.classList.remove('liked');
        } else {
          likedRecipes.add(id);
          likeBtn.classList.add('liked');
          showToast('Added to Favorites ❤️');
        }
        localStorage.setItem('platePaletteLikes', JSON.stringify([...likedRecipes]));
      });
    }

    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.id);
      window.location.href = `recipe.html?id=${id}`;
    });
  });
}

function openModal(r) {
  if (!r) return;
  document.getElementById('expModalImg').src = r.image;
  document.getElementById('expModalImg').alt = r.name;
  document.getElementById('expModalTitle').textContent = r.name.toUpperCase();

  document.getElementById('expModalTags').innerHTML =
    [...(r.tags||[]), r.cuisine].map(t => `<span class="em-tag">${t}</span>`).join('');

  document.getElementById('expModalMeta').innerHTML = `
    <span>${renderStars(r.rating)} <strong>${r.rating}</strong></span>
    <span>⏱ ${r.prepTimeMinutes + r.cookTimeMinutes} min</span>
    <span>🍽 ${r.servings} servings</span>
    <span>📊 ${r.difficulty}</span>`;

  document.getElementById('expModalIng').innerHTML =
    r.ingredients.map(i => `<li><span class="em-dot"></span>${i}</li>`).join('');

  document.getElementById('expModalInstr').innerHTML =
    r.instructions.map(s => `<li>${s}</li>`).join('');

  document.getElementById('expModalFooter').innerHTML = `
    <div class="em-chip">🔥 ${r.caloriesPerServing} cal/serving</div>
    <div class="em-chip">⏳ Prep: ${r.prepTimeMinutes} min</div>
    <div class="em-chip">🍳 Cook: ${r.cookTimeMinutes} min</div>
    <div class="em-chip">🌍 ${r.cuisine}</div>
    <div class="em-chip">${(r.mealType||[]).join(', ')}</div>`;

  const overlay = document.getElementById('expModalOverlay');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('expModal').classList.add('open'), 10);
}

function closeModal() {
  document.getElementById('expModal').classList.remove('open');
  setTimeout(() => {
    document.getElementById('expModalOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }, 300);
}

function handleSearch(val) {
  searchQ = val.toLowerCase().trim();
  document.getElementById('globalSearch').value = val;
  document.getElementById('heroSearch').value = val;
  renderFilterGrid();
}

document.getElementById('expModalClose').addEventListener('click', closeModal);
document.getElementById('expModalOverlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

document.getElementById('globalSearch') && document.getElementById('globalSearch').addEventListener('input', e => handleSearch(e.target.value));
document.getElementById('heroSearch') && document.getElementById('heroSearch').addEventListener('input', e => handleSearch(e.target.value));

document.getElementById('clearSearchBtn') && document.getElementById('clearSearchBtn').addEventListener('click', () => {
  handleSearch('');
});

document.getElementById('goProBtn') && document.getElementById('goProBtn').addEventListener('click', () => {
  showToast('Opening Pro plans... 💎');
});

document.getElementById('newsletterForm').addEventListener('submit', e => {
  e.preventDefault();
  showToast("You're subscribed! Welcome to the vault 🎉");
  e.target.reset();
});

window.addEventListener('scroll', () => {
  document.getElementById('navbar') && document.querySelector('.navbar')
    .classList.toggle('scrolled', window.scrollY > 60);
});


const sortSelect = document.getElementById('sortSelect');
if (sortSelect) {
  sortSelect.addEventListener('change', (e) => {
    sortState = e.target.value;
    renderFilterGrid();
  });
}

// Map instead of forEach for arrays
Array.from(document.querySelectorAll('.cat-item')).map(btn => {
  btn.addEventListener('click', () => {
    Array.from(document.querySelectorAll('.cat-item')).map(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeMeal = btn.dataset.meal;
    renderFilterGrid();
  });
});

Array.from(document.querySelectorAll('.exp-view-all-btn')).map(btn => {
  btn.addEventListener('click', () => {
    activeMeal = btn.dataset.meal;
    Array.from(document.querySelectorAll('.cat-item')).map(b => {
      b.classList.toggle('active', b.dataset.meal === activeMeal);
    });
    renderFilterGrid();
  });
});

fetchRecipes();
