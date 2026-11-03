import type { NotificationItem } from '../types/dashboard'

/** Notificaciones simuladas del sistema. */
export const notificationItems: NotificationItem[] = [
  {
    id: 'not-1',
    title: 'Venta aprobada',
    message: 'Comprobante #00482 aprobado por Bs 28.400.',
    time: 'hace 5 min',
    read: false,
    category: 'venta',
    icon: 'check-circle',
  },
  {
    id: 'not-2',
    title: 'Stock bajo mínimo',
    message: 'SKU-0342 llegó a 6 unidades en Almacén Central.',
    time: 'hace 32 min',
    read: false,
    category: 'alerta',
    icon: 'alert-triangle',
  },
  {
    id: 'not-3',
    title: 'Cierre contable',
    message: 'El cierre de octubre está listo para revisión.',
    time: 'hace 1 h',
    read: false,
    category: 'sistema',
    icon: 'file-text',
  },
  {
    id: 'not-4',
    title: 'Cliente nuevo',
    message: 'INDUMOTORA BOLIVIA LTDA se registró en la plataforma.',
    time: 'hace 45 min',
    read: true,
    category: 'cliente',
    icon: 'user',
  },
  {
    id: 'not-5',
    title: 'Respaldo completado',
    message: 'Backup diario finalizado sin errores.',
    time: 'hace 6 h',
    read: true,
    category: 'sistema',
    icon: 'shield',
  },
]
