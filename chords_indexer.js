import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = __dirname;
const songsDir = path.join(rootDir, 'Songs');
const outputFile = path.join(rootDir, 'chords_index.json');

const findChordFiles = (dir) => {
    let results = [];
    const files = fs.readdirSync(dir, { withFileTypes: true });

    files.forEach(file => {
        const filePath = path.join(dir, file.name);
        if (file.isDirectory()) {
            // We don't want to recursively search subdirectories in this case.
            // If we did, we would call findChordFiles again.
        } else {
            const lowerCaseFile = file.name.toLowerCase();
            if (lowerCaseFile.endsWith('.html') && (lowerCaseFile.includes('chord') || lowerCaseFile.includes('chords'))) {
                results.push(file.name);
            }
        }
    });
    return results;
};

try {
    if (fs.existsSync(songsDir)) {
        const chordFiles = findChordFiles(songsDir);

        fs.writeFileSync(outputFile, JSON.stringify(chordFiles, null, 2));

        console.log('Chords index file updated successfully.');
    } else {
        console.error(`'Songs' directory not found at ${songsDir}`);
    }
} catch (err) {
    console.error('Error processing chord files:', err);
}