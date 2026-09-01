import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/admin/", "/order/checkout"],
    },
    sitemap: "https://verifylingua.com/sitemap.xml",
  };
}
