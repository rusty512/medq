import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script d'import avec validation des établissements RAMQ
 * Filtre les établissements invalides avant l'import
 */

const prisma = new PrismaClient();
const ESTABLISHMENTS_FILE = path.join(__dirname, '../../ramq-xml/parsed/specialist/establishments.json');

/**
 * Valide un établissement
 */
function validateEstablishment(establishment) {
  const errors = [];
  
  // Vérifier les champs requis
  if (!establishment.id_lieu_phys || !Array.isArray(establishment.id_lieu_phys) || establishment.id_lieu_phys.length === 0) {
    errors.push('id_lieu_phys manquant ou invalide');
  }
  
  if (!establishment.nom_etab || establishment.nom_etab.trim() === '') {
    errors.push('nom_etab manquant ou vide');
  }
  
  // Vérifier que l'id_lieu_phys principal est valide
  const mainId = establishment.id_lieu_phys?.[0];
  if (!mainId || mainId.toString().trim() === '') {
    errors.push('id_lieu_phys principal invalide');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Nettoie et normalise un établissement
 */
function cleanEstablishment(establishment) {
  const mainId = establishment.id_lieu_phys?.[0]?.toString()?.trim();
  const nomEtab = establishment.nom_etab?.trim();
  
  // Si les champs critiques sont manquants, on ne peut pas nettoyer
  if (!mainId || !nomEtab) {
    return null;
  }
  
  return {
    // Anciens champs (requis pour la compatibilité)
    code: mainId,
    name: nomEtab,
    address: establishment.adresse?.trim() || null,
    codes: establishment.id_lieu_phys?.map(id => id.toString().trim()).filter(id => id) || [],
    category: establishment.catg_etab?.trim() || null,
    establishment_type: establishment.typ_etab?.trim() || null,
    region_code: establishment.cod_rss?.toString()?.trim() || null,
    region_name: establishment.nom_rss?.trim() || null,
    municipality: establishment.municipalite?.trim() || null,
    postal_code: establishment.cod_pos?.trim() || null,
    
    // Nouveaux champs RAMQ/RFP
    id_lieu_phys: mainId,
    nom_etab: nomEtab,
    adresse: establishment.adresse?.trim() || null,
    liste_no_etab_alternatifs: establishment.id_lieu_phys?.map(id => id.toString().trim()).filter(id => id) || [],
    catg_etab: establishment.catg_etab?.trim() || null,
    typ_etab: establishment.typ_etab?.trim() || null,
    cod_rss: establishment.cod_rss?.toString()?.trim() || null,
    nom_rss: establishment.nom_rss?.trim() || null,
    municipalite: establishment.municipalite?.trim() || null,
    cod_pos: establishment.cod_pos?.trim() || null,
    dd_lieu_phys: establishment.dd_lieu_phys?.[0] ? new Date(establishment.dd_lieu_phys[0]) : null,
    df_lieu_phys: establishment.df_lieu_phys?.[0] ? new Date(establishment.df_lieu_phys[0]) : null,
    calen_jour_ferie: establishment.calen_jour_ferie || null,
    is_active: true
  };
}

/**
 * Fonction principale d'import avec validation
 */
async function validateAndImportRamq() {
  try {
    console.log('🔄 Début de l\'import validé des établissements RAMQ...');
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
    console.log(`📊 ${establishments.length} établissements RAMQ à traiter`);
    
    // Valider et nettoyer les établissements
    console.log('🔍 Validation et nettoyage des données...');
    const validEstablishments = [];
    const invalidEstablishments = [];
    
    for (let i = 0; i < establishments.length; i++) {
      const establishment = establishments[i];
      const validation = validateEstablishment(establishment);
      
      if (validation.isValid) {
        const cleaned = cleanEstablishment(establishment);
        if (cleaned) {
          validEstablishments.push(cleaned);
        } else {
          invalidEstablishments.push({
            index: i,
            id: establishment.id_lieu_phys?.[0],
            errors: ['Impossible de nettoyer les données']
          });
        }
      } else {
        invalidEstablishments.push({
          index: i,
          id: establishment.id_lieu_phys?.[0],
          errors: validation.errors
        });
      }
      
      if ((i + 1) % 1000 === 0) {
        console.log(`✅ ${i + 1}/${establishments.length} établissements traités`);
      }
    }
    
    console.log(`\n📈 Résultats de la validation:`);
    console.log(`  ✅ Établissements valides: ${validEstablishments.length}`);
    console.log(`  ❌ Établissements invalides: ${invalidEstablishments.length}`);
    
    if (invalidEstablishments.length > 0) {
      console.log(`\n⚠️  Premiers établissements invalides:`);
      invalidEstablishments.slice(0, 10).forEach((invalid, idx) => {
        console.log(`  ${idx + 1}. ID: ${invalid.id} - Erreurs: ${invalid.errors.join(', ')}`);
      });
    }
    
    // Vider la table existante
    console.log('\n🗑️  Suppression des établissements existants...');
    await prisma.establishment.deleteMany({});
    
    // Importer les établissements valides
    console.log(`\n🔄 Import de ${validEstablishments.length} établissements valides...`);
    const batchSize = 100;
    let importedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < validEstablishments.length; i += batchSize) {
      const batch = validEstablishments.slice(i, i + batchSize);
      
      console.log(`🔄 Traitement du lot ${Math.floor(i/batchSize) + 1}/${Math.ceil(validEstablishments.length/batchSize)}...`);
      
      for (const establishment of batch) {
        try {
          await prisma.establishment.create({
            data: establishment
          });
          
          importedCount++;
          
        } catch (error) {
          errorCount++;
          if (error.code === 'P2002') {
            // Ignorer les doublons
            console.log(`⚠️  Doublon ignoré: ${establishment.id_lieu_phys}`);
          } else {
            console.error(`❌ Erreur pour l'établissement ${establishment.id_lieu_phys}:`, error.message);
          }
        }
      }
      
      // Afficher le progrès
      console.log(`✅ Lot ${Math.floor(i/batchSize) + 1} terminé: ${importedCount} établissements importés, ${errorCount} erreurs`);
    }
    
    console.log(`\n🎉 Import terminé! ${importedCount} établissements importés, ${errorCount} erreurs`);
    
    // Afficher les statistiques finales
    const totalCount = await prisma.establishment.count();
    console.log(`📊 Total d'établissements en base: ${totalCount}`);
    
    const stats = await prisma.establishment.groupBy({
      by: ['catg_etab', 'typ_etab'],
      _count: true,
      where: {
        catg_etab: { not: null },
        typ_etab: { not: null }
      }
    });
    
    console.log('\n📈 Statistiques par catégorie et type:');
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
    
    console.log('\n🔍 Champs critiques pour la validation RFP:');
    console.log(`  id_lieu_phys: ${criticalFieldsStats._count.id_lieu_phys}/${totalCount} (${((criticalFieldsStats._count.id_lieu_phys/totalCount)*100).toFixed(1)}%)`);
    console.log(`  catg_etab: ${criticalFieldsStats._count.catg_etab}/${totalCount} (${((criticalFieldsStats._count.catg_etab/totalCount)*100).toFixed(1)}%)`);
    console.log(`  typ_etab: ${criticalFieldsStats._count.typ_etab}/${totalCount} (${((criticalFieldsStats._count.typ_etab/totalCount)*100).toFixed(1)}%)`);
    console.log(`  calen_jour_ferie: ${criticalFieldsStats._count.calen_jour_ferie}/${totalCount} (${((criticalFieldsStats._count.calen_jour_ferie/totalCount)*100).toFixed(1)}%)`);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter l'import si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  validateAndImportRamq()
    .then(() => {
      console.log('✅ Import terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Import échoué:', error);
      process.exit(1);
    });
}

export { validateAndImportRamq };
