import React from 'react';
import { GroupData } from '../types';

interface GroupV2Props {
  group: GroupData;
  isSelected: boolean;
  theme: 'light' | 'dark';
  scale: number;
  onSelect: (multiSelect?: boolean) => void;
  onUpdate: (updates: Partial<GroupData>) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export const GroupV2: React.FC<GroupV2Props> = ({
  group,
  isSelected,
  theme: _theme,
  scale: _scale,
  onSelect,
  onUpdate: _onUpdate,
  onContextMenu
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(e.ctrlKey || e.metaKey);
  };

  return (
    <div
      className={`absolute border-2 border-dashed cursor-pointer ${
        isSelected ? 'ring-2 ring-purple-400' : ''
      }`}
      style={{
        left: group.bounds.x,
        top: group.bounds.y,
        width: group.bounds.width,
        height: group.bounds.height,
        backgroundColor: group.style.backgroundColor,
        borderColor: group.style.borderColor,
        zIndex: 1
      }}
      onClick={handleClick}
      onContextMenu={onContextMenu}
    >
      <div className="absolute -top-6 left-0 text-xs font-medium">
        Group
      </div>
    </div>
  );
};