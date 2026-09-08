import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

// Obtener la ruta del directorio actual compatible con ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determinar el directorio de estáticos (dist si existe, de lo contrario __dirname)
const staticDir = fs.existsSync(path.join(__dirname, 'dist'))
  ? path.join(__dirname, 'dist')
  : __dirname;

// Servir los archivos estáticos
app.use(express.static(staticDir));

// Middleware final para SPA: cualquier ruta que no sea un archivo estático
// devolverá el archivo 'index.html'. Evitamos usar app.get('*') para
// prevenir patrones de rutas incompatibles.
app.use((req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
