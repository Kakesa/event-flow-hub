import { Button, ButtonProps } from '@/components/ui/button';
import { usePermissions } from '@/hooks/usePermissions';
import type { ModuleName, PermissionAction } from '@/types/models';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PermissionButtonProps extends ButtonProps {
  module: ModuleName;
  action: PermissionAction;
  hideWhenDisabled?: boolean;
}

export const PermissionButton = ({
  module,
  action,
  hideWhenDisabled = false,
  children,
  ...props
}: PermissionButtonProps) => {
  const { hasPermission } = usePermissions();
  const allowed = hasPermission(module, action);

  if (!allowed && hideWhenDisabled) {
    return null;
  }

  if (!allowed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button {...props} disabled className="opacity-50 cursor-not-allowed">
                {children}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Vous n'avez pas la permission d'effectuer cette action</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <Button {...props}>{children}</Button>;
};

export default PermissionButton;