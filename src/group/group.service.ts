import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpStatusCode } from '../global/globalEnum';
import { ResponseClass } from '../global';
@Injectable()
export class GroupService {
  constructor(private prisma: PrismaService) {}
}
