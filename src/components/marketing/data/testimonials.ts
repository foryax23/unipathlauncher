export type Testimonial = {
  name: string;
  quote: string;
  programme: string;
  uni: string;
  avatarSeed: string;
  badge?: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Aisha Rahman",
    quote:
      "UniPath shortlisted three universities that perfectly matched my predicted A-Level grades. I had my offer in 11 days.",
    programme: "BSc Computer Science",
    uni: "University of Manchester",
    avatarSeed: "aisha-student-portrait",
    badge: "Offer in 11 days",
  },
  {
    name: "Daniel O'Connor",
    quote:
      "My adviser helped me appeal my UCAS choices after results day. Ended up at my firm choice with a £2,000 bursary.",
    programme: "LLB Law",
    uni: "Queen's University Belfast",
    avatarSeed: "daniel-irish-student",
    badge: "Bursary £2,000",
  },
  {
    name: "Priya Shah",
    quote:
      "Free, honest, and properly fast. I compared four foundation routes side-by-side without spending a penny.",
    programme: "BSc (Hons) Business Management",
    uni: "London Met (UGM)",
    avatarSeed: "priya-london-student",
  },
  {
    name: "Mohammed Ali",
    quote:
      "The course comparison tool was brilliant. I could see entry requirements, fees and city vibe in one place.",
    programme: "MSc Cyber Security",
    uni: "Arden University",
    avatarSeed: "mohammed-uk-student",
  },
  {
    name: "Ella Thompson",
    quote:
      "My consultant tracked every deadline. I never felt lost — and I'm starting at my dream uni in Edinburgh.",
    programme: "MA Psychology",
    uni: "University of Edinburgh",
    avatarSeed: "ella-scottish-student",
    badge: "Scholarship £3,000",
  },
  {
    name: "Tomás García",
    quote:
      "I'm an EU student and the team handled everything: visa, accommodation, even my bank account.",
    programme: "BA Business & Tourism",
    uni: "Staffordshire University",
    avatarSeed: "tomas-eu-student",
  },
];
