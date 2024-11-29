# Película Service

Este servicio permite gestionar las películas mediante un CRUD (Crear, Obtener, Modificar y Eliminar) utilizando AWS Lambda y DynamoDB.

---

## **crearPelicula.js**

### Descripción
Este endpoint crea una nueva película en la base de datos.

### Método HTTP
**POST**

### URL
```
/pelicula
```

### Headers
```json
{
  "Authorization": "Bearer <TOKEN_VALIDO>"
}
```

### Body (JSON)
```json
{
  "tenant_id": "12345",
  "titulo": "Inception",
  "genero": "Ciencia Ficción",
  "duracion": 148
}
```

---

## **eliminarPelicula.js**

### Descripción
Este endpoint elimina una película específica de la base de datos.

### Método HTTP
**DELETE**

### URL
```
/pelicula
```

### Headers
```json
{
  "Authorization": "Bearer <TOKEN_VALIDO>"
}
```

### Body (JSON)
```json
{
  "tenant_id": "12345",
  "titulo": "Inception"
}
```

---

## **modificarPelicula.js**

### Descripción
Este endpoint actualiza los datos de una película existente en la base de datos.

### Método HTTP
**PUT**

### URL
```
/pelicula/{tenant_id}/{titulo}
```

### Headers
```json
{
  "Authorization": "Bearer <TOKEN_VALIDO>"
}
```

### Body (JSON)
```json
{
  "genero": "Thriller",
  "duracion": 152
}
```

---

## **obtenerPeliculaById.js**

### Descripción
Este endpoint obtiene una película específica de la base de datos.

### Método HTTP
**GET**

### URL
```
/pelicula/{tenant_id}/{titulo}
```

### Headers
```json
{
  "Authorization": "Bearer <TOKEN_VALIDO>"
}
```

---

## **obtenerPeliculas.js**

### Descripción
Este endpoint obtiene todas las películas almacenadas en la base de datos.

### Método HTTP
**GET**

### URL
```
/peliculas
```

### Headers
```json
{
  "Authorization": "Bearer <TOKEN_VALIDO>"
}
```
