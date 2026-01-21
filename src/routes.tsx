import PatientSearchPage from "@/pages/PatientSearchPage";

const routes = {
  "/facility/:facilityId/printid": ({ facilityId }: { facilityId: string }) => (
    <PatientSearchPage facilityId={facilityId} />
  ),
};

export default routes;
