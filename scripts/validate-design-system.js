#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Design system validation rules based on UI guidelines
const designSystemRules = {
  // Color usage rules
  colors: {
    forbidden: [
      /#[0-9a-fA-F]{3,6}/g,  // Hex colors
      /rgb\([^)]+\)/g,        // RGB colors
      /rgba\([^)]+\)/g,       // RGBA colors
      /hsl\([^)]+\)/g,        // HSL colors
      /hsla\([^)]+\)/g        // HSLA colors
    ],
    preferred: [
      'bg-blue-500', 'text-blue-500', 'border-blue-500',
      'bg-gray-50', 'bg-gray-100', 'bg-gray-200', 'bg-gray-800',
      'text-gray-400', 'text-gray-500', 'text-gray-600', 'text-gray-800'
    ]
  },
  
  // Typography rules
  typography: {
    headings: ['h1', 'h2', 'h3', 'h4'],
    fontClasses: ['font-inter', 'font-cabinet-grotesk'],
    forbidden: [
      /font-family\s*:/g,     // Inline font-family
      /font-size\s*:/g,       // Inline font-size
      /font-weight\s*:/g      // Inline font-weight
    ]
  },
  
  // Button rules
  buttons: {
    allowedClasses: [
      'btn-primary',
      'btn-secondary', 
      'btn-small',
      'btn text-white bg-blue-500 hover:bg-blue-600',
      'btn text-gray-600 bg-white hover:bg-blue-100 hover:text-blue-600',
      'btn-sm text-white bg-blue-500 hover:bg-blue-600'
    ],
    requiredAttributes: ['type', 'class']
  },
  
  // Layout rules
  layout: {
    containerClasses: [
      'container-standard',
      'container-narrow', 
      'container-form',
      'max-w-6xl mx-auto px-4 sm:px-6',
      'max-w-3xl mx-auto',
      'max-w-sm mx-auto'
    ],
    sectionClasses: [
      'section-standard',
      'pt-32 pb-12',
      'pt-32 pb-12 md:pt-40 md:pb-20'
    ]
  },
  
  // Form rules
  forms: {
    inputClasses: ['form-input', 'form-textarea', 'form-select'],
    requiredLabelAttributes: ['for'],
    accessibilityRules: ['aria-label', 'aria-describedby']
  }
};

// Validation results storage
const validationResults = {
  errors: [],
  warnings: [],
  suggestions: [],
  passed: []
};

// Validate a single file
function validateFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const fileName = filePath.replace(process.cwd(), '');
  
  console.log(`🔍 Validating ${fileName}...`);
  
  // Check for hardcoded colors
  validateColors(content, fileName);
  
  // Check typography usage
  validateTypography(content, fileName);
  
  // Check button usage
  validateButtons(content, fileName);
  
  // Check layout patterns
  validateLayout(content, fileName);
  
  // Check form elements
  validateForms(content, fileName);
  
  // Check accessibility
  validateAccessibility(content, fileName);
}

function validateColors(content, fileName) {
  // Check for forbidden hardcoded colors
  designSystemRules.colors.forbidden.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      validationResults.warnings.push({
        file: fileName,
        rule: 'hardcoded-colors',
        message: `Found hardcoded color: ${matches.join(', ')}. Use design system color classes instead.`,
        suggestion: 'Use classes like bg-blue-500, text-gray-800, etc.'
      });
    }
  });
  
  // Check for proper color usage
  const hasSystemColors = designSystemRules.colors.preferred.some(color => 
    content.includes(color)
  );
  
  if (hasSystemColors) {
    validationResults.passed.push({
      file: fileName,
      rule: 'color-system-usage',
      message: 'Using design system color classes ✅'
    });
  }
}

function validateTypography(content, fileName) {
  // Check for inline font styles (forbidden)
  designSystemRules.typography.forbidden.forEach(pattern => {
    if (pattern.test(content)) {
      validationResults.errors.push({
        file: fileName,
        rule: 'inline-font-styles',
        message: 'Avoid inline font styles. Use design system typography classes.',
        suggestion: 'Use .h1, .h2, .h3, .h4 classes or font-inter/font-cabinet-grotesk'
      });
    }
  });
  
  // Check for proper heading usage
  const headingMatches = content.match(/class="[^"]*h[1-4][^"]*"/g);
  if (headingMatches) {
    const hasProperFont = headingMatches.some(match => 
      match.includes('font-cabinet-grotesk')
    );
    
    if (!hasProperFont) {
      validationResults.warnings.push({
        file: fileName,
        rule: 'heading-font-class',
        message: 'Headings should use font-cabinet-grotesk class',
        suggestion: 'Add font-cabinet-grotesk to heading elements'
      });
    }
  }
}

function validateButtons(content, fileName) {
  const buttonMatches = content.match(/<button[^>]*>/g);
  if (buttonMatches) {
    buttonMatches.forEach(buttonMatch => {
      // Check for proper button classes
      const hasValidClass = designSystemRules.buttons.allowedClasses.some(allowedClass =>
        buttonMatch.includes(allowedClass)
      );
      
      if (!hasValidClass) {
        validationResults.warnings.push({
          file: fileName,
          rule: 'button-class-usage',
          message: `Button doesn't use design system classes: ${buttonMatch}`,
          suggestion: 'Use .btn-primary, .btn-secondary, or .btn-small classes'
        });
      }
      
      // Check for required attributes
      if (!buttonMatch.includes('type=')) {
        validationResults.warnings.push({
          file: fileName,
          rule: 'button-type-attribute',
          message: 'Button missing type attribute',
          suggestion: 'Add type="button" or type="submit"'
        });
      }
    });
  }
}

function validateLayout(content, fileName) {
  // Check for proper container usage
  const hasContainer = designSystemRules.layout.containerClasses.some(containerClass =>
    content.includes(containerClass)
  );
  
  if (!hasContainer && content.includes('<div')) {
    validationResults.suggestions.push({
      file: fileName,
      rule: 'container-usage',
      message: 'Consider using design system container classes',
      suggestion: 'Use .container-standard, .container-narrow, or .container-form'
    });
  }
  
  // Check for section spacing
  const hasSectionSpacing = designSystemRules.layout.sectionClasses.some(sectionClass =>
    content.includes(sectionClass)
  );
  
  if (content.includes('<section') && !hasSectionSpacing) {
    validationResults.suggestions.push({
      file: fileName,
      rule: 'section-spacing',
      message: 'Section elements should use standard spacing classes',
      suggestion: 'Use .section-standard or pt-32 pb-12 md:pt-40 md:pb-20'
    });
  }
}

function validateForms(content, fileName) {
  const inputMatches = content.match(/<input[^>]*>/g);
  const labelMatches = content.match(/<label[^>]*>/g);
  
  if (inputMatches) {
    inputMatches.forEach(inputMatch => {
      const hasFormClass = designSystemRules.forms.inputClasses.some(formClass =>
        inputMatch.includes(formClass)
      );
      
      if (!hasFormClass) {
        validationResults.warnings.push({
          file: fileName,
          rule: 'form-input-class',
          message: `Form input should use design system classes: ${inputMatch}`,
          suggestion: 'Use .form-input, .form-textarea, or .form-select classes'
        });
      }
    });
  }
  
  if (labelMatches) {
    labelMatches.forEach(labelMatch => {
      if (!labelMatch.includes('for=')) {
        validationResults.warnings.push({
          file: fileName,
          rule: 'label-for-attribute',
          message: 'Label missing for attribute for accessibility',
          suggestion: 'Add for=\"inputId\" to associate label with input'
        });
      }
    });
  }
}

function validateAccessibility(content, fileName) {
  // Check for buttons without aria-label when they only contain icons
  const buttonMatches = content.match(/<button[^>]*>[\s\S]*?<\/button>/g);
  if (buttonMatches) {
    buttonMatches.forEach(buttonMatch => {
      const hasText = buttonMatch.match(/>([^<]+)</);
      const hasIcon = buttonMatch.includes('<svg') || buttonMatch.includes('icon');
      
      if (hasIcon && !hasText && !buttonMatch.includes('aria-label')) {
        validationResults.errors.push({
          file: fileName,
          rule: 'button-accessibility',
          message: 'Icon-only buttons need aria-label for accessibility',
          suggestion: 'Add aria-label="Description" to the button'
        });
      }
    });
  }
  
  // Check for images without alt text
  const imgMatches = content.match(/<img[^>]*>/g);
  if (imgMatches) {
    imgMatches.forEach(imgMatch => {
      if (!imgMatch.includes('alt=')) {
        validationResults.errors.push({
          file: fileName,
          rule: 'image-alt-text',
          message: 'Images need alt text for accessibility',
          suggestion: 'Add alt="Description" to the image'
        });
      }
    });
  }
}

// Recursively find all Svelte files
function findSvelteFiles(dir) {
  const files = [];
  
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...findSvelteFiles(fullPath));
      } else if (item.endsWith('.svelte')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`⚠️  Could not read directory ${dir}: ${error.message}`);
  }
  
  return files;
}

// Generate validation report
function generateReport() {
  console.log('\n📊 Design System Validation Report');
  console.log('=====================================');
  
  if (validationResults.errors.length > 0) {
    console.log(`\n❌ Errors (${validationResults.errors.length}):`);
    validationResults.errors.forEach(error => {
      console.log(`  ${error.file}: ${error.message}`);
      if (error.suggestion) {
        console.log(`    💡 ${error.suggestion}`);
      }
    });
  }
  
  if (validationResults.warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${validationResults.warnings.length}):`);
    validationResults.warnings.forEach(warning => {
      console.log(`  ${warning.file}: ${warning.message}`);
      if (warning.suggestion) {
        console.log(`    💡 ${warning.suggestion}`);
      }
    });
  }
  
  if (validationResults.suggestions.length > 0) {
    console.log(`\n💡 Suggestions (${validationResults.suggestions.length}):`);
    validationResults.suggestions.forEach(suggestion => {
      console.log(`  ${suggestion.file}: ${suggestion.message}`);
      if (suggestion.suggestion) {
        console.log(`    💡 ${suggestion.suggestion}`);
      }
    });
  }
  
  console.log(`\n✅ Passed Checks: ${validationResults.passed.length}`);
  
  const totalIssues = validationResults.errors.length + validationResults.warnings.length;
  if (totalIssues === 0) {
    console.log('\n🎉 All design system validations passed!');
    return true;
  } else {
    console.log(`\n🔧 ${totalIssues} issues found. Run 'npm run design:fix' to auto-fix some issues.`);
    return false;
  }
}

// Main execution
function main() {
  console.log('🎨 Party Games Design System Validator');
  console.log('======================================\n');
  
  const componentsDir = join(process.cwd(), 'src/lib/components');
  const routesDir = join(process.cwd(), 'src/routes');
  
  const svelteFiles = [
    ...findSvelteFiles(componentsDir),
    ...findSvelteFiles(routesDir)
  ];
  
  if (svelteFiles.length === 0) {
    console.log('No Svelte files found to validate.');
    return;
  }
  
  console.log(`Found ${svelteFiles.length} Svelte files to validate.\n`);
  
  // Validate each file
  svelteFiles.forEach(validateFile);
  
  // Generate and display report
  const success = generateReport();
  
  // Exit with error code if there are errors
  if (validationResults.errors.length > 0) {
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${__filename}`) {
  main();
}
