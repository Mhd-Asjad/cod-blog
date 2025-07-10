"use client";

import generateResponse from "@/utils/genai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef, useState, useEffect } from "react";
import { formatTextToJSX } from "@/utils/formatText";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, X } from "lucide-react";
import { motion } from "motion/react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await generateResponse(input);
      const aiMessage = { role: "assistant", content: res };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoSuggestions = async (suggestion) => {
    setInput(suggestion);
    await handleSubmit({ preventDefault: () => {} });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const suggestions = [
    "Write an engaging blog intro about web development",
    "Create 5 catchy headlines for a tech article",
    "Generate SEO-friendly meta descriptions",
    "Help me improve given paragraph's readability",
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      {!isOpen && (
        <div className="absolute z-10 right-10 bottom-10">
          <div className="relative">
            <div
              className={`absolute inset-0 rounded-full bg-purple-400 opacity-75 animate-ping ${
                isOpen ? "hidden" : ""
              }`}
            ></div>

            <div className="absolute inset-0 rounded-full bg-purple-400 opacity-20 blur-md"></div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`relative h-14 w-14 rounded-full shadow-lg transform transition-all duration-300 ease-out hover:scale-110 active:scale-95 ${
                isOpen
                  ? "bg-red-500 hover:bg-red-600 rotate-90"
                  : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              } text-white`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={`transform transition-all duration-300 ${
                    isOpen ? "rotate-180 scale-110" : "scale-100"
                  }`}
                >
                  {isOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Bot className="h-6 w-6" />
                  )}
                </div>
              </div>
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="absolute inset-0 rounded-full bg-white opacity-0 transform scale-0 transition-all duration-300 hover:opacity-20 hover:scale-100"></div>
              </div>
            </button>
            {!isOpen && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
                <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-300"></div>
                <div className="absolute -top-2 left-1 w-1 h-1 bg-pink-400 rounded-full animate-bounce delay-500"></div>
              </div>
            )}
          </div>
        </div>
      )}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-full max-w-xs sm:max-w-sm md:w-96 h-[500px] z-50">
          <Card className="h-full flex flex-col shadow-2xl border-purple-300 dark:border-purple-800 bg-white dark:bg-gray-800">
            <CardHeader className=" dark:text-white ">
              <CardTitle className="text-lg font-semibold text-center">
                CODBLOG AI Assistant
              </CardTitle>
              <div
                onClick={() => setIsOpen(!isOpen)}
                className="absolute right-6 cursor-pointer"
                aria-label="Close chatbot"
              >
                <X />
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex-col items-center z-50">
                    <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center ">
                      <div className="relative w-14 h-14 mx-auto ">
                        <div className="absolute inset-0 rounded-full bg-purple-400 opacity-75 animate-ping "></div>

                        <div className="absolute inset-0 rounded-full bg-purple-400 opacity-20 blur-md "></div>

                        <div className="relative h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                              animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse",
                              }}
                            >
                              <Bot className="h-6 w-6 text-white" />
                            </motion.div>
                          </div>

                          {/* Hover effect layer */}
                          <div className="absolute inset-0 rounded-full overflow-hidden">
                            <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 group-hover:scale-100 transition-all duration-300"></div>
                          </div>
                        </div>

                        {/* Floating particles */}
                        <div className="absolute inset-0 pointer-events-none">
                          <motion.div
                            className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"
                            animate={{
                              y: [0, -5, 0],
                              opacity: [0.8, 1, 0.8],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatType: "reverse",
                            }}
                          ></motion.div>
                          <motion.div
                            className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-400 rounded-full"
                            animate={{
                              y: [0, 5, 0],
                              opacity: [0.8, 1, 0.8],
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              repeatType: "reverse",
                              delay: 0.5,
                            }}
                          ></motion.div>
                          <motion.div
                            className="absolute -top-2 left-1 w-1 h-1 bg-pink-400 rounded-full"
                            animate={{
                              y: [0, -8, 0],
                              opacity: [0.6, 1, 0.6],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              repeatType: "reverse",
                              delay: 0.8,
                            }}
                          ></motion.div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center h-full text-gray-500">
                      Start a conversation with the AI
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[280px] rounded-lg px-3 py-2 text-sm ${
                            message.role === "user"
                              ? "bg-purple-500 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {formatTextToJSX(message.content)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"></div>
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce delay-100"></div>
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce delay-200"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              {messages.length === 0 && (
                <div className="p-4 pt-0">
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
                      Quick suggestions:
                    </p>
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-auto py-2 px-2 text-center border-purple-200  hover:bg-purple-50 dark:hover:bg-purple-700 hover:border-purple-300 dark:hover:border-purple-600 text-black dark:text-white"
                        onClick={() => handleAutoSuggestions(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    onKeyPress={(e) => e.key === "Enter" && handleSubmit(e)}
                    className="flex-1 text-sm border-purple-200  focus:border-purple-500 ring-0 focus:ring-purple-500 dark:focus:border-purple-400 dark:focus:ring-purple-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                  />
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading || !input.trim()}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 text-sm font-medium disabled:bg-gray-400 dark:disabled:bg-purple-400"
                  >
                    {isLoading ? "..." : "Send"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
