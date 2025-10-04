import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script d'extraction complet des fichiers XML RAMQ pour la facturation des médecins spécialistes (RFP)
 * 
 * Conformité : Conserve les noms de balises XML exacts pour la cartographie directe avec les schémas XSD
 * 
 * Fichiers traités :
 * 1. secteurActivite_Specialiste.xml - Secteurs d'activité
 * 2. codeFacturation_Specialiste.xml - Codes et attributs de facturation
 * 3. elementContexte_Specialiste.xml - Éléments de contexte
 * 4. messageExplicatif_Specialiste.xml - Messages explicatifs
 * 5. codeDiagnostic.xml - Codes de diagnostic (CIM-9, CIM-10)
 * 6. codeLocalite.xml - Codes et informations géographiques
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
  const count = data.activity_sectors?.length || data.billing_codes?.length || data.context_elements?.length || data.explanatory_messages?.length || data.diagnostic_codes?.length || data.location_codes?.length || 0;
  console.log(`✅ ${filename} sauvegardé (${count} éléments)`);
}

/**
 * 1. Extraire les secteurs d'activité (secteurActivite_Specialiste.xml)
 */
function extractActivitySectors() {
  console.log('🔄 Extraction des secteurs d\'activité...');
  
  const xmlFile = path.join(XML_DIR, 'secteurActivite_Specialiste_V257_20250613.xml');
  const xmlContent = fs.readFileSync(xmlFile, 'utf8');
  const jsonData = parser.parse(xmlContent);
  
  const sectors = [];
  const rootData = jsonData.sect_activ;
  
  if (rootData && rootData.val_no_sect_activ) {
    const sectorList = Array.isArray(rootData.val_no_sect_activ) 
      ? rootData.val_no_sect_activ 
      : [rootData.val_no_sect_activ];
    
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
        const catgElements = sector.liste_catg_etab.catg_etab || [];
        const ddElements = sector.liste_catg_etab.dd_catg_etab || [];
        
        // Combiner les catégories avec leurs dates
        for (let i = 0; i < catgElements.length; i++) {
          sectorData.liste_catg_etab.push({
            catg_etab: catgElements[i],
            dd_effec_catg_etab: ddElements[i] || null,
            df_effec_catg_etab: null
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
 * 2. Extraire les codes de facturation (codeFacturation_Specialiste.xml)
 */
function extractBillingCodes() {
  console.log('🔄 Extraction des codes de facturation...');
  
  const xmlFile = path.join(XML_DIR, 'codeFacturation_Specialiste_V363_20250613.xml');
  const xmlContent = fs.readFileSync(xmlFile, 'utf8');
  const jsonData = parser.parse(xmlContent);
  
  const codes = [];
  const rootData = jsonData.cod_fact;
  
  if (rootData && rootData.val_cod_fact) {
    const codeList = Array.isArray(rootData.val_cod_fact)
      ? rootData.val_cod_fact
      : [rootData.val_cod_fact];
    
    console.log(`📊 ${codeList.length} codes de facturation trouvés`);
    
    for (const code of codeList) {
      const codeData = {
        cod_fact: code.cod_fact,
        des_cod_fact: code.des_cod_fact,
        typ_cod_fact: code.typ_cod_fact,
        dd_effec_cod_fact: code.dd_effec_cod_fact,
        df_effec_cod_fact: code.df_effec_cod_fact,
        liste_attri: {
          en_cab_seulm: code.liste_attri?.en_cab_seulm || null,
          en_etab_seulm: code.liste_attri?.en_etab_seulm || null,
          ind_no_autor_req: code.liste_attri?.ind_no_autor_req || null
        },
        liste_elm_mesur: [],
        liste_role_spec: [],
        liste_perio_age: []
      };
      
      // Extraire les éléments mesurables
      if (code.liste_attri?.liste_elm_mesur?.elm_mesur) {
        const elmList = Array.isArray(code.liste_attri.liste_elm_mesur.elm_mesur)
          ? code.liste_attri.liste_elm_mesur.elm_mesur
          : [code.liste_attri.liste_elm_mesur.elm_mesur];
        
        for (const elm of elmList) {
          codeData.liste_elm_mesur.push({
            cod_elm_mesur: elm.cod_elm_mesur,
            nom_elm_mesur: elm.nom_elm_mesur,
            typ_unit_mes: elm.typ_unit_mes,
            dd_effec_elm_mesur: elm.dd_effec_elm_mesur
          });
        }
      }
      
      // Extraire les rôles spécialisés
      if (code.liste_attri?.liste_role_spec?.role_spec) {
        const roleList = Array.isArray(code.liste_attri.liste_role_spec.role_spec)
          ? code.liste_attri.liste_role_spec.role_spec
          : [code.liste_attri.liste_role_spec.role_spec];
        
        for (const role of roleList) {
          codeData.liste_role_spec.push({
            cod_role: role.cod_role,
            nom_role: role.nom_role,
            cod_spec: role.cod_spec,
            nom_spec: role.nom_spec,
            dd_effec_role: role.dd_effec_role
          });
        }
      }
      
      // Extraire les périodes d'âge
      if (code.liste_attri?.liste_perio_age?.perio_age) {
        const ageList = Array.isArray(code.liste_attri.liste_perio_age.perio_age)
          ? code.liste_attri.liste_perio_age.perio_age
          : [code.liste_attri.liste_perio_age.perio_age];
        
        for (const age of ageList) {
          codeData.liste_perio_age.push({
            cod_perio_age: age.cod_perio_age,
            des_perio_age: age.des_perio_age,
            age_min: age.age_min,
            age_max: age.age_max,
            dd_effec_perio_age: age.dd_effec_perio_age
          });
        }
      }
      
      codes.push(codeData);
    }
  }
  
  const output = {
    metadata: {
      source_file: 'codeFacturation_Specialiste_V363_20250613.xml',
      extraction_date: new Date().toISOString(),
      total_codes: codes.length,
      version: "1.0",
      description: "Codes de facturation RAMQ pour les médecins spécialistes (RFP)"
    },
    billing_codes: codes
  };
  
  saveJsonData('billing-codes.json', output);
  return output;
}

/**
 * 3. Extraire les éléments de contexte (elementContexte_Specialiste.xml)
 */
function extractContextElements() {
  console.log('🔄 Extraction des éléments de contexte...');
  
  const xmlFile = path.join(XML_DIR, 'elementContexte_Specialiste_V351_20250613.xml');
  const xmlContent = fs.readFileSync(xmlFile, 'utf8');
  const jsonData = parser.parse(xmlContent);
  
  const elements = [];
  const rootData = jsonData.elm_contx_specialiste;
  
  if (rootData && rootData.val_elm_contx) {
    const elementList = Array.isArray(rootData.val_elm_contx)
      ? rootData.val_elm_contx
      : [rootData.val_elm_contx];
    
    console.log(`📊 ${elementList.length} éléments de contexte trouvés`);
    
    for (const element of elementList) {
      const elementData = {
        cod_elm_contx: element.cod_elm_contx,
        des_elm_contx: element.des_elm_contx,
        dd_effec: element.dd_effec,
        df_effec: element.df_effec,
        liste_cod_fact: []
      };
      
      // Extraire les codes de facturation liés
      if (element.liste_cod_fact && element.liste_cod_fact.cod_fact_lie_elm_contx) {
        const factList = Array.isArray(element.liste_cod_fact.cod_fact_lie_elm_contx)
          ? element.liste_cod_fact.cod_fact_lie_elm_contx
          : [element.liste_cod_fact.cod_fact_lie_elm_contx];
        
        for (const fact of factList) {
          elementData.liste_cod_fact.push({
            cod_fact_lie_elm_contx: fact.cod_fact_lie_elm_contx,
            des_cod_fact: fact.des_cod_fact
          });
        }
      }
      
      elements.push(elementData);
    }
  }
  
  const output = {
    metadata: {
      source_file: 'elementContexte_Specialiste_V351_20250613.xml',
      extraction_date: new Date().toISOString(),
      total_elements: elements.length,
      version: "1.0",
      description: "Éléments de contexte RAMQ pour la facturation des spécialistes"
    },
    context_elements: elements
  };
  
  saveJsonData('context-elements.json', output);
  return output;
}

/**
 * 4. Extraire les messages explicatifs (messageExplicatif_Specialiste.xml)
 */
function extractExplanatoryMessages() {
  console.log('🔄 Extraction des messages explicatifs...');
  
  const xmlFile = path.join(XML_DIR, 'messageExplicatif_Specialiste_V447_20250613.xml');
  const xmlContent = fs.readFileSync(xmlFile, 'utf8');
  const jsonData = parser.parse(xmlContent);
  
  const messages = [];
  const rootData = jsonData.msg_explicatif_specialiste;
  
  if (rootData && rootData.val_msg_explicatif) {
    const messageList = Array.isArray(rootData.val_msg_explicatif)
      ? rootData.val_msg_explicatif
      : [rootData.val_msg_explicatif];
    
    console.log(`📊 ${messageList.length} messages explicatifs trouvés`);
    
    for (const message of messageList) {
      const messageData = {
        cod_msg_explicatif: message.cod_msg_explicatif,
        txt_msg_explicatif: message.txt_msg_explicatif,
        catg_msg_explicatif: message.catg_msg_explicatif,
        dd_effec: message.dd_effec,
        df_effec: message.df_effec
      };
      
      messages.push(messageData);
    }
  }
  
  const output = {
    metadata: {
      source_file: 'messageExplicatif_Specialiste_V447_20250613.xml',
      extraction_date: new Date().toISOString(),
      total_messages: messages.length,
      version: "1.0",
      description: "Messages explicatifs RAMQ pour la facturation des spécialistes"
    },
    explanatory_messages: messages
  };
  
  saveJsonData('explanatory-messages.json', output);
  return output;
}

/**
 * 5. Extraire les codes de diagnostic (codeDiagnostic.xml)
 */
function extractDiagnosticCodes() {
  console.log('🔄 Extraction des codes de diagnostic...');
  
  const xmlFile = path.join(XML_DIR, 'codeDiagnostic_V311_20250613.xml');
  const xmlContent = fs.readFileSync(xmlFile, 'utf8');
  const jsonData = parser.parse(xmlContent);
  
  const codes = [];
  const rootData = jsonData.cod_diag;
  
  if (rootData && rootData.val_cod_diag) {
    const codeList = Array.isArray(rootData.val_cod_diag)
      ? rootData.val_cod_diag
      : [rootData.val_cod_diag];
    
    console.log(`📊 ${codeList.length} codes de diagnostic trouvés`);
    
    for (const code of codeList) {
      const codeData = {
        cod_diag: code.cod_diag,
        des_cod_diag: code.des_cod_diag,
        typ_cod_diag: code.typ_cod_diag,
        dd_effec: code.dd_effec,
        df_effec: code.df_effec
      };
      
      codes.push(codeData);
    }
  }
  
  const output = {
    metadata: {
      source_file: 'codeDiagnostic_V311_20250613.xml',
      extraction_date: new Date().toISOString(),
      total_codes: codes.length,
      version: "1.0",
      description: "Codes de diagnostic RAMQ (CIM-9, CIM-10) pour la facturation des spécialistes"
    },
    diagnostic_codes: codes
  };
  
  saveJsonData('diagnostic-codes.json', output);
  return output;
}

/**
 * 6. Extraire les codes de localité (codeLocalite.xml)
 */
function extractLocationCodes() {
  console.log('🔄 Extraction des codes de localité...');
  
  const xmlFile = path.join(XML_DIR, 'codeLocalite_V453_20250613.xml');
  const xmlContent = fs.readFileSync(xmlFile, 'utf8');
  const jsonData = parser.parse(xmlContent);
  
  const locations = [];
  const rootData = jsonData.cod_localite;
  
  if (rootData && rootData.val_localite) {
    const locationList = Array.isArray(rootData.val_localite)
      ? rootData.val_localite
      : [rootData.val_localite];
    
    console.log(`📊 ${locationList.length} codes de localité trouvés`);
    
    for (const location of locationList) {
      const locationData = {
        cod_localite: location.cod_localite,
        nom_localite: location.nom_localite,
        cod_pos: location.cod_pos,
        cod_rss: location.cod_rss,
        nom_rss: location.nom_rss,
        dd_effec: location.dd_effec,
        df_effec: location.df_effec
      };
      
      locations.push(locationData);
    }
  }
  
  const output = {
    metadata: {
      source_file: 'codeLocalite_V453_20250613.xml',
      extraction_date: new Date().toISOString(),
      total_locations: locations.length,
      version: "1.0",
      description: "Codes de localité RAMQ pour la facturation géographique des spécialistes"
    },
    location_codes: locations
  };
  
  saveJsonData('location-codes.json', output);
  return output;
}

/**
 * Fonction principale d'extraction
 */
async function extractAllRamqData() {
  try {
    console.log('🚀 Début de l\'extraction complète des données RAMQ...');
    console.log('📁 Répertoire XML:', XML_DIR);
    console.log('📁 Répertoire de sortie:', OUTPUT_DIR);
    
    ensureOutputDir();
    
    // Extraire tous les fichiers
    const results = {
      activity_sectors: extractActivitySectors(),
      billing_codes: extractBillingCodes(),
      context_elements: extractContextElements(),
      explanatory_messages: extractExplanatoryMessages(),
      diagnostic_codes: extractDiagnosticCodes(),
      location_codes: extractLocationCodes()
    };
    
    // Créer un fichier de résumé
    const summary = {
      metadata: {
        extraction_date: new Date().toISOString(),
        version: "1.0",
        description: "Résumé de l'extraction complète des données RAMQ pour la facturation des médecins spécialistes (RFP)"
      },
      files_processed: {
        activity_sectors: results.activity_sectors.metadata.total_sectors,
        billing_codes: results.billing_codes.metadata.total_codes,
        context_elements: results.context_elements.metadata.total_elements,
        explanatory_messages: results.explanatory_messages.metadata.total_messages,
        diagnostic_codes: results.diagnostic_codes.metadata.total_codes,
        location_codes: results.location_codes.metadata.total_locations
      },
      total_records: Object.values(results).reduce((sum, result) => sum + (result.metadata?.total_sectors || result.metadata?.total_codes || result.metadata?.total_elements || result.metadata?.total_messages || 0), 0)
    };
    
    saveJsonData('extraction-summary.json', summary);
    
    console.log('\n🎉 Extraction terminée avec succès!');
    console.log('📊 Résumé:');
    Object.entries(summary.files_processed).forEach(([file, count]) => {
      console.log(`  ${file}: ${count} enregistrements`);
    });
    console.log(`  Total: ${summary.total_records} enregistrements`);
    
    return results;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'extraction:', error);
    throw error;
  }
}

// Exécuter l'extraction si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  extractAllRamqData()
    .then(() => {
      console.log('✅ Extraction terminée avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Extraction échouée:', error);
      process.exit(1);
    });
}

export { extractAllRamqData };
