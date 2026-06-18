import { db } from "@/lib/db";

export const DEFAULT_SERVICES = [
  {
    id: "cl-verification",
    name: "Construction Verification Inspection",
    slug: "construction-verification-inspection",
    description: "Independent construction verification for Africans in the diaspora. Helping you verify and build with confidence back home.",
    price: 350000,
    isActive: true,
    displayOrder: 1,
  },
  {
    id: "cl-foundation",
    name: "Foundation Inspection",
    slug: "foundation-inspection",
    description: "Verify the integrity of excavation work, foundation depth, reinforcement placement, and concrete work before construction progresses further.",
    price: 350000,
    isActive: false,
    displayOrder: 2,
  },
  {
    id: "cl-pre-roof",
    name: "Pre-Roof Inspection",
    slug: "pre-roof-inspection",
    description: "Inspect the structure before roofing begins to ensure walls, beams, columns, and structural elements are properly executed.",
    price: 350000,
    isActive: false,
    displayOrder: 3,
  },
  {
    id: "cl-post-roof",
    name: "Post-Roof Inspection",
    slug: "post-roof-inspection",
    description: "Inspect roofing installation and verify workmanship, alignment, waterproofing, and overall roof quality.",
    price: 350000,
    isActive: false,
    displayOrder: 4,
  },
  {
    id: "cl-pre-cover",
    name: "Pre-Cover Inspection",
    slug: "pre-cover-inspection",
    description: "Inspect the property just before plastering and finishing works begin. This allows hidden elements to be verified before they become inaccessible.",
    price: 350000,
    isActive: false,
    displayOrder: 5,
  },
  {
    id: "cl-full-home",
    name: "Full Home Inspection",
    slug: "full-home-inspection",
    description: "A comprehensive inspection of the entire property before occupancy or handover.",
    price: 350000,
    isActive: false,
    displayOrder: 6,
  },
];

export async function getInspectionServices() {
  try {
    const services = await db.inspectionService.findMany({
      orderBy: { displayOrder: "asc" },
    });
    if (services && services.length > 0) {
      return services;
    }
    return DEFAULT_SERVICES;
  } catch (error) {
    console.warn("Database connection failed. Falling back to default services:", error);
    return DEFAULT_SERVICES;
  }
}
