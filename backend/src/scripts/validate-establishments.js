import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script de validation du fichier JSON des établissements
 * Vérifie que tous les champs critiques pour la facturation RFP sont présents
 */

const ESTABLISHMENTS_FILE = path.join(__dirname, '../../ramq-xml/parsed/specialist/establishments.json');

// Champs critiques requis pour la validation RFP
const REQUIRED_FIELDS = [
  'id_lieu_phys',    // Identifiant du lieu physique
  'catg_etab',       // Catégorie d'établissement
  'typ_etab',        // Type d'établissement
  'calen_jour_ferie' // Calendrier des jours fériés
];

// Champs descriptifs recommandés
const RECOMMENDED_FIELDS = [
  'nom_etab',        // Nom de l'établissement
  'cod_pos',         // Code postal
  'dd_lieu_phys',    // Date de début d'effectivité
  'df_lieu_phys'     // Date de fin d'effectivité
];

/**
 * Valide un établissement individuel
 * @param {Object} establishment - Objet établissement à valider
 * @param {number} index - Index de l'établissement dans la liste
 * @returns {Object} Résultat de la validation
 */
function validateEstablishment(establishment, index) {
  const errors = [];
  const warnings = [];
  
  // Vérifier les champs critiques
  REQUIRED_FIELDS.forEach(field => {
    if (!establishment[field]) {
      errors.push(`Champ critique manquant: ${field}`);
    } else if (field === 'id_lieu_phys' && (!Array.isArray(establishment[field]) || establishment[field].length === 0)) {
      errors.push(`Champ id_lieu_phys doit être un tableau non vide`);
    } else if (field === 'calen_jour_ferie' && !Array.isArray(establishment[field])) {
      errors.push(`Champ calen_jour_ferie doit être un tableau`);
    }
  });
  
  // Vérifier les champs recommandés
  RECOMMENDED_FIELDS.forEach(field => {
    if (!establishment[field]) {
      warnings.push(`Champ recommandé manquant: ${field}`);
    }
  });
  
  // Vérifier les valeurs spécifiques
  if (establishment.typ_etab && !['CAB', 'ETAB'].includes(establishment.typ_etab)) {
    warnings.push(`Type d'établissement inattendu: ${establishment.typ_etab}`);
  }
  
  // Vérifier la structure des jours fériés
  if (establishment.calen_jour_ferie && Array.isArray(establishment.calen_jour_ferie)) {
    establishment.calen_jour_ferie.forEach((holiday, holidayIndex) => {
      if (!holiday.date || !holiday.type) {
        errors.push(`Jour férié ${holidayIndex} mal formaté: ${JSON.stringify(holiday)}`);
      }
    });
  }
  
  return {
    index,
    errors,
    warnings,
    isValid: errors.length === 0
  };
}

/**
 * Fonction principale de validation
 */
async function validateEstablishments() {
  try {
    console.log('🔍 Début de la validation des établissements...');
    console.log(`📁 Fichier: ${ESTABLISHMENTS_FILE}`);
    
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
    console.log(`📊 Validation de ${establishments.length} établissements...`);
    
    // Valider chaque établissement
    const validationResults = [];
    let validCount = 0;
    let errorCount = 0;
    let warningCount = 0;
    
    establishments.forEach((establishment, index) => {
      const result = validateEstablishment(establishment, index);
      validationResults.push(result);
      
      if (result.isValid) {
        validCount++;
      } else {
        errorCount++;
      }
      
      warningCount += result.warnings.length;
      
      // Afficher les erreurs critiques
      if (result.errors.length > 0) {
        console.error(`❌ Établissement ${index + 1}: ${result.errors.join(', ')}`);
      }
    });
    
    // Afficher les statistiques
    console.log('\n📈 Résultats de la validation:');
    console.log(`✅ Établissements valides: ${validCount}/${establishments.length} (${((validCount/establishments.length)*100).toFixed(1)}%)`);
    console.log(`❌ Établissements avec erreurs: ${errorCount}/${establishments.length} (${((errorCount/establishments.length)*100).toFixed(1)}%)`);
    console.log(`⚠️  Total d'avertissements: ${warningCount}`);
    
    // Afficher les statistiques par type
    const typeStats = {};
    const categoryStats = {};
    
    establishments.forEach(etab => {
      typeStats[etab.typ_etab] = (typeStats[etab.typ_etab] || 0) + 1;
      categoryStats[etab.catg_etab] = (categoryStats[etab.catg_etab] || 0) + 1;
    });
    
    console.log('\n📊 Répartition par type:');
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} (${((count/establishments.length)*100).toFixed(1)}%)`);
    });
    
    console.log('\n📊 Répartition par catégorie:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} (${((count/establishments.length)*100).toFixed(1)}%)`);
    });
    
    // Vérifier la présence des champs critiques
    console.log('\n🔍 Vérification des champs critiques:');
    REQUIRED_FIELDS.forEach(field => {
      const presentCount = establishments.filter(etab => etab[field]).length;
      const percentage = ((presentCount/establishments.length)*100).toFixed(1);
      const status = presentCount === establishments.length ? '✅' : '⚠️';
      console.log(`  ${status} ${field}: ${presentCount}/${establishments.length} (${percentage}%)`);
    });
    
    // Résumé final
    if (errorCount === 0) {
      console.log('\n🎉 Validation réussie! Tous les établissements sont valides.');
    } else {
      console.log(`\n⚠️  Validation terminée avec ${errorCount} erreurs.`);
    }
    
    return {
      total: establishments.length,
      valid: validCount,
      errors: errorCount,
      warnings: warningCount,
      results: validationResults
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de la validation:', error.message);
    process.exit(1);
  }
}

// Exécuter la validation si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  validateEstablishments();
}

export { validateEstablishments, validateEstablishment };
