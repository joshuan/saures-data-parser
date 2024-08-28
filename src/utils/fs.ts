import path from 'path';
import fs from 'fs';

export function saveFile(filepath: string, data: string): void {
    fs.writeFileSync(path.join(process.cwd(), filepath), data);
}

export function readFile(filepath: string): string {
    return fs.readFileSync(path.join(process.cwd(), filepath), 'utf-8');
}
    