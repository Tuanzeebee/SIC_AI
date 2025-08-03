import { Module } from '@nestjs/common';
import { CalculatorGpaController } from './calculator-gpa.controller';
import { CalculatorGpaService } from './calculator-gpa.service';
import { PrismaService } from '../PrismaService/prisma.service';

@Module({
  controllers: [CalculatorGpaController],
  providers: [CalculatorGpaService, PrismaService],
  exports: [CalculatorGpaService],
})
export class CalculatorGpaModule {}
