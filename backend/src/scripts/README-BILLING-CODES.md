# Documentation - Table BillingCode

## Vue d'ensemble

La table `BillingCode` contient tous les codes de facturation RAMQ pour les médecins spécialistes (RFP). Cette table a été créée pour stocker de manière structurée toutes les données extraites des fichiers XML RAMQ.

## Structure de la table

### Champs principaux

| Champ | Type | Description | Exemple |
|-------|------|-------------|---------|
| `id` | Int | Identifiant unique auto-incrémenté | 1, 2, 3... |
| `cod_fact` | Int | Code de facturation RAMQ (unique) | 10, 67, 4026... |
| `des_cod_fact` | String | Description du code de facturation | "Tarification des visites..." |
| `typ_cod_fact` | String | Type de code de facturation | "Visite", "Chirurgie", "PDT"... |
| `dd_effec_cod_fact` | Date | Date de début d'effet du code | 1994-06-01 |
| `df_effec_cod_fact` | Date | Date de fin d'effet du code (si applicable) | 2021-09-30 |

### Champs d'attributs (liste_attri)

| Champ | Type | Description |
|-------|------|-------------|
| `en_cab_seulm` | JSON | Attribut "en cabinet seulement" avec dates d'effet |
| `en_etab_seulm` | JSON | Attribut "en établissement seulement" avec dates d'effet |
| `ind_no_autor_req` | Boolean | Indicateur si un numéro d'autorisation est requis |

### Champs de listes (JSON)

| Champ | Type | Description | Structure JSON |
|-------|------|-------------|----------------|
| `liste_elm_mesur` | JSON | Éléments mesurables | Array d'objets avec `cod_elm_mesur`, `nom_elm_mesur`, `typ_unit_mes`, `dd_effec_elm_mesur`, `df_effec_elm_mesur` |
| `liste_role_spec` | JSON | Rôles spécialisés | Array d'objets avec `cod_role`, `nom_role`, `cod_spec`, `nom_spec`, `dd_effec_role`, `df_effec_role` |
| `liste_perio_age` | JSON | Périodes d'âge | Array d'objets avec `cod_perio_age`, `des_perio_age`, `age_min`, `age_max`, `dd_effec_perio_age` |

## Statistiques des données

- **Total des codes**: 7,352 codes de facturation
- **Codes avec dates de fin**: 442 codes ont une date de fin d'effet
- **Rôles avec dates de fin**: 1,166 rôles spécialisés ont une date de fin d'effet
- **Éléments avec dates de fin**: 68 éléments mesurables ont une date de fin d'effet

### Types de codes de facturation

| Type | Nombre | Description |
|------|--------|-------------|
| Chirurgie | 3,041 | Actes chirurgicaux |
| Forfait | 1,168 | Forfaits de soins |
| Visite | 1,157 | Visites médicales |
| PDT | 1,079 | Procédés diagnostiques et thérapeutiques |
| Radiologie diagnostique | 242 | Examens radiologiques |
| Anesthésiologie | 129 | Actes d'anesthésie |
| Administratif | 130 | Actes administratifs |
| Ultrasonographie | 96 | Examens échographiques |
| Médecine nucléaire | 109 | Examens de médecine nucléaire |
| Génétique médicale | 68 | Consultations génétiques |
| Hématologie | 60 | Examens hématologiques |
| Biochimie médicale | 24 | Examens biochimiques |
| Épreuves de fonction respiratoire | 43 | Tests respiratoires |
| Frais de déplacement | 3 | Frais de déplacement |
| Microbiologie-Infectiologie | 1 | Examens microbiologiques |
| Tarification non prévue | 1 | Codes spéciaux |
| Remboursement | 1 | Codes de remboursement |

### Attributs des codes

- **En cabinet seulement**: 320 codes
- **En établissement seulement**: 2,641 codes
- **Autorisation requise**: 0 codes (actuellement)

## Utilisation

### Requêtes SQL de base

```sql
-- Récupérer tous les codes de visite
SELECT * FROM "BillingCode" WHERE "typ_cod_fact" = 'Visite';

-- Récupérer les codes actifs (sans date de fin)
SELECT * FROM "BillingCode" WHERE "df_effec_cod_fact" IS NULL;

-- Récupérer les codes expirés
SELECT * FROM "BillingCode" WHERE "df_effec_cod_fact" IS NOT NULL;

-- Rechercher par code de facturation
SELECT * FROM "BillingCode" WHERE "cod_fact" = 67;

-- Rechercher par description
SELECT * FROM "BillingCode" WHERE "des_cod_fact" ILIKE '%anesthésie%';
```

### Requêtes avec JSON

```sql
-- Récupérer les codes avec des rôles spécialisés spécifiques
SELECT * FROM "BillingCode" 
WHERE "liste_role_spec"::jsonb @> '[{"cod_spec": 27}]';

-- Récupérer les codes avec des éléments mesurables
SELECT * FROM "BillingCode" 
WHERE jsonb_array_length("liste_elm_mesur") > 0;

-- Récupérer les codes en cabinet seulement
SELECT * FROM "BillingCode" 
WHERE "en_cab_seulm" IS NOT NULL;
```

## Migration et import

### Scripts disponibles

1. **extract-ramq-data.js**: Extrait les données des fichiers XML RAMQ
2. **import-billing-codes.js**: Importe les codes dans la base de données
3. **test-billing-codes-structure.js**: Analyse la structure des données

### Commandes

```bash
# Extraire les données des fichiers XML
node src/scripts/extract-ramq-data.js

# Importer dans la base de données (nécessite configuration DB)
node src/scripts/import-billing-codes.js

# Analyser la structure des données
node src/scripts/test-billing-codes-structure.js
```

## Notes importantes

1. **Titres de section XML**: Tous les noms de champs respectent les titres de section XML originaux pour faciliter la correspondance avec les schémas XSD.

2. **Dates de fin d'effet**: Les champs `df_effec_*` sont `null` quand il n'y a pas de date de fin définie.

3. **Données JSON**: Les listes complexes sont stockées en JSON pour préserver la structure hiérarchique des données XML.

4. **Unicité**: Le champ `cod_fact` est unique et correspond au code de facturation RAMQ officiel.

5. **Performance**: Des index sont créés sur les champs les plus utilisés pour optimiser les requêtes.

## Maintenance

- **Mise à jour**: Les données peuvent être mises à jour en réexécutant les scripts d'extraction et d'import.
- **Validation**: Utiliser le script de test pour vérifier l'intégrité des données.
- **Sauvegarde**: Toujours sauvegarder la base de données avant les mises à jour importantes.
