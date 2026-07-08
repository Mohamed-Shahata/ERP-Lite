export interface CompanySettings {
  id: string;
  name: string;
  logoUrl: string | null;
  currency: string;
  address: string;
  taxNumber: string | null;
  invoicePrefix: string | null;
  invoiceFooterNote: string | null;
  paymentTerms: string | null;
  updatedAt: string;
}

export interface UpdateCompanySettingsPayload {
  name: string;
  currency: string;
  address: string;
  taxNumber?: string;
  invoicePrefix?: string;
  invoiceFooterNote?: string;
  paymentTerms?: string;
  logo?: File | null;
}
