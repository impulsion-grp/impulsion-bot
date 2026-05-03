export const logger = {
  info: (m: string, ...a: unknown[]) => console.log(`ℹ️  ${m}`, ...a),
  success: (m: string, ...a: unknown[]) => console.log(`✅ ${m}`, ...a),
  warn: (m: string, ...a: unknown[]) => console.warn(`⚠️  ${m}`, ...a),
  error: (m: string, ...a: unknown[]) => console.error(`❌ ${m}`, ...a)
};
