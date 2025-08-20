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

## USER STORIES - Consultation Factures Shine (Éco-conception)

---

### Story 1 : Chargement factures éco-optimisé

**En tant que** utilisateur consultant mes factures,  
**je veux** que seules les métadonnées essentielles (montant, date, statut) s’affichent en premier,  
**afin de** réduire la consommation de données et accélérer l’accès à l’information.

- 🎯 Objectif : 1ère vue facture < 500 ms  
- 🧱 BP associée : chargement différé du PDF (lazy-loading) / pagination  
- 🛠️ KPI : poids moyen consultation facture < 200 Ko  
- 📅 Tag roadmap : M2  

---

### Story 2 : Réduction empreinte stockage factures

**En tant que** utilisateur récurrent,  
**je veux** que mes factures soient stockées et servies dans un format optimisé,  
**afin de** limiter l’impact carbone du stockage et du transfert réseau.

- 🎯 Objectif : 100% factures en PDF/A compressé  
- 🧱 BP associée : formats légers / mutualisation CDN / déduplication  
- 🛠️ KPI : taille moyenne facture < 150 Ko  
- 📅 Tag roadmap : M3  

---

### Story 3 : Consultation durable multi-appareils

**En tant que** utilisateur mobile,  
**je veux** que la consultation de mes factures soit adaptée à mon écran et à ma connexion,  
**afin de** éviter des chargements inutiles ou des surconsommations énergétiques.

- 🎯 Objectif : responsive + mode faible conso activé  
- 🧱 BP associée : responsive design, compression adaptative, dark mode par défaut en mobile  
- 🛠️ KPI : consommation énergie mesurée via EcoIndex < B  
- 📅 Tag roadmap : M4  

---
