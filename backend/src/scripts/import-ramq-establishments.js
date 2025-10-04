import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script d'import des établissements RAMQ
 * Importe les données du fichier JSON vers la base de données
 */

const prisma = new PrismaClient();
const ESTABLISHMENTS_FILE = path.join(__dirname, '../../ramq-xml/parsed/specialist/establishments.json');

/**
 * Convertit les données JSON des établissements vers le format Prisma
 * @param {Object} establishment - Établissement du JSON
 * @returns {Object} Données formatées pour Prisma
 */
function formatEstablishmentForPrisma(establishment) {
  return {
    id_lieu_phys: establishment.id_lieu_phys?.[0]?.toString() || null,
    nom_etab: establishment.nom_etab || null,
    adresse: establishment.adresse || null,
    liste_no_etab_alternatifs: establishment.id_lieu_phys?.map(id => id.toString()) || [],
    catg_etab: establishment.catg_etab || null,
    typ_etab: establishment.typ_etab || null,
    cod_rss: establishment.cod_rss?.toString() || null,
    nom_rss: establishment.nom_rss || null,
    municipalite: establishment.municipalite || null,
    cod_pos: establishment.cod_pos || null,
    dd_lieu_phys: establishment.dd_lieu_phys?.[0] ? new Date(establishment.dd_lieu_phys[0]) : null,
    df_lieu_phys: establishment.df_lieu_phys?.[0] ? new Date(establishment.df_lieu_phys[0]) : null,
    calen_jour_ferie: establishment.calen_jour_ferie || null,
    is_active: true
  };
}

/**
 * Fonction principale d'import
 */
async function importRamqEstablishments() {
  try {
    console.log('🔄 Début de l\'import des établissements RAMQ...');
    console.log(`📁 Fichier source: ${ESTABLISHMENTS_FILE}`);
    
    // Vérifier que le fichier existe
    if (!fs.existsSync(ESTABLISHMENTS_FILE)) {
      throw new Error(`Fichier non trouvé: ${ESTABLISHMENTS_FILE}`);
    }
    
    // Lire le fichier JSON
    console.log('📖 Lecture du fichier JSON...');
    const jsonData = JSON.parse(fs.readFileSync(ESTABLISHMENTS_FILE, 'utf8'));
    
    if (!jsonData.establishments || !Array.isArray(jsonData.establishments)) {
      throw new Error('Structure JSON invalide: propriété "establishments" manquante ou non-tableau');
    }
    
    const establishments = jsonData.establishments;
    console.log(`📊 ${establishments.length} établissements à importer`);
    
    // Vider la table existante (optionnel)
    console.log('🗑️  Suppression des établissements existants...');
    await prisma.establishment.deleteMany({});
    
    // Importer les établissements par lots
    const batchSize = 100;
    let importedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < establishments.length; i += batchSize) {
      const batch = establishments.slice(i, i + batchSize);
      
      try {
        const formattedBatch = batch.map(formatEstablishmentForPrisma);
        
        await prisma.establishment.createMany({
          data: formattedBatch,
          skipDuplicates: true
        });
        
        importedCount += batch.length;
        console.log(`✅ Lot ${Math.floor(i/batchSize) + 1}: ${importedCount}/${establishments.length} établissements importés`);
        
      } catch (error) {
        console.error(`❌ Erreur lors de l'import du lot ${Math.floor(i/batchSize) + 1}:`, error.message);
        errorCount += batch.length;
      }
    }
    
    console.log(`🎉 Import terminé! ${importedCount} établissements importés, ${errorCount} erreurs`);
    
    // Afficher les statistiques finales
    const stats = await prisma.establishment.groupBy({
      by: ['catg_etab', 'typ_etab'],
      _count: true,
      where: {
        catg_etab: { not: null },
        typ_etab: { not: null }
      }
    });
    
    console.log('\n📈 Statistiques après import:');
    stats.forEach(stat => {
      console.log(`  ${stat.catg_etab} (${stat.typ_etab}): ${stat._count} établissements`);
    });
    
    // Vérifier les champs critiques
    const criticalFieldsStats = await prisma.establishment.aggregate({
      _count: {
        id_lieu_phys: true,
        catg_etab: true,
        typ_etab: true,
        calen_jour_ferie: true
      }
    });
    
    console.log('\n🔍 Champs critiques:');
    console.log(`  id_lieu_phys: ${criticalFieldsStats._count.id_lieu_phys}/${importedCount} (${((criticalFieldsStats._count.id_lieu_phys/importedCount)*100).toFixed(1)}%)`);
    console.log(`  catg_etab: ${criticalFieldsStats._count.catg_etab}/${importedCount} (${((criticalFieldsStats._count.catg_etab/importedCount)*100).toFixed(1)}%)`);
    console.log(`  typ_etab: ${criticalFieldsStats._count.typ_etab}/${importedCount} (${((criticalFieldsStats._count.typ_etab/importedCount)*100).toFixed(1)}%)`);
    console.log(`  calen_jour_ferie: ${criticalFieldsStats._count.calen_jour_ferie}/${importedCount} (${((criticalFieldsStats._count.calen_jour_ferie/importedCount)*100).toFixed(1)}%)`);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter l'import si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  importRamqEstablishments()
    .then(() => {
      console.log('✅ Import terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Import échoué:', error);
      process.exit(1);
    });
}

export { importRamqEstablishments };
