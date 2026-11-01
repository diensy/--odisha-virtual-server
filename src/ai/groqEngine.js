import Groq from 'groq-sdk';
import { env } from '../config/env.js';
import { groqTools } from './tools/definitions.js';
import { executeTool } from './tools/executors.js';

const MAX_TOOL_ROUNDS = 4;

let client;
const getClient = () => (client ??= new Groq({ apiKey: env.GROQ_API_KEY, timeout: 45000, maxRetries: 1 }));

/**
 * Runs the model with tool calling until it produces a final answer.
 * The model only chooses tools and writes the reply; the server validates and executes
 * every call. Returns the reply text, the UI blocks from tool results and a call log.
 */
export async function runGroq({ instructions, history, message, ctx }) {
  const messages = [
    { role: 'system', content: instructions },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ];
  const blocks = [];
  const toolCalls = [];

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round += 1) {
    const completion = await getClient().chat.completions.create({
      model: env.GROQ_MODEL,
      messages,
      tools: groqTools,
      // Forbid further tool calls on the last round so the loop always ends with text.
      tool_choice: round < MAX_TOOL_ROUNDS ? 'auto' : 'none',
      temperature: 0.3,
      max_completion_tokens: 1200,
    });

    const reply = completion.choices[0]?.message;
    const calls = reply?.tool_calls ?? [];
    if (!calls.length) {
      return { text: reply?.content?.trim() || '', blocks, toolCalls };
    }

    messages.push({ role: 'assistant', content: reply.content ?? '', tool_calls: calls });
    // Run sequentially: booking tools update shared conversation state.
    for (const call of calls) {
      let args;
      try {
        args = JSON.parse(call.function.arguments || '{}');
      } catch {
        args = null;
      }
      const result = await executeTool(call.function.name, args, ctx);
      toolCalls.push({ name: call.function.name, args: result.args ?? null, ok: result.ok });
      if (result.block) blocks.push(result.block);
      messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result.forModel) });
    }
  }

  return { text: '', blocks, toolCalls };
}
