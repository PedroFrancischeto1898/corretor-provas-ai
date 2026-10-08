import {
    access,
    cp,
    mkdir,
} from "node:fs/promises";

import path from "node:path";

const root =
    process.cwd();

const standalone =
    path.join(
        root,
        ".next",
        "standalone"
    );

async function copyIfExists(
    source,
    destination
) {
    try {
    await access(source);

    await mkdir(
        path.dirname(destination),
        {
            recursive: true,
        }
    );

    await cp(
        source,
        destination,
        {
            recursive: true,
        }
        );
    } catch (error) {
        if (
        error?.code !== "ENOENT"
        ) {
        throw error;
        }
    }
}

await copyIfExists(
    path.join(
        root,
        "public"
    ),
    path.join(
        standalone,
        "public"
    )
);

await copyIfExists(
    path.join(
        root,
        ".next",
        "static"
    ),
    path.join(
        standalone,
        ".next",
        "static"
    )
);

console.log(
    "Standalone preparado."
);