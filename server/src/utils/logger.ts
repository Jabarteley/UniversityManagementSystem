export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`ℹ️  ${message}`, ...args);
  },
  
  success: (message: string, ...args: any[]) => {
    console.log(`✅ ${message}`, ...args);
  },
  
  warning: (message: string, ...args: any[]) => {
    console.log(`⚠️  ${message}`, ...args);
  },
  
  error: (message: string, ...args: any[]) => {
    console.error(`❌ ${message}`, ...args);
  },
  
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 ${message}`, ...args);
    }
  }
};