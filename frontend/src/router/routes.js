const routes = [
  {
    path: '/dashboard',
    component: () => import('layouts/MainLayout.vue'),
    props: true,
    meta: {
      requiresAuth: true,
      painel: 'Painel de Dados',
    },
    children: [
      {
        path: '/transaction',
        name: 'Transações',
        component: () => import('pages/TransctionPage.vue'),
      },
      {
        path: '/contracts',
        // component: () => import('layouts/ContractLayout.vue'), // (opcional)
        children: [
          {
            path: '',
            name: 'contracts',
            component: () => import('pages/Contracts/ContractsPage.vue'),
          },
          {
            path: 'logic',
            name: 'contracts.logic',
            component: () => import('pages/Contracts/ContractLogicPage.vue'),
          },
          {
            path: 'dividends',
            name: 'contracts.dividends',
            component: () => import('pages/Contracts/DividendLogicPage.vue'),
          },
        ],
      },
      {
        path: '/dataManagement',
        // component: () => import('layouts/ContractLayout.vue'), // (opcional)
        children: [
          {
            path: '',
            name: 'Clientes',
            component: () => import('pages/DataManagement/ClientsPage.vue'),
          },
          {
            path: 'assessores',
            name: 'Assessores',
            component: () => import('pages/DataManagement/AdvisorsPage.vue'),
          },
          {
            path: 'leads',
            name: 'Leads',
            component: () => import('pages/DataManagement/LeadPage.vue'),
          },
        ],
      },
    ],
  },

  {
    path: '/landing-page',
    component: () => import('layouts/MainLayout.vue'),
    props: true,
    meta: {
      requiresAuth: false,
      painel: 'Edição de LP',
    },
    children: [
      {
        path: '/edit-lp',
        name: 'Edição de LP',
        component: () => import('pages/LandingPage/EditLandingPage.vue'),
      },
    ],
  },

  {
    path: '/',
    component: () => import('../views/AuthView.vue'),
    props: true,
    children: [
      {
        path: '',
        name: 'Selected',
        component: () => import('pages/IndexPage.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/auth',
    component: () => import('../views/AuthView.vue'),
    props: true,
    children: [
      {
        path: '',
        name: 'Auth',
        component: () => import('pages/Authentication/AuthPage.vue'),
        props: true,
        query: {
          email: null,
          token: null,
          register: false,
        },
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('pages/Authentication/RegisterPage.vue'),
        props: true,
      },
      {
        path: 'token-validation',
        name: 'TokenValidation',
        component: () => import('pages/Authentication/TokenValidationPage.vue'),
        props: true,
        query: {
          email: null,
        },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
