# AppDeck

AppDeck es una aplicación móvil desarrollada con React Native que funciona como un catálogo interactivo de aplicaciones Android, permitiendo a los usuarios explorar, visualizar y lanzar aplicaciones directamente desde un entorno centralizado y visualmente atractivo.

## Características Principales

### Catálogo de Aplicaciones
- **Exploración Fluida**: Interfaz de usuario con animaciones suaves y efectos de paralaje para una experiencia de navegación premium.
- **Tarjetas Flotantes**: Visualización de aplicaciones en tarjetas con efectos 3D y animaciones de respuesta al desplazamiento.
- **Carrusel Automático**: Navegación automática entre aplicaciones con transiciones elegantes.

### Detalles de Aplicación
- **Vista Detallada**: Página dedicada con información completa de cada aplicación.
- **Animaciones de Transición**: Efectos de entrada y salida suaves al navegar entre vistas.
- **Lanzamiento Directo**: Capacidad para abrir aplicaciones Android instaladas directamente desde AppDeck.

### Ruleta de Premios
- **Juego Interactivo**: Ruleta giratoria con animaciones físicas realistas.
- **Sistema de Recompensas**: Diferentes resultados (premios, retos, intentos adicionales).
- **Efectos Visuales**: Animaciones de giro con easing y física natural.

## Tecnologías Utilizadas

- **React Native**: Framework principal para desarrollo multiplataforma.
- **Expo**: Plataforma para simplificar el desarrollo y despliegue.
- **React Native Reanimated**: Biblioteca para animaciones de alto rendimiento.
- **Supabase**: Backend como servicio para almacenamiento y gestión de datos.
- **Módulos Nativos**: Integración con APIs nativas de Android para el lanzamiento de aplicaciones.

## Arquitectura

### Frontend
- Interfaz de usuario construida con componentes React Native.
- Sistema de navegación basado en Expo Router.
- Animaciones optimizadas con Reanimated y useNativeDriver.

### Backend
- Base de datos PostgreSQL gestionada por Supabase.
- Esquema de datos con Row Level Security para control de acceso.
- API RESTful para operaciones CRUD en el catálogo de aplicaciones.

### Módulos Nativos
- Implementación de módulo personalizado en Kotlin para interactuar con el sistema Android.
- Integración con el sistema de paquetes de Android para lanzar aplicaciones externas.

## Características de Animación

- **Animaciones de Tarjetas**: Efectos de escala, rotación y opacidad basados en el desplazamiento.
- **Paralaje**: Fondos con efecto paralaje que responden al desplazamiento.
- **Física Realista**: Animaciones con propiedades físicas como amortiguación y rigidez.
- **Transiciones**: Efectos de entrada y salida suaves entre pantallas.
- **Ruleta Animada**: Implementación personalizada de una ruleta giratoria con física realista.

## Seguridad

- Políticas de Row Level Security en Supabase para proteger los datos.
- Permisos específicos en Android para consultar y lanzar aplicaciones instaladas.
- Autenticación para operaciones de escritura en la base de datos.

## Requisitos del Sistema

- **Android**: Versión 5.0 (API 21) o superior.
- **Permisos**: QUERY_ALL_PACKAGES para detectar aplicaciones instaladas.

---

Desarrollado con ❤️ por Keiver Pacheco