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
  sessionStorage.setItem('stopIntroAudio', 'true');
  window.location.href = '../../game.html';
});

// Handle levels button - Navigate back to index with difficulty page
document.getElementById('levelsButton')?.addEventListener('click', () => {
  // Clear the stop flag so intro music plays
  sessionStorage.removeItem('stopIntroAudio');
  // Navigate to index.html which will load difficulty.html
  window.location.href = '../../index.html?page=difficulty';
});

// Handle back to home button - Navigate to index
document.getElementById('gameOverBackHome')?.addEventListener('click', () => {
  // Clear the stop flag so intro music plays
  sessionStorage.removeItem('stopIntroAudio');
  // Navigate to index.html which will load homepage
  window.location.href = '../../index.html';
});
