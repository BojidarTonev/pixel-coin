import { toast as sonnerToast } from 'sonner';
import { 
  CheckCircle, 
  XCircle,
  Loader2,
  Wallet,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastProps {
  title: string;
  message?: string;
  type: 'success' | 'error' | 'loading' | 'wallet' | 'info';
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  loading: Loader2,
  wallet: Wallet,
  info: Info
};

const styles = {
  success: 'text-green-400',
  error: 'text-red-400',
  loading: 'text-purple-400',
  wallet: 'text-purple-400',
  info: 'text-blue-400'
};

function showToast({ title, message, type }: ToastProps) {
  const Icon = icons[type];
  
  return sonnerToast(
    <div className="flex items-start gap-3">
      <div className={cn(
        "mt-0.5",
        type === 'loading' ? 'animate-spin' : '',
        styles[type]
      )}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-200">{title}</p>
        {message && (
          <p className="text-xs mt-1 text-gray-400">{message}</p>
        )}
      </div>
    </div>,
    {
      className: "bg-gray-900/90 backdrop-blur-sm border border-gray-800 text-gray-300",
      position: "bottom-right",
      duration: type === 'loading' ? Infinity : 4000,
    }
  );
}

export const customToast = {
  success: (title: string, message?: string) => showToast({ title, message, type: 'success' }),
  error: (title: string, message?: string) => showToast({ title, message, type: 'error' }),
  loading: (title: string, message?: string) => showToast({ title, message, type: 'loading' }),
  wallet: (title: string, message?: string) => showToast({ title, message, type: 'wallet' }),
  info: (title: string, message?: string) => showToast({ title, message, type: 'info' }),
  promise: async <T>(
    promise: Promise<T>,
    {
      loading: { title: loadingTitle, message: loadingMessage },
      success: { title: successTitle, message: successMessage },
      error: { title: errorTitle, message: errorMessage }
    }: {
      loading: { title: string; message?: string };
      success: { title: string; message?: string };
      error: { title: string; message?: string };
    }
  ) => {
    const toastId = showToast({ title: loadingTitle, message: loadingMessage, type: 'loading' });
    try {
      const result = await promise;
      sonnerToast.dismiss(toastId);
      showToast({ title: successTitle, message: successMessage, type: 'success' });
      return result;
    } catch (error) {
      sonnerToast.dismiss(toastId);
      showToast({ title: errorTitle, message: errorMessage, type: 'error' });
      throw error;
    }
  }
}; 