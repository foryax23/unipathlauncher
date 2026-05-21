// Subject categories + full course index extracted from
// "All Courses May/June Intake 2026" PDF.

export type Course = {
  id: string;
  title: string;
  blurb: string;
  partners: string[];
  levels: string[];
  icon?: string;
};

export const COURSES: Course[] = [
  {
    id: "business-finance",
    title: "Business & Finance",
    blurb:
      "Foundation, undergraduate and postgraduate routes into business, management, finance and entrepreneurship.",
    partners: [
      "Canterbury Christ Church (LSC)",
      "University of Suffolk (LSC)",
      "University of Bolton",
      "Arden University",
      "Staffordshire University",
      "London Met (UGM)",
    ],
    levels: ["Foundation", "Undergraduate", "Top-up", "Postgraduate", "MBA"],
  },
  {
    id: "health-social-care",
    title: "Health & Social Care",
    blurb:
      "From CertHE and HND Healthcare Practice to BSc and MSc routes for nursing, social care and wellbeing.",
    partners: [
      "University of Suffolk (LSC)",
      "Global Banking School",
      "Leeds Trinity University",
      "London Met (UGM)",
      "Mont Rose College",
    ],
    levels: ["Foundation", "HND", "Undergraduate", "Top-up", "Postgraduate"],
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
    title: "Computer Science & IT",
    blurb:
      "Software engineering, computing, data and cyber security routes with strong industry links.",
    partners: [
      "Arden University",
      "London Met (UGM)",
      "Mont Rose College",
      "Global Banking School",
    ],
    levels: ["Foundation", "HND", "Undergraduate", "Top-up", "Postgraduate"],
  },
  {
    id: "law",
    title: "Law & Legal Studies",
    blurb: "CertHE Legal Studies and LLB pathways with online law readiness test.",
    partners: ["London School of Commerce", "London Met (UGM)"],
    levels: ["Foundation", "Undergraduate"],
  },
  {
    id: "engineering",
    title: "Engineering & Construction",
    blurb:
      "BEng Electrical, Mechanical and Software Engineering, plus HND Construction Management.",
    partners: ["London Met (UGM)", "Pearson HNC/HND"],
    levels: ["Foundation", "HND", "Undergraduate", "Top-up", "Postgraduate"],
  },
  {
    id: "arts-design",
    title: "Arts, Design & Media",
    blurb:
      "Fashion media, visual communication and digital marketing routes with creative portfolios.",
    partners: ["Arts University Plymouth", "Arden University", "Staffordshire"],
    levels: ["Foundation", "Undergraduate", "Postgraduate"],
  },
  {
    id: "education",
    title: "Education & Early Years",
    blurb:
      "BA (Hons) Early Years and Education and Care, plus teaching support pathways.",
    partners: ["Leeds Trinity University", "William College"],
    levels: ["Foundation", "Undergraduate"],
  },
  {
    id: "hospitality-tourism",
    title: "Hospitality & Tourism",
    blurb:
      "HND Hospitality Management and BSc Business & Tourism Management routes.",
    partners: ["Pearson HND", "Staffordshire University"],
    levels: ["HND", "Foundation", "Undergraduate"],
  },
  {
    id: "psychology",
    title: "Psychology",
    blurb:
      "BSc Applied Business Psychology and MSc Psychology Conversion routes.",
    partners: ["Arden University", "London Met (UGM)"],
    levels: ["Foundation", "Undergraduate", "Postgraduate"],
  },
];

// Full programme index. Used by /courses page and onboarding subject step.
export type Programme = {
  id: string;
  name: string;
  level: "Foundation" | "Undergraduate" | "Top-up" | "HND" | "HNC" | "Postgraduate" | "MBA";
  partner: string;
  provider: string;
  subject: string; // matches Course.id
  cities: string[];
  modes: ("Day" | "Evening" | "Weekend" | "Online")[];
  duration: string;
};

export const PROGRAMMES: Programme[] = [
  // LSC / CCCU
  { id: "lsc-cccu-business-fy-lon", name: "CertHE Business with Foundation", level: "Foundation", partner: "Canterbury Christ Church", provider: "London School of Commerce", subject: "business-finance", cities: ["London"], modes: ["Day", "Evening"], duration: "1 year" },
  { id: "lsc-cccu-business-fy-bir", name: "CertHE Business with Foundation", level: "Foundation", partner: "Canterbury Christ Church", provider: "London School of Commerce", subject: "business-finance", cities: ["Birmingham"], modes: ["Day"], duration: "1 year" },
  { id: "lsc-cccu-ph-fy-lon", name: "CertHE Public Health with Foundation", level: "Foundation", partner: "Canterbury Christ Church", provider: "London School of Commerce", subject: "public-health", cities: ["London"], modes: ["Day"], duration: "1 year" },
  { id: "lsc-cccu-ph-fy-bir", name: "CertHE Public Health with Foundation", level: "Foundation", partner: "Canterbury Christ Church", provider: "London School of Commerce", subject: "public-health", cities: ["Birmingham"], modes: ["Day"], duration: "1 year" },
  { id: "lsc-cccu-bus-l4-lon", name: "CertHE Business Studies L4", level: "Undergraduate", partner: "Canterbury Christ Church", provider: "London School of Commerce", subject: "business-finance", cities: ["London"], modes: ["Day", "Evening"], duration: "1 year" },
  { id: "lsc-cccu-ph-l4-lon", name: "CertHE Public Health L4", level: "Undergraduate", partner: "Canterbury Christ Church", provider: "London School of Commerce", subject: "public-health", cities: ["London"], modes: ["Day"], duration: "1 year" },
  // LSC / UOS
  { id: "lsc-uos-bus-fy-lon", name: "CertHE Business with Foundation", level: "Foundation", partner: "University of Suffolk", provider: "London School of Commerce", subject: "business-finance", cities: ["London"], modes: ["Day", "Evening"], duration: "1 year" },
  { id: "lsc-uos-bus-fy-man", name: "CertHE Business with Foundation", level: "Foundation", partner: "University of Suffolk", provider: "London School of Commerce", subject: "business-finance", cities: ["Manchester"], modes: ["Day"], duration: "1 year" },
  { id: "lsc-uos-hsc-fy-lon", name: "CertHE Health & Social Care with Foundation", level: "Foundation", partner: "University of Suffolk", provider: "London School of Commerce", subject: "health-social-care", cities: ["London"], modes: ["Day"], duration: "1 year" },
  { id: "lsc-uos-hsc-fy-man", name: "CertHE Health & Social Care with Foundation", level: "Foundation", partner: "University of Suffolk", provider: "London School of Commerce", subject: "health-social-care", cities: ["Manchester"], modes: ["Day"], duration: "1 year" },
  // London Met (UGM)
  { id: "ugm-bus-fy", name: "BSc (Hons) Business Management with Foundation Year", level: "Foundation", partner: "London Met", provider: "UGM", subject: "business-finance", cities: ["London"], modes: ["Day", "Online"], duration: "4 years" },
  { id: "ugm-bus-tu", name: "BSc (Hons) Business Management (Top-Up)", level: "Top-up", partner: "London Met", provider: "UGM", subject: "business-finance", cities: ["London"], modes: ["Day"], duration: "1 year" },
  { id: "ugm-comp-fy", name: "BSc (Hons) Computing with Foundation Year", level: "Foundation", partner: "London Met", provider: "UGM", subject: "computer-science", cities: ["London"], modes: ["Day"], duration: "4 years" },
  { id: "ugm-comp", name: "BSc (Hons) Computing", level: "Undergraduate", partner: "London Met", provider: "UGM", subject: "computer-science", cities: ["London"], modes: ["Day"], duration: "3 years" },
  { id: "ugm-eee-fy", name: "BEng (Hons) Electrical & Electronic Engineering with Foundation", level: "Foundation", partner: "London Met", provider: "UGM", subject: "engineering", cities: ["London"], modes: ["Day"], duration: "4 years" },
  { id: "ugm-eee-tu", name: "BEng (Hons) Electrical & Electronic Engineering Top-Up", level: "Top-up", partner: "London Met", provider: "UGM", subject: "engineering", cities: ["London"], modes: ["Day"], duration: "1 year" },
  { id: "ugm-mech-fy", name: "BEng (Hons) Mechanical Engineering with Foundation", level: "Foundation", partner: "London Met", provider: "UGM", subject: "engineering", cities: ["London"], modes: ["Day"], duration: "4 years" },
  { id: "ugm-se-fy", name: "BEng (Hons) Software Engineering with Foundation", level: "Foundation", partner: "London Met", provider: "UGM", subject: "computer-science", cities: ["London"], modes: ["Day"], duration: "4 years" },
  { id: "ugm-se-tu", name: "BEng (Hons) Software Engineering Top-Up", level: "Top-up", partner: "London Met", provider: "UGM", subject: "computer-science", cities: ["London"], modes: ["Day"], duration: "1 year" },
  { id: "ugm-hsc", name: "BSc (Hons) Health & Social Care", level: "Undergraduate", partner: "London Met", provider: "UGM", subject: "health-social-care", cities: ["London"], modes: ["Day"], duration: "3 years" },
  { id: "ugm-hsc-fy", name: "BSc (Hons) Health & Social Care with Foundation", level: "Foundation", partner: "London Met", provider: "UGM", subject: "health-social-care", cities: ["London", "Online"], modes: ["Day", "Online"], duration: "4 years" },
  { id: "ugm-hsc-tu", name: "BSc (Hons) Health & Social Care Top-Up", level: "Top-up", partner: "London Met", provider: "UGM", subject: "health-social-care", cities: ["London"], modes: ["Day"], duration: "1 year" },
  { id: "ugm-llb-fy", name: "LLB (Hons) Law with Foundation Year", level: "Foundation", partner: "London Met", provider: "UGM", subject: "law", cities: ["London"], modes: ["Day"], duration: "4 years" },
  { id: "ugm-mba", name: "MBA Online", level: "MBA", partner: "London Met", provider: "UGM", subject: "business-finance", cities: ["Online"], modes: ["Online"], duration: "1 year" },
  { id: "ugm-mim", name: "MSc International Management (online)", level: "Postgraduate", partner: "London Met", provider: "UGM", subject: "business-finance", cities: ["Online"], modes: ["Online"], duration: "1 year" },
  { id: "ugm-mse", name: "MSc Software Engineering", level: "Postgraduate", partner: "London Met", provider: "UGM", subject: "computer-science", cities: ["London"], modes: ["Day"], duration: "1 year" },
  // GBS / Arden / others
  { id: "gbs-hnc-bus", name: "Pearson HNC Business (Business Management)", level: "HNC", partner: "Pearson", provider: "Global Banking School", subject: "business-finance", cities: ["London", "Manchester", "Birmingham"], modes: ["Day", "Evening"], duration: "1 year" },
  { id: "gbs-hnc-dt", name: "Pearson HNC Digital Technologies", level: "HNC", partner: "Pearson", provider: "Global Banking School", subject: "computer-science", cities: ["London"], modes: ["Day"], duration: "1 year" },
  { id: "gbs-hnc-eng", name: "Pearson HNC Engineering", level: "HNC", partner: "Pearson", provider: "Global Banking School", subject: "engineering", cities: ["London"], modes: ["Day"], duration: "1 year" },
  { id: "gbs-hnc-hcp", name: "Pearson HNC Health Care Practice", level: "HNC", partner: "Pearson", provider: "Global Banking School", subject: "health-social-care", cities: ["London", "Birmingham"], modes: ["Day"], duration: "1 year" },
  { id: "arden-mba", name: "MBA International Business", level: "MBA", partner: "Arden University", provider: "Arden", subject: "business-finance", cities: ["London", "Online"], modes: ["Day", "Online"], duration: "1 year" },
  { id: "arden-msc-cyber", name: "MSc Cyber Security & Digital Forensics", level: "Postgraduate", partner: "Arden University", provider: "Arden", subject: "computer-science", cities: ["London"], modes: ["Day", "Online"], duration: "1 year" },
  { id: "arden-msc-ph", name: "MSc Public Health & Social Care", level: "Postgraduate", partner: "Arden University", provider: "Arden", subject: "public-health", cities: ["London", "Online"], modes: ["Day", "Online"], duration: "1 year" },
  { id: "arden-dba", name: "DBA Doctor of Business Administration", level: "Postgraduate", partner: "Arden University", provider: "Arden", subject: "business-finance", cities: ["London", "Online"], modes: ["Online"], duration: "3 years" },
  { id: "arden-cert-comp", name: "CertHE Computing", level: "Foundation", partner: "Arden University", provider: "Arden", subject: "computer-science", cities: ["London"], modes: ["Day", "Weekend"], duration: "1 year" },
  { id: "arden-cert-bus", name: "CertHE Business Skills", level: "Foundation", partner: "Arden University", provider: "Arden", subject: "business-finance", cities: ["London"], modes: ["Day", "Weekend"], duration: "1 year" },
  { id: "arden-cert-hsc", name: "CertHE Health & Social Care", level: "Foundation", partner: "Arden University", provider: "Arden", subject: "health-social-care", cities: ["London"], modes: ["Day", "Weekend"], duration: "1 year" },
  { id: "arden-ba-bm", name: "BA Business Management", level: "Undergraduate", partner: "Arden University", provider: "Arden", subject: "business-finance", cities: ["London"], modes: ["Day", "Weekend"], duration: "3 years" },
  // Leeds Trinity / William
  { id: "ltu-bae", name: "BA (Hons) Early Years Education & Care", level: "Undergraduate", partner: "Leeds Trinity University", provider: "William College", subject: "education", cities: ["London"], modes: ["Day"], duration: "3 years" },
  // Staffordshire
  { id: "staff-bm-tu", name: "BSc (Hons) Business Management (Top-up)", level: "Top-up", partner: "Staffordshire University", provider: "Staffordshire", subject: "business-finance", cities: ["London", "Stoke"], modes: ["Day"], duration: "1 year" },
  { id: "staff-bt-fy", name: "BSc (Hons) Business & Tourism Management with Foundation", level: "Foundation", partner: "Staffordshire University", provider: "Staffordshire", subject: "hospitality-tourism", cities: ["London"], modes: ["Day"], duration: "4 years" },
  // AUP
  { id: "aup-fmm", name: "BA (Hons) Fashion Media & Marketing with Foundation", level: "Foundation", partner: "Arts University Plymouth", provider: "AUP", subject: "arts-design", cities: ["Plymouth"], modes: ["Day"], duration: "4 years" },
  // Psychology
  { id: "msc-psych", name: "MSc Psychology Conversion", level: "Postgraduate", partner: "Arden University", provider: "Arden", subject: "psychology", cities: ["London", "Online"], modes: ["Day", "Online"], duration: "1 year" },
];

// Approximate campus coordinates for proximity scoring
export const CAMPUSES: { city: string; lat: number; lng: number }[] = [
  { city: "London", lat: 51.5074, lng: -0.1278 },
  { city: "Birmingham", lat: 52.4862, lng: -1.8904 },
  { city: "Manchester", lat: 53.4808, lng: -2.2426 },
  { city: "Leeds", lat: 53.8008, lng: -1.5491 },
  { city: "Plymouth", lat: 50.3755, lng: -4.1427 },
  { city: "Stoke", lat: 53.0027, lng: -2.1794 },
];
