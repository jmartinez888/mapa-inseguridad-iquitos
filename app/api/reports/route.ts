import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';

// 1. Evitar múltiples instancias de Prisma en desarrollo
const globalForPrisma = global as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 🔹 GUARDAR REPORTE (POST)
export async function POST(req: Request) {
  try {
    const data = await req.json()

    const newReport = await prisma.incidentReport.create({
      data: {
        district: data.district,
        incidentType: data.incidentType,
        stolenObject: data.stolenObject,
        victimGender: data.victimGender,
        latitude: parseFloat(data.lat), // 👈 Aseguramos que sea número
        longitude: parseFloat(data.lng), // 👈 Aseguramos que sea número
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
      { ok: false, error: "Error al guardar el reporte" },
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

    // Devolvemos el array directamente para que el mapa lo recorra con .map()
    return NextResponse.json(reports)

  } catch (error) {
    console.error("❌ ERROR AL OBTENER DATOS:", error)
    return NextResponse.json(
      { ok: false, error: "Error al obtener los reportes" },
      { status: 500 }
    )
  }
}