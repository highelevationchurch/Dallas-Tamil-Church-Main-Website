const fs = require('fs');
const path = require('path');

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

    const songsWithoutChords = allFiles.filter(file => {
        // This regex matches 'chord' or 'chords' case-insensitively.
        return !/chords?/i.test(file);
    });

    fs.writeFileSync(outputFile, JSON.stringify(songsWithoutChords, null, 2));
    console.log(`Successfully updated ${outputFile} with ${songsWithoutChords.length} songs.`);

} catch (error) {
    console.error(`Error updating ${outputFile}:`, error);
    process.exit(1);
}
