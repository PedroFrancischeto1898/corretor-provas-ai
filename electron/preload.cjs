/* eslint-disable @typescript-eslint/no-require-imports */
const {
    contextBridge,
    ipcRenderer,
} = require("electron");

contextBridge.exposeInMainWorld(
    "electronSetup",
    {
        saveApiKey: (apiKey) =>
        ipcRenderer.invoke(
            "save-api-key",
            apiKey
        ),
    }
);