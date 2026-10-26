import React from 'react';
import { PropertyListing } from '../types';
import { X, CheckCircle2, Clock, GitCompare, MessageSquare, Eye, Compass, Home, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProperties: PropertyListing[];
  onRemoveProperty: (id: string) => void;
  onViewDetails: (property: PropertyListing) => void;
  onContactWhatsApp: (property: PropertyListing) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  selectedProperties,
  onRemoveProperty,
  onViewDetails,
  onContactWhatsApp,
}) => {
  if (!isOpen) return null;

  // Render a single comparison row
  const renderCompareRow = (
    labelTelugu: string,
    labelEnglish: string,
    getValue: (prop: PropertyListing) => React.ReactNode
  ) => {
    return (
      <div className="grid grid-cols-3 border-b border-stone-100 py-3 text-xs items-center gap-4">
        <div className="col-span-1 text-stone-400 font-medium">
          <span className="block text-stone-700 font-bold">{labelTelugu}</span>
          <span className="text-[10px] uppercase tracking-wider">{labelEnglish}</span>
        </div>
        <div className="col-span-1 text-center font-semibold text-stone-800">
          {selectedProperties[0] ? getValue(selectedProperties[0]) : '-'}
        </div>
        <div className="col-span-1 text-center font-semibold text-stone-800">
          {selectedProperties[1] ? (
            getValue(selectedProperties[1])
          ) : (
            <span className="text-stone-300 italic text-[11px]">ఎంపిక చేయలేదు</span>
          )}
        </div>
      </div>
    );
  };

  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case 'house':
        return 'స్వతంత్ర ఇల్లు (House)';
      case 'apartment':
        return 'అపార్ట్‌మెంట్ (Apartment)';
      case 'plot':
        return 'ప్లాట్ / ఓపెన్ స్థలం (Plot)';
      case 'commercial':
        return 'కమర్షియల్ (Commercial)';
      default:
        return 'ఇతర స్థిరాస్తి';
    }
  };

  const getFacingLabel = (facing?: string) => {
    if (!facing) return 'సమాచారం లేదు';
    return facing;
  };

  const getAgeLabel = (age?: number) => {
    if (age === undefined) return 'సమాచారం లేదు';
    return age === 0 ? 'సరికొత్త నిర్మాణం (New)' : `${age} సంవత్సరాలు (${age} yrs)`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Top Banner Accent */}
          <div className="h-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700" />

          {/* Header */}
          <div className="p-5 md:p-6 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 rounded-2xl text-amber-600">
                <GitCompare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-stone-900 text-base md:text-lg">
                  స్థిరాస్తుల పోలిక (Property Comparison)
                </h3>
                <p className="text-xs text-stone-400">
                  రెండు వేర్వేరు ఆస్తుల ముఖ్య వివరాలను పక్కపక్కనే పోల్చి చూసుకోండి.
                </p>
              </div>
            </div>
            
            <button
              id="compare-modal-close"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal scrollable body */}
          <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
            
            {/* Properties Top Row Cards */}
            <div className="grid grid-cols-3 gap-4 items-stretch">
              {/* Spacer Column */}
              <div className="col-span-1 hidden md:flex flex-col justify-end pb-4">
                <p className="text-xs text-stone-400 font-semibold leading-relaxed">
                  ఆస్తి ప్రధాన వివరం <br />
                  <span className="text-[10px] text-stone-300 uppercase tracking-wider">Core Parameters</span>
                </p>
              </div>

              {/* Property 1 Column card */}
              <div className="col-span-3 md:col-span-1 relative bg-stone-50 border border-stone-200/60 rounded-2xl p-3 flex flex-col justify-between">
                {selectedProperties[0] ? (
                  <>
                    <button
                      id={`compare-remove-0`}
                      onClick={() => onRemoveProperty(selectedProperties[0].id)}
                      className="absolute top-2 right-2 z-10 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition-all cursor-pointer shadow-sm"
                      title="తొలగించు (Remove)"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="space-y-2">
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-stone-100">
                        <img
                          src={selectedProperties[0].imageUrl}
                          alt={selectedProperties[0].title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-full text-white ${
                          selectedProperties[0].status === 'sale' ? 'bg-amber-600' : 'bg-blue-600'
                        }`}>
                          {selectedProperties[0].status === 'sale' ? 'అమ్మకానికి' : 'అద్దెకు'}
                        </span>
                        <h4 className="font-bold text-stone-900 text-xs md:text-sm line-clamp-1">
                          {selectedProperties[0].title}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-stone-500">
                          <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                          <span className="truncate">{selectedProperties[0].area}, {selectedProperties[0].city}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-stone-200/40 flex gap-1.5">
                      <button
                        id="compare-view-details-0"
                        onClick={() => {
                          onViewDetails(selectedProperties[0]);
                          onClose();
                        }}
                        className="flex-1 py-1.5 px-2 bg-stone-200/80 hover:bg-stone-200 text-stone-700 font-bold rounded-lg text-[10px] text-center transition-all cursor-pointer"
                      >
                        చూడండి
                      </button>
                      <button
                        id="compare-whatsapp-0"
                        onClick={() => onContactWhatsApp(selectedProperties[0])}
                        className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] text-center transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>వాట్సాప్</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-stone-200 rounded-2xl">
                    <Home className="w-6 h-6 text-stone-300 mb-2" />
                    <p className="text-xs text-stone-400 font-semibold leading-relaxed">
                      మొదటి ఆస్తిని ఎంచుకోండి
                    </p>
                  </div>
                )}
              </div>

              {/* Property 2 Column card */}
              <div className="col-span-3 md:col-span-1 relative bg-stone-50 border border-stone-200/60 rounded-2xl p-3 flex flex-col justify-between">
                {selectedProperties[1] ? (
                  <>
                    <button
                      id={`compare-remove-1`}
                      onClick={() => onRemoveProperty(selectedProperties[1].id)}
                      className="absolute top-2 right-2 z-10 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition-all cursor-pointer shadow-sm"
                      title="తొలగించు (Remove)"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="space-y-2">
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-stone-100">
                        <img
                          src={selectedProperties[1].imageUrl}
                          alt={selectedProperties[1].title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-full text-white ${
                          selectedProperties[1].status === 'sale' ? 'bg-amber-600' : 'bg-blue-600'
                        }`}>
                          {selectedProperties[1].status === 'sale' ? 'అమ్మకానికి' : 'అద్దెకు'}
                        </span>
                        <h4 className="font-bold text-stone-900 text-xs md:text-sm line-clamp-1">
                          {selectedProperties[1].title}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-stone-500">
                          <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                          <span className="truncate">{selectedProperties[1].area}, {selectedProperties[1].city}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-stone-200/40 flex gap-1.5">
                      <button
                        id="compare-view-details-1"
                        onClick={() => {
                          onViewDetails(selectedProperties[1]);
                          onClose();
                        }}
                        className="flex-1 py-1.5 px-2 bg-stone-200/80 hover:bg-stone-200 text-stone-700 font-bold rounded-lg text-[10px] text-center transition-all cursor-pointer"
                      >
                        చూడండి
                      </button>
                      <button
                        id="compare-whatsapp-1"
                        onClick={() => onContactWhatsApp(selectedProperties[1])}
                        className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] text-center transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>వాట్సాప్</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-stone-200 rounded-2xl">
                    <Home className="w-6 h-6 text-stone-300 mb-2" />
                    <p className="text-xs text-stone-400 font-semibold leading-relaxed">
                      పోల్చడానికి రెండవ ఇల్లు/ప్లాట్ ను సెలెక్ట్ చేసుకోండి
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Spec Comparison Grid Sheet */}
            <div className="bg-white rounded-2xl border border-stone-150 overflow-hidden divide-y divide-stone-100">
              
              {/* Header Label Row */}
              <div className="grid grid-cols-3 bg-stone-50/50 py-2 px-4 text-[10px] font-bold text-stone-400 uppercase tracking-wider text-center">
                <div className="text-left">వివరాలు (Attribute)</div>
                <div>మొదటి ఆస్తి (Property 1)</div>
                <div>రెండవ ఆస్తి (Property 2)</div>
              </div>

              {/* Rows Comparison */}
              <div className="px-4">
                {renderCompareRow('ధర', 'Price', (p) => (
                  <span className="font-mono text-amber-700 font-bold text-sm md:text-base">
                    ₹ {p.priceFormatted}
                  </span>
                ))}

                {renderCompareRow('స్థిరాస్తి రకం', 'Property Type', (p) => (
                  <span className="text-stone-700">{getPropertyTypeLabel(p.type)}</span>
                ))}

                {renderCompareRow('పరిమాణం (సైజు)', 'Size', (p) => (
                  <span className="font-mono text-stone-700">{p.size}</span>
                ))}

                {renderCompareRow('ముఖద్వారం', 'Facing', (p) => (
                  <span className="text-stone-700">{getFacingLabel(p.facing)}</span>
                ))}

                {renderCompareRow('నిర్మాణ వయస్సు', 'Age of Property', (p) => (
                  <span className="text-stone-700">{getAgeLabel(p.age)}</span>
                ))}

                {renderCompareRow('బెడ్ రూమ్స్ / బాత్స్', 'Beds & Baths', (p) => {
                  if (p.type === 'plot' || p.type === 'commercial') {
                    return <span className="text-stone-400 italic text-[11px]">వర్తించదు (N/A)</span>;
                  }
                  return (
                    <span className="text-stone-700">
                      {p.beds || 0} BHK / {p.baths || 0} బాత్ రూమ్స్
                    </span>
                  );
                })}

                {renderCompareRow('నగరం', 'City', (p) => (
                  <span className="text-stone-700">{p.city}</span>
                ))}

                {renderCompareRow('ప్రాంతం (ఏరియా)', 'Area / Locality', (p) => (
                  <span className="text-stone-700">{p.area}</span>
                ))}

                {renderCompareRow('వెరిఫైడ్ స్టేటస్', 'Verification Status', (p) => {
                  const isApproved = p.isApproved === 'Yes';
                  return (
                    <div className="flex items-center justify-center gap-1.5">
                      {isApproved ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="text-emerald-700 text-xs">అప్రూవ్డ్</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-yellow-500 shrink-0 animate-pulse" />
                          <span className="text-yellow-700 text-xs font-bold">పెండింగ్</span>
                        </>
                      )}
                    </div>
                  );
                })}

                {renderCompareRow('సంప్రదించవలసిన వ్యక్తి', 'Contact Person', (p) => (
                  <div className="text-center">
                    <span className="block font-bold text-stone-800">{p.contactName}</span>
                    <span className="block text-[10px] text-stone-400 font-mono">{p.contactPhone}</span>
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* Footer Area with reset option */}
          <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
            <p className="text-[11px] text-stone-400">
              * ఒకే రకమైన ఆస్తులను పక్కపక్కనే చూసుకోవడం సరైన నిర్ణయానికి తోడ్పడుతుంది.
            </p>
            {selectedProperties.length > 0 && (
              <button
                id="compare-modal-clear-all"
                onClick={() => {
                  selectedProperties.forEach((p) => onRemoveProperty(p.id));
                  onClose();
                }}
                className="text-xs font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
              >
                అన్నింటినీ తొలగించండి (Clear All)
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
