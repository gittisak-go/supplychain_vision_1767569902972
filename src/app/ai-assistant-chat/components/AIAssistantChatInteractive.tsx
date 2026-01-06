'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  PaperAirplaneIcon, 
  MicrophoneIcon,
  PaperClipIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  BookmarkIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid } from '@heroicons/react/24/solid';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  context?: string;
}

interface ConversationContext {
  topics: string[];
  relatedData: string[];
  suggestedQuestions: string[];
}

export default function AIAssistantChatInteractive() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      content: 'สวัสดีครับ! ผมคือผู้ช่วย AI ของ GtsAlpha MCP พร้อมช่วยเหลือคุณในเรื่องการวิเคราะห์ซัพพลายเชน การติดตามการขนส่ง การจัดการฝูงยานพาหนะ การจองและให้คำแนะนำในการดำเนินงาน ผมสามารถดึงข้อมูลแบบเรียลไทม์จากระบบเพื่อให้คำแนะนำที่แม่นยำ มีอะไรให้ช่วยไหมครับ?',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    topics: ['ภาพรวมระบบ', 'การเริ่มต้นใช้งาน'],
    relatedData: ['แดชบอร์ดภาพรวม', 'การติดตามแบบเรียลไทม์', 'การจัดการฝูงยานพาหนะ'],
    suggestedQuestions: [
      'ช่วยวิเคราะห์ประสิทธิภาพการจัดส่งให้หน่อย',
      'มีการส่งล่าช้าหรือไม่?',
      'ยานพาหนะมีกี่คันว่างอยู่?',
      'มีการจองที่กำลังจะมาถึงกี่รายการ?',
      'ท่าเรือไหนมีความหนาแน่นสูง?'
    ]
  });
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          context: conversationContext.topics.join(', ')
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Check if response is SSE stream
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('text/event-stream')) {
        const errorData = await response.json().catch(() => ({ error: 'รูปแบบการตอบกลับไม่ถูกต้อง' }));
        throw new Error(errorData.error || 'รูปแบบการตอบกลับไม่ถูกต้อง');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: '',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                break;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  assistantMessage.content += parsed.content;
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === assistantMessage.id 
                        ? { ...msg, content: assistantMessage.content }
                        : msg
                    )
                  );
                }
              } catch (e) {
                console.warn('Failed to parse SSE data:', data);
              }
            }
          }
        }
      }

      // Update conversation context
      updateConversationContext(userMessage.content, assistantMessage.content);
      
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sending message:', error);
        const errorMessage = error.message || 'เกิดข้อผิดพลาดในการประมวลผล';
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: `❌ ${errorMessage}\n\nกรุณาตรวจสอบ:\n• การเชื่อมต่ออินเทอร์เน็ต\n• การตั้งค่า API Key\n• ลองรีเฟรชหน้าเว็บแล้วลองใหม่อีกครั้ง`,
          timestamp: new Date(),
        }]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const updateConversationContext = (userQuery: string, aiResponse: string) => {
    // Enhanced context extraction based on keywords
    const topics = new Set(conversationContext.topics);
    
    if (userQuery.includes('การจัดส่ง') || aiResponse.includes('การจัดส่ง')) {
      topics.add('การจัดส่ง');
    }
    if (userQuery.includes('ท่าเรือ') || aiResponse.includes('ท่าเรือ')) {
      topics.add('การวิเคราะห์ท่าเรือ');
    }
    if (userQuery.includes('ประสิทธิภาพ') || aiResponse.includes('ประสิทธิภาพ')) {
      topics.add('การวิเคราะห์ประสิทธิภาพ');
    }
    if (userQuery.includes('ยานพาหนะ') || userQuery.includes('รถ') || aiResponse.includes('ยานพาหนะ')) {
      topics.add('การจัดการฝูงยานพาหนะ');
    }
    if (userQuery.includes('จอง') || userQuery.includes('การเช่า') || aiResponse.includes('การจอง')) {
      topics.add('การจองและการเช่า');
    }

    // Update related data based on topics
    const relatedData = ['แดชบอร์ดภาพรวม'];
    if (topics.has('การจัดส่ง')) {
      relatedData.push('การติดตามแบบเรียลไทม์');
    }
    if (topics.has('การวิเคราะห์ท่าเรือ')) {
      relatedData.push('การวิเคราะห์ท่าเรือ');
    }
    if (topics.has('การวิเคราะห์ประสิทธิภาพ')) {
      relatedData.push('การวิเคราะห์ประสิทธิภาพ');
    }
    if (topics.has('การจัดการฝูงยานพาหนะ')) {
      relatedData.push('การจัดการฝูงยานพาหนะ');
    }
    if (topics.has('การจองและการเช่า')) {
      relatedData.push('การจองรถยนต์');
    }

    setConversationContext(prev => ({
      ...prev,
      topics: Array.from(topics).slice(-5), // Keep last 5 topics
      relatedData: relatedData
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${showSidebar ? 'lg:mr-80' : ''}`}>
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <ChatBubbleLeftRightIconSolid className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">ผู้ช่วย AI GtsAlpha</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>ออนไลน์ • เวลาตอบกลับ ~2 วินาที</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' ?'bg-blue-600' :'bg-gradient-to-br from-purple-500 to-blue-500'
                }`}>
                  {message.role === 'user' ? (
                    <span className="text-white text-sm font-medium">คุณ</span>
                  ) : (
                    <ChatBubbleLeftRightIconSolid className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-4 rounded-2xl ${
                    message.role === 'user' ?'bg-blue-600 text-white' :'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                  <div className="flex items-center space-x-2 mt-1 px-2">
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(message.timestamp)}
                    </span>
                    {message.role === 'model' && (
                      <>
                        <button className="text-gray-400 hover:text-blue-600 transition-colors">
                          <BookmarkIcon className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-blue-600 transition-colors">
                          <DocumentDuplicateIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex space-x-3 max-w-3xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <ChatBubbleLeftRightIconSolid className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-100 p-4 rounded-2xl">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            {/* Suggested Questions */}
            {messages.length <= 2 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {conversationContext.suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="px-3 py-2 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-end space-x-2">
              <button className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <PaperClipIcon className="w-5 h-5" />
              </button>
              
              <div className="flex-1 bg-gray-100 rounded-2xl overflow-hidden">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="พิมพ์ข้อความของคุณ... (กด Enter เพื่อส่ง)"
                  className="w-full px-4 py-3 bg-transparent resize-none focus:outline-none max-h-32"
                  rows={1}
                  disabled={isLoading}
                />
              </div>

              <button className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <MicrophoneIcon className="w-5 h-5" />
              </button>

              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-2">
              ผู้ช่วย AI อาจทำผิดพลาดได้ กรุณาตรวจสอบข้อมูลสำคัญ
            </p>
          </div>
        </div>
      </div>

      {/* Context Sidebar */}
      {showSidebar && (
        <div className="hidden lg:block fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Conversation Topics */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                หัวข้อที่กำลังพูดถึง
              </h3>
              <div className="flex flex-wrap gap-2">
                {conversationContext.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Related Dashboard Data */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                ข้อมูลที่เกี่ยวข้อง
              </h3>
              <div className="space-y-2">
                {conversationContext.relatedData.map((data, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                  >
                    {data}
                  </button>
                ))}
              </div>
            </div>

            {/* Suggested Follow-up Questions */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                คำถามที่แนะนำ
              </h3>
              <div className="space-y-2">
                {conversationContext.suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <ClockIcon className="w-4 h-4 mr-2" />
                กิจกรรมล่าสุด
              </h3>
              <div className="text-xs text-gray-600 space-y-2">
                <p>• เริ่มเซสชันการสนทนาใหม่</p>
                <p>• อัปเดตข้อมูลล่าสุดเมื่อ 5 นาทีที่แล้ว</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}