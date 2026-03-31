let toastTimer;
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

document.querySelectorAll('.pref-tag').forEach(tag => {
    tag.addEventListener('click', () => {
        tag.classList.toggle('active');
        showToast(tag.classList.contains('active') ? `Added ${tag.textContent} ✅` : `Removed ${tag.textContent}`);
    });
});

document.querySelectorAll('.cuisine-tag').forEach(tag => {
    tag.addEventListener('click', () => {
        tag.classList.toggle('active');
    });
});

document.getElementById('avatarEdit').addEventListener('click', () => {
    showToast('Photo upload coming soon! 📸');
});

document.getElementById('downloadBtn').addEventListener('click', () => {
    showToast('Preparing your Recipe Log PDF… 📄');
});

const originalName = document.getElementById('displayName').value;
const originalBio = document.getElementById('bio').value;

document.getElementById('saveBtn').addEventListener('click', () => {
    showToast('Changes saved successfully! 🎉');
});

document.getElementById('discardBtn').addEventListener('click', () => {
    document.getElementById('displayName').value = originalName;
    document.getElementById('bio').value = originalBio;
    showToast('Changes discarded');
});

document.querySelectorAll('.cat-item').forEach(btn => {
    if (!btn.classList.contains('profile-cat')) {
        btn.addEventListener('click', () => {
            window.location.href = `categories.html`;
        });
    }
});
