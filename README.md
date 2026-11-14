## Voyager 1 - A 1 Día Luz de Distancia 🚀🌌

Una aplicación web interactiva de un solo archivo (HTML/CSS/JS) para celebrar un hito histórico en la exploración espacial: el momento en que la sonda Voyager 1 de la NASA alcanza la distancia de 1 día luz de la Tierra (aproximadamente 25.900 millones de kilómetros).

Este evento oficial ocurrirá el 18 de noviembre de 2026. Para que un mensaje de luz llegue a la sonda ese día, debe emitirse desde la Tierra exactamente 24 horas antes. Esta app ayuda a los usuarios a unirse a la celebración enviando la señal «VGR» en código Morse hacia las estrellas.

Artículo oficial de la NASA sobre el evento

✨ Características Principales

⏱️ Cuenta atrás dinámica: Reloj en vivo que calcula automáticamente la ventana de transmisión ideal (17 de noviembre a las 18:30) adaptada a la hora local del usuario.

🧭 Brújula Estelar: Utiliza la API de giroscopio (DeviceOrientation) para guiar al usuario visualmente hacia la constelación de Ofiuco (Oeste), la dirección exacta de la sonda.

📡 Transmisor Morse «VGR»: Emite la señal visual en código Morse de forma automatizada. Permite usar la pantalla (con brillo al máximo) o interactuar de forma experimental con la linterna del dispositivo móvil (MediaDevices API).

📏 Odómetro en Tiempo Real: Un contador que simula la distancia actual de la Voyager 1, sumando 17 kilómetros cada segundo.

📀 Experiencia Inmersiva: Incluye un reproductor con el audio real de los "Saludos de la Tierra" pertenecientes al mítico Disco de Oro que viaja a bordo de la sonda, junto con un fondo estelar animado en Canvas.

📲 Viralidad: Certificado de participación al completar la transmisión y uso de la Web Share API para invitar a amigos por WhatsApp, X, etc.

🛠️ Tecnologías Utilizadas

HTML5 & CSS3: Interfaz moderna, "Mobile-First" y responsiva, basada en los colores de la NASA y la Agencia Espacial Europea (ESA).

Vanilla JavaScript: Toda la lógica está contenida en el mismo archivo, sin dependencias externas ni frameworks.

Web APIs:

DeviceOrientation Event (Giroscopio)

navigator.mediaDevices.getUserMedia (Control de flash/linterna)

Web Share API (Compartir en redes sociales)

Canvas API (Fondo de estrellas)

🚀 Despliegue y Uso

Dado que el proyecto está diseñado como un único archivo HTML, su despliegue es inmediato y gratuito utilizando GitHub Pages:

Sube el archivo index.html a tu repositorio.

Ve a los Settings (Ajustes) de tu repositorio.

En el menú lateral, selecciona Pages.

Elige la rama main y guarda. ¡Tu web estará online en un par de minutos!

Instrucciones para el usuario final:

Abre la web desde un dispositivo móvil.

Si lo deseas, activa el audio del Disco de Oro.

Concede permisos de giroscopio (si se solicita) para buscar el Oeste con tu teléfono.

Pulsa en Usar Pantalla (asegúrate de tener el brillo al máximo) o Usar Linterna para enviar tu mensaje hacia las estrellas.

¡Comparte tu certificado al terminar!

⚠️ Notas Técnicas y Limitaciones

Linterna en iOS: Apple bloquea el control directo del hardware del flash (linterna) a través de los navegadores web en los iPhone por motivos de seguridad/privacidad. Por ello, el botón de linterna fallará en Safari iOS. La alternativa principal y 100% fiable es el parpadeo de la pantalla.

Permisos en Android: El uso de la linterna en Android requiere solicitar permisos de cámara, ya que el flash es considerado parte de este módulo.

🤝 Contribuciones

¡Las contribuciones son bienvenidas! Siéntete libre de hacer un fork del proyecto, mejorar el diseño, la precisión astronómica o añadir nuevas animaciones y abrir un Pull Request.

Desarrollado para conectar la tecnología web con la divulgación astronómica. 🌌
