import { Module } from '@nestjs/common';
import { CalculatorCreditController } from './calculator-credit.controller';
import { CalculatorCreditService } from './calculator-credit.service';
import { PrismaService } from '../PrismaService/prisma.service';

@Module({
  controllers: [CalculatorCreditController],
  providers: [CalculatorCreditService, PrismaService],
  exports: [CalculatorCreditService],
})
export class CalculatorCreditModule {}
