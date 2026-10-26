import React, { useState } from 'react';
import { PropertyListing } from '../types';
import { X, MapPin, CheckCircle, Clock, Phone, MessageSquare, Mail, Layers, Compass, Maximize, UserCheck, Heart, Map, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getListingImages } from './ListingCard';

interface Landmark {
  name: string;
  teluguName: string;
  x: number;
  y: number;
  type: 'office' | 'road' | 'school' | 'temple' | 'shop';
}

interface AreaMapData {
  title: string;
  roads: { name: string; teluguName: string; path: string }[];
  landmarks: Landmark[];
  approxLocationText: string;
  distances: { label: string; value: string }[];
}

const getAreaMapData = (area: string, city: string): AreaMapData => {
  const normArea = area.toLowerCase();
  
  if (normArea.includes('turangi')) {
    return {
      title: 'తూరంగి విలేజ్ బ్లూప్రింట్ (Turangi Village Sketch)',
      approxLocationText: 'శివ రాఘవ ల్యాండ్స్ సమీపంలో (Near Siva Raghava Lands)',
      roads: [
        { name: 'Kakinada Bypass Road', teluguName: 'కాకినాడ బైపాస్ రోడ్డు', path: 'M 10 50 Q 250 80 490 50' },
        { name: 'Turangi Main Road', teluguName: 'తూరంగి మెయిన్ రోడ్డు', path: 'M 200 10 L 250 290' },
      ],
      landmarks: [
        { name: 'Siva Raghava Lands Office', teluguName: 'శివ రాఘవ ల్యాండ్స్', x: 260, y: 110, type: 'office' },
        { name: 'Turangi Junction', teluguName: 'తూరంగి జంక్షన్', x: 205, y: 65, type: 'road' },
        { name: 'Panchayat Office', teluguName: 'పంచాయితీ ఆఫీస్', x: 120, y: 150, type: 'office' },
        { name: 'Z.P. High School', teluguName: 'జిల్లా పరిషత్ హైస్కూల్', x: 380, y: 220, type: 'school' },
      ],
      distances: [
        { label: 'కాకినాడ బైపాస్ (Bypass)', value: 'సమీపంలో (200m)' },
        { label: 'మెయిన్ జంక్షన్ (Junction)', value: '5 నిమిషాలు' },
        { label: 'బస్ స్టేషన్ (Bus Stand)', value: '3.5 కి.మీ.' },
        { label: 'హాస్పిటల్ (Hospital)', value: '1.2 కి.మీ.' }
      ]
    };
  }

  if (normArea.includes('gorantla')) {
    return {
      title: 'గోరంట్ల నైబర్‌హుడ్ మ్యాప్ (Gorantla Area Map)',
      approxLocationText: 'గోరంట్ల ఇన్నర్ రింగ్ రోడ్ సమీపంలో (Near Guntur Inner Ring Road)',
      roads: [
        { name: 'Guntur Inner Ring Road', teluguName: 'ఇన్నర్ రింగ్ రోడ్డు', path: 'M 10 120 Q 250 120 490 120' },
        { name: 'Amaravati Link Road', teluguName: 'అమరావతి లింక్ రోడ్డు', path: 'M 300 10 L 300 290' },
      ],
      landmarks: [
        { name: 'Inner Ring Road Circle', teluguName: 'రింగ్ రోడ్ సర్కిల్', x: 300, y: 120, type: 'road' },
        { name: 'Vignan School', teluguName: 'విజ్ఞాన్ స్కూల్', x: 150, y: 60, type: 'school' },
        { name: 'Gorantla Temple', teluguName: 'గోరంట్ల ఆలయం', x: 380, y: 200, type: 'temple' },
        { name: 'D-Mart Guntur', teluguName: 'డి-మార్ట్ సూపర్ మార్కెట్', x: 120, y: 210, type: 'shop' },
      ],
      distances: [
        { label: 'ఇన్నర్ రింగ్ రోడ్డు (Ring Rd)', value: '150 మీటర్లు' },
        { label: 'అమరావతి హైవే (Highway)', value: '10 నిమిషాలు' },
        { label: 'రైల్వే స్టేషన్ (Railway Station)', value: '5.5 కి.మీ.' },
        { label: 'షాపింగ్ మాల్స్ (D-Mart)', value: '1 కి.మీ.' }
      ]
    };
  }

  if (normArea.includes('benz')) {
    return {
      title: 'విజయవాడ బెంజ్ సర్కిల్ పరిసరాలు (Benz Circle Area Blueprint)',
      approxLocationText: 'బెంజ్ సర్కిల్ ఫ్లైఓవర్ సమీపంలో (Near Benz Circle Flyover)',
      roads: [
        { name: 'MG Road (Bandar Road)', teluguName: 'బందర్ రోడ్డు (M.G. Road)', path: 'M 10 150 L 490 150' },
        { name: 'National Highway 16', teluguName: 'జాతీయ రహదారి 16 (NH-16)', path: 'M 250 10 L 250 290' },
      ],
      landmarks: [
        { name: 'Benz Circle Flyover', teluguName: 'బెంజ్ సర్కిల్ ఫ్లైఓవర్', x: 250, y: 150, type: 'road' },
        { name: 'Jyothi Mahal Theater', teluguName: 'జ్యోతి మహల్ థియేటర్', x: 120, y: 80, type: 'temple' },
        { name: 'Trendset Mall', teluguName: 'ట్రెండ్‌సెట్ మాల్', x: 380, y: 70, type: 'shop' },
        { name: 'Pinnamaneni Hospital', teluguName: 'పిన్నమనేని హాస్పిటల్', x: 100, y: 220, type: 'school' },
      ],
      distances: [
        { label: 'బెంజ్ సర్కిల్ (Benz Circle)', value: '400 మీటర్లు' },
        { label: 'ట్రెండ్‌సెట్ మాల్ (Trendset)', value: 'నడక దూరం' },
        { label: 'పండిట్ నెహ్రూ బస్ టెర్మినల్', value: '4 కి.మీ.' },
        { label: 'విమానాశ్రయం (Airport)', value: '25 నిమిషాలు' }
      ]
    };
  }

  // Fallback for general area
  return {
    title: `${area} ప్రాంతీయ స్కెచ్ (Regional Area Sketch)`,
    approxLocationText: 'ప్రధాన రోడ్డుకు సమీపంలో (Near Main Arterial Road)',
    roads: [
      { name: 'Main Road', teluguName: 'ప్రధాన రహదారి', path: 'M 10 150 Q 250 110 490 150' },
      { name: 'Sub Road', teluguName: 'కనెక్టింగ్ వీధి', path: 'M 250 10 L 220 290' },
    ],
    landmarks: [
      { name: 'Local Market', teluguName: 'స్థానిక మార్కెట్', x: 130, y: 110, type: 'shop' },
      { name: 'Bus Stop', teluguName: 'బస్సు స్టాప్', x: 250, y: 130, type: 'road' },
      { name: 'Green Park', teluguName: 'పార్క్ మైదానం', x: 380, y: 210, type: 'school' },
      { name: 'Government Clinic', teluguName: 'వైద్యశాల', x: 100, y: 220, type: 'office' },
    ],
    distances: [
      { label: 'ప్రధాన రహదారి (Main Rd)', value: '100 మీటర్లు' },
      { label: 'రవాణా సౌకర్యం (Transit)', value: 'నడక దూరం' },
      { label: 'టౌన్ సెంటర్ (Town Center)', value: '1.5 కి.మీ.' },
      { label: 'స్కూల్ & కాలేజ్ (Institutes)', value: '800 మీటర్లు' }
    ]
  };
};

interface ListingDetailsModalProps {
  property: PropertyListing | null;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onClose: () => void;
}

export const ListingDetailsModal: React.FC<ListingDetailsModalProps> = ({
  property,
  isBookmarked,
  onToggleBookmark,
  onClose,
}) => {
  if (!property) return null;

  const [mapTab, setMapTab] = React.useState<'sketch' | 'google'>('sketch');
  const images = getListingImages(property);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  // Contact Details requested
  const rPhone = property.contactPhone || '8977776111';
  const rEmail = property.contactEmail || 'injarapusivaraghava@gmail.com';

  const isApproved = property.isApproved === 'Yes';
  const mapData = getAreaMapData(property.area, property.city);

  // Pre-filled WhatsApp Link (Localized for farm_land or urban)
  const isFarm = property.type === 'farm_land';
  const locationText = isFarm 
    ? `${property.village || ''}, ${property.mandal || ''}, ${property.district || ''} జిల్ల్లా`
    : `${property.area}, ${property.city}`;

  const encodedMsg = encodeURIComponent(
    `హలో ${property.contactName || 'రాఘవ గారు'}, నేను 'మన గృహం' యాప్ లో ఈ ${isFarm ? 'వ్యవసాయ భూమి / తోట' : 'ఇల్లు/ప్లాట్'} గురించి సంప్రదించాలనుకుంటున్నాను:\n\n🏡 *స్థిరాస్తి:* ${property.title}\n📍 *లొకేషన్:* ${locationText}\n💰 *ధర:* ₹ ${property.priceFormatted}\n${isFarm ? `🌾 *భూమి రకం:* ${property.landType || ''}\n🚜 *విస్తీర్ణం:* ${property.size}\n` : ''}\nదయచేసి మరిన్ని వివరాలు తెలియజేయండి!`
  );
  const whatsappUrl = `https://wa.me/91${rPhone}?text=${encodedMsg}`;

  // Email link
  const emailSubject = encodeURIComponent(`మన గృహం రియల్ ఎస్టేట్ విచారణ: ${property.title}`);
  const emailBody = encodeURIComponent(
    `హలో ${property.contactName || 'రాఘవ గారు'},\n\nనేను మీ 'మన గృహం' అప్లికేషన్ లో ఈ కింది ${isFarm ? 'వ్యవసాయ భూమి / తోట' : 'స్థిరాస్తి'}ను చూశాను. దీని గురించి పూర్తి వివరాలు తెలుసుకోవాలని ఆశపడుతున్నాను.\n\nస్థిరాస్తి పేరు: ${property.title}\nలొకేషన్: ${locationText}\nధర: ₹ ${property.priceFormatted}\n\nకృతజ్ఞతలు.`
  );
  const emailUrl = `mailto:${rEmail}?subject=${emailSubject}&body=${emailBody}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
        >
          {/* Header Image Header */}
          <div className="relative h-64 md:h-80 w-full overflow-hidden bg-stone-100 flex-shrink-0 group/image-modal">
            <div className="w-full h-full relative">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIdx}
                  src={images[currentImageIdx]}
                  alt={`${property.title} - Photo ${currentImageIdx + 1}`}
                  referrerPolicy="no-referrer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
            </div>

            {/* Carousel Arrow Controls */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  id={`modal-prev-img`}
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/30 backdrop-blur-md hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all duration-200 z-10 cursor-pointer md:opacity-0 md:group-hover/image-modal:opacity-100 opacity-90"
                  title="మునుపటి చిత్రం (Previous Image)"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  id={`modal-next-img`}
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/30 backdrop-blur-md hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all duration-200 z-10 cursor-pointer md:opacity-0 md:group-hover/image-modal:opacity-100 opacity-90"
                  title="తదుపరి చిత్రం (Next Image)"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              </>
            )}

            {/* Image Indicator Dots - Placed above pricing details */}
            {images.length > 1 && (
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    id={`modal-dot-img-${idx}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIdx(idx);
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                      currentImageIdx === idx ? 'bg-amber-400 scale-125' : 'bg-white/60 hover:bg-white'
                    }`}
                    title={`ఫోటో ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Top black shadow for header text visibility */}
            <div className="absolute inset-x-0 top-0 bg-linear-to-b from-black/50 to-transparent p-4 flex justify-between items-start z-10">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full text-white backdrop-blur-md shadow-xs ${
                property.status === 'sale' ? 'bg-amber-600/90' : 'bg-blue-600/90'
              }`}>
                {property.status === 'sale' ? 'అమ్మకానికి (For Sale)' : 'అద్దెకు (For Rent)'}
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  id={`details-bookmark-btn-${property.id}`}
                  onClick={() => onToggleBookmark(property.id)}
                  className={`p-1.5 rounded-full backdrop-blur-md transition-all active:scale-95 duration-200 cursor-pointer shadow-xs ${
                    isBookmarked
                      ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-900/40'
                      : 'bg-black/40 hover:bg-black/60 text-white'
                  }`}
                  title={isBookmarked ? 'ఇష్టమైనవాటి నుండి తీసివేయి (Remove from Favorites)' : 'ఇష్టమైనవాటిలో చేర్చు (Add to Favorites)'}
                >
                  <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-current animate-pulse' : ''}`} />
                </button>
                
                <button
                  id="close-modal-btn"
                  onClick={onClose}
                  className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Price Badge Over Image Bottom */}
            <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/90 via-black/40 to-transparent p-6 pt-12 flex justify-between items-end">
              <div>
                <span className="text-[11px] font-semibold text-amber-400 tracking-wider uppercase block mb-1">ప్రత్యేక ధర</span>
                <p className="text-2xl md:text-3xl font-display font-extrabold text-white font-mono">
                  ₹ {property.priceFormatted}
                </p>
              </div>
              
              <div>
                {isApproved ? (
                  <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500 text-white shadow-md">
                    <CheckCircle className="w-4 h-4" />
                    <span>వెరిఫైడ్ లిస్టింగ్</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-yellow-500 text-white shadow-md animate-pulse">
                    <Clock className="w-4 h-4" />
                    <span>వెరిఫికేషన్ లో ఉంది</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Modal Body Info */}
          <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
            {/* Main Title & Area */}
            <div>
              <div className="flex items-center gap-1.5 text-amber-600 font-bold text-sm uppercase tracking-wide mb-2">
                <MapPin className="w-4 h-4" />
                <span>{locationText}, ఆంధ్రప్రదేశ్</span>
              </div>
              <h2 className="font-display font-bold text-xl md:text-2xl text-stone-900 leading-snug">
                {property.title}
              </h2>
            </div>

            {/* Quick Specs Grid */}
            {isFarm ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-amber-50/30 border border-amber-200/20 rounded-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-amber-100/50 text-amber-700 rounded-xl">
                    <Layers className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-400 uppercase font-semibold">భూమి రకం (Land Type)</span>
                    <span className="font-black text-stone-850 text-xs md:text-sm">{property.landType || 'వ్యవసాయ స్థలం'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-amber-100/50 text-amber-700 rounded-xl">
                    <Maximize className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-400 uppercase font-semibold">విస్తీర్ణం (Land Area)</span>
                    <span className="font-black text-stone-850 text-xs md:text-sm font-mono">{property.size}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-amber-100/50 text-amber-700 rounded-xl">
                    <Clock className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-400 uppercase font-semibold">లభ్యత (Availability)</span>
                    <span className="font-black text-stone-850 text-xs md:text-sm text-amber-600">{property.availabilityStatus || 'Available'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-amber-100/50 text-amber-700 rounded-xl">
                    <UserCheck className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-400 uppercase font-semibold">ఎకరం ధర (Per Acre)</span>
                    <span className="font-black text-stone-850 text-xs md:text-sm font-mono">₹{property.pricePerAcre ? (property.pricePerAcre / 100000).toFixed(1) + ' లక్షలు' : 'సమాచారం లేదు'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-400 uppercase font-medium">రకం (Type)</span>
                    <span className="font-semibold text-stone-800 text-xs md:text-sm">
                      {property.type === 'house' ? 'ఇండిపెండెంట్ ఇల్లు' : property.type === 'apartment' ? 'అపార్ట్‌మెంట్ ఫ్లాట్' : property.type === 'plot' ? 'రెసిడెన్షియల్ ప్లాట్' : 'కమర్షియల్ స్థలం'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                    <Maximize className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-400 uppercase font-medium">పరిమాణం (Size)</span>
                    <span className="font-semibold text-stone-800 font-mono text-xs md:text-sm">{property.size}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-400 uppercase font-medium">దిశ (Facing)</span>
                    <span className="font-semibold text-stone-800 text-xs md:text-sm">{property.facing || 'East'} Facing</span>
                  </div>
                </div>

                {property.beds ? (
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] text-stone-400 uppercase font-medium">బెడ్‌రూమ్స్</span>
                      <span className="font-semibold text-stone-800 text-xs md:text-sm">{property.beds} BHK</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] text-stone-400 uppercase font-medium">సమర్పించినది</span>
                      <span className="font-semibold text-stone-800 text-xs md:text-sm truncate max-w-[100px] block" title={property.submittedBy}>{property.submittedBy}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-400 uppercase font-medium">వయస్సు (Age)</span>
                    <span className="font-semibold text-stone-800 text-xs md:text-sm">
                      {property.age === undefined ? 'సమాచారం లేదు' : property.age === 0 ? 'సరికొత్త నిర్మాణం' : `${property.age} సంవత్సరాలు`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Agricultural Detailed Fields Table */}
            {isFarm && (
              <div className="space-y-3">
                <h4 className="font-display font-bold text-stone-900 text-sm md:text-base border-b border-stone-100 pb-1">
                  వ్యవసాయ భూమి సమాచారం (Agricultural Land Specs)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-150">
                  <div className="flex justify-between py-1.5 border-b border-stone-200/50">
                    <span className="text-stone-500 font-medium">జిల్లా (District)</span>
                    <span className="font-bold text-stone-800">{property.district}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-200/50">
                    <span className="text-stone-500 font-medium">మండలం (Mandal)</span>
                    <span className="font-bold text-stone-800">{property.mandal}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-200/50">
                    <span className="text-stone-500 font-medium">గ్రామం (Village)</span>
                    <span className="font-bold text-stone-800">{property.village}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-200/50">
                    <span className="text-stone-500 font-medium">నిర్దిష్ట చిరునామా (Exact Location)</span>
                    <span className="font-bold text-stone-800">{property.exactLocation || 'సమాచారం లేదు'}</span>
                  </div>
                  {(property.cropType || property.landType?.includes('పంట పొలాలు')) && (
                    <div className="flex justify-between py-1.5 border-b border-stone-200/50">
                      <span className="text-stone-500 font-medium">పంట రకం (Crop Type)</span>
                      <span className="font-bold text-amber-700">{property.cropType || 'వరి/పంటలు'}</span>
                    </div>
                  )}
                  {(property.gardenType || property.landType?.includes('తోటలు')) && (
                    <div className="flex justify-between py-1.5 border-b border-stone-200/50">
                      <span className="text-stone-500 font-medium">తోట రకం (Garden Type)</span>
                      <span className="font-bold text-amber-700">{property.gardenType || 'పండ్ల తోట'}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1.5 border-b border-stone-200/50">
                    <span className="text-stone-500 font-medium">రోడ్డు సౌకర్యం (Road Access)</span>
                    <span className="font-bold text-stone-800">{property.roadAccess || 'Soil Road'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-stone-200/50">
                    <span className="text-stone-500 font-medium">లభ్యత (Availability)</span>
                    <span className="font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md font-mono text-[10px] uppercase">
                      {property.availabilityStatus || 'Available'}
                    </span>
                  </div>
                </div>

                {/* Inline video link or player */}
                {property.videoUrl && (
                  <div className="pt-2">
                    <a
                      href={property.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>📺 వీడియో చూడండి (Watch Drone/Walkthrough Video)</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Description Paragraph */}
            <div className="space-y-2">
              <h4 className="font-display font-bold text-stone-900 text-sm md:text-base border-b border-stone-100 pb-1">
                స్థిరాస్తి వివరణ (Property Description)
              </h4>
              <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-wrap">
                {property.description}
              </p>
            </div>

            {/* Features/Water Facility list */}
            {isFarm ? (
              property.waterFacility && property.waterFacility.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-display font-bold text-stone-900 text-sm md:text-base border-b border-stone-100 pb-1">
                    నీటి వసతి సౌకర్యాలు (Irrigation & Utilities)
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {property.waterFacility.map((facility, i) => (
                      <div key={i} className="flex items-center gap-2 text-stone-700 text-xs font-bold bg-stone-50 p-2 rounded-lg border border-stone-150">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ) : (
              property.features && property.features.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-display font-bold text-stone-900 text-sm md:text-base border-b border-stone-100 pb-1">
                    అదనపు సౌకర్యాలు (Key Features)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {property.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-stone-700 text-sm">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}

            {/* Map Location Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-2 gap-2">
                <h4 className="font-display font-bold text-stone-900 text-sm md:text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span>స్థాన పటము (Property Location Map)</span>
                </h4>
                
                <div className="flex bg-stone-100 p-0.5 rounded-xl border border-stone-200/40 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setMapTab('sketch')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      mapTab === 'sketch'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <span>🎨 స్కెచ్ పటం (Blueprint Sketch)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapTab('google')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      mapTab === 'google'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <Map className="w-3 h-3" />
                    <span>గూగుల్ మ్యాప్ (Google Map)</span>
                  </button>
                </div>
              </div>

              {mapTab === 'sketch' ? (
                /* Beautiful Native Blueprint/Sketch Map Visualizer */
                <div className="space-y-3">
                  <div className="relative w-full rounded-2xl overflow-hidden border border-amber-200/50 bg-stone-50 shadow-inner flex flex-col md:flex-row">
                    {/* SVG Canvas Map Area */}
                    <div className="relative flex-1 bg-stone-50 border-b md:border-b-0 md:border-r border-stone-100 h-64 overflow-hidden">
                      {/* Blueprint grid layout */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f5f5f4_1px,transparent_1px),linear-gradient(to_bottom,#f5f5f4_1px,transparent_1px)] bg-[size:20px_20px]" />
                      
                      <svg className="w-full h-full p-4" viewBox="0 0 500 300" preserveAspectRatio="none">
                        {/* Drawn Roads / Streets */}
                        {mapData.roads.map((road, index) => (
                          <g key={index}>
                            <path
                              d={road.path}
                              fill="none"
                              stroke="#e7e5e4"
                              strokeWidth="20"
                              strokeLinecap="round"
                              className="opacity-65"
                            />
                            <path
                              d={road.path}
                              fill="none"
                              stroke="#ffffff"
                              strokeWidth="14"
                              strokeLinecap="round"
                            />
                            <path
                              id={`road-label-${index}`}
                              d={road.path}
                              fill="none"
                              stroke="none"
                            />
                            <text className="text-[8px] font-bold fill-stone-400 select-none tracking-wider">
                              <textPath href={`#road-label-${index}`} startOffset="35%">
                                {road.teluguName} ({road.name})
                              </textPath>
                            </text>
                          </g>
                        ))}

                        {/* Local Landmark Beacons */}
                        {mapData.landmarks.map((landmark, index) => (
                          <g key={index} transform={`translate(${landmark.x}, ${landmark.y})`}>
                            <circle
                              r="12"
                              fill={
                                landmark.type === 'school' ? '#10b981' :
                                landmark.type === 'temple' ? '#f59e0b' :
                                landmark.type === 'shop' ? '#ec4899' :
                                '#3b82f6'
                              }
                              fillOpacity="0.1"
                              className="animate-pulse"
                              style={{ animationDuration: `${2 + index}s` }}
                            />
                            <circle
                              r="3"
                              fill={
                                landmark.type === 'school' ? '#10b981' :
                                landmark.type === 'temple' ? '#f59e0b' :
                                landmark.type === 'shop' ? '#ec4899' :
                                '#3b82f6'
                              }
                            />
                            {/* Text annotation label */}
                            <rect
                              x="8"
                              y="-8"
                              rx="4"
                              ry="4"
                              width={landmark.teluguName.length * 11 + 10}
                              height="16"
                              className="fill-white/95 stroke-stone-200/50 stroke-[0.5px] shadow-2xs"
                            />
                            <text
                              x="12"
                              y="3"
                              className="text-[8px] font-bold fill-stone-600 font-sans select-none"
                            >
                              {landmark.teluguName}
                            </text>
                          </g>
                        ))}

                        {/* Glowing Property Target Pin in the center of the viewport */}
                        <g transform="translate(250, 150)">
                          {/* Radial pulses */}
                          <circle r="36" className="fill-amber-500/10 stroke-amber-500/20 stroke-[0.5px] animate-ping" style={{ animationDuration: '3.5s' }} />
                          <circle r="18" className="fill-amber-500/15 stroke-amber-500/30 stroke-1" />
                          <circle r="5" className="fill-amber-600" />
                          {/* Dropping pin illustration */}
                          <path
                            d="M 0 0 C -4 -8 -7 -12 -7 -18 C -7 -22 -3 -25 0 -25 C 3 -25 7 -22 7 -18 C 7 -12 4 -8 0 0"
                            className="fill-amber-500 stroke-white stroke-[1.2px]"
                          />
                          <circle r="2" cy="-18" fill="white" />
                        </g>
                      </svg>

                      {/* Location Badge */}
                      <div className="absolute top-3 left-3 bg-stone-900/90 text-white rounded-lg px-2.5 py-1 text-[9px] font-bold flex items-center gap-1.5 shadow-sm">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                        <span>{property.area} సెంటర్ (సుమారుగా)</span>
                      </div>
                    </div>

                    {/* Neighborhood distance sidebar */}
                    <div className="w-full md:w-56 bg-stone-50/50 p-4 flex flex-col justify-between border-t md:border-t-0 md:border-l border-stone-200/50">
                      <div className="space-y-3">
                        <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">సమీప ప్రధాన కేంద్రాలు</p>
                        <div className="space-y-2">
                          {mapData.distances.map((dist, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px] border-b border-stone-200/40 pb-1.5">
                              <span className="text-stone-500 font-medium">{dist.label}</span>
                              <span className="text-stone-800 font-bold font-mono bg-stone-100 px-1.5 py-0.5 rounded-sm">{dist.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="pt-4 text-[10px] text-stone-400 italic leading-normal">
                        * ఈ మ్యాప్ నివాస ప్రాంతం యొక్క సుమారు కూడలిని మాత్రమే చూపుతుంది.
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-stone-500 leading-relaxed bg-stone-50/70 p-3.5 rounded-xl border border-stone-100">
                    ℹ️ <strong>లొకేషన్ సమాచారం (Location Info):</strong> ఈ స్థిరాస్తి <strong>{property.area} ({property.city})</strong> లోని ప్రధాన రహదారి, కనెక్టింగ్ వీధులు మరియు మార్కెట్ సదుపాయాలకు అత్యంత సమీపంలో ఉంది. నివాస సదుపాయాలకు, పెట్టుబడికి అనుకూలమైన ప్రాంతం.
                  </div>
                </div>
              ) : (
                /* Google Maps Iframe Interactive Map */
                <div className="space-y-3">
                  <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-stone-200 bg-stone-50 shadow-inner group">
                    <iframe
                      title="approximate-location-map"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(property.area + ', ' + property.city + ', Andhra Pradesh, India')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-300"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md border border-stone-200/50 rounded-lg px-2.5 py-1 text-[10px] font-bold text-stone-700 shadow-sm flex items-center gap-1.5 pointer-events-none">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span>సుమారు ప్రాంతం (Approx. Area)</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-500 bg-stone-50 p-3.5 rounded-xl border border-stone-100">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-stone-700">📍 {isFarm ? `${property.village}, ${property.mandal}` : property.area}, {isFarm ? property.district : property.city}</p>
                      <p className="text-[11px]">ఈ స్థిరాస్తి లొకేషన్ పటము పైన సూచించబడింది.</p>
                    </div>
                    <a
                      href={property.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationText + ', Andhra Pradesh, India')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-lg font-bold text-[11px] shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5 text-amber-600" />
                      <span>గూగుల్ మ్యాప్స్ లో చూడండి</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Listing Submission Source */}
            <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-center justify-between text-xs text-amber-800">
              <div className="space-y-0.5">
                <p className="font-semibold">సంప్రదించాల్సిన వ్యక్తి: {property.contactName}</p>
                <p className="text-stone-500">లిస్టింగ్ ఐడి: {property.id} • సమర్పించిన సమయం: {new Date(property.createdAt).toLocaleDateString()}</p>
              </div>
              <span className="px-2 py-0.5 bg-amber-100 rounded-md font-semibold font-mono text-[10px] uppercase">
                {property.submittedBy}
              </span>
            </div>

            {/* Immediate Action Buttons Box */}
            <div className="space-y-3 pt-2">
              <p className="text-xs text-stone-400 text-center font-medium">
                ఈ ప్రాపర్టీ కొనుగోలుకు లేదా మరింత సమాచారం కోసం క్రింది మార్గాల్లో {property.contactName || 'యజమానిని'} సంప్రదించండి
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Phone Direct Call */}
                <a
                  id="direct-call-action"
                  href={`tel:${rPhone}`}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 duration-200 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>కాల్ చేయండి (Call Us)</span>
                </a>

                {/* 2. WhatsApp message */}
                <a
                  id="direct-whatsapp-action"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 duration-200 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>వాట్సాప్ (WhatsApp)</span>
                </a>

                {/* 3. Direct Email */}
                <a
                  id="direct-email-action"
                  href={emailUrl}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 bg-stone-800 hover:bg-stone-900 text-white rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 duration-200 cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>ఈమెయిల్ (Email)</span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
