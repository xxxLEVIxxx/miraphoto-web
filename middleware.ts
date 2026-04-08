import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextMiddleware } from "next/server";
import { NextResponse } from "next/server";

/**
 * Clerk middleware throws at runtime if secrets are missing or invalid on the host
 * (Vercel shows 500 MIDDLEWARE_INVOCATION_FAILED). Skip Clerk when env is not set so
 * the app still serves; optional sign-in will not work until you add keys in Vercel.
 */
const clerkEnvOk =
  Boolean(process.env.CLERK_SECRET_KEY?.trim()) &&
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim());

const passthrough: NextMiddleware = () => NextResponse.next();

export default (clerkEnvOk ? clerkMiddleware() : passthrough) as NextMiddleware;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
