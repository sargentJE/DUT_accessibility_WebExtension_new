# Web Extension Backend Data Schema - Comprehensive Documentation

## Executive Summary

This web extension collects comprehensive accessibility feedback from users testing websites. The data is serialized into a flat JSON structure and sent to a backend API via a single PUT request at the end of the review process.

---

## Backend API Configuration

### Endpoint Details
- **Base URL**: `https://web-production-d801.up.railway.app/api`
- **Session Creation Endpoint**: 
  - **Method**: POST
  - **URL**: `${BACKEND_BASE}/submit-review`
  - **Purpose**: Creates a new review session and returns a `submissionId`

- **Final Submission Endpoint**:
  - **Method**: PUT
  - **URL**: `${BACKEND_BASE}/reviews/{sessionId}`
  - **Purpose**: Submits the complete review data
  - **Content-Type**: `application/json`

### Authentication
- Uses JWT Bearer tokens stored in Chrome's local storage (`storage.local.token`)
- Token is retrieved from login process and included in Authorization header: `Bearer {token}`
- Token storage key: `'token'`
- Token retrieval happens via `getToken()` function from `token.js`

---

## Complete Request Structure

### Request Body Format (PUT to /reviews/{sessionId})

```json
{
  "formData": {
    // Flattened form data with all user responses
    // See detailed field mapping below
  },
  "metadata": {
    "websiteUrl": "https://example.com",
    "submittedAt": "2025-07-01T09:49:27.000Z",
    "reviewVersion": "1.0.2",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36..."
  },
  "complete": true
}
```

---

## Form Data Schema (Detailed Field Mapping)

### Data Serialization Rules

1. **Checkbox Groups** → `Array<string>` (multiple selections possible)
   - Example: `input_method: ["keyboard_mouse", "touch"]`

2. **Single Checkboxes** → `string` (value or "on")
   - Unchecked checkboxes are not included in serialization

3. **Radio Buttons** → `string` (single selection)
   - Example: `device_type: "desktop"`

4. **Select Dropdowns** → `string` (single selection)
   - Example: `content_clarity: "very_clear"`

5. **Multi-Select Elements** → `Array<string>` (multiple selections possible)

6. **Text Inputs** → `string`
   - Empty strings are included for inputs with no value

7. **Textareas** → `string`
   - Can span multiple lines

### Key Collision Handling

- Fields with the same name across different pages are automatically prefixed with `page{N}_`
- Example: If `main_features_ease` appears on multiple pages, it becomes:
  - `page3_main_features_ease`
  - `page4_main_features_ease` (if applicable)
- Non-colliding fields maintain original names for backward compatibility

### Page Completion Metadata

For each page with data, the schema includes:
- `page{N}_completed`: `boolean` - Whether the page has any data
- `page{N}_field_count`: `number` - Number of fields with data on that page

---

## Field-by-Page Breakdown

### Page 1: Introduction & Instructions
- **Status**: Informational page only
- **Fields**: None (no form data collected)

### Page 2: User Profile & Accessibility Needs

#### Checkbox Group Fields (Arrays):
- `input_method`: How user accesses websites
  - Possible values: `["keyboard_mouse", "touch", "voice", "alternative", "switch"]`
  
- `content_access`: How user gets information from websites
  - Possible values: `["visual", "audio", "enlarged", "simplified", "high_contrast"]`
  
- `navigation_pref`: How user navigates websites
  - Possible values: `["keyboard", "sequential", "search", "shortcuts"]`
  
- `challenges`: Accessibility challenges faced
  - Possible values: `["time_limits", "complex_navigation", "inconsistent_layouts", "multimedia", "small_text", "poor_contrast", "unclear_instructions", "distractions", "compatibility"]`

#### Text Fields (strings):
- `alternative_improvements`: Alternative input methods used
- `content_improvements`: Content presentation preferences
- `navigation_improvements`: Navigation method improvements
- `assistive_tech`: Assistive technology used (e.g., "NVDA 2023.1")
- `accessible_features`: Accessible features user relies on
- `challenge_improvements`: How to address identified challenges
- `barrier_effects`: Effects of accessibility barriers

#### Radio Button Fields (strings):
- `device_type`: Possible values: `"desktop"` | `"laptop"` | `"tablet"` | `"smartphone"`

#### Single-line Text Fields (strings):
- `browser`: Browser name and version
- `os`: Operating system

---

### Page 3: Navigation Tasks

#### Select Dropdown Fields (strings):
- `main_features_ease`: Ease of finding main features
  - Possible values: `"very_easy"` | `"somewhat_easy"` | `"hard"` | `"could_not_do"`
  
- `contact_info_ease`: Ease of locating contact details
  - Possible values: `"very_easy"` | `"somewhat_easy"` | `"hard"` | `"could_not_do"`
  
- `help_resources_ease`: Ease of finding help resources
  - Possible values: `"very_easy"` | `"somewhat_easy"` | `"hard"` | `"could_not_find"`
  
- `return_homepage_ease`: Ease of returning to homepage
  - Possible values: `"very_easy"` | `"somewhat_easy"` | `"hard"` | `"could_not_do"`

#### Textarea Fields (strings):
- `main_features_barriers`: Barriers encountered when finding main features
- `contact_info_barriers`: Barriers encountered when locating contact info
- `help_resources_location`: Where help link was found and how many clicks needed
- `return_homepage_barriers`: Barriers encountered when returning to homepage
- `alternative_navigation`: Alternative navigation suggestions

---

### Page 4: Content Quality

#### Select Dropdown Fields (strings):
- `content_clarity`: Content clarity and organization
  - Possible values: `"very_clear"` | `"mostly_clear"` | `"hard_to_follow"` | `"could_not_understand"`
  
- `updates_ease`: Ease of finding updates
  - Possible values: `"very_easy"` | `"somewhat_easy"` | `"hard"` | `"could_not_find"` | `"not_applicable"`
  
- `documents_ease`: Ease of opening documents
  - Possible values: `"very_easy"` | `"somewhat_easy"` | `"hard"` | `"could_not_open"` | `"not_applicable"`
  
- `structure_quality`: Information structure quality
  - Possible values: `"very_well"` | `"mostly_well"` | `"poorly"` | `"very_confusing"`

#### Textarea Fields (strings):
- `clarity_barriers`: Content clarity barriers
- `updates_barriers`: Barriers when finding updates
- `documents_barriers`: Document access barriers
- `structural_issues`: Information structure issues
- `alt_text_suggestions`: Suggestions for better alt text
- `content_simplification`: Content simplification recommendations
- `multimedia_accessibility`: Multimedia accessibility suggestions

---

### Page 5: Interactive Elements

#### Select Dropdown Fields (strings):
- `form_usability`: Form usability ease
  - Possible values: `"very_easy"` | `"somewhat_easy"` | `"hard"` | `"could_not_complete"`
  
- `customization_quality`: Page settings customization quality
  - Possible values: `"very_well"` | `"somewhat_well"` | `"hard_to_use"` | `"no_effect"`
  
- `error_message_clarity`: Error message clarity
  - Possible values: `"very_clear"` | `"somewhat_clear"` | `"unclear"` | `"no_error_message"`
  
- `feedback_clarity`: Feedback/confirmation message clarity
  - Possible values: `"very_clear"` | `"somewhat_clear"` | `"hard_to_understand"` | `"no_feedback"`

#### Textarea Fields (strings):
- `form_barriers`: Form submission barriers
- `missing_customization`: Missing or hard-to-use settings
- `error_message_improvements`: Error message improvement suggestions
- `feedback_improvements`: Confirmation message improvement suggestions
- `keyboard_navigation`: Keyboard navigation issues and accessibility

---

### Page 6: Help & Support

#### Select Dropdown Fields (strings):
- `help_resources_ease`: Ease of finding help resources
  - Possible values: `"very_easy"` | `"somewhat_easy"` | `"hard"` | `"could_not_find"`
  
- `support_options_adequacy`: Support contact option adequacy
  - Possible values: `"very_adequate"` | `"somewhat_adequate"` | `"limited"` | `"none_found"`
  
- `faq_clarity`: FAQ/help article clarity
  - Possible values: `"very_clear"` | `"somewhat_clear"` | `"hard_to_follow"` | `"could_not_read"`
  
- `support_process_accessibility`: Support request process accessibility
  - Possible values: `"very_accessible"` | `"somewhat_accessible"` | `"hard"` | `"could_not_submit"`

#### Textarea Fields (strings):
- `help_resources_location`: Where help was found (location and clicks required)
- `missing_support_options`: Missing or inaccessible contact options
- `help_content_improvements`: Help resource improvement suggestions
- `support_barriers`: Barriers when contacting support
- `overall_support_comment`: Overall support feedback comment

---

### Page 7: Overall Experience

#### Select Dropdown Fields (numeric strings):
- `navigation_rating`: Navigation accessibility rating
  - Possible values: `"1"` to `"5"` (1=Very Poor, 5=Excellent)
  
- `content_rating`: Content accessibility rating
  - Possible values: `"1"` to `"5"`
  
- `interaction_rating`: Interactive elements rating
  - Possible values: `"1"` to `"5"`
  
- `help_rating`: Help & support resources rating
  - Possible values: `"1"` to `"5"`
  
- `overall_rating`: Overall accessibility rating
  - Possible values: `"1"` to `"5"`

#### Select Dropdown Fields (strings):
- `overall_accessibility`: Overall accessibility assessment
  - Possible values: `"excellent"` | `"good"` | `"moderate"` | `"poor"` | `"not_accessible"`

#### Textarea Fields (strings):
- `accessibility_strengths`: Top 3 accessibility strengths
- `positive_features`: Positive aspects of the website
- `priority_improvements`: Top priority improvements needed
- `additional_feedback`: Any additional comments or feedback

---

## Complete Example Request

```json
{
  "formData": {
    "input_method": ["keyboard_mouse", "touch"],
    "content_access": ["visual", "audio"],
    "navigation_pref": ["keyboard", "shortcuts"],
    "challenges": ["time_limits", "small_text"],
    "alternative_improvements": "Use speech recognition",
    "content_improvements": "Clear labeling would help",
    "navigation_improvements": "Better keyboard shortcuts",
    "assistive_tech": "NVDA 2023.1",
    "accessible_features": "Keyboard shortcuts, screen reader support",
    "challenge_improvements": "Extend time limits",
    "barrier_effects": "Causes frustration and slows down navigation",
    "device_type": "desktop",
    "browser": "Chrome 123",
    "os": "Windows 11",
    
    "main_features_ease": "somewhat_easy",
    "main_features_barriers": "Focus indicators were hard to see",
    "contact_info_ease": "very_easy",
    "help_resources_ease": "hard",
    "return_homepage_ease": "somewhat_easy",
    "alternative_navigation": "Use tab key navigation",
    
    "content_clarity": "mostly_clear",
    "updates_ease": "hard",
    "documents_ease": "somewhat_easy",
    "structure_quality": "mostly_well",
    "clarity_barriers": "Technical jargon not explained",
    "alt_text_suggestions": "Add descriptive alt text to product images",
    "content_simplification": "Use bullet points instead of long paragraphs",
    "multimedia_accessibility": "Add captions to videos",
    
    "form_usability": "hard",
    "form_barriers": "Error messages not announced by screen reader",
    "customization_quality": "somewhat_well",
    "missing_customization": "No font size adjustment option",
    "error_message_clarity": "somewhat_clear",
    "error_message_improvements": "Display error next to field",
    "feedback_clarity": "very_clear",
    "feedback_improvements": "Make success messages persist longer",
    "keyboard_navigation": "Some buttons not keyboard accessible",
    
    "support_options_adequacy": "somewhat_adequate",
    "missing_support_options": "No email support option",
    "faq_clarity": "somewhat_clear",
    "support_process_accessibility": "hard",
    "support_barriers": "Contact form not accessible with screen reader",
    
    "navigation_rating": "3",
    "content_rating": "4",
    "interaction_rating": "2",
    "help_rating": "3",
    "overall_rating": "3",
    "overall_accessibility": "moderate",
    "accessibility_strengths": "Good keyboard shortcuts, Clear navigation menus",
    "positive_features": "Well structured headings, Responsive design",
    "priority_improvements": "Fix form accessibility, Add color contrast",
    "additional_feedback": "Overall good effort but needs work on interactive elements",
    
    "page2_completed": true,
    "page2_field_count": 9,
    "page3_completed": true,
    "page3_field_count": 5,
    "page4_completed": true,
    "page4_field_count": 7,
    "page5_completed": true,
    "page5_field_count": 8,
    "page6_completed": true,
    "page6_field_count": 4,
    "page7_completed": true,
    "page7_field_count": 10
  },
  "metadata": {
    "websiteUrl": "https://example.com",
    "submittedAt": "2025-07-01T09:49:27.000Z",
    "reviewVersion": "1.0.2",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
  },
  "complete": true
}
```

---

## Data Processing Flow

### 1. Form Serialization (`serializePageForm()` function)

Located in: `/js/popup.js` (line 980)

**Process**:
1. Collects all form elements (input, select, textarea)
2. Handles different field types appropriately:
   - Checkboxes: Groups multiple selections into arrays
   - Single value fields: String values
3. Returns a flat data object for the current page

**Key Code**:
```javascript
function serializePageForm() {
  const data = {};
  const formElems = document.querySelectorAll('input, select, textarea');
  
  formElems.forEach(el => {
    const key = el.name || el.id;
    if (!key) return;
    
    if (el.type === 'checkbox') {
      if (el.checked) {
        const checkboxValue = el.value || 'on';
        if (data[key]) {
          if (!Array.isArray(data[key])) {
            data[key] = [data[key]];
          }
          data[key].push(checkboxValue);
        } else {
          data[key] = checkboxValue;
        }
      }
    } else if (el.type === 'radio') {
      if (el.checked) data[key] = el.value;
    } else if (el.type === 'select-multiple') {
      const selectedValues = Array.from(el.selectedOptions).map(opt => opt.value);
      if (selectedValues.length > 0) {
        data[key] = selectedValues;
      }
    } else {
      data[key] = el.value;
    }
  });
  
  return data;
}
```

### 2. Session Creation

Located in: `/js/popup.js` (line 1193-1189)

**Process**:
1. User clicks "Start Review" on page 1
2. POST request sent to `/api/submit-review` with empty formData
3. Backend returns `submissionId`
4. Session ID stored in Chrome storage

**Request Structure**:
```javascript
{
  type: 'api',
  url: '${BACKEND_BASE}/submit-review',
  method: 'POST',
  body: { formData: {}, metadata: { websiteUrl } }
}
```

### 3. Form Data Gathering and Flattening

Located in: `/js/popup.js` (line 1341-1443)

**Process**:
1. `gatherAllPages()` retrieves stored data from all 8 pages
2. `gatherRequiredSchemas()` retrieves validation requirements
3. Pre-compute field name collisions (first pass)
4. Process each page's data and apply prefixing if needed (second pass)
5. Add page completion metadata
6. Create flat formData object

**Collision Detection Logic**:
```javascript
// First pass: identify all field names and detect collisions
const fieldCollisions = new Set();
const allFieldNames = new Set();

for (const pageKey in allPages) {
  const pageData = allPages[pageKey];
  for (const fieldName in pageData) {
    if (allFieldNames.has(fieldName)) {
      fieldCollisions.add(fieldName);
    } else {
      allFieldNames.add(fieldName);
    }
  }
}

// Second pass: process data with collision information
for (const pageKey in allPages) {
  const pageData = allPages[pageKey];
  const pageNumber = pageKey.replace('page', '');
  
  for (const fieldName in pageData) {
    const fieldValue = pageData[fieldName];
    
    if (fieldCollisions.has(fieldName)) {
      // Use page-prefixed key to avoid collision
      const prefixedKey = `page${pageNumber}_${fieldName}`;
      formData[prefixedKey] = fieldValue;
    } else {
      // No collision, use original field name
      formData[fieldName] = fieldValue;
    }
  }
}
```

### 4. Final Validation

Located in: `/js/popup.js` (line 2410-2477)

**Process**:
1. Check required fields per page
2. Validate checkbox groups have at least one selection
3. Report missing required fields to user

### 5. Final Submission

Located in: `/js/popup.js` (line 1364-1628)

**Process**:
1. Verify authentication token exists
2. Create request body with formData, metadata, and complete flag
3. Send PUT request to `/api/reviews/{sessionId}`
4. Handle response and provide user feedback
5. Clear local storage on success

**Request**:
```javascript
const body = { formData, metadata, complete: true };
const reqMsg = {
  type: 'api',
  url: `${BACKEND_BASE}/reviews/${currentSessionId}`,
  method: 'PUT',
  body
};
const resp = await sendApi(reqMsg);
```

---

## Error Handling

The extension implements comprehensive error handling:

### HTTP Status Codes Handled:
- **401/403**: Authentication expired, redirect to login
- **404**: Review session not found
- **413**: Payload too large
- **429**: Rate limited (retry with Retry-After header)
- **500-504**: Server errors, queued for offline retry

### Offline Support:
- Failed requests queued in `requestQueue` array
- Persisted to `chrome.storage.local.syncQueue`
- Automatically retried when connection restored
- Flushes queue on 'online' event

---

## File Locations

### Key Implementation Files:

1. **Form Data Serialization**:
   - `/js/popup.js` - `serializePageForm()` (line 980)
   - `/js/popup.js` - `hydratePageForm()` (line 1024)

2. **Session Management**:
   - `/js/popup.js` - `createSession()` (line 1305)
   - `/js/popup.js` - `createSessionIfNeeded()` (line 1124)

3. **Data Gathering & Flattening**:
   - `/js/popup.js` - `gatherAllPages()` (line 1341)
   - `/js/popup.js` - `gatherRequiredSchemas()` (line 1352)
   - `/js/popup.js` - `finalizeSubmission()` (line 1364)

4. **Validation**:
   - `/js/popup.js` - `validateReviewCompleteness()` (line 2410)

5. **Backend Communication**:
   - `/js/background.js` - `doFetch()` (line 70)
   - `/js/background.js` - `fetchAndRespond()` (line 100)
   - `/js/popup.js` - `sendApi()` (line 1631)
   - `/js/popup.js` - `sendWithRetry()` (referenced, handles retries)

6. **Authentication**:
   - `/js/token.js` - Token management functions
   - `/js/auth.js` - Login UI handling

7. **Form Pages**:
   - `/pages/page1.html` - Introduction (no form fields)
   - `/pages/page2.html` - User Profile & Accessibility Needs
   - `/pages/page3.html` - Navigation Tasks
   - `/pages/page4.html` - Content Quality
   - `/pages/page5.html` - Interactive Elements
   - `/pages/page6.html` - Help & Support
   - `/pages/page7.html` - Overall Experience
   - `/pages/page8.html` - Summary & Review

---

## Storage Keys

The extension uses Chrome storage with origin-scoped keys:

- `${currentOrigin}_page${N}`: Form data for page N
- `${currentOrigin}_req_${N}`: Required fields for page N
- `${currentOrigin}_session_id`: Current session ID
- `${currentOrigin}_site_url`: Website URL being reviewed
- `${currentOrigin}_last_page`: Last visited page number
- `${currentOrigin}_receipt`: Submission confirmation timestamp
- `token`: JWT authentication token (not origin-scoped)
- `syncQueue`: Offline request queue
- `backendUrl`: Backend base URL (configurable)

---

## Constants

Located in `/js/popup.js`:

```javascript
const TOTAL_PAGES = 8;
const BACKEND_BASE = 'https://web-production-d801.up.railway.app/api';
const EXT_VERSION = chrome.runtime.getManifest().version; // Currently 1.0.2
```

---

## API Response Expected Format

### Session Creation Response (POST /submit-review):
```json
{
  "submissionId": "uuid-or-id-string"
}
```

### Final Submission Response (PUT /reviews/{sessionId}):
```json
{
  // Server can respond with acknowledgment or success message
  // Status code 200-299 indicates success
}
```

---

## Architecture Notes

1. **Service Worker Communication**: Background script (`background.js`) handles all fetch requests to prevent CORS issues and manage offline queueing.

2. **Origin-Scoped Data**: All form data is stored per website origin to allow multiple concurrent reviews.

3. **Idempotency**: Session creation is idempotent - multiple calls for same origin return same session ID.

4. **Graceful Degradation**: Extension functions even without internet - data queued and synced later.

5. **User Focus**: Form state persists between pages, auto-saves on change, and shows progress.

