// --- QUẢN LÝ DARK MODE ---
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const currentTheme = localStorage.getItem('theme') || 'light';

if (currentTheme === 'dark') {
    body.setAttribute('data-theme', 'dark');
    themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

themeToggle.addEventListener('click', () => {
    if (body.hasAttribute('data-theme')) {
        body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    } else {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
});

// --- BIẾN TOÀN CỤC ---
let examsData = [];

// --- LOGIC TRANG CHỦ (INDEX.HTML) ---
const examListContainer = document.getElementById('exam-list');
if (examListContainer) {
    const searchInput = document.getElementById('search-input');
    const filterYear = document.getElementById('filter-year');
    const filterType = document.getElementById('filter-type');

    // Fetch dữ liệu từ JSON
    fetch('data/data.json')
        .then(response => response.json())
        .then(data => {
            examsData = data;
            renderExams(examsData);
        })
        .catch(err => console.error("Lỗi tải dữ liệu JSON:", err));

    // Hàm Render danh sách
    function renderExams(exams) {
        examListContainer.innerHTML = '';
        if (exams.length === 0) {
            examListContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Không tìm thấy đề thi phù hợp.</p>';
            return;
        }

        exams.forEach(exam => {
            const card = document.createElement('div');
            card.className = 'card';
            card.onclick = () => window.location.href = `detail.html?id=${exam.id}`;
            
            // Format class độ khó để tô màu
            const diffClass = `diff-${exam.dokho.replace(/\s+/g, '.')}`;

            card.innerHTML = `
                <h3 class="card-title">${exam.ten}</h3>
                <div class="card-tags">
                    <span class="tag"><i class="fa-regular fa-calendar"></i> ${exam.nam}</span>
                    <span class="tag"><i class="fa-solid fa-graduation-cap"></i> ${exam.kythi}</span>
                    <span class="tag ${diffClass}">${exam.dokho}</span>
                </div>
                <p class="card-desc">${exam.mota}</p>
                <div class="card-btn">Xem chi tiết</div>
            `;
            examListContainer.appendChild(card);
        });
    }

    // Hàm xử lý Lọc & Tìm kiếm
    function filterExams() {
        const searchTerm = searchInput.value.toLowerCase();
        const year = filterYear.value;
        const type = filterType.value;

        const filtered = examsData.filter(exam => {
            const matchSearch = exam.ten.toLowerCase().includes(searchTerm) || exam.mota.toLowerCase().includes(searchTerm);
            const matchYear = year === 'all' || exam.nam.toString() === year;
            const matchType = type === 'all' || exam.kythi === type;
            return matchSearch && matchYear && matchType;
        });

        renderExams(filtered);
    }

    searchInput.addEventListener('input', filterExams);
    filterYear.addEventListener('change', filterExams);
    filterType.addEventListener('change', filterExams);
}

// --- LOGIC TRANG CHI TIẾT (DETAIL.HTML) ---
const examDetailContainer = document.getElementById('exam-detail');
if (examDetailContainer) {
    // Lấy ID từ URL (VD: detail.html?id=bai1-olympic10)
    const urlParams = new URLSearchParams(window.location.search);
    const examId = urlParams.get('id');

    if (examId) {
        fetch('data/data.json')
            .then(res => res.json())
            .then(data => {
                const exam = data.find(e => e.id === examId);
                if (exam) {
                    document.getElementById('detail-title').innerText = exam.ten;
                    
                    // Xử lý hiển thị PDF
                    const pdfViewer = document.getElementById('pdf-viewer');
                    // Gắn thêm param #toolbar=0 để giao diện PDF sạch hơn
                    pdfViewer.src = `${exam.file}#view=FitH`;

                    // Lấy nội dung lời giải HTML bằng Fetch API
                    // Lấy nội dung lời giải HTML bằng Fetch API
                    fetch(exam.loigiai)
                        .then(res => res.text())
                        .then(html => {
                            document.getElementById('solution-content').innerHTML = html;
                            
                            // 1. Gọi PrismJS render highlight code (đã có)
                            if (window.Prism) {
                                Prism.highlightAll();
                            }
                            
                            // 2. MỚI THÊM: Gọi MathJax render công thức toán học
                            if (window.MathJax) {
                                MathJax.typesetPromise();
                            }
                        })
                        .catch(err => {
                            document.getElementById('solution-content').innerHTML = '<p style="color:red">Không thể tải file hướng dẫn giải.</p>';
                        });
                } else {
                    document.getElementById('detail-title').innerText = "Không tìm thấy đề thi!";
                }
            });
    } else {
        document.getElementById('detail-title').innerText = "URL không hợp lệ!";
    }
}
