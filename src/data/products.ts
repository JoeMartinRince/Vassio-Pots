// ─── Static Product Metadata Catalog ───────────────────────────────────────────
// Single Source of Truth for static product content (names, descriptions, images, categories).
// ZERO PRICE OR MRP FIELDS ARE STORED HERE.
// All prices, MRPs, stock quantities, and availability exist ONLY in Supabase product_variants.

import heroPlantersBeige from "@/assets/hero-planters-beige.jpg";
import flaxImg from "@/assets/flax-series.png";
import leaf2Img from "@/assets/leaf-set-2.png";
import leaf3Img from "@/assets/leaf-set-3.png";
import vanillaImg from "@/assets/vanilla.png";
import arecaImg from "@/assets/areca.png";
import reel1 from "@/assets/reel-1.jpg";
import reel2 from "@/assets/reel-2.jpg";
import reel3 from "@/assets/reel-3.jpg";
import reel4 from "@/assets/reel-4.jpg";
import reel5 from "@/assets/reel-5.jpg";
import livingRoomVases from "@/assets/living-room-vases.png";
import bathroomAroma from "@/assets/bathroom-aroma.png";
import woodenBeadsDecor from "@/assets/wooden-beads-decor.png";
import aboutUsWindow from "@/assets/about-us-window.png";

export const potBg = heroPlantersBeige;
export const prod1 = flaxImg;
export const prod2 = leaf2Img;
export const prod3 = leaf3Img;
export const prod4 = vanillaImg;
export const prod5 = arecaImg;
export const logo = heroPlantersBeige;

export const announcements = [
  "Complimentary Pan-India Shipping on Orders Above ₹5,000",
  "Architectural Fiberplanters — Designed for Modern Spaces",
  "Crafted in Small Batches with Sustainable Materials",
];

export {
  heroPlantersBeige,
  flaxImg,
  leaf2Img,
  leaf3Img,
  vanillaImg,
  arecaImg,
  reel1,
  reel2,
  reel3,
  reel4,
  reel5,
  livingRoomVases,
  bathroomAroma,
  woodenBeadsDecor,
  aboutUsWindow,
};

export const heroPlants = [
  { img: flaxImg, title: "Architectural Vases", subtitle: "Handcrafted fiberglass forms" },
  { img: leaf2Img, title: "Botanic Planters", subtitle: "Natural leaf-engraved texture" },
  { img: leaf3Img, title: "Organic Stoneware", subtitle: "Earthy tones for quiet spaces" },
];

export const featuresImages = {
  durability: flaxImg,
  makeInIndia: leaf2Img,
  customizedDesign: leaf3Img,
  fadeResistant: vanillaImg,
  frostResistant: arecaImg,
  handmade: potBg,
  indoorOutdoor: livingRoomVases,
  lightweight: bathroomAroma,
  lowMaintenance: woodenBeadsDecor,
  uvProtected: aboutUsWindow,
};

export const categories = [
  {
    title: "Fiberglass Planters",
    subtitle: "Durable, lightweight floor planters",
    href: "/frp-pots",
    shopSearch: { type: "pots", category: "frp" },
    img: flaxImg,
  },
  {
    title: "Ceramic & Stoneware Vases",
    subtitle: "Tactile vessels for branches & stems",
    href: "/terracotta-pots",
    shopSearch: { type: "pots", category: "terracotta" },
    img: leaf3Img,
  },
  {
    title: "Artificial Trees & Palms",
    subtitle: "Lifelike faux greenery for indoor spaces",
    href: "/artificial-plants",
    shopSearch: { type: "plants" },
    img: vanillaImg,
  },
  {
    title: "Pebbles & Home Accent Decor",
    subtitle: "Natural marble stones & tabletop decor",
    href: "/pebbles",
    shopSearch: { type: "pots", category: "pebbles" },
    img: arecaImg,
  },
  {
    title: "New Arrivals",
    subtitle: "Curated objects for elevated living",
    href: "/new-arrivals",
    shopSearch: { filter: "new-arrivals" },
    img: potBg,
  },
];

export const products = [
  {
    name: "Flax Series Tapered Vases",
    img: potBg,
    thumbnails: [potBg, potBg, potBg],
    code: "FLX48",
    color: "Sea Green / Matte Teal",
    material: "Premium Matte Fiber-Glass",
    dimensions: "D: H 21\" | C: H 28\" | B: H 33\" | A: H 40\"",
    insideBox: "1 Tapered Floor Vase",
    delivery: "5-7 Working Days",
    payment: "100% Secure Online Payment",
    description: "Sleek, minimalist floor vases boasting organic curves and a calming sea green matte finish. Available in four progressive sizes to create a striking architectural landscape in entryways or corners.",
    pairsWith: { code: "DSV2299", name: "Dune Stoneware Vase", img: potBg },
    sizes: [
      { name: "Flax-D (H: 21\")", dimensions: "Height: 21\", Top: 8.5\", Bottom: 6.5\"" },
      { name: "Flax-C (H: 28\")", dimensions: "Height: 28\", Top: 11\", Bottom: 8.5\"" },
      { name: "Flax-B (H: 33\")", dimensions: "Height: 33\", Top: 13.5\", Bottom: 10\"" },
      { name: "Flax-A (H: 40\")", dimensions: "Height: 40\", Top: 16\", Bottom: 12\"" },
    ],
  },
  {
    name: "Leaf Textured Planters - Set of 2",
    img: potBg,
    thumbnails: [potBg, potBg, potBg],
    code: "LFS70",
    color: "Light Grey / Leaf Pattern",
    material: "Textured Ceramic",
    dimensions: "Small: H 16.5\", Top 10.5\" | Large: H 25.5\", Top 17\"",
    insideBox: "Set of 2 Leaf-Patterned Planters",
    delivery: "5-7 Working Days",
    payment: "100% Secure Online Payment",
    description: "A set of two elegant tapered planters featuring subtle leaf texture on a neutral light grey backdrop. Designed to complement tall foliage and architectural indoor plants.",
    pairsWith: { code: "DSV2299", name: "Dune Stoneware Vase", img: potBg },
    sizes: [
      { name: "Size B (Small - H: 16.5\")", dimensions: "Height: 16.5\", Top: 10.5\", Bottom: 10.5\"" },
      { name: "Size A (Large - H: 25.5\")", dimensions: "Height: 25.5\", Top: 17\", Bottom: 17\"" },
    ],
  },
  {
    name: "Leaf Textured Planters - Set of 3",
    img: potBg,
    thumbnails: [potBg, potBg, potBg],
    code: "LFS69",
    color: "Charcoal Grey / Leaf Pattern",
    material: "Stone-finished Ceramic",
    dimensions: "Small: H 13.5\", Top 12.5\" | Medium: H 17.5\", Top 16\" | Large: H 21\", Top 19.5\"",
    insideBox: "Set of 3 Leaf-Patterned Planters",
    delivery: "5-7 Working Days",
    payment: "100% Secure Online Payment",
    description: "Embellished with detailed leaf engravings, these charcoal grey planters introduce depth and quiet texture to your plant arrangements. Perfect for modern, rustic, or minimal settings.",
    pairsWith: { code: "DSV2299", name: "Dune Stoneware Vase", img: potBg },
    sizes: [
      { name: "Size C (Small - H: 13.5\")", dimensions: "Height: 13.5\", Top: 12.5\", Bottom: 7.5\"" },
      { name: "Size B (Medium - H: 17.5\")", dimensions: "Height: 17.5\", Top: 16\", Bottom: 9\"" },
      { name: "Size A (Large - H: 21\")", dimensions: "Height: 21\", Top: 19.5\", Bottom: 10.5\"" },
    ],
  },
  {
    name: "VANILLA Planters - Set of 3",
    img: potBg,
    thumbnails: [potBg, potBg, potBg],
    code: "VNL83",
    color: "Sage Green / Textured",
    material: "Textured Ceramic",
    dimensions: "Small: H 8\", Top 9\" | Medium: H 12\", Top 13.5\" | Large: H 16\", Top 18\"",
    insideBox: "Set of 3 Planters (Sizes A, B, C)",
    delivery: "5-7 Working Days",
    payment: "100% Secure Online Payment",
    description: "Add a touch of contemporary refinement to your botanical displays with our Vanilla Planters. Featuring an intricate, textured basket-weave pattern in an elegant sage green hue, this set of three rounded planters brings organic charm and artistic craft to any setting.",
    pairsWith: { code: "DSV2299", name: "Dune Stoneware Vase", img: potBg },
    sizes: [
      { name: "Size C (Small - H: 8\")", dimensions: "Height: 8\", Top: 9\", Bottom: 0\"" },
      { name: "Size B (Medium - H: 12\")", dimensions: "Height: 12\", Top: 13.5\", Bottom: 0\"" },
      { name: "Size A (Large - H: 16\")", dimensions: "Height: 16\", Top: 18\", Bottom: 0\"" },
    ],
  },
  {
    name: "Areca Ribbed Planters - Set of 3",
    img: potBg,
    thumbnails: [potBg, potBg, potBg],
    code: "ARC84",
    color: "Charcoal Black / Ribbed",
    material: "Heavy-textured Ceramic",
    dimensions: "Small: H 15\", Top 8\" | Medium: H 20\", Top 11\" | Large: H 26\", Top 15\"",
    insideBox: "Set of 3 Ribbed Planters",
    delivery: "5-7 Working Days",
    payment: "100% Secure Online Payment",
    description: "Add a touch of structural drama to your corners with these tall, charcoal black ribbed planters. Their heavy horizontal ribbing provides a beautiful backdrop for bright foliage.",
    pairsWith: { code: "DSV2299", name: "Dune Stoneware Vase", img: potBg },
    sizes: [
      { name: "Size C (Small - H: 15\")", dimensions: "Height: 15\", Top: 8\", Bottom: 0\"" },
      { name: "Size B (Medium - H: 20\")", dimensions: "Height: 20\", Top: 11\", Bottom: 0\"" },
      { name: "Size A (Large - H: 26\")", dimensions: "Height: 26\", Top: 15\", Bottom: 0\"" },
    ],
  },
  {
    name: "Faux Ficus Tree — 6 Feet",
    img: potBg,
    thumbnails: [potBg, potBg, potBg],
    code: "FFT2399",
    color: "Green",
    material: "Natural wood trunk & Silk leaves",
    dimensions: "Height: 180 cm Approx.",
    insideBox: "1 Ficus Tree in starter pot",
    delivery: "5-7 Working Days",
    payment: "100% Secure Online Payment",
    description:
      "A favorite of designers everywhere, the Ficus tree softens hard corners and adds heights to blank walls. Hand-finished with lifelike green leaves and natural wood branches for a realistic look.",
    pairsWith: { code: "DSV2299", name: "Dune Stoneware Vase", img: potBg },
  },
  {
    name: "Dune Stoneware Vase",
    img: potBg,
    thumbnails: [potBg, potBg, potBg],
    code: "DSV2299",
    color: "Sandy Beige",
    material: "Rough-textured Ceramic",
    dimensions: "Height: 30 cm, Width: 18 cm",
    insideBox: "1 Stoneware Vase",
    delivery: "3-5 Working Days",
    payment: "100% Secure Online Payment",
    description:
      "Crafted in small batches, this textured stoneware vessel features a raw, organic finish that accentuates the beauty of dry branches or simple botanical stems.",
    pairsWith: {
      code: "AVP2500",
      name: "Artificial Variegated Pothos Plant",
      img: potBg,
    },
  },
  {
    name: "Loom Rattan Storage Basket",
    img: potBg,
    thumbnails: [potBg, potBg, potBg],
    code: "LRB2799",
    color: "Natural Rattan",
    material: "Woven Rattan & Iron frame",
    dimensions: "Height: 40 cm, Diameter: 35 cm",
    insideBox: "1 Woven Rattan Basket",
    delivery: "3-5 Working Days",
    payment: "100% Secure Online Payment",
    description:
      "Woven by hand using traditional techniques, this rattan basket is the perfect outer cover for your plastic starter pots or as a stylish organic storage solution.",
    pairsWith: {
      code: "AMD3999",
      name: "Artificial Monstera Deliciosa Plant",
      img: potBg,
    },
  },
];

export const vases = [
  {
    name: "Aero Black Ceramic Vessel",
    img: potBg,
    thumbnails: [potBg, potBg, potBg],
    code: "ABV2999",
    color: "Matte Black",
    material: "Ceramic",
    dimensions: "Height: 35 cm Approx.",
    insideBox: "1 Black Ceramic Vessel",
    delivery: "3-5 Working Days",
    payment: "100% Secure Online Payment",
    description:
      "Add a bold sculptural touch to your shelves with the Aero Matte Black Ceramic Vessel. Its sleek, geometric silhouette is designed to contrast beautifully with soft organic branches.",
    pairsWith: { code: "DSV2299", name: "Dune Stoneware Vase", img: potBg },
  },
  {
    name: "Dune Stoneware Vase",
    img: potBg,
    thumbnails: [potBg, potBg, potBg],
    code: "DSV2299",
    color: "Sandy Beige",
    material: "Rough-textured Ceramic",
    dimensions: "Height: 30 cm, Width: 18 cm",
    insideBox: "1 Stoneware Vase",
    delivery: "3-5 Working Days",
    payment: "100% Secure Online Payment",
    description:
      "Crafted in small batches, this textured stoneware vessel features a raw, organic finish that accentuates the beauty of dry branches or simple botanical stems.",
    pairsWith: {
      code: "ABV2999",
      name: "Aero Black Ceramic Vessel",
      img: potBg,
    },
  },
  {
    name: "Halo Marble Bowl",
    img: potBg,
    thumbnails: [potBg, potBg, potBg],
    code: "HMB4999",
    color: "White Marble",
    material: "Genuine Marble",
    dimensions: "Diameter: 25 cm Approx.",
    insideBox: "1 Marble Bowl",
    delivery: "3-5 Working Days",
    payment: "100% Secure Online Payment",
    description:
      "Carved from solid white marble, this decorative bowl features beautiful grey veining. Perfect as a keys dish on your entryway console or a centerpiece on your dining table.",
    pairsWith: { code: "LRB2799", name: "Loom Rattan Basket", img: potBg },
  },
  {
    name: "Loom Rattan Basket",
    img: potBg,
    thumbnails: [potBg, potBg, potBg],
    code: "LRB2799",
    color: "Natural Rattan",
    material: "Woven Rattan",
    dimensions: "Height: 40 cm, Diameter: 35 cm",
    insideBox: "1 Woven Rattan Basket",
    delivery: "3-5 Working Days",
    payment: "100% Secure Online Payment",
    description:
      "Woven by hand using traditional techniques, this rattan basket is the perfect outer cover for your plastic starter pots or as a stylish organic storage solution.",
    pairsWith: { code: "HMB4999", name: "Halo Marble Bowl", img: potBg },
  },
];

export const auxiliaryProducts = [
  {
    name: "Faux Bougainvillea — 4 ft",
    img: potBg,
    thumbnails: [potBg, potBg, potBg],
    code: "FBV3999",
    color: "Magenta Pink",
    material: "Premium Silk flowers & plastic stem",
    dimensions: "Height: 120 cm (4 Feet) Approx.",
    insideBox: "1 Faux Bougainvillea Plant",
    delivery: "5-7 Working Days",
    payment: "100% Secure Online Payment",
    description:
      "Bring a vibrant, maintenance-free pop of Mediterranean pink to your home. This Faux Bougainvillea is crafted with realistic silk blossoms and detailed green leaves.",
    pairsWith: { code: "DSV2299", name: "Dune Stoneware Vase", img: potBg },
  },
  {
    name: "Magnetic Floating Shelf",
    img: potBg,
    thumbnails: [potBg, potBg, potBg],
    code: "MFS1899",
    color: "Walnut Brown",
    material: "Solid Oak wood & Neodymium magnets",
    dimensions: "Length: 30 cm, Width: 12 cm",
    insideBox: "1 Magnetic Shelf & Mounting Hardware",
    delivery: "3-5 Working Days",
    payment: "100% Secure Online Payment",
    description:
      "An elegant floating shelf with invisible magnetic mounts. Perfect for exhibiting small vases, keys, or accessories in modern entryways and hallways.",
    pairsWith: { code: "DSV2299", name: "Dune Stoneware Vase", img: potBg },
  },
  {
    name: "Travellers Palm — Tall",
    img: potBg,
    thumbnails: [potBg, potBg, potBg],
    code: "TPT2399",
    color: "Tropical Green",
    material: "PVC & iron core stem",
    dimensions: "Height: 150 cm (5 Feet) Approx.",
    insideBox: "1 Travellers Palm in Starter Pot",
    delivery: "5-7 Working Days",
    payment: "100% Secure Online Payment",
    description:
      "The classic architectural plant for statement-making corners. Featuring large, fan-like split leaves that filter light beautifully and elevate any minimalist living room.",
    pairsWith: {
      code: "LRB2799",
      name: "Loom Rattan Storage Basket",
      img: potBg,
    },
  },
  {
    name: "Halo Marble Coffee Table",
    img: potBg,
    thumbnails: [potBg, potBg, potBg],
    code: "HCT12999",
    color: "Carrara White",
    material: "Polished Marble top & Iron frame",
    dimensions: "Diameter: 60 cm, Height: 45 cm",
    insideBox: "1 Marble Top & 1 Metal Base",
    delivery: "7-10 Working Days",
    payment: "100% Secure Online Payment",
    description:
      "A luxurious accent piece with a solid polished white Carrara marble top. Features natural grey veining and a sleek black powder-coated steel base.",
    pairsWith: {
      code: "LRB2799",
      name: "Loom Rattan Storage Basket",
      img: prod4,
    },
  },
  {
    name: "Hammered Bronze Dispenser",
    img: prod3,
    thumbnails: [prod3, prod1, prod2, prod4, prod3],
    code: "HBD949",
    color: "Antique Bronze",
    material: "Hammered Metal & Plastic pump",
    dimensions: "Height: 18 cm, Diameter: 8 cm",
    insideBox: "1 Soap Dispenser",
    delivery: "3-5 Working Days",
    payment: "100% Secure Online Payment",
    description:
      "Elevate your bathroom styling with this hand-hammered metal soap dispenser. Antique bronze finish adds warmth and quiet texture to ceramic countertops.",
    pairsWith: {
      code: "ABV2999",
      name: "Aero Black Ceramic Vessel",
      img: prod3,
    },
  },
  {
    name: "Indo Mocha Laundry Basket",
    img: prod4,
    thumbnails: [prod4, prod1, prod2, prod3, prod4],
    code: "IMB9000",
    color: "Mocha Brown",
    material: "Woven Natural Fibers & Wood frame",
    dimensions: "Height: 55 cm, Width: 40 cm, Depth: 30 cm",
    insideBox: "1 Laundry Basket",
    delivery: "3-5 Working Days",
    payment: "100% Secure Online Payment",
    description:
      "A premium hand-styled laundry basket crafted from organic mocha fibers on a sturdy wooden skeleton. Blends beautifully with warm linen and wood textures.",
    pairsWith: {
      code: "MFS1899",
      name: "Magnetic Floating Shelf",
      img: prod4,
    },
  },
];

export const reels = [
  {
    video:
      "https://res.cloudinary.com/dfzqcxko0/video/upload/AQMA0vULbKjbHfxFN_LbafPaKgsUHCq22TJBQBYPzAEYtz9V79L9IHeYis2UJfqonVr-BGtqEr4M6wMk-TRBBqLua3kXCTEevUwN48Y_x7a1bz.mp4",
    img: reel1,
    caption: "Every corner deserves a bloom",
    products: [
      { code: "VNL83", name: "VANILLA Planters - Set of 3", img: vanillaImg },
      { code: "FLX48", name: "Flax Series Tapered Vases", img: flaxImg },
    ],
  },
  {
    video:
      "https://res.cloudinary.com/dfzqcxko0/video/upload/AQMsOUr1JFuY-dTcsSzS2N21MKxwidc4kCRysIzRyPPodtGekEc5niA8WcNJiwSRmbIquQgqcXk3vU5mXINQ8kVlZtdI7WLcbwLudBA_ae0joa.mp4",
    img: reel2,
    caption: "Magnetic shelves are a vibe",
    products: [
      { code: "ARC84", name: "Areca Ribbed Planters - Set of 3", img: arecaImg },
      { code: "LFS69", name: "Leaf Textured Planters - Set of 3", img: leaf3Img },
    ],
  },
  {
    video:
      "https://res.cloudinary.com/dfzqcxko0/video/upload/AQMjRBPofM9zfHPjPwGDEOHgg_bdVENW7kC2_mXiG-hWPz_7US7whu8Z7Mq1gOstGgSl96EVCCPUn_ONLqJ4STJW_baeutd.mp4",
    img: reel3,
    caption: "I always wanted one",
    products: [
      { code: "LFS70", name: "Leaf Textured Planters - Set of 2", img: leaf2Img },
      { code: "VNL83", name: "VANILLA Planters - Set of 3", img: vanillaImg },
    ],
  },
  {
    video:
      "https://res.cloudinary.com/dfzqcxko0/video/upload/AQNxeraW9vP0dfy9OtOue_QpufN66WSNSgCS9kOAgQqf_4IC_YNOnbP2l4KvbPVJWG6MldKCLa9_mgV6J6PANedYrZ6n3AgoIDTc5Cw_llnzv7.mp4",
    img: reel4,
    caption: "Tiny upgrades, big shift",
    products: [
      { code: "FLX48", name: "Flax Series Tapered Vases", img: flaxImg },
      { code: "ARC84", name: "Areca Ribbed Planters - Set of 3", img: arecaImg },
    ],
  },
  {
    video:
      "https://res.cloudinary.com/dfzqcxko0/video/upload/AQOOBxA7Pe1Qctu_Ndi62Vu3pgZJTF0z2p59svgA92WyX38Fvo_kozI05zsjZhDOaBS4nIs3FcvLu3ypCRIFzTfhUOalURGYAdwjbuc_yzzbr4.mp4",
    img: reel5,
    caption: "Designer-look in one piece",
    products: [
      { code: "LFS69", name: "Leaf Textured Planters - Set of 3", img: leaf3Img },
      { code: "LFS70", name: "Leaf Textured Planters - Set of 2", img: leaf2Img },
    ],
  },
];

export const blogs = [
  {
    title: "Artificial Plants vs Live Plants",
    desc: "The ultimate guide to choosing the right greenery for your home's light conditions and maintenance lifestyle.",
    tag: "STYLING GUIDE",
    readTime: "5 MIN READ",
    href: "/blog",
  },
  {
    title: "How to Style Architectural Planters",
    desc: "Transform dull entryway corners into dramatic focal points using tall tapered fiberglass floor vases.",
    tag: "DESIGN TIPS",
    readTime: "4 MIN READ",
    href: "/blog",
  },
];

export function getProductByCode(code: string | undefined | null) {
  if (!code) return null;
  const upper = code.trim().toUpperCase();

  const all = [...products, ...vases, ...auxiliaryProducts];
  return all.find((p) => (p.code || "").toUpperCase() === upper) || null;
}
