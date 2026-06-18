import { useAuth } from '@/contexts/AuthContext';
import type { ModuleName, PermissionAction } from '@/types/models';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (module: ModuleName, action: PermissionAction): boolean => {
    if (!user) return false;
    
    if (user.role === 'admin' || user.role === 'superadmin') return true;

    if (user.subscriptionType === 'premium' || user.subscriptionType === 'enterprise') {
      return true;
    }
    
    const permissions = user.permissions;
    if (!permissions) return false;
    
    const modulePermission = permissions.find(p => p.module === module);
    if (!modulePermission) return false;
    
    return modulePermission[action];
  };

  const canCreate = (module: ModuleName) => hasPermission(module, 'create');
  const canRead = (module: ModuleName) => hasPermission(module, 'read');
  const canUpdate = (module: ModuleName) => hasPermission(module, 'update');
  const canDelete = (module: ModuleName) => hasPermission(module, 'delete');

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'
    || user?.subscriptionType === 'premium' || user?.subscriptionType === 'enterprise';

  return {
    hasPermission,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isAdmin,
  };
};

export default usePermissions;