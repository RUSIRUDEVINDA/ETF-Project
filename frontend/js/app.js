/**
 * ============================================================
 * FILE: frontend/js/app.js
 * PURPOSE: Core JavaScript & jQuery logic for all frontend pages
 * ============================================================
 *
 * JQUERY USAGES (Minimum 5 - clearly commented):
 *  [jQuery #1]  - AJAX calls ($.ajax) for all API communication
 *  [jQuery #2]  - DOM Manipulation (append, html, text, val, prop)
 *  [jQuery #3]  - Event Handling (on click, on submit, on keyup)
 *  [jQuery #4]  - Animations & Effects (fadeIn, fadeOut, slideDown, animate)
 *  [jQuery #5]  - Form Validation (custom validator with real-time feedback)
 *  [jQuery #6]  - Dynamic Table Updates (building rows from JSON)
 *  [jQuery #7]  - Show/Hide Sections (toggle visibility based on state)
 *  [jQuery #8]  - Real-time Search Filtering (filter table rows live)
 *  [jQuery #9]  - Toast Notifications (custom toast system)
 *  [jQuery #10] - Button Click Handlers with loading states
 */

// ─────────────────────────────────────────────────────────────
// NAVBAR HTML TEMPLATE
// ─────────────────────────────────────────────────────────────
const navbarHtml = `
<nav class="navbar navbar-expand-lg fuel-navbar">
    <div class="container">
        <a class="navbar-brand" href="index.html">
            <div class="brand-icon">FQ</div>
            <span class="brand-text">FuelQR</span>
        </a>
        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navMenu">
            <ul class="navbar-nav ms-auto gap-1">
                <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
                <li class="nav-item"><a class="nav-link" href="register.html">Register</a></li>
                <li class="nav-item"><a class="nav-link" href="vehicles.html">Vehicles</a></li>
                <li class="nav-item"><a class="nav-link" href="search.html">Search</a></li>
                <li class="nav-item"><a class="nav-link" href="update.html">Update</a></li>
                <li class="nav-item"><a class="nav-link" href="delete.html">Delete</a></li>
            </ul>
        </div>
    </div>
</nav>
`;

// ─────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:5000/api/vehicles';

// ─────────────────────────────────────────────────────────────
// [jQuery #9] TOAST NOTIFICATION SYSTEM
// Creates and auto-removes Bootstrap toast messages
// ─────────────────────────────────────────────────────────────
function showToast(message, type = 'success') {
    const icons = {
        success: 'OK',
        error:   '!',
        warning: '!',
        info:    'i'
    };
    const colors = {
        success: 'linear-gradient(135deg, #0f9b58, #00c9a7)',
        error:   'linear-gradient(135deg, #e74c3c, #c0392b)',
        warning: 'linear-gradient(135deg, #f39c12, #e67e22)',
        info:    'linear-gradient(135deg, #3498db, #2980b9)'
    };

    const toastId = 'toast-' + Date.now();
    // [jQuery #2] DOM Manipulation — dynamically append toast HTML
    const toastHtml = `
        <div id="${toastId}" class="fuel-toast" style="background: ${colors[type]}">
            <span class="toast-icon">${icons[type]}</span>
            <span class="toast-msg">${message}</span>
            <button class="toast-close" onclick="$('#${toastId}').fadeOut(300, function(){ $(this).remove(); })">x</button>
        </div>`;

    if ($('#toast-container').length === 0) {
        $('body').append('<div id="toast-container"></div>');
    }

    // [jQuery #4] Animations — fadeIn effect on toast appear
    $('#toast-container').append(toastHtml);
    $(`#${toastId}`).hide().fadeIn(400);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
        $(`#${toastId}`).fadeOut(500, function () { $(this).remove(); });
    }, 4000);
}

// ─────────────────────────────────────────────────────────────
// LOADING SPINNER HELPERS
// ─────────────────────────────────────────────────────────────
function showSpinner(containerId) {
    // [jQuery #7] Show/Hide — display spinner section
    $(`#${containerId}`).html(`
        <div class="text-center py-5">
            <div class="fuel-spinner">
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
            </div>
            <p class="mt-3 text-muted">Loading data...</p>
        </div>
    `).fadeIn(300);
}

function setButtonLoading(btn, loading, originalText) {
    if (loading) {
        // [jQuery #2] DOM Manipulation — change button state
        $(btn).prop('disabled', true)
              .html('<span class="spinner-border spinner-border-sm me-2"></span>Processing...');
    } else {
        $(btn).prop('disabled', false).html(originalText);
    }
}

// ─────────────────────────────────────────────────────────────
// [jQuery #5] FORM VALIDATION HELPERS
// Real-time validation with visual feedback
// ─────────────────────────────────────────────────────────────
function validateField(input, regex, errorMsg) {
    const val = $(input).val().trim();
    if (!val) {
        $(input).addClass('is-invalid').removeClass('is-valid');
        $(input).siblings('.invalid-feedback').text('This field is required.');
        return false;
    }
    if (regex && !regex.test(val)) {
        $(input).addClass('is-invalid').removeClass('is-valid');
        $(input).siblings('.invalid-feedback').text(errorMsg);
        return false;
    }
    $(input).removeClass('is-invalid').addClass('is-valid');
    return true;
}

function validateRegistrationForm() {
    let valid = true;
    // [jQuery #3] Event-driven validation — check all required fields
    valid = validateField('#regNo',    /^[A-Z]{2,3}-\d{4}$/i, 'Format: ABC-1234') && valid;
    valid = validateField('#firstName', /^[A-Za-z\s]{2,50}$/, 'Letters only, 2–50 chars') && valid;
    valid = validateField('#lastName',  /^[A-Za-z\s]{2,50}$/, 'Letters only, 2–50 chars') && valid;
    valid = validateField('#email', /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format') && valid;
    valid = validateField('#nearestStation', null, '') && valid;
    valid = validateField('#fuelType', null, '') && valid;
    valid = validateField('#ownerNIC', /^[0-9]{9}[vVxX]$|^[0-9]{12}$/, 'Format: 123456789V or 200012345678') && valid;
    valid = validateField('#vehicleModel', null, '') && valid;
    return valid;
}

// ─────────────────────────────────────────────────────────────
// RENDER FUEL TYPE BADGE
// ─────────────────────────────────────────────────────────────
function fuelBadge(type) {
    const badges = {
        'Petrol':   '<span class="badge-fuel petrol"> Petrol</span>',
        'Diesel':   '<span class="badge-fuel diesel">️ Diesel</span>',
        'Kerosene': '<span class="badge-fuel kerosene"> Kerosene</span>'
    };
    return badges[type] || `<span class="badge bg-secondary">${type}</span>`;
}

// ─────────────────────────────────────────────────────────────
// BUILD VEHICLE TABLE ROW HTML
// ─────────────────────────────────────────────────────────────
function buildVehicleRow(v, index) {
    return `
        <tr class="vehicle-row" data-search="${(v.FirstName + ' ' + v.LastName + ' ' + v.RegNo + ' ' + v.FuelType + ' ' + v.NearestStation).toLowerCase()}">
            <td><span class="row-num">${index + 1}</span></td>
            <td><strong class="reg-badge">${v.RegNo}</strong></td>
            <td>${v.FirstName} ${v.LastName}</td>
            <td><a href="mailto:${v.Email}" class="email-link">${v.Email}</a></td>
            <td>${fuelBadge(v.FuelType)}</td>
            <td><span class="station-name"> ${v.NearestStation}</span></td>
            <td><code class="nic-code">${v.OwnerNIC}</code></td>
            <td>${v.VehicleModel}</td>
            <td><span class="quota-badge">${v.WeeklyQuota}L</span></td>
            <td>
                <span class="status-dot ${v.IsActive ? 'active' : 'inactive'}">
                    ${v.IsActive ? '● Active' : '○ Inactive'}
                </span>
            </td>
            <td>
                <div class="action-btns">
                    <button class="btn-action view-qr" data-qr="${v.QRCode}" data-regno="${v.RegNo}" title="View QR">
                        <i></i>
                    </button>
                    <button class="btn-action edit-vehicle" data-regno="${v.RegNo}" title="Edit">
                        <i>️</i>
                    </button>
                    <button class="btn-action delete-vehicle" data-regno="${v.RegNo}" title="Delete">
                        <i>️</i>
                    </button>
                </div>
            </td>
        </tr>`;
}

// ─────────────────────────────────────────────────────────────
// BUILD VEHICLE CARD HTML (for search results)
// ─────────────────────────────────────────────────────────────
function buildVehicleCard(v) {
    return `
        <div class="col-md-6 col-lg-4">
            <div class="vehicle-card" style="animation: fadeSlideUp 0.4s ease forwards;">
                <div class="vehicle-card-header">
                    <span class="reg-number">${v.RegNo}</span>
                    ${fuelBadge(v.FuelType)}
                </div>
                <div class="vehicle-card-body">
                    <div class="owner-info">
                        <div class="owner-avatar">${v.FirstName[0]}${v.LastName[0]}</div>
                        <div>
                            <div class="owner-name">${v.FirstName} ${v.LastName}</div>
                            <div class="owner-email">${v.Email}</div>
                        </div>
                    </div>
                    <div class="vehicle-details">
                        <div class="detail-item">
                            <span class="detail-label"> Model</span>
                            <span class="detail-value">${v.VehicleModel}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label"> Station</span>
                            <span class="detail-value">${v.NearestStation}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label"> NIC</span>
                            <span class="detail-value">${v.OwnerNIC}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label"> Quota</span>
                            <span class="detail-value">${v.WeeklyQuota}L / week</span>
                        </div>
                    </div>
                    ${v.QRCode ? `<div class="qr-preview-wrap">
                        <img src="${v.QRCode}" alt="QR Code" class="qr-preview-img" />
                        <p class="qr-label">Scan to Verify</p>
                    </div>` : ''}
                </div>
            </div>
        </div>`;
}

// ─────────────────────────────────────────────────────────────
// [jQuery #1] AJAX — REGISTER VEHICLE (POST)
// ─────────────────────────────────────────────────────────────
function registerVehicle(e) {
    e.preventDefault();
    if (!validateRegistrationForm()) {
        showToast('Please fix the highlighted errors before submitting.', 'warning');
        return;
    }

    const btn = '#registerBtn';
    const originalText = $(btn).html();
    setButtonLoading(btn, true, originalText);

    const vehicleData = {
        RegNo:          $('#regNo').val().trim().toUpperCase(),
        FirstName:      $('#firstName').val().trim(),
        LastName:       $('#lastName').val().trim(),
        Email:          $('#email').val().trim().toLowerCase(),
        NearestStation: $('#nearestStation').val().trim(),
        FuelType:       $('#fuelType').val(),
        OwnerNIC:       $('#ownerNIC').val().trim(),
        VehicleModel:   $('#vehicleModel').val().trim(),
        WeeklyQuota:    parseInt($('#weeklyQuota').val()) || 20
    };

    // [jQuery #1] AJAX POST Request
    $.ajax({
        url:         API_BASE,
        type:        'POST',
        contentType: 'application/json',
        data:        JSON.stringify(vehicleData),
        success: function (response) {
            setButtonLoading(btn, false, originalText);
            if (response.success) {
                showToast(`Vehicle ${vehicleData.RegNo} registered successfully! `, 'success');
                // [jQuery #4] Animation — slide down success panel
                $('#successPanel').hide().slideDown(400);
                $('#successRegNo').text(vehicleData.RegNo);

                // Display QR code if generated
                if (response.data && response.data.QRCode) {
                    $('#generatedQR').attr('src', response.data.QRCode).show();
                }

                // Reset form with fade effect
                setTimeout(() => {
                    $('#registerForm')[0].reset();
                    $('#registerForm .is-valid').removeClass('is-valid');
                    $('#successPanel').slideUp(300);
                }, 5000);
            }
        },
        error: function (xhr) {
            setButtonLoading(btn, false, originalText);
            const msg = xhr.responseJSON?.message || 'Registration failed. Please try again.';
            showToast(msg, 'error');
            // [jQuery #7] Show error alert section
            $('#errorAlert').text(msg).parent().removeClass('d-none').hide().fadeIn(400);
        }
    });
}

// ─────────────────────────────────────────────────────────────
// [jQuery #1] AJAX — LOAD ALL VEHICLES (GET)
// ─────────────────────────────────────────────────────────────
function loadAllVehicles() {
    showSpinner('vehiclesTableContainer');

    // [jQuery #1] AJAX GET Request
    $.ajax({
        url:  API_BASE,
        type: 'GET',
        success: function (response) {
            if (!response.success || response.data.length === 0) {
                // [jQuery #7] Show/Hide — show empty state
                $('#vehiclesTableContainer').html(`
                    <div class="empty-state">
                        <div class="empty-icon"></div>
                        <h4>No Vehicles Registered Yet</h4>
                        <p>Click "Register Vehicle" to add your first vehicle.</p>
                        <a href="register.html" class="btn-primary-fuel">Register Now</a>
                    </div>
                `).fadeIn(400);
                return;
            }

            // [jQuery #6] Dynamic Table Updates — build rows from API data
            let rows = '';
            response.data.forEach((v, i) => { rows += buildVehicleRow(v, i); });

            const tableHtml = `
                <div class="table-toolbar">
                    <div class="table-info">
                        <span class="vehicle-count">${response.data.length} Vehicles</span>
                    </div>
                    <div class="search-box-wrap">
                        <input type="text" id="liveSearchInput" class="live-search-input" placeholder=" Filter vehicles..." />
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="fuel-table" id="vehiclesTable">
                        <thead>
                            <tr>
                                <th>#</th><th>Reg No</th><th>Owner</th><th>Email</th>
                                <th>Fuel</th><th>Station</th><th>NIC</th>
                                <th>Model</th><th>Quota</th><th>Status</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="vehiclesTbody">${rows}</tbody>
                    </table>
                </div>`;

            // [jQuery #4] Animations — fade in the table
            $('#vehiclesTableContainer').hide().html(tableHtml).fadeIn(500);

            // Bind live search after table is rendered
            bindLiveSearch();
            bindTableActions();
        },
        error: function (xhr) {
            const msg = xhr.responseJSON?.message || 'Failed to load vehicles.';
            $('#vehiclesTableContainer').html(`<div class="alert-error-fuel">${msg}</div>`);
            showToast(msg, 'error');
        }
    });
}

// ─────────────────────────────────────────────────────────────
// [jQuery #8] REAL-TIME SEARCH FILTERING
// Filters table rows live without any API call
// ─────────────────────────────────────────────────────────────
function bindLiveSearch() {
    // [jQuery #3] Event Handling — keyup event for live filter
    $(document).on('keyup', '#liveSearchInput', function () {
        const query = $(this).val().toLowerCase().trim();
        let visibleCount = 0;

        // [jQuery #6] Dynamic Table — show/hide rows based on match
        $('#vehiclesTbody .vehicle-row').each(function () {
            const rowData = $(this).attr('data-search') || '';
            if (rowData.includes(query)) {
                $(this).show();
                visibleCount++;
            } else {
                $(this).hide();
            }
        });

        // Update counter
        $('.vehicle-count').text(`${visibleCount} Vehicles`);

        // Show "no results" row if nothing matches
        if (visibleCount === 0) {
            if ($('#noResultsRow').length === 0) {
                $('#vehiclesTbody').append(
                    '<tr id="noResultsRow"><td colspan="11" class="text-center py-4 text-muted">No vehicles match your search.</td></tr>'
                );
            }
        } else {
            $('#noResultsRow').remove();
        }
    });
}

// ─────────────────────────────────────────────────────────────
// BIND TABLE ACTION BUTTONS (View QR, Edit, Delete)
// ─────────────────────────────────────────────────────────────
function bindTableActions() {
    // [jQuery #3] Event Handling — QR view button
    $(document).on('click', '.view-qr', function () {
        const qrSrc  = $(this).data('qr');
        const regNo  = $(this).data('regno');
        $('#qrModalRegNo').text(regNo);
        if (qrSrc) {
            $('#qrModalImage').attr('src', qrSrc).removeClass('d-none');
            $('#qrNoData').addClass('d-none');
        } else {
            $('#qrModalImage').addClass('d-none');
            $('#qrNoData').removeClass('d-none');
        }
        const modal = new bootstrap.Modal(document.getElementById('qrModal'));
        modal.show();
    });

    // [jQuery #3] Event Handling — Edit button redirect
    $(document).on('click', '.edit-vehicle', function () {
        const regNo = $(this).data('regno');
        window.location.href = `update.html?regNo=${regNo}`;
    });

    // [jQuery #3] Event Handling — Delete button (show confirm modal)
    $(document).on('click', '.delete-vehicle', function () {
        const regNo = $(this).data('regno');
        $('#deleteConfirmRegNo').text(regNo);
        $('#confirmDeleteBtn').data('regno', regNo);
        const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
        modal.show();
    });
}

// ─────────────────────────────────────────────────────────────
// [jQuery #1] AJAX — SEARCH VEHICLE (GET)
// ─────────────────────────────────────────────────────────────
function searchVehicle(e) {
    e.preventDefault();

    const searchBy  = $('#searchBy').val();
    const searchVal = $('#searchValue').val().trim();

    if (!searchBy || !searchVal) {
        showToast('Please select a search type and enter a value.', 'warning');
        return;
    }

    const endpoints = {
        regno:     `${API_BASE}/regno/${encodeURIComponent(searchVal)}`,
        firstname: `${API_BASE}/firstname/${encodeURIComponent(searchVal)}`,
        lastname:  `${API_BASE}/lastname/${encodeURIComponent(searchVal)}`,
        email:     `${API_BASE}/email/${encodeURIComponent(searchVal)}`,
        nic:       `${API_BASE}/nic/${encodeURIComponent(searchVal)}`,
        fueltype:  `${API_BASE}/fueltype/${encodeURIComponent(searchVal)}`,
        station:   `${API_BASE}/station/${encodeURIComponent(searchVal)}`
    };

    const url = endpoints[searchBy];
    if (!url) { showToast('Invalid search type.', 'error'); return; }

    const btn = '#searchBtn';
    const originalText = $(btn).html();
    setButtonLoading(btn, true, originalText);
    showSpinner('searchResults');

    // [jQuery #1] AJAX GET — Search request
    $.ajax({
        url:  url,
        type: 'GET',
        success: function (response) {
            setButtonLoading(btn, false, originalText);

            if (!response.success) {
                $('#searchResults').html(`<div class="empty-state"><div class="empty-icon"></div><h4>No Results Found</h4><p>${response.message}</p></div>`).fadeIn(400);
                return;
            }

            const vehicles = Array.isArray(response.data) ? response.data : [response.data];
            let cardsHtml  = '';
            vehicles.forEach(v => { cardsHtml += buildVehicleCard(v); });

            // [jQuery #4] Animations — fadeIn results
            $('#searchResults').hide().html(`
                <div class="search-results-header">
                    <h5>Found ${vehicles.length} result(s)</h5>
                </div>
                <div class="row g-4">${cardsHtml}</div>
            `).fadeIn(500);

            showToast(`${vehicles.length} vehicle(s) found!`, 'success');
        },
        error: function (xhr) {
            setButtonLoading(btn, false, originalText);
            const msg = xhr.responseJSON?.message || 'Search failed.';
            $('#searchResults').html(`<div class="empty-state"><div class="empty-icon"></div><h4>${msg}</h4></div>`).fadeIn(400);
            showToast(msg, 'error');
        }
    });
}

// ─────────────────────────────────────────────────────────────
// [jQuery #1] AJAX — LOAD VEHICLE FOR UPDATE (GET then PUT)
// ─────────────────────────────────────────────────────────────
function loadVehicleForUpdate() {
    const urlParams = new URLSearchParams(window.location.search);
    const regNo     = urlParams.get('regNo');

    if (regNo) {
        $('#fetchRegNo').val(regNo);
        fetchVehicleForEdit(regNo);
    }
}

function fetchVehicleForEdit(regNo) {
    if (!regNo) { showToast('Please enter a Registration Number.', 'warning'); return; }

    const btn = '#fetchVehicleBtn';
    const originalText = $(btn).html();
    setButtonLoading(btn, true, originalText);

    // [jQuery #1] AJAX GET — fetch vehicle data to pre-fill update form
    $.ajax({
        url:  `${API_BASE}/regno/${encodeURIComponent(regNo.toUpperCase())}`,
        type: 'GET',
        success: function (response) {
            setButtonLoading(btn, false, originalText);
            if (!response.success) {
                showToast(response.message, 'error');
                return;
            }
            const v = response.data;
            // [jQuery #2] DOM Manipulation — pre-fill update form fields
            $('#upRegNo').val(v.RegNo);
            $('#upFirstName').val(v.FirstName);
            $('#upLastName').val(v.LastName);
            $('#upEmail').val(v.Email);
            $('#upNearestStation').val(v.NearestStation);
            $('#upFuelType').val(v.FuelType);
            $('#upOwnerNIC').val(v.OwnerNIC);
            $('#upVehicleModel').val(v.VehicleModel);
            $('#upWeeklyQuota').val(v.WeeklyQuota);

            // [jQuery #7] Show/Hide — reveal the update form
            $('#updateFormSection').hide().slideDown(500);
            showToast('Vehicle data loaded. Make your changes.', 'info');
        },
        error: function (xhr) {
            setButtonLoading(btn, false, originalText);
            const msg = xhr.responseJSON?.message || 'Vehicle not found.';
            showToast(msg, 'error');
        }
    });
}

function updateVehicle(e) {
    e.preventDefault();
    const regNo = $('#upRegNo').val().trim().toUpperCase();
    if (!regNo) { showToast('Registration number is missing.', 'error'); return; }

    const updateData = {};
    const fields = {
        FirstName:      $('#upFirstName').val().trim(),
        LastName:       $('#upLastName').val().trim(),
        Email:          $('#upEmail').val().trim().toLowerCase(),
        NearestStation: $('#upNearestStation').val().trim(),
        FuelType:       $('#upFuelType').val(),
        OwnerNIC:       $('#upOwnerNIC').val().trim(),
        VehicleModel:   $('#upVehicleModel').val().trim(),
        WeeklyQuota:    parseInt($('#upWeeklyQuota').val()) || 20
    };

    // Only include non-empty fields in the update payload
    Object.keys(fields).forEach(k => { if (fields[k]) updateData[k] = fields[k]; });

    const btn = '#updateBtn';
    const originalText = $(btn).html();
    setButtonLoading(btn, true, originalText);

    // [jQuery #1] AJAX PUT — update vehicle
    $.ajax({
        url:         `${API_BASE}/regno/${encodeURIComponent(regNo)}`,
        type:        'PUT',
        contentType: 'application/json',
        data:        JSON.stringify(updateData),
        success: function (response) {
            setButtonLoading(btn, false, originalText);
            if (response.success) {
                showToast(`Vehicle ${regNo} updated successfully! `, 'success');
                // [jQuery #4] Animation — flash the form border
                $('#updateForm').addClass('form-success-flash');
                setTimeout(() => $('#updateForm').removeClass('form-success-flash'), 1500);
            }
        },
        error: function (xhr) {
            setButtonLoading(btn, false, originalText);
            const msg = xhr.responseJSON?.message || 'Update failed.';
            showToast(msg, 'error');
        }
    });
}

// ─────────────────────────────────────────────────────────────
// [jQuery #1] AJAX — DELETE VEHICLE (DELETE)
// ─────────────────────────────────────────────────────────────
function deleteVehicle(regNo) {
    if (!regNo) { showToast('Please enter a Registration Number.', 'warning'); return; }

    const btn = '#confirmDeleteBtn';
    const originalText = $(btn).html();
    setButtonLoading(btn, true, originalText);

    // [jQuery #1] AJAX DELETE Request
    $.ajax({
        url:  `${API_BASE}/regno/${encodeURIComponent(regNo.toUpperCase())}`,
        type: 'DELETE',
        success: function (response) {
            setButtonLoading(btn, false, originalText);
            // Close the modal
            bootstrap.Modal.getInstance(document.getElementById('deleteModal'))?.hide();
            if (response.success) {
                showToast(`Vehicle ${regNo} deleted successfully.`, 'success');
                // Remove row from table with animation
                $(`.delete-vehicle[data-regno="${regNo}"]`).closest('tr')
                    .fadeOut(500, function () { $(this).remove(); });
                // Also update vehicles page if on delete page
                if ($('#deleteResultSection').length) {
                    $('#deleteResultSection').hide().slideDown(400);
                    $('#deletedRegNoDisplay').text(regNo);
                }
            }
        },
        error: function (xhr) {
            setButtonLoading(btn, false, originalText);
            bootstrap.Modal.getInstance(document.getElementById('deleteModal'))?.hide();
            const msg = xhr.responseJSON?.message || 'Deletion failed.';
            showToast(msg, 'error');
        }
    });
}

// ─────────────────────────────────────────────────────────────
// [jQuery #1] AJAX — LOAD DASHBOARD STATS (GET)
// ─────────────────────────────────────────────────────────────
function loadDashboardStats() {
    $.ajax({
        url:  `${API_BASE}/stats`,
        type: 'GET',
        success: function (response) {
            if (!response.success) return;
            const s = response.data;

            // [jQuery #2] DOM Manipulation — update stat cards
            animateCounter('#statTotal',    s.totalVehicles);
            animateCounter('#statPetrol',   s.petrolVehicles);
            animateCounter('#statDiesel',   s.dieselVehicles);
            animateCounter('#statKerosene', s.keroseneVehicles);
            animateCounter('#statQuota',    s.totalWeeklyQuota, 'L');
            animateCounter('#statActive',   s.activeVehicles);
        },
        error: function () {
            // Silent fail on dashboard stats — not critical
        }
    });
}

// Animated number counter effect
function animateCounter(selector, target, suffix = '') {
    let current = 0;
    const step  = Math.ceil(target / 40);
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        // [jQuery #2] DOM Manipulation — update counter display
        $(selector).text(current + suffix);
    }, 30);
}


// ─────────────────────────────────────────────────────────────
// DELETE PAGE — STANDALONE FORM
// ─────────────────────────────────────────────────────────────
function lookupAndDelete(e) {
    e.preventDefault();
    const regNo = $('#deleteRegNo').val().trim().toUpperCase();
    if (!regNo) { showToast('Please enter a Registration Number.', 'warning'); return; }

    // First fetch vehicle to show confirmation details
    $.ajax({
        url:  `${API_BASE}/regno/${encodeURIComponent(regNo)}`,
        type: 'GET',
        success: function (response) {
            if (!response.success) { showToast('Vehicle not found.', 'error'); return; }
            const v = response.data;
            // [jQuery #2] DOM Manipulation — populate confirmation modal
            $('#deleteConfirmRegNo').text(v.RegNo);
            $('#deleteConfirmName').text(`${v.FirstName} ${v.LastName}`);
            $('#deleteConfirmModel').text(v.VehicleModel);
            $('#confirmDeleteBtn').data('regno', v.RegNo);
            const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
            modal.show();
        },
        error: function (xhr) {
            showToast(xhr.responseJSON?.message || 'Vehicle not found.', 'error');
        }
    });
}

// ─────────────────────────────────────────────────────────────
// [jQuery #3] EVENT HANDLERS — Document Ready
// Bind all events when the page DOM is fully loaded
// ─────────────────────────────────────────────────────────────
$(document).ready(function () {

    // ── Inject Common Navbar ──────────────────────────────────
    if ($('#navbar-container').length) {
        $('#navbar-container').html(navbarHtml);
    }

    // ── Navbar active link highlighting ──────────────────────
    // [jQuery #2] DOM Manipulation — set active nav link
    const page = window.location.pathname.split('/').pop() || 'index.html';
    $('.nav-link').removeClass('active');
    $(`.nav-link[href="${page}"]`).addClass('active');

    // ── Registration Page ─────────────────────────────────────
    if ($('#registerForm').length) {
        // [jQuery #3] Event Handling — form submit
        $('#registerForm').on('submit', registerVehicle);

        // Real-time field validation on input
        // [jQuery #5] Form Validation — live validation on keyup
        $('#regNo').on('input', function () {
            $(this).val($(this).val().toUpperCase());
            validateField(this, /^[A-Z]{2,3}-\d{4}$/, 'Format: ABC-1234');
        });
        $('#email').on('blur', function () {
            validateField(this, /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email');
        });
        $('#ownerNIC').on('input', function () {
            validateField(this, /^[0-9]{9}[vVxX]$|^[0-9]{12}$/, 'Format: 123456789V');
        });
        // [jQuery #10] Button click handler — reset form
        $('#resetFormBtn').on('click', function () {
            $('#registerForm')[0].reset();
            $('#registerForm .is-valid, #registerForm .is-invalid')
                .removeClass('is-valid is-invalid');
            // [jQuery #4] Animation — bounce effect on reset
            $(this).addClass('btn-bounce');
            setTimeout(() => $(this).removeClass('btn-bounce'), 600);
        });
    }

    if ($('#vehiclesTableContainer').length) {
        loadAllVehicles();
    }

    // ── Search Page ───────────────────────────────────────────
    if ($('#searchForm').length) {
        // [jQuery #3] Event Handling — search form submit
        $('#searchForm').on('submit', searchVehicle);

        // [jQuery #7] Show/Hide — change search placeholder based on type
        $('#searchBy').on('change', function () {
            const placeholders = {
                regno:     'e.g. ABC-1234',
                firstname: 'e.g. Kamal',
                lastname:  'e.g. Perera',
                email:     'e.g. kamal@gmail.com',
                nic:       'e.g. 123456789V',
                fueltype:  'Petrol / Diesel / Kerosene',
                station:   'e.g. Colombo City Fuel'
            };
            $('#searchValue').attr('placeholder', placeholders[$(this).val()] || 'Enter search value');
            // [jQuery #4] Animation — shake the input to draw attention
            $('#searchValue').focus().addClass('input-highlight');
            setTimeout(() => $('#searchValue').removeClass('input-highlight'), 600);
        });
    }

    // ── Update Page ───────────────────────────────────────────
    if ($('#updateFormSection').length) {
        loadVehicleForUpdate();
        // [jQuery #3] Event Handling — fetch vehicle button
        $('#fetchVehicleBtn').on('click', function () {
            const regNo = $('#fetchRegNo').val().trim();
            fetchVehicleForEdit(regNo);
        });
        // [jQuery #3] Event Handling — update form submit
        $('#updateForm').on('submit', updateVehicle);
    }

    // ── Delete Page ───────────────────────────────────────────
    if ($('#deleteForm').length) {
        // [jQuery #3] Event Handling — delete lookup form
        $('#deleteForm').on('submit', lookupAndDelete);
    }

    // ── Confirm Delete Modal Button ───────────────────────────
    // [jQuery #10] Button click handler — confirm delete action
    $('#confirmDeleteBtn').on('click', function () {
        const regNo = $(this).data('regno');
        deleteVehicle(regNo);
    });

    // ── Home / Dashboard Page ─────────────────────────────────
    if ($('#statTotal').length) {
        loadDashboardStats();
    }

    // ── QR Modal Download ─────────────────────────────────────
    $('#downloadQRBtn').on('click', function () {
        const src    = $('#qrModalImage').attr('src');
        const regNo  = $('#qrModalRegNo').text();
        if (!src) return;
        const link   = document.createElement('a');
        link.href    = src;
        link.download = `QR-${regNo}.png`;
        link.click();
    });

    // ── Smooth scroll for anchor links ───────────────────────
    $('a[href^="#"]').on('click', function (e) {
        e.preventDefault();
        const target = $($(this).attr('href'));
        if (target.length) {
            // [jQuery #4] Animation — smooth scroll
            $('html, body').animate({ scrollTop: target.offset().top - 80 }, 600);
        }
    });
});
