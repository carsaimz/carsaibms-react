import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, Zap, Shield, Smartphone } from 'lucide-react';
import { api } from '../../lib/api';
import { formatMoney } from '../../lib/format';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();
  const { data: products } = useQuery({
    queryKey: ['pub-products-featured'],
    queryFn: () => api.get<{ data: any[] }>('/products?featured=1&per_page=6'),
    staleTime: 300_000,
  });
  const { data: services } = useQuery({
    queryKey: ['pub-services'],
    queryFn: () => api.get<{ data: any[] }>('/services?per_page=3'),
    staleTime: 300_000,
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-blue-500 py-24 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 text-center md:px-6">
          <span className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur">
            Sistema de Gestão Empresarial
          </span>
          <h1 className="text-4xl font-black leading-tight md:text-6xl">
            Gerencie o seu negócio<br className="hidden md:block" />
            <span className="text-blue-200"> com total controlo</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-blue-100">
            Carsai BMS — a plataforma completa para gestão de pedidos, produtos, clientes,
            pagamentos M-Pesa, facturas PDF e muito mais.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/register"
              className="rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-primary-700 shadow-lg hover:bg-blue-50 transition-all">
              Começar gratuitamente →
            </Link>
            <Link to="/products"
              className="rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur hover:bg-white/20 transition-all">
              Ver produtos
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black">Tudo o que precisa</h2>
            <p className="mt-3 text-gray-500 dark:text-slate-400">Numa única plataforma, para qualquer tipo de negócio</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Package,     title: 'Gestão de Stock',     desc: 'Controlo de produtos, stock mínimo e movimentos em tempo real.' },
              { icon: Zap,         title: 'Pagamentos M-Pesa',   desc: 'Aceite pagamentos via M-Pesa, e-Mola, PayPal e Stripe directamente.' },
              { icon: Shield,      title: 'Facturas PDF',        desc: 'Gere facturas e recibos A4 e A6 com assinaturas e NUIT.' },
              { icon: Smartphone,  title: 'PWA Offline',         desc: 'App instalável no telemóvel. Funciona mesmo sem internet.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-gray-100 bg-gray-50 p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/40">
                  <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="mb-2 font-bold">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      {products?.data && products.data.length > 0 && (
        <section className="bg-gray-50 py-20 dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-black">Produtos em Destaque</h2>
                <p className="mt-1 text-gray-500 dark:text-slate-400">Os nossos produtos mais populares</p>
              </div>
              <Link to="/products" className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.data.map((p) => (
                <Link key={p.id} to={`/products/${p.slug}`}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-800">
                  <div className="aspect-video bg-gray-100 dark:bg-slate-700 overflow-hidden">
                    {p.image
                      ? <img src={p.image} alt={p.pname} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="flex h-full items-center justify-center"><Package className="h-12 w-12 text-gray-300" /></div>
                    }
                  </div>
                  <div className="p-4">
                    <p className="font-bold">{p.pname}</p>
                    {p.short_description && <p className="mt-1 text-sm text-gray-500 dark:text-slate-400 line-clamp-2">{p.short_description}</p>}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-lg font-black text-primary-600">{formatMoney(p.price)}</span>
                      <span className={`text-xs font-semibold ${p.stock <= 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {p.stock <= 0 ? 'Esgotado' : 'Disponível'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      {services?.data && services.data.length > 0 && (
        <section className="bg-white py-20 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-black">Serviços</h2>
                <p className="mt-1 text-gray-500 dark:text-slate-400">Serviços profissionais disponíveis</p>
              </div>
              <Link to="/services" className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {services.data.map((s) => (
                <Link key={s.id} to={`/services/${s.slug}`}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-6 transition-all hover:border-primary-200 hover:bg-primary-50 dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="font-bold">{s.sname}</h3>
                  {s.description && <p className="mt-2 text-sm text-gray-500 dark:text-slate-400 line-clamp-2">{s.description}</p>}
                  <p className="mt-4 text-xl font-black text-primary-600">{formatMoney(s.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary-700 py-20 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <h2 className="text-3xl font-black">Pronto para começar?</h2>
          <p className="mt-4 text-primary-200">Crie a sua conta gratuitamente e comece a gerir o seu negócio hoje mesmo.</p>
          <Link to="/register"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-primary-700 shadow-lg hover:bg-blue-50 transition-all">
            Criar conta gratuita →
          </Link>
        </div>
      </section>
    </div>
  );
}
