import VerifyCodeClient from "./VerifyCodeClient";

export function generateStaticParams() {
  return [
    { code: "VL-CERT-8921" },
  ];
}

export default function VerifyCodePage() {
  return <VerifyCodeClient />;
}
