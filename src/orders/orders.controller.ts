import { Body, Controller, Post } from '@nestjs/common';
import { VerifiedOnly } from 'src/auth/decorators/verified-only.decorator';

@Controller('orders')
export class OrdersController {
    @Post('checkout')
    @VerifiedOnly()
    checkout(@Body() checkoutDto: any) {
        return 'test';
    }
}
