// Download COMPLETE Source Code - ALL FILES (100% Working in Production)
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { getAllSourceFiles } from '@/utils/sourceFiles';
import { generateSourceFilesContent } from '@/utils/generateSourceFilesContent';

export async function downloadSourceCode(fileOverrides?: Record<string, string>) {
  const zip = new JSZip();

  try {
    console.log('🚀 Starting COMPLETE source code download...');

    const files = getAllSourceFiles();
    const totalFiles = Object.keys(files).length;
    console.log(`📦 Total files to package: ${totalFiles}`);

    // Add all files to ZIP (with overrides applied)
    for (const [filePath, content] of Object.entries(files)) {
      const finalContent = fileOverrides?.[filePath] ?? content;
      zip.file(filePath, finalContent);
      console.log(`✅ Packaged: ${filePath}${fileOverrides?.[filePath] ? ' (MODIFIED)' : ''}`);
    }

    // Also add any new files from overrides that weren't in original
    if (fileOverrides) {
      for (const [filePath, content] of Object.entries(fileOverrides)) {
        if (!files[filePath]) {
          zip.file(filePath, content);
          console.log(`✅ Packaged NEW file: ${filePath}`);
        }
      }
    }

    // Generate and add sourceFiles.ts dynamically (avoids self-reference escaping issues)
    const allFilesForGen: Record<string, string> = {};
    for (const [filePath, content] of Object.entries(files)) {
      allFilesForGen[filePath] = fileOverrides?.[filePath] ?? content;
    }
    if (fileOverrides) {
      for (const [filePath, content] of Object.entries(fileOverrides)) {
        if (!allFilesForGen[filePath]) allFilesForGen[filePath] = content;
      }
    }
    const sourceFilesTsContent = generateSourceFilesContent(allFilesForGen);
    zip.file('src/utils/sourceFiles.ts', sourceFilesTsContent);
    console.log('✅ Packaged: src/utils/sourceFiles.ts (auto-generated)');

    const overrideCount = fileOverrides ? Object.keys(fileOverrides).length : 0;
    console.log(`✅ Successfully packaged ${totalFiles} files (${overrideCount} modified)`);

    // Generate ZIP with maximum compression
    console.log('📦 Generating ZIP file...');
    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });

    // Download using file-saver
    const suffix = fileOverrides ? '-updated' : '';
    const filename = `red-whale-v1${suffix}-source-${new Date().toISOString().split('T')[0]}.zip`;
    saveAs(blob, filename);

    console.log(`✅ Download complete: ${filename}`);
    console.log(`📦 Package size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);

    return {
      success: true,
      totalFiles,
      filename,
      size: blob.size
    };
  } catch (error) {
    console.error('❌ Download error:', error);
    throw error;
  }
}
