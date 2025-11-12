import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';

/**
 * Reads a JSON file and returns its content as an array.
 * Returns an empty array if the file doesn't exist or is empty.
 * @param {string} filePath The path to the JSON file.
 * @returns {string[]} The parsed JSON array.
 */
function readJsonFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath, 'utf-8');
      if (rawData.trim() === '') return [];
      return JSON.parse(rawData);
    }
  } catch (error) {
    console.error(`Error reading or parsing ${filePath}:`, error);
    // On error, treat it as an empty list to allow for potential recovery on next run.
  }
  return [];
}


async function run() {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("Error: API_KEY environment variable not set. Please set it in your GitHub repository secrets as GEMINI_API_KEY.");
      process.exit(1);
    }

    const ai = new GoogleGenAI({ apiKey });

    // 1. Read all relevant index files
    const allSongs = readJsonFile('all_songs_index.json');
    let englishSongs = readJsonFile('ai_english_songs_index.json');
    let tamilSongs = readJsonFile('ai_tamil_songs_index.json');

    // If the main index is empty, clear the language indexes and exit.
    if (allSongs.length === 0) {
      console.log("all_songs_index.json is empty. Clearing language indexes.");
      fs.writeFileSync('ai_english_songs_index.json', '[]\n');
      fs.writeFileSync('ai_tamil_songs_index.json', '[]\n');
      return;
    }

    // 2. Determine what has changed
    const allSongsSet = new Set(allSongs);
    const categorizedSongsSet = new Set([...englishSongs, ...tamilSongs]);

    const newSongs = allSongs.filter(song => !categorizedSongsSet.has(song));
    const removedSongs = [...categorizedSongsSet].filter(song => !allSongsSet.has(song));
    
    let changesMade = false;

    // 3. Sync removals
    if (removedSongs.length > 0) {
      console.log(`Syncing removals: ${removedSongs.length} song(s) removed.`);
      englishSongs = englishSongs.filter(song => !removedSongs.includes(song));
      tamilSongs = tamilSongs.filter(song => !removedSongs.includes(song));
      changesMade = true;
    }

    // 4. Process new additions
    if (newSongs.length > 0) {
      console.log(`Found ${newSongs.length} new song(s) to categorize.`);
      
      const prompt = `
        Analyze this list of new song filenames and categorize each one as either 'english' or 'tamil'.
        Base the categorization on the linguistic origin of the words in the filename.
        For example, 'AadharamNeerThaanAiyya.html' is Tamil, and 'A_Restless_Generation.html' is English.
        Your response MUST be a single, valid JSON object containing two keys: "english_songs" and "tamil_songs".
        Each key's value must be an array of the corresponding filenames from the input list.
        Ensure every filename from the input is sorted into one of the two arrays. Do not omit any.
        
        Input list of new filenames to categorize:
        ${JSON.stringify(newSongs)}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              english_songs: {
                type: Type.ARRAY,
                description: "An array of filenames identified as English songs.",
                items: { type: Type.STRING }
              },
              tamil_songs: {
                type: Type.ARRAY,
                description: "An array of filenames identified as Tamil songs.",
                items: { type: Type.STRING }
              }
            },
            required: ["english_songs", "tamil_songs"]
          }
        }
      });

      const jsonStr = response.text.trim();
      const newlyCategorizedSongs = JSON.parse(jsonStr);

      if (!newlyCategorizedSongs || !('english_songs' in newlyCategorizedSongs) || !('tamil_songs' in newlyCategorizedSongs)) {
          throw new Error("Invalid response format from AI. Expected 'english_songs' and 'tamil_songs' keys.");
      }

      // Append new songs to the existing lists
      englishSongs.push(...newlyCategorizedSongs.english_songs);
      tamilSongs.push(...newlyCategorizedSongs.tamil_songs);

      console.log(`Added ${newlyCategorizedSongs.english_songs.length} new English song(s).`);
      console.log(`Added ${newlyCategorizedSongs.tamil_songs.length} new Tamil song(s).`);
      changesMade = true;
    } else {
        console.log("No new songs to categorize.");
    }
    
    // 5. Write the updated and sorted files back to disk if any changes were made
    if (changesMade) {
      // Sort for consistent ordering
      englishSongs.sort();
      tamilSongs.sort();
      
      fs.writeFileSync('ai_english_songs_index.json', JSON.stringify(englishSongs, null, 2) + '\n');
      fs.writeFileSync('ai_tamil_songs_index.json', JSON.stringify(tamilSongs, null, 2) + '\n');
      console.log("Successfully updated and synced language index files.");
    } else {
      console.log("Language indexes are already up-to-date.");
    }

  } catch (error) {
    console.error("Error during AI song categorization script:", error);
    process.exit(1);
  }
}

run();
