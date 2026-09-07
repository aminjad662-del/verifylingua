import ProofingStudioClient from "./ProofingStudioClient";

export function generateStaticParams() {
  return [
    { id: "VL-DEMO1" },
    { id: "VL-8921-XQ" },
    { id: "VL-9104-MN" },
    { id: "demo" },
  ];
}

export default function ProofingStudioPage() {
  return <ProofingStudioClient />;
}
