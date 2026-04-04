import { ChatGoogle } from "@langchain/google";
import { StringOutputParser } from "@langchain/core/output_parsers";
import "dotenv/config"

const llm = new ChatGoogle({
    model: "gemini-2.5-flash-lite",
    apiKey: process.env.GEMINI_API_KEY,
});

export const generateTagsAndDescription = async (text = "") => {
    try {
        if (!text || !text.trim()) {
            return { tags: [], description: "" };
        }

        const prompt = `
You are an AI assistant for a knowledge management app.

Return ONLY valid JSON.

Generate:
- 5 short tags (1-2 words each)
- 1 clear summary sentence

Content:
${text}

Output format:
{
  "tags": ["tag1","tag2","tag3","tag4","tag5"],
  "description": "short summary"
}
`;

        const parser = new StringOutputParser();
        const chain = llm.pipe(parser);

        const response = await chain.invoke(prompt);

        // 🔥 SAFE JSON extraction (important fix)
        const jsonMatch = response.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            return { tags: [], description: "" };
        }

        const parsed = JSON.parse(jsonMatch[0]);

        return {
            tags: Array.isArray(parsed?.tags) ? parsed.tags : [],
            description: typeof parsed?.description === "string"
                ? parsed.description
                : "",
        };

    } catch (error) {
        console.error("AI ERROR:", error);
        return { tags: [], description: "" };
    }
};