import type { ComponentProps } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mockUser } from "@/features/account/mock-user";

type UserAvatarProps = {
  size?: ComponentProps<typeof Avatar>["size"];
};

export function UserAvatar({ size }: UserAvatarProps) {
  return (
    <Avatar size={size}>
      <AvatarFallback className="bg-primary text-primary-foreground">
        {mockUser.initials}
      </AvatarFallback>
    </Avatar>
  );
}
