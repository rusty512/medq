import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script de test pour vérifier la structure des codes de facturation
 * et s'assurer que tous les champs sont correctement extraits
 */

const BILLING_CODES_FILE = path.join(__dirname, '../../ramq-xml/parsed/specialist/billing-codes.json');

/**
 * Analyser la structure des codes de facturation
 */
function analyzeBillingCodesStructure() {
  try {
    console.log('🔍 Analyse de la structure des codes de facturation...');
    
    // Lire le fichier JSON
    const fileContent = fs.readFileSync(BILLING_CODES_FILE, 'utf8');
    const data = JSON.parse(fileContent);
    
    const billingCodes = data.billing_codes;
    console.log(`📊 ${billingCodes.length} codes de facturation trouvés`);
    
    // Analyser le premier code pour voir la structure
    const firstCode = billingCodes[0];
    console.log('\n📋 Structure du premier code de facturation:');
    console.log(JSON.stringify(firstCode, null, 2));
    
    // Compter les champs avec des dates de fin d'effet
    let codesWithEndDates = 0;
    let rolesWithEndDates = 0;
    let elementsWithEndDates = 0;
    
    billingCodes.forEach(code => {
      // Vérifier df_effec_cod_fact
      if (code.df_effec_cod_fact) {
        codesWithEndDates++;
      }
      
      // Vérifier df_effec_role dans les rôles spécialisés
      if (code.liste_role_spec) {
        code.liste_role_spec.forEach(role => {
          if (role.df_effec_role) {
            rolesWithEndDates++;
          }
        });
      }
      
      // Vérifier df_effec_elm_mesur dans les éléments mesurables
      if (code.liste_elm_mesur) {
        code.liste_elm_mesur.forEach(elm => {
          if (elm.df_effec_elm_mesur) {
            elementsWithEndDates++;
          }
        });
      }
    });
    
    console.log('\n📈 Statistiques des dates de fin d\'effet:');
    console.log(`  - Codes avec df_effec_cod_fact: ${codesWithEndDates}`);
    console.log(`  - Rôles avec df_effec_role: ${rolesWithEndDates}`);
    console.log(`  - Éléments avec df_effec_elm_mesur: ${elementsWithEndDates}`);
    
    // Vérifier les types de codes de facturation
    const typeCounts = {};
    billingCodes.forEach(code => {
      const type = code.typ_cod_fact || 'Non spécifié';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    console.log('\n📊 Types de codes de facturation:');
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });
    
    // Vérifier les attributs
    let codesWithCabinetOnly = 0;
    let codesWithEstablishmentOnly = 0;
    let codesWithAuthRequired = 0;
    
    billingCodes.forEach(code => {
      if (code.liste_attri) {
        if (code.liste_attri.en_cab_seulm) codesWithCabinetOnly++;
        if (code.liste_attri.en_etab_seulm) codesWithEstablishmentOnly++;
        if (code.liste_attri.ind_no_autor_req) codesWithAuthRequired++;
      }
    });
    
    console.log('\n🏥 Attributs des codes:');
    console.log(`  - En cabinet seulement: ${codesWithCabinetOnly}`);
    console.log(`  - En établissement seulement: ${codesWithEstablishmentOnly}`);
    console.log(`  - Autorisation requise: ${codesWithAuthRequired}`);
    
    // Exemples de codes avec dates de fin
    console.log('\n📅 Exemples de codes avec dates de fin d\'effet:');
    const codesWithEndDatesExamples = billingCodes.filter(code => code.df_effec_cod_fact);
    if (codesWithEndDatesExamples.length > 0) {
      console.log(`Code ${codesWithEndDatesExamples[0].cod_fact}: ${codesWithEndDatesExamples[0].df_effec_cod_fact}`);
    }
    
    console.log('\n✅ Analyse terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
    throw error;
  }
}

// Exécuter l'analyse si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    analyzeBillingCodesStructure();
    console.log('✅ Analyse terminée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Analyse échouée:', error);
    process.exit(1);
  }
}

export { analyzeBillingCodesStructure };
