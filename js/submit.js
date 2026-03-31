document.getElementById('recipeForm').addEventListener('submit', e => {
    e.preventDefault();
    document.getElementById('formCard').style.display = 'none';
    document.getElementById('successMsg').style.display = 'block';
});
