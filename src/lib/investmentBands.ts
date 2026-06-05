export type InvestmentBand = {
  title: string;
  range: string;
  description: string;
  typicalFeatures: string[];
  placeholderLabel: string;
  imageSrc: string;
};

export const investmentBands: InvestmentBand[] = [
  {
    title: "Garden Refresh",
    range: "£3,500 – £7,000",
    description:
      "Small but impactful upgrades focused on atmosphere, seating, planting and simple hard landscaping.",
    typicalFeatures: [
      "Small seating area",
      "Planting improvements",
      "Raised planter feature",
      "Low-maintenance materials",
      "Feature lighting",
    ],
    placeholderLabel: "Placeholder image: Garden Refresh",
    imageSrc: "/images/investment/garden-refresh.png",
  },
  {
    title: "Signature Transformation",
    range: "£7,500 – £15,000",
    description:
      "A more complete garden redesign with stronger visual impact and selected premium features.",
    typicalFeatures: [
      "Patio or seating zone",
      "Pergola subject to scope",
      "Privacy screening",
      "Raised beds",
      "Garden lighting",
    ],
    placeholderLabel: "Placeholder image: Signature Transformation",
    imageSrc: "/images/investment/signature-transformation.png",
  },
  {
    title: "Outdoor Living",
    range: "£15,000 – £30,000",
    description:
      "A fuller outdoor living scheme with dedicated zones for dining, entertaining and relaxing.",
    typicalFeatures: [
      "Larger patio",
      "Pergola",
      "Multiple zones",
      "Feature lighting",
      "Fire pit or dining area",
    ],
    placeholderLabel: "Placeholder image: Outdoor Living",
    imageSrc: "/images/investment/outdoor-living.png",
  },
  {
    title: "Luxury Outdoor Space",
    range: "£30,000 – £60,000+",
    description:
      "A complete outdoor environment with premium materials, bespoke features and a highly considered finish.",
    typicalFeatures: [
      "Full garden transformation",
      "Outdoor kitchen",
      "Premium pergola",
      "Architectural lighting",
      "Wellness / hot tub area",
    ],
    placeholderLabel: "Placeholder image: Luxury Outdoor Space",
    imageSrc: "/images/investment/luxury-outdoor-space.png",
  },
];

export function getInvestmentBandValue(title: string) {
  const band = investmentBands.find((item) => item.title === title);

  return band ? `${band.title}: ${band.range}` : "";
}

export function normaliseInvestmentBand(value: string) {
  const title = value.split(":")[0];

  return getInvestmentBandValue(title) || value;
}
