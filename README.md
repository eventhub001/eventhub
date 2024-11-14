## 3D Event Modeller:

Debido a la creciente complejidad del proyecto, se creará una pequeña documentación para las clases y objetos relacionados al modulo de Modelaje 3D para hacer más fácil el desarrollo.

## Interfaces

### Asset

El objeto que se usa para configurar las dimensiones y posicionamiento del modelo 3D de THREE JS. Su principal función es establecer la estructura estandar para todos los objetos.

##### Parametros
```
    id: number; 
    url: string | undefined;
    x: number;
    y: number;
    z: number;
    content: THREE.Object3D;
    initialOrientation: Orientation;
    orientation: Orientation;
    size: Size;
```
**id:**  un id única del modelo. Tiene como objetivo principal relacionar el id del modelo en la aplicación con el de la base de datos.
**url:** la ubicación donde está ubicado el modelo. Para efectos de la aplicación en este momento, se usa solo la ruta local donde se encuentra el model.
**x:** ubicación x trimensional del modelo. No es la posición dentro de la maya.
**y:** ubicación y trimensional del modelo. No es la posición dentro de la maya.
**y:** ubicación z trimensional del modelo. No es la posición dentro de la maya.
**content**: el modelo 3D de THREE JS, se puede pasar cualquier modelo.
**initialOrientation**: La orientación del parametro *content*. Estos puntos se utilizan para rotar el modelo 3D de THREE JS en la orientación precargada.
**orientation:** Se usa para saber la posición actual del modelo, por defecto es intialOrientation.
**size:** Las dimensiones del parametro *content*. Estos puntos se utilizan para cambiar las dimensiones del modelo 3D de THREE JS de manera personalizada.





