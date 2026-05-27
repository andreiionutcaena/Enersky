document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------------------------
    // 0. TOAST NOTIFICATION SYSTEM
    // -------------------------------------------------------------------------
    const showToast = (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.backgroundColor = type === 'error' ? '#e74c3c' : (type === 'success' ? '#27ae60' : '#34495e');
        toast.style.color = 'white';
        toast.style.padding = '15px 25px';
        toast.style.borderRadius = '5px';
        toast.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        toast.style.zIndex = '10000';
        toast.style.transition = 'opacity 0.3s ease-in-out';
        toast.style.fontFamily = 'sans-serif';
        toast.style.fontSize = '14px';
        toast.innerHTML = type === 'success' ? `<i class="fas fa-check-circle" style="margin-right: 8px;"></i> ${message}` 
                        : (type === 'error' ? `<i class="fas fa-exclamation-circle" style="margin-right: 8px;"></i> ${message}` : message);
        
        document.body.appendChild(toast);
        
        setTimeout(() => { 
            toast.style.opacity = '0'; 
            setTimeout(() => toast.remove(), 300); 
        }, 3000);
    };

    // -------------------------------------------------------------------------
    // 1. MOBILE MENU INITIALIZATION
    // -------------------------------------------------------------------------
    const menuToggleBtn = document.getElementById('menu-toggle');
    const mainMenu = document.getElementById('main-menu');
    
    if (menuToggleBtn && mainMenu) {
        menuToggleBtn.addEventListener('click', () => {
            mainMenu.classList.toggle('active');
        });
    }

    // -------------------------------------------------------------------------
    // 2. SWIPER CAROUSEL (RECENT PRODUCTS)
    // -------------------------------------------------------------------------
    const swiperWrapper = document.getElementById('recent-products-wrapper');
    const swiperContainer = document.querySelector('.mySwiper');
    
    if (swiperWrapper && swiperContainer && typeof Swiper !== 'undefined') {
        const fetchRecentProducts = async () => {
            try {
                swiperWrapper.innerHTML = '<p style="text-align: center; width: 100%; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Se încarcă...</p>';
                
                const response = await fetch('http://localhost:5000/api/products');
                const products = await response.json();

                const recentProducts = products
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 8);

                swiperWrapper.innerHTML = ''; 

                if (recentProducts.length === 0) {
                    swiperWrapper.innerHTML = '<p style="text-align: center; width: 100%;">Nu există produse disponibile.</p>';
                    return;
                }

                recentProducts.forEach(prod => {
                    const imgHtml = prod.imagine && prod.imagine.startsWith('http') 
                        ? `<img src="${prod.imagine}" style="width: 100%; height: 150px; object-fit: contain; background: white; border-radius: 4px; margin-bottom: 15px; padding: 5px;">`
                        : `<div class="image-placeholder">Fără Imagine</div>`;
                        
                    const slide = document.createElement('div');
                    slide.className = 'swiper-slide';
                    slide.innerHTML = `
                        <div class="card">
                            <a href="produs.html?id=${prod._id}" style="text-decoration: none; color: inherit;">
                                ${imgHtml}
                                <div class="card-info">
                                    <span style="color: #888; font-size: 12px; text-transform: uppercase;">${prod.categorie}</span>
                                    <h3 style="margin: 5px 0 10px 0; font-size: 18px;">${prod.nume}</h3>
                                    <p class="price-container">
                                        <span class="new-price" style="color: var(--primary-color);">${prod.pret} RON</span>
                                    </p>
                                </div>
                            </a>
                        </div>
                    `;
                    swiperWrapper.appendChild(slide);
                });

                new Swiper(".mySwiper", {
                    slidesPerView: 'auto',
                    centeredSlides: true, 
                    spaceBetween: 30, 
                    loop: recentProducts.length > 3,
                    autoplay: {
                        delay: 3000, 
                        disableOnInteraction: false, 
                    },
                    pagination: {
                        el: ".swiper-pagination",
                        clickable: true,
                    }
                });

            } catch (err) {
                console.error("Error loading recent products:", err);
                swiperWrapper.innerHTML = '<p style="text-align: center; width: 100%; color: red;">Eroare la procesarea datelor.</p>';
            }
        };
        fetchRecentProducts();
    }

    // -------------------------------------------------------------------------
    // 3. CATALOG FILTERS UI
    // -------------------------------------------------------------------------
    const priceRange = document.getElementById('price-range');
    const priceValue = document.getElementById('price-value');
    
    if (priceRange && priceValue) {
        priceRange.addEventListener('input', (e) => {
            priceValue.textContent = e.target.value;
        });
    }

    // -------------------------------------------------------------------------
    // 4. PAGINATION LOGIC
    // -------------------------------------------------------------------------
    const initPagination = () => {
        const products = document.querySelectorAll('.product-grid-catalog .card');
        const paginationContainer = document.getElementById('pagination-container');
        const itemsPerPage = 6; 

        if (products.length > 0 && paginationContainer) {
            const totalPages = Math.ceil(products.length / itemsPerPage);
            
            const showPage = (page) => {
                const start = (page - 1) * itemsPerPage;
                const end = start + itemsPerPage;

                products.forEach((product, index) => {
                    product.style.display = (index >= start && index < end) ? 'block' : 'none';
                });

                const allBtns = paginationContainer.querySelectorAll('.page-btn');
                allBtns.forEach(btn => btn.classList.remove('active'));
                
                const activeBtn = paginationContainer.querySelector(`.page-btn[data-page="${page}"]`);
                if (activeBtn) activeBtn.classList.add('active');
                
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };

            paginationContainer.innerHTML = ''; 

            for (let i = 1; i <= totalPages; i++) {
                const btn = document.createElement('button');
                btn.classList.add('page-btn');
                btn.innerText = i;
                btn.setAttribute('data-page', i); 
                btn.addEventListener('click', () => showPage(i));
                paginationContainer.appendChild(btn);
            }
            showPage(1);
        }
    };

    // -------------------------------------------------------------------------
    // 5. AUTHENTICATION TABS & FORMS
    // -------------------------------------------------------------------------
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (tabLogin && tabRegister && loginForm && registerForm) {
        tabLogin.addEventListener('click', () => {
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        });

        tabRegister.addEventListener('click', () => {
            tabRegister.classList.add('active');
            tabLogin.classList.remove('active');
            registerForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        });
    }

    const regTypeSelect = document.getElementById('reg-type');
    const companyDataGroup = document.getElementById('company-data');

    if (regTypeSelect && companyDataGroup) {
        regTypeSelect.addEventListener('change', (e) => {
            const cuiInput = document.getElementById('reg-cui');
            if (e.target.value === 'firma' || e.target.value === 'distribuitor') {
                companyDataGroup.classList.remove('hidden');
                if(cuiInput) cuiInput.setAttribute('required', 'true');
            } else {
                companyDataGroup.classList.add('hidden');
                if(cuiInput) cuiInput.removeAttribute('required');
            }
        });
    }

    // -------------------------------------------------------------------------
    // 6. PROFILE NAVIGATION
    // -------------------------------------------------------------------------
    const profileNavBtns = document.querySelectorAll('.prof-nav-btn');
    const profileSections = document.querySelectorAll('.profile-section');

    if (profileNavBtns.length > 0 && profileSections.length > 0) {
        profileNavBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                if (this.classList.contains('text-danger')) return;
                profileNavBtns.forEach(b => b.classList.remove('active'));
                profileSections.forEach(s => s.classList.add('hidden'));
                this.classList.add('active');
                document.getElementById(this.getAttribute('data-target')).classList.remove('hidden');
            });
        });
    }

    // -------------------------------------------------------------------------
    // 7. AUTH API INTEGRATION
    // -------------------------------------------------------------------------
    const registerFormElement = document.getElementById('register-form');
    if (registerFormElement) {
        registerFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                nume: document.getElementById('reg-name').value,
                email: document.getElementById('reg-email').value,
                parola: document.getElementById('reg-pass').value,
                rol: document.getElementById('reg-type').value,
                cui: document.getElementById('reg-cui') ? document.getElementById('reg-cui').value : '',
                numeFirma: document.getElementById('reg-firma') ? document.getElementById('reg-firma').value : ''
            };

            try {
                const response = await fetch('http://localhost:5000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await response.json();
                
                if (response.ok) {
                    showToast(data.mesaj + ' Acum te poți autentifica.', 'success');
                    registerFormElement.reset(); 
                    document.getElementById('tab-login').click();
                } else {
                    showToast(data.mesaj, 'error');
                }
            } catch (err) {
                showToast('Eroare la conexiunea cu serverul.', 'error');
            }
        });
    }

    const loginFormElement = document.getElementById('login-form');
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                email: document.getElementById('login-email').value,
                parola: document.getElementById('login-pass').value
            };

            try {
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = 'profil.html';
                } else {
                    showToast(data.mesaj, 'error');
                }
            } catch (err) {
                showToast('Eroare la conexiunea cu serverul.', 'error');
            }
        });
    }

    // -------------------------------------------------------------------------
    // 8. SESSION MANAGEMENT
    // -------------------------------------------------------------------------
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    const authSection = document.querySelector('.auth-section');

    if (token && userString && authSection) {
        const user = JSON.parse(userString);
        authSection.innerHTML = `
            <a href="cart.html" style="color: white; text-decoration: none; font-size: 18px; font-weight: bold;"><i class="fas fa-shopping-cart"></i> Coșul meu</a>
            <a href="profil.html" class="btn btn-primary" style="background-color: var(--accent-color); color: #000;"><i class="fas fa-user"></i> ${user.nume.split(' ')[0]}</a>
            <button id="logout-btn-header" class="btn" style="background: none; color: white; border: 1px solid white;">Ieșire</button>
        `;
        document.getElementById('logout-btn-header').addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html'; 
        });
    }

    const profileSidebar = document.querySelector('.profile-sidebar');
    if (profileSidebar) {
        if (!token) {
            window.location.href = 'login.html';
        } else {
            const user = JSON.parse(userString);
            document.getElementById('sidebar-user-name').textContent = user.nume;
            document.getElementById('sidebar-user-role').textContent = user.rol;

            const profileInfoCard = document.getElementById('profile-info-card');
            if (profileInfoCard) {
                profileInfoCard.innerHTML = `
                    <div class="info-group"><label>Nume Complet</label><p>${user.nume}</p></div>
                    <div class="info-group"><label>Email</label><p>${user.email}</p></div>
                    <div class="info-group"><label>Tip Cont</label><p style="text-transform: uppercase;">${user.rol}</p></div>
                    ${user.rol !== 'fizica' ? `<div class="info-group"><label>CUI Companie</label><p>${user.cui || 'Nespecificat'}</p></div>` : ''}
                    <button id="btn-edit-profil" class="btn btn-primary"><i class="fas fa-edit"></i> Editează Datele</button>
                `;
            }

            if (user.rol === 'distribuitor') {
                document.getElementById('nav-adauga-produs').style.display = 'block';
                document.getElementById('nav-produsele-mele').style.display = 'block';
                document.getElementById('nav-gestiune-comenzi').style.display = 'block';
            }
            if (user.rol === 'admin') {
                const navAprobari = document.getElementById('nav-admin-aprobari');
                const navMesaje = document.getElementById('nav-admin-mesaje');
                if(navAprobari) navAprobari.style.display = 'block';
                if(navMesaje) navMesaje.style.display = 'block';
            }

            const logoutBtnSidebar = document.getElementById('btn-logout');
            if (logoutBtnSidebar) {
                logoutBtnSidebar.addEventListener('click', () => {
                    localStorage.clear();
                    window.location.href = 'login.html';
                });
            }
        }
    }

    // -------------------------------------------------------------------------
    // 9. PRODUCT MANAGEMENT (DISTRIBUTOR)
    // -------------------------------------------------------------------------
    const formAdaugaProdus = document.getElementById('form-adauga-produs');
    if (formAdaugaProdus) {
        formAdaugaProdus.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                nume: document.getElementById('prod-nume').value,
                categorie: document.getElementById('prod-categorie').value,
                pret: document.getElementById('prod-pret').value,
                descriere: document.getElementById('prod-descriere').value,
                stoc: document.getElementById('prod-stoc').value,
                imagine: document.getElementById('prod-imagine').value,
                specificatii: document.getElementById('prod-spec').value
            };

            try {
                const response = await fetch('http://localhost:5000/api/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}` 
                    },
                    body: JSON.stringify(payload)
                });
                const data = await response.json();
                
                if (response.ok) {
                    showToast(data.mesaj, 'success');
                    formAdaugaProdus.reset();
                } else {
                    showToast(data.mesaj, 'error');
                }
            } catch (err) {
                showToast('Eroare la conexiunea cu serverul.', 'error');
            }
        });
    }

    const navProduseBtn = document.querySelector('[data-target="produsele-mele"]');
    if (navProduseBtn) {
        navProduseBtn.addEventListener('click', async () => {
            const tbody = document.getElementById('lista-produse-distribuitor');
            tbody.innerHTML = '<tr><td colspan="5"><i class="fas fa-spinner fa-spin"></i> Se încarcă...</td></tr>';
            try {
                const response = await fetch('http://localhost:5000/api/products/mele', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const produse = await response.json();
                tbody.innerHTML = ''; 
                
                if (produse.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Niciun produs adăugat.</td></tr>';
                    return;
                }

                produse.forEach(p => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td><strong>${p.nume}</strong></td>
                        <td>${p.categorie}</td>
                        <td>${p.pret} RON</td>
                        <td><span class="status-badge ${p.stoc > 0 ? 'status-livrat' : 'status-procesare'}">${p.stoc} buc.</span></td>
                        <td>
                            <button class="btn btn-secondary btn-editeaza-produs" data-id="${p._id}" data-nume="${p.nume}" data-pret="${p.pret}" data-stoc="${p.stoc}" style="padding: 5px 10px; font-size: 12px; background: #f39c12; color: #000; border: none;"><i class="fas fa-edit"></i> Editează</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            } catch (err) {
                tbody.innerHTML = '<tr><td colspan="5" style="color: red;">Eroare la încărcare.</td></tr>';
            }
        });
    }

    // Edit Product Modal Logic
    const editModalHtml = `
        <div id="edit-product-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 9999; align-items: center; justify-content: center;">
            <div style="background: white; padding: 25px; border-radius: 8px; width: 90%; max-width: 400px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
                <h3 style="margin-bottom: 20px; border-bottom: 2px solid var(--primary-color); padding-bottom: 10px;">Editează Produsul</h3>
                <form id="form-edit-modal">
                    <input type="hidden" id="modal-prod-id">
                    <div style="margin-bottom: 15px;">
                        <label style="display:block; margin-bottom: 5px;">Nume Produs</label>
                        <input type="text" id="modal-prod-nume" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                    </div>
                    <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                        <div style="flex: 1;">
                            <label style="display:block; margin-bottom: 5px;">Preț (RON)</label>
                            <input type="number" id="modal-prod-pret" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                        </div>
                        <div style="flex: 1;">
                            <label style="display:block; margin-bottom: 5px;">Stoc</label>
                            <input type="number" id="modal-prod-stoc" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button type="button" id="btn-inchide-modal" class="btn" style="flex: 1; background: #e74c3c; color: white; padding: 10px; border-radius: 4px;">Anulează</button>
                        <button type="submit" class="btn" style="flex: 1; background: #27ae60; color: white; padding: 10px; border-radius: 4px; font-weight: bold;">Salvează</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', editModalHtml);

    const editModal = document.getElementById('edit-product-modal');
    const formEditModal = document.getElementById('form-edit-modal');
    
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.btn-editeaza-produs')) {
            const btn = e.target.closest('.btn-editeaza-produs');
            document.getElementById('modal-prod-id').value = btn.getAttribute('data-id');
            document.getElementById('modal-prod-nume').value = btn.getAttribute('data-nume');
            document.getElementById('modal-prod-pret').value = btn.getAttribute('data-pret');
            document.getElementById('modal-prod-stoc').value = btn.getAttribute('data-stoc');
            editModal.style.display = 'flex';
        }
    });

    document.getElementById('btn-inchide-modal').addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    if (formEditModal) {
        formEditModal.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('modal-prod-id').value;
            const payload = {
                nume: document.getElementById('modal-prod-nume').value,
                pret: document.getElementById('modal-prod-pret').value,
                stoc: document.getElementById('modal-prod-stoc').value
            };

            try {
                const response = await fetch(`http://localhost:5000/api/products/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(payload)
                });
                const data = await response.json();
                
                if (response.ok) {
                    showToast(data.mesaj, 'success');
                    editModal.style.display = 'none';
                    if (navProduseBtn) navProduseBtn.click();
                } else {
                    showToast(data.mesaj, 'error');
                }
            } catch (err) {
                showToast('Eroare la conexiunea cu serverul.', 'error');
            }
        });
    }

    // -------------------------------------------------------------------------
    // 10. CATALOG LOGIC & FILTERING
    // -------------------------------------------------------------------------
    const catalogGrid = document.getElementById('catalog-grid');
    if (catalogGrid) {
        let allProducts = []; 

        const renderProducts = (productsToRender) => {
            catalogGrid.innerHTML = '';
            if (productsToRender.length === 0) {
                catalogGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; font-size: 18px; color: #555;">Nu am găsit produse conform filtrelor aplicate.</p>';
                return;
            }
            
            productsToRender.forEach(prod => {
                const card = document.createElement('div');
                card.className = 'card';
                
                const imgHtml = prod.imagine && prod.imagine.startsWith('http') 
                    ? `<img src="${prod.imagine}" alt="${prod.nume}" style="width: 100%; height: 200px; object-fit: contain; background: white; padding: 10px; border-top-left-radius: 8px; border-top-right-radius: 8px;">`
                    : `<div class="image-placeholder" style="height: 200px; display: flex; align-items: center; justify-content: center; background: #eee; color: #888;">Fără Imagine</div>`;

                const stockHtml = prod.stoc > 0 
                    ? `<span style="color: #27ae60; font-size: 12px; font-weight: bold; display: block; margin-bottom: 5px;"><i class="fas fa-check"></i> În stoc (${prod.stoc})</span>` 
                    : `<span style="color: #e74c3c; font-size: 12px; font-weight: bold; display: block; margin-bottom: 5px;"><i class="fas fa-times"></i> Epuizat</span>`;

                card.innerHTML = `
                    <a href="produs.html?id=${prod._id}" style="text-decoration: none; color: inherit; display: block; flex-grow: 1;">
                        ${imgHtml}
                        <div class="card-info" style="padding: 15px;">
                            <span style="color: #888; font-size: 12px; text-transform: uppercase;">${prod.categorie}</span>
                            <h3 style="margin: 5px 0 10px 0; font-size: 18px;">${prod.nume}</h3>
                            ${stockHtml}
                            <p class="price-container" style="margin-top: 15px;">
                                <span class="new-price">${prod.pret} RON</span>
                            </p>
                        </div>
                    </a>
                    
                    <div style="display: flex; gap: 10px; padding: 15px; background: #fff; border-top: 1px solid #eee;">
                        <input type="number" id="catalog-qty-${prod._id}" value="1" min="1" max="${prod.stoc > 0 ? prod.stoc : 1}" style="width: 60px; padding: 5px; text-align: center; border: 1px solid #ccc; border-radius: 4px; font-weight: bold;" ${prod.stoc === 0 ? 'disabled' : ''}>
                        <button class="btn btn-secondary add-to-cart-btn" 
                            data-id="${prod._id}" data-nume="${prod.nume}" data-pret="${prod.pret}" data-imagine="${prod.imagine}"
                            style="flex-grow: 1; border-radius: 4px; padding: 10px; font-weight: bold; ${prod.stoc === 0 ? 'background: #ccc; cursor: not-allowed;' : 'background: var(--accent-color); color: #000; cursor: pointer;'}" 
                            ${prod.stoc === 0 ? 'disabled' : ''}>
                             <i class="fas fa-shopping-cart"></i> Adaugă
                        </button>
                    </div>
                    <div style="padding: 0 15px 15px 15px; text-align: center; background: #fff; border-radius: 0 0 8px 8px;">
                        <label style="cursor: pointer; font-size: 14px; color: var(--primary-color); font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 5px;">
                            <input type="checkbox" class="compare-checkbox" data-id="${prod._id}" style="width: 16px; height: 16px; cursor: pointer;"> 
                            <span><i class="fas fa-balance-scale"></i> Compară</span>
                        </label>
                    </div>
                `;
                catalogGrid.appendChild(card);
            });
            initPagination();
        };

        const loadCatalog = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/products');
                allProducts = await response.json();

                if (allProducts.length > 0) {
                    const prices = allProducts.map(p => p.pret);
                    const maxPrice = Math.max(...prices);
                    
                    if (priceRange && priceValue) {
                        priceRange.max = maxPrice;
                        priceRange.value = maxPrice; 
                        priceValue.textContent = maxPrice;
                    }

                    const powerSelect = document.querySelector('select[name="power"]');
                    if (powerSelect) {
                        const uniquePowers = new Set();
                        allProducts.forEach(p => {
                            if (p.specificatii) {
                                const match = p.specificatii.match(/(\d+(?:\.\d+)?)\s*kw/i);
                                if (match) uniquePowers.add(parseFloat(match[1])); 
                            }
                        });
                        
                        powerSelect.innerHTML = '<option value="all">Toate</option>';
                        Array.from(uniquePowers).sort((a, b) => a - b).forEach(power => {
                            powerSelect.innerHTML += `<option value="${power}">${power} kW</option>`;
                        });
                    }
                }
                renderProducts(allProducts); 
            } catch (err) {
                catalogGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: red;">Eroare la încărcarea catalogului.</p>';
            }
        };
        loadCatalog();

        const btnApplyFilters = document.querySelector('.filters-sidebar .btn-secondary');
        if (btnApplyFilters) {
            btnApplyFilters.addEventListener('click', () => {
                const checkedCats = Array.from(document.querySelectorAll('input[name="cat"]:checked')).map(cb => cb.value);
                const maxPrice = Number(document.getElementById('price-range').value);
                const powerSelected = document.querySelector('select[name="power"]').value;

                const filtered = allProducts.filter(prod => {
                    const passCat = checkedCats.length === 0 || checkedCats.includes(prod.categorie);
                    const passPrice = prod.pret <= maxPrice;
                    let passPower = true;
                    
                    if (powerSelected !== 'all') {
                        const regex = new RegExp(`${powerSelected}\\s*kw`, 'i');
                        passPower = regex.test(prod.specificatii || '');
                    }
                    return passCat && passPrice && passPower;
                });

                renderProducts(filtered);
            });
        }

        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                const method = sortSelect.value;
                const checkedCats = Array.from(document.querySelectorAll('input[name="cat"]:checked')).map(cb => cb.value);
                const maxPrice = Number(document.getElementById('price-range').value);
                const powerSelected = document.querySelector('select[name="power"]').value;

                let currentList = allProducts.filter(prod => {
                    const passCat = checkedCats.length === 0 || checkedCats.includes(prod.categorie);
                    const passPrice = prod.pret <= maxPrice;
                    let passPower = true;
                    if (powerSelected !== 'all') {
                        const regex = new RegExp(`${powerSelected}\\s*kw`, 'i');
                        passPower = regex.test(prod.specificatii || '');
                    }
                    return passCat && passPrice && passPower;
                });

                if (method === 'cresc') currentList.sort((a, b) => a.pret - b.pret);
                else if (method === 'descresc') currentList.sort((a, b) => b.pret - a.pret);
                else if (method === 'noi') currentList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                renderProducts(currentList);
            });
        }

        catalogGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('.add-to-cart-btn');
            if (btn) {
                const id = btn.getAttribute('data-id');
                const qtyInput = document.getElementById(`catalog-qty-${id}`);
                const qty = qtyInput ? parseInt(qtyInput.value) : 1;
                
                const item = {
                    id: id,
                    nume: btn.getAttribute('data-nume'),
                    pret: Number(btn.getAttribute('data-pret')),
                    imagine: btn.getAttribute('data-imagine'),
                    cantitate: qty 
                };

                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                const existing = cart.find(p => p.id === item.id);
                
                if (existing) existing.cantitate += qty; 
                else cart.push(item);

                localStorage.setItem('cart', JSON.stringify(cart));
                showToast(`Ai adăugat ${qty} x ${item.nume} în coș.`, 'success');
            }
        });
    }

    // -------------------------------------------------------------------------
    // 11. SINGLE PRODUCT VIEW & CROSS-SELLING
    // -------------------------------------------------------------------------
    const singleProductContainer = document.getElementById('single-product-container');
    if (singleProductContainer) {
        const loadSingleProduct = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id');
            
            if (!productId) {
                singleProductContainer.innerHTML = '<p style="text-align: center; color: red;">ID Produs lipsă.</p>';
                return;
            }

            try {
                const response = await fetch(`http://localhost:5000/api/products/${productId}`);
                if (!response.ok) throw new Error('Network error');
                const prod = await response.json();

                const imgHtml = prod.imagine && prod.imagine.startsWith('http') 
                    ? `<img src="${prod.imagine}" alt="${prod.nume}" style="width: 100%; object-fit: contain; border-radius: 8px;">`
                    : `<div style="width: 100%; height: 400px; background: #eee; display: flex; align-items: center; justify-content: center; border-radius: 8px; color: #888;">Fără Imagine</div>`;

                const stockHtml = prod.stoc > 0 
                    ? `<span style="background: #eafaf1; color: #27ae60; padding: 5px 15px; border-radius: 4px; font-size: 14px; font-weight: bold;"><i class="fas fa-check"></i> În stoc (${prod.stoc} buc)</span>` 
                    : `<span style="background: #fdf2e9; color: #e74c3c; padding: 5px 15px; border-radius: 4px; font-size: 14px; font-weight: bold;"><i class="fas fa-times"></i> Epuizat</span>`;

                let specsHtml = '<p>Nu sunt specificații adăugate.</p>';
                if (prod.specificatii && prod.specificatii.trim() !== '') {
                    const specsArray = prod.specificatii.split(',').map(s => s.trim()).filter(s => s.length > 0);
                    specsHtml = '<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">';
                    specsArray.forEach(spec => {
                        const parts = spec.split(':');
                        if (parts.length === 2) {
                            specsHtml += `
                                <tr style="border-bottom: 1px solid #eee;">
                                    <td style="padding: 12px 0; font-weight: bold; color: #555; width: 40%;">${parts[0].trim()}</td>
                                    <td style="padding: 12px 0; color: var(--text-color);">${parts[1].trim()}</td>
                                </tr>
                            `;
                        } else {
                            specsHtml += `<tr><td colspan="2" style="padding: 12px 0; border-bottom: 1px solid #eee;">${spec}</td></tr>`;
                        }
                    });
                    specsHtml += '</table>';
                }

                singleProductContainer.innerHTML = `
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 50px;" class="product-details-top">
                        <div class="product-image-large" style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                            ${imgHtml}
                        </div>
                        <div class="product-info-panel">
                            <span style="color: #888; font-size: 14px; text-transform: uppercase;">${prod.categorie}</span>
                            <h1 style="margin: 10px 0 20px 0; font-size: 36px; color: var(--text-color);">${prod.nume}</h1>
                            <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px;">
                                <span style="font-size: 32px; font-weight: bold; color: var(--primary-color);">${prod.pret} RON</span>
                                ${stockHtml}
                            </div>
                            <p style="color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                                ${prod.descriere || 'Nu există descriere.'}
                            </p>
                            <div class="add-to-cart-action" style="display: flex; gap: 15px;">
                                <input type="number" id="qty-input" class="qty-input" value="1" min="1" max="${prod.stoc > 0 ? prod.stoc : 1}" style="width: 80px; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 18px; text-align: center;" ${prod.stoc === 0 ? 'disabled' : ''}>
                                <button id="btn-add-single" class="btn btn-secondary" style="flex-grow: 1; padding: 15px; font-size: 18px; font-weight: bold; border-radius: 4px; ${prod.stoc === 0 ? 'background: #ccc; cursor: not-allowed;' : 'background: var(--accent-color); color: #000; cursor: pointer;'}" ${prod.stoc === 0 ? 'disabled' : ''}>
                                    <i class="fas fa-shopping-cart"></i> Adaugă în coș
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 50px;">
                        <h2 style="border-bottom: 2px solid var(--primary-color); padding-bottom: 10px; margin-bottom: 20px;">Specificații Tehnice</h2>
                        ${specsHtml}
                    </div>
                    
                    <div id="recomandari-container" style="margin-top: 40px; border-top: 2px solid #eee; padding-top: 30px;">
                        <h2 style="margin-bottom: 20px;">Recomandări de compatibilitate</h2>
                        <div id="recomandari-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px;">
                            <p style="color: #888; font-style: italic;"><i class="fas fa-spinner fa-spin"></i> Se caută recomandări...</p>
                        </div>
                    </div>
                `;

                const btnAdd = document.getElementById('btn-add-single');
                if (btnAdd && prod.stoc > 0) {
                    btnAdd.addEventListener('click', () => {
                        const qty = parseInt(document.getElementById('qty-input').value) || 1;
                        let cart = JSON.parse(localStorage.getItem('cart')) || [];
                        const existing = cart.find(p => p.id === prod._id);
                        if (existing) existing.cantitate += qty;
                        else cart.push({ id: prod._id, nume: prod.nume, pret: prod.pret, imagine: prod.imagine, cantitate: qty });
                        
                        localStorage.setItem('cart', JSON.stringify(cart));
                        showToast(`Ai adăugat ${qty} x ${prod.nume} în coș.`, 'success');
                    });
                }

                const recGrid = document.getElementById('recomandari-grid');
                try {
                    const recRes = await fetch(`http://localhost:5000/api/products/${productId}/impreuna`);
                    if (recRes.ok) {
                        const recomms = await recRes.json();
                        recGrid.innerHTML = ''; 

                        if (recomms.length === 0) {
                            recGrid.innerHTML = '<p style="color: #666; font-style: italic; grid-column: 1 / -1;">Nu există date suficiente pentru recomandări.</p>';
                        } else {
                            recomms.forEach(rec => {
                                recGrid.innerHTML += `
                                    <div class="card" style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
                                        <a href="produs.html?id=${rec._id}" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%;">
                                            <div style="height: 150px; background: #f8f9fa; display: flex; align-items: center; justify-content: center;">
                                                ${rec.imagine ? `<img src="${rec.imagine}" style="max-width: 100%; max-height: 100%; object-fit: contain; padding: 10px;">` : '<span style="color:#ccc;">Fără Imagine</span>'}
                                            </div>
                                            <div style="padding: 15px; flex-grow: 1;">
                                                <h4 style="margin: 0 0 10px 0; font-size: 16px;">${rec.nume}</h4>
                                                <span style="color: var(--primary-color); font-weight: bold;">${rec.pret} RON</span>
                                            </div>
                                        </a>
                                    </div>
                                `;
                            });
                        }
                    }
                } catch (recErr) {
                    recGrid.innerHTML = '<p style="color: red;">Eroare sistem recomandări.</p>';
                }

            } catch (err) {
                singleProductContainer.innerHTML = '<p style="text-align: center; color: red;">Eroare la aducerea datelor.</p>';
            }
        };
        loadSingleProduct();
    }

    // -------------------------------------------------------------------------
    // 12. SHOPPING CART & CHECKOUT
    // -------------------------------------------------------------------------
    const cartContainer = document.getElementById('cart-items-container');
    const cartTotalElement = document.getElementById('cart-total-price');
    const cartFinalElement = document.getElementById('cart-final-price');

    if (cartContainer) {
        const renderCart = () => {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            cartContainer.innerHTML = '';
            let total = 0;

            if (cart.length === 0) {
                cartContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px;">
                        <h2 style="color: #888; margin-bottom: 20px;">Coșul este gol</h2>
                        <a href="catalog.html" class="btn btn-primary" style="background: var(--primary-color); color: white; display: inline-block; margin-top: 15px;">Înapoi la magazin</a>
                    </div>
                `;
                if(cartTotalElement) cartTotalElement.textContent = '0 RON';
                if(cartFinalElement) cartFinalElement.textContent = '0 RON';
                
                const btnCheckout = document.getElementById('btn-checkout');
                if (btnCheckout) btnCheckout.style.display = 'none';
                return;
            }

            cart.forEach((item, index) => {
                total += item.pret * item.cantitate;
                
                const imgHtml = item.imagine && item.imagine.startsWith('http') 
                    ? `<img src="${item.imagine}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #eee;">`
                    : `<div style="width: 80px; height: 80px; background: #eee; display: flex; align-items: center; justify-content: center; border-radius: 4px; font-size: 10px;">N/A</div>`;

                cartContainer.innerHTML += `
                    <div class="cart-item" style="display: flex; align-items: center; justify-content: space-between; background: #fff; padding: 15px; border-bottom: 1px solid #eee;">
                        <div style="display: flex; align-items: center; gap: 15px; width: 50%;">
                            <a href="produs.html?id=${item.id}" class="item-image-small">${imgHtml}</a>
                            <div class="item-details">
                                <a href="produs.html?id=${item.id}" style="text-decoration: none; color: inherit;"><h4 style="margin: 0 0 5px 0; font-size: 18px;">${item.nume}</h4></a>
                                <span style="color: var(--primary-color); font-weight: bold;">${item.pret} RON</span>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 20px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <label style="font-size: 14px; color: #666;">Buc:</label>
                                <input type="number" min="1" value="${item.cantitate}" data-index="${index}" class="cart-qty-input qty-input-cart" style="width: 60px; padding: 8px; text-align: center; border: 1px solid #ccc; border-radius: 4px;">
                            </div>
                            <div class="item-price" style="text-align: right; min-width: 100px;">
                                <strong style="font-size: 18px;">${item.pret * item.cantitate} RON</strong>
                            </div>
                            <button data-index="${index}" class="btn remove-item-btn" style="background: none; color: #e74c3c; border: none; cursor: pointer; font-size: 20px;" title="Șterge">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            if(cartTotalElement) cartTotalElement.textContent = `${total} RON`;
            if(cartFinalElement) cartFinalElement.textContent = `${total} RON`;
        };

        renderCart();

        cartContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('cart-qty-input')) {
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                const idx = e.target.getAttribute('data-index');
                const newQty = parseInt(e.target.value);
                cart[idx].cantitate = newQty > 0 ? newQty : 1;
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCart(); 
            }
        });

        cartContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.remove-item-btn'); 
            if (btn) {
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                cart.splice(btn.getAttribute('data-index'), 1); 
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCart();
            }
        });

        const btnCheckout = document.getElementById('btn-checkout');
        const checkoutFormContainer = document.getElementById('checkout-form-container');
        const formPlaseazaComanda = document.getElementById('form-plaseaza-comanda');

        if (btnCheckout && checkoutFormContainer) {
            btnCheckout.addEventListener('click', () => {
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                if (cart.length === 0) return showToast('Coșul este gol.', 'error');
                if (!localStorage.getItem('token')) {
                    showToast('Autentifică-te pentru a plasa comanda.', 'error');
                    setTimeout(() => window.location.href = 'login.html', 1500);
                    return;
                }
                btnCheckout.style.display = 'none';
                checkoutFormContainer.style.display = 'block';
            });
        }

        if (formPlaseazaComanda) {
            formPlaseazaComanda.addEventListener('submit', async (e) => {
                e.preventDefault();
                const payload = {
                    adresaLivrare: document.getElementById('checkout-adresa').value,
                    dateFacturare: document.getElementById('checkout-facturare').value,
                    metodaPlata: document.getElementById('checkout-plata').value,
                    produse: JSON.parse(localStorage.getItem('cart')) || []
                };

                try {
                    const response = await fetch('http://localhost:5000/api/orders', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify(payload)
                    });
                    const data = await response.json();
                    
                    if (response.ok) {
                        localStorage.removeItem('cart'); 
                        showToast(data.mesaj, 'success');
                        setTimeout(() => window.location.href = 'profil.html', 2000);
                    } else {
                        showToast(data.mesaj, 'error'); 
                    }
                } catch (err) {
                    showToast('Eroare la procesarea comenzii.', 'error');
                }
            });
        }
    }

    // -------------------------------------------------------------------------
    // 13. CLIENT ORDERS HISTORY
    // -------------------------------------------------------------------------
    const navComenziBtn = document.querySelector('[data-target="comenzi"]');
    if (navComenziBtn) {
        navComenziBtn.addEventListener('click', async () => {
            const tbody = document.getElementById('lista-comenzi-client');
            if (!tbody) return;

            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 30px;"><i class="fas fa-spinner fa-spin"></i> Se încarcă...</td></tr>';
            
            try {
                const response = await fetch('http://localhost:5000/api/orders/mele', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const comenzi = await response.json();
                tbody.innerHTML = ''; 

                if (comenzi.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 30px;">Istoric gol.</td></tr>';
                    return;
                }

                comenzi.forEach(cmd => {
                    const dataStr = new Date(cmd.createdAt).toLocaleDateString('ro-RO');
                    const lista = cmd.produse.map(p => `<strong>${p.cantitate}x</strong> ${p.nume}`).join('<br>');
                    
                    let bgCol = '#f39c12'; 
                    if(cmd.status === 'Expediat') bgCol = '#3498db'; 
                    if(cmd.status === 'Livrat') bgCol = '#27ae60'; 
                    if(cmd.status === 'Anulat') bgCol = '#e74c3c'; 

                    const tr = document.createElement('tr');
                    tr.style.borderBottom = '1px solid #eee';
                    tr.innerHTML = `
                        <td style="padding: 15px 10px; color: #555;">${dataStr}</td>
                        <td style="padding: 15px 10px; font-size: 14px; line-height: 1.6;">${lista}</td>
                        <td style="padding: 15px 10px; font-weight: bold; color: var(--primary-color);">${cmd.total} RON</td>
                        <td style="padding: 15px 10px;">
                            <span style="background: ${bgCol}; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                                ${cmd.status}
                            </span>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            } catch (err) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Eroare sistem.</td></tr>';
            }
        });
    }

    // -------------------------------------------------------------------------
    // 14. DISTRIBUTOR ORDERS MANAGEMENT
    // -------------------------------------------------------------------------
    const navGestiuneBtn = document.querySelector('[data-target="gestiune-comenzi"]');
    if (navGestiuneBtn) {
        navGestiuneBtn.addEventListener('click', async () => {
            const tbody = document.getElementById('lista-comenzi-admin');
            if (!tbody) return;
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 30px;"><i class="fas fa-spinner fa-spin"></i> Se încarcă...</td></tr>';
            
            try {
                const response = await fetch('http://localhost:5000/api/orders/admin/toate', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const comenzi = await response.json();
                tbody.innerHTML = ''; 

                if (comenzi.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Nicio comandă înregistrată.</td></tr>';
                    return;
                }

                comenzi.forEach(cmd => {
                    const dataStr = new Date(cmd.createdAt).toLocaleDateString('ro-RO');
                    const lista = cmd.produse.map(p => `<strong>${p.cantitate}x</strong> ${p.nume}`).join('<br>');
                    
                    const tr = document.createElement('tr');
                    tr.style.borderBottom = '1px solid #eee';
                    tr.innerHTML = `
                        <td style="padding: 15px 10px;">
                            <span style="color: #888; font-size: 12px;">${dataStr}</span><br>
                            <strong>${cmd.client ? cmd.client.nume : 'Client Șters'}</strong><br>
                            <span style="color: var(--primary-color); font-weight: bold;">${cmd.total} RON</span>
                        </td>
                        <td style="padding: 15px 10px; font-size: 14px; line-height: 1.6;">${lista}</td>
                        <td style="padding: 15px 10px; font-size: 14px;">${cmd.adresaLivrare}</td>
                        <td style="padding: 15px 10px;">
                            <div style="display: flex; gap: 10px;">
                                <select class="status-select" style="padding: 5px; border-radius: 4px; border: 1px solid #ccc;">
                                    <option value="Procesare" ${cmd.status === 'Procesare' ? 'selected' : ''}>Procesare</option>
                                    <option value="Expediat" ${cmd.status === 'Expediat' ? 'selected' : ''}>Expediat</option>
                                    <option value="Livrat" ${cmd.status === 'Livrat' ? 'selected' : ''}>Livrat</option>
                                    <option value="Anulat" ${cmd.status === 'Anulat' ? 'selected' : ''}>Anulat</option>
                                </select>
                                <button class="btn btn-secondary btn-update-status" data-id="${cmd._id}" style="padding: 5px 10px; font-size: 12px;"><i class="fas fa-save"></i></button>
                            </div>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            } catch (err) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Eroare încărcare.</td></tr>';
            }
        });

        const tbodyAdmin = document.getElementById('lista-comenzi-admin');
        if (tbodyAdmin) {
            tbodyAdmin.addEventListener('click', async (e) => {
                const btn = e.target.closest('.btn-update-status');
                if (btn) {
                    const idComanda = btn.getAttribute('data-id');
                    const select = btn.previousElementSibling;
                    
                    try {
                        const response = await fetch(`http://localhost:5000/api/orders/${idComanda}/status`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: JSON.stringify({ status: select.value })
                        });
                        const data = await response.json();
                        if (response.ok) showToast(data.mesaj, 'success');
                        else showToast(data.mesaj, 'error');
                    } catch (err) {
                        showToast('Eroare conexiune.', 'error');
                    }
                }
            });
        }
    }

    // -------------------------------------------------------------------------
    // 15. CSV INVENTORY IMPORT
    // -------------------------------------------------------------------------
    const btnUploadCsv = document.getElementById('btn-upload-csv');
    if (btnUploadCsv) {
        btnUploadCsv.addEventListener('click', () => {
            const fileInput = document.getElementById('csv-upload');
            if (!fileInput.files.length) return showToast('Selectează un fișier CSV.', 'error');
            
            const reader = new FileReader(); 
            reader.onload = async (e) => {
                const text = e.target.result;
                const lines = text.split('\n').filter(line => line.trim() !== '');
                if (lines.length < 2) return showToast('Fișier invalid.', 'error');
                
                const primaLinie = lines[0].toLowerCase().replace(/^\uFEFF/, ''); 
                const delim = primaLinie.includes(';') ? ';' : ',';
                const headers = primaLinie.split(delim).map(h => h.trim());
                
                const idxId = headers.indexOf('id');
                const idxPret = headers.indexOf('pret');
                const idxStoc = headers.indexOf('stoc');
                
                if (idxId === -1 || idxPret === -1 || idxStoc === -1) {
                    return showToast('Format invalid. Cap de tabel necesar: id, pret, stoc.', 'error');
                }
                
                const updates = [];
                for (let i = 1; i < lines.length; i++) {
                    const cols = lines[i].split(delim);
                    if (cols.length >= 3) {
                        updates.push({
                            id: cols[idxId].trim(),
                            pret: cols[idxPret].trim(),
                            stoc: cols[idxStoc].trim()
                        });
                    }
                }
                
                try {
                    const response = await fetch('http://localhost:5000/api/products/bulk', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({ updates })
                    });
                    
                    const data = await response.json();
                    if (response.ok || response.status === 207) {
                        showToast(data.mesaj, 'success');
                        document.querySelector('[data-target="produsele-mele"]').click();
                        fileInput.value = ''; 
                    } else {
                        showToast(data.mesaj, 'error');
                    }
                } catch(err) {
                    showToast('Eroare de procesare.', 'error');
                }
            };
            reader.readAsText(fileInput.files[0]);
        });
    }

    // -------------------------------------------------------------------------
    // 16. CONTACT MODAL (GLOBAL)
    // -------------------------------------------------------------------------
    const navContactBtn = document.getElementById('nav-contact-btn');
    
    if (navContactBtn) {
        navContactBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevenim saltul paginii in sus din cauza href="#"
            
            // Verificam daca modalul exista deja in pagina pentru a nu-l duplica
            if (document.getElementById('modal-contact')) return;

            // Construim HTML-ul modalului
            const contactModalHtml = `
                <div id="modal-contact" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center;">
                    <div style="background: white; padding: 30px; border-radius: 8px; width: 90%; max-width: 500px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); position: relative;">
                        <button id="btn-close-contact" style="position: absolute; top: 15px; right: 20px; background: none; border: none; font-size: 28px; cursor: pointer; color: #555;">&times;</button>
                        <h2 style="margin-bottom: 20px; color: var(--primary-color); border-bottom: 2px solid #eee; padding-bottom: 10px;">Contacteaza-ne</h2>
                        
                        <form id="form-modal-contact">
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; font-weight: bold; font-size: 14px; margin-bottom: 5px;">Nume complet</label>
                                <input type="text" id="modal-contact-nume" required placeholder="Ex: Ion Popescu" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; font-weight: bold; font-size: 14px; margin-bottom: 5px;">Adresa de Email</label>
                                <input type="email" id="modal-contact-email" required placeholder="Ex: ion@exemplu.ro" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; font-weight: bold; font-size: 14px; margin-bottom: 5px;">Subiect</label>
                                <input type="text" id="modal-contact-subiect" required placeholder="Subiectul mesajului" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                            </div>
                            <div style="margin-bottom: 25px;">
                                <label style="display: block; font-weight: bold; font-size: 14px; margin-bottom: 5px;">Mesajul tau</label>
                                <textarea id="modal-contact-mesaj" required rows="4" placeholder="Scrie aici detaliile..." style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; resize: vertical;"></textarea>
                            </div>
                            
                            <button type="submit" class="btn btn-primary" style="width: 100%; background: var(--accent-color); color: #000; padding: 12px; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
                                <i class="fas fa-paper-plane" style="margin-right: 5px;"></i> Trimite Mesajul
                            </button>
                        </form>
                    </div>
                </div>
            `;
            
            // Injectam modalul in pagina
            document.body.insertAdjacentHTML('beforeend', contactModalHtml);
            
            const modal = document.getElementById('modal-contact');
            const form = document.getElementById('form-modal-contact');
            const closeBtn = document.getElementById('btn-close-contact');
            
            // Logica pentru inchiderea modalului (pe X)
            closeBtn.addEventListener('click', () => modal.remove());
            
            // Logica pentru trimiterea formularului catre backend
            form.addEventListener('submit', async (event) => {
                event.preventDefault(); 
                
                const payload = {
                    nume: document.getElementById('modal-contact-nume').value,
                    email: document.getElementById('modal-contact-email').value,
                    subiect: document.getElementById('modal-contact-subiect').value,
                    mesaj: document.getElementById('modal-contact-mesaj').value
                };

                try {
                    const response = await fetch('http://localhost:5000/api/messages', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const data = await response.json();

                    if (response.ok) {
                        showToast(data.succes || data.mesaj, 'success');
                        modal.remove(); // Inchidem modalul elegant dupa trimitere
                    } else {
                        showToast(data.eroare || data.mesaj, 'error');
                    }
                } catch (err) {
                    showToast('Eroare conexiune server.', 'error');
                }
            });
        });
    }

    // -------------------------------------------------------------------------
    // 17. ADMIN - USER APPROVALS
    // -------------------------------------------------------------------------
    const navAdminBtn = document.querySelector('[data-target="admin-aprobari"]');
    if (navAdminBtn) {
        navAdminBtn.addEventListener('click', async () => {
            const tbody = document.getElementById('lista-aprobari');
            if (!tbody) return;
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 30px;"><i class="fas fa-spinner fa-spin"></i> Se caută...</td></tr>';
            
            try {
                const response = await fetch('http://localhost:5000/api/admin/in-asteptare');
                const users = await response.json();
                tbody.innerHTML = ''; 

                if (users.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 30px;">Nicio cerere în așteptare.</td></tr>';
                    return;
                }

                users.forEach(u => {
                    const tr = document.createElement('tr');
                    tr.style.borderBottom = '1px solid #eee';
                    tr.innerHTML = `
                        <td style="padding: 15px 10px; font-weight: bold;">${u.nume}</td>
                        <td style="padding: 15px 10px;">${u.email} <br> <span style="font-size:12px; color: ${u.confirmat ? '#27ae60' : '#e74c3c'}">${u.confirmat ? 'Confirmat' : 'Neconfirmat'}</span></td>
                        <td style="padding: 15px 10px;">${u.cui || 'N/A'}</td>
                        <td style="padding: 15px 10px;">
                            <button class="btn btn-primary btn-aproba" data-id="${u._id}" style="background: #27ae60; border: none; padding: 8px 15px; border-radius: 4px; font-size: 14px;"><i class="fas fa-check"></i> Aprobă</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            } catch (err) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Eroare sistem.</td></tr>';
            }
        });

        const tbodyAprobari = document.getElementById('lista-aprobari');
        if (tbodyAprobari) {
            tbodyAprobari.addEventListener('click', async (e) => {
                const btn = e.target.closest('.btn-aproba');
                if (btn) {
                    try {
                        const response = await fetch(`http://localhost:5000/api/admin/aproba/${btn.getAttribute('data-id')}`, { method: 'PUT' });
                        const data = await response.json();
                        if (response.ok) {
                            showToast(data.mesaj, 'success');
                            navAdminBtn.click(); 
                        }
                    } catch (err) {
                        showToast('Eroare rețea.', 'error');
                    }
                }
            });
        }
    }

    // -------------------------------------------------------------------------
    // 18. ADMIN - CONTACT MESSAGES
    // -------------------------------------------------------------------------
    const navMesajeBtn = document.querySelector('[data-target="admin-mesaje"]');
    if (navMesajeBtn) {
        navMesajeBtn.addEventListener('click', async () => {
            const tbody = document.getElementById('lista-mesaje');
            if (!tbody) return;
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 30px;"><i class="fas fa-spinner fa-spin"></i> Se încarcă...</td></tr>';
            
            try {
                const response = await fetch('http://localhost:5000/api/messages', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const msgs = await response.json();
                tbody.innerHTML = ''; 

                if (!response.ok) return tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: red;">Eroare: ${msgs.mesaj}</td></tr>`;
                if (msgs.length === 0) return tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Nu există mesaje.</td></tr>';

                msgs.forEach(msg => {
                    const dataStr = new Date(msg.createdAt).toLocaleDateString('ro-RO', { hour: '2-digit', minute: '2-digit' });
                    const tr = document.createElement('tr');
                    tr.style.borderBottom = '1px solid #eee';
                    tr.innerHTML = `
                        <td style="padding: 15px 10px; font-weight: bold; width: 15%;">${dataStr}</td>
                        <td style="padding: 15px 10px; width: 25%;">
                            <strong>${msg.nume}</strong><br>
                            <a href="mailto:${msg.email}" style="font-size: 13px; color: #3498db;">${msg.email}</a>
                        </td>
                        <td style="padding: 15px 10px;">
                            <strong style="color: var(--primary-color);">${msg.subiect}</strong>
                            <p style="margin-top: 5px; font-size: 14px; color: #555;">${msg.mesaj}</p>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            } catch (err) {
                tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: red;">Eroare server.</td></tr>';
            }
        });
    }

    // -------------------------------------------------------------------------
    // 19. PRODUCT COMPARISON
    // -------------------------------------------------------------------------
    const compBarHtml = `
        <div id="compare-floating-bar" style="display: none; position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: #2c3e50; color: white; padding: 15px 30px; border-radius: 30px; box-shadow: 0 5px 20px rgba(0,0,0,0.3); z-index: 1000; align-items: center; gap: 20px; font-family: sans-serif;">
            <span id="compare-count-text" style="font-weight: bold;"></span>
            <button id="btn-open-compare" class="btn btn-primary" style="padding: 8px 20px; font-size: 14px; background: #f39c12; color: #000; border: none; border-radius: 20px; font-weight: bold; cursor: pointer;" disabled><i class="fas fa-balance-scale"></i> Compară</button>
            <button id="btn-clear-compare" style="background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 14px; font-weight: bold;"><i class="fas fa-times"></i> Anulează</button>
        </div>
        <div id="compare-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; align-items: center; justify-content: center;">
            <div style="background: white; padding: 30px; border-radius: 12px; width: 95%; max-width: 900px; max-height: 90vh; overflow-y: auto; position: relative;">
                <button id="btn-close-compare" style="position: absolute; top: 15px; right: 20px; background: none; border: none; font-size: 28px; cursor: pointer; color: #555;">&times;</button>
                <h2 style="margin-bottom: 25px; color: #2c3e50; border-bottom: 2px solid #eee; padding-bottom: 10px; text-align: center;">Comparație Produse</h2>
                <div id="compare-content" style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;"></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', compBarHtml);

    let compItems = [];
    const compBar = document.getElementById('compare-floating-bar');
    
    if (catalogGrid) {
        catalogGrid.addEventListener('change', (e) => {
            if (e.target.classList.contains('compare-checkbox')) {
                const id = e.target.getAttribute('data-id');
                if (e.target.checked) {
                    if (compItems.length >= 2) {
                        showToast('Limită maximă 2 produse.', 'error');
                        e.target.checked = false;
                        return;
                    }
                    compItems.push(id);
                } else {
                    compItems = compItems.filter(i => i !== id);
                }
                updateCompBar();
            }
        });
    }

    const updateCompBar = () => {
        if (compItems.length === 0) {
            compBar.style.display = 'none';
        } else {
            compBar.style.display = 'flex';
            document.getElementById('compare-count-text').textContent = `${compItems.length} produs(e)`;
            const btn = document.getElementById('btn-open-compare');
            btn.disabled = compItems.length !== 2;
            btn.style.opacity = compItems.length === 2 ? '1' : '0.5';
        }
    };

    document.getElementById('btn-clear-compare').addEventListener('click', () => {
        compItems = [];
        document.querySelectorAll('.compare-checkbox').forEach(cb => cb.checked = false);
        updateCompBar();
    });

    document.getElementById('btn-close-compare').addEventListener('click', () => {
        document.getElementById('compare-modal').style.display = 'none';
    });

    document.getElementById('btn-open-compare').addEventListener('click', async () => {
        const content = document.getElementById('compare-content');
        content.innerHTML = '<p style="grid-column: 1/-1; text-align: center;"><i class="fas fa-spinner fa-spin"></i> Se procesează...</p>';
        document.getElementById('compare-modal').style.display = 'flex';

        try {
            const [p1, p2] = await Promise.all([
                fetch(`http://localhost:5000/api/products/${compItems[0]}`).then(r => r.json()),
                fetch(`http://localhost:5000/api/products/${compItems[1]}`).then(r => r.json())
            ]);

            const fmtSpecs = (s) => s ? s.split(',').map(x => `<li style="padding: 8px 0; border-bottom: 1px solid #eee;">${x.trim()}</li>`).join('') : '<p style="color: #888;">N/A</p>';
            const cStyle = "background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef; text-align: center;";
            
            content.innerHTML = [p1, p2].map(p => `
                <div style="${cStyle}">
                    ${p.imagine ? `<img src="${p.imagine}" style="width: 100%; height: 200px; object-fit: contain; background: white; border-radius: 4px; padding: 10px; margin-bottom: 15px;">` : '<div style="height:200px; background:#ddd; margin-bottom:15px; display:flex; align-items:center; justify-content:center;">N/A</div>'}
                    <span style="color: #888; font-size: 12px; text-transform: uppercase;">${p.categorie}</span>
                    <h3 style="margin: 10px 0; font-size: 20px; color: #2c3e50;">${p.nume}</h3>
                    <p style="font-size: 24px; font-weight: bold; color: #f39c12; margin-bottom: 20px;">${p.pret} RON</p>
                    <div style="text-align: left; background: white; padding: 15px; border-radius: 4px;">
                        <h4 style="margin-bottom: 10px; color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 5px;">Specificații</h4>
                        <ul style="list-style: none; padding: 0; font-size: 14px; margin: 0;">${fmtSpecs(p.specificatii)}</ul>
                    </div>
                </div>
            `).join('');
        } catch (err) {
            content.innerHTML = '<p style="grid-column: 1/-1; color: red;">Eroare rețea.</p>';
        }
    });

    // -------------------------------------------------------------------------
    // 20. PASSWORD RECOVERY
    // -------------------------------------------------------------------------
    const btnForgot = document.getElementById('btn-forgot-password');
    if (btnForgot) {
        btnForgot.addEventListener('click', (e) => {
            e.preventDefault();
            const modalHtml = `
                <div id="modal-forgot-pass" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 9999; display: flex; align-items: center; justify-content: center;">
                    <div style="background: white; padding: 30px; border-radius: 8px; width: 90%; max-width: 400px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); text-align: center;">
                        <h3 style="margin-bottom: 20px; color: var(--primary-color);">Recuperare parolă</h3>
                        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Introdu email-ul asociat contului tău.</p>
                        <input type="email" id="inp-forgot-email" placeholder="nume@exemplu.com" style="width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 20px;">
                        <div style="display: flex; gap: 10px;">
                            <button id="btn-cancel-forgot" class="btn" style="flex: 1; background: #eee;">Anulează</button>
                            <button id="btn-send-forgot" class="btn btn-primary" style="flex: 1; background: var(--accent-color); color: #000;">Trimite</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            const m = document.getElementById('modal-forgot-pass');
            document.getElementById('btn-cancel-forgot').onclick = () => m.remove();
            document.getElementById('btn-send-forgot').onclick = async () => {
                const em = document.getElementById('inp-forgot-email').value;
                if (!em) return showToast('Email invalid.', 'error');
                try {
                    const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
                        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: em.trim() })
                    });
                    const d = await res.json();
                    if (res.ok) { showToast(d.mesaj, 'success'); m.remove(); }
                    else showToast(d.mesaj, 'error');
                } catch (err) { showToast('Eroare rețea.', 'error'); }
            };
        });
    }

    if (window.location.pathname.includes('login.html')) {
        const tokenReset = new URLSearchParams(window.location.search).get('resetToken');
        if (tokenReset) {
            const resetHtml = `
                <div id="modal-reset-pass" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center;">
                    <div style="background: white; padding: 30px; border-radius: 8px; width: 90%; max-width: 400px; text-align: center;">
                        <h3 style="margin-bottom: 20px;">Setare parolă nouă</h3>
                        <form id="form-reset-pass">
                            <input type="password" id="inp-new-pass" required placeholder="Minim 8 caractere" style="width: 100%; padding: 12px; margin-bottom: 20px;">
                            <button type="submit" class="btn btn-primary" style="width: 100%; background: #27ae60;"><i class="fas fa-save"></i> Schimbă Parola</button>
                        </form>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', resetHtml);
            document.getElementById('form-reset-pass').addEventListener('submit', async (e) => {
                e.preventDefault();
                const pass = document.getElementById('inp-new-pass').value;
                if (pass.length < 8) return showToast('Minim 8 caractere necesare.', 'error');
                try {
                    const res = await fetch(`http://localhost:5000/api/auth/reset-password/${tokenReset}`, {
                        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ parola: pass })
                    });
                    const d = await res.json();
                    if (res.ok) {
                        showToast(d.mesaj, 'success');
                        setTimeout(() => window.location.href = 'login.html', 2000);
                    } else showToast(d.mesaj, 'error');
                } catch (err) { showToast('Eroare conexiune.', 'error'); }
            });
        }
    }

    // -------------------------------------------------------------------------
    // 21. EDIT PROFILE LOGIC
    // -------------------------------------------------------------------------
    const btnEditDate = document.getElementById('btn-edit-profil');
    if (btnEditDate && userString) {
        btnEditDate.addEventListener('click', () => {
            const u = JSON.parse(userString);
            const html = `
                <div id="modal-edit-profil" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center;">
                    <div style="background: white; padding: 30px; border-radius: 8px; width: 90%; max-width: 450px;">
                        <h2 style="margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px;">Editează Profilul</h2>
                        <form id="form-edit-profil">
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; font-weight: bold;">Nume Complet</label>
                                <input type="text" id="edit-nume" value="${u.nume || ''}" required style="width: 100%; padding: 10px; border-radius: 4px; border: 1px solid #ccc;">
                            </div>
                            <div style="margin-bottom: 15px; display: ${u.rol !== 'fizica' ? 'block' : 'none'};">
                                <label style="display: block; font-weight: bold;">Nume Firmă</label>
                                <input type="text" id="edit-firma" value="${u.numeFirma || ''}" style="width: 100%; padding: 10px; border-radius: 4px; border: 1px solid #ccc;">
                            </div>
                            <div style="margin-bottom: 25px; display: ${u.rol !== 'fizica' ? 'block' : 'none'};">
                                <label style="display: block; font-weight: bold;">CUI</label>
                                <input type="text" id="edit-cui" value="${u.cui || ''}" style="width: 100%; padding: 10px; border-radius: 4px; border: 1px solid #ccc;">
                            </div>
                            <div style="display: flex; gap: 15px;">
                                <button type="button" id="btn-cancel-edit" class="btn" style="flex: 1; background: #e74c3c; color: white;">Anulează</button>
                                <button type="submit" class="btn" style="flex: 1; background: #27ae60; color: white;"><i class="fas fa-save"></i> Salvează</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', html);
            
            const mod = document.getElementById('modal-edit-profil');
            document.getElementById('btn-cancel-edit').onclick = () => mod.remove();
            document.getElementById('form-edit-profil').addEventListener('submit', async (e) => {
                e.preventDefault();
                const p = {
                    nume: document.getElementById('edit-nume').value,
                    numeFirma: document.getElementById('edit-firma').value,
                    cui: document.getElementById('edit-cui').value
                };
                try {
                    const res = await fetch('http://localhost:5000/api/auth/update', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                        body: JSON.stringify(p)
                    });
                    const d = await res.json();
                    if (res.ok) {
                        localStorage.setItem('user', JSON.stringify(d.user));
                        window.location.reload(); 
                    } else showToast(d.mesaj, 'error');
                } catch (err) { showToast('Eroare sistem.', 'error'); }
            });
        });
    }
});