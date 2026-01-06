import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Initializes the Google Gemini client with the API key from environment variables.
 * @returns {GoogleGenerativeAI} Configured Gemini client instance.
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default genAI;