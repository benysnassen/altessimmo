import { useState, useEffect, useRef } from 'react';

interface DropdownPosition {
  top?: number | string;
  bottom?: number | string;
  left?: number | string;
  right?: number | string;
  transform?: string;
}

export const useDropdownPosition = () => {
  const [position, setPosition] = useState<DropdownPosition>({});
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const calculatePosition = () => {
    if (!triggerRef.current || !dropdownRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    const spaceRight = viewportWidth - triggerRect.left;
    const spaceLeft = triggerRect.right;

    const newPosition: DropdownPosition = {};

    // Position verticale : préférer vers le bas, mais vers le haut si pas assez d'espace
    if (spaceBelow >= dropdownRect.height + 10) {
      // Assez d'espace en bas
      newPosition.top = 0;
      newPosition.transform = 'translateY(4px)'; // mt-1 équivalent
    } else if (spaceAbove >= dropdownRect.height + 10) {
      // Pas assez d'espace en bas, mais assez en haut
      newPosition.bottom = 0;
      newPosition.transform = 'translateY(-4px)'; // mb-1 équivalent
    } else {
      // Pas assez d'espace ni en haut ni en bas, centrer verticalement
      newPosition.top = '50%';
      newPosition.transform = 'translateY(-50%)';
    }

    // Position horizontale : ajuster si le dropdown dépasse
    if (spaceRight >= dropdownRect.width) {
      // Assez d'espace à droite
      newPosition.left = 0;
    } else if (spaceLeft >= dropdownRect.width) {
      // Pas assez d'espace à droite, mais assez à gauche
      newPosition.right = 0;
    } else {
      // Centrer horizontalement si pas assez d'espace
      newPosition.left = '50%';
      newPosition.transform = (newPosition.transform || '') + ' translateX(-50%)';
    }

    setPosition(newPosition);
  };

  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      
      const handleResize = () => calculatePosition();
      const handleScroll = () => calculatePosition();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isOpen]);

  const openDropdown = () => {
    setIsOpen(true);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return {
    isOpen,
    position,
    triggerRef,
    dropdownRef,
    openDropdown,
    closeDropdown,
    toggleDropdown,
    calculatePosition
  };
};

