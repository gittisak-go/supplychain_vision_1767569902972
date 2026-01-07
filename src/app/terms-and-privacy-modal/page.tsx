'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

type DocumentTab = 'general-terms' | 'privacy-policy';

export default function TermsAndPrivacyModalPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DocumentTab>('general-terms');
  const [searchQuery, setSearchQuery] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const handleClose = () => {
    router.back();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = activeTab === 'general-terms' ? generalTermsContent : privacyPolicyContent;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAcceptAll = () => {
    setAcceptedTerms(true);
    setAcceptedPrivacy(true);
  };

  // Placeholder content - Replace with actual content from GitHub repo
  const generalTermsContent = `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">เงื่อนไขและข้อตกลงทั่วไป</h2>
        <p class="text-sm text-gray-600 mb-4">อัปเดตล่าสุด: มกราคม 2026</p>
      </div>

      <section>
        <h3 class="text-lg font-semibold text-gray-900 mb-3">1. การยอมรับข้อกำหนด</h3>
        <p class="text-gray-700 mb-4">
          ด้วยการเข้าถึงและใช้งานแพลตฟอร์ม GtsAlpha MCP ("บริการ"), คุณยอมรับและตกลงที่จะผูกพันตามข้อกำหนดและเงื่อนไขเหล่านี้ 
          หากคุณไม่เห็นด้วยกับข้อกำหนดเหล่านี้ กรุณาอย่าใช้บริการของเรา
        </p>
      </section>

      <section>
        <h3 class="text-lg font-semibold text-gray-900 mb-3">2. การใช้งานบริการ</h3>
        <p class="text-gray-700 mb-4">
          คุณตกลงที่จะใช้บริการเพื่อวัตถุประสงค์ที่ถูกกฎหมายเท่านั้น คุณจะไม่ใช้บริการในลักษณะที่:
        </p>
        <ul class="list-disc pl-6 space-y-2 text-gray-700">
          <li>ละเมิดกฎหมายหรือข้อบังคับใด ๆ</li>
          <li>ละเมิดสิทธิของบุคคลที่สาม</li>
          <li>ส่งข้อมูลที่เป็นอันตราย ผิดกฎหมาย หรือน่ารังเกียจ</li>
          <li>รบกวนหรือขัดขวางการทำงานของบริการ</li>
        </ul>
      </section>

      <section>
        <h3 class="text-lg font-semibold text-gray-900 mb-3">3. บัญชีผู้ใช้</h3>
        <p class="text-gray-700 mb-4">
          เมื่อสร้างบัญชี คุณมีหน้าที่รับผิดชอบในการรักษาความปลอดภัยของข้อมูลบัญชีของคุณและรับผิดชอบต่อกิจกรรมทั้งหมดที่เกิดขึ้นภายใต้บัญชีของคุณ
        </p>
      </section>

      <section>
        <h3 class="text-lg font-semibold text-gray-900 mb-3">4. ทรัพย์สินทางปัญญา</h3>
        <p class="text-gray-700 mb-4">
          เนื้อหา คุณลักษณะ และฟังก์ชันการทำงานของบริการเป็นของ GtsAlpha และได้รับการคุ้มครองโดยกฎหมายทรัพย์สินทางปัญญาระหว่างประเทศ
        </p>
      </section>

      <section>
        <h3 class="text-lg font-semibold text-gray-900 mb-3">5. การยกเลิกการใช้งาน</h3>
        <p class="text-gray-700 mb-4">
          เราขอสงวนสิทธิ์ในการระงับหรือยกเลิกการเข้าถึงของคุณต่อบริการโดยทันทีและโดยไม่ต้องแจ้งให้ทราบล่วงหน้าหากคุณฝ่าฝืนข้อกำหนดเหล่านี้
        </p>
      </section>

      <section>
        <h3 class="text-lg font-semibold text-gray-900 mb-3">6. การจำกัดความรับผิด</h3>
        <p class="text-gray-700 mb-4">
          GtsAlpha จะไม่รับผิดชอบต่อความเสียหายใด ๆ ที่เกิดขึ้นจากการใช้หรือไม่สามารถใช้บริการของเรา
        </p>
      </section>

      <section>
        <h3 class="text-lg font-semibold text-gray-900 mb-3">7. การเปลี่ยนแปลงข้อกำหนด</h3>
        <p class="text-gray-700 mb-4">
          เราขอสงวนสิทธิ์ในการแก้ไขข้อกำหนดเหล่านี้ได้ตลอดเวลา การใช้งานบริการต่อไปหลังจากการเปลี่ยนแปลงถือว่าคุณยอมรับข้อกำหนดที่แก้ไขแล้ว
        </p>
      </section>

      <section>
        <h3 class="text-lg font-semibold text-gray-900 mb-3">8. ติดต่อเรา</h3>
        <p class="text-gray-700 mb-4">
          หากคุณมีคำถามเกี่ยวกับข้อกำหนดเหล่านี้ กรุณาติดต่อเราที่:
        </p>
        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="text-gray-700"><strong>อีเมล:</strong> legal@gtsalpha.com</p>
          <p class="text-gray-700"><strong>โทรศัพท์:</strong> +66 2 123 4567</p>
        </div>
      </section>
    </div>
  `;

  const privacyPolicyContent = `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">นโยบายความเป็นส่วนตัว</h2>
        <p class="text-sm text-gray-600 mb-4">อัปเดตล่าสุด: มกราคม 2026</p>
      </div>

      <section>
        <h3 class="text-lg font-semibold text-gray-900 mb-3">1. ข้อมูลที่เราเก็บรวบรวม</h3>
        <p class="text-gray-700 mb-4">
          เราเก็บรวบรวมข้อมูลประเภทต่าง ๆ เพื่อให้บริการและปรับปรุงบริการของเรา:
        </p>
        <ul class="list-disc pl-6 space-y-2 text-gray-700">
          <li><strong>ข้อมูลส่วนบุคคล:</strong> ชื่อ, อีเมล, เบอร์โทรศัพท์, ที่อยู่</li>
          <li><strong>ข้อมูลการใช้งาน:</strong> หน้าที่เข้าชม, เวลาที่ใช้, การโต้ตอบกับบริการ</li>
          <li><strong>ข้อมูลทางเทคนิค:</strong> ที่อยู่ IP, ประเภทเบราว์เซอร์, ระบบปฏิบัติการ</li>
          <li><strong>ข้อมูลธุรกรรม:</strong> ประวัติการสั่งซื้อ, ข้อมูลการจัดส่ง</li>
        </ul>
      </section>

      <section>
        <h3 class="text-lg font-semibold text-gray-900 mb-3">2. วิธีการใช้ข้อมูลของคุณ</h3>
        <p class="text-gray-700 mb-4">
          เราใช้ข้อมูลที่เก็บรวบรวมเพื่อ:
        </p>
        <ul class="list-disc pl-6 space-y-2 text-gray-700">
          <li>จัดหาและบำรุงรักษาบริการของเรา</li>
          <li>แจ้งให้คุณทราบเกี่ยวกับการเปลี่ยนแปลงบริการ</li>
          <li>ให้การสนับสนุนลูกค้า</li>
          <li>ตรวจสอบและวิเคราะห์การใช้งานเพื่อปรับปรุงบริการ</li>
          <li>ตรวจจับ ป้องกัน และจัดการกับปัญหาทางเทคนิค</li>
        </ul>
      </section>

      <section>
        <h3 class="text-lg font-semibold text-gray-900 mb-3">3. การแบ่งปันข้อมูล</h3>
        <p class="text-gray-700 mb-4">
          เราจะไม่ขาย เช่า หรือแลกเปลี่ยนข้อมูลส่วนบุคคลของคุณกับบุคคลที่สาม เราอาจแบ่งปันข้อมูลของคุณในกรณีต่อไปนี้:
        </p>
        <ul class="list-disc pl-6 space-y-2 text-gray-700">
          <li>กับผู้ให้บริการที่ช่วยเราในการดำเนินธุรกิจ</li>
          <li>เพื่อปฏิบัติตามข้อกำหนดทางกฎหมาย</li>
          <li>เพื่อปกป้องสิทธิและความปลอดภัยของเราและผู้อื่น</li>
        </ul>
      </section>

      <section>
        <h3 class="text-lg font-semibold text-gray-900 mb-3">4. ความปลอดภัยของข้อมูล</h3>
        <p class="text-gray-700 mb-4">
          เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลส่วนบุคคลของคุณจากการเข้าถึง การใช้ หรือการเปิดเผยโดยไม่ได้รับอนุญาต
        </p>
      </section>

      <section>
        <h3 class="text-lg font-semibold text-gray-900 mb-3">5. สิทธิของคุณ</h3>
        <p class="text-gray-700 mb-4">
          คุณมีสิทธิ์ในการ:
        </p>
        <ul class="list-disc pl-6 space-y-2 text-gray-700">
          <li>เข้าถึงและรับสำเนาข้อมูลส่วนบุคคลของคุณ</li>
          <li>แก้ไขข้อมูลส่วนบุคคลที่ไม่ถูกต้อง</li>
          <li>ขอให้ลบข้อมูลส่วนบุคคลของคุณ</li>
          <li>คัดค้านหรือจำกัดการประมวลผลข้อมูลของคุณ</li>
          <li>ถอนความยินยอมในการประมวลผลข้อมูล</li>
        </ul>
      </section>

      <section>
        <h3 class="text-lg font-semibold text-gray-900 mb-3">6. คุกกี้และเทคโนโลยีการติดตาม</h3>
        <p class="text-gray-700 mb-4">
          เราใช้คุกกี้และเทคโนโลยีการติดตามที่คล้ายกันเพื่อติดตามกิจกรรมในบริการของเราและเก็บข้อมูลบางอย่าง คุณสามารถตั้งค่าเบราว์เซอร์ของคุณให้ปฏิเสธคุกกี้ทั้งหมดหรือระบุเมื่อมีการส่งคุกกี้
        </p>
      </section>

      <section>
        <h3 class="text-lg font-semibold text-gray-900 mb-3">7. การเปลี่ยนแปลงนโยบาย</h3>
        <p class="text-gray-700 mb-4">
          เราอาจอัปเดตนโยบายความเป็นส่วนตัวของเราเป็นครั้งคราว เราจะแจ้งให้คุณทราบถึงการเปลี่ยนแปลงใด ๆ โดยการโพสต์นโยบายใหม่ในหน้านี้
        </p>
      </section>

      <section>
        <h3 class="text-lg font-semibold text-gray-900 mb-3">8. ติดต่อเรา</h3>
        <p class="text-gray-700 mb-4">
          หากคุณมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ กรุณาติดต่อเราที่:
        </p>
        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="text-gray-700"><strong>อีเมล:</strong> privacy@gtsalpha.com</p>
          <p class="text-gray-700"><strong>โทรศัพท์:</strong> +66 2 123 4567</p>
        </div>
      </section>
    </div>
  `;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-gray-900">เอกสารทางกฎหมาย</h2>
            
            {/* Document Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('general-terms')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-smooth ${
                  activeTab === 'general-terms' ?'bg-white text-blue-600 shadow-sm' :'text-gray-600 hover:text-gray-900'
                }`}
              >
                เงื่อนไขทั่วไป
              </button>
              <button
                onClick={() => setActiveTab('privacy-policy')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-smooth ${
                  activeTab === 'privacy-policy' ?'bg-white text-blue-600 shadow-sm' :'text-gray-600 hover:text-gray-900'
                }`}
              >
                นโยบายความเป็นส่วนตัว
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative hidden md:block">
              <Icon
                name="MagnifyingGlassIcon"
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="ค้นหา..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-smooth"
              title="พิมพ์เอกสาร"
            >
              <Icon name="PrinterIcon" size={20} />
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-smooth"
              title="ดาวน์โหลดเอกสาร"
            >
              <Icon name="ArrowDownTrayIcon" size={20} />
            </button>

            {/* Close */}
            <button
              onClick={handleClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-smooth"
            >
              <Icon name="XMarkIcon" size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{
              __html: activeTab === 'general-terms' ? generalTermsContent : privacyPolicyContent
            }}
          />
        </div>

        {/* Footer - Acceptance */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="space-y-3">
            {/* Individual Checkboxes */}
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                ฉันได้อ่านและยอมรับ<strong>เงื่อนไขและข้อตกลงทั่วไป</strong>
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedPrivacy}
                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                ฉันได้อ่านและยอมรับ<strong>นโยบายความเป็นส่วนตัว</strong>
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-smooth font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAcceptAll}
                disabled={acceptedTerms && acceptedPrivacy}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-smooth font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ยอมรับทั้งหมด
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}