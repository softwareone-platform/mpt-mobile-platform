import type { DetailsListItemValue } from '@/types/lists';

export interface Program {
  id: string;
  name: string;
  status?: string;
  icon?: string;
}

export interface Enrollment {
  id: string;
  name: string;
  status?: string;
  icon?: string;
}

export interface ProgramDetails extends Program {
  vendor: DetailsListItemValue;
  name: string;
  eligibility: {
    client: boolean;
    partner: boolean;
  };
  applicableTo: 'Buyer' | 'Licensee';
  website: string;
}

export interface EnrollmentDetails extends Enrollment {
  program?: DetailsListItemValue;
  certificate?: DetailsListItemValue;
  buyer?: DetailsListItemValue;
  assignee?: DetailsListItemValue;
  eligibility: {
    client: boolean;
    partner: boolean;
  };
  applicableTo: 'Buyer' | 'Licensee';
}
