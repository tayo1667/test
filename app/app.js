// Web App Authentication with Email OTP

// Use same origin on production so /api/* is proxied (e.g. Netlify → Railway). Use localhost only in dev.
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : '';  // same origin: sentriom.com/api/... or www.sentriom.com/api/...

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
            // Call backend API to send OTP
            const response = await fetch(`${API_URL}/api/auth/login/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Show success message
                showToast('✅ OTP sent to your email! Check your inbox.', 'success');
                
                // Show OTP form
                loginForm.style.display = 'none';
                document.getElementById('otp-form').style.display = 'flex';
                document.getElementById('sent-email').textContent = email;
            } else {
                // Show error
                showToast('❌ ' + (data.error || 'Failed to send OTP. Please try again.'), 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showToast('❌ Network error. Please check your connection.', 'error');
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
            // Call backend API to send OTP
            const response = await fetch(`${API_URL}/api/auth/signup/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    firstName: firstname,
                    lastName: lastname
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Show success message
                showToast('✅ OTP sent to your email! Check your inbox.', 'success');
                
                // Show OTP form
                signupForm.style.display = 'none';
                document.getElementById('otp-form').style.display = 'flex';
                document.getElementById('sent-email').textContent = email;
            } else {
                // Show error
                showToast('❌ ' + (data.error || 'Failed to send OTP. Please try again.'), 'error');
            }
        } catch (error) {
            console.error('Signup error:', error);
            showToast('❌ Network error. Please check your connection.', 'error');
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
            // Call backend API to verify OTP
            const endpoint = isSignup ? '/api/auth/signup/verify-otp' : '/api/auth/login/verify-otp';
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: tempUserData.email,
                    otp: enteredOTP
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // OTP is correct - save user data
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userEmail', data.user.email);
                localStorage.setItem('userName', data.user.fullName);
                localStorage.setItem('userFirstName', data.user.firstName);
                localStorage.setItem('authToken', data.token);
                
                showToast('✅ Success! Redirecting to dashboard...', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                // OTP is incorrect
                showToast('❌ ' + (data.error || 'Invalid OTP code. Please try again.'), 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                document.getElementById('otp').value = '';
                document.getElementById('otp').focus();
            }
        } catch (error) {
            console.error('Verification error:', error);
            showToast('❌ Network error. Please check your connection.', 'error');
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
            // Call backend API to resend OTP
            const endpoint = isSignup ? '/api/auth/signup/send-otp' : '/api/auth/login/send-otp';
            const body = isSignup 
                ? { email: tempUserData.email, firstName: tempUserData.firstname, lastName: tempUserData.lastname }
                : { email: tempUserData.email };
            
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showToast('✅ New OTP sent to your email!', 'success');
            } else {
                showToast('❌ ' + (data.error || 'Failed to resend OTP. Please try again.'), 'error');
            }
        } catch (error) {
            console.error('Resend error:', error);
            showToast('❌ Network error. Please check your connection.', 'error');
        } finally {
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend OTP';
        }
    });
}

console.log('Sentriom Web App loaded');
