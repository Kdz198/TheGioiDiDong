import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "./DashboardSidebar";

export function DashboardLayout() {
  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />
      <main
        className={cn(
          "flex-1 overflow-y-auto bg-neutral-100 p-6 transition-all duration-300",
          isMobile && "pt-20"
        )}>
        <Outlet />
      </main>
    </div>
  );
}
