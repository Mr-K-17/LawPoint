const AI_CONFIG = {
    PROVIDER: process.env.AI_PROVIDER || 'openai',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    MODEL: 'gpt-4',
    MAX_TOKENS: 500,
    TEMPERATURE: 0.7,

    CHATBOT_SYSTEM_PROMPT: `You are LawBot, an expert AI assistant specializing in Indian law.
    Provide accurate, helpful legal information. Always mention consulting a lawyer for specific cases.
    Cite relevant sections and acts when applicable.
    Keep responses concise and professional.`,

    NEWS_PROMPT: `Generate 8 recent legal news headlines for India covering criminal law, court updates, etc.
    Return as JSON array with fields: title, category, description, date, source`
};

export const isAIConfigured = () => {
    return AI_CONFIG.OPENAI_API_KEY || AI_CONFIG.GEMINI_API_KEY;
};

export default AI_CONFIG;