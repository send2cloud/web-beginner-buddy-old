import { init } from '@instantdb/react';
import schema from '../instant.schema';

const APP_ID = import.meta.env.VITE_INSTANT_APP_ID || '9b69c971-97a3-4ec8-b18d-e59be5efff23';
const db = init({ 
  appId: APP_ID, 
  schema,
  // Enable persistent authentication
  devtool: false,
  apiURI: 'https://api.instantdb.com',
  websocketURI: 'wss://api.instantdb.com/runtime/session'
});

export default db;