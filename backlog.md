# Backlog du projet "Optimisation Sante+"

## USER STORIES

---

### Story 1 : Chargement initial plus rapide

**En tant que** nouvel utilisateur web,  
**je veux** que l’écran d’accueil charge en moins de 1,5 s  
**afin de** ne pas décrocher lors d’un pic de réseau lent.

- 🎯 Objectif : temps de chargement < 1500 ms
- 🧱 BP associée : réduire taille des ressources / lazy-loading
- 🛠️ KPI : LCP sur web (Lighthouse)
- 📅 Tag roadmap : M2

---

### Story 2 : Réduction poids images

**En tant que** utilisateur récurrent,  
**je veux** que les visuels du dashboard soient plus légers  
**afin de** économiser de la data sur mon forfait.

- 🎯 Objectif : 80% des images converties en WebP
- 🧱 BP associée : compression d’images / formats modernes
- 🛠️ KPI : poids total dossier `/assets` < 2 Mo
- 📅 Tag roadmap : M3

---

### Story 3 : Accessibilité améliorée

**En tant que** utilisateur malvoyant,  
**je veux** que les contrastes texte/fond soient conformes AA  
**afin de** pouvoir utiliser l’app sans difficulté visuelle.

- 🎯 Objectif : conformité AA WCAG
- 🧱 BP associée : respect contrastes (RGESN 6.3)
- 🛠️ KPI : score accessibilité Lighthouse > 90
- 📅 Tag roadmap : M4

...

---