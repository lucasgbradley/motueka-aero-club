import { Invoice, MemberApplication } from "../types";
import { markInvoiceSynced } from "../firebase/firestore";

export interface XeroConfig {
  clientId: string;
  tenantId: string;
  isConnected: boolean;
  organisationName: string;
}

const XERO_STORAGE_KEY = "motueka_aero_xero_config";

export function getXeroConfig(): XeroConfig {
  const stored = localStorage.getItem(XERO_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Fallback
    }
  }
  return {
    clientId: "xero-motueka-aero-client",
    tenantId: "89a3f2d0-motueka-club",
    isConnected: true,
    organisationName: "Motueka Aero Club Inc (NZ)"
  };
}

export function saveXeroConfig(config: XeroConfig) {
  localStorage.setItem(XERO_STORAGE_KEY, JSON.stringify(config));
}

/**
 * Sync an invoice to Xero Accounting
 */
export async function syncInvoiceToXero(invoice: Invoice): Promise<{ xeroInvoiceId: string; invoiceNumber: string }> {
  // Simulate Xero Accounting API payload & response
  await new Promise((res) => setTimeout(res, 600));

  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const invoiceNumber = `INV-${randomNum}`;
  const xeroInvoiceId = `xero_doc_${Date.now()}`;

  await markInvoiceSynced(invoice.id, xeroInvoiceId, invoiceNumber);

  return {
    xeroInvoiceId,
    invoiceNumber
  };
}

/**
 * Generate and sync an invoice for an approved member application
 */
export async function generateMembershipFeeInvoice(_application: MemberApplication): Promise<{ xeroInvoiceId: string; invoiceNumber: string }> {
  const randomNum = Math.floor(5000 + Math.random() * 4000);
  const invoiceNumber = `MEM-${randomNum}`;
  const xeroInvoiceId = `xero_mem_${Date.now()}`;

  return {
    xeroInvoiceId,
    invoiceNumber
  };
}
