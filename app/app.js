// Web App Authentication with Email OTP

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

// Store OTP and user data temporarily
let tempUserData = {};
let generatedOTP = '';

// Login Form Handler
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        
        // Generate 6-digit OTP
        generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store email temporarily
        tempUserData.email = email;
        
        // Add loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending OTP...';
        submitBtn.disabled = true;
        
        // Simulate sending OTP email
        setTimeout(() => {
            // In production, send OTP via email service (SendGrid, AWS SES, etc.)
            console.log(`OTP sent to ${email}: ${generatedOTP}`);
            alert(`OTP Code: ${generatedOTP}\n\n(In production, this will be sent to your email)`);
            
            // Show OTP form
            loginForm.style.display = 'none';
            document.getElementById('otp-form').style.display = 'flex';
            document.getElementById('sent-email').textContent = email;
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1500);
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
        
        // Generate 6-digit OTP
        generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        
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
        
        // Simulate sending OTP email
        setTimeout(() => {
            // In production, send OTP via email service
            console.log(`OTP sent to ${email}: ${generatedOTP}`);
            alert(`OTP Code: ${generatedOTP}\n\n(In production, this will be sent to your email)`);
            
            // Show OTP form
            signupForm.style.display = 'none';
            document.getElementById('otp-form').style.display = 'flex';
            document.getElementById('sent-email').textContent = email;
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1500);
    });
}

// OTP Verification Form Handler
const otpForm = document.getElementById('otp-form');
if (otpForm) {
    otpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const enteredOTP = document.getElementById('otp').value;
        
        // Add loading state
        const submitBtn = otpForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Verifying...';
        submitBtn.disabled = true;
        
        // Verify OTP
        setTimeout(() => {
            if (enteredOTP === generatedOTP) {
                // OTP is correct
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userEmail', tempUserData.email);
                
                if (tempUserData.fullName) {
                    // Signup flow
                    localStorage.setItem('userName', tempUserData.fullName);
                    localStorage.setItem('userFirstName', tempUserData.firstname);
                } else {
                    // Login flow - check if user exists
                    const existingName = localStorage.getItem('userName');
                    if (!existingName) {
                        localStorage.setItem('userName', 'User');
                        localStorage.setItem('userFirstName', 'User');
                    }
                }
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                // OTP is incorrect
                alert('Invalid OTP code. Please try again.');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                document.getElementById('otp').value = '';
                document.getElementById('otp').focus();
            }
        }, 1000);
    });
}

// Resend OTP Handler
const resendBtn = document.getElementById('resend-otp');
if (resendBtn) {
    resendBtn.addEventListener('click', () => {
        // Generate new OTP
        generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Disable button temporarily
        resendBtn.disabled = true;
        resendBtn.textContent = 'Sending...';
        
        setTimeout(() => {
            console.log(`New OTP sent to ${tempUserData.email}: ${generatedOTP}`);
            alert(`New OTP Code: ${generatedOTP}\n\n(In production, this will be sent to your email)`);
            
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend OTP';
        }, 1500);
    });
}

console.log('Sentriom Web App loaded');
