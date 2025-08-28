import { prisma } from '../lib/db';

export class OrganizationService {
  static async createOrganization(name: string, userId: string) {
    const organization = await prisma.organization.create({
      data: {
        name,
        members: {
          create: {
            userId,
            role: 'ADMIN',
          },
        },
      },
      include: {
        members: true,
      },
    });

    return {
      id: organization.id,
      name: organization.name,
      role: 'ADMIN',
    };
  }

  static async getUserOrganizations(userId: string) {
    const memberships = await prisma.organizationMember.findMany({
      where: {
        userId,
      },
      include: {
        organization: true,
      },
    });

    return memberships.map(membership => ({
      id: membership.organization.id,
      name: membership.organization.name,
      role: membership.role,
    }));
  }

  static async getOrganization(orgId: string, userId: string) {
    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
      include: {
        organization: true,
      },
    });

    if (!membership) {
      throw new Error('Organization not found or access denied');
    }

    return {
      id: membership.organization.id,
      name: membership.organization.name,
      role: membership.role,
    };
  }

  static async updateOrganization(orgId: string, userId: string, name: string) {
    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
    });

    if (!membership || membership.role !== 'ADMIN') {
      throw new Error('Permission denied');
    }

    const organization = await prisma.organization.update({
      where: { id: orgId },
      data: { name },
    });

    return {
      id: organization.id,
      name: organization.name,
      role: membership.role,
    };
  }

  static async deleteOrganization(orgId: string, userId: string) {
    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
    });

    if (!membership || membership.role !== 'ADMIN') {
      throw new Error('Permission denied');
    }

    await prisma.organization.delete({
      where: { id: orgId },
    });
  }
}
