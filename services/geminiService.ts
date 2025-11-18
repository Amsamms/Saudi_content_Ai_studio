import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import type { ContentIdea, Language } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getBilingualPrompt = (prompts: { en: string; ar: string }, language: Language): string => {
    return language === 'ar' ? prompts.ar : prompts.en;
};

export const generateMarketAnalysis = async (industry: string, language: Language): Promise<string> => {
    const prompt = getBilingualPrompt({
        en: `
            Analyze the current market for the "${industry}" industry in Saudi Arabia. 
            Your analysis should be comprehensive and cover the following areas:
            1.  **Market Trends:** What are the key trends shaping this industry in KSA?
            2.  **Competitor Landscape:** Who are the main players? What are their strengths and weaknesses? What are their typical content strategies on social media?
            3.  **Audience Behavior:** Describe the target audience's behavior, preferences, and cultural nuances on social media platforms like Instagram, TikTok, and X (formerly Twitter). What kind of content resonates most with them?
            
            Provide a detailed but concise report. Use markdown for formatting. Respond in English only.
        `,
        ar: `
            قم بتحليل السوق الحالي لصناعة "${industry}" في المملكة العربية السعودية.
            يجب أن يكون تحليلك شاملاً ويغطي المجالات التالية:
            1.  **اتجاهات السوق:** ما هي الاتجاهات الرئيسية التي تشكل هذه الصناعة في المملكة؟
            2.  **المنافسون:** من هم اللاعبون الرئيسيون؟ ما هي نقاط قوتهم وضعفهم؟ ما هي استراتيجيات المحتوى المعتادة لديهم على وسائل التواصل الاجتماعي؟
            3.  **سلوك الجمهور:** صف سلوك الجمهور المستهدف وتفضيلاتهم والفروق الثقافية الدقيقة على منصات مثل Instagram و TikTok و X (Twitter سابقًا). ما نوع المحتوى الذي يلقى صدى أكبر لديهم؟

            قدم تقريراً مفصلاً وموجزاً. استخدم الماركداون للتنسيق. قم بالرد باللغة العربية فقط.
        `
    }, language);

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
        });
        if (!response.text) {
            throw new Error("Received an empty response from the AI.");
        }
        return response.text;
    } catch (error) {
        console.error("Error generating market analysis:", error);
        throw new Error("Failed to generate market analysis. Please try again.");
    }
};

export const generateContentIdeas = async (analysis: string, industry: string, language: Language): Promise<ContentIdea[]> => {
    const prompt = getBilingualPrompt({
        en: `
            Based on the following market analysis for the "${industry}" industry in Saudi Arabia, generate 5 distinct and creative content ideas.

            **Market Analysis:**
            ${analysis}

            For each idea, specify the content type (e.g., 'Instagram Reel', 'TikTok Video', 'X Thread', 'Blog Post') and provide a compelling idea title and a brief description. Respond in English only.
        `,
        ar: `
            بناءً على تحليل السوق التالي لصناعة "${industry}" في المملكة العربية السعودية، قم بإنشاء 5 أفكار محتوى متميزة ومبتكرة.

            **تحليل السوق:**
            ${analysis}

            لكل فكرة، حدد نوع المحتوى (على سبيل المثال، 'مقطع ريلز انستغرام'، 'فيديو تيك توك'، 'ثريد على منصة إكس'، 'منشور مدونة') وقدم عنوانًا جذابًا للفكرة ووصفًا موجزًا. قم بالرد باللغة العربية فقط.
        `
    }, language);

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

export const writeContent = async (idea: ContentIdea, language: Language): Promise<string> => {
    const prompt = getBilingualPrompt({
        en: `
            Write the content for the following idea, tailored for a Saudi Arabian audience.
            
            **Content Type:** ${idea.type}
            **Idea:** ${idea.idea}
            **Description:** ${idea.description}

            Generate the full text for this piece of content. If it's a video, write a detailed script including visual cues. If it's a blog post or thread, write the full text. The tone should be engaging and culturally relevant. Respond in English only.
        `,
        ar: `
            اكتب المحتوى للفكرة التالية، مصمم خصيصًا للجمهور في المملكة العربية السعودية.

            **نوع المحتوى:** ${idea.type}
            **الفكرة:** ${idea.idea}
            **الوصف:** ${idea.description}

            أنشئ النص الكامل لهذه القطعة من المحتوى. إذا كان فيديو، اكتب سيناريو مفصلًا يتضمن إشارات مرئية. إذا كان منشور مدونة أو ثريد، اكتب النص بالكامل. يجب أن تكون النبرة جذابة وذات صلة ثقافية. قم بالرد باللغة العربية فقط.
        `
    }, language);

     try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
        });
        if (!response.text) {
            throw new Error("Received an empty response from the AI when writing content.");
        }
        return response.text;
    } catch (error) {
        console.error("Error writing content:", error);
        throw new Error("Failed to write content. Please try again.");
    }
};

export const generateVisual = async (idea: ContentIdea, language: Language): Promise<string> => {
    const prompt = getBilingualPrompt({
        en: `
            Create a high-quality, photorealistic image for a social media post. The image should be visually stunning and culturally relevant to Saudi Arabia.
            
            **Content Idea:** "${idea.idea}" - ${idea.description}.
            
            Generate an image that captures the essence of this idea, featuring Saudi characters, landscapes, or styles where appropriate. The aesthetic should be modern and engaging.
        `,
        ar: `
            أنشئ صورة عالية الجودة وواقعية لمنشور على وسائل التواصل الاجتماعي. يجب أن تكون الصورة مذهلة بصريًا وذات صلة ثقافية بالمملكة العربية السعودية.

            **فكرة المحتوى:** "${idea.idea}" - ${idea.description}.

            أنشئ صورة تجسد جوهر هذه الفكرة، وتتضمن شخصيات أو مناظر طبيعية أو أنماطًا سعودية عند الاقتضاء. يجب أن يكون المظهر الجمالي عصريًا وجذابًا.
        `
    }, language);

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

export const generateVoice = async (script: string, language: Language): Promise<string> => {
    const prompt = getBilingualPrompt({
        en: `
            Please read the following text clearly and with an engaging, professional tone suitable for a social media voiceover.
            
            Text: "${script.substring(0, 800)}"
        `,
        ar: `
            الرجاء قراءة النص التالي بوضوح وبنبرة احترافية وجذابة بلهجة سعودية، مناسبة للتعليق الصوتي على وسائل التواصل الاجتماعي.

            النص: "${script.substring(0, 800)}"
        `
    }, language);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' }, // A neutral, professional male voice suitable for both languages
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

export const generatePublishDescription = async (content: string, idea: ContentIdea, language: Language): Promise<string> => {
    const prompt = getBilingualPrompt({
        en: `
            Based on the following content for a "${idea.type}", write an engaging social media caption in English.
            The caption should be concise, include relevant hashtags for the Saudi market, and have a clear call-to-action.

            **Content:**
            ${content.substring(0, 1000)}...
        `,
        ar: `
            بناءً على المحتوى التالي لـ "${idea.type}"، اكتب تعليقًا جذابًا لوسائل التواصل الاجتماعي باللغة العربية.
            يجب أن يكون التعليق موجزًا، ويتضمن هاشتاجات ذات صلة بالسوق السعودي، وعبارة واضحة تحث المستخدم على اتخاذ إجراء.

            **المحتوى:**
            ${content.substring(0, 1000)}...
        `
    }, language);

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        if (!response.text) {
            throw new Error("Received an empty response from the AI for publish description.");
        }
        return response.text;
    } catch (error) {
        console.error("Error generating publish description:", error);
        throw new Error("Failed to generate description. Please try again.");
    }
};