import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

/**
 * Script d'import des codes de facturation RAMQ dans la base de données
 * 
 * Ce script lit le fichier billing-codes.json généré par extract-ramq-data.js
 * et importe tous les codes de facturation dans la table BillingCode
 */

const BILLING_CODES_FILE = path.join(__dirname, '../../ramq-xml/parsed/specialist/billing-codes.json');

/**
 * Convertir une date string en objet Date
 */
function parseDate(dateString) {
  if (!dateString) return null;
  return new Date(dateString);
}

/**
 * Importer un code de facturation dans la base de données
 */
async function importBillingCode(billingCodeData) {
  try {
    const billingCode = await prisma.billingCode.create({
      data: {
        cod_fact: billingCodeData.cod_fact,
        des_cod_fact: billingCodeData.des_cod_fact,
        typ_cod_fact: billingCodeData.typ_cod_fact,
        dd_effec_cod_fact: parseDate(billingCodeData.dd_effec_cod_fact),
        df_effec_cod_fact: parseDate(billingCodeData.df_effec_cod_fact),
        
        // Liste des attributs (liste_attri)
        en_cab_seulm: billingCodeData.liste_attri?.en_cab_seulm || null,
        en_etab_seulm: billingCodeData.liste_attri?.en_etab_seulm || null,
        ind_no_autor_req: billingCodeData.liste_attri?.ind_no_autor_req || null,
        
        // Liste des éléments mesurables (liste_elm_mesur)
        liste_elm_mesur: billingCodeData.liste_elm_mesur || [],
        
        // Liste des rôles spécialisés (liste_role_spec)
        liste_role_spec: billingCodeData.liste_role_spec || [],
        
        // Liste des périodes d'âge (liste_perio_age)
        liste_perio_age: billingCodeData.liste_perio_age || []
      }
    });
    
    return billingCode;
  } catch (error) {
    console.error(`❌ Erreur lors de l'import du code ${billingCodeData.cod_fact}:`, error.message);
    throw error;
  }
}

/**
 * Fonction principale d'import
 */
async function importBillingCodes() {
  try {
    console.log('🚀 Début de l\'import des codes de facturation...');
    
    // Vérifier que le fichier existe
    if (!fs.existsSync(BILLING_CODES_FILE)) {
      throw new Error(`Fichier non trouvé: ${BILLING_CODES_FILE}`);
    }
    
    // Lire le fichier JSON
    console.log('📖 Lecture du fichier billing-codes.json...');
    const fileContent = fs.readFileSync(BILLING_CODES_FILE, 'utf8');
    const data = JSON.parse(fileContent);
    
    const billingCodes = data.billing_codes;
    console.log(`📊 ${billingCodes.length} codes de facturation à importer`);
    
    // Vider la table existante
    console.log('🗑️  Suppression des codes de facturation existants...');
    await prisma.billingCode.deleteMany({});
    
    // Importer les codes par lots
    const batchSize = 100;
    let imported = 0;
    let errors = 0;
    
    for (let i = 0; i < billingCodes.length; i += batchSize) {
      const batch = billingCodes.slice(i, i + batchSize);
      
      console.log(`📦 Import du lot ${Math.floor(i / batchSize) + 1}/${Math.ceil(billingCodes.length / batchSize)} (${batch.length} codes)`);
      
      for (const billingCodeData of batch) {
        try {
          await importBillingCode(billingCodeData);
          imported++;
        } catch (error) {
          errors++;
          console.error(`❌ Erreur pour le code ${billingCodeData.cod_fact}:`, error.message);
        }
      }
      
      // Afficher le progrès
      const progress = Math.round((imported + errors) / billingCodes.length * 100);
      console.log(`📈 Progrès: ${progress}% (${imported} importés, ${errors} erreurs)`);
    }
    
    console.log('\n🎉 Import terminé!');
    console.log(`✅ ${imported} codes de facturation importés avec succès`);
    if (errors > 0) {
      console.log(`❌ ${errors} erreurs rencontrées`);
    }
    
    // Vérifier l'import
    const totalInDb = await prisma.billingCode.count();
    console.log(`📊 Total dans la base de données: ${totalInDb} codes`);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter l'import si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  importBillingCodes()
    .then(() => {
      console.log('✅ Import terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Import échoué:', error);
      process.exit(1);
    });
}

export { importBillingCodes };
