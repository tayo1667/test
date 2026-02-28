// Deposit Page Functionality

// Store live crypto prices
let cryptoPrices = {
    'BTC': 63337,
    'ETH': 1833,
    'USDT': 1,
    'BNB': 592,
    'SOL': 77
};

// Fetch live crypto rates from CoinGecko API
async function fetchCryptoRates() {
    try {
        console.log('📊 Fetching live crypto rates...');
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,binancecoin,solana&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();
        
        console.log('✅ Crypto rates fetched:', data);
        
        // Update prices
        if (data.bitcoin) {
            cryptoPrices['BTC'] = data.bitcoin.usd;
            updateCryptoCard('BTC', 'Bitcoin', data.bitcoin.usd);
        }
        if (data.ethereum) {
            cryptoPrices['ETH'] = data.ethereum.usd;
            updateCryptoCard('ETH', 'Ethereum', data.ethereum.usd);
        }
        if (data.tether) {
            cryptoPrices['USDT'] = data.tether.usd;
            updateCryptoCard('USDT', 'Tether', data.tether.usd);
        }
        if (data.binancecoin) {
            cryptoPrices['BNB'] = data.binancecoin.usd;
            updateCryptoCard('BNB', 'BNB', data.binancecoin.usd);
        }
        if (data.solana) {
            cryptoPrices['SOL'] = data.solana.usd;
            updateCryptoCard('SOL', 'Solana', data.solana.usd);
        }
    } catch (error) {
        console.error('❌ Error fetching crypto rates:', error);
    }
}

// Update crypto card with live price
function updateCryptoCard(symbol, name, price) {
    const card = document.querySelector(`.crypto-card[data-crypto="${symbol}"]`);
    if (!card) return;
    
    // Update data-price attribute
    card.setAttribute('data-price', price);
    
    // Update price display
    const priceElement = card.querySelector('.crypto-price');
    if (priceElement) {
        priceElement.textContent = `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    console.log(`✅ Updated ${symbol} price: $${price}`);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('💰 Deposit page loaded');
    
    // Fetch rates immediately
    fetchCryptoRates();
    
    // Update rates every 30 seconds
    setInterval(fetchCryptoRates, 30000);
    
    // Setup crypto card clicks
    setupCryptoCards();
});

// Setup crypto card click handlers
function setupCryptoCards() {
    const cryptoCards = document.querySelectorAll('.crypto-card');
    
    cryptoCards.forEach(card => {
        card.addEventListener('click', () => {
            const crypto = card.getAttribute('data-crypto');
            const cryptoName = card.getAttribute('data-name');
            const cryptoPrice = parseFloat(card.getAttribute('data-price'));
            
            openDepositModal(crypto, cryptoName, cryptoPrice);
        });
        
        // Add hover effect
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
            card.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = 'none';
        });
    });
}

// Open deposit modal
function openDepositModal(crypto, cryptoName, cryptoPrice) {
    const modal = document.getElementById('deposit-modal');
    if (!modal) return;
    
    // Update modal content
    document.getElementById('modal-crypto-name').textContent = cryptoName;
    document.getElementById('modal-crypto-symbol').textContent = crypto;
    document.getElementById('min-crypto').textContent = crypto;
    
    // Store current crypto data
    modal.setAttribute('data-crypto', crypto);
    modal.setAttribute('data-crypto-name', cryptoName);
    modal.setAttribute('data-crypto-price', cryptoPrice);
    
    // Show modal
    modal.style.display = 'flex';
    
    // Setup form handlers
    setupDepositForm();
}

// Close deposit modal
function closeDepositModal() {
    const modal = document.getElementById('deposit-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Setup deposit form
function setupDepositForm() {
    const form = document.getElementById('deposit-amount-form');
    const amountInput = document.getElementById('crypto-amount');
    const planSelect = document.getElementById('savings-plan');
    
    if (!form || !amountInput || !planSelect) return;
    
    // Update summary on input change
    amountInput.addEventListener('input', updateDepositSummary);
    planSelect.addEventListener('change', updateDepositSummary);
    
    // Handle form submission
    form.onsubmit = handleDepositSubmit;
}

// Update deposit summary
function updateDepositSummary() {
    const modal = document.getElementById('deposit-modal');
    const cryptoPrice = parseFloat(modal.getAttribute('data-crypto-price'));
    const amount = parseFloat(document.getElementById('crypto-amount').value) || 0;
    const plan = parseInt(document.getElementById('savings-plan').value);
    
    // Calculate USD value
    const usdValue = amount * cryptoPrice;
    
    // Calculate APY based on plan
    const apyRates = { 3: 0.024, 6: 0.036, 12: 0.048 };
    const apy = apyRates[plan] || 0.036;
    
    // Calculate returns (proportional to lock period)
    const returns = usdValue * apy * (plan / 12);
    
    // Calculate maturity date
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + plan);
    
    // Update display
    document.getElementById('usd-amount').textContent = `$${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('estimated-returns').textContent = `$${returns.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('maturity-date').textContent = maturityDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Handle deposit form submission
function handleDepositSubmit(e) {
    e.preventDefault();
    
    const modal = document.getElementById('deposit-modal');
    const crypto = modal.getAttribute('data-crypto');
    const cryptoName = modal.getAttribute('data-crypto-name');
    const amount = parseFloat(document.getElementById('crypto-amount').value);
    const plan = parseInt(document.getElementById('savings-plan').value);
    
    console.log('💰 Deposit submission:', { crypto, cryptoName, amount, plan });
    
    // TODO: Integrate with Korapay payment
    alert(`Deposit ${amount} ${crypto} for ${plan} months\n\nPayment integration coming soon!`);
    
    closeDepositModal();
}

// Close modal when clicking overlay
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        closeDepositModal();
    }
});

console.log('💰 Deposit page script loaded');
