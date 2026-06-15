import * as React from 'react';
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

export const PermissionButton = React.forwardRef<HTMLButtonElement, PermissionButtonProps>(
  ({ module, action, hideWhenDisabled = false, children, ...props }, ref) => {
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
              <span className="inline-flex">
                <Button
                  ref={ref}
                  {...props}
                  disabled
                  className="opacity-50 cursor-not-allowed"
                >
                  {children}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Vous n&apos;avez pas la permission d&apos;effectuer cette action</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Button ref={ref} {...props}>
        {children}
      </Button>
    );
  }
);

PermissionButton.displayName = 'PermissionButton';

export default PermissionButton;
