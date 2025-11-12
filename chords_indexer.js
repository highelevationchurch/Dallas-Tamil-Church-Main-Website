import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Replicate __dirname functionality in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SONGS_DIR = path.join(__dirname, 'Songs');
const INDEX_FILE = 'chords_index.json';

try {
    if (!fs.existsSync(SONGS_DIR)) {
        console.log(`'Songs' directory not found. Writing empty index.`);
        fs.writeFileSync(INDEX_FILE, JSON.stringify({ songs: [] }, null, 2));
        process.exit(0);
    }

    // --- State Reading ---
    const allFiles = fs.readdirSync(SONGS_DIR);
    const currentTxtFiles = allFiles.filter(f => path.extname(f) === '.txt' && /chord(s)?/i.test(f));
    const currentHtmlFiles = allFiles.filter(f => path.extname(f) === '.html' && /chord(s)?/i.test(f));

    const currentTxtBasenames = new Set(currentTxtFiles.map(f => path.basename(f, '.txt')));
    const currentHtmlBasenames = new Set(currentHtmlFiles.map(f => path.basename(f, '.html')));

    let previousIndex = { songs: [] };
    if (fs.existsSync(INDEX_FILE)) {
        try {
            previousIndex = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
        } catch (e) {
            console.log('Could not parse chords_index.json, starting from scratch.');
        }
    }
    const previousBasenames = new Set(previousIndex.songs.map(s => s.name));

    // --- Reconciliation Logic ---

    // Find what was added and what was removed since the last known state.
    const addedHtml = [...currentHtmlBasenames].filter(name => !previousBasenames.has(name));
    const removedHtml = [...previousBasenames].filter(name => !currentHtmlBasenames.has(name));

    // Scenario: User renamed an HTML file.
    // This is detected if exactly one HTML file was "removed" and one was "added" according to our index.
    if (removedHtml.length === 1 && addedHtml.length === 1) {
        const oldName = removedHtml[0];
        const newName = addedHtml[0];
        
        console.log(`Detected potential HTML rename from '${oldName}' to '${newName}'.`);

        const oldTxtPath = path.join(SONGS_DIR, `${oldName}.txt`);
        const newTxtPath = path.join(SONGS_DIR, `${newName}.txt`);

        // If the corresponding .txt for the old name exists, rename it.
        if (fs.existsSync(oldTxtPath)) {
            fs.renameSync(oldTxtPath, newTxtPath);
            console.log(`SYNC: Renamed ${path.basename(oldTxtPath)} to ${path.basename(newTxtPath)}.`);
        }
    }

    // --- Final Indexing and Cleanup ---

    // After any potential sync, get the definitive list of .txt files as the source of truth.
    const finalTxtFiles = fs.readdirSync(SONGS_DIR)
        .filter(f => path.extname(f) === '.txt' && /chord(s)?/i.test(f));
    const finalTxtBasenames = new Set(finalTxtFiles.map(f => path.basename(f, '.txt')));

    // Cleanup any orphaned HTML files that do not have a corresponding .txt file.
    const allCurrentHtmlFiles = fs.readdirSync(SONGS_DIR)
        .filter(file => path.extname(file) === '.html' && /chord(s)?/i.test(file));
        
    allCurrentHtmlFiles.forEach(htmlFile => {
        const baseName = path.basename(htmlFile, '.html');
        if (!finalTxtBasenames.has(baseName)) {
            const htmlPath = path.join(SONGS_DIR, htmlFile);
            fs.unlinkSync(htmlPath);
            console.log(`CLEANUP: Removed orphaned file: ${htmlFile}`);
        }
    });

    // Build the final index from the single source of truth (.txt files).
    const songList = Array.from(finalTxtBasenames).map(name => ({
        name: name,
        txt: path.join('Songs', `${name}.txt`),
        html: path.join('Songs', `${name}.html`),
    })).sort((a, b) => a.name.localeCompare(b.name));

    const outputJson = { songs: songList };
    fs.writeFileSync(INDEX_FILE, JSON.stringify(outputJson, null, 2));
    console.log(`Generated chords_index.json with ${songList.length} songs.`);

} catch (error) {
    console.error('An error occurred during chord syncing and indexing:', error.message);
    process.exit(1);
}
