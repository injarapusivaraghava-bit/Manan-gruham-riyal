import React, { useState, useEffect } from 'react';
import { PropertyListing, PropertyType, ListingStatus } from '../types';
import { X, Plus, AlertCircle, Sparkles, Building, Home, Map, MessageSquare, Check, CreditCard, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AVAILABLE_CITIES, AREAS_BY_CITY, AP_DISTRICTS, MANDALS_BY_DISTRICT, VILLAGES_BY_MANDAL, AGRICULTURAL_SUBCATEGORIES } from '../data';
import { RazorpayModal } from './RazorpayModal';

interface AddListingModalProps {
  onClose: () => void;
  onSubmit: (newListing: PropertyListing) => void;
  initialPackageId?: 'basic' | 'premium' | 'featured';
  editListing?: PropertyListing; // Added for edit capability
}

// Preset selection of beautiful real estate photos
const PHOTO_TEMPLATES = [
  { id: 't1', label: 'Modern Home', url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80' },
  { id: 't2', label: 'Luxury Villa', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' },
  { id: 't3', label: 'Premium Flat', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80' },
  { id: 't4', label: 'Open Plot / Field', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80' },
  { id: 't5', label: 'Apartment Building', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80' },
  { id: 't6', label: 'Commercial Glass Building', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80' },
];

export interface ListingPackage {
  id: 'basic' | 'premium' | 'featured';
  name: string;
  price: number;
  validity: number;
  features: string[];
  tag?: string;
  badgeColor?: string;
}

export const PACKAGES: ListingPackage[] = [
  {
    id: 'basic',
    name: 'Basic Listing',
    price: 499,
    validity: 90,
    features: [
      'Property Listing',
      'Up to 10 Photos',
      'WhatsApp Contact',
      'Phone Contact',
      'Valid for 90 Days',
      'Normal Search Listing'
    ],
    tag: 'Standard',
    badgeColor: 'bg-stone-500 text-stone-100'
  },
  {
    id: 'premium',
    name: 'Premium Listing',
    price: 999,
    validity: 180,
    features: [
      'Property Listing',
      'Up to 25 Photos',
      'WhatsApp Contact',
      'Phone Contact',
      'Featured Badge',
      'Higher Search Ranking',
      'Valid for 180 Days',
      'Priority Approval'
    ],
    tag: 'Recommended',
    badgeColor: 'bg-amber-500 text-stone-950'
  },
  {
    id: 'featured',
    name: 'Featured Listing',
    price: 1999,
    validity: 365,
    features: [
      'Property Listing',
      'Unlimited Photos',
      'Featured Badge',
      'Homepage Banner Display',
      'Top Search Ranking',
      'WhatsApp Contact',
      'Phone Contact',
      'Priority Approval',
      'Valid for 365 Days',
      'Homepage Highlight'
    ],
    tag: 'Premium Luxury',
    badgeColor: 'bg-blue-600 text-white'
  }
];

export const AddListingModal: React.FC<AddListingModalProps> = ({
  onClose,
  onSubmit,
  initialPackageId,
  editListing,
}) => {
  const [step, setStep] = useState<'form' | 'package' | 'payment'>('form');
  const [selectedPkgId, setSelectedPkgId] = useState<'basic' | 'premium' | 'featured'>(editListing?.packageName || initialPackageId || 'basic');
  const [city, setCity] = useState(editListing?.city || 'Kakinada');
  const [area, setArea] = useState(editListing?.area || 'Turangi');
  const [title, setTitle] = useState(editListing?.title || '');
  const [description, setDescription] = useState(editListing?.description || '');
  const [price, setPrice] = useState<number>(editListing?.price || 4500000);
  const [priceText, setPriceText] = useState(editListing?.priceFormatted || '45 లక్షలు (45 Lakhs)');
  const [type, setType] = useState<PropertyType>(editListing?.type || 'house');
  const [status, setStatus] = useState<ListingStatus>(editListing?.status as any || 'sale');
  const [beds, setBeds] = useState<number>(editListing?.beds || 2);
  const [baths, setBaths] = useState<number>(editListing?.baths || 2);
  const [size, setSize] = useState(editListing?.size || '1400 sqft');
  const [facing, setFacing] = useState<'East' | 'West' | 'North' | 'South' | 'North-East' | 'South-East' | 'North-West' | 'South-West'>(editListing?.facing || 'East');
  const [age, setAge] = useState<number>(editListing?.age || 0);
  const [contactName, setContactName] = useState(editListing?.contactName || '');
  const [contactPhone, setContactPhone] = useState(editListing?.contactPhone || '8977776111'); // default to Raghava as requested
  const [contactEmail, setContactEmail] = useState(editListing?.contactEmail || 'injarapusivaraghava@gmail.com');
  const [selectedPhoto, setSelectedPhoto] = useState(editListing?.imageUrl || PHOTO_TEMPLATES[0].url);
  const [customPhotoUrl, setCustomPhotoUrl] = useState(editListing?.imageUrl || '');
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [tempListing, setTempListing] = useState<PropertyListing | null>(null);
  const [paymentTxId, setPaymentTxId] = useState(editListing?.paymentId || '');

  // Agricultural specific states
  const [district, setDistrict] = useState(editListing?.district || 'Kakinada');
  const [mandal, setMandal] = useState(editListing?.mandal || '');
  const [village, setVillage] = useState(editListing?.village || '');
  const [exactLocation, setExactLocation] = useState(editListing?.exactLocation || '');
  const [googleMapsUrl, setGoogleMapsUrl] = useState(editListing?.googleMapsUrl || '');
  const [landAreaAcres, setLandAreaAcres] = useState<number>(editListing?.landAreaAcres || 1);
  const [landAreaCents, setLandAreaCents] = useState<number>(editListing?.landAreaCents || 0);
  const [landType, setLandType] = useState(editListing?.landType || '🌾 పంట పొలాలు');
  const [cropType, setCropType] = useState(editListing?.cropType || '');
  const [gardenType, setGardenType] = useState(editListing?.gardenType || '');
  const [waterFacilities, setWaterFacilities] = useState<string[]>(editListing?.waterFacility || []);
  const [roadAccess, setRoadAccess] = useState(editListing?.roadAccess || 'BT Road (బీటీ రోడ్డు)');
  const [pricePerAcre, setPricePerAcre] = useState<number>(editListing?.pricePerAcre || 2500000);
  const [whatsappContact, setWhatsappContact] = useState(editListing?.whatsappContact || '8977776111');
  const [videoUrl, setVideoUrl] = useState(editListing?.videoUrl || '');
  const [availabilityStatus, setAvailabilityStatus] = useState<'Available' | 'Sold' | 'Leased' | 'Under Discussion'>(editListing?.availabilityStatus || 'Available');
  const [fencing, setFencing] = useState(editListing?.fencing || 'No Fencing (కంచె లేదు)');

  // Dynamically update area list when city changes
  useEffect(() => {
    if (editListing) return; // Skip automatic defaults when editing
    const areas = AREAS_BY_CITY[city] || [];
    const firstNonAllArea = areas.find((a) => a !== 'All') || 'Turangi';
    setArea(firstNonAllArea);
  }, [city, editListing]);

  // Synchronize agricultural location selects
  useEffect(() => {
    if (editListing) return; // Skip automatic defaults when editing
    if (type === 'farm_land') {
      const mandals = MANDALS_BY_DISTRICT[district] || [];
      const firstMandal = mandals[0] || '';
      setMandal(firstMandal);
    }
  }, [district, type, editListing]);

  useEffect(() => {
    if (editListing) return; // Skip automatic defaults when editing
    if (type === 'farm_land' && mandal) {
      const villages = VILLAGES_BY_MANDAL[mandal] || [];
      const firstVillage = villages[0] || '';
      setVillage(firstVillage);
    }
  }, [mandal, type, editListing]);

  // Set default template photo based on selected property type
  useEffect(() => {
    if (editListing) return; // Skip automatic defaults when editing
    if (type === 'house') setSelectedPhoto(PHOTO_TEMPLATES[0].url);
    else if (type === 'apartment') setSelectedPhoto(PHOTO_TEMPLATES[2].url);
    else if (type === 'plot') setSelectedPhoto(PHOTO_TEMPLATES[3].url);
    else if (type === 'commercial') setSelectedPhoto(PHOTO_TEMPLATES[5].url);
    else if (type === 'farm_land') setSelectedPhoto('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'); // Use farm/field photo
  }, [type, editListing]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('దయచేసి ఇల్లు/ప్లాట్ పేరు టైప్ చేయండి (Title is required).');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('దయచేసి వివరణను టైప్ చేయండి (Description is required).');
      return;
    }
    if (type !== 'farm_land' && !size.trim()) {
      setErrorMsg('దయచేసి పరిమాణం టైప్ చేయండి (Size is required, e.g., 1200 sqft).');
      return;
    }
    if (!contactName.trim()) {
      setErrorMsg('దయచేసి మీ పేరు రాయండి (Your name is required).');
      return;
    }
    if (!contactPhone.trim()) {
      setErrorMsg('దయచేసి ఫోన్ నెంబర్ టైప్ చేయండి (Phone number is required).');
      return;
    }

    // Auto format price nicely if not done
    let formattedPrice = priceText;
    if (!priceText.trim()) {
      if (status === 'rent') {
        formattedPrice = `${price.toLocaleString('en-IN')} / నెలకు (Month)`;
      } else if (status === 'lease') {
        formattedPrice = `${price.toLocaleString('en-IN')} / లీజు (Lease)`;
      } else {
        if (price >= 10000000) {
          formattedPrice = `${(price / 10000000).toFixed(2)} కోట్లు (Crores)`;
        } else {
          formattedPrice = `${(price / 100000).toFixed(1)} లక్షలు (Lakhs)`;
        }
      }
    }

    const finalPhoto = customPhotoUrl.trim() ? customPhotoUrl.trim() : selectedPhoto;

    const partialListing: PropertyListing = {
      id: editListing ? editListing.id : `prop-user-${Date.now()}`,
      title,
      description,
      price,
      priceFormatted: formattedPrice,
      type,
      status: type === 'farm_land' ? (status as any) : status,
      city: type === 'farm_land' ? district : city,
      area: type === 'farm_land' ? mandal : area,
      beds: type === 'house' || type === 'apartment' ? beds : undefined,
      baths: type === 'house' || type === 'apartment' ? baths : undefined,
      size: type === 'farm_land' ? `${landAreaAcres} Acres ${landAreaCents} Cents` : size,
      facing: type === 'farm_land' ? undefined : facing,
      age: type !== 'plot' && type !== 'farm_land' ? age : undefined,
      imageUrl: finalPhoto,
      isApproved: editListing ? 'Pending' : 'Pending', // Force approval pipeline upon edits and new creations
      contactName,
      contactPhone,
      contactEmail,
      submittedBy: editListing ? editListing.submittedBy : 'యూజర్ సబ్మిషన్ (User Submission)',
      createdAt: editListing ? editListing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      features: type === 'farm_land' ? waterFacilities : (type === 'house' || type === 'apartment' 
        ? ['కార్ పార్కింగ్', 'నిరంతర మంచినీరు', 'వాస్తు ప్రకారం'] 
        : ['రోడ్డు కనెక్టివిటీ', 'క్లియర్ టైటిల్', 'సహజ వాతావరణం']),
      
      // Agricultural Fields
      district: type === 'farm_land' ? district : undefined,
      mandal: type === 'farm_land' ? mandal : undefined,
      village: type === 'farm_land' ? village : undefined,
      exactLocation: type === 'farm_land' ? exactLocation : undefined,
      googleMapsUrl: type === 'farm_land' ? googleMapsUrl : undefined,
      landAreaAcres: type === 'farm_land' ? landAreaAcres : undefined,
      landAreaCents: type === 'farm_land' ? landAreaCents : undefined,
      landType: type === 'farm_land' ? landType : undefined,
      cropType: type === 'farm_land' ? cropType : undefined,
      gardenType: type === 'farm_land' ? gardenType : undefined,
      waterFacility: type === 'farm_land' ? waterFacilities : undefined,
      roadAccess: type === 'farm_land' ? roadAccess : undefined,
      fencing: type === 'farm_land' ? fencing : undefined,
      pricePerAcre: type === 'farm_land' ? pricePerAcre : undefined,
      whatsappContact: type === 'farm_land' ? whatsappContact : undefined,
      videoUrl: type === 'farm_land' ? videoUrl : undefined,
      availabilityStatus: type === 'farm_land' ? availabilityStatus : undefined,
    };

    if (editListing) {
      // Direct submission bypass for editing (don't charge user again!)
      const completedListing: PropertyListing = {
        ...editListing,
        ...partialListing,
      };
      onSubmit(completedListing);
      setIsSubmitted(true);
    } else {
      setTempListing(partialListing);
      setStep('package'); // Proceed to package step
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    if (!tempListing) return;

    setPaymentTxId(paymentId);
    
    const selectedPkg = PACKAGES.find((p) => p.id === selectedPkgId) || PACKAGES[0];
    const now = new Date();
    const expiry = new Date();
    expiry.setDate(now.getDate() + selectedPkg.validity);

    const finalListing: PropertyListing = {
      ...tempListing,
      paymentId,
      paymentAmount: selectedPkg.price,
      packageName: selectedPkg.id,
      paymentStatus: 'success',
      paymentDate: now.toISOString(),
      startDate: now.toISOString(),
      expiryDate: expiry.toISOString(),
      isApproved: 'Yes', // Activated immediately after successful payment
    };

    // Save Ownership to localStorage for User Panel
    const existingUserIds = JSON.parse(localStorage.getItem('mana_gruham_user_listing_ids') || '[]');
    localStorage.setItem('mana_gruham_user_listing_ids', JSON.stringify([...existingUserIds, finalListing.id]));

    // Save Payment Record to localStorage for User Panel History
    const paymentRecord = {
      id: `tx_${Date.now()}`,
      paymentId,
      propertyId: finalListing.id,
      propertyName: finalListing.title,
      amount: selectedPkg.price,
      packageName: selectedPkg.name,
      date: now.toISOString(),
      expiryDate: expiry.toISOString(),
      status: 'success'
    };
    const existingPayments = JSON.parse(localStorage.getItem('mana_gruham_payments_v1') || '[]');
    localStorage.setItem('mana_gruham_payments_v1', JSON.stringify([paymentRecord, ...existingPayments]));

    // Submit listing to parent state
    onSubmit(finalListing);
    setIsSubmitted(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!isSubmitted && step !== 'payment' ? onClose : undefined}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative bg-white rounded-3xl w-full ${step === 'package' ? 'max-w-4xl' : 'max-w-xl'} max-h-[90vh] overflow-hidden shadow-2xl flex flex-col z-10 transition-all duration-350`}
        >
          {/* Header */}
          <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="font-display font-bold text-stone-900 text-base md:text-lg">
                  {step === 'form' && (editListing ? 'స్థిరాస్తి వివరాలను సవరించండి' : 'కొత్త స్థిరాస్తిని అప్‌లోడ్ చేయండి')}
                  {step === 'package' && 'ప్యాకేజీని ఎంచుకోండి (Choose Package)'}
                  {step === 'payment' && 'చెల్లింపు (Razorpay Payment)'}
                  {isSubmitted && 'సమర్పణ విజయవంతమైంది!'}
                </h3>
                <p className="text-[10px] text-stone-500 font-medium">
                  {step === 'form' && (editListing ? 'ఆస్తి సవరణ దశ' : 'Step 1 of 3: ఆస్తి వివరాల నమోదు')}
                  {step === 'package' && 'Step 2 of 3: ప్యాకేజీ ఎంపిక'}
                  {step === 'payment' && `Step 3 of 3: ₹${PACKAGES.find((p) => p.id === selectedPkgId)?.price || 499} సురక్షిత పేమెంట్`}
                  {isSubmitted && 'పూర్తయింది!'}
                </p>
              </div>
            </div>
            {!isSubmitted && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Scrollable Container */}
          <div className="p-6 overflow-y-auto flex-1 max-h-[calc(90vh-130px)]">
            {isSubmitted ? (
              /* Success screen */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6 space-y-6"
              >
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-display font-black text-stone-950 text-lg">
                    {editListing ? 'సవరణ విజయవంతంగా నమోదైంది!' : 'లిస్టింగ్ మరియు పేమెంట్ విజయవంతమైంది!'}
                  </h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                    {editListing 
                      ? 'మీ ఆస్తి వివరాలు విజయవంతంగా సవరించబడ్డాయి. ఈ లిస్టింగ్ ప్రస్తుతం అడ్మిన్ అప్రూవల్ (Pending Approval) కోసం నిలిపి ఉంచబడింది. అడ్మిన్ పరిశీలించిన తర్వాత లైవ్ చేయబడుతుంది.' 
                      : `మీరు ఎంచుకున్న ప్యాకేజీ (${PACKAGES.find((p) => p.id === selectedPkgId)?.name || 'Basic Listing'} - ₹${PACKAGES.find((p) => p.id === selectedPkgId)?.price || 499}) పేమెంట్ విజయవంతంగా పూర్తయింది. ఈ లిస్టింగ్ ప్రస్తుతం Admin Approval కోసం వేచి ఉంది (Pending).`}
                  </p>
                </div>

                {!editListing && (
                  <div className="max-w-md mx-auto p-4 bg-stone-50 rounded-2xl border border-stone-200 text-left space-y-2 font-mono text-[11px] text-stone-600">
                    <div className="flex justify-between border-b border-stone-150 pb-1.5">
                      <span>Transaction ID:</span>
                      <span className="text-stone-900 font-bold">{paymentTxId}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-150 pb-1.5">
                      <span>Selected Package:</span>
                      <span className="text-stone-900 font-bold">{PACKAGES.find((p) => p.id === selectedPkgId)?.name || 'Basic Listing'}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-150 pb-1.5">
                      <span>Amount Paid:</span>
                      <span className="text-emerald-700 font-bold">₹{PACKAGES.find((p) => p.id === selectedPkgId)?.price || 499}.00</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-150 pb-1.5">
                      <span>Validity Period:</span>
                      <span className="text-stone-900 font-bold">{PACKAGES.find((p) => p.id === selectedPkgId)?.validity || 90} Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expiry Date:</span>
                      <span className="text-stone-900 font-bold">{tempListing?.expiryDate ? new Date(tempListing.expiryDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-left text-xs text-amber-900 leading-relaxed max-w-md mx-auto space-y-1">
                  <p className="font-bold">💡 తదుపరి చర్యలు:</p>
                  <p>
                    అడ్మిన్ (శివ రాఘవ గారు) మీ పేమెంట్ మరియు ఆస్తి ఫోటో వివరాలను ధృవీకరించి ఆమోదించిన తక్షణం (Is_Approved = "Yes"), ఈ లిస్టింగ్ ప్రజలందరికీ వెబ్ సైట్ మరియు మొబైల్ యాప్‌లో కనిపిస్తుంది.
                  </p>
                  <p className="font-bold text-amber-700 pt-1">
                    గమనిక: అడ్మిన్ పాస్‌వర్డ్ 'raghava123' ఉపయోగించి మీరే వెంటనే లాగిన్ అయి అప్రూవ్ చేసుకోవచ్చు!
                  </p>
                </div>

                <button
                  id="close-success-btn"
                  onClick={onClose}
                  className="px-8 py-3 bg-stone-900 hover:bg-stone-850 text-white font-bold text-xs rounded-xl hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  ముగించు (Close)
                </button>
              </motion.div>
            ) : step === 'package' ? (
              /* Step 2: Package Selection View */
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center max-w-md mx-auto space-y-2">
                  <h4 className="font-display font-bold text-stone-900 text-sm md:text-base">
                    స్థిరాస్తి ప్రకటన కోసం ప్యాకేజీని ఎంచుకోండి
                  </h4>
                  <p className="text-xs text-stone-500">
                    మీ బడ్జెట్ మరియు అవసరాలకు తగిన ప్యాకేజీని ఎంచుకోండి. ప్రీమియం ప్రకటనలతో మీ ఆస్తిని త్వరగా విక్రయించండి/అద్దెకు ఇవ్వండి.
                  </p>
                </div>

                {/* Package Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {PACKAGES.map((pkg) => {
                    const isSelected = selectedPkgId === pkg.id;
                    return (
                      <div
                        id={`pkg-card-${pkg.id}`}
                        key={pkg.id}
                        onClick={() => setSelectedPkgId(pkg.id)}
                        className={`relative rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-stone-900 text-stone-100 border-stone-900 shadow-xl scale-[1.02]'
                            : 'bg-white text-stone-800 border-stone-200 hover:border-amber-500/40'
                        }`}
                      >
                        {pkg.tag && (
                          <div className={`absolute -top-2.5 right-4 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${pkg.badgeColor || 'bg-stone-500 text-stone-100'} tracking-wider shadow-sm`}>
                            {pkg.tag}
                          </div>
                        )}

                        <div className="space-y-3">
                          <div>
                            <span className={`text-[10px] font-black uppercase tracking-wider block ${isSelected ? 'text-amber-400' : 'text-amber-600'}`}>
                              {pkg.name}
                            </span>
                            <h5 className="font-display font-black text-xl pt-1">
                              ₹{pkg.price} <span className="text-[10px] text-stone-400 font-semibold font-sans">/ {pkg.validity} Days</span>
                            </h5>
                          </div>

                          <div className={`border-t pt-3 space-y-1.5 ${isSelected ? 'border-stone-850' : 'border-stone-100'}`}>
                            {pkg.features.map((feat, idx) => (
                              <div key={idx} className="flex items-start gap-1.5 text-[11px]">
                                <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isSelected ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                <span className={isSelected ? 'text-stone-300' : 'text-stone-600'}>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-dashed border-stone-200/20">
                          <span className={`w-full py-1.5 rounded-lg text-[10px] font-bold text-center block ${
                            isSelected 
                              ? 'bg-amber-600 text-white' 
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}>
                            {isSelected ? 'ఎంచుకోబడింది (Selected)' : 'ఎంచుకోండి (Select)'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-[10px] text-stone-600 text-center flex items-center justify-center gap-1.5 max-w-sm mx-auto">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Razorpay తో 100% సేఫ్ మరియు సురక్షిత చెల్లింపు</span>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    id="back-to-details-btn"
                    onClick={() => setStep('form')}
                    className="flex-1 py-3 text-stone-600 bg-stone-100 hover:bg-stone-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    వెనక్కి వెళ్ళండి (Back to Details)
                  </button>
                  <button
                    id="proceed-to-pay-btn"
                    onClick={() => setStep('payment')}
                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>చెల్లించండి ₹{PACKAGES.find((p) => p.id === selectedPkgId)?.price} (Pay with Razorpay)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ) : step === 'payment' ? (
              /* Step 3: Razorpay Payment Overlay screen state */
              <div className="py-12 text-center space-y-4">
                <Loader2 className="w-10 h-10 text-amber-600 animate-spin mx-auto" />
                <p className="text-xs text-stone-600 font-semibold">
                  దయచేసి నిరీక్షించండి... Razorpay పేమెంట్ గేట్‌వే ఓపెన్ చేయబడుతోంది...
                </p>
                <RazorpayModal
                  isOpen={step === 'payment'}
                  onClose={() => setStep('package')}
                  onSuccess={handlePaymentSuccess}
                  amount={PACKAGES.find((p) => p.id === selectedPkgId)?.price || 499}
                  propertyName={tempListing?.title || 'ప్రాపర్టీ లిస్టింగ్ రుసుము'}
                />
              </div>
            ) : (
              /* Step 1: Submission Form View */
              <form onSubmit={handleFormSubmit} className="space-y-5">
                {errorMsg && (
                  <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs flex items-center gap-2 border border-rose-100 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Form row 1: Location Selection (Conditional) */}
                {type === 'farm_land' ? (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-stone-700">
                        జిల్లా (District) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 bg-white font-medium"
                      >
                        {AP_DISTRICTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-stone-700">
                        మండలం (Mandal) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={mandal}
                        onChange={(e) => setMandal(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 bg-white font-medium"
                      >
                        {(MANDALS_BY_DISTRICT[district] || []).map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-stone-700">
                        గ్రామం (Village) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={village}
                        onChange={(e) => setVillage(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 bg-white font-medium"
                      >
                        {(VILLAGES_BY_MANDAL[mandal] || []).map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-stone-700">
                        నగరం (Choose City) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id="form-city-select"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 bg-white font-medium"
                      >
                        {AVAILABLE_CITIES.filter((c) => c.value !== 'All').map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-stone-700">
                        నిర్దిష్ట ఏరియా (Choose Area) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id="form-area-select"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 bg-white font-medium"
                      >
                        {(AREAS_BY_CITY[city] || [])
                          .filter((a) => a !== 'All')
                          .map((a) => (
                            <option key={a} value={a}>
                              {a === 'Turangi' ? 'తూరంగి (Turangi)' : a === 'Gorantla' ? 'గోరంట్ల (Gorantla)' : a === 'Benz Circle' ? 'బెంజ్ సర్కిల్ (Benz Circle)' : a}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Form row 2: Property Type & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-700">
                      స్థిరాస్తి రకం (Property Type)
                    </label>
                    <div className="grid grid-cols-5 gap-1 bg-stone-100 p-1 rounded-xl text-center text-xs">
                      {(['house', 'apartment', 'plot', 'commercial', 'farm_land'] as PropertyType[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setType(t)}
                          className={`py-1.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                            type === t
                              ? 'bg-white text-amber-700 shadow-xs'
                              : 'text-stone-500 hover:text-stone-900'
                          }`}
                        >
                          {t === 'house' ? 'ఇల్లు' : t === 'apartment' ? 'ఫ్లాట్' : t === 'plot' ? 'ప్లాట్' : t === 'commercial' ? 'వ్యాపార' : 'వ్యవసాయం'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-700">
                      స్థితి (Status)
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-stone-100 p-1 rounded-xl text-center text-xs">
                      {(type === 'farm_land' ? ['sale', 'lease'] : ['sale', 'rent']).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setStatus(s as any);
                            // Adjust default price placeholder based on status
                            if (s === 'rent' && price > 200000) setPrice(15000);
                            else if (s === 'lease' && price > 100000) setPrice(50000);
                            else if (s === 'sale' && price < 100000) setPrice(4500000);
                          }}
                          className={`py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            status === s
                              ? 'bg-white text-stone-900 shadow-xs'
                              : 'text-stone-500 hover:text-stone-900'
                          }`}
                        >
                          {s === 'sale' ? 'అమ్మకానికి' : s === 'lease' ? 'లీజుకు' : 'అద్దెకు'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700">
                    స్థిరాస్తి పేరు/శీర్షిక (Listing Title) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="form-title-input"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={type === 'farm_land' ? 'ఉదా: పిఠాపురం రోడ్ లో 2 ఎకరాల మామిడి తోట' : 'ఉదా: తూరంగిలో అమ్మకానికి ఉన్న సరికొత్త 2 BHK ఇల్లు'}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-stone-700">
                    స్థిరాస్తి పూర్తి వివరణ (Full Description) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="form-desc-input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder={type === 'farm_land' ? 'నేల రకం, రోడ్డు కనెక్టివిటీ, బోరుబావి మరియు విద్యుత్ సౌకర్యం వివరాలు ఇక్కడ రాయండి...' : 'రూముల వివరాలు, వీధి వెడల్పు, వాస్తు, నీటి సదుపాయాలు మరియు ఇతర ముఖ్యమైన వివరాలు ఇక్కడ రాయండి...'}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Conditional Fields: Agricultural vs standard */}
                {type === 'farm_land' ? (
                  /* Agricultural / Garden Details Form fields */
                  <div className="space-y-4 border-t border-stone-100 pt-4">
                    <h4 className="text-xs font-extrabold text-stone-850 uppercase tracking-wide flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      వ్యవసాయ భూమి / తోట వివరాలు (Agricultural Details)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Exact Location */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-stone-700">నిర్దిష్ట చిరునామా (Exact Location)</label>
                        <input
                          type="text"
                          value={exactLocation}
                          onChange={(e) => setExactLocation(e.target.value)}
                          placeholder="ఉదా: కాల్వ గట్టు దగ్గర, శివాలయం వీధి"
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      {/* Google Maps Location */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-stone-700">గూగుల్ మ్యాప్స్ లింక్ (Google Maps Link)</label>
                        <input
                          type="text"
                          value={googleMapsUrl}
                          onChange={(e) => setGoogleMapsUrl(e.target.value)}
                          placeholder="ఉదా: https://maps.google.com/?q=..."
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Land Area: Acres */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-stone-700">ఎకరాలు (Acres)</label>
                        <input
                          type="number"
                          min="0"
                          value={landAreaAcres}
                          onChange={(e) => setLandAreaAcres(Math.max(0, Number(e.target.value)))}
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                        />
                      </div>

                      {/* Land Area: Cents */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-stone-700">సెంట్లు (Cents)</label>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={landAreaCents}
                          onChange={(e) => setLandAreaCents(Math.max(0, Math.min(99, Number(e.target.value))))}
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                        />
                      </div>

                      {/* Land Type Category */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-stone-700">భూమి రకం (Land Type) *</label>
                        <select
                          value={landType}
                          onChange={(e) => setLandType(e.target.value)}
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 bg-white font-medium text-stone-700"
                        >
                          {AGRICULTURAL_SUBCATEGORIES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.value}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Crop Type */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-stone-700">పంట రకం (Crop Type - optional)</label>
                        <input
                          type="text"
                          value={cropType}
                          onChange={(e) => setCropType(e.target.value)}
                          placeholder="ఉదా: వరి, చెరకు, మిరప"
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      {/* Garden Type */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-stone-700">తోట రకం (Garden Type - optional)</label>
                        <input
                          type="text"
                          value={gardenType}
                          onChange={(e) => setGardenType(e.target.value)}
                          placeholder="ఉదా: బంగినపల్లి మామిడి, కొబ్బరి"
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    {/* Water Facility Checkboxes */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-stone-700">నీటి సౌకర్యం (Water Facility)</label>
                      <div className="flex flex-wrap gap-4 bg-stone-50 p-3 rounded-2xl border border-stone-150">
                        {['Borewell (బోరుబావి)', 'Canal Water (కాల్వ నీరు)', 'Electricity (కరెంట్ సౌకర్యం)', 'Drip Irrigation (డ్రిప్)'].map((fac) => {
                          const isChecked = waterFacilities.includes(fac);
                          return (
                            <label key={fac} className="flex items-center gap-1.5 text-xs font-bold text-stone-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setWaterFacilities(waterFacilities.filter((f) => f !== fac));
                                  } else {
                                    setWaterFacilities([...waterFacilities, fac]);
                                  }
                                }}
                                className="rounded border-stone-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                              />
                              <span>{fac}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Road Access */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-stone-700">రోడ్డు సౌకర్యం (Road Access)</label>
                        <select
                          value={roadAccess}
                          onChange={(e) => setRoadAccess(e.target.value)}
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 bg-white text-stone-700 font-medium"
                        >
                          <option value="BT Road (బీటీ రోడ్డు)">BT Road (బీటీ రోడ్డు)</option>
                          <option value="Tar Road (తారు రోడ్డు)">Tar Road (తారు రోడ్డు)</option>
                          <option value="Soil Road (మట్టి రోడ్డు)">Soil Road (మట్టి రోడ్డు)</option>
                          <option value="No Road Access (రోడ్డు మార్గం లేదు)">No Road Access (రోడ్డు మార్గం లేదు)</option>
                        </select>
                      </div>

                      {/* Fencing */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-stone-700">కంచె సౌకర్యం (Fencing)</label>
                        <select
                          value={fencing}
                          onChange={(e) => setFencing(e.target.value)}
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 bg-white text-stone-700 font-medium"
                        >
                          <option value="No Fencing (కంచె లేదు)">No Fencing (కంచె లేదు)</option>
                          <option value="Barbed Wire Fencing (ముళ్లకంచె)">Barbed Wire Fencing (ముళ్లకంచె)</option>
                          <option value="Solar Fencing (సోలార్ కంచె)">Solar Fencing (సోలార్ కంచె)</option>
                          <option value="Compound Wall (ప్రహారీ గోడ)">Compound Wall (ప్రహారీ గోడ)</option>
                          <option value="Natural Bio Fencing (సహజ కంచె)">Natural Bio Fencing (సహజ కంచె)</option>
                        </select>
                      </div>

                      {/* Price per acre / Price */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-stone-700">ఎకరం ధర రూపాయలలో (Price Per Acre in ₹)</label>
                        <input
                          type="number"
                          value={pricePerAcre}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setPricePerAcre(val);
                            // Auto compute total price as Acre * Area
                            const totalAcres = landAreaAcres + (landAreaCents / 100);
                            const computedPrice = Math.round(val * totalAcres);
                            setPrice(computedPrice);
                            if (computedPrice >= 10000000) {
                              setPriceText(`${(computedPrice / 10000000).toFixed(2)} కోట్లు`);
                            } else {
                              setPriceText(`${(computedPrice / 100000).toFixed(1)} లక్షలు`);
                            }
                          }}
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* WhatsApp contact */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-stone-700">WhatsApp నెంబర్</label>
                        <input
                          type="text"
                          value={whatsappContact}
                          onChange={(e) => setWhatsappContact(e.target.value)}
                          placeholder="ఉదా: 8977776111"
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-mono"
                        />
                      </div>

                      {/* Property video URL */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-stone-700">వీడియో లింక్ (YouTube Video Link)</label>
                        <input
                          type="text"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          placeholder="ఉదా: https://youtube.com/watch?v=..."
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      {/* Availability Status */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-stone-700">లభ్యత స్థితి (Availability / Status)</label>
                        <select
                          value={availabilityStatus}
                          onChange={(e) => setAvailabilityStatus(e.target.value as any)}
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 bg-white text-stone-700 font-medium"
                        >
                          <option value="Available">Available (అందుబాటులో ఉంది)</option>
                          <option value="Sold">Sold (అమ్మబడింది)</option>
                          <option value="Leased">Leased (లీజుకు ఇవ్వబడింది)</option>
                          <option value="Under Discussion">Under Discussion (చర్చల్లో ఉంది)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/30">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-black text-amber-800 tracking-wider">మొత్తం ధర లెక్క (Computed Total Price):</span>
                        <p className="text-base font-black text-amber-600 font-mono">₹{price.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-black text-amber-800 tracking-wider">ధర వివరణ (Formatted Price Display):</span>
                        <p className="text-xs font-black text-stone-800">{priceText}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard Urban Spec Fields */
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-stone-700">
                          ధర రూపాయలలో (Price in ₹)
                        </label>
                        <input
                          id="form-price-input"
                          type="number"
                          value={price}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setPrice(val);
                            if (status === 'rent') {
                              setPriceText(`${val.toLocaleString('en-IN')} / నెల`);
                            } else {
                              if (val >= 10000000) {
                                setPriceText(`${(val / 10000000).toFixed(2)} కోట్లు`);
                              } else {
                                setPriceText(`${(val / 100000).toFixed(1)} లక్షలు`);
                              }
                            }
                          }}
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-stone-700">
                          ధర టెక్స్ట్ (Formatted Price)
                        </label>
                        <input
                          id="form-price-formatted-input"
                          type="text"
                          value={priceText}
                          onChange={(e) => setPriceText(e.target.value)}
                          placeholder="ఉదా: 45 లక్షలు"
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-stone-700">
                          పరిమాణం (Size) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="form-size-input"
                          type="text"
                          value={size}
                          onChange={(e) => setSize(e.target.value)}
                          placeholder="ఉదా: 1400 sqft / 150 SqYd"
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-stone-700">
                          బెడ్ రూములు (Beds)
                        </label>
                        <input
                          id="form-beds-input"
                          type="number"
                          disabled={type !== 'house' && type !== 'apartment'}
                          value={beds}
                          onChange={(e) => setBeds(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-mono disabled:bg-stone-50 disabled:text-stone-300"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-stone-700">
                          బాత్ రూములు (Baths)
                        </label>
                        <input
                          id="form-baths-input"
                          type="number"
                          disabled={type !== 'house' && type !== 'apartment'}
                          value={baths}
                          onChange={(e) => setBaths(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-mono disabled:bg-stone-50 disabled:text-stone-300"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-stone-700">
                          ముఖం (Facing Direction)
                        </label>
                        <select
                          id="form-facing-select"
                          value={facing}
                          onChange={(e) => setFacing(e.target.value as any)}
                          className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 bg-white text-stone-700"
                        >
                          <option value="East">తూర్పు (East)</option>
                          <option value="West">పడమర (West)</option>
                          <option value="North">ఉత్తరం (North)</option>
                          <option value="South">దక్షిణం (South)</option>
                          <option value="North-East">ఈశాన్యం (North-East)</option>
                          <option value="South-East">ఆగ్నేయం (South-East)</option>
                          <option value="North-West">వాయువ్యం (North-West)</option>
                          <option value="South-West">నైరుతి (South-West)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-stone-700">
                        నిర్మాణ వయస్సు (Property Age)
                      </label>
                      <select
                        id="form-age-select"
                        disabled={type === 'plot' || type === 'farm_land'}
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 bg-white disabled:bg-stone-50 disabled:text-stone-300 font-medium text-stone-700"
                      >
                        <option value={0}>సరికొత్త నిర్మాణం (New Construction)</option>
                        <option value={3}>1-5 సంవత్సరాల పాతది (1-5 Years Old)</option>
                        <option value={7}>5 సంవత్సరాల పైన పాతది (5+ Years Old)</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Photo selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-700">
                    స్థిరాస్తి ఫోటోను ఎంచుకోండి (Select House Image)
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {PHOTO_TEMPLATES.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPhoto(p.url);
                          setCustomPhotoUrl('');
                        }}
                        className={`relative aspect-video rounded-lg overflow-hidden border-2 cursor-pointer ${
                          selectedPhoto === p.url && !customPhotoUrl
                            ? 'border-amber-600 scale-95 shadow-md'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>

                  <input
                    id="form-custom-photo-url"
                    type="text"
                    value={customPhotoUrl}
                    onChange={(e) => setCustomPhotoUrl(e.target.value)}
                    placeholder="లేదా ఏదైనా ఫోటో URL ఇక్కడ పేస్ట్ చేయండి (Optional custom photo URL)"
                    className="w-full px-3 py-1.5 border border-stone-200 rounded-xl text-[11px] focus:ring-2 focus:ring-amber-500 mt-2"
                  />
                </div>

                {/* Submitter details */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-3">
                  <h4 className="text-xs font-bold text-stone-800">మీ సంప్రదింపు వివరాలు (Your Contact Info)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] text-stone-500 uppercase font-semibold">మీ పేరు (Your Name) *</label>
                      <input
                        id="form-contact-name"
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="ఉదా: వెంకటేశ్వర్లు"
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] text-stone-500 uppercase font-semibold">ఫోన్ నెంబర్ (Phone Number) *</label>
                      <input
                        id="form-contact-phone"
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="ఉదా: 8977776111"
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-amber-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit actions */}
                <div className="flex gap-2 pt-3">
                  <button
                    id="cancel-add-btn"
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 text-stone-600 bg-stone-100 hover:bg-stone-200 text-xs font-bold rounded-2xl transition-all cursor-pointer"
                  >
                    రద్దు (Cancel)
                  </button>
                  <button
                    id="submit-add-btn"
                    type="submit"
                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    సమర్పించండి (Submit Details)
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

const Loader2Icon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
