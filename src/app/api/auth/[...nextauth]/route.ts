/**
 * src/app/api/auth/[...nextauth]/route.ts
 *
 * Auth.js API route handlers for GET and POST requests.
 */

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
