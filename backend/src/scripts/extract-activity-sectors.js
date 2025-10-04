import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script d'extraction des secteurs d'activité RAMQ
 * Conformité : Conserve les noms de balises XML exacts
 */

const XML_DIR = path.join(__dirname, '../../ramq-xml/xml');
const OUTPUT_DIR = path.join(__dirname, '../../ramq-xml/parsed/specialist');

// Configuration du parser XML
const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  parseAttributeValue: true,
  parseNodeValue: true,
  parseTrueNumberOnly: false,
  arrayMode: false,
  trimValues: true
};

const parser = new XMLParser(parserOptions);

/**
 * Créer le répertoire de sortie s'il n'existe pas
 */
function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

/**
 * Sauvegarder les données extraites en JSON
 */
function saveJsonData(filename, data) {
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ ${filename} sauvegardé (${data.activity_sectors?.length || 0} secteurs)`);
}

/**
 * Extraire les secteurs d'activité (secteurActivite_Specialiste.xml)
 */
function extractActivitySectors() {
  console.log('🔄 Extraction des secteurs d\'activité...');
  
  const xmlFile = path.join(XML_DIR, 'secteurActivite_Specialiste_V257_20250613.xml');
  const xmlContent = fs.readFileSync(xmlFile, 'utf8');
  const jsonData = parser.parse(xmlContent);
  
  console.log('🔍 Structure XML détectée:', Object.keys(jsonData));
  
  const sectors = [];
  const rootData = jsonData.sect_activ;
  
  if (rootData && rootData.val_no_sect_activ) {
    const sectorList = Array.isArray(rootData.val_no_sect_activ) 
      ? rootData.val_no_sect_activ 
      : [rootData.val_no_sect_activ];
    
    console.log(`📊 ${sectorList.length} secteurs trouvés`);
    
    for (const sector of sectorList) {
      const sectorData = {
        no_sect_activ: sector.no_sect_activ,
        des_sect_activ: sector.des_sect_activ,
        dd_effec_sect_activ: sector.dd_effec_sect_activ,
        df_effec_sect_activ: sector.df_effec_sect_activ,
        liste_catg_etab: []
      };
      
      // Extraire la liste des catégories d'établissement
      if (sector.liste_catg_etab) {
        // La structure est différente - les catégories sont directement dans liste_catg_etab
        const catgElements = sector.liste_catg_etab.catg_etab || [];
        const ddElements = sector.liste_catg_etab.dd_catg_etab || [];
        
        // Combiner les catégories avec leurs dates
        for (let i = 0; i < catgElements.length; i++) {
          sectorData.liste_catg_etab.push({
            catg_etab: catgElements[i],
            dd_effec_catg_etab: ddElements[i] || null,
            df_effec_catg_etab: null // Pas de date de fin dans ce fichier
          });
        }
      }
      
      sectors.push(sectorData);
    }
  }
  
  const output = {
    metadata: {
      source_file: 'secteurActivite_Specialiste_V257_20250613.xml',
      extraction_date: new Date().toISOString(),
      total_sectors: sectors.length,
      version: "1.0",
      description: "Secteurs d'activité RAMQ pour la validation des actes de spécialistes"
    },
    activity_sectors: sectors
  };
  
  saveJsonData('activity-sectors.json', output);
  return output;
}

/**
 * Fonction principale d'extraction
 */
async function extractActivitySectorsData() {
  try {
    console.log('🚀 Début de l\'extraction des secteurs d\'activité RAMQ...');
    console.log('📁 Répertoire XML:', XML_DIR);
    console.log('📁 Répertoire de sortie:', OUTPUT_DIR);
    
    ensureOutputDir();
    
    const result = extractActivitySectors();
    
    console.log('\n🎉 Extraction terminée avec succès!');
    console.log(`📊 ${result.activity_sectors.length} secteurs d'activité extraits`);
    
    // Afficher un échantillon
    if (result.activity_sectors.length > 0) {
      console.log('\n🔍 Échantillon des secteurs:');
      result.activity_sectors.slice(0, 3).forEach((sector, i) => {
        console.log(`  ${i+1}. ${sector.no_sect_activ}: ${sector.des_sect_activ}`);
        console.log(`     Catégories: ${sector.liste_catg_etab.map(c => c.catg_etab).join(', ')}`);
      });
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'extraction:', error);
    throw error;
  }
}

// Exécuter l'extraction si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  extractActivitySectorsData()
    .then(() => {
      console.log('✅ Extraction terminée avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Extraction échouée:', error);
      process.exit(1);
    });
}

export { extractActivitySectorsData };
