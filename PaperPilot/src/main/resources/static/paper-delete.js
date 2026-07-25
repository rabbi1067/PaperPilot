document.addEventListener('DOMContentLoaded', function () {
    const cancelLink = document.querySelector('.btn-cancel');

    // Esc key = Cancel
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && cancelLink) {
            window.location.href = cancelLink.getAttribute('href');
        }
    });

    // disable + relabel delete button on submit to prevent double-clicks
    const deleteForm = document.querySelector('.del-form');
    const deleteBtn = document.querySelector('.btn-delete');
    if (deleteForm && deleteBtn) {
        deleteForm.addEventListener('submit', function () {
            deleteBtn.textContent = 'Deleting…';
            deleteBtn.disabled = true;
        });
    }
});