# Documentation - Table ContextElement

## Vue d'ensemble

La table `ContextElement` contient tous les éléments de contexte RAMQ pour la facturation des médecins spécialistes (RFP). Ces éléments définissent les conditions et contextes spécifiques dans lesquels certains codes de facturation peuvent être utilisés.

## Structure de la table

### Champs principaux

| Champ | Type | Description | Exemple |
|-------|------|-------------|---------|
| `id` | Int | Identifiant unique auto-incrémenté | 1, 2, 3... |
| `cod_elm_contx` | Int | Code de l'élément de contexte (unique) | 10, 1824, 1825... |
| `txt_elm_contx` | String | Texte descriptif de l'élément de contexte | "Patient sous anesthésie générale" |
| `cod_niv` | String | Code niveau de l'élément | "L" |
| `dd_effec_elm_contx` | Date | Date de début d'effet de l'élément | 2013-04-01 |
| `liste_util_elm_contx` | JSON | Liste des utilisations avec codes de facturation liés | Array d'objets |

### Structure JSON de `liste_util_elm_contx`

```json
[
  {
    "typ_fact": 1,
    "dd_util_elm_contx": "2013-04-01",
    "liste_cod_fact": [
      {
        "cod_fact": 15759,
        "dd_effec_cod_fact": "2015-12-01",
        "df_effec_cod_fact": null
      }
    ]
  }
]
```

## Statistiques des données

- **Total des éléments**: 211 éléments de contexte uniques
- **Éléments avec dates de fin**: Certains codes de facturation liés ont des dates de fin d'effet
- **Types de facturation**: Principalement type 1 (facturation standard)

## Exemples d'éléments de contexte

### 1. Patient sous anesthésie générale
```json
{
  "cod_elm_contx": 10,
  "txt_elm_contx": "Patient sous anesthésie générale",
  "cod_niv": "L",
  "dd_effec_elm_contx": "2013-04-01"
}
```

### 2. Éléments avec codes de facturation liés
Chaque élément peut être lié à plusieurs codes de facturation avec leurs dates d'effet.

## Utilisation

### Requêtes SQL de base

```sql
-- Récupérer tous les éléments de contexte
SELECT * FROM "ContextElement";

-- Rechercher par code d'élément
SELECT * FROM "ContextElement" WHERE "cod_elm_contx" = 10;

-- Rechercher par texte
SELECT * FROM "ContextElement" WHERE "txt_elm_contx" ILIKE '%anesthésie%';

-- Éléments actifs (sans date de fin)
SELECT * FROM "ContextElement" 
WHERE "dd_effec_elm_contx" <= CURRENT_DATE;
```

### Requêtes avec JSON

```sql
-- Récupérer les éléments avec des codes de facturation spécifiques
SELECT * FROM "ContextElement" 
WHERE "liste_util_elm_contx"::jsonb @> '[{"liste_cod_fact": [{"cod_fact": 15759}]}]';

-- Compter les codes de facturation par élément
SELECT 
  "cod_elm_contx",
  "txt_elm_contx",
  jsonb_array_length("liste_util_elm_contx"::jsonb) as nb_utilisations
FROM "ContextElement";
```

### Requêtes complexes

```sql
-- Trouver tous les codes de facturation liés à un élément de contexte
SELECT 
  ce."cod_elm_contx",
  ce."txt_elm_contx",
  jsonb_array_elements(
    jsonb_array_elements(ce."liste_util_elm_contx")->'liste_cod_fact'
  )->>'cod_fact' as cod_fact
FROM "ContextElement" ce
WHERE ce."cod_elm_contx" = 10;
```

## Intégration avec BillingCode

Les éléments de contexte sont liés aux codes de facturation via la structure JSON `liste_util_elm_contx`. Cette relation permet de :

1. **Valider les contextes** : Vérifier si un code peut être utilisé dans un contexte donné
2. **Filtrer les codes** : Afficher seulement les codes applicables dans un contexte spécifique
3. **Auditer la facturation** : Vérifier la conformité des factures avec les contextes autorisés

### Exemple de validation

```sql
-- Vérifier si le code 15759 peut être utilisé dans le contexte 10
SELECT 
  ce."txt_elm_contx",
  EXISTS(
    SELECT 1 
    FROM jsonb_array_elements(ce."liste_util_elm_contx") as util,
         jsonb_array_elements(util->'liste_cod_fact') as fact
    WHERE fact->>'cod_fact' = '15759'
  ) as code_autorise
FROM "ContextElement" ce
WHERE ce."cod_elm_contx" = 10;
```

## Migration et import

### Scripts disponibles

1. **extract-ramq-data.js**: Extrait les données des fichiers XML RAMQ
2. **import-context-elements.js**: Importe les éléments dans la base de données

### Commandes

```bash
# Extraire les données des fichiers XML
node src/scripts/extract-ramq-data.js

# Importer dans la base de données
node src/scripts/import-context-elements.js
```

## Notes importantes

1. **Gestion des doublons**: Le script utilise `upsert` pour gérer les codes d'éléments dupliqués
2. **Structure JSON**: Les listes complexes sont stockées en JSON pour préserver la hiérarchie XML
3. **Dates d'effet**: Les éléments peuvent avoir des dates de début d'effet
4. **Relations**: Les éléments sont liés aux codes de facturation via la structure JSON

## Cas d'usage dans l'application

1. **Interface de facturation**: Afficher les contextes disponibles pour un code
2. **Validation**: Vérifier la conformité des factures
3. **Recherche**: Permettre la recherche par contexte
4. **Rapports**: Analyser l'utilisation des contextes
5. **Audit**: Vérifier la conformité réglementaire

## Maintenance

- **Mise à jour**: Les données peuvent être mises à jour en réexécutant les scripts d'extraction et d'import
- **Validation**: Utiliser les requêtes SQL pour vérifier l'intégrité des données
- **Sauvegarde**: Toujours sauvegarder la base de données avant les mises à jour importantes
