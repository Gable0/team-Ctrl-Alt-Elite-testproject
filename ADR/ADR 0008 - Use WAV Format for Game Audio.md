# ADR 0008 – Use WAV Format for Game Audio

## Status

Accepted — December 7, 2025

## Context

The game requires background music and sound effects for player actions, enemy attacks, power-ups, and UI feedback. We needed to choose an audio format that balances:

- **Latency**: Instant playback response for game events
- **Quality**: Clear, crisp retro-style audio
- **Browser support**: Works across all modern browsers
- **Performance**: Low CPU overhead during gameplay
- **Development workflow**: Easy to edit and preview

Common options considered:
- **MP3**: Compressed, smaller file size, but has decoding latency
- **OGG Vorbis**: Good compression, but inconsistent browser support
- **WAV**: Uncompressed, larger files, but zero latency
- **Web Audio API**: Requires additional coding complexity

## Decision

Use **uncompressed WAV files** for all game audio.

### Key Reasons:

1. **Zero Latency**  
   WAV files play instantly with no decoding delay. Critical for:
   - Laser shot sound effects (must sync with visual)
   - Collision/explosion sounds (immediate feedback)
   - Power-up pickup sounds (responsive feel)

2. **Predictable Performance**  
   No CPU cycles spent on decompression during gameplay. Maintains consistent 60 FPS even with multiple simultaneous sounds.

3. **Universal Browser Support**  
   All modern browsers (Chrome, Firefox, Safari, Edge) natively support WAV with `<audio>` element. No polyfills or fallbacks needed.

4. **Retro Aesthetic Match**  
   Uncompressed audio preserves the authentic 8-bit/16-bit sound quality that matches our Galaga-inspired visual style. No compression artifacts.

5. **Simple Implementation**  
   Works directly with HTML5 `<audio>` elements and basic JavaScript `play()` calls. No need for complex Web Audio API graph setup.

### Trade-offs Accepted:

- **Larger file sizes**: WAV files are 5-10x larger than MP3
  - Mitigated by: Short sound clips (< 5 seconds each)
  - Total audio footprint: ~2-3 MB (acceptable for a game)
  
- **No streaming**: Entire file must load before playback
  - Mitigated by: `preload="auto"` on critical sounds
  - Short clips load in < 100ms on typical connections

## Implementation Notes

- Store all audio in `assets/sounds/` directory
- Use 16-bit, 44.1kHz sample rate (CD quality)
- Keep sound effects under 3 seconds to minimize file size
- Background music loops seamlessly with `.loop = true`

## Alternatives Considered

- **MP3**: Rejected due to 50-150ms decode latency breaking game feel
- **OGG Vorbis**: Rejected due to Safari requiring fallback implementation
- **Web Audio API**: Over-engineered for our simple needs; saved for future advanced features (spatial audio, dynamic mixing)

## Future Considerations

If bandwidth becomes a concern (mobile users), we could:
- Add MP3 as fallback for non-critical sounds
- Implement lazy loading for music tracks
- Use Web Audio API's `AudioContext` for advanced mixing

For now, WAV provides the best player experience with minimal complexity.

---

Author: Chloe Ogamba 
Repository: team-Ctrl-Alt-Elite-testproject