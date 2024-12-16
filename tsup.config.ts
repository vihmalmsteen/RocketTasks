// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  // Inclui todos os arquivos .ts e .json na pasta src
  entry: [
    'src/**/*.ts',
    'src/**/*.json',
    ],
  format: ['esm', 'cjs'],                           // Escolha o formato desejado (ESM e/ou CommonJS)
  outDir: 'dist',                                   // Diretório de saída
  clean: true,                                      // Limpa a pasta de saída antes de gerar novos arquivos
  
  // Ignora arquivos que não são .ts
  noExternal: ['*'],                                // Para incluir todas as dependências, se necessário
});