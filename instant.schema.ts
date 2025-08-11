import { i } from '@instantdb/react';

const _schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
    }),
    folders: i.entity({
      name: i.string(),
      parentFolderId: i.string().optional(),
      createdAt: i.number().indexed(),
      updatedAt: i.number().indexed(),
    }),
    files: i.entity({
      name: i.string(),
      content: i.string(), // JSON stringified mindmap data
      folderId: i.string().optional(),
      createdAt: i.number().indexed(),
      updatedAt: i.number().indexed(),
    }),
  },
  links: {
    userFolders: {
      forward: { on: 'folders', has: 'one', label: 'user', required: true },
      reverse: { on: '$users', has: 'many', label: 'folders' },
    },
    userFiles: {
      forward: { on: 'files', has: 'one', label: 'user', required: true },
      reverse: { on: '$users', has: 'many', label: 'files' },
    },
    folderFiles: {
      forward: { on: 'files', has: 'one', label: 'folder' },
      reverse: { on: 'folders', has: 'many', label: 'files' },
    },
    folderParent: {
      forward: { on: 'folders', has: 'one', label: 'parentFolder' },
      reverse: { on: 'folders', has: 'many', label: 'subfolders' },
    },
  },
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;