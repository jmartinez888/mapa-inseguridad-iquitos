import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';

// 1. Evitar múltiples instancias de Prisma en desarrollo
const globalForPrisma = global as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 🔹 GUARDAR REPORTE (POST) - Versión Segura
export async function POST(req: Request) {
  try {
    const data = await req.json()

    // Validamos la existencia de las coordenadas en el cuerpo de la petición
    const rawLat = data.latitude ?? data.lat;
    const rawLng = data.longitude ?? data.lng;

    if (rawLat === undefined || rawLng === undefined || rawLat === null || rawLng === null) {
      return NextResponse.json(
        { ok: false, error: "La latitud y longitud son campos obligatorios." },
        { status: 400 }
      )
    }

    // Convertimos a número flotante asegurando que no rompa Prisma
    const parsedLat = parseFloat(rawLat);
    const parsedLng = parseFloat(rawLng);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return NextResponse.json(
        { ok: false, error: "Las coordenadas proporcionadas no tienen un formato numérico válido." },
        { status: 400 }
      )
    }

    const newReport = await prisma.incidentReport.create({
      data: {
        district: data.district,
        incidentType: data.incidentType,
        stolenObject: data.stolenObject || null,
        victimGender: data.victimGender,
        latitude: parsedLat,
        longitude: parsedLng,
        exactDate: data.exactDate ? new Date(data.exactDate) : null,
        approximateDate: data.approximateDate || null,
        timeOfDay: data.timeOfDay,
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

// 🔹 OBTENER TODOS LOS REPORTES (GET) - Sintaxis Corregida
export async function GET() {
  try {
    const reports = await prisma.incidentReport.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Devolvemos el array directamente para que el mapa y los gráficos lo recorran
    return NextResponse.json(reports)

  } catch (error) {
    console.error("❌ ERROR AL OBTENER DATOS:", error)
    return NextResponse.json(
      { ok: false, error: "Error al obtener los reportes" },
      { status: 500 }
    )
  }
}