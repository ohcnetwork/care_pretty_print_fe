import { lazy } from "react";

import routes from "./routes";

const PatientHomeActionsWrapper = lazy(
  () => import("./components/PatientHomeActionsWrapper"),
);

const PatientHeaderActionsWrapper = lazy(
  () => import("./components/PatientHeaderActionsWrapper"),
);

const manifest = {
  plugin: "care-pretty-print",
  routes,
  extends: [],
  components: {
    PatientHomeActions: PatientHomeActionsWrapper,
    PatientHeaderActions: PatientHeaderActionsWrapper,
  },
} as const;

export default manifest;
