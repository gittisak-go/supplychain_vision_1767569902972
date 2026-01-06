import React from 'react';
import Header from '@/components/common/Header';
import SidebarNavigation from '@/components/common/SidebarNavigation';
import MobileNavigation from '@/components/common/MobileNavigation';
import AIAssistantChatInteractive from './components/AIAssistantChatInteractive';

export const metadata = {
  title: 'แชทกับ AI ผู้ช่วย - GtsAlpha MCP',
  description: 'แชทกับผู้ช่วย AI สำหรับการวิเคราะห์ซัพพลายเชนและคำแนะนำในการดำเนินงาน',
};

export default function AIAssistantChatPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarNavigation />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-hidden">
          <AIAssistantChatInteractive />
        </main>
      </div>

      <MobileNavigation />
    </div>
  );
}