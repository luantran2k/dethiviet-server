import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Api start at: ' + new Date().toLocaleString();
  }
}
