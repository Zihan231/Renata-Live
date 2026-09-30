export type Product = {
  slug: string;
  brand: string;
  generic: string;
  logo?: string;
  color: string;
  tag: string;
  status: "available" | "upcoming";
};

export const PRODUCTS: Product[] = [
  { slug: "rosimer", brand: "Rosimer", generic: "Osimertinib", logo: "/products/rosimer.png", color: "#6a3767", tag: "Oncology · Bioequivalent", status: "available" },
  { slug: "tyrokin", brand: "Tyrokin", generic: "Imatinib", logo: "/products/tyrokin.png", color: "#e01e26", tag: "Oncology · Bioequivalent", status: "available" },
  { slug: "sofenib", brand: "Sofenib", generic: "Sorafenib", logo: "/products/sofenib.png", color: "#145960", tag: "Oncology · Bioequivalent", status: "available" },
  { slug: "pazoren", brand: "Pazoren", generic: "Pazopanib", logo: "/products/pazoren.png", color: "#00adad", tag: "Oncology · Bioequivalent", status: "available" },
  { slug: "paltab", brand: "Paltab", generic: "Palbociclib", logo: "/products/paltab.png", color: "#9f76b4", tag: "f2 value achieved", status: "available" },
  { slug: "rpag", brand: "R-Pag", generic: "Eltrombopag", logo: "/products/rpag.png", color: "#ec2429", tag: "f2 value achieved", status: "available" },
  { slug: "renaclib", brand: "Renaclib", generic: "Abemaciclib", color: "#1f6bff", tag: "Upcoming bioequivalent brand", status: "upcoming" },
];

export const STATS = [
  { value: 100, suffix: "+", label: "Bioequivalent Products" },
  { value: 69, suffix: "", label: "Global Destinations" },
  { value: 22, suffix: "", label: "Regulated Markets" },
];
