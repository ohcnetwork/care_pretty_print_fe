export interface InstanceIdentifier {
  config: {
    id: string;
    config: {
      use: string;
      regex: string;
      system: string;
      unique: boolean;
      display: string;
      required: boolean;
      description: string;
      retrieve_config: Record<string, any>;
    };
    status: string;
  };
  value: string;
}

export interface PatientRead {
  id: string;
  name: string;
  phone_number: string;
  date_of_birth?: string;
  year_of_birth?: number;
  gender?: string;
  instance_identifiers?: InstanceIdentifier[];
}
