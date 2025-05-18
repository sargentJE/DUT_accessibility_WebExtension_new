<div align="center">

# MyVision Accessibility Helper

![Chrome Web Store](https://img.shields.io/badge/Platform-Chrome-4285F4)
![Version](https://img.shields.io/badge/Version-1.0.0-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

**A Chrome Extension for Collecting Structured Accessibility Feedback**

Helping make the web more inclusive through user-driven accessibility testing and feedback collection.  
Designed with accessibility best practices at its core.

[Installation](#installation) • [Features](#features) • [Screenshots](#screenshots) • [Usage](#usage) • [Development](#development) • [License](#license)

</div>

## ✨ Features

- **Multi-page Review Process**: 8-step comprehensive website accessibility review workflow
- **Real-time Form Saving**: Responses save automatically as you type with visual confirmation
- **Centralized Data Collection**: Submit reviews to MyVision's database for aggregation and analysis
- **Accessibility-First Design**: Built with WCAG compliance as a core principle
- **Multiple Theme Options**: Light, dark, high-contrast, and large text modes for diverse needs
- **Consistent UI**: Square corners, custom scrollbars, and visual polish matching Chrome's native styling
- **Offline Support**: Form data is cached and synchronized when connectivity returns
- **Export Functionality**: Download review data in JSON format for personal records
- **Keyboard Navigation**: Tab-friendly interface with focus management and keyboard shortcuts

## 📸 Screenshots

<div align="center">
<img src="https://placeholder-for-screenshot.png" alt="Light Mode UI" width="300"/>
<img src="https://placeholder-for-screenshot.png" alt="Dark Mode UI" width="300"/>
</div>

<div align="center">
<p><em>Replace the placeholder images with actual screenshots of your extension.</em></p>
</div>

## 🏗️ Architecture

The extension is built using a modular component approach with vanilla JavaScript and CSS variables for theming:

```text
chrome-extension-css/
├── css/                     # Modular CSS architecture
│   ├── popup.css            # Main CSS file that imports all others
│   ├── base.css             # Base styles, design tokens, typography
│   ├── components.css       # UI components (buttons, cards, inputs)
│   ├── forms.css            # Form-specific styling and validation
│   ├── layout.css           # Structural layout and containers
│   ├── modal.css            # Modal and popup styling
│   ├── themes.css           # Theme definitions (light, dark, high-contrast)
│   ├── utilities.css        # Helper classes and utilities
│   └── review-steps.css     # Multi-step review process styling
├── js/                      # JavaScript modules
│   ├── popup.js             # Main extension functionality
│   ├── background.js        # Service worker for background operations
│   ├── auth.js              # Authentication handling
│   └── settings.js          # User preferences management
├── pages/                   # Review workflow
│   ├── page1.html           # Introduction
│   └── page2-8.html         # Step-by-step review pages
├── icons/                   # Extension assets
├── manifest.json            # Chrome extension configuration (v3)
└── various HTML pages       # Popup, settings, help, etc.
```

## 🚀 Installation

### Local Development

```bash
# Clone the repository
git clone https://github.com/myvision/accessibility-helper.git
cd accessibility-helper

# Open Chrome Extensions page
chrome://extensions
```

1. Enable **Developer mode** in the top-right corner
2. Click **Load unpacked** and select the extension directory
3. The extension icon will appear in your Chrome toolbar

### For Users

1. Visit the [Chrome Web Store](https://chrome.google.com/webstore/)
2. Search for "MyVision Accessibility Helper"
3. Click **Add to Chrome**

### Building for Production

```bash
# Package the extension (excludes dev files)
zip -r accessibility-helper-prod.zip . -x "*.git*" "*.DS_Store" "*node_modules*" "*.vscode*"
```

## 🔌 API Integration

### Backend Configuration

The extension communicates with a REST API endpoint for data storage and retrieval. The current production endpoint is:

```
https://web-production-d801.up.railway.app/api/
```

To modify this configuration for your own deployment:

1. Open `manifest.json` and update the `host_permissions` array
2. Open `js/popup.js` and modify the `BACKEND_BASE` constant

### Authentication Flow

The extension implements a JWT-based authentication flow:

1. User logs in via the extension login page
2. Authentication token is stored in Chrome storage
3. Subsequent API requests include the token in Authorization headers
4. Expired tokens trigger automatic logout

## 📋 Usage Guide

### Starting a Review

1. Navigate to the website you want to evaluate
2. Click the MyVision extension icon in your Chrome toolbar
3. Sign in with your MyVision credentials if prompted
4. Read the introduction and click **Next** to begin

### Step-by-Step Process

The review workflow consists of 8 progressive steps:

1. **Introduction**: Overview and purpose
2. **Website Usage**: How you typically use the site
3. **Navigation**: Ease of finding information
4. **Content Access**: Text, images, and media accessibility
5. **Interactive Elements**: Forms, buttons, and controls
6. **Help & Support**: Availability of assistance
7. **Overall Experience**: General impressions and rating
8. **Submission**: Review and submit your feedback

### Customizing Your Experience

<table>
  <tr>
    <td><b>Theme</b></td>
    <td>Toggle between Light, Dark, and High Contrast modes</td>
  </tr>
  <tr>
    <td><b>Font Size</b></td>
    <td>Adjust text size for better readability</td>
  </tr>
  <tr>
    <td><b>Export</b></td>
    <td>Download your review data as JSON</td>
  </tr>
  <tr>
    <td><b>Settings</b></td>
    <td>Configure frequency and notifications</td>
  </tr>
</table>

## ♿ Accessibility

This extension follows WCAG 2.1 AA guidelines and includes:

- **Keyboard Navigation**: Full keyboard accessibility with visible focus states
- **Screen Reader Compatibility**: Semantic HTML and proper ARIA attributes
- **Color Contrast**: All text meets WCAG AA contrast requirements
- **Flexible Text Sizing**: Supports browser zoom and custom text size settings
- **Focus Management**: Proper focus handling in modals and dynamic content
- **Reduced Motion**: Respects user preference for reduced animation
- **Alternative Text**: All UI elements have proper text alternatives
- **Skip Navigation**: Keyboard shortcut to bypass repetitive elements
- **Error Identification**: Form errors are clearly identified and described

## 🔧 Technical Details

### Built With

- **Manifest V3**: Latest Chrome extension platform
- **Vanilla JavaScript**: No frameworks or dependencies
- **CSS Custom Properties**: For theming and consistent styling
- **Chrome Storage API**: For persistent data across browser sessions
- **Fetch API**: For RESTful server communication
- **Service Worker**: For background processing and offline support

### Browser Support

- **Chrome/Chromium**: v88+
- **Microsoft Edge**: v88+ (Chromium-based)
- **Opera**: v74+ (Chromium-based)

## 👩‍💻 Developer Guide

### Environment Setup

```bash
# Recommended tools
Chrome Browser
Visual Studio Code with these extensions:
- ESLint
- Prettier
- Chrome Debugger
```

### Key Development Areas

#### CSS Customization

The styling system uses a modular approach with CSS variables for consistency:

```css
/* Example from base.css */
:root {
  --color-primary: #0072bb;     /* MyVision blue */
  --color-primary-dark: #005a96; /* Darker blue for hover states */
  --font-size-base: 1rem;        /* 16px base font size */
  /* ... */
}
```

To modify themes, edit the class definitions in `themes.css`.

#### JavaScript Patterns

The extension uses modular patterns and promises for asynchronous operations:

```javascript
// Example promise-based storage access
function loadThemeSettings() {
  return new Promise(resolve => {
    chrome.storage.sync.get(['theme', 'fontSize'], 
      ({ theme = 'light', fontSize = 'medium' }) => {
        applyTheme(theme);
        applyFontSize(fontSize);
        resolve();
    });
  });
}
```

## 🔐 Security & Privacy

### Required Permissions

| Permission | Purpose |
|------------|----------|
| `storage` | Save user preferences and form responses |
| `activeTab` | Access the current tab's URL for review context |
| `tabs` | Get metadata about the website being reviewed |
| `downloads` | Allow exporting review data as JSON |
| `host_permissions` | Connect to the MyVision API server |

### Data Handling

- All user data is stored securely using Chrome's storage API
- API communication uses HTTPS with JWT authentication
- Sensitive data is never stored in local storage
- Users can export or delete their data at any time

## 🔍 Troubleshooting

### Common Issues

<details>
<summary><b>Extension doesn't appear in toolbar</b></summary>

- Check that the extension is enabled in Chrome Extensions page
- Verify that manifest.json is valid and has the correct "action" configuration
- Look for JavaScript errors in the background script
</details>

<details>
<summary><b>Form data not saving</b></summary>

- Verify storage permissions in manifest.json
- Check Chrome's console for error messages
- Clear browser cache and reload extension
</details>

<details>
<summary><b>API connection failures</b></summary>

- Confirm your internet connection is active
- Verify the backend URL in BACKEND_BASE is correct
- Check that your authentication token is valid
- Look for CORS errors in the console
</details>

### Debugging Tips

```bash
# Inspect the extension popup
Right-click extension icon → Inspect Popup

# View background script logs
Chrome Extensions → Find this extension → Inspect views: service worker

# Check storage contents
DevTools → Application → Storage → Chrome Storage
```

## 👥 Contributing

Contributions are welcome! Here's how you can help:

1. **Report Bugs**: Create an issue describing the bug and steps to reproduce
2. **Suggest Features**: Submit an issue with your feature request
3. **Submit Pull Requests**: Follow these steps:
   - Fork the repository and clone locally
   - Create a feature branch (`git checkout -b feature/amazing-feature`)
   - Commit your changes with descriptive messages
   - Push to your branch and open a Pull Request

Please adhere to our code style and include appropriate tests.

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

## 🙏 Acknowledgements

- [MyVision Oxfordshire](https://www.myvision.org.uk/) for accessibility expertise and design guidance
- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/) for development resources
- [W3C Web Accessibility Initiative](https://www.w3.org/WAI/) for accessibility standards
- All contributors who have helped improve this extension

---

<div align="center">
<p>Made with ❤️ by the MyVision Accessibility Team</p>
</div>
