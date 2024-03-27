const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("electronAPI", {
    setParams: (params) => ipcRenderer.send("set-params", params),
});
