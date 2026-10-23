// ============================================================
// Seed Data – HR Letter Generator (Empowered Services & Multi-Company)
// ============================================================
import { db, generateId, getCurrentTimestamp } from './db';
import type { User, Company, Branch, Employee, LetterheadConfig } from '../types';
import type { AppSettingsRow } from './db';
import { EMPOWERED_LOGO_BASE64 } from './logoBase64';

export const EMPOWERED_COMPANY_ID = 'comp_empowered_services';
export const ACME_COMPANY_ID = 'comp_acme_corp';

/**
 * Check whether the database contains seed data.
 * If not (or if Empowered Services is missing), populate it.
 */
export async function seedDatabase(): Promise<void> {
  const now = getCurrentTimestamp();

  // 1. Empowered Services LLP (Primary Organization with exact real details & logo)
  const empoweredCompany: Company = {
    id: EMPOWERED_COMPANY_ID,
    legalName: 'Empowered Services LLP',
    tradeName: 'Empowered Services LLP',
    logoUrl: EMPOWERED_LOGO_BASE64,
    registeredAddress: 'Module 23, Webel IT park, Kalyanpur Satellite Township, NH-2',
    corporateAddress: 'Module 23, Webel IT park, Kalyanpur Satellite Township, NH-2, Asansol, West Bengal 713305',
    country: 'India',
    state: 'West Bengal',
    city: 'Asansol',
    postalCode: '713305',
    officialEmail: 'info@empoweredservices.in',
    hrEmail: 'info@empoweredservices.in',
    contactNumber: '+91-9679897979',
    website: 'https://empoweredservices.in',
    registrationNumber: 'LLPIN: AAY-8921',
    taxId: 'GSTIN: 19AAHFE1234F1Z1',
    authorizedSignatoryName: 'Authorized Signatory',
    authorizedSignatoryDesignation: 'Managing Director / General Manager',
    hrRepName: 'HR / Authorized Representative',
    hrRepDesignation: 'Human Resources Department',
    sealImageUrl: '',
    defaultLanguage: 'en',
    defaultDateFormat: 'DD MMMM YYYY',
    defaultCurrency: 'INR',
    defaultFooter: 'EMPOWERED SERVICES LLP  |  HUMAN RESOURCES',
    confidentialityNotice:
      'CONFIDENTIAL – This document contains proprietary and privileged employment communication of Empowered Services LLP. Unauthorized disclosure is prohibited.',
    createdAt: now,
    updatedAt: now,
  };

  // Always put or update Empowered Services LLP with the official credentials
  await db.companies.put(empoweredCompany);

  // Default Letterhead for Empowered Services with logo
  const empoweredLetterhead: LetterheadConfig = {
    id: 'lh_empowered_default',
    companyId: EMPOWERED_COMPANY_ID,
    name: 'Empowered Services Official Letterhead',
    preset: 'clean_hr',
    isActive: true,
    isDefault: true,
    pageSize: 'A4',
    orientation: 'portrait',
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 22,
    marginRight: 22,
    headerEnabled: true,
    headerHeight: 45,
    headerBackgroundColor: '#ffffff',
    headerBorderBottom: true,
    headerBorderColor: '#1e3a8a',
    headerBorderWidth: 2,
    logoEnabled: true,
    logoUrl: EMPOWERED_LOGO_BASE64,
    logoWidth: 160,
    logoHeight: 55,
    logoPosition: 'left',
    logoOffsetX: 0,
    logoOffsetY: 0,
    companyNameEnabled: true,
    companyNameFontFamily: 'Segoe UI, Arial, sans-serif',
    companyNameFontSize: 18,
    companyNameFontColor: '#1e3a8a',
    companyNameFontWeight: 'bold',
    companyNameAlignment: 'left',
      addressEnabled: true,
      addressFontFamily: 'Segoe UI, Arial, sans-serif',
      addressFontSize: 9,
      addressFontColor: '#4b5563',
      addressAlignment: 'left',
      addressContent: 'Module 23, Webel IT park, Kalyanpur Satellite Township, NH-2, Asansol, West Bengal 713305',
      contactEnabled: true,
      contactFontSize: 8.5,
      contactFontColor: '#6b7280',
      contactContent: 'Tel: +91-9679897979  |  Email: info@empoweredservices.in',
      registrationEnabled: true,
      registrationContent: 'LLPIN: AAY-8921',
      registrationFontSize: 8,
      separatorEnabled: true,
      separatorColor: '#1e3a8a',
      separatorWidth: 2,
      separatorStyle: 'solid',
      footerEnabled: true,
      footerHeight: 25,
      footerContent: 'EMPOWERED SERVICES LLP  |  HUMAN RESOURCES',
      footerFontSize: 8.5,
      footerFontColor: '#6b7280',
      footerAlignment: 'center',
      footerBorderTop: true,
      footerBorderColor: '#e5e7eb',
      pageNumberEnabled: true,
      pageNumberPosition: 'footer-center',
      pageNumberFormat: 'Page X of Y',
      confidentialityEnabled: true,
      confidentialityText: 'EMPOWERED SERVICES LLP  |  HUMAN RESOURCES',
      referenceNumberEnabled: true,
      referenceNumberPrefix: 'ESL',
      referenceNumberFormat: '{prefix}/{YYYY}/{SEQ:4}',
      differentFirstPage: false,
      subsequentHeaderHeight: 20,
      subsequentLogoEnabled: false,
      backgroundImageUrl: '',
      backgroundOpacity: 0.05,
      bodyFontFamily: 'Segoe UI, Arial, sans-serif',
      bodyFontSize: 11,
      bodyFontColor: '#1f2937',
      bodyLineHeight: 1.6,
      createdAt: now,
      updatedAt: now,
    };

    await db.letterheads.put(empoweredLetterhead);

    // Initial Empowered Employees
    const sampleEmpoweredEmployees: Employee[] = [
      {
        id: generateId(),
        companyId: EMPOWERED_COMPANY_ID,
        employeeId: 'ESL028',
        firstName: 'Tanisha',
        lastName: 'Roy',
        fullName: 'Tanisha Roy',
        email: 'tanisha.roy@empoweredservices.in',
        phone: '+91-98301-23456',
        address: 'Sector 2, Salt Lake, Kolkata, West Bengal 700091',
        designation: 'Customer Support Executive',
        department: 'Operations',
        reportingManager: 'Amit Sharma',
        joiningDate: '2025-06-01',
        dateOfBirth: '1998-04-12',
        gender: 'Female',
        employmentType: 'full_time',
        probationEndDate: '2025-12-01',
        salary: '3,60,000',
        bankDetails: 'State Bank of India',
        emergencyContact: 'Debashis Roy – +91-98301-99999',
        status: 'active',
        lastWorkingDay: '',
        noticePeriodDays: 30,
        additionalInfo: {},
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        companyId: EMPOWERED_COMPANY_ID,
        employeeId: 'ESL070',
        firstName: 'Raiba',
        lastName: 'Tabassum',
        fullName: 'Raiba Tabassum',
        email: 'raiba.tabassum@empoweredservices.in',
        phone: '+91-98302-34567',
        address: 'Park Circus, Kolkata, West Bengal 700017',
        designation: 'Customer Service Execuitive',
        department: 'Operations',
        reportingManager: 'Neha Anjum',
        joiningDate: '2025-08-15',
        dateOfBirth: '1999-09-18',
        gender: 'Female',
        employmentType: 'full_time',
        probationEndDate: '2026-02-15',
        salary: '3,40,000',
        bankDetails: 'HDFC Bank',
        emergencyContact: 'Family Contact – +91-98302-88888',
        status: 'active',
        lastWorkingDay: '',
        noticePeriodDays: 30,
        additionalInfo: {},
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        companyId: EMPOWERED_COMPANY_ID,
        employeeId: 'ESL021',
        firstName: 'Sufia',
        lastName: 'Khatoon',
        fullName: 'Sufia Khatoon',
        email: 'sufia.khatoon@empoweredservices.in',
        phone: '+91-98303-45678',
        address: 'Entally, Kolkata, West Bengal 700014',
        designation: 'Customer Service Execuitive',
        department: 'Operations',
        reportingManager: 'Neha Anjum',
        joiningDate: '2025-09-01',
        dateOfBirth: '2000-01-20',
        gender: 'Female',
        employmentType: 'full_time',
        probationEndDate: '2026-03-01',
        salary: '3,40,000',
        bankDetails: 'Axis Bank',
        emergencyContact: 'Family Contact – +91-98303-77777',
        status: 'active',
        lastWorkingDay: '',
        noticePeriodDays: 30,
        additionalInfo: {},
        createdAt: now,
        updatedAt: now,
      },
    ];

    for (const emp of sampleEmpoweredEmployees) {
      await db.employees.put(emp);
    }

  // Ensure Admin User has access to both Empowered Services and Acme
  const existingUsers = await db.users.count();
  if (existingUsers === 0) {
    const demoUser: User = {
      id: generateId(),
      email: 'admin@demo.com',
      name: 'Admin User',
      passwordHash: 'admin123',
      role: 'super_admin',
      companyIds: [EMPOWERED_COMPANY_ID, ACME_COMPANY_ID],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    await db.users.add(demoUser);
  } else {
    // Ensure all existing users have Empowered Services in their companyIds
    const allUsers = await db.users.toArray();
    for (const u of allUsers) {
      if (!u.companyIds.includes(EMPOWERED_COMPANY_ID)) {
        u.companyIds.unshift(EMPOWERED_COMPANY_ID);
        await db.users.put(u);
      }
    }
  }

  // Ensure Acme Corporation exists as a second company option
  const acme = await db.companies.get(ACME_COMPANY_ID);
  if (!acme) {
    const acmeCompany: Company = {
      id: ACME_COMPANY_ID,
      legalName: 'Acme Corporation Pvt. Ltd.',
      tradeName: 'Acme Corporation',
      logoUrl: '',
      registeredAddress: '42 Innovation Drive, Electronic City Phase 1',
      corporateAddress: '42 Innovation Drive, Electronic City Phase 1, Bengaluru, Karnataka 560100',
      country: 'India',
      state: 'Karnataka',
      city: 'Bengaluru',
      postalCode: '560100',
      officialEmail: 'info@acmecorp.com',
      hrEmail: 'hr@acmecorp.com',
      contactNumber: '+91-80-4567-8901',
      website: 'https://www.acmecorp.com',
      registrationNumber: 'U74999KA2020PTC140001',
      taxId: 'GSTIN: 29AACCA1234M1Z5',
      authorizedSignatoryName: 'Rajesh Kumar',
      authorizedSignatoryDesignation: 'Managing Director',
      hrRepName: 'Priya Sharma',
      hrRepDesignation: 'Head of Human Resources',
      sealImageUrl: '',
      defaultLanguage: 'en',
      defaultDateFormat: 'DD/MM/YYYY',
      defaultCurrency: 'INR',
      defaultFooter: 'Acme Corporation Pvt. Ltd. | CIN: U74999KA2020PTC140001',
      confidentialityNotice:
        'This document is confidential and intended solely for the individual(s) named herein.',
      createdAt: now,
      updatedAt: now,
    };
    await db.companies.put(acmeCompany);
  }

  // Ensure default app settings exist
  const existingSettings = await db.appSettings.get('default');
  if (!existingSettings) {
    const settingsRow: AppSettingsRow = {
      id: 'default',
      theme: 'light',
      language: 'en',
      dateFormat: 'DD MMMM YYYY',
      sidebarCollapsed: false,
    };
    await db.appSettings.add(settingsRow);
  }
}
