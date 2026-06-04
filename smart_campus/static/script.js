document.addEventListener('DOMContentLoaded', () => {

    // ─── Sidebar Toggle ───
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }

    // ─── Navigation ───
    const navBtns = document.querySelectorAll('.nav-btn');
    const viewSections = document.querySelectorAll('.view-section');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            viewSections.forEach(v => v.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.getAttribute('data-target')).classList.add('active');
        });
    });

    // Helper to show result messages
    const showResult = (elementId, success, message) => {
        const el = document.getElementById(elementId);
        el.className = `result-box ${success ? 'result-success' : 'result-error'}`;
        el.textContent = message;
        el.classList.remove('hidden');
    };

    // ─── 1. Student Registration ───
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const marks = document.getElementById('reg-marks').value;
        try {
            const res = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, marks })
            });
            const data = await res.json();
            showResult('reg-result', data.success, data.message);
            if (data.success) e.target.reset();
        } catch (err) {
            showResult('reg-result', false, 'Network error');
        }
    });

    // ─── 2. Course Enrollment (Client-side) ───
    let courses = [];

    const renderCourses = () => {
        const totalCredits = courses.reduce((s, c) => s + c.credits, 0);
        document.getElementById('enrolled-title').textContent = `Enrolled (${courses.length}/5) — ${totalCredits} credits`;

        const list = document.getElementById('enrolled-list');
        const empty = document.getElementById('enrolled-empty');

        if (courses.length === 0) {
            list.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }
        empty.classList.add('hidden');

        list.innerHTML = courses.map((c, i) => `
            <div class="enrolled-item">
                <div class="enrolled-info">
                    <h4>${c.name}</h4>
                    <p>${c.credits} credits</p>
                </div>
                <button class="enrolled-delete" onclick="removeCourse(${i})"><i class="ph ph-trash"></i></button>
            </div>
        `).join('');
    };

    window.removeCourse = (i) => {
        courses.splice(i, 1);
        renderCourses();
    };

    document.getElementById('enroll-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (courses.length >= 5) { alert('Maximum 5 courses allowed!'); return; }
        const name = document.getElementById('enr-course').value.trim();
        const credits = parseInt(document.getElementById('enr-credits').value);
        if (!name || isNaN(credits)) return;
        if (courses.find(c => c.name === name)) { alert('Course already enrolled!'); return; }
        courses.push({ name, credits });
        renderCourses();
        e.target.reset();
    });

    renderCourses();

    // ─── 3. Student Records (Client-side) ───
    let studentRecords = [];

    const gradeColor = (g) => {
        if (g === 'A') return 'badge-green';
        if (g === 'B') return 'badge-blue';
        if (g === 'C') return 'badge-orange';
        return 'badge-red';
    };

    const renderStudentRecords = () => {
        const table = document.getElementById('student-records-table');
        if (studentRecords.length === 0) {
            table.innerHTML = '<p class="text-muted">No students added yet.</p>';
            document.getElementById('student-stats').innerHTML = '';
            return;
        }

        let html = `<table><thead><tr><th>Name</th><th>Age</th><th>Grade</th><th>Events</th></tr></thead><tbody>`;
        studentRecords.forEach(s => {
            const tags = s.events.map(e => `<span class="tag">${e}</span>`).join(' ');
            html += `<tr><td>${s.name}</td><td>${s.age}</td><td><span class="badge ${gradeColor(s.grade)}">${s.grade}</span></td><td>${tags || '-'}</td></tr>`;
        });
        html += `</tbody></table>`;
        table.innerHTML = html;

        // Set operations for stats
        const allEventsSet = new Set();
        const eventSets = studentRecords.map(s => new Set(s.events));
        eventSets.forEach(set => set.forEach(e => allEventsSet.add(e)));

        let commonEvents = eventSets.length > 0 ? new Set(eventSets[0]) : new Set();
        eventSets.forEach(set => { commonEvents = new Set([...commonEvents].filter(e => set.has(e))); });

        const gradeA = studentRecords.filter(s => s.grade === 'A').map(s => s.name);

        document.getElementById('student-stats').innerHTML = `
            <div class="stat-card"><div class="stat-label">Common Events</div><div class="stat-value">${commonEvents.size > 0 ? [...commonEvents].join(', ') : 'None'}</div><div class="stat-sub">Intersection of all sets</div></div>
            <div class="stat-card"><div class="stat-label">All Events</div><div class="stat-value">${[...allEventsSet].join(', ') || 'None'}</div><div class="stat-sub">Union of all sets</div></div>
            <div class="stat-card"><div class="stat-label">Grade A Students</div><div class="stat-value">${gradeA.length > 0 ? gradeA.join(', ') : 'None'}</div><div class="stat-sub">${gradeA.length} student(s)</div></div>
        `;
    };

    document.getElementById('btn-add-student').addEventListener('click', () => {
        const name = document.getElementById('sr-name').value.trim();
        const age = parseInt(document.getElementById('sr-age').value);
        const grade = document.getElementById('sr-grade').value;
        const eventsRaw = document.getElementById('sr-events').value.trim();
        if (!name || isNaN(age)) { alert('Please fill Name and Age.'); return; }
        const events = eventsRaw ? eventsRaw.split(',').map(e => e.trim()).filter(e => e) : [];
        studentRecords.push({ name, age, grade, events });
        renderStudentRecords();
        document.getElementById('sr-name').value = '';
        document.getElementById('sr-age').value = '';
        document.getElementById('sr-events').value = '';
    });

    // ─── 4. Search & Sort (Client-side) ───
    document.getElementById('btn-run-ss').addEventListener('click', () => {
        const raw = document.getElementById('ss-ids').value.trim();
        const target = parseInt(document.getElementById('ss-target').value);
        if (!raw) return;

        const ids = raw.split(/[,\s]+/).map(Number).filter(n => !isNaN(n));

        // Bubble Sort
        const sorted = [...ids];
        for (let i = 0; i < sorted.length; i++) {
            for (let j = 0; j < sorted.length - i - 1; j++) {
                if (sorted[j] > sorted[j + 1]) {
                    [sorted[j], sorted[j + 1]] = [sorted[j + 1], sorted[j]];
                }
            }
        }

        // Linear Search on original
        let linearIdx = -1;
        for (let i = 0; i < ids.length; i++) {
            if (ids[i] === target) { linearIdx = i; break; }
        }

        // Binary Search on sorted
        let binaryIdx = -1;
        let low = 0, high = sorted.length - 1;
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (sorted[mid] === target) { binaryIdx = mid; break; }
            else if (sorted[mid] < target) low = mid + 1;
            else high = mid - 1;
        }

        // Render
        document.getElementById('ss-original').innerHTML = ids.map(n => `<span class="num-badge num-badge-plain">${n}</span>`).join('');
        document.getElementById('ss-sorted').innerHTML = sorted.map(n => `<span class="num-badge num-badge-sorted">${n}</span>`).join('');
        document.getElementById('ss-linear').innerHTML = linearIdx !== -1
            ? `Found <strong>${target}</strong> at index <strong>${linearIdx}</strong> in original list.`
            : `<strong>${target}</strong> not found in original list.`;
        document.getElementById('ss-binary').innerHTML = binaryIdx !== -1
            ? `Found <strong>${target}</strong> at index <strong>${binaryIdx}</strong> in sorted list.`
            : `<strong>${target}</strong> not found in sorted list.`;
        document.getElementById('ss-results').classList.remove('hidden');
    });

    // ─── 5. Fee Calculator ───
    document.getElementById('fee-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const tuition = document.getElementById('fee-tuition').value;
        const hostel = document.getElementById('fee-hostel').value;
        const transport = document.getElementById('fee-transport').value;
        try {
            const res = await fetch('/calculate_fee', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tuition, hostel, transport })
            });
            const data = await res.json();
            showResult('fee-result', true, `Total Fee: ₹${data.total}`);
        } catch (err) {
            showResult('fee-result', false, 'Network error');
        }
    });

    // ─── 6. Academic Records (Backend file-based) ───
    const loadAcademicRecords = async () => {
        try {
            const res = await fetch('/academic/records');
            const data = await res.json();
            if (!data.success) return;

            const records = data.records;
            const stats = data.stats;

            // Stats cards
            document.getElementById('academic-stats').innerHTML = `
                <div class="stat-card"><div class="stat-label">Total Students</div><div class="stat-value">${stats.total}</div></div>
                <div class="stat-card"><div class="stat-label">Average Marks</div><div class="stat-value">${stats.avg}</div></div>
                <div class="stat-card"><div class="stat-label">Top Student</div><div class="stat-value">${stats.top_name}</div><div class="stat-sub">${stats.top_id} — ${stats.top_marks} marks</div></div>
            `;

            // Table
            if (records.length === 0) {
                document.getElementById('academic-table').innerHTML = '<p class="text-muted">No records yet.</p>';
                return;
            }
            let html = `<table><thead><tr><th>ID</th><th>Name</th><th>Marks</th></tr></thead><tbody>`;
            records.forEach(r => { html += `<tr><td>${r.id}</td><td>${r.name}</td><td>${r.marks}</td></tr>`; });
            html += `</tbody></table>`;
            document.getElementById('academic-table').innerHTML = html;
        } catch (err) {
            console.error('Failed to load academic records');
        }
    };

    document.getElementById('academic-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('ac-id').value.trim();
        const name = document.getElementById('ac-name').value.trim();
        const marks = document.getElementById('ac-marks').value;
        try {
            await fetch('/academic/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name, marks })
            });
            e.target.reset();
            loadAcademicRecords();
        } catch (err) {
            console.error('Failed to add record');
        }
    });

    loadAcademicRecords();

    // ─── 7. Directory Scanner ───
    document.getElementById('scan-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const path = document.getElementById('scan-path').value;
        try {
            const res = await fetch(`/scan_dir?path=${encodeURIComponent(path)}`);
            const data = await res.json();
            if (data.success) {
                let html = '<ul style="list-style:none;padding:0;">';
                data.result.forEach(f => { html += `<li style="padding:0.3rem 0;"><i class="ph ph-file-text" style="margin-right:8px;"></i>${f}</li>`; });
                html += '</ul>';
                const el = document.getElementById('scan-result');
                el.className = 'result-box result-success';
                el.innerHTML = `<strong>Scan successful (${path}):</strong><br><br>${html}`;
            } else {
                showResult('scan-result', false, `Error: ${data.result}`);
            }
        } catch (err) {
            showResult('scan-result', false, 'Network error');
        }
    });

    // ─── 8. Performance Analytics (Backend + Chart.js) ───
    let analyticsChart = null;

    const loadAnalytics = async () => {
        try {
            const res = await fetch('/analytics/data');
            const data = await res.json();
            if (!data.success) {
                document.getElementById('analytics-top').innerHTML = '';
                return;
            }

            // Chart
            const ctx = document.getElementById('analytics-chart').getContext('2d');
            if (analyticsChart) analyticsChart.destroy();
            analyticsChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.chart_data.names,
                    datasets: [{
                        label: 'Average Score',
                        data: data.chart_data.averages,
                        backgroundColor: '#4f46e5',
                        borderRadius: 6,
                        maxBarThickness: 60
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, max: 100, grid: { color: '#f1f5f9' } },
                        x: { grid: { display: false } }
                    },
                    plugins: { legend: { display: false } }
                }
            });

            // Top performers
            const top = data.top;
            document.getElementById('analytics-top').innerHTML = `
                <div class="stat-card"><div class="stat-label">Top in Math</div><div class="stat-value">${top.math.name}</div><div><span class="marks-badge">${top.math.marks} marks</span></div></div>
                <div class="stat-card"><div class="stat-label">Top in Science</div><div class="stat-value">${top.science.name}</div><div><span class="marks-badge">${top.science.marks} marks</span></div></div>
                <div class="stat-card"><div class="stat-label">Top in English</div><div class="stat-value">${top.english.name}</div><div><span class="marks-badge">${top.english.marks} marks</span></div></div>
            `;
        } catch (err) {
            console.error('Failed to load analytics');
        }
    };

    document.getElementById('analytics-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const Name = document.getElementById('an-name').value.trim();
        const Math = parseInt(document.getElementById('an-math').value);
        const Science = parseInt(document.getElementById('an-science').value);
        const English = parseInt(document.getElementById('an-english').value);
        try {
            await fetch('/analytics/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Name, Math, Science, English })
            });
            e.target.reset();
            loadAnalytics();
        } catch (err) {
            console.error('Failed to add analytics record');
        }
    });

    loadAnalytics();
});
