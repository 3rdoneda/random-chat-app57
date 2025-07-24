import React from 'react';
import { cn } from '../../lib/utils';

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'premium' | 'action';
  size?: 'sm' | 'md' | 'lg';
}

export function MobileCard({ 
  children, 
  className, 
  onClick, 
  variant = 'default',
  size = 'md'
}: MobileCardProps) {
  const baseStyles = "bg-white rounded-xl border transition-all duration-200 touch-action-manipulation";
  
  const variantStyles = {
    default: "border-gray-200 hover:shadow-md active:scale-98",
    premium: "border-purple-200 bg-gradient-to-br from-white to-purple-50/30 hover:shadow-lg active:scale-98",
    action: "border-gray-200 hover:shadow-lg active:scale-95 cursor-pointer"
  };
  
  const sizeStyles = {
    sm: "p-3",
    md: "p-4", 
    lg: "p-6"
  };
  
  const styles = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    onClick && "cursor-pointer",
    className
  );
  
  return (
    <div 
      className={styles}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface MobileCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileCardHeader({ children, className }: MobileCardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-3", className)}>
      {children}
    </div>
  );
}

interface MobileCardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileCardTitle({ children, className }: MobileCardTitleProps) {
  return (
    <h3 className={cn("font-semibold text-gray-900", className)}>
      {children}
    </h3>
  );
}

interface MobileCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileCardContent({ children, className }: MobileCardContentProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {children}
    </div>
  );
}

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  color?: 'blue' | 'purple' | 'green' | 'yellow' | 'red' | 'orange';
  className?: string;
}

export function ActionCard({ 
  icon, 
  title, 
  description, 
  onClick, 
  color = 'blue',
  className 
}: ActionCardProps) {
  const colorStyles = {
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600", 
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
    orange: "bg-orange-100 text-orange-600"
  };
  
  return (
    <MobileCard 
      variant="action" 
      onClick={onClick}
      className={className}
    >
      <div className="text-center space-y-2">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mx-auto",
          colorStyles[color]
        )}>
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </div>
    </MobileCard>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'blue' | 'purple' | 'green' | 'yellow' | 'red' | 'orange';
}

export function StatCard({ 
  icon, 
  value, 
  label, 
  trend = 'neutral',
  trendValue,
  color = 'blue'
}: StatCardProps) {
  const colorStyles = {
    blue: "text-blue-600",
    purple: "text-purple-600", 
    green: "text-green-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
    orange: "text-orange-600"
  };
  
  const trendStyles = {
    up: "text-green-600",
    down: "text-red-600", 
    neutral: "text-gray-600"
  };
  
  return (
    <MobileCard size="sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("text-lg", colorStyles[color])}>
            {icon}
          </div>
          <div>
            <div className="font-bold text-lg text-gray-900">{value}</div>
            <div className="text-xs text-gray-600">{label}</div>
          </div>
        </div>
        {trendValue && (
          <div className={cn("text-xs font-medium", trendStyles[trend])}>
            {trend === 'up' && '↗'} 
            {trend === 'down' && '↘'}
            {trendValue}
          </div>
        )}
      </div>
    </MobileCard>
  );
}
