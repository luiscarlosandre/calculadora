
import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  Info, 
  ArrowRight, 
  Clock, 
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { 
  CalculationType, 
  PeriodType, 
  InterestRateType, 
  SimulationResult 
} from './types';
import { calculateCompoundInterest, formatCurrency } from './utils/math';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { GoogleGenAI } from "@google/genai";

const COLORS = ['#4b5563', '#991b1b']; // Invested (Gray), Interest (Red)

const App: React.FC = () => {
  const [calcType, setCalcType] = useState<CalculationType>(CalculationType.CONTRIBUTION);
  const [initialValue, setInitialValue] = useState<number>(0);
  const [monthlyContrib, setMonthlyContrib] = useState<number>(0);
  const [interestRate, setInterestRate] = useState<number>(0);
  const [rateType, setRateType] = useState<InterestRateType>(InterestRateType.ANNUAL);
  const [period, setPeriod] = useState<number>(0);
  const [periodUnit, setPeriodUnit] = useState<PeriodType>(PeriodType.YEARS);
  
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  const handleCalculate = () => {
    const res = calculateCompoundInterest(
      calcType,
      initialValue,
      monthlyContrib,
      interestRate,
      rateType === InterestRateType.ANNUAL,
      period,
      periodUnit === PeriodType.YEARS
    );
    setResult(res);
  };

  const handleReset = () => {
    // Reset inputs to zero as requested
    setCalcType(CalculationType.CONTRIBUTION);
    setInitialValue(0);
    setMonthlyContrib(0);
    setInterestRate(0);
    setRateType(InterestRateType.ANNUAL);
    setPeriod(0);
    setPeriodUnit(PeriodType.YEARS);
    
    // Reset results
    setResult(null);
    setAiInsight('');
  };

  const generateAiInsight = async () => {
    if (!result) return;
    setLoadingAi(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analise este cenário de investimento de juros compostos:
      Objetivo: R$ 1.000.000,00
      Valor Inicial: ${formatCurrency(initialValue)}
      Aporte Mensal Calculado/Sugerido: ${formatCurrency(result.monthlyContribution)}
      Taxa de Juros: ${interestRate}% ${rateType === InterestRateType.ANNUAL ? 'anual' : 'mensal'}
      Tempo Necessário: ${Math.floor(result.periodInMonths / 12)} anos e ${result.periodInMonths % 12} meses.
      Total Investido: ${formatCurrency(result.totalInvested)}
      Total Ganho em Juros: ${formatCurrency(result.totalInterest)}
      
      Dê 3 dicas práticas e motivadoras para esse investidor, sendo breve e profissional.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAiInsight(response.text || 'Não foi possível gerar insights no momento.');
    } catch (error) {
      console.error(error);
      setAiInsight('Houve um erro ao consultar o especialista digital.');
    } finally {
      setLoadingAi(false);
    }
  };

  const pieData = useMemo(() => {
    if (!result) return [];
    return [
      { name: 'Valor Investido', value: result.totalInvested },
      { name: 'Total em Juros', value: result.totalInterest }
    ];
  }, [result]);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-900 p-1.5 rounded-lg">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Investidor <span className="text-red-800">Elite</span>
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-red-800 transition-colors">Calculadoras</a>
            <a href="#" className="hover:text-red-800 transition-colors">Artigos</a>
            <a href="#" className="hover:text-red-800 transition-colors">Sobre</a>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Side */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-red-800" />
                Calculadora do Primeiro Milhão
              </h2>

              <div className="space-y-4">
                {/* Calc Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo de Cálculo</label>
                  <select 
                    value={calcType}
                    onChange={(e) => setCalcType(e.target.value as CalculationType)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-800 focus:border-transparent outline-none transition-all text-sm font-medium"
                  >
                    <option value={CalculationType.CONTRIBUTION}>Calcular aporte mensal necessário</option>
                    <option value={CalculationType.TIME}>Calcular prazo para R$ 1 milhão</option>
                  </select>
                </div>

                {/* Initial Value */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor Inicial</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                    <input 
                      type="number"
                      value={initialValue === 0 ? '' : initialValue}
                      onChange={(e) => setInitialValue(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-red-800 outline-none text-sm"
                      placeholder="0,00"
                    />
                  </div>
                </div>

                {/* Variable Field */}
                {calcType === CalculationType.TIME ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor Mensal</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                      <input 
                        type="number"
                        value={monthlyContrib === 0 ? '' : monthlyContrib}
                        onChange={(e) => setMonthlyContrib(Number(e.target.value))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-red-800 outline-none text-sm"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Período</label>
                    <div className="flex gap-2">
                      <input 
                        type="number"
                        value={period === 0 ? '' : period}
                        onChange={(e) => setPeriod(Number(e.target.value))}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-800 outline-none text-sm"
                        placeholder="0"
                      />
                      <select 
                        value={periodUnit}
                        onChange={(e) => setPeriodUnit(e.target.value as PeriodType)}
                        className="w-32 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-800 outline-none text-sm font-medium"
                      >
                        <option value={PeriodType.YEARS}>ano(s)</option>
                        <option value={PeriodType.MONTHS}>mês(es)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Interest Rate */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Taxa de Juros</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                      <input 
                        type="number"
                        step="0.1"
                        value={interestRate === 0 ? '' : interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 focus:ring-2 focus:ring-red-800 outline-none text-sm"
                        placeholder="0.0"
                      />
                    </div>
                    <select 
                      value={rateType}
                      onChange={(e) => setRateType(e.target.value as InterestRateType)}
                      className="w-32 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-red-800 outline-none text-sm font-medium"
                    >
                      <option value={InterestRateType.ANNUAL}>anual</option>
                      <option value={InterestRateType.MONTHLY}>mensal</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <button 
                    onClick={handleCalculate}
                    className="w-full bg-red-900 hover:bg-red-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md active:scale-95"
                  >
                    Calcular
                  </button>
                  <button 
                    onClick={handleReset}
                    className="w-full text-gray-500 hover:text-gray-700 font-medium text-sm py-2 px-6 border border-transparent hover:border-gray-200 rounded-xl transition-all"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Tips Box */}
            <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex gap-4">
              <div className="text-red-800 shrink-0">
                <Info className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-red-900 text-sm mb-1">Dica de Especialista</h3>
                <p className="text-xs text-red-800 leading-relaxed">
                  Uma taxa de 8% a 10% ao ano é considerada um parâmetro realista para investimentos diversificados de longo prazo no mercado brasileiro.
                </p>
              </div>
            </div>
          </div>

          {/* Results Side */}
          <div className="lg:col-span-8">
            {!result ? (
              <div className="bg-white h-full min-h-[400px] rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center p-8">
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                  <Calculator className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Pronto para simular?</h3>
                <p className="text-gray-500 max-w-xs text-sm leading-relaxed">
                  Preencha os campos ao lado e descubra o poder dos juros compostos em sua jornada financeira.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Big Result Card */}
                <div className="bg-blue-50 border border-blue-100 p-8 rounded-2xl text-center">
                  <h3 className="text-blue-900 font-bold text-lg mb-2">
                    {calcType === CalculationType.CONTRIBUTION ? 'Aporte necessário calculado!' : 'Você atingirá R$ 1 milhão!'}
                  </h3>
                  <div className="text-3xl font-black text-blue-900 mb-2">
                    {calcType === CalculationType.CONTRIBUTION 
                      ? formatCurrency(result.monthlyContribution)
                      : `${Math.floor(result.periodInMonths / 12)} anos e ${result.periodInMonths % 12} meses`}
                  </div>
                  <p className="text-blue-800 text-sm">
                    {calcType === CalculationType.CONTRIBUTION 
                      ? `Para atingir R$ 1 milhão em ${period} ${periodUnit === PeriodType.YEARS ? 'anos' : 'meses'}`
                      : `Este é o tempo necessário com aportes de ${formatCurrency(monthlyContrib)}`}
                  </p>
                </div>

                {/* Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-900 text-white p-6 rounded-2xl">
                    <p className="text-xs font-medium text-red-200 uppercase tracking-widest mb-1">Valor total final</p>
                    <p className="text-xl font-bold">{formatCurrency(result.totalFinal)}</p>
                  </div>
                  <div className="bg-white border border-gray-100 p-6 rounded-2xl">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">Valor total investido</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(result.totalInvested)}</p>
                  </div>
                  <div className="bg-white border border-gray-100 p-6 rounded-2xl">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">Total em juros</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(result.totalInterest)}</p>
                  </div>
                </div>

                {/* Composition & Small Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-red-800" />
                      Composição do Primeiro Milhão
                    </h3>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="h-48 w-48 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-4 flex-1">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                              <span className="text-xs font-medium text-gray-600">Valor Investido</span>
                            </div>
                            <span className="text-xs font-bold">{formatCurrency(result.totalInvested)}</span>
                          </div>
                          <p className="text-[10px] text-gray-400">Total do dinheiro que saiu do seu bolso</p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-800"></div>
                              <span className="text-xs font-medium text-red-800">Total em Juros</span>
                            </div>
                            <span className="text-xs font-bold text-red-900">{formatCurrency(result.totalInterest)}</span>
                          </div>
                          <p className="text-[10px] text-red-400">Riqueza gerada pelos juros compostos</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-5 flex flex-col gap-4">
                    <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex-1 flex flex-col justify-center text-center">
                      <p className="text-xs font-bold text-green-700 uppercase mb-2">Poder dos Juros</p>
                      <div className="text-3xl font-black text-green-800">
                        {Math.round((result.totalInterest / result.totalInvested) * 100)}%
                      </div>
                      <p className="text-[10px] text-green-600 mt-1">Mais em rendimentos do que o investido</p>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex-1 flex flex-col justify-center text-center">
                      <p className="text-xs font-bold text-blue-700 uppercase mb-2">Tempo para a Meta</p>
                      <div className="text-2xl font-black text-blue-800">
                        {Math.floor(result.periodInMonths / 12)} anos
                      </div>
                      <p className="text-[10px] text-blue-600 mt-1">Estimativa de acumulação</p>
                    </div>
                  </div>
                </div>

                {/* AI Insight Section */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100">
                   <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        Análise de IA Especialista
                      </h3>
                      {!aiInsight && !loadingAi && (
                        <button 
                          onClick={generateAiInsight}
                          className="text-xs font-bold text-red-900 hover:text-red-800 flex items-center gap-1"
                        >
                          Gerar Insight <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                   </div>
                   
                   {loadingAi && (
                     <div className="animate-pulse space-y-2">
                       <div className="h-3 bg-gray-100 rounded w-full"></div>
                       <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                       <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                     </div>
                   )}

                   {aiInsight && (
                     <div className="text-sm text-gray-700 leading-relaxed italic bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                       {aiInsight.split('\n').map((line, i) => (
                         <p key={i} className="mb-2 last:mb-0">{line}</p>
                       ))}
                     </div>
                   )}
                </div>

                {/* Evolution Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-800" />
                    Evolução no Tempo
                  </h3>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={result.annualHistory}>
                        <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#991b1b" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#991b1b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis 
                          dataKey="year" 
                          label={{ value: 'Anos', position: 'insideBottom', offset: -5 }} 
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis 
                          tickFormatter={(val) => `R$ ${val / 1000}k`} 
                          tick={{ fontSize: 10 }}
                        />
                        <Tooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          labelFormatter={(label) => `Ano ${label}`}
                        />
                        <Legend iconType="circle" />
                        <Area 
                          name="Total Acumulado"
                          type="monotone" 
                          dataKey="totalAccumulated" 
                          stroke="#991b1b" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorTotal)" 
                        />
                        <Area 
                          name="Total Investido"
                          type="monotone" 
                          dataKey="totalInvested" 
                          stroke="#4b5563" 
                          strokeWidth={2}
                          fill="#4b5563" 
                          fillOpacity={0.05}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Data Table */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 overflow-hidden">
                  <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-red-800" />
                    Detalhamento Anual
                  </h3>
                  <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-white z-10">
                        <tr className="border-b border-gray-100">
                          <th className="py-3 px-4 text-[10px] font-bold text-gray-500 uppercase">Ano</th>
                          <th className="py-3 px-4 text-[10px] font-bold text-gray-500 uppercase">Investido no Ano</th>
                          <th className="py-3 px-4 text-[10px] font-bold text-gray-500 uppercase">Juros no Ano</th>
                          <th className="py-3 px-4 text-[10px] font-bold text-gray-500 uppercase">Total Acumulado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {result.annualHistory.map((row) => (
                          <tr key={row.year} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 text-xs font-bold text-gray-900">{row.year}</td>
                            <td className="py-3 px-4 text-xs text-gray-600">{formatCurrency(row.annualInvestment)}</td>
                            <td className="py-3 px-4 text-xs text-green-600 font-medium">{formatCurrency(row.annualInterest)}</td>
                            <td className="py-3 px-4 text-xs font-bold text-red-900">{formatCurrency(row.totalAccumulated)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Disclaimers */}
                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 space-y-2">
                   <h4 className="text-xs font-bold text-amber-900 flex items-center gap-2">
                     <AlertTriangle className="w-3.5 h-3.5" />
                     Informações Importantes:
                   </h4>
                   <ul className="text-[10px] text-amber-800 space-y-1 list-disc pl-4 leading-relaxed">
                     <li>Este cálculo é apenas uma simulação baseada em taxas fixas. Rendimentos reais variam conforme o mercado.</li>
                     <li>A simulação não deduz Imposto de Renda ou taxas de administração de corretoras.</li>
                     <li>Inflação: o valor de R$ 1 milhão no futuro terá um poder de compra diferente do atual. Considere simular com taxas reais (rendimento acima da inflação).</li>
                   </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informational Section */}
        <section className="mt-16 bg-white rounded-3xl p-8 lg:p-12 border border-gray-100 shadow-sm">
          <div className="max-w-3xl mx-auto space-y-12">
            
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Entenda a Jornada para o <span className="text-red-800">Milhão</span></h2>
              <p className="text-gray-500 text-lg leading-relaxed">
                Nossa ferramenta foi desenhada para tirar a dúvida da sua cabeça e colocar números nos seus sonhos. Planeje sua independência financeira com precisão.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="bg-red-50 w-12 h-12 rounded-2xl flex items-center justify-center text-red-800">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Como usar o simulador</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex gap-3">
                    <span className="bg-red-100 text-red-800 text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span><strong>Escolha sua meta:</strong> Você quer saber <em>quando</em> chega lá ou <em>quanto</em> precisa guardar por mês?</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-red-100 text-red-800 text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span><strong>Seja honesto com o inicial:</strong> Informe quanto você já tem investido hoje para ver o impacto dos aportes extras.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-red-100 text-red-800 text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span><strong>Taxas realistas:</strong> Se não tiver certeza, use 8% ao ano como uma média conservadora de uma carteira diversificada.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-800">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">As duas modalidades</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 mb-1">Calcular Prazo</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">Ideal se você já tem um orçamento fechado e quer saber quando a independência financeira chega. Ajuda a comparar o quanto um pequeno aumento no aporte acelera sua meta.</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 mb-1">Calcular Aporte</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">Ideal se você tem uma data de aposentadoria ou objetivo fixa (ex: 20 anos). Descubra quanto do seu salário deve ser destinado a este sonho.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">A Ciência por trás: Juros Compostos</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                Utilizamos a fórmula universal dos juros compostos calculada mês a mês para garantir a maior precisão possível no reinvestimento dos dividendos e rendimentos:
              </p>
              <div className="bg-gray-50 p-6 rounded-2xl font-mono text-center text-sm text-gray-700">
                M = P(1 + i)ⁿ + PMT [((1 + i)ⁿ - 1) / i]
              </div>
              <p className="text-[10px] text-gray-400 mt-4 text-center italic uppercase tracking-wider">
                Investimento Inteligente • Liberdade Financeira • Patrimônio Sólido
              </p>
            </div>

          </div>
        </section>
      </main>

      <footer className="mt-24 border-t border-gray-200 pt-12 text-center text-gray-400 text-xs">
        <p>&copy; {new Date().getFullYear()} Investidor Elite. Todos os direitos reservados.</p>
        <p className="mt-2">Educação financeira é o melhor investimento.</p>
      </footer>
    </div>
  );
};

export default App;
