import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';

// Evitar múltiples instancias de Prisma en desarrollo
const globalForPrisma = global as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 🔹 GUARDAR REPORTE (POST) - Sincronizado con tu Schema Real
export async function POST(req: Request) {
  try {
    const data = await req.json()

    // Validamos la existencia de las coordenadas (usando lat y lng de tu esquema)
    const rawLat = data.latitude ?? data.lat;
    const rawLng = data.longitude ?? data.lng;

    if (rawLat === undefined || rawLng === undefined || rawLat === null || rawLng === null) {
      return NextResponse.json(
        { ok: false, error: "La latitud y longitud son campos obligatorios." },
        { status: 400 }
      )
    }

    const parsedLat = parseFloat(rawLat);
    const parsedLng = parseFloat(rawLng);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return NextResponse.json(
        { ok: false, error: "Las coordenadas proporcionadas no tienen un formato numérico válido." },
        { status: 400 }
      )
    }

    // Manejo técnico de las fechas desglosadas (Año, Mes, Día)
    let year = data.incidentYear;
    let month = data.incidentMonth;
    let day = data.incidentDay;

    // Si del formulario viene una fecha completa (ej. exactDate), extraemos los valores
    if (data.exactDate) {
      const fechaObj = new Date(data.exactDate);
      if (!isNaN(fechaObj.getTime())) {
        year = fechaObj.getFullYear();
        month = fechaObj.getMonth() + 1; // JS cuenta los meses de 0 a 11
        day = fechaObj.getDate();
      }
    }

    // Valores por defecto obligatorios por si no vienen en la petición
    if (!year) year = new Date().getFullYear();

    const newReport = await prisma.incidentReport.create({
      data: {
        lat: parsedLat,
        lng: parsedLng,
        district: data.district || 'Iquitos',
        province: data.province || 'Maynas',
        state: data.state || 'Loreto',
        incidentType: data.incidentType,
        stolenObject: data.stolenObject || null,
        victimGender: data.victimGender,
        incidentYear: Number(year),
        incidentMonth: month ? Number(month) : null,
        incidentDay: day ? Number(day) : null,
        timeOfDay: data.timeOfDay,
        mobility: data.mobility || 'A pie',
        economicImpact: data.economicImpact || 'Bajo',
        description: data.description || null,
        contactInfo: data.contactInfo || null,
      },
    })

    return NextResponse.json({ ok: true, data: newReport })

  } catch (error) {
    console.error("❌ ERROR AL GUARDAR:", error)
    return NextResponse.json(
      { ok: false, error: "Error interno al guardar el reporte" },
      { status: 500 }
    )
  }
}

// 🔹 OBTENER TODOS LOS REPORTES (GET)
export async function GET() {
  try {
    const reports = await prisma.incidentReport.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(reports)

  } catch (error) {
    console.error("❌ ERROR AL OBTENER DATOS:", error)
    return NextResponse.json(
      { ok: false, error: "Error al obtener los reportes" },
      { status: 500 }
    )
  }
}