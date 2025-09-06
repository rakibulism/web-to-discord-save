# Web to Discord Save

A browser extension that allows you to save social media posts from Twitter, Instagram, Dribbble, Facebook, and LinkedIn directly to your Discord channels with intelligent keyword-based routing.

## Features

- 🎯 **Smart Post Detection**: Automatically detects posts on social media platforms
- 🏷️ **Keyword-Based Routing**: Select up to 2 keywords to route posts to specific Discord channels
- ⌨️ **Keyboard Shortcuts**: Use `Ctrl+Shift+S` (or `Cmd+Shift+S` on Mac) for quick access
- 🎨 **Beautiful UI**: Pinterest/Cosmos-style modal interface
- 🔗 **Rich Embeds**: Sends posts as rich Discord embeds with author info, media, and metadata
- ⚡ **Instant Save**: Hover over any post and click the save button
- 🔄 **Auto-Routing**: Posts are automatically sent to channels based on your keyword mappings

## Supported Platforms

- Twitter/X
- Instagram
- Dribbble
- Facebook
- LinkedIn

## Installation

### For Development

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/web-to-discord-save.git
   cd web-to-discord-save
   ```

2. Load the extension in your browser:
   - **Chrome/Edge**: Go to `chrome://extensions/`, enable "Developer mode", click "Load unpacked", and select the project folder
   - **Firefox**: Go to `about:debugging`, click "This Firefox", click "Load Temporary Add-on", and select the `manifest.json` file

### For Production

1. Download the latest release from the [Releases page](https://github.com/yourusername/web-to-discord-save/releases)
2. Extract the ZIP file
3. Load the extension in your browser using the same steps as above

## Setup

The extension is pre-configured with a Discord webhook and ready to use immediately!

### Start Saving Posts

1. Browse any supported social media platform
2. Hover over a post you want to save
3. Click the save button that appears
4. Select up to 2 keywords to categorize the post
5. Click "Save to Discord"

## Usage

### Method 1: Hover and Click
1. Hover over any social media post
2. Click the save button that appears in the top-right corner
3. Select keywords and save

### Method 2: Keyboard Shortcut
1. Hover over a post
2. Press `Ctrl+Shift+S` (Windows/Linux) or `Cmd+Shift+S` (Mac)
3. Select keywords and save

## Keyword System

The extension comes with predefined keywords that you can map to Discord channels:

- **Design**: `design`, `ui`, `ux`, `illustration`, `art`
- **Development**: `frontend`, `backend`, `mobile`, `web`
- **Media**: `photography`, `video`, `animation`
- **Business**: `marketing`, `business`, `startup`, `tech`
- **Learning**: `tutorial`, `tips`, `resources`, `inspiration`

### Keyword System

Posts are automatically sent to the configured Discord channel with keyword tags. The extension extracts and categorizes posts based on the keywords you select, making it easy to organize your saved content.

## How It Works

1. **Post Detection**: The extension scans the page for social media posts using platform-specific selectors
2. **Data Extraction**: Extracts post title, description, author, media URLs, and post URL
3. **Keyword Selection**: User selects up to 2 keywords to categorize the post
4. **Channel Routing**: Posts are sent to channels based on keyword mappings
5. **Rich Embed**: Creates a beautiful Discord embed with all post information

## Data Extracted

For each saved post, the extension extracts:
- Post title/description
- Author name and profile URL
- Original post URL
- Media URLs (images, videos)
- Platform information
- Timestamp

## Privacy

- The extension only processes posts you explicitly choose to save
- No data is collected or stored by the extension
- All data is sent directly to your Discord server via webhook
- No third-party services are involved

## Development

### Project Structure

```
web-to-discord-save/
├── manifest.json          # Extension manifest
├── src/
│   ├── background.js      # Background script for Discord integration
│   ├── content.js         # Content script for post detection
│   ├── content.css        # Styles for hover buttons and modal
│   ├── popup.html         # Settings popup HTML
│   ├── popup.css          # Settings popup styles
│   └── popup.js           # Settings popup logic
├── package.json           # Project configuration
└── README.md             # This file
```

### Building

No build process is required. The extension uses vanilla JavaScript and can be loaded directly.

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Troubleshooting

### Webhook Not Working
- The extension is pre-configured with a working webhook
- If issues persist, check your Discord server permissions

### Posts Not Detected
- Refresh the page
- Make sure you're on a supported platform
- Check that the post has visible content

### Extension Not Loading
- Make sure you're using a supported browser
- Check the browser console for errors
- Try reloading the extension

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have feature requests, please [open an issue](https://github.com/yourusername/web-to-discord-save/issues) on GitHub.

## Changelog

### v1.0.0
- Initial release
- Support for Twitter, Instagram, Dribbble, Facebook, LinkedIn
- Keyword-based channel routing
- Rich Discord embeds
- Keyboard shortcuts
- Beautiful modal interface
