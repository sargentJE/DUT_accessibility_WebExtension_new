# Accessibility Helper Chrome Extension

A Chrome extension that guides users through a structured accessibility review process and provides feedback about website accessibility. This extension follows the MyVision Oxfordshire design patterns with a focus on accessibility.

## Features

- **Multi-page Review Process**: 8-step comprehensive website accessibility review
- **Automatic Form Saving**: Responses are saved automatically as you type
- **Centralized Data Storage**: Submit reviews to a central server for aggregation and analysis
- **Accessibility-First Design**: Built with accessibility as a core principle
- **Customizable Themes**: Light, dark, high contrast, and large text modes
- **Responsive Design**: Adapts to different screen sizes and orientations

## Directory Structure

```
accessibility-helper/
├── css/                     # CSS files
│   ├── popup.css            # Main CSS file that imports all others
│   ├── base.css             # Base styles, design tokens, typography
│   ├── components.css       # UI components like buttons, cards, forms
│   ├── forms.css            # Form-specific styles
│   ├── layout.css           # Layout structure
│   ├── themes.css           # Light, dark, high contrast themes
│   ├── utilities.css        # Utility classes
│   ├── review-steps.css     # Styles for the 8-step review process
│   └── content.css          # Content script styles
├── js/                      # JavaScript files
│   ├── popup.js             # Main popup functionality
│   ├── background.js        # Background script
│   └── content.js           # Content script
├── pages/                   # Multi-page review process
│   ├── page1.html           # Introduction
│   ├── page2.html           # Website Usage Preferences
│   ├── page3.html           # Website Navigation
│   ├── page4.html           # Content Access
│   ├── page5.html           # Interactive Features
│   ├── page6.html           # Help and Support
│   ├── page7.html           # Overall Experience
│   └── page8.html           # Completion
├── icons/                   # Extension icons
│   └── README.md            # Instructions for creating icons
├── manifest.json            # Extension configuration
├── popup.html               # Main popup entry point
├── about.html               # About page
├── help.html                # Help page
├── settings.html            # Settings page
├── onboarding.html          # Onboarding page
└── README.md                # This file
```

## Installation

### For Development

1. Clone or download this repository to your local machine
2. Add proper icon files to the `icons` directory (follow instructions in icons/README.md)
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" by toggling the switch in the top right
5. Click "Load unpacked" and select the extension directory
6. The extension should now appear in your toolbar

### For Production

1. Create a ZIP file containing all necessary files (excluding development files)
2. Submit to the Chrome Web Store following their developer guidelines

## Backend Server Integration

This extension is designed to work with a backend server for centralized data storage. The server code is available in a separate repository.

### Server Configuration

By default, the extension is configured to communicate with a server at `http://localhost:3000`. To change this:

1. Open `js/popup.js`
2. Find the line with `const serverUrl = 'http://localhost:3000/api/submit-review';`
3. Update this URL to point to your server
4. Also update the `host_permissions` in `manifest.json` to include your server domain

## Usage

### Conducting an Accessibility Review

1. Navigate to the website you want to review
2. Click the extension icon to open the popup
3. Read the introduction page and click "Next" to start
4. Complete each page of the review process:
   - Website Usage Preferences
   - Website Navigation
   - Content Access
   - Interactive Features
   - Help and Support
   - Overall Experience
5. On the Completion page, click "Submit" to send your feedback to the server

### Customization Options

Access the settings by clicking the gear icon (⚙️) in the popup:

- **Dark Mode**: Toggle between light and dark themes
- **High Contrast**: Enable high contrast mode for better visibility
- **Font Size**: Adjust text size for better readability
- **Reset Data**: Clear all saved review responses

## Accessibility Features

- **Keyboard Navigation**: Full keyboard accessibility with focus management
- **Screen Reader Support**: Proper ARIA attributes and semantic HTML
- **Multiple Themes**: Support for various visual preferences
- **Focus Indicators**: Clear visual focus indicators for keyboard users
- **Skip Links**: Allow keyboard users to skip navigation
- **Form Validation**: Accessible error messages and validation
- **Automatic Saving**: Prevents data loss

## Technology Stack

- **HTML5**: Semantic markup for better accessibility
- **CSS3**: Modular CSS architecture with variables
- **JavaScript**: ES6+ for enhanced functionality
- **Chrome Extension API**: For browser integration
- **RESTful API**: For backend server communication

## Development

### Prerequisites

- Basic knowledge of HTML, CSS, and JavaScript
- Chrome browser for testing
- Text editor or IDE (VS Code recommended)

### Modifying CSS

The CSS follows a modular structure:
- `base.css`: Edit to change colors, typography, spacing, etc.
- `components.css`: Modify UI components
- `themes.css`: Add or modify themes
- `review-steps.css`: Adjust the multi-step review UI

<!-- Removed obsolete 'Adding Pages' section -->

### Form Processing

Form data is automatically saved to Chrome storage as users type. To modify the data processing:

1. Edit the `saveFormData()` and `loadFormData()` functions in `popup.js`
2. Update the `setupFormTracking()` function to handle new form elements if needed
3. Modify the `submitDataToServer()` function to change what data is sent to the server

## Permissions

This extension requires the following permissions:

- `storage`: To save form responses locally
- `activeTab`: To interact with the current tab
- `tabs`: To get the URL of the website being reviewed
- `host_permissions`: To communicate with the backend server

## Troubleshooting

### Common Issues

1. **Extension not loading**: Check that all required files are present and manifest.json is valid
2. **Form data not saving**: Verify Chrome storage permissions are granted
3. **Cannot submit reviews**: Check server connection and URL configuration
4. **Styling issues**: Verify CSS files are properly imported in popup.css

### Debugging

1. Right-click the extension icon and select "Inspect popup"
2. Use Chrome DevTools to debug JavaScript and inspect elements
3. Check the Console tab for error messages
4. Use the Application tab to examine Chrome storage

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgements

- MyVision Oxfordshire for design patterns and accessibility guidance
- The Chrome Extensions team for their comprehensive documentation
- All contributors who have helped improve this extension
