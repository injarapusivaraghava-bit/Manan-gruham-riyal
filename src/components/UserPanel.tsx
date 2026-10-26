import React, { useState, useEffect } from 'react';
import { PropertyListing, PropertyType } from '../types';
import { Clock, Calendar, CreditCard, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Landmark, Plus, ArrowUpRight, Copy, Trash2, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RazorpayModal } from './RazorpayModal';

interface UserPanelProps {
  listings: PropertyListing[];
  onRenewListing: (id: string, paymentId: string) => void;
  onOpenAddModal: () => void;
  onDeleteListing?: (id: string) => void;
  onEditListing?: (property: PropertyListing) => void;
}

interface LocalPaymentRecord {
  id: string;
  paymentId: string;
  propertyId: string;
  propertyName: string;
  amount: number;
  packageName?: string;
  date: string;
  expiryDate: string;
  status: string;
}

export const UserPanel: React.FC<UserPanelProps> = ({
  listings,
  onRenewListing,
  onOpenAddModal,
  onDeleteListing,
  onEditListing,
}) => {
  const [userListings, setUserListings] = useState<PropertyListing[]>([]);
  const [payments, setPayments] = useState<LocalPaymentRecord[]>([]);
  const [subTab, setSubTab] = useState<'listings' | 'payments'>('listings');
  const [isCopiedId, setIsCopiedId] = useState<string | null>(null);

  // For renewal flow
  const [renewProperty, setRenewProperty] = useState<PropertyListing | null>(null);

  const loadUserData = () => {
    // 1. Load user listings matching saved listing IDs
    const userIds: string[] = JSON.parse(localStorage.getItem('mana_gruham_user_listing_ids') || '[]');
    const matched = listings.filter((l) => userIds.includes(l.id));
    setUserListings(matched);

    // 2. Load payment history from local storage
    const storedPayments: LocalPaymentRecord[] = JSON.parse(localStorage.getItem('mana_gruham_payments_v1') || '[]');
    setPayments(storedPayments);
  };

  useEffect(() => {
    loadUserData();
  }, [listings]);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setIsCopiedId(id);
    setTimeout(() => setIsCopiedId(null), 2000);
  };

  const calculateDaysRemaining = (expiryStr?: string) => {
    if (!expiryStr) return 90;
    const exp = new Date(expiryStr).getTime();
    const diff = exp - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleRenewalSuccess = (paymentId: string) => {
    if (!renewProperty) return;

    // Call state updater
    onRenewListing(renewProperty.id, paymentId);

    // Dynamic price and validity based on listing's package
    const pkgId = renewProperty.packageName || 'basic';
    const price = pkgId === 'featured' ? 1999 : pkgId === 'premium' ? 999 : 499;
    const validity = pkgId === 'featured' ? 365 : pkgId === 'premium' ? 180 : 90;
    const pkgName = pkgId === 'featured' ? 'Featured Listing' : pkgId === 'premium' ? 'Premium Listing' : 'Basic Listing';

    // Log new payment record to localStorage
    const now = new Date();
    const expiry = new Date();
    expiry.setDate(now.getDate() + validity);

    const paymentRecord: LocalPaymentRecord = {
      id: `tx_renew_${Date.now()}`,
      paymentId,
      propertyId: renewProperty.id,
      propertyName: renewProperty.title,
      amount: price,
      packageName: pkgName,
      date: now.toISOString(),
      expiryDate: expiry.toISOString(),
      status: 'success'
    };

    const updatedPayments = [paymentRecord, ...payments];
    localStorage.setItem('mana_gruham_payments_v1', JSON.stringify(updatedPayments));
    setPayments(updatedPayments);

    setRenewProperty(null);
    loadUserData();
  };

  const getPropertyTypeLabel = (type: PropertyType) => {
    switch (type) {
      case 'house': return 'ఇల్లు (House)';
      case 'apartment': return 'ఫ్లాట్ (Flat)';
      case 'plot': return 'ప్లాట్ (Plot)';
      case 'commercial': return 'వ్యాపార (Comm)';
      case 'farm_land': return 'వ్యవసాయం (Farm)';
      default: return 'స్థిరాస్తి';
    }
  };

  return (
    <div id="user-dashboard-workspace" className="bg-white rounded-3xl border border-stone-200/85 p-6 shadow-xs overflow-hidden space-y-6">
      
      {/* Dashboard Brand Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 rounded-2xl text-amber-600">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-stone-900 text-base md:text-lg">
              యూజర్ కంట్రోల్ డ్యాష్‌బోర్డ్ (User Workspace Panel)
            </h3>
            <p className="text-xs text-stone-400">
              మీరు సమర్పించిన ఆస్తుల వివరాలు మరియు బిల్లింగ్ సమాచారాన్ని ఇక్కడ నిర్వహించుకోవచ్చు.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shrink-0 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>ఇల్లు నమోదు చేయండి (Post Property)</span>
        </button>
      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100/80">
          <span className="text-[10px] text-stone-400 font-bold uppercase block">నా లిస్టింగ్స్ (My Listings)</span>
          <span className="text-xl font-display font-black text-stone-800 font-mono">{userListings.length}</span>
        </div>
        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100/50">
          <span className="text-[10px] text-emerald-700 font-bold uppercase block">అప్రూవ్డ్ (Approved)</span>
          <span className="text-xl font-display font-black text-emerald-600 font-mono">
            {userListings.filter((l) => l.isApproved === 'Yes').length}
          </span>
        </div>
        <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-100/50">
          <span className="text-[10px] text-amber-700 font-bold uppercase block">రివ్యూలో ఉన్నవి (Pending Review)</span>
          <span className="text-xl font-display font-black text-amber-600 font-mono">
            {userListings.filter((l) => l.isApproved === 'Pending').length}
          </span>
        </div>
        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
          <span className="text-[10px] text-blue-700 font-bold uppercase block">మొత్తం పేమెంట్లు (Total Paid)</span>
          <span className="text-xl font-display font-black text-blue-600 font-mono">
            ₹{payments.reduce((acc, p) => acc + (p.amount || 499), 0)}
          </span>
        </div>
      </div>

      {/* Sub-Tabs Nav */}
      <div className="flex border-b border-stone-150">
        <button
          onClick={() => setSubTab('listings')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 -mb-[2px] transition-all cursor-pointer ${
            subTab === 'listings'
              ? 'border-amber-500 text-amber-700 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-500" />
          <span>నా ఇళ్ళు / ప్లాట్లు ({userListings.length})</span>
        </button>
        <button
          onClick={() => setSubTab('payments')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 -mb-[2px] transition-all cursor-pointer ${
            subTab === 'payments'
              ? 'border-amber-500 text-amber-700 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <CreditCard className="w-4 h-4 text-blue-500" />
          <span>పేమెంట్స్ చరిత్ర (Payment History)</span>
        </button>
      </div>

      {/* View Contents */}
      {subTab === 'listings' ? (
        <div className="space-y-4">
          {userListings.length === 0 ? (
            <div className="text-center py-14 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
              <Landmark className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <p className="text-xs text-stone-500 font-semibold">మీరు ఇంకా ఏ స్థిరాస్తిని అప్‌లోడ్ చేయలేదు!</p>
              <p className="text-[10px] text-stone-400 mt-1">పైన ఉన్న "ఇల్లు నమోదు చేయండి" బటన్ ద్వారా మీ మొదటి ప్రకటనను పోస్ట్ చేయండి.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userListings.map((item) => {
                const daysLeft = calculateDaysRemaining(item.expiryDate);
                const isExpired = daysLeft <= 0;
                
                return (
                  <div
                    key={item.id}
                    className="p-5 bg-white border border-stone-200 rounded-2xl shadow-2xs hover:border-amber-400/60 hover:shadow-xs transition-all flex gap-4"
                  >
                    {/* Thumbnail */}
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-24 h-24 rounded-xl object-cover border border-stone-100 shrink-0"
                    />

                    {/* Metadata & Actions */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        {/* Type & Approval badge */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] bg-stone-100 text-stone-600 font-bold px-2 py-0.5 rounded-full uppercase">
                            {getPropertyTypeLabel(item.type)}
                          </span>
                          {item.packageName && (
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                              item.packageName === 'featured'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : item.packageName === 'premium'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-stone-100 text-stone-800 border border-stone-200'
                            }`}>
                              {item.packageName === 'featured' ? '★ Featured' : item.packageName === 'premium' ? 'Premium' : 'Basic'}
                            </span>
                          )}
                          
                          {item.isApproved === 'Yes' ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>లైవ్ (Live Active)</span>
                            </span>
                          ) : item.isApproved === 'Pending' ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100 animate-pulse">
                              <Clock className="w-2.5 h-2.5" />
                              <span>పెండింగ్ (Pending)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-100">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>రిజెక్టెడ్ (Rejected)</span>
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="font-bold text-stone-800 text-xs sm:text-sm mt-1.5 truncate" title={item.title}>
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-stone-500 font-medium">
                          {item.area}, {item.city} • <span className="font-mono font-bold text-stone-700">₹{item.priceFormatted}</span>
                        </p>
                      </div>

                      {/* Expiry Countdown & Actions Row */}
                      <div className="pt-3 border-t border-stone-100 mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-stone-400 font-bold uppercase block">Expiry Countdown</span>
                          {isExpired ? (
                            <span className="text-[10px] text-rose-600 font-black">
                              ⚠️ కాలపరిమితి ముగిసింది (Expired)
                            </span>
                          ) : (
                            <span className={`text-[10px] font-bold ${daysLeft <= 15 ? 'text-amber-600 animate-pulse' : 'text-stone-600'}`}>
                              ⏳ ఇంకా {daysLeft} రోజులు ఉంది ({daysLeft} days)
                            </span>
                          )}
                        </div>

                        {/* Actions group: Edit, Delete, Renew */}
                        <div className="flex flex-wrap gap-1.5 self-start sm:self-auto">
                          {onEditListing && (
                            <button
                              onClick={() => onEditListing(item)}
                              className="px-2.5 py-1.5 bg-stone-100 hover:bg-amber-50 hover:text-amber-700 text-stone-700 border border-stone-200 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                              title="సవరించండి (Edit)"
                            >
                              <Edit3 className="w-3 h-3 text-amber-600" />
                              <span>సవరించు (Edit)</span>
                            </button>
                          )}
                          
                          {onDeleteListing && (
                            <button
                              onClick={async () => {
                                if (window.confirm("ఈ ప్రకటనను శాశ్వతంగా తొలగించాలనుకుంటున్నారా? (Are you sure you want to delete this listing?)")) {
                                  await onDeleteListing(item.id);
                                }
                              }}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                              title="తొలగించండి (Delete)"
                            >
                              <Trash2 className="w-3 h-3 text-rose-600" />
                              <span>తొలగించు (Delete)</span>
                            </button>
                          )}

                          <button
                            onClick={() => setRenewProperty(item)}
                            className={`px-2.5 py-1.5 text-[10px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                              isExpired 
                                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs' 
                                : 'bg-stone-100 hover:bg-amber-50 hover:text-amber-700 text-stone-700 border border-stone-200/60'
                            }`}
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>పునరుద్ధరణ (Renew)</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Tab 2: Payment Ledger list */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5 uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              సురక్షిత లావాదేవీల రికార్డు (Billing Transaction Ledger)
            </span>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-14 bg-stone-50 rounded-3xl border border-stone-200/80">
              <CreditCard className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-xs text-stone-500 font-semibold">లావాదేవీలు ఏవీ లేవు!</p>
              <p className="text-[10px] text-stone-400">ఆస్తి వివరాలు నమోదు చేసినప్పుడు చేసిన చెల్లింపులు ఇక్కడ రికార్డ్ అవుతాయి.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-stone-200 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
                    <th className="p-3 text-[11px] font-bold">Payment ID</th>
                    <th className="p-3 text-[11px] font-bold">ఆస్తి పేరు (Property)</th>
                    <th className="p-3 text-[11px] font-bold">తేదీ (Date)</th>
                    <th className="p-3 text-[11px] font-bold">చెల్లించిన అమౌంట్ (Amount)</th>
                    <th className="p-3 text-[11px] font-bold">వ్యాలిడిటీ (Valid Till)</th>
                    <th className="p-3 text-[11px] font-bold text-center">స్టేటస్ (Status)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-amber-50/10 transition-colors">
                      {/* Payment ID copyable */}
                      <td className="p-3 font-mono text-[10px] text-stone-500">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-stone-700">{p.paymentId}</span>
                          <button
                            onClick={() => handleCopy(p.paymentId)}
                            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors"
                            title="Copy ID"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          {isCopiedId === p.paymentId && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-700 font-bold px-1 py-0.5 rounded font-sans">
                              Copied!
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Property Title */}
                      <td className="p-3 max-w-[180px]" title={p.propertyName}>
                        <div className="font-bold text-stone-900 truncate">{p.propertyName}</div>
                        {p.packageName && (
                          <div className="text-[9px] text-amber-600 font-bold uppercase tracking-wider">{p.packageName}</div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="p-3 text-stone-500 font-mono text-[10px]">
                        {new Date(p.date).toLocaleDateString('te-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Amount */}
                      <td className="p-3 font-mono font-bold text-stone-800">
                        ₹{p.amount}.00
                      </td>

                      {/* Expiry Date */}
                      <td className="p-3 font-mono text-[10px] text-rose-600 font-bold">
                        {new Date(p.expiryDate).toLocaleDateString('te-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full border border-emerald-200 uppercase">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Razorpay Renewal Modal overlay integration */}
      {renewProperty && (
        <RazorpayModal
          isOpen={renewProperty !== null}
          onClose={() => setRenewProperty(null)}
          onSuccess={handleRenewalSuccess}
          amount={
            renewProperty.packageName === 'featured'
              ? 1999
              : renewProperty.packageName === 'premium'
              ? 999
              : 499
          }
          propertyName={`పునరుద్ధరణ (${renewProperty.packageName === 'featured' ? 'Featured' : renewProperty.packageName === 'premium' ? 'Premium' : 'Basic'}): ${renewProperty.title}`}
        />
      )}

    </div>
  );
};
