# ADR 0007 – Generate Project Documentation with JSDoc

## Status

Accepted — December 06, 2025

## Context

As the codebase has grown, new contributors (and even existing team members) frequently ask:

- “What does this function do?”
- “What parameters does this system expect?”
- “Where is the single source of truth for X?”

We were relying on inline comments and tribal knowledge, which became a bottleneck during onboarding and refactoring (e.g., skins system, audio manager, game loop).  
No automated, browsable documentation existed.

## Decision

Adopt **JSDoc** as the official documentation generator with the following conventions and tooling:

1. **All public modules, functions, classes, and important private helpers must carry JSDoc comments**
   ```js
   /**
    * Returns the currently equipped skin name.
    * @returns {"default"|"squarePack"|string} The active skin identifier
    */
   export function getActiveSkin() { … }
   ```
