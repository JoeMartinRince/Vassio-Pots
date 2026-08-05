import { ROUTES } from "./routes";

export interface NavigationItem {
  label: string;
  path: string;
}

export const MAIN_NAVIGATION: NavigationItem[] = [
  { label: "Home", path: ROUTES.HOME },
  { label: "FRP Pots", path: ROUTES.FRP_POTS },
  { label: "Artificial Plants", path: ROUTES.ARTIFICIAL_PLANTS },
  { label: "Terracotta Pots", path: ROUTES.TERRACOTTA_POTS },
  { label: "Pebbles", path: ROUTES.PEBBLES },
  { label: "New Arrivals", path: ROUTES.NEW_ARRIVALS },
  { label: "Track My Order", path: ROUTES.TRACK_ORDER },
  { label: "Location", path: ROUTES.LOCATION },
  { label: "Contact", path: ROUTES.CONTACT },
];
