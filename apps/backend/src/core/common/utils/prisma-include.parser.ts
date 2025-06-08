// Create a new file, e.g., apps/backend/src/utils/prisma-include.parser.ts
export function buildPrismaInclude(includeParam?: string): Record<string, any> | undefined {
  if (!includeParam) return undefined;

  const result: Record<string, any> = {};
  const relations = includeParam
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const relation of relations) {
    const parts = relation.split('.');
    let currentLevel = result;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        // Last part of the path
        currentLevel[part] = true;
      } else {
        // Intermediate part, ensure it's an object for further nesting
        if (!currentLevel[part] || typeof currentLevel[part] === 'boolean') {
          currentLevel[part] = { include: {} };
        } else if (typeof currentLevel[part] === 'object' && !currentLevel[part].include) {
          // If it's an object but not an include structure (e.g., from a previous part being set to true)
          // This should ideally not happen if parts are processed in order.
          // For safety, ensure 'include' property exists.
          currentLevel[part].include = currentLevel[part].include || {};
        }
        currentLevel = currentLevel[part].include;
      }
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}
