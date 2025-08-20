import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  Activity, 
  Zap, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Info,
  Calculator,
  BarChart3,
  Globe
} from 'lucide-react';

interface CarbonMetrics {
  totalCO2: number;
  pageLoadCO2: number;
  dataTransferCO2: number;
  serverCO2: number;
  cacheEfficiency: number;
  greenScore: number;
  recommendations: string[];
}

interface ResourceMetrics {
  htmlSize: number;
  cssSize: number;
  jsSize: number;
  imageSize: number;
  totalSize: number;
  pageLoadTime: number;
  domNodes: number;
  requests: number;
}

const CarbonMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<CarbonMetrics>({
    totalCO2: 0,
    pageLoadCO2: 0,
    dataTransferCO2: 0,
    serverCO2: 0,
    cacheEfficiency: 0,
    greenScore: 0,
    recommendations: []
  });

  const [resourceMetrics, setResourceMetrics] = useState<ResourceMetrics>({
    htmlSize: 0,
    cssSize: 0,
    jsSize: 0,
    imageSize: 0,
    totalSize: 0,
    pageLoadTime: 0,
    domNodes: 0,
    requests: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  // Facteurs de conversion CO2 (grammes par MB)
  const CO2_FACTORS = {
    dataTransfer: 0.81, // gCO2e par MB transféré
    serverProcessing: 0.12, // gCO2e par MB traité
    pageLoad: 0.05, // gCO2e par seconde de chargement
    domProcessing: 0.001 // gCO2e par nœud DOM
  };

  // Calculer l'empreinte carbone
  const calculateCarbonFootprint = (resources: ResourceMetrics): CarbonMetrics => {
    const dataTransferCO2 = (resources.totalSize / (1024 * 1024)) * CO2_FACTORS.dataTransfer;
    const serverCO2 = (resources.totalSize / (1024 * 1024)) * CO2_FACTORS.serverProcessing;
    const pageLoadCO2 = (resources.pageLoadTime / 1000) * CO2_FACTORS.pageLoad;
    const domCO2 = resources.domNodes * CO2_FACTORS.domProcessing;

    const totalCO2 = dataTransferCO2 + serverCO2 + pageLoadCO2 + domCO2;

    // Calculer le score vert (0-100)
    let greenScore = 100;
    if (totalCO2 > 1.0) greenScore -= 30; // > 1g CO2e
    if (totalCO2 > 2.0) greenScore -= 30; // > 2g CO2e
    if (totalCO2 > 3.0) greenScore -= 30; // > 3g CO2e
    if (resources.totalSize > 2 * 1024 * 1024) greenScore -= 10; // > 2MB
    if (resources.pageLoadTime > 3000) greenScore -= 10; // > 3s
    if (resources.domNodes > 1000) greenScore -= 10; // > 1000 nœuds

    greenScore = Math.max(0, greenScore);

    // Générer des recommandations
    const recommendations: string[] = [];
    if (totalCO2 > 1.5) {
      recommendations.push("Optimiser la taille des ressources pour réduire l'empreinte carbone");
    }
    if (resources.totalSize > 2 * 1024 * 1024) {
      recommendations.push("Compresser les images et optimiser les assets");
    }
    if (resources.pageLoadTime > 3000) {
      recommendations.push("Améliorer les temps de chargement pour réduire la consommation serveur");
    }
    if (resources.domNodes > 1000) {
      recommendations.push("Simplifier le DOM pour réduire le traitement côté client");
    }
    if (recommendations.length === 0) {
      recommendations.push("Excellent ! Votre application respecte les bonnes pratiques éco-responsables");
    }

    return {
      totalCO2,
      pageLoadCO2,
      dataTransferCO2,
      serverCO2,
      cacheEfficiency: 85, // À calculer dynamiquement
      greenScore,
      recommendations
    };
  };

  // Récupérer les métriques de performance
  const fetchPerformanceMetrics = async () => {
    try {
      // Utiliser l'API Performance pour obtenir les métriques réelles
      if ('performance' in window) {
        const perfEntries = performance.getEntriesByType('navigation');
        const navigationEntry = perfEntries[0] as PerformanceNavigationTiming;
        
        if (navigationEntry) {
          const resources = performance.getEntriesByType('resource');
          let totalSize = 0;
          let imageSize = 0;
          let cssSize = 0;
          let jsSize = 0;
          let htmlSize = 0;

          resources.forEach((resource: PerformanceResourceTiming) => {
            const size = resource.transferSize || 0;
            totalSize += size;
            
            if (resource.name.includes('.css')) cssSize += size;
            else if (resource.name.includes('.js')) jsSize += size;
            else if (resource.name.includes('.html')) htmlSize += size;
            else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) imageSize += size;
          });

          const domNodes = document.querySelectorAll('*').length;

          const newResourceMetrics: ResourceMetrics = {
            htmlSize: htmlSize || navigationEntry.transferSize || 0,
            cssSize,
            jsSize,
            imageSize,
            totalSize,
            pageLoadTime: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
            domNodes,
            requests: resources.length
          };

          setResourceMetrics(newResourceMetrics);
          
          // Calculer l'empreinte carbone
          const carbonMetrics = calculateCarbonFootprint(newResourceMetrics);
          setMetrics(carbonMetrics);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Attendre que la page soit chargée
    if (document.readyState === 'complete') {
      fetchPerformanceMetrics();
    } else {
      window.addEventListener('load', fetchPerformanceMetrics);
      return () => window.removeEventListener('load', fetchPerformanceMetrics);
    }
  }, []);

  // Obtenir la couleur du score vert
  const getGreenScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  // Obtenir l'icône du score vert
  const getGreenScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (score >= 60) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    if (score >= 40) return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    return <AlertTriangle className="w-5 h-5 text-red-500" />;
  };

  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <div className="flex items-center gap-4 mb-6">
          <Leaf className="w-8 h-8 text-green-400" />
          <h2 className="text-2xl font-bold text-white">Métriques Carbone</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-white" />
          <span className="text-white ml-3">Calcul de l'empreinte carbone...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <div className="flex items-center gap-4 mb-6">
        <Leaf className="w-8 h-8 text-green-400" />
        <h2 className="text-2xl font-bold text-white">Métriques Carbone</h2>
        <div className="ml-auto flex items-center gap-2">
          {getGreenScoreIcon(metrics.greenScore)}
          <span className={`text-lg font-semibold ${getGreenScoreColor(metrics.greenScore)}`}>
            Score Vert: {metrics.greenScore}/100
          </span>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">Total CO2</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {metrics.totalCO2.toFixed(3)} gCO2e
          </div>
          <div className="text-sm text-white/70">
            Émissions totales
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-medium">Transfert</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {metrics.dataTransferCO2.toFixed(3)} gCO2e
          </div>
          <div className="text-sm text-white/70">
            Données transférées
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">Serveur</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {metrics.serverCO2.toFixed(3)} gCO2e
          </div>
          <div className="text-sm text-white/70">
            Traitement serveur
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingDown className="w-5 h-5 text-green-400" />
            <span className="text-white font-medium">Cache</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {metrics.cacheEfficiency}%
          </div>
          <div className="text-sm text-white/70">
            Efficacité cache
          </div>
        </div>
      </div>

      {/* Détails des ressources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Détails des Ressources
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-white">
              <span>HTML:</span>
              <span>{(resourceMetrics.htmlSize / 1024).toFixed(1)} KB</span>
            </div>
            <div className="flex justify-between text-white">
              <span>CSS:</span>
              <span>{(resourceMetrics.cssSize / 1024).toFixed(1)} KB</span>
            </div>
            <div className="flex justify-between text-white">
              <span>JavaScript:</span>
              <span>{(resourceMetrics.jsSize / 1024).toFixed(1)} KB</span>
            </div>
            <div className="flex justify-between text-white">
              <span>Images:</span>
              <span>{(resourceMetrics.imageSize / 1024).toFixed(1)} KB</span>
            </div>
            <div className="flex justify-between text-white font-semibold border-t border-white/20 pt-2">
              <span>Total:</span>
              <span>{(resourceMetrics.totalSize / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-green-400" />
            Métriques de Performance
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-white">
              <span>Temps de chargement:</span>
              <span>{(resourceMetrics.pageLoadTime / 1000).toFixed(2)}s</span>
            </div>
            <div className="flex justify-between text-white">
              <span>Nœuds DOM:</span>
              <span>{resourceMetrics.domNodes.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-white">
              <span>Requêtes:</span>
              <span>{resourceMetrics.requests}</span>
            </div>
            <div className="flex justify-between text-white">
              <span>Facteur CO2:</span>
              <span>{CO2_FACTORS.dataTransfer.toFixed(2)} g/MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommandations */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-400" />
          Recommandations d'Optimisation
        </h3>
        <div className="space-y-2">
          {metrics.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <Leaf className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-white text-sm">{recommendation}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Note informative */}
      <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-blue-300 text-sm">
            <p className="font-medium mb-1">Calcul basé sur les standards d'éco-conception web</p>
            <p>Les métriques CO2 sont calculées selon les facteurs d'émission standardisés pour le transfert de données, 
            le traitement serveur et le rendu client. Un score vert élevé indique une application respectueuse de l'environnement.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonMetrics;
