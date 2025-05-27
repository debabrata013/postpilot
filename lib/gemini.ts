import axios from 'axios';

export async function generateSocialContent(prompt: string) {
  try {
    const res = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + process.env.GEMINI_API_KEY, // Ensure you have set this environment variable
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    return res.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('Failed to generate content');
  }
}
