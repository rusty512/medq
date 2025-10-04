# Migration du Modèle Establishment - Conformité RAMQ/RFP

Ce document décrit la migration du modèle `Establishment` pour assurer la conformité avec la nomenclature RAMQ et les exigences de facturation des médecins spécialistes (RFP).

## Contexte

La table `Establishment` est une table de référence critique pour la validation des factures RFP. Elle doit refléter fidèlement la structure du fichier XML `infoEtablissement.xml` de la RAMQ pour permettre :

1. **Validation des codes de facturation** : Vérifier si un acte est permis selon le type d'établissement (CAB/ETAB)
2. **Application des majorations** : Utiliser le calendrier des jours fériés pour les calculs
3. **Géolocalisation** : Valider les codes postaux et adresses

## Modifications Apportées

### Nouveaux Champs RAMQ/RFP

| Ancien Champ | Nouveau Champ | Type | Description |
|--------------|---------------|------|-------------|
| `code` | `id_lieu_phys` | String | Identifiant principal du lieu physique (RAMQ) |
| `name` | `nom_etab` | String | Nom de l'établissement |
| `address` | `adresse` | String | Adresse de l'établissement |
| `codes` | `liste_no_etab_alternatifs` | String[] | Numéros d'établissement alternatifs |
| `category` | `catg_etab` | String | Catégorie d'établissement (CM, CH, CLSC, etc.) |
| `establishment_type` | `typ_etab` | String | Type d'établissement (ETAB ou CAB) |
| `region_code` | `cod_rss` | String | Code RSS |
| `region_name` | `nom_rss` | String | Nom RSS |
| `municipality` | `municipalite` | String | Municipalité |
| `postal_code` | `cod_pos` | String | Code postal |

### Nouveaux Champs Spécifiques

| Champ | Type | Description |
|-------|------|-------------|
| `dd_lieu_phys` | DateTime? | Date de début d'effectivité du lieu physique |
| `df_lieu_phys` | DateTime? | Date de fin d'effectivité du lieu physique |
| `calen_jour_ferie` | Json? | Calendrier des jours fériés (JSON complexe) |

## Scripts de Migration

### 1. `migrate-establishment-ramq.sql`
Migration SQL pour ajouter les nouveaux champs à la table existante.

### 2. `migrate-establishment-data.js`
Script pour migrer les données existantes vers les nouveaux champs.

### 3. `import-ramq-establishments.js`
Script pour importer les données du fichier JSON des établissements RAMQ.

### 4. `setup-ramq-establishments.js`
Script principal qui orchestre toute la migration.

## Utilisation

### Migration Complète
```bash
cd backend
node src/scripts/setup-ramq-establishments.js
```

### Migration des Données Existantes Seulement
```bash
cd backend
node src/scripts/migrate-establishment-data.js
```

### Import des Données RAMQ Seulement
```bash
cd backend
node src/scripts/import-ramq-establishments.js
```

## Structure du Calendrier des Jours Fériés

Le champ `calen_jour_ferie` stocke un JSON avec la structure suivante :

```json
[
  {
    "date": "2022-01-03",
    "type": 1
  },
  {
    "date": "2022-04-15", 
    "type": 3
  }
]
```

### Types de Jours Fériés (RAMQ)
- **1** : Jour de l'An
- **2** : Lundi de Pâques
- **3** : Vendredi saint
- **4** : Lundi de Pâques
- **5** : Fête de la Reine
- **6** : Fête nationale du Québec
- **7** : Fête du Canada
- **8** : Fête du Travail
- **9** : Action de grâce
- **10** : Veille de Noël
- **11** : Noël
- **12** : Lendemain de Noël
- **13** : Veille du jour de l'An

## Validation RFP

### Champs Critiques pour la Validation

1. **`id_lieu_phys`** : Identifiant unique de l'établissement
2. **`catg_etab`** : Catégorie d'établissement (CM, CH, CLSC, etc.)
3. **`typ_etab`** : Type d'établissement (CAB/ETAB) - **CRITIQUE**
4. **`calen_jour_ferie`** : Calendrier des jours fériés pour les majorations

### Règles de Validation

- **`typ_etab = "CAB"`** : Les codes "en établissement seulement" ne sont pas permis
- **`typ_etab = "ETAB"`** : Les codes "en cabinet seulement" ne sont pas permis
- **`calen_jour_ferie`** : Utilisé pour calculer les majorations de jours fériés

## Nettoyage Post-Migration

Une fois la migration validée, les anciens champs peuvent être supprimés :

```sql
ALTER TABLE "Establishment" 
DROP COLUMN "code",
DROP COLUMN "name", 
DROP COLUMN "address",
DROP COLUMN "codes",
DROP COLUMN "category",
DROP COLUMN "establishment_type",
DROP COLUMN "region_code",
DROP COLUMN "region_name", 
DROP COLUMN "municipality",
DROP COLUMN "postal_code";
```

## Tests de Validation

Après la migration, vérifier :

1. **Intégrité des données** : Tous les champs critiques sont présents
2. **Conformité RFP** : Les validations de facturation fonctionnent
3. **Performance** : Les requêtes sur les nouveaux champs sont optimisées
4. **Compatibilité** : Les services existants sont mis à jour

## Support

Pour toute question ou problème lié à cette migration, consulter :
- Les logs de migration dans la console
- Les statistiques affichées après l'import
- Le fichier `EXTRAIT_VALIDATION.json` pour des exemples de données
