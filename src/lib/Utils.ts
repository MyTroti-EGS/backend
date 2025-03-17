import { readdirSync, statSync } from "fs";
import { resolve } from "path";

export function readDirRecursiveSync(dir: string): string[] {
    let results: string[] = [];

    const list = readdirSync(dir);

    list.forEach((file) => {
        file = resolve(dir, file);
        const stat = statSync(file);

        if (stat && stat.isDirectory()) {
            results = results.concat(readDirRecursiveSync(file));
        } else {
            results.push(file);
        }
    });

    return results;
}
