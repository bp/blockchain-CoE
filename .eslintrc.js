module.exports = {
  root: true, // Make sure eslint picks up the config at the root of the directory
  env: {
    browser: true, // Enables browser globals like window and document
    amd: true, // Enables require() and define() as global variables as per the amd spec.
    node: true, // Enables Node.js global variables and Node.js scoping.
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended', // Make this the last element so prettier config overrides other formatting rules
   // "plugin:cypress/recommended"
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true // Enable JSX since we're using React
    },
    ecmaVersion: 12,
    sourceType: 'module' // Allows using import/export statements
  },
  settings: {
    react: {
      version: '17.0.2'
    }
  },
  rules: {
    'prettier/prettier': ['error', {}, { usePrettierrc: true }], // Use our .prettierrc file as source
    'react/react-in-jsx-scope': 'off',
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['hrefLeft', 'hrefRight'],
        aspects: ['invalidHref', 'preferButton']
      }
    ],
  }
};
