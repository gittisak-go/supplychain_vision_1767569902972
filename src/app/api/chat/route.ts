import { NextRequest } from 'next/server';
import genAI from '@/lib/gemini';
import { aiContextService } from '@/services/aiContextService';

export const runtime = 'edge';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ 
          error: 'การตั้งค่า API Key ไม่ถูกต้อง กรุณาตรวจสอบการตั้งค่าระบบ' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'ข้อความไม่ถูกต้อง' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch real-time context data based on user query
    const lastMessage = messages[messages.length - 1].content;
    const realTimeContext = await aiContextService.getRelevantContext(lastMessage);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: `คุณคือผู้ช่วย AI สำหรับระบบวิเคราะห์ซัพพลายเชน GtsAlpha MCP 
      คุณช่วยให้คำแนะนำเกี่ยวกับ:
      - การวิเคราะห์ข้อมูลซัพพลายเชน
      - การติดตามการขนส่งแบบเรียลไทม์
      - การวิเคราะห์ประสิทธิภาพ
      - การวิเคราะห์ท่าเรือ
      - การจัดการฝูงยานพาหนะ
      - การจองและการเช่ารถ
      - คำแนะนำในการดำเนินงาน
      
      ${context ? `บริบทการสนทนา: ${context}` : ''}
      
      ## ข้อมูลแบบเรียลไทม์จากระบบ:
      ${realTimeContext}
      
      ใช้ข้อมูลแบบเรียลไทม์ข้างต้นในการตอบคำถามของผู้ใช้ให้แม่นยำและเป็นประโยชน์
      ตอบเป็นภาษาไทยเสมอ และให้ข้อมูลที่เป็นประโยชน์และตรงประเด็น
      เมื่อวิเคราะห์หรือให้คำแนะนำ ให้อิงจากข้อมูลจริงที่ระบุไว้ข้างต้น`
    });

    const history = messages.slice(0, -1).map((msg: Message) => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: history
    });

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
    const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการประมวลผล';
    return new Response(
      JSON.stringify({ error: `เกิดข้อผิดพลาด: ${errorMessage}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}