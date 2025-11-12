import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';

async function run() {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("Error: API_KEY environment variable not set. Please set it in your GitHub repository secrets as GEMINI_API_KEY.");
      process.exit(1);
    }

    const ai = new GoogleGenAI({ apiKey });

    // 1. Read the all_songs_index.json file
    const allSongsRaw = fs.readFileSync('all_songs_index.json', 'utf-8');
    const allSongs = JSON.parse(allSongsRaw);

    if (!allSongs || allSongs.length === 0) {
      console.log("No songs found in all_songs_index.json. Clearing language indexes.");
      fs.writeFileSync('ai_english_songs_index.json', '[]\n');
      fs.writeFileSync('ai_tamil_songs_index.json', '[]\n');
      return;
    }
    
    // 2. Create a prompt for the Gemini API
    const prompt = `
      Analyze this list of song filenames and categorize each one as either 'english' or 'tamil'.
      Base the categorization on the linguistic origin of the words in the filename.
      For example, 'AadharamNeerThaanAiyya.html' is Tamil, and 'A_Restless_Generation.html' is English.
      Your response MUST be a single, valid JSON object containing two keys: "english_songs" and "tamil_songs".
      Each key's value must be an array of the corresponding filenames from the input list.
      Ensure every filename from the input is sorted into one of the two arrays. Do not omit any.
      
      Input list of filenames:
      ${JSON.stringify(allSongs)}
    `;
    
    // 3. Call the Gemini API
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
    const categorizedSongs = JSON.parse(jsonStr);

    if (!categorizedSongs || !('english_songs' in categorizedSongs) || !('tamil_songs' in categorizedSongs)) {
        throw new Error("Invalid response format from AI. Expected 'english_songs' and 'tamil_songs' keys.");
    }

    // 4. Update the index files
    fs.writeFileSync('ai_english_songs_index.json', JSON.stringify(categorizedSongs.english_songs, null, 2) + '\n');
    fs.writeFileSync('ai_tamil_songs_index.json', JSON.stringify(categorizedSongs.tamil_songs, null, 2) + '\n');

    console.log("Successfully categorized songs.");
    console.log(`English songs found: ${categorizedSongs.english_songs.length}`);
    console.log(`Tamil songs found: ${categorizedSongs.tamil_songs.length}`);

  } catch (error) {
    console.error("Error during AI song categorization script:", error);
    process.exit(1);
  }
}

run();