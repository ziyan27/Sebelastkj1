document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app-container');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const attendanceForm = document.getElementById('attendance-form');
    const attendanceBody = document.getElementById('attendance-body');
    const currentDatetimeEl = document.getElementById('current-datetime');
    const studentNameInput = document.getElementById('student-name');
    const studentListDatalist = document.getElementById('student-list');
    
    // Elemen Modal Edit
    const editModal = document.getElementById('edit-modal');
    const closeBtn = document.querySelector('.close-btn');
    const editForm = document.getElementById('edit-form');
    const editNameInput = document.getElementById('edit-name');
    const editStatusSelect = document.getElementById('edit-status');

    let currentEditingRow = null;

    // Data siswa statis
    const students = [
        "Abdan Ibnu Aqil", "Abdul Kholik Al Muhsin", "Afgan Zayin Mubarak", "Aurelia Ramadani Putri Bahtiar", "Bahar Ahmad Gias",
        "Edu Ibnani", "Emzi Dwi Jatmiko", "Eva Yulia Munasiha", "Farhan Nawawi", "Hojin Nolutfi",
        "Intal Raudatul Janah", "Irghy Dimara", "Kisna Novariyanto", "Mitcka Raudhia Farha", "Muhammad Fazri Nurizki",
        "Muhammad Pahri", "Muhammad Alfin Hidayat", "Muhammar Ramanda Jalaludin Rumi", "Narraihan", "Rafael Fraditya Pratama",
        "Reva Nur Hikmah", "Sahrul Ramadhan", "Salman Al Parisi", "Siami Dimas Prayugo", "Tristan Raditia", "Wily Ramadhan Al Fahrezy",
        "Wisma Alfarizki", "Ziyanatu Rahmi El Haqi"
    ];

    // Menambahkan nama siswa ke datalist
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student;
        studentListDatalist.appendChild(option);
    });

    // --- FUNGSI SIMPAN DAN MUAT DATA DARI LOCAL STORAGE ---
    const saveDataToLocalStorage = () => {
        localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    };

    const loadDataFromLocalStorage = () => {
        const storedData = localStorage.getItem('attendanceData');
        return storedData ? JSON.parse(storedData) : {};
    };

    // Data Absensi yang Disimpan
    let attendanceData = loadDataFromLocalStorage();

    // --- FITUR TANGGAL WAKTU ---
    const updateDateTime = () => {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        const formattedDate = now.toLocaleDateString('id-ID', options);
        currentDatetimeEl.textContent = formattedDate;
    };
    setInterval(updateDateTime, 1000);
    updateDateTime();

    // --- FITUR LOGIN ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === 'tekaje1' && password === 'alftkj1') {
            loginContainer.classList.remove('active');
            appContainer.classList.add('active');
            localStorage.setItem('loggedIn', 'true');
            renderAttendanceTable(); // Muat data absensi setelah login
        } else {
            alert('Username atau password salah!');
        }
    });

    // Cek status login saat halaman dimuat
    if (localStorage.getItem('loggedIn')) {
        loginContainer.classList.remove('active');
        appContainer.classList.add('active');
        renderAttendanceTable(); // Muat data absensi jika sudah login
    }

    // --- FITUR LOGOUT ---
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('loggedIn');
        appContainer.classList.remove('active');
        loginContainer.classList.add('active');
    });

    // --- FITUR TAMBAH DATA ---
    attendanceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = studentNameInput.value;
        const status = document.getElementById('status').value;
        const now = new Date();
        const dateKey = now.toLocaleDateString('id-ID');
        const day = now.toLocaleDateString('id-ID', { weekday: 'long' }); // Mengambil hari otomatis
        const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        if (name && status) {
            if (!attendanceData[dateKey]) {
                attendanceData[dateKey] = [];
            }
            attendanceData[dateKey].push({ name, status, day, time });
            saveDataToLocalStorage();
            renderAttendanceTable();
            attendanceForm.reset();
        }
    });

    // --- FITUR HAPUS DAN EDIT DATA ---
    attendanceBody.addEventListener('click', (e) => {
        const row = e.target.closest('tr');
        if (!row) return;

        const dateKey = row.dataset.date;
        const index = Array.from(attendanceBody.children).indexOf(row);

        if (e.target.classList.contains('delete-btn')) {
            if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                attendanceData[dateKey].splice(index, 1);
                if (attendanceData[dateKey].length === 0) {
                    delete attendanceData[dateKey];
                }
                saveDataToLocalStorage();
                renderAttendanceTable();
            }
        }

        if (e.target.classList.contains('edit-btn')) {
            currentEditingRow = { row, dateKey, index };
            const data = attendanceData[dateKey][index];
            
            editNameInput.value = data.name;
            editStatusSelect.value = data.status;
            editModal.style.display = 'flex';
        }
    });

    // --- FUNGSI UNTUK MERENDER TABEL ---
    const renderAttendanceTable = () => {
        attendanceBody.innerHTML = '';
        const sortedDates = Object.keys(attendanceData).sort((a, b) => new Date(b) - new Date(a));

        sortedDates.forEach(dateKey => {
            attendanceData[dateKey].forEach(entry => {
                const row = createAttendanceRow(entry.name, entry.status, entry.day, dateKey, entry.time);
                attendanceBody.appendChild(row);
            });
        });
    };

    // Fungsi untuk membuat baris data absensi
    const createAttendanceRow = (name, status, day, date, time) => {
        const row = document.createElement('tr');
        row.dataset.date = date;
        row.innerHTML = `
            <td>${name}</td>
            <td>${status}</td>
            <td>${day}</td>
            <td>${date}</td>
            <td>${time}</td>
            <td class="action-buttons">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Hapus</button>
            </td>
        `;
        return row;
    };

    // --- FUNGSI MODAL EDIT ---
    closeBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.style.display = 'none';
        }
    });

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newName = editNameInput.value;
        const newStatus = editStatusSelect.value;
        const { dateKey, index } = currentEditingRow;

        if (currentEditingRow) {
            attendanceData[dateKey][index].name = newName;
            attendanceData[dateKey][index].status = newStatus;
            saveDataToLocalStorage();
            renderAttendanceTable();
            editModal.style.display = 'none';
            currentEditingRow = null;
        }
    });
});