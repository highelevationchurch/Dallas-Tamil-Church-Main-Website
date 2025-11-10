const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to detect and format chords in a line
function formatChordsInLine(line) {
    // Regex to test if a single word is a chord, allowing for trailing punctuation.
    const chordWordPattern = /^[ABCDEFG][#b]?(?:m|sus|add|maj|min|dim|aug)?\d*(?:\/[ABCDEFG][#b]?)?\W*$/;
    
    // Split on whitespace and remove any empty strings that result from multiple spaces.
    const words = line.trim().split(/\s+/).filter(w => w);

    if (words.length === 0) {
        return line; // It's a blank line, return as is.
    }

    let chordCount = 0;
    for (const word of words) {
        // The regex is anchored (^, $) to match the entire word.
        if (chordWordPattern.test(word)) {
            chordCount++;
        }
    }
    
    // A line is considered a "chord line" if more than half of its "words" are chords.
    if (chordCount / words.length > 0.5) {
        return `<span style="color: red">${line}</span>`;
    }
    
    return line;
}


// Function to convert text file content to HTML
function convertToHtml(content) {
    // Use a regex to split on any common newline character to handle different file formats.
    const lines = content.split(/\r\n?|\n/);
    const processedLines = [];
    const sectionKeywords = /begin|stanza|chorus|verse|bridge|intro/;

    for (const line of lines) {
        const trimmedLine = line.trim();
        let processedLineHtml;
        
        if (trimmedLine === '') {
            processedLineHtml = line || '&nbsp;';
        } else {
            const isSection = sectionKeywords.test(trimmedLine.toLowerCase());
        
            if (isSection) {
                processedLineHtml = `<span style="color: blue">${line}</span>`;
            } else {
                processedLineHtml = formatChordsInLine(line);
            }
        }
        processedLines.push(`<div>${processedLineHtml}</div>`);
    }
    
    const htmlBody = processedLines.map(line => `    ${line}`).join('\n');
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Chord Sheet</title>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: monospace;
            margin: 50px;
        }
        div {
            white-space: pre;
            line-height: 1em;
        }
    </style>
</head>
<body>
${htmlBody}
</body>
</html>`;
}

// Function to process a single file
function processFile(filePath) {
    // We only want to process .txt files.
    if (!filePath.endsWith('.txt')) {
        return;
    }

    try {
        // Read the content of the text file
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Generate HTML content
        const htmlContent = convertToHtml(content);
        
        // Create the HTML file path (same name but .html extension)
        const htmlPath = filePath.replace('.txt', '.html');
        
        // Write the HTML file
        fs.writeFileSync(htmlPath, htmlContent);
        
        console.log(`Converted ${filePath} to ${htmlPath}`);
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
    }
}

// Main logic to run the script
try {
    const directoryPath = __dirname; // The directory where the script is located

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }

        files.forEach(file => {
            const txtFilePath = path.join(directoryPath, file);
            if (path.extname(txtFilePath) === '.txt') {
                const htmlFilePath = txtFilePath.replace('.txt', '.html');

                let shouldProcess = false;
                if (!fs.existsSync(htmlFilePath)) {
                    shouldProcess = true; // HTML file doesn't exist, so we should create it.
                    console.log(`Processing ${file} because its HTML counterpart does not exist.`);
                } else {
                    const txtStats = fs.statSync(txtFilePath);
                    const htmlStats = fs.statSync(htmlFilePath);
                    if (txtStats.mtime > htmlStats.mtime) {
                        shouldProcess = true; // TXT file is newer, so we should update the HTML.
                        console.log(`Processing ${file} because it has been modified more recently than its HTML counterpart.`);
                    }
                }

                if (shouldProcess) {
                    processFile(txtFilePath); // This function already exists and does the conversion
                } else {
                    console.log(`Skipping ${file}; HTML is up-to-date.`);
                }
            }
        });
    });
} catch (error) {
    console.error('An error occurred during script execution:', error.message);
}