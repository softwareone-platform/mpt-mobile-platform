export const mockEnrollmentId1 = 'ENR-123';

export const mockEnrollmentId2 = 'ENR-234';

export const mockEnrollmentData = {
  id: 'ENR-123',
  name: 'Test Enrollment',
  status: 'Completed',
};

export const expectedEnrollmentUrl1 =
  `/v1/program/enrollments/${mockEnrollmentId1}` +
  `?select=assignee.currentAccount.id,buyer.address,licensee.account.id,licensee.address`;

export const expectedEnrollmentUrl2 =
  `/v1/program/enrollments/${mockEnrollmentId2}` +
  `?select=assignee.currentAccount.id,buyer.address,licensee.account.id,licensee.address`;

export const mockEnrollmentResponse1 = {
  id: 'ENR-123',
  name: 'Enrollment One',
};

export const mockEnrollmentResponse2 = {
  id: 'ENR-234',
  name: 'Enrollment Two',
};
