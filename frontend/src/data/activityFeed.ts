import type { ActivityItem } from '../types/dashboard'

/** Actividad reciente operativa (datos simulados). */
export const activityItems: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'venta',
    icon: 'trending-up',
    description: 'Nueva venta registrada',
    detail: 'Comprobante #00482 · Asesor de Aduana Vilaseca S.R.L.',
    time: 'hace 12 min',
  },
  {
    id: 'act-2',
    type: 'cliente',
    icon: 'user',
    description: 'Cliente nuevo registrado',
    detail: 'INDUMOTORA BOLIVIA LTDA · Segmento industrial',
    time: 'hace 45 min',
  },
  {
    id: 'act-3',
    type: 'inventario',
    icon: 'package',
    description: 'Ajuste de inventario',
    detail: 'Almacén Central · +40 unidades SKU-1187',
    time: 'hace 1 h',
  },
  {
    id: 'act-4',
    type: 'alerta',
    icon: 'alert-triangle',
    description: 'Stock bajo el mínimo',
    detail: 'SKU-0342 · Quedan 6 unidades en almacén',
    time: 'hace 2 h',
  },
  {
    id: 'act-5',
    type: 'transaccion',
    icon: 'receipt',
    description: 'Transacción conciliada',
    detail: 'Ingreso Bs 48.700 · Banco Mercantil',
    time: 'hace 3 h',
  },
  {
    id: 'act-6',
    type: 'producto',
    icon: 'package',
    description: 'Producto actualizado',
    detail: 'Licencia VisualGas · Ajuste de precio',
    time: 'hace 5 h',
  },
]
