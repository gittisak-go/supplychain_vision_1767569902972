import { NextRequest } from 'next/server';
import genAI from '@/lib/gemini';

export const runtime = 'edge';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'ข้อความไม่ถูกต้อง' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
      systemInstruction: `คุณคือผู้ช่วย AI สำหรับระบบวิเคราะห์ซัพพลายเชน GtsAlpha MCP 
      คุณช่วยให้คำแนะนำเกี่ยวกับ:
      - การวิเคราะห์ข้อมูลซัพพลายเชน
      - การติดตามการขนส่งแบบเรียลไทม์
      - การวิเคราะห์ประสิทธิภาพ
      - การวิเคราะห์ท่าเรือ
      - คำแนะนำในการดำเนินงาน
      
      ${context ? `บริบทปัจจุบัน: ${context}` : ''}
      
      ตอบเป็นภาษาไทยเสมอ และให้ข้อมูลที่เป็นประโยชน์และตรงประเด็น`
    });

    const history = messages.slice(0, -1).map((msg: Message) => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: history
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessageStream(lastMessage);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Error in stream:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(
      JSON.stringify({ error: 'เกิดข้อผิดพลาดในการประมวลผล' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}