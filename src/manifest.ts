import { lazy } from "react";

import routes from "./routes";

const PatientHomeActionsWrapper = lazy(
  () => import("./components/PatientHomeActionsWrapper"),
);

const PrintIDCardButtonWrapper = lazy(
  () => import("./components/PrintIDCardButtonWrapper"),
);

const manifest = {
  plugin: "care-pretty-print",
  routes,
  extends: [],
  components: {
    PatientHomeActions: PatientHomeActionsWrapper,
    PatientInfoCardActions: PrintIDCardButtonWrapper,
  },
} as const;

export default manifest;
