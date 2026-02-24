// Deposit Page Functionality

// Korapay payment links for each cryptocurrency
const korapayLinks = {
    'BTC': 'https://korapay.com/pay/bitcoin-deposit',
    'ETH': 'https://korapay.com/pay/ethereum-deposit',
    'USDT': 'https://korapay.com/pay/tether-deposit',
    'BNB': 'https://korapay.com/pay/bnb-deposit',
    'SOL': 'https://korapay.com/pay/solana-deposit'
};

// Handle crypto card clicks
const cryptoCards = document.querySelectorAll('.crypto-card');

cryptoCards.forEach(card => {
    card.addEventListener('click', () => {
        const crypto = card.getAttribute('data-crypto');
        const cryptoName = card.getAttribute('data-name');
        
        // Add loading state
        card.style.opacity = '0.6';
        card.style.pointerEvents = 'none';
        
        // Show confirmation
        const confirmed = confirm(`You are about to deposit ${cryptoName} (${crypto}). You will be redirected to Korapay to complete your payment.`);
        
        if (confirmed) {
            // Redirect to Korapay payment link
            const paymentLink = korapayLinks[crypto];
            window.location.href = paymentLink;
        } else {
            // Reset card state
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
        }
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

console.log('Deposit page loaded');
