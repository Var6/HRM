import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Citizen Saving and Credit Cooperative Society - Employee Portal",
  description: "Employee Self-Service Portal",
};

export default function EmployeePortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      {children}
    </div>
  );
}
