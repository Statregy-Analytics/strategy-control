// If VITE_USE_FAKES is 'false' we will delegate to the API composable
import { debugLog } from 'src/utils/debugLog'

let useApi = false
try {
  useApi = import.meta && import.meta.env && import.meta.env.VITE_USE_FAKES === 'false'
} catch {
  useApi = false
}

let apiAdapterLoaded = null
if (useApi) {
  try {
    const mod = await import('src/composables/Api/useLeadsApi')
    apiAdapterLoaded = mod.default()
  } catch (e) {
    console.error('useLeads: failed to import api adapter at module load', e && e.message)
    apiAdapterLoaded = null
  }
}

// If we were able to load the API adapter at module evaluation time, return it immediately
// leave a single export at module end; inside the function we'll return the API adapter
// if it was successfully loaded at module evaluation time (keeps same behavior as useCliente.js)
// Debug: expose which adapter was chosen (only when VITE_DEBUG=true)
debugLog('useLeads', 'adapter=', useApi ? 'api' : 'fake', 'apiAdapterLoaded=', !!apiAdapterLoaded)
export default function useLeads() {
  if (apiAdapterLoaded) {
    const apiAdapter = apiAdapterLoaded
    // apiAdapter.rows is a ref([]) in Api adapter. Components expect fakeRowLeads to be a plain array.
    const rowsArray = apiAdapter.rows && apiAdapter.rows.value ? apiAdapter.rows.value : []
    return {
      columnLeads: apiAdapter.columnLeads || [],
      rowLeads: rowsArray,
      getClientLead: apiAdapter.getClientLead || (() => null),
      getLeadOptions: apiAdapter.getLeadOptions || (() => []),
      fetchLeads: apiAdapter.fetchLeads || (() => Promise.resolve({ rows: [] })),
    }
  }
  const columnLeads = [
    {
      name: 'cliente',
      required: true,
      label: 'Cliente',
      align: 'left',
      field: 'cliente',
      sortable: true,
    },
    {
      name: 'cpf',
      required: true,
      label: 'CPF',
      align: 'left',
      field: 'cpf',
      sortable: true,
    },
    {
      name: 'phone',
      required: true,
      label: 'Telefono',
      align: 'left',
      field: 'phone',
      sortable: true,
    },
    {
      name: 'profission',
      required: true,
      label: 'Profissão',
      align: 'left',
      field: 'profission',
      sortable: true,
    },
    {
      name: 'situacao_rf',
      required: true,
      label: 'Situação na RF',
      align: 'left',
      field: 'situacao_rf',
      sortable: true,
    },
    {
      name: 'estagio_lead',
      required: true,
      label: 'Estágio do Lead',
      align: 'left',
      field: 'estagio_lead',
      sortable: true,
    },
    {
      name: 'actions',
      label: '',
      field: 'actions',
      headerStyle: 'width: 10px; text-align: end',
    },
  ]

  const rowLeads = [
    {
      id: 1,
      cliente: {
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        name: 'João Silva',
        email: 'joao.silva@email.com',
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '123456789',
          cpf_cnpj: '123.456.789-00',
          name: 'Banco Exemplo',
          agency: '1234',
          account: '56789-0',
          type: 'Conta Corrente',
          status: 'Ativo',
        },
      ],
      cpf: '123.456.789-00',
      phone: '(11) 91234-5678',
      profission: 'Engenheiro',
      situacao_rf: 'Regular',
      estagio_lead: 'Novo',
      address: [
        {
          logradouro: 'Avenida das Startups, 000 - Parque Residencial do Empreededorismo',
          city: 'São Paulo/SP',
          zipcode: '12327-697',
        },
      ],
      partner: [
        {
          razao_social: 'Rzão Social Empresa LTDA',
          cnpj: '00.000.000/0001-00',
          position: 'Sócio Administrador',
          member_since: '04/03/2025',
        },
      ],
      related_person: [
        {
          name: 'João Silva',
          relate: 'Sócio',
          phone: '(00) 00000-0000',
          mail: 'joaosilva@gmail.com',
        },
      ],
    },
    {
      id: 2,
      cliente: {
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        name: 'Maria Souza',
        email: 'maria.souza@email.com',
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '987654321',
          cpf_cnpj: '234.567.890-11',
          name: 'Banco do Brasil',
          agency: '5678',
          account: '12345-6',
          type: 'Conta Poupança',
          status: 'Ativo',
        },
      ],
      cpf: '234.567.890-11',
      phone: '(21) 92345-6789',
      profission: 'Médica',
      situacao_rf: 'Regular',
      estagio_lead: 'Contato Feito',
      address: [
        {
          logradouro: 'Avenida das Startups, 000 - Parque Residencial do Empreededorismo',
          city: 'São Paulo/SP',
          zipcode: '12327-697',
        },
      ],
      partner: [
        {
          razao_social: 'Rzão Social Empresa LTDA',
          cnpj: '00.000.000/0001-00',
          position: 'Sócio Administrador',
          member_since: '04/03/2025',
        },
      ],
      related_person: [
        {
          name: 'João Silva',
          relate: 'Sócio',
          phone: '(00) 00000-0000',
          mail: 'joaosilva@gmail.com',
        },
      ],
    },
    {
      id: 3,
      cliente: {
        avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
        name: 'Carlos Pereira',
        email: 'carlos.pereira@email.com',
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '321654987',
          cpf_cnpj: '345.678.901-22',
          name: 'Caixa Econômica',
          agency: '4321',
          account: '65432-1',
          type: 'Conta Corrente',
          status: 'Inativo',
        },
      ],
      cpf: '345.678.901-22',
      phone: '(31) 93456-7890',
      profission: 'Professor',
      situacao_rf: 'Pendente',
      estagio_lead: 'Em Negociação',
      address: [
        {
          logradouro: 'Avenida das Startups, 000 - Parque Residencial do Empreededorismo',
          city: 'São Paulo/SP',
          zipcode: '12327-697',
        },
      ],
      partner: [
        {
          razao_social: 'Rzão Social Empresa LTDA',
          cnpj: '00.000.000/0001-00',
          position: 'Sócio Administrador',
          member_since: '04/03/2025',
        },
      ],
      related_person: [
        {
          name: 'João Silva',
          relate: 'Sócio',
          phone: '(00) 00000-0000',
          mail: 'joaosilva@gmail.com',
        },
      ],
    },
    {
      id: 4,
      cliente: {
        avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
        name: 'Ana Lima',
        email: 'ana.lima@email.com',
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '456789123',
          cpf_cnpj: '456.789.012-33',
          name: 'Santander',
          agency: '8765',
          account: '43210-9',
          type: 'Conta Poupança',
          status: 'Ativo',
        },
      ],
      cpf: '456.789.012-33',
      phone: '(41) 94567-8901',
      profission: 'Advogada',
      situacao_rf: 'Regular',
      estagio_lead: 'Fechado',
      address: [
        {
          logradouro: 'Avenida das Startups, 000 - Parque Residencial do Empreededorismo',
          city: 'São Paulo/SP',
          zipcode: '12327-697',
        },
      ],
      partner: [
        {
          razao_social: 'Rzão Social Empresa LTDA',
          cnpj: '00.000.000/0001-00',
          position: 'Sócio Administrador',
          member_since: '04/03/2025',
        },
      ],
      related_person: [
        {
          name: 'João Silva',
          relate: 'Sócio',
          phone: '(00) 00000-0000',
          mail: 'joaosilva@gmail.com',
        },
      ],
    },
    {
      id: 5,
      cliente: {
        avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
        name: 'Pedro Santos',
        email: 'pedro.santos@email.com',
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '654987321',
          cpf_cnpj: '567.890.123-44',
          name: 'Itaú',
          agency: '1357',
          account: '24680-2',
          type: 'Conta Corrente',
          status: 'Ativo',
        },
      ],
      cpf: '567.890.123-44',
      phone: '(51) 95678-9012',
      profission: 'Designer',
      situacao_rf: 'Irregular',
      estagio_lead: 'Novo',
      address: [
        {
          logradouro: 'Avenida das Startups, 000 - Parque Residencial do Empreededorismo',
          city: 'São Paulo/SP',
          zipcode: '12327-697',
        },
      ],
      partner: [
        {
          razao_social: 'Rzão Social Empresa LTDA',
          cnpj: '00.000.000/0001-00',
          position: 'Sócio Administrador',
          member_since: '04/03/2025',
        },
      ],
      related_person: [
        {
          name: 'João Silva',
          relate: 'Sócio',
          phone: '(00) 00000-0000',
          mail: 'joaosilva@gmail.com',
        },
      ],
    },
    {
      id: 6,
      cliente: {
        avatar: 'https://randomuser.me/api/portraits/women/6.jpg',
        name: 'Juliana Alves',
        email: 'juliana.alves@email.com',
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '789123456',
          cpf_cnpj: '678.901.234-55',
          name: 'Bradesco',
          agency: '2468',
          account: '13579-3',
          type: 'Conta Poupança',
          status: 'Inativo',
        },
      ],
      cpf: '678.901.234-55',
      phone: '(61) 96789-0123',
      profission: 'Arquiteta',
      situacao_rf: 'Regular',
      estagio_lead: 'Contato Feito',
      address: [
        {
          logradouro: 'Avenida das Startups, 000 - Parque Residencial do Empreededorismo',
          city: 'São Paulo/SP',
          zipcode: '12327-697',
        },
      ],
      partner: [
        {
          razao_social: 'Rzão Social Empresa LTDA',
          cnpj: '00.000.000/0001-00',
          position: 'Sócio Administrador',
          member_since: '04/03/2025',
        },
      ],
      related_person: [
        {
          name: 'João Silva',
          relate: 'Sócio',
          phone: '(00) 00000-0000',
          mail: 'joaosilva@gmail.com',
        },
      ],
    },
    {
      id: 7,
      cliente: {
        avatar: 'https://randomuser.me/api/portraits/men/7.jpg',
        name: 'Lucas Costa',
        email: 'lucas.costa@email.com',
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '987321654',
          cpf_cnpj: '789.012.345-66',
          name: 'Banco Inter',
          agency: '1122',
          account: '33445-6',
          type: 'Conta Corrente',
          status: 'Ativo',
        },
      ],
      cpf: '789.012.345-66',
      phone: '(71) 97890-1234',
      profission: 'Analista',
      situacao_rf: 'Pendente',
      estagio_lead: 'Em Negociação',
      address: [
        {
          logradouro: 'Avenida das Startups, 000 - Parque Residencial do Empreededorismo',
          city: 'São Paulo/SP',
          zipcode: '12327-697',
        },
      ],
      partner: [
        {
          razao_social: 'Rzão Social Empresa LTDA',
          cnpj: '00.000.000/0001-00',
          position: 'Sócio Administrador',
          member_since: '04/03/2025',
        },
      ],
      related_person: [
        {
          name: 'João Silva',
          relate: 'Sócio',
          phone: '(00) 00000-0000',
          mail: 'joaosilva@gmail.com',
        },
      ],
    },
    {
      id: 8,
      cliente: {
        avatar: 'https://randomuser.me/api/portraits/women/8.jpg',
        name: 'Fernanda Rocha',
        email: 'fernanda.rocha@email.com',
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '321987654',
          cpf_cnpj: '890.123.456-77',
          name: 'Nubank',
          agency: '3344',
          account: '55667-8',
          type: 'Conta Poupança',
          status: 'Ativo',
        },
      ],
      cpf: '890.123.456-77',
      phone: '(81) 98901-2345',
      profission: 'Psicóloga',
      situacao_rf: 'Regular',
      estagio_lead: 'Fechado',
      address: [
        {
          logradouro: 'Avenida das Startups, 000 - Parque Residencial do Empreededorismo',
          city: 'São Paulo/SP',
          zipcode: '12327-697',
        },
      ],
      partner: [
        {
          razao_social: 'Rzão Social Empresa LTDA',
          cnpj: '00.000.000/0001-00',
          position: 'Sócio Administrador',
          member_since: '04/03/2025',
        },
      ],
      related_person: [
        {
          name: 'João Silva',
          relate: 'Sócio',
          phone: '(00) 00000-0000',
          mail: 'joaosilva@gmail.com',
        },
      ],
    },
    {
      id: 9,
      cliente: {
        avatar: 'https://randomuser.me/api/portraits/men/9.jpg',
        name: 'Rafael Martins',
        email: 'rafael.martins@email.com',
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '654123987',
          cpf_cnpj: '901.234.567-88',
          name: 'Banco Original',
          agency: '5566',
          account: '77889-0',
          type: 'Conta Corrente',
          status: 'Inativo',
        },
      ],
      cpf: '901.234.567-88',
      phone: '(91) 99012-3456',
      profission: 'Programador',
      situacao_rf: 'Irregular',
      estagio_lead: 'Novo',
      address: [
        {
          logradouro: 'Avenida das Startups, 000 - Parque Residencial do Empreededorismo',
          city: 'São Paulo/SP',
          zipcode: '12327-697',
        },
      ],
      partner: [
        {
          razao_social: 'Rzão Social Empresa LTDA',
          cnpj: '00.000.000/0001-00',
          position: 'Sócio Administrador',
          member_since: '04/03/2025',
        },
      ],
      related_person: [
        {
          name: 'João Silva',
          relate: 'Sócio',
          phone: '(00) 00000-0000',
          mail: 'joaosilva@gmail.com',
        },
      ],
    },
    {
      id: 10,
      cliente: {
        avatar: 'https://randomuser.me/api/portraits/women/10.jpg',
        name: 'Patrícia Gomes',
        email: 'patricia.gomes@email.com',
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '789654123',
          cpf_cnpj: '012.345.678-99',
          name: 'Banco Pan',
          agency: '7788',
          account: '99001-2',
          type: 'Conta Poupança',
          status: 'Ativo',
        },
      ],
      cpf: '012.345.678-99',
      phone: '(92) 90123-4567',
      profission: 'Dentista',
      situacao_rf: 'Regular',
      estagio_lead: 'Contato Feito',
      address: [
        {
          logradouro: 'Avenida das Startups, 000 - Parque Residencial do Empreededorismo',
          city: 'São Paulo/SP',
          zipcode: '12327-697',
        },
      ],
      partner: [
        {
          razao_social: 'Rzão Social Empresa LTDA',
          cnpj: '00.000.000/0001-00',
          position: 'Sócio Administrador',
          member_since: '04/03/2025',
        },
      ],
      related_person: [
        {
          name: 'João Silva',
          relate: 'Sócio',
          phone: '(00) 00000-0000',
          mail: 'joaosilva@gmail.com',
        },
      ],
    },
    {
      id: 11,
      cliente: {
        avatar: 'https://randomuser.me/api/portraits/men/11.jpg',
        name: 'Bruno Oliveira',
        email: 'bruno.oliveira@email.com',
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '123789456',
          cpf_cnpj: '111.222.333-44',
          name: 'Banco Safra',
          agency: '9900',
          account: '11223-4',
          type: 'Conta Corrente',
          status: 'Ativo',
        },
      ],
      cpf: '111.222.333-44',
      phone: '(93) 91234-5678',
      profission: 'Médico',
      situacao_rf: 'Regular',
      estagio_lead: 'Em Negociação',
      address: [
        {
          logradouro: 'Avenida das Startups, 000 - Parque Residencial do Empreededorismo',
          city: 'São Paulo/SP',
          zipcode: '12327-697',
        },
      ],
      partner: [
        {
          razao_social: 'Rzão Social Empresa LTDA',
          cnpj: '00.000.000/0001-00',
          position: 'Sócio Administrador',
          member_since: '04/03/2025',
        },
      ],
      related_person: [
        {
          name: 'João Silva',
          relate: 'Sócio',
          phone: '(00) 00000-0000',
          mail: 'joaosilva@gmail.com',
        },
      ],
    },
    {
      id: 12,
      cliente: {
        avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
        name: 'Camila Ribeiro',
        email: 'camila.ribeiro@email.com',
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '456123789',
          cpf_cnpj: '222.333.444-55',
          name: 'Banco Votorantim',
          agency: '2233',
          account: '44556-7',
          type: 'Conta Poupança',
          status: 'Inativo',
        },
      ],
      cpf: '222.333.444-55',
      phone: '(94) 92345-6789',
      profission: 'Jornalista',
      situacao_rf: 'Pendente',
      estagio_lead: 'Fechado',
      address: [
        {
          logradouro: 'Avenida das Startups, 000 - Parque Residencial do Empreededorismo',
          city: 'São Paulo/SP',
          zipcode: '12327-697',
        },
      ],
      partner: [
        {
          razao_social: 'Rzão Social Empresa LTDA',
          cnpj: '00.000.000/0001-00',
          position: 'Sócio Administrador',
          member_since: '04/03/2025',
        },
      ],
      related_person: [
        {
          name: 'João Silva',
          relate: 'Sócio',
          phone: '(00) 00000-0000',
          mail: 'joaosilva@gmail.com',
        },
      ],
    },
    {
      id: 13,
      cliente: {
        avatar: 'https://randomuser.me/api/portraits/men/13.jpg',
        name: 'Eduardo Fernandes',
        email: 'eduardo.fernandes@email.com',
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '789321654',
          cpf_cnpj: '333.444.555-66',
          name: 'Banco BTG',
          agency: '3344',
          account: '55667-8',
          type: 'Conta Corrente',
          status: 'Ativo',
        },
      ],
      cpf: '333.444.555-66',
      phone: '(95) 93456-7890',
      profission: 'Engenheiro',
      situacao_rf: 'Regular',
      estagio_lead: 'Novo',
      address: [
        {
          logradouro: 'Avenida das Startups, 000 - Parque Residencial do Empreededorismo',
          city: 'São Paulo/SP',
          zipcode: '12327-697',
        },
      ],
      partner: [
        {
          razao_social: 'Rzão Social Empresa LTDA',
          cnpj: '00.000.000/0001-00',
          position: 'Sócio Administrador',
          member_since: '04/03/2025',
        },
      ],
      related_person: [
        {
          name: 'João Silva',
          relate: 'Sócio',
          phone: '(00) 00000-0000',
          mail: 'joaosilva@gmail.com',
        },
      ],
    },
    {
      id: 14,
      cliente: {
        avatar: 'https://randomuser.me/api/portraits/women/14.jpg',
        name: 'Larissa Castro',
        email: 'larissa.castro@email.com',
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '321654789',
          cpf_cnpj: '444.555.666-77',
          name: 'Banco Neon',
          agency: '4455',
          account: '66778-9',
          type: 'Conta Poupança',
          status: 'Ativo',
        },
      ],
      cpf: '444.555.666-77',
      phone: '(96) 94567-8901',
      profission: 'Advogada',
      situacao_rf: 'Irregular',
      estagio_lead: 'Contato Feito',
      address: [
        {
          logradouro: 'Avenida das Startups, 000 - Parque Residencial do Empreededorismo',
          city: 'São Paulo/SP',
          zipcode: '12327-697',
        },
      ],
      partner: [
        {
          razao_social: 'Razão Social Empresa LTDA',
          cnpj: '00.000.000/0001-00',
          position: 'Sócio Administrador',
          member_since: '04/03/2025',
        },
      ],
      related_person: [
        {
          name: 'João Silva',
          relate: 'Sócio',
          phone: '(00) 00000-0000',
          mail: 'joaosilva@gmail.com',
        },
      ],
    },
    {
      id: 15,
      cliente: {
        avatar: 'https://randomuser.me/api/portraits/men/15.jpg',
        name: 'Marcelo Lima',
        email: 'marcelo.lima@email.com',
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '654789321',
          cpf_cnpj: '555.666.777-88',
          name: 'Banco C6',
          agency: '5566',
          account: '77889-0',
          type: 'Conta Corrente',
          status: 'Inativo',
        },
      ],
      cpf: '555.666.777-88',
      phone: '(97) 95678-9012',
      profission: 'Professor',
      situacao_rf: 'Regular',
      estagio_lead: 'Em Negociação',
      address: [
        {
          logradouro: 'Avenida das Startups, 000 - Parque Residencial do Empreededorismo',
          city: 'São Paulo/SP',
          zipcode: '12327-697',
        },
      ],
      partner: [
        {
          razao_social: 'Razão Social Empresa LTDA',
          cnpj: '00.000.000/0001-00',
          position: 'Sócio Administrador',
          member_since: '04/03/2025',
        },
      ],
      related_person: [
        {
          name: 'João Silva',
          relate: 'Sócio',
          phone: '(00) 00000-0000',
          mail: 'joaosilva@gmail.com',
        },
      ],
    },
    {
      id: 16,
      cliente: {
        avatar: 'https://randomuser.me/api/portraits/women/16.jpg',
        name: 'Renata Mendes',
        email: 'renata.mendes@email.com',
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '987456123',
          cpf_cnpj: '666.777.888-99',
          name: 'Banco Modal',
          agency: '6677',
          account: '88990-1',
          type: 'Conta Poupança',
          status: 'Ativo',
        },
      ],
      cpf: '666.777.888-99',
      phone: '(98) 96789-0123',
      profission: 'Designer',
      situacao_rf: 'Pendente',
      estagio_lead: 'Fechado',
      address: [
        {
          logradouro: 'Avenida das Startups, 000 - Parque Residencial do Empreededorismo',
          city: 'São Paulo/SP',
          zipcode: '12327-697',
        },
      ],
      partner: [
        {
          razao_social: 'Rzão Social Empresa LTDA',
          cnpj: '00.000.000/0001-00',
          position: 'Sócio Administrador',
          member_since: '04/03/2025',
        },
      ],
      related_person: [
        {
          name: 'João Silva',
          relate: 'Sócio',
          phone: '(00) 00000-0000',
          mail: 'joaosilva@gmail.com',
        },
      ],
    },
    {
      id: 17,
      cliente: {
        avatar: 'https://randomuser.me/api/portraits/men/17.jpg',
        name: 'Thiago Barbosa',
        email: 'thiago.barbosa@email.com',
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '123456987',
          cpf_cnpj: '777.888.999-00',
          name: 'Banco Pine',
          agency: '7788',
          account: '99001-2',
          type: 'Conta Corrente',
          status: 'Ativo',
        },
      ],
      cpf: '777.888.999-00',
      phone: '(99) 97890-1234',
      profission: 'Analista',
      situacao_rf: 'Regular',
      estagio_lead: 'Novo',
      address: [
        {
          logradouro: 'Avenida das Startups, 000 - Parque Residencial do Empreededorismo',
          city: 'São Paulo/SP',
          zipcode: '12327-697',
        },
      ],
      partner: [
        {
          razao_social: 'Rzão Social Empresa LTDA',
          cnpj: '00.000.000/0001-00',
          position: 'Sócio Administrador',
          member_since: '04/03/2025',
        },
      ],
      related_person: [
        {
          name: 'João Silva',
          relate: 'Sócio',
          phone: '(00) 00000-0000',
          mail: 'joaosilva@gmail.com',
        },
      ],
    },
    {
      id: 18,
      cliente: {
        avatar: 'https://randomuser.me/api/portraits/women/18.jpg',
        name: 'Aline Farias',
        email: 'aline.farias@email.com',
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '456789321',
          cpf_cnpj: '888.999.000-11',
          name: 'Banco Daycoval',
          agency: '8899',
          account: '11223-4',
          type: 'Conta Poupança',
          status: 'Inativo',
        },
      ],
      cpf: '888.999.000-11',
      phone: '(11) 98901-2345',
      profission: 'Arquiteta',
      situacao_rf: 'Irregular',
      estagio_lead: 'Contato Feito',
      address: [
        {
          logradouro: 'Avenida das Startups, 000 - Parque Residencial do Empreededorismo',
          city: 'São Paulo/SP',
          zipcode: '12327-697',
        },
      ],
      partner: [
        {
          razao_social: 'Rzão Social Empresa LTDA',
          cnpj: '00.000.000/0001-00',
          position: 'Sócio Administrador',
          member_since: '04/03/2025',
        },
      ],
      related_person: [
        {
          name: 'João Silva',
          relate: 'Sócio',
          phone: '(00) 00000-0000',
          mail: 'joaosilva@gmail.com',
        },
      ],
    },
    {
      id: 19,
      cliente: {
        avatar: 'https://randomuser.me/api/portraits/men/19.jpg',
        name: 'Felipe Duarte',
        email: 'felipe.duarte@email.com',
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '789123654',
          cpf_cnpj: '999.000.111-22',
          name: 'Banco ABC',
          agency: '9900',
          account: '22334-5',
          type: 'Conta Corrente',
          status: 'Ativo',
        },
      ],
      cpf: '999.000.111-22',
      phone: '(21) 99012-3456',
      profission: 'Psicólogo',
      situacao_rf: 'Regular',
      estagio_lead: 'Em Negociação',
      address: [
        {
          logradouro: 'Avenida das Startups, 000 - Parque Residencial do Empreededorismo',
          city: 'São Paulo/SP',
          zipcode: '12327-697',
        },
      ],
      partner: [
        {
          razao_social: 'Rzão Social Empresa LTDA',
          cnpj: '00.000.000/0001-00',
          position: 'Sócio Administrador',
          member_since: '04/03/2025',
        },
      ],
      related_person: [
        {
          name: 'João Silva',
          relate: 'Sócio',
          phone: '(00) 00000-0000',
          mail: 'joaosilva@gmail.com',
        },
      ],
    },
    {
      id: 20,
      cliente: {
        avatar: 'https://randomuser.me/api/portraits/women/20.jpg',
        name: 'Beatriz Cardoso',
        email: 'beatriz.cardoso@email.com',
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '321987123',
          cpf_cnpj: '000.111.222-33',
          name: 'Banco BMG',
          agency: '1122',
          account: '33445-6',
          type: 'Conta Poupança',
          status: 'Inativo',
        },
      ],
      cpf: '000.111.222-33',
      phone: '(31) 90123-4567',
      profission: 'Programadora',
      situacao_rf: 'Pendente',
      estagio_lead: 'Fechado',
      address: [
        {
          logradouro: 'Avenida das Startups, 000 - Parque Residencial do Empreededorismo',
          city: 'São Paulo/SP',
          zipcode: '12327-697',
        },
      ],
      partner: [
        {
          razao_social: 'Rzão Social Empresa LTDA',
          cnpj: '00.000.000/0001-00',
          position: 'Sócio Administrador',
          member_since: '04/03/2025',
        },
      ],
      related_person: [
        {
          name: 'João Silva',
          relate: 'Sócio',
          phone: '(00) 00000-0000',
          mail: 'joaosilva@gmail.com',
        },
      ],
    },
    {
      id: 21,
      cliente: {
        avatar: 'https://randomuser.me/api/portraits/men/21.jpg',
        name: 'Gustavo Nunes',
        email: 'gustavo.nunes@email.com',
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '654321987',
          cpf_cnpj: '111.222.333-44',
          name: 'Banco Banrisul',
          agency: '2233',
          account: '44556-7',
          type: 'Conta Corrente',
          status: 'Ativo',
        },
      ],
      cpf: '111.222.333-44',
      phone: '(41) 91234-5678',
      profission: 'Dentista',
      situacao_rf: 'Regular',
      estagio_lead: 'Novo',
      address: [
        {
          logradouro: 'Avenida das Startups, 000 - Parque Residencial do Empreededorismo',
          city: 'São Paulo/SP',
          zipcode: '12327-697',
        },
      ],
      partner: [
        {
          razao_social: 'Rzão Social Empresa LTDA',
          cnpj: '00.000.000/0001-00',
          position: 'Sócio Administrador',
          member_since: '04/03/2025',
        },
      ],
      related_person: [
        {
          name: 'João Silva',
          relate: 'Sócio',
          phone: '(00) 00000-0000',
          mail: 'joaosilva@gmail.com',
        },
      ],
    },
    {
      id: 22,
      cliente: {
        avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
        name: 'Sabrina Lopes',
        email: 'sabrina.lopes@email.com',
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '987123654',
          cpf_cnpj: '222.333.444-55',
          name: 'Banco Sicredi',
          agency: '3344',
          account: '55667-8',
          type: 'Conta Poupança',
          status: 'Inativo',
        },
      ],
      cpf: '222.333.444-55',
      phone: '(51) 92345-6789',
      profission: 'Médica',
      situacao_rf: 'Irregular',
      estagio_lead: 'Contato Feito',
      address: [
        {
          logradouro: 'Avenida das Startups, 000 - Parque Residencial do Empreededorismo',
          city: 'São Paulo/SP',
          zipcode: '12327-697',
        },
      ],
      partner: [
        {
          razao_social: 'Rzão Social Empresa LTDA',
          cnpj: '00.000.000/0001-00',
          position: 'Sócio Administrador',
          member_since: '04/03/2025',
        },
      ],
      related_person: [
        {
          name: 'João Silva',
          relate: 'Sócio',
          phone: '(00) 00000-0000',
          mail: 'joaosilva@gmail.com',
        },
      ],
    },
    {
      id: 23,
      cliente: {
        avatar: 'https://randomuser.me/api/portraits/men/23.jpg',
        name: 'Henrique Teixeira',
        email: 'henrique.teixeira@email.com',
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '123789654',
          cpf_cnpj: '333.444.555-66',
          name: 'Banco Sicoob',
          agency: '4455',
          account: '66778-9',
          type: 'Conta Corrente',
          status: 'Ativo',
        },
      ],
      cpf: '333.444.555-66',
      phone: '(61) 93456-7890',
      profission: 'Jornalista',
      situacao_rf: 'Regular',
      estagio_lead: 'Em Negociação',
      address: [
        {
          logradouro: 'Avenida das Startups, 000 - Parque Residencial do Empreededorismo',
          city: 'São Paulo/SP',
          zipcode: '12327-697',
        },
      ],
      partner: [
        {
          razao_social: 'Rzão Social Empresa LTDA',
          cnpj: '00.000.000/0001-00',
          position: 'Sócio Administrador',
          member_since: '04/03/2025',
        },
      ],
      related_person: [
        {
          name: 'João Silva',
          relate: 'Sócio',
          phone: '(00) 00000-0000',
          mail: 'joaosilva@gmail.com',
        },
      ],
    },
    {
      id: 24,
      cliente: {
        avatar: 'https://randomuser.me/api/portraits/women/24.jpg',
        name: 'Viviane Freitas',
        email: 'viviane.freitas@email.com',
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '456321987',
          cpf_cnpj: '444.555.666-77',
          name: 'Banco Banestes',
          agency: '5566',
          account: '77889-0',
          type: 'Conta Poupança',
          status: 'Inativo',
        },
      ],
      cpf: '444.555.666-77',
      phone: '(71) 94567-8901',
      profission: 'Engenheira',
      situacao_rf: 'Pendente',
      estagio_lead: 'Fechado',
      address: [
        {
          logradouro: 'Avenida das Startups, 000 - Parque Residencial do Empreededorismo',
          city: 'São Paulo/SP',
          zipcode: '12327-697',
        },
      ],
      partner: [
        {
          razao_social: 'Rzão Social Empresa LTDA',
          cnpj: '00.000.000/0001-00',
          position: 'Sócio Administrador',
          member_since: '04/03/2025',
        },
      ],
      related_person: [
        {
          name: 'João Silva',
          relate: 'Sócio',
          phone: '(00) 00000-0000',
          mail: 'joaosilva@gmail.com',
        },
      ],
    },
    {
      id: 25,
      cliente: {
        avatar: 'https://randomuser.me/api/portraits/men/25.jpg',
        name: 'Rodrigo Azevedo',
        email: 'rodrigo.azevedo@email.com',
      },
      bank: {},
      residential: {},
      bankRegister: [
        {
          chave_pix: '789654321',
          cpf_cnpj: '555.666.777-88',
          name: 'Banco BRB',
          agency: '6677',
          account: '88990-1',
          type: 'Conta Corrente',
          status: 'Ativo',
        },
      ],
      cpf: '555.666.777-88',
      phone: '(81) 95678-9012',
      profission: 'Advogado',
      situacao_rf: 'Regular',
      estagio_lead: 'Novo',
      address: [
        {
          logradouro: 'Avenida das Startups, 000 - Parque Residencial do Empreededorismo',
          city: 'São Paulo/SP',
          zipcode: '12327-697',
        },
      ],
      partner: [
        {
          razao_social: 'Rzão Social Empresa LTDA',
          cnpj: '00.000.000/0001-00',
          position: 'Sócio Administrador',
          member_since: '04/03/2025',
        },
      ],
      related_person: [
        {
          name: 'João Silva',
          relate: 'Sócio',
          phone: '(00) 00000-0000',
          mail: 'joaosilva@gmail.com',
        },
      ],
    },
  ]
  const getClientLead = (id) => {
    const client = rowLeads.find((client) => client.id === id)
    if (client) {
      return {
        ...client,
      }
    }
    debugLog('useLeads', 'Lead not found', client)
    return null
  }
  const getLeadOptions = () => {
    return rowLeads.map((lead) => {
      const label =
        (lead._raw && (lead._raw.name || lead._raw.nome)) ||
        lead.name ||
        (lead.cliente && (lead.cliente.name || lead.cliente.nome)) ||
        '-'
      const avatar = (lead.cliente && lead.cliente.avatar) || (lead._raw && lead._raw.avatar) || ''
      return {
        label,
        value: lead.id,
        avatar,
      }
    })
  }
  return {
    columnLeads,
    rowLeads,
    getClientLead,
    getLeadOptions,
  }
}
