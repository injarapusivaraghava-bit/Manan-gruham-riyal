import React, { useState } from 'react';
import { PropertyListing, ApprovalStatus, UserFeedback, ManaGruhamPayment } from '../types';
import { Check, X, Shield, Lock, Unlock, RefreshCw, AlertTriangle, Trash2, Eye, MessageSquare, Sparkles, Mail, Calendar, Phone, CreditCard, DollarSign, Clock, Clipboard, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminPanelProps {
  listings: PropertyListing[];
  onUpdateApproval: (id: string, status: ApprovalStatus) => void;
  onDeleteListing: (id: string) => void;
  onViewProperty: (property: PropertyListing) => void;
  feedbacks: UserFeedback[];
  onDeleteFeedback: (id: string) => void;
  onExtendExpiry: (id: string) => void;
  payments: ManaGruhamPayment[];
  onVerifyPayment: (txnId: string) => void;
  onRejectPayment: (txnId: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  listings,
  onUpdateApproval,
  onDeleteListing,
  onViewProperty,
  feedbacks = [],
  onDeleteFeedback,
  onExtendExpiry,
  payments = [],
  onVerifyPayment,
  onRejectPayment,
}) => {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [adminSubTab, setAdminSubTab] = useState<'listings' | 'feedbacks' | 'payments'>('listings');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const correctCode = 'raghava123';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim().toLowerCase() === correctCode) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('తప్పుడు పాస్‌వర్డ్! దయచేసి మళ్ళీ ప్రయత్నించండి.');
    }
  };

  const handleBypass = () => {
    setPasscode(correctCode);
    setIsAuthenticated(true);
    setAuthError('');
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const calculateDaysRemaining = (expiryStr?: string) => {
    if (!expiryStr) return null;
    const exp = new Date(expiryStr).getTime();
    const diff = exp - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const verifiedCustomPayments = payments.filter((p) => p.status === 'Verified');
  const paidListings = listings.filter((l) => l.paymentId && l.paymentStatus === 'success');
  const totalRevenue = paidListings.reduce((sum, item) => sum + (item.paymentAmount || 0), 0) + verifiedCustomPayments.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div id="admin-workspace-panel" className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm overflow-hidden">
      {!isAuthenticated ? (
        /* Access Control Screen */
        <div className="max-w-md mx-auto text-center py-8 space-y-6">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-bold text-stone-900 text-lg">
              అడ్మిన్ వర్క్‌స్పేస్ (Admin Control Board)
            </h3>
            <p className="text-stone-500 text-xs leading-relaxed">
              లిస్టింగ్‌లను వెరిఫై చేయడానికి, గూగుల్ షీట్ మాదిరిగా <strong className="text-amber-700">Is_Approved</strong> కాలమ్ అప్‌డేట్ చేయడానికి అడ్మిన్ పాస్‌కోడ్ అవసరం.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="block text-[10px] text-stone-500 uppercase font-semibold">
                అడ్మిన్ పాస్‌కోడ్ నమోదు చేయండి
              </label>
              <input
                id="admin-passcode-input"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="ఉదా: raghava123"
                className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm text-center focus:ring-2 focus:ring-amber-500 font-mono"
              />
              {authError && (
                <p className="text-rose-600 text-[10px] font-semibold mt-1">
                  ⚠️ {authError}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                id="admin-login-submit"
                type="submit"
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                లాగిన్ (Login)
              </button>
              
              <button
                id="admin-bypass-btn"
                type="button"
                onClick={handleBypass}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                డెమో లాగిన్ (Auto-Fill)
              </button>
            </div>
            
            <p className="text-[10px] text-amber-600 bg-amber-50 rounded-lg p-2 leading-relaxed">
              💡 డెమో కోసం పాస్‌కోడ్: <code className="font-bold underline">raghava123</code> ని ఉపయోగించండి.
            </p>
          </form>
        </div>
      ) : (
        /* Authenticated Google-Sheet style Admin view */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                <Unlock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-stone-900 text-base md:text-lg">
                  శివ రాఘవ గారి అడ్మిన్ బోర్డు (Google Sheets Simulator)
                </h3>
                <p className="text-xs text-stone-500">
                  ఇక్కడ మీరు ప్రతి ఇల్లు/ప్లాట్ యొక్క <strong className="text-emerald-700 font-mono">Is_Approved</strong> స్టేటస్ మరియు పేమెంట్స్ అప్‌డేట్ చేయవచ్చు.
                </p>
              </div>
            </div>
            
            <button
              id="admin-logout-btn"
              onClick={() => {
                setIsAuthenticated(false);
                setPasscode('');
              }}
              className="px-3 py-1.5 border border-stone-200 text-stone-600 text-xs rounded-lg hover:bg-stone-50 font-bold cursor-pointer transition-colors"
            >
              లాగౌట్ (Logout)
            </button>
          </div>

          {/* Sub-Tab navigation for Admin */}
          <div className="flex border-b border-stone-150">
            <button
              id="admin-subtab-listings-btn"
              onClick={() => setAdminSubTab('listings')}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 -mb-[2px] transition-all cursor-pointer ${
                adminSubTab === 'listings'
                  ? 'border-amber-500 text-amber-700 font-black'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-500" />
              <span>లిస్టింగ్స్ అనుమతి పట్టిక ({listings.length})</span>
            </button>
            <button
              id="admin-subtab-payments-btn"
              onClick={() => setAdminSubTab('payments')}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 -mb-[2px] transition-all cursor-pointer ${
                adminSubTab === 'payments'
                  ? 'border-amber-500 text-amber-700 font-black'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-500" />
              <span>చెల్లింపుల నివేదిక ({paidListings.length})</span>
            </button>
            <button
              id="admin-subtab-feedbacks-btn"
              onClick={() => setAdminSubTab('feedbacks')}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 -mb-[2px] transition-all cursor-pointer ${
                adminSubTab === 'feedbacks'
                  ? 'border-amber-500 text-amber-700 font-black'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-purple-500" />
              <span>వినియోగదారుల అభిప్రాయాలు ({feedbacks.length})</span>
            </button>
          </div>

          {adminSubTab === 'listings' ? (
            <>
              {/* Quick stats panel */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100/80 text-center">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">మొత్తం ఇళ్ళు (Total Listings)</span>
                  <span className="text-xl font-display font-bold text-stone-800 font-mono">{listings.length}</span>
                </div>
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 text-center">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase block">అప్రూవ్డ్ (Approved - Yes)</span>
                  <span className="text-xl font-display font-bold text-emerald-600 font-mono">
                    {listings.filter((l) => l.isApproved === 'Yes').length}
                  </span>
                </div>
                <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-100/50 text-center">
                  <span className="text-[10px] text-amber-700 font-bold uppercase block">వేచి ఉన్నవి (Pending)</span>
                  <span className="text-xl font-display font-bold text-amber-600 font-mono animate-pulse">
                    {listings.filter((l) => l.isApproved === 'Pending').length}
                  </span>
                </div>
                <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100/50 text-center">
                  <span className="text-[10px] text-rose-700 font-bold uppercase block">రిజెక్టెడ్ (Rejected - No)</span>
                  <span className="text-xl font-display font-bold text-rose-600 font-mono">
                    {listings.filter((l) => l.isApproved === 'No').length}
                  </span>
                </div>
              </div>

              {/* Google Sheets Table Simulator */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5 uppercase tracking-wide">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    నిజ-సమయ అనుమతి కాలమ్ పట్టిక (Live Verification Table)
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                    Is_Approved Column Live
                  </span>
                </div>

                {listings.length === 0 ? (
                  <div className="text-center py-10 bg-stone-50 rounded-2xl border border-stone-200">
                    <AlertTriangle className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                    <p className="text-xs text-stone-500 font-semibold">లిస్టింగ్స్ ఏవీ లేవు! ఒక కొత్త ఇల్లు అప్లోడ్ చేయండి.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-stone-200/80 rounded-2xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
                          <th className="p-3 text-[11px] font-bold">ID / ఫోటో</th>
                          <th className="p-3 text-[11px] font-bold">శీర్షిక (Listing Title)</th>
                          <th className="p-3 text-[11px] font-bold">పరిమాణం/స్థితి</th>
                          <th className="p-3 text-[11px] font-bold text-emerald-800">పేమెంట్ స్టేటస్ (Payment)</th>
                          <th className="p-3 text-[11px] font-bold text-rose-800">వ్యాలిడిటీ (Validity)</th>
                          <th className="p-3 text-[11px] font-bold text-amber-800">IS_APPROVED</th>
                          <th className="p-3 text-[11px] font-bold text-center">చర్యలు (Actions)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {listings.map((item) => {
                          const daysRemaining = calculateDaysRemaining(item.expiryDate);
                          const isExpired = daysRemaining !== null && daysRemaining <= 0;

                          return (
                            <tr key={item.id} className="hover:bg-amber-50/20 transition-colors">
                              {/* ID / Photo Thumbnail */}
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] text-stone-400 font-semibold">{item.id.replace('prop-', '').substring(0, 7)}</span>
                                  <img
                                    src={item.imageUrl}
                                    alt=""
                                    referrerPolicy="no-referrer"
                                    className="w-10 h-7 rounded object-cover border border-stone-200"
                                  />
                                </div>
                              </td>

                              {/* Title & Submitter */}
                              <td className="p-3 max-w-xs">
                                <p className="font-bold text-stone-800 truncate" title={item.title}>{item.title}</p>
                                <p className="text-[10px] text-stone-400 font-medium">Submitted by: <span className="font-semibold">{item.contactName}</span> • {item.contactPhone}</p>
                              </td>

                              {/* Size, City & Price */}
                              <td className="p-3">
                                <p className="font-semibold text-stone-700">{item.size}</p>
                                <p className="text-[10px] text-stone-500 font-mono font-bold">₹{item.priceFormatted}</p>
                              </td>

                              {/* Payment status and ID */}
                              <td className="p-3">
                                {item.paymentId ? (
                                  <div className="space-y-1">
                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-bold text-[9px] ${
                                      item.packageName === 'featured'
                                        ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                        : item.packageName === 'premium'
                                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    }`}>
                                      ₹{item.paymentAmount || 499} - {item.packageName ? item.packageName.toUpperCase() : 'BASIC'}
                                    </span>
                                    <div className="flex items-center gap-1 text-[9px] text-stone-400 font-mono font-bold">
                                      <span>ID: {item.paymentId.substring(0, 10)}...</span>
                                      <button 
                                        onClick={() => handleCopyId(item.paymentId!)}
                                        className="hover:text-stone-700"
                                        title="Copy Payment ID"
                                      >
                                        <Clipboard className="w-2.5 h-2.5 inline" />
                                      </button>
                                      {copiedId === item.paymentId && (
                                        <span className="text-[8px] bg-emerald-500/20 text-emerald-800 px-0.5 rounded">Copied</span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-500 font-semibold text-[9px]">
                                    No Payment
                                  </span>
                                )}
                              </td>

                              {/* Validity Countdown & Date */}
                              <td className="p-3">
                                {item.expiryDate ? (
                                  <div className="space-y-0.5">
                                    <p className="font-mono text-[10px] text-stone-700 font-bold">
                                      {new Date(item.expiryDate).toLocaleDateString('te-IN', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </p>
                                    {isExpired ? (
                                      <span className="text-[9px] font-black text-rose-600 uppercase block">
                                        Expired
                                      </span>
                                    ) : (
                                      <span className="text-[9px] font-bold text-stone-500 block">
                                        ⏳ {daysRemaining} days left
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[9px] text-stone-400 font-bold">Unlimited / Demo</span>
                                )}
                              </td>

                              {/* IS_APPROVED dropdown (Simulating Glide/Google Sheets update) */}
                              <td className="p-3">
                                <select
                                  id={`approve-select-${item.id}`}
                                  value={item.isApproved}
                                  onChange={(e) => onUpdateApproval(item.id, e.target.value as ApprovalStatus)}
                                  className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold font-mono outline-hidden focus:ring-1 focus:ring-amber-500 bg-white cursor-pointer ${
                                    item.isApproved === 'Yes'
                                      ? 'border-emerald-200 text-emerald-700 bg-emerald-50/50'
                                      : item.isApproved === 'Pending'
                                      ? 'border-amber-200 text-amber-700 bg-amber-50/50'
                                      : 'border-rose-200 text-rose-700 bg-rose-50/50'
                                  }`}
                                >
                                  <option value="Yes">Yes (Approved)</option>
                                  <option value="Pending">Pending</option>
                                  <option value="No">No (Rejected)</option>
                                </select>
                              </td>

                              {/* View Details / Renew/Extend / Delete */}
                              <td className="p-3">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    id={`view-admin-${item.id}`}
                                    onClick={() => onViewProperty(item)}
                                    title="లిస్టింగ్ చూడండి"
                                    className="p-1.5 text-stone-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all cursor-pointer"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  
                                  <button
                                    onClick={() => {
                                      onExtendExpiry(item.id);
                                      alert(`"${item.title}" యొక్క కాలపరిమితి మరో 90 రోజులు విజయవంతంగా పొడిగించబడింది!`);
                                    }}
                                    title="కాలపరిమితిని 90 రోజులు పొడిగించండి"
                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                  </button>

                                  <button
                                    id={`delete-admin-${item.id}`}
                                    onClick={() => {
                                      if (confirm(`నిజంగానే ఈ స్థిరాస్తిని ("${item.title}") డిలీట్ చేయాలనుకుంటున్నారా?`)) {
                                        onDeleteListing(item.id);
                                      }
                                    }}
                                    title="లిస్టింగ్ డిలీట్ చేయండి"
                                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 items-start text-xs text-emerald-800 leading-relaxed">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">సెక్యూరిటీ ఎలా పనిచేస్తుంది?</p>
                  <p>
                    ఈ టేబుల్‌లో మీరు ఏదైనా ప్రాపరిటీ యొక్క <strong>Is_Approved</strong> విలువను <strong>"Yes"</strong> కి మార్చిన తక్షణం, 
                    అది ప్రజల సాధారణ వీక్షణలో ప్రత్యక్షమవుతుంది. ఒకవేళ <strong>"Pending"</strong> లేదా <strong>"No"</strong> అని ఉంటే, 
                    సాధారణ కస్టమర్లకు అది కనిపించదు. ఇది నకిలీ వివరాలను నియంత్రించడంలో గ్లైడ్-షీట్ లాంటి అద్భుతమైన రక్షణను అందిస్తుంది.
                  </p>
                </div>
              </div>
            </>
          ) : adminSubTab === 'payments' ? (
            /* Tab 2: Unified Payments Verification Board */
            <div className="space-y-5">
              {/* Payment stats widgets */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase block">మొత్తం వెరిఫైడ్ ఆదాయం (Total Revenue)</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-display font-black text-emerald-950 font-mono">₹{totalRevenue.toLocaleString('en-IN')}</span>
                    <span className="text-[9px] text-emerald-600 font-bold">INR</span>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] text-amber-800 font-bold uppercase block">వెరిఫికేషన్ వేచి ఉన్నవి (Pending)</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-display font-black text-amber-700 font-mono animate-pulse">
                      {payments.filter(p => p.status === 'Pending').length}
                    </span>
                    <span className="text-[9px] text-amber-500 font-bold">Pending</span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] text-blue-800 font-bold uppercase block">ధృవీకరించబడినవి (Verified)</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-display font-black text-blue-700 font-mono">
                      {payments.filter(p => p.status === 'Verified').length}
                    </span>
                    <span className="text-[9px] text-blue-500 font-bold">Verified</span>
                  </div>
                </div>

                <div className="p-4 bg-stone-100 border border-stone-200 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] text-stone-500 font-bold uppercase block">తిరస్కరించబడినవి (Rejected)</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-display font-black text-stone-700 font-mono">
                      {payments.filter(p => p.status === 'Rejected').length}
                    </span>
                    <span className="text-[9px] text-stone-400 font-bold">Rejected</span>
                  </div>
                </div>
              </div>

              {/* Payment Verification List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-display font-bold text-stone-900 text-sm flex items-center gap-2 uppercase tracking-wide">
                    <CreditCard className="w-4 h-4 text-amber-600" />
                    యూపీఐ చెల్లింపుల ధృవీకరణ ప్యానెల్ (UPI Payment Verification Dashboard)
                  </h4>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full uppercase">
                    Direct Verification Active
                  </span>
                </div>

                {payments.length === 0 ? (
                  <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
                    <CreditCard className="w-8 h-8 text-stone-300 mx-auto mb-2 animate-bounce" />
                    <p className="text-xs text-stone-500 font-semibold">చెల్లింపు లావాదేవీలు ఏవీ లేవు! (No payments logged yet)</p>
                    <p className="text-[10px] text-stone-400 max-w-xs mx-auto mt-1">
                      యూజర్లు ఆస్తి ప్యాకేజీలు లేదా అలంకరణ వస్తువులు/సేవలను కొనుగోలు చేసినప్పుడు సమర్పించే UPI UTRలు ఇక్కడ ప్రత్యక్షమవుతాయి.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
                          <th className="p-3 text-[11px] font-bold">కస్టమర్ (Customer)</th>
                          <th className="p-3 text-[11px] font-bold">చెల్లింపు ఉద్దేశం (Purpose)</th>
                          <th className="p-3 text-[11px] font-bold text-right">ధర (Amount)</th>
                          <th className="p-3 text-[11px] font-bold font-mono">లావాదేవీ నంబర్ (UTR)</th>
                          <th className="p-3 text-[11px] font-bold">సమయం (Date/Time)</th>
                          <th className="p-3 text-[11px] font-bold text-center">స్థితి (Status)</th>
                          <th className="p-3 text-[11px] font-bold text-center">ధృవీకరణ చర్యలు (Actions)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {payments.map((p) => (
                          <tr key={p.id} className="hover:bg-amber-50/10 transition-colors">
                            {/* Customer info */}
                            <td className="p-3 font-semibold text-stone-800">
                              <p className="font-bold flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                                <span>{p.customerName}</span>
                              </p>
                              {p.contactPhone && (
                                <p className="text-[10px] text-stone-400 font-mono mt-0.5 font-bold">
                                  📞 {p.contactPhone}
                                </p>
                              )}
                            </td>

                            {/* Purpose and Type */}
                            <td className="p-3">
                              <p className="font-bold text-stone-800 text-[11px] truncate max-w-xs" title={p.paymentPurpose}>
                                {p.paymentPurpose}
                              </p>
                              <span className={`inline-block text-[8px] font-black uppercase px-2 py-px rounded-md border mt-0.5 ${
                                p.itemType === 'service'
                                  ? 'bg-blue-50 text-blue-700 border-blue-100'
                                  : p.itemType === 'product'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                  : p.itemType === 'booking'
                                  ? 'bg-amber-50 text-amber-700 border-amber-100'
                                  : p.itemType === 'package'
                                  ? 'bg-purple-50 text-purple-700 border-purple-100'
                                  : 'bg-stone-50 text-stone-600 border-stone-200'
                              }`}>
                                {p.itemType.toUpperCase()} {p.packageName ? `(${p.packageName.toUpperCase()})` : ''}
                              </span>
                            </td>

                            {/* Amount */}
                            <td className="p-3 text-right font-mono font-black text-stone-800 text-xs">
                              ₹{p.amount.toLocaleString('en-IN')}.00
                            </td>

                            {/* UTR No */}
                            <td className="p-3 font-mono font-bold text-stone-700">
                              <div className="flex items-center gap-1.5">
                                <span className="tracking-wider text-[11px] text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200/50">
                                  {p.utr}
                                </span>
                                <button 
                                  onClick={() => handleCopyId(p.utr)}
                                  className="text-stone-400 hover:text-stone-700"
                                  title="Copy UTR ID"
                                >
                                  <Clipboard className="w-3.5 h-3.5" />
                                </button>
                                {copiedId === p.utr && (
                                  <span className="text-[8px] bg-emerald-500/20 text-emerald-800 px-1 py-0.5 rounded">Copied</span>
                                )}
                              </div>
                            </td>

                            {/* Date & Time */}
                            <td className="p-3 text-stone-500 font-mono text-[10px]">
                              {new Date(p.createdAt).toLocaleString('te-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>

                            {/* Status badge */}
                            <td className="p-3 text-center">
                              <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-1 rounded-full uppercase border ${
                                p.status === 'Verified'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : p.status === 'Rejected'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                              }`}>
                                {p.status === 'Verified' ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                                    <span>Verified</span>
                                  </>
                                ) : p.status === 'Rejected' ? (
                                  <>
                                    <XCircle className="w-3 h-3 text-rose-600" />
                                    <span>Rejected</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                                    <span>Pending</span>
                                  </>
                                )}
                              </span>
                            </td>

                            {/* Verification Actions */}
                            <td className="p-3">
                              <div className="flex items-center justify-center gap-1.5">
                                {p.status === 'Pending' ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        if (confirm(`కస్టమర్ "${p.customerName}" చేసిన ₹${p.amount} చెల్లింపును ధృవీకరించి, సేవను సక్రియం చేయాలనుకుంటున్నారా?`)) {
                                          onVerifyPayment(p.id);
                                        }
                                      }}
                                      title="Verify and Approve"
                                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Verify</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm(`లావాదేవీ నంబర్ (UTR: ${p.utr}) తప్పుగా ఉందని ఈ అభ్యర్థనను తిరస్కరించాలనుకుంటున్నారా?`)) {
                                          onRejectPayment(p.id);
                                        }
                                      }}
                                      title="Reject Payment"
                                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] rounded-lg border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>Reject</span>
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-[10px] text-stone-400 font-bold italic">
                                    Processed {p.verifiedAt ? `on ${new Date(p.verifiedAt).toLocaleDateString('te-IN', {month: 'short', day: 'numeric'})}` : ''}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* User Feedback View */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-stone-900 text-sm md:text-base">
                    యూజర్ సలహాలు మరియు సమస్యల నివేదికలు
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    సందర్శకులు సమర్పించిన ఫీడ్ బ్యాక్ వివరాలు ఇక్కడ సురక్షితంగా వీక్షించవచ్చు.
                  </p>
                </div>
                
                <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2.5 py-1 rounded-full uppercase font-mono">
                  {feedbacks.length} messages
                </span>
              </div>

              {feedbacks.length === 0 ? (
                <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
                  <MessageSquare className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p className="text-xs text-stone-500 font-semibold">ఫీడ్‌బ్యాక్‌లు ఏవీ లేవు!</p>
                  <p className="text-[10px] text-stone-400">వినియోగదారులు సమర్పించే సూచనలు ఇక్కడ కనిపిస్తాయి.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {feedbacks.map((fb) => (
                    <div
                      key={fb.id}
                      className="p-5 bg-stone-50/50 border border-stone-200/70 rounded-2xl hover:border-amber-200/80 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Tags and Delete button */}
                        <div className="flex items-start justify-between gap-2">
                          {fb.type === 'feature' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-100">
                              <Sparkles className="w-3 h-3 text-purple-600" />
                              <span>కొత్త ఫీచర్ సూచన (Feature Suggestion)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-100">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>సమస్య నివేదిక (Bug/Issue Report)</span>
                            </span>
                          )}

                          <button
                            id={`delete-fb-${fb.id}`}
                            onClick={() => {
                              if (confirm('ఈ ఫీడ్‌బ్యాక్‌ని డిలీట్ చేయాలనుకుంటున్నారా?')) {
                                onDeleteFeedback(fb.id);
                              }
                            }}
                            title="ఫీడ్‌బ్యాక్ డిలీట్ చేయి"
                            className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Content text */}
                        <p className="text-xs text-stone-800 leading-relaxed font-medium bg-white p-3 rounded-xl border border-stone-100 shadow-2xs italic">
                          "{fb.message}"
                        </p>
                      </div>

                      {/* Contact metadata */}
                      <div className="pt-3 border-t border-stone-200/60 mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
                        <div className="space-y-0.5">
                          <p className="font-bold text-stone-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                            <span>{fb.name}</span>
                          </p>
                          <p className="font-mono text-stone-400 flex items-center gap-1">
                            <Mail className="w-3 h-3 inline text-stone-400" />
                            <span>{fb.contact}</span>
                          </p>
                        </div>

                        <div className="text-[10px] text-stone-400 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(fb.createdAt).toLocaleDateString('te-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
