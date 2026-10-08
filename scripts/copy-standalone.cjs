/* eslint-disable @typescript-eslint/no-require-imports */

const fs =
    require("node:fs");

const path =
    require("node:path");

const root =
    process.cwd();

const source =
    path.join(
        root,
        ".next",
        "standalone"
    );

const destination =
    path.join(
        root,
        "dist-desktop",
        "win-unpacked",
        "resources",
        "standalone"
    );

const sourceNext =
    path.join(
        source,
        "node_modules",
        "next",
        "package.json"
    );

if (!fs.existsSync(sourceNext)) {
    throw new Error(
        "O Next standalone não contém node_modules/next."
    );
}

console.log(
    "Copiando Next standalone..."
);

fs.rmSync(
    destination,
    {
        recursive: true,
        force: true,
    }
);

fs.cpSync(
    source,
    destination,
    {
        recursive: true,
        dereference: true,
    }
);

const copiedServer =
    path.join(
        destination,
        "server.js"
    );

const copiedNext =
    path.join(
        destination,
        "node_modules",
        "next",
        "package.json"
    );

if (!fs.existsSync(copiedServer)) {
    throw new Error(
        "server.js não foi copiado."
    );
}

if (!fs.existsSync(copiedNext)) {
    throw new Error(
        "node_modules/next não foi copiado."
    );
}

console.log(
    "Standalone copiado com sucesso."
);

console.log(
    "✓ server.js"
);

console.log(
    "✓ node_modules/next"
);