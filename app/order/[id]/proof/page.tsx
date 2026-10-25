import ProofingStudioClient from "./ProofingStudioClient";

export function generateStaticParams() {
  return [
    { id: "VL-8921-XQ" },
    { id: "VL-9104-MN" },
  ];
}

export default function ProofingStudioPage() {
  return <ProofingStudioClient />;
}
