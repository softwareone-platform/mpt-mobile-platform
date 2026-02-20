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
