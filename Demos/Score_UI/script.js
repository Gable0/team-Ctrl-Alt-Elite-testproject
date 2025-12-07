// Display the final score when page loads
window.addEventListener('DOMContentLoaded', () => {
  const finalScore = localStorage.getItem('finalScore') || '0';
  const finalLevel = localStorage.getItem('finalLevel') || '1';
  const shouldPlayGameOverSound = localStorage.getItem('playGameOverSound') === 'true';

  const finalScoreValue = document.getElementById('finalScoreValue');
  if (finalScoreValue) {
    finalScoreValue.textContent = String(finalScore).padStart(6, '0');
  }

  // Optional: Display level reached somewhere on the screen
  console.log('Level reached:', finalLevel);

  // Load and play game over background music, then game over sound
  if (shouldPlayGameOverSound) {
    // Create audio elements directly on this page
    const gameOverBg = new Audio('../../assets/sounds/reg game sounds/game-over-background.wav');
    gameOverBg.loop = false;
    gameOverBg.volume = 0.3;
    
    console.log('🎵 Starting game-over-background on score screen');
    
    gameOverBg.play()
      .then(() => {
        console.log('✅ Game over background playing');
        
        // When background finishes, play game over sound
        gameOverBg.addEventListener('ended', () => {
          console.log('🎵 Game over background finished, playing game-over sound');
          
          const gameOverSound = new Audio('../../assets/sounds/reg game sounds/game-over.wav');
          gameOverSound.volume = 0.5;
          gameOverSound.play()
            .then(() => console.log('✅ Game over sound playing'))
            .catch(err => console.error('❌ Failed to play game over sound:', err));
          
          // Clear the flag
          localStorage.removeItem('playGameOverSound');
        }, { once: true });
      })
      .catch(err => {
        console.error('❌ Failed to play game over background:', err);
        localStorage.removeItem('playGameOverSound');
      });
  }
});

// Handle restart button
document.getElementById('restartLevelButton')?.addEventListener('click', () => {
  localStorage.removeItem('finalScore');
  localStorage.removeItem('finalLevel');
  localStorage.removeItem('playGameOverSound');
  window.location.href = '../../game.html';
});

// Handle levels button
document.getElementById('levelsButton')?.addEventListener('click', () => {
  localStorage.removeItem('playGameOverSound');
  // Navigate to levels page if you have one
  window.location.href = '../../difficulty.html';
});
