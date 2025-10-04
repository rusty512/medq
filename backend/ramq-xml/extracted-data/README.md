# Données RAMQ Extraites - Facturation des Médecins Spécialistes (RFP)

Ce dossier contient les données extraites des fichiers XML de la RAMQ pour supporter la facturation des médecins spécialistes (RFP).

## 📁 Structure des Fichiers

### ✅ Fichiers Extraits avec Succès

| Fichier | Description | Enregistrements | Statut |
|---------|-------------|-----------------|--------|
| `activity-sectors.json` | Secteurs d'activité RAMQ | 19 | ✅ Complet |
| `billing-codes.json` | Codes de facturation spécialistes | 7,352 | ✅ Complet |
| `context-elements.json` | Éléments de contexte | 224 | ✅ Complet |
| `explanatory-messages.json` | Messages explicatifs | 0 | ⚠️ À corriger |
| `diagnostic-codes.json` | Codes de diagnostic (CIM-9/10) | 0 | ⚠️ À corriger |
| `location-codes.json` | Codes de localité | 0 | ⚠️ À corriger |

### 📊 Résumé de l'Extraction

- **Date d'extraction** : 2025-10-03T22:06:50.461Z
- **Total d'enregistrements** : 7,595
- **Fichiers sources** : 6 fichiers XML RAMQ
- **Conformité** : Noms de balises XML conservés pour cartographie XSD

## 🔧 Conformité RAMQ/RFP

### Champs Critiques Extraits

#### Secteurs d'Activité (`activity-sectors.json`)
- `no_sect_activ` : Numéro du secteur d'activité
- `des_sect_activ` : Description du secteur
- `dd_effec_sect_activ` : Date de début d'effectivité
- `liste_catg_etab` : Liste des catégories d'établissement permises

#### Codes de Facturation (`billing-codes.json`)
- `cod_fact` : Code de facturation
- `des_cod_fact` : Description du code
- `en_cab_seulm` / `en_etab_seulm` : Restrictions de lieu physique
- `liste_elm_mesur` : Éléments mesurables requis
- `liste_role_spec` : Rôles spécialisés autorisés
- `liste_perio_age` : Périodes d'âge pour suppléments

#### Éléments de Contexte (`context-elements.json`)
- `cod_elm_contx` : Code de l'élément de contexte
- `txt_elm_contx` : Texte de l'élément de contexte
- `cod_niv` : Code de niveau
- `dd_effec_elm_contx` : Date de début d'effectivité
- `liste_util_elm_contx` : Liste des utilisations avec codes de facturation liés

## 🚀 Utilisation

Ces données sont prêtes pour :
1. **Ingestion en base de données** (Supabase/Prisma)
2. **Validation RFP** des actes de spécialistes
3. **Cartographie directe** avec les schémas XSD transactionnels
4. **Aide à la saisie dynamique** dans l'interface utilisateur

## ⚠️ Fichiers à Corriger

Les fichiers suivants nécessitent une correction de l'extraction :
- `explanatory-messages.json` 
- `diagnostic-codes.json`
- `location-codes.json`

## 📝 Notes Techniques

- **Parser XML** : fast-xml-parser
- **Format de sortie** : JSON structuré
- **Conservation des noms** : Balises XML exactes conservées
- **Encodage** : UTF-8
- **Validation** : Conformité aux exigences RAMQ/RFP

## 🔗 Fichiers Sources

- `secteurActivite_Specialiste_V257_20250613.xml`
- `codeFacturation_Specialiste_V363_20250613.xml`
- `elementContexte_Specialiste_V351_20250613.xml`
- `messageExplicatif_Specialiste_V447_20250613.xml`
- `codeDiagnostic_V311_20250613.xml`
- `codeLocalite_V453_20250613.xml`
