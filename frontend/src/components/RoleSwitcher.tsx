'use client';

import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Shield, User, Eye } from 'lucide-react';

export const RoleSwitcher = () => {
  const { user, switchRole } = useAuth();

  if (!user) return null;

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-3 w-3" />;
      case 'manager':
        return <User className="h-3 w-3" />;
      case 'viewer':
        return <Eye className="h-3 w-3" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge className={`${getRoleColor(user.role)} flex items-center gap-1`} variant="secondary">
        {getRoleIcon(user.role)}
        <span className="capitalize">{user.role}</span>
      </Badge>
      <Select value={user.role} onValueChange={(value) => switchRole(value as UserRole)}>
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue placeholder="Switch role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3" />
              Admin
            </div>
          </SelectItem>
          <SelectItem value="manager">
            <div className="flex items-center gap-2">
              <User className="h-3 w-3" />
              Manager
            </div>
          </SelectItem>
          <SelectItem value="viewer">
            <div className="flex items-center gap-2">
              <Eye className="h-3 w-3" />
              Viewer
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
