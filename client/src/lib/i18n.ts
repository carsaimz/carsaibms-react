import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const pt = {
  nav_home: 'Início', nav_products: 'Produtos', nav_services: 'Serviços',
  nav_blog: 'Blog', nav_contact: 'Contacto', nav_api: 'API',
  nav_login: 'Entrar', nav_register: 'Criar conta', nav_portal: 'Portal do Cliente', nav_admin: 'Painel Admin',

  auth_login_title: 'Entrar na conta', auth_register_title: 'Criar conta',
  auth_email: 'Email', auth_password: 'Senha', auth_name: 'Nome completo',
  auth_phone: 'Telemóvel (opcional)', auth_no_account: 'Não tem conta?',
  auth_have_account: 'Já tem conta?', auth_demo: 'Demo: cliente@carsai.co.mz / password',
  auth_google: 'Continuar com Google', auth_logout: 'Terminar sessão',
  auth_error: 'Erro ao iniciar sessão.', auth_invalid: 'Credenciais inválidas.',
  auth_pwd_min: 'Mínimo 6 caracteres', auth_register_btn: 'Criar conta', auth_login_btn: 'Entrar',

  dash_title: 'Painel', dash_subtitle: 'Resumo da sua conta',
  dash_orders: 'Total de pedidos', dash_due: 'Valor em dívida',
  dash_tickets: 'Tickets abertos', dash_notifs: 'Notificações',
  dash_recent: 'Pedidos Recentes', dash_view_all: 'Ver todos', dash_no_orders: 'Ainda não tem pedidos',

  orders_title: 'Os Meus Pedidos', orders_subtitle: 'Histórico completo de pedidos',
  orders_new: 'Novo Pedido', orders_all: 'Todos', orders_empty: 'Nenhum pedido encontrado',
  orders_number: 'Pedido', orders_customer: 'Cliente', orders_status: 'Estado',
  orders_total: 'Total', orders_date: 'Data', orders_items: 'Itens', orders_notes: 'Notas',
  orders_pay_now: 'Pagar Agora', orders_pdf: 'Factura PDF', orders_address: 'Morada de entrega',
  orders_payments: 'Pagamentos', orders_search: 'Número do pedido ou cliente...',
  orders_add_product: 'Adicionar Produtos', orders_search_product: 'Pesquisar produto pelo nome ou SKU...',
  orders_details: 'Detalhes do Pedido', orders_payment_method: 'Método de Pagamento',
  orders_confirm: 'Confirmar Pedido', orders_subtotal: 'Subtotal', orders_discount: 'Desconto',
  orders_tax: 'IVA', orders_shipping: 'Envio',

  status_pending: 'Pendente', status_confirmed: 'Confirmado', status_processing: 'Em processamento',
  status_shipped: 'Enviado', status_delivered: 'Entregue', status_cancelled: 'Cancelado',
  status_refunded: 'Reembolsado', status_unpaid: 'Não pago', status_paid: 'Pago',
  status_failed: 'Falhou', status_open: 'Aberto', status_resolved: 'Resolvido', status_closed: 'Fechado',
  status_low: 'Baixa', status_medium: 'Média', status_high: 'Alta',

  invoices_title: 'Facturas', invoices_subtitle: 'Descarregue as facturas dos seus pedidos em PDF.',
  invoices_pdf: 'Factura PDF', invoices_offline: '💡 As facturas são geradas no seu browser — disponíveis offline.',
  invoices_empty: 'Sem facturas',

  tickets_title: 'Suporte', tickets_subtitle: 'Os seus tickets de suporte', tickets_new: 'Novo Ticket',
  tickets_subject: 'Assunto', tickets_message: 'Mensagem', tickets_priority: 'Prioridade',
  tickets_send: 'Enviar', tickets_empty: 'Sem tickets de suporte', tickets_empty_desc: 'Crie um ticket se precisar de ajuda.',
  tickets_reply: 'Responder', tickets_reply_ph: 'Escreva a sua mensagem...',
  tickets_closed: 'Ticket fechado', tickets_offline: 'Está offline — o ticket será enviado ao reconectar.',

  profile_title: 'Perfil', profile_subtitle: 'Gerir os seus dados pessoais', profile_personal: 'Dados Pessoais',
  profile_company: 'Empresa', profile_nuit: 'NUIT', profile_address: 'Morada', profile_city: 'Cidade',
  profile_save: 'Guardar', profile_saved: 'Perfil actualizado com sucesso.', profile_pwd: 'Alterar Senha',
  profile_current_pwd: 'Senha actual', profile_new_pwd: 'Nova senha', profile_change: 'Alterar Senha',
  profile_pwd_changed: 'Senha alterada com sucesso.', profile_pwd_error: 'Senha actual incorrecta.',

  payments_title: 'Os Meus Pagamentos', payments_subtitle: 'Histórico de todos os seus pagamentos',
  payments_empty: 'Sem pagamentos', payments_empty_desc: 'Os seus pagamentos aparecerão aqui.',
  payments_method: 'Método', payments_ref: 'Referência', payments_amount: 'Valor', payments_status: 'Estado',

  notifs_title: 'Notificações', notifs_unread: '{{n}} não lidas', notifs_all_read: 'Todas lidas',
  notifs_mark_all: 'Marcar todas como lidas', notifs_empty: 'Sem notificações',
  notifs_empty_desc: 'As suas notificações aparecerão aqui.',

  services_title: 'Serviços Disponíveis', services_subtitle: 'Solicite os nossos serviços profissionais',
  services_empty: 'Sem serviços disponíveis', services_request: 'Solicitar', services_quote: 'Pedir Orçamento',
  services_duration: 'min', services_list_title: 'Serviços', services_list_sub: 'Serviços profissionais disponíveis para o seu negócio',
  services_from: 'A partir de', services_request_btn: 'Solicitar serviço',

  quote_title: 'Pedir Orçamento', quote_subtitle: 'Solicite um orçamento personalizado para produtos ou serviços.',
  quote_subject: 'Assunto / Referência', quote_items: 'Itens / Produtos / Serviços',
  quote_items_ph: 'Descreva o que precisa com quantidades se possível...',
  quote_notes: 'Notas adicionais (opcional)', quote_notes_ph: 'Prazo de entrega, condições especiais...',
  quote_send: 'Enviar Pedido de Orçamento', quote_sent: 'Pedido de Orçamento Enviado!',
  quote_sent_desc: 'A nossa equipa entrará em contacto em breve com um orçamento personalizado.', quote_new: 'Novo Pedido',

  pos_search: 'Pesquisar produto, SKU ou código de barras...', pos_cart: 'Carrinho',
  pos_cart_empty: 'Toque num produto para adicionar', pos_clear: 'Limpar', pos_pay: 'Cobrar',
  pos_method: 'Método de pagamento', pos_cash: 'Numerário', pos_paid: 'Valor entregue', pos_change: 'Troco',
  pos_confirm: 'Confirmar Venda', pos_done: 'Venda Concluída!', pos_offline_warning: 'Offline — será sincronizado ao reconectar.',
  pos_new: 'Nova Venda', pos_print: 'Imprimir Recibo', pos_offline: '📵 Offline — venda será guardada localmente',
  pos_scan: 'Scan', pos_code: 'Código', pos_subtotal: 'Subtotal', pos_discount: 'Desconto', pos_total: 'TOTAL', pos_sold_out: 'Esgotado',

  home_hero: 'Gerencie o seu negócio com total controlo',
  home_hero_sub: 'Carsai BMS — a plataforma completa para gestão de pedidos, produtos, clientes, pagamentos e muito mais.',
  home_start: 'Começar gratuitamente →', home_products: 'Ver produtos', home_features: 'Tudo o que precisa',
  home_features_sub: 'Numa única plataforma, para qualquer tipo de negócio', home_featured: 'Produtos em Destaque',
  home_featured_sub: 'Os nossos produtos mais populares', home_services: 'Serviços',
  home_services_sub: 'Serviços profissionais disponíveis', home_cta: 'Pronto para começar?',
  home_cta_sub: 'Crie a sua conta gratuitamente e comece a gerir o seu negócio hoje mesmo.',
  home_cta_btn: 'Criar conta gratuita →', home_available: 'Disponível', home_sold_out: 'Esgotado',

  products_title: 'Catálogo de Produtos', products_search_ph: 'Pesquisar produtos...',
  products_search_btn: 'Pesquisar', products_empty: 'Nenhum produto encontrado',

  blog_title: 'Blog', blog_subtitle: 'Notícias, tutoriais e novidades do Carsai BMS',
  blog_empty: 'Sem artigos publicados', blog_empty_desc: 'Volte em breve para novidades.', blog_reads: 'leituras',

  contact_title: 'Contacte-nos', contact_subtitle: 'Estamos disponíveis para ajudar o seu negócio',
  contact_name: 'Nome completo', contact_email: 'Email', contact_phone: 'Telefone (opcional)',
  contact_subject: 'Assunto', contact_message: 'Mensagem', contact_send: 'Enviar Mensagem',
  contact_sent: 'Mensagem enviada!', contact_sent_sub: 'Entraremos em contacto em breve.',
  contact_another: 'Enviar outra mensagem', contact_hours: 'Horário de Atendimento',
  contact_weekdays: 'Segunda a Sexta: 8h00 – 17h00', contact_saturday: 'Sábado: 8h00 – 12h00',

  not_found_title: 'Página não encontrada', not_found_desc: 'A página que procura não existe ou foi removida.',
  not_found_btn: '← Ir para o início',

  maintenance_title: 'Em Manutenção', maintenance_desc: 'O sistema está temporariamente em manutenção. Voltaremos em breve.',
  maintenance_eta: 'Estimativa: alguns minutos',

  staff_tasks: 'Tarefas', staff_pending: '{{n}} tarefa(s) pendente(s)', staff_new_task: 'Nova Tarefa',
  staff_title_field: 'Título', staff_priority: 'Prioridade', staff_deadline: 'Prazo', staff_all: 'Todas',
  staff_pending_filter: 'Pendentes', staff_done_filter: 'Concluídas', staff_no_tasks: 'Sem tarefas',
  staff_priority_low: 'Baixa', staff_priority_medium: 'Média', staff_priority_high: 'Alta',
  staff_open_tickets: 'Tickets Abertos', staff_no_tickets: 'Sem tickets abertos', staff_select_ticket: 'Seleccione um ticket',
  staff_reply_ph: 'Escrever resposta...', staff_messages_title: 'Mensagens Internas',
  staff_messages_soon: 'Sistema de mensagens internas entre staff. Planeado para a próxima versão.',

  footer_tagline: 'Sistema de Gestão Empresarial para o mercado moçambicano.', footer_platform: 'Plataforma',
  footer_account: 'Conta', footer_dev: 'Developers', footer_rights: '© {{year}} Carsai BMS',

  save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar', edit: 'Editar', create: 'Criar',
  search: 'Pesquisar', loading: 'A carregar...', error: 'Erro', success: 'Sucesso', back: '← Voltar',
  view_all: 'Ver todos →', or: 'ou', yes: 'Sim', no: 'Não', close: 'Fechar', submit: 'Submeter',
  send: 'Enviar', reply: 'Responder', confirm: 'Confirmar', required: 'obrigatório',
  offline: 'Offline', online: 'Online', offline_banner: 'Sem ligação — a trabalhar em modo offline',
  reconnect: 'Reconectar', no_results: 'Sem resultados', available: 'Disponível', sold_out: 'Esgotado',
  active: 'Activo', inactive: 'Inactivo', published: 'Publicado', draft: 'Rascunho', page_of: 'de',
};

const en: typeof pt = {
  nav_home: 'Home', nav_products: 'Products', nav_services: 'Services',
  nav_blog: 'Blog', nav_contact: 'Contact', nav_api: 'API',
  nav_login: 'Log in', nav_register: 'Sign up', nav_portal: 'Customer Portal', nav_admin: 'Admin Panel',

  auth_login_title: 'Sign in to your account', auth_register_title: 'Create account',
  auth_email: 'Email', auth_password: 'Password', auth_name: 'Full name',
  auth_phone: 'Phone (optional)', auth_no_account: "Don't have an account?",
  auth_have_account: 'Already have an account?', auth_demo: 'Demo: cliente@carsai.co.mz / password',
  auth_google: 'Continue with Google', auth_logout: 'Sign out',
  auth_error: 'Login error.', auth_invalid: 'Invalid credentials.',
  auth_pwd_min: 'Minimum 6 characters', auth_register_btn: 'Create account', auth_login_btn: 'Sign in',

  dash_title: 'Dashboard', dash_subtitle: 'Your account overview',
  dash_orders: 'Total orders', dash_due: 'Amount due', dash_tickets: 'Open tickets', dash_notifs: 'Notifications',
  dash_recent: 'Recent Orders', dash_view_all: 'View all', dash_no_orders: 'No orders yet',

  orders_title: 'My Orders', orders_subtitle: 'Complete order history', orders_new: 'New Order',
  orders_all: 'All', orders_empty: 'No orders found', orders_number: 'Order', orders_customer: 'Customer',
  orders_status: 'Status', orders_total: 'Total', orders_date: 'Date', orders_items: 'Items', orders_notes: 'Notes',
  orders_pay_now: 'Pay Now', orders_pdf: 'Invoice PDF', orders_address: 'Delivery address',
  orders_payments: 'Payments', orders_search: 'Order number or customer...',
  orders_add_product: 'Add Products', orders_search_product: 'Search product by name or SKU...',
  orders_details: 'Order Details', orders_payment_method: 'Payment Method', orders_confirm: 'Confirm Order',
  orders_subtotal: 'Subtotal', orders_discount: 'Discount', orders_tax: 'Tax', orders_shipping: 'Shipping',

  status_pending: 'Pending', status_confirmed: 'Confirmed', status_processing: 'Processing',
  status_shipped: 'Shipped', status_delivered: 'Delivered', status_cancelled: 'Cancelled',
  status_refunded: 'Refunded', status_unpaid: 'Unpaid', status_paid: 'Paid', status_failed: 'Failed',
  status_open: 'Open', status_resolved: 'Resolved', status_closed: 'Closed',
  status_low: 'Low', status_medium: 'Medium', status_high: 'High',

  invoices_title: 'Invoices', invoices_subtitle: 'Download your invoices as PDF.',
  invoices_pdf: 'Invoice PDF', invoices_offline: '💡 Invoices are generated in your browser — available offline.',
  invoices_empty: 'No invoices',

  tickets_title: 'Support', tickets_subtitle: 'Your support tickets', tickets_new: 'New Ticket',
  tickets_subject: 'Subject', tickets_message: 'Message', tickets_priority: 'Priority', tickets_send: 'Send',
  tickets_empty: 'No support tickets', tickets_empty_desc: 'Create a ticket if you need help.',
  tickets_reply: 'Reply', tickets_reply_ph: 'Write your message...', tickets_closed: 'Ticket closed',
  tickets_offline: 'You are offline — ticket will be sent when reconnected.',

  profile_title: 'Profile', profile_subtitle: 'Manage your personal details', profile_personal: 'Personal Details',
  profile_company: 'Company', profile_nuit: 'Tax ID', profile_address: 'Address', profile_city: 'City',
  profile_save: 'Save', profile_saved: 'Profile updated.', profile_pwd: 'Change Password',
  profile_current_pwd: 'Current password', profile_new_pwd: 'New password', profile_change: 'Change Password',
  profile_pwd_changed: 'Password changed successfully.', profile_pwd_error: 'Current password is incorrect.',

  payments_title: 'My Payments', payments_subtitle: 'All your payment history',
  payments_empty: 'No payments', payments_empty_desc: 'Your payments will appear here.',
  payments_method: 'Method', payments_ref: 'Reference', payments_amount: 'Amount', payments_status: 'Status',

  notifs_title: 'Notifications', notifs_unread: '{{n}} unread', notifs_all_read: 'All read',
  notifs_mark_all: 'Mark all as read', notifs_empty: 'No notifications',
  notifs_empty_desc: 'Your notifications will appear here.',

  services_title: 'Available Services', services_subtitle: 'Request our professional services',
  services_empty: 'No services available', services_request: 'Request', services_quote: 'Request Quote',
  services_duration: 'min', services_list_title: 'Services', services_list_sub: 'Professional services available for your business',
  services_from: 'From', services_request_btn: 'Request service',

  quote_title: 'Request a Quote', quote_subtitle: 'Request a personalised quote for products or services.',
  quote_subject: 'Subject / Reference', quote_items: 'Products / Services and Quantities',
  quote_items_ph: 'Describe what you need with quantities if possible...',
  quote_notes: 'Additional notes (optional)', quote_notes_ph: 'Delivery deadline, special conditions...',
  quote_send: 'Send Quote Request', quote_sent: 'Quote Request Sent!',
  quote_sent_desc: 'Our team will be in touch shortly with a personalised quote.', quote_new: 'New Request',

  pos_search: 'Search product, SKU or barcode...', pos_cart: 'Cart', pos_cart_empty: 'Tap a product to add',
  pos_clear: 'Clear', pos_pay: 'Charge', pos_method: 'Payment method', pos_cash: 'Cash',
  pos_paid: 'Amount tendered', pos_change: 'Change', pos_confirm: 'Confirm Sale', pos_done: 'Sale Complete!',
  pos_offline_warning: 'Offline — will sync when reconnected.', pos_new: 'New Sale', pos_print: 'Print Receipt',
  pos_offline: '📵 Offline — sale will be saved locally', pos_scan: 'Scan', pos_code: 'Code',
  pos_subtotal: 'Subtotal', pos_discount: 'Discount', pos_total: 'TOTAL', pos_sold_out: 'Out of stock',

  home_hero: 'Manage your business with full control',
  home_hero_sub: 'Carsai BMS — orders, products, customers, payments and more.',
  home_start: 'Get started for free →', home_products: 'View products', home_features: 'Everything you need',
  home_features_sub: 'In one platform, for any type of business', home_featured: 'Featured Products',
  home_featured_sub: 'Our most popular products', home_services: 'Services',
  home_services_sub: 'Professional services available', home_cta: 'Ready to get started?',
  home_cta_sub: 'Create your account for free and start managing your business today.',
  home_cta_btn: 'Create free account →', home_available: 'Available', home_sold_out: 'Out of stock',

  products_title: 'Product Catalogue', products_search_ph: 'Search products...',
  products_search_btn: 'Search', products_empty: 'No products found',

  blog_title: 'Blog', blog_subtitle: 'News, tutorials and updates from Carsai BMS',
  blog_empty: 'No articles published', blog_empty_desc: 'Check back soon for updates.', blog_reads: 'reads',

  contact_title: 'Contact Us', contact_subtitle: 'We are available to help your business',
  contact_name: 'Full name', contact_email: 'Email', contact_phone: 'Phone (optional)',
  contact_subject: 'Subject', contact_message: 'Message', contact_send: 'Send Message',
  contact_sent: 'Message sent!', contact_sent_sub: 'We will get back to you shortly.',
  contact_another: 'Send another message', contact_hours: 'Opening Hours',
  contact_weekdays: 'Monday to Friday: 8am – 5pm', contact_saturday: 'Saturday: 8am – 12pm',

  not_found_title: 'Page not found', not_found_desc: 'The page you are looking for does not exist or has been removed.',
  not_found_btn: '← Go to home',

  maintenance_title: 'Under Maintenance', maintenance_desc: 'The system is temporarily under maintenance. We will be back shortly.',
  maintenance_eta: 'Estimated time: a few minutes',

  staff_tasks: 'Tasks', staff_pending: '{{n}} pending task(s)', staff_new_task: 'New Task',
  staff_title_field: 'Title', staff_priority: 'Priority', staff_deadline: 'Deadline', staff_all: 'All',
  staff_pending_filter: 'Pending', staff_done_filter: 'Done', staff_no_tasks: 'No tasks',
  staff_priority_low: 'Low', staff_priority_medium: 'Medium', staff_priority_high: 'High',
  staff_open_tickets: 'Open Tickets', staff_no_tickets: 'No open tickets', staff_select_ticket: 'Select a ticket',
  staff_reply_ph: 'Write a reply...', staff_messages_title: 'Internal Messages',
  staff_messages_soon: 'Internal messaging between staff. Planned for the next version.',

  footer_tagline: 'Business Management System for the Mozambican market.', footer_platform: 'Platform',
  footer_account: 'Account', footer_dev: 'Developers', footer_rights: '© {{year}} Carsai BMS',

  save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', create: 'Create',
  search: 'Search', loading: 'Loading...', error: 'Error', success: 'Success', back: '← Back',
  view_all: 'View all →', or: 'or', yes: 'Yes', no: 'No', close: 'Close', submit: 'Submit',
  send: 'Send', reply: 'Reply', confirm: 'Confirm', required: 'required',
  offline: 'Offline', online: 'Online', offline_banner: 'No connection — working in offline mode',
  reconnect: 'Reconnect', no_results: 'No results', available: 'Available', sold_out: 'Out of stock',
  active: 'Active', inactive: 'Inactive', published: 'Published', draft: 'Draft', page_of: 'of',
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'pt',
    supportedLngs: ['pt', 'en'],
    defaultNS: 'translation',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'carsai-lang',
    },
    interpolation: { escapeValue: false },
    resources: {
      pt: { translation: pt },
      en: { translation: en },
    },
  });

export default i18n;
