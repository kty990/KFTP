# Image File Transfer Application

An Electron-based desktop application for managing and transferring image files between directories while preserving file metadata.

> [!NOTE]
> Any license updates will only apply to version that pertains to the new license and future software versions with the same license.

## Overview

This application provides a graphical interface for browsing directories, viewing image files, and transferring them between locations. The app maintains file metadata (timestamps, permissions) during transfers and includes basic developer tools for debugging.

## Features

- **Directory Selection**: Browse and select directories through a native dialog interface
- **Image File Detection**: Automatically scans directories for image files (PNG, JPG, JPEG, WEBP, SVG, BMP)
- **Recursive File Search**: Traverses subdirectories to find all image files
- **Metadata Preservation**: Maintains original file timestamps and permissions during transfers
- **Developer Tools**: Toggle developer tools for debugging (Ctrl+Shift+I or similar)
- **Cross-Platform**: Built with Electron for Windows, macOS, and Linux support

### Keybinds

| Key | Purpose |
|-------|---------|
| `ctrl+t` | Opens devTools |
| `ctrl+r` | Hot reload the application (renderer) |

## Technical Details

### Window Configuration

- Default size: 800x600 pixels
- Minimum size: 800x600 pixels
- Custom application icon support
- Optional frameless menu for clean interface

### Supported Image Formats

- PNG
- JPG/JPEG
- WEBP
- SVG
- BMP

## IPC Events

The application uses Electron's IPC (Inter-Process Communication) for communication between the main and renderer processes:

| Event | Direction | Purpose |
|-------|-----------|---------|
| `dev-refresh` | Renderer → Main | Reload the application window |
| `close` | Renderer → Main | Close the application |
| `minimize` | Renderer → Main | Minimize the window |
| `toggle-dev-tools` | Renderer → Main | Toggle developer tools |
| `getDirectory` | Bidirectional | Open directory picker and return selected path |
| `getFilesInDirectory` | Bidirectional | Scan directory for image files |
| `transferFile` | Bidirectional | Transfer file with metadata preservation |
| `edit-cache` | Renderer → Main | Store data in memory cache |
| `get-cache` | Bidirectional | Retrieve data from memory cache |

## File Transfer Process

When transferring files, the application:

1. Reads the source file's metadata (timestamps, permissions)
2. Copies the file to the destination
3. Restores original timestamps and permissions
4. Returns success/failure status with error messages if applicable

## Project Structure

```
.
├── index.js                        # Main Electron process
├── preload.js                      # Preload script for renderer
├── util.js                         # Utility functions if/when needed
└── src/
    ├── html/
    │   └── index.html              # Main application UI
    |
    ├── js/
    │   └── index.js              # Main application styling
    |
    ├── css/
    │   └── index.css              # Main application styling
    |
    └── images/
        └── icon.jpg                # Application icon
        └── icon.ico                # Application icon

```

## Installation

```bash
npm install electron
```

## Usage

```bash
npm start
# or
electron .
```

## Development

The application includes several developer-friendly features:

- **Hot Reload**: Use the `dev-refresh` IPC event to reload the window during development
- **DevTools**: Uncomment `this.window.openDevTools()` in the constructor or use the toggle event
- **Logging**: Console logs track file operations and transfers

## Future Enhancements

- [x] Move vs. Copy toggle option
- [ ] Progress indicators for large transfers
- [ ] File preview functionality
- [ ] Auto-update functionality

## License

[MIT License](https://github.com/kty990/KFTP/blob/main/LICENSE.md)

## Contributing

If you want to contribute, make a pull request. If it is accepted, your name will be added to the list of contributors below if not already present.

**List of Contributors**
- Ty Kutcher (kty990)