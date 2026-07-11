let registeredUsers = JSON.parse(localStorage.getItem('ogy_users')) || [];

let currentUser = null;
let selectedPackage = null;
let myChartInstance = null; 
let selectedRole = null; 
let activePaymentMethod = 'card';

let travelPackages = [
    { id: 101, destination: "Seoul, South Korea", price: 3500, days: "5 Days 4 Nights", image: "https://static.toiimg.com/photo/111258550.cms" },
    { id: 102, destination: "Tokyo, Japan", price: 4200, days: "6 Days 5 Nights", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=500&q=80" },
    { id: 103, destination: "Banyuwangi, Indonesia", price: 1800, days: "4 Days 3 Nights", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkjGSFltizoCAPUV95DqVrTKK1u9sxQJPNOVlzU9MDAQ&s=10" },
    { id: 104, destination: "Zurich, Switzerland", price: 7500, days: "7 Days 6 Nights", image: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=500&q=80" }
];

let mockBookings = JSON.parse(localStorage.getItem('ogy_bookings')) || [
    { id: "TXN-2026-9021", user: "Ahmad Abu (Default User)", package: "Tokyo, Japan", date: "2026-06-15", amount: 4200, status: "Success" },
    { id: "TXN-2026-4412", user: "Siti Aminah (Corporate Account)", package: "Seoul, South Korea", date: "2026-06-18", amount: 3500, status: "Success" },
    { id: "TXN-2026-1108", user: "Khairul Azman", package: "Banyuwangi, Indonesia", date: "2026-06-20", amount: 1800, status: "Success" }
];

let clientReviews = [
    { name: "Dato Sri Shah", rating: 5, comment: "Breathtaking first class aviation service mappings engineered flawlessly by PICHA TRAVEL! Five star Tokyo lodging setups were completely flawless. Immensely recommended!", date: "2026-05-12" },
    { name: "Mrs. Elena", rating: 4, comment: "The Banyuwangi family budget tour packages were outstanding value for money. Concierge guides were deeply polite, friendly, and immensely informative on local customs.", date: "2026-06-02" }
];

let destinationCounts = { "Tokyo, Japan": 12, "Seoul, South Korea": 8, "Banyuwangi, Indonesia": 15, "Zurich, Switzerland": 5 };

function selectRole(role) {
    selectedRole = role;
    document.getElementById('role-selection-section').classList.add('hidden');
    document.getElementById('auth-form-wrapper').classList.remove('hidden');
    document.getElementById('selected-role-display').innerText = role;
    
    const usernameInput = document.getElementById('username');
    const hintText = document.getElementById('credential-hint-text');
    
    usernameInput.value = '';
    
    if (role === 'admin') {
        hintText.innerHTML = `<p class="font-bold text-gray-800">• <strong>Admin Default Login:</strong> Username: <code class="bg-gray-200 px-1 rounded text-red-700 font-black">admin</code> | Password: <code class="bg-gray-200 px-1 rounded text-red-700 font-black">1234</code></p>`;
    } else {
        hintText.innerHTML = `<p class="font-bold text-gray-800">• <strong>User Login:</strong> Please create an account on the <b>Create Account</b> tab or log in using your registered account.</p>`;
    }
    switchAuthTab('login');
}

function backToRoles() {
    selectedRole = null;
    document.getElementById('auth-form-wrapper').classList.add('hidden');
    document.getElementById('role-selection-section').classList.remove('hidden');
    document.getElementById('login-error').classList.add('hidden');
    document.getElementById('login-form').reset();
}

function switchAuthTab(targetTab) {
    const loginBtn = document.getElementById('tab-login-btn');
    const regBtn = document.getElementById('tab-register-btn');
    const loginSection = document.getElementById('auth-login-section');
    const regSection = document.getElementById('auth-register-section');

    if (targetTab === 'login') {
        loginBtn.className = "w-1/2 py-2 text-center font-bold text-maroon-main border-b-2 border-maroon-main transition";
        regBtn.className = "w-1/2 py-2 text-center font-semibold text-gray-500 hover:text-maroon-main transition";
        loginSection.classList.remove('hidden');
        regSection.classList.add('hidden');
    } else {
        loginBtn.className = "w-1/2 py-2 text-center font-semibold text-gray-500 hover:text-maroon-main transition";
        regBtn.className = "w-1/2 py-2 text-center font-bold text-maroon-main border-b-2 border-maroon-main transition";
        regSection.classList.remove('hidden');
        loginSection.classList.add('hidden');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const usernameVal = document.getElementById('reg-username').value.trim();
    const emailVal = document.getElementById('reg-email').value.trim();
    const passwordVal = document.getElementById('reg-password').value;

    const userExists = registeredUsers.some(u => u.username.toLowerCase() === usernameVal.toLowerCase());
    if (userExists || usernameVal.toLowerCase() === 'admin') {
        alert("Error: This username already exists. Please choose a different username.");
        return;
    }

    registeredUsers.push({
        username: usernameVal,
        email: emailVal,
        password: passwordVal,
        role: selectedRole
    });

    localStorage.setItem('ogy_users', JSON.stringify(registeredUsers));

    alert(`Registration Successful!\nUsername: ${usernameVal}\nPlease log in using this information on the Sign In tab.`);
    
    document.getElementById('username').value = usernameVal;
    document.getElementById('password').value = passwordVal;
    
    document.getElementById('register-form').reset();
    switchAuthTab('login');
}

function handleLogin(event) {
    event.preventDefault();
    const userInp = document.getElementById('username').value.trim();
    const passInp = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');

    let loginValid = false;
    let loggedInUserRole = selectedRole;
    let displayName = userInp;

    if (selectedRole === 'admin' && userInp.toLowerCase() === 'admin' && passInp === '1234') {
        loginValid = true;
        loggedInUserRole = 'admin';
        displayName = "System Administrator (Admin)";
    } else {
        const foundUser = registeredUsers.find(u => u.username.toLowerCase() === userInp.toLowerCase() && u.password === passInp && u.role === selectedRole);
        if (foundUser) {
            loginValid = true;
            loggedInUserRole = foundUser.role;
            displayName = foundUser.username;
        }
    }

    if (loginValid) {
        currentUser = loggedInUserRole;
        errorDiv.classList.add('hidden');
        
        document.getElementById('role-badge').innerText = currentUser.toUpperCase();
        document.getElementById('dash-username').innerText = displayName;
        
        const adminOnlyBtn = document.getElementById('nav-admin-only-btn');
        const adminOnlyBtnMobile = document.getElementById('nav-admin-only-btn-mobile');
        const bookingTitle = document.getElementById('booking-title');
        const bookingDesc = document.getElementById('booking-desc');
        const navBookingText = document.getElementById('nav-booking-text');
        const navBookingTextMobile = document.getElementById('nav-booking-text-mobile');

        if (currentUser === 'admin') {
            adminOnlyBtn.classList.remove('hidden');
            adminOnlyBtnMobile.classList.remove('hidden');
            bookingTitle.innerText = "Global Ledger Reports (Admin Access)";
            bookingDesc.innerText = "Complete overarching supervisor viewport access over all incoming client checkout records.";
            navBookingText.innerText = "Activity History";
            navBookingTextMobile.innerText = "Activity History";
        } else {
            adminOnlyBtn.classList.add('hidden');
            adminOnlyBtnMobile.classList.add('hidden');
            bookingTitle.innerText = "Personal Purchases Ledger Archive Logs";
            bookingDesc.innerText = "Historical ledger compilation showing verified premium checkout settlements linked to your profile ID.";
            navBookingText.innerText = "My Bookings";
            navBookingTextMobile.innerText = "My Bookings";
        }

        renderPackages();
        renderBookingsTable();
        renderAdminPackagesTable();
        renderReviewsList();
        
        document.getElementById('main-nav').classList.remove('hidden');
        navigateTo('dashboard');
        
        setTimeout(initChart, 100); 
        document.getElementById('login-form').reset();
    } else {
        errorDiv.classList.remove('hidden');
        document.getElementById('login-error-message').innerText = `Fail to Log In! Make sure you have selected the correct Identity [${selectedRole.toUpperCase()}] with the matching credentials.`;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function logout() {
    currentUser = null;
    selectedRole = null;
    document.getElementById('main-nav').classList.add('hidden');
    backToRoles();
    navigateTo('login');
}

function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetedPage = document.getElementById(`page-${pageId}`);
    if (targetedPage) {
        targetedPage.classList.add('active');
    }
    
    document.getElementById('mobile-menu').classList.add('hidden');
    document.getElementById('hamburger-icon').className = "fa-solid fa-bars text-2xl";
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('hamburger-icon');
    
    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        icon.className = "fa-solid fa-xmark text-2xl";
    } else {
        menu.classList.add('hidden');
        icon.className = "fa-solid fa-bars text-2xl";
    }
}

function renderPackages() {
    const container = document.getElementById('packages-container');
    container.innerHTML = '';

    if(travelPackages.length === 0) {
        container.innerHTML = `<div class="col-span-full p-12 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300 mx-auto w-full">No active portfolios found.</div>`;
        return;
    }

    travelPackages.forEach(pkg => {
        const card = document.createElement('div');
        card.className = "bg-white rounded-2xl shadow-sm border border-cream-dark overflow-hidden flex flex-col hover:shadow-xl transform hover:-translate-y-1 transition duration-300 max-w-sm mx-auto text-left w-full";
        
        let controlActionHTML = '';
        if(currentUser === 'admin') {
            controlActionHTML = `
                <div class="flex space-x-2 w-full">
                    <button onclick="navigateTo('admin-panel')" class="w-1/2 text-center bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-2 px-3 rounded-xl text-xs shadow transition">
                        <i class="fa-solid fa-pen-to-square"></i> Edit Asset
                    </button>
                    <button onclick="handleDeletePackage(${pkg.id})" class="w-1/2 text-center bg-red-600 hover:bg-red-700 text-white font-extrabold py-2 px-3 rounded-xl text-xs shadow transition">
                        <i class="fa-solid fa-trash-can"></i> Evict
                    </button>
                </div>
            `;
        } else {
            controlActionHTML = `
                <button onclick="checkoutPackage(${pkg.id})" class="bg-maroon-main hover:bg-maroon-dark text-white px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition transform active:scale-[0.95]">
                    Book & Pay <i class="fa-solid fa-angle-right ml-1"></i>
                </button>
            `;
        }

        card.innerHTML = `
            <div class="relative h-56 w-full bg-gray-100 overflow-hidden">
                <img src="${pkg.image}" alt="${pkg.destination}" class="h-full w-full object-cover">
                <span class="absolute top-4 left-4 bg-maroon-dark text-cream-light text-[11px] font-black tracking-wider uppercase px-3 py-1 rounded-full shadow-md">
                    <i class="fa-solid fa-plane mr-1 text-[9px]"></i> Premium Tour Elite
                </span>
            </div>
            <div class="p-6 flex-grow flex flex-col justify-between space-y-5">
                <div class="space-y-2">
                    <div class="flex items-center text-maroon-main text-xs font-bold tracking-wide uppercase">
                        <i class="fa-regular fa-clock mr-1.5 text-sm"></i> Duration: ${pkg.days}
                    </div>
                    <h3 class="text-xl font-extrabold text-maroon-dark leading-tight">${pkg.destination}</h3>
                    <p class="text-xs text-gray-600 font-medium">All inclusive signature tour asset parameters include executive class flight charts, 5-star lodging arrangements, premium morning dining, and VIP skip-the-line entries passes.</p>
                </div>
                <div class="flex items-center justify-between pt-4 border-t border-cream-dark">
                    <div class="mr-2">
                        <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Per Traveler Cost</p>
                        <p class="text-2xl font-black text-maroon-main">RM ${pkg.price.toLocaleString()}</p>
                    </div>
                    ${controlActionHTML}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function handlePackageFiltering() {
    const criterion = document.getElementById('filter-price-select').value;
    if (criterion === 'low') travelPackages.sort((a, b) => a.price - b.price);
    else if (criterion === 'high') travelPackages.sort((a, b) => b.price - a.price);
    else travelPackages.sort((a, b) => a.id - b.id);
    renderPackages();
}

function renderBookingsTable() {
    const tbody = document.getElementById('bookings-table-body');
    tbody.innerHTML = '';

    // PEMBETULAN: Ambil nama dinamik yang sedang aktif masuk sistem
    const activeDisplayName = document.getElementById('dash-username').innerText;

    // PEMBETULAN: Jika akaun biasa, tapis rekod yang miliknya SAHAJA. Admin melihat semua data.
    const displayedBookings = currentUser === 'admin' 
        ? mockBookings 
        : mockBookings.filter(b => b.user === activeDisplayName);

    if(displayedBookings.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-400 italic bg-gray-50 font-medium">No verified archival ledger checkout files found for your account.</td></tr>`;
        return;
    }

    displayedBookings.forEach(b => {
        const row = document.createElement('tr');
        row.className = "hover:bg-cream-main transition duration-150 text-xs text-gray-800 font-medium border-b border-gray-100";
        row.innerHTML = `
            <td class="p-4 font-mono text-maroon-dark font-bold tracking-tight">${b.id}</td>
            <td class="p-4 font-bold text-gray-700">${b.user}</td>
            <td class="p-4 text-gray-900 font-black"><i class="fa-solid fa-location-dot text-maroon-light mr-1.5"></i>${b.package}</td>
            <td class="p-4 text-gray-600">${b.date}</td>
            <td class="p-4 font-black text-maroon-dark text-sm">RM ${b.amount.toLocaleString()}</td>
            <td class="p-4 text-center">
                <span class="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
                    <i class="fa-solid fa-circle-check text-[9px] mr-1"></i> Success
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });

    const globalTotalSales = mockBookings.reduce((sum, item) => sum + item.amount, 0);
    document.getElementById('stat-total-sales').innerText = `RM ${globalTotalSales.toLocaleString()}`;
    document.getElementById("stat-packages-count").innerText = `${travelPackages.length} Packages`;
    document.getElementById("stat-tourists-count").innerText = `${182 + registeredUsers.length} Users`;
}

function renderAdminPackagesTable() {
    const tbody = document.getElementById('admin-packages-table-body');
    tbody.innerHTML = '';
    travelPackages.forEach(pkg => {
        const row = document.createElement('tr');
        row.className = "hover:bg-gray-50 transition text-xs font-bold text-gray-800";
        row.innerHTML = `
            <td class="p-3 font-mono font-bold text-gray-500">${pkg.id}</td>
            <td class="p-3 text-gray-900">${pkg.destination}</td>
            <td class="p-3 text-gray-600">${pkg.days}</td>
            <td class="p-3 font-extrabold text-maroon-main">RM ${pkg.price.toLocaleString()}</td>
            <td class="p-3 text-center">
                <button onclick="handleDeletePackage(${pkg.id})" class="bg-red-50 hover:bg-red-100 text-red-700 font-black px-2.5 py-1 rounded-lg border border-red-200 transition cursor-pointer">
                    <i class="fa-solid fa-trash-can"></i> Evict
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderReviewsList() {
    const container = document.getElementById('reviews-list-container');
    container.innerHTML = '';
    clientReviews.forEach(rev => {
        let stars = '';
        for(let i=0; i<5; i++) {
            stars += i < rev.rating ? '<i class="fa-solid fa-star text-yellow-500 mr-0.5"></i>' : '<i class="fa-regular fa-star text-gray-300 mr-0.5"></i>';
        }
        const block = document.createElement('div');
        block.className = "bg-white p-5 rounded-2xl shadow-sm border border-cream-dark space-y-3 relative w-full max-w-xl mx-auto text-gray-800 font-medium";
        block.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="w-9 h-9 rounded-full bg-maroon-light text-cream-light font-black flex items-center justify-center text-xs uppercase">${rev.name.charAt(0)}</div>
                <div>
                    <p class="text-xs font-bold text-gray-900">${rev.name}</p>
                    <p class="text-[10px] text-gray-500">${rev.date}</p>
                </div>
            </div>
            <div class="text-xs flex">${stars}</div>
            <p class="text-xs text-gray-800 italic leading-relaxed font-bold">"${rev.comment}"</p>
        `;
        container.prepend(block); 
    });
}

function selectPaymentMethod(method) {
    activePaymentMethod = method;
    
    document.getElementById('opt-card').className = "border border-gray-200 p-3 rounded-xl flex flex-col items-center justify-center space-y-1 cursor-pointer";
    document.getElementById('opt-fpx').className = "border border-gray-200 p-3 rounded-xl flex flex-col items-center justify-center space-y-1 cursor-pointer";
    document.getElementById('opt-wallet').className = "border border-gray-200 p-3 rounded-xl flex flex-col items-center justify-center space-y-1 cursor-pointer";

    document.getElementById(`opt-${method}`).className = "border-2 border-maroon-main bg-cream-main p-3 rounded-xl flex flex-col items-center justify-center space-y-1 cursor-pointer shadow-sm";

    document.getElementById('payment-card-fields').classList.add('hidden');
    document.getElementById('payment-fpx-fields').classList.add('hidden');
    document.getElementById('payment-wallet-fields').classList.add('hidden');

    document.getElementById(`card-name`).required = false;
    document.getElementById(`card-num`).required = false;
    document.getElementById(`card-exp`).required = false;
    document.getElementById(`card-cvv`).required = false;

    if(method === 'card') {
        document.getElementById('payment-card-fields').classList.remove('hidden');
        document.getElementById(`card-name`).required = true;
        document.getElementById(`card-num`).required = true;
        document.getElementById(`card-exp`).required = true;
        document.getElementById(`card-cvv`).required = true;
    } else if (method === 'fpx') {
        document.getElementById('payment-fpx-fields').classList.remove('hidden');
    } else {
        document.getElementById('payment-wallet-fields').classList.remove('hidden');
    }
}

function checkoutPackage(packageId) {
    selectedPackage = travelPackages.find(p => p.id === packageId);
    if(!selectedPackage) return;
    document.getElementById('pay-package-name').innerText = selectedPackage.destination;
    document.getElementById('pay-package-price').innerText = `RM ${selectedPackage.price.toLocaleString()}`;
    selectPaymentMethod('card');
    navigateTo('payment');
}

function processPayment(event) {
    event.preventDefault();

    if (!confirm("Are you sure you want to proceed with this payment execution?")) {
        return;
    }

    const generatedTxnId = "TXN-2026-" + Math.floor(100000 + Math.random() * 900000);
    const todayTimestamp = new Date().toISOString().split('T')[0];

    let targetDisplayUser = "Simulated Client Record";
    if(document.getElementById('dash-username').innerText !== "User Profile") {
        targetDisplayUser = document.getElementById('dash-username').innerText;
    }

    // Mapping professional label method
    let readableMethod = "Credit/Debit Card";
    if (activePaymentMethod === 'fpx') {
        const selectedBank = document.getElementById('fpx-bank-select').value;
        readableMethod = `FPX (${selectedBank})`;
    } else if (activePaymentMethod === 'wallet') {
        readableMethod = "DuitNow / TNG E-Wallet";
    }

    const transactionPayload = {
        id: generatedTxnId,
        user: targetDisplayUser,
        package: selectedPackage.destination,
        date: todayTimestamp,
        amount: selectedPackage.price,
        status: "Success" // Boleh diubahsuai dynamically jika mahu pending
    };

    mockBookings.unshift(transactionPayload);
    localStorage.setItem('ogy_bookings', JSON.stringify(mockBookings));
    
    renderBookingsTable();
    syncDataVisualisationUpdateCounters(selectedPackage.destination);

    // Injeksi data ke paparan jadual resit baharu
    document.getElementById('rec-id').innerText = generatedTxnId;
    document.getElementById('rec-date').innerText = todayTimestamp;
    document.getElementById('rec-user').innerText = transactionPayload.user;
    document.getElementById('rec-package').innerText = selectedPackage.destination;
    document.getElementById('rec-method').innerText = readableMethod;
    document.getElementById('rec-amount-row').innerText = `RM ${selectedPackage.price.toLocaleString()}`;
    document.getElementById('rec-amount').innerText = `RM ${selectedPackage.price.toLocaleString()}`;

    // Update Status Badge Resit Dinamik
    const badgeStatus = document.getElementById('receipt-badge-status');
    const textStatus = document.getElementById('rec-status-text');
    if (transactionPayload.status === "Success") {
        badgeStatus.className = "border border-emerald-600 text-emerald-700 text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg bg-emerald-50";
        badgeStatus.innerText = "SUCCESSFUL";
        textStatus.className = "px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase";
        textStatus.innerText = "SUCCESS";
    } else {
        badgeStatus.className = "border border-amber-600 text-amber-700 text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg bg-amber-50";
        badgeStatus.innerText = "PENDING CLEARANCE";
        textStatus.className = "px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase";
        textStatus.innerText = "PENDING";
    }

    navigateTo('receipt');
}

// Fungsi utama cetakan / Save PDF Resit
function triggerPdfDownload() {
    window.print();
}

function handleAddNewPackage(event) {
    event.preventDefault();
    const dest = document.getElementById('adm-dest').value.trim();
    const price = parseInt(document.getElementById('adm-price').value);
    const days = document.getElementById('adm-days').value.trim();
    const img = document.getElementById('adm-img').value.trim();
    
    const nextGeneratedId = travelPackages.length > 0 ? Math.max(...travelPackages.map(p => p.id)) + 1 : 101;
    const newlyCreatedPackagePayload = { id: nextGeneratedId, destination: dest, price: price, days: days, image: img };

    travelPackages.push(newlyCreatedPackagePayload);
    renderPackages();
    renderAdminPackagesTable();
    
    document.getElementById('add-package-form').reset();
    alert("Inventory Update: Package entry introduced successfully!");
}

function handleDeletePackage(id) {
    if(confirm("Evict this specific package entry?")) {
        travelPackages = travelPackages.filter(p => p.id !== id);
        renderPackages();
        renderAdminPackagesTable();
    }
}

function submitNewReview(event) {
    event.preventDefault();
    const score = parseInt(document.getElementById('rev-rating').value);
    const textContent = document.getElementById('rev-text').value.trim();
    const currentDayStamp = new Date().toISOString().split('T')[0];

    const instantiatedReviewPayload = {
        name: currentUser === 'admin' ? "Supervisor (Sim)" : "Incognito Guest (Sim)",
        rating: score,
        comment: textContent,
        date: currentDayStamp
    };

    clientReviews.push(instantiatedReviewPayload);
    renderReviewsList();
    document.getElementById('rev-text').value = '';
    alert("Broadcast Success: Testimonial submission loaded successfully!");
}

function initChart() {
    const chartCanvasContext = document.getElementById('analyticsChart');
    if(!chartCanvasContext) return;
    const ctx = chartCanvasContext.getContext('2d');
    
    if (myChartInstance) { myChartInstance.destroy(); }

    myChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(destinationCounts),
            datasets: [{
                label: 'Gross Volumetric Sales Distribution Tickets',
                data: Object.values(destinationCounts),
                backgroundColor: ['#4a0e17', '#722f37', '#984447', '#b87333'],
                borderColor: '#ede6d6',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins:{
                legend:{
                    labels:{
                        color:"#4a0e17"
                    }
                }
            },
            scales:{
                x:{
                    ticks:{
                        color:"#4a0e17"
                    }
                },
                y:{
                    ticks:{
                        color:"#4a0e17"
                    }
                }
            }
        }
    });
}

function syncDataVisualisationUpdateCounters(targetDestinationLabel) {
    if(destinationCounts[targetDestinationLabel] !== undefined) {
        destinationCounts[targetDestinationLabel] += 1;
    } else {
        destinationCounts[targetDestinationLabel] = 1;
    }
    if (myChartInstance) { initChart(); }
}