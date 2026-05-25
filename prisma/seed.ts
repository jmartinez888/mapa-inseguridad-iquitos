import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

const prisma = new PrismaClient();

interface ReporteData {
  lat: number;
  lng: number;
  state: string;
  province: string;
  district: string;
  incidentType: string;
  victimGender: string;
  incidentYear: number;
  incidentMonth: number | null;
  incidentDay: number | null;
  timeOfDay: string;
  stolenObject: string | null;
  mobility: string;
  economicImpact: string;
  description: string;
  contactInfo: string | null;
}

async function main() {
  console.log('🚀 Iniciando la migración de datos a Neon...');

  const csvFilePath = path.join(process.cwd(), 'prisma/data/data_peru.csv');
  const reportes: ReporteData[] = [];

  if (!fs.existsSync(csvFilePath)) {
    console.error(`❌ No se encontró el archivo CSV en la ruta: ${csvFilePath}`);
    return;
  }

  const primeraLinea = fs.readFileSync(csvFilePath, 'utf8').split('\n')[0];
  const separador = primeraLinea.includes(';') ? ';' : ',';
  console.log(`🔍 Separador detectado en el archivo CSV: "${separador}"`);

  fs.createReadStream(csvFilePath)
    .pipe(csv({ separator: separador }))
    .on('data', (row: Record<string, string>) => {
      const limpiarLlave = (obj: Record<string, string>, nombre: string) => {
        const llaveReal = Object.keys(obj).find(k => k.trim().includes(nombre));
        return llaveReal ? obj[llaveReal] : undefined;
      };

      const latitudStr = limpiarLlave(row, 'Latitud');
      const longitudStr = limpiarLlave(row, 'Longitud');

      const latitudNum = latitudStr ? parseFloat(latitudStr) : NaN;
      const longitudeNum = longitudStr ? parseFloat(longitudStr) : NaN;

      if (!isNaN(latitudNum) && !isNaN(longitudeNum)) {
        reportes.push({
          lat: latitudNum,
          lng: longitudeNum,
          state: limpiarLlave(row, 'Departamento / Región') || 'Loreto',
          province: limpiarLlave(row, 'Provincia') || 'Maynas',
          district: limpiarLlave(row, 'Distrito') || 'Zona no identificada',
          incidentType: limpiarLlave(row, '¿Qué tipo de hecho de inseguridad ocurrió?') || 'Otro',
          victimGender: limpiarLlave(row, 'Sexo de la víctima') || 'Prefiero no decirlo',
          incidentYear: parseInt(limpiarLlave(row, 'Año') || '2026') || 2026,
          incidentMonth: limpiarLlave(row, 'Mes') && limpiarLlave(row, 'Mes')?.trim() !== '' ? mapearMes(limpiarLlave(row, 'Mes')!) : null,
          incidentDay: limpiarLlave(row, 'Día') && !isNaN(parseInt(limpiarLlave(row, 'Día')!)) ? parseInt(limpiarLlave(row, 'Día')!) : null,
          timeOfDay: limpiarLlave(row, 'Momento del día') || 'No recuerdo',
          stolenObject: limpiarLlave(row, 'Objeto robado o hurtado') || null,
          mobility: limpiarLlave(row, 'Medio de movilización') || 'No recuerdo',
          economicImpact: limpiarLlave(row, 'Impacto económico') || 'No recuerdo',
          description: limpiarLlave(row, 'Descripción') || '',
          contactInfo: limpiarLlave(row, 'Contacto (opcional)') || null,
        });
      }
    })
    .on('end', async () => {
      console.log(`📦 Se procesaron ${reportes.length} filas válidas. Insertando en Neon...`);
      
      let insertados = 0;
      let errores = 0;

      for (const reporte of reportes) {
        try {
          // CORRECCIÓN AQUÍ: Usamos 'lat' y 'lng' (o 'longitude' si da error en lng)
          await prisma.incidentReport.create({
            data: {
              lat: reporte.lat, 
              lng: reporte.lng, // Si tu schema usa longitude, cámbialo a: longitude: reporte.lng
              state: reporte.state,
              province: reporte.province,
              district: reporte.district,
              incidentType: reporte.incidentType,
              victimGender: reporte.victimGender,
              incidentYear: reporte.incidentYear,
              incidentMonth: reporte.incidentMonth,
              incidentDay: reporte.incidentDay,
              timeOfDay: reporte.timeOfDay,
              stolenObject: reporte.stolenObject,
              mobility: reporte.mobility,
              economicImpact: reporte.economicImpact,
              description: reporte.description,
              contactInfo: reporte.contactInfo,
            }
          });
          insertados++;
        } catch (error) {
          console.error('❌ Error en inserción:', error);
          errores++;
        }
      }

      console.log('\n✨ ¡Proceso de migración finalizado!');
      console.log(`✅ Reportes guardados con éxito en Neon: ${insertados}`);
      if (errores > 0) {
        console.log(`⚠️ Filas omitidas: ${errores}`);
      }

      await prisma.$disconnect();
    });
}

function mapearMes(mesTexto: string): number | null {
  if (!mesTexto) return null;
  const meses: { [key: string]: number } = {
    enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
    julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12
  };
  const busqueda = mesTexto.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return meses[busqueda] || null;
}

main().catch((e) => {
  console.error('❌ Error crítico en el script de seed:', e);
  process.exit(1);
});