import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script de vérification des établissements après nettoyage
 */

async function verifyEstablishments() {
  try {
    console.log('🔍 Vérification des établissements après nettoyage...');
    
    // Compter le total d'établissements
    const totalCount = await prisma.establishment.count();
    console.log(`📊 Total des établissements: ${totalCount}`);
    
    // Vérifier les champs disponibles (en essayant de récupérer un échantillon)
    const sample = await prisma.establishment.findFirst({
      select: {
        id: true,
        id_lieu_phys: true,
        nom_etab: true,
        adresse: true,
        catg_etab: true,
        typ_etab: true,
        cod_rss: true,
        nom_rss: true,
        municipalite: true,
        cod_pos: true,
        dd_lieu_phys: true,
        df_lieu_phys: true,
        is_active: true,
        created_at: true,
        updated_at: true
      }
    });
    
    console.log('\n📋 Structure de l\'établissement (échantillon):');
    console.log(JSON.stringify(sample, null, 2));
    
    // Statistiques par type d'établissement
    const statsByType = await prisma.establishment.groupBy({
      by: ['typ_etab'],
      _count: {
        typ_etab: true
      }
    });
    
    console.log('\n📈 Répartition par type d\'établissement:');
    statsByType.forEach(stat => {
      console.log(`  ${stat.typ_etab || 'Non défini'}: ${stat._count.typ_etab} établissements`);
    });
    
    // Statistiques par catégorie
    const statsByCategory = await prisma.establishment.groupBy({
      by: ['catg_etab'],
      _count: {
        catg_etab: true
      },
      orderBy: {
        _count: {
          catg_etab: 'desc'
        }
      },
      take: 10
    });
    
    console.log('\n🏥 Top 10 catégories d\'établissements:');
    statsByCategory.forEach(stat => {
      console.log(`  ${stat.catg_etab || 'Non défini'}: ${stat._count.catg_etab} établissements`);
    });
    
    // Vérifier les champs critiques
    const criticalFields = await prisma.establishment.findMany({
      where: {
        OR: [
          { id_lieu_phys: null },
          { catg_etab: null },
          { typ_etab: null }
        ]
      },
      select: {
        id: true,
        id_lieu_phys: true,
        catg_etab: true,
        typ_etab: true
      },
      take: 5
    });
    
    if (criticalFields.length > 0) {
      console.log('\n⚠️  Établissements avec champs critiques manquants:');
      criticalFields.forEach(est => {
        console.log(`  ID ${est.id}: id_lieu_phys=${est.id_lieu_phys}, catg_etab=${est.catg_etab}, typ_etab=${est.typ_etab}`);
      });
    } else {
      console.log('\n✅ Tous les champs critiques sont présents');
    }
    
    console.log('\n🎉 Vérification terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter la vérification
verifyEstablishments()
  .then(() => {
    console.log('✅ Vérification terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Vérification échouée:', error);
    process.exit(1);
  });
