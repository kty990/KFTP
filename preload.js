const { contextBridge, ipcRenderer, remote } = require('electron');
const sourceMapSupport = require('source-map-support');
sourceMapSupport.install();

contextBridge.exposeInMainWorld("api", {
    send: (channel, data) => {
        ipcRenderer.send(channel, data);
    },
    receive: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => {
            try {
                func(...args);
            } catch (e) {
                // Use source-map-support to get accurate source code position
                sourceMapSupport.outputStream = process.stderr;
                sourceMapSupport.install({
                    hookRequire: true,
                });

                // Log the error with accurate position information
                console.error(`Error at ${e.stack}`);
                console.log(`^^ ${channel}`);
            }
        });
    },
    on: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => {
            try {
                console.log(`Preload: ${args}`);
                func(...args);
            } catch (e) {
                // Use source-map-support to get accurate source code position
                sourceMapSupport.outputStream = process.stderr;
                sourceMapSupport.install({
                    hookRequire: true,
                });

                // Log the error with accurate position information
                console.error(`Error at ${e.stack}`);
                console.log(`^^ ${channel}`);
            }
        });
    },
    once: (channel, func) => {
        ipcRenderer.once(channel, (event, ...args) => {
            func(...args);
        });
    },
    invoke: (channel, data) => {

        return new Promise((resolve, reject) => {
            ipcRenderer.send(channel, data);
            ipcRenderer.once(channel, (event, ...args) => {
                console.log(...args);
                resolve(...args);
            });
        })
    }
});