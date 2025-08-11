import type { InstantRules } from '@instantdb/react';

const rules = {
  folders: {
    allow: {
      view: 'isOwner',
      create: 'isOwner',
      update: 'isOwner',
      delete: 'isOwner',
    },
    bind: ['isOwner', 'auth.id != null && auth.id == data.id'],
  },
  files: {
    allow: {
      view: 'isOwner',
      create: 'isOwner',
      update: 'isOwner',
      delete: 'isOwner',
    },
    bind: ['isOwner', 'auth.id != null && auth.id == data.id'],
  },
} satisfies InstantRules;

export default rules;