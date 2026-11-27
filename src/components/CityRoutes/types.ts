/** One route as the client viewer needs it (built on the server from the official data). */
export type ViewerRoute = {
  no: number;
  title: string;
  categories: string;
  /** keys of the category groups this route belongs to */
  groups: string[];
  image: string;
  width: number;
  height: number;
  alt: string;
  source: string;
  badge?: string;
};

export type ViewerGroup = { key: string; label: string };
export type ViewerCity = { slug: string; name: string; href: string };

export type ViewerLabels = {
  pickCity: string;
  pickCategory: string;
  pickRoute: string;
  prev: string;
  next: string;
  enlarge: string;
  close: string;
  realSize: string;
  fitScreen: string;
  openFile: string;
  loading: string;
  legendRoute: string;
  legendDirection: string;
  legendStart: string;
};

export type ZoomMode = "fit" | "real";
