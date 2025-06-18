
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <Home className="w-4 h-4" />
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {item.href && !item.active ? (
            <a
              href={item.href}
              className="hover:text-gray-900 transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className={item.active ? 'text-gray-900 font-medium' : ''}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
