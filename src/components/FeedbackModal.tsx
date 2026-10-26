import React, { useState } from 'react';
import { UserFeedback } from '../types';
import { X, MessageSquare, Send, CheckCircle, Sparkles, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveFeedback: (feedback: UserFeedback) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSaveFeedback,
}) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [type, setType] = useState<'feature' | 'issue'>('feature');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('దయచేసి మీ పేరు నమోదు చేయండి (Please enter your name).');
      return;
    }
    if (!contact.trim()) {
      setError('దయచేసి మీ ఫోన్ లేదా ఇమెయిల్ నమోదు చేయండి (Please enter your phone or email).');
      return;
    }
    if (!message.trim()) {
      setError('దయచేసి మీ సూచన లేదా సమస్య వివరాలు రాయండి (Please describe your feedback).');
      return;
    }

    const newFeedback: UserFeedback = {
      id: `fb-${Date.now()}`,
      name: name.trim(),
      contact: contact.trim(),
      type,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    onSaveFeedback(newFeedback);
    setIsSuccess(true);

    // Reset fields
    setName('');
    setContact('');
    setType('feature');
    setMessage('');

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-[28px] border border-stone-200 w-full max-w-lg overflow-hidden shadow-2xl relative"
          >
            {/* Header banner */}
            <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-orange-500 p-6 text-white relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-black/10 hover:bg-black/20 text-white p-1.5 rounded-full transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white backdrop-blur-md">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base md:text-lg">
                    అభిప్రాయాలు & సలహాలు (Feedback / Request)
                  </h3>
                  <p className="text-white/80 text-[10px] md:text-xs">
                    మన గృహం యాప్‌ను మెరుగుపరచడానికి మీ విలువైన సూచనలు ఇక్కడ తెలపండి.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-10 text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto border border-emerald-100">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-stone-950 text-base">ధన్యవాదాలు! మీ సలహా సేవ్ చేయబడింది!</h4>
                      <p className="text-stone-500 text-xs px-6 leading-relaxed">
                        శివ రాఘవ గారు ఈ వివరాలను అడ్మిన్ ప్యానెల్ ద్వారా సమీక్షించి తదుపరి అప్‌డేట్‌లో వీటిని చేర్చడానికి ప్రయత్నిస్తారు.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form onSubmit={handleSubmit} className="space-y-4">
                    {/* Error message */}
                    {error && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2 animate-pulse">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Feedback category */}
                    <div className="space-y-2">
                      <label className="block text-[10px] text-stone-500 uppercase font-black tracking-wider">
                        ఫీడ్‌బ్యాక్ రకం (Feedback Type)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setType('feature')}
                          className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                            type === 'feature'
                              ? 'bg-purple-50 border-purple-200 text-purple-700 shadow-xs font-black'
                              : 'bg-stone-50 border-stone-150 text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          <Sparkles className={`w-4 h-4 ${type === 'feature' ? 'text-purple-600' : 'text-stone-400'}`} />
                          <span>కొత్త ఫీచర్ సూచన (Feature)</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setType('issue')}
                          className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                            type === 'issue'
                              ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-xs font-black'
                              : 'bg-stone-50 border-stone-150 text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          <AlertTriangle className={`w-4 h-4 ${type === 'issue' ? 'text-rose-600' : 'text-stone-400'}`} />
                          <span>సమస్య నివేదిక (Bug/Issue)</span>
                        </button>
                      </div>
                    </div>

                    {/* Sender Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="feedback-name" className="block text-[10px] text-stone-500 uppercase font-bold">
                        మీ పేరు (Your Name) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="feedback-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ఉదా: వెంకట్ గారు"
                        className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/30"
                      />
                    </div>

                    {/* Contact info */}
                    <div className="space-y-1.5">
                      <label htmlFor="feedback-contact" className="block text-[10px] text-stone-500 uppercase font-bold">
                        మొబైల్ నెంబర్ లేదా ఇమెయిల్ (Contact Phone / Email) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="feedback-contact"
                        type="text"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="ఉదా: 9848XXXXXX లేదా mail@example.com"
                        className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/30"
                      />
                    </div>

                    {/* Message description */}
                    <div className="space-y-1.5">
                      <label htmlFor="feedback-msg" className="block text-[10px] text-stone-500 uppercase font-bold">
                        సందేశం లేదా సూచనల వివరణ (Description) <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        id="feedback-msg"
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="దయచేసి మీ విజ్ఞప్తి లేదా సమస్యను క్షుణ్ణంగా ఇక్కడ వివరించండి..."
                        className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/30 resize-none leading-relaxed"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      id="feedback-submit-btn"
                      type="submit"
                      className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer mt-2"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                      <span>సందేశం పంపండి (Submit Feedback)</span>
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
