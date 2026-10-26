import React, { useState } from 'react';
import { PropertyListing } from '../types';
import { MapPin, CheckCircle2, Clock, Eye, MessageSquare, PhoneCall, Heart, GitCompare, Share2, Check, QrCode, X, Printer, Download, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const getListingImages = (property: PropertyListing): string[] => {
  if (property.images && property.images.length > 0) {
    return property.images;
  }
  // Fallback based on property type to make it colorful and realistic
  const primary = property.imageUrl;
  switch (property.type) {
    case 'house':
      return [
        primary,
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
      ];
    case 'apartment':
      return [
        primary,
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80'
      ];
    case 'plot':
      return [
        primary,
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1524431144429-03fcf3fc723c?auto=format&fit=crop&w=800&q=80'
      ];
    case 'commercial':
      return [
        primary,
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80'
      ];
    default:
      return [primary];
  }
};

interface ListingCardProps {
  property: PropertyListing;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onViewDetails: (property: PropertyListing) => void;
  onContactWhatsApp: (property: PropertyListing) => void;
  isComparing?: boolean;
  onToggleCompare?: (property: PropertyListing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  property,
  isBookmarked,
  onToggleBookmark,
  onViewDetails,
  onContactWhatsApp,
  isComparing = false,
  onToggleCompare,
}) => {
  const isApproved = property.isApproved === 'Yes';
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isQrLoading, setIsQrLoading] = useState(true);

  // Carousel Image Slider State and Handlers
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

  const downloadQrCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?propertyId=${property.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`;
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `ManaGruham_QR_${property.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to download QR code directly, opening in new tab:', err);
      window.open(qrCodeUrl, '_blank');
    }
  };

  const printQrCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?propertyId=${property.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>ప్రింట్ క్యూఆర్ కోడ్ - మనం గృహం రియల్ యాప్</title>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                background-color: #fff;
                color: #1c1917;
                text-align: center;
                padding: 20px;
              }
              .container {
                border: 2px solid #e7e5e4;
                padding: 40px;
                border-radius: 24px;
                max-width: 400px;
                box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
              }
              .logo {
                font-size: 24px;
                font-weight: 800;
                color: #d97706;
                margin-bottom: 5px;
              }
              .sublogo {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #78716c;
                margin-bottom: 25px;
              }
              img {
                width: 250px;
                height: 250px;
                border: 1px solid #f5f5f4;
                border-radius: 12px;
                margin-bottom: 20px;
              }
              .title {
                font-size: 18px;
                font-weight: 700;
                margin-bottom: 8px;
              }
              .details {
                font-size: 14px;
                color: #44403c;
                margin-bottom: 15px;
              }
              .footer {
                font-size: 12px;
                color: #a8a29e;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">మనం గృహం రియల్ యాప్</div>
              <div class="sublogo">Mana Gruham Real App</div>
              <img src="${qrCodeUrl}" alt="QR Code" />
              <div class="title">${property.title}</div>
              <div class="details">${property.area}, ${property.city} | ధర: ₹ ${property.priceFormatted}</div>
              <p style="font-size: 13px; font-weight: 500; color: #d97706; max-width: 300px; margin: 10px auto;">ఈ క్యూఆర్ కోడ్‌ను స్కాన్ చేసి స్మార్ట్‌ఫోన్‌లో పూర్తి ఆస్తి వివరాలు మరియు ఫోటోలు వీక్షించండి.</p>
              <div class="footer">రియల్ ఎస్టేట్ సేవలు: +91 8977776111</div>
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?propertyId=${property.id}`;
    const shareTitle = `మనం గృహం రియల్ యాప్ - ${property.title}`;
    const shareText = `🏡 మనం గృహం రియల్ యాప్ లో అద్భుతమైన ఆస్తి లభ్యం!\n\nఆస్తి: ${property.title}\nలొకేషన్: ${property.area}, ${property.city}\nధర: ₹ ${property.priceFormatted}\n\nమరిన్ని వివరాలు ఇక్కడ చూడండి:`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        setShareFeedback('షేర్ చేయబడింది! (Shared!)');
        setTimeout(() => setShareFeedback(null), 2500);
      } catch (err) {
        // User may cancel share sheet, ignore or handle gracefully
        console.log('Error sharing or cancelled:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setShareFeedback('లింక్ కాపీ అయింది! (Copied!)');
        setTimeout(() => setShareFeedback(null), 2500);
      } catch (err) {
        // Ultimate fallback: open whatsapp share link
        const whatsappUrl = `https://wa.me/918977776111?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
        window.open(whatsappUrl, '_blank');
      }
    }
  };

  const handleEmailShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?propertyId=${property.id}`;
    const emailSubject = encodeURIComponent(`మన గృహం రియల్ ఎస్టేట్: ${property.title}`);
    const emailBody = encodeURIComponent(
      `🏡 మనం గృహం రియల్ యాప్ లో అద్భుతమైన ఆస్తి లభ్యం!\n\nఆస్తి: ${property.title}\nలొకేషన్: ${property.area}, ${property.city}\nధర: ₹ ${property.priceFormatted}\n\nమరిన్ని వివరాలు మరియు ఫొటోలు ఇక్కడ చూడండి:\n${shareUrl}\n\nకృతజ్ఞతలు.`
    );
    window.location.href = `mailto:injarapusivaraghava@gmail.com?subject=${emailSubject}&body=${emailBody}`;
  };

  // Get Property Type Label in Telugu & English
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'house':
        return 'స్వతంత్ర ఇల్లు (House)';
      case 'apartment':
        return 'అపార్ట్‌మెంట్ (Apartment)';
      case 'plot':
        return 'ప్లాట్ / స్థలం (Plot)';
      case 'commercial':
        return 'కమర్షియల్ (Commercial)';
      default:
        return 'ఇతర స్థిరాస్తి';
    }
  };

  return (
    <motion.div
      id={`property-card-${property.id}`}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col h-full border ${
        property.packageName === 'featured'
          ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-amber-100/50'
          : 'border-stone-100'
      }`}
    >
      {/* Property Image & Status Badges */}
      <div className="relative aspect-video w-full overflow-hidden bg-stone-100 group/image-container">
        {/* Main image click container */}
        <div 
          onClick={() => onViewDetails(property)}
          className="w-full h-full cursor-pointer relative"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIdx}
              src={images[currentImageIdx]}
              alt={`${property.title} - Photo ${currentImageIdx + 1}`}
              referrerPolicy="no-referrer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
        </div>
        
        {/* Carousel Arrow Controls */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              id={`card-prev-img-${property.id}`}
              onClick={handlePrevImage}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-stone-700 hover:text-amber-600 hover:bg-white shadow-md active:scale-90 transition-all duration-200 z-10 cursor-pointer md:opacity-0 md:group-hover/image-container:opacity-100 opacity-90"
              title="మునుపటి చిత్రం (Previous Image)"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              type="button"
              id={`card-next-img-${property.id}`}
              onClick={handleNextImage}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-stone-700 hover:text-amber-600 hover:bg-white shadow-md active:scale-90 transition-all duration-200 z-10 cursor-pointer md:opacity-0 md:group-hover/image-container:opacity-100 opacity-90"
              title="తదుపరి చిత్రం (Next Image)"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </>
        )}

        {/* Image Indicator Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 z-10 bg-black/45 backdrop-blur-md px-2 py-1 rounded-full">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                id={`card-dot-img-${property.id}-${idx}`}
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
        
        {/* Status Tag: For Sale / Rent & Verification status */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10">
          {property.packageName === 'featured' && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black rounded-full bg-amber-500 text-stone-950 shadow-md animate-pulse uppercase tracking-wider">
              ★ ఫీచర్డ్ (Featured Highlight)
            </span>
          )}
          <span className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full text-white backdrop-blur-md shadow-xs ${
            property.status === 'sale' ? 'bg-amber-600/90' : 'bg-blue-600/90'
          }`}>
            {property.status === 'sale' ? 'అమ్మకానికి (For Sale)' : 'అద్దెకు (For Rent)'}
          </span>
          {isApproved ? (
            <span className="flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/95 text-white backdrop-blur-md shadow-xs">
              <CheckCircle2 className="w-3 h-3" />
              <span>వెరిఫైడ్ (Approved)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-yellow-500/95 text-white backdrop-blur-md shadow-xs">
              <Clock className="w-3 h-3 animate-pulse" />
              <span>పెండింగ్ (Pending)</span>
            </span>
          )}
          {property.age !== undefined && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-stone-900/85 text-stone-100 backdrop-blur-md shadow-xs">
              <span>{property.age === 0 ? 'కొత్త నిర్మాణం (New)' : `${property.age} సం||రాలు (${property.age} yrs)`}</span>
            </span>
          )}
        </div>

        {/* Compare Button */}
        {onToggleCompare && (
          <button
            id={`compare-btn-${property.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(property);
            }}
            className={`absolute top-3 right-12 p-2 rounded-full backdrop-blur-md transition-all active:scale-95 duration-200 cursor-pointer shadow-xs border z-10 ${
              isComparing
                ? 'bg-amber-600 border-amber-600 text-white hover:bg-amber-700'
                : 'bg-white/90 border-stone-200/50 text-stone-700 hover:text-amber-600 hover:bg-white'
            }`}
            title={isComparing ? 'పోలికల నుండి తీసిвеయి (Remove from Compare)' : 'పోల్చండి (Compare)'}
          >
            <GitCompare className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Bookmark Button */}
        <button
          id={`bookmark-btn-${property.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(property.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all active:scale-95 duration-200 cursor-pointer shadow-xs border z-10 ${
            isBookmarked
              ? 'bg-rose-500 border-rose-500 text-white hover:bg-rose-600 shadow-rose-200'
              : 'bg-white/90 border-stone-200/50 text-stone-700 hover:text-rose-600 hover:bg-white'
          }`}
          title={isBookmarked ? 'ఇష్టమైనవాటి నుండి తీసివేయి (Remove from Favorites)' : 'ఇష్టమైనవాటిలో చేర్చు (Add to Favorites)'}
        >
          <Heart className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current text-white animate-pulse' : ''}`} />
        </button>

        {/* Pricing tag over image footer */}
        <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-4 pt-10 pointer-events-none">
          <p className="font-display font-bold text-lg text-white font-mono">
            ₹ {property.priceFormatted}
          </p>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Location & City Tag / Subcategory Label */}
          <div className="flex items-center gap-1 text-amber-600 font-semibold text-xs uppercase tracking-wide mb-1 flex-wrap justify-between w-full">
            <div className="flex items-center gap-1 truncate max-w-[70%]">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {property.type === 'farm_land' && property.village
                  ? `${property.village}, ${property.district}`
                  : `${property.area}, ${property.city}`}
              </span>
            </div>
            
            {property.type === 'farm_land' && (
              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/40 rounded-md font-bold text-[9px] shrink-0">
                {property.landType || '🌾 వ్యవసాయ భూమి'}
              </span>
            )}
          </div>

          {/* Property Title */}
          <h3 className="font-display font-semibold text-base text-stone-900 leading-snug line-clamp-2 hover:text-amber-700 transition-colors duration-200" title={property.title}>
            {property.title}
          </h3>

          {/* Features description */}
          <p className="text-xs text-stone-500 line-clamp-2 mt-2 leading-relaxed">
            {property.description}
          </p>

          {/* Property Specifications Grid */}
          <div className="grid grid-cols-3 gap-2 mt-3 p-2 bg-stone-50 rounded-lg text-stone-700 text-xs font-medium">
            <div className="text-center border-r border-stone-200/60">
              <span className="block text-[10px] text-stone-400 font-normal uppercase">రకం (Type)</span>
              <span className="truncate block font-semibold text-stone-800 text-[11px] mt-0.5" title={property.type === 'house' ? 'ఇల్లు' : property.type === 'apartment' ? 'ఫ్లాట్' : property.type === 'plot' ? 'ప్లాట్' : property.type === 'farm_land' ? (property.landType || 'వ్యవసాయ భూమి') : 'వ్యాపార'}>
                {property.type === 'house' ? 'ఇల్లు' : property.type === 'apartment' ? 'ఫ్లాట్' : property.type === 'plot' ? 'ప్లాట్' : property.type === 'farm_land' ? (property.landType?.replace(/^[^\s]+\s+/, '') || 'వ్యవసాయం') : 'వ్యాపార'}
              </span>
            </div>
            <div className="text-center border-r border-stone-200/60">
              <span className="block text-[10px] text-stone-400 font-normal uppercase">{property.type === 'farm_land' ? 'వైశాల్యం (Area)' : 'అడుగూ (Size)'}</span>
              <span className="truncate block font-sans font-semibold text-stone-800 text-[11px] mt-0.5">
                {property.size}
              </span>
            </div>
            <div className="text-center">
              <span className="block text-[10px] text-stone-400 font-normal uppercase">{property.type === 'farm_land' ? 'లభ్యత (Status)' : 'ముఖం (Facing)'}</span>
              <span className="truncate block font-semibold text-stone-800 text-[11px] mt-0.5" title={property.type === 'farm_land' ? (property.availabilityStatus || 'Available') : (property.facing || 'East')}>
                {property.type === 'farm_land' ? (property.availabilityStatus || 'Available') : (property.facing || 'East')}
              </span>
            </div>
          </div>

          {/* Compare Toggle Row */}
          {onToggleCompare && (
            <div className="mt-3 flex items-center justify-between bg-stone-50/70 border border-stone-200/40 rounded-xl px-2.5 py-1.5 text-xs">
              <span className="text-stone-500 font-medium flex items-center gap-1">
                <GitCompare className={`w-3.5 h-3.5 ${isComparing ? 'text-amber-600' : 'text-stone-400'}`} />
                <span>పోల్చండి (Compare)</span>
              </span>
              <button
                type="button"
                id={`compare-card-toggle-${property.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCompare(property);
                }}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all active:scale-95 cursor-pointer border ${
                  isComparing
                    ? 'bg-amber-600 border-amber-600 text-white hover:bg-amber-700 shadow-2xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                {isComparing ? 'ఎంచుకున్నారు' : 'ఎంపిక చేయి'}
              </button>
            </div>
          )}
        </div>

        {/* Contact/Details Action Bar */}
        <div className="space-y-2 mt-4 border-t border-stone-100 pt-3 relative">
          {/* Agent info row */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 px-0.5 pb-0.5">
            <span className="truncate">
              సంప్రదించండి: <strong className="text-stone-700 font-semibold">{property.contactName || 'శివ రాఘవ'}</strong>
            </span>
            <a
              id={`agent-phone-link-${property.id}`}
              href={`tel:${(property.contactPhone || '8977776111').replace(/[^\d+]/g, '')}`}
              onClick={(e) => e.stopPropagation()}
              className="font-mono text-amber-700 font-extrabold hover:underline shrink-0 flex items-center gap-1"
            >
              <PhoneCall className="w-3 h-3 text-amber-600" />
              <span>{property.contactPhone || '8977776111'}</span>
            </a>
          </div>

          {/* Primary Action Buttons: View, Click-to-Call, WhatsApp */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              id={`view-details-${property.id}`}
              onClick={() => onViewDetails(property)}
              className="inline-flex items-center justify-center gap-1 px-2 py-2 text-[11px] font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all active:scale-95 duration-200 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 shrink-0 text-stone-500" />
              <span className="truncate">చూడండి (View)</span>
            </button>

            {/* Click to Call Button (tel: protocol) */}
            <a
              id={`click-to-call-${property.id}`}
              href={`tel:${(property.contactPhone || '8977776111').replace(/[^\d+]/g, '')}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center justify-center gap-1 px-2 py-2 text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-all active:scale-95 duration-200 cursor-pointer"
              title={`కాల్ చేయండి: ${property.contactPhone || '8977776111'}`}
            >
              <PhoneCall className="w-3.5 h-3.5 shrink-0 animate-pulse" />
              <span className="truncate">కాల్ (Call)</span>
            </a>

            {/* WhatsApp Contact Button */}
            <button
              id={`whatsapp-contact-${property.id}`}
              onClick={() => onContactWhatsApp(property)}
              className="inline-flex items-center justify-center gap-1 px-2 py-2 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all active:scale-95 duration-200 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">వాట్సాప్ (Chat)</span>
            </button>
          </div>

          {/* Secondary Utility Actions: Share, Email & QR Code */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              id={`share-btn-${property.id}`}
              onClick={handleShare}
              className={`py-1.5 text-[11px] font-semibold rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-1 border ${
                shareFeedback
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-stone-50 hover:bg-amber-50 border-stone-200/60 text-stone-600 hover:text-amber-700'
              }`}
              title="షేర్ చేయండి (Share)"
            >
              {shareFeedback ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span>{shareFeedback ? 'కాపీ అయింది!' : 'షేర్ (Share)'}</span>
            </button>

            {property.type === 'farm_land' ? (
              <a
                id={`maps-card-btn-${property.id}`}
                href={property.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((property.village || property.area) + ", " + (property.district || property.city) + ", Andhra Pradesh, India")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="py-1.5 text-[11px] font-semibold rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200/50 text-sky-700 transition-all duration-300 cursor-pointer flex items-center justify-center gap-1"
                title="గూగుల్ మ్యాప్స్ లో చూడండి (Google Maps)"
              >
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                <span>మ్యాప్స్ (Maps)</span>
              </a>
            ) : (
              <button
                id={`email-share-btn-${property.id}`}
                onClick={handleEmailShare}
                className="py-1.5 text-[11px] font-semibold rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200/50 text-blue-700 transition-all duration-300 cursor-pointer flex items-center justify-center gap-1"
                title="ఈమెయిల్ ద్వారా షేర్ చేయండి (Share via Email)"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>ఈమెయిల్ (Email)</span>
              </button>
            )}

            <button
              id={`qr-btn-${property.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsQrLoading(true);
                setShowQrModal(true);
              }}
              className="py-1.5 text-[11px] font-semibold rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200/50 text-purple-700 transition-all duration-300 cursor-pointer flex items-center justify-center gap-1"
              title="క్యూఆర్ కోడ్ (QR Code)"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>క్యూఆర్ (QR)</span>
            </button>
          </div>

          {/* Local Share Feedback Toast */}
          <AnimatePresence>
            {shareFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 bg-stone-900 text-white font-bold text-[10px] px-2.5 py-1 rounded-md shadow-md whitespace-nowrap border border-stone-800"
              >
                {shareFeedback}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* QR Code Popover Modal Overlay */}
      <AnimatePresence>
        {showQrModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              setShowQrModal(false);
            }}
            className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[28px] border border-stone-200/80 p-6 max-w-[340px] w-full text-center relative shadow-2xl flex flex-col items-center space-y-4"
            >
              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQrModal(false);
                }}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 hover:bg-stone-100 rounded-full transition-all cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              {/* Tag and Title */}
              <div className="flex flex-col items-center space-y-1.5 pt-2">
                <span className="flex items-center gap-1.5 text-[10px] font-black text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200/40 uppercase tracking-widest">
                  <QrCode className="w-3 h-3" />
                  <span>ఆస్తి క్యూఆర్ కోడ్ (QR Code)</span>
                </span>
                <h3 className="text-sm font-extrabold text-stone-900 line-clamp-1">
                  {property.title}
                </h3>
              </div>

              {/* QR Image Box */}
              <div className="relative w-44 h-44 bg-stone-50 border border-stone-200/50 rounded-2xl flex items-center justify-center p-3.5 shadow-inner overflow-hidden">
                {isQrLoading && (
                  <div className="absolute inset-0 bg-stone-100 flex flex-col items-center justify-center space-y-2 animate-pulse">
                    <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] text-stone-500 font-bold">క్యూఆర్ తయారవుతోంది...</span>
                  </div>
                )}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${window.location.origin}${window.location.pathname}?propertyId=${property.id}`)}`}
                  alt="Property QR Code"
                  className="w-full h-full object-contain rounded-lg"
                  onLoad={() => setIsQrLoading(false)}
                />
              </div>

              {/* Info Card */}
              <div className="text-xs leading-relaxed bg-stone-50 border border-stone-150 rounded-xl p-3 w-full text-stone-700">
                <div className="font-bold text-stone-800">{property.area}, {property.city}</div>
                <div className="text-amber-700 font-black mt-0.5">ధర: ₹ {property.priceFormatted}</div>
              </div>

              <p className="text-[10px] text-stone-500 leading-normal">
                భౌతిక ప్రదేశాల్లో సులభంగా భాగస్వామ్యం చేయడానికి ఈ క్యూఆర్ కోడ్‌ను మీ మొబైల్ కెమెరాతో స్కాన్ చేయండి.
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 w-full pt-1">
                <button
                  type="button"
                  onClick={downloadQrCode}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>డౌన్‌లోడ్</span>
                </button>
                <button
                  type="button"
                  onClick={printQrCode}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>ప్రింట్ చేయి</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
