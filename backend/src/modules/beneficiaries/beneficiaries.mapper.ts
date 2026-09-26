import type { Beneficiary } from '@prisma/client';

import type { BeneficiaryResponseDto } from './dto/beneficiary-response.dto.js';

export function toBeneficiaryResponse(beneficiary: Beneficiary): BeneficiaryResponseDto {
  return {
    id: beneficiary.id,
    fullName: beneficiary.fullName,
    phone: beneficiary.phone,
    category: beneficiary.category,
    status: beneficiary.status,
    createdAt: beneficiary.createdAt,
    updatedAt: beneficiary.updatedAt,
  };
}
