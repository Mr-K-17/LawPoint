
import { GoogleGenAI, Type, Content } from "@google/genai";
import type { Lawyer, NewsArticle, Case } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAINews = async (): Promise<NewsArticle[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate an array of 12 recent and relevant news articles for a legal professional. Include a headline, a 2-3 sentence summary, a relevant stock image URL , the source URL, and a category. Ensure categories are very diverse, such as 'Corporate Law', 'Criminal Justice', 'Legal Tech', 'Human Rights', 'Intellectual Property', 'Real Estate Law', 'Family Law', 'Immigration', 'Environmental Law', 'Cyber Law'. Do not repeat categories if possible.",
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            articles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  headline: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  imageUrl: { type: Type.STRING },
                  sourceUrl: { type: Type.STRING },
                  category: { type: Type.STRING },
                },
                required: ['headline', 'summary', 'imageUrl', 'sourceUrl', 'category'],
              },
            },
          },
          required: ['articles'],
        },
      },
    });

    const jsonString = response.text;
    const result = JSON.parse(jsonString);
    return result.articles || [];
  } catch (error) {
    console.error("Error fetching AI news:", error);
    return [];
  }
};

export const getLawBotResponse = async (history: Content[]): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: history,
            // FIX: The system instruction must be nested inside a `systemInstruction` property.
            config: {
                 systemInstruction: "You are LawBot, an expert AI assistant specializing in international and common law. Answer questions accurately and concisely. Cite relevant sections or acts where possible. Your tone should be professional and helpful.",
            }
        });

        return response.text;

    } catch (error) {
        console.error("Error getting LawBot response:", error);
        return "Sorry, I am having trouble responding right now.";
    }
};


export const getAIRecommendations = async (clientCase: Omit<Case, 'id' | 'clientId' | 'lawyerId'>, lawyers: Lawyer[]): Promise<{ lawyerId: string; rank: number }[]> => {
    if (!clientCase || lawyers.length === 0) {
        return [];
    }

    const simplifiedLawyers = lawyers.map(l => ({
        id: l.id,
        specialization: l.specialization,
        experienceYears: l.experienceYears,
        successRate: l.casesWon + l.casesLost > 0 ? Math.round((l.casesWon / (l.casesWon + l.casesLost)) * 100) : 0,
        avgPrice: l.avgPrice,
        bio: l.bio
    }));
    
    const prompt = `
      As an expert legal matchmaking AI, your task is to recommend the top 3 most suitable lawyers for a client's specific case.
      
      Client's Case Details:
      - Case Type: "${clientCase.caseType}"
      - Urgency: "${clientCase.urgency}"
      - Description: "${clientCase.description}"
      
      Available Lawyers:
      ${JSON.stringify(simplifiedLawyers, null, 2)}
      
      Analyze the lawyers based on the following criteria, in order of importance:
      1.  **Specialization Match:** The lawyer's specializations must closely match the client's case type. This is the most critical factor.
      2.  **Success Rate:** A higher success rate is strongly preferred.
      3.  **Experience:** More years of experience in relevant fields are better.
      4.  **Price:** A lower average fee per case is a positive factor but less important than expertise and success.
      
      Your response must be a JSON object containing a single key "recommendations", which is an array of objects. Each object must have a "lawyerId" and a "rank" (from 1 to 3). Return only the top 3 matches in ranked order.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        recommendations: {
                            type: Type.ARRAY,
                            description: "An array of the top 3 recommended lawyer objects, each with an ID and a rank.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    lawyerId: { type: Type.STRING },
                                    rank: { type: Type.NUMBER }
                                },
                                required: ["lawyerId", "rank"]
                            }
                        }
                    },
                    required: ['recommendations'],
                }
            }
        });

        const jsonString = response.text;
        const result = JSON.parse(jsonString);
        return result.recommendations || [];
    } catch (error) {
        console.error("Error getting AI recommendations:", error);
        return [];
    }
};
