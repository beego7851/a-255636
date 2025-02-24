import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, LockKeyhole, Key, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import AdminPasswordResetDialog from '@/components/auth/AdminPasswordResetDialog';
import MagicLinkButton from '@/components/auth/password/MagicLinkButton';

interface PasswordManagementSectionProps {
  memberId: string;
  memberNumber: string;
  memberName: string;
  passwordSetAt: Date | null;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  passwordResetRequired: boolean;
}

const PasswordManagementSection = ({
  memberId,
  memberNumber,
  memberName,
  passwordSetAt,
  failedLoginAttempts,
  lockedUntil,
  passwordResetRequired,
}: PasswordManagementSectionProps) => {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleUnlockAccount = async () => {
    try {
      console.log('Unlocking account for member:', {
        memberNumber,
        memberName,
        timestamp: new Date().toISOString()
      });

      setIsUnlocking(true);
      const { error } = await supabase.rpc('reset_failed_login', {
        member_number: memberNumber
      });

      if (error) {
        console.error('Error unlocking account:', {
          error,
          memberNumber,
          timestamp: new Date().toISOString()
        });
        throw error;
      }

      toast.success("Account has been unlocked", {
        description: `Successfully unlocked account for ${memberName}`
      });

      // Invalidate queries to refresh member data
      // This assumes you're using react-query and have queryClient available
      // If not, you'll need to implement your own refresh mechanism
    } catch (error: any) {
      console.error('Failed to unlock account:', {
        error,
        memberNumber,
        timestamp: new Date().toISOString()
      });
      
      toast.error("Failed to unlock account", {
        description: error.message
      });
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="space-y-4 border-t border-white/10 pt-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-dashboard-accent1">Password Status</h4>
          <div className="flex items-center gap-2">
            {passwordSetAt ? (
              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                <LockKeyhole className="w-3 h-3 mr-1" />
                Password Set
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                <Key className="w-3 h-3 mr-1" />
                No Password
              </Badge>
            )}
            
            {lockedUntil && new Date(lockedUntil) > new Date() && (
              <Badge variant="outline" className="bg-red-500/10 text-red-500">
                <Lock className="w-3 h-3 mr-1" />
                Locked
              </Badge>
            )}
            
            {passwordResetRequired && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                <RefreshCw className="w-3 h-3 mr-1" />
                Reset Required
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lockedUntil && new Date(lockedUntil) > new Date() && (
            <Button 
              variant="outline"
              size="sm"
              onClick={handleUnlockAccount}
              disabled={isUnlocking}
              className="bg-dashboard-card hover:bg-dashboard-cardHover"
            >
              <Lock className="w-4 h-4 mr-2" />
              {isUnlocking ? 'Unlocking...' : 'Unlock'}
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResetDialog(true)}
            className="bg-dashboard-card hover:bg-dashboard-cardHover"
          >
            <Key className="w-4 h-4 mr-2" />
            Reset Password
          </Button>
        </div>
      </div>

      {failedLoginAttempts > 0 && (
        <p className="text-sm text-dashboard-muted">
          Failed login attempts: {failedLoginAttempts}
        </p>
      )}

      <MagicLinkButton 
        memberNumber={memberNumber}
        memberName={memberName}
      />

      <AdminPasswordResetDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        memberNumber={memberNumber}
        memberName={memberName}
      />
    </div>
  );
};

export default PasswordManagementSection;
