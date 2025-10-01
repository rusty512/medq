import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path to the specialties JSON file
    const specialtiesPath = path.join(
      process.cwd(), 
      '../backend/ramq-xml/parsed/specialties.json'
    );
    
    // Check if file exists
    if (!fs.existsSync(specialtiesPath)) {
      return NextResponse.json(
        { error: 'Specialties data not found. Please run the extraction script first.' }, 
        { status: 404 }
      );
    }
    
    // Read and parse the specialties file
    const specialtiesData = JSON.parse(fs.readFileSync(specialtiesPath, 'utf8'));
    
    // Return just the specialties array
    return NextResponse.json(specialtiesData.specialties);
    
  } catch (error) {
    console.error('Error loading specialties:', error);
    return NextResponse.json(
      { error: 'Failed to load specialties data' }, 
      { status: 500 }
    );
  }
}
