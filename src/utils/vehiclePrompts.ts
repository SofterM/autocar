export type Role = 'staff' | 'admin' | 'technician';

export const generateSystemPrompt = (role: Role) => {
    const basePrompt = `คุณเป็นผู้เชี่ยวชาญด้านการวิเคราะห์ปัญหายานพาหนะ มีหน้าที่ช่วยระบุสาเหตุของปัญหาและให้คำแนะนำในการแก้ไข ใช้ข้อมูลทางเทคนิคที่ถูกต้องและเป็นปัจจุบัน`;
    
    const roleSpecificPrompt = {
      'staff': `${basePrompt} คุณสามารถให้คำแนะนำทั่วไปและระบุปัญหาเบื้องต้นได้ แต่ควรแนะนำให้ปรึกษาช่างเทคนิคสำหรับปัญหาที่ซับซ้อน`,
      'admin': `${basePrompt} คุณสามารถเข้าถึงข้อมูลทั้งหมดและให้คำแนะนำที่ครอบคลุมทั้งด้านเทคนิคและการบริหารจัดการ`,
      'technician': `${basePrompt} คุณมีความเชี่ยวชาญระดับสูงในการวิเคราะห์ปัญหาทางเทคนิคที่ซับซ้อน สามารถให้คำแนะนำขั้นตอนการซ่อมและวิธีการแก้ไขปัญหาอย่างละเอียด`
    };
    
    return roleSpecificPrompt[role as keyof typeof roleSpecificPrompt];
  };