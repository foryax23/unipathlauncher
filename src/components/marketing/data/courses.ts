// Subject categories surfaced on the landing page. Real partner institutions
// are extracted from the May/June 2026 intake PDF.
export type Course = {
  id: string;
  title: string;
  blurb: string;
  partners: string[];
  levels: string[];
};

export const COURSES: Course[] = [
  {
    id: "business-finance",
    title: "Business & Finance",
    blurb:
      "Foundation, undergraduate and postgraduate routes into business, management and finance.",
    partners: [
      "Canterbury Christ Church (LSC)",
      "University of Suffolk",
      "University of Bolton",
      "Arden University",
    ],
    levels: ["Foundation", "Undergraduate", "Postgraduate"],
  },
  {
    id: "health-social-care",
    title: "Health & Social Care",
    blurb:
      "Build a career in care with CertHE and degree pathways at established UK providers.",
    partners: [
      "University of Suffolk (LSC)",
      "Global Banking School",
      "Leeds Trinity University",
    ],
    levels: ["Foundation", "Undergraduate"],
  },
  {
    id: "public-health",
    title: "Public Health",
    blurb:
      "CertHE Public Health with day classes in London and Birmingham, plus Level 4 progression.",
    partners: ["Canterbury Christ Church (LSC)", "University of Bolton"],
    levels: ["Foundation", "Undergraduate"],
  },
  {
    id: "computer-science",
    title: "Computer Science",
    blurb:
      "Software engineering, data and cyber routes with strong industry links.",
    partners: [
      "Arden University",
      "London Metropolitan University",
      "Staffordshire University",
    ],
    levels: ["Foundation", "Undergraduate", "Postgraduate"],
  },
  {
    id: "law",
    title: "Law",
    blurb:
      "LLB and conversion routes from London-based and partner providers across the UK.",
    partners: ["London Metropolitan University", "Arden University"],
    levels: ["Undergraduate", "Postgraduate"],
  },
  {
    id: "engineering-tech",
    title: "Engineering & Technology",
    blurb:
      "Mechanical, electrical and digital engineering programmes at modern campuses.",
    partners: ["University of Bolton", "Staffordshire University"],
    levels: ["Foundation", "Undergraduate"],
  },
  {
    id: "arts-design",
    title: "Arts & Design",
    blurb:
      "Creative degrees spanning graphic design, fashion, photography and digital media.",
    partners: ["Mont Rose College", "William College", "Arden University"],
    levels: ["Foundation", "Undergraduate"],
  },
  {
    id: "education",
    title: "Education & Early Years",
    blurb:
      "Early years and teaching support routes for those building a career in education.",
    partners: ["Leeds Trinity University", "Canterbury Christ Church"],
    levels: ["Foundation", "Undergraduate"],
  },
];

export const SUBJECT_OPTIONS = COURSES.map((c) => c.title);
