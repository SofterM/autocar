// src/lib/env.ts
export const env = {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || "",
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/sign-in",
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/sign-up",
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: "/",
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: "/"
  };
  
  // Validate required environment variables
  if (!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    throw new Error("Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable");
  }
  
  if (!env.CLERK_SECRET_KEY) {
    throw new Error("Missing CLERK_SECRET_KEY environment variable");
  }