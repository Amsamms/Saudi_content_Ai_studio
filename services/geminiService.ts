import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import type { ContentIdea } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMarketAnalysis = async (industry: string): Promise<string> => {
    const prompt = `
        Analyze the current market for the "${industry}" industry in Saudi Arabia. 
        Your analysis should be comprehensive and cover the following areas:
        1.  **Market Trends:** What are the key trends shaping this industry in KSA?
        2.  **Competitor Landscape:** Who are the main players? What are their strengths and weaknesses? What are their typical content strategies on social media?
        3.  **Audience Behavior:** Describe the target audience's behavior, preferences, and cultural nuances on social media platforms like Instagram, TikTok, and X (formerly Twitter). What kind of content resonates most with them?
        
        Provide a detailed but concise report. Use markdown for formatting.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
        });
        // FIX: Add a check for an empty response to ensure `response.text` is a string.
        if (!response.text) {
            throw new Error("Received an empty response from the AI.");
        }
        return response.text;
    } catch (error) {
        console.error("Error generating market analysis:", error);
        throw new Error("Failed to generate market analysis. Please try again.");
    }
};

export const generateContentIdeas = async (analysis: string, industry: string): Promise<ContentIdea[]> => {
    const prompt = `
        Based on the following market analysis for the "${industry}" industry in Saudi Arabia, generate 5 distinct and creative content ideas.

        **Market Analysis:**
        ${analysis}

        For each idea, specify the content type (e.g., 'Instagram Reel', 'TikTok Video', 'X Thread', 'Blog Post') and provide a compelling idea title and a brief description.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        ideas: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, description: 'The social media platform and content format.' },
                                    idea: { type: Type.STRING, description: 'A short, catchy title for the content idea.' },
                                    description: { type: Type.STRING, description: 'A brief explanation of the content idea.' }
                                }
                            }
                        }
                    }
                }
            }
        });
        
        // FIX: Add a check for an empty response and use .trim() to prevent JSON parsing errors.
        if (!response.text) {
            throw new Error("Received an empty response from the AI for content ideas.");
        }
        const jsonResponse = JSON.parse(response.text.trim());
        return jsonResponse.ideas;

    } catch (error) {
        console.error("Error generating content ideas:", error);
        throw new Error("Failed to generate content ideas. Please try again.");
    }
};

export const writeContent = async (idea: ContentIdea): Promise<string> => {
    const prompt = `
        Write the content for the following idea, tailored for a Saudi Arabian audience.
        
        **Content Type:** ${idea.type}
        **Idea:** ${idea.idea}
        **Description:** ${idea.description}

        Generate the full text for this piece of content. If it's a video, write a detailed script including visual cues. If it's a blog post or thread, write the full text. The tone should be engaging and culturally relevant.
    `;
     try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
        });
        // FIX: Add a check for an empty response to ensure `response.text` is a string.
        if (!response.text) {
            throw new Error("Received an empty response from the AI when writing content.");
        }
        return response.text;
    } catch (error) {
        console.error("Error writing content:", error);
        throw new Error("Failed to write content. Please try again.");
    }
};

export const generateVisual = async (idea: ContentIdea): Promise<string> => {
    const prompt = `
        Create a high-quality, photorealistic image for a social media post. The image should be visually stunning and culturally relevant to Saudi Arabia.
        
        **Content Idea:** "${idea.idea}" - ${idea.description}.
        
        Generate an image that captures the essence of this idea, featuring Saudi characters, landscapes, or styles where appropriate. The aesthetic should be modern and engaging.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        
        throw new Error("No image was generated.");

    } catch (error) {
        console.error("Error generating visual:", error);
        throw new Error("Failed to generate visual. Please try again.");
    }
};

export const generateVoice = async (script: string): Promise<string> => {
    const prompt = `
        Please read the following text clearly and with an engaging, professional tone suitable for a social media voiceover.
        
        Text: "${script.substring(0, 500)}..."
    `; // Truncate for safety
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' }, // A neutral, professional voice
                  },
              },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            return base64Audio;
        } else {
            throw new Error("No audio was generated.");
        }
    } catch (error) {
        console.error("Error generating voice:", error);
        throw new Error("Failed to generate voice. Please try again.");
    }
};

export const generatePublishDescription = async (content: string, idea: ContentIdea): Promise<string> => {
    const prompt = `
        Based on the following content for a "${idea.type}", write an engaging social media caption.
        The caption should be concise, include relevant hashtags for the Saudi market, and have a clear call-to-action.

        **Content:**
        ${content.substring(0, 1000)}...
    `;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        // FIX: Add a check for an empty response to ensure `response.text` is a string.
        if (!response.text) {
            throw new Error("Received an empty response from the AI for publish description.");
        }
        return response.text;
    } catch (error) {
        console.error("Error generating publish description:", error);
        throw new Error("Failed to generate description. Please try again.");
    }
};
