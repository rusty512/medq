import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

/**
 * Script d'import des éléments de contexte RAMQ dans la base de données
 * 
 * Ce script lit le fichier context-elements.json généré par extract-ramq-data.js
 * et importe tous les éléments de contexte dans la table ContextElement
 */

const CONTEXT_ELEMENTS_FILE = path.join(__dirname, '../../ramq-xml/parsed/specialist/context-elements.json');

/**
 * Convertir une date string en objet Date
 */
function parseDate(dateString) {
  if (!dateString) return null;
  return new Date(dateString);
}

/**
 * Importer un élément de contexte dans la base de données
 */
async function importContextElement(contextElementData) {
  try {
    const contextElement = await prisma.contextElement.upsert({
      where: {
        cod_elm_contx: contextElementData.cod_elm_contx
      },
      update: {
        txt_elm_contx: contextElementData.txt_elm_contx,
        cod_niv: contextElementData.cod_niv,
        dd_effec_elm_contx: parseDate(contextElementData.dd_effec_elm_contx),
        liste_util_elm_contx: contextElementData.liste_util_elm_contx || []
      },
      create: {
        cod_elm_contx: contextElementData.cod_elm_contx,
        txt_elm_contx: contextElementData.txt_elm_contx,
        cod_niv: contextElementData.cod_niv,
        dd_effec_elm_contx: parseDate(contextElementData.dd_effec_elm_contx),
        liste_util_elm_contx: contextElementData.liste_util_elm_contx || []
      }
    });
    
    return contextElement;
  } catch (error) {
    console.error(`❌ Erreur lors de l'import de l'élément ${contextElementData.cod_elm_contx}:`, error.message);
    throw error;
  }
}

/**
 * Fonction principale d'import
 */
async function importContextElements() {
  try {
    console.log('🚀 Début de l\'import des éléments de contexte...');
    
    // Vérifier que le fichier existe
    if (!fs.existsSync(CONTEXT_ELEMENTS_FILE)) {
      throw new Error(`Fichier non trouvé: ${CONTEXT_ELEMENTS_FILE}`);
    }
    
    // Lire le fichier JSON
    console.log('📖 Lecture du fichier context-elements.json...');
    const fileContent = fs.readFileSync(CONTEXT_ELEMENTS_FILE, 'utf8');
    const data = JSON.parse(fileContent);
    
    const contextElements = data.context_elements;
    console.log(`📊 ${contextElements.length} éléments de contexte à importer`);
    
    // Vider la table existante
    console.log('🗑️  Suppression des éléments de contexte existants...');
    await prisma.contextElement.deleteMany({});
    
    // Importer les éléments par lots
    const batchSize = 50;
    let imported = 0;
    let errors = 0;
    
    for (let i = 0; i < contextElements.length; i += batchSize) {
      const batch = contextElements.slice(i, i + batchSize);
      
      console.log(`📦 Import du lot ${Math.floor(i / batchSize) + 1}/${Math.ceil(contextElements.length / batchSize)} (${batch.length} éléments)`);
      
      for (const contextElementData of batch) {
        try {
          await importContextElement(contextElementData);
          imported++;
        } catch (error) {
          errors++;
          console.error(`❌ Erreur pour l'élément ${contextElementData.cod_elm_contx}:`, error.message);
        }
      }
      
      // Afficher le progrès
      const progress = Math.round((imported + errors) / contextElements.length * 100);
      console.log(`📈 Progrès: ${progress}% (${imported} importés, ${errors} erreurs)`);
    }
    
    console.log('\n🎉 Import terminé!');
    console.log(`✅ ${imported} éléments de contexte importés avec succès`);
    if (errors > 0) {
      console.log(`❌ ${errors} erreurs rencontrées`);
    }
    
    // Vérifier l'import
    const totalInDb = await prisma.contextElement.count();
    console.log(`📊 Total dans la base de données: ${totalInDb} éléments`);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter l'import si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  importContextElements()
    .then(() => {
      console.log('✅ Import terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Import échoué:', error);
      process.exit(1);
    });
}

export { importContextElements };
