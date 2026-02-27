// Web App Authentication with Email OTP

// API base: use HTTPS in production (mobile often fails on mixed content or HTTP).
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : (window.location.protocol === 'https:' ? window.location.origin : 'https://' + window.location.host);

const FETCH_TIMEOUT_MS = 25000;
async function apiFetch(url, options = {}, retries = 1) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return res;
    } catch (err) {
        clearTimeout(id);
        if (retries > 0 && (err.name === 'AbortError' || /failed|network/i.test(err.message))) {
            await new Promise(r => setTimeout(r, 2000));
            return apiFetch(url, options, 0);
        }
        throw err;
    }
}

// Auto-scroll to form on auth pages
if (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html')) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const authRight = document.querySelector('.auth-right');
            if (authRight) {
                authRight.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }, 300);
    });
}

// Store user data temporarily
let tempUserData = {};

// Login Form Handler
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        
        // Store email temporarily
        tempUserData.email = email;
        
        // Add loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending OTP...';
        submitBtn.disabled = true;
        
        try {
            const url = `${API_URL}/api/auth/login/send-otp`;
            const response = await apiFetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
            const text = await response.text();
            let data = {};
            try { data = text ? JSON.parse(text) : {}; } catch (_) { }
            if (response.ok) {
                showToast('✅ OTP sent to your email! Check your inbox.', 'success');
                loginForm.style.display = 'none';
                document.getElementById('otp-form').style.display = 'flex';
                document.getElementById('sent-email').textContent = email;
            } else {
                showToast('❌ ' + (data.error || data.reason || 'Failed to send OTP.'), 'error');
            }
        } catch (error) {
            console.error('Login error:', error, 'URL:', `${API_URL}/api/auth/login/send-otp`);
            showToast('❌ Connection failed. Try again or use Wi‑Fi.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Signup Form Handler
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const firstname = document.getElementById('firstname').value;
        const lastname = document.getElementById('lastname').value;
        const email = document.getElementById('email').value;
        
        // Store user data temporarily
        tempUserData = {
            firstname,
            lastname,
            email,
            fullName: `${firstname} ${lastname}`
        };
        
        // Add loading state
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending OTP...';
        submitBtn.disabled = true;
        
        try {
            const url = `${API_URL}/api/auth/signup/send-otp`;
            const response = await apiFetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, firstName: firstname, lastName: lastname }) });
            const text = await response.text();
            let data = {};
            try { data = text ? JSON.parse(text) : {}; } catch (_) { }
            if (response.ok) {
                showToast('✅ OTP sent to your email! Check your inbox.', 'success');
                signupForm.style.display = 'none';
                document.getElementById('otp-form').style.display = 'flex';
                document.getElementById('sent-email').textContent = email;
            } else {
                showToast('❌ ' + (data.error || data.reason || 'Failed to send OTP.'), 'error');
            }
        } catch (error) {
            console.error('Signup error:', error, 'URL:', `${API_URL}/api/auth/signup/send-otp`);
            showToast('❌ Connection failed. Try again or use Wi‑Fi.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// OTP Verification Form Handler
const otpForm = document.getElementById('otp-form');
if (otpForm) {
    otpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const enteredOTP = document.getElementById('otp').value;
        const isSignup = !!tempUserData.fullName;
        
        // Add loading state
        const submitBtn = otpForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Verifying...';
        submitBtn.disabled = true;
        
        try {
            const endpoint = isSignup ? '/api/auth/signup/verify-otp' : '/api/auth/login/verify-otp';
            const url = `${API_URL}${endpoint}`;
            const response = await apiFetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: tempUserData.email, otp: enteredOTP }) });
            const text = await response.text();
            let data = {};
            try { data = text ? JSON.parse(text) : {}; } catch (_) { }
            if (response.ok) {
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userEmail', data.user.email);
                localStorage.setItem('userName', data.user.fullName);
                localStorage.setItem('userFirstName', data.user.firstName);
                localStorage.setItem('authToken', data.token);
                showToast('✅ Success! Redirecting to dashboard...', 'success');
                setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
            } else {
                showToast('❌ ' + (data.error || data.reason || 'Invalid OTP.'), 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                document.getElementById('otp').value = '';
                document.getElementById('otp').focus();
            }
        } catch (error) {
            console.error('Verification error:', error, 'URL:', `${API_URL}${isSignup ? '/api/auth/signup/verify-otp' : '/api/auth/login/verify-otp'}`);
            showToast('❌ Connection failed. Try again or use Wi‑Fi.', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Resend OTP Handler
const resendBtn = document.getElementById('resend-otp');
if (resendBtn) {
    resendBtn.addEventListener('click', async () => {
        const isSignup = !!tempUserData.fullName;
        
        // Disable button temporarily
        resendBtn.disabled = true;
        resendBtn.textContent = 'Sending...';
        
        try {
            const endpoint = isSignup ? '/api/auth/signup/send-otp' : '/api/auth/login/send-otp';
            const body = isSignup ? { email: tempUserData.email, firstName: tempUserData.firstname, lastName: tempUserData.lastname } : { email: tempUserData.email };
            const url = `${API_URL}${endpoint}`;
            const response = await apiFetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const text = await response.text();
            let data = {};
            try { data = text ? JSON.parse(text) : {}; } catch (_) { }
            if (response.ok) {
                showToast('✅ New OTP sent to your email!', 'success');
            } else {
                showToast('❌ ' + (data.error || data.reason || 'Failed to resend OTP.'), 'error');
            }
        } catch (error) {
            console.error('Resend error:', error, 'URL:', `${API_URL}${isSignup ? '/api/auth/signup/send-otp' : '/api/auth/login/send-otp'}`);
            showToast('❌ Connection failed. Try again or use Wi‑Fi.', 'error');
        } finally {
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend OTP';
        }
    });
}

console.log('Sentriom Web App loaded');
