
import { BaseProductType } from "@/types";

export const baseProductTypes: BaseProductType[] = [
  {
    id: "base_product_1",
    productName: "Pršut",
    jarAttributes: [
      {
        id: "attr_base_1_1",
        productTypeId: "base_product_1",
        nameHR: "Slanost",
        nameEN: "Saltiness",
        scaleHR: ["Premalo slano", "Malo slano", "Baš kako treba", "Dosta slano", "Previše slano"] as [string, string, string, string, string],
        scaleEN: ["Not salty enough", "Slightly not salty enough", "Just About Right", "Slightly too salty", "Too salty"] as [string, string, string, string, string]
      },
      {
        id: "attr_base_1_2",
        productTypeId: "base_product_1",
        nameHR: "Tvrdoća",
        nameEN: "Hardness",
        scaleHR: ["Premekano", "Malo mekano", "Baš kako treba", "Malo tvrdo", "Pretvrdo"] as [string, string, string, string, string],
        scaleEN: ["Too soft", "Slightly too soft", "Just About Right", "Slightly too hard", "Too hard"] as [string, string, string, string, string]
      },
      {
        id: "attr_base_1_3",
        productTypeId: "base_product_1",
        nameHR: "Sočnost",
        nameEN: "Juiciness",
        scaleHR: ["Nedovoljno sočno", "Malo premalo sočno", "Baš kako treba", "Malo previše sočno", "Previše sočno"] as [string, string, string, string, string],
        scaleEN: ["Not juicy enough", "Slightly not juicy enough", "Just About Right", "Slightly too juicy", "Too juicy"] as [string, string, string, string, string]
      },
      {
        id: "attr_base_1_4",
        productTypeId: "base_product_1",
        nameHR: "Začinjenost",
        nameEN: "Spiciness",
        scaleHR: ["Premalo začinjeno", "Malo premalo začinjeno", "Baš kako treba", "Malo previše začinjeno", "Previše začinjeno"] as [string, string, string, string, string],
        scaleEN: ["Not spicy enough", "Slightly not spicy enough", "Just About Right", "Slightly too spicy", "Too spicy"] as [string, string, string, string, string]
      }
    ],
    createdAt: "2024-12-01T10:00:00.000Z"
  },
  {
    id: "base_product_2",
    productName: "Sir",
    jarAttributes: [
      {
        id: "attr_base_2_1",
        productTypeId: "base_product_2",
        nameHR: "Slanost",
        nameEN: "Saltiness",
        scaleHR: ["Premalo slano", "Malo slano", "Baš kako treba", "Dosta slano", "Previše slano"] as [string, string, string, string, string],
        scaleEN: ["Not salty enough", "Slightly not salty enough", "Just About Right", "Slightly too salty", "Too salty"] as [string, string, string, string, string]
      },
      {
        id: "attr_base_2_2",
        productTypeId: "base_product_2",
        nameHR: "Kiselost",
        nameEN: "Sourness",
        scaleHR: ["Nedovoljno kiselo", "Malo premalo kiselo", "Baš kako treba", "Malo previše kiselo", "Previše kiselo"] as [string, string, string, string, string],
        scaleEN: ["Not sour enough", "Slightly not sour enough", "Just About Right", "Slightly too sour", "Too sour"] as [string, string, string, string, string]
      },
      {
        id: "attr_base_2_3",
        productTypeId: "base_product_2",
        nameHR: "Kremastost",
        nameEN: "Creaminess",
        scaleHR: ["Nedovoljno kremasto", "Malo premalo kremasto", "Baš kako treba", "Malo previše kremasto", "Previše kremasto"] as [string, string, string, string, string],
        scaleEN: ["Not creamy enough", "Slightly not creamy enough", "Just About Right", "Slightly too creamy", "Too creamy"] as [string, string, string, string, string]
      },
      {
        id: "attr_base_2_4",
        productTypeId: "base_product_2",
        nameHR: "Intenzitet arome",
        nameEN: "Flavor intensity",
        scaleHR: ["Preslaba aroma", "Malo preslaba aroma", "Baš kako treba", "Malo prejaka aroma", "Prejaka aroma"] as [string, string, string, string, string],
        scaleEN: ["Too weak flavor", "Slightly too weak flavor", "Just About Right", "Slightly too strong flavor", "Too strong flavor"] as [string, string, string, string, string]
      }
    ],
    createdAt: "2024-12-02T11:30:00.000Z"
  }
];
