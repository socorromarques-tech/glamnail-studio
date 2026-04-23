import { NextResponse } from "next/server";
import { getOpenAI, getSystemPrompt, tools, callTool } from "@/lib/ai/client";
import { z } from "zod";

const chatSchema = z.object({
  message: z.string().min(1),
  phone: z.string().optional(),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .optional()
    .default([]),
});

interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key não configurada" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const result = chatSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Mensagem inválida" }, { status: 400 });
    }

    const { message, conversationHistory } = result.data;

    const messages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }> = [
      { role: "system", content: getSystemPrompt() },
      ...conversationHistory.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const openai = getOpenAI();
    if (!openai) return NextResponse.json({ error: "AI not configured" }, { status: 503 });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools: tools.map((t) => ({
        type: "function" as const,
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      })),
      tool_choice: "auto",
      temperature: 0.7,
    });

    const choice = response.choices[0];
    const toolCalls = choice.message?.tool_calls || [];
    const assistantMessage = choice.message?.content || "";

    let finalResponse = assistantMessage;

    for (const toolCall of toolCalls as ToolCall[]) {
      const { name, arguments: argsStr } = toolCall.function;
      const args = JSON.parse(argsStr);

      const toolResult = await callTool(name, args);
      finalResponse = toolResult;
    }

    return NextResponse.json({
      response: finalResponse,
      usage: response.usage,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Erro ao processar mensagem" },
      { status: 500 },
    );
  }
}
