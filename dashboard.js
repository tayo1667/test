// Dashboard Functionality

// Check authentication
function checkAuth() {
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }
}

// Update greeting based on time of day
function updateGreeting() {
    const userName = localStorage.getItem('userFirstName') || 'User';
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    
    if (hour < 12) {
        greeting = 'Good morning';
    } else if (hour < 18) {
        greeting = 'Good afternoon';
    }
    
    const greetingElement = document.getElementById('greeting');
    if (greetingElement) {
        greetingElement.textContent = `${greeting}, ${userName}!`;
    }
}

// Update user profile
function updateUserProfile() {
    const userName = localStorage.getItem('userName') || 'User';
    const userEmail = localStorage.getItem('userEmail') || '';
    
    const userNameElement = document.getElementById('user-name');
    const userEmailElements = document.querySelectorAll('.user-email');
    const userAvatar = document.getElementById('user-avatar');
    
    if (userNameElement) {
        userNameElement.textContent = userName;
    }
    
    // Update all email elements
    userEmailElements.forEach(element => {
        if (userEmail) {
            element.textContent = userEmail;
        } else {
            element.textContent = 'No email provided';
        }
    });
    
    if (userAvatar) {
        const encodedName = encodeURIComponent(userName);
        userAvatar.src = `https://ui-avatars.com/api/?name=${encodedName}&background=667eea&color=fff&bold=true&size=40`;
        userAvatar.alt = userName;
    }
}

// Logout functionality
function logout() {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userFirstName');
    localStorage.removeItem('userEmail');
    window.location.href = 'login.html';
}

// Mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const sidebar = document.querySelector('.sidebar');

if (mobileMenuToggle && sidebar) {
    mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });
    
    // Close sidebar when clicking a nav item on mobile
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 968) {
                sidebar.classList.remove('active');
            }
        });
    });
}

// Logout button
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    updateGreeting();
    updateUserProfile();
});

console.log('Dashboard loaded');
