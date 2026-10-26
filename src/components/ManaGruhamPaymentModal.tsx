import React, { useState, useEffect } from 'react';
import { X, Copy, Check, ExternalLink, QrCode, AlertCircle, Sparkles, Clock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ManaGruhamPayment } from '../types';

interface ManaGruhamPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  purpose: string;
  amount: number;
  itemId: string;
  itemType: 'service' | 'product' | 'booking' | 'other' | 'package';
  packageName?: 'basic' | 'premium' | 'featured';
  onSubmitPayment: (payment: Omit<ManaGruhamPayment, 'id' | 'createdAt' | 'status'>) => void;
  defaultCustomerName?: string;
}

export const ManaGruhamPaymentModal: React.FC<ManaGruhamPaymentModalProps> = ({
  isOpen,
  onClose,
  purpose,
  amount,
  itemId,
  itemType,
  packageName,
  onSubmitPayment,
  defaultCustomerName = '',
}) => {
  const [customerName, setCustomerName] = useState(defaultCustomerName);
  const [utr, setUtr] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedTxn, setGeneratedTxn] = useState<Omit<ManaGruhamPayment, 'id' | 'createdAt' | 'status'> | null>(null);

  const upiId = 'isivaraghava@okaxis';

  // Preset name if user is logged in / provided details
  useEffect(() => {
    if (defaultCustomerName) {
      setCustomerName(defaultCustomerName);
    }
  }, [defaultCustomerName]);

  // Construct UPI Deep Link for scanning & launching UPI apps
  const upiDeepLink = `upi://pay?pa=${upiId}&pn=Mana%20Gruham&tn=${encodeURIComponent(purpose)}&am=${amount}&cu=INR`;

  // QR Code generation URL using dynamic free API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiDeepLink)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayNow = () => {
    // Attempt to launch native UPI apps on mobile device
    window.location.href = upiDeepLink;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName.trim()) {
      setError('దయచేసి మీ పేరు నమోదు చేయండి (Please enter your name)');
      return;
    }

    if (!utr.trim() || utr.length < 6) {
      setError('దయచేసి సరైన UPI ట్రాన్సాక్షన్ నంబర్ లేదా UTR నమోదు చేయండి (Please enter a valid UPI Transaction / UTR reference number)');
      return;
    }

    const payload = {
      customerName: customerName.trim(),
      paymentPurpose: purpose,
      amount,
      upiId,
      utr: utr.trim(),
      itemType,
      itemId,
      packageName,
    };

    onSubmitPayment(payload);
    setGeneratedTxn(payload);
    setIsSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white rounded-3xl border border-stone-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center font-bold">
                మ
              </div>
              <div>
                <h3 className="font-display font-black text-sm uppercase tracking-wide">
                  Mana Gruham Payment
                </h3>
                <p className="text-[11px] text-amber-50 font-medium">
                  మన గృహం సురక్షిత చెల్లింపు స్క్రీన్
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 bg-black/10 rounded-lg hover:bg-black/25 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Visual Alert about Direct Payment Verification */}
                <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-extrabold text-amber-950">డైరెక్ట్ UPI వెరిఫికేషన్ సిస్టమ్</p>
                    <p className="text-[11px] text-amber-800">
                      ఈ లావాదేవీని శివ రాఘవ గారు మాన్యువల్‌గా వెరిఫై చేస్తారు. చెల్లింపు చేసిన వెంటనే మీ UTR నంబర్ నమోదు చేయడం మర్చిపోకండి.
                    </p>
                  </div>
                </div>

                {/* Checkout Details Container */}
                <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-stone-400 font-bold block uppercase text-[10px]">Purpose / ఉద్దేశం</span>
                      <span className="text-stone-800 font-bold text-xs truncate block" title={purpose}>{purpose}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-stone-400 font-bold block uppercase text-[10px]">Amount / చెల్లించాల్సిన ధర</span>
                      <span className="text-amber-600 font-black text-base font-mono">₹{amount.toLocaleString('en-IN')}.00</span>
                    </div>
                  </div>
                </div>

                {/* Customer Details Input fields */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wide">
                      Customer Name / మీ పూర్తి పేరు <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="ఉదా: శివ ప్రసాద్"
                      className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none transition-all font-semibold"
                    />
                  </div>

                  {/* UPI QR & App Actions Container */}
                  <div className="border border-stone-150 rounded-2xl p-4 bg-stone-50/60 flex flex-col items-center text-center space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] bg-stone-200 text-stone-700 font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider inline-block">
                        Scan to Pay / స్కాన్ చేయండి
                      </span>
                      <p className="text-[10px] text-stone-500 font-medium">
                        గూగుల్ పే, ఫోన్ పే, పేటిఎం లేదా ఏదైనా UPI యాప్‌తో ఈ కింది క్యూఆర్ కోడ్‌ను స్కాన్ చేయండి
                      </p>
                    </div>

                    {/* QR Display */}
                    <div className="p-3 bg-white border border-stone-200 rounded-2xl shadow-sm relative group">
                      <img
                        src={qrCodeUrl}
                        alt="UPI Payment QR Code"
                        className="w-40 h-40 object-contain mx-auto"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                        <QrCode className="w-8 h-8 text-amber-500" />
                      </div>
                    </div>

                    {/* UPI ID Field & Copy */}
                    <div className="w-full space-y-2">
                      <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 border border-stone-200 rounded-xl">
                        <div className="text-left font-mono">
                          <span className="text-[9px] text-stone-400 font-bold block leading-none">UPI ID</span>
                          <span className="text-xs text-stone-800 font-black">{upiId}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold text-[10px] rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>కాపీ అయింది (Copied)</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>ఐడీ కాపీ చేయి (Copy ID)</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Pay Now Mobile Deep-linking button */}
                      <button
                        type="button"
                        onClick={handlePayNow}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>మొబైల్ యాప్ ద్వారా చెల్లించండి (Pay Now)</span>
                      </button>
                      <p className="text-[9px] text-stone-400">
                        *మొబైల్ ఫోన్ ద్వారా చెల్లిస్తున్నప్పుడు పై బటన్ నేరుగా మీ GPay/PhonePe/Paytm యాప్‌లను ఓపెన్ చేస్తుంది.
                      </p>
                    </div>
                  </div>

                  {/* Transaction verification field */}
                  <div className="space-y-1.5 bg-amber-50/30 border border-amber-200/40 rounded-2xl p-4">
                    <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wide">
                      UPI Reference / UTR Number <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-[10px] text-stone-500 mb-1">
                      మీ పేమెంట్ పూర్తయిన తర్వాత లభించే 12-అంకెల ట్రాన్సాక్షన్ నంబర్ (UTR) నమోదు చేయండి.
                    </p>
                    <input
                      type="text"
                      required
                      value={utr}
                      onChange={(e) => setUtr(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                      placeholder="ఉదా: 324784294812"
                      className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-mono font-bold tracking-widest focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 text-[10px] text-rose-700 font-semibold leading-relaxed">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Confirmation Buttons */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 border border-stone-200 text-stone-700 font-bold text-xs rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    రద్దు చేయండి (Cancel)
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs rounded-xl transition-colors shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>పేమెంట్ వెరిఫైకి పంపండి</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Success / Pending Receipt screen */
              <div className="text-center py-6 space-y-6">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mx-auto border-2 border-amber-200 animate-bounce">
                  <Clock className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h4 className="font-display font-black text-base text-stone-900">
                    లావాదేవీ అభ్యర్థన అందింది! (Transaction Submitted!)
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
                    మీ పేమెంట్ వివరాలు మాన్యువల్ వెరిఫికేషన్ కొరకు విజయవంతంగా సబ్మిట్ చేయబడ్డాయి. అడ్మిన్ శివ రాఘవ గారు మీ UTR నంబర్‌ను చెక్ చేసి లిస్టింగ్/సేవను కొద్దిసేపట్లో యాక్టివేట్ చేస్తారు.
                  </p>
                </div>

                {/* Payment Detail Receipt */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-left text-xs space-y-2.5 max-w-sm mx-auto font-medium">
                  <div className="flex justify-between border-b border-stone-150 pb-1.5">
                    <span className="text-stone-400 font-bold uppercase text-[9px]">Customer Name</span>
                    <span className="text-stone-800 font-bold">{generatedTxn?.customerName}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-150 pb-1.5">
                    <span className="text-stone-400 font-bold uppercase text-[9px]">Purpose</span>
                    <span className="text-stone-800 font-bold truncate max-w-[180px]">{generatedTxn?.paymentPurpose}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-150 pb-1.5">
                    <span className="text-stone-400 font-bold uppercase text-[9px]">Amount</span>
                    <span className="text-amber-600 font-extrabold font-mono">₹{generatedTxn?.amount.toLocaleString('en-IN')}.00</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-150 pb-1.5">
                    <span className="text-stone-400 font-bold uppercase text-[9px]">UPI Reference / UTR</span>
                    <span className="text-stone-800 font-mono font-bold tracking-wider">{generatedTxn?.utr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400 font-bold uppercase text-[9px]">Status</span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                      ⏳ Pending Verification
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
                >
                  సరే (Close)
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
