import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script de migration des données d'établissements
 * Migre les données existantes vers les nouveaux champs RAMQ/RFP
 */

const prisma = new PrismaClient();

/**
 * Migre un établissement existant vers les nouveaux champs RAMQ
 * @param {Object} establishment - Établissement existant
 * @returns {Object} Données migrées
 */
function migrateEstablishmentData(establishment) {
  return {
    // Migration des champs existants vers les nouveaux champs RAMQ
    id_lieu_phys: establishment.code, // code -> id_lieu_phys
    nom_etab: establishment.name, // name -> nom_etab
    adresse: establishment.address, // address -> adresse
    liste_no_etab_alternatifs: establishment.codes || [], // codes -> liste_no_etab_alternatifs
    catg_etab: establishment.category, // category -> catg_etab
    typ_etab: establishment.establishment_type, // establishment_type -> typ_etab
    cod_rss: establishment.region_code, // region_code -> cod_rss
    nom_rss: establishment.region_name, // region_name -> nom_rss
    municipalite: establishment.municipality, // municipality -> municipalite
    cod_pos: establishment.postal_code, // postal_code -> cod_pos
    // Les nouveaux champs restent null pour l'instant
    dd_lieu_phys: null,
    df_lieu_phys: null,
    calen_jour_ferie: null
  };
}

/**
 * Fonction principale de migration
 */
async function migrateEstablishmentData() {
  try {
    console.log('🔄 Début de la migration des données d\'établissements...');
    
    // Lire les établissements existants
    console.log('📖 Lecture des établissements existants...');
    const existingEstablishments = await prisma.establishment.findMany();
    console.log(`📊 ${existingEstablishments.length} établissements trouvés`);
    
    // Migrer chaque établissement
    console.log('🔄 Migration des données...');
    let migratedCount = 0;
    
    for (const establishment of existingEstablishments) {
      try {
        const migratedData = migrateEstablishmentData(establishment);
        
        await prisma.establishment.update({
          where: { id: establishment.id },
          data: migratedData
        });
        
        migratedCount++;
        
        if (migratedCount % 100 === 0) {
          console.log(`✅ ${migratedCount}/${existingEstablishments.length} établissements migrés`);
        }
      } catch (error) {
        console.error(`❌ Erreur lors de la migration de l'établissement ${establishment.id}:`, error.message);
      }
    }
    
    console.log(`🎉 Migration terminée! ${migratedCount}/${existingEstablishments.length} établissements migrés`);
    
    // Afficher quelques statistiques
    const stats = await prisma.establishment.groupBy({
      by: ['catg_etab', 'typ_etab'],
      _count: true,
      where: {
        catg_etab: { not: null },
        typ_etab: { not: null }
      }
    });
    
    console.log('\n📈 Statistiques après migration:');
    stats.forEach(stat => {
      console.log(`  ${stat.catg_etab} (${stat.typ_etab}): ${stat._count} établissements`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la migration si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateEstablishmentData()
    .then(() => {
      console.log('✅ Migration terminée avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration échouée:', error);
      process.exit(1);
    });
}

export { migrateEstablishmentData };
