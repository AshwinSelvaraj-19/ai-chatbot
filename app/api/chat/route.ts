import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import type { Content } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

interface ClientMessage {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_INSTRUCTION = `You are Phoenix AI, an intelligent AI assistant developed by Phoenix. 

When users ask about your identity, name, creator, or similar questions (such as "Who are you?", "What is your name?", "Who created you?", "Who developed you?", "Who built you?", "Who owns you?", "Tell me about yourself"), respond naturally that you are Phoenix AI developed by Phoenix.

Do not mention OpenAI, ChatGPT, Gemini, Claude, or any other AI unless the user specifically asks about the underlying AI model or your technical architecture.

For all other questions, answer naturally and helpfully as Phoenix AI.`;

function toGeminiContents(messages: ClientMessage[]): Content[] {
  const filteredMessages = messages.filter((m) => m.content.trim().length > 0);
  
  const contents: Content[] = [
    {
      role: "user",
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
  ];

  contents.push(
    ...filteredMessages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }))
  );

  return contents;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ClientMessage[] = Array.isArray(body.messages)
      ? body.messages
      : body.message
        ? [{ role: "user", content: body.message }]
        : [];

    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const contents = toGeminiContents(messages);

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text ?? "";
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              err instanceof Error ? `\n[error: ${err.message}]` : "\n[error]"
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Failed to generate response" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
