(function () {
    // NOTE: this page is server-rendered by Thymeleaf (a .ticket <article> per
    // paper already exists in the DOM with data-title / data-author / data-area /
    // data-status attributes). This script only needs to filter + count what's
    // already there — it does not fetch /api/papers or build cards from a template.

    const manifestList = document.getElementById('manifestList');
    const noMatchState = document.getElementById('noMatchState');
    const searchInput = document.getElementById('searchInput');
    const statusChips = document.getElementById('statusChips');
    const liveStatus = document.getElementById('liveStatus');

    const statTotal = document.getElementById('statTotal');
    const statNotStarted = document.getElementById('statNotStarted');
    const statReading = document.getElementById('statReading');
    const statCompleted = document.getElementById('statCompleted');

    if (!manifestList) return; // no papers rendered at all (empty state handles that case)

    const rows = Array.from(manifestList.querySelectorAll('.ticket'));
    let activeStatus = 'ALL';
    let searchTerm = '';

    function animateCount(el, target) {
        if (!el) return;
        const start = Number(el.dataset.count) || 0;
        const duration = 450;
        const startTime = performance.now();
        function step(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.round(start + (target - start) * eased);
            el.textContent = value;
            if (progress < 1) requestAnimationFrame(step);
            else el.dataset.count = target;
        }
        requestAnimationFrame(step);
    }

    function updateStats() {
        const total = rows.length;
        let notStarted = 0, reading = 0, completed = 0;
        rows.forEach(row => {
            const status = row.dataset.status;
            if (status === 'READING') reading++;
            else if (status === 'COMPLETED') completed++;
            else notStarted++;
        });
        animateCount(statTotal, total);
        animateCount(statNotStarted, notStarted);
        animateCount(statReading, reading);
        animateCount(statCompleted, completed);
    }

    function applyFilters() {
        const term = searchTerm.trim().toLowerCase();
        let visibleCount = 0;

        rows.forEach(row => {
            const matchesStatus = activeStatus === 'ALL' || row.dataset.status === activeStatus;
            const haystack = (
                (row.dataset.title || '') + ' ' +
                (row.dataset.author || '') + ' ' +
                (row.dataset.area || '')
            ).toLowerCase();
            const matchesSearch = !term || haystack.includes(term);
            const visible = matchesStatus && matchesSearch;

            row.hidden = !visible;
            if (visible) visibleCount++;
        });

        if (noMatchState) {
            noMatchState.hidden = visibleCount !== 0;
        }
    }

    if (statusChips) {
        statusChips.addEventListener('click', (e) => {
            const btn = e.target.closest('.chip');
            if (!btn) return;
            statusChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            activeStatus = btn.dataset.status;
            applyFilters();
        });
    }

    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                searchTerm = searchInput.value;
                applyFilters();
            }, 150);
        });
    }

    // delete confirmation already handled by the inline form's onsubmit=confirm(...)
    // in the HTML, so no JS wiring is needed here for delete.

    updateStats();
    applyFilters();
    if (liveStatus) liveStatus.textContent = 'QUEUE SYNCED';
})();