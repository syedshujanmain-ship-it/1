/**
 * Generates the content of sourceFiles.ts from a files dictionary.
 * This avoids the self-reference escaping problem.
 */
export function generateSourceFilesContent(files: Record<string, string>): string {
  const lines: string[] = [
    '// AUTO-GENERATED - DO NOT EDIT MANUALLY',
    '// Contains ALL source files embedded as strings for 100% working download & GitHub push',
    '',
    'export function getAllSourceFiles(): Record<string, string> {',
    '  const files: Record<string, string> = {};',
    '',
  ];

  function jsEscape(s: string): string {
    return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
  }

  for (const [path, content] of Object.entries(files)) {
    if (!content) continue;
    lines.push(`  files['${path}'] = \`${jsEscape(content)}\`;`);
  }

  lines.push('');
  lines.push('  return files;');
  lines.push('}');
  lines.push('');
  lines.push('export function getFileCount(): number {');
  lines.push('  return Object.keys(getAllSourceFiles()).length;');
  lines.push('}');

  return lines.join('\n');
}
