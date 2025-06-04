
import { JARAttribute } from "@/types";

export const jarAttributes: JARAttribute[] = [
  // JAR attributes for product1 (Dimljeni vrat)
  {
    id: "attr1",
    productTypeId: "product1",
    nameEN: "Saltiness",
    nameHR: "Slanost",
    scaleEN: ["Much too weak", "Too weak", "Just about right", "Too salty", "Much too salty"],
    scaleHR: ["Premalo slano", "Malo premalo slano", "Baš pravo", "Malo preslano", "Previše slano"]
  },
  {
    id: "attr2", 
    productTypeId: "product1",
    nameEN: "Smokiness",
    nameHR: "Dimljeni okus",
    scaleEN: ["Much too weak", "Too weak", "Just about right", "Too strong", "Much too strong"],
    scaleHR: ["Premalo dimljen", "Malo premalo dimljen", "Baš pravo", "Malo predimljen", "Previše dimljen"]
  },
  {
    id: "attr3",
    productTypeId: "product1", 
    nameEN: "Texture",
    nameHR: "Tekstura",
    scaleEN: ["Much too soft", "Too soft", "Just about right", "Too firm", "Much too firm"],
    scaleHR: ["Premekano", "Malo premekano", "Baš pravo", "Malo pretvrdo", "Pretvrdo"]
  },
  {
    id: "attr4",
    productTypeId: "product1",
    nameEN: "Juiciness", 
    nameHR: "Sočnost",
    scaleEN: ["Much too dry", "Too dry", "Just about right", "Too juicy", "Much too juicy"],
    scaleHR: ["Presuho", "Malo presuho", "Baš pravo", "Malo presočno", "Presočno"]
  },
  // JAR attributes for product2 (Čokolada)
  {
    id: "attr5",
    productTypeId: "product2",
    nameEN: "Sweetness",
    nameHR: "Slatkoća",
    scaleEN: ["Much too weak", "Too weak", "Just about right", "Too sweet", "Much too sweet"],
    scaleHR: ["Premalo slatko", "Malo premalo slatko", "Baš pravo", "Malo preslatko", "Preslatko"]
  },
  {
    id: "attr6",
    productTypeId: "product2", 
    nameEN: "Chocolate intensity",
    nameHR: "Intenzitet čokolade",
    scaleEN: ["Much too mild", "Too mild", "Just about right", "Too intense", "Much too intense"],
    scaleHR: ["Premalo intenzivno", "Malo premalo intenzivno", "Baš pravo", "Malo preintenzivno", "Preintenzivno"]
  },
  {
    id: "attr7",
    productTypeId: "product2",
    nameEN: "Texture hardness", 
    nameHR: "Tvrdoća teksture",
    scaleEN: ["Much too soft", "Too soft", "Just about right", "Too hard", "Much too hard"],
    scaleHR: ["Premekano", "Malo premekano", "Baš pravo", "Malo pretvrdo", "Pretvrdo"]
  },
  {
    id: "attr8",
    productTypeId: "product2",
    nameEN: "Melting quality",
    nameHR: "Kvaliteta topljenja", 
    scaleEN: ["Much too slow", "Too slow", "Just about right", "Too fast", "Much too fast"],
    scaleHR: ["Presporo se topi", "Malo presporo se topi", "Baš pravo", "Malo prebrzo se topi", "Prebrzo se topi"]
  },
  // JAR attributes for product3 (Jogurt)
  {
    id: "attr9",
    productTypeId: "product3",
    nameEN: "Sweetness",
    nameHR: "Slatkoća",
    scaleEN: ["Much too weak", "Too weak", "Just about right", "Too sweet", "Much too sweet"],
    scaleHR: ["Premalo slatko", "Malo premalo slatko", "Baš pravo", "Malo preslatko", "Preslatko"]
  },
  {
    id: "attr10",
    productTypeId: "product3",
    nameEN: "Tartness",
    nameHR: "Kiselost",
    scaleEN: ["Much too weak", "Too weak", "Just about right", "Too tart", "Much too tart"],
    scaleHR: ["Premalo kiselo", "Malo premalo kiselo", "Baš pravo", "Malo prekiselo", "Prekiselo"]
  },
  {
    id: "attr11", 
    productTypeId: "product3",
    nameEN: "Thickness",
    nameHR: "Gustoća",
    scaleEN: ["Much too thin", "Too thin", "Just about right", "Too thick", "Much too thick"],
    scaleHR: ["Prerijedno", "Malo prerijedno", "Baš pravo", "Malo pregusto", "Pregusto"]
  },
  {
    id: "attr12",
    productTypeId: "product3", 
    nameEN: "Fruit flavor",
    nameHR: "Okus voća",
    scaleEN: ["Much too weak", "Too weak", "Just about right", "Too strong", "Much too strong"],
    scaleHR: ["Premalo voćno", "Malo premalo voćno", "Baš pravo", "Malo prevoćno", "Prevoćno"]
  }
];
