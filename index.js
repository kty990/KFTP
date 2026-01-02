const { app, BrowserWindow, Menu, dialog, ipcMain, autoUpdater } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const fileTypes = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'bmp']; // Feel free to add/remove as you please

/**
 *  ========================== TO KEEP THE INTEGRITY OF THE PROGRAM, DO NOT EDIT BELOW HERE ========================
 *  ====================== (If you are making intentional changes, ignore this ) ===================================
 */

let devToolsOpened = false;

class GUI {
    constructor() {
        try {
            this.window = null;

            app.on('ready', () => {
                this.createWindow().then(() => {
                    // this.window.openDevTools();
                })
            });
        } catch (e) { }
    }

    async createWindow() {
        return new Promise(resolve => {
            this.window = new BrowserWindow({
                width: 800,
                height: 600,
                minWidth: 800,   // Set the minimum width
                minHeight: 600,  // Set the minimum height
                frame: true,
                webPreferences: {
                    nodeIntegration: true,
                    spellcheck: false,
                    preload: path.join(__dirname, './preload.js')
                },
            });

            // Uncomment to use icon:
            const iconPath = path.join(__dirname, './src/images/icon.jpg');
            this.window.setIcon(iconPath);

            const menu = Menu.buildFromTemplate([]);
            Menu.setApplicationMenu(menu);

            this.window.setMenu(menu);

            this.window.loadFile('./src/html/index.html').then(resolve);

            this.window.on('closed', () => {
                this.window = null;
            });
        })
    }
}

const gui = new GUI();

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.on("dev-refresh", () => {
    gui.window.reload();
})

ipcMain.on("close", () => {
    gui.window.close();
})

ipcMain.on("minimize", () => {
    gui.window.minimize();
})

ipcMain.on("toggle-dev-tools", () => {

    // Toggle the DevTools visibility based on its current state
    if (devToolsOpened) {
        gui.window.webContents.closeDevTools();
    } else {
        gui.window.webContents.openDevTools();
    }
})

ipcMain.on("getDirectory", async (ev, ...args) => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: args[0] || 'Select a folder',
        buttonLabel: 'Choose Folder'
    });
    if (!result.cancelled) {
        gui.window.webContents.send("getDirectory", result.filePaths[0]);
    } else {
        gui.window.webContents.send("getDirectory", null);
    }

})

async function getFilesRecursively(dirPath, extensions = []) {
    const entries = fs.readdirSync(dirPath, {
        recursive: true,      // Enable recursive traversal
        withFileTypes: true   // Return Dirent objects for efficient type checking
    });

    console.log(entries);

    const files = [];

    for (const entry of entries) {
        const relativePath = path.relative(dirPath, path.join(entry.path, entry.name));

        // If no extensions specified, include all files
        if (extensions.length === 0) {
            files.push(relativePath);
        } else {
            let tmp = entry.name.split('.');
            if (extensions.includes(tmp[tmp.length - 1])) {
                files.push(relativePath);
            }
        }
    }

    return files;
}

ipcMain.on("getFilesInDirectory", async (ev, ...args) => {
    let directory = args[0];
    if (directory) {
        let result = await getFilesRecursively(directory, fileTypes);
        gui.window.webContents.send("getFilesInDirectory", result);
    } else {
        gui.window.webContents.send("getFilesInDirectory", null);
    }
})

async function moveFileWithMetadata(source, destination, copy = true) {
    console.log(`moveFileWithMetadata:\n\tSource: ${source}\n\tDestination: ${destination}`)
    try {
        // Get original file stats
        const stats = await fs.promises.stat(source);

        // Preserve the original timestamps by immediately restoring them
        // after stat() accessed the file
        await fs.promises.utimes(source, stats.atime, stats.mtime);

        // Copy the file
        await fs.promises.copyFile(source, destination);

        // Preserve timestamps on destination
        await fs.promises.utimes(destination, stats.atime, stats.mtime); // could be mtime twice

        // Preserve permissions
        await fs.promises.chmod(destination, stats.mode);

        // Delete original file
        if (!copy) {
            await fs.promises.unlink(source);
        }

        return [true, null];
    } catch (error) {
        return [false, error.message];
    }
}

/*ipcMain.on("transferFile", async (ev, data) => {
    // c.textContent, toLabel.textContent
    let from = data[0];
    let to = data[1];
    console.log(`transferFile event:\n\tFrom: ${from}\n\tTo: ${to}`)
    try {
        let ext = from.split("\\");
        ext = ext[ext.length - 1];
        let result = await moveFileWithMetadata(from, to + `/${ext}`);
        console.log(`Transfer File result:\n\t${result[0]}\n\t${result[1]}`)
        ev.sender.send("transferFile", result);
    } catch (e) {
        ev.sender.send("transferFile", [false, `${e}`]);
    }
})*/

ipcMain.on("transferFile", async (ev, data) => {
    let from = data[0];
    let to = data[1];
    console.log(`transferFile event:\n\tFrom: ${from}\n\tTo: ${to}`)
    try {
        // Use path.basename instead of string splitting
        let filename = path.basename(from);

        // Use path.join for cross-platform compatibility
        let destination = path.join(to, filename);

        let result = await moveFileWithMetadata(from, destination, false);
        console.log(`Transfer File result:\n\t${result[0]}\n\t${result[1]}`)
        ev.sender.send("transferFile", result);
    } catch (e) {
        ev.sender.send("transferFile", [false, `${e}`]);
    }
})

ipcMain.on("transferFileCopy", async (ev, data) => {
    let from = data[0];
    let to = data[1];
    console.log(`transferFileCopy event:\n\tFrom: ${from}\n\tTo: ${to}`)
    try {
        // Use path.basename instead of string splitting
        let filename = path.basename(from);

        // Use path.join for cross-platform compatibility 
        let destination = path.join(to, filename);

        let result = await moveFileWithMetadata(from, destination, true);
        console.log(`Transfer File Copy result:\n\t${result[0]}\n\t${result[1]}`)
        ev.sender.send("transferFileCopy", result);
    } catch (e) {
        ev.sender.send("transferFileCopy", [false, `${e}`]);
    }
})

const cache = {};

ipcMain.on("edit-cache", (ev, data) => {
    const { key, value } = data;
    cache[key] = value;
})

ipcMain.on("get-cache", (ev, data) => {
    const { key } = data;
    gui.window.webContents.send("get-cache", cache[key]);
})