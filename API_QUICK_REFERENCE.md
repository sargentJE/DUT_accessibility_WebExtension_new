# Backend Data Schema - Quick Reference Guide

## API Endpoints at a Glance

```
POST /api/submit-review
├─ Creates review session
├─ Payload: { formData: {}, metadata: { websiteUrl } }
└─ Response: { submissionId: "..." }

PUT /api/reviews/{sessionId}
├─ Submits completed review
├─ Payload: { formData: {...}, metadata: {...}, complete: true }
└─ Response: 200-299 = Success
```

---

## Request Payload Structure

```javascript
{
  formData: {
    // All form fields (flattened, single object)
    // ~60+ fields from pages 2-7
    // See field reference below
  },
  metadata: {
    websiteUrl: "string",           // URL being reviewed
    submittedAt: "ISO-8601",        // When submitted
    reviewVersion: "1.0.2",         // Extension version
    userAgent: "string"             // Browser user agent
  },
  complete: true
}
```

---

## Field Reference by Type

### Checkbox Groups (Arrays)
- `input_method`: How user interacts
  - Values: keyboard_mouse, touch, voice, alternative, switch
  
- `content_access`: Information access methods
  - Values: visual, audio, enlarged, simplified, high_contrast
  
- `navigation_pref`: Navigation methods
  - Values: keyboard, sequential, search, shortcuts
  
- `challenges`: Accessibility barriers
  - Values: time_limits, complex_navigation, inconsistent_layouts, multimedia, small_text, poor_contrast, unclear_instructions, distractions, compatibility

### Single-Select Dropdowns (Strings)

**Ease/Difficulty Ratings**:
- Values: "very_easy" | "somewhat_easy" | "hard" | "could_not_do"
- Fields: main_features_ease, contact_info_ease, help_resources_ease, return_homepage_ease, updates_ease, documents_ease, form_usability, error_message_clarity, feedback_clarity, faq_clarity, support_process_accessibility

**Quality/Satisfaction Ratings**:
- Values: "very_clear" | "mostly_clear" | "hard_to_follow" | "could_not_understand"
- Fields: content_clarity

- Values: "very_well" | "mostly_well" | "poorly" | "very_confusing"
- Fields: structure_quality

**Support/Help Ratings**:
- Values: "very_adequate" | "somewhat_adequate" | "limited" | "none_found"
- Fields: support_options_adequacy

**Customization Quality**:
- Values: "very_well" | "somewhat_well" | "hard_to_use" | "no_effect"
- Fields: customization_quality

**Help/Support Clarity**:
- Values: "very_accessible" | "somewhat_accessible" | "hard" | "could_not_submit"
- Fields: support_process_accessibility

**Overall Experience Ratings** (numeric 1-5):
- Fields: navigation_rating, content_rating, interaction_rating, help_rating, overall_rating
- Values: "1" | "2" | "3" | "4" | "5"

**Overall Accessibility**:
- Values: "excellent" | "good" | "moderate" | "poor" | "not_accessible"
- Fields: overall_accessibility

### Radio Buttons (Single Value Strings)
- `device_type`: "desktop" | "laptop" | "tablet" | "smartphone"

### Text/Textarea Fields (Strings)
- `assistive_tech`: Assistive technology description
- `browser`: Browser name/version
- `os`: Operating system
- `alternative_improvements`: Alternative input methods
- `content_improvements`: Content presentation improvements
- `navigation_improvements`: Navigation improvements
- `accessible_features`: Accessible features user relies on
- `challenge_improvements`: How to address challenges
- `barrier_effects`: Effects of barriers
- `main_features_barriers`: Navigation barriers
- `contact_info_barriers`: Contact finding barriers
- `help_resources_location`: Where help was found
- `return_homepage_barriers`: Homepage return barriers
- `alternative_navigation`: Alternative navigation suggestions
- `clarity_barriers`: Content clarity barriers
- `updates_barriers`: Update finding barriers
- `documents_barriers`: Document access barriers
- `structural_issues`: Structure problems
- `alt_text_suggestions`: Alt text recommendations
- `content_simplification`: Content simplification suggestions
- `multimedia_accessibility`: Multimedia accessibility suggestions
- `form_barriers`: Form submission barriers
- `missing_customization`: Missing customization options
- `error_message_improvements`: Error message improvements
- `feedback_improvements`: Feedback message improvements
- `keyboard_navigation`: Keyboard navigation issues
- `missing_support_options`: Missing support options
- `help_content_improvements`: Help content improvements
- `support_barriers`: Support contact barriers
- `overall_support_comment`: Overall support feedback
- `accessibility_strengths`: Top accessibility strengths
- `positive_features`: Positive website aspects
- `priority_improvements`: Top priority improvements
- `additional_feedback`: Any additional comments

---

## Page Completion Metadata

For each page 2-7 with data:
- `page{N}_completed`: true (boolean)
- `page{N}_field_count`: number (integer)

Example:
```json
{
  "page2_completed": true,
  "page2_field_count": 8,
  "page3_completed": true,
  "page3_field_count": 5,
  ...
}
```

---

## File Locations Quick Map

| Functionality | File | Function | Line |
|---------------|------|----------|------|
| Form Serialization | /js/popup.js | serializePageForm() | 980 |
| Form Deserialization | /js/popup.js | hydratePageForm() | 1024 |
| Session Creation | /js/popup.js | createSessionIfNeeded() | 1124 |
| Data Gathering | /js/popup.js | gatherAllPages() | 1341 |
| Final Submission | /js/popup.js | finalizeSubmission() | 1364 |
| Validation | /js/popup.js | validateReviewCompleteness() | 2410 |
| Backend Fetch | /js/background.js | doFetch() | 70 |
| API Response Handler | /js/background.js | fetchAndRespond() | 100 |
| Authentication | /js/token.js | getToken(), saveToken() | - |
| Login | /js/auth.js | - | - |

---

## HTTP Methods & Status Codes

### Requests Made
- **POST** `/api/submit-review` - Create session
- **PUT** `/api/reviews/{sessionId}` - Submit final data
- **POST** `/api/auth/login` - User authentication

### Status Codes Handled
- **200-299**: Success
- **401/403**: Auth expired → redirect to login
- **404**: Session not found
- **413**: Payload too large
- **429**: Rate limited → retry with Retry-After
- **500-504**: Server error → queue for offline sync

---

## Authentication

```javascript
Authorization: Bearer {JWT_TOKEN}
```

Token stored in: `chrome.storage.local.token`
Retrieved via: `getToken()` function
Retrieved from: Login form at `/login.html`

---

## Total Fields Count

- **Page 2**: 9 text + 4 checkbox groups + 1 radio + 2 single = ~16 fields
- **Page 3**: 4 select + 5 textarea = 9 fields
- **Page 4**: 4 select + 7 textarea = 11 fields
- **Page 5**: 4 select + 5 textarea = 9 fields
- **Page 6**: 4 select + 5 textarea = 9 fields
- **Page 7**: 6 select + 4 textarea = 10 fields
- **Metadata fields**: 4 fields (websiteUrl, submittedAt, reviewVersion, userAgent)
- **Page completion**: up to 12 fields (6 pages × 2 fields each)

**Total possible fields per submission**: ~80-90 fields

---

## Data Flow Diagram

```
1. User starts review (Page 1)
   ↓
2. POST /api/submit-review
   Response: { submissionId: "..." }
   ↓
3. User fills pages 2-7 (auto-saves)
   Each page stored in chrome.storage.sync
   ↓
4. User submits (Page 8)
   ↓
5. gatherAllPages() - combine all pages
   ↓
6. validateReviewCompleteness() - check required fields
   ↓
7. Flatten data structure (handle key collisions)
   ↓
8. PUT /api/reviews/{sessionId}
   Payload: { formData, metadata, complete: true }
   ↓
9. Success: Clear storage, show confirmation
   Failure: Queue for offline retry
```

---

## Example: Minimal Complete Submission

```json
{
  "formData": {
    "input_method": ["keyboard_mouse"],
    "content_access": ["visual"],
    "navigation_pref": ["keyboard"],
    "challenges": ["small_text"],
    "device_type": "desktop",
    "browser": "Chrome",
    "os": "Windows",
    "main_features_ease": "somewhat_easy",
    "contact_info_ease": "hard",
    "help_resources_ease": "very_easy",
    "return_homepage_ease": "easy",
    "content_clarity": "mostly_clear",
    "updates_ease": "hard",
    "documents_ease": "somewhat_easy",
    "structure_quality": "mostly_well",
    "form_usability": "hard",
    "customization_quality": "somewhat_well",
    "error_message_clarity": "somewhat_clear",
    "feedback_clarity": "very_clear",
    "support_options_adequacy": "limited",
    "faq_clarity": "somewhat_clear",
    "support_process_accessibility": "hard",
    "navigation_rating": "3",
    "content_rating": "3",
    "interaction_rating": "2",
    "help_rating": "2",
    "overall_rating": "3",
    "overall_accessibility": "moderate",
    "accessibility_strengths": "Good keyboard support",
    "positive_features": "Clear structure",
    "priority_improvements": "Add better color contrast",
    "additional_feedback": "Generally usable",
    "page2_completed": true,
    "page2_field_count": 4,
    "page3_completed": true,
    "page3_field_count": 4,
    "page4_completed": true,
    "page4_field_count": 4,
    "page5_completed": true,
    "page5_field_count": 4,
    "page6_completed": true,
    "page6_field_count": 4,
    "page7_completed": true,
    "page7_field_count": 6
  },
  "metadata": {
    "websiteUrl": "https://example.com",
    "submittedAt": "2025-07-01T09:49:27.000Z",
    "reviewVersion": "1.0.2",
    "userAgent": "Mozilla/5.0 ..."
  },
  "complete": true
}
```

---

## Key Implementation Notes

1. **Flattened Structure**: All form data goes into single `formData` object, not nested by page
2. **Key Collisions**: Auto-detected and prefixed with `page{N}_` only when needed
3. **Origin-Scoped**: Each website origin gets its own session and stored data
4. **Auto-Save**: Form data auto-saves on change to `chrome.storage.sync`
5. **Offline Support**: Failed requests queued in `chrome.storage.local.syncQueue`
6. **Validation**: Required fields checked before submission; user informed of gaps
7. **JWT Auth**: All requests include Bearer token in Authorization header
8. **Completion Tracking**: Page completion metadata added automatically
9. **Idempotent Sessions**: Multiple requests to create session return same ID
10. **CORS Handled**: Background script manages all fetch requests

