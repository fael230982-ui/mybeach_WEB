import { notFound } from "next/navigation";

import MobileDemoClient from "./MobileDemoClient";

export default function MobilePage() {
  if (process.env.NEXT_PUBLIC_ENABLE_MOBILE_DEMO !== "true") {
    notFound();
  }

  return <MobileDemoClient />;
}
