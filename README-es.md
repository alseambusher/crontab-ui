# Interfaz de usuario de Crontab

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=\_s-xclick\&hosted_button_id=U8328Q7VFZMTS)
[![npm](https://img.shields.io/npm/v/crontab-ui.svg?style=flat-square)](https://lifepluslinux.blogspot.com/2015/06/crontab-ui-easy-and-safe-way-to-manage.html)
[![npm](https://img.shields.io/npm/dt/crontab-ui.svg?style=flat-square)](https://lifepluslinux.blogspot.com/2015/06/crontab-ui-easy-and-safe-way-to-manage.html)
[![npm](https://img.shields.io/npm/dm/crontab-ui.svg?style=flat-square)](https://lifepluslinux.blogspot.com/2015/06/crontab-ui-easy-and-safe-way-to-manage.html)
[![npm](https://img.shields.io/docker/pulls/alseambusher/crontab-ui.svg?style=flat-square)](https://lifepluslinux.blogspot.com/2015/06/crontab-ui-easy-and-safe-way-to-manage.html)
[![npm](https://img.shields.io/npm/l/crontab-ui.svg?style=flat-square)](https://lifepluslinux.blogspot.com/2015/06/crontab-ui-easy-and-safe-way-to-manage.html)

La edición del crontab de texto sin formato es propensa a errores para administrar trabajos, por ejemplo, agregar trabajos, eliminar trabajos o pausar trabajos. Un pequeño error puede derribar fácilmente todos los trabajos y puede costarle mucho tiempo. Con Crontab UI, es muy fácil administrar crontab. Estas son las características clave de Crontab UI.

![flow](https://github.com/alseambusher/crontab-ui/raw/gh-pages/screenshots/flow.gif)

1.  Fácil configuración. Incluso puede importar desde crontab existente.
2.  Agregar, eliminar o pausar trabajos de forma segura. Fácil de mantener cientos de puestos de trabajo.
3.  Haga una copia de seguridad de sus crontabs.
4.  Exporte crontab e impleméntelo en otras máquinas sin mucha molestia.
5.  Compatibilidad con el registro de errores.
6.  Soporte de correo y ganchos.

Leer [éste](https://lifepluslinux.blogspot.com/2015/06/crontab-ui-easy-and-safe-way-to-manage.html) para ver más detalles.

## Arreglo

Obtener lo último `node` De [aquí](https://nodejs.org/en/download/current/). Entonces

    npm install -g crontab-ui
    crontab-ui

Si necesita establecer/utilizar un host alternativo, un puerto o una dirección URL base, puede hacerlo estableciendo una variable de entorno antes de iniciar el proceso:

    HOST=0.0.0.0 PORT=9000 BASE_URL=/alse crontab-ui

De forma predeterminada, db, copias de seguridad y registros se almacenan en el directorio de instalación. Lo es **recomendado** que se invalide mediante la variable ENV `CRON_DB_PATH`. Esto es particularmente útil en caso de que **actualizar** crontab-ui.

    CRON_DB_PATH=/path/to/folder crontab-ui

Si necesita aplicar la autenticación HTTP básica, puede establecer el nombre de usuario y la contraseña a través de variables de entorno:

    BASIC_AUTH_USER=user BASIC_AUTH_PWD=SecretPassword

Además, es posible que tenga que **establecer permisos** para su `node_modules` carpeta. Recomienda [éste](https://docs.npmjs.com/getting-started/fixing-npm-permissions).

Si necesita usar SSL, puede pasar la clave privada y el certificado a través de variables de entorno:

    SSL_CERT=/path/to/ssl_certificate SSL_KEY=/path/to/ssl_private_key

Asegúrese de que el nodo tiene el nodo correcto **Permisos** para leer el certificado y la clave.

Si necesita guardar automáticamente los cambios en crontab directamente:

    crontab-ui --autosave

### Lista de variables de entorno admitidas

*   ANFITRIÓN
*   PUERTO
*   BASE_URL
*   CRON_DB_PATH
*   CRON_PATH
*   BASIC_AUTH_USER, BASIC_AUTH_PWD
*   SSL_CERT, SSL_KEY
*   ENABLE_AUTOSAVE

## Estibador

Puede usar crontab-ui con docker. Puede utilizar las imágenes prediseñadas en el [dockerhub](https://hub.docker.com/r/alseambusher/crontab-ui/tags)

```bash
docker run -d -p 8000:8000 alseambusher/crontab-ui
```

También puede construirlo usted mismo si desea personalizarlo, así:

```bash
git clone https://github.com/alseambusher/crontab-ui.git
cd crontab-ui
docker build -t alseambusher/crontab-ui .
docker run -d -p 8000:8000 alseambusher/crontab-ui
```

Si quieres usarlo con autenticación, puedes pasar `BASIC_AUTH_USER` y `BASIC_AUTH_PWD` como variables ENV

```bash
docker run -e BASIC_AUTH_USER=user -e BASIC_AUTH_PWD=SecretPassword -d -p 8000:8000 alseambusher/crontab-ui 
```

También puede montar una carpeta para almacenar la base de datos y los registros.

```bash
mkdir -p crontabs/logs
docker run --mount type=bind,source="$(pwd)"/crontabs/,target=/crontab-ui/crontabs/ -d -p 8000:8000 alseambusher/crontab-ui
```

Si está buscando modificar el crontab del host, tendría que montar la carpeta crontab de su host en la del contenedor.

```bash
# On Ubuntu, it can look something like this and /etc/cron.d/root is used
docker run -d -p 8000:8000 -v /etc/cron.d:/etc/crontabs alseambusher/crontab-ui
```

## Recursos

*   [Detalles de uso completos](https://lifepluslinux.blogspot.com/2015/06/crontab-ui-easy-and-safe-way-to-manage.html)
*   [Cuestiones](https://github.com/alseambusher/crontab-ui/blob/master/README/issues.md)
*   [Configurar mailing después de la ejecución](https://lifepluslinux.blogspot.com/2017/03/introducing-mailing-in-crontab-ui.html)
*   [Integración con nginx y autenticación](https://github.com/alseambusher/crontab-ui/blob/master/README/nginx.md)
*   [Configuración en Raspberry pi](https://lifepluslinux.blogspot.com/2017/03/setting-up-crontab-ui-on-raspberry-pi.html)

### Agregar, eliminar, pausar y reanudar trabajos.

Una vez configurado Crontab UI le proporciona una interfaz web con la que puede administrar todos los trabajos sin mucha molestia.

![basic](https://github.com/alseambusher/crontab-ui/raw/gh-pages/screenshots/main.png)

### Importar desde crontab existente

Importe desde el archivo crontab existente automáticamente.
![import](https://github.com/alseambusher/crontab-ui/raw/gh-pages/screenshots/import.gif)

### Copia de seguridad y restauración crontab

Mantenga copias de seguridad de su crontab en caso de que se equivoque.
![backup](https://github.com/alseambusher/crontab-ui/raw/gh-pages/screenshots/backup.png)

### Exporte e importe crontab en varias instancias de la interfaz de usuario de Crontab.

Si desea ejecutar los mismos trabajos en varias máquinas, simplemente exporte desde una instancia e importe lo mismo en la otra. ¡Sin SSH, sin copiar y pegar!

![export](https://github.com/alseambusher/crontab-ui/raw/gh-pages/screenshots/import_db.png)

Pero asegúrese de realizar una copia de seguridad antes de importar.

### Compatibilidad con registros de errores independientes para cada trabajo

![logs](https://github.com/alseambusher/crontab-ui/raw/gh-pages/screenshots/log.gif)

### Donar

¿Te gusta el proyecto? [Cómprame un café](https://www.paypal.com/cgi-bin/webscr?cmd=\_s-xclick\&hosted_button_id=U8328Q7VFZMTS)!

### Contribuir

Bifurca la interfaz de usuario de Crontab y contribuye a ella. Se recomiendan las solicitudes de extracción.

### Licencia

[MIT](LICENSE.md)
