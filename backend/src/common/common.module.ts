import { Global, Module } from '@nestjs/common';

import { AllExceptionsFilter } from './filters/all-exceptions.filter.js';

/**
 * Cross-cutting concerns. `AllExceptionsFilter` is provided here as well as
 * registered on the application so it is applied consistently, including to
 * routes owned by feature modules.
 */
@Global()
@Module({
  providers: [AllExceptionsFilter],
  exports: [AllExceptionsFilter],
})
export class CommonModule {}
