import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "node:fs";

// 1. Configure the API key
const apiKey = "AIzaSyDRUvyiwRgV4q86sRAei8U50Pc9UgZTzcM";
const genAI = new GoogleGenerativeAI(apiKey);

// 2. Load the model
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" }); // or use "gemini-2.5-flash" if preferred

// 3. Load the image
const imagePath = "./2.png";  // Make sure this path is correct
const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });

// 4. Send image + prompt
const prompt = "pls analyze this image.";

async function run() {
  try {
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/png", // or "image/jpeg" if .jpg
          data: imageBase64,
        },
      },
      { text: prompt },
    ]);

    const response = await result.response;
    const text = await response.text();
    console.log("Gemini's response:", text);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
