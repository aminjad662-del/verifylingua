import OrderTrackingClient from "../OrderTrackingClient";

export function generateStaticParams() {
  return [
    { id: "VL-DEMO1" },
    { id: "VL-8921-XQ" },
    { id: "VL-9104-MN" },
    { id: "demo" },
  ];
}

export default function OrderTrackerSubPage() {
  return <OrderTrackingClient />;
}
