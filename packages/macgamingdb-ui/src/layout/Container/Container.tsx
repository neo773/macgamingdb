import React from 'react';

interface Props {
  children: React.ReactNode;
}

const Container = ({ children }: Props) => {
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
      {children}
    </div>
  );
};

export { Container };
