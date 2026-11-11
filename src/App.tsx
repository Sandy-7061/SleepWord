import React from 'react';
import { ShowroomView } from './components/ui/ShowroomView';
import { ContactModal } from './components/ui/ContactModal';

export const App: React.FC = () => {
  return (
    <div className="relative w-screen h-screen flex flex-col bg-[#050b14] overflow-hidden select-none">
      <ShowroomView />
      <ContactModal />
    </div>
  );
};

export default App;
