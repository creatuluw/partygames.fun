// ESLint configuration to enforce UI Design Guidelines
module.exports = {
  extends: [
    '@eslint/js/recommended',
    'plugin:svelte/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    // Custom rules for enforcing design system guidelines
    
    // Enforce consistent button class usage
    'svelte/enforce-design-system-buttons': 'error',
    
    // Warn about hardcoded colors instead of design system classes
    'no-hardcoded-colors': 'warn',
    
    // Enforce consistent spacing patterns
    'consistent-spacing-classes': 'warn',
    
    // Require accessibility attributes
    'svelte/a11y-missing-attribute': 'error',
    'svelte/a11y-aria-attributes': 'error',
    
    // Component naming conventions
    'svelte/component-name-in-template-casing': ['error', 'PascalCase'],
    
    // Enforce consistent prop naming
    'svelte/no-unused-svelte-ignore': 'error',
  },
  
  // Custom rule implementations
  overrides: [
    {
      files: ['**/*.svelte'],
      rules: {
        // Custom rules specific to Svelte components
        'design-system/consistent-button-usage': ['error', {
          allowedButtonClasses: [
            'btn-primary',
            'btn-secondary', 
            'btn-small',
            'btn text-white bg-blue-500 hover:bg-blue-600',
            'btn text-gray-600 bg-white hover:bg-blue-100 hover:text-blue-600',
            'btn-sm text-white bg-blue-500 hover:bg-blue-600'
          ]
        }],
        
        'design-system/no-hardcoded-colors': ['warn', {
          // Allow these hardcoded colors for specific cases
          allowedColors: ['transparent', 'currentColor', 'inherit'],
          message: 'Use design system color classes instead of hardcoded colors'
        }],
        
        'design-system/consistent-typography': ['error', {
          allowedHeadingClasses: ['h1', 'h2', 'h3', 'h4'],
          requireFontClass: true,
          message: 'Use design system heading classes (.h1, .h2, etc.) with font-cabinet-grotesk'
        }],
        
        'design-system/consistent-spacing': ['warn', {
          preferredSpacingPatterns: [
            'container-standard',
            'container-narrow', 
            'container-form',
            'section-standard',
            'max-w-6xl mx-auto px-4 sm:px-6',
            'max-w-3xl mx-auto',
            'max-w-sm mx-auto'
          ],
          message: 'Use design system container and spacing classes'
        }]
      }
    }
  ]
};

// Custom rule implementations (these would need to be in a separate plugin)
const customRules = {
  'design-system/consistent-button-usage': {
    meta: {
      type: 'problem',
      docs: {
        description: 'Enforce consistent button class usage from design system'
      },
      schema: [{
        type: 'object',
        properties: {
          allowedButtonClasses: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }]
    },
    create(context) {
      const options = context.options[0] || {};
      const allowedClasses = options.allowedButtonClasses || [];
      
      return {
        'SvelteElement[name="button"]'(node) {
          const classAttr = node.attributes.find(attr => attr.name === 'class');
          if (classAttr && classAttr.value) {
            const classes = classAttr.value.value;
            const isValidButton = allowedClasses.some(allowedClass => 
              classes.includes(allowedClass)
            );
            
            if (!isValidButton) {
              context.report({
                node,
                message: 'Use design system button classes (.btn-primary, .btn-secondary, .btn-small)'
              });
            }
          }
        }
      };
    }
  },
  
  'design-system/no-hardcoded-colors': {
    meta: {
      type: 'suggestion',
      docs: {
        description: 'Discourage hardcoded colors in favor of design system classes'
      }
    },
    create(context) {
      const colorPattern = /#[0-9a-fA-F]{3,6}|rgb\(|rgba\(|hsl\(|hsla\(/;
      
      return {
        'SvelteAttribute[name="class"]'(node) {
          if (node.value && colorPattern.test(node.value.value)) {
            context.report({
              node,
              message: 'Use design system color classes instead of hardcoded colors'
            });
          }
        }
      };
    }
  }
};
