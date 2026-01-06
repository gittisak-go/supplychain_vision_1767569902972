'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { TruckIcon, MapPinIcon, CreditCardIcon, XMarkIcon, ClockIcon, ShieldCheckIcon, PhoneIcon } from '@heroicons/react/24/outline';

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
          router.push('/car-rental');
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          setError(error.message);
        } else {
          router.push('/signup-confirmation');
        }
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดที่ไม่คาดคิด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          {mode === 'login' ? 'ลงชื่อเข้าใช้งาน' : 'สมัครสมาชิก'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50"
          >
            {loading ? 'กำลังดำเนินการ...' : mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {mode === 'login' ? 'ยังไม่มีบัญชี?' : 'มีบัญชีอยู่แล้ว?'}
            <button
              onClick={onSwitchMode}
              className="ml-2 text-orange-600 font-semibold hover:text-orange-700"
            >
              {mode === 'login' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({
    isOpen: false,
    mode: 'login'
  });
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/car-rental');
    } else {
      router.push('/car-rental');
    }
  };

  const handleLogin = () => {
    setAuthModal({ isOpen: true, mode: 'login' });
  };

  const benefits = [
    {
      icon: TruckIcon,
      title: 'รับ-ส่งฟรีถึงมือ',
      description: 'บริการรับ-ส่งรถฟรีทั้งสนามบินและในเมือง ไม่ต้องเสียเวลาเดินทางมารับรถ'
    },
    {
      icon: CreditCardIcon,
      title: 'ไม่ต้องมีบัตรเครดิต',
      description: 'เช่ารถกับเราง่ายๆ ไม่ต้องมีบัตรเครดิต เพียงแค่มีบัตรประชาชน'
    },
    {
      icon: MapPinIcon,
      title: 'ครอบคลุมทั่วประเทศไทย',
      description: 'บริการเช่ารถทั่วประเทศไทย จากกรุงเทพฯ ไปจนถึงจังหวัดชายแดน'
    }
  ];

  const stats = [
    { label: 'รถให้เช่า', value: '500+' },
    { label: 'ลูกค้าใช้บริการ', value: '10,000+' },
    { label: 'ความพึงพอใจ', value: '4.9/5' }
  ];

  const features = [
    {
      icon: ClockIcon,
      title: 'จองง่าย รวดเร็ว',
      description: 'จองรถออนไลน์ได้ตลอด 24 ชั่วโมง ยืนยันทันที'
    },
    {
      icon: ShieldCheckIcon,
      title: 'ประกันภัยครอบคลุม',
      description: 'รถทุกคันมีประกันภัยชั้น 1 พร้อมความคุ้มครองเต็มรูปแบบ'
    },
    {
      icon: PhoneIcon,
      title: 'บริการ 24/7',
      description: 'ทีมงานพร้อมให้บริการและช่วยเหลือตลอด 24 ชั่วโมง'
    }
  ];

  const locations = [
    'กรุงเทพฯ',
    'เชียงใหม่',
    'ภูเก็ต',
    'พัทยา',
    'หัวหิน',
    'เกาะสมุย'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <TruckIcon className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-gray-900">เช่ารถไทยแลนด์</span>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <button
                onClick={() => router.push('/car-rental')}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                เลือกรถ
              </button>
            ) : (
              <>
                <button
                  onClick={handleLogin}
                  className="text-gray-700 font-medium hover:text-orange-600 transition-colors"
                >
                  เข้าสู่ระบบ
                </button>
                <button
                  onClick={handleGetStarted}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                >
                  เช่ารถเลย
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Thai imagery */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/thai-pattern.png')] bg-repeat"></div>
        </div>
        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <div className="inline-block mb-4 px-4 py-2 bg-orange-50 rounded-full">
            <span className="text-orange-600 font-semibold">🚗 บริการเช่ารถคุณภาพทั่วประเทศไทย</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            เช่ารถในไทย<br />
            <span className="text-orange-600">ง่าย สะดวก ปลอดภัย</span><br />
            ราคาคุ้มค่า
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            รถหลากหลายรุ่น พร้อมบริการรับ-ส่งฟรี ไม่ต้องมีบัตรเครดิต 
            ครอบคลุมทุกจังหวัดในประเทศไทย
          </p>
          
          {/* Quick Search Box */}
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">สถานที่รับรถ</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                  {locations.map((loc) => (
                    <option key={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">วันรับรถ</label>
                <input type="date" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">วันคืนรถ</label>
                <input type="date" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" />
              </div>
              <div className="col-span-1 flex items-end">
                <button
                  onClick={handleGetStarted}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105"
                >
                  ค้นหารถ
                </button>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500">⚡ รับรถได้ทันที · 💳 ไม่ต้องมีบัตรเครดิต · 🚚 รับ-ส่งฟรี</p>
        </div>
      </section>

      {/* Popular Locations */}
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            ให้บริการทั่วประเทศไทย
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {locations.map((location) => (
              <button
                key={location}
                onClick={handleGetStarted}
                className="p-4 bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-lg hover:shadow-lg transition-all text-center font-semibold text-gray-800 hover:text-orange-600"
              >
                <MapPinIcon className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                {location}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            ทำไมต้องเช่ากับเรา
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            บริการเช่ารถที่ดีที่สุดในประเทศไทย พร้อมความสะดวกสบายและราคาย่อมเยา
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="p-8 bg-gradient-to-br from-orange-50 to-white rounded-xl hover:shadow-xl transition-shadow border border-orange-100"
              >
                <benefit.icon className="w-12 h-12 text-orange-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-orange-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            บริการของเรา
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                  <feature.icon className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Car Types Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            รถหลากหลายรุ่น
          </h2>
          <p className="text-center text-gray-600 mb-12">
            เลือกรถที่เหมาะกับการเดินทางของคุณ
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {['รถเก๋งอีโคคาร์', 'รถเก๋งซีดาน', 'รถ SUV', 'รถตู้'].map((type) => (
              <div key={type} className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
                <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <TruckIcon className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{type}</h3>
                <p className="text-sm text-gray-600 mb-4">เริ่มต้น 800 บาท/วัน</p>
                <button
                  onClick={handleGetStarted}
                  className="w-full bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                >
                  เช่าเลย
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            พร้อมที่จะออกเดินทางแล้วหรือยัง?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            เช่ารถวันนี้ รับส่วนลด 10% สำหรับลูกค้าใหม่
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-orange-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors transform hover:scale-105 shadow-lg"
          >
            เริ่มเช่ารถเลย
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <TruckIcon className="w-8 h-8 text-orange-500" />
                <span className="text-xl font-bold text-white">เช่ารถไทยแลนด์</span>
              </div>
              <p className="text-sm text-gray-400">
                บริการเช่ารถคุณภาพ ครอบคลุมทั่วประเทศไทย
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">บริการ</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">เช่ารถรายวัน</a></li>
                <li><a href="#" className="hover:text-white">เช่ารถรายเดือน</a></li>
                <li><a href="#" className="hover:text-white">เช่ารถพร้อมคนขับ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">สถานที่</h4>
              <ul className="space-y-2 text-sm">
                {locations.slice(0, 3).map((loc) => (
                  <li key={loc}><a href="#" className="hover:text-white">{loc}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">ติดต่อเรา</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4" />
                  <span>02-xxx-xxxx</span>
                </li>
                <li>Line: @thaicarsrental</li>
                <li>Email: info@thaicarsrental.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© 2026 เช่ารถไทยแลนด์ สงวนลิขสิทธิ์</p>
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