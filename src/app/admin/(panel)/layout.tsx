import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = (await getCurrentUser())!;
  return (
    <div className="bg-ink-950/[0.02]">
      <div className="mx-auto flex w-full max-w-[1500px] gap-6 px-4 py-6 lg:px-8">
        <Sidebar />
        <div className="flex-1">
          <Topbar email={user.email} />
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
