export function isTestEnvironment(): boolean {
  return process.env.JEST_WORKER_ID !== undefined;
}

export function validateRequiredVars<T extends string>(
  config: Record<string, string | undefined>,
  requiredVars: T[]
): string[] {
  const missingVars: string[] = [];

  requiredVars.forEach((varName) => {
    if (!config[varName]) {
      missingVars.push(varName);
    }
  });

  return missingVars;
}

export function formatValidationError(missingVars: string[]): string {
  const varList = missingVars.map(v => `  - ${v}`).join('\n');
  return `CONFIGURATION ERROR: Missing required environment variables:\n${varList}\n\nPlease check your .env file and ensure all required variables are set.\nAfter updating .env, you MUST restart Metro: npx expo start --clear`;
}
