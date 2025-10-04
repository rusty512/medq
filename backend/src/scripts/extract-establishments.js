import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script d'extraction des établissements RAMQ
 * Extrait les données du fichier infoEtablissement_V444_20250613.xml
 * et génère un fichier JSON avec les champs critiques pour la facturation RFP
 */

const XML_FILE_PATH = path.join(__dirname, '../../ramq-xml/xml/infoEtablissement_V444_20250613.xml');
const OUTPUT_FILE_PATH = path.join(__dirname, '../../ramq-xml/parsed/specialist/establishments.json');

// Configuration du parser XML
const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseAttributeValue: true,
  parseNodeValue: true,
  parseTrueNumberOnly: false,
  arrayMode: false,
  trimValues: true,
  cdataTagName: '__cdata',
  cdataPositionChar: '\\c'
};

/**
 * Extrait les jours fériés d'un calendrier
 * @param {Object} calenJourFerie - Objet contenant les jours fériés
 * @returns {Array} Liste des jours fériés formatés
 */
function extractHolidays(calenJourFerie) {
  if (!calenJourFerie) return [];
  
  const holidays = [];
  
  // Gérer le cas où calenJourFerie est un tableau
  const calendars = Array.isArray(calenJourFerie) ? calenJourFerie : [calenJourFerie];
  
  calendars.forEach(calendar => {
    if (calendar.liste_jour_ferie && calendar.liste_jour_ferie.jr_ferie) {
      const jrFerie = Array.isArray(calendar.liste_jour_ferie.jr_ferie) 
        ? calendar.liste_jour_ferie.jr_ferie 
        : [calendar.liste_jour_ferie.jr_ferie];
      
      jrFerie.forEach(holiday => {
        if (holiday.dt_jr_ferie && holiday.typ_jr_ferie) {
          holidays.push({
            date: holiday.dt_jr_ferie,
            type: parseInt(holiday.typ_jr_ferie)
          });
        }
      });
    }
  });
  
  return holidays;
}

/**
 * Extrait les numéros d'établissement
 * @param {Object} listeNoEtab - Objet contenant les numéros d'établissement
 * @returns {Array} Liste des numéros d'établissement avec leurs dates
 */
function extractEstablishmentNumbers(listeNoEtab) {
  if (!listeNoEtab || !listeNoEtab.no_etab) return [];
  
  const noEtab = Array.isArray(listeNoEtab.no_etab) 
    ? listeNoEtab.no_etab 
    : [listeNoEtab.no_etab];
  
  return noEtab.map(etab => ({
    id_lieu_phys: etab.id_lieu_phys,
    dd_lieu_phys: etab.dd_lieu_phys,
    df_lieu_phys: etab.df_lieu_phys || null
  }));
}

/**
 * Traite un établissement et extrait les champs critiques
 * @param {Object} valEtab - Objet établissement du XML
 * @returns {Object} Établissement formaté pour le JSON
 */
function processEstablishment(valEtab) {
  // Extraire les numéros d'établissement
  const establishmentNumbers = extractEstablishmentNumbers(valEtab.liste_no_etab);
  
  // Extraire les jours fériés
  const holidays = extractHolidays(valEtab.liste_calen_jour_ferie?.calen_jour_ferie);
  
  // Construire l'objet établissement avec les champs critiques
  const establishment = {
    // Champs critiques pour la validation RFP
    id_lieu_phys: establishmentNumbers.map(n => n.id_lieu_phys),
    catg_etab: valEtab.catg_etab,
    typ_etab: valEtab.typ_etab,
    calen_jour_ferie: holidays,
    
    // Champs descriptifs
    nom_etab: valEtab.nom_etab?.['#text'] || valEtab.nom_etab,
    cod_pos: valEtab.cod_pos,
    
    // Dates d'effectivité
    dd_lieu_phys: establishmentNumbers.map(n => n.dd_lieu_phys),
    df_lieu_phys: establishmentNumbers.map(n => n.df_lieu_phys).filter(d => d !== null),
    
    // Informations supplémentaires
    cod_rss: valEtab.cod_rss,
    nom_rss: valEtab.nom_rss?.['#text'] || valEtab.nom_rss,
    adresse: valEtab.adresse?.['#text'] || valEtab.adresse,
    municipalite: valEtab.municipalite?.['#text'] || valEtab.municipalite
  };
  
  return establishment;
}

/**
 * Fonction principale d'extraction
 */
async function extractEstablishments() {
  try {
    console.log('Début de l\'extraction des établissements...');
    console.log(`Fichier source: ${XML_FILE_PATH}`);
    
    // Vérifier que le fichier source existe
    if (!fs.existsSync(XML_FILE_PATH)) {
      throw new Error(`Fichier source non trouvé: ${XML_FILE_PATH}`);
    }
    
    // Lire le fichier XML
    console.log('Lecture du fichier XML...');
    const xmlData = fs.readFileSync(XML_FILE_PATH, 'utf8');
    
    // Parser le XML
    console.log('Parsing du XML...');
    const parser = new XMLParser(parserOptions);
    const jsonData = parser.parse(xmlData);
    
    // Extraire les établissements
    console.log('Extraction des établissements...');
    const establishments = [];
    
    if (jsonData.info_etab && jsonData.info_etab.val_etab) {
      const valEtabArray = Array.isArray(jsonData.info_etab.val_etab) 
        ? jsonData.info_etab.val_etab 
        : [jsonData.info_etab.val_etab];
      
      console.log(`Traitement de ${valEtabArray.length} établissements...`);
      
      valEtabArray.forEach((valEtab, index) => {
        try {
          const establishment = processEstablishment(valEtab);
          establishments.push(establishment);
          
          if ((index + 1) % 1000 === 0) {
            console.log(`Traités: ${index + 1}/${valEtabArray.length} établissements`);
          }
        } catch (error) {
          console.error(`Erreur lors du traitement de l'établissement ${index + 1}:`, error.message);
        }
      });
    }
    
    // Créer le dossier de sortie s'il n'existe pas
    const outputDir = path.dirname(OUTPUT_FILE_PATH);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Générer le fichier JSON de sortie
    console.log('Génération du fichier JSON...');
    const outputData = {
      metadata: {
        source_file: 'infoEtablissement_V444_20250613.xml',
        extraction_date: new Date().toISOString(),
        total_establishments: establishments.length,
        version: '1.0',
        description: 'Données d\'établissements RAMQ pour la facturation des médecins spécialistes (RFP)'
      },
      establishments: establishments
    };
    
    // Écrire le fichier JSON
    fs.writeFileSync(OUTPUT_FILE_PATH, JSON.stringify(outputData, null, 2), 'utf8');
    
    console.log(`✅ Extraction terminée avec succès!`);
    console.log(`📁 Fichier généré: ${OUTPUT_FILE_PATH}`);
    console.log(`📊 Total d'établissements extraits: ${establishments.length}`);
    
    // Afficher quelques statistiques
    const categories = {};
    const types = {};
    establishments.forEach(etab => {
      categories[etab.catg_etab] = (categories[etab.catg_etab] || 0) + 1;
      types[etab.typ_etab] = (types[etab.typ_etab] || 0) + 1;
    });
    
    console.log('\n📈 Statistiques:');
    console.log('Catégories d\'établissements:', categories);
    console.log('Types d\'établissements:', types);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'extraction:', error);
    process.exit(1);
  }
}

// Exécuter l'extraction si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  extractEstablishments();
}

export { extractEstablishments, processEstablishment, extractHolidays, extractEstablishmentNumbers };
