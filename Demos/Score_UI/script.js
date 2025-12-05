// Display the final score when page loads
window.addEventListener('DOMContentLoaded', () => {
    const finalScore = localStorage.getItem('finalScore') || '0';
    const finalLevel = localStorage.getItem('finalLevel') || '1';
    
    const finalScoreValue = document.getElementById('finalScoreValue');
    if (finalScoreValue) {
        finalScoreValue.textContent = String(finalScore).padStart(6, '0');
    }
    
    // Optional: Display level reached somewhere on the screen
    console.log('Level reached:', finalLevel);
});

// Handle restart button
document.getElementById('restartLevelButton')?.addEventListener('click', () => {
    localStorage.removeItem('finalScore');
    localStorage.removeItem('finalLevel');
    window.location.href = '../../game.html';
});

// Handle levels button
document.getElementById('levelsButton')?.addEventListener('click', () => {
    // Navigate to levels page if you have one
    window.location.href = '../../difficulty.html';
});