import React, { useState, useEffect } from 'react';
import { Check, Sparkles, ShieldCheck, Zap, Star, Shield, ArrowRight, X, ShoppingBag, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RazorpayModal } from './RazorpayModal';
import { PropertyListing } from '../types';

interface PricingPackagesProps {
  onSelectPackage?: (pkgId: string) => void;
  listings?: PropertyListing[];
  onActivateListing?: (propertyId: string, pkgId: 'basic' | 'premium' | 'featured', paymentId: string) => void;
  onOpenAddModalWithPackage?: (pkgId: 'basic' | 'premium' | 'featured') => void;
}

interface PurchaseItem {
  id: string;
  pkgId: string;
  pkgName: string;
  price: number;
  validity: string;
  paymentId: string;
  purchasedAt: string;
  propertyName?: string;
}

export const PricingPackages: React.FC<PricingPackagesProps> = ({
  onSelectPackage,
  listings = [],
  onActivateListing,
  onOpenAddModalWithPackage,
}) => {
  const [selectedPkg, setSelectedPkg] = useState<any | null>(null);
  const [successPayment, setSuccessPayment] = useState<PurchaseItem | null>(null);
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);

  // Target selection states
  const [selectedPkgForTarget, setSelectedPkgForTarget] = useState<any | null>(null);
  const [targetType, setTargetType] = useState<'existing' | 'new'>('new');
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [userOwnListings, setUserOwnListings] = useState<PropertyListing[]>([]);

  // Load purchase history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mana_gruham_purchases');
      if (stored) {
        setPurchases(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading purchase history:', e);
    }
  }, []);

  // Sync user listings owned locally
  useEffect(() => {
    try {
      const userIds: string[] = JSON.parse(localStorage.getItem('mana_gruham_user_listing_ids') || '[]');
      const matched = listings.filter((l) => userIds.includes(l.id));
      setUserOwnListings(matched);
      if (matched.length > 0) {
        setTargetType('existing');
        setSelectedListingId(matched[0].id);
      } else {
        setTargetType('new');
        setSelectedListingId(null);
      }
    } catch (e) {
      console.error('Error syncing user owned listings:', e);
    }
  }, [listings]);

  const savePurchases = (updated: PurchaseItem[]) => {
    setPurchases(updated);
    try {
      localStorage.setItem('mana_gruham_purchases', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving purchase history:', e);
    }
  };

  const packages = [
    {
      id: 'basic' as const,
      name: 'బేసిక్ ప్లాన్ (Basic Plan)',
      price: 499,
      validity: '90 రోజులు (90 Days)',
      badge: 'సరసమైన ధర (Budget Friendly)',
      badgeColor: 'bg-stone-100 text-stone-800 border-stone-200',
      icon: Shield,
      iconColor: 'text-stone-500',
      borderColor: 'border-stone-200 hover:border-stone-300',
      buttonText: 'బేసిక్ ప్లాన్ కొనుగోలు (Buy Basic)',
      popular: false,
      features: [
        '90 రోజుల వ్యాలిడిటీ (90 Days Validity)',
        'స్టాండర్డ్ ప్రాపర్టీ లిస్టింగ్ (Standard Listing)',
        'ఫోటోలు అప్‌లోడ్ చేయవచ్చు (Photo Upload Support)',
        'వాట్సాప్ ద్వారా డైరెక్ట్ లీడ్స్ (WhatsApp Lead Contacts)',
        'ఓనర్ కాంటాక్ట్ సమాచారం (Direct Owner Details Display)'
      ],
      description: 'వ్యక్తిగత అవసరాలు మరియు సింగిల్ ప్రాపర్టీ అమ్మకాలకు అనువైనది.'
    },
    {
      id: 'premium' as const,
      name: 'ప్రీమియం ప్లాన్ (Premium Plan)',
      price: 999,
      validity: '180 రోజులు (180 Days)',
      badge: 'అత్యంత ప్రజాదరణ పొందినది (Most Popular)',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Zap,
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-200 hover:border-blue-400 ring-2 ring-blue-500/20',
      buttonText: 'ప్రీమియం ప్లాన్ కొనుగోలు (Buy Premium)',
      popular: true,
      features: [
        '180 రోజుల వ్యాలిడిటీ (180 Days Validity)',
        'ప్రాధాన్యత కలిగిన అప్రూవల్ (Priority Admin Approval)',
        'ఎక్కువ మంది కస్టమర్ల చేరువ (Better Visibility)',
        'వెరిఫైడ్ బ్యాడ్జ్ సపోర్ట్ (Verified Listing Badge)',
        '24/7 ప్రాధాన్యత సహాయం (Priority WhatsApp Support)',
        'డైనమిక్ ప్రైస్ ట్రెండ్ అనలిటిక్స్ (Trend Analytics Access)'
      ],
      description: 'త్వరగా ఇల్లు అమ్మడానికి లేదా అద్దెకు ఇవ్వడానికి అనువైన ఉత్తమ ప్లాన్.'
    },
    {
      id: 'featured' as const,
      name: 'フィーチャーడ్ ప్లాన్ (Featured Highlight)',
      price: 1999,
      validity: '365 రోజులు (365 Days)',
      badge: 'గరిష్ట అమ్మకాలు (Maximum Visibility)',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Star,
      iconColor: 'text-amber-500',
      borderColor: 'border-amber-400 shadow-lg shadow-amber-500/5 hover:border-amber-500 ring-2 ring-amber-400/20',
      buttonText: 'ఫీచర్డ్ ప్లాన్ కొనుగోలు (Buy Featured)',
      popular: false,
      features: [
        '365 రోజుల వ్యాలిడిటీ (365 Days Validity)',
        'హోమ్‌పేజీ హైలైట్ (Homepage Highlight Banner)',
        'సెర్చ్‌లో అగ్రస్థానం (Top Search Ranking)',
        'ప్రత్యేక గోల్డెన్ బ్యాడ్జ్ (Exclusive Gold Highlight Frame)',
        'సోషల్ మీడియాలో ప్రచారం (Mana Gruham Social Media Posting)',
        'గరిష్ట ఫోటోల పరిమితి (Unlimited HD Photos Upload)',
        'వాట్సాప్ ద్వారా అల్టిమేట్ లీడ్స్ (Premium Lead Tracking)'
      ],
      description: 'రియల్ ఎస్టేట్ ఏజెంట్లు, బిల్డర్లు మరియు అత్యంత వేగంగా సేల్స్ చేయాలనుకునే వారికి గ్రేట్ చాయిస్.'
    }
  ];

  const comparisonTable = [
    { feature: 'ధర (Price)', basic: '₹499', premium: '₹999', featured: '₹1999' },
    { feature: 'వ్యాలిడిటీ (Validity)', basic: '90 Days', premium: '180 Days', featured: '365 Days' },
    { feature: 'హోమ్‌పేజీ హైలైట్ (Homepage Highlight)', basic: '❌ లేదు', premium: '❌ లేదు', featured: '⭐ అవును (Yes)' },
    { feature: 'సెర్చ్ ర్యాంకింగ్ (Top Search Ranking)', basic: 'Standard', premium: 'High Priority', featured: '🥇 Highest Booster' },
    { feature: 'వెరిఫైడ్ బ్యాడ్జ్ (Verified Badge)', basic: '❌ లేదు', premium: '✔️ అవును (Yes)', featured: '👑 గోల్డ్ బ్యాడ్జ్' },
    { feature: 'సపోర్ట్ (Support)', basic: 'Standard', premium: 'Priority', featured: '24/7 Dedicated Manager' },
    { feature: 'లీడ్ రిపోర్ట్స్ (Lead Access)', basic: 'Standard', premium: 'Instant WhatsApp', featured: 'Instant SMS & WhatsApp' }
  ];

  const handleCheckoutClick = (pkg: any) => {
    setSelectedPkgForTarget(pkg);
    if (onSelectPackage) {
      onSelectPackage(pkg.id);
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    if (!selectedPkg) return;

    let targetName = 'కొత్త ప్రాపర్టీ నమోదు';

    // Call state updater on parent if target listing is an existing listing
    if (targetType === 'existing' && selectedListingId) {
      const targetListing = listings.find((l) => l.id === selectedListingId);
      if (targetListing) {
        targetName = targetListing.title;
      }
      if (onActivateListing) {
        onActivateListing(selectedListingId, selectedPkg.id, paymentId);
      }
    }

    const newPurchase: PurchaseItem = {
      id: 'pur-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      pkgId: selectedPkg.id,
      pkgName: selectedPkg.name,
      price: selectedPkg.price,
      validity: selectedPkg.validity,
      paymentId: paymentId,
      purchasedAt: new Date().toISOString(),
      propertyName: targetName,
    };

    const updated = [newPurchase, ...purchases];
    savePurchases(updated);
    setSuccessPayment(newPurchase);
    setSelectedPkg(null);
  };

  const clearPurchaseHistory = () => {
    if (window.confirm('మీరు కొనుగోలు చరిత్రను ఖాళీ చేయాలనుకుంటున్నారా?')) {
      savePurchases([]);
    }
  };

  const selectedTargetProperty = targetType === 'existing' && selectedListingId
    ? listings.find((l) => l.id === selectedListingId)
    : null;

  return (
    <div id="pricing-packages-wrapper" className="space-y-12">
      {/* Intro section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-xs font-bold text-amber-800">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
          <span>మనం గృహం ప్రకటన ప్యాకేజీలు (Mana Gruham Listing Packages)</span>
        </div>
        <h2 className="font-display font-black text-2xl sm:text-3xl text-stone-950 tracking-tight">
          మీ ఆస్తిని త్వరగా అమ్ముకోండి లేదా అద్దెకు ఇవ్వండి!
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
          ఆంధ్రప్రదేశ్‌లోనే అత్యంత వేగంగా అభివృద్ధి చెందుతున్న స్థిరాస్తి పోర్టల్ మనం గృహం లో మీ ప్రకటనను ప్రచురించడానికి సరైన ప్లాన్ ఎంచుకోండి. మా సిస్టమ్‌లో ప్రతి బడ్జెట్‌కు సరిపోయే ప్యాకేజీ సిద్ధంగా ఉంది.
        </p>
      </div>

      {/* Target Selector Modal */}
      <AnimatePresence>
        {selectedPkgForTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs"
              onClick={() => setSelectedPkgForTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full border border-stone-200 shadow-2xl relative z-10 space-y-5 max-h-[90vh] overflow-y-auto flex flex-col"
            >
              <div className="flex justify-between items-start border-b border-stone-100 pb-3">
                <div>
                  <h4 className="font-display font-black text-stone-900 text-sm md:text-base">
                    ప్యాకేజీని ఏ లిస్టింగ్‌కు వర్తింపజేయాలి?
                  </h4>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    ఎంచుకున్న ప్యాకేజీ: <strong className="text-amber-600">{selectedPkgForTarget.name} - ₹{selectedPkgForTarget.price}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPkgForTarget(null)}
                  className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('new');
                      setSelectedListingId(null);
                    }}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      targetType === 'new'
                        ? 'border-amber-500 bg-amber-50/20 shadow-xs'
                        : 'border-stone-150 bg-white hover:border-stone-300'
                    }`}
                  >
                    <Plus className="w-5 h-5 text-amber-600 mb-1" />
                    <div>
                      <span className="font-bold text-stone-900 text-[11px] block">కొత్త లిస్టింగ్</span>
                      <span className="text-[9px] text-stone-400 block mt-0.5">Create new property</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    disabled={userOwnListings.length === 0}
                    onClick={() => {
                      if (userOwnListings.length > 0) {
                        setTargetType('existing');
                        setSelectedListingId(userOwnListings[0].id);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                      userOwnListings.length === 0 
                        ? 'opacity-40 cursor-not-allowed border-stone-100 bg-stone-50' 
                        : 'cursor-pointer'
                    } ${
                      targetType === 'existing'
                        ? 'border-amber-500 bg-amber-50/20 shadow-xs'
                        : 'border-stone-150 bg-white hover:border-stone-300'
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5 text-amber-600 mb-1" />
                    <div>
                      <span className="font-bold text-stone-900 text-[11px] block">ఉన్న లిస్టింగ్ ({userOwnListings.length})</span>
                      <span className="text-[9px] text-stone-400 block mt-0.5">Apply to existing</span>
                    </div>
                  </button>
                </div>

                {targetType === 'existing' && userOwnListings.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto p-1.5 bg-stone-50 rounded-2xl border border-stone-200/80">
                    <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block px-1 pb-1">మీ స్థిరాస్తుల జాబితా:</span>
                    {userOwnListings.map((l) => (
                      <label
                        key={l.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          selectedListingId === l.id
                            ? 'bg-white border-amber-500 ring-1 ring-amber-500/20 shadow-xs'
                            : 'bg-white/85 border-stone-150 hover:bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="targetListingSelector"
                          checked={selectedListingId === l.id}
                          onChange={() => setSelectedListingId(l.id)}
                          className="text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-stone-900 text-[11px] truncate block">{l.title}</span>
                          <span className="text-[9px] text-stone-400 flex items-center gap-1.5 mt-0.5 font-medium">
                            <span>ధర: {l.priceFormatted}</span>
                            <span>•</span>
                            <span>ఏరియా: {l.area}</span>
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {targetType === 'new' && (
                  <div className="p-3.5 bg-amber-50/50 border border-amber-100 rounded-2xl text-[11px] text-amber-950 leading-relaxed space-y-1.5">
                    <p className="font-bold text-amber-900">💡 కొత్త స్థిరాస్తి పోస్ట్ చేయడం ఎలా?</p>
                    <p>
                      కింద ఉన్న బటన్‌ను క్లిక్ చేయడం ద్వారా కొత్త ఆస్తిని నమోదు చేసే ఫారం ఓపెన్ అవుతుంది. అక్కడ మీ ఆస్తి ఫోటోలు, ధర, ఏరియా వివరాలను ఎంటర్ చేసిన తర్వాత ఈ ప్యాకేజీతో నేరుగా యాక్టివేట్ చేసుకోవచ్చు!
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setSelectedPkgForTarget(null)}
                  className="flex-1 py-3 text-stone-600 bg-stone-100 hover:bg-stone-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  రద్దు (Cancel)
                </button>

                {targetType === 'new' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAddModalWithPackage) {
                        onOpenAddModalWithPackage(selectedPkgForTarget.id);
                      }
                      setSelectedPkgForTarget(null);
                    }}
                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer text-center"
                  >
                    కొత్త ఆస్తిని నమోదు చేయి
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!selectedListingId}
                    onClick={() => {
                      setSelectedPkg(selectedPkgForTarget);
                      setSelectedPkgForTarget(null);
                    }}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer text-center disabled:opacity-40"
                  >
                    యాక్టివేట్ & పేమెంట్ ₹{selectedPkgForTarget.price}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Notification Modal */}
      <AnimatePresence>
        {successPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs"
              onClick={() => setSuccessPayment(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-stone-100 shadow-2xl relative z-10 space-y-6 text-center"
            >
              <div className="w-16 h-16 bg-emerald-500 text-stone-950 rounded-full flex items-center justify-center mx-auto shadow-md">
                <Check className="w-9 h-9 stroke-[3]" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Payment & Activation Successful!
                </span>
                <h3 className="font-display font-black text-xl text-stone-950">
                  లిస్టింగ్ విజయవంతంగా యాక్టివేట్ అయింది!
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  మనం గృహం ప్యాకేజీని విజయవంతంగా కొనుగోలు చేసినందుకు ధన్యవాదాలు. మీ ఎంచుకున్న స్థిరాస్తి ప్రకటన విజయవంతంగా యాక్టివేట్ చేయబడింది మరియు మీ లిస్టింగ్స్ లో ప్రదర్శించబడుతోంది.
                </p>
              </div>

              <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4 text-left font-mono text-[11px] space-y-2">
                {successPayment.propertyName && (
                  <div className="flex justify-between border-b border-stone-100 pb-1.5">
                    <span className="text-stone-400 font-sans font-semibold">లిస్టింగ్ పేరు (Listing):</span>
                    <span className="text-stone-900 font-bold truncate max-w-[200px]">{successPayment.propertyName}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-stone-100 pb-1.5">
                  <span className="text-stone-400 font-sans font-semibold">ప్యాకేజీ (Package):</span>
                  <span className="text-stone-850 font-bold">{successPayment.pkgName}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-1.5">
                  <span className="text-stone-400 font-sans font-semibold">వ్యాలిడిటీ (Validity):</span>
                  <span className="text-stone-800 font-bold">{successPayment.validity}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 pb-1.5">
                  <span className="text-stone-400 font-sans font-semibold">చెల్లించిన ధర (Amount):</span>
                  <span className="text-emerald-600 font-black font-sans">₹{successPayment.price}.00</span>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span className="text-stone-400 font-sans font-semibold">ట్రాన్సాక్షన్ ID (Pay ID):</span>
                  <span className="text-blue-600 font-bold">{successPayment.paymentId}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSuccessPayment(null)}
                  className="w-full py-3 bg-stone-950 hover:bg-stone-900 text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  సరే (Ok, Continue)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Packages Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch font-sans">
        {packages.map((pkg) => {
          const IconComponent = pkg.icon;
          return (
            <motion.div
              key={pkg.id}
              whileHover={{ y: -5 }}
              className={`bg-white rounded-3xl border p-6 sm:p-7 flex flex-col justify-between transition-all relative ${
                pkg.popular ? 'ring-2 ring-blue-500/40 bg-linear-to-b from-blue-50/10 via-white to-white' : ''
              } ${pkg.borderColor}`}
            >
              {/* Popular indicator badge */}
              {pkg.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-md">
                  అత్యంత ప్రజాదరణ (Best Value)
                </div>
              )}

              <div className="space-y-6">
                {/* Header info */}
                <div className="space-y-2">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${pkg.badgeColor}`}>
                    {pkg.badge}
                  </span>
                  <div className="flex items-center gap-2.5 pt-1">
                    <div className={`p-2.5 bg-stone-50 rounded-xl ${pkg.iconColor}`}>
                      <IconComponent className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <h3 className="font-bold text-stone-900 text-base sm:text-lg">
                      {pkg.name}
                    </h3>
                  </div>
                </div>

                {/* Pricing & Validity info */}
                <div className="bg-stone-50/80 p-4 rounded-2xl border border-stone-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-stone-500">₹</span>
                    <span className="text-2xl sm:text-3xl font-display font-black text-stone-950 font-mono tracking-tight">
                      {pkg.price}
                    </span>
                    <span className="text-xs text-stone-400 font-medium ml-1">/ ప్లాన్ ఫీజు</span>
                  </div>
                  <div className="text-[11px] text-stone-500 font-bold mt-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>వ్యాలిడిటీ (Validity): <strong className="text-stone-800">{pkg.validity}</strong></span>
                  </div>
                </div>

                {/* Short intro description */}
                <p className="text-[11px] text-stone-500 leading-relaxed font-medium">
                  {pkg.description}
                </p>

                <hr className="border-stone-100" />

                {/* Features listing checklist */}
                <div className="space-y-3">
                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">లిస్ట్ లో చేరే ప్రయోజనాలు:</span>
                  <ul className="space-y-2.5">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-stone-700">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 stroke-[3]" />
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => handleCheckoutClick(pkg)}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                    pkg.id === 'basic'
                      ? 'bg-stone-900 hover:bg-stone-800 text-white shadow-md active:scale-95'
                      : pkg.id === 'premium'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-95'
                      : 'bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-md active:scale-95 font-black'
                  }`}
                >
                  <span>{pkg.buttonText}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>

            </motion.div>
          );
        })}
      </div>

      {/* Feature comparison table section */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="font-bold text-stone-950 text-sm sm:text-base">
              ప్యాకేజీ ఫీచర్ల సమగ్ర పోలిక (Feature Comparison Matrix)
            </h3>
            <p className="text-[11px] text-stone-400">మీ ప్రకటనకు లభించే మొత్తం సౌకర్యాల స్పష్టమైన సమాచారం.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600 border-collapse">
            <thead>
              <tr className="border-b border-stone-100 text-[10px] text-stone-400 uppercase font-black tracking-wider">
                <th className="p-3 pl-0">ఫీチャー (Benefit / Detail)</th>
                <th className="p-3 text-stone-800">బేసిక్ (₹499)</th>
                <th className="p-3 text-blue-700">ప్రీమియం (₹999)</th>
                <th className="p-3 text-amber-600">ఫీచర్డ్ (₹1999)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {comparisonTable.map((row, index) => (
                <tr key={index} className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-3 pl-0 text-stone-800 font-semibold">{row.feature}</td>
                  <td className="p-3 font-semibold text-stone-600">{row.basic}</td>
                  <td className="p-3 font-semibold text-blue-600">{row.premium}</td>
                  <td className="p-3 font-black text-amber-600">{row.featured}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-100/50 text-[11px] text-amber-800 leading-relaxed font-medium">
          💡 <strong>సెక్యూరిటీ సూచన (Security Info):</strong> మీ చెల్లింపులు అత్యంత సురక్షితమైన రేజర్‌పే గేట్‌వే (Razorpay Sandbox Simulator) ద్వారా నిర్వహించబడతాయి. ప్రయోగాత్మక ప్రయోజనాల కోసం నిజమైన క్రెడిట్ కార్డులు అవసరం లేదు, మీరు విజయవంతమైన పేమెంట్ లేదా ఫెయిల్ అయిన పేమెంట్‌ను సిమ్యులేటర్ కంట్రోల్స్ లో మార్చుకోవచ్చు.
        </div>
      </div>

      {/* Purchases log history section if there are any purchases */}
      {purchases.length > 0 && (
        <div className="bg-stone-50 border border-stone-200/60 rounded-3xl p-5 sm:p-7 space-y-5">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-stone-800" />
              <div>
                <h3 className="font-bold text-stone-950 text-xs sm:text-sm">
                  మీ కొనుగోలు చరిత్ర (Your Purchase History - sandbox)
                </h3>
                <p className="text-[10px] text-stone-400">స్థానికంగా నిల్వ చేయబడిన ప్రయోగాత్మక లావాదేవీలు.</p>
              </div>
            </div>
            <button
              onClick={clearPurchaseHistory}
              className="text-[10px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 px-3 py-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ఖాతా క్లియర్ చేయి</span>
            </button>
          </div>

          <div className="space-y-3 font-sans">
            {purchases.map((pur) => (
              <div
                key={pur.id}
                className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{pur.pkgName}</span>
                    <span className="text-[10px] font-mono text-stone-400">ID: {pur.id}</span>
                  </div>
                  {pur.propertyName && (
                    <div className="text-[10px] text-amber-700 font-bold">
                      వర్తింపజేసిన ఆస్తి: {pur.propertyName}
                    </div>
                  )}
                  <div className="text-[10px] text-stone-400 flex flex-wrap gap-x-3 gap-y-1 font-medium">
                    <span>కొనుగోలు తేదీ: {new Date(pur.purchasedAt).toLocaleString('te-IN')}</span>
                    <span>వ్యాలిడిటీ: {pur.validity}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 pt-2 sm:pt-0">
                  <div className="text-right font-sans">
                    <div className="font-mono font-black text-stone-950 text-sm">₹{pur.price}.00</div>
                    <div className="text-[9px] text-emerald-600 font-bold flex items-center gap-1 justify-end">
                      <ShieldCheck className="w-3 h-3" /> SUCCESS
                    </div>
                  </div>
                  <div className="font-mono text-[9px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                    PayID: {pur.paymentId.substring(0, 10)}...
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Razorpay Integration Modal */}
      {selectedPkg && (
        <RazorpayModal
          isOpen={selectedPkg !== null}
          onClose={() => setSelectedPkg(null)}
          onSuccess={handlePaymentSuccess}
          amount={selectedPkg.price}
          propertyName={
            selectedTargetProperty
              ? `స్థిరాస్తి యాక్టివేషన్: ${selectedTargetProperty.title}`
              : `అమ్మకాల ప్రకటన ప్యాకేజీ (${selectedPkg.id === 'basic' ? 'Basic Plan' : selectedPkg.id === 'premium' ? 'Premium Plan' : 'Featured Plan'})`
          }
        />
      )}
    </div>
  );
};
