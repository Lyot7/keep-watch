import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

// Initialize Prisma
const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  // Secure the API - this route should only be accessible in development mode or via an API key in production
  if (process.env.NODE_ENV === "production") {
    // In production, verify an API key or secret
    const apiKey = request.headers.get("x-api-key");
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // Migrate "Vu" states to "Recommander"
    const vuToRecommander = await prisma.videoState.updateMany({
      where: {
        state: "Vu",
      },
      data: {
        state: "Recommander",
      },
    });

    // Migrate "🤯" states to "Impressionnant"
    const wowToImpressionnant = await prisma.videoState.updateMany({
      where: {
        state: "🤯",
      },
      data: {
        state: "Impressionnant",
      },
    });

    // Return the number of updates made
    return NextResponse.json(
      {
        success: true,
        migratedStates: {
          vuToRecommander: vuToRecommander.count,
          wowToImpressionnant: wowToImpressionnant.count,
          total: vuToRecommander.count + wowToImpressionnant.count,
        },
        message: "Video state migration completed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during video state migration:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error during video state migration",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
