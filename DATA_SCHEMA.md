# Accessibility Helper Chrome Extension - Backend Data Schema

## Overview
The Chrome extension now sends a comprehensive, flattened data structure to the backend API. This document describes the complete schema after all serialization and hydration fixes have been implemented.

## API Endpoint
- **Method**: `PUT`
- **URL**: `${BACKEND_BASE}/reviews/${sessionId}`
- **Content-Type**: `application/json`

## Request Body Structure

```json
{
  "formData": {
    // Flattened form data (see detailed schema below)
  },
  "metadata": {
    "websiteUrl": "https://example.com",
    "submittedAt": "2025-07-01T09:49:27.000Z",
    "reviewVersion": "1.0.0",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36..."
  },
  "complete": true
}
```

## Form Data Schema

### Data Types and Serialization Rules

1. **Checkbox Groups** → `Array<string>` (multiple selections possible)
2. **Single Checkboxes** → `string` (value or "on")
3. **Radio Buttons** → `string` (single selection)
4. **Select Dropdowns** → `string` (single selection)
5. **Multi-Select Elements** → `Array<string>` (multiple selections possible)
6. **Text Inputs** → `string`
7. **Textareas** → `string`

### Key Collision Handling
- When multiple pages have fields with the same name, they are prefixed with `page{N}_`
- Non-colliding fields maintain their original names for backward compatibility
- Example: `common_field` becomes `page1_common_field`, `page2_common_field`, etc.

### Page Completion Metadata
- `page{N}_completed`: `boolean` - Whether the page has any data
- `page{N}_field_count`: `number` - Number of fields completed on that page

## Detailed Field Schema

### Page 1: Introduction & Instructions
- No form fields (informational page only)

### Page 2: User Profile & Accessibility Needs

#### Checkbox Groups (Arrays):
```json
{
  "input_method": ["keyboard_mouse", "touch", "voice", "alternative", "switch"],
  "content_access": ["visual", "audio", "enlarged", "simplified", "high_contrast"],
  "navigation_pref": ["keyboard", "sequential", "search", "shortcuts"],
  "challenges": [
    "time_limits", "complex_navigation", "inconsistent_layouts", 
    "multimedia", "small_text", "poor_contrast", "unclear_instructions", 
    "distractions", "compatibility"
  ]
}
```

#### Text Fields:
```json
{
  "alternative_improvements": "string",
  "content_improvements": "string", 
  "navigation_improvements": "string",
  "assistive_tech": "string",
  "accessible_features": "string",
  "challenge_improvements": "string",
  "barrier_effects": "string",
  "browser": "string",
  "os": "string"
}
```

#### Radio Button:
```json
{
  "device_type": "desktop" | "laptop" | "tablet" | "smartphone"
}
```

### Page 3: Navigation Tasks

#### Select Dropdowns:
```json
{
  "main_features_ease": "very_easy" | "somewhat_easy" | "hard" | "could_not_do",
  "contact_ease": "very_easy" | "somewhat_easy" | "hard" | "could_not_do",
  "search_ease": "very_easy" | "somewhat_easy" | "hard" | "could_not_do",
  "menu_ease": "very_easy" | "somewhat_easy" | "hard" | "could_not_do"
}
```

#### Text Areas:
```json
{
  "main_features_barriers": "string",
  "contact_barriers": "string",
  "search_barriers": "string", 
  "menu_barriers": "string",
  "navigation_suggestions": "string"
}
```

### Page 4: Content Quality

#### Select Dropdowns:
```json
{
  "content_clarity": "very_clear" | "somewhat_clear" | "unclear" | "very_unclear",
  "updates_ease": "very_easy" | "somewhat_easy" | "hard" | "could_not_do",
  "documents_ease": "very_easy" | "somewhat_easy" | "hard" | "could_not_do",
  "structure_quality": "excellent" | "good" | "poor" | "very_poor"
}
```

#### Text Areas:
```json
{
  "clarity_barriers": "string",
  "updates_barriers": "string",
  "documents_barriers": "string", 
  "structural_issues": "string",
  "alt_text_suggestions": "string",
  "content_simplification": "string",
  "multimedia_accessibility": "string"
}
```

### Page 5: Interactive Elements

#### Select Dropdowns:
```json
{
  "forms_ease": "very_easy" | "somewhat_easy" | "hard" | "could_not_do",
  "buttons_ease": "very_easy" | "somewhat_easy" | "hard" | "could_not_do",
  "links_ease": "very_easy" | "somewhat_easy" | "hard" | "could_not_do"
}
```

#### Text Areas:
```json
{
  "forms_barriers": "string",
  "buttons_barriers": "string",
  "links_barriers": "string",
  "interaction_suggestions": "string"
}
```

### Page 6: Visual Design

#### Select Dropdowns:
```json
{
  "text_readability": "excellent" | "good" | "poor" | "very_poor",
  "color_contrast": "excellent" | "good" | "poor" | "very_poor",
  "layout_clarity": "excellent" | "good" | "poor" | "very_poor"
}
```

#### Text Areas:
```json
{
  "readability_issues": "string",
  "contrast_issues": "string",
  "layout_issues": "string",
  "visual_suggestions": "string"
}
```

### Page 7: Mobile Experience

#### Select Dropdowns:
```json
{
  "mobile_navigation": "excellent" | "good" | "poor" | "very_poor",
  "mobile_readability": "excellent" | "good" | "poor" | "very_poor",
  "mobile_interaction": "excellent" | "good" | "poor" | "very_poor"
}
```

#### Text Areas:
```json
{
  "mobile_barriers": "string",
  "mobile_suggestions": "string"
}
```

### Page 8: Overall Experience

#### Select Dropdowns:
```json
{
  "overall_rating": "excellent" | "good" | "fair" | "poor",
  "recommend_rating": "definitely" | "probably" | "probably_not" | "definitely_not"
}
```

#### Text Areas:
```json
{
  "positive_aspects": "string",
  "priority_improvements": "string",
  "additional_comments": "string"
}
```

## Example Complete Request

```json
{
  "formData": {
    // User Profile (Page 2)
    "input_method": ["keyboard_mouse", "touch"],
    "content_access": ["visual", "audio"],
    "navigation_pref": ["keyboard", "shortcuts"],
    "challenges": ["time_limits", "small_text"],
    "assistive_tech": "NVDA 2023.1",
    "device_type": "desktop",
    "browser": "Chrome 123",
    "os": "Windows 11",
    
    // Navigation (Page 3)
    "main_features_ease": "somewhat_easy",
    "main_features_barriers": "Focus indicators were hard to see",
    "contact_ease": "very_easy",
    
    // Content Quality (Page 4)
    "content_clarity": "good",
    "structure_quality": "excellent",
    
    // Interactive Elements (Page 5)
    "forms_ease": "hard",
    "forms_barriers": "Error messages not announced by screen reader",
    
    // Visual Design (Page 6)
    "text_readability": "good",
    "color_contrast": "poor",
    "contrast_issues": "Light gray text on white background",
    
    // Mobile Experience (Page 7)
    "mobile_navigation": "good",
    
    // Overall Experience (Page 8)
    "overall_rating": "fair",
    "priority_improvements": "Improve color contrast and form error handling",
    
    // Page Completion Metadata
    "page2_completed": true,
    "page2_field_count": 8,
    "page3_completed": true,
    "page3_field_count": 3,
    "page4_completed": true,
    "page4_field_count": 3,
    "page5_completed": true,
    "page5_field_count": 2,
    "page6_completed": true,
    "page6_field_count": 3,
    "page7_completed": true,
    "page7_field_count": 1,
    "page8_completed": true,
    "page8_field_count": 2
  },
  "metadata": {
    "websiteUrl": "https://example.com",
    "submittedAt": "2025-07-01T09:49:27.000Z",
    "reviewVersion": "1.0.0",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  },
  "complete": true
}
```

## Key Improvements in This Schema

### 1. Robust Checkbox Group Handling
- **Before**: Checkbox groups were overwritten, losing multiple selections
- **After**: Properly collected into arrays (e.g., `["keyboard_mouse", "touch"]`)

### 2. Multi-Select Support
- **Before**: Multi-select elements were not supported
- **After**: Properly serialized as arrays and restored during hydration

### 3. Collision Detection
- **Before**: Fields with same names across pages would overwrite each other
- **After**: Automatic prefixing with page numbers when collisions detected

### 4. Enhanced Validation
- **Before**: Hardcoded validation that could miss checkbox groups
- **After**: Flexible validation that detects checkbox groups dynamically

### 5. Improved Error Handling
- **Before**: Generic error messages
- **After**: Specific HTTP status code handling with user-friendly messages

### 6. Performance Optimization
- **Before**: O(n²) collision detection
- **After**: O(n) pre-computed collision detection

## Backward Compatibility
- Non-colliding field names remain unchanged
- Single checkbox behavior preserved
- Existing API contract maintained
- All previous data formats still supported

## Testing
All serialization, hydration, validation, and edge cases have been thoroughly tested with a comprehensive test suite (`test-serialization.html`).
