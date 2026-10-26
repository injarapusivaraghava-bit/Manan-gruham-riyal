import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  HelpCircle, 
  TrendingUp, 
  Sparkles, 
  Coins, 
  Calendar,
  Percent,
  CheckCircle2
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export const HomeLoanCalculator: React.FC = () => {
  // States for user input
  const [loanAmount, setLoanAmount] = useState<number>(5000000); // 50 Lakhs default
  const [interestRate, setInterestRate] = useState<number>(8.5); // 8.5% default
  const [tenureYears, setTenureYears] = useState<number>(20); // 20 years default

  // EMI calculations
  const emiDetails = useMemo(() => {
    const P = loanAmount;
    const r = interestRate / 12 / 100;
    const n = tenureYears * 12;

    let emi = 0;
    if (interestRate === 0) {
      emi = P / n;
    } else {
      emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    // Generate year-wise amortization for bar chart
    const yearlyAmortization = [];
    let remainingPrincipal = P;
    
    for (let year = 1; year <= tenureYears; year++) {
      let principalPaidThisYear = 0;
      let interestPaidThisYear = 0;

      for (let month = 1; month <= 12; month++) {
        const interestForMonth = remainingPrincipal * r;
        const principalForMonth = emi - interestForMonth;
        
        if (remainingPrincipal > 0) {
          interestPaidThisYear += interestForMonth;
          principalPaidThisYear += Math.min(principalForMonth, remainingPrincipal);
          remainingPrincipal -= principalForMonth;
          if (remainingPrincipal < 0) remainingPrincipal = 0;
        }
      }

      yearlyAmortization.push({
        year: `Year ${year}`,
        'Principal (అసలు)': Math.round(principalPaidThisYear),
        'Interest (వడ్డీ)': Math.round(interestPaidThisYear),
      });
    }

    return {
      monthlyEmi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      yearlyData: yearlyAmortization
    };
  }, [loanAmount, interestRate, tenureYears]);

  // Data for Pie Chart
  const pieData = [
    { name: 'అసలు మొత్తం (Principal)', value: loanAmount, color: '#f59e0b' }, // Amber-500
    { name: 'మొత్తం వడ్డీ (Total Interest)', value: emiDetails.totalInterest, color: '#78716c' }, // Stone-500
  ];

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 space-y-8 shadow-xs">
      
      {/* Header Info */}
      <div className="flex items-start gap-4 pb-6 border-b border-stone-100">
        <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl shrink-0">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-display font-black text-stone-900 text-lg md:text-xl flex items-center gap-2">
            హోమ్ లోన్ ఈఎంఐ క్యాలిక్యులేటర్ (Home Loan EMI Calculator)
          </h3>
          <p className="text-stone-500 text-xs mt-1 leading-relaxed">
            మీ డ్రీమ్ హోమ్ బడ్జెట్ ప్లాన్ చేసుకోవడానికి కావలసిన లోన్ మొత్తం, వడ్డీ రేటు, మరియు కాలపరిమితిని సులభంగా లెక్కించుకోండి.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Controls / Inputs */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Input 1: Loan Amount */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-600" />
                లోన్ మొత్తం (Loan Amount)
              </label>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-stone-400 font-bold font-mono">₹</span>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Math.max(100000, Number(e.target.value)))}
                  className="w-28 px-2 py-1 text-xs font-mono font-bold text-right border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
            <input
              type="range"
              min="100000"
              max="20000000"
              step="50000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-bold font-mono">
              <span>₹1 L</span>
              <span>₹50 L</span>
              <span>₹1 Cr</span>
              <span>₹2 Cr</span>
            </div>
          </div>

          {/* Input 2: Interest Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-amber-600" />
                వడ్డీ రేటు (Interest Rate % p.a.)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Math.max(0.1, Number(e.target.value)))}
                  className="w-20 px-2 py-1 text-xs font-mono font-bold text-right border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-stone-400 font-bold">%</span>
              </div>
            </div>
            <input
              type="range"
              min="5"
              max="20"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-bold font-mono">
              <span>5%</span>
              <span>10%</span>
              <span>15%</span>
              <span>20%</span>
            </div>
          </div>

          {/* Input 3: Tenure Years */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-600" />
                కాలపరిమితి (Tenure - Years)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Math.max(1, Math.min(30, Number(e.target.value))))}
                  className="w-16 px-2 py-1 text-xs font-mono font-bold text-right border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-stone-400 font-bold">Yrs</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-bold font-mono">
              <span>1 Yr</span>
              <span>10 Yrs</span>
              <span>20 Yrs</span>
              <span>30 Yrs</span>
            </div>
          </div>

          {/* Summary Dashboard cards */}
          <div className="bg-stone-50 border border-stone-150 rounded-2xl p-4 space-y-4">
            <div className="text-center p-3.5 bg-amber-50 border border-amber-200/50 rounded-xl">
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-800">నెలవారీ ఈఎంఐ (Monthly EMI)</span>
              <p className="text-2xl font-black font-mono text-amber-600 mt-1">{formatCurrency(emiDetails.monthlyEmi)}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white border border-stone-150 p-3 rounded-xl">
                <span className="text-[9px] text-stone-400 font-bold block uppercase">అసలు మొత్తం (Principal)</span>
                <span className="text-xs font-black font-mono text-stone-700 mt-0.5 block">{formatCurrency(loanAmount)}</span>
              </div>
              <div className="bg-white border border-stone-150 p-3 rounded-xl">
                <span className="text-[9px] text-stone-400 font-bold block uppercase">మొత్తం వడ్డీ (Total Interest)</span>
                <span className="text-xs font-black font-mono text-stone-700 mt-0.5 block">{formatCurrency(emiDetails.totalInterest)}</span>
              </div>
            </div>

            <div className="border-t border-stone-200/60 pt-3 flex justify-between items-center px-1">
              <span className="text-[10px] font-bold text-stone-500">మొత్తం చెల్లింపు (Total Amount Payable)</span>
              <span className="text-xs font-black font-mono text-stone-800">{formatCurrency(emiDetails.totalPayment)}</span>
            </div>
          </div>

        </div>

        {/* Right column: Charts & Visualizations */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
          
          {/* Charts Toggle Header */}
          <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-4 space-y-6">
            <h4 className="font-bold text-xs text-stone-800 uppercase tracking-wide flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              విజువలైజేషన్ గ్రాఫ్స్ (EMI Breakup & Amortization Schedule)
            </h4>

            {/* Twin charts layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Pie Chart: 5 cols */}
              <div className="md:col-span-5 h-48 relative flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-[9px] text-stone-400 font-extrabold uppercase">Interest</span>
                  <span className="text-xs font-black font-mono text-stone-700">
                    {Math.round((emiDetails.totalInterest / emiDetails.totalPayment) * 100)}%
                  </span>
                </div>
              </div>

              {/* Legends list: 7 cols */}
              <div className="md:col-span-7 space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-3 h-3 rounded-sm bg-amber-500 shrink-0 mt-1"></div>
                  <div>
                    <p className="text-[11px] font-extrabold text-stone-700 leading-none">అసలు మొత్తం (Principal Amount)</p>
                    <p className="text-[10px] text-stone-400 mt-1">ఇది మీరు బ్యాంక్ నుండి తీసుకునే అసలు లోన్ మొత్తం.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-3 h-3 rounded-sm bg-stone-500 shrink-0 mt-1"></div>
                  <div>
                    <p className="text-[11px] font-extrabold text-stone-700 leading-none">మొత్తం వడ్డీ (Total Interest Payable)</p>
                    <p className="text-[10px] text-stone-400 mt-1">కాలపరిమితి ముగిసేసరికి బ్యాంక్ లోన్ కొరకు మీరు కట్టే వడ్డీ.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Amortization schedule bar chart */}
          <div className="bg-stone-50 border border-stone-200/60 rounded-2xl p-4 space-y-4">
            <span className="text-[10px] text-stone-500 font-extrabold uppercase tracking-wider block">
              సంవత్సరాల వారీ అసలు & వడ్డీ చెల్లింపులు (Yearly Payment Trend)
            </span>
            <div className="h-56 w-full text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={emiDetails.yearlyData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="year" stroke="#888888" fontSize={9} />
                  <YAxis stroke="#888888" fontSize={9} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend fontSize={10} verticalAlign="top" height={24} />
                  <Bar dataKey="Principal (అసలు)" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="Interest (వడ్డీ)" stackId="a" fill="#78716c" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

      {/* Advisory message */}
      <div className="p-4 bg-amber-50/40 border border-amber-200/30 rounded-2xl flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-[11px] text-stone-600 leading-relaxed">
          <strong>మనం గృహం సలహా (Mana Gruham Expert Tip):</strong> సాధారణంగా బ్యాంకులు నెలవారీ ఆదాయంలో 40-50% లోపు EMI ఉండేలా లోన్ ఇవ్వడానికి మొగ్గు చూపుతాయి. మీ గృహ కలలను నిజం చేసుకోవడానికి లీగల్ మరియు వాస్తు చెక్ సేవలను మన సర్వీసెస్ విభాగాన్ని ఉపయోగించి పొందగలరు.
        </div>
      </div>

    </div>
  );
};
