let dotsElem = document.getElementById('dots');
let count = 1;

setInterval(() => {
  count = (count % 3) + 1;
  dotsElem.innerHTML = '.'.repeat(count);
}, 400);

setTimeout(() => {
  window.location.href = 'recipe.html';
}, 2500);
