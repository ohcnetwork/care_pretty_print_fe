import { Loader2, Printer, Search, User } from "lucide-react";
import { useEffect, useState } from "react";

import { HttpMethod, request } from "@/lib/requests";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";

import PatientIdCardPrint from "@/components/PatientIdCardPrint";

import type { PatientRead } from "@/types/types";

interface IdentifierConfig {
  id: string;
  config: {
    use: string;
    regex: string;
    system: string;
    unique: boolean;
    display: string;
    required: boolean;
    description: string;
    auto_maintained?: boolean;
    retrieve_config?: {
      retrieve_with_dob?: boolean;
      retrieve_with_year_of_birth?: boolean;
      retrieve_with_otp?: boolean;
      retrieve_partial_search?: boolean;
    };
  };
  status: string;
}

// Phone number config system from Care
const PHONE_NUMBER_CONFIG_SYSTEM =
  "system.care.ohc.network/patient-phone-number";

interface FacilityRead {
  id: string;
  name: string;
  patient_instance_identifier_configs: IdentifierConfig[];
  patient_facility_identifier_configs: IdentifierConfig[];
}

interface PatientSearchResponse {
  partial: boolean;
  results: PatientRead[];
}

interface PatientSearchPageProps {
  facilityId?: string;
}

export default function PatientSearchPage({
  facilityId,
}: PatientSearchPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<PatientRead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientRead | null>(
    null,
  );
  const [_facility, setFacility] = useState<FacilityRead | null>(null);
  const [identifierConfigs, setIdentifierConfigs] = useState<
    IdentifierConfig[]
  >([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string>("");

  // Fetch facility to get identifier configs
  useEffect(() => {
    if (!facilityId) return;

    const fetchFacility = async () => {
      try {
        const data = await request<FacilityRead>("/api/v1/facility/{id}/", {
          pathParams: { id: facilityId },
        });

        setFacility(data);

        // Combine instance and facility identifier configs
        // Filter to only show active configs
        const allConfigs = [
          ...(data.patient_instance_identifier_configs || []),
          ...(data.patient_facility_identifier_configs || []),
        ].filter((c) => c.status === "active");

        // Sort configs: phone number first, then auto-maintained, then others
        const sortedConfigs = [
          // Phone number configs first
          ...allConfigs.filter(
            (c) => c.config.system === PHONE_NUMBER_CONFIG_SYSTEM,
          ),
          // Auto-maintained configs (but not phone number)
          ...allConfigs.filter(
            (c) =>
              c.config.auto_maintained &&
              c.config.system !== PHONE_NUMBER_CONFIG_SYSTEM,
          ),
          // Non-auto-maintained configs
          ...allConfigs.filter((c) => !c.config.auto_maintained),
        ];

        setIdentifierConfigs(sortedConfigs);

        // Set default config based on env variable, or fall back to phone number config, then first config
        const envConfigId = import.meta.env.REACT_APP_PATIENT_IDENTIFIER_ID;
        const envConfig = envConfigId
          ? sortedConfigs.find((c) => c.id === envConfigId)
          : null;

        if (envConfig) {
          setSelectedConfigId(envConfig.id);
        } else {
          const phoneConfig = sortedConfigs.find(
            (c) => c.config.system === PHONE_NUMBER_CONFIG_SYSTEM,
          );
          if (phoneConfig) {
            setSelectedConfigId(phoneConfig.id);
          } else if (sortedConfigs.length > 0) {
            setSelectedConfigId(sortedConfigs[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch facility:", err);
      }
    };

    fetchFacility();
  }, [facilityId]);

  const searchPatients = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a search query");
      return;
    }

    if (!selectedConfigId) {
      setError("Please select an identifier type");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Use identifier-based search (POST to /api/v1/patient/search/)
      const data = await request<PatientSearchResponse>(
        "/api/v1/patient/search/",
        {
          method: HttpMethod.POST,
          body: {
            config: selectedConfigId,
            value: searchQuery,
            page_size: 20,
          },
        },
      );

      setPatients(data.results || []);
      setSelectedPatient(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to search patients",
      );
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      searchPatients();
    }
  };

  const formatGender = (gender: string): string => {
    switch (gender?.toLowerCase()) {
      case "male":
        return "Male";
      case "female":
        return "Female";
      case "non_binary":
        return "Non-Binary";
      case "transgender":
        return "Transgender";
      default:
        return "N/A";
    }
  };

  const getAge = (patient: PatientRead): string => {
    if (patient.date_of_birth) {
      const age =
        new Date().getFullYear() -
        new Date(patient.date_of_birth).getFullYear();
      return `${age} years`;
    }
    if (patient.year_of_birth) {
      const age = new Date().getFullYear() - patient.year_of_birth;
      return `${age} years`;
    }
    return "N/A";
  };

  const selectedConfig = identifierConfigs.find(
    (c) => c.id === selectedConfigId,
  );
  const isPhoneSearch =
    selectedConfig?.config.system === PHONE_NUMBER_CONFIG_SYSTEM;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="w-screen h-screen overflow-auto bg-white">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Printer className="size-6" />
              Patient ID Card Print
            </h1>
            <p className="text-gray-600 mt-1">
              Search for a patient and print their ID card
            </p>
          </div>

          {/* Search Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="size-5" />
                Search Patient
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Identifier Config Selector */}
              {identifierConfigs.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {identifierConfigs.map((config) => (
                    <Button
                      key={config.id}
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedConfigId(config.id);
                        setSearchQuery("");
                      }}
                      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 border shadow-sm h-6 rounded-md px-2 text-xs ${
                        selectedConfigId === config.id
                          ? "bg-primary-100 text-primary-700 hover:bg-primary-200 border-primary-400"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-400 hover:text-gray-900"
                      }`}
                    >
                      {config.config.display}
                    </Button>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <div className="relative flex-1">
                  {isPhoneSearch ? (
                    <PhoneInput
                      value={searchQuery}
                      onChange={(value) => setSearchQuery(value || "")}
                      onKeyDown={handleKeyDown}
                      defaultCountry="IN"
                      placeholder="Enter phone number..."
                      className="shadow-sm"
                    />
                  ) : (
                    <>
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder={
                          selectedConfig
                            ? `Search by ${selectedConfig.config.display}...`
                            : "Select an identifier type..."
                        }
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="pl-10"
                      />
                    </>
                  )}
                </div>
                <Button
                  onClick={searchPatients}
                  disabled={isLoading || !selectedConfigId}
                  variant="primary"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Search className="size-4" />
                  )}
                  Search
                </Button>
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient List */}
            <div className="lg:col-span-2">
              {isLoading ? (
                <Card>
                  <CardContent>
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="size-8 animate-spin text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ) : !hasSearched ? (
                <Card className="border-dashed">
                  <CardContent>
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="rounded-full bg-primary/10 p-3 mb-3">
                        <Search className="size-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-1">
                        Search for Patients
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedConfig
                          ? `Enter ${selectedConfig.config.display} to search`
                          : "Select an identifier type to search"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : patients.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent>
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="rounded-full bg-primary/10 p-3 mb-3">
                        <User className="size-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-1">
                        No patients found
                      </h3>
                      <p className="text-sm text-gray-500">
                        Try a different search term
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="size-5" />
                      Patients
                      <span className="text-sm font-normal text-gray-500">
                        ({patients.length} found)
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {patients.map((patient) => (
                        <div
                          key={patient.id}
                          onClick={() => setSelectedPatient(patient)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                            selectedPatient?.id === patient.id
                              ? "border-primary-500 bg-primary-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-lg text-gray-900">
                                {patient.name}
                              </span>
                              <div className="text-sm text-gray-500 mt-1 space-x-3">
                                <span>Age: {getAge(patient)}</span>
                                <span>•</span>
                                <span>
                                  Gender: {formatGender(patient.gender || "")}
                                </span>
                              </div>
                              {patient.phone_number && (
                                <div className="text-sm text-gray-500">
                                  Phone: {patient.phone_number}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPatient(patient);
                              }}
                            >
                              Select
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Print Section */}
            <div className="lg:col-span-1">
              {selectedPatient ? (
                <PatientIdCardPrint
                  patient={selectedPatient}
                  onlyShowPrintButton={false}
                  className="sticky top-4"
                />
              ) : (
                <Card className="sticky top-4 border-dashed">
                  <CardContent>
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="rounded-full bg-primary/10 p-3 mb-3">
                        <Printer className="size-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-1">
                        No Patient Selected
                      </h3>
                      <p className="text-sm text-gray-500">
                        Select a patient to print their ID card
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
