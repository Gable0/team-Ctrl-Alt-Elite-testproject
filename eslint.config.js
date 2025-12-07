export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "playwright-report/**",
      ".git/**",
    ],
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        console: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        fetch: "readonly",
        Audio: "readonly",
        DOMParser: "readonly",
        requestAnimationFrame: "readonly",
        performance: "readonly",
        Image: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        URL: "readonly",
        location: "readonly",
        // Add any other globals your code uses
      },
    },
    rules: {
      // Add any rules you want to enforce
      "no-unused-vars": "warn",
      "no-undef": "error",
    },
  },
];
