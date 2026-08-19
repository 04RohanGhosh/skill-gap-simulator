import React, { useState } from 'react';
import { Box, Button, HStack, VStack, Text } from '@chakra-ui/react';

interface TabProps {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

interface TabListProps {
  children: React.ReactNode;
}

interface TabPanelsProps {
  children: React.ReactNode;
}

interface TabPanelProps {
  children: React.ReactNode;
}

const Tab: React.FC<TabProps> = ({ children, isActive, onClick }) => {
  return (
    <Button
      onClick={onClick}
      variant={isActive ? 'solid' : 'outline'}
      colorScheme={isActive ? 'blue' : 'gray'}
      size="sm"
      px={4}
      py={2}
      fontWeight={isActive ? 'bold' : 'normal'}
      _hover={{ bgColor: isActive ? 'blue.50' : 'gray.50' }}
    >
      {children}
    </Button>
  );
};

const TabList: React.FC<TabListProps> = ({ children }) => {
  return <HStack spacing={2} mb={4}>{children}</HStack>;
};

const TabPanels: React.FC<TabPanelsProps> = ({ children }) => {
  return <Box>{children}</Box>;
};

const TabPanel: React.FC<TabPanelProps> = ({ children }) => {
  return <Box>{children}</Box>;
};

const Tabs: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // This is a simple implementation - in a real app, you'd manage active tab state properly
  return (
    <Box>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === TabList) {
            return child;
          }
          if (child.type === TabPanels) {
            return child;
          }
        }
        return child;
      })}
    </Box>
  );
};

Tabs.TabList = TabList;
Tabs.TabPanels = TabPanels;
Tabs.Tab = Tab;
Tabs.TabPanel = TabPanel;

export default Tabs;