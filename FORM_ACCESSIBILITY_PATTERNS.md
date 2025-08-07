# Form Accessibility Patterns Guide

## Overview
This guide provides copy-paste patterns for creating accessible forms in the MyVision Chrome Extension. All patterns follow WCAG 2.1 Level AA standards.

## Core Principles

1. **Labels are visible** (never use placeholder as the only label)
2. **Required fields are programmatically indicated** (aria-required="true")
3. **Error messages are associated with fields** (aria-describedby)
4. **Related fields are grouped** (fieldset/legend)
5. **Instructions are clear** (not just visual cues)

## Pattern Library

### 1. Required Select Dropdown

```html
<div class="form-group">
  <label for="ease_rating">
    How easy was it? <span aria-label="required">*</span>
  </label>
  <select id="ease_rating" 
          name="ease_rating" 
          required 
          aria-required="true"
          aria-describedby="ease_rating_error">
    <option value="">Select one…</option>
    <option value="very_easy">Very easy</option>
    <option value="somewhat_easy">Somewhat easy</option>
    <option value="hard">Hard</option>
    <option value="could_not_do">Couldn't do</option>
  </select>
  <span id="ease_rating_error" 
        class="validation-message" 
        role="alert" 
        aria-live="polite"></span>
</div>
```

### 2. Optional Select Dropdown

```html
<div class="form-group">
  <label for="device_type">Device Type</label>
  <select id="device_type" name="device_type">
    <option value="">Choose if applicable…</option>
    <option value="desktop">Desktop</option>
    <option value="laptop">Laptop</option>
    <option value="tablet">Tablet</option>
    <option value="smartphone">Smartphone</option>
  </select>
</div>
```

### 3. Checkbox Group (Fieldset)

```html
<fieldset>
  <legend>Input Methods:</legend>
  <div class="form-group">
    <label class="checkbox-container">
      Keyboard/mouse (regular computer setup)
      <input type="checkbox" name="input_method" value="keyboard_mouse">
      <span class="checkmark"></span>
    </label>
  </div>
  <div class="form-group">
    <label class="checkbox-container">
      Touch (touchscreen, touchpad, mobile devices)
      <input type="checkbox" name="input_method" value="touch">
      <span class="checkmark"></span>
    </label>
  </div>
  <div class="form-group">
    <label class="checkbox-container">
      Voice commands
      <input type="checkbox" name="input_method" value="voice">
      <span class="checkmark"></span>
    </label>
  </div>
</fieldset>
```

### 4. Radio Button Group

```html
<fieldset>
  <legend>Device Type:</legend>
  <div class="form-group">
    <label class="radio-container">
      Desktop
      <input type="radio" name="device_type" value="desktop">
      <span class="radio-mark"></span>
    </label>
  </div>
  <div class="form-group">
    <label class="radio-container">
      Laptop
      <input type="radio" name="device_type" value="laptop">
      <span class="radio-mark"></span>
    </label>
  </div>
  <div class="form-group">
    <label class="radio-container">
      Tablet
      <input type="radio" name="device_type" value="tablet">
      <span class="radio-mark"></span>
    </label>
  </div>
</fieldset>
```

### 5. Text Input with Hint

```html
<div class="form-group">
  <label for="browser">Browser:</label>
  <input type="text" 
         id="browser" 
         name="browser" 
         aria-describedby="browser_hint"
         placeholder="e.g., Chrome 120">
  <span id="browser_hint" class="hint-text">
    Include version number if known
  </span>
</div>
```

### 6. Required Text Input

```html
<div class="form-group">
  <label for="email">
    Email address <span aria-label="required">*</span>
  </label>
  <input type="email" 
         id="email" 
         name="email" 
         required 
         aria-required="true"
         aria-describedby="email_error"
         autocomplete="email">
  <span id="email_error" 
        class="validation-message" 
        role="alert" 
        aria-live="polite"></span>
</div>
```

### 7. Textarea with Character Limit

```html
<div class="form-group">
  <label for="feedback">
    Describe your experience 
    <span class="char-limit">(Maximum 500 characters)</span>
  </label>
  <textarea id="feedback" 
            name="feedback" 
            rows="4"
            maxlength="500"
            aria-describedby="feedback_count feedback_error"></textarea>
  <span id="feedback_count" 
        class="char-count" 
        aria-live="polite">
    <span class="current">0</span> / 500 characters
  </span>
  <span id="feedback_error" 
        class="validation-message" 
        role="alert" 
        aria-live="polite"></span>
</div>
```

### 8. Form Section with Instructions

```html
<div class="card mb-3">
  <div class="card-header">
    <h3 class="card-title">
      Navigation Experience 
      <span class="text-primary">(Most important)</span>
    </h3>
  </div>
  <div class="card-content">
    <p class="instructions">
      <strong>What to do:</strong> Try to find the main menu and navigate to different sections.
    </p>
    <p class="instructions">
      <strong>Why this matters:</strong> Navigation must be accessible to all users, including those using assistive technologies.
    </p>
    <!-- Form fields here -->
  </div>
</div>
```

### 9. Progress Indicator

```html
<div class="progress-container">
  <div class="progress-bar" 
       role="progressbar" 
       aria-valuenow="25" 
       aria-valuemin="0" 
       aria-valuemax="100"
       aria-label="Form progress: 25% complete"
       style="width: 25%"></div>
</div>
<span class="visually-hidden" aria-live="polite">
  Step 2 of 8: 25% complete
</span>
```

### 10. Form Navigation

```html
<nav class="bottom-nav" aria-label="Form steps">
  <ul>
    <li>
      <a href="../popup.html" aria-label="Step 1: Introduction">1</a>
    </li>
    <li>
      <a href="page2.html" 
         class="active" 
         aria-current="page" 
         aria-label="Step 2: Your Web-Use Profile">2</a>
    </li>
    <li>
      <a href="page3.html" aria-label="Step 3: Test Site Navigation">3</a>
    </li>
    <!-- More steps -->
  </ul>
</nav>
```

## Validation Patterns

### Client-Side Validation

```javascript
// When form is submitted
form.addEventListener('submit', (e) => {
  if (!form.checkValidity()) {
    e.preventDefault();
    
    // Show error messages for invalid fields
    const invalidFields = form.querySelectorAll(':invalid');
    invalidFields.forEach(field => {
      const errorId = field.id + '_error';
      const errorElement = document.getElementById(errorId);
      if (errorElement) {
        errorElement.textContent = field.validationMessage;
        errorElement.style.display = 'block';
      }
    });
    
    // Focus first invalid field
    invalidFields[0]?.focus();
  }
});

// Clear error message when field becomes valid
field.addEventListener('input', () => {
  const errorId = field.id + '_error';
  const errorElement = document.getElementById(errorId);
  if (errorElement && field.validity.valid) {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }
});
```

## CSS Support

```css
/* Visually hidden but available to screen readers */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Required field indicator */
.form-group label span[aria-label="required"] {
  color: var(--color-error, #dc3545);
  font-weight: bold;
}

/* Error message styling */
.validation-message {
  display: none;
  color: var(--color-error, #dc3545);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.validation-message:not(:empty) {
  display: block;
}

/* Focus styles */
:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

## Testing Checklist

Before deploying any form:

- [ ] All form inputs have visible labels
- [ ] Required fields have aria-required="true"
- [ ] Required indicators (*) have aria-label="required"
- [ ] Error messages have role="alert" and aria-live="polite"
- [ ] Related inputs are grouped with fieldset/legend
- [ ] Form can be completed using only keyboard
- [ ] Tab order follows visual order
- [ ] Focus indicators are clearly visible
- [ ] Form tested with screen reader (NVDA/VoiceOver)
- [ ] Form works at 200% zoom level

## Common Mistakes to Avoid

1. ❌ Using placeholder as the only label
2. ❌ Color-only error indicators
3. ❌ Keyboard traps in custom controls
4. ❌ Missing focus indicators
5. ❌ Inaccessible error messages
6. ❌ Unlabeled form controls
7. ❌ Missing fieldsets for radio/checkbox groups
8. ❌ Instructions after the form field

## Resources

- [WCAG 2.1 Form Guidelines](https://www.w3.org/WAI/WCAG21/quickref/?tags=forms)
- [MDN ARIA Forms Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/forms)
- [WebAIM Form Accessibility](https://webaim.org/techniques/forms/)

---

Remember: **Accessibility is not an afterthought**. Use these patterns from the start!
