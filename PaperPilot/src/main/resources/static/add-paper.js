(function () {
    const form = document.getElementById('paperForm');
    const fieldsFilled = document.getElementById('fieldsFilled');
    const requiredLeft = document.getElementById('requiredLeft');
    const formMessage = document.getElementById('formMessage');

    if (!form) return;

    const allFields = Array.from(form.querySelectorAll('input, select, textarea'))
        .filter(el => el.name); // only fields with a name attribute count

    const requiredFields = allFields.filter(el => el.hasAttribute('required'));

    function updateCounters() {
        const filledCount = allFields.filter(el => el.value && el.value.trim() !== '').length;
        const requiredLeftCount = requiredFields.filter(el => !el.value || el.value.trim() === '').length;

        if (fieldsFilled) fieldsFilled.textContent = `${filledCount} / ${allFields.length}`;
        if (requiredLeft) requiredLeft.textContent = requiredLeftCount;
    }

    allFields.forEach(el => {
        el.addEventListener('input', updateCounters);
        el.addEventListener('change', updateCounters);
    });

    updateCounters();

    // Client-side check before letting the native form submission happen.
    // No fetch/AJAX here — the browser posts the form directly to
    // action="/paper/add", which the Spring controller handles.
    form.addEventListener('submit', function (e) {
        const missing = requiredFields.filter(el => !el.value || el.value.trim() === '');
        if (missing.length > 0) {
            e.preventDefault();
            if (formMessage) {
                formMessage.textContent = 'Please fill in all required fields before filing.';
                formMessage.style.color = '#ff6b6b';
            }
            missing[0].focus();
            return;
        }
        // valid — let the form submit normally, no preventDefault
        if (formMessage) {
            formMessage.textContent = 'Filing flight plan…';
            formMessage.style.color = '';
        }
    });
})();