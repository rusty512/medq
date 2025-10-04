import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script principal pour configurer les établissements RAMQ
 * Orchestre la migration et l'import des données
 */

const prisma = new PrismaClient();

/**
 * Exécute la migration SQL pour ajouter les nouveaux champs
 */
async function executeMigrationSQL() {
  try {
    console.log('🔄 Exécution de la migration SQL...');
    
    // Ajouter les nouveaux champs un par un
    const migrations = [
      'ALTER TABLE "Establishment" ADD COLUMN "id_lieu_phys" TEXT',
      'ALTER TABLE "Establishment" ADD COLUMN "nom_etab" TEXT',
      'ALTER TABLE "Establishment" ADD COLUMN "adresse" TEXT',
      'ALTER TABLE "Establishment" ADD COLUMN "liste_no_etab_alternatifs" TEXT[] DEFAULT \'{}\'',
      'ALTER TABLE "Establishment" ADD COLUMN "catg_etab" TEXT',
      'ALTER TABLE "Establishment" ADD COLUMN "typ_etab" TEXT',
      'ALTER TABLE "Establishment" ADD COLUMN "cod_rss" TEXT',
      'ALTER TABLE "Establishment" ADD COLUMN "nom_rss" TEXT',
      'ALTER TABLE "Establishment" ADD COLUMN "municipalite" TEXT',
      'ALTER TABLE "Establishment" ADD COLUMN "cod_pos" TEXT',
      'ALTER TABLE "Establishment" ADD COLUMN "dd_lieu_phys" DATE',
      'ALTER TABLE "Establishment" ADD COLUMN "df_lieu_phys" DATE',
      'ALTER TABLE "Establishment" ADD COLUMN "calen_jour_ferie" JSONB'
    ];
    
    for (const migration of migrations) {
      try {
        await prisma.$executeRawUnsafe(migration);
        console.log(`✅ ${migration.split(' ')[2]} ajouté`);
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate column')) {
          console.log(`ℹ️  ${migration.split(' ')[2]} existe déjà`);
        } else {
          throw error;
        }
      }
    }
    
    // Créer l'index unique
    try {
      await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX "Establishment_id_lieu_phys_key" ON "Establishment"("id_lieu_phys")');
      console.log('✅ Index unique créé');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Index unique existe déjà');
      } else {
        throw error;
      }
    }
    
    console.log('✅ Migration SQL exécutée avec succès');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration SQL:', error);
    throw error;
  }
}

/**
 * Migre les données existantes vers les nouveaux champs
 */
async function migrateExistingData() {
  try {
    console.log('🔄 Migration des données existantes...');
    
    const existingEstablishments = await prisma.establishment.findMany();
    
    if (existingEstablishments.length === 0) {
      console.log('ℹ️  Aucune donnée existante à migrer');
      return;
    }
    
    console.log(`📊 ${existingEstablishments.length} établissements existants à migrer`);
    
    let migratedCount = 0;
    
    for (const establishment of existingEstablishments) {
      try {
        // Utiliser une requête SQL directe pour mettre à jour les nouveaux champs
        await prisma.$executeRawUnsafe(`
          UPDATE "Establishment" 
          SET 
            "id_lieu_phys" = $1,
            "nom_etab" = $2,
            "adresse" = $3,
            "liste_no_etab_alternatifs" = $4,
            "catg_etab" = $5,
            "typ_etab" = $6,
            "cod_rss" = $7,
            "nom_rss" = $8,
            "municipalite" = $9,
            "cod_pos" = $10
          WHERE "id" = $11
        `, 
          establishment.code,
          establishment.name,
          establishment.address,
          establishment.codes || [],
          establishment.category,
          establishment.establishment_type,
          establishment.region_code,
          establishment.region_name,
          establishment.municipality,
          establishment.postal_code,
          establishment.id
        );
        
        migratedCount++;
        
        if (migratedCount % 100 === 0) {
          console.log(`✅ ${migratedCount}/${existingEstablishments.length} établissements migrés`);
        }
      } catch (error) {
        console.error(`❌ Erreur lors de la migration de l'établissement ${establishment.id}:`, error.message);
      }
    }
    
    console.log(`🎉 Migration des données terminée! ${migratedCount} établissements migrés`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration des données:', error);
    throw error;
  }
}

/**
 * Importe les données RAMQ depuis le fichier JSON
 */
async function importRamqData() {
  try {
    console.log('🔄 Import des données RAMQ...');
    
    const establishmentsFile = path.join(__dirname, '../../ramq-xml/parsed/specialist/establishments.json');
    
    if (!fs.existsSync(establishmentsFile)) {
      console.log('⚠️  Fichier des établissements RAMQ non trouvé, passage de l\'import...');
      return;
    }
    
    const jsonData = JSON.parse(fs.readFileSync(establishmentsFile, 'utf8'));
    const establishments = jsonData.establishments || [];
    
    console.log(`📊 ${establishments.length} établissements RAMQ à importer`);
    
    // Vider la table et importer les nouvelles données
    await prisma.establishment.deleteMany({});
    
    const batchSize = 100;
    let importedCount = 0;
    
    for (let i = 0; i < establishments.length; i += batchSize) {
      const batch = establishments.slice(i, i + batchSize);
      
      for (const establishment of batch) {
        try {
          // Préparer les données pour l'insertion
          const calenJourFerie = establishment.calen_jour_ferie ? JSON.stringify(establishment.calen_jour_ferie) : null;
          
          // Utiliser une requête SQL avec cast JSONB explicite
          await prisma.$executeRawUnsafe(`
            INSERT INTO "Establishment" (
              "id_lieu_phys", "nom_etab", "adresse", "liste_no_etab_alternatifs",
              "catg_etab", "typ_etab", "cod_rss", "nom_rss", "municipalite", "cod_pos",
              "dd_lieu_phys", "df_lieu_phys", "calen_jour_ferie", "is_active",
              "created_at", "updated_at"
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, $14, NOW(), NOW()
            )
          `,
            establishment.id_lieu_phys?.[0]?.toString() || null,
            establishment.nom_etab || 'N/A',
            establishment.adresse || null,
            establishment.id_lieu_phys?.map(id => id.toString()) || [],
            establishment.catg_etab || null,
            establishment.typ_etab || null,
            establishment.cod_rss?.toString() || null,
            establishment.nom_rss || null,
            establishment.municipalite || null,
            establishment.cod_pos || null,
            establishment.dd_lieu_phys?.[0] ? new Date(establishment.dd_lieu_phys[0]) : null,
            establishment.df_lieu_phys?.[0] ? new Date(establishment.df_lieu_phys[0]) : null,
            calenJourFerie,
            true
          );
          
          importedCount++;
        } catch (error) {
          if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
            // Ignorer les doublons
            continue;
          } else if (error.message.includes('jsonb')) {
            // Essayer sans le champ JSONB pour les établissements problématiques
            try {
              await prisma.$executeRawUnsafe(`
                INSERT INTO "Establishment" (
                  "id_lieu_phys", "nom_etab", "adresse", "liste_no_etab_alternatifs",
                  "catg_etab", "typ_etab", "cod_rss", "nom_rss", "municipalite", "cod_pos",
                  "dd_lieu_phys", "df_lieu_phys", "is_active", "created_at", "updated_at"
                ) VALUES (
                  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW()
                )
              `,
                establishment.id_lieu_phys?.[0]?.toString() || null,
                establishment.nom_etab || 'N/A',
                establishment.adresse || null,
                establishment.id_lieu_phys?.map(id => id.toString()) || [],
                establishment.catg_etab || null,
                establishment.typ_etab || null,
                establishment.cod_rss?.toString() || null,
                establishment.nom_rss || null,
                establishment.municipalite || null,
                establishment.cod_pos || null,
                establishment.dd_lieu_phys?.[0] ? new Date(establishment.dd_lieu_phys[0]) : null,
                establishment.df_lieu_phys?.[0] ? new Date(establishment.df_lieu_phys[0]) : null,
                true
              );
              importedCount++;
            } catch (retryError) {
              console.error(`❌ Erreur persistante pour l'établissement ${establishment.id_lieu_phys?.[0]}:`, retryError.message);
            }
          } else {
            console.error(`❌ Erreur lors de l'import de l'établissement:`, error.message);
          }
        }
      }
      
      if (importedCount % 1000 === 0) {
        console.log(`✅ ${importedCount}/${establishments.length} établissements importés`);
      }
    }
    
    console.log(`🎉 Import RAMQ terminé! ${importedCount} établissements importés`);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'import RAMQ:', error);
    throw error;
  }
}

/**
 * Affiche les statistiques finales
 */
async function displayFinalStats() {
  try {
    console.log('\n📈 Statistiques finales:');
    
    const totalCount = await prisma.establishment.count();
    console.log(`📊 Total d'établissements: ${totalCount}`);
    
    const stats = await prisma.establishment.groupBy({
      by: ['catg_etab', 'typ_etab'],
      _count: true,
      where: {
        catg_etab: { not: null },
        typ_etab: { not: null }
      }
    });
    
    console.log('\n📊 Répartition par catégorie et type:');
    stats.forEach(stat => {
      console.log(`  ${stat.catg_etab} (${stat.typ_etab}): ${stat._count} établissements`);
    });
    
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
    console.error('❌ Erreur lors de l\'affichage des statistiques:', error);
  }
}

/**
 * Fonction principale
 */
async function setupRamqEstablishments() {
  try {
    console.log('🚀 Début de la configuration des établissements RAMQ...');
    
    // 1. Exécuter la migration SQL
    await executeMigrationSQL();
    
    // 2. Migrer les données existantes (si nécessaire)
    await migrateExistingData();
    
    // 3. Importer les données RAMQ
    await importRamqData();
    
    // 4. Afficher les statistiques finales
    await displayFinalStats();
    
    console.log('\n🎉 Configuration des établissements RAMQ terminée avec succès!');
    console.log('\n📋 Prochaines étapes:');
    console.log('  1. Vérifier que tous les champs critiques sont présents');
    console.log('  2. Tester la validation RFP avec les nouveaux champs');
    console.log('  3. Mettre à jour les services de facturation pour utiliser les nouveaux champs');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la configuration si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  setupRamqEstablishments()
    .then(() => {
      console.log('✅ Configuration terminée avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Configuration échouée:', error);
      process.exit(1);
    });
}

export { setupRamqEstablishments };
