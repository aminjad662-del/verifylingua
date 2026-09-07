import VerifyCodeClient from "./VerifyCodeClient";

export function generateStaticParams() {
  return [
    { code: "demo" },
    { code: "CERT-DEMO-2026" },
    { code: "VL-CERT-8921" },
  ];
}

export default function VerifyCodePage() {
  return <VerifyCodeClient />;
}
