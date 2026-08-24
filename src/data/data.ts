/**
 * MASFIRA MAISON — SITE & CATALOG CONFIGURATION
 * ------------------------------------------------------------
 * Everything the business owner needs to update — products,
 * flavors, weights, delivery areas/charges, payment details —
 * lives in this one file. No React/TS knowledge required for
 * day-to-day catalog edits, and this is exactly the shape a
 * future admin dashboard would read from / write to.
 *
 * No prices, UPI IDs or addresses are fabricated here. Anything
 * not supplied is left `null` / empty with a TODO comment, and
 * the UI degrades gracefully (e.g. "Price on request").
 * ------------------------------------------------------------
 */
import type {
  Product,
  ProductCategory,
  DeliveryArea,
  PaymentMethodConfig,
  GalleryItem,
  Testimonial,
  WeightOption
} from "@/lib/types";

/* ============================================================
   BUSINESS INFO
   ============================================================ */
export const BUSINESS = {
  name: "Masfira Maison",
  tagline: "Homemade at heart. Premium by design.",
  phone: "9172023569",
  countryCode: "91",
  email: "",
  instagramHandle: "@masfiramaison",
  instagramUrl: "https://instagram.com/masfiramaison",
  city: "Pune",
  area: "Kondhwa",
  addressLine: "Near Omkar Garden Hall, Kondhwa, Pune – 411048",
  currencySymbol: "₹",
  // Minimum days' notice required before a pickup/delivery date.
  leadTimeDays: 2,
  closedWeekdays: [] as number[], // 0 = Sunday ... 6 = Saturday
  blackoutDates: [] as string[], // "YYYY-MM-DD"
  pickupSlots: [
    { value: "morning", label: "Morning · 10 AM – 12 PM" },
    { value: "afternoon", label: "Afternoon · 12 PM – 4 PM" },
    { value: "evening", label: "Evening · 4 PM – 8 PM" }
  ] as { value: string; label: string }[]
};

export const WHATSAPP_GREETING = "Hello Masfira Maison, I'd like to place a cake order.";

/* ============================================================
   GLOBAL OPTION LISTS
   ============================================================ */
export const BASIC_FLAVORS = [
  "Vanilla",
  "Chocolate",
  "Strawberry",
  "Red Velvet",
  "Pineapple",
  "Oreo",
  "Rose"
];

export const TRES_LECHES_FLAVORS = ["Chocolate", "Vanilla", "Strawberry", "Paan"];

export const JAR_FLAVORS = ["Vanilla", "Strawberry", "Red Velvet", "Chocolate", "Truffle"];

export const DESIGN_OPTIONS = [
  "Simple & Elegant",
  "Floral",
  "Birthday Theme",
  "Kids Theme",
  "Wedding",
  "Custom Design"
];

// Fallback weight ladder used when a product doesn't define its own.
export const WEIGHTS: WeightOption[] = [
  { label: "½ kg", value: "0.5kg", priceAdd: null },
  { label: "1 kg", value: "1kg", priceAdd: null },
  { label: "1.5 kg", value: "1.5kg", priceAdd: null },
  { label: "2 kg", value: "2kg", priceAdd: null },
  { label: "Custom Weight", value: "custom", priceAdd: null }
];

// Basic Cakes — Vanilla, Strawberry, Chocolate, Butterscotch, Red Velvet. Basic finish included.
export const BASIC_CAKE_WEIGHTS: WeightOption[] = [
  { label: "½ kg", value: "0.5kg", priceAdd: 450 },
  { label: "1 kg", value: "1kg", priceAdd: 750 },
  { label: "1.5 kg", value: "1.5kg", priceAdd: 1050 },
  { label: "2 kg", value: "2kg", priceAdd: 1300 },
  { label: "Custom Weight", value: "custom", priceAdd: null }
];

// Truffle Cake — premium truffle finish.
export const TRUFFLE_CAKE_WEIGHTS: WeightOption[] = [
  { label: "½ kg", value: "0.5kg", priceAdd: 550 },
  { label: "1 kg", value: "1kg", priceAdd: 950 },
  { label: "1.5 kg", value: "1.5kg", priceAdd: 1350 },
  { label: "2 kg", value: "2kg", priceAdd: 1750 },
  { label: "Custom Weight", value: "custom", priceAdd: null }
];

// Cupcakes — sold by the pack, same flavors as Basic Cakes.
export const CUPCAKE_PACKS: WeightOption[] = [
  { label: "6 pcs", value: "6pcs", priceAdd: 330 },
  { label: "12 pcs", value: "12pcs", priceAdd: 600 }
];

export const CAKE_TYPES_FOR_CUSTOM = [
  "Birthday Cake",
  "Anniversary Cake",
  "Wedding Cake",
  "Engagement Cake",
  "Baby Shower Cake",
  "Kids' Party Cake",
  "Corporate Event Cake",
  "Other Celebration Cake"
];

/* ============================================================
   PRODUCT CATEGORIES
   ============================================================ */
export const CATEGORIES: ProductCategory[] = [
  { id: "basic", name: "Basic Cakes" },
  { id: "truffle", name: "Truffle Cake" },
  { id: "bento", name: "Bento Cakes" },
  { id: "tres-leches", name: "Tres Leches" },
  { id: "tiramisu", name: "Tiramisu" },
  { id: "jar", name: "Jar Cakes" },
  { id: "cupcakes", name: "Cupcakes" },
  { id: "combo", name: "Combos" },
  { id: "marble", name: "Loaf Slices" },
  { id: "specials", name: "Maison Specials" }
];

/* ============================================================
   PRODUCT CATALOG
   `fields` lists only the product-specific customization inputs —
   Date, Pickup/Delivery, Terms acceptance and (where applicable)
   Delivery Area/Address are always part of every order form.
   ============================================================ */
export const PRODUCTS: Product[] = [
  {
    id: "basic-cake",
    name: "Basic Cakes",
    category: "basic",
    description: "Classic homemade cakes in the flavors everyone loves. Basic finish included.",
    image: "/images/product-basic-white-cake.jpg",
    price: 0,
    weightOptions: BASIC_CAKE_WEIGHTS,
    flavors: BASIC_FLAVORS,
    fields: ["flavor", "weight", "design", "message", "specialInstructions"]
  },
  {
    id: "truffle-cake",
    name: "Truffle Cake",
    category: "truffle",
    description: "Rich chocolate truffle goodness, with a premium truffle finish.",
    image: "/images/product-truffle-birthday.jpg",
    price: 0,
    weightOptions: TRUFFLE_CAKE_WEIGHTS,
    fields: ["weight", "design", "message", "specialInstructions"]
  },
  {
    id: "bento-cake",
    name: "Bento Cake",
    category: "bento",
    description: "Cute, personal-sized cakes — perfect for small, sweet celebrations. Basic design included; custom design ₹449 onwards.",
    image: "/images/product-bento-ribbon-box.jpg",
    price: 349,
    flavors: BASIC_FLAVORS,
    fields: ["flavor", "design", "message"]
  },
  {
    id: "tres-leches",
    name: "Tres Leches Milk Cake",
    category: "tres-leches",
    description: "Soft, moist & milky delight — sold per box.",
    image: "/images/product-tres-leches.jpg",
    price: 199,
    flavors: TRES_LECHES_FLAVORS,
    fields: ["flavor"]
  },
  {
    id: "tiramisu-box",
    name: "Tiramisu Cake Box",
    category: "tiramisu",
    description: "Classic coffee & cream layers, boxed and ready to gift or enjoy.",
    image: "/images/product-tiramisu.jpg",
    price: 229,
    pricePerUnit: true,
    fields: ["quantity", "specialInstructions"]
  },
  {
    id: "jar-cake",
    name: "Jar Cake",
    category: "jar",
    description: "Individually portioned cake jars — easy to share, fun to gift. Box of 4 for ₹560.",
    image: "/images/product-jar-cakes.jpg",
    price: 150,
    pricePerUnit: true,
    flavors: JAR_FLAVORS,
    fields: ["flavor", "quantity"]
  },
  {
    id: "cupcakes",
    name: "Cupcakes",
    category: "cupcakes",
    description: "Freshly baked cupcakes, made to order — same flavours as Basic Cakes.",
    image: "/images/product-cupcakes.jpg",
    price: 0,
    packOptions: CUPCAKE_PACKS,
    flavors: BASIC_FLAVORS,
    fields: ["flavor", "packSize", "specialInstructions"]
  },
  {
    id: "bento-cupcake-combo",
    name: "Bento Cake + 6 Cupcakes Combo",
    category: "combo",
    description: "Our most-loved pairing. Basic designs only; custom combo ₹649 onwards.",
    image: "/images/product-bento-ribbon-box.jpg",
    price: 579,
    fields: ["comboFlavor", "comboCupcakeFlavor", "specialInstructions"],
    badge: "Best Combo"
  },
  {
    id: "tea-cake-loaf",
    name: "Tea Cake",
    category: "marble",
    description: "A simple, beautiful loaf cake — priced onwards.",
    image: "/images/product-tea-cake-walnut.jpg",
    price: 280,
    fields: []
  },
  {
    id: "marble-slices",
    name: "Marble Cake",
    category: "marble",
    description: "Sliced marble cake, priced per slice. Minimum 3 slices.",
    image: "/images/product-marble-loaf.jpg",
    price: 75,
    pricePerUnit: true,
    fields: ["quantity"]
  },

  /* -------- Maison Specials — richer, signature shelf -------- */
  {
    id: "gulkand-paan-tres-leches",
    name: "Gulkand Paan Tres Leches Milk Cake",
    category: "specials",
    description: "Our tres leches, reimagined with the fragrant flavors of gulkand paan.",
    image: "/images/product-gulkand-paan-green.jpg",
    price: null,
    weightOptions: WEIGHTS,
    fields: ["weight", "message", "specialInstructions"],
    badge: "Maison Special",
    featured: true
  },
  {
    id: "rasmalai-cake",
    name: "Rasmalai Cake",
    category: "specials",
    description: "A luxurious cake built around the delicate, milky flavor of rasmalai.",
    image: "/images/gallery-5.svg",
    price: null,
    weightOptions: WEIGHTS,
    fields: ["weight", "message", "specialInstructions"],
    badge: "Maison Special",
    featured: true
  },
  {
    id: "london-cake-box",
    name: "London Cake Box",
    category: "specials",
    description: "A decadent, chocolate-forward signature box, boxed for gifting.",
    image: "/images/gallery-6.svg",
    price: null,
    fields: ["quantity", "specialInstructions"],
    badge: "Maison Special",
    featured: true
  }
];

/* ============================================================
   DELIVERY
   Nearby-area charges are configurable estimates within the
   ₹20–₹50 range given for Kondhwa & Camp. "Other" locations are
   intentionally left unpriced — charged as per delivery service.
   ============================================================ */
export const DELIVERY_AREAS: DeliveryArea[] = [
  { id: "kondhwa", name: "Kondhwa", charge: 30 },
  { id: "camp", name: "Camp", charge: 40 },
  { id: "other", name: "Other / Long-Distance", charge: null }
];

/* ============================================================
   PAYMENT
   Masfira Maison accepts Google Pay, UPI, Paytm and Bank Transfer
   for every order. Cash is accepted only when collecting an order
   in person at pickup — never for delivery (no COD).
   Identifiers/QR codes are left blank until the business shares
   them; the UI falls back to "shared with you directly" copy.
   ============================================================ */
export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  { id: "googlepay", label: "Google Pay", identifier: null },
  { id: "upi", label: "UPI", identifier: null },
  { id: "paytm", label: "Paytm", identifier: null },
  { id: "banktransfer", label: "Bank Transfer", identifier: null },
  { id: "cash", label: "Cash", identifier: "Pay at pickup", pickupOnly: true }
];

export const CASH_ON_DELIVERY_AVAILABLE = false;

/* ============================================================
   TERMS & CONDITIONS
   ============================================================ */
export const TERMS = [
  {
    title: "1. Advance Payment",
    text: "Order is confirmed only after advance payment."
  },
  { title: "2. Cancellation", text: "No last-minute cancellations." },
  { title: "3. Custom Cakes", text: "No refund on custom cakes." },
  {
    title: "4. Handmade Products",
    text: "Design may slightly vary as all items are handmade."
  },
  { title: "5. Pickup Timing", text: "Please collect the order on time." },
  {
    title: "6. Delivery",
    text: "Delivery charges depend on the selected delivery location and applicable delivery service charges."
  },
  {
    title: "7. Payment",
    text: "We accept Google Pay, UPI, Paytm and Bank Transfer. Cash is accepted only at pickup — Cash on Delivery is not available."
  }
];

/* ============================================================
   WHY MASFIRA MAISON
   ============================================================ */
export const WHY_US = [
  { icon: "sparkle", title: "Freshly Baked", text: "Prepared fresh for your order." },
  { icon: "heart", title: "Homemade", text: "Handcrafted with personal attention." },
  { icon: "leaf", title: "Premium Ingredients", text: "Made with carefully selected ingredients." },
  { icon: "gift", title: "Personalized", text: "Custom designs created for your special moments." },
  { icon: "detail", title: "Made With Love", text: "Every cake is prepared with care and attention to detail." }
] as const;

/* ============================================================
   HOW TO ORDER
   ============================================================ */
export const HOW_TO_ORDER = [
  { step: "01", title: "Choose Your Cake", text: "Browse the Masfira Maison menu." },
  { step: "02", title: "Customize", text: "Select flavor, weight, design, message, and other preferences." },
  { step: "03", title: "Choose Delivery or Pickup", text: "Provide your preferred date and location." },
  { step: "04", title: "Make Advance Payment", text: "Pay using Google Pay, UPI, Paytm or Bank Transfer (cash accepted at pickup)." },
  { step: "05", title: "Order Confirmed", text: "Your order is confirmed after payment verification." },
  { step: "06", title: "Enjoy Your Cake", text: "Freshly baked and prepared for your special moment." }
];

/* ============================================================
   GALLERY — real Masfira Maison-style photography.
   ============================================================ */
export const GALLERY: GalleryItem[] = [
  { id: 1, category: "Basic Cakes", image: "/images/product-basic-white-cake.jpg", alt: "Elegant homemade basic cake" },
  { id: 2, category: "Truffle Cake", image: "/images/product-truffle-birthday.jpg", alt: "Chocolate truffle birthday cake" },
  { id: 3, category: "Bento Cakes", image: "/images/product-bento-ribbon-box.jpg", alt: "Bento cake in a gift box with ribbon" },
  { id: 4, category: "Tres Leches", image: "/images/product-tres-leches.jpg", alt: "Tres leches milk cake" },
  { id: 5, category: "Tiramisu", image: "/images/product-tiramisu.jpg", alt: "Classic tiramisu slice" },
  { id: 6, category: "Jar Cakes", image: "/images/product-jar-cakes.jpg", alt: "Assorted dessert jar cakes" },
  { id: 7, category: "Cupcakes", image: "/images/product-cupcakes.jpg", alt: "Assorted freshly baked cupcakes" },
  { id: 8, category: "Loaf Slices", image: "/images/product-tea-cake-walnut.jpg", alt: "Walnut tea cake loaf" },
  { id: 9, category: "Loaf Slices", image: "/images/product-marble-loaf.jpg", alt: "Sliced marble cake loaf" },
  { id: 10, category: "Maison Specials", image: "/images/product-gulkand-paan-green.jpg", alt: "Gulkand paan tres leches milk cake" }
];

/* ============================================================
   TESTIMONIALS — intentionally empty. No reviews were supplied;
   add real ones as they come in: { rating, text, name }
   ============================================================ */
export const TESTIMONIALS: Testimonial[] = [];

export const INSTAGRAM_POSTS = [
  { image: "/images/gallery-1.svg" },
  { image: "/images/gallery-3.svg" },
  { image: "/images/gallery-5.svg" },
  { image: "/images/gallery-6.svg" },
  { image: "/images/category-birthday.svg" },
  { image: "/images/category-kids.svg" }
];
