import { GoogleGenerativeAI } from "@google/generative-ai";

const genAi = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const aiModel = genAi.getGenerativeModel({ model: "gemini-2.0-flash" });

const generateResponse = async (prompt) => {
  try {
    const validationPrompt = `
      Analyze if the following question is related to blogging, content creation, 
      writing, or digital publishing. Only respond with "true" or "false":
      
      "${prompt}"
    `;

    const validationResult = await aiModel.generateContent(validationPrompt);
    const validationResponse = await validationResult.response;
    const isValidQuestion = validationResponse.text().trim().toLowerCase() === "true";

    if (!isValidQuestion) {
      return "I'm sorry, I can only assist with questions related to blogging, content creation, and writing. Please ask me something about creating or managing blog content!";
    }

    const blogExpertPrompt = `
      You are an expert blogging assistant. Help with the following blog-related question.
      Keep responses professional, helpful, and focused on blogging best practices.
      If the question is unclear, ask for clarification.
      
      Question: "${prompt}"
      
      Response:
    `;

    const result = await aiModel.generateContent(blogExpertPrompt);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error("Error generating response:", error);
    return "Sorry, I encountered an error. Please try again with a blog-related question.";
  }
};

export default generateResponse;