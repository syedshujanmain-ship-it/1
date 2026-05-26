export interface ValidationError {
  file: string;
  line?: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Simple syntax validator for TypeScript/TSX code
// Checks for common issues that cause build failures
export function validateCodeFile(filename: string, code: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  const lines = code.split('\n');

  // 1. Check balanced braces {}, [], ()
  const braceStack: Array<{ char: string; line: number }> = [];
  let inString: string | null = null;
  let inTemplate = false;
  let inComment = false;
  let inRegex = false;
  let escapeNext = false;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const prev = i > 0 ? line[i - 1] : '';

      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      // Handle strings
      if (inString) {
        if (char === inString) {
          inString = null;
        }
        continue;
      }

      // Handle template literals
      if (inTemplate) {
        if (char === '`') {
          inTemplate = false;
        } else if (char === '$' && line[i + 1] === '{') {
          braceStack.push({ char: 'template', line: lineIdx + 1 });
        }
        continue;
      }

      // Handle regex
      if (inRegex) {
        if (char === '/' && !escapeNext) {
          inRegex = false;
        }
        continue;
      }

      // Handle comments
      if (inComment) {
        if (char === '*' && line[i + 1] === '/') {
          inComment = false;
          i++;
        }
        continue;
      }

      if (char === '/' && line[i + 1] === '*') {
        inComment = true;
        i++;
        continue;
      }
      if (char === '/' && line[i + 1] === '/') {
        break; // rest of line is comment
      }

      // Start of string/template/regex
      if (char === '"' || char === "'") {
        inString = char;
        continue;
      }
      if (char === '`') {
        inTemplate = true;
        continue;
      }
      if (char === '/' && !inString && !inTemplate) {
        // Could be regex — simplistic check
        const prevNonSpace = line.slice(0, i).trimEnd().slice(-1);
        if (['=', '(', ',', ':', '[', '{', 'return', 'case', 'void', 'typeof', 'instanceof', 'in', 'of', 'else', 'do', '?', '!', '&', '|', '+', '-', '*', '/', '%', '~', '^', '<', '>', ',', ';'].some(c => prevNonSpace.endsWith(c))) {
          inRegex = true;
          continue;
        }
      }

      // Braces
      if (char === '(' || char === '{' || char === '[') {
        braceStack.push({ char, line: lineIdx + 1 });
      } else if (char === ')' || char === '}' || char === ']') {
        const expected = char === ')' ? '(' : char === '}' ? '{' : '[';
        if (braceStack.length === 0) {
          errors.push({ file: filename, line: lineIdx + 1, message: `Unexpected closing '${char}'`, severity: 'error' });
        } else {
          const last = braceStack.pop()!;
          if (last.char !== expected && last.char !== 'template') {
            errors.push({ file: filename, line: lineIdx + 1, message: `Mismatched braces: expected '${last.char}' but found '${char}' (opened at line ${last.line})`, severity: 'error' });
          }
        }
      }
    }
  }

  // Check for unclosed braces
  for (const item of braceStack) {
    if (item.char === 'template') {
      errors.push({ file: filename, line: item.line, message: 'Unclosed template literal expression ${}', severity: 'error' });
    } else {
      errors.push({ file: filename, line: item.line, message: `Unclosed '${item.char}'`, severity: 'error' });
    }
  }

  // 2. Check JSX balance (basic)
  const jsxOpen = (code.match(/<([A-Z][a-zA-Z0-9]*|[a-z][a-zA-Z0-9]*)(?=[\s>])/g) || []).length;
  const jsxClose = (code.match(/<\/[^>]+>/g) || []).length;
  const jsxSelfClose = (code.match(/<[^>]+\/>/g) || []).length;
  // Very rough check — only for self-closing mismatch
  if (jsxOpen > jsxClose + jsxSelfClose + 5) {
    warnings.push({ file: filename, message: `Possible unclosed JSX tags: ${jsxOpen} opens, ${jsxClose + jsxSelfClose} closes/self-closes`, severity: 'warning' });
  }

  // 3. Check for common patterns
  if (filename.endsWith('.tsx') || filename.endsWith('.ts')) {
    // Import from non-existent paths (basic check)
    const importMatches = code.matchAll(/from\s+['"]([^'"]+)['"];?/g);
    for (const m of importMatches) {
      const path = m[1];
      if (path.startsWith('@/') && !path.startsWith('@/components/') && !path.startsWith('@/pages/') && !path.startsWith('@/utils/') && !path.startsWith('@/types/') && !path.startsWith('@/hooks/') && !path.startsWith('@/lib/') && !path.startsWith('@/services/') && !path.startsWith('@/contexts/') && !path.startsWith('@/db/') && !path.startsWith('@/components/ui/')) {
        warnings.push({ file: filename, message: `Unusual import path: ${path}`, severity: 'warning' });
      }
    }
  }

  // 4. Check for incomplete exports
  if (filename.endsWith('.tsx') || filename.endsWith('.ts')) {
    if (!code.includes('export ')) {
      warnings.push({ file: filename, message: 'File has no export statement — may not be usable', severity: 'warning' });
    }
  }

  // 5. Check for obvious truncation
  if (code.trim().endsWith('...') || code.trim().endsWith('// ') || code.trim().endsWith('/*')) {
    errors.push({ file: filename, message: 'File appears to be truncated or incomplete', severity: 'error' });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateAllFiles(files: Record<string, string>): ValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationError[] = [];

  for (const [filename, code] of Object.entries(files)) {
    if (!filename.endsWith('.ts') && !filename.endsWith('.tsx') && !filename.endsWith('.js') && !filename.endsWith('.jsx')) continue;
    const result = validateCodeFile(filename, code);
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}
