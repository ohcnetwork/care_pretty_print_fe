import { lazy } from "react";

import routes from "./routes";

const PatientHomeActionsWrapper = lazy(
  () => import("./components/PatientHomeActionsWrapper"),
);

const manifest = {
  plugin: "care-pretty-print",
  routes,
  extends: [],
  components: {
    PatientHomeActions: PatientHomeActionsWrapper,
  },
} as const;

export default manifest;
