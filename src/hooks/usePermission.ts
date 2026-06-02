import { useAuth } from '../contexts/AuthContext';
import { permissionService, type PermissionKey } from '../services/permission-service';

export const usePermission = () => {
  const { role } = useAuth();

  const hasPermission = (permissionKey: PermissionKey): boolean => {
    return permissionService.hasPermission(role, permissionKey);
  };

  const canViewPartners = () => hasPermission('partners_view');
  const canEditPartners = () => hasPermission('partners_edit');
  const canImportPartners = () => hasPermission('partners_import');
  const canManageStaff = () => hasPermission('partners_staff_manage');

  const canViewDeals = () => hasPermission('deals_view');
  const canApproveDeals = () => hasPermission('deals_approve');
  const canRegisterDeals = () => hasPermission('deals_register');
  const canEditDeals = () => hasPermission('deals_edit');

  const canViewMarketing = () => hasPermission('marketing_view');
  const canManageMarketing = () => hasPermission('marketing_manage');
  const canManageMDF = () => hasPermission('marketing_mdf');
  const canManageEvents = () => hasPermission('marketing_events');

  const canViewIncentives = () => hasPermission('incentives_view');
  const canManageIncentives = () => hasPermission('incentives_manage');

  const canViewEnablement = () => hasPermission('enablement_view');
  const canManageEnablement = () => hasPermission('enablement_manage');

  const canViewAnalytics = () => hasPermission('analytics_view');

  const canManageUsers = () => hasPermission('users_manage');
  const canManageSettings = () => hasPermission('settings_global');
  const canManageSecurity = () => hasPermission('settings_security');
  const canManageRoles = () => hasPermission('settings_roles');
  const canViewAuditLogs = () => hasPermission('audit_logs');

  return {
    hasPermission,
    role,
    partners: {
      view: canViewPartners,
      edit: canEditPartners,
      import: canImportPartners,
      staff: canManageStaff,
    },
    deals: {
      view: canViewDeals,
      approve: canApproveDeals,
      register: canRegisterDeals,
      edit: canEditDeals,
    },
    marketing: {
      view: canViewMarketing,
      manage: canManageMarketing,
      mdf: canManageMDF,
      events: canManageEvents,
    },
    incentives: {
      view: canViewIncentives,
      manage: canManageIncentives,
    },
    enablement: {
      view: canViewEnablement,
      manage: canManageEnablement,
    },
    analytics: {
      view: canViewAnalytics,
    },
    settings: {
      users: canManageUsers,
      global: canManageSettings,
      security: canManageSecurity,
      roles: canManageRoles,
      audit: canViewAuditLogs,
    },
  };
};
