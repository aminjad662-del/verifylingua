import OrderTrackingClient from "./OrderTrackingClient";

export function generateStaticParams() {
  return [
    { id: "VL-8921-XQ" },
    { id: "VL-9104-MN" },
  ];
}

export default function OrderTrackingPage() {
  return <OrderTrackingClient />;
}
