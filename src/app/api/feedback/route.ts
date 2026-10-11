import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { message } = body;
    
    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    console.log(`[Feedback] Submitting for user ${session.user.id}`);

    const feedback = await prisma.feedback.create({
      data: {
        userId: session.user.id,
        message: message.trim(),
      },
    });

    return NextResponse.json({ 
      message: "Feedback submitted successfully", 
      feedback 
    });
  } catch (error) {
    console.error("Feedback Submission Error:", error);
    // Return a more descriptive error if possible for debugging
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: errorMessage 
    }, { status: 500 });
  }
}
