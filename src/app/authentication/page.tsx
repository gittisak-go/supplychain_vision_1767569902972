'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';

type AuthMode = 'login' | 'signup';

export default function AuthenticationPage() {
  const router = useRouter();
  const { user, signIn, loading } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    company: '',
    role: 'user'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push('/supply-chain-overview');
    }
  }, [user, loading, router]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email?.trim()) {
      newErrors.email = 'อีเมลจำเป็นต้องระบุ';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (!formData.password) {
      newErrors.password = 'รหัสผ่านจำเป็นต้องระบุ';
    } else if (formData.password.length < 6) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }

    if (authMode === 'signup') {
      if (!formData.fullName?.trim()) {
        newErrors.fullName = 'ชื่อ-นามสกุลจำเป็นต้องระบุ';
      }
      if (!formData.company?.trim()) {
        newErrors.company = 'ชื่อบริษัทจำเป็นต้องระบุ';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (authMode === 'login') {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setAuthError(error.message || 'เข้าสู่ระบบไม่สำเร็จ');
        }
      } else {
        setAuthError('การลงทะเบียนยังไม่พร้อมใช้งาน กรุณาใช้ข้อมูลทดสอบเพื่อเข้าสู่ระบบ');
      }
    } catch (err) {
      setAuthError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(prev => prev === 'login' ? 'signup' : 'login');
    setErrors({});
    setAuthError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-3 rounded-xl">
              <Icon name="TruckIcon" size={40} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground">GtsAlpha MCP</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {authMode === 'login' ?'เข้าสู่ระบบเพื่อจัดการซัพพลายเชน' :'สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งาน'}
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
            <Icon name="InformationCircleIcon" size={16} className="mr-2" />
            ข้อมูลทดสอบ
          </h3>
          <div className="space-y-1 text-xs text-blue-800">
            <p><strong>อีเมล:</strong> admin@rungrojcarrental.com</p>
            <p><strong>รหัสผ่าน:</strong> password123</p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-border p-8">
          {/* Auth Mode Tabs */}
          <div className="flex mb-6 bg-muted rounded-lg p-1">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-smooth ${
                authMode === 'login' ?'bg-white text-primary shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-smooth ${
                authMode === 'signup' ?'bg-white text-primary shadow-sm' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              สมัครสมาชิก
            </button>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <Icon name="ExclamationTriangleIcon" size={20} className="text-red-600 mr-2 mt-0.5" />
              <p className="text-sm text-red-800">{authError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-1">
                    ชื่อ-นามสกุล
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth ${
                      errors.fullName ? 'border-red-500' : 'border-border'
                    }`}
                    placeholder="กรอกชื่อ-นามสกุล"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-foreground mb-1">
                    ชื่อบริษัท
                  </label>
                  <input
                    id="company"
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth ${
                      errors.company ? 'border-red-500' : 'border-border'
                    }`}
                    placeholder="กรอกชื่อบริษัท"
                  />
                  {errors.company && (
                    <p className="mt-1 text-xs text-red-600">{errors.company}</p>
                  )}
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                อีเมล
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth ${
                  errors.email ? 'border-red-500' : 'border-border'
                }`}
                placeholder="your@email.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth ${
                    errors.password ? 'border-red-500' : 'border-border'
                  }`}
                  placeholder="กรอกรหัสผ่าน"
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Icon name={showPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={20} />
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            {authMode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
                  ยืนยันรหัสผ่าน
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth ${
                      errors.confirmPassword ? 'border-red-500' : 'border-border'
                    }`}
                    placeholder="ยืนยันรหัสผ่าน"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <Icon name={showConfirmPassword ? 'EyeSlashIcon' : 'EyeIcon'} size={20} />
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {authMode === 'login' && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-muted-foreground">จดจำฉันไว้</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-smooth disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <Icon name="ArrowPathIcon" size={20} className="animate-spin mr-2" />
                  กำลังดำเนินการ...
                </span>
              ) : (
                authMode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'
              )}
            </button>
          </form>

          {/* Switch Auth Mode */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {authMode === 'login' ? 'ยังไม่มีบัญชี? ' : 'มีบัญชีอยู่แล้ว? '}
              <button
                type="button"
                onClick={toggleAuthMode}
                className="text-primary hover:underline font-medium"
              >
                {authMode === 'login' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}