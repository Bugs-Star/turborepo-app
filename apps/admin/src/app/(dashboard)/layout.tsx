import Sidebar from "@/components/Sidebar";
import ToasterProvider from "@/components/ToasterProvider";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
        <ToasterProvider />
      </main>
    </div>
  );
};

export default DashboardLayout;
