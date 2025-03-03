import { applyDecorators, UseGuards } from '@nestjs/common';
import { VerifiedGuard } from '../guards/verified.guard';

export const VerifiedOnly = () => applyDecorators(UseGuards(VerifiedGuard));
