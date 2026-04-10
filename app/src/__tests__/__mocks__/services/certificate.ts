export const mockCertificateId1 = 'CER-123';

export const mockCertificateId2 = 'CER-234';

export const mockCertificateData = {
  id: 'CER-123',
  name: 'Test certificate',
  status: 'Active',
};

export const expectedCertificateUrl1 =
  `/v1/program/certificates/${mockCertificateId1}` +
  `?select=licensee.account.id,template.id,terms,program.vendor`;

export const expectedCertificateUrl2 =
  `/v1/program/certificates/${mockCertificateId2}` +
  `?select=licensee.account.id,template.id,terms,program.vendor`;

export const mockCertificateResponse1 = {
  id: 'CER-123',
  name: 'Certificate One',
};

export const mockCertificateResponse2 = {
  id: 'CER-234',
  name: 'Certificate Two',
};

export const mockCertificateListItem1 =
{
  id: 'CER-1234-7564-3481',
  name: 'Test Certificate One',
  status: 'Active',
};

export const mockCertificateListItem2 =
{
  id: 'CER-1234-7564-3482',
  name: 'Test Certificate Two',
  status: 'Pending',
};

export const mockCertificateListItem3 =
{
  id: 'CER-1234-7564-3483',
  name: 'Test Certificate Three',
  status: 'Expired',
};

export const mockCertificateListItem4 =
{
  id: 'CER-1234-7564-3484',
  name: 'Test Certificate Four',
  status: 'Terminated',
};
