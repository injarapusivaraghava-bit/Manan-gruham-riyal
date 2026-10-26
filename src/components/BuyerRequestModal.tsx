import React, { useState, useEffect } from 'react';
import { BuyerRequest } from '../types';
import { X, Plus, AlertCircle, Sparkles, Check, HelpCircle, FileCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AP_DISTRICTS, MANDALS_BY_DISTRICT, VILLAGES_BY_MANDAL, AGRICULTURAL_SUBCATEGORIES } from '../data';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

interface BuyerRequestModalProps {
  onClose: () => void;
  onSubmit: (newRequest: BuyerRequest) => void;
  currentUserUid?: string;
}

export const BuyerRequestModal: React.FC<BuyerRequestModalProps> = ({
  onClose,
  onSubmit,
  currentUserUid,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('8977776111'); // default to Raghava as requested
  const [district, setDistrict] = useState('Kakinada');
  const [mandal, setMandal] = useState('');
  const [village, setVillage] = useState('');
  const [requiredLandType, setRequiredLandType] = useState('🌾 పంట పొలాలు');
  const [requiredAcres, setRequiredAcres] = useState<number>(2);
  const [budget, setBudget] = useState<number>(5000000);
  const [cropGardenPreference, setCropGardenPreference] = useState('');
  const [waterRequirement, setWaterRequirement] = useState('Borewell & Canal (బోరుబావి & కాల్వ)');
  const [buyOrLease, setBuyOrLease] = useState<'buy' | 'lease'>('buy');
  const [additionalRequirements, setAdditionalRequirements] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync mandals & villages
  useEffect(() => {
    const mandals = MANDALS_BY_DISTRICT[district] || [];
    setMandal(mandals[0] || '');
  }, [district]);

  useEffect(() => {
    if (mandal) {
      const villages = VILLAGES_BY_MANDAL[mandal] || [];
      setVillage(villages[0] || '');
    }
  }, [mandal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('దయచేసి మీ పేరు రాయండి (Customer Name is required).');
      return;
    }
    if (!mobileNumber.trim()) {
      setErrorMsg('దయచేసి ఫోన్ నెంబర్ రాయండి (Mobile Number is required).');
      return;
    }
    if (requiredAcres <= 0) {
      setErrorMsg('దయచేసి ఎకరాల సంఖ్యను సరిగ్గా నమోదు చేయండి (Required Acres must be greater than 0).');
      return;
    }
    if (budget <= 0) {
      setErrorMsg('దయచేసి బడ్జెట్ నమోదు చేయండి (Budget is required).');
      return;
    }

    const newRequest: BuyerRequest = {
      id: `req-${Date.now()}`,
      customerName,
      mobileNumber,
      district,
      mandal,
      village,
      requiredLandType,
      requiredAcres,
      budget,
      cropGardenPreference: cropGardenPreference.trim() || undefined,
      waterRequirement: waterRequirement.trim() || undefined,
      buyOrLease,
      additionalRequirements: additionalRequirements.trim() || undefined,
      createdAt: new Date().toISOString(),
      submittedBy: currentUserUid || 'anonymous',
    };

    try {
      await setDoc(doc(db, 'buyer_requests', newRequest.id), newRequest);
      onSubmit(newRequest);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Error submitting buyer request to Firestore:", err);
      setErrorMsg('డేటాబేస్ సమస్య వచ్చింది. దయచేసి మళ్ళీ ప్రయత్నించండి (Database error occurred).');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col z-10"
        >
          {/* Header */}
          <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="font-display font-bold text-stone-900 text-base md:text-lg">
                  కొనుగోలు / లీజు అభ్యర్థన (Add Buyer Land Request)
                </h3>
                <p className="text-[10px] text-stone-500 font-medium">
                  మీకు కావలసిన వ్యవసాయ సాగుభూమి లేదా పండ్ల తోటల వివరాలను ఇక్కడ సబ్మిట్ చేయండి
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 overflow-y-auto flex-1 max-h-[calc(90vh-120px)]">
            {isSubmitted ? (
              <div className="text-center py-8 space-y-6">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-display font-black text-stone-950 text-lg">
                    అభ్యర్థన విజయవంతంగా నమోదైంది!
                  </h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                    మీ వ్యవసాయ స్థలం కొనుగోలు అభ్యర్థన సిస్టమ్‌లో దాఖలైంది. సరిపోయే ల్యాండ్స్ అమ్మకానికి రాగానే మా టీమ్ లేదా సెల్లర్స్ మిమ్మల్ని సంప్రదిస్తారు.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-stone-900 hover:bg-stone-850 text-white font-bold text-xs rounded-xl hover:shadow-lg transition-all cursor-pointer"
                >
                  ముగించు (Close)
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs flex items-center gap-2 border border-rose-100 font-medium animate-shake">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* row 1: Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-750">కస్టమర్ పేరు (Customer Name) *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="ఉదా: రాఘవ ఇన్‌జరాపు"
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-750">మొబైల్ నెంబర్ (Mobile Number) *</label>
                    <input
                      type="text"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="ఉదా: 8977776111"
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                    />
                  </div>
                </div>

                {/* row 2: District, Mandal, Village */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-750">జిల్లా (District) *</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white font-medium text-stone-700"
                    >
                      {AP_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-750">మండలం (Mandal) *</label>
                    <select
                      value={mandal}
                      onChange={(e) => setMandal(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white font-medium text-stone-700"
                    >
                      {(MANDALS_BY_DISTRICT[district] || []).map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-750">గ్రామం (Village) *</label>
                    <select
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white font-medium text-stone-700"
                    >
                      {(VILLAGES_BY_MANDAL[mandal] || []).map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* row 3: Land Type, Acres, Buy/Lease */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-750">కావలసిన భూమి రకం (Required Land Type)</label>
                    <select
                      value={requiredLandType}
                      onChange={(e) => setRequiredLandType(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white font-medium text-stone-700"
                    >
                      {AGRICULTURAL_SUBCATEGORIES.map((s) => (
                        <option key={s.value} value={s.value}>{s.value}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-750">కావలసిన ఎకరాలు (Required Acres) *</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      value={requiredAcres}
                      onChange={(e) => setRequiredAcres(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-750">కొనుగోలు లేదా లీజు (Buy or Lease)</label>
                    <div className="grid grid-cols-2 gap-1 bg-stone-100 p-1 rounded-xl text-center text-xs">
                      {(['buy', 'lease'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setBuyOrLease(mode)}
                          className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            buyOrLease === mode
                              ? 'bg-white text-stone-900 shadow-xs'
                              : 'text-stone-500 hover:text-stone-900'
                          }`}
                        >
                          {mode === 'buy' ? 'కొనుగోలు' : 'లీజుకు'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* row 4: Budget & Water Requirement */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-750">బడ్జెట్ పరిమితి (Budget in ₹) *</label>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      placeholder="ఉదా: 5000000"
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-mono font-bold animate-pulse-slow"
                    />
                    <span className="text-[10px] text-amber-700 block font-bold">
                      లక్షలలో: ₹{(budget / 100000).toFixed(1)} లక్షలు
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-750">నీటి అవసరాలు (Water Requirement)</label>
                    <input
                      type="text"
                      value={waterRequirement}
                      onChange={(e) => setWaterRequirement(e.target.value)}
                      placeholder="ఉదా: బోరుబావి మరియు నిరంతర కాల్వ సౌకర్యం"
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* row 5: Crop / Garden Preference */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-750">పంట / తోట ప్రాధాన్యత (Crop / Garden Preference)</label>
                  <input
                    type="text"
                    value={cropGardenPreference}
                    onChange={(e) => setCropGardenPreference(e.target.value)}
                    placeholder="ఉదా: మామిడి తోటలు లేదా వరి పండించే క్లియర్ టైటిల్ సాగుభూమి"
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* row 6: Additional Requirements */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-750">ఇతర అవసరాలు (Additional Requirements)</label>
                  <textarea
                    rows={2}
                    value={additionalRequirements}
                    onChange={(e) => setAdditionalRequirements(e.target.value)}
                    placeholder="సరిహద్దు గోడ, రోడ్డు వెడల్పు, విద్యుత్ ట్రాన్స్ఫార్మర్ లేదా ఫామ్ హౌస్ ఉంటే బాగుంటుంది మొదలైన ఇతర వివరాలు..."
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 text-stone-600 bg-stone-100 hover:bg-stone-200 text-xs font-bold rounded-2xl transition-all cursor-pointer text-center"
                  >
                    రద్దు (Cancel)
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer text-center"
                  >
                    సమర్పించండి (Submit Request)
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
