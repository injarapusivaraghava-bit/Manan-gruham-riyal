import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  Coins, 
  Truck, 
  User, 
  Clock, 
  ShoppingBag, 
  PhoneCall, 
  ChevronRight, 
  Compass, 
  ShieldCheck, 
  FileCheck, 
  Gift, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { ManaGruhamPayment } from '../types';
import { HomeLoanCalculator } from './HomeLoanCalculator';

export interface ServiceItem {
  id: string;
  nameTe: string;
  nameEn: string;
  category: 'service' | 'product' | 'booking' | 'other';
  price: number;
  descriptionTe: string;
  descriptionEn: string;
  featuresTe: string[];
  featuresEn: string[];
  imageUrl: string;
}

const PRESET_SERVICES_PRODUCTS: ServiceItem[] = [
  // 1. Property Services
  {
    id: 'vastu-consult',
    nameTe: 'పరిశోధనాత్మక వాస్తు సలహా',
    nameEn: 'Elite Vastu Consultation',
    category: 'service',
    price: 1499,
    descriptionTe: 'మా సర్టిఫైడ్ వాస్తు నిపుణుడితో మీ ఇంటి ప్లాన్ క్షుణ్ణంగా పరిశీలన మరియు మార్పులు.',
    descriptionEn: 'Get home layout analysis, remedial solutions, and detailed corrections by certified Vastu experts.',
    featuresTe: ['ఆన్‌లైన్ లేదా ఫోన్ ద్వారా సలహా', '3D ప్లాన్ పరిశీలన', 'లిఖితపూర్వక రిపోర్ట్'],
    featuresEn: ['Online/Phone video consultation', '3D Floorplan evaluation', 'Detailed remedial PDF report'],
    imageUrl: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'legal-verify',
    nameTe: 'లీగల్ పత్రాల పరిశీలన',
    nameEn: 'Legal Document Verification',
    category: 'service',
    price: 2999,
    descriptionTe: 'సీనియర్ రియల్ ఎస్టేట్ న్యాయవాదుల ద్వారా టైటిల్ పత్రాలు మరియు లింక్ డాక్యుమెంట్ల వెరిఫికేషన్.',
    descriptionEn: 'Comprehensive title and legal document verification of your chosen property by senior attorneys.',
    featuresTe: ['లింక్ డాక్యుమెంట్ల క్షుణ్ణమైన పరిశీలన', 'కంప్యూటరైజ్డ్ ఈసీ (EC) వెరిఫికేషన్', 'లీగల్ ఒపీనియన్ లెటర్'],
    featuresEn: ['Link document chain check', 'Online EC & registration audit', 'Official legal opinion certificate'],
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'home-cleaning',
    nameTe: 'ఇంటి డీప్ క్లీనింగ్ సేవలు',
    nameEn: 'Deep Home Cleaning Services',
    category: 'service',
    price: 1999,
    descriptionTe: 'అనుభవజ్ఞులైన క్లీనర్స్ మరియు మోడరన్ మిషన్లతో ఇంటి మొత్తం శానిటైజేషన్ మరియు శుభ్రత.',
    descriptionEn: 'Professional deep home cleaning, vacuuming, and disinfection using eco-friendly materials.',
    featuresTe: ['పూర్తి కిచెన్ మరియు వాష్‌రూమ్స్ క్లీనింగ్', 'ఫ్లోర్ స్క్రబ్బింగ్ మరియు శానిటైజేషన్', 'వ్యాక్యూమ్ క్లీనింగ్'],
    featuresEn: ['Complete kitchen & washroom scrub', 'Floor polishing & deep disinfection', 'Sofa & mattress vacuuming'],
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80'
  },
  // 2. Decoration Products
  {
    id: 'brass-diya-set',
    nameTe: 'సాంప్రదాయ ఇత్తడి దీపాలు (హ్యాండ్‌క్రాఫ్టెడ్)',
    nameEn: 'Handcrafted Brass Diya Set',
    category: 'product',
    price: 799,
    descriptionTe: 'మీ నూతన గృహ పూజా మందిరం కోసం శ్రేష్ఠమైన, బరువైన శుద్ధ ఇత్తడి దీపాల జత.',
    descriptionEn: 'A pair of heavy, premium traditional brass lamps with beautiful carvings to illuminate your temple.',
    featuresTe: ['100% ప్యూర్ బ్రాస్ మెటీరియల్', 'సులభంగా క్లీన్ చేసుకునే వెసులుబాటు', 'వేగవంతమైన డెలివరీ'],
    featuresEn: ['100% pure premium brass weight', 'Intricate handcrafted carvings', 'Free home delivery across AP'],
    imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d72111d4023?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'wooden-nameplate',
    nameTe: 'క్లాసిక్ టేకు చెక్క నేమ్ ప్లేట్',
    nameEn: 'Classic Teakwood Name Plate',
    category: 'product',
    price: 649,
    descriptionTe: 'మీ ఇంటి ప్రధాన ద్వారం కోసం టేకు కర్రతో తయారు చేసిన అందమైన కస్టమైజ్డ్ పేరు బోర్డు.',
    descriptionEn: 'Custom engraved premium teakwood name plaque for your main entrance with golden letters.',
    featuresTe: ['గాలి, వర్షానికి తట్టుకునే పాలిష్', 'కస్టమ్ తెలుగు/ఇంగ్లీష్ అక్షరాల అమరిక', 'గోడకు తగిలించుకునే హుక్స్'],
    featuresEn: ['Weatherproof outdoor coating', 'Custom names in Telugu & English font', 'Brass screws & mounting template included'],
    imageUrl: 'https://images.unsplash.com/photo-1525909002-1b057f39dd82?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'led-mandir-light',
    nameTe: 'పూజా మందిరం LED బ్యాక్‌లైట్ బోర్డు',
    nameEn: 'LED Pooja Mandir Backlight Plaque',
    category: 'product',
    price: 1199,
    descriptionTe: 'పూజా గదికి అద్భుతమైన ఆధ్యాత్మిక కళ మరియు ఆహ్లాదకరమైన కాంతినిచ్చే స్వస్తిక్/ఓం LED లైట్ బోర్డు.',
    descriptionEn: 'Ambient wall-mounted LED acrylic plate with Swastik/Om patterns for peaceful temple illumination.',
    featuresTe: ['తక్కువ కరెంటు ఖర్చయ్యే LED అమరిక', 'అందమైన బంగారు రంగు అక్రిలిక్ షీట్', 'ప్లగ్ అండ్ ప్లే వైర్ సపోర్ట్'],
    featuresEn: ['Eco-friendly low power LED glow', 'Durable gold-plated acrylic finish', '1-year replacement warranty'],
    imageUrl: 'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=400&q=80'
  },
  // 3. Booking Payments
  {
    id: 'vip-cab-visit',
    nameTe: 'సందర్శన VIP ఏసీ క్యాబ్ బుకింగ్',
    nameEn: 'Site-Visit VIP AC Cab Booking',
    category: 'booking',
    price: 499,
    descriptionTe: 'కాకినాడ/తూరంగి సరహద్దుల్లో ఇళ్ళు లేదా స్థలాలు చూడడానికి మీ కుటుంబం కోసం ఏసీ కార్ బుకింగ్.',
    descriptionEn: 'Enjoy a hassle-free round-trip AC cab site-visit accompanied by our senior manager.',
    featuresTe: ['ఇంటి నుండే పికప్ మరియు డ్రాప్', 'సౌకర్యవంతమైన ఏసీ ప్రయాణం', 'ఉచిత స్థిరాస్తి సలహాలు'],
    featuresEn: ['Doorstep pickup & drop-off', 'Accompanied by area expert coordinator', 'Covers up to 5 properties in a day'],
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'drone-photo-shoot',
    nameTe: 'ప్రొఫెషనల్ ఫోటోగ్రఫీ & డ్రోన్ వీడియో',
    nameEn: 'Professional Photo & Drone Shoot',
    category: 'booking',
    price: 3499,
    descriptionTe: 'మీ ఇల్లు లేదా స్థలాన్ని వేగంగా అమ్ముకోవడానికి హై-క్వాలిటీ డ్రోన్ వీడియో మరియు HD ఫోటో షూట్.',
    descriptionEn: 'Capture stunning aerial drone layouts and cinematic HD interior photos to attract direct buyers.',
    featuresTe: ['15 నిమిషాల ఎడిట్ చేసిన డ్రోన్ క్లిప్', '25+ హై-డెఫినిషన్ ఇంటీరియర్ ఫోటోలు', 'మనం గృహం యాప్‌లో టాప్ బూస్ట్'],
    featuresEn: ['15-minute edited drone marketing video', '25+ high-res interior/exterior photos', 'Priority badge on Mana Gruham app'],
    imageUrl: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=400&q=80'
  },
  // 4. Other services
  {
    id: 'digital-rent-agree',
    nameTe: 'డిజిటల్ అద్దె ఒప్పందం పత్రం',
    nameEn: 'Digital Rent Agreement Drafting',
    category: 'other',
    price: 349,
    descriptionTe: 'ఆన్‌లైన్‌లో చట్టపరమైన అద్దె ఒప్పంద పత్రం తయారీ మరియు ఈ-సంతకాలతో కూడిన పిడిఎఫ్ ప్రతినెలా.',
    descriptionEn: 'Legally vetted, instantly compiled rent agreement drafting with convenient e-signature integration.',
    featuresTe: ['పోలీస్ వెరిఫికేషన్ అసిస్టెన్స్', 'లింక్ ద్వారా తక్షణ ఈ-సంతకం', 'పీడీఎఫ్ డాక్యుమెంట్ ఈమెయిల్‌కు వస్తుంది'],
    featuresEn: ['Standard legal clause templates', 'Instant e-signatures for landlord & tenant', 'E-delivered PDF legal contract'],
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80'
  }
];

interface ServicesProductsPanelProps {
  payments: ManaGruhamPayment[];
  onInitiatePayment: (item: ServiceItem) => void;
}

export const ServicesProductsPanel: React.FC<ServicesProductsPanelProps> = ({
  payments = [],
  onInitiatePayment,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'service' | 'product' | 'booking' | 'other' | 'calculator'>('all');
  const [showOnlyPurchased, setShowOnlyPurchased] = useState<boolean>(false);

  // Filter items based on selected category
  const filteredItems = PRESET_SERVICES_PRODUCTS.filter(item => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'calculator') return false;
    return item.category === activeCategory;
  });

  // Filter user's custom payments
  const userPurchasedPayments = payments.filter(p => p.itemType !== 'package');

  // Activate receipt details trigger
  const handleShowActivatedFeature = (payment: ManaGruhamPayment) => {
    let message = '';
    let title = '';
    
    if (payment.itemId === 'vastu-consult') {
      title = 'వాస్తు నిపుణుడి సంప్రదింపు సక్రియం (Vastu Service Activated)';
      message = `మా సీనియర్ వాస్తు నిపుణుడు "రామకృష్ణ శాస్త్రి" గారు మీతో ఫోన్‌లో మాట్లాడతారు.\n\n📞 ఫోన్ నంబర్: 9848033221\n📧 ఇమెయిల్: vastu.shastri@managruham.com\n\nదయచేసి మీ ఇంటి బ్లూప్రింట్ లేదా డైరెక్షన్ వివరాలు వాట్సాప్ నంబర్‌కు సెండ్ చేయండి. మీ కన్సల్టేషన్ త్వరలో ప్రారంభమవుతుంది!`;
    } else if (payment.itemId === 'legal-verify') {
      title = 'లీగల్ పత్రాల వెరిఫికేషన్ యాక్టివేట్ అయింది (Legal Help Active)';
      message = `మీ ప్రాపర్టీ లీగల్ వెరిఫికేషన్ ప్రారంభించబడింది!\n\nమా అడ్వకేట్ "శివ కుమార్ గారు" మిమ్మల్ని త్వరలో కాంటాక్ట్ అవుతారు.\n📞 నంబర్: 8977712332\n\nదయచేసి మీ ప్రాపర్టీ డాక్యుమెంట్లను సబ్మిట్ చేయడానికి docs@managruham.com కి మెయిల్ చేయండి.`;
    } else if (payment.itemId === 'wooden-nameplate') {
      title = 'ఆర్డర్ తయారీ ప్రారంభమైంది (Wooden Nameplate In-Production)';
      message = `ధన్యవాదాలు! మీ కస్టమైజ్డ్ టేకు నేమ్ ప్లేట్ ఆర్డర్ వెరిఫై చేయబడింది.\n\nమా క్రాఫ్ట్స్ టీమ్ మీ రిజిస్టర్డ్ ఫోన్ నంబర్ ద్వారా నేమ్ స్పెల్లింగ్ మరియు డిజైన్ ఖరారు చేయడానికి కాల్ చేస్తారు.\n🚚 డెలివరీ స్థితి: 5 రోజుల్లో మీ ఇంటికి చేరుతుంది (ట్రాకింగ్ ఐడీ త్వరలో SMS చేయబడుతుంది).`;
    } else if (payment.itemId === 'vip-cab-visit') {
      title = 'క్యాబ్ బుకింగ్ కన్ఫర్మ్ అయింది (VIP Site Cab Booked)';
      message = `కంగ్రాట్స్! మీ VIP సైట్ విజిట్ క్యాబ్ బుకింగ్ ధృవీకరించబడింది.\n\n📅 షెడ్యూల్ చేసిన తేదీ: వచ్చే శనివారం\n🚗 క్యాబ్ డ్రైవర్ వివరాలు మరియు సమయం ప్రయాణానికి 12 గంటల ముందు పంపబడుతుంది.\nగైడ్ నిపుణుడు కూడా క్యాబ్‌లో మీతో పాటు ఉండి ఆస్తులను చూపిస్తారు.`;
    } else if (payment.itemId === 'drone-photo-shoot') {
      title = 'డ్రోన్ ఫోటోషూట్ షెడ్యూల్ అయింది (Drone Shoot Active)';
      message = `డ్రోన్ మార్కెటింగ్ ప్యాకేజీ వెరిఫై చేయబడింది!\n\nమా మీడియా కోఆర్డినేటర్ "రాకేష్" గారు ప్రాపర్టీ వద్దకు రావడానికి సిద్ధంగా ఉన్నారు.\n📞 కాంటాక్ట్ నంబర్: 9494112343\n\nత్వరలోనే మీ ఇల్లు / ప్లాట్ యొక్క అద్భుతమైన ఏరియల్ దృశ్యాలు మరియు హై-రిజల్యూషన్ ఫోటోలు తీసి యాప్‌లో ప్రమోట్ చేస్తాము!`;
    } else {
      title = 'చెల్లింపు విజయవంతంగా సక్రియమైంది (Service / Order Confirmed)';
      message = `ధన్యవాదాలు!\n"${payment.paymentPurpose}" కోసం మీ UTR వెరిఫికేషన్ విజయవంతమైంది.\n\nత్వరలోనే మా ప్రతినిధి మీకు 📞 కాల్ చేసి సేవలను అందిస్తారు. ఏవైనా ప్రశ్నలు ఉంటే 8977776111 కి కాల్ చేయండి.`;
    }

    alert(`🌟 ${title} 🌟\n\n${message}`);
  };

  return (
    <div id="services-decoration-workspace" className="space-y-8">
      
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-amber-50 to-stone-50 border border-amber-200/40 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <span className="text-[10px] bg-amber-500 text-stone-950 font-black px-3 py-0.5 rounded-full uppercase tracking-wider inline-block">
            Mana Gruham Market
          </span>
          <h2 className="font-display font-extrabold text-stone-900 text-lg md:text-xl">
            గృహ సేవలు & అలంకరణ మార్కెట్ (Property Services & Decor Shop)
          </h2>
          <p className="text-stone-500 text-xs leading-relaxed">
            మీ నూతన ఇంటికి కావలసిన సాంప్రదాయ అలంకరణ వస్తువులు, వాస్తు సలహాలు, లీగల్ పత్రాల పరిశీలన, క్యాబ్ బుకింగ్స్ మరియు ఫోటోగ్రఫీ సేవలు ఇక్కడే బుక్ చేసుకోండి.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowOnlyPurchased(!showOnlyPurchased)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border ${
              showOnlyPurchased
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>నా బుకింగ్స్ ({userPurchasedPayments.length})</span>
          </button>
        </div>
      </div>

      {/* Conditional: Show My Purchased Bookings Panel */}
      {showOnlyPurchased && (
        <div className="bg-stone-50 border border-stone-200 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h3 className="font-display font-bold text-xs text-stone-800 uppercase tracking-wide flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-amber-500" />
              నా ఆర్డర్లు & సేవలు (My Orders & Registered Services)
            </h3>
            <span className="text-[10px] bg-stone-200 text-stone-600 font-bold px-2 py-0.5 rounded-full">
              {userPurchasedPayments.length} Items Total
            </span>
          </div>

          {userPurchasedPayments.length === 0 ? (
            <div className="text-center py-10 bg-white border border-stone-150 rounded-2xl">
              <ShoppingBag className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-xs text-stone-500 font-semibold">మీరు ఇంకా ఏ సేవలు లేదా అలంకరణ వస్తువులు బుక్ చేసుకోలేదు.</p>
              <p className="text-[10px] text-stone-400 mt-1">ఏదైనా సేవను ఎంచుకుని పేమెంట్ సబ్మిట్ చేసిన తర్వాత ఇక్కడ వాటి స్టేటస్ ట్రాక్ చేయవచ్చు.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userPurchasedPayments.map((p) => (
                <div key={p.id} className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col justify-between shadow-2xs space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between">
                      <span className="text-[9px] font-mono text-stone-400 font-semibold">TXN ID: {p.id.substring(0, 10)}</span>
                      <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${
                        p.status === 'Verified'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : p.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                      }`}>
                        {p.status === 'Verified' ? <CheckCircle2 className="w-2.5 h-2.5" /> : p.status === 'Rejected' ? <XCircle className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                        {p.status === 'Verified' ? 'Verified (సక్రియం)' : p.status === 'Rejected' ? 'Rejected' : 'Pending Verification'}
                      </span>
                    </div>

                    <h4 className="font-bold text-stone-800 text-xs truncate" title={p.paymentPurpose}>{p.paymentPurpose}</h4>
                    <div className="text-[10px] text-stone-500 font-medium space-y-0.5 font-mono">
                      <p>మొత్తం: <strong className="text-stone-800">₹{p.amount}</strong></p>
                      <p>తేదీ: {new Date(p.createdAt).toLocaleDateString('te-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <p>UTR No: {p.utr}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                    {p.status === 'Verified' ? (
                      <button
                        onClick={() => handleShowActivatedFeature(p)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>సేవను చూడండి (Access Unlocked Feature)</span>
                      </button>
                    ) : p.status === 'Rejected' ? (
                      <div className="p-2 bg-rose-50/50 rounded-lg border border-rose-100 text-[9px] text-rose-700 flex items-start gap-1 leading-normal w-full">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>మీ UTR తప్పుగా ఉన్నందున రిజెక్ట్ అయింది. దయచేసి కొత్తగా కరెక్ట్ UTRతో సబ్మిట్ చేయండి.</span>
                      </div>
                    ) : (
                      <div className="p-2 bg-amber-50/50 rounded-lg border border-amber-100 text-[9px] text-amber-800 flex items-center gap-1.5 w-full">
                        <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                        <span>అడ్మిన్ వెరిఫికేషన్ కోసం వేచి ఉంది...</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category Tab buttons */}
      <div className="flex flex-wrap border-b border-stone-200 gap-1 pb-px">
        <button
          onClick={() => { setActiveCategory('all'); setShowOnlyPurchased(false); }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 -mb-px transition-all cursor-pointer ${
            activeCategory === 'all' && !showOnlyPurchased
              ? 'border-amber-500 text-amber-700 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          అన్నీ (All Offers)
        </button>
        <button
          onClick={() => { setActiveCategory('service'); setShowOnlyPurchased(false); }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 -mb-px transition-all cursor-pointer ${
            activeCategory === 'service' && !showOnlyPurchased
              ? 'border-amber-500 text-amber-700 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          ఆస్తి సేవలు (Property Services)
        </button>
        <button
          onClick={() => { setActiveCategory('product'); setShowOnlyPurchased(false); }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 -mb-px transition-all cursor-pointer ${
            activeCategory === 'product' && !showOnlyPurchased
              ? 'border-amber-500 text-amber-700 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          అలంకరణ వస్తువులు (Decor Products)
        </button>
        <button
          onClick={() => { setActiveCategory('booking'); setShowOnlyPurchased(false); }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 -mb-px transition-all cursor-pointer ${
            activeCategory === 'booking' && !showOnlyPurchased
              ? 'border-amber-500 text-amber-700 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          బుకింగ్ చెల్లింపులు (Bookings)
        </button>
        <button
          onClick={() => { setActiveCategory('other'); setShowOnlyPurchased(false); }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 -mb-px transition-all cursor-pointer ${
            activeCategory === 'other' && !showOnlyPurchased
              ? 'border-amber-500 text-amber-700 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          ఇతర సేవలు (Other Services)
        </button>
        <button
          onClick={() => { setActiveCategory('calculator'); setShowOnlyPurchased(false); }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 -mb-px transition-all cursor-pointer ${
            activeCategory === 'calculator' && !showOnlyPurchased
              ? 'border-amber-500 text-amber-700 font-black'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          ఈఎంఐ క్యాలిక్యులేటర్ (Home Loan Calculator)
        </button>
      </div>

      {/* Grid of Available Services/Products or Calculator */}
      {activeCategory === 'calculator' && !showOnlyPurchased ? (
        <HomeLoanCalculator />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="bg-white border border-stone-200 rounded-3xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Thumbnail */}
              <div className="relative h-44 w-full">
                <img 
                  src={item.imageUrl} 
                  alt={item.nameEn} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3">
                  <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider text-white shadow-xs ${
                    item.category === 'service'
                      ? 'bg-blue-600'
                      : item.category === 'product'
                      ? 'bg-emerald-600'
                      : item.category === 'booking'
                      ? 'bg-amber-600 font-bold'
                      : 'bg-purple-600'
                  }`}>
                    {item.category === 'service' ? 'Service' : item.category === 'product' ? 'Product' : item.category === 'booking' ? 'Booking' : 'Legal'}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 bg-stone-900/80 backdrop-blur-xs text-white text-xs font-black px-3 py-1 rounded-xl font-mono">
                  ₹{item.price.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Content info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div>
                    <h4 className="font-display font-bold text-stone-900 text-sm md:text-base leading-snug">
                      {item.nameTe}
                    </h4>
                    <p className="text-[10px] text-stone-400 font-bold tracking-tight uppercase mt-0.5">{item.nameEn}</p>
                  </div>

                  <p className="text-xs text-stone-500 leading-relaxed">
                    {item.descriptionTe}
                  </p>
                  <p className="text-[10px] text-stone-400 italic">
                    {item.descriptionEn}
                  </p>

                  {/* Features Checklist */}
                  <div className="pt-2 space-y-1.5">
                    <span className="text-[9px] text-stone-400 font-extrabold uppercase block tracking-wide">
                      ముఖ్యమైన ఫీచర్లు (Highlights):
                    </span>
                    <div className="space-y-1">
                      {item.featuresTe.map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-stone-600">
                          <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => onInitiatePayment(item)}
                  className="w-full py-3 bg-stone-900 hover:bg-amber-500 hover:text-stone-950 text-white font-black text-xs rounded-xl transition-all cursor-pointer shadow-xs hover:shadow-md flex items-center justify-center gap-1"
                >
                  <span>చెల్లింపు చేసి బుక్ చేయండి (Buy / Book Now)</span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
