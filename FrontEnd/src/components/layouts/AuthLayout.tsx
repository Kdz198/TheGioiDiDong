import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="bg-muted flex min-h-screen items-center justify-center">
      <div className="bg-card w-full max-w-md rounded-lg p-8 shadow-lg">
        <Outlet />
      </div>
    </div>
  );
}
