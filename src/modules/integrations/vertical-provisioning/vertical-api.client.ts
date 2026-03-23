import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class VerticalApiClient {
  constructor(private readonly httpService: HttpService) {}

  async post<TResponse = any>(
    url: string,
    payload: Record<string, unknown>,
    headers?: Record<string, string>,
  ): Promise<{
    status: number;
    data: TResponse;
  }> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<TResponse>(url, payload, {
          headers,
          timeout: 20000,
        }),
      );

      return {
        status: response.status,
        data: response.data,
      };
    } catch (error: any) {
      if (error?.response) {
        throw new BadGatewayException({
          message: 'El vertical remoto respondió con error',
          status: error.response.status,
          data: error.response.data ?? null,
        });
      }

      if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
        throw new BadGatewayException(
          'No fue posible conectar con la API remota del vertical',
        );
      }

      throw new InternalServerErrorException(
        'Ocurrió un error ejecutando la integración con el vertical',
      );
    }
  }
}