import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the billing codes file
const billingCodesPath = path.join(__dirname, '../../ramq-xml/parsed/specialist/billing-codes.json');
const billingCodes = JSON.parse(fs.readFileSync(billingCodesPath, 'utf8'));

// Extract unique specialties
const specialtyMap = new Map();

billingCodes.codes.forEach(code => {
  code.applicableSpecialties?.forEach(specialty => {
    if (specialty.isActive) {
      specialtyMap.set(specialty.specialtyCode, specialty.specialtyName);
    }
  });
});

// Convert to array and sort by name
const specialties = Array.from(specialtyMap.entries())
  .filter(([code, name]) => code && name && code.trim() !== '' && name.trim() !== '')
  .map(([code, name]) => ({ 
    code, 
    name,
    // Add some additional metadata that might be useful
    displayName: name,
    isActive: true
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

// Create the output
const output = {
  generatedAt: new Date().toISOString(),
  sourceFile: "billing-codes.json",
  totalSpecialties: specialties.length,
  description: "Extracted medical specialties from RAMQ billing codes data",
  specialties: specialties
};

// Write to file
const outputPath = path.join(__dirname, '../../ramq-xml/parsed/specialties.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`✅ Extracted ${specialties.length} unique specialties`);
console.log('📁 Output saved to:', outputPath);
console.log('\n📋 Sample specialties:');
specialties.slice(0, 5).forEach(spec => {
  console.log(`  ${spec.code}: ${spec.name}`);
});
if (specialties.length > 5) {
  console.log(`  ... and ${specialties.length - 5} more`);
}
