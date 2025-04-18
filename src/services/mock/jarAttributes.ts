
import { JARAttribute } from "@/types";

export const jarAttributes: JARAttribute[] = [
  {
    id: "attr1",
    productTypeId: "product1",
    nameHR: "Intenzitet mirisa dima",
    nameEN: "Smoke Aroma Intensity",
    scaleHR: ["Puno preslab", "Preslab", "Baš kako treba", "Prejak", "Puno prejak"] as [string, string, string, string, string],
    scaleEN: ["Much too weak", "Too weak", "Just About Right", "Too strong", "Much too strong"] as [string, string, string, string, string]
  },
  {
    id: "attr2",
    productTypeId: "product1",
    nameHR: "Slanost",
    nameEN: "Saltiness",
    scaleHR: ["Puno preslano", "Preslano", "Baš kako treba", "Preslano", "Puno preslano"] as [string, string, string, string, string],
    scaleEN: ["Much too low", "Too low", "Just About Right", "Too high", "Much too high"] as [string, string, string, string, string]
  },
  {
    id: "attr3",
    productTypeId: "product1",
    nameHR: "Sočnost",
    nameEN: "Juiciness",
    scaleHR: ["Puno presuho", "Presuho", "Baš kako treba", "Presočno", "Puno presočno"] as [string, string, string, string, string],
    scaleEN: ["Much too dry", "Too dry", "Just About Right", "Too juicy", "Much too juicy"] as [string, string, string, string, string]
  },
  {
    id: "attr4",
    productTypeId: "product1",
    nameHR: "Tvrdoća",
    nameEN: "Hardness",
    scaleHR: ["Puno premekano", "Premekano", "Baš kako treba", "Pretvrdo", "Puno pretvrdo"] as [string, string, string, string, string],
    scaleEN: ["Much too soft", "Too soft", "Just About Right", "Too hard", "Much too hard"] as [string, string, string, string, string]
  }
];
