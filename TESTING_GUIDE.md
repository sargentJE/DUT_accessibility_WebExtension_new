# Testing Guide

This guide outlines the testing procedures for the MyVision Accessibility Helper Chrome Extension.

## 🔧 Critical Fix: Duplicate Review Prevention

**Issue Fixed**: Users could bypass session creation by clicking "Next" or numbered navigation buttons instead of "Start Review", leading to duplicate database entries.

**Solution**: All navigation methods from Page 1 now ensure session creation:
- ✅ "Start Review" button (existing)
- ✅ "Next" button (fixed) 
- ✅ Bottom navigation numbers 2-8 (fixed)

**Result**: Guaranteed single review per session, eliminating duplicates.

---

### Session Creation Flow Tests

**Test 1: Normal Flow**
1. Go to any website
2. Open extension popup
3. Click "Start Review" on Page 1
4. Fill out review forms on Pages 2-8
5. Submit final review
6. **Verify**: Only ONE review created in database with progression from "pending" to "submitted"

**Test 2: Page Refresh During Review**
1. Start review process, reach Page 3
2. Refresh the browser page
3. Reopen extension popup
4. **Verify**: Session ID restored from storage, can continue review
5. Complete review
6. **Verify**: Only ONE review in database

**Test 3: Offline/Online Transition**
1. Start review, go offline during Page 4
2. Continue filling forms (should save locally)
3. Go back online
4. **Verify**: Pending data flushes to same session
5. Complete review
6. **Verify**: Only ONE review in database

**Test 4: Rapid Form Interactions**
1. Start review
2. Quickly type in multiple form fields within 1-2 seconds
3. **Verify**: No duplicate sessions created
4. Complete review normally

**Test 5: Multiple Websites**
1. Test on Website A, complete review
2. Test on Website B, complete review  
3. **Verify**: Two separate reviews, each with only one database entry

**Test 6: Page 1 Navigation Methods**
1. Go to any website, open extension popup (should be on Page 1)
2. **Sub-test 6a - Start Review Button**: Click "Start Review" button
3. **Verify**: Session created, navigated to Page 2
4. **Sub-test 6b - Next Button**: Refresh, click "Next" button instead
5. **Verify**: Session created, navigated to Page 2  
6. **Sub-test 6c - Bottom Navigation**: Refresh, click "2" in bottom navigation
7. **Verify**: Session created, navigated to Page 2
8. **Sub-test 6d - Higher Page Navigation**: Refresh, click "5" in bottom navigation
9. **Verify**: Session created, navigated to Page 5
10. Complete any test and **Verify**: Only ONE review in database

**Test 7: Session Consistency**
1. Start review using any method from Test 6
2. Navigate between pages using different methods (Next button, bottom nav numbers)
3. **Verify**: All navigation uses the same session ID throughout
4. Complete review
5. **Verify**: Only ONE review in database with consistent session ID

## Debugging Session Creation

### Browser Console Verification
To verify session creation is working properly:

1. **Open Browser DevTools**: Press F12 or right-click → Inspect
2. **Go to Console tab**
3. **Perform any navigation from Page 1**
4. **Look for these log messages**:
   - `"Start Review button clicked - creating session..."` (for Start Review button)
   - `"Next button clicked on Page 1 - creating session..."` (for Next button) 
   - `"Bottom navigation clicked from Page 1 to Page X - ensuring session exists"` (for numbered nav)
   - `"Review session started successfully: [session-id]"` (session creation success)
   - `"Session created successfully: [session-id]"` (alternative success message)

### Chrome Storage Verification
To check if session is stored properly:

1. **Open DevTools** → **Application** tab → **Storage** section
2. **Navigate to**: Extensions → [Extension ID] → Local/Session Storage
3. **Look for keys**: `[origin]_sessionId` with a UUID value
4. **Verify**: Same session ID appears in console logs and storage

### Database Verification
Check MongoDB directly for duplicate prevention:

1. **Run database query** for the test website
2. **Count entries** with same website URL but different submission IDs
3. **Expected result**: Only ONE review per completed session

## Test Environment Setup

## How to Verify the Serialization Fixes Work

### 1. Load the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked" and select the `/Users/jamiesargent/Desktop/chrome-extension-css` folder
4. The extension should appear in your extensions list

### 2. Test on a Real Website

1. Navigate to any website (or use the provided `test-extension-context.html`)
2. Click the extension icon or use the keyboard shortcut `Alt+Shift+A`
3. The extension popup should open

### 3. Test Serialization (Page 2)

1. Navigate to Page 2 in the extension
2. Select multiple checkboxes in the "Input Methods" section:
   - ✅ Keyboard and mouse
   - ✅ Touch/tap
   - ✅ Voice commands
3. Select multiple checkboxes in "Content Access Preferences":
   - ✅ Visual content
   - ✅ Audio content
4. Fill out some text fields
5. Select a device type (radio button)

### 4. Verify Console Output

1. Open Chrome DevTools (F12)
2. Go to the Console tab
3. Look for these log messages:

```javascript
// When navigating between pages, you should see:
"Saving form data for page: 2"
"Form data saved: {input_method: ['keyboard_mouse', 'touch', 'voice'], ...}"

// When the extension loads saved data:
"Hydrating form with data: {input_method: ['keyboard_mouse', 'touch'], ...}"

// During final submission:
"Flattened form data for submission: {input_method: ['keyboard_mouse', 'touch'], ...}"
```

### 5. Expected Data Structure

The console should show checkbox groups as **arrays**, not single values:

✅ **CORRECT:**
```json
{
  "input_method": ["keyboard_mouse", "touch", "voice"],
  "content_access": ["visual", "audio"],
  "device_type": "desktop"
}
```

❌ **INCORRECT (old behavior):**
```json
{
  "input_method": "voice",  // Only last selected value
  "content_access": "audio", // Only last selected value
  "device_type": "desktop"
}
```

### 6. Test Hydration (Form Restoration)

1. Fill out Page 2 with multiple checkbox selections
2. Navigate to Page 3, then back to Page 2
3. Verify that ALL your checkbox selections are still checked
4. This confirms hydration is working correctly

### 7. Test Edge Cases

1. **Checkboxes without values**: Should serialize as `"on"`
2. **Empty form fields**: Should be ignored (not included in data)
3. **Inputs without names**: Should be ignored
4. **Multi-select elements**: Should serialize as arrays (if any exist in your forms)

### 8. Test Final Submission

1. Complete the entire form across all pages
2. On the final page, click "Submit Review"
3. Check the console for the final submission data
4. Verify the structure matches the schema in `DATA_SCHEMA.md`

## Automated Testing

You can also run the automated test suite:

1. Open `test-serialization.html` in your browser
2. Click each test button:
   - ✅ Serialization Test
   - ✅ Hydration Test  
   - ✅ Edge Cases Test
   - ✅ Collision Detection Test
   - ✅ Validation Test
3. All tests should pass with green checkmarks

## Common Issues to Watch For

### ❌ Data Loss Issues (Fixed)
- Checkbox groups losing multiple selections
- Multi-select elements not being restored
- Form data being overwritten between pages

### ❌ Serialization Issues (Fixed)
- Arrays being converted to single values
- Checkboxes without values causing errors
- Inputs without names being included incorrectly

### ❌ Hydration Issues (Fixed)
- Form not restoring previous selections
- Multi-select elements not being populated
- Checkbox groups not being checked correctly

## Success Criteria

✅ **All checkbox groups serialize as arrays**
✅ **Form data persists when navigating between pages**
✅ **Multi-select elements work correctly**
✅ **Edge cases are handled gracefully**
✅ **Final submission contains complete, properly structured data**
✅ **No JavaScript errors in console**
✅ **All automated tests pass**

## Troubleshooting

If you encounter issues:

1. **Check the Console**: Look for error messages or warnings
2. **Verify Extension Loading**: Make sure the extension loaded without errors
3. **Test Individual Functions**: Use the test HTML files to isolate issues
4. **Check Network Tab**: Verify API calls are being made correctly
5. **Review Data Schema**: Compare actual output with expected schema

The extension should now handle all form types correctly and provide robust data serialization for the backend API.
