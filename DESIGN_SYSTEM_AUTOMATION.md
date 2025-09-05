# Design System Automation

This document explains how the Party Games project automatically enforces the UI Design Guidelines through tooling, scripts, and automation. This ensures consistent, high-quality UI components across the entire application.

## Overview

We've built several automated systems that work together to enforce our design guidelines:

1. **Component Generators** - Auto-generate components following design patterns
2. **CSS Framework** - Pre-built classes and utilities 
3. **Validation Scripts** - Check compliance automatically
4. **Linting Rules** - Enforce standards during development
5. **Git Hooks** - Prevent non-compliant code from being committed
6. **Build Integration** - Run checks during development and CI/CD

---

## 🚀 Getting Started

### Quick Setup
```bash
# Install dependencies (if not already done)
npm install

# Import the design system CSS in your main CSS file
# Add to src/app.css or your main stylesheet:
@import './lib/styles/design-system.css';
```

### Generate Your First Component
```bash
# Generate a new button component
npm run generate:component MyButton button src/lib/components

# Generate a card component
npm run generate:component GameCard card src/lib/components

# See all available templates
npm run generate:component
```

---

## 🛠️ Available Tools

### 1. Component Generator
**Command:** `npm run generate:component <name> <type> [path]`

Available component types:
- `button` - Buttons with design system classes
- `card` - Card components with hover effects
- `input` - Form inputs following design guidelines  
- `header` - Navigation headers with proper structure
- `page` - Full page layouts with proper structure
- `section` - Content sections with standard spacing

**Example:**
```bash
npm run generate:component LoginButton button src/lib/components
```

This generates a `LoginButton.svelte` file with:
- Proper design system classes
- Accessibility attributes
- TypeScript props
- Consistent structure

### 2. Design System Validation
**Command:** `npm run design:validate`

Automatically checks for:
- ❌ **Errors** - Critical issues (missing accessibility, hardcoded colors)
- ⚠️ **Warnings** - Design inconsistencies (wrong button classes, missing fonts)
- 💡 **Suggestions** - Improvements (better container usage, spacing)

**Example output:**
```
🎨 Party Games Design System Validator
======================================

🔍 Validating /src/lib/components/MyComponent.svelte...

⚠️  Warnings (2):
  /src/lib/components/MyComponent.svelte: Button doesn't use design system classes
    💡 Use .btn-primary, .btn-secondary, or .btn-small classes

✅ Passed Checks: 3
```

### 3. Design System Linting
**Commands:**
- `npm run design:lint` - Check for design system compliance
- `npm run design:lint:fix` - Auto-fix issues where possible
- `npm run design:check` - Run all checks (lint + format)
- `npm run design:fix` - Auto-fix all issues

### 4. Format & Style Enforcement
**Commands:**
- `npm run design:format` - Format Svelte files
- `npm run design:format:check` - Check formatting

---

## 🎨 Using the Design System CSS

### Import the Design System
Add this to your main CSS file (`src/app.css`):

```css
@import './lib/styles/design-system.css';
```

### Available CSS Classes

#### Typography
```html
<!-- Headings (automatically use Cabinet Grotesk font) -->
<h1 class="h1">Main Heading</h1>
<h2 class="h2">Section Heading</h2>
<h3 class="h3">Subsection</h3>
<h4 class="h4">Minor Heading</h4>
```

#### Buttons
```html
<!-- Primary button -->
<button class="btn-primary">Primary Action</button>

<!-- Secondary button -->
<button class="btn-secondary">Secondary Action</button>

<!-- Small button -->
<button class="btn-small">Small Action</button>
```

#### Layout Containers
```html
<!-- Standard page container -->
<div class="container-standard">
  <!-- Content -->
</div>

<!-- Form container -->
<div class="container-form">
  <!-- Form elements -->
</div>

<!-- Section with standard spacing -->
<section class="section-standard">
  <!-- Section content -->
</section>
```

#### Forms
```html
<!-- Form input -->
<input type="text" class="form-input" placeholder="Enter text" />

<!-- Form with proper structure -->
<div class="mb-4">
  <label class="block text-gray-500 text-sm font-medium mb-1" for="email">
    Email
  </label>
  <input id="email" type="email" class="form-input w-full text-gray-800" />
</div>
```

#### Cards
```html
<!-- Basic card -->
<div class="card-basic">
  <p>Card content</p>
</div>

<!-- Hoverable card -->
<div class="card-hoverable">
  <p>Card with hover effect</p>
</div>
```

---

## 🔧 Automation Workflow

### During Development
1. **Write code** using generated components or design system classes
2. **Auto-validation** runs as you save files (if using VS Code with appropriate extensions)
3. **Manual check** with `npm run design:validate` anytime

### Before Committing
1. **Pre-commit hook** automatically runs when you commit
2. **Validation fails** → commit is blocked, fix issues first
3. **Auto-fix** available with `npm run design:fix`
4. **Validation passes** → commit proceeds

### During CI/CD
Add these to your CI pipeline:
```yaml
- name: Validate Design System
  run: npm run design:validate

- name: Check Design System Linting  
  run: npm run design:check
```

---

## 🚨 Common Issues & Solutions

### Issue: "Button doesn't use design system classes"
**Problem:** Using custom button classes instead of design system ones.

**Solution:**
```html
<!-- ❌ Don't do this -->
<button class="px-4 py-2 bg-blue-600 text-white rounded">
  Click me
</button>

<!-- ✅ Do this -->
<button class="btn-primary">
  Click me
</button>
```

### Issue: "Found hardcoded color"
**Problem:** Using hex/rgb colors instead of design system colors.

**Solution:**
```html
<!-- ❌ Don't do this -->
<div style="color: #3B82F6; background: #F3F4F6;">
  Content
</div>

<!-- ✅ Do this -->
<div class="text-blue-500 bg-gray-100">
  Content
</div>
```

### Issue: "Headings should use font-cabinet-grotesk class"
**Problem:** Headings not using the proper display font.

**Solution:**
```html
<!-- ❌ Don't do this -->
<h1 class="text-4xl font-bold">
  Heading
</h1>

<!-- ✅ Do this -->
<h1 class="h1">
  Heading
</h1>

<!-- Or this -->
<h1 class="text-4xl font-bold font-cabinet-grotesk">
  Heading
</h1>
```

### Issue: "Images need alt text for accessibility"
**Solution:**
```html
<!-- ❌ Don't do this -->
<img src="game-screenshot.jpg" />

<!-- ✅ Do this -->
<img src="game-screenshot.jpg" alt="Screenshot of the tap game in progress" />
```

---

## 🎯 Best Practices

### 1. Always Use Generated Components
- Generate new components with `npm run generate:component`
- Start with templates, customize as needed
- Follow established patterns

### 2. Run Validation Regularly
```bash
# Quick check during development
npm run design:validate

# Full check before committing
npm run design:check
```

### 3. Use Design System Classes
- Prefer `.btn-primary` over custom button styles
- Use `.container-standard` for page layouts
- Use `.h1`, `.h2`, etc. for headings

### 4. Fix Issues Promptly
- Use `npm run design:fix` to auto-fix simple issues
- Address warnings before they become errors
- Keep validation passing at all times

---

## 📚 Reference Files

- **[UI_DESIGN_GUIDELINES.md](./UI_DESIGN_GUIDELINES.md)** - Complete design system documentation
- **[src/lib/styles/design-system.css](./src/lib/styles/design-system.css)** - CSS framework and utilities
- **[scripts/generate-component.js](./scripts/generate-component.js)** - Component generator
- **[scripts/validate-design-system.js](./scripts/validate-design-system.js)** - Validation script
- **[.eslintrc-design-system.js](./.eslintrc-design-system.js)** - Linting rules

---

## 🤖 IDE Integration

### VS Code Extensions (Recommended)
```json
// .vscode/extensions.json
{
  "recommendations": [
    "svelte.svelte-vscode",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint"
  ]
}
```

### VS Code Settings
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.includeLanguages": {
    "svelte": "html"
  },
  "tailwindCSS.classAttributes": [
    "class",
    "className",
    ".*Classes.*"
  ]
}
```

---

## 🚀 Summary

With this automated design system, you get:

✅ **Consistent UI** - All components follow the same design patterns  
✅ **Quality Assurance** - Automatic validation prevents issues  
✅ **Developer Experience** - Generate components quickly with proper structure  
✅ **Accessibility** - Built-in accessibility checks and requirements  
✅ **Maintainability** - Easy to update and extend design system rules  
✅ **Team Collaboration** - Everyone follows the same standards automatically  

The system works automatically in the background, but you can always run manual checks and fixes when needed. This ensures your Party Games application maintains a professional, consistent design while allowing you to focus on building great gameplay features.

**Start using it right now:**
```bash
npm run generate:component WelcomeButton button src/lib/components
npm run design:validate
```

🎉 Happy coding with automated design system compliance!
