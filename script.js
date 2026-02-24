// Sentriom - Homepage JavaScript

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            navActions.classList.toggle('active');
        });
    }
    
    // Initialize crypto rates
    fetchCryptoRates();
    
    // Update rates every 30 seconds
    setInterval(fetchCryptoRates, 30000);
    
    // Make rate items clickable
    setupRateItemClicks();
});

// Fetch live crypto rates from CoinGecko API
async function fetchCryptoRates() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,binancecoin,solana&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();
        
        updateRateItem('bitcoin', data.bitcoin);
        updateRateItem('ethereum', data.ethereum);
        updateRateItem('tether', data.tether);
        updateRateItem('binancecoin', data.binancecoin);
        updateRateItem('solana', data.solana);
    } catch (error) {
        console.error('Error fetching crypto rates:', error);
    }
}

// Update individual rate item
function updateRateItem(cryptoId, data) {
    const cryptoMap = {
        'bitcoin': { selector: '.btc', name: 'Bitcoin', symbol: 'BTC' },
        'ethereum': { selector: '.eth', name: 'Ethereum', symbol: 'ETH' },
        'tether': { selector: '.usdt', name: 'Tether', symbol: 'USDT' },
        'binancecoin': { selector: '.bnb', name: 'BNB', symbol: 'BNB' },
        'solana': { selector: '.sol', name: 'Solana', symbol: 'SOL' }
    };
    
    const crypto = cryptoMap[cryptoId];
    if (!crypto) return;
    
    const rateIcon = document.querySelector(`.rate-icon${crypto.selector}`);
    if (!rateIcon) return;
    
    const rateItem = rateIcon.closest('.rate-item');
    if (!rateItem) return;
    
    // Remove loading class
    rateItem.classList.remove('loading');
    
    // Update price
    const priceValue = rateItem.querySelector('.price-value');
    if (priceValue && data.usd) {
        priceValue.textContent = `$${data.usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    // Update 24h change
    const priceChange = rateItem.querySelector('.price-change');
    if (priceChange && data.usd_24h_change !== undefined) {
        const change = data.usd_24h_change;
        const changeText = change >= 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
        priceChange.textContent = changeText;
        priceChange.className = 'price-change ' + (change >= 0 ? 'positive' : 'negative');
    }
}

// Setup click handlers for rate items
function setupRateItemClicks() {
    const rateItems = document.querySelectorAll('.rate-item');
    rateItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function() {
            window.location.href = 'app/login.html';
        });
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    }
});
