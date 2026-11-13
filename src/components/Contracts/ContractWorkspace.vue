<template>
  <div class="contract-workspace" :class="{ 'contract-workspace--open': !editing }">
    <header class="contract-heading">
      <div class="contract-heading__bar">
        <div class="contract-heading__identity">
          <q-btn
            flat
            dense
            no-caps
            :disable="busy"
            aria-label="Voltar para contratos"
            @click="cancel"
            ><img src="/icons/contracts/back.svg" alt="" /><span v-if="!editing"
              >Voltar para contratos</span
            ></q-btn
          >
          <span v-if="!editing" class="contract-title-icon"
            ><img src="/icons/contracts/ct04-basic.svg" alt=""
          /></span>
          <div :class="{ 'contract-title-line': !editing }">
            <h1>
              {{
                editing
                  ? draft
                    ? 'Novo Contrato'
                    : 'Editar Contrato'
                  : detail.state.data?.name || 'Contrato'
              }}
            </h1>
            <p v-if="editing">
              Preencha os dados para registrar um novo contrato ou editar seus dados.
            </p>
            <p v-else class="contract-header-meta">
              <q-badge
                outline
                class="contract-status"
                :class="
                  'contract-status--' +
                  (detail.state.data?.businessStatus?.code || '').toLowerCase()
                "
                >{{
                  detail.state.data?.businessStatus?.name ||
                  financeLabel(detail.state.data?.registrationStatus)
                }}</q-badge
              >
              <span
                ><img src="/icons/contracts/clock.svg" alt="" />Atualizado
                {{
                  detail.state.data?.updatedAtUtc
                    ? new Date(detail.state.data.updatedAtUtc).toLocaleString('pt-BR')
                    : '—'
                }}</span
              >
            </p>
          </div>
        </div>
        <div class="contract-heading__actions" v-if="editing">
          <q-btn outline no-caps label="Cancelar" :disable="busy" @click="cancel" /><q-btn
            v-if="draft"
            outline
            no-caps
            label="Salvar Rascunho"
            :disable="Boolean(presetBusy)"
            :loading="busy"
            @click="save(false)"
          /><q-btn
            outline
            no-caps
            :label="draft ? 'Criar Contrato' : 'Salvar Alterações'"
            :loading="busy"
            :disable="Boolean(presetBusy) || (!draft && !dirty)"
            @click="save(draft)"
          />
        </div>
        <q-btn
          v-else
          outline
          no-caps
          label="Editar Contrato"
          :disable="detail.state.loading || !detail.state.data"
          @click="beginEdit"
          ><img class="contract-edit-icon" src="/icons/contracts/edit.svg" alt=""
        /></q-btn>
      </div>
      <div v-if="!editing && detail.state.data" class="contract-metrics">
        <div v-for="metric in headerMetrics" :key="metric.label">
          <img :src="'/icons/contracts/' + metric.icon + '.svg'" alt="" /><span>{{
            metric.label
          }}</span
          ><strong>{{ metric.value }}</strong
          ><small v-if="metric.caption">{{ metric.caption }}</small>
        </div>
      </div>
    </header>
    <main class="contract-main">
      <q-banner v-if="error" class="contract-error" role="alert">{{ error }}</q-banner
      ><resource-state :state="detail.state" @retry="loadDetail">
        <div v-if="editing" class="contract-create-grid" :inert="busy || undefined">
          <div class="contract-fields">
            <contract-panel title="Informações Básicas" icon="ct04-basic"
              ><label-form text-label="Nome do Contrato"
                ><q-input
                  v-model="form.name"
                  outlined
                  dense
                  placeholder="Ex: Contrato Alpha 2026-Q1"
                  aria-label="Nome do Contrato" /></label-form
            ></contract-panel>
            <contract-panel title="Vigência e Prazos" icon="calendar"
              ><div class="contract-row">
                <label-form text-label="Prazo do Contrato"
                  ><div class="contract-term">
                    <q-input
                      v-model.number="termValue"
                      type="number"
                      min="1"
                      :max="termOptions.find((o) => o.value === termUnit)?.max"
                      outlined
                      dense
                      aria-label="Prazo do Contrato"
                    /><glass-select
                      v-model="termUnit"
                      :options="termOptions"
                      aria-label="Unidade do prazo"
                    /></div></label-form
                ><label-form text-label="Início do Contrato"
                  ><q-input
                    v-model="form.startDate"
                    type="date"
                    outlined
                    dense
                    :disable="!draft"
                    aria-label="Início do Contrato"
                /></label-form>
              </div>
              <div class="contract-end">
                <img src="/icons/contracts/clock.svg" alt="" />
                <div>
                  <small>Previsão de Término</small><strong>{{ dateLabel(expectedEnd) }}</strong>
                </div>
                <span>Calculado automaticamente com base no prazo selecionado</span>
              </div></contract-panel
            >
            <contract-panel title="Financeiro e Moeda" icon="coins"
              ><resource-state :state="catalog.state" @retry="loadCatalog"
                ><div class="contract-row">
                  <label-form text-label="Moeda Firmada"
                    ><currency-select
                      v-model="form.currencyId"
                      :customer-id="form.clientAllocations[0]?.clientId"
                      :current="currentCurrency"
                      :disable="!draft"
                      @currency-code="currencyCode = $event" /></label-form
                  ><label-form text-label="Capital Inicial Contratual"
                    ><money-input
                      v-model="form.initialContractualCapital"
                      :currency="currencyCode"
                      outlined
                      dense
                      :disable="!draft"
                      aria-label="Capital Inicial Contratual"
                    /><small
                      >Este valor será distribuído entre os clientes vinculados</small
                    ></label-form
                  >
                </div>
                <label-form text-label="Origem do Capital Inicial" class="contract-spacing"
                  ><div class="contract-origins">
                    <label v-for="origin in catalog.state.data?.origins || []" :key="origin.id"
                      ><q-radio
                        v-model="form.initialCapitalOriginId"
                        :val="origin.id"
                        :disable="!draft"
                        :label="
                          origin.code === 'CONTRACT_VALUE'
                            ? 'Atribuir valor do contrato ao cliente/clientes'
                            : origin.code === 'CLIENT_WALLET'
                              ? 'Formar capital a partir de carteira do cliente'
                              : origin.name
                        "
                      /><small>{{ origin.description }}</small></label
                    >
                  </div></label-form
                >
                <label-form text-label="Capital Consolidado Inicial" class="contract-spacing"
                  ><q-input
                    :model-value="
                      draft && selectedOrigin?.code === 'CONTRACT_VALUE'
                        ? money(form.initialContractualCapital, currencyCode)
                        : money(detail.state.data?.initialConsolidatedCapital, currencyCode)
                    "
                    outlined
                    dense
                    readonly
                    aria-label="Capital Consolidado Inicial"
                /></label-form>
                <label-form text-label="Observação Financeira" class="contract-spacing"
                  ><q-input
                    v-model="form.financialNotes"
                    outlined
                    dense
                    type="textarea"
                    rows="3"
                    placeholder="Informações adicionais sobre o contrato..."
                    aria-label="Observação Financeira" /></label-form></resource-state
            ></contract-panel>
            <contract-panel title="Motor Principal" icon="engine"
              ><resource-state :state="catalog.state" @retry="loadCatalog"
                ><div class="contract-row">
                  <label-form text-label="Motor Principal"
                    ><glass-select
                      v-model="form.primaryEngineId"
                      :options="catalog.state.data?.engines || []"
                      option-value="id"
                      option-label="name"
                      :disable="!draft"
                      aria-label="Motor Principal" /></label-form
                  ><label-form text-label="Índice do Motor na Conexão"
                    ><q-input
                      :model-value="primaryConnection?.indexAtConnection ?? ''"
                      outlined
                      dense
                      disable
                      placeholder="Indisponível"
                      aria-label="Índice do Motor na Conexão"
                  /></label-form>
                </div>
                <label-form text-label="Data e Hora de Conexão ao Motor" class="contract-spacing"
                  ><q-input
                    :model-value="connectionDate"
                    outlined
                    dense
                    disable
                    placeholder="Indisponível"
                    aria-label="Data e Hora de Conexão ao Motor" /></label-form></resource-state
            ></contract-panel>
            <contract-panel title="Status Inicial" icon="status"
              ><label-form text-label="Status Inicial do Contrato"
                ><glass-select
                  v-model="form.initialContractStatusId"
                  :options="catalog.state.data?.statuses || []"
                  option-value="id"
                  option-label="name"
                  placeholder="Rascunho"
                  aria-label="Status Inicial do Contrato" /></label-form
            ></contract-panel>
            <contract-panel
              title="Universo de Ativos do Contrato"
              icon="assets"
              caption="Ativos, bolsas e moedas elegíveis dentro da política do contrato."
              ><template #actions><span class="contract-optional">Opcional</span></template>
              <p class="contract-note">
                Esta lista representa o universo permitido de negociação do contrato.
              </p>
              <h3>Usar conjunto pronto</h3>
              <resource-state :state="presets.state" @retry="loadPresets"
                ><div class="contract-preset-grid">
                  <div
                    v-for="preset in presets.state.data || []"
                    :key="preset.id"
                    class="contract-preset"
                  >
                    <strong>{{ preset.name }}</strong
                    ><small>{{ preset.assetCount }} ativos</small
                    ><small>{{ dateLabel(preset.updatedAtUtc || preset.createdAtUtc) }}</small
                    ><q-btn
                      outline
                      no-caps
                      label="Usar conjunto"
                      :disable="!draft"
                      :loading="presetBusy === preset.id"
                      @click="usePreset(preset)"
                    />
                  </div></div
              ></resource-state>
              <div class="contract-toolbar">
                <q-btn
                  outline
                  no-caps
                  label="Adicionar Ativo"
                  :disable="!draft"
                  @click="assetOpen = true"
                  ><img src="/icons/contracts/plus.svg" alt="" /></q-btn
                ><q-btn outline no-caps label="Importar Excel" disable
                  ><img src="/icons/contracts/import.svg" alt="" /><q-tooltip
                    >Importação não disponível nesta integração.</q-tooltip
                  ></q-btn
                ><q-btn outline no-caps label="Importar PDF" disable
                  ><img src="/icons/contracts/import.svg" alt="" /></q-btn
                ><q-btn flat no-caps label="Baixar modelo Excel" disable
                  ><img src="/icons/contracts/download.svg" alt=""
                /></q-btn>
              </div>
              <div v-if="!stagedAssets.length" class="contract-empty">
                Nenhum ativo elegível cadastrado para este contrato.
              </div>
              <div
                v-for="asset in stagedAssets"
                :key="asset.assetId || asset.id"
                class="contract-asset-line"
              >
                <span>{{ asset.ticker }} · {{ asset.name }}</span
                ><q-btn
                  flat
                  round
                  dense
                  icon="close"
                  aria-label="Remover ativo"
                  :disable="!draft"
                  @click="removeStagedAsset(asset)"
                />
              </div>
              <h3>Composição Estratégica</h3>
              <p>Defina a distribuição estratégica do contrato por tipo de operação.</p>
              <div class="contract-row contract-row--three">
                <label-form
                  v-for="label in ['Intradiário (%)', 'Núcleo (%)', 'Tática (%)']"
                  :key="label"
                  :text-label="label"
                  ><q-input outlined dense disable placeholder="Indisponível" :aria-label="label"
                /></label-form></div
            ></contract-panel>
            <contract-panel
              title="Documentos do Contrato"
              caption="Repositório de arquivos digitais do contrato"
              ><template #actions><span class="contract-optional">Opcional</span></template>
              <div class="contract-upload-grid">
                <q-btn v-for="label in documentSlots" :key="label" outline no-caps disable
                  ><img src="/icons/contracts/upload.svg" alt="" /><span>{{ label }}</span
                  ><q-tooltip
                    >Tipo documental específico não disponível no catálogo.</q-tooltip
                  ></q-btn
                >
              </div></contract-panel
            >
            <p class="contract-audit-note">
              <img src="/icons/contracts/info.svg" alt="" />A criação do contrato registra os
              vínculos e alterações no histórico de auditoria.
            </p>
          </div>
          <aside class="contract-side">
            <contract-panel title="Clientes Vinculados" icon="users"
              ><template #actions
                ><span class="contract-optional">{{
                  form.clientAllocations.length
                }}</span></template
              >
              <div v-if="!form.clientAllocations.length" class="contract-empty">
                <img src="/icons/contracts/users-empty.svg" alt="" />
                <p>Nenhum cliente vinculado. Adicione pelo menos um.</p>
              </div>
              <div
                v-for="p in form.clientAllocations"
                :key="p.clientId"
                class="contract-client-line"
              >
                <strong>{{ p.displayName || participantName(p.clientId) }}</strong
                ><q-btn
                  flat
                  round
                  dense
                  icon="close"
                  aria-label="Remover cliente"
                  :disable="!draft"
                  @click="removeClient(p.clientId)"
                />
              </div>
              <q-btn
                outline
                no-caps
                label="Adicionar Cliente"
                class="full-width"
                :disable="!draft"
                @click="clientOpen = true"
            /></contract-panel>
            <contract-panel title="Resumo do Contrato" icon="summary"
              ><dl class="contract-summary">
                <div v-for="item in summary" :key="item.label">
                  <dt>{{ item.label }}</dt>
                  <dd>{{ item.value }}</dd>
                </div>
              </dl></contract-panel
            >
          </aside>
        </div>
        <div v-else class="contract-open-sections">
          <h2 class="contract-operational-title">Resumo Operacional</h2>
          <contract-panel title="Clientes Vinculados" icon="users"
            ><template #actions
              ><span class="contract-optional">{{
                detail.state.data?.participants?.length || 0
              }}</span
              ><q-btn-toggle
                v-model="participantLayout"
                no-caps
                :options="[
                  { label: 'Cards', value: 'cards' },
                  { label: 'Lista', value: 'list' },
                ]" /><q-btn
                outline
                no-caps
                label="Adicionar"
                :disable="busy"
                @click="clientOpen = true"
            /></template>
            <div v-if="!detail.state.data?.participants?.length" class="contract-empty">
              Nenhum cliente vinculado.
            </div>
            <div
              class="contract-participants"
              :class="{ 'contract-participants--list': participantLayout === 'list' }"
            >
              <article
                v-for="p in detail.state.data?.participants || []"
                :key="p.clientId"
                class="contract-participant"
              >
                <h3>{{ p.displayName }}</h3>
                <small>Vínculo desde {{ dateLabel(p.linkedAtUtc) }}</small>
                <dl>
                  <div>
                    <dt>Participação</dt>
                    <dd>
                      {{
                        p.allocationPercentage == null
                          ? 'Indisponível'
                          : p.allocationPercentage + '%'
                      }}
                    </dd>
                  </div>
                  <div>
                    <dt>Aportes totais</dt>
                    <dd>{{ money(p.contributedAmount, currencyCode) }}</dd>
                  </div>
                  <div>
                    <dt>Retiradas totais</dt>
                    <dd>Indisponível</dd>
                  </div>
                  <div>
                    <dt>Posição atual</dt>
                    <dd>Indisponível</dd>
                  </div>
                </dl>
                <q-btn
                  outline
                  no-caps
                  label="Ver Detalhes"
                  class="full-width"
                  @click="participantDetail = p"
                /><q-btn flat round dense icon="more_vert" :aria-label="'Ações de ' + p.displayName"
                  ><q-menu
                    ><q-list
                      ><q-item clickable v-close-popup :disable="busy" @click="unlinkParticipant(p)"
                        ><q-item-section>Desvincular cliente</q-item-section></q-item
                      ></q-list
                    ></q-menu
                  ></q-btn
                >
              </article>
            </div></contract-panel
          >
          <q-expansion-item
            v-model="expandedSections.engines"
            class="contract-expansion"
            expand-icon="img:/icons/contracts/chevron.svg"
            ><template #header
              ><img class="contract-section-icon" src="/icons/contracts/engine.svg" alt="" />
              <div class="contract-expansion-title">
                <strong>Motores e Operações do Contrato</strong
                ><small>Motores vinculados, distribuição e operações do contrato.</small>
              </div>
              <span>{{
                financeLabel(detail.state.data?.primaryEngine?.connectionStatus)
              }}</span></template
            ><resource-state :state="engines.state" @retry="loadEngines"
              ><div
                v-for="engine in engines.state.data || []"
                :key="engine.contractEngineId"
                class="contract-engine"
              >
                <h3>{{ engine.name }}</h3>
                <div class="contract-row">
                  <span>Índice na conexão: {{ engine.indexAtConnection ?? 'Indisponível' }}</span
                  ><span>Índice atual: {{ engine.currentIndex ?? 'Indisponível' }}</span
                  ><span>Conectado em: {{ dateLabel(engine.connectedAtUtc) }}</span>
                </div>
              </div>
              <p v-if="!engines.state.data?.length">Nenhum motor vinculado.</p></resource-state
            ></q-expansion-item
          >
          <q-expansion-item
            v-model="expandedSections.assets"
            class="contract-expansion"
            expand-icon="img:/icons/contracts/chevron.svg"
            ><template #header
              ><img class="contract-section-icon" src="/icons/contracts/assets.svg" alt="" />
              <div class="contract-expansion-title">
                <strong>Ativos do Contrato</strong
                ><small
                  >{{
                    assets.state.data?.summary?.assetCount ??
                    detail.state.data?.assetUniverseSummary?.assetCount ??
                    '—'
                  }}
                  ativos vinculados</small
                >
              </div></template
            ><resource-state :state="assets.state" @retry="loadAssets"
              ><q-btn
                outline
                no-caps
                label="Adicionar Ativo"
                :disable="busy"
                @click="assetOpen = true"
              /><q-btn flat no-caps label="Exportar ativos" :disable="busy" @click="exportAssets" />
              <div
                v-for="a in assets.state.data?.items || []"
                :key="a.contractAssetId"
                class="contract-asset-line"
              >
                <span
                  >{{ a.ticker }} · {{ a.name }} ·
                  {{ a.market?.name || a.network?.name || '—' }}</span
                ><q-btn
                  flat
                  dense
                  round
                  icon="close"
                  aria-label="Remover ativo"
                  :disable="busy"
                  @click="unlinkAsset(a)"
                />
              </div>
              <p v-if="!assets.state.data?.items?.length">
                Nenhum ativo vinculado.
              </p></resource-state
            ></q-expansion-item
          >
          <q-expansion-item
            v-model="expandedSections.debts"
            class="contract-expansion"
            expand-icon="img:/icons/contracts/chevron.svg"
            ><template #header
              ><img class="contract-section-icon" src="/icons/contracts/debt.svg" alt="" />
              <div class="contract-expansion-title">
                <strong>Dívidas Vinculadas ao Contrato</strong
                ><small>{{ debtRows.length }} dívidas</small>
              </div></template
            ><resource-state :state="debts.state" @retry="loadDebts"
              ><div v-for="debt in debtRows" :key="debt.id" class="contract-debt">
                <h3>{{ debt.creditor || debt.publicCode }}</h3>
                <p>{{ debt.description }}</p>
                <div class="contract-row">
                  <span>Saldo: {{ money(debt.outstandingAmount, debt.currencyIsoCode) }}</span
                  ><span>Vencimento: {{ dateLabel(debt.dueDate) }}</span
                  ><span>{{ financeLabel(debt.status) }}</span>
                </div>
              </div>
              <p v-if="!debtRows.length">Nenhuma dívida vinculada.</p></resource-state
            ></q-expansion-item
          >
          <q-expansion-item
            v-model="expandedSections.documents"
            class="contract-expansion"
            expand-icon="img:/icons/contracts/chevron.svg"
            ><template #header
              ><img class="contract-section-icon" src="/icons/contracts/summary.svg" alt="" />
              <div class="contract-expansion-title">
                <strong>Documentos do Contrato</strong
                ><small>{{ documents.state.data?.length ?? '—' }} documentos</small>
              </div></template
            ><resource-state :state="documents.state" @retry="loadDocuments"
              ><div
                v-for="d in documents.state.data || []"
                :key="d.documentId"
                class="contract-document"
              >
                <strong>{{ d.fileName }}</strong
                ><small>{{ d.visibleToClient ? 'Liberado ao cliente' : 'Uso interno' }}</small>
                <div>
                  <q-btn
                    flat
                    dense
                    no-caps
                    label="Visualizar"
                    :loading="opening === d.documentId"
                    @click="openDocument(d)"
                  /><q-btn
                    flat
                    dense
                    no-caps
                    :label="d.visibleToClient ? 'Ocultar do cliente' : 'Liberar ao cliente'"
                    :disable="busy"
                    @click="
                      writeSection(
                        'patch',
                        'documents/' + d.documentId,
                        { visibleToClient: !d.visibleToClient },
                        loadDocuments,
                      )
                    "
                  /><q-btn
                    flat
                    dense
                    no-caps
                    label="Desvincular"
                    :disable="busy"
                    @click="unlinkDocument(d)"
                  />
                </div>
              </div>
              <p v-if="!documents.state.data?.length">Nenhum documento vinculado.</p>
              <q-btn
                outline
                no-caps
                label="Adicionar documento"
                @click="documentOpen = true" /></resource-state
          ></q-expansion-item>
          <contract-panel title="Histórico de Aportes do Capital Base" icon="wallet"
            ><template #actions
              ><span
                >Capital Inicial:
                {{ money(detail.state.data?.initialContractualCapital, currencyCode) }} ·
                Consolidado:
                {{ money(detail.state.data?.initialConsolidatedCapital, currencyCode) }}</span
              ></template
            >
            <resource-state :state="contributions.state" @retry="loadContributions">
              <q-table
                flat
                dense
                hide-pagination
                :rows="contributionRows"
                :columns="contributionColumns"
                row-key="id"
                :pagination="{ rowsPerPage: 0 }"
                no-data-label="Nenhum aporte adicional registrado."
              />
              <p v-if="contributions.state.data?.pagination?.hasNextPage" class="contract-muted">
                Exibindo os 100 aportes mais recentes.
              </p>
            </resource-state></contract-panel
          >
          <contract-panel title="Performance Histórica" icon="performance"
            ><template #actions
              ><q-btn-toggle
                v-model="performanceView"
                disable
                no-caps
                :options="[
                  { label: 'Tabela', value: 'table' },
                  { label: 'Gráfico', value: 'chart' },
                ]" /><q-btn outline no-caps label="Ver Histórico Completo" disable
            /></template>
            <p class="contract-muted">Performance histórica indisponível.</p></contract-panel
          >
          <contract-panel id="contract-history" title="Histórico de Alterações" icon="history"
            ><resource-state :state="history.state" @retry="loadHistory"
              ><q-table
                flat
                dense
                hide-pagination
                :rows="historyRows"
                :columns="historyColumns"
                row-key="id"
                :pagination="{ rowsPerPage: 0 }"
                no-data-label="Nenhuma alteração registrada." /></resource-state
          ></contract-panel></div
      ></resource-state>
    </main>
    <q-dialog v-model="clientOpen" :persistent="busy"
      ><q-card class="contract-modal"
        ><h2>{{ draft ? 'Selecionar clientes para vincular' : 'Adicionar cliente vinculado' }}</h2>
        <customer-select v-model="selectedClient" @resolved="selectedClientData = $event" />
        <div class="contract-modal-actions">
          <q-btn flat no-caps label="Cancelar" :disable="busy" @click="clientOpen = false" /><q-btn
            outline
            no-caps
            label="Adicionar"
            :disable="!selectedClient || busy"
            @click="addClient"
          /></div></q-card
    ></q-dialog>
    <q-dialog v-model="assetOpen" :persistent="busy"
      ><q-card class="contract-modal"
        ><h2>Adicionar ativo elegível</h2>
        <q-input
          v-model="assetSearch"
          outlined
          dense
          debounce="350"
          placeholder="Buscar ativo"
          aria-label="Buscar ativo"
          @update:model-value="loadAssetOptions" /><resource-state
          :state="assetOptions.state"
          @retry="loadAssetOptions"
          ><glass-select
            v-model="selectedAsset"
            :options="
              (assetOptions.state.data || []).map((a) => ({
                ...a,
                label: a.ticker + ' · ' + a.name,
              }))
            "
            option-value="id"
            :option-label="(a) => a.ticker + ' · ' + a.name"
            aria-label="Ativo elegível"
        /></resource-state>
        <div class="contract-modal-actions">
          <q-btn flat no-caps label="Cancelar" :disable="busy" @click="assetOpen = false" /><q-btn
            outline
            no-caps
            label="Adicionar"
            :disable="!selectedAsset || busy"
            @click="addAsset"
          /></div></q-card
    ></q-dialog>
    <q-dialog v-model="documentOpen" :persistent="busy"
      ><q-card class="contract-modal"
        ><h2>Documentos do Contrato</h2>
        <label-form text-label="Cliente"
          ><glass-select
            v-model="documentClient"
            :options="
              (detail.state.data?.participants || []).map((p) => ({ ...p, label: p.displayName }))
            "
            option-value="clientId"
            option-label="displayName"
            aria-label="Cliente do documento" /></label-form
        ><customer-document-select v-model="documentId" :customer-id="documentClient" /><q-checkbox
          v-model="documentVisible"
          label="Liberar ao cliente" />
        <div class="contract-modal-actions">
          <q-btn
            flat
            no-caps
            label="Cancelar"
            :disable="busy"
            @click="documentOpen = false"
          /><q-btn
            outline
            no-caps
            label="Vincular documento"
            :disable="!documentId || busy"
            @click="linkDocument"
          /></div></q-card
    ></q-dialog>
    <q-dialog
      :model-value="Boolean(participantDetail)"
      @update:model-value="participantDetail = null"
      ><q-card class="contract-modal"
        ><h2>{{ participantDetail?.displayName }}</h2>
        <dl class="contract-summary">
          <div>
            <dt>Capital base</dt>
            <dd>{{ money(participantDetail?.baseAmount, currencyCode) }}</dd>
          </div>
          <div>
            <dt>Valor alocado</dt>
            <dd>{{ money(participantDetail?.allocatedAmount, currencyCode) }}</dd>
          </div>
        </dl>
        <q-btn outline no-caps label="Fechar" @click="participantDetail = null" /></q-card
    ></q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onScopeDispose } from 'vue'
import { useQuasar } from 'quasar'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import ContractPanel from './ContractPanel.vue'
import LabelForm from 'src/components/Form/LabelForm.vue'
import GlassSelect from 'src/components/Entity/GlassSelect.vue'
import MoneyInput from 'src/components/Form/MoneyInput.vue'
import CurrencySelect from 'src/components/Finance/CurrencySelect.vue'
import CustomerSelect from 'src/components/Finance/CustomerSelect.vue'
import CustomerDocumentSelect from 'src/components/Finance/CustomerDocumentSelect.vue'
import ResourceState from 'src/components/Finance/ResourceState.vue'
import { useContractWorkspace } from 'src/composables/useContractWorkspace'
import { useFinanceResource } from 'src/composables/useFinanceResource'
import {
  financeGet,
  financeExport,
  money,
  dateLabel,
  financeLabel,
  endpointLabel,
  columns,
} from 'src/services/financeService'
import { contractTermOptions, contractEndDate } from 'src/services/financeModels'
import { auditAction, auditField, auditValue } from 'src/services/auditModel'
import { createDocumentWindow } from 'src/services/documentWindow'
import { getDocumentTemporaryUrl } from 'src/services/documentAdminService'
const props = defineProps({
  contractId: { type: String, default: null },
  historyRequested: Boolean,
})
const emit = defineEmits(['close', 'saved'])
const $q = useQuasar()
const {
  id,
  form,
  termValue,
  termUnit,
  endDate,
  editing,
  busy,
  error,
  stagedAssets,
  assetsChanged,
  draft,
  detail,
  catalog,
  assets,
  documents,
  engines,
  debts,
  history,
  contributions,
  presets,
  resetForm,
  loadDetail,
  loadCatalog,
  loadAssets,
  loadDocuments,
  loadEngines,
  loadDebts,
  loadHistory,
  loadContributions,
  loadPresets,
  save,
  writeSection,
} = useContractWorkspace(props, emit, $q.notify)
const currentCurrency = computed(() =>
  detail.state.data?.currency
    ? { ...detail.state.data.currency, name: detail.state.data.currency.isoCode }
    : null,
)
const termOptions = contractTermOptions,
  currencyCode = ref('BRL'),
  clientOpen = ref(false),
  assetOpen = ref(false),
  documentOpen = ref(false),
  selectedClient = ref(null),
  selectedClientData = ref(null),
  selectedAsset = ref(null),
  assetSearch = ref(''),
  documentClient = ref(null),
  documentId = ref(null),
  documentVisible = ref(false),
  participantDetail = ref(null),
  expandedSections = ref({ engines: false, assets: false, debts: false, documents: false }),
  participantLayout = ref('cards'),
  performanceView = ref('table'),
  presetBusy = ref(null),
  opening = ref(null)
const assetOptions = useFinanceResource(),
  documentWindow = createDocumentWindow()
let active = true
onScopeDispose(() => {
  active = false
  assetOptions.reset()
  documentWindow.dispose()
})
watch(
  () => detail.state.data?.currency?.isoCode,
  (v) => {
    if (v) currencyCode.value = v
  },
  { immediate: true },
)
const selectedOrigin = computed(() =>
  catalog.state.data?.origins.find((o) => o.id === form.value.initialCapitalOriginId),
)
const primaryConnection = computed(() =>
  engines.state.data?.find((e) => e.engineId === form.value.primaryEngineId),
)
const connectionDate = computed(() =>
  primaryConnection.value?.connectedAtUtc
    ? new Date(primaryConnection.value.connectedAtUtc).toLocaleString('pt-BR')
    : '',
)
const expectedEnd = computed(() => {
  const sameTerm =
    termValue.value === detail.state.data?.term?.value &&
    termUnit.value === detail.state.data?.term?.unit
  if (!draft.value && sameTerm) return endDate.value
  return contractEndDate(form.value.startDate, { value: termValue.value, unit: termUnit.value })
})
const baseline = ref('')
watch(
  () => detail.state.data,
  () => {
    baseline.value = JSON.stringify([form.value, termValue.value, termUnit.value, endDate.value])
  },
  { flush: 'post' },
)
const dirty = computed(
  () =>
    JSON.stringify([form.value, termValue.value, termUnit.value, endDate.value]) !== baseline.value,
)
const participantName = (clientId) =>
  detail.state.data?.participants?.find((p) => p.clientId === clientId)?.displayName || 'Cliente'
const documentSlots = [
  'Contrato Digitalizado',
  'Documento Complementar',
  'Termo de Adesão',
  'Outros Documentos',
]
const summary = computed(() => [
  { label: 'Nome', value: form.value.name || '—' },
  { label: 'Clientes Vinculados', value: form.value.clientAllocations?.length || 0 },
  {
    label: 'Capital Inicial',
    value: money(form.value.initialContractualCapital, currencyCode.value),
  },
  {
    label: 'Consolidado',
    value:
      draft.value && selectedOrigin.value?.code === 'CONTRACT_VALUE'
        ? money(form.value.initialContractualCapital, currencyCode.value)
        : money(detail.state.data?.initialConsolidatedCapital, currencyCode.value),
  },
  { label: 'Moeda Firmada', value: currencyCode.value },
  { label: 'Origem do Capital', value: selectedOrigin.value?.name || '—' },
  {
    label: 'Motor Principal',
    value:
      catalog.state.data?.engines.find((e) => e.id === form.value.primaryEngineId)?.name || '—',
  },
  { label: 'Data/Hora da Conexão', value: connectionDate.value || 'Indisponível' },
  {
    label: 'Prazo',
    value: termValue.value
      ? termValue.value + ' ' + (termOptions.find((o) => o.value === termUnit.value)?.label || '')
      : '—',
  },
  { label: 'Término', value: dateLabel(expectedEnd.value) },
  {
    label: 'Status Inicial',
    value:
      catalog.state.data?.statuses.find((s) => s.id === form.value.initialContractStatusId)?.name ||
      'Rascunho',
  },
])
const headerMetrics = computed(() => {
  const d = detail.state.data
  return d
    ? [
        { label: 'Início do Contrato', value: dateLabel(d.startDate), icon: 'calendar' },
        { label: 'Fim do Contrato', value: dateLabel(d.expectedEndDate), icon: 'clock' },
        {
          label: 'Capital Inicial Contratual',
          value: money(d.initialContractualCapital, currencyCode.value),
          icon: 'wallet',
        },
        {
          label: 'Capital Consolidado',
          value: money(d.initialConsolidatedCapital, currencyCode.value),
          caption: 'Inicial + aportes',
          icon: 'coins',
        },
        {
          label: 'Saldo Atual',
          value: money(d.currentBalance?.value, currencyCode.value),
          icon: 'debt',
        },
        { label: 'Moeda Firmada', value: d.currency?.isoCode || '—', icon: 'coins' },
      ]
    : []
})
const debtRows = computed(() =>
  Array.isArray(debts.state.data) ? debts.state.data : debts.state.data?.items || [],
)
const contributionRows = computed(() => contributions.state.data?.items || [])
const contributionColumns = columns([
  ['requestedAtUtc', 'Data', (r) => dateLabel(r.requestedAtUtc)],
  [
    'type',
    'Tipo de Aporte',
    (r) => (r.type === 'ContractOperation' ? 'Aporte adicional' : financeLabel(r.type)),
  ],
  ['amount', 'Valor', (r) => money(r.amount, r.currencyIsoCode)],
  ['currencyIsoCode', 'Moeda'],
  [
    'source',
    'Origem / Canal',
    (r) => [endpointLabel(r.source), r.requestNumber].filter(Boolean).join(' · ') || '—',
  ],
  ['createdBy', 'Responsável', (r) => r.createdBy?.displayName || '—'],
])
const historyRows = computed(() =>
  Array.isArray(history.state.data) ? history.state.data : history.state.data?.items || [],
)
const historyColumns = columns([
  [
    'occurredAtUtc',
    'Data/Hora',
    (r) => (r.occurredAtUtc ? new Date(r.occurredAtUtc).toLocaleString('pt-BR') : '—'),
  ],
  ['actor', 'Autor', (r) => r.actorName || r.performedBy?.displayName || '—'],
  ['action', 'Alteração', (r) => auditAction(r.action).label],
  [
    'changedFields',
    'Anterior → Novo',
    (r) =>
      r.field
        ? `${auditField(r.field)}: ${auditValue(r.field, r.oldValue, currencyCode.value)} → ${auditValue(r.field, r.newValue, currencyCode.value)}`
        : '—',
  ],
])
function beginEdit() {
  resetForm()
  editing.value = true
  baseline.value = JSON.stringify([form.value, termValue.value, termUnit.value, endDate.value])
}
function cancel() {
  if (busy.value) return
  if (id.value && !draft.value && editing.value) {
    resetForm()
    editing.value = false
  } else emit('close')
}
onBeforeRouteLeave(() => !busy.value)
onBeforeRouteUpdate(() => !busy.value)
async function addClient() {
  const key = selectedClient.value
  if (!key || busy.value) return
  if (form.value.clientAllocations.some((p) => p.clientId === key)) {
    error.value = 'Este cliente já está vinculado.'
    return
  }
  if (draft.value)
    form.value.clientAllocations.push({
      clientId: key,
      allocatedAmount: null,
      displayName: selectedClientData.value?.displayName || 'Cliente',
    })
  else if (
    !(await writeSection('post', 'participants', { clientId: key, allocatedAmount: null }, () =>
      loadDetail(),
    ))
  )
    return
  clientOpen.value = false
  selectedClient.value = null
  selectedClientData.value = null
}
function removeClient(key) {
  form.value.clientAllocations = form.value.clientAllocations.filter((p) => p.clientId !== key)
}
async function loadAssetOptions() {
  await assetOptions.load(async () => {
    const d = (
      await financeGet('admin/contracts/catalog/assets', {
        search: assetSearch.value || undefined,
        page: 1,
        pageSize: 100,
      })
    ).data
    return Array.isArray(d) ? d : d?.items || []
  })
}
watch(assetOpen, (v) => {
  if (v) loadAssetOptions()
})
async function addAsset() {
  const a = assetOptions.state.data?.find((a) => a.id === selectedAsset.value)
  if (!a) return
  if (editing.value) {
    if (!draft.value) return
    if (!stagedAssets.value.some((x) => (x.assetId || x.id) === a.id)) {
      stagedAssets.value.push(a)
      assetsChanged.value = true
    }
  } else if (
    !(await writeSection(
      'post',
      'assets',
      { presetSetId: null, assetIds: [a.id], assets: null },
      loadAssets,
    ))
  )
    return
  assetOpen.value = false
  selectedAsset.value = null
}
function removeStagedAsset(a) {
  stagedAssets.value = stagedAssets.value.filter((x) => (x.assetId || x.id) !== (a.assetId || a.id))
  assetsChanged.value = true
}
async function usePreset(preset) {
  if (presetBusy.value) return
  presetBusy.value = preset.id
  try {
    const result = (await financeGet(`admin/contracts/catalog/asset-sets/${preset.id}`)).data
    if (!active) return
    const merged = new Map(stagedAssets.value.map((a) => [a.assetId || a.id, a]))
    for (const a of result.assets || []) merged.set(a.assetId || a.id, a)
    stagedAssets.value = [...merged.values()]
    assetsChanged.value = true
  } catch {
    if (active) error.value = 'Não foi possível consultar o conjunto. Tente novamente.'
  } finally {
    if (active) presetBusy.value = null
  }
}
function confirmRemove(action) {
  $q.dialog({
    title: 'Remover vínculo',
    message: 'Confirma a remoção deste vínculo do contrato?',
    cancel: true,
  }).onOk(action)
}
function unlinkParticipant(p) {
  confirmRemove(() =>
    writeSection('delete', `participants/${p.clientId}`, undefined, () => loadDetail()),
  )
}
function unlinkAsset(a) {
  confirmRemove(() => writeSection('delete', `assets/${a.contractAssetId}`, undefined, loadAssets))
}
function unlinkDocument(d) {
  confirmRemove(() => writeSection('delete', `documents/${d.documentId}`, undefined, loadDocuments))
}
async function linkDocument() {
  if (
    await writeSection(
      'post',
      'documents',
      { documentId: documentId.value, description: null, visibleToClient: documentVisible.value },
      loadDocuments,
    )
  ) {
    documentOpen.value = false
    documentId.value = null
  }
}
async function openDocument(d) {
  if (opening.value) return
  opening.value = d.documentId
  try {
    await documentWindow.open(
      async () => {
        const r = await getDocumentTemporaryUrl(d.documentId)
        return r?.url || r?.temporaryUrl
      },
      { current: () => active },
    )
  } catch {
    if (active) error.value = 'Não foi possível abrir o documento. Tente novamente.'
  } finally {
    if (active) opening.value = null
  }
}
async function exportAssets() {
  try {
    await financeExport(
      `admin/contracts/${id.value}/assets/export`,
      { format: 'csv' },
      'ativos-contrato.csv',
      () => active,
    )
  } catch {
    if (active) error.value = 'Não foi possível exportar os ativos.'
  }
}
watch(
  () => [props.historyRequested, history.state.loading, editing.value],
  async () => {
    if (props.historyRequested && !history.state.loading && !editing.value) {
      await nextTick()
      if (active) document.getElementById('contract-history')?.scrollIntoView({ block: 'start' })
    }
  },
  { flush: 'post', immediate: true },
)
</script>
<style scoped>
.contract-workspace {
  color: var(--sa-text, #fff);
  min-width: 0;
}
.contract-heading {
  padding: 18px 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  background: linear-gradient(182deg, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.02));
  backdrop-filter: blur(20px);
}
.contract-heading__bar {
  max-width: 1280px;
  margin: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}
.contract-heading__identity {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}
.contract-heading h1 {
  font-size: 20px;
  line-height: 28px;
  font-weight: 700;
  margin: 0;
  overflow-wrap: anywhere;
}
.contract-heading p {
  font-size: 12px;
  margin: 0;
  color: rgba(255, 255, 255, 0.65);
}
.contract-heading__actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}
.contract-workspace :deep(.q-btn) {
  border-radius: 8px;
  font-size: 14px;
  min-height: 36px;
}
.contract-heading :deep(.q-btn) {
  background: rgba(255, 255, 255, 0.03);
}
.contract-heading img,
.contract-toolbar img {
  flex: none;
  margin-right: 8px;
}
.contract-edit-icon {
  order: -1;
  margin-right: 8px;
}
.contract-main {
  max-width: 1328px;
  padding: 40px 24px;
  margin: auto;
}
.contract-create-grid {
  display: grid;
  grid-template-columns: minmax(0, 2.08fr) minmax(280px, 1fr);
  gap: 32px;
}
.contract-fields,
.contract-side,
.contract-open-sections {
  display: flex;
  flex-direction: column;
  gap: 32px;
  min-width: 0;
}
.contract-side {
  align-self: start;
}
.contract-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.contract-row--three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.contract-term {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 110px;
  gap: 8px;
}
.contract-end {
  margin-top: 24px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
}
.contract-end strong,
.contract-end small {
  display: block;
}
.contract-end span {
  font-size: 12px;
  max-width: 200px;
  margin-left: auto;
  text-align: right;
  color: rgba(255, 255, 255, 0.6);
}
.contract-spacing {
  margin-top: 24px;
}
.contract-origins {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.contract-origins label {
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  align-items: center;
  gap: 12px;
}
.contract-workspace small,
.contract-muted {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
}
.contract-workspace :deep(.LabelForm) {
  min-width: 0;
}
.contract-workspace :deep(.q-field__control) {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.09), rgba(0, 0, 0, 0.02));
  border-radius: 8px;
}
.contract-workspace :deep(.q-field--outlined .q-field__control:before) {
  border-color: rgba(255, 255, 255, 0.12);
}
.contract-workspace :deep(.q-field__native),
.contract-workspace :deep(.q-field__input) {
  color: inherit;
  font-size: 14px;
}
.contract-preset-grid,
.contract-upload-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.contract-preset {
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
}
.contract-preset strong,
.contract-preset small {
  display: block;
}
.contract-preset :deep(.q-btn) {
  width: 100%;
  margin-top: 10px;
}
.contract-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 24px 0;
}
.contract-upload-grid :deep(.q-btn__content) {
  flex-direction: column;
  gap: 12px;
  padding: 20px 8px;
}
.contract-empty {
  border: 1px dashed rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  padding: 32px 16px;
  text-align: center;
  margin-bottom: 16px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}
.contract-empty img {
  display: block;
  margin: 0 auto 16px;
}
.contract-summary {
  margin: 0;
}
.contract-summary > div {
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.contract-summary > div:last-child {
  border: 0;
}
.contract-summary dt {
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.03em;
  color: rgba(255, 255, 255, 0.6);
}
.contract-summary dd {
  margin: 4px 0 0;
  font-weight: 500;
  font-size: 14px;
  overflow-wrap: anywhere;
}
.contract-optional {
  font-size: 12px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 5px;
  padding: 2px 8px;
}
.contract-client-line,
.contract-asset-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  gap: 8px;
}
.contract-client-line strong {
  min-width: 0;
  overflow-wrap: anywhere;
}
.contract-audit-note,
.contract-note {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 16px;
}
.contract-audit-note {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.contract-workspace h3 {
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  margin: 16px 0 8px;
}
.contract-metrics {
  max-width: 1552px;
  margin: 20px auto 0;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 16px;
}
.contract-metrics > div {
  position: relative;
  padding-left: 24px;
  min-width: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}
.contract-metrics img {
  position: absolute;
  left: 0;
  top: 2px;
}
.contract-metrics span {
  font-size: 11px;
  text-transform: uppercase;
  display: block;
}
.contract-metrics strong {
  font-size: 14px;
  overflow-wrap: anywhere;
  display: block;
}
.contract-metrics small {
  display: block;
  margin-top: 4px;
}
.contract-workspace--open .contract-main {
  max-width: 1600px;
}
.contract-workspace--open .contract-heading__bar {
  max-width: 1552px;
}
.contract-operational-title {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0;
}
.contract-participants {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.contract-participants--list {
  grid-template-columns: 1fr;
}
.contract-participant {
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  padding: 16px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
  min-width: 0;
}
.contract-participant h3 {
  margin: 0;
}
.contract-participant dl > div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.contract-participant dt {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
}
.contract-participant dd {
  margin: 0;
  text-align: right;
}
.contract-expansion {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  overflow: hidden;
  background: linear-gradient(160deg, rgba(0, 0, 0, 0.16), rgba(0, 0, 0, 0.04));
  backdrop-filter: blur(20px);
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.13);
}
.contract-expansion :deep(.q-item) {
  padding: 24px;
}
.contract-expansion :deep(.q-expansion-item__content) {
  padding: 0 24px 24px;
}
.contract-section-icon {
  align-self: center;
  margin-right: 12px;
  flex: none;
}
.contract-expansion-title {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: 4px;
}
.contract-expansion-title strong {
  text-transform: uppercase;
  font-size: 14px;
}
.contract-expansion-title small {
  font-size: 12px;
}
.contract-debt,
.contract-document,
.contract-engine {
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.contract-document strong,
.contract-document small {
  display: block;
}
.contract-error {
  margin-bottom: 24px;
  background: rgba(255, 80, 80, 0.08);
}
.contract-modal {
  width: 512px;
  max-width: calc(100vw - 32px);
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  background: #17202e;
  color: white;
}
.contract-modal h2 {
  font-size: 18px;
  line-height: 26px;
  margin: 0 0 24px;
}
.contract-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
.contract-workspace :deep(.q-table),
.contract-workspace :deep(.q-table__container) {
  background: transparent;
}
.contract-open-sections :deep(.q-table__middle) {
  overflow-x: auto;
}
@media (max-width: 1050px) {
  .contract-create-grid {
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: 20px;
  }
  .contract-heading__bar {
    align-items: flex-start;
  }
  .contract-heading__actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .contract-origins label {
    grid-template-columns: 1fr;
  }
  .contract-metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 750px) {
  .contract-main {
    padding: 24px 16px;
  }
  .contract-heading {
    padding: 16px;
  }
  .contract-heading__bar {
    flex-direction: column;
    gap: 16px;
  }
  .contract-heading__actions {
    justify-content: flex-start;
    gap: 8px;
  }
  .contract-create-grid {
    display: flex;
    flex-direction: column;
  }
  .contract-side {
    width: 100%;
  }
  .contract-row,
  .contract-row--three {
    grid-template-columns: 1fr;
  }
  .contract-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .contract-participants {
    grid-template-columns: 1fr;
  }
  .contract-upload-grid,
  .contract-preset-grid {
    grid-template-columns: 1fr;
  }
  .contract-end span {
    max-width: 130px;
  }
  .contract-open-sections :deep(.profile-section__heading) {
    flex-wrap: wrap;
  }
  .contract-expansion :deep(.q-item) {
    padding: 16px;
  }
  .contract-expansion :deep(.q-expansion-item__content) {
    padding: 0 16px 16px;
  }
  .contract-fields,
  .contract-side,
  .contract-open-sections {
    gap: 24px;
  }
}
@media (min-width: 751px) and (max-width: 1200px) {
  .contract-create-grid {
    grid-template-columns: 1fr;
  }
  .contract-side {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .contract-heading__bar {
    flex-direction: column;
    align-items: flex-start;
  }
  .contract-heading__actions {
    justify-content: flex-start;
  }
}
.contract-workspace--open :deep(.profile-section__heading) {
  padding: 16px;
  min-height: 54px;
}
.contract-workspace--open :deep(.profile-section__body) {
  padding: 16px;
}
.contract-workspace :deep(.q-btn--outline:before) {
  border-color: rgba(255, 255, 255, 0.2);
}
.contract-workspace :deep(.q-btn-toggle) {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  box-shadow: none;
}
.contract-workspace :deep(.q-btn-toggle .q-btn.bg-primary) {
  background: rgba(180, 141, 255, 0.18) !important;
  color: #d6c5f5 !important;
}

.contract-title-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  min-width: 0;
}
.contract-title-line h1 {
  font-size: 18px;
  overflow-wrap: anywhere;
}
.contract-title-icon {
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 9px;
  background: rgba(255, 255, 255, 0.04);
  flex: none;
}
.contract-title-icon img {
  display: block;
  margin: 0;
}
.contract-header-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin: 0 !important;
}
.contract-header-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}
.contract-header-meta span img {
  width: 12px;
  height: 12px;
  margin: 0;
}
.contract-status {
  border-radius: 8px;
  text-transform: uppercase;
  font-size: 10px;
  padding: 4px 8px;
}
.contract-status--active {
  color: #74ffa0;
  background: rgba(0, 122, 85, 0.2);
}
.contract-status--suspended {
  color: #ffdb76;
  background: rgba(210, 160, 0, 0.12);
}
.contract-heading__identity > .q-btn {
  flex-shrink: 0;
  white-space: nowrap;
}
@media (max-width: 750px) {
  .contract-workspace--open .contract-heading__identity {
    flex-wrap: wrap;
  }
  .contract-workspace--open .contract-heading__identity > .q-btn {
    flex-basis: 100%;
    justify-content: flex-start;
  }
  .contract-title-line {
    flex: 1;
  }
}
</style>
