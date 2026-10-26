import React, { useState, useMemo } from 'react';
import { PropertyListing } from '../types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  TooltipProps 
} from 'recharts';
import { 
  TrendingUp, 
  ChevronDown, 
  ChevronUp, 
  Coins, 
  BarChart3, 
  Sparkles, 
  Info,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PriceAnalyticsProps {
  listings: PropertyListing[];
}

export const PriceAnalytics: React.FC<PriceAnalyticsProps> = ({ listings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'sale' | 'rent'>('sale');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  // Compute processed chart data dynamically from approved listings
  const { chartData, insights } = useMemo(() => {
    const approved = listings.filter((item) => item.isApproved === 'Yes');

    // Grouping by area
    const areaStats: Record<string, { 
      totalSale: number; 
      saleCount: number; 
      totalRent: number; 
      rentCount: number;
      city: string;
    }> = {};

    approved.forEach((item) => {
      const { area, city, price, status } = item;
      if (!areaStats[area]) {
        areaStats[area] = { totalSale: 0, saleCount: 0, totalRent: 0, rentCount: 0, city };
      }

      if (status === 'sale') {
        areaStats[area].totalSale += price;
        areaStats[area].saleCount += 1;
      } else {
        areaStats[area].totalRent += price;
        areaStats[area].rentCount += 1;
      }
    });

    const dataList = Object.entries(areaStats).map(([area, stats]) => {
      // average sale price in Lakhs (1 Lakh = 100,000)
      const avgSaleLakhs = stats.saleCount > 0 
        ? Number((stats.totalSale / stats.saleCount / 100000).toFixed(1)) 
        : 0;
      
      // average rental price in thousands (1K = 1,000)
      const avgRentK = stats.rentCount > 0 
        ? Number((stats.totalRent / stats.rentCount / 1000).toFixed(1)) 
        : 0;

      return {
        area,
        city: stats.city,
        avgSale: avgSaleLakhs,
        avgRent: avgRentK,
        saleCount: stats.saleCount,
        rentCount: stats.rentCount,
      };
    }).filter(d => d.saleCount > 0 || d.rentCount > 0);

    // Insights computations
    const saleList = dataList.filter(d => d.avgSale > 0).sort((a, b) => b.avgSale - a.avgSale);
    const rentList = dataList.filter(d => d.avgRent > 0).sort((a, b) => b.avgRent - a.avgRent);

    const highestSale = saleList.length > 0 ? saleList[0] : null;
    const lowestSale = saleList.length > 0 ? saleList[saleList.length - 1] : null;

    const highestRent = rentList.length > 0 ? rentList[0] : null;
    const lowestRent = rentList.length > 0 ? rentList[rentList.length - 1] : null;

    return {
      chartData: dataList,
      insights: {
        highestSale,
        lowestSale,
        highestRent,
        lowestRent,
      }
    };
  }, [listings]);

  // Determine current display data for chart
  const activeChartData = useMemo(() => {
    return chartData
      .map(item => ({
        area: `${item.area} (${item.city.substring(0, 3)})`,
        price: activeTab === 'sale' ? item.avgSale : item.avgRent,
        count: activeTab === 'sale' ? item.saleCount : item.rentCount,
        rawArea: item.area,
        rawCity: item.city
      }))
      .filter(item => item.price > 0)
      .sort((a, b) => b.price - a.price); // sort descending for neat look
  }, [chartData, activeTab]);

  // Custom tooltips for recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-stone-900/95 backdrop-blur-md border border-stone-800 text-stone-100 p-3 rounded-xl shadow-xl text-xs space-y-1.5">
          <p className="font-bold flex items-center gap-1 text-amber-400">
            <MapPin className="w-3.5 h-3.5" />
            <span>{data.rawArea} ({data.rawCity})</span>
          </p>
          <p className="font-semibold text-white">
            సగటు ధర: <span className="font-mono text-amber-300 font-bold">{payload[0].value}</span> {activeTab === 'sale' ? 'లక్షలు (Lakhs)' : 'వేలు (Thousands)'}
          </p>
          <p className="text-stone-400 text-[10px]">
            మొత్తం ఇళ్ళు/ప్లాట్లు: <span className="font-bold text-white">{data.count}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
      {/* Accordion Trigger Header */}
      <button
        id="toggle-analytics-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-stone-50/50 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-stone-900 text-sm md:text-base flex items-center gap-2">
              <span>ధరల విశ్లేషణ పటం (Property Price Trends)</span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md bg-amber-100 text-amber-800">
                <Sparkles className="w-2.5 h-2.5" /> AI Ready
              </span>
            </h3>
            <p className="text-xs text-stone-500">వివిధ ఏరియాల సగటు కొనుగోలు మరియు అద్దె ధరల ట్రెండ్స్ విశ్లేషణ.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-600 hidden md:inline-block">
            {isOpen ? 'వివరాలు దాచు (Close Map)' : 'విశ్లేషణ చూడండి (Analyze Prices)'}
          </span>
          <div className="p-1 rounded-full text-stone-400">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </button>

      {/* Accordion Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-stone-100"
          >
            <div className="p-5 md:p-6 space-y-6">
              {/* Toolbar Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-100">
                {/* Sale / Rent Switcher */}
                <div className="flex bg-stone-200/60 p-1 rounded-xl">
                  <button
                    id="analytics-sale-tab"
                    onClick={() => setActiveTab('sale')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'sale'
                        ? 'bg-white text-stone-900 shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                    <span>అమ్మకానికి (For Sale)</span>
                  </button>
                  <button
                    id="analytics-rent-tab"
                    onClick={() => setActiveTab('rent')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'rent'
                        ? 'bg-white text-stone-900 shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                    <span>అద్దెకు (For Rent)</span>
                  </button>
                </div>

                {/* Chart Type Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-stone-500">చార్ట్ రకం:</span>
                  <div className="flex bg-stone-200/60 p-0.5 rounded-lg">
                    <button
                      id="chart-type-bar"
                      onClick={() => setChartType('bar')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        chartType === 'bar' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                      }`}
                    >
                      బార్ చార్ట్
                    </button>
                    <button
                      id="chart-type-line"
                      onClick={() => setChartType('line')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        chartType === 'line' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                      }`}
                    >
                      లైన్ చార్ట్
                    </button>
                  </div>
                </div>
              </div>

              {/* Chart Stage Container */}
              {activeChartData.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center text-stone-400 border border-dashed border-stone-200 rounded-2xl space-y-2">
                  <Info className="w-8 h-8 text-stone-300" />
                  <p className="text-xs font-bold text-stone-500">వివరాలు లభించలేదు!</p>
                  <p className="text-[11px]">ఈ కేటగిరీలో చార్ట్ గీయడానికి సరిపోవు లిస్టింగ్స్ లేవు.</p>
                </div>
              ) : (
                <div className="h-72 w-full pr-4">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' ? (
                      <BarChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis 
                          dataKey="area" 
                          tick={{ fill: '#78716c', fontSize: 10, fontWeight: 'bold' }} 
                          axisLine={false} 
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fill: '#78716c', fontSize: 10, fontWeight: 'mono' }} 
                          axisLine={false} 
                          tickLine={false} 
                          unit={activeTab === 'sale' ? 'L' : 'K'}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(217, 119, 6, 0.04)' }} />
                        <Bar 
                          dataKey="price" 
                          fill={activeTab === 'sale' ? '#d97706' : '#2563eb'} 
                          radius={[6, 6, 0, 0]} 
                          maxBarSize={45}
                        />
                      </BarChart>
                    ) : (
                      <LineChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis 
                          dataKey="area" 
                          tick={{ fill: '#78716c', fontSize: 10, fontWeight: 'bold' }} 
                          axisLine={false} 
                          tickLine={false}
                        />
                        <YAxis 
                          tick={{ fill: '#78716c', fontSize: 10, fontWeight: 'mono' }} 
                          axisLine={false} 
                          tickLine={false} 
                          unit={activeTab === 'sale' ? 'L' : 'K'}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke={activeTab === 'sale' ? '#d97706' : '#2563eb'} 
                          strokeWidth={3} 
                          activeDot={{ r: 6 }} 
                          dot={{ r: 4, strokeWidth: 2 }}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}

              {/* Smart Insights summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sale Analytics Insights */}
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 space-y-3">
                  <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 border-b border-amber-100 pb-1.5">
                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                    <span>కొనుగోలు ధరల విశ్లేషణ (Purchase Insights)</span>
                  </h4>
                  <div className="space-y-2 text-[11px] md:text-xs">
                    {insights.highestSale ? (
                      <p className="text-stone-700 leading-relaxed">
                        📈 అత్యంత ఖరీదైన ప్రాంతం: <span className="font-bold text-stone-900">{insights.highestSale.area}</span>. ఇక్కడ సగటున ఇల్లు/ప్లాట్ కొనుగోలు ధర సుమారు <span className="font-bold text-amber-700 font-mono">₹{insights.highestSale.avgSale} లక్షలు</span> గా నమోదైంది.
                      </p>
                    ) : (
                      <p className="text-stone-400">విక్రయ ధరల ట్రెండ్స్ ఇంకా లభించలేదు.</p>
                    )}
                    {insights.lowestSale && insights.highestSale?.area !== insights.lowestSale?.area && (
                      <p className="text-stone-700 leading-relaxed">
                        📉 అందుబాటు ధరలో ఉన్న ప్రాంతం: <span className="font-bold text-stone-900">{insights.lowestSale.area}</span>. ఇక్కడ సగటు ధర సుమారు <span className="font-bold text-amber-700 font-mono">₹{insights.lowestSale.avgSale} లక్షలు</span> ఉంది.
                      </p>
                    )}
                  </div>
                </div>

                {/* Rent Analytics Insights */}
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 space-y-3">
                  <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5 border-b border-blue-100 pb-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                    <span>అద్దె ధరల విశ్లేషణ (Rental Insights)</span>
                  </h4>
                  <div className="space-y-2 text-[11px] md:text-xs">
                    {insights.highestRent ? (
                      <p className="text-stone-700 leading-relaxed">
                        📈 అత్యంత ఎక్కువ అద్దె ఉన్న ప్రాంతం: <span className="font-bold text-stone-900">{insights.highestRent.area}</span>. ఇక్కడ సగటు నెలకు అద్దె సుమారు <span className="font-bold text-blue-700 font-mono">₹{insights.highestRent.avgRent} వేలు</span> గా నమోదైంది.
                      </p>
                    ) : (
                      <p className="text-stone-400">అద్దె ధరల ట్రెండ్స్ ఇంకా లభించలేదు.</p>
                    )}
                    {insights.lowestRent && insights.highestRent?.area !== insights.lowestRent?.area && (
                      <p className="text-stone-700 leading-relaxed">
                        📉 తక్కువ బడ్జెట్ అద్దె ప్రాంతం: <span className="font-bold text-stone-900">{insights.lowestRent.area}</span>. ఇక్కడ సగటు నెలకు అద్దె సుమారు <span className="font-bold text-blue-700 font-mono">₹{insights.lowestRent.avgRent} వేలు</span> ఉంది.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Informative footer */}
              <p className="text-[10px] text-stone-400 text-center flex items-center justify-center gap-1">
                <Info className="w-3 h-3 text-stone-300" />
                <span>గమనిక: ఈ ధరలు అప్రూవ్ చేయబడిన రియల్ టైమ్ ఆక్టివ్ లిస్టింగ్స్ డేటా ఆధారంగా లెక్కించబడినవి.</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
