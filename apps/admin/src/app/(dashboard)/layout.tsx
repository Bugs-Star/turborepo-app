import Sidebar from "@/components/Sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-svh overflow-hidden">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="container-fixed px-gutter py-6">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
