# Métriques d'Empreinte Carbone - RGESN 8.2

## Vue d'ensemble

Cette documentation décrit l'implémentation complète des métriques d'empreinte carbone pour l'éco-conception web, conformément à la règle **RGESN 8.2 - Suivi de l'impact environnemental**.

## Architecture des métriques carbone

### 1. Composant CarbonMetrics (`CarbonMetrics.tsx`)

**Fonctionnalités principales :**
- Calcul en temps réel de l'empreinte carbone
- Métriques de performance web converties en CO2
- Score vert automatisé (0-100)
- Recommandations d'optimisation dynamiques

**Métriques calculées :**
- **Total CO2** : Somme de toutes les émissions
- **Transfert de données** : CO2 lié au volume transféré
- **Traitement serveur** : CO2 lié au traitement des ressources
- **Temps de chargement** : CO2 lié à la durée de traitement
- **Nœuds DOM** : CO2 lié au rendu côté client

**Facteurs de conversion CO2 :**
```typescript
const CO2_FACTORS = {
  dataTransfer: 0.81,      // gCO2e par MB transféré
  serverProcessing: 0.12,   // gCO2e par MB traité
  pageLoad: 0.05,          // gCO2e par seconde de chargement
  domProcessing: 0.001     // gCO2e par nœud DOM
}
```

### 2. Composant CarbonHistory (`CarbonHistory.tsx`)

**Fonctionnalités :**
- Historique des métriques carbone sur 30 jours
- Tendances d'amélioration et dégradation
- Graphiques d'évolution temporelle
- Filtrage par période (24h, 7j, 30j)

**Métriques de tendance :**
- Moyenne CO2 sur la période
- Pourcentage d'amélioration
- Meilleur et pire score vert
- Nombre total de sessions

**Visualisation :**
- Graphique en barres des 10 dernières sessions
- Indicateur de session actuelle
- Détails des sessions récentes
- Calculs de tendances automatisés

### 3. Composant CarbonRecommendations (`CarbonRecommendations.tsx`)

**Système de recommandations :**
- **Critiques** : Optimisations immédiates nécessaires
- **Élevées** : Améliorations importantes recommandées
- **Moyennes** : Optimisations bénéfiques
- **Faibles** : Finitions et optimisations mineures

**Critères d'évaluation :**
- Seuils CO2 automatiques (1.0g, 1.5g, 2.0g, 3.0g)
- Taille des ressources (>2MB, >3MB)
- Temps de chargement (>3s)
- Complexité DOM (>1000, >1500 nœuds)

**Actions recommandées :**
- Optimisation des images (WebP/AVIF)
- Lazy loading des composants
- Code-splitting et tree-shaking
- Optimisation du cache
- Simplification du DOM

## Intégration dans l'application

### Lazy Loading

Les composants carbone sont intégrés au système de lazy loading :

```typescript
export const LazyCarbonMetrics = (props: any) => (
  <Suspense fallback={<SimpleFallback />}>
    {React.createElement(lazy(() => import('../components/CarbonMetrics')), props)}
  </Suspense>
)

export const LazyCarbonHistory = (props: any) => (
  <Suspense fallback={<SimpleFallback />}>
    {React.createElement(lazy(() => import('../components/CarbonHistory')), props)}
  </Suspense>
)

export const LazyCarbonRecommendations = (props: any) => (
  <Suspense fallback={<SimpleFallback />}>
    {React.createElement(lazy(() => import('../components/CarbonRecommendations')), props)}
  </Suspense>
)
```

### Préchargement intelligent

Les composants carbone sont inclus dans le système de préchargement :

```typescript
case 'CarbonMetrics':
  await import('../components/CarbonMetrics')
  break
case 'CarbonHistory':
  await import('../components/CarbonHistory')
  break
case 'CarbonRecommendations':
  await import('../components/CarbonRecommendations')
  break
```

## Calculs et algorithmes

### 1. Calcul de l'empreinte carbone

```typescript
const calculateCarbonFootprint = (resources: ResourceMetrics): CarbonMetrics => {
  const dataTransferCO2 = (resources.totalSize / (1024 * 1024)) * CO2_FACTORS.dataTransfer;
  const serverCO2 = (resources.totalSize / (1024 * 1024)) * CO2_FACTORS.serverProcessing;
  const pageLoadCO2 = (resources.pageLoadTime / 1000) * CO2_FACTORS.pageLoad;
  const domCO2 = resources.domNodes * CO2_FACTORS.domProcessing;

  const totalCO2 = dataTransferCO2 + serverCO2 + pageLoadCO2 + domCO2;
  
  return { totalCO2, dataTransferCO2, serverCO2, pageLoadCO2, ... };
}
```

### 2. Calcul du score vert

```typescript
let greenScore = 100;

// Pénalités basées sur les seuils CO2
if (totalCO2 > 1.0) greenScore -= 30;  // > 1g CO2e
if (totalCO2 > 2.0) greenScore -= 30;  // > 2g CO2e
if (totalCO2 > 3.0) greenScore -= 30;  // > 3g CO2e

// Pénalités basées sur les métriques de performance
if (resources.totalSize > 2 * 1024 * 1024) greenScore -= 10;  // > 2MB
if (resources.pageLoadTime > 3000) greenScore -= 10;           // > 3s
if (resources.domNodes > 1000) greenScore -= 10;               // > 1000 nœuds

greenScore = Math.max(0, greenScore);
```

### 3. Génération des recommandations

```typescript
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
  
  return recs;
};
```

## Interface utilisateur

### Design et UX

- **Thème cohérent** : Intégration parfaite avec le design existant
- **Responsive** : Adaptation automatique aux différentes tailles d'écran
- **Accessibilité** : Contrastes appropriés et navigation clavier
- **Feedback visuel** : Indicateurs de couleur et icônes explicites

### Composants visuels

1. **Métriques principales** : Cartes avec icônes et valeurs
2. **Graphiques** : Visualisation des tendances temporelles
3. **Recommandations** : Système de cartes avec priorités
4. **Historique** : Tableaux détaillés des sessions

## Conformité RGESN 8.2

### ✅ Règles respectées

1. **Suivi de l'impact environnemental**
   - Métriques CO2 en temps réel
   - Historique des émissions
   - Tendances d'amélioration

2. **Mesure continue**
   - Calculs automatiques
   - Surveillance des performances
   - Alertes de dégradation

3. **Optimisation guidée**
   - Recommandations personnalisées
   - Actions prioritaires
   - Suivi des améliorations

4. **Transparence**
   - Facteurs de conversion documentés
   - Méthodologie de calcul
   - Justification des seuils

## Métriques et seuils

### Seuils d'alerte

| Métrique | Seuil | Action |
|----------|-------|---------|
| **CO2 total** | > 1.0g | Recommandation élevée |
| **CO2 total** | > 2.0g | Recommandation critique |
| **Taille totale** | > 2MB | Optimisation recommandée |
| **Temps de chargement** | > 3s | Amélioration nécessaire |
| **Nœuds DOM** | > 1000 | Simplification recommandée |

### Scores verts

| Score | Couleur | Signification |
|-------|---------|---------------|
| **80-100** | 🟢 Vert | Excellent - Respecte les bonnes pratiques |
| **60-79** | 🟡 Jaune | Bon - Quelques optimisations possibles |
| **40-59** | 🟠 Orange | Moyen - Optimisations importantes nécessaires |
| **0-39** | 🔴 Rouge | Critique - Optimisation immédiate requise |

## Utilisation et maintenance

### Développement

1. **Ajout de nouvelles métriques** : Étendre les interfaces et calculs
2. **Ajustement des seuils** : Modifier les constantes de configuration
3. **Nouvelles recommandations** : Ajouter des règles dans le générateur

### Production

1. **Surveillance continue** : Vérifier les métriques régulièrement
2. **Ajustement des facteurs** : Calibrer selon l'infrastructure
3. **Mise à jour des recommandations** : Adapter aux nouvelles technologies

### Évolution future

1. **Intégration API** : Récupération des métriques depuis des services externes
2. **Machine Learning** : Prédiction des tendances et recommandations avancées
3. **Comparaison** : Benchmarking avec d'autres applications
4. **Reporting** : Génération de rapports d'impact environnemental

## Dépannage

### Problèmes courants

1. **Métriques manquantes** : Vérifier l'API Performance Web
2. **Calculs incorrects** : Valider les facteurs de conversion
3. **Recommandations inappropriées** : Ajuster les seuils

### Diagnostic

```bash
# Vérifier les composants carbone
npm run dev

# Analyser les métriques en temps réel
# Ouvrir la console du navigateur pour les logs

# Tester les calculs
# Utiliser les outils de développement
```

## Conclusion

L'implémentation des métriques d'empreinte carbone respecte pleinement les exigences RGESN 8.2 et fournit une solution complète et automatisée pour le suivi de l'impact environnemental. 

**Bénéfices :**
- **Awareness** : Prise de conscience de l'impact environnemental
- **Optimisation** : Guide d'amélioration continue
- **Mesure** : Métriques quantifiables et traçables
- **Conformité** : Respect des standards d'éco-conception

**Impact RGESN 8.2 :**
- ✅ Suivi de l'impact environnemental
- ✅ Mesure continue des performances
- ✅ Optimisation guidée et priorisée
- ✅ Transparence et traçabilité complètes

Cette implémentation positionne l'application comme un exemple d'excellence en matière d'éco-conception web et de suivi environnemental.
