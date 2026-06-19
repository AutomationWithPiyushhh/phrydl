import { Card, CardContent } from "@/components/ui/card";
import { Bell, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    firstName: string;
    lastName: string;
  };
}

export function TenantNotifications() {
  const queryClient = useQueryClient();

  const { data: notices, isLoading } = useQuery<Notice[]>({
    queryKey: ['tenantNotices'],
    queryFn: async () => {
      const response = await api.get('/tenant/community-notices');
      return response.data.data;
    }
  });

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }



  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
        <Bell className="w-6 h-6" /> Community Notices
      </h2>
      
      <div className="space-y-4">
        {!notices || notices.length === 0 ? (
          <p className="text-gray-500">No recent notices for your property.</p>
        ) : (
          notices.map(n => (
            <Card 
              key={n.id} 
              className="border-gray-200 shadow-sm rounded-2xl bg-white"
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900 text-lg">{n.title}</h4>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{n.content}</p>
                <div className="mt-4 text-xs text-gray-500 italic text-right">
                  Posted by {n.author?.firstName} {n.author?.lastName}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
