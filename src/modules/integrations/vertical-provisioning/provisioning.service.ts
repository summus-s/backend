import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { ProvisionVerticalTenantDto } from './dto/provision-vertical-tenant.dto';
import { VerticalApiClient } from './vertical-api.client';
import { VerticalTenantsService } from '../../vertical-tenants/vertical-tenants.service';
import { CompanyVerticalsService } from '../../company-verticals/company-verticals.service';
import { CompanyVerticalStatus } from '../../company-verticals/enums/company-vertical-status.enum';
import { VerticalTenantStatus } from '../../vertical-tenants/enums/vertical-tenant-status.enum';

@Injectable()
export class ProvisioningService {
  constructor(
    private readonly verticalApiClient: VerticalApiClient,
    private readonly verticalTenantsService: VerticalTenantsService,
    private readonly companyVerticalsService: CompanyVerticalsService,
  ) {}

  private normalizeString(value?: string | null): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private buildProvisionUrl(appOrApiBaseUrl: string): string {
    const baseUrl = appOrApiBaseUrl.replace(/\/+$/, '');
    return `${baseUrl}/internal/provisioning/tenants`;
  }

  private buildHeaders(vertical: any): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (vertical.provisioningApiKey) {
      headers['x-api-key'] = vertical.provisioningApiKey;
    }

    return headers;
  }

  private buildPayload(companyVertical: any, verticalTenant: any) {
    return {
      companyVerticalId: companyVertical.id,
      companyId: companyVertical.companyId,
      verticalId: companyVertical.verticalId,
      company: {
        id: companyVertical.company?.id,
        name: companyVertical.company?.name,
        legalName: companyVertical.company?.legalName ?? null,
        taxId: companyVertical.company?.taxId ?? null,
      },
      vertical: {
        id: companyVertical.vertical?.id,
        key: companyVertical.vertical?.key,
        name: companyVertical.vertical?.name,
      },
      contract: {
        status: companyVertical.status,
        planName: companyVertical.planName,
        billingCycle: companyVertical.billingCycle,
        startsAt: companyVertical.startsAt,
        endsAt: companyVertical.endsAt,
      },
      localTenant: {
        id: verticalTenant.id,
        syncReference: verticalTenant.syncReference,
      },
    };
  }

  async provision(verticalTenantId: string, dto: ProvisionVerticalTenantDto) {
    const verticalTenant = await this.verticalTenantsService.findById(
      verticalTenantId,
    );

    const companyVertical = await this.companyVerticalsService.findById(
      verticalTenant.companyVerticalId,
    );

    if (companyVertical.status !== CompanyVerticalStatus.ACTIVE) {
      throw new BadRequestException(
        'Solo puedes provisionar tenants cuyo company-vertical esté activo',
      );
    }

    if (
      !dto.force &&
      verticalTenant.status === VerticalTenantStatus.PROVISIONED
    ) {
      throw new BadRequestException(
        'Este tenant técnico ya se encuentra provisionado',
      );
    }

    const vertical = companyVertical.vertical;

    if (!vertical) {
      throw new BadRequestException(
        'No fue posible cargar la información del vertical',
      );
    }

    const remoteBaseUrl = vertical.apiBaseUrl || vertical.appBaseUrl;

    if (!remoteBaseUrl) {
      throw new BadRequestException(
        'El vertical no tiene configurada una URL remota para provisioning',
      );
    }

    await this.verticalTenantsService.markProvisioning(verticalTenant.id, {
      syncReference:
        this.normalizeString(dto.syncReference) ??
        verticalTenant.syncReference ??
        undefined,
      notes: dto.notes,
    });

    const payload = this.buildPayload(companyVertical, verticalTenant);
    const provisionUrl = this.buildProvisionUrl(remoteBaseUrl);
    const headers = this.buildHeaders(vertical);

    await this.verticalTenantsService.update(verticalTenant.id, {
      syncReference:
        this.normalizeString(dto.syncReference) ??
        verticalTenant.syncReference ??
        undefined,
      notes: dto.notes,
    });

    await this.verticalTenantsService.saveLastRequestPayload(
      verticalTenant.id,
      payload,
    );

    try {
      const response = await this.verticalApiClient.post(provisionUrl, payload, headers);

      await this.verticalTenantsService.update(verticalTenant.id, {
        notes: dto.notes,
      });

      const responseData: any = response.data ?? {};
      
      await this.verticalTenantsService.saveLastResponsePayload(
        verticalTenant.id,
        (response.data ?? {}) as Record<string, unknown>,
      );

      await this.verticalTenantsService.markProvisioned(verticalTenant.id, {
        externalTenantId: responseData.externalTenantId ?? responseData.tenantId,
        externalCompanyId:
          responseData.externalCompanyId ?? responseData.companyId,
        externalWorkspaceId:
          responseData.externalWorkspaceId ?? responseData.workspaceId,
        externalUrl: responseData.externalUrl ?? responseData.url,
        syncReference:
          this.normalizeString(dto.syncReference) ??
          responseData.syncReference ??
          verticalTenant.syncReference ??
          undefined,
        notes: dto.notes,
      });

      return {
        success: true,
        verticalTenantId: verticalTenant.id,
        remoteStatus: response.status,
        remoteResponse: response.data,
      };
    } catch (error: any) {
      await this.verticalTenantsService.markFailed(verticalTenant.id, {
        errorCode:
          error?.response?.status?.toString?.() ??
          error?.status?.toString?.() ??
          'PROVISIONING_ERROR',
        errorMessage:
          error?.response?.data?.message ??
          error?.message ??
          'Error no controlado en provisioning remoto',
        syncReference:
          this.normalizeString(dto.syncReference) ??
          verticalTenant.syncReference ??
          undefined,
        notes: dto.notes,
      });

      throw error;
    }
  }
}