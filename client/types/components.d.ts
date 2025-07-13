// Component type declarations to help TypeScript resolve modules
declare module './components/interface/InterfaceHeader' {
  export const InterfaceHeader: React.FC;
}

declare module './components/interface/MenuButton' {
  export const MenuButton: React.FC<{ onClick?: () => void }>;
}

declare module './components/interface/MainInterface' {
  export const MainInterface: React.FC<any>;
}

declare module './components/interface/StatusDisplay' {
  export const StatusDisplay: React.FC<any>;
}

declare module './components/menu/ModeSelector' {
  export const ModeSelector: React.FC<any>;
}

declare module './components/menu/LanguageSelector' {
  export const LanguageSelector: React.FC;
}

declare module './components/menu/CodeManager' {
  export const CodeManager: React.FC<any>;
}

declare module './components/menu/LabInterface' {
  export const LabInterface: React.FC<{ onBack: () => void }>;
}
