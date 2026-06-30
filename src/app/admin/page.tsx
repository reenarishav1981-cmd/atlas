import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminDashboard from "@/app/_components/AdminDashboard";

export const metadata = { robots: { index: false, follow: false } };

export default async function AdminPage() {
  // Defense-in-depth: middleware.ts already blocks this route, but a server
  // component check means even a misconfigured matcher can't leak the page.
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    redirect("/login?redirect=/admin");
  }

  return <AdminDashboard />;
}
