import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Zap,
  Database,
  Image as ImageIcon,
  Code,
  Server,
  Globe,
  ArrowRight,
  Star
} from 'lucide-react';

interface Recommendation {
  id: string;
  category: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: {
    co2Reduction: number;
    performanceGain: number;
    effort: 'low' | 'medium' | 'high';
  };
  actions: string[];
  status: 'pending' | 'in-progress' | 'completed';
  priority: number;
}

interface CarbonRecommendationsProps {
  currentMetrics?: {
    totalCO2: number;
    totalSize: number;
    pageLoadTime: number;
    domNodes: number;
    greenScore: number;
  };
}

const CarbonRecommendations: React.FC<CarbonRecommendationsProps> = ({ currentMetrics }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'impact' | 'effort'>('priority');

  // Générer des recommandations basées sur les métriques actuelles
  const generateRecommendations = (metrics?: any): Recommendation[] => {
    const recs: Recommendation[] = [];
    
    // Recommandations critiques
    if (metrics?.totalCO2 > 2.0) {
      recs.push({
        id: 'critical-1',
        category: 'critical',
        title: 'Optimisation majeure des ressources',
        description: 'L\'empreinte carbone est trop élevée. Une optimisation immédiate est nécessaire.',
        impact: {
          co2Reduction: 0.8,
          performanceGain: 40,
          effort: 'high'
        },
        actions: [
          'Compresser toutes les images en formats modernes (WebP/AVIF)',
          'Implémenter le lazy loading pour les composants non critiques',
          'Optimiser le bundle JavaScript avec tree-shaking avancé'
        ],
        status: 'pending',
        priority: 1
      });
    }

    if (metrics?.totalSize > 3 * 1024 * 1024) {
      recs.push({
        id: 'critical-2',
        category: 'critical',
        title: 'Réduction drastique de la taille des assets',
        description: 'La taille totale dépasse 3MB, impactant significativement l\'empreinte carbone.',
        impact: {
          co2Reduction: 1.2,
          performanceGain: 60,
          effort: 'high'
        },
        actions: [
          'Analyser et supprimer les dépendances inutilisées',
          'Implémenter le code-splitting par route',
          'Optimiser les polices web avec font-display: swap'
        ],
        status: 'pending',
        priority: 2
      });
    }

    // Recommandations élevées
    if (metrics?.pageLoadTime > 3000) {
      recs.push({
        id: 'high-1',
        category: 'high',
        title: 'Amélioration des temps de chargement',
        description: 'Le temps de chargement dépasse 3 secondes, augmentant la consommation serveur.',
        impact: {
          co2Reduction: 0.4,
          performanceGain: 30,
          effort: 'medium'
        },
        actions: [
          'Optimiser le rendu côté serveur (SSR)',
          'Implémenter la préchargement des ressources critiques',
          'Améliorer la stratégie de cache'
        ],
        status: 'pending',
        priority: 3
      });
    }

    if (metrics?.domNodes > 1500) {
      recs.push({
        id: 'high-2',
        category: 'high',
        title: 'Simplification du DOM',
        description: 'Trop de nœuds DOM augmentent le traitement côté client.',
        impact: {
          co2Reduction: 0.3,
          performanceGain: 25,
          effort: 'medium'
        },
        actions: [
          'Utiliser la virtualisation pour les listes longues',
          'Réduire la profondeur des composants',
          'Implémenter le rendu conditionnel intelligent'
        ],
        status: 'pending',
        priority: 4
      });
    }

    // Recommandations moyennes
    recs.push({
      id: 'medium-1',
      category: 'medium',
      title: 'Optimisation du cache',
      description: 'Améliorer l\'efficacité du cache pour réduire les requêtes répétées.',
      impact: {
        co2Reduction: 0.2,
        performanceGain: 20,
        effort: 'low'
      },
      actions: [
        'Configurer des en-têtes Cache-Control optimaux',
        'Implémenter le cache des API avec TTL',
        'Utiliser le cache du Service Worker'
      ],
      status: 'pending',
      priority: 5
    });

    recs.push({
      id: 'medium-2',
      category: 'medium',
      title: 'Optimisation des images',
      description: 'Utiliser des formats modernes et des tailles appropriées.',
      impact: {
        co2Reduction: 0.3,
        performanceGain: 25,
        effort: 'low'
      },
      actions: [
        'Convertir en WebP/AVIF avec fallbacks',
        'Implémenter le responsive images',
        'Utiliser la compression progressive'
      ],
      status: 'pending',
      priority: 6
    });

    // Recommandations faibles
    recs.push({
      id: 'low-1',
      category: 'low',
      title: 'Minification avancée',
      description: 'Optimiser la minification pour réduire encore la taille des assets.',
      impact: {
        co2Reduction: 0.1,
        performanceGain: 10,
        effort: 'low'
      },
      actions: [
        'Utiliser Terser avec options avancées',
        'Minifier le CSS avec PostCSS',
        'Optimiser les SVG'
      ],
      status: 'pending',
      priority: 7
    });

    return recs;
  };

  // Obtenir la couleur de catégorie
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'critical': return 'text-red-500 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-500 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-500 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-500 bg-gray-500/20 border-gray-500/30';
    }
  };

  // Obtenir l'icône de catégorie
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'critical': return <AlertTriangle className="w-5 h-5" />;
      case 'high': return <Target className="w-5 h-5" />;
      case 'medium': return <Lightbulb className="w-5 h-5" />;
      case 'low': return <CheckCircle className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  // Obtenir la couleur d'effort
  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // Filtrer les recommandations
  const getFilteredRecommendations = () => {
    let filtered = recommendations;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(rec => rec.category === selectedCategory);
    }
    
    // Trier par priorité, impact ou effort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return a.priority - b.priority;
        case 'impact':
          return b.impact.co2Reduction - a.impact.co2Reduction;
        case 'effort':
          const effortOrder = { low: 1, medium: 2, high: 3 };
          return effortOrder[a.impact.effort] - effortOrder[b.impact.effort];
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  // Marquer une recommandation comme en cours
  const startRecommendation = (id: string) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === id ? { ...rec, status: 'in-progress' } : rec
      )
    );
  };

  // Marquer une recommandation comme terminée
  const completeRecommendation = (id: string) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === id ? { ...rec, status: 'completed' } : rec
      )
    );
  };

  useEffect(() => {
    const recs = generateRecommendations(currentMetrics);
    setRecommendations(recs);
  }, [currentMetrics]);

  const filteredRecommendations = getFilteredRecommendations();

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
      <div className="flex items-center gap-4 mb-6">
        <Lightbulb className="w-8 h-8 text-yellow-400" />
        <h2 className="text-2xl font-bold text-white">Recommandations d'Optimisation Carbone</h2>
      </div>

      {/* Filtres et tri */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">Catégorie:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="bg-white/10 text-white border border-white/20 rounded px-3 py-1 text-sm"
          >
            <option value="all">Toutes</option>
            <option value="critical">Critiques</option>
            <option value="high">Élevées</option>
            <option value="medium">Moyennes</option>
            <option value="low">Faibles</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white text-sm">Trier par:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white/10 text-white border border-white/20 rounded px-3 py-1 text-sm"
          >
            <option value="priority">Priorité</option>
            <option value="impact">Impact CO2</option>
            <option value="effort">Effort</option>
          </select>
        </div>

        <div className="ml-auto text-sm text-white/70">
          {filteredRecommendations.length} recommandation(s) trouvée(s)
        </div>
      </div>

      {/* Liste des recommandations */}
      <div className="space-y-4">
        {filteredRecommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            className={`p-6 rounded-xl border transition-all duration-300 ${
              recommendation.status === 'completed' 
                ? 'bg-green-500/10 border-green-500/30' 
                : recommendation.status === 'in-progress'
                ? 'bg-blue-500/10 border-blue-500/30'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg border ${getCategoryColor(recommendation.category)}`}>
                  {getCategoryIcon(recommendation.category)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{recommendation.title}</h3>
                    {recommendation.status === 'completed' && (
                      <Star className="w-5 h-5 text-yellow-400" />
                    )}
                  </div>
                  <p className="text-white/80 text-sm mb-3">{recommendation.description}</p>
                  
                  {/* Métriques d'impact */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">
                        -{recommendation.impact.co2Reduction.toFixed(1)}g
                      </div>
                      <div className="text-xs text-white/70">CO2 réduit</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">
                        +{recommendation.impact.performanceGain}%
                      </div>
                      <div className="text-xs text-white/70">Performance</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getEffortColor(recommendation.impact.effort)}`}>
                        {recommendation.impact.effort}
                      </div>
                      <div className="text-xs text-white/70">Effort</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {recommendation.status === 'pending' && (
                  <button
                    onClick={() => startRecommendation(recommendation.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Commencer
                  </button>
                )}
                
                {recommendation.status === 'in-progress' && (
                  <button
                    onClick={() => completeRecommendation(recommendation.id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Terminer
                  </button>
                )}
                
                {recommendation.status === 'completed' && (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">Terminé</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions à entreprendre */}
            <div className="border-t border-white/10 pt-4">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Actions recommandées:
              </h4>
              <div className="space-y-2">
                {recommendation.actions.map((action, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-white/90">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Résumé des gains potentiels */}
      {filteredRecommendations.length > 0 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Gains Potentiels Totaux
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                -{filteredRecommendations
                  .filter(r => r.status === 'pending')
                  .reduce((sum, r) => sum + r.impact.co2Reduction, 0)
                  .toFixed(1)}g
              </div>
              <div className="text-white/80">CO2 économisé</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">
                +{Math.round(filteredRecommendations
                  .filter(r => r.status === 'pending')
                  .reduce((sum, r) => sum + r.impact.performanceGain, 0) / filteredRecommendations.length)}%
              </div>
              <div className="text-white/80">Performance moyenne</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">
                {filteredRecommendations.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-white/80">Optimisations disponibles</div>
            </div>
          </div>
        </div>
      )}

      {/* Note informative */}
      <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
        <div className="text-blue-300 text-sm">
          <p className="font-medium mb-1">Optimisation continue pour l'éco-conception</p>
          <p>Ces recommandations sont basées sur l'analyse de vos métriques actuelles et les meilleures pratiques 
          RGESN. Implémentez-les progressivement pour améliorer votre score vert et réduire l'empreinte carbone.</p>
        </div>
      </div>
    </div>
  );
};

export default CarbonRecommendations;
