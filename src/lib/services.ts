import { db } from "@/lib/db";

export const DEFAULT_SERVICES = [
  {
    id: "cl-land-verification",
    name: "Land & Property Purchase Verification",
    slug: "land-property-purchase-verification",
    // TODO: price is a placeholder pending business decision — see AGENTS/services discussion.
    description: "Before you commit funds, know exactly what you're buying. We verify title and ownership documents (C of O, Governor's Consent, Deed of Assignment), check for encumbrances, mortgages, or pending litigation, confirm the physical boundaries on the ground match the survey plan, and investigate community/family (omo-onile) claims on the land.",
    price: 350000,
    isActive: false,
    displayOrder: 0,
  },
  {
    id: "cl-verification",
    name: "General Progress Inspection",
    slug: "general-progress-inspection",
    description: "A single independent inspection at whatever stage your project currently stands. Ideal when you want one comprehensive check-in without waiting for a specific milestone like foundation, roofing, or finishing.",
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
