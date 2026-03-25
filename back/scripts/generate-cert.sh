#!/bin/bash
echo "🔐 Generando certificado autofirmado para desarrollo..."
echo ""

mkdir -p certs

openssl req -x509 \
  -newkey rsa:4096 \
  -nodes \
  -out certs/cert.pem \
  -keyout certs/key.pem \
  -days 365 \
  -subj "/C=CO/ST=Colombia/L=Bogota/O=Development/CN=localhost"

if [ -f "certs/cert.pem" ] && [ -f "certs/key.pem" ]; then
    echo "✅ Certificado generado exitosamente!"
    echo ""
    echo "📄 Detalles:"
    echo "   - Certificado: certs/cert.pem"
    echo "   - Clave privada: certs/key.pem"
    echo "   - Válido por: 365 días"
    echo "   - Algoritmo: RSA 4096 bits"
    echo ""
    echo "⚠️  NOTAS IMPORTANTES:"
    echo "   - Este certificado es SOLO para desarrollo local"
    echo "   - El navegador mostrará advertencia de seguridad (normal)"
    echo "   - En producción, usar Let's Encrypt"
    echo "   - NO commit estos archivos a git (añadidos a .gitignore)"
    echo ""
    echo "🚀 Para iniciar el servidor:"
    echo "   npm run dev"
else
    echo "❌ Error al generar el certificado"
    echo "   Asegúrate de tener openssl instalado"
    exit 1
fi
