import { useState } from 'react'
import Icon from '../ui/Icon'
import {
  accountingAccounts,
  accountingBooks,
  accountingEntries,
  bankReconciliation,
  financialStatements,
} from '../../data/accounting'
import type { ModuleLink } from '../../types/dashboard'
import { formatCurrency } from '../../utils/format'

const TABS = [
  { id: 'planes-de-cuentas', label: 'Planes de cuentas' },
  { id: 'asientos', label: 'Asientos contables' },
  { id: 'libros', label: 'Libros contables' },
  { id: 'estados-financieros', label: 'Estados financieros' },
  { id: 'conciliacion', label: 'Conciliación bancaria' },
] as const

type AccountingTabId = (typeof TABS)[number]['id']

const typeStyle: Record<string, string> = {
  Activo: 'bg-navy-900 text-white',
  Pasivo: 'bg-red-50 text-red-600 ring-1 ring-red-200',
  Patrimonio: 'bg-pineapple-50 text-pineapple-700 ring-1 ring-pineapple-200',
  Ingreso: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200',
  Egreso: 'bg-navy-50 text-navy-600 ring-1 ring-navy-100',
}

/** Módulo "Contabilidad" del Contador: 5 secciones con datos simulados. */
export default function AccountingModule({ module }: { module: ModuleLink }) {
  const [tab, setTab] = useState<AccountingTabId>('planes-de-cuentas')

  const totalDebit = accountingEntries.reduce((sum, e) => sum + e.debit, 0)
  const totalCredit = accountingEntries.reduce((sum, e) => sum + e.credit, 0)
  const matchedCount = bankReconciliation.filter((r) => r.matched).length

  return (
    <div className="animate-blurred-fade-in space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-pineapple-300 ring-1 ring-navy-700">
            <Icon name="book" className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-navy-950">{module.label}</h1>
            <p className="mt-1 text-sm text-navy-500">{module.description}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-200">
          <Icon name="check-circle" className="h-3.5 w-3.5" />
          Período contable: Noviembre 2026 · abierto
        </span>
      </header>

      <div
        className="flex flex-wrap gap-1.5 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-navy-100"
        role="tablist"
        aria-label="Secciones contables"
      >
        {TABS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={tab === option.id}
            onClick={() => setTab(option.id)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              tab === option.id
                ? 'bg-navy-900 text-white shadow'
                : 'text-navy-500 hover:bg-navy-50 hover:text-navy-800'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {tab === 'planes-de-cuentas' && (
        <section aria-label="Plan de cuentas" className="animate-fade-in-up rounded-2xl bg-white shadow-sm ring-1 ring-navy-100">
          <header className="flex items-center justify-between gap-3 border-b border-navy-50 p-4 sm:px-6">
            <div>
              <h2 className="text-base font-bold text-navy-900">Plan de cuentas</h2>
              <p className="mt-0.5 text-sm text-navy-500">
                Estructura catalogada de la contabilidad de BAP SRL
              </p>
            </div>
            <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold text-navy-600 ring-1 ring-navy-100">
              {accountingAccounts.length} cuentas
            </span>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-50 bg-navy-50/50 text-[11px] uppercase tracking-wider text-navy-400">
                  <th className="px-4 py-3 font-semibold sm:px-6">Código</th>
                  <th className="px-4 py-3 font-semibold">Cuenta</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 text-right font-semibold">Saldo</th>
                  <th className="px-4 py-3 font-semibold sm:px-6">Estado</th>
                </tr>
              </thead>
              <tbody>
                {accountingAccounts.map((account) => (
                  <tr key={account.code} className="border-b border-navy-50 transition-colors duration-200 last:border-0 hover:bg-pineapple-50/40">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-navy-500 sm:px-6">{account.code}</td>
                    <td className="px-4 py-3 font-medium text-navy-900">{account.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${typeStyle[account.type]}`}>
                        {account.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-navy-800">{formatCurrency(account.balance)}</td>
                    <td className="px-4 py-3 sm:px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          account.status === 'Conciliada'
                            ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                            : 'bg-pineapple-50 text-pineapple-700 ring-1 ring-pineapple-200'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${account.status === 'Conciliada' ? 'bg-emerald-500' : 'bg-pineapple-500'}`} />
                        {account.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'asientos' && (
        <section aria-label="Registros de asientos contables" className="animate-fade-in-up rounded-2xl bg-white shadow-sm ring-1 ring-navy-100">
          <header className="flex items-center justify-between gap-3 border-b border-navy-50 p-4 sm:px-6">
            <div>
              <h2 className="text-base font-bold text-navy-900">Registros de asientos contables</h2>
              <p className="mt-0.5 text-sm text-navy-500">Libro diario · últimos movimientos</p>
            </div>
            <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold text-navy-600 ring-1 ring-navy-100">
              {accountingEntries.length} asientos
            </span>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-50 bg-navy-50/50 text-[11px] uppercase tracking-wider text-navy-400">
                  <th className="px-4 py-3 font-semibold sm:px-6">Asiento</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Referencia</th>
                  <th className="px-4 py-3 font-semibold">Glosa</th>
                  <th className="px-4 py-3 text-right font-semibold">Debe</th>
                  <th className="px-4 py-3 text-right font-semibold">Haber</th>
                  <th className="px-4 py-3 font-semibold sm:px-6">Estado</th>
                </tr>
              </thead>
              <tbody>
                {accountingEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-navy-50 transition-colors duration-200 last:border-0 hover:bg-pineapple-50/40">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-navy-500 sm:px-6">{entry.id}</td>
                    <td className="px-4 py-3 text-xs text-navy-500">{entry.date}</td>
                    <td className="px-4 py-3 font-mono text-xs text-navy-600">{entry.reference}</td>
                    <td className="px-4 py-3 font-medium text-navy-900">{entry.gloss}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-navy-800">
                      {entry.debit ? formatCurrency(entry.debit) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-navy-800">
                      {entry.credit ? formatCurrency(entry.credit) : '—'}
                    </td>
                    <td className="px-4 py-3 sm:px-6">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          entry.status === 'Contabilizado'
                            ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                            : 'bg-pineapple-50 text-pineapple-700 ring-1 ring-pineapple-200'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-navy-100 bg-navy-50/60">
                  <td colSpan={4} className="px-4 py-3 text-sm font-bold text-navy-800 sm:px-6">
                    Totales del asiento
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold tabular-nums text-navy-950">{formatCurrency(totalDebit)}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold tabular-nums text-navy-950">{formatCurrency(totalCredit)}</td>
                  <td className="px-4 py-3 sm:px-6" />
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}

      {tab === 'libros' && (
        <section aria-label="Libros contables" className="animate-fade-in-up">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {accountingBooks.map((book, index) => (
              <article
                key={book.id}
                className="animate-fade-in-up rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:ring-pineapple-200"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-700 ring-1 ring-navy-100">
                    <Icon name="file-text" className="h-5 w-5" />
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      book.status === 'Actualizado'
                        ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                        : 'bg-pineapple-50 text-pineapple-700 ring-1 ring-pineapple-200'
                    }`}
                  >
                    {book.status}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-bold text-navy-950">{book.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-navy-500">{book.detail}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === 'estados-financieros' && (
        <section aria-label="Estados financieros" className="animate-fade-in-up">
          <div className="grid gap-4 sm:grid-cols-2">
            {financialStatements.map((statement, index) => (
              <article
                key={statement.id}
                className="animate-fade-in-up flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:ring-pineapple-200"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-sm font-bold text-pineapple-300">
                  {statement.id}
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-navy-950">{statement.title}</h3>
                  <p className="mt-0.5 text-xs text-navy-500">{statement.period}</p>
                  <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    <Icon name="check-circle" className="h-3 w-3" />
                    Generado automáticamente
                  </span>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-navy-400">
            La exportación en PDF y XLS se activará al conectar el backend real.
          </p>
        </section>
      )}

      {tab === 'conciliacion' && (
        <section aria-label="Conciliación bancaria" className="animate-fade-in-up rounded-2xl bg-white shadow-sm ring-1 ring-navy-100">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-50 p-4 sm:px-6">
            <div>
              <h2 className="text-base font-bold text-navy-900">Conciliación bancaria</h2>
              <p className="mt-0.5 text-sm text-navy-500">
                {matchedCount} de {bankReconciliation.length} movimientos conciliados automáticamente
              </p>
            </div>
            <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold text-navy-600 ring-1 ring-navy-100">
              Últimos 7 días
            </span>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-50 bg-navy-50/50 text-[11px] uppercase tracking-wider text-navy-400">
                  <th className="px-4 py-3 font-semibold sm:px-6">Banco · cuenta</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Referencia</th>
                  <th className="px-4 py-3 text-right font-semibold">Monto</th>
                  <th className="px-4 py-3 font-semibold sm:px-6">Estado</th>
                </tr>
              </thead>
              <tbody>
                {bankReconciliation.map((row) => (
                  <tr key={row.id} className="border-b border-navy-50 transition-colors duration-200 last:border-0 hover:bg-pineapple-50/40">
                    <td className="px-4 py-3 font-medium text-navy-900 sm:px-6">{row.bank}</td>
                    <td className="px-4 py-3 text-xs text-navy-500">{row.date}</td>
                    <td className="px-4 py-3 font-mono text-xs text-navy-600">{row.reference}</td>
                    <td className={`px-4 py-3 text-right font-semibold tabular-nums ${row.amount < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                      {row.amount < 0 ? '−' : '+'}
                      {formatCurrency(Math.abs(row.amount))}
                    </td>
                    <td className="px-4 py-3 sm:px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          row.matched
                            ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                            : 'bg-pineapple-50 text-pineapple-700 ring-1 ring-pineapple-200'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${row.matched ? 'bg-emerald-500' : 'bg-pineapple-500'}`} />
                        {row.matched ? 'Conciliado' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
