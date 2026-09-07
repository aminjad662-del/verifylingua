import AdminWorkspaceClient from "./AdminWorkspaceClient";

export function generateStaticParams() {
  return [
    { id: "VL-DEMO1" },
    { id: "VL-7X9K2" },
    { id: "VL-9P4W8" },
    { id: "VL-2K6M1" },
  ];
}

export default function AdminWorkspacePage() {
  return <AdminWorkspaceClient />;
}
