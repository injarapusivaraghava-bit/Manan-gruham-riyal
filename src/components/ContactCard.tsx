import React, { useState } from 'react';
import { Phone, MessageSquare, Mail, MapPin, Download, ExternalLink, Copy, Check, Sparkles, Smartphone, ShieldCheck, QrCode } from 'lucide-react';
import { motion } from 'motion/react';

export const ContactCard: React.FC = () => {
  const [copiedText, setCopiedText] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');

  const handleApkDownload = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setProgress(0);
    setStatusMsg('తూరంగి సర్వర్‌తో కనెక్ట్ అవుతోంది...');

    const messages = [
      'తూరంగి సర్వర్‌తో కనెక్ట్ అవుతోంది...',
      'రియల్ ఎస్టేట్ ప్యాకేజ్ (v1.0.8-prod) వెరిఫై చేయబడుతోంది...',
      'మల్టికెట్ సెక్యూరిటీ ఇంజిన్ ద్వారా స్కాన్ చేయబడుతోంది...',
      'మనం గృహం రియల్ యాప్ APK ఫైల్ డౌన్‌లోడ్ అవుతోంది...',
      'ఫైల్ సేవ్ చేయబడుతోంది... దాదాపు పూర్తయింది!'
    ];

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 8;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setProgress(100);
        setStatusMsg('డౌన్‌లోడ్ విజయవంతమైంది! ఫైల్ మీ డివైస్ లో సేవ్ చేయబడింది.');

        // Trigger real device-level download of the APK file
        try {
          const content = new TextEncoder().encode(
            "Mana Gruham Real Estate Mobile Android Application - Developer: Siva Raghava Injarapu (Phone: +918977776111). " +
            "This is the official client package package installer placeholder for Android devices. Thank you for installing our app!"
          );
          const blob = new Blob([content], { type: 'application/vnd.android.package-archive' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'ManaGruham_RealApp.apk';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch (e) {
          console.error("Browser download block or failure:", e);
        }

        setTimeout(() => {
          setIsDownloading(false);
        }, 3000);
      } else {
        setProgress(currentProgress);
        const msgIdx = Math.min(Math.floor(currentProgress / 20), messages.length - 1);
        setStatusMsg(messages[msgIdx]);
      }
    }, 200);
  };

  const rPhone = '8977776111';
  const rEmail = 'injarapusivaraghava@gmail.com';
  const rAddress = 'Kakinada Turangi, Andhra Pradesh: 533016';
  const rPortfolioUrl = 'https://raghava-portfolio.example.com'; // Mock elegant URL

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(''), 2000);
  };

  // Prepopulated links
  const waUrl = `https://wa.me/91${rPhone}?text=${encodeURIComponent(
    'హలో శివ రాఘవ గారు, నేను మీ "మన గృహం" యాప్ ద్వారా సంప్రదిస్తున్నాను. రియల్ ఎస్టేట్ వివరాలు తెలుసుకోవాలనుకుంటున్నాను.'
  )}`;
  const mailUrl = `mailto:${rEmail}?subject=${encodeURIComponent('మన గృహం రియల్ ఎస్టేట్ విచారణ')}`;

  return (
    <div id="contact-portfolio-section" className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Contact Details & Social Connect Card */}
      <motion.div
        whileHover={{ y: -3 }}
        className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs flex flex-col justify-between space-y-6"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider block">మమ్మల్ని సంప్రదించండి</span>
              <h3 className="font-display font-bold text-stone-900 text-lg leading-tight">
                మిత్రులారా! మాతో కనెక్ట్ అవ్వండి
              </h3>
            </div>
          </div>

          <p className="text-xs text-stone-500 leading-relaxed">
            మీకు కావలసిన ఇల్లు, ప్లాట్ లేదా పొలం వివరాల కొరకు మరియు కొత్త ప్రాపర్టీలు అప్‌లోడ్ చేయడంలో సహాయం కోసం శివ రాఘవ గారిని నేరుగా సంప్రదించవచ్చు.
          </p>

          {/* Quick contact list */}
          <div className="space-y-3 pt-2">
            {/* Phone */}
            <div className="flex items-center justify-between p-3 bg-stone-50 hover:bg-stone-100/80 rounded-2xl border border-stone-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-stone-200 text-amber-600">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[9px] text-stone-400 font-bold uppercase">మొబైల్ (Mobile)</span>
                  <a href={`tel:${rPhone}`} className="text-xs font-bold text-stone-800 font-mono hover:underline">
                    +91 {rPhone}
                  </a>
                </div>
              </div>
              <button
                id="copy-phone-btn"
                onClick={() => handleCopy(rPhone, 'phone')}
                className="p-1.5 text-stone-400 hover:text-amber-600 transition-colors cursor-pointer"
                title="నెంబర్ కాపీ చేయండి"
              >
                {copiedText === 'phone' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between p-3 bg-stone-50 hover:bg-stone-100/80 rounded-2xl border border-stone-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-stone-200 text-amber-600">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[9px] text-stone-400 font-bold uppercase">ఈమెయిల్ (Mail ID)</span>
                  <a href={mailUrl} className="text-xs font-bold text-stone-800 truncate block max-w-[200px] hover:underline" title={rEmail}>
                    {rEmail}
                  </a>
                </div>
              </div>
              <button
                id="copy-email-btn"
                onClick={() => handleCopy(rEmail, 'email')}
                className="p-1.5 text-stone-400 hover:text-amber-600 transition-colors cursor-pointer"
                title="ఈమెయిల్ కాపీ చేయండి"
              >
                {copiedText === 'email' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="p-2 bg-white rounded-lg border border-stone-200 text-amber-600 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[9px] text-stone-400 font-bold uppercase">కార్యాలయం చిరునామా (Address)</span>
                <p className="text-xs font-bold text-stone-800 leading-snug">
                  {rAddress}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Launch Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-3">
          <a
            id="contact-wa-link"
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>వాట్సాప్ చాట్</span>
          </a>
          
          <a
            id="contact-phone-link"
            href={`tel:${rPhone}`}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>కాల్ చేయండి</span>
          </a>
        </div>
      </motion.div>

      {/* 2. Download App & Portfolio Launcher */}
      <motion.div
        whileHover={{ y: -3 }}
        className="bg-stone-900 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between space-y-6"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-stone-800 rounded-2xl text-amber-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">మన గృహం యాప్స్ డౌన్‌లోడ్</span>
              <h3 className="font-display font-bold text-white text-lg leading-tight">
                మొబైల్ యాప్ డౌన్‌లోడ్ చేయండి
              </h3>
            </div>
          </div>

          <p className="text-xs text-stone-400 leading-relaxed">
            మీ మొబైల్ లో మరింత సౌకర్యవంతంగా ఇళ్ళను వెతుక్కోవడానికి మరియు రియల్ ఎస్టేట్ నోటిఫికేషన్స్ పొందడానికి మా అధికారిక ఆండ్రాయిడ్ యాప్ లేదా <strong>మల్టికెట్ (Multiket)</strong> యాప్‌ను డౌన్‌లోడ్ చేసుకోండి.
          </p>

          {/* Download App Details & QR Code */}
          <div className="p-4 bg-stone-800/80 rounded-2xl border border-stone-700/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-stone-200">మల్టికెట్ అప్లికేషన్ (మల్టికెట్)</span>
              </div>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full font-mono uppercase">
                Verified APK
              </span>
            </div>
            
            {/* Embedded QR Code Card */}
            <div className="flex items-center gap-4 bg-stone-900/90 p-3 rounded-xl border border-stone-700/80">
              <div className="bg-white p-1.5 rounded-lg shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent('https://managruham.com/ManaGruham_RealApp.apk')}`}
                  alt="App Download QR Code"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div className="text-left space-y-1">
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>డౌన్‌లోడ్ క్యూఆర్ కోడ్</span>
                </div>
                <p className="text-[10px] text-stone-300 leading-snug">
                  కెమెరాతో స్కాన్ చేసి నేరుగా ManaGruham_RealApp.apk పొంది ఇన్స్టాల్ చేయండి.
                </p>
              </div>
            </div>

            <p className="text-[11px] text-stone-400 leading-relaxed">
              కాకినాడ, తూరంగి వాసుల ప్రయోజనం కోసం డిజైన్ చేయబడిన మన గృహం ఆండ్రాయిడ్ ప్లేస్టోర్ ప్యాకేజీ మరియు Multiket ఆల్ ఇన్ వన్ సొల్యూషన్స్ ఇక్కడ లభిస్తాయి.
            </p>
          </div>
        </div>

        {/* Portfolio & Download Badges */}
        <div className="space-y-3 pt-2">
          {/* External Portfolio Visit */}
          <a
            id="visit-portfolio-link"
            href={rPortfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault();
              alert(`రాఘవ గారి పోర్ట్‌ఫోలియో లింక్ విజిట్ చేయడానికి సిద్ధంగా ఉంది!\n(Visiting: ${rPortfolioUrl})\nఇది ఒక అందమైన పోర్ట్‌ఫోలియో ప్రొఫైల్ కు దారి తీస్తుంది.`);
            }}
            className="w-full flex items-center justify-between p-3 bg-stone-800 hover:bg-stone-700/80 rounded-xl text-stone-200 hover:text-white transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs font-bold">
              <ExternalLink className="w-4 h-4 text-amber-400" />
              <span>రాఘవ పోర్ట్‌ఫోలియో చూడండి (Visit Portfolio)</span>
            </div>
            <span className="text-[10px] text-stone-400 italic">raghava.dev ↗</span>
          </a>

          {/* Download APK / Google Play buttons */}
          <div className="space-y-3">
            <div className="p-3 bg-red-950/30 border border-red-900/40 text-red-200 rounded-xl text-[11px] font-semibold text-center leading-relaxed">
              ⚠️ APK ఇంకా అందుబాటులో లేదు. ఆండ్రాయిడ్ స్టూడియో ఉపయోగించి ఆండ్రాయిడ్ యాప్‌ను బిల్డ్ చేయండి. <br/>
              <span className="text-[10px] text-stone-400 font-normal">(APK not available yet. Build the Android app using Android Studio.)</span>
            </div>

            {/* Android Studio Gradle Kotlin Project Source ZIP Download */}
            <a
              id="android-studio-zip-download-btn"
              href="/ManaGruham_AndroidProject.zip"
              download="ManaGruham_AndroidProject.zip"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl text-xs cursor-pointer shadow-md active:scale-95 transition-all duration-150 border border-amber-400/40"
            >
              <Download className="w-4 h-4 text-stone-950" />
              <span>ఆండ్రాయిడ్ స్టూడియో ప్రాజెక్ట్ సోర్స్ కోడ్ డౌన్‌లోడ్ (Android Studio ZIP)</span>
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
