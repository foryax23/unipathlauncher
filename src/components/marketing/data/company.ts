export const COMPANY = {
  legalName: "Bridge Gateway Consulting LTD",
  shortName: "Bridge Gateway Consulting",
  companyNumber: "15707621",
  address: {
    line1: "167-169 Great Portland Street",
    line2: "5th Floor",
    city: "London",
    postcode: "W1W 5PF",
    country: "United Kingdom",
    countryCode: "GB",
  },
  email: "info@bridgegatewayconsulting.com",
  phones: [
    "+44 7448 921 873",
    "+44 7593 855 452",
    "+44 7448 426 168",
    "+359 886 499 368",
  ],
  url: "https://www.bridgegatewayconsulting.com",
} as const;

export const phoneHref = (p: string) =>
  `https://wa.me/${p.replace(/\D/g, "")}`;
