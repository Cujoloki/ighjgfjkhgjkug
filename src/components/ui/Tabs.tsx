import React from 'react';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export function Tabs({ value, onValueChange, children }: TabsProps) {
  return (
    <div className="space-y-4">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            value,
            onValueChange
          });
        }
        return child;
      })}
    </div>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div className={`flex rounded-lg bg-gray-100 p-1 ${className}`}>
      {children}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
  currentValue?: string;
}

export function TabsTrigger({ value, children, onValueChange, currentValue }: TabsTriggerProps) {
  const isActive = currentValue === value;
  
  const handleClick = () => {
    if (onValueChange) {
      onValueChange(value);
    }
  };
  
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  currentValue?: string;
}

export function TabsContent({ value, children, className = '', currentValue }: TabsContentProps) {
  const isActive = currentValue === value;
  
  if (!isActive) {
    return null;
  }
  
  return (
    <div className={`rounded-md ${className}`}>
      {children}
    </div>
  );
}

// Add event handlers to pass down the current value to children
const TabsWithHandlers = ({ children, ...props }: TabsProps) => {
  return (
    <Tabs {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            currentValue: props.value,
            onValueChange: props.onValueChange
          });
        }
        return child;
      })}
    </Tabs>
  );
};

const TabsListWithHandlers = ({ children, ...props }: TabsListProps) => {
  return (
    <TabsList {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && (child.type as any) === TabsTrigger) {
          return React.cloneElement(child as React.ReactElement<any>, {
            currentValue: (props as any).currentValue,
            onValueChange: (props as any).onValueChange
          });
        }
        return child;
      })}
    </TabsList>
  );
};

const TabsContentWithHandlers = ({ children, ...props }: TabsContentProps) => {
  return (
    <TabsContent {...props}>
      {children}
    </TabsContent>
  );
};

// Export the components with handlers
export {
  TabsWithHandlers as Tabs,
  TabsListWithHandlers as TabsList,
  TabsContentWithHandlers as TabsContent
};