'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Icon from '@/components/ui/AppIcon';

export default function SignupConfirmationPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [userEmail, setUserEmail] = useState<string>('');
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [showUpdateEmail, setShowUpdateEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    const checkVerificationStatus = async () => {
      const { data: { session } } = await supabase?.auth?.getSession();
      
      if (session?.user) {
        setUserEmail(session?.user?.email || '');
        
        if (session?.user?.email_confirmed_at) {
          setIsVerified(true);
          setTimeout(() => {
            router?.push('/supply-chain-overview');
          }, 2000);
        }
      } else {
        const params = new URLSearchParams(window.location.search);
        const email = params?.get('email');
        if (email) {
          setUserEmail(email);
        } else {
          router?.push('/authentication');
        }
      }
    };

    checkVerificationStatus();

    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        setIsVerified(true);
        setTimeout(() => {
          router?.push('/supply-chain-overview');
        }, 2000);
      }
    });

    return () => subscription?.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleResendEmail = async () => {
    if (resendCountdown > 0) return;

    setIsResending(true);
    setResendMessage('');

    try {
      const { error } = await supabase?.auth?.resend({
        type: 'signup',
        email: userEmail,
        options: {
          emailRedirectTo: `${window.location?.origin}/signup-confirmation`
        }
      });

      if (error) {
        setResendMessage(`ไม่สามารถส่งอีเมลยืนยันได้: ${error?.message}`);
      } else {
        setResendMessage('ส่งอีเมลยืนยันใหม่สำเร็จ กรุณาตรวจสอบกล่องจดหมายของคุณ');
        setResendCountdown(60);
      }
    } catch (err) {
      setResendMessage('เกิดข้อผิดพลาดในการส่งอีเมล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsResending(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail?.trim()) {
      setEmailError('กรุณากรอกอีเมลใหม่');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(newEmail)) {
      setEmailError('รูปแบบอีเมลไม่ถูกต้อง');
      return;
    }

    try {
      const { error } = await supabase?.auth?.updateUser({ email: newEmail });
      
      if (error) {
        setEmailError(`ไม่สามารถอัพเดทอีเมลได้: ${error?.message}`);
      } else {
        setUserEmail(newEmail);
        setShowUpdateEmail(false);
        setNewEmail('');
        setEmailError('');
        setResendMessage('ส่งอีเมลยืนยันไปยังที่อยู่ใหม่แล้ว กรุณาตรวจสอบกล่องจดหมาย');
      }
    } catch (err) {
      setEmailError('เกิดข้อผิดพลาดในการอัพเดทอีเมล กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleBackToLogin = () => {
    router?.push('/authentication');
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
            <div className={`p-3 rounded-xl ${isVerified ? 'bg-green-500' : 'bg-primary'}`}>
              <Icon 
                name={isVerified ? "CheckCircleIcon" : "EnvelopeIcon"} 
                size={40} 
                className="text-white" 
              />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            {isVerified ? 'ยืนยันอีเมลสำเร็จ!' : 'ยืนยันอีเมลของคุณ'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isVerified 
              ? 'กำลังนำคุณไปยังแดชบอร์ด...' :'เราได้ส่งลิงก์ยืนยันไปยังอีเมลของคุณแล้ว'
            }
          </p>
        </div>

        {/* Confirmation Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-border p-8">
          {isVerified ? (
            <div className="text-center space-y-4">
              <div className="animate-pulse">
                <div className="bg-green-50 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                  <Icon name="CheckCircleIcon" size={48} className="text-green-600" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-foreground">
                  บัญชีของคุณได้รับการยืนยันแล้ว
                </p>
                <p className="text-sm text-muted-foreground">
                  กำลังเปลี่ยนเส้นทางไปยังแดชบอร์ดหลัก...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Email Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Icon name="EnvelopeIcon" size={24} className="text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">
                      อีเมลที่ลงทะเบียน
                    </p>
                    <p className="text-base text-blue-800 font-semibold break-all">
                      {userEmail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center">
                  <Icon name="InformationCircleIcon" size={20} className="mr-2 text-primary" />
                  ขั้นตอนการยืนยัน
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-6">
                  <li>ตรวจสอบกล่องจดหมายของคุณ</li>
                  <li>เปิดอีเมลจาก GtsAlpha MCP</li>
                  <li>คลิกที่ลิงก์ยืนยันในอีเมล</li>
                  <li>ระบบจะนำคุณกลับมายังแดชบอร์ดโดยอัตโนมัติ</li>
                </ol>
              </div>

              {/* Status Messages */}
              {resendMessage && (
                <div className={`p-3 rounded-lg flex items-start ${
                  resendMessage?.includes('สำเร็จ') || resendMessage?.includes('ใหม่') 
                    ? 'bg-green-50 border border-green-200' :'bg-red-50 border border-red-200'
                }`}>
                  <Icon 
                    name={resendMessage?.includes('สำเร็จ') ? 'CheckCircleIcon' : 'ExclamationTriangleIcon'} 
                    size={20} 
                    className={`${
                      resendMessage?.includes('สำเร็จ') ? 'text-green-600' : 'text-red-600'
                    } mr-2 mt-0.5`} 
                  />
                  <p className={`text-sm ${
                    resendMessage?.includes('สำเร็จ') ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {resendMessage}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleResendEmail}
                  disabled={isResending || resendCountdown > 0}
                  className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-smooth disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
                >
                  {isResending ? (
                    <>
                      <Icon name="ArrowPathIcon" size={20} className="animate-spin mr-2" />
                      กำลังส่ง...
                    </>
                  ) : resendCountdown > 0 ? (
                    <>
                      <Icon name="ClockIcon" size={20} className="mr-2" />
                      ส่งอีกครั้งใน {resendCountdown} วินาที
                    </>
                  ) : (
                    <>
                      <Icon name="PaperAirplaneIcon" size={20} className="mr-2" />
                      ส่งอีเมลยืนยันใหม่
                    </>
                  )}
                </button>

                {!showUpdateEmail ? (
                  <button
                    onClick={() => setShowUpdateEmail(true)}
                    className="w-full py-3 px-4 bg-white text-primary border-2 border-primary rounded-lg hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-smooth font-medium flex items-center justify-center"
                  >
                    <Icon name="PencilIcon" size={20} className="mr-2" />
                    เปลี่ยนที่อยู่อีเมล
                  </button>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => {
                        setNewEmail(e?.target?.value);
                        setEmailError('');
                      }}
                      placeholder="กรอกอีเมลใหม่"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth ${
                        emailError ? 'border-red-500' : 'border-border'
                      }`}
                    />
                    {emailError && (
                      <p className="text-xs text-red-600">{emailError}</p>
                    )}
                    <div className="flex space-x-2">
                      <button
                        onClick={handleUpdateEmail}
                        className="flex-1 py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-smooth font-medium"
                      >
                        อัพเดท
                      </button>
                      <button
                        onClick={() => {
                          setShowUpdateEmail(false);
                          setNewEmail('');
                          setEmailError('');
                        }}
                        className="flex-1 py-2 px-4 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-smooth font-medium"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBackToLogin}
                  className="w-full py-3 px-4 bg-muted text-foreground rounded-lg hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-muted transition-smooth font-medium flex items-center justify-center"
                >
                  <Icon name="ArrowLeftIcon" size={20} className="mr-2" />
                  กลับไปหน้าเข้าสู่ระบบ
                </button>
              </div>

              {/* Troubleshooting */}
              <div className="pt-4 border-t border-border">
                <details className="cursor-pointer">
                  <summary className="text-sm font-medium text-foreground flex items-center">
                    <Icon name="QuestionMarkCircleIcon" size={20} className="mr-2 text-muted-foreground" />
                    ไม่ได้รับอีเมล?
                  </summary>
                  <div className="mt-3 space-y-2 text-sm text-muted-foreground pl-7">
                    <p>• ตรวจสอบในโฟลเดอร์ Spam หรือ Junk Mail</p>
                    <p>• ตรวจสอบว่าอีเมลที่ใช้ลงทะเบียนถูกต้อง</p>
                    <p>• รอสักครู่แล้วลองรีเฟรชกล่องจดหมาย</p>
                    <p>• ลองใช้ปุ่ม "ส่งอีเมลยืนยันใหม่" ด้านบน</p>
                  </div>
                </details>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}