-- Migration pour ajouter les champs RAMQ/RFP au modèle Establishment
-- Conformité avec la nomenclature XML de la RAMQ

-- Ajouter les nouveaux champs RAMQ/RFP
ALTER TABLE "Establishment" 
ADD COLUMN "id_lieu_phys" TEXT,
ADD COLUMN "nom_etab" TEXT,
ADD COLUMN "adresse" TEXT,
ADD COLUMN "liste_no_etab_alternatifs" TEXT[] DEFAULT '{}',
ADD COLUMN "catg_etab" TEXT,
ADD COLUMN "typ_etab" TEXT,
ADD COLUMN "cod_rss" TEXT,
ADD COLUMN "nom_rss" TEXT,
ADD COLUMN "municipalite" TEXT,
ADD COLUMN "cod_pos" TEXT,
ADD COLUMN "dd_lieu_phys" DATE,
ADD COLUMN "df_lieu_phys" DATE,
ADD COLUMN "calen_jour_ferie" JSONB;

-- Créer un index sur le nouveau champ unique
CREATE UNIQUE INDEX "Establishment_id_lieu_phys_key" ON "Establishment"("id_lieu_phys");

-- Commentaires pour documentation
COMMENT ON COLUMN "Establishment"."id_lieu_phys" IS 'Identifiant principal du lieu physique (RAMQ)';
COMMENT ON COLUMN "Establishment"."nom_etab" IS 'Nom de l''établissement';
COMMENT ON COLUMN "Establishment"."adresse" IS 'Adresse de l''établissement';
COMMENT ON COLUMN "Establishment"."liste_no_etab_alternatifs" IS 'Liste des numéros d''établissement alternatifs';
COMMENT ON COLUMN "Establishment"."catg_etab" IS 'Catégorie d''établissement (CM, CH, CLSC, etc.)';
COMMENT ON COLUMN "Establishment"."typ_etab" IS 'Type d''établissement (ETAB ou CAB) - critique pour validation RFP';
COMMENT ON COLUMN "Establishment"."cod_rss" IS 'Code RSS';
COMMENT ON COLUMN "Establishment"."nom_rss" IS 'Nom RSS';
COMMENT ON COLUMN "Establishment"."municipalite" IS 'Municipalité';
COMMENT ON COLUMN "Establishment"."cod_pos" IS 'Code postal';
COMMENT ON COLUMN "Establishment"."dd_lieu_phys" IS 'Date de début d''effectivité du lieu physique';
COMMENT ON COLUMN "Establishment"."df_lieu_phys" IS 'Date de fin d''effectivité du lieu physique';
COMMENT ON COLUMN "Establishment"."calen_jour_ferie" IS 'Calendrier des jours fériés (JSON complexe pour majorations)';
