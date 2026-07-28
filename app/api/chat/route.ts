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

function toGeminiContents(messages: ClientMessage[]): Content[] {
  return messages
    .filter((m) => m.content.trim().length > 0)
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
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
