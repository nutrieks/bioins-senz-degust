
import { JARAttribute } from "@/types";

export const jarAttributes: JARAttribute[] = [
  {
    id: "attr_test1",
    productTypeId: "product_test",
    nameEN: "Sweetness",
    nameHR: "Slatkoća",
    scaleEN: ["Much too weak", "Too weak", "Just about right", "Too strong", "Much too strong"],
    scaleHR: ["Premalo slatko", "Malo premalo slatko", "Baš pravo", "Malo preslatko", "Preslatko"]
  },
  {
    id: "attr_test2",
    productTypeId: "product_test",
    nameEN: "Crunchiness", 
    nameHR: "Hrskavost",
    scaleEN: ["Much too soft", "Too soft", "Just about right", "Too crunchy", "Much too crunchy"],
    scaleHR: ["Premeko", "Malo premeko", "Baš pravo", "Malo prehrskavo", "Prehrskavo"]
  },
  {
    id: "attr_test3",
    productTypeId: "product_test",
    nameEN: "Chocolate flavor",
    nameHR: "Okus čokolade", 
    scaleEN: ["Much too weak", "Too weak", "Just about right", "Too strong", "Much too strong"],
    scaleHR: ["Premalo", "Malo premalo", "Baš pravo", "Malo previše", "Previše"]
  }
];
