/**
 * app/page.tsx — Root page.
 *
 * Redirects "/" to "/en" as per i18n specification.
 */

import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/en");
}
