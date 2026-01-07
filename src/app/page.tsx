'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TruckIcon, ChartBarIcon, MapIcon, ShieldCheckIcon, ClockIcon, UsersIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
  onSwitchMode: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode, onSwitchMode }) => {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setError(error.message);
        } else {
          // Successfully logged in - just close modal, no redirect
          onClose();
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          setError(error.message);
        } else {
          // Successfully signed up - just close modal, no redirect
          onClose();
        }
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดที่ไม่คาดคิด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <TruckIcon className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {mode === 'login' ? 'ลงชื่อเข้าใช้งาน' : 'สมัครสมาชิก'}
          </h2>
          <p className="text-gray-600 mt-2">
            {mode === 'login' ? 'เข้าสู่ระบบเพื่อเริ่มใช้งาน' : 'สร้างบัญชีใหม่เพื่อเริ่มต้น'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start">
            <span className="mr-2">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อ-นามสกุล
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="กรอกชื่อ-นามสกุล"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              อีเมล
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รหัสผ่าน
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังดำเนินการ...
              </span>
            ) : (
              mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {mode === 'login' ? 'ยังไม่มีบัญชี?' : 'มีบัญชีอยู่แล้ว?'}
            <button
              onClick={onSwitchMode}
              className="ml-2 text-orange-600 font-semibold hover:text-orange-700 transition-colors"
            >
              {mode === 'login' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({
    isOpen: false,
    mode: 'login'
  });
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  const handleLogin = () => {
    setAuthModal({ isOpen: true, mode: 'login' });
  };

  const handleSignup = () => {
    setAuthModal({ isOpen: true, mode: 'signup' });
  };

  const features = [
    {
      icon: ChartBarIcon,
      title: 'วิเคราะห์แบบเรียลไทม์',
      description: 'ติดตามและวิเคราะห์ข้อมูลซัพพลายเชนแบบเรียลไทม์พร้อม Dashboard ที่ครบถ้วน'
    },
    {
      icon: MapIcon,
      title: 'ติดตามการจัดส่ง',
      description: 'ติดตามสถานะการจัดส่งและเส้นทางการขนส่งแบบละเอียดทุกขั้นตอน'
    },
    {
      icon: ShieldCheckIcon,
      title: 'ปลอดภัยและเชื่อถือได้',
      description: 'ระบบรักษาความปลอดภัยระดับสูงพร้อมการสำรองข้อมูลอัตโนมัติ'
    },
    {
      icon: ClockIcon,
      title: 'ประหยัดเวลา',
      description: 'ลดเวลาในการจัดการและติดตามงานได้มากกว่า 60%'
    },
    {
      icon: UsersIcon,
      title: 'ทำงานร่วมกันได้',
      description: 'ทีมทำงานสามารถแชร์ข้อมูลและประสานงานได้อย่างมีประสิทธิภาพ'
    },
    {
      icon: TruckIcon,
      title: 'จัดการยานพาหนะ',
      description: 'ระบบจัดการยานพาหนะและการบำรุงรักษาแบบครบวงจร'
    }
  ];

  const stats = [
    { label: 'ยานพาหนะที่จัดการ', value: '500+', suffix: 'คัน' },
    { label: 'การจัดส่งต่อวัน', value: '10,000+', suffix: 'รายการ' },
    { label: 'ความพึงพอใจลูกค้า', value: '4.9', suffix: '/5.0' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-sm z-40 border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3 cursor-pointer">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
                <TruckIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">GtsAlpha MCP</h1>
                <p className="text-xs text-gray-600">Supply Chain Management</p>
              </div>
            </Link>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLogin}
                className="px-5 py-2 text-gray-700 font-medium hover:text-orange-600 transition-colors"
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={handleSignup}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-md"
              >
                สมัครสมาชิก
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-orange-100 rounded-full">
              <span className="text-orange-700 font-semibold text-sm">🚚 ระบบจัดการซัพพลายเชนที่ทันสมัย</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              จัดการซัพพลายเชน<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-700">
                อย่างมีประสิทธิภาพ
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              ระบบวิเคราะห์และติดตามซัพพลายเชนแบบเรียลไทม์ 
              ช่วยให้คุณจัดการยานพาหนะ การจัดส่ง และคลังสินค้าได้อย่างมีประสิทธิภาพสูงสุด
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleSignup}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                เริ่มต้นใช้งานฟรี
              </button>
              <button
                onClick={handleLogin}
                className="px-8 py-4 bg-white text-gray-700 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all border-2 border-gray-200 hover:border-orange-500"
              >
                ดูตัวอย่างระบบ
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              ✓ ไม่ต้องใช้บัตรเครดิต · ✓ ใช้งานได้ทันที · ✓ ยกเลิกได้ตลอดเวลา
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            {stats.map((stat, index) => (
              <div key={index} className="p-6">
                <div className="text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-orange-100 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ฟีเจอร์ที่ครบถ้วน
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              เครื่องมือที่คุณต้องการสำหรับการจัดการซัพพลายเชนทั้งหมดในที่เดียว
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 bg-gradient-to-br from-white to-orange-50 rounded-2xl hover:shadow-xl transition-all border border-orange-100 hover:border-orange-300 group"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-100 rounded-xl mb-5 group-hover:bg-orange-500 transition-colors">
                  <feature.icon className="w-7 h-7 text-orange-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50 to-white">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-12 text-center shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-6">
              พร้อมที่จะเริ่มต้นแล้วหรือยัง?
            </h2>
            <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              ลงทะเบียนวันนี้และเริ่มปรับปรุงประสิทธิภาพซัพพลายเชนของคุณได้ทันที
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleSignup}
                className="px-8 py-4 bg-white text-orange-600 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg"
              >
                สมัครสมาชิกฟรี
              </button>
              <button
                onClick={handleLogin}
                className="px-8 py-4 bg-transparent text-white rounded-lg text-lg font-semibold hover:bg-white/10 transition-all border-2 border-white"
              >
                เข้าสู่ระบบ
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
                  <TruckIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">GtsAlpha MCP</h3>
                  <p className="text-sm text-gray-400">Supply Chain Management</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                ระบบจัดการซัพพลายเชนที่ทันสมัยและมีประสิทธิภาพ 
                ช่วยให้ธุรกิจของคุณเติบโตอย่างยั่งยืน
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">บริการ</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">จัดการซัพพลายเชน</a></li>
                <li><a href="#" className="hover:text-white transition-colors">ติดตามการจัดส่ง</a></li>
                <li><a href="#" className="hover:text-white transition-colors">วิเคราะห์ข้อมูล</a></li>
                <li><a href="#" className="hover:text-white transition-colors">จัดการยานพาหนะ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">ติดต่อเรา</h4>
              <ul className="space-y-2 text-sm">
                <li>อีเมล: info@gtsalpha.in.th</li>
                <li>โทร: 02-xxx-xxxx</li>
                <li>Line: @gtsalpha</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2026 GtsAlpha MCP. สงวนลิขสิทธิ์ทั้งหมด</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        mode={authModal.mode}
        onSwitchMode={() => setAuthModal({ ...authModal, mode: authModal.mode === 'login' ? 'signup' : 'login' })}
      />
    </div>
  );
}