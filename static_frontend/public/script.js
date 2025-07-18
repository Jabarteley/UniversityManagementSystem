// University Records Management System - JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
});

function initializeApp() {
    // Initialize navigation
    initializeNavigation();
    
    // Initialize modals
    initializeModals();
    
    // Initialize forms
    initializeForms();
    
    // Initialize search
    initializeSearch();
    
    // Initialize charts
    initializeCharts();
    
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize responsive features
    initializeResponsive();
}

// Navigation Management
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, .nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            
            // Update active states
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                    section.classList.add('fade-in');
                }
            });
            
            // Update page title
            updatePageTitle(targetId);
        });
    });
}

function updatePageTitle(sectionId) {
    const titles = {
        'dashboard': 'Dashboard Overview',
        'students': 'Student Management',
        'staff': 'Staff Management',
        'documents': 'Document Management',
        'reports': 'Reports & Analytics'
    };
    
    const pageHeader = document.querySelector('.page-header h1');
    if (pageHeader && titles[sectionId]) {
        pageHeader.textContent = titles[sectionId];
    }
}

// Modal Management
function initializeModals() {
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const modalCloses = document.querySelectorAll('.modal-close');
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    modalCloses.forEach(close => {
        close.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
}

// Form Management
function initializeForms() {
    const forms = document.querySelectorAll('.form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            if (validateForm(this)) {
                // Simulate form submission
                showToast('Form submitted successfully!', 'success');
                
                // Close modal if form is in modal
                const modal = this.closest('.modal-overlay');
                if (modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
                
                // Reset form
                this.reset();
            }
        });
    });
    
    // Real-time validation
    const inputs = document.querySelectorAll('.form-input, .form-select');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.getAttribute('placeholder') || field.getAttribute('name');
    
    clearFieldError(field);
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, `${fieldName} is required`);
        return false;
    }
    
    if (field.type === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
    }
    
    return true;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    let errorElement = field.parentNode.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Search Functionality
function initializeSearch() {
    const searchInputs = document.querySelectorAll('input[type="text"][placeholder*="Search"]');
    
    searchInputs.forEach(input => {
        let searchTimeout;
        
        input.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim();
            
            if (query.length >= 2) {
                searchTimeout = setTimeout(() => {
                    performSearch(query, this);
                }, 300);
            } else {
                clearSearchResults(this);
            }
        });
    });
}

function performSearch(query, input) {
    // Simulate search API call
    console.log('Searching for:', query);
    
    // Add loading state
    input.classList.add('loading');
    
    setTimeout(() => {
        input.classList.remove('loading');
        // Here you would typically update the results
        showToast(`Search completed for "${query}"`, 'success');
    }, 500);
}

function clearSearchResults(input) {
    // Clear any search results
    console.log('Clearing search results');
}

// Chart Initialization
function initializeCharts() {
    // Simulate chart initialization
    const chartContainers = document.querySelectorAll('.chart-container canvas');
    
    chartContainers.forEach(canvas => {
        // Here you would initialize actual charts (Chart.js, D3, etc.)
        const ctx = canvas.getContext('2d');
        
        // Simple placeholder chart
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);
        
        ctx.fillStyle = 'white';
        ctx.font = '16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Chart Placeholder', canvas.width / 2, canvas.height / 2);
    });
}

// Tooltip Management
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[title]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function(e) {
            showTooltip(e, this.getAttribute('title'));
        });
        
        element.addEventListener('mouseleave', function() {
            hideTooltip();
        });
    });
}

function showTooltip(event, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
        position: absolute;
        background: #1e293b;
        color: white;
        padding: 0.5rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        z-index: 9999;
        pointer-events: none;
        white-space: nowrap;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = tooltip.getBoundingClientRect();
    tooltip.style.left = (event.pageX - rect.width / 2) + 'px';
    tooltip.style.top = (event.pageY - rect.height - 10) + 'px';
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Toast Notifications
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('i');
    const text = toast.querySelector('span');
    
    // Update content
    text.textContent = message;
    
    // Update type
    toast.className = `toast ${type}`;
    
    // Update icon
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
    } else if (type === 'warning') {
        icon.className = 'fas fa-exclamation-triangle';
    } else if (type === 'info') {
        icon.className = 'fas fa-info-circle';
    }
    
    // Show toast
    toast.classList.add('active');
    
    // Auto hide after 4 seconds
    setTimeout(() => {
        toast.classList.remove('active');
    }, 4000);
}

// Toast close functionality
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('toast-close')) {
        const toast = e.target.closest('.toast');
        if (toast) {
            toast.classList.remove('active');
        }
    }
});

// Responsive Features
function initializeResponsive() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    // Mobile menu toggle
    const menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    menuToggle.style.cssText = `
        display: none;
        background: none;
        border: none;
        font-size: 1.25rem;
        color: var(--gray-600);
        cursor: pointer;
        padding: 0.5rem;
        border-radius: var(--border-radius);
    `;
    
    const headerLeft = document.querySelector('.header-left');
    if (headerLeft) {
        headerLeft.insertBefore(menuToggle, headerLeft.firstChild);
    }
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 1024) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 1024) {
            sidebar.classList.remove('open');
            menuToggle.style.display = 'none';
        } else {
            menuToggle.style.display = 'block';
        }
    });
    
    // Initial check
    if (window.innerWidth <= 1024) {
        menuToggle.style.display = 'block';
    }
}

// Table Management
function initializeTableFeatures() {
    // Select all checkboxes
    const selectAllCheckboxes = document.querySelectorAll('thead input[type="checkbox"]');
    
    selectAllCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const table = this.closest('table');
            const rowCheckboxes = table.querySelectorAll('tbody input[type="checkbox"]');
            
            rowCheckboxes.forEach(rowCheckbox => {
                rowCheckbox.checked = this.checked;
            });
            
            updateBulkActions(table);
        });
    });
    
    // Individual row checkboxes
    const rowCheckboxes = document.querySelectorAll('tbody input[type="checkbox"]');
    
    rowCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const table = this.closest('table');
            updateBulkActions(table);
            updateSelectAllState(table);
        });
    });
}

function updateBulkActions(table) {
    const checkedBoxes = table.querySelectorAll('tbody input[type="checkbox"]:checked');
    const bulkActions = document.querySelector('.bulk-actions');
    
    if (checkedBoxes.length > 0) {
        if (bulkActions) {
            bulkActions.style.display = 'flex';
            bulkActions.querySelector('.selected-count').textContent = `${checkedBoxes.length} selected`;
        }
    } else {
        if (bulkActions) {
            bulkActions.style.display = 'none';
        }
    }
}

function updateSelectAllState(table) {
    const selectAllCheckbox = table.querySelector('thead input[type="checkbox"]');
    const rowCheckboxes = table.querySelectorAll('tbody input[type="checkbox"]');
    const checkedBoxes = table.querySelectorAll('tbody input[type="checkbox"]:checked');
    
    if (checkedBoxes.length === 0) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = false;
    } else if (checkedBoxes.length === rowCheckboxes.length) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = true;
    } else {
        selectAllCheckbox.indeterminate = true;
        selectAllCheckbox.checked = false;
    }
}

// File Upload Management
function initializeFileUpload() {
    const uploadZones = document.querySelectorAll('.upload-zone');
    
    uploadZones.forEach(zone => {
        // Drag and drop events
        zone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        });
        
        zone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
        });
        
        zone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            handleFileUpload(files);
        });
        
        // Click to upload
        zone.addEventListener('click', function() {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.multiple = true;
            fileInput.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
            
            fileInput.addEventListener('change', function() {
                handleFileUpload(this.files);
            });
            
            fileInput.click();
        });
    });
}

function handleFileUpload(files) {
    Array.from(files).forEach(file => {
        // Validate file
        if (validateFile(file)) {
            uploadFile(file);
        } else {
            showToast(`Invalid file: ${file.name}`, 'error');
        }
    });
}

function validateFile(file) {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!allowedTypes.includes(file.type)) {
        return false;
    }
    
    if (file.size > maxSize) {
        return false;
    }
    
    return true;
}

function uploadFile(file) {
    // Simulate file upload
    console.log('Uploading file:', file.name);
    
    // Create progress indicator
    const progressContainer = createProgressIndicator(file.name);
    document.body.appendChild(progressContainer);
    
    // Simulate upload progress
    let progress = 0;
    const progressBar = progressContainer.querySelector('.progress-bar');
    const progressText = progressContainer.querySelector('.progress-text');
    
    const interval = setInterval(() => {
        progress += Math.random() * 20;
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            setTimeout(() => {
                progressContainer.remove();
                showToast(`${file.name} uploaded successfully!`, 'success');
            }, 500);
        }
        
        progressBar.style.width = progress + '%';
        progressText.textContent = Math.round(progress) + '%';
    }, 200);
}

function createProgressIndicator(fileName) {
    const container = document.createElement('div');
    container.className = 'upload-progress';
    container.style.cssText = `
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        background: white;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-lg);
        padding: 1rem;
        min-width: 300px;
        z-index: 2000;
    `;
    
    container.innerHTML = `
        <div class="upload-info">
            <div class="file-name" style="font-weight: 500; margin-bottom: 0.5rem;">${fileName}</div>
            <div class="progress-container" style="background: var(--gray-200); height: 8px; border-radius: 4px; overflow: hidden;">
                <div class="progress-bar" style="background: var(--primary-color); height: 100%; width: 0%; transition: width 0.3s;"></div>
            </div>
            <div class="progress-text" style="font-size: 0.875rem; color: var(--gray-600); margin-top: 0.25rem;">0%</div>
        </div>
    `;
    
    return container;
}

// Data Management
function initializeDataManagement() {
    // Simulate loading data
    loadTableData();
    loadDashboardStats();
}

function loadTableData() {
    const tables = document.querySelectorAll('.data-table tbody');
    
    tables.forEach(tbody => {
        // Add loading state
        tbody.classList.add('loading');
        
        setTimeout(() => {
            tbody.classList.remove('loading');
            // Data would be populated here
        }, 1000);
    });
}

function loadDashboardStats() {
    const statCards = document.querySelectorAll('.stat-card');
    
    statCards.forEach(card => {
        const value = card.querySelector('h3');
        if (value) {
            // Animate counter
            animateCounter(value, parseInt(value.textContent.replace(/,/g, '')));
        }
    });
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, 20);
}

// Initialize all features when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTableFeatures();
    initializeFileUpload();
    initializeDataManagement();
});

// Export functions for external use
window.URMS = {
    showToast,
    initializeApp,
    validateForm,
    handleFileUpload
};