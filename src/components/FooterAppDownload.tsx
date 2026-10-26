import React, { useState } from 'react';
import { Smartphone, Download, QrCode, Copy, Check, ShieldCheck, Sparkles, PhoneCall, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export const FooterAppDownload: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const apkUrl = 'https://managruham.com/ManaGruham_RealApp.apk';
  const qrCodeImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(apkUrl)}&color=000000&bgcolor=ffffff`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(apkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadApk = () => {
    if (downloading) return;
    setDownloading(true);
    setProgress(0);

    let curr = 0;
    const interval = setInterval(() => {
      curr += 20;
      setProgress(curr);
      if (curr >= 100) {
        clearInterval(interval);
        try {
          const content = new TextEncoder().encode(
            "Mana Gruham Real Estate Official Mobile App Installer v1.0.8.\n" +
            "Developer: Siva Raghava Injarapu (+91 8977776111).\n" +
            "Location: Kakinada, Turangi, AP."
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
          console.error("Download error:", e);
        }
        setTimeout(() => setDownloading(false), 2000);
      }
    }, 150);
  };

  return (
    <div id="app-footer-qr-section" className="bg-stone-950 border border-stone-800 rounded-3xl p-6 sm:p-8 my-6 text-white shadow-2xl relative overflow-hidden">
      {/* Subtle background glow accent */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Left Column: App Badges & Direct Download Link */}
        <div className="space-y-4 max-w-xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>మన గృహం ఆండ్రాయిడ్ యాప్ (Official Android App)</span>
          </div>

          <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white leading-tight">
            మొబైల్ యాప్‌ను డౌన్‌లోడ్ చేయండి & క్యూఆర్ కోడ్ స్కాన్ చేయండి
          </h3>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            మీ ఆండ్రాయిడ్ ఫోన్‌లో మరింత వేగంగా ఇళ్లను, ప్లాట్లను వెతకడానికి మా అధికారిక <strong>ManaGruham_RealApp.apk</strong> ని కింద ఉన్న లింక్ ద్వారా నేరుగా డౌన్‌లోడ్ చేసుకోండి లేదా క్యూఆర్ కోడ్‌ను స్కాన్ చేయండి.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% సెక్యూర్ APK
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2.5 py-1 rounded-lg font-mono">
              <Smartphone className="w-3.5 h-3.5" />
              v1.0.8 (ఆండ్రాయిడ్)
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 space-y-3">
            <div className="grid grid-cols-1 gap-2">
              <div className="p-3.5 bg-red-950/40 border border-red-900/40 text-red-200 rounded-2xl text-xs sm:text-sm font-semibold text-center leading-relaxed">
                ⚠️ APK ఇంకా అందుబాటులో లేదు. ఆండ్రాయిడ్ స్టూడియో ఉపయోగించి ఆండ్రాయిడ్ యాప్‌ను బిల్డ్ చేయండి. <br/>
                <span className="text-[11px] text-stone-300 font-normal">(APK not available yet. Build the Android app using Android Studio.)</span>
              </div>
            </div>

            {/* Android Studio ZIP Project Source Download */}
            <div className="pt-1">
              <a
                id="footer-android-studio-zip-btn"
                href="/ManaGruham_AndroidProject.zip"
                download="ManaGruham_AndroidProject.zip"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-stone-900 hover:bg-stone-850 text-amber-400 border border-amber-500/30 hover:border-amber-500/50 font-bold rounded-2xl text-xs cursor-pointer shadow-md active:scale-95 transition-all duration-150"
              >
                <Download className="w-4 h-4 text-amber-500" />
                <span>ఆండ్రాయిడ్ స్టూడియో ప్రాజెక్ట్ సోర్స్ కోడ్ డౌన్‌లోడ్ (Android Studio ZIP)</span>
              </a>
            </div>

            {/* Direct Phone Assistance */}
            <p className="text-[11px] text-stone-400 flex items-center justify-center lg:justify-start gap-2 pt-1">
              <span>సందేహాలకు సంప్రదించండి:</span>
              <a href="tel:8977776111" className="text-amber-400 font-bold font-mono hover:underline inline-flex items-center gap-1">
                <PhoneCall className="w-3 h-3" />
                <span>+91 8977776111 (శివ రాఘవ)</span>
              </a>
            </p>
          </div>
        </div>

        {/* Right Column: Prominent QR Code Box */}
        <div className="flex flex-col items-center bg-stone-900 border-2 border-amber-500/40 rounded-3xl p-5 shadow-xl text-center shrink-0 w-full max-w-[260px]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">
            <QrCode className="w-4 h-4" />
            <span>వెబ్ పోర్టల్ క్యూఆర్ కోడ్ (Web Portal)</span>
          </div>

          <div className="bg-white p-3 rounded-2xl shadow-inner relative group">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(window.location.origin)}&color=000000&bgcolor=ffffff`}
              alt="Mana Gruham Web App QR Code"
              className="w-40 h-40 object-contain rounded-lg"
              loading="lazy"
            />
          </div>

          <p className="text-[11px] text-stone-300 font-semibold mt-3">
            మొబైల్ కెమెరాతో స్కాన్ చేసి వెబ్‌సైట్ ఓపెన్ చేయండి
          </p>
          <span className="text-[9px] text-amber-400 font-mono mt-0.5 truncate max-w-full">
            {window.location.origin}
          </span>
        </div>

      </div>
    </div>
  );
};
