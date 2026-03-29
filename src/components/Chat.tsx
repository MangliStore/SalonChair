import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { ChatMessage } from '../types';
import { Send, Loader2, X } from 'lucide-react';
import { motion } from 'motion/react';

interface ChatProps {
  bookingId: string;
  currentUserId: string;
  onClose: () => void;
}

const Chat: React.FC<ChatProps> = ({ bookingId, currentUserId, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'bookings', bookingId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ ...doc.data() as ChatMessage, id: doc.id });
      });
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [bookingId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const text = newMessage;
    setNewMessage('');

    try {
      await addDoc(collection(db, 'bookings', bookingId, 'messages'), {
        senderId: currentUserId,
        text,
        timestamp: Timestamp.now(),
        read: false,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-full max-w-sm">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#1E1E1E] rounded-3xl border border-white/10 shadow-2xl flex flex-col h-[500px] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-bold text-white">Chat Support</span>
          </div>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="text-[#00E5FF] animate-spin" size={24} />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600 text-sm italic">No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                    msg.senderId === currentUserId
                      ? 'bg-[#00E5FF] text-black rounded-tr-none'
                      : 'bg-white/5 text-gray-200 rounded-tl-none border border-white/5'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white/5 border-t border-white/5 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-[#00E5FF]/50"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-[#00E5FF] disabled:bg-gray-700 text-black p-2 rounded-xl transition-all"
          >
            <Send size={20} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Chat;
