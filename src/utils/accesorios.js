// Accesorios disponibles por categoría de activo.
// esLinea: true activa los inputs especiales de número y plan.
const MAPA = {
  Celular: [
    { key: "estuche",   label: "Estuche" },
    { key: "bateria",   label: "Batería" },
    { key: "cable",     label: "Cable" },
    { key: "temperado", label: "Templado" },
    { key: "cargador",  label: "Cargador" },
    { key: "linea",     label: "Línea", esLinea: true },
  ],
  Tablet: [
    { key: "estuche",   label: "Estuche" },
    { key: "bateria",   label: "Batería" },
    { key: "cable",     label: "Cable" },
    { key: "temperado", label: "Templado" },
    { key: "cargador",  label: "Cargador" },
    { key: "linea",     label: "Línea", esLinea: true },
  ],
  Laptop: [
    { key: "cargador", label: "Cargador" },
    { key: "cable",    label: "Cable" },
    { key: "mouse",    label: "Mouse" },
    { key: "teclado",  label: "Teclado" },
    { key: "maletin",  label: "Maletín" },
    { key: "mochila",  label: "Mochila" },
  ],
  PC: [
    { key: "mouse",        label: "Mouse" },
    { key: "teclado",      label: "Teclado" },
    { key: "cableHDMI",    label: "Cable HDMI" },
    { key: "cablePoder",   label: "Cable de poder" },
  ],
  Monitor: [
    { key: "cableHDMI",         label: "Cable HDMI" },
    { key: "cableDisplayPort",  label: "Cable DisplayPort" },
    { key: "cablePoder",        label: "Cable de poder" },
  ],
  Taladro: [
    { key: "brocas",            label: "Brocas" },
    { key: "maletin",           label: "Maletín" },
    { key: "bateria",           label: "Batería" },
    { key: "cableAlimentacion", label: "Cable de alimentación" },
  ],
  Rotomartillo: [
    { key: "brocas",   label: "Brocas" },
    { key: "cinceles", label: "Cinceles" },
    { key: "maletin",  label: "Maletín" },
    { key: "cargador", label: "Cargador" },
    { key: "bateria",  label: "Batería" },
  ],
  "Herramienta eléctrica": [
    { key: "maletin",  label: "Maletín" },
    { key: "cargador", label: "Cargador" },
    { key: "bateria",  label: "Batería" },
  ],
}

const DEFECTO = [
  { key: "maletin",  label: "Maletín" },
  { key: "cargador", label: "Cargador" },
  { key: "otros",    label: "Otros" },
]

export function getAccesorios(categoria) {
  return MAPA[categoria] ?? DEFECTO
}

export function getAccesoriosInicial(categoria) {
  return Object.fromEntries(getAccesorios(categoria).map(a => [a.key, false]))
}
