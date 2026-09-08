import { auth } from "@/auth";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar isAuthed={!!session?.user} userName={session?.user?.name} userRole={session?.user?.role} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
