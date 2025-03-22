import type { AuthError, PostgrestError } from '@supabase/supabase-js';
import type { StorageError } from '@supabase/storage-js';
export interface NotifyI {
  SuccessI: {
    message: string;
    ok?: () => void;
  };
  ErrorI: AuthError | PostgrestError | StorageError;
}
