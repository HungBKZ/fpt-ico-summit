import { redirect } from "next/navigation";

export async function GET() {
  redirect("/en/admin/login");
}
