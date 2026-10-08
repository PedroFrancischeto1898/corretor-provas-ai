/* eslint-disable @typescript-eslint/no-require-imports */
const {
    app,
    BrowserWindow,
    ipcMain,
    safeStorage,
    dialog,
    shell,
} = require("electron");

const {
    spawn,
} = require("node:child_process");

const http =
    require("node:http");

const path =
    require("node:path");

const PORT = 3210;

const UPDATE_MANIFEST_URL =
    "https://raw.githubusercontent.com/PedroFrancischeto1898/corretor-provas-updates/main/latest.json";

const fs =
    require("node:fs");

let nextServer = null;

function getServerPath() {
    if (app.isPackaged) {
        return path.join(
        process.resourcesPath,
        "standalone",
        "server.js"
        );
    }

    return path.join(
        __dirname,
        "..",
        ".next",
        "standalone",
        "server.js"
    );
}

function startNextServer(
    apiKey
    ) {
    const serverPath =
        getServerPath();

    nextServer = spawn(
        process.execPath,
        [serverPath],
        {
        env: {
            ...process.env,

            ELECTRON_RUN_AS_NODE:
            "1",

            NODE_ENV:
            "production",

            PORT:
            String(PORT),

            HOSTNAME:
            "127.0.0.1",

            OPENAI_API_KEY:
            apiKey,
        },

        stdio: "inherit",

        windowsHide: true,
        }
    );

    nextServer.on(
        "error",
        (error) => {
        console.error(
            "Erro ao iniciar servidor Next:",
            error
        );
        }
    );

    nextServer.on(
        "exit",
        (code) => {
        console.error(
            `Servidor Next finalizado com código ${code}`
        );
        }
    );
}

function waitForServer() {
    return new Promise(
        (resolve, reject) => {
        const startedAt =
            Date.now();

        function check() {
            const request =
            http.get(
                `http://127.0.0.1:${PORT}`,
                (response) => {
                response.resume();

                resolve();
                }
            );

            request.on(
            "error",
            () => {
                const elapsed =
                Date.now() -
                startedAt;

                if (
                elapsed > 30000
                ) {
                reject(
                    new Error(
                    "O servidor local não iniciou."
                    )
                );

                return;
                }

                setTimeout(
                check,
                300
                );
            }
            );
        }

        check();
        }
    );
}

function isNewerVersion(
    candidate,
    current
) {
    const normalize = (version) =>
        version
            .replace(/^v/i, "")
            .split(".")
            .map((part) =>
                Number(part)
            );

    const candidateParts =
        normalize(candidate);

    const currentParts =
        normalize(current);

    const length =
        Math.max(
            candidateParts.length,
            currentParts.length
        );

    for (
        let index = 0;
        index < length;
        index++
    ) {
        const candidatePart =
            candidateParts[index] ?? 0;

        const currentPart =
            currentParts[index] ?? 0;

        if (
            candidatePart >
            currentPart
        ) {
            return true;
        }

        if (
            candidatePart <
            currentPart
        ) {
            return false;
        }
    }

    return false;
}

function validateReleaseUrl(
    value
) {
    const url =
        new URL(value);

    if (
        url.protocol !== "https:" ||
        url.hostname !== "github.com"
    ) {
        throw new Error(
            "Endereço de atualização inválido."
        );
    }

    return url.toString();
}

async function fetchUpdateManifest() {
    const controller =
        new AbortController();

    const timeout =
        setTimeout(
            () =>
                controller.abort(),
            5000
        );

    try {
        const response =
            await fetch(
                `${UPDATE_MANIFEST_URL}?t=${Date.now()}`,
                {
                    signal:
                        controller.signal,

                    headers: {
                        "Cache-Control":
                            "no-cache",
                    },
                }
            );

        if (!response.ok) {
            throw new Error(
                `Falha ao consultar atualização: ${response.status}`
            );
        }

        const manifest =
            await response.json();

        if (
            typeof manifest.version !==
                "string" ||
            typeof manifest.releaseUrl !==
                "string"
        ) {
            throw new Error(
                "Manifesto de atualização inválido."
            );
        }

        return {
            version:
                manifest.version,

            releaseUrl:
                validateReleaseUrl(
                    manifest.releaseUrl
                ),

            notes:
                typeof manifest.notes ===
                "string"
                    ? manifest.notes
                    : "",
        };
    } finally {
        clearTimeout(
            timeout
        );
    }
}

async function checkForUpdates(
    window
) {
    if (!app.isPackaged) {
        return;
    }

    try {
        const manifest =
            await fetchUpdateManifest();

        const currentVersion =
            app.getVersion();

        if (
            !isNewerVersion(
                manifest.version,
                currentVersion
            )
        ) {
            return;
        }

        const result =
            await dialog.showMessageBox(
                window,
                {
                    type: "info",

                    title:
                        "Atualização disponível",

                    message:
                        `Nova versão ${manifest.version} disponível`,

                    detail:
                        [
                            `Versão instalada: ${currentVersion}`,
                            "",
                            manifest.notes ||
                                "Há uma nova versão do Corretor de Provas disponível.",
                        ].join("\n"),

                    buttons: [
                        "Baixar atualização",
                        "Agora não",
                    ],

                    defaultId: 0,
                    cancelId: 1,
                    noLink: true,
                }
            );

        if (
            result.response === 0
        ) {
            await shell.openExternal(
                manifest.releaseUrl
            );
        }
    } catch (error) {
        // Uma falha na verificação nunca deve
        // impedir a abertura do aplicativo.
        console.warn(
            "Não foi possível verificar atualizações:",
            error
        );
    }
}


function createWindow() {
    const window =
        new BrowserWindow({
        width: 1280,
        height: 850,

        minWidth: 900,
        minHeight: 650,

        title:
            "Corretor de Provas",

        autoHideMenuBar: true,

        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
        },
        });

    window.loadURL(
        `http://127.0.0.1:${PORT}`
    );

    window.webContents.once(
        "did-finish-load",
        () => {
            void checkForUpdates(
                window
            );
        }
    );
}

function stopNextServer() {
    if (
        nextServer &&
        !nextServer.killed
    ) {
        nextServer.kill();
        nextServer = null;
    }
}

function createSetupWindow() {
    return new Promise(
    (resolve) => {
        const setupWindow =
            new BrowserWindow({
            width: 600,
            height: 520,

            resizable: false,

            title:
                "Configurar Corretor de Provas",

            autoHideMenuBar: true,

            webPreferences: {
                preload:
                path.join(
                    __dirname,
                    "preload.cjs"
                ),

                contextIsolation: true,
                nodeIntegration: false,
            },
        });

        ipcMain.handle(
            "save-api-key",
        async (
            event,
            apiKey
            ) => {
            try {
                if (
                typeof apiKey !==
                    "string" ||
                !apiKey.trim()
                ) {
                throw new Error(
                    "Chave inválida."
                );
                }

                saveApiKey(
                apiKey.trim()
                );

                setTimeout(
                () => {
                    setupWindow.close();
                    resolve(
                    apiKey.trim()
                    );
                },
                300
            );

            return {
                success: true,
                };
            } catch (error) {
                return {
                success: false,

                error:
                    error instanceof Error
                    ? error.message
                    : "Erro ao salvar a chave.",
                };
            }
            }
        );

        setupWindow.loadFile(
            path.join(
            __dirname,
            "setup.html"
            )
        );
        }
    );
}

async function startApplication() {
    let apiKey =
        loadApiKey();

    if (!apiKey) {
        apiKey =
        await createSetupWindow();
    }

    startNextServer(
        apiKey
    );

    await waitForServer();

    createWindow();
}


app.whenReady().then(
    async () => {
        try {
        await startApplication();
        } catch (error) {
        const message =
            error instanceof Error
            ? `${error.message}\n\n${error.stack ?? ""}`
            : String(error);

        console.error(
            "Erro ao iniciar aplicativo:",
            error
        );

        dialog.showErrorBox(
            "Erro ao iniciar o Corretor de Provas",
            message
        );

        app.quit();
        }
    }
);

app.on(
    "window-all-closed",
    () => {
    stopNextServer();

    if (
        process.platform !==
        "darwin"
        ) {
        app.quit();
        }
    }
);

app.on(
    "before-quit",
    stopNextServer
);

function getApiKeyPath() {
    return path.join(
        app.getPath("userData"),
        "openai-key.bin"
    );
}

function loadApiKey() {
    const filePath =
        getApiKeyPath();

    if (
        !fs.existsSync(filePath)
    ) {
        return null;
    }

    try {
        const encrypted =
        fs.readFileSync(
            filePath
        );

        return safeStorage
        .decryptString(
            encrypted
        );
    } catch {
        return null;
    }
}

function saveApiKey(
    apiKey
    ) {
    if (
        !safeStorage
        .isEncryptionAvailable()
    ) {
        throw new Error(
        "A criptografia do Windows não está disponível."
        );
    }

    const encrypted =
        safeStorage.encryptString(
        apiKey
        );

    fs.writeFileSync(
        getApiKeyPath(),
        encrypted
    );
}