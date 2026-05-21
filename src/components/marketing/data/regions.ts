export type Region = {
  id: string;
  name: string;
  cities: string;
  rankingNote: string;
  tuitionFrom: string;
  livingFrom: string;
  partners: string[];
  imgSeed: string;
  flag: string; // emoji
};

export const REGIONS: Region[] = [
  {
    id: "london",
    name: "London",
    cities: "Westminster, Tower Hamlets, Camden",
    rankingNote: "4 universities in QS Top 100",
    tuitionFrom: "£9,250 / year",
    livingFrom: "£1,400 / month",
    partners: ["London Met", "LSC", "Arden", "GBS", "UGM", "Mont Rose"],
    imgSeed: "london-skyline-thames",
    flag: "🏛️",
  },
  {
    id: "england",
    name: "England",
    cities: "Manchester, Birmingham, Leeds, Bristol",
    rankingNote: "11 universities in QS Top 100",
    tuitionFrom: "£9,000 / year",
    livingFrom: "£950 / month",
    partners: ["Staffordshire", "Bolton", "Suffolk", "Canterbury CCU", "Leeds Trinity"],
    imgSeed: "england-manchester-canal",
    flag: "🌹",
  },
  {
    id: "scotland",
    name: "Scotland",
    cities: "Edinburgh, Glasgow, St Andrews",
    rankingNote: "3 universities in QS Top 100",
    tuitionFrom: "£1,820 / year",
    livingFrom: "£900 / month",
    partners: ["Edinburgh", "Glasgow", "Strathclyde", "St Andrews"],
    imgSeed: "edinburgh-castle-old-town",
    flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  },
  {
    id: "wales",
    name: "Wales",
    cities: "Cardiff, Swansea, Aberystwyth",
    rankingNote: "1 university in QS Top 200",
    tuitionFrom: "£9,000 / year",
    livingFrom: "£850 / month",
    partners: ["Cardiff", "Swansea", "Bangor"],
    imgSeed: "cardiff-bay-wales",
    flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  },
  {
    id: "northern-ireland",
    name: "Northern Ireland",
    cities: "Belfast, Derry",
    rankingNote: "1 Russell Group university",
    tuitionFrom: "£4,750 / year",
    livingFrom: "£780 / month",
    partners: ["Queen's Belfast", "Ulster"],
    imgSeed: "belfast-titanic-quarter",
    flag: "🇬🇧",
  },
];
