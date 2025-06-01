#!/bin/bash

echo "🛠️ Iniciando compilación de React con 'npm run build'..."
if npm run build; then
    echo "[✔] Compilación completada con éxito."
else
    echo "[✖] Error durante la compilación de React."
    echo "[✖] El script no se ha podido ejecutar correctamente."
    exit 1
fi

echo "🧹 Eliminando archivos anteriores en /var/www/html/..."
if sudo rm -rf /var/www/html/*; then
    echo "[✔] Archivos antiguos eliminados correctamente."
else
    echo "[✖] Error al eliminar archivos antiguos."
    echo "[✖] El script no se ha podido ejecutar correctamente."
    exit 1
fi

echo "📁 Copiando archivos nuevos desde la carpeta 'build/'..."
if sudo cp -r build/* /var/www/html/; then
    echo "[✔] Archivos copiados correctamente."
else
    echo "[✖] Error al copiar archivos nuevos."
    echo "[✖] El script no se ha podido ejecutar correctamente."
    exit 1
fi

echo "[✔] Script ejecutado con éxito."

