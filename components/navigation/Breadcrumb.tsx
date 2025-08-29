'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, ChevronRight, BarChart3, Settings, Eye } from 'lucide-react';

interface BreadcrumbProps {
  sessionId?: string;
  agent?: string;
  assetPair?: string;
}

export default function Breadcrumb({ sessionId, agent, assetPair }: BreadcrumbProps) {
  const router = useRouter();
  const pathname = usePathname();

  const getBreadcrumbItems = () => {
    const items = [
      {
        label: 'AI Trading Oracle',
        icon: Home,
        href: '/',
        isHome: true
      }
    ];

    if (pathname.includes('/settings')) {
      items.push({
        label: 'Settings',
        icon: Settings,
        href: '/settings',
        isHome: false
      });
    } else if (sessionId) {
      items.push({
        label: assetPair || 'Analysis',
        icon: BarChart3,
        href: `/analysis/${sessionId}/complete`,
        isHome: false
      });

      if (pathname.includes('/complete')) {
        items.push({
          label: 'Complete Analysis',
          icon: Eye,
          href: `/analysis/${sessionId}/complete`,
          isHome: false
        });
      } else if (agent) {
        items.push({
          label: 'Complete Analysis',
          icon: Eye,
          href: `/analysis/${sessionId}/complete`,
          isHome: false
        });

        const agentNames: { [key: string]: string } = {
          researcher: 'Market Researcher',
          sentiment: 'Sentiment Analyzer',
          news: 'News Intelligence',
          macro: 'Macro Economist',
          bull: 'Bull Advocate',
          bear: 'Bear Advocate',
          trader: 'Hedge Fund Trader'
        };

        items.push({
          label: agentNames[agent] || agent,
          icon: BarChart3,
          href: `/analysis/${sessionId}/${agent}`,
          isHome: false
        });
      }
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <nav className="flex items-center space-x-2 mb-6">
      {breadcrumbItems.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-slate-400 mx-2" />
          )}
          <Button
            variant={index === breadcrumbItems.length - 1 ? "default" : "ghost"}
            size="sm"
            onClick={() => router.push(item.href)}
            className={`gap-2 ${
              item.isHome 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' 
                : index === breadcrumbItems.length - 1
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Button>
        </div>
      ))}
    </nav>
  );
}
