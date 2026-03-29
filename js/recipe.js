let toastTimer;

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

function bindInteractiveElements() {
  document.querySelectorAll('#ingredientsList input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', () => {
      cb.closest('li').classList.toggle('checked', cb.checked);
    });
  });

  document.querySelectorAll('.step-card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('done');
      const n = card.dataset.step;
      showToast(card.classList.contains('done') ? `Step ${n} complete ✅` : `Step ${n} unchecked`);
    });
  });
}

document.querySelectorAll('.cat-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

document.getElementById('watchBtn').addEventListener('click', () => showToast('Opening tutorial video... 📹'));

let saved = false;
document.getElementById('bookmarkBtn').addEventListener('click', () => {
  saved = !saved;
  document.getElementById('bookmarkBtn').textContent = saved ? '❤️' : '🤍';
  showToast(saved ? 'Saved to vault ❤️' : 'Removed from vault');
});

document.getElementById('shareBtn').addEventListener('click', () => {
  navigator.clipboard?.writeText(window.location.href).then(() => showToast('Link copied! 📋')).catch(() => showToast('Share link ready! 📋'));
});

async function loadRecipe() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');

    let url = id ? `https://dummyjson.com/recipes/${id}` : 'https://dummyjson.com/recipes?limit=50';

    const res = await fetch(url);
    if (!res.ok) throw new Error('Recipe not found');
    const data = await res.json();

    let recipe;
    if (id) {
      recipe = data;
    } else {
      recipe = data.recipes[Math.floor(Math.random() * data.recipes.length)];
      window.history.replaceState(null, '', `?id=${recipe.id}`);
    }

    document.querySelector('.recipe-title').innerHTML = recipe.name.toUpperCase().replace(' ', '<br>');
    document.querySelector('.recipe-hero-img').src = recipe.image;
    document.querySelector('.recipe-hero-img').alt = recipe.name;

    const tagsHtml = (recipe.tags || []).slice(0, 2).map((t, i) => `<span class="rtag rtag-${i===0?'green':'orange'}">${t.toUpperCase()}</span>`).join('');
    document.querySelector('.recipe-tags-row').innerHTML = tagsHtml + `<span class="rtag">${recipe.cuisine.toUpperCase()}</span>`;

    const prepBox = document.querySelectorAll('.time-box .time-val')[0];
    const cookBox = document.querySelectorAll('.time-box .time-val')[1];
    if (prepBox) prepBox.textContent = recipe.prepTimeMinutes + ' MIN';
    if (cookBox) cookBox.textContent = recipe.cookTimeMinutes + ' MIN';

    document.getElementById('ingredientsList').innerHTML = recipe.ingredients.map(ing => `
      <li><label><input type="checkbox" /> <span>${ing}</span></label></li>
    `).join('');

    document.querySelector('.steps-list').innerHTML = recipe.instructions.map((step, i) => `
      <div class="step-card" data-step="${i+1}">
        <div class="step-num">${String(i+1).padStart(2, '0')}</div>
        <div class="step-body">
          <h4>STEP ${i+1}</h4>
          <p>${step}</p>
        </div>
      </div>
    `).join('');

    const calNum = document.querySelector('.cal-num');
    if (calNum) calNum.textContent = recipe.caloriesPerServing;

    const nuVals = document.querySelectorAll('.nu-val');
    if (nuVals.length >= 3) {
      nuVals[0].textContent = Math.floor(recipe.caloriesPerServing * 0.1) + 'g';
      nuVals[1].textContent = Math.floor(recipe.caloriesPerServing * 0.15) + 'g';
      nuVals[2].textContent = Math.floor(recipe.caloriesPerServing * 0.05) + 'g';
    }

    document.title = `PlatePalette — ${recipe.name}`;

    bindInteractiveElements();

    document.getElementById('recipeLoader').style.display = 'none';
    document.getElementById('recipeHeader').style.opacity = '1';
    document.getElementById('recipeBody').style.opacity = '1';

  } catch (e) {
    console.error(e);
    document.getElementById('recipeLoader').textContent = 'FAILED TO LOAD RECIPE';
    showToast('Failed to load recipe');
  }
}

loadRecipe();
