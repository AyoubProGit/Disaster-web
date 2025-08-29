import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Award,
  BarChart3,
  LineChart,
  RefreshCw
} from 'lucide-react';

interface CarbonHistoryEntry {
  timestamp: string;
  totalCO2: number;
  dataTransferCO2: number;
  serverCO2: number;
  pageLoadCO2: number;
  greenScore: number;
  totalSize: number;
  pageLoadTime: number;
  domNodes: number;
}

interface CarbonTrends {
  averageCO2: number;
  improvement: number;
  bestScore: number;
  worstScore: number;
  totalSessions: number;
  averageGreenScore: number;
}

const CarbonHistory: React.FC = () => {
  const [history, setHistory] = useState<CarbonHistoryEntry[]>([]);
  const [trends, setTrends] = useState<CarbonTrends>({
    averageCO2: 0,
    improvement: 0,
    bestScore: 0,
    worstScore: 100,
    totalSessions: 0,
    averageGreenScore: 0
  });
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(false);

  // Générer des données d'historique simulées (en production, cela viendrait d'une API)
  const generateMockHistory = (): CarbonHistoryEntry[] => {
    const entries: CarbonHistoryEntry[] = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Simuler une amélioration progressive
      const baseCO2 = 2.5 - (i * 0.05); // Amélioration de 0.05g par jour
      const randomVariation = (Math.random() - 0.5) * 0.3; // Variation aléatoire ±0.15g
      const totalCO2 = Math.max(0.5, baseCO2 + randomVariation);
      
      const greenScore = Math.max(20, Math.min(100, 100 - (totalCO2 * 25)));
      
      entries.push({
        timestamp: date.toISOString(),
        totalCO2,
        dataTransferCO2: totalCO2 * 0.7,
        serverCO2: totalCO2 * 0.2,
        pageLoadCO2: totalCO2 * 0.1,
        greenScore,
        totalSize: 1.5 + (Math.random() - 0.5) * 0.5, // MB
        pageLoadTime: 2000 + (Math.random() - 0.5) * 1000, // ms
        domNodes: 800 + (Math.random() - 0.5) * 200
      });
    }
    
    return entries;
  };

  // Calculer les tendances
  const calculateTrends = (entries: CarbonHistoryEntry[]): CarbonTrends => {
    if (entries.length === 0) return trends;

    const totalCO2Values = entries.map(e => e.totalCO2);
    const greenScores = entries.map(e => e.greenScore);
    
    const averageCO2 = totalCO2Values.reduce((a, b) => a + b, 0) / totalCO2Values.length;
    const averageGreenScore = greenScores.reduce((a, b) => a + b, 0) / greenScores.length;
    
    const firstCO2 = entries[0]?.totalCO2 || 0;
    const lastCO2 = entries[entries.length - 1]?.totalCO2 || 0;
    const improvement = firstCO2 > 0 ? ((firstCO2 - lastCO2) / firstCO2) * 100 : 0;
    
    return {
      averageCO2,
      improvement,
      bestScore: Math.max(...greenScores),
      worstScore: Math.min(...greenScores),
      totalSessions: entries.length,
      averageGreenScore
    };
  };

  // Filtrer l'historique par période
  const getFilteredHistory = (): CarbonHistoryEntry[] => {
    const now = new Date();
    const filterDate = new Date();
    
    switch (selectedPeriod) {
      case 'day':
        filterDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
    }
    
    return history.filter(entry => new Date(entry.timestamp) >= filterDate);
  };

  // Obtenir la couleur de tendance
  const getTrendColor = (value: number, isPositive: boolean = true) => {
    if (isPositive) {
      return value > 0 ? 'text-green-500' : value < 0 ? 'text-red-500' : 'text-gray-500';
    }
    return value < 0 ? 'text-green-500' : value > 0 ? 'text-red-500' : 'text-gray-500';
  };

  // Obtenir l'icône de tendance (fonction supprimée car non utilisée)
  // const getTrendIcon = (value: number, isPositive: boolean = true) => {
  //   if (isPositive) {
  //     return value > 0 ? <TrendingUp className="w-4 h-4" /> : value < 0 ? <TrendingDown className="w-4 h-4" /> : null;
  //   }
  //   return value < 0 ? <TrendingUp className="w-4 h-4" /> : value > 0 ? <TrendingDown className="w-4 h-4" /> : null;
  // };

  // Charger l'historique
  const loadHistory = async () => {
    setIsLoading(true);
    try {
      // En production, cela viendrait d'une API
      const mockHistory = generateMockHistory();
      setHistory(mockHistory);
      setTrends(calculateTrends(mockHistory));
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredHistory = getFilteredHistory();

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <div className="flex items-center gap-4 mb-6">
          <BarChart3 className="w-8 h-8 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Historique Carbone</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-white" />
          <span className="text-white ml-3">Chargement de l'historique...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <BarChart3 className="w-8 h-8 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Historique Carbone</h2>
        </div>
        <button
          onClick={loadHistory}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-white text-sm">Actualiser</span>
        </button>
      </div>

      {/* Sélecteur de période */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-white font-medium">Période:</span>
        <div className="flex bg-white/10 rounded-lg p-1">
          {(['day', 'week', 'month'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-500 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {period === 'day' ? '24h' : period === 'week' ? '7j' : '30j'}
            </button>
          ))}
        </div>
      </div>

      {/* Résumé des tendances */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">Moyenne CO2</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {trends.averageCO2.toFixed(3)} gCO2e
          </div>
          <div className="text-sm text-white/70">
            Sur {trends.totalSessions} sessions
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-white font-medium">Amélioration</span>
          </div>
          <div className={`text-2xl font-bold ${getTrendColor(trends.improvement)}`}>
            {trends.improvement > 0 ? '+' : ''}{trends.improvement.toFixed(1)}%
          </div>
          <div className="text-sm text-white/70">
            Depuis le début
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-medium">Meilleur Score</span>
          </div>
          <div className="text-2xl font-bold text-green-500">
            {trends.bestScore}/100
          </div>
          <div className="text-sm text-white/70">
            Score vert max
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <LineChart className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">Score Moyen</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {trends.averageGreenScore.toFixed(0)}/100
          </div>
          <div className="text-sm text-white/70">
            Moyenne générale
          </div>
        </div>
      </div>

      {/* Graphique de l'historique */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Évolution de l'empreinte carbone</h3>
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <div className="flex items-end justify-between h-32">
            {filteredHistory.slice(-10).map((entry, index) => {
              const maxCO2 = Math.max(...filteredHistory.map(e => e.totalCO2));
              const height = maxCO2 > 0 ? (entry.totalCO2 / maxCO2) * 100 : 0;
              const date = new Date(entry.timestamp);
              const isToday = new Date().toDateString() === date.toDateString();
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="relative">
                    <div
                      className="w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm transition-all duration-300 hover:from-blue-400 hover:to-blue-300"
                      style={{ height: `${height}%` }}
                    />
                    {isToday && (
                      <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="text-xs text-white/70 mt-2">
                    {date.getDate()}/{date.getMonth() + 1}
                  </div>
                  <div className="text-xs text-white/90 font-medium">
                    {entry.totalCO2.toFixed(2)}g
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Détails des sessions récentes */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Sessions récentes</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {filteredHistory.slice(-5).reverse().map((entry, index) => {
            const date = new Date(entry.timestamp);
            const isToday = new Date().toDateString() === date.toDateString();
            const isYesterday = new Date(Date.now() - 86400000).toDateString() === date.toDateString();
            
            let dateLabel = '';
            if (isToday) dateLabel = 'Aujourd\'hui';
            else if (isYesterday) dateLabel = 'Hier';
            else dateLabel = date.toLocaleDateString('fr-FR');
            
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-white font-medium">{dateLabel}</div>
                    <div className="text-sm text-white/70">
                      {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-white font-medium">{entry.totalCO2.toFixed(3)} gCO2e</div>
                    <div className="text-sm text-white/70">
                      {entry.totalSize.toFixed(2)} MB
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-medium ${entry.greenScore >= 80 ? 'text-green-400' : entry.greenScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {entry.greenScore}/100
                    </div>
                    <div className="text-sm text-white/70">Score</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Note informative */}
      <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
        <div className="text-blue-300 text-sm">
          <p className="font-medium mb-1">Suivi de l'impact environnemental</p>
          <p>L'historique permet de suivre l'évolution de l'empreinte carbone de votre application et d'identifier 
          les tendances d'optimisation. Une amélioration continue indique une approche éco-responsable efficace.</p>
        </div>
      </div>
    </div>
  );
};

export default CarbonHistory;
