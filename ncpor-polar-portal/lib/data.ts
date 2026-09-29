/**
 * Demonstration data for the SIH 2026 prototype (PS 26063).
 * Station coordinates and milestone years follow public records about the Indian polar programme.
 * Dataset titles, DOIs (10.5072 is the DataCite *test* prefix), counts, media and press copy are illustrative
 * and must be replaced with NCPOR's own records in production.
 */

export const TEAM_NAME = " Team Kold_IQ@24 ";

export type FocusKey = "free" | "antarctic" | "arctic" | "himalaya";
export type Wx = {
  temp: number;
  wind: number;
  live: boolean;
  updated?: string;
};

/* ------------------------------------------------------------------ */
/* Stations                                                             */
/* ------------------------------------------------------------------ */
export interface Station {
  id: string;
  name: string;
  lat: number;
  lon: number;
  place: string;
  focus: FocusKey;
  since: number;
  status: string;
  note: string;
  tone: "glacier" | "aurora" | "polar";
  baseline: { temp: number; wind: number };
}

export const STATIONS: Station[] = [
  {
    id: "bharati",
    name: "Bharati",
    lat: -69.4066,
    lon: 76.1867,
    place: "Larsemann Hills, East Antarctica",
    focus: "antarctic",
    since: 2012,
    status: "Wintering party on station",
    note: "Year-round research base on the Larsemann Hills coast.",
    tone: "glacier",
    baseline: { temp: -12, wind: 9 },
  },
  {
    id: "maitri",
    name: "Maitri",
    lat: -70.7656,
    lon: 11.7323,
    place: "Schirmacher Oasis, Dronning Maud Land",
    focus: "antarctic",
    since: 1989,
    status: "Wintering party on station",
    note: "Long-running observatory on a rocky oasis in the ice sheet.",
    tone: "glacier",
    baseline: { temp: -17, wind: 8 },
  },
  {
    id: "himadri",
    name: "Himadri",
    lat: 78.9224,
    lon: 11.927,
    place: "Ny-Ålesund, Svalbard",
    focus: "arctic",
    since: 2008,
    status: "Open for visiting scientists",
    note: "India's Arctic research station beside Kongsfjorden.",
    tone: "aurora",
    baseline: { temp: 2, wind: 4 },
  },
  {
    id: "himansh",
    name: "Himansh",
    lat: 32.3,
    lon: 77.57,
    place: "Chandra Basin, Spiti, Himalaya",
    focus: "himalaya",
    since: 2016,
    status: "Glacier monitoring",
    note: "High-altitude station tracking Himalayan glacier change, sometimes called the third pole.",
    tone: "polar",
    baseline: { temp: 3, wind: 3 },
  },
];

/* ------------------------------------------------------------------ */
/* Navigation                                                           */
/* ------------------------------------------------------------------ */
export interface NavItem {
  label: string;
  id: string;
  kind?: Kind;
}
export const NAV: NavItem[] = [
  { label: "Home", id: "home" },
  { label: "Knowledge Repository", id: "repository" },
  { label: "Expeditions (3D Map)", id: "expeditions" },
  { label: "Datasets", id: "repository", kind: "Dataset" },
  { label: "Media Hub", id: "media" },
  { label: "Outreach & Events", id: "outreach" },
  { label: "Portal Analytics", id: "analytics" },
];

/* ------------------------------------------------------------------ */
/* Repository                                                           */
/* ------------------------------------------------------------------ */
export type Region = "Arctic" | "Antarctic" | "Southern Ocean";
export type Category =
  | "Expedition Reports"
  | "Climate Data"
  | "Glaciology"
  | "Marine Biology";
export type Kind = "Dataset" | "Report" | "Publication";
export type FileFormat = "CSV" | "NetCDF" | "GeoTIFF" | "PDF";
export type Access = "Open" | "Registered" | "Embargoed";

export const REGIONS: Region[] = ["Arctic", "Antarctic", "Southern Ocean"];
export const CATEGORIES: Category[] = [
  "Expedition Reports",
  "Climate Data",
  "Glaciology",
  "Marine Biology",
];
export const KINDS: (Kind | "All")[] = [
  "All",
  "Dataset",
  "Report",
  "Publication",
];

export interface RepoRecord {
  id: string;
  kind: Kind;
  title: string;
  region: Region;
  category: Category;
  year: number;
  formats: FileFormat[];
  size: string;
  doi: string;
  access: Access;
  embargoUntil?: string;
  station: string;
  pi: string;
  summary: string;
  extent: string;
  downloads: number;
  featured?: boolean;
  series: { label: string; unit: string; values: number[] };
}

/** Seasonal + trend series used for previews and the downloadable sample CSV. */
function wave(
  seed: number,
  base: number,
  amp: number,
  trend = 0,
  n = 24,
  period = 12,
  noise = 0.12,
) {
  let s = seed;
  const rnd = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296 - 0.5;
  };
  return Array.from(
    { length: n },
    (_, i) =>
      Math.round(
        (base +
          amp * Math.sin((2 * Math.PI * i) / period + seed) +
          trend * i +
          rnd() * amp * noise * 2) *
          100,
      ) / 100,
  );
}

export const RECORDS: RepoRecord[] = [
  {
    id: "ds-bharati-aws",
    kind: "Dataset",
    title:
      "Bharati Station automatic weather record, 1-minute observations 2013 to 2025",
    region: "Antarctic",
    category: "Climate Data",
    year: 2025,
    formats: ["NetCDF", "CSV"],
    size: "3.4 GB",
    doi: "10.5072/ncpor.ds.2025.0142",
    access: "Open",
    station: "Bharati",
    pi: "Antarctic Climate and Atmosphere Group",
    summary:
      "Air temperature, pressure, humidity, wind and radiation recorded at the Larsemann Hills coast, quality-flagged and gap-filled against the Maitri record.",
    extent: "6.8 million records",
    downloads: 4210,
    featured: true,
    series: {
      label: "Monthly mean 2 m air temperature",
      unit: "°C",
      values: wave(3, -9, 9, 0.03),
    },
  },
  {
    id: "ds-indarc-ts",
    kind: "Dataset",
    title: "IndArc mooring, Kongsfjorden: temperature and salinity profiles",
    region: "Arctic",
    category: "Climate Data",
    year: 2024,
    formats: ["NetCDF"],
    size: "1.1 GB",
    doi: "10.5072/ncpor.ds.2024.0087",
    access: "Open",
    station: "Himadri",
    pi: "Arctic Ocean and Fjord Dynamics Group",
    summary:
      "Multi-depth fjord temperature and salinity from the year-round mooring, showing Atlantic water inflow and glacial meltwater pulses.",
    extent: "12 depth levels, 2014 to 2024",
    downloads: 2894,
    series: {
      label: "Monthly mean water temperature at 30 m",
      unit: "°C",
      values: wave(7, 2.4, 1.6, 0.02),
    },
  },
  {
    id: "ds-larsemann-mb",
    kind: "Dataset",
    title: "Larsemann Hills glacier mass-balance stake network",
    region: "Antarctic",
    category: "Glaciology",
    year: 2023,
    formats: ["CSV"],
    size: "48 MB",
    doi: "10.5072/ncpor.ds.2023.0311",
    access: "Open",
    station: "Bharati",
    pi: "Cryosphere Mass Balance Group",
    summary:
      "Annual and seasonal stake readings across 41 stakes, with surface elevation change and snow density pits.",
    extent: "41 stakes, 2008 to 2023",
    downloads: 1733,
    series: {
      label: "Cumulative mass balance, reference stake",
      unit: "mm w.e.",
      values: wave(19, -40, 60, -6, 24, 24),
    },
  },
  {
    id: "ds-so-pigments",
    kind: "Dataset",
    title:
      "Southern Ocean phytoplankton pigment composition, Indian sector transects",
    region: "Southern Ocean",
    category: "Marine Biology",
    year: 2024,
    formats: ["CSV"],
    size: "212 MB",
    doi: "10.5072/ncpor.ds.2024.0203",
    access: "Open",
    station: "Research vessel transect",
    pi: "Marine Ecosystem Group",
    summary:
      "HPLC pigment concentrations from 186 stations between 45°S and 66°S, with chlorophyll-a, fucoxanthin and diagnostic pigment ratios.",
    extent: "186 stations, 3 seasons",
    downloads: 1290,
    series: {
      label: "Chlorophyll-a, surface, by latitude band",
      unit: "mg m⁻³",
      values: wave(23, 0.55, 0.4, 0.004, 24, 24),
    },
  },
  {
    id: "rp-42-isea",
    kind: "Report",
    title:
      "42nd Indian Scientific Expedition to Antarctica: consolidated field report",
    region: "Antarctic",
    category: "Expedition Reports",
    year: 2023,
    formats: ["PDF"],
    size: "86 MB",
    doi: "10.5072/ncpor.rp.2023.0042",
    access: "Open",
    station: "Bharati and Maitri",
    pi: "Expedition Coordination Office",
    summary:
      "Logistics, science programme, traverse summaries and wintering observations for the 42nd expedition season.",
    extent: "312 pages",
    downloads: 986,
    series: {
      label: "Portal downloads per month",
      unit: "downloads",
      values: wave(5, 60, 30, 1.2),
    },
  },
  {
    id: "ds-lovenbreen-vel",
    kind: "Dataset",
    title:
      "Midtre Lovénbreen surface velocity maps from repeat satellite pairs",
    region: "Arctic",
    category: "Glaciology",
    year: 2022,
    formats: ["GeoTIFF", "CSV"],
    size: "2.7 GB",
    doi: "10.5072/ncpor.ds.2022.0176",
    access: "Registered",
    station: "Himadri",
    pi: "Cryosphere Dynamics Group",
    summary:
      "Feature-tracked ice speed for a small Svalbard valley glacier, 2016 to 2022, with uncertainty rasters.",
    extent: "58 velocity pairs",
    downloads: 764,
    series: {
      label: "Mean centreline speed",
      unit: "m per year",
      values: wave(31, 6.5, 2.2, -0.05, 24, 12, 0.2),
    },
  },
  {
    id: "ds-zooplankton-30e",
    kind: "Dataset",
    title: "Zooplankton community structure along the 30°E transect",
    region: "Southern Ocean",
    category: "Marine Biology",
    year: 2021,
    formats: ["CSV"],
    size: "64 MB",
    doi: "10.5072/ncpor.ds.2021.0259",
    access: "Open",
    station: "Research vessel transect",
    pi: "Marine Ecosystem Group",
    summary:
      "Abundance and biomass by taxon from multinet hauls, with copepod and krill size classes.",
    extent: "94 hauls",
    downloads: 641,
    series: {
      label: "Total zooplankton biomass",
      unit: "mg m⁻³",
      values: wave(41, 38, 22, 0.1, 24, 24),
    },
  },
  {
    id: "ds-seaice-composite",
    kind: "Dataset",
    title:
      "Antarctic sea-ice concentration composite, Indian Ocean sector, 1998 to 2024",
    region: "Southern Ocean",
    category: "Climate Data",
    year: 2025,
    formats: ["NetCDF"],
    size: "5.2 GB",
    doi: "10.5072/ncpor.ds.2025.0019",
    access: "Open",
    station: "Remote sensing",
    pi: "Sea Ice and Remote Sensing Group",
    summary:
      "Daily passive-microwave concentration merged with ship-based ice observations for calibration in the marginal ice zone.",
    extent: "9,600 daily grids",
    downloads: 3122,
    series: {
      label: "Sector mean sea-ice extent",
      unit: "million km²",
      values: wave(2, 3.1, 2.6, 0.005),
    },
  },
  {
    id: "rp-arctic-2025",
    kind: "Report",
    title: "Arctic summer campaign 2025: Kongsfjorden field report",
    region: "Arctic",
    category: "Expedition Reports",
    year: 2025,
    formats: ["PDF"],
    size: "41 MB",
    doi: "10.5072/ncpor.rp.2025.0011",
    access: "Open",
    station: "Himadri",
    pi: "Arctic Campaign Team",
    summary:
      "Programme summary covering fjord sampling, glacier surveys and atmospheric chemistry work from the summer season.",
    extent: "148 pages",
    downloads: 502,
    series: {
      label: "Portal downloads per month",
      unit: "downloads",
      values: wave(8, 35, 20, 1.6),
    },
  },
  {
    id: "ds-schirmacher-diatoms",
    kind: "Dataset",
    title: "Schirmacher Oasis lake sediment cores: diatom assemblages",
    region: "Antarctic",
    category: "Climate Data",
    year: 2022,
    formats: ["CSV"],
    size: "9 MB",
    doi: "10.5072/ncpor.ds.2022.0288",
    access: "Open",
    station: "Maitri",
    pi: "Paleoclimate Group",
    summary:
      "Down-core diatom counts and salinity-transfer reconstructions spanning roughly the last 8,000 years.",
    extent: "6 cores",
    downloads: 418,
    series: {
      label: "Reconstructed lake salinity",
      unit: "g L⁻¹",
      values: wave(53, 1.8, 0.9, 0.01, 24, 18),
    },
  },
  {
    id: "ds-cosmogenic",
    kind: "Dataset",
    title:
      "Cosmogenic exposure ages from nunataks in central Dronning Maud Land",
    region: "Antarctic",
    category: "Glaciology",
    year: 2020,
    formats: ["CSV"],
    size: "3 MB",
    doi: "10.5072/ncpor.ds.2020.0134",
    access: "Embargoed",
    embargoUntil: "31 Dec 2026",
    station: "Maitri",
    pi: "Paleoglaciology Group",
    summary:
      "Beryllium-10 and aluminium-26 exposure ages that constrain past ice-sheet thickness inland of Maitri.",
    extent: "74 samples",
    downloads: 0,
    series: {
      label: "Exposure age by elevation band",
      unit: "kyr",
      values: wave(61, 60, 40, 0.5, 24, 24),
    },
  },
  {
    id: "ds-snowpack-bc",
    kind: "Dataset",
    title: "Ny-Ålesund snowpack black carbon and major-ion chemistry",
    region: "Arctic",
    category: "Glaciology",
    year: 2023,
    formats: ["CSV"],
    size: "27 MB",
    doi: "10.5072/ncpor.ds.2023.0165",
    access: "Registered",
    station: "Himadri",
    pi: "Atmospheric Chemistry Group",
    summary:
      "Seasonal snowpit sampling with black carbon, elemental carbon and ion chromatography results.",
    extent: "210 snow samples",
    downloads: 356,
    series: {
      label: "Black carbon in surface snow",
      unit: "ng g⁻¹",
      values: wave(71, 24, 14, 0.15),
    },
  },
  {
    id: "pb-larsemann-retreat",
    kind: "Publication",
    title:
      "Multi-decade margin change of outlet glaciers in the Larsemann Hills",
    region: "Antarctic",
    category: "Glaciology",
    year: 2024,
    formats: ["PDF"],
    size: "6 MB",
    doi: "10.5072/ncpor.pb.2024.0031",
    access: "Open",
    station: "Bharati",
    pi: "Cryosphere Mass Balance Group",
    summary:
      "Uses satellite imagery and stake data to show how grounded margins have moved since the 1980s.",
    extent: "18 pages, 9 figures",
    downloads: 812,
    series: {
      label: "Portal downloads per month",
      unit: "downloads",
      values: wave(13, 40, 18, 1.1),
    },
  },
  {
    id: "pb-krill-copepods",
    kind: "Publication",
    title:
      "Seasonal succession of copepods and krill in the Indian sector of the Southern Ocean",
    region: "Southern Ocean",
    category: "Marine Biology",
    year: 2023,
    formats: ["PDF"],
    size: "5 MB",
    doi: "10.5072/ncpor.pb.2023.0058",
    access: "Open",
    station: "Research vessel transect",
    pi: "Marine Ecosystem Group",
    summary:
      "Compares three austral summers of net samples and links community shifts to frontal position.",
    extent: "22 pages, 11 figures",
    downloads: 590,
    series: {
      label: "Portal downloads per month",
      unit: "downloads",
      values: wave(17, 28, 12, 0.8),
    },
  },
  {
    id: "rp-southern-ocean-2024",
    kind: "Report",
    title:
      "Southern Ocean research cruise 2024: cruise narrative and station log",
    region: "Southern Ocean",
    category: "Expedition Reports",
    year: 2024,
    formats: ["PDF"],
    size: "58 MB",
    doi: "10.5072/ncpor.rp.2024.0027",
    access: "Open",
    station: "Research vessel transect",
    pi: "Cruise Coordination Office",
    summary:
      "Day-by-day narrative, CTD and net station log, instrument notes and safety summary.",
    extent: "204 pages",
    downloads: 447,
    series: {
      label: "Portal downloads per month",
      unit: "downloads",
      values: wave(29, 30, 14, 0.9),
    },
  },
];

/* ------------------------------------------------------------------ */
/* Expedition timeline                                                  */
/* ------------------------------------------------------------------ */
export type ExpeditionStatus = "Completed" | "Active" | "Planned";
export interface Expedition {
  id: string;
  year: string;
  title: string;
  where: "Antarctic" | "Arctic" | "Southern Ocean" | "Himalaya";
  status: ExpeditionStatus;
  detail: string;
  focus: FocusKey;
}

export const EXPEDITION_FILTERS = [
  "All",
  "Antarctic",
  "Arctic",
  "Southern Ocean",
  "Himalaya",
] as const;

export const EXPEDITIONS: Expedition[] = [
  {
    id: "e1981",
    year: "1981",
    title: "First Indian Expedition to Antarctica",
    where: "Antarctic",
    status: "Completed",
    detail:
      "A team of 21 scientists and support staff sailed from Goa in December and set up the first Indian camp on the ice shelf.",
    focus: "antarctic",
  },
  {
    id: "e1983",
    year: "1983",
    title: "Dakshin Gangotri station and Antarctic Treaty accession",
    where: "Antarctic",
    status: "Completed",
    detail:
      "India's first permanent Antarctic station was commissioned in the 3rd expedition, and India joined the Antarctic Treaty the same year.",
    focus: "antarctic",
  },
  {
    id: "e1989",
    year: "1989",
    title: "Maitri commissioned at Schirmacher Oasis",
    where: "Antarctic",
    status: "Completed",
    detail:
      "A rock-founded station replaced Dakshin Gangotri and became the base for decades of geoscience and atmospheric records.",
    focus: "antarctic",
  },
  {
    id: "e2004",
    year: "2004",
    title: "First Southern Ocean scientific expedition",
    where: "Southern Ocean",
    status: "Completed",
    detail:
      "The research vessel Sagar Kanya carried out India's first dedicated oceanographic survey south of the Antarctic Polar Front.",
    focus: "antarctic",
  },
  {
    id: "e2007",
    year: "2007",
    title: "First Indian Arctic expedition",
    where: "Arctic",
    status: "Completed",
    detail:
      "A small team began studies at Ny-Ålesund in Svalbard, laying the ground for a permanent station.",
    focus: "arctic",
  },
  {
    id: "e2008",
    year: "2008",
    title: "Himadri opens in Ny-Ålesund",
    where: "Arctic",
    status: "Completed",
    detail:
      "India's Arctic station opened in the international research village on Kongsfjorden.",
    focus: "arctic",
  },
  {
    id: "e2012",
    year: "2012",
    title: "Bharati commissioned on the Larsemann Hills",
    where: "Antarctic",
    status: "Completed",
    detail:
      "A modular station built from prefabricated units on the Prydz Bay coast, designed for year-round work.",
    focus: "antarctic",
  },
  {
    id: "e2014",
    year: "2014",
    title: "IndArc mooring deployed in Kongsfjorden",
    where: "Arctic",
    status: "Completed",
    detail:
      "India's first multi-sensor underwater observatory in the Arctic began a continuous fjord record.",
    focus: "arctic",
  },
  {
    id: "e2016",
    year: "2016",
    title: "Himansh station in the Chandra Basin",
    where: "Himalaya",
    status: "Completed",
    detail:
      "Automatic weather and glacier instruments were installed at high altitude to track Himalayan ice.",
    focus: "himalaya",
  },
  {
    id: "e2022",
    year: "2022",
    title: "Indian Antarctic Act enacted",
    where: "Antarctic",
    status: "Completed",
    detail:
      "Domestic law now governs Indian activity in Antarctica, from permits to environmental protection.",
    focus: "antarctic",
  },
  {
    id: "e2026w",
    year: "2026",
    title: "Winter party at Bharati and Maitri",
    where: "Antarctic",
    status: "Active",
    detail:
      "Two wintering teams are running weather, atmospheric and geomagnetic observations through the austral winter.",
    focus: "antarctic",
  },
  {
    id: "e2026a",
    year: "2026",
    title: "Year-round monitoring at Himadri and IndArc",
    where: "Arctic",
    status: "Active",
    detail:
      "Fjord mooring and atmospheric sensors keep streaming data through the darker months.",
    focus: "arctic",
  },
  {
    id: "e2026h",
    year: "2026",
    title: "Himansh glacier season",
    where: "Himalaya",
    status: "Active",
    detail:
      "Field crews resurvey stakes and snow pits on the Chandra Basin glaciers.",
    focus: "himalaya",
  },
  {
    id: "e2027",
    year: "2026/27",
    title: "Next Antarctic expedition season",
    where: "Antarctic",
    status: "Planned",
    detail:
      "Ship-borne mobilisation from Goa is planned for the coming austral summer, with relief of both stations.",
    focus: "antarctic",
  },
];

/* ------------------------------------------------------------------ */
/* Media                                                                */
/* ------------------------------------------------------------------ */
export type MediaType = "Photos" | "Videos" | "Infographics" | "Press Releases";
export const MEDIA_TABS: (MediaType | "All")[] = [
  "All",
  "Photos",
  "Videos",
  "Infographics",
  "Press Releases",
];
export type Scene = "aurora" | "iceberg" | "station" | "ocean";

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  caption: string;
  credit: string;
  date: string;
  scene: Scene;
  ratio: "tall" | "wide" | "square";
  hue: number;
  duration?: string;
  stat?: { value: string; label: string };
  body?: string[];
}

export const MEDIA: MediaItem[] = [
  {
    id: "m1",
    type: "Photos",
    title: "Aurora over Bharati",
    caption: "Green curtains above the station modules on a still July night.",
    credit: "Wintering team",
    date: "2026-07-14",
    scene: "aurora",
    ratio: "tall",
    hue: 160,
  },
  {
    id: "m2",
    type: "Videos",
    title: "A day on the Larsemann Hills",
    caption: "From sunrise weather checks to stake readings on the glacier.",
    credit: "NCPOR Media Unit",
    date: "2026-03-02",
    scene: "iceberg",
    ratio: "wide",
    hue: 200,
    duration: "4:12",
  },
  {
    id: "m3",
    type: "Infographics",
    title: "How thick is the ice at Maitri?",
    caption: "Ice thickness and bedrock profile inland of Schirmacher Oasis.",
    credit: "NCPOR Outreach",
    date: "2026-05-19",
    scene: "iceberg",
    ratio: "square",
    hue: 195,
    stat: { value: "2.4 km", label: "ice above bedrock, 60 km inland" },
  },
  {
    id: "m4",
    type: "Press Releases",
    title: "Open data policy extended to all field datasets",
    caption: "New datasets will carry DOIs and open licences by default.",
    credit: "NCPOR Communications",
    date: "2026-08-21",
    scene: "station",
    ratio: "wide",
    hue: 210,
    body: [
      "NCPOR has extended its data policy so that field datasets are archived with persistent identifiers and released under open licences after a defined embargo period.",
      "Researchers can deposit through the portal, and every record gets a citation string ready to copy.",
      "Datasets containing sensitive locations or unpublished results follow a registered-access route.",
    ],
  },
  {
    id: "m5",
    type: "Photos",
    title: "Sagar Nidhi at the ice edge",
    caption: "Research vessel holding position while CTD casts go down.",
    credit: "Cruise team",
    date: "2025-02-11",
    scene: "ocean",
    ratio: "wide",
    hue: 205,
  },
  {
    id: "m6",
    type: "Videos",
    title: "Inside the Kongsfjorden mooring",
    caption: "How instruments stay alive under sea ice for a full year.",
    credit: "Himadri team",
    date: "2025-09-05",
    scene: "ocean",
    ratio: "tall",
    hue: 190,
    duration: "6:40",
  },
  {
    id: "m7",
    type: "Infographics",
    title: "One year of Arctic fjord warming",
    caption: "Monthly water temperature anomaly at 30 m, IndArc mooring.",
    credit: "NCPOR Outreach",
    date: "2026-06-10",
    scene: "ocean",
    ratio: "tall",
    hue: 185,
    stat: { value: "+1.1 °C", label: "above the 2014 to 2024 mean" },
  },
  {
    id: "m8",
    type: "Photos",
    title: "Stake network on the glacier",
    caption: "A researcher re-drills a mass-balance stake near Bharati.",
    credit: "Glaciology team",
    date: "2026-01-23",
    scene: "iceberg",
    ratio: "square",
    hue: 198,
  },
  {
    id: "m9",
    type: "Press Releases",
    title: "Winter party takes over at both Antarctic stations",
    caption: "Teams of researchers and engineers begin the austral winter.",
    credit: "NCPOR Communications",
    date: "2026-03-20",
    scene: "station",
    ratio: "square",
    hue: 215,
    body: [
      "Wintering members at Bharati and Maitri have taken charge of instruments and station operations for the coming months.",
      "Observations continue in meteorology, atmospheric chemistry, geomagnetism and seismology, with data flowing to the portal through the season.",
    ],
  },
  {
    id: "m10",
    type: "Videos",
    title: "Ask a polar scientist: why does sea ice matter?",
    caption: "Short explainer produced for school outreach sessions.",
    credit: "NCPOR Media Unit",
    date: "2026-04-18",
    scene: "aurora",
    ratio: "wide",
    hue: 170,
    duration: "2:35",
  },
  {
    id: "m11",
    type: "Infographics",
    title: "Where Indian polar data comes from",
    caption: "Stations, ships and satellites that feed the repository.",
    credit: "NCPOR Outreach",
    date: "2026-02-14",
    scene: "station",
    ratio: "wide",
    hue: 205,
    stat: { value: "4 stations", label: "plus ships, moorings and satellites" },
  },
  {
    id: "m12",
    type: "Photos",
    title: "Himadri in the midnight sun",
    caption: "Low light over Ny-Ålesund and the fjord beyond the station.",
    credit: "Arctic campaign team",
    date: "2025-07-02",
    scene: "station",
    ratio: "tall",
    hue: 40,
  },
];

/* ------------------------------------------------------------------ */
/* Outreach                                                             */
/* ------------------------------------------------------------------ */
export type Channel = "Instagram" | "X" | "LinkedIn" | "Website";
export const CHANNELS: Channel[] = ["Instagram", "X", "LinkedIn", "Website"];

export interface QueuedPost {
  id: string;
  channel: Channel;
  title: string;
  when: string;
  status: "Scheduled" | "Published" | "Needs review";
}
export const POST_QUEUE: QueuedPost[] = [
  {
    id: "q1",
    channel: "Instagram",
    title: "Aurora over Bharati: photo carousel",
    when: "Today, 6:30 pm",
    status: "Scheduled",
  },
  {
    id: "q2",
    channel: "X",
    title: "New dataset: sea-ice composite, 1998 to 2024",
    when: "Tomorrow, 10:00 am",
    status: "Needs review",
  },
  {
    id: "q3",
    channel: "LinkedIn",
    title: "Data policy update for field datasets",
    when: "Mon, 9:00 am",
    status: "Scheduled",
  },
  {
    id: "q4",
    channel: "Website",
    title: "Feature card: 1981 to now, a timeline",
    when: "Published yesterday",
    status: "Published",
  },
];

export interface OutreachEvent {
  id: string;
  title: string;
  date: string; // ISO
  place: string;
  mode: "Online" | "In person";
  audience: string;
  blurb: string;
}
export const EVENTS: OutreachEvent[] = [
  {
    id: "ev1",
    title: "Live call with the Bharati wintering team",
    date: "2026-10-16",
    place: "Online",
    mode: "Online",
    audience: "Schools and colleges",
    blurb:
      "Students ask questions to researchers about life and work through the austral winter.",
  },
  {
    id: "ev2",
    title: "Polar science open house",
    date: "2026-11-14",
    place: "NCPOR, Vasco da Gama, Goa",
    mode: "In person",
    audience: "Families and visitors",
    blurb:
      "Lab tours, an ice-core viewing table and a walk through a full-scale station module.",
  },
  {
    id: "ev3",
    title: "Antarctica Day webinar",
    date: "2026-12-01",
    place: "Online",
    mode: "Online",
    audience: "Everyone",
    blurb:
      "Marks the anniversary of the Antarctic Treaty with talks on Indian research since 1981.",
  },
  {
    id: "ev4",
    title: "Ocean and cryosphere teacher workshop",
    date: "2027-01-23",
    place: "NCPOR, Goa",
    mode: "In person",
    audience: "Science teachers",
    blurb:
      "Classroom kits, dataset walkthroughs and a session on teaching climate with real data.",
  },
];

/* ------------------------------------------------------------------ */
/* Analytics                                                            */
/* ------------------------------------------------------------------ */
export const VISITS = [
  { m: "Oct", v: 18200 },
  { m: "Nov", v: 21400 },
  { m: "Dec", v: 30500 },
  { m: "Jan", v: 27100 },
  { m: "Feb", v: 25800 },
  { m: "Mar", v: 33900 },
  { m: "Apr", v: 31200 },
  { m: "May", v: 36700 },
  { m: "Jun", v: 39800 },
  { m: "Jul", v: 42600 },
  { m: "Aug", v: 47300 },
  { m: "Sep", v: 51900 },
];
export const AUDIENCE = [
  { label: "Researchers", pct: 38 },
  { label: "Students", pct: 31 },
  { label: "Media", pct: 12 },
  { label: "General public", pct: 19 },
];
export const CHANNEL_REACH = [
  { label: "Instagram", v: 182000 },
  { label: "YouTube", v: 141000 },
  { label: "X", v: 96000 },
  { label: "LinkedIn", v: 58000 },
];

export const METRICS = {
  datasets: 1248,
  papers: 3412,
  media: 18930,
};
