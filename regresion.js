const config = {
  peso: 2.05,
  bias: 0.58,
  tasaDeAprendizaje: 0.05,
  iteracion: 0,
  sentido: -1,
};
const conjunto_de_datos = [
  [3.5, 18],
  [3.69, 15],
  [3.44, 18],
  [3.43, 16],
  [4.34, 15],
  [4.42, 14],
  [2.37, 24],
];

const datasetPoints = conjunto_de_datos.map((point) => ({
  x: point[0],
  y: point[1],
}));
const ctx = document.getElementById("regressionChart").getContext("2d");

const regressionChart = new Chart(ctx, {
  type: "scatter",
  data: {
    datasets: [
      {
        label: "Datos reales",
        data: datasetPoints,
        backgroundColor: "rgba(75, 192, 192, 1)",
        pointRadius: 8,
      },
      {
        label: "Línea de regresión",
        data: [],
        type: "line",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
        showLine: true,
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: "Variable X",
        },
        min: 2,
        max: 5,
      },
      y: {
        title: {
          display: true,
          text: "Variable Y",
        },
        min: 10,
        max: 25,
      },
    },
  },
});

function predecir(x, peso, bias) {
  return x * peso + bias;
}

function perdidaCuadratica(predicciones, datos) {
  const valoresReales = datos.map((dato) => dato[1]);
  const diferencias = predicciones.map((pred, i) => pred - valoresReales[i]);
  const cuadrados = diferencias.map((d) => d * d);
  return cuadrados.reduce((sum, val) => sum + val, 0) / cuadrados.length;
}

function calcularGradientes(predicciones, datos) {
  const valoresy = datos.map((dato) => dato[1]);
  const valoresx = datos.map((dato) => dato[0]);
  const diferencias = predicciones.map((pred, i) => pred - valoresy[i]);

  const derivadaPeso =
    diferencias
      .map((d, i) => d * (2 * valoresx[i]))
      .reduce((sum, val) => sum + val, 0) / diferencias.length;

  const derivadaBias =
    diferencias.map((d) => d * 2).reduce((sum, val) => sum + val, 0) /
    diferencias.length;

  return { derivadaPeso, derivadaBias };
}

function nuevoPeso(peso, derivada, tasaDeAprendizaje, sentido) {
  return peso + derivada * tasaDeAprendizaje * sentido;
}

function actualizarLineaRegresion(peso, bias) {
  // Calcular dos puntos para la línea (x mínimo y x máximo)
  const xMin = 2;
  const xMax = 5;
  const yMin = predecir(xMin, peso, bias);
  const yMax = predecir(xMax, peso, bias);

  regressionChart.data.datasets[1].data = [
    { x: xMin, y: yMin },
    { x: xMax, y: yMax },
  ];

  regressionChart.update();
}

function realizarIteracion() {
  config.iteracion++;
  

  // 1. Generar predicciones
  const predicciones = conjunto_de_datos.map((dato) =>
    predecir(dato[0], config.peso, config.bias)
  );

  // 2. Calcular error
  const error = perdidaCuadratica(predicciones, conjunto_de_datos);

  // 3. Calcular gradientes
  const { derivadaPeso, derivadaBias } = calcularGradientes(
    predicciones,
    conjunto_de_datos
  );

  // 4. Actualizar parámetros
  config.peso = nuevoPeso(
    config.peso,
    derivadaPeso,
    config.tasaDeAprendizaje,
    config.sentido
  );
  config.bias = nuevoPeso(
    config.bias,
    derivadaBias,
    config.tasaDeAprendizaje,
    config.sentido
  );

  // 5. Actualizar la interfaz
  document.getElementById("iteration").textContent = config.iteracion;
  document.getElementById("weight").textContent = config.peso.toFixed(4);
  document.getElementById("bias").textContent = config.bias.toFixed(4);
  document.getElementById("error").textContent = error.toFixed(4);

  // 6. Actualizar el gráfico
  actualizarLineaRegresion(config.peso, config.bias);

    return error; 

}

function realizar100iteraciones() {
  for (let i = 0; i < 100; i++) {
    realizarIteracion();
  }
}

function iteracionFinal() {
  let errorAnterior = Infinity;
  let errorActual = realizarIteracion();
  let tolerancia = 1e-6;
  let maxIteraciones = 10000;
  let iteraciones = 1;

  while (Math.abs(errorAnterior - errorActual) > tolerancia && iteraciones < maxIteraciones) {
    errorAnterior = errorActual;
    errorActual = realizarIteracion();
    iteraciones++;
  }

  console.log("Iteraciones totales:", iteraciones);
  console.log("Error final:", errorActual.toFixed(6));
}


// Inicializar el gráfico con los valores iniciales
actualizarLineaRegresion(config.peso, config.bias);
document.getElementById("weight").textContent = config.peso.toFixed(4);
document.getElementById("bias").textContent = config.bias.toFixed(4);

