import fs from 'fs';
import path from 'path';

const songsDir = 'Songs';
const outputFile = 'all_songs_index.json';

try {
    // Check if Songs directory exists
    if (!fs.existsSync(songsDir)) {
        console.log(`Directory not found: ${songsDir}. Creating an empty index file.`);
        fs.writeFileSync(outputFile, JSON.stringify([], null, 2));
        process.exit(0);
    }

    const allFiles = fs.readdirSync(songsDir);

    const songFiles = allFiles.filter(file => {
        const lowerCaseFile = file.toLowerCase();
        const ext = path.extname(lowerCaseFile);
        
        // Condition 1: Must be a .html or .txt file
        const isCorrectFileType = ext === '.html' || ext === '.txt';
        
        // Condition 2: Must NOT contain 'chord' or 'chords'
        const hasNoChords = !/chords?/i.test(lowerCaseFile);
        
        return isCorrectFileType && hasNoChords;
    });
    
    // Sort the list alphabetically for consistency
    songFiles.sort((a, b) => a.localeCompare(b));

    fs.writeFileSync(outputFile, JSON.stringify(songFiles, null, 2));
    console.log(`Successfully updated ${outputFile} with ${songFiles.length} songs.`);

} catch (error) {
    console.error(`Error updating ${outputFile}:`, error);
    process.exit(1);
}
