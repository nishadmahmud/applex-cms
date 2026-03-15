"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";

export function useRolePermissions() {
  const { data: session } = useSession();
  const enable = !!session?.isEmployee && !!session?.employee?.id;

  return useQuery({
    queryKey: ["role-permissions", session?.employee?.id],
    enabled: enable,
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/employee/${session.employee.id}`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      return res.data.data.role.features; // ✅ fixed path
    },
  });
}
