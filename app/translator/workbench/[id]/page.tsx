import LinguistWorkbenchClient from "./LinguistWorkbenchClient";

export function generateStaticParams() {
  return [
    { id: "VL-7X9K2" },
    { id: "VL-9P4W8" },
    { id: "VL-2K6M1" },
  ];
}

export default function TranslatorWorkbenchPage() {
  return <LinguistWorkbenchClient />;
}
