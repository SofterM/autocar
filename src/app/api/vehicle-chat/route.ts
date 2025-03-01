import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';

// Define the message structure
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    // Verify user authentication
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบก่อนใช้งาน' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { message, history, vehicleInfo } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'กรุณาระบุข้อความ' },
        { status: 400 }
      );
    }

    // Enhanced system prompt with more specific guidance
    const systemPrompt = `คุณเป็นผู้เชี่ยวชาญด้านยานพาหนะที่ให้คำปรึกษาเกี่ยวกับปัญหารถยนต์ ชื่อ "รถดอกเตอร์"

บทบาทของคุณ:
1. วิเคราะห์อาการเสีย ปัญหา และสาเหตุที่เป็นไปได้ของยานพาหนะอย่างเป็นระบบ
2. แนะนำวิธีแก้ไขเบื้องต้นที่ผู้ใช้สามารถทำเองได้ (ถ้ามี)
3. ระบุว่าควรนำรถเข้าศูนย์บริการหรือไม่ และมีความเร่งด่วนเพียงใด

ลักษณะการตอบ:
- ใช้ภาษาที่เข้าใจง่าย เป็นกันเอง แต่แสดงความเชี่ยวชาญ
- แบ่งคำตอบเป็นส่วนๆ ชัดเจน: การวิเคราะห์ / สาเหตุที่เป็นไปได้ / คำแนะนำ
- หากเป็นกรณีฉุกเฉินหรืออันตราย ให้แจ้งเตือนอย่างชัดเจน
- รวมคำแนะนำเรื่องงบประมาณโดยประมาณสำหรับการซ่อมแซม (ถ้าประเมินได้)

เมื่อข้อมูลไม่เพียงพอ:
- ถามข้อมูลเพิ่มเติมที่จำเป็นต่อการวิเคราะห์ เช่น:
  * ยี่ห้อรถ รุ่น ปี
  * อาการเสียละเอียด (เมื่อเกิดขึ้น ความถี่ สถานการณ์)
  * เสียงผิดปกติ (ลักษณะเสียง ความดัง ตำแหน่ง)
  * ไฟเตือนที่ขึ้นบนหน้าปัด
  * การเปลี่ยนแปลงในการขับขี่
  * ประวัติการซ่อมบำรุงล่าสุด

ตอบเป็นภาษาไทยเสมอ`;

    // Format message history for the LLM
    const messages: Message[] = [
      {
        role: "system",
        content: systemPrompt
      }
    ];

    // Add vehicle information if available
    if (vehicleInfo) {
      messages.push({
        role: "system",
        content: `ข้อมูลรถของผู้ใช้: ${JSON.stringify(vehicleInfo)}`
      });
    }

    // Add conversation history
    if (history && Array.isArray(history)) {
      history.forEach((msg: Message) => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });
    }

    // Add current user message
    messages.push({
      role: "user",
      content: message
    });

    // Call Together AI API with improved error handling
    const togetherApiKey = process.env.TOGETHER_API_KEY;
    if (!togetherApiKey) {
      console.error("Missing API key for Together AI");
      return NextResponse.json(
        { error: "ขออภัย ระบบ AI ไม่พร้อมใช้งานชั่วคราว โปรดลองอีกครั้งในภายหลัง" },
        { status: 500 }
      );
    }

    try {
      const togetherResponse = await fetch("https://api.together.xyz/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${togetherApiKey}`
        },
        body: JSON.stringify({
          model: "mistralai/Mixtral-8x7B-Instruct-v0.1", 
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
          timeout: 30000 // 30-second timeout
        }),
        signal: AbortSignal.timeout(60000) // 60-second fetch timeout
      });

      if (!togetherResponse.ok) {
        const errorData = await togetherResponse.json().catch(() => ({}));
        console.error("Together API error:", errorData);
        
        // More specific error handling
        if (togetherResponse.status === 429) {
          return NextResponse.json(
            { error: "ระบบกำลังมีผู้ใช้งานจำนวนมาก โปรดลองอีกครั้งในอีกสักครู่" },
            { status: 429 }
          );
        }
        
        return NextResponse.json(
          { error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบ AI กรุณาลองใหม่อีกครั้ง" },
          { status: togetherResponse.status }
        );
      }

      const data = await togetherResponse.json();
      const aiResponse = data.choices[0].message.content;

      return NextResponse.json({ 
        response: aiResponse,
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1"
      });
      
    } catch (apiError) {
      console.error("API call error:", apiError);
      
      if (apiError instanceof Error && apiError.name === "AbortError") {
        return NextResponse.json(
          { error: "การเชื่อมต่อกับระบบ AI ใช้เวลานานเกินไป โปรดลองอีกครั้ง" },
          { status: 504 }
        );
      }
      
      return NextResponse.json(
        { error: "เกิดข้อผิดพลาดในการเชื่อมต่อ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตและลองอีกครั้ง" },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error("Vehicle chat error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}