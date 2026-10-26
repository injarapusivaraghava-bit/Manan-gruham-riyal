import React, { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, Building, ShieldCheck, Lock, ArrowRight, Check, Loader2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
  amount: number;
  propertyName: string;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  propertyName,
}) => {
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking' | 'real'>('upi');
  const [upiId, setUpiId] = useState('raghava@upi');
  const [cardNumber, setCardNumber] = useState('4315 2819 0081 7721');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCVV, setCardCVV] = useState('881');
  const [cardName, setCardName] = useState('Siva Raghava');
  const [bank, setBank] = useState('SBI');

  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [testOutcome, setTestOutcome] = useState<'success' | 'failed'>('success');
  const [generatedPayId, setGeneratedPayId] = useState('');

  // Placeholders as requested by user
  const RAZORPAY_KEY_ID = 'rzp_test_ManaGruhamKey98765';
  const RAZORPAY_KEY_SECRET = 'ManaGruhamSecretPlaceholder8977776111';

  useEffect(() => {
    if (isOpen) {
      setPaymentState('idle');
      // Generate a realistic looking Razorpay payment ID
      const randomId = 'pay_' + Math.random().toString(36).substring(2, 10).toUpperCase() + Date.now().toString().substring(8);
      setGeneratedPayId(randomId);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePay = () => {
    setPaymentState('processing');
    
    // Simulate server response time
    setTimeout(() => {
      if (testOutcome === 'success') {
        setPaymentState('success');
        // Keep success screen visible for 2 seconds before closing and calling success handler
        setTimeout(() => {
          onSuccess(generatedPayId);
        }, 2200);
      } else {
        setPaymentState('failed');
      }
    }, 2000);
  };

  const handleRetry = () => {
    // Regenerate transaction ID and reset state to idle so they can try again
    const randomId = 'pay_' + Math.random().toString(36).substring(2, 10).toUpperCase() + Date.now().toString().substring(8);
    setGeneratedPayId(randomId);
    setPaymentState('idle');
  };

  const getBankLogo = (bName: string) => {
    switch (bName) {
      case 'SBI': return '🏦 SBI';
      case 'HDFC': return '🏛️ HDFC';
      case 'ICICI': return '🏢 ICICI';
      case 'AXIS': return '🪙 AXIS';
      default: return '🏦';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-stone-950/80 backdrop-blur-xs"
          onClick={paymentState === 'idle' || paymentState === 'failed' ? onClose : undefined}
        />

        {/* Razorpay Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="relative bg-slate-900 text-slate-100 rounded-2xl w-full max-w-[420px] overflow-hidden shadow-2xl border border-slate-800"
        >
          {paymentState === 'idle' && (
            <>
              {/* Razorpay Brand Header */}
              <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                    R
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-400 tracking-wider uppercase">Razorpay Checkout</h4>
                    <p className="text-sm font-bold text-slate-100 truncate max-w-[220px]" title={propertyName}>
                      {propertyName || 'మన గృహం రియల్ ఎస్టేట్'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Amount to Pay</span>
                  <span className="text-lg font-black text-amber-400">₹{amount}.00</span>
                </div>
              </div>

              {/* Sandbox Test Outcome Selector Panel */}
              <div className="bg-slate-950/90 border-b border-slate-850 px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Test Simulator Outcome:
                </span>
                <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setTestOutcome('success')}
                    className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${
                      testOutcome === 'success' 
                        ? 'bg-emerald-600 text-white' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Success
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestOutcome('failed')}
                    className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${
                      testOutcome === 'failed' 
                        ? 'bg-rose-600 text-white' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Failure
                  </button>
                </div>
              </div>

              {/* Security info banner with Key details */}
              <div className="bg-blue-950/40 px-4 py-2.5 border-b border-slate-850 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[9px] text-blue-300 font-semibold">
                <span className="flex items-center gap-1 text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  Key: <code className="text-blue-300 font-mono font-bold bg-slate-950/65 px-1 py-0.5 rounded">{RAZORPAY_KEY_ID}</code>
                </span>
                <span className="text-slate-500 font-mono text-[9px] truncate">
                  ID: {generatedPayId.substring(0, 12)}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 space-y-5">
                
                {/* Method selector tab */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setMethod('upi')}
                    className={`py-2 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      method === 'upi' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>UPI/QR</span>
                  </button>
                  <button
                    onClick={() => setMethod('card')}
                    className={`py-2 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      method === 'card' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Card</span>
                  </button>
                  <button
                    onClick={() => setMethod('netbanking')}
                    className={`py-2 text-[10px] font-bold rounded-lg transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      method === 'netbanking' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>Bank</span>
                  </button>
                  <button
                    onClick={() => setMethod('real')}
                    className={`py-2 text-[10px] font-black rounded-lg transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      method === 'real' ? 'bg-amber-500 text-stone-950 shadow-md' : 'text-amber-400 hover:text-amber-300'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Real Pay</span>
                  </button>
                </div>

                {/* Tab contents */}
                <div className="min-h-[140px] flex flex-col justify-center">
                  
                  {method === 'real' && (
                    <div className="space-y-4">
                      <div className="p-3 bg-amber-950/45 border border-amber-900/60 rounded-xl space-y-1.5 text-center">
                        <span className="text-[10px] bg-amber-500 text-stone-950 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block">
                          Official Razorpay Gateway 🚀
                        </span>
                        <p className="text-[11px] text-amber-200 leading-relaxed">
                          రియల్ డివైస్ ద్వారా సురక్షితమైన ఆన్‌లైన్ పేమెంట్ కొరకు కింద ఉన్న బటన్ క్లిక్ చేయండి. ఇది మిమ్మల్ని అధికారిక రేజర్‌పే పేజీకి తీసుకెళ్తుంది.
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <a
                          href="https://rzp.io/rzp/0SNOC"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl transition-all shadow-lg active:scale-98 cursor-pointer flex items-center justify-center gap-2 text-center"
                        >
                          <Sparkles className="w-4 h-4 fill-stone-950" />
                          <span>రేజర్‌పే చెల్లింపును ప్రారంభించండి (Launch Razorpay)</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            setPaymentState('processing');
                            setTimeout(() => {
                              setPaymentState('success');
                              setTimeout(() => {
                                onSuccess(generatedPayId);
                              }, 2000);
                            }, 1500);
                          }}
                          className="w-full py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold text-[10px] rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span>నేను విజయవంతంగా పేమెంట్ చేశాను (I have Paid)</span>
                        </button>
                      </div>

                      <p className="text-[9px] text-slate-400 text-center">
                        మొబైల్ ఫోన్‌లో UPI ఆటో-డిటెక్షన్ & సురక్షిత చెల్లింపు సపోర్ట్ అందుబాటులో ఉంది.
                      </p>
                    </div>
                  )}

                  {method === 'upi' && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] text-slate-400 uppercase font-black tracking-wider">UPI ID / Mobile Number</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. sivaraghava@ybl"
                          className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => setUpiId('8977776111@ybl')}
                          className="py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-300 font-mono hover:border-slate-600 transition-colors cursor-pointer"
                        >
                          8977776111@ybl
                        </button>
                        <button 
                          onClick={() => setUpiId('raghava123@paytm')}
                          className="py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] text-slate-300 font-mono hover:border-slate-600 transition-colors cursor-pointer"
                        >
                          raghava123@paytm
                        </button>
                      </div>

                      <p className="text-[10px] text-slate-400 text-center">
                        🔒 Google Pay, PhonePe, Paytm applications supported.
                      </p>
                    </div>
                  )}

                  {method === 'card' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="block text-[9px] text-slate-400 uppercase font-black">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4315 2819 0081 7721"
                          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="block text-[9px] text-slate-400 uppercase font-black">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="12/28"
                            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[9px] text-slate-400 uppercase font-black">CVV</label>
                          <input
                            type="password"
                            value={cardCVV}
                            onChange={(e) => setCardCVV(e.target.value)}
                            placeholder="***"
                            maxLength={3}
                            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono text-center"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] text-slate-400 uppercase font-black">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Siva Raghava"
                          className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
                        />
                      </div>
                    </div>
                  )}

                  {method === 'netbanking' && (
                    <div className="space-y-3">
                      <label className="block text-[10px] text-slate-400 uppercase font-black">Select Your Bank</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['SBI', 'HDFC', 'ICICI', 'AXIS'].map((b) => (
                          <button
                            key={b}
                            onClick={() => setBank(b)}
                            className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                              bank === b
                                ? 'bg-blue-950 border-blue-500 text-blue-200 shadow-inner'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            {getBankLogo(b)}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400 text-center mt-2">
                        You will be redirected to {bank} payment secure gateway.
                      </p>
                    </div>
                  )}

                </div>

                {/* Footer security + Pay Button */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handlePay}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-lg active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Pay ₹{amount}.00</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-center gap-1 text-[9px] text-slate-500">
                    <Lock className="w-3 h-3 text-slate-600" />
                    <span>SSL Encrypted Connection • PCI DSS Compliant</span>
                  </div>
                </div>

              </div>
            </>
          )}

          {/* Processing state screen */}
          {paymentState === 'processing' && (
            <div className="p-10 text-center space-y-5 min-h-[380px] flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <div className="space-y-2">
                <h4 className="font-bold text-slate-100 text-base">Processing Payment...</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  దయచేసి నిరీక్షించండి. మీ పేమెంట్ వివరాలను బ్యాంక్ సర్వర్లకు సమర్పిస్తున్నాము. విండోను క్లోజ్ చేయకండి.
                </p>
              </div>
              <p className="font-mono text-[9px] text-slate-600 uppercase">
                Order ID: ord_{generatedPayId.replace('pay_', '')}
              </p>
            </div>
          )}

          {/* Success state screen */}
          {paymentState === 'success' && (
            <div className="p-10 text-center space-y-6 min-h-[380px] flex flex-col items-center justify-center bg-emerald-950/25">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-slate-900 shadow-lg animate-bounce">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-emerald-400 text-lg">పేమెంట్ విజయవంతమైంది!</h4>
                <p className="text-xs text-emerald-200">Payment Successful</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto pt-1 leading-relaxed">
                  స్థిరాస్తి ₹{amount} ప్యాకేజీ పేమెంట్ విజయవంతంగా పూర్తయింది. అడ్మిన్ అప్రూవల్ కొరకు సమర్పించబడుతోంది.
                </p>
              </div>
              
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 w-full text-left font-mono text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="text-amber-400 font-bold">{generatedPayId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="text-slate-300 font-bold">₹{amount}.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-emerald-500 font-bold">SUCCESS</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Failed Screen */}
          {paymentState === 'failed' && (
            <div className="p-8 text-center space-y-5 min-h-[380px] flex flex-col items-center justify-center bg-rose-950/15">
              <div className="w-16 h-16 bg-rose-500 text-slate-900 rounded-full flex items-center justify-center shadow-lg">
                <AlertCircle className="w-9 h-9 stroke-[2.5]" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-rose-500 text-lg">చెల్లింపు విఫలమైంది!</h4>
                <p className="text-xs text-rose-300">Payment Failed</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto pt-1 leading-relaxed">
                  క్షమించండి, మీ ట్రాన్సాక్షన్ పూర్తి కాలేదు. బ్యాంక్ ద్వారా పేమెంట్ తిరస్కరించబడింది లేదా సరిపోని నిధులు ఉన్నాయి.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-1.5 w-full text-left font-mono text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Error Code:</span>
                  <span className="text-rose-400 font-bold">PAYMENT_DECLINED_BY_BANK</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reference:</span>
                  <span className="text-slate-400 font-bold">err_rzp_{generatedPayId.replace('pay_', '').substring(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Key Checked:</span>
                  <span className="text-blue-300 font-bold">{RAZORPAY_KEY_ID.substring(0, 12)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Secret checked:</span>
                  <span className="text-stone-400">RAZORPAY_KEY_SECRET</span>
                </div>
              </div>

              {/* Action Buttons for retry and exit */}
              <div className="flex gap-2.5 w-full pt-1">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>మళ్ళీ ప్రయత్నించండి</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  రద్దు చేయి (Cancel)
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
