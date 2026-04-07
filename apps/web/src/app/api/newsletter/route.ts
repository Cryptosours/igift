import { NextResponse } from "next/server";
import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * POST /api/newsletter — Subscribe to the deal digest.
 *
 * Body: { email: string, frequency?: "daily" | "weekly", categories?: string[] }
 *
 * Creates a pending subscriber (verifiedAt = null). In production, a
 * confirmation email would be sent with a link to /api/newsletter/verify?token=...
 * For now, we auto-verify to reduce friction during early growth.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email ?? "").trim().toLowerCase();

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Valid email address required" },
        { status: 400 },
      );
    }

    const frequency = body.frequency === "daily" ? "daily" : "weekly";
    const categories = Array.isArray(body.categories) ? body.categories : [];
    const unsubscribeToken = randomUUID();

    // Upsert: if email already exists, reactivate and update preferences
    const existing = await db
      .select({ id: newsletterSubscribers.id })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(newsletterSubscribers)
        .set({
          frequency,
          categories,
          isActive: true,
          // Auto-verify for now (early growth phase)
          verifiedAt: new Date(),
        })
        .where(eq(newsletterSubscribers.email, email));

      return NextResponse.json({ status: "updated" });
    }

    await db.insert(newsletterSubscribers).values({
      email,
      frequency,
      categories,
      unsubscribeToken,
      // Auto-verify for now (early growth phase)
      verifiedAt: new Date(),
    });

    return NextResponse.json({ status: "subscribed" }, { status: 201 });
  } catch (error) {
    console.error("[Newsletter] Subscribe error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/newsletter?token=<unsubscribeToken>
 *
 * Deactivates the subscriber matching the given token.
 * Used in one-click unsubscribe links in digest emails.
 */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const result = await db
      .update(newsletterSubscribers)
      .set({ isActive: false })
      .where(eq(newsletterSubscribers.unsubscribeToken, token))
      .returning({ id: newsletterSubscribers.id });

    if (result.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ status: "unsubscribed" });
  } catch (error) {
    console.error("[Newsletter] Unsubscribe error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
