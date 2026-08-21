import { redirect } from "next/navigation";

export async function GET() {
  redirect("/en/staff/login");
}
