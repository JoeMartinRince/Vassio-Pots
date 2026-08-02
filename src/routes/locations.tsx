import { createFileRoute } from "@tanstack/react-router";
import { LocationPage } from "./location";

export const Route = createFileRoute("/locations")({
  head: () => ({
    meta: [{ title: "Store Locations — Vassio" }],
  }),
  component: LocationPage,
});
