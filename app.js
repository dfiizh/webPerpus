// Globals are now loaded sequentially via index.html

let currentUser = { id: 'mock-user-id', email: 'guest@example.com' };
let currentProfile = { id: 'mock-user-id', name: 'Guest User', email: 'guest@example.com', role: 'user', created_at: new Date().toISOString() };
let currentBooksPage = 1;
let currentHistoryPage = 1;
let booksSearchTerm = '';
let booksCategoryId = '';

// MOCK DATA
const mockCategories = [
    { id: 'c1', name: 'Fiksi' },
    { id: 'c2', name: 'Non-Fiksi' },
    { id: 'c3', name: 'Sains' },
    { id: 'c4', name: 'Sejarah' },
    { id: 'c5', name: 'Teknologi' },
    { id: 'c6', name: 'Fantasi' },
    { id: 'c7', name: 'Sastra' }
];

let mockBooks = [
    { id: 'b1', title: '1', author: 'Penulis 1', category_id: 'c7', stock: 5, cover_url: 'assets/1.jpg', description: 'Deskripsi buku 1.' },
    { id: 'b2', title: '2', author: 'Penulis 2', category_id: 'c2', stock: 3, cover_url: 'assets/2.jpg', description: 'Deskripsi buku 2.' },
    { id: 'b3', title: '3', author: 'Penulis 3', category_id: 'c2', stock: 4, cover_url: 'assets/3.jpg', description: 'Deskripsi buku 3.' },
    { id: 'b4', title: '4', author: 'Penulis 4', category_id: 'c1', stock: 6, cover_url: 'assets/4.jpg', description: 'Deskripsi buku 4.' },
    { id: 'b5', title: '5', author: 'Penulis 5', category_id: 'c2', stock: 2, cover_url: 'assets/5.jpg', description: 'Deskripsi buku 5.' },
    { id: 'b6', title: '6', author: 'Penulis 6', category_id: 'c6', stock: 7, cover_url: 'assets/6.jpg', description: 'Deskripsi buku 6.' },
    { id: 'b7', title: '7', author: 'Penulis 7', category_id: 'c5', stock: 3, cover_url: 'assets/7.jpeg', description: 'Deskripsi buku 7.' },
    { id: 'b8', title: '8', author: 'Penulis 8', category_id: 'c3', stock: 5, cover_url: 'assets/8.jpg', description: 'Deskripsi buku 8.' },
    { id: 'b9', title: '9', author: 'Penulis 9', category_id: 'c7', stock: 4, cover_url: 'assets/9.jpg', description: 'Deskripsi buku 9.' },
    { id: 'b10', title: '10', author: 'Penulis 10', category_id: 'c7', stock: 8, cover_url: 'assets/10.jpg', description: 'Deskripsi buku 10.' },
];
// Populate book categories
mockBooks.forEach(b => {
    b.categories = mockCategories.find(c => c.id === b.category_id) || { name: 'Uncategorized' };
});

let mockBorrowings = [];

// Mock users database
let mockUsers = [
    { id: 'u1', name: 'Guest User', email: 'guest@example.com', password: '123456', role: 'user' },
    { id: 'u2', name: 'Admin', email: 'admin', password: 'admin123', role: 'admin' }
];

function initApp() {
    initDarkMode();
    initModals();

    setupNavigation();
    setupTopBar();
    setupProfileForm();
    setupAuth();

    // Jelajahi Buku button → navigate to Koleksi Buku
    document.getElementById('explore-books-btn').addEventListener('click', () => {
        document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
        document.getElementById('books-view').classList.add('active');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const booksNav = document.querySelector('[data-view="books-view"]');
        if (booksNav) booksNav.classList.add('active');
        loadBooksView();
    });
}

function setupAuth() {
    // Toggle between login & register
    document.getElementById('go-register').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('register-container').style.display = 'flex';
    });
    document.getElementById('go-login').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('register-container').style.display = 'none';
        document.getElementById('login-container').style.display = 'flex';
    });

    // Password visibility toggle
    document.querySelectorAll('.toggle-pw').forEach(icon => {
        icon.addEventListener('click', () => {
            const input = document.getElementById(icon.dataset.target);
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('ph-eye', 'ph-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('ph-eye-slash', 'ph-eye');
            }
        });
    });

    // Login Tabs
    const tabUser = document.getElementById('tab-login-user');
    const tabAdmin = document.getElementById('tab-login-admin');
    const roleInput = document.getElementById('login-role');
    const loginTitle = document.getElementById('login-title');

    tabUser.addEventListener('click', (e) => {
        e.preventDefault();
        tabUser.classList.add('active');
        tabUser.style.color = 'var(--primary-color)';
        tabUser.style.borderBottomColor = 'var(--primary-color)';
        tabAdmin.classList.remove('active');
        tabAdmin.style.color = 'var(--text-light)';
        tabAdmin.style.borderBottomColor = 'transparent';
        roleInput.value = 'user';
        loginTitle.textContent = 'Login User';
    });

    tabAdmin.addEventListener('click', (e) => {
        e.preventDefault();
        tabAdmin.classList.add('active');
        tabAdmin.style.color = 'var(--primary-color)';
        tabAdmin.style.borderBottomColor = 'var(--primary-color)';
        tabUser.classList.remove('active');
        tabUser.style.color = 'var(--text-light)';
        tabUser.style.borderBottomColor = 'transparent';
        roleInput.value = 'admin';
        loginTitle.textContent = 'Login Admin';
    });

    // Login form
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const role = document.getElementById('login-role').value;

        const user = mockUsers.find(u => u.email === email && u.password === password && u.role === role);
        if (!user) {
            showToast('Email, password, atau role salah!', 'error');
            return;
        }

        currentUser = { id: user.id, email: user.email };
        currentProfile = { id: user.id, name: user.name, email: user.email, role: user.role, created_at: new Date().toISOString() };
        showToast(`Selamat datang, ${user.name}!`, 'success');
        showDashboard();
    });

    // Register form
    document.getElementById('register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;

        if (password.length < 6) {
            showToast('Password minimal 6 karakter', 'warning');
            return;
        }
        if (mockUsers.find(u => u.email === email)) {
            showToast('Email sudah terdaftar', 'warning');
            return;
        }

        const newUser = { id: 'u' + Date.now(), name, email, password, role: 'user' };
        mockUsers.push(newUser);

        showToast('Registrasi berhasil! Silakan login.', 'success');
        document.getElementById('register-container').style.display = 'none';
        document.getElementById('login-container').style.display = 'flex';
        document.getElementById('login-email').value = email;
        document.getElementById('login-password').value = '';
    });

    // Forgot password link
    document.getElementById('forgot-link').addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Fitur reset password belum tersedia.', 'info');
    });

    // Logout buttons
    document.getElementById('logout-btn').addEventListener('click', doLogout);
    document.getElementById('dropdown-logout').addEventListener('click', (e) => {
        e.preventDefault();
        doLogout();
    });
}

function doLogout() {
    document.getElementById('app-dashboard').style.display = 'none';
    document.getElementById('auth-wrapper').style.display = '';
    document.getElementById('login-container').style.display = 'flex';
    document.getElementById('register-container').style.display = 'none';
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    showToast('Berhasil logout', 'info');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

function showDashboard() {
    document.getElementById('auth-wrapper').style.display = 'none';
    document.getElementById('app-dashboard').style.display = 'flex';
    
    // Update user info in UI
    document.getElementById('user-display-name').textContent = currentProfile.name;
    const greetingName = document.getElementById('user-greeting-name');
    if (greetingName) greetingName.textContent = currentProfile.name;
    document.getElementById('user-avatar-img').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentProfile.name)}&background=d96c6c&color=fff`;

    // Role-based UI
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    if (currentProfile.role === 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = '');
        document.querySelectorAll('.user-only').forEach(el => el.style.display = 'none');
        document.getElementById('admin-dashboard').classList.add('active');
        const adminNav = document.querySelector('[data-view="admin-dashboard"]');
        if (adminNav) adminNav.classList.add('active');
        loadAdminDashboardView();
    } else {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.user-only').forEach(el => el.style.display = '');
        document.getElementById('home-view').classList.add('active');
        const homeNav = document.querySelector('[data-view="home-view"]');
        if (homeNav) homeNav.classList.add('active');
        loadHomeView();
    }
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-menu .nav-item, .nav-item-link');
    const views = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-view');
            if (!targetId) return;

            navItems.forEach(nav => {
                if (nav.classList.contains('nav-item')) nav.classList.remove('active');
            });
            if (item.classList.contains('nav-item')) item.classList.add('active');
            
            views.forEach(view => view.classList.remove('active'));
            const targetView = document.getElementById(targetId);
            if (targetView) targetView.classList.add('active');

            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('active');
                document.getElementById('sidebar-overlay').classList.remove('show');
            }

            // Load data for view
            switch(targetId) {
                case 'home-view': loadHomeView(); break;
                case 'books-view': loadBooksView(); break;
                case 'borrow-view': loadBorrowView(); break;
                case 'history-view': loadHistoryView(); break;
                case 'profile-view': loadProfileView(); break;
                case 'admin-dashboard': loadAdminDashboardView(); break;
                case 'admin-books': loadAdminBooksView(); break;
                case 'admin-borrowings': loadAdminBorrowingsView(); break;
            }
        });
    });

}

function setupTopBar() {
    document.getElementById('menu-toggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('active');
        document.getElementById('sidebar-overlay').classList.add('show');
    });

    document.getElementById('sidebar-overlay').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('active');
        document.getElementById('sidebar-overlay').classList.remove('show');
    });

    document.getElementById('dark-mode-btn').addEventListener('click', toggleDarkMode);
    document.getElementById('dark-toggle-topbar').addEventListener('click', toggleDarkMode);

    document.getElementById('user-menu-trigger').addEventListener('click', () => {
        document.getElementById('user-dropdown').classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-profile')) {
            document.getElementById('user-dropdown').classList.remove('show');
        }
    });
}

function getUserStats() {
    const activeBorrowed = mockBorrowings.filter(b => b.status === 'borrowed').length;
    const returned = mockBorrowings.filter(b => b.status === 'returned').length;
    const overdue = mockBorrowings.filter(b => b.status === 'overdue').length;
    return { totalBorrowed: mockBorrowings.length, activeBorrowed, returned, overdue };
}

function loadHomeView() {
    const stats = getUserStats();
    document.getElementById('stat-my-borrowed').textContent = stats.activeBorrowed;
    document.getElementById('stat-overdue').textContent = stats.overdue;
    document.getElementById('stat-total-books').textContent = mockBooks.length;

    const popular = mockBooks.slice(0, 8);
    const popContainer = document.getElementById('popular-books-container');
    popContainer.innerHTML = '';
    if (popular.length === 0) {
        popContainer.innerHTML = '<p class="text-muted" style="margin-left: 20px;">Belum ada buku.</p>';
    } else {
        popular.forEach(b => {
            const div = document.createElement('div');
            div.className = 'book-card';
            div.innerHTML = `
                <img src="${escapeHtml(b.cover_url || 'https://via.placeholder.com/150x200')}" alt="Cover">
                <h3>${escapeHtml(b.title)}</h3>
                <div class="book-author">${escapeHtml(b.author)}</div>
            `;
            div.addEventListener('click', () => openBookDetail(b));
            popContainer.appendChild(div);
        });
    }

    const activeBorrows = mockBorrowings.filter(b => b.status === 'borrowed' || b.status === 'overdue');
    const borrowsContainer = document.getElementById('home-borrowed-list');
    borrowsContainer.innerHTML = '';
    if (activeBorrows.length === 0) {
        borrowsContainer.innerHTML = '<p class="text-muted">Tidak ada peminjaman aktif.</p>';
    } else {
        activeBorrows.slice(0,3).forEach(b => {
            const div = document.createElement('div');
            div.className = 'borrowed-item-home';
            div.innerHTML = `
                <div class="bh-info">
                    <strong>${escapeHtml(b.books.title)}</strong>
                    <small>Batas: ${formatDate(b.return_date)}</small>
                </div>
                ${b.status === 'overdue' ? '<span class="status-badge status-overdue">Terlambat</span>' : ''}
            `;
            borrowsContainer.appendChild(div);
        });
    }
}

function loadBooksView() {
    const catSelect = document.getElementById('category-filter');
    if (catSelect.options.length <= 1) {
        mockCategories.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.name;
            catSelect.appendChild(opt);
        });
        
        catSelect.addEventListener('change', () => {
            booksCategoryId = catSelect.value;
            currentBooksPage = 1;
            renderBooksList();
        });
        
        const searchInput = document.getElementById('books-search-input');
        searchInput.addEventListener('input', debounce((e) => {
            booksSearchTerm = e.target.value.toLowerCase();
            currentBooksPage = 1;
            renderBooksList();
        }, 300));
    }
    
    renderBooksList();
}

function renderBooksList() {
    const grid = document.getElementById('books-grid-container');
    
    let filtered = mockBooks;
    if (booksSearchTerm) {
        filtered = filtered.filter(b => b.title.toLowerCase().includes(booksSearchTerm) || b.author.toLowerCase().includes(booksSearchTerm));
    }
    if (booksCategoryId) {
        filtered = filtered.filter(b => b.category_id === booksCategoryId);
    }

    const PAGE_SIZE = 12;
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
    const start = (currentBooksPage - 1) * PAGE_SIZE;
    const pagedBooks = filtered.slice(start, start + PAGE_SIZE);

    grid.innerHTML = '';
    if (pagedBooks.length === 0) {
        grid.innerHTML = '<p class="text-muted">Buku tidak ditemukan.</p>';
    } else {
        pagedBooks.forEach(b => {
            const card = document.createElement('div');
            card.className = 'book-card';
            card.innerHTML = `
                <div class="book-cover-wrapper">
                    <img src="${escapeHtml(b.cover_url || 'https://via.placeholder.com/150x200')}" alt="Cover">
                    ${b.stock === 0 ? '<div class="out-of-stock-overlay">Habis</div>' : ''}
                </div>
                <div class="book-info">
                    <span class="book-cat">${escapeHtml(b.categories?.name || 'Uncategorized')}</span>
                    <h3>${escapeHtml(b.title)}</h3>
                    <p class="author">${escapeHtml(b.author)}</p>
                </div>
            `;
            card.addEventListener('click', () => openBookDetail(b));
            grid.appendChild(card);
        });
    }

    renderPagination(document.getElementById('books-pagination'), currentBooksPage, totalPages, (page) => {
        currentBooksPage = page;
        renderBooksList();
    });
}

function openBookDetail(book) {
    document.getElementById('modal-book-title').textContent = book.title;
    document.getElementById('modal-book-author').textContent = book.author;
    document.getElementById('modal-book-category').textContent = book.categories?.name || 'Uncategorized';
    document.getElementById('modal-book-stock').textContent = `Stok: ${book.stock}`;
    document.getElementById('modal-book-desc').textContent = book.description || 'Tidak ada deskripsi.';
    document.getElementById('modal-book-cover').src = book.cover_url || 'https://via.placeholder.com/150x200';
    
    const borrowDateInput = document.getElementById('borrow-date');
    const returnDateInput = document.getElementById('return-date');
    const btn = document.getElementById('borrow-confirm-btn');
    
    const today = getTodayISO();
    borrowDateInput.value = today;
    borrowDateInput.min = today;
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    returnDateInput.value = nextWeek.toISOString().split('T')[0];
    returnDateInput.min = today;

    const nikInput = document.getElementById('borrow-nik');
    const dobInput = document.getElementById('borrow-dob');

    // Prevent return date before borrow date
    borrowDateInput.addEventListener('change', function() {
        returnDateInput.min = this.value;
        if (returnDateInput.value < this.value) {
            returnDateInput.value = this.value;
        }
    });

    if (book.stock <= 0) {
        btn.disabled = true;
        btn.innerHTML = '<i class="ph ph-warning"></i> Stok Habis';
        btn.onclick = null;
    } else {
        btn.disabled = false;
        btn.innerHTML = '<i class="ph ph-book-bookmark"></i> Ajukan Peminjaman';
        btn.onclick = () => {
            if (!nikInput.value || nikInput.value.length !== 16) {
                showToast('NIK harus 16 digit', 'warning');
                return;
            }
            if (!dobInput.value) {
                showToast('Tanggal lahir harus diisi', 'warning');
                return;
            }
            if (!borrowDateInput.value || !returnDateInput.value) {
                showToast('Tanggal harus diisi', 'warning');
                return;
            }
            if (returnDateInput.value < borrowDateInput.value) {
                showToast('Tanggal kembali tidak valid', 'warning');
                return;
            }
            // Mock borrow logic (Pending status waiting for admin)
            mockBorrowings.unshift({
                id: 'brw_' + Date.now(),
                user_id: currentUser.id,
                user_nik: nikInput.value,
                user_dob: dobInput.value,
                book_id: book.id,
                books: book,
                borrow_date: borrowDateInput.value,
                return_date: returnDateInput.value,
                status: 'pending',
                actual_return_date: null
            });
            book.stock -= 1; // local update
            
            showToast(`Berhasil meminjam "${book.title}"`, 'success');
            closeModal('book-detail-modal');

            if(document.getElementById('books-view').classList.contains('active')) renderBooksList();
            if(document.getElementById('home-view').classList.contains('active')) loadHomeView();
        };
    }

    openModal('book-detail-modal');
}

function loadBorrowView() {
    const container = document.getElementById('active-borrowings-container');
    const activeBorrows = mockBorrowings.filter(b => b.status === 'borrowed' || b.status === 'overdue');
    
    container.innerHTML = '';
    if (activeBorrows.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="ph ph-books"></i>
                <p>Anda belum meminjam buku apapun.</p>
                <button class="btn-primary" onclick="document.querySelector('[data-view=books-view]').click()">Cari Buku</button>
            </div>
        `;
        return;
    }

    activeBorrows.forEach(b => {
        const isOverdue = b.status === 'overdue' || getDaysUntil(b.return_date) < 0;
        const div = document.createElement('div');
        div.className = 'borrowed-item' + (isOverdue ? ' overdue' : '');
        div.innerHTML = `
            <div class="borrowed-book-info">
                <img src="${escapeHtml(b.books?.cover_url || 'https://via.placeholder.com/150')}" alt="Cover" class="borrowed-cover">
                <div>
                    <span class="book-title">${escapeHtml(b.books?.title)}</span>
                    <span class="book-author-small">${escapeHtml(b.books?.author)}</span>
                </div>
            </div>
            <div class="borrowed-dates">
                <div class="borrow-date"><i class="ph ph-calendar-plus"></i> Pinjam: ${formatDate(b.borrow_date)}</div>
                <div class="return-date ${isOverdue ? 'text-danger' : ''}"><i class="ph ph-calendar-check"></i> Kembali: ${formatDate(b.return_date)}</div>
            </div>
            <div style="display:flex; align-items:center; gap: 1rem;">
                ${isOverdue ? '<span class="status-badge status-overdue" style="margin-bottom:10px;">Terlambat</span>' : ''}
                <button class="btn-secondary detail-btn" data-id="${b.id}">Detail</button>
            </div>
        `;
        container.appendChild(div);
    });

    container.querySelectorAll('.detail-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const borrowing = mockBorrowings.find(br => br.id === btn.dataset.id);
            if (borrowing) {
                openBorrowDetail(borrowing);
            }
        });
    });
}

function openBorrowDetail(b) {
    // Populate ticket info
    document.getElementById('ticket-borrow-title').textContent = b.books.title;
    document.getElementById('ticket-borrow-cover').src = b.books.cover_url || 'https://via.placeholder.com/150x200';
    document.getElementById('ticket-borrow-date').textContent = formatDate(b.borrow_date);
    document.getElementById('ticket-borrow-due').textContent = formatDate(b.return_date);
    
    // Switch to ticket view
    document.querySelectorAll('.view-section').forEach(view => view.classList.remove('active'));
    document.getElementById('ticket-view').classList.add('active');

    // Handle back button
    document.getElementById('btn-back-ticket').onclick = () => {
        document.querySelectorAll('.view-section').forEach(view => view.classList.remove('active'));
        document.getElementById('borrow-view').classList.add('active');
    };

    // Handle download button using html2canvas
    document.getElementById('btn-download-ticket').onclick = () => {
        const captureArea = document.getElementById('ticket-capture-area');
        if (typeof html2canvas !== 'undefined') {
            html2canvas(captureArea, { backgroundColor: null }).then(canvas => {
                const link = document.createElement('a');
                link.download = `Tiket-${b.books.title.replace(/\s+/g, '-')}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                showToast('Tiket berhasil didownload', 'success');
            });
        } else {
            showToast('Fitur download tidak tersedia (html2canvas tidak termuat)', 'error');
        }
    };
}

function loadHistoryView() {
    const tbody = document.getElementById('history-tbody');
    const PAGE_SIZE = 10;
    const totalPages = Math.ceil(mockBorrowings.length / PAGE_SIZE) || 1;
    const start = (currentHistoryPage - 1) * PAGE_SIZE;
    const pagedBorrowings = mockBorrowings.slice(start, start + PAGE_SIZE);
    
    tbody.innerHTML = '';
    if (pagedBorrowings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Belum ada riwayat peminjaman</td></tr>';
    } else {
        pagedBorrowings.forEach(b => {
            let statusHtml = '';
            if (b.status === 'returned') statusHtml = '<span class="status-badge status-returned">Dikembalikan</span>';
            else if (b.status === 'overdue') statusHtml = '<span class="status-badge status-overdue">Terlambat</span>';
            else statusHtml = '<span class="status-badge status-borrowed">Dipinjam</span>';

            tbody.innerHTML += `
                <tr>
                    <td>
                        <div class="table-book">
                            <img src="${escapeHtml(b.books?.cover_url || 'https://via.placeholder.com/50')}" alt="Cover" class="table-cover">
                            <div>
                                <div class="table-title">${escapeHtml(b.books?.title)}</div>
                                <small class="text-muted">${escapeHtml(b.books?.author)}</small>
                            </div>
                        </div>
                    </td>
                    <td>${formatDate(b.borrow_date)}</td>
                    <td>${formatDate(b.return_date)}</td>
                    <td>${b.actual_return_date ? formatDate(b.actual_return_date) : '-'}</td>
                    <td>${statusHtml}</td>
                </tr>
            `;
        });
    }

    renderPagination(document.getElementById('history-pagination'), currentHistoryPage, totalPages, (page) => {
        currentHistoryPage = page;
        loadHistoryView();
    });
}

function loadProfileView() {
    const stats = getUserStats();
    document.getElementById('profile-avatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentProfile.name)}&background=d96c6c&color=fff&size=120`;
    document.getElementById('profile-name-display').textContent = currentProfile.name;
    document.getElementById('profile-email-display').innerHTML = `<i class="ph ph-envelope"></i> ${currentProfile.email}`;
    document.getElementById('profile-role-badge').textContent = 'Anggota';
    document.getElementById('profile-joined').textContent = `Bergabung: ${formatDate(currentProfile.created_at)}`;

    document.getElementById('pstat-total').textContent = stats.totalBorrowed;
    document.getElementById('pstat-active').textContent = stats.activeBorrowed;
    document.getElementById('pstat-returned').textContent = stats.returned;
    document.getElementById('pstat-overdue').textContent = stats.overdue;

    document.getElementById('edit-name').value = currentProfile.name;
    document.getElementById('edit-email').value = currentProfile.email;
}

function setupProfileForm() {
    const editForm = document.getElementById('profile-edit-form');
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newName = document.getElementById('edit-name').value;
            currentProfile.name = newName;
            
            showToast('Profil berhasil diupdate', 'success');
            loadProfileView();
            document.getElementById('user-display-name').textContent = newName;
            document.getElementById('user-greeting-name').textContent = newName;
            document.getElementById('user-avatar-img').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(newName)}&background=d96c6c&color=fff`;
        });
    }

    const pwForm = document.getElementById('change-password-form');
    if (pwForm) {
        pwForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newPw = document.getElementById('new-password').value;
            if (newPw.length < 6) {
                showToast('Password minimal 6 karakter', 'warning');
                return;
            }
            showToast('Password berhasil diubah', 'success');
            pwForm.reset();
        });
    }
}

// ============================================
// ADMIN VIEWS (MOCKUP)
// ============================================

function loadAdminDashboardView() {
    // Calculate mock stats
    const totalBooks = mockBooks.length;
    const totalBorrowings = mockBorrowings.length;
    const pending = mockBorrowings.filter(b => b.status === 'pending').length;
    const overdue = mockBorrowings.filter(b => b.status === 'overdue' || (b.status === 'borrowed' && b.return_date < getTodayISO())).length;

    const elTotalBooks = document.querySelector('.admin-stat-card.bg-blue h3');
    if (elTotalBooks) elTotalBooks.textContent = totalBooks;
    const elPending = document.querySelector('.admin-stat-card.bg-orange h3');
    if (elPending) elPending.textContent = pending;
    const elTotalBorrowings = document.querySelector('.admin-stat-card.bg-teal h3');
    if (elTotalBorrowings) elTotalBorrowings.textContent = totalBorrowings;
    const elOverdue = document.querySelector('.admin-stat-card.bg-red h3');
    if (elOverdue) elOverdue.textContent = overdue;

    // Load overdue list
    const overdueList = document.getElementById('admin-overdue-list');
    if (overdueList) {
        overdueList.innerHTML = '';
        const overdueItems = mockBorrowings.filter(b => b.status === 'overdue' || (b.status === 'borrowed' && b.return_date < getTodayISO()));
        if (overdueItems.length === 0) {
            overdueList.innerHTML = '<p class="text-center">Tidak ada buku yang terlambat.</p>';
        } else {
            overdueItems.forEach(b => {
                overdueList.innerHTML += `
                    <div class="overdue-item">
                        <div class="overdue-info">
                            <strong>${b.books.title}</strong>
                            <span class="text-light text-sm" style="display:block;">Peminjam: ${b.user_id} | Jatuh Tempo: ${formatDate(b.return_date)}</span>
                        </div>
                        <button class="btn-secondary warn-btn" data-id="${b.id}" style="color: var(--danger-color); border-color: var(--danger-color);"><i class="ph ph-warning"></i> Peringatkan</button>
                    </div>
                `;
            });
            document.querySelectorAll('.warn-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    showToast('Peringatan terkirim ke user', 'success');
                });
            });
        }
    }
}

let currentAdminBooksPage = 1;
function loadAdminBooksView() {
    const tbody = document.getElementById('admin-books-tbody');
    const PAGE_SIZE = 10;
    const totalPages = Math.ceil(mockBooks.length / PAGE_SIZE) || 1;
    const start = (currentAdminBooksPage - 1) * PAGE_SIZE;
    const pagedBooks = mockBooks.slice(start, start + PAGE_SIZE);

    if (tbody) {
        tbody.innerHTML = '';
        pagedBooks.forEach(b => {
            tbody.innerHTML += `
                <tr>
                    <td><img src="${b.cover_url || 'https://via.placeholder.com/50x70'}" alt="Cover" style="width:50px; height:70px; object-fit:cover; border-radius:4px;"></td>
                    <td>${b.title}</td>
                    <td>${b.author}</td>
                    <td>${b.categories?.name || '-'}</td>
                    <td>${b.stock}</td>
                    <td>
                        <button class="btn-icon" title="Edit" onclick="showToast('Edit belum tersedia', 'info')"><i class="ph ph-pencil-simple"></i></button>
                        <button class="btn-icon" title="Hapus" onclick="showToast('Hapus belum tersedia', 'info')"><i class="ph ph-trash"></i></button>
                    </td>
                </tr>
            `;
        });
        renderPagination(document.getElementById('admin-books-pagination'), currentAdminBooksPage, totalPages, (page) => {
            currentAdminBooksPage = page;
            loadAdminBooksView();
        });
    }

    // Add Book Form Handler
    const addBookBtn = document.getElementById('add-book-btn');
    if (addBookBtn && !addBookBtn.dataset.bound) {
        addBookBtn.dataset.bound = "true";
        addBookBtn.addEventListener('click', () => {
            document.getElementById('book-form').reset();
            openModal('book-form-modal');
        });

        document.getElementById('book-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('bf-title').value;
            const author = document.getElementById('bf-author').value;
            const stock = parseInt(document.getElementById('bf-stock').value) || 0;
            const cover_url = document.getElementById('bf-cover').value;
            const newBook = {
                id: 'bk_' + Date.now(),
                title, author, stock, cover_url,
                categories: { name: 'Umum' },
                description: ''
            };
            mockBooks.unshift(newBook);
            closeModal('book-form-modal');
            showToast('Buku berhasil ditambahkan', 'success');
            loadAdminBooksView();
        });
    }
}

let currentAdminBorrowingsPage = 1;
function loadAdminBorrowingsView() {
    const tbody = document.getElementById('admin-borrowings-tbody');
    const PAGE_SIZE = 10;
    const totalPages = Math.ceil(mockBorrowings.length / PAGE_SIZE) || 1;
    const start = (currentAdminBorrowingsPage - 1) * PAGE_SIZE;
    const pagedBorrowings = mockBorrowings.slice(start, start + PAGE_SIZE);

    if (tbody) {
        tbody.innerHTML = '';
        if (pagedBorrowings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">Belum ada peminjaman</td></tr>';
        } else {
            pagedBorrowings.forEach(b => {
                let statusHtml = '';
                if (b.status === 'pending') statusHtml = '<span class="status-badge status-pending" style="background:#ff9800; color:#fff;">Menunggu</span>';
                else if (b.status === 'returned') statusHtml = '<span class="status-badge status-returned">Dikembalikan</span>';
                else if (b.status === 'overdue') statusHtml = '<span class="status-badge status-overdue">Terlambat</span>';
                else statusHtml = '<span class="status-badge status-borrowed">Dipinjam</span>';

                let actionHtml = '';
                if (b.status === 'pending') {
                    actionHtml = `<button class="btn-primary confirm-borrow-btn" data-id="${b.id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Terima</button>`;
                } else if (b.status === 'borrowed' || b.status === 'overdue') {
                    actionHtml = `<button class="btn-secondary confirm-return-btn" data-id="${b.id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Kembali</button>`;
                } else {
                    actionHtml = `<span class="text-light">-</span>`;
                }

                tbody.innerHTML += `
                    <tr>
                        <td><strong>${b.user_id}</strong><br><small>${b.user_nik || '-'}</small></td>
                        <td>${b.books.title}</td>
                        <td>${formatDate(b.borrow_date)}</td>
                        <td>${formatDate(b.return_date)}</td>
                        <td>${statusHtml}</td>
                        <td>${actionHtml}</td>
                    </tr>
                `;
            });
            
            // Attach action handlers
            document.querySelectorAll('.confirm-borrow-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    const b = mockBorrowings.find(x => x.id === id);
                    if (b) b.status = 'borrowed';
                    showToast('Peminjaman diterima', 'success');
                    loadAdminBorrowingsView();
                });
            });
            
            document.querySelectorAll('.confirm-return-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    const b = mockBorrowings.find(x => x.id === id);
                    if (b) {
                        b.status = 'returned';
                        b.actual_return_date = getTodayISO();
                        b.books.stock += 1;
                    }
                    showToast('Pengembalian dikonfirmasi', 'success');
                    loadAdminBorrowingsView();
                });
            });

            renderPagination(document.getElementById('admin-borrowings-pagination'), currentAdminBorrowingsPage, totalPages, (page) => {
                currentAdminBorrowingsPage = page;
                loadAdminBorrowingsView();
            });
        }
    }
}
