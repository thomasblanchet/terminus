import clsx from "clsx";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Check, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MultiLineInput } from "@/components/ui/multi-line-input";

interface Message {
  sender: "user" | "assistant";
  content: string;
}

const initialMessage: Message[] = {
  sender: "assistant",
  content:
    "Hi! 👋 I am your AI assistant. 🤖\n\nI am here to help with questions with the command line shell. Terminus keeps me updated with your actions while using the shell, so I can provide you with context-aware help.\n\nHow can I help you today?",
};

export function Assistant() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState<string>("");

  const handleSend = async () => {
    if (!input.trim()) {
      return;
    }

    const userMessage: Message = { sender: "user", content: input };
    setMessages((prevMessages) => [userMessage, ...prevMessages]);
    setInput("");

    const assistantResponse = await getAssistantResponse(input);
    const assistantMessage: Message = {
      sender: "assistant",
      content: assistantResponse,
    };
    setMessages((prevMessages) => [assistantMessage, ...prevMessages]);
  };

  const getAssistantResponse = async (message: string): Promise<string> => {
    // Simulated API call - replace this with actual logic to communicate with the AI assistant
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("This is a response from the AI assistant.");
      }, 1000);
    });
  };

  return (
    <Card className="border-none h-full p-4 flex flex-col space-y-2">
      <div className="flex flex-col-reverse flex-grow overflow-y-auto overflow-x-hidden px-2 py-1 border shadow-inner rounded-sm bg-primary-foreground">
        <div className="flex-grow" />
        {messages.map((msg, index) => (
          <div
            key={index}
            className={clsx(
              "py-2 px-3 my-1 rounded-xl shadow-sm border text-sm max-w-[80%] whitespace-pre-line break-words",
              msg.sender === "user"
                ? "bg-primary text-primary-foreground self-end"
                : "bg-background text-foreground self-start",
            )}
          >
            {msg.content}
          </div>
        ))}
        <div className="text-xs text-muted-foreground text-center py-2 font-mono">
          Sun Sep 12 2021 14:32:45pm
        </div>
      </div>
      <div className="flex items-center">
        <div className="flex w-full items-center space-x-2">
          <MultiLineInput
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask your question..."
            value={input}
            className="transition"
          />
          <Button onClick={handleSend} className="px-[10px]">
            <Send />
          </Button>
          <Button className="px-[10px]">
            <RotateCcw />
          </Button>
        </div>
      </div>
    </Card>
  );
}
