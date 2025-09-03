# 🚗 Tablero de Carriles Preferenciales - Bogotá

Un tablero interactivo y moderno para visualizar y analizar datos de tráfico en carriles preferenciales de Bogotá.

## ✨ Características

- **📊 Dashboard Interactivo**: Visualización en tiempo real de datos de tráfico
- **🔍 Filtros Avanzados**: Filtrado por fecha, día, vía, dirección y búsqueda de texto
- **📈 Gráficos Dinámicos**: Gráficos de barras y dona que se actualizan automáticamente
- **📋 Tabla Paginada**: Visualización de datos con paginación y controles de página
- **📱 Diseño Responsive**: Optimizado para dispositivos móviles y de escritorio
- **🎨 Interfaz Moderna**: Diseño atractivo con gradientes y efectos visuales

## 🚀 Despliegue en GitHub Pages

### Opción 1: Despliegue Automático (Recomendado)

1. **Crear un repositorio en GitHub**:
   - Ve a [GitHub](https://github.com) y crea un nuevo repositorio
   - Nombra el repositorio como `carriles-preferenciales-bogota` o similar
   - Haz el repositorio público

2. **Subir los archivos**:
   ```bash
   git init
   git add .
   git commit -m "Primer commit: Tablero de carriles preferenciales"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```

3. **Activar GitHub Pages**:
   - Ve a tu repositorio en GitHub
   - Haz clic en "Settings" (Configuración)
   - Desplázate hacia abajo hasta "Pages"
   - En "Source", selecciona "Deploy from a branch"
   - Selecciona la rama "main" y la carpeta "/ (root)"
   - Haz clic en "Save"

4. **Tu tablero estará disponible en**:
   `https://TU_USUARIO.github.io/TU_REPOSITORIO`

### Opción 2: Despliegue Manual

1. **Crear el repositorio** como en la opción 1
2. **Subir solo los archivos del tablero** (sin el CSV)
3. **Activar GitHub Pages** como se describe arriba
4. **Subir el archivo CSV** a una ubicación accesible (como Google Drive o Dropbox)
5. **Modificar la URL del CSV** en `script.js` línea 47

## 📁 Estructura del Proyecto

```
carriles-preferenciales/
├── index.html          # Página principal del tablero
├── styles.css          # Estilos CSS del dashboard
├── script.js           # Lógica JavaScript del tablero
├── README.md           # Este archivo
└── 20250903_CarrilPreferencial_final.csv  # Datos del proyecto
```

## 🔧 Configuración

### Cambiar la Fuente de Datos

Si quieres usar datos de otra ubicación, modifica la línea 47 en `script.js`:

```javascript
const response = await fetch('TU_URL_DEL_CSV');
```

### Personalizar Colores y Estilos

Los colores principales se pueden modificar en `styles.css`:

```css
/* Color principal */
--primary-color: #667eea;

/* Gradiente del header */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

## 📊 Estructura de Datos CSV

El tablero espera un CSV con la siguiente estructura:

```csv
fecha,hora,valor,dia,mes,tipo,via,direccion,desde,hasta,valor
2021-12-15,02:00:00,50,Miércoles,Diciembre,Hábil,Av. Boyacá,NS,Av. Cl. 80,Av. Primera de Mayo,0
```

**Columnas esperadas**:
- `fecha`: Fecha en formato YYYY-MM-DD
- `hora`: Hora en formato HH:MM:SS
- `dia`: Día de la semana
- `mes`: Mes del año
- `tipo`: Tipo de día (Hábil, Festivo, etc.)
- `via`: Nombre de la vía
- `direccion`: Dirección (NS, EW)
- `desde`: Punto de inicio
- `hasta`: Punto de fin
- `valor`: Valor numérico para análisis

## 🌐 Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con gradientes y efectos
- **JavaScript ES6+**: Lógica del dashboard
- **Chart.js**: Librería para gráficos interactivos
- **Font Awesome**: Iconos del dashboard
- **Google Fonts**: Tipografía Inter

## 📱 Compatibilidad

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Dispositivos móviles

## 🐛 Solución de Problemas

### El CSV no se carga
- Verifica que el archivo CSV esté en la misma carpeta que `index.html`
- Asegúrate de que el CSV tenga la estructura correcta
- Revisa la consola del navegador para errores

### Los gráficos no se muestran
- Verifica que Chart.js se esté cargando correctamente
- Revisa que no haya errores de JavaScript en la consola

### Problemas de rendimiento con archivos grandes
- Considera usar un servidor web local para desarrollo
- Para producción, considera comprimir o dividir archivos CSV muy grandes

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si quieres mejorar el tablero:

1. Haz un fork del proyecto
2. Crea una rama para tu feature
3. Haz commit de tus cambios
4. Haz push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa la sección de "Solución de Problemas" arriba
2. Abre un issue en GitHub
3. Contacta al desarrollador

---

**¡Disfruta explorando los datos de carriles preferenciales de Bogotá! 🚗✨**
