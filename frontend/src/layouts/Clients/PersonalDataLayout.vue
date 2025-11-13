<template>
  <q-form class="PersonalDataLayout">
    <div class="row">
      <label-form className="col row" textLabel="Foto (Avatar)">
        <div class="col">
          <q-btn
            label=""
            color="primary"
            icon="photo_camera"
            flat
            size="sm"
            no-caps
            @click="triggerPhotoInput"
          />
        </div>

        <div class="row q-gutter-sm q-mt-xs" style="margin-top: 0; align-items: center">
          <div v-if="uploadedPhoto">
            <q-avatar size="156px" class="q-ml-sm">
              <img :src="uploadedPhoto" alt="foto" />
            </q-avatar>

            <q-btn flat dense round icon="delete" color="negative" @click="clearPhoto" />
          </div>

          <input
            type="file"
            ref="filePhotoInput"
            style="display: none"
            @change="handleFilePhoto"
            accept=".jpg, .jpeg, .png"
          />
        </div>
      </label-form>
    </div>

    <slot></slot>

    <div class="row q-gutter-sm">
      <label-form className="col" :required="true" textLabel="Nome">
        <q-input
          outlined
          v-model="clientEdit.cliente.name"
          dense
          placeholder="Nome completo"
          :rules="nameRule"
          :error="nameError"
          :error-message="nameErrorMessage"
          @blur="onBlurName"
          @input="
            (val) => {
              onInputName()
              onInputTextProp('name', val)
            }
          "
          @keydown="onKeydownText"
          @paste="onPasteText('name', $event)"
        ></q-input>
      </label-form>

      <label-form className="col" textLabel="RG">
        <q-input
          outlined
          v-model="clientEdit.cliente.rg"
          dense
          placeholder="00.000.000-0"
        ></q-input>
      </label-form>

      <label-form className="col" :required="true" textLabel="CPF">
        <q-input
          outlined
          v-model="clientEdit.cliente.cpf"
          dense
          placeholder="000.000.000-00"
          mask="###.###.###-##"
          :rules="cpfRule"
          :error="cpfError"
          :error-message="cpfErrorMessage"
          @blur="onBlurCpf"
          @input="onInputCpf"
        ></q-input>
      </label-form>
    </div>

    <div class="row q-gutter-sm">
      <label-form className="col" textLabel="CNH">
        <q-input
          outlined
          v-model="clientEdit.cliente.cnh"
          dense
          placeholder="Digite o número da CNH"
        ></q-input>
      </label-form>

      <label-form className="col" :required="true" textLabel="E-mail">
        <q-input
          outlined
          v-model="clientEdit.cliente.email"
          dense
          placeholder="email@exemplo.com"
          :rules="emailRule"
          :error="emailError"
          :error-message="emailErrorMessage"
          @blur="onBlurEmail"
          @input="onInputEmail"
        ></q-input>
      </label-form>

      <label-form className="col" textLabel="Telefone/Celular">
        <q-input
          outlined
          v-model="clientEdit.cliente.telefone"
          dense
          placeholder="5511912345678"
          inputmode="numeric"
          :rules="phoneRole"
          @blur="onBlurTelefone"
          @input="() => onInputNumeric('telefone')"
        ></q-input>
      </label-form>
    </div>

    <!-- Campo de senha: aparecer junto às informações pessoais e documentos -->
    <div class="row q-gutter-sm q-mt-sm">
      <label-form className="col" textLabel="Senha">
        <q-input
          outlined
          ref="passwordRef"
          v-model="clientEdit.password"
          dense
          aria-placeholder="Digite a senha"
          unmasked-value
          class="q-my-sm"
          :type="isPwd ? 'password' : 'text'"
        >
          <template v-slot:append>
            <q-icon
              color="grey-5"
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>
      </label-form>
    </div>

    <div class="row q-gutter-sm">
      <label-form className="col" :required="true" textLabel="Data de Nascimento">
        <q-input
          outlined
          v-model="clientEdit.cliente.birth"
          navigation-min-year-month="1990/07"
          type="date"
          dense
          :hint="`idade - ${computedAgeDisplay}`"
          placeholder="value"
          :rules="[(val) => !!val || 'Campo é obrigatorio.']"
          :error="birthError"
          :error-message="birthErrorMessage"
          @blur="onBlurBirth"
          @input="onInputBirth"
        ></q-input>
      </label-form>
      <!-- <div class="col" style="display: flex; align-items: center">
        <div style="font-size: 0.9rem; color: #666; margin-left: 8px">
          Idade: <strong>{{ computedAgeDisplay }}</strong>
        </div>
      </div> -->

      <label-form className="col" textLabel="Profissão">
        <q-select
          outlined
          v-model="clientEdit.cliente.profissao"
          :options="optionsProfission"
          dense
          placeholder="Selecione a profissão"
        ></q-select>
      </label-form>

      <label-form className="col" textLabel="Renda Anual">
        <q-select
          outlined
          v-model="clientEdit.cliente.rendaAnual"
          :options="rendaAnual"
          dense
          placeholder="Selecione a renda anual"
        ></q-select>
      </label-form>
    </div>

    <!-- Novos campos solicitados: ID alfanumérico, apelido, endereço e foto -->
    <div class="row q-gutter-sm q-mt-sm">
      <label-form className="col" textLabel="ID do Cliente (alfanumérico)">
        <q-input
          outlined
          v-model="clientEdit.cliente.client_code"
          dense
          placeholder="Ex: C123AB"
        ></q-input>
      </label-form>

      <label-form className="col" textLabel="Apelido">
        <q-input
          outlined
          v-model="clientEdit.cliente.apelido"
          @input="(val) => onInputTextProp('apelido', val)"
          @blur="onBlurText('apelido')"
          @keydown="onKeydownText"
          @paste="onPasteText('apelido', $event)"
          dense
          placeholder="Como o cliente é chamado"
        ></q-input>
      </label-form>
    </div>

    <!-- Renda familiar e contato de confiança -->
    <div class="row q-gutter-sm q-mt-sm">
      <label-form className="col" textLabel="Renda Anual da Família">
        <q-select
          outlined
          v-model="clientEdit.cliente.rendaAnualFamilia"
          :options="rendaAnual"
          dense
          placeholder="Selecione a renda familiar"
        ></q-select>
      </label-form>

      <label-form className="col" textLabel="Nome do Contato de Confiança">
        <q-input
          outlined
          v-model="clientEdit.cliente.contato_nome"
          @input="(val) => onInputTextProp('contato_nome', val)"
          @keydown="onKeydownText"
          @paste="onPasteText('contato_nome', $event)"
          @blur="onBlurText('contato_nome')"
          dense
          placeholder="Nome do contato"
        />
      </label-form>

      <label-form className="col" textLabel="Telefone do Contato">
        <q-input
          outlined
          hint="Formato: código do país seguido do número (ex: 5511912345678) — o '+' não é necessário"
          v-model="clientEdit.cliente.contato_telefone"
          dense
          placeholder="5511912345678"
          inputmode="numeric"
          :rules="phoneRole"
          @blur="onBlurTelefoneContato"
          @input="() => onInputNumeric('contato_telefone')"
        />
      </label-form>
    </div>

    <!-- RG data/UF expedição, gênero, estado civil, nacionalidade -->
    <div class="row q-gutter-sm q-mt-sm">
      <label-form className="col" textLabel="Data de Expedição (RG)">
        <q-input outlined v-model="clientEdit.cliente.rg_expedicao_date" type="date" dense />
      </label-form>

      <label-form className="col" textLabel="UF de Expedição (RG)">
        <q-input
          outlined
          v-model="clientEdit.cliente.rg_expedicao_uf"
          @blur="onBlurText('rg_expedicao_uf')"
          dense
          placeholder="Digite a UF de expedição"
        />
      </label-form>

      <label-form className="col" textLabel="Gênero">
        <q-select
          outlined
          v-model="clientEdit.cliente.genero"
          :options="generoOptions"
          dense
          placeholder="Selecione"
        />
      </label-form>
    </div>

    <div class="row q-gutter-sm q-mt-sm">
      <label-form className="col" textLabel="Estado Civil">
        <q-select
          outlined
          v-model="clientEdit.cliente.estado_civil"
          :options="estadoCivilOptions"
          dense
          placeholder="Selecione"
        />
      </label-form>

      <label-form className="col" textLabel="Nacionalidade">
        <q-input
          outlined
          v-model="clientEdit.cliente.nacionalidade"
          @blur="onBlurText('nacionalidade')"
          @input="(val) => onInputTextProp('nacionalidade', val)"
          @keydown="onKeydownText"
          @paste="onPasteText('nacionalidade', $event)"
          dense
          placeholder="Ex: Brasileiro"
        />
      </label-form>

      <label-form className="col" textLabel="Valor aproximado dos bens">
        <q-input
          outlined
          v-model="clientEdit.cliente.patrimonio_valor"
          @blur="onBlurPatrimonio"
          @input="() => onInputNumeric('patrimonio_valor', true)"
          dense
          inputmode="decimal"
          placeholder="R$ 0,00"
        />
      </label-form>
    </div>

    <!-- Nomes dos pais e naturalidade -->
    <div class="row q-gutter-sm q-mt-sm">
      <label-form className="col" textLabel="Nome completo do Pai">
        <q-input
          outlined
          v-model="clientEdit.cliente.nome_pai"
          @input="(val) => onInputTextProp('nome_pai', val)"
          @keydown="onKeydownText"
          @paste="onPasteText('nome_pai', $event)"
          dense
          placeholder="Nome do pai"
          @blur="onBlurText('nome_pai')"
        />
      </label-form>

      <label-form className="col" textLabel="Nome completo da Mãe">
        <q-input
          outlined
          v-model="clientEdit.cliente.nome_mae"
          @input="(val) => onInputTextProp('nome_mae', val)"
          @keydown="onKeydownText"
          @paste="onPasteText('nome_mae', $event)"
          dense
          placeholder="Nome da mãe"
          @blur="onBlurText('nome_mae')"
        />
      </label-form>

      <label-form className="col" textLabel="Naturalidade (Cidade)">
        <q-input
          outlined
          v-model="clientEdit.cliente.naturalidade_cidade"
          @input="(val) => onInputTextProp('naturalidade_cidade', val)"
          @keydown="onKeydownText"
          @paste="onPasteText('naturalidade_cidade', $event)"
          dense
          placeholder="Cidade"
          @blur="onBlurText('naturalidade_cidade')"
        />
      </label-form>
    </div>

    <div class="row q-gutter-sm q-mt-sm">
      <label-form className="col" textLabel="Naturalidade (UF)">
        <q-input
          outlined
          v-model="clientEdit.cliente.naturalidade_uf"
          @input="(val) => onInputTextProp('naturalidade_uf', val)"
          @keydown="onKeydownText"
          @paste="onPasteText('naturalidade_uf', $event)"
          dense
          placeholder="UF"
          @blur="onBlurText('naturalidade_uf')"
        />
      </label-form>

      <label-form className="col" textLabel="RG (formatação)">
        <q-input
          outlined
          hint="Formato: 00.000.000-0"
          v-model="clientEdit.cliente.rg"
          dense
          placeholder="00.000.000-0"
          mask="##.###.###-#"
        />
      </label-form>

      <label-form className="col" textLabel="CNH (formatação)">
        <q-input
          outlined
          v-model="clientEdit.cliente.cnh"
          dense
          placeholder="###########"
          mask="################"
        />
      </label-form>
    </div>

    <div class="row q-gutter-sm q-mt-sm">
      <label-form className="col" textLabel="Upload RG - Frente" helperText=".jpg, .png — até 5MB">
        <div class="row q-gutter-sm q-mt-xs" style="margin-top: 0; align-items: center">
          <q-btn
            label="Upload"
            color="primary"
            icon="upload"
            outline
            no-caps
            style="border-radius: 6px; border: 2px solid #00a3ff"
            @click="triggerRgFrontInput"
          />
          <div class="" v-if="uploadedRgFront.length > 0">
            <div
              v-for="(item, index) in uploadedRgFront"
              :key="index"
              class="row items-center q-gutter-sm"
            >
              <div
                v-if="
                  item.preview &&
                  (String(item.preview).startsWith('data:image') ||
                    String(item.preview).match(/\.(jpe?g|png|gif)$/i))
                "
              >
                <img
                  :src="item.preview"
                  alt="preview"
                  style="width: 48px; height: 48px; object-fit: cover; border-radius: 4px"
                />
              </div>
              <div v-else-if="item.preview">
                <q-btn
                  flat
                  dense
                  round
                  icon="picture_as_pdf"
                  color="primary"
                  @click.prevent.stop="openFile(item.preview)"
                />
              </div>
              <q-btn
                size="sm"
                outline
                padding="xs"
                icon="description"
                color="secondary"
                :label="displayName(item)"
                no-caps
                class="q-ma-sm text-muted"
                @click.prevent.stop="item.preview && openFile(item.preview)"
              />
              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                class="q-ml-sm"
                @click.prevent.stop="removeUploadedRgFront(index)"
              />
            </div>
          </div>
          <input
            type="file"
            ref="fileRgFrontInput"
            style="display: none"
            @change="handleFileRgFront"
            accept=".jpg, .jpeg, .png"
          />
        </div>
      </label-form>
    </div>

    <div class="row q-gutter-sm q-mt-sm">
      <label-form className="col" textLabel="Upload RG - Verso" helperText=".jpg, .png — até 5MB">
        <div class="row q-gutter-sm q-mt-xs" style="margin-top: 0; align-items: center">
          <q-btn
            label="Upload"
            color="primary"
            icon="upload"
            outline
            no-caps
            style="border-radius: 6px; border: 2px solid #00a3ff"
            @click="triggerRgBackInput"
          />
          <div class="" v-if="uploadedRgBack.length > 0">
            <div
              v-for="(item, index) in uploadedRgBack"
              :key="index"
              class="row items-center q-gutter-sm"
            >
              <div
                v-if="
                  item.preview &&
                  (String(item.preview).startsWith('data:image') ||
                    String(item.preview).match(/\.(jpe?g|png|gif)$/i))
                "
              >
                <img
                  :src="item.preview"
                  alt="preview"
                  style="width: 48px; height: 48px; object-fit: cover; border-radius: 4px"
                />
              </div>
              <div v-else-if="item.preview">
                <q-btn
                  flat
                  dense
                  round
                  icon="picture_as_pdf"
                  color="primary"
                  @click.prevent.stop="openFile(item.preview)"
                />
              </div>
              <q-btn
                size="sm"
                outline
                padding="xs"
                icon="description"
                color="secondary"
                :label="displayName(item)"
                no-caps
                class="q-ma-sm text-muted"
                @click.prevent.stop="item.preview && openFile(item.preview)"
              />
              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                class="q-ml-sm"
                @click.prevent.stop="removeUploadedRgBack(index)"
              />
            </div>
          </div>
          <input
            type="file"
            ref="fileRgBackInput"
            style="display: none"
            @change="handleFileRgBack"
            accept=".jpg, .jpeg, .png"
          />
        </div>
      </label-form>
    </div>

    <div class="row q-gutter-sm q-mt-sm">
      <label-form className="col" textLabel="Rua">
        <q-input
          outlined
          v-model="clientEdit.cliente.rua"
          dense
          placeholder="Rua"
          @input="(val) => onInputTextProp('rua', val)"
          @blur="onBlurText('rua')"
          @keydown="onKeydownText"
          @paste="onPasteText('rua', $event)"
        ></q-input>
      </label-form>

      <label-form className="col" textLabel="Número">
        <q-input
          outlined
          v-model="clientEdit.cliente.numero_casa"
          dense
          placeholder="Número da casa"
          @input="() => onInputNumeric('numero_casa')"
        ></q-input>
      </label-form>

      <label-form className="col" textLabel="Bairro / Cidade">
        <q-input
          outlined
          v-model="clientEdit.cliente.cidade"
          dense
          placeholder="Cidade"
          @input="(val) => onInputTextProp('cidade', val)"
          @blur="onBlurText('cidade')"
          @keydown="onKeydownText"
          @paste="onPasteText('cidade', $event)"
        ></q-input>
      </label-form>
    </div>

    <div class="row q-gutter-sm q-mt-sm">
      <label-form className="col" textLabel="Estado">
        <q-input
          outlined
          v-model="clientEdit.cliente.estado"
          @blur="onBlurText('estado')"
          dense
          placeholder="Estado (UF)"
        ></q-input>
      </label-form>

      <label-form className="col" textLabel="CEP">
        <q-input
          outlined
          v-model="clientEdit.cliente.cep"
          dense
          placeholder="00000-000"
          mask="#####-###"
        ></q-input>
      </label-form>

      <label-form className="col" textLabel="País">
        <q-input
          outlined
          v-model="clientEdit.cliente.pais"
          @blur="onBlurText('pais')"
          dense
          placeholder="Brasil"
        ></q-input>
      </label-form>
    </div>

    <!-- Uploads: stacked vertically for better organization -->
    <div class="row q-gutter-sm">
      <label-form
        className="col"
        textLabel="Comprovante de Endereço"
        helperText=".jpg, .png, .pdf — até 5MB"
      >
        <div class="row q-gutter-sm q-mt-xs" style="margin-top: 0; align-items: center">
          <q-btn
            label="Upload"
            color="primary"
            icon="upload"
            outline
            no-caps
            style="border-radius: 6px; border: 2px solid #00a3ff"
            @click="triggerFileInput"
          />
          <div class="" v-if="uploadedFiles.length > 0">
            <div
              v-for="(item, index) in uploadedFiles"
              :key="index"
              class="row items-center q-gutter-sm"
            >
              <div
                v-if="
                  item.preview &&
                  (String(item.preview).startsWith('data:image') ||
                    String(item.preview).match(/\.(jpe?g|png|gif)$/i))
                "
              >
                <img
                  :src="item.preview"
                  alt="preview"
                  style="width: 48px; height: 48px; object-fit: cover; border-radius: 4px"
                />
              </div>
              <div v-else-if="item.preview">
                <q-btn
                  flat
                  dense
                  round
                  icon="picture_as_pdf"
                  color="primary"
                  @click.prevent.stop="openFile(item.preview)"
                />
              </div>
              <q-btn
                size="sm"
                outline
                padding="xs"
                icon="description"
                color="secondary"
                :label="displayName(item)"
                no-caps
                class="q-ma-sm text-muted"
                @click.prevent.stop="item.preview && openFile(item.preview)"
              />
              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                class="q-ml-sm"
                @click.prevent.stop="removeUploadedFile(index)"
              />
            </div>
            <q-icon
              :src="$filtersString.resolveUrl('img:icons/trash.svg')"
              size="0.8rem"
              class="text-muted"
              color="grey-4"
            />
          </div>
          <input
            type="file"
            ref="fileInput"
            style="display: none"
            @change="handleFileUpload"
            multiple
            accept=".jpg, .jpeg, .png, .pdf"
            class="col"
          />
        </div>
      </label-form>
    </div>

    <div class="row q-gutter-sm q-mt-xs">
      <label-form
        className="col"
        textLabel="Certidão de Casamento"
        helperText=".jpg, .png, .pdf — até 5MB"
      >
        <div class="row q-gutter-sm q-mt-xs" style="margin-top: 0; align-items: center">
          <q-btn
            label="Upload"
            color="primary"
            icon="upload"
            outline
            no-caps
            style="border-radius: 6px; border: 2px solid #00a3ff"
            @click="triggerFileInputCertidao"
          />
          <div class="" v-if="uploadedCertidao.length > 0">
            <div
              v-for="(item, index) in uploadedCertidao"
              :key="index"
              class="row items-center q-gutter-sm"
            >
              <div
                v-if="
                  item.preview &&
                  (String(item.preview).startsWith('data:image') ||
                    String(item.preview).match(/\.(jpe?g|png|gif)$/i))
                "
              >
                <img
                  :src="item.preview"
                  alt="preview"
                  style="width: 48px; height: 48px; object-fit: cover; border-radius: 4px"
                />
              </div>
              <div v-else-if="item.preview">
                <q-btn
                  flat
                  dense
                  round
                  icon="picture_as_pdf"
                  color="primary"
                  @click.prevent.stop="openFile(item.preview)"
                />
              </div>
              <q-btn
                size="sm"
                outline
                padding="xs"
                icon="description"
                color="secondary"
                :label="displayName(item)"
                no-caps
                class="q-ma-sm text-muted"
                @click.prevent.stop="item.preview && openFile(item.preview)"
              />
              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                class="q-ml-sm"
                @click.prevent.stop="removeUploadedCertidao(index)"
              />
            </div>
            <q-icon
              :src="$filtersString.resolveUrl('img:icons/trash.svg')"
              size="0.8rem"
              class="text-muted"
              color="grey-4"
            />
          </div>
          <input
            type="file"
            ref="fileCertidaoInput"
            style="display: none"
            @change="handleFileCertidao"
            multiple
            accept=".jpg, .jpeg, .png, .pdf"
            class="col-2"
          />
        </div>
      </label-form>
    </div>
  </q-form>
</template>
<script setup>
import labelForm from 'src/components/Form/LabelForm.vue'
import { defineComponent, ref, watch } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
import { storeToRefs } from 'pinia'
import useRules from 'src/composables/global/useRules'
import { titleCase } from 'src/utils/normalize'

const layoutStore = useLayoutStore()
const { clientEdit } = storeToRefs(layoutStore)
const { nameRule, emailRule, cpfRule, phoneRole } = useRules()
const uploadedFiles = ref([])
const uploadedCertidao = ref([])
// mapa temporário para associar dataURL -> nome original do arquivo selecionado
const pendingNames = new Map()
// refs for specific file inputs so each upload maps to its preview
const fileInput = ref(null)
const fileCertidaoInput = ref(null)
// RG uploads (usar arrays para seguir mesmo padrão de comprovantes/certidões)
const uploadedRgFront = ref([])
const uploadedRgBack = ref([])
const fileRgFrontInput = ref(null)
const fileRgBackInput = ref(null)
// password helpers for inline password field in personal data
const isPwd = ref(false)
const passwordRef = ref(null)
// error states for inline feedback
const nameError = ref(false)
const nameErrorMessage = ref('')
const emailError = ref(false)
const emailErrorMessage = ref('')
const cpfError = ref(false)
const cpfErrorMessage = ref('')
const birthError = ref(false)
const birthErrorMessage = ref('')

// simple validation helpers that run on input change
const evaluateRule = (rules, value) => {
  if (!rules || !Array.isArray(rules)) return { ok: true }
  for (const r of rules) {
    try {
      const res = r(value)
      if (res !== true) return { ok: false, message: res }
    } catch {
      return { ok: false, message: 'Valor inválido' }
    }
  }
  return { ok: true }
}

// validate on blur and clear errors on input
const onInputName = () => {
  nameError.value = false
  nameErrorMessage.value = ''
}

// Ensure name field is normalized (title-case) on blur as well
const onBlurName = () => {
  try {
    const val = clientEdit.value?.cliente?.name
    const res = evaluateRule(nameRule, val)
    nameError.value = !res.ok
    nameErrorMessage.value = res.ok ? '' : res.message
    // reuse generic text blur normalizer to apply title-case
    onBlurText('name')
  } catch (e) {
    void e
  }
}
const onInputEmail = () => {
  emailError.value = false
  emailErrorMessage.value = ''
}
const onBlurEmail = () => {
  const val = clientEdit.value?.cliente?.email
  const res = evaluateRule(emailRule, val)
  emailError.value = !res.ok
  emailErrorMessage.value = res.ok ? '' : res.message
}
const onInputCpf = () => {
  cpfError.value = false
  cpfErrorMessage.value = ''
}
const onBlurCpf = () => {
  const val = clientEdit.value?.cliente?.cpf
  const res = evaluateRule(cpfRule, val)
  cpfError.value = !res.ok
  cpfErrorMessage.value = res.ok ? '' : res.message
}
const onInputBirth = () => {
  birthError.value = false
  birthErrorMessage.value = ''
  // update computed age whenever birth changes
  try {
    let b = clientEdit.value && clientEdit.value.cliente && clientEdit.value.cliente.birth
    // If user typed birth in dd/mm/yyyy (common in pt-BR), convert to ISO yyyy-mm-dd
    if (typeof b === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(b)) {
      try {
        const parts = b.split('/')
        const day = parts[0].padStart(2, '0')
        const month = parts[1].padStart(2, '0')
        const year = parts[2]
        b = `${year}-${month}-${day}`
        clientEdit.value.cliente.birth = b
      } catch (e) {
        void e
      }
    }
    const age = computeAge(b)
    if (clientEdit && clientEdit.value && clientEdit.value.cliente) {
      clientEdit.value.cliente.age = age
    }
  } catch {
    /* ignore */
  }
}
const onBlurBirth = () => {
  try {
    // ensure displayed/stored birth is ISO (yyyy-mm-dd) if user entered dd/mm/yyyy
    const raw = clientEdit.value?.cliente?.birth
    if (typeof raw === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
      const [d, m, y] = raw.split('/')
      clientEdit.value.cliente.birth = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    }
  } catch (e) {
    void e
  }
  const val = clientEdit.value?.cliente?.birth
  const res = evaluateRule([(v) => !!v || 'Campo é obrigatorio.'], val)
  birthError.value = !res.ok
  birthErrorMessage.value = res.ok ? '' : res.message
}
// normalize telefone on blur: remove non-digits, allow user to omit leading +
const onBlurTelefone = () => {
  try {
    if (!clientEdit || !clientEdit.value || !clientEdit.value.cliente) return
    const t = clientEdit.value.cliente.telefone
    if (t == null) return
    const digits = String(t).replace(/\D/g, '')
    clientEdit.value.cliente.telefone = digits
  } catch (e) {
    void e
  }
}
const onBlurTelefoneContato = () => {
  try {
    if (!clientEdit || !clientEdit.value || !clientEdit.value.cliente) return
    const t = clientEdit.value.cliente.contato_telefone
    if (t == null) return
    const digits = String(t).replace(/\D/g, '')
    clientEdit.value.cliente.contato_telefone = digits
  } catch (e) {
    void e
  }
}

// Format patrimonio_valor on blur as 00.000.000,00 (pt-BR)
const formatNumberPtBr = (num) => {
  try {
    if (num == null || num === '') return ''
    const n =
      typeof num === 'number'
        ? num
        : Number(
            String(num)
              .replace(/[^0-9,.-]/g, '')
              .replace(/\./g, '')
              .replace(/,/, '.'),
          )
    if (!Number.isFinite(n)) return ''
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n)
  } catch {
    return ''
  }
}

const onBlurPatrimonio = () => {
  try {
    if (!clientEdit || !clientEdit.value || !clientEdit.value.cliente) return
    const v = clientEdit.value.cliente.patrimonio_valor
    const formatted = formatNumberPtBr(v)
    clientEdit.value.cliente.patrimonio_valor = formatted
  } catch (e) {
    void e
  }
}

// Generic text normalization: trim, collapse spaces, title-case; for UF fields uppercase
const onBlurText = (field) => {
  try {
    if (!clientEdit || !clientEdit.value || !clientEdit.value.cliente) return
    const obj = clientEdit.value.cliente
    let val = obj[field]
    if (val == null) return
    val = String(val).trim().replace(/\s+/g, ' ')
    if (
      /^(naturalidade_uf|rg_expedicao_uf|estado|estado_civil)$/i.test(field) ||
      /^[A-Za-z]{1,3}$/.test(val)
    ) {
      obj[field] = val.toUpperCase()
      return
    }
    // title case (use centralized titleCase util to match backend rules)
    try {
      obj[field] = titleCase(val)
    } catch {
      // fallback to simple capitalization
      obj[field] = val
        .split(' ')
        .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
        .join(' ')
    }
  } catch (e) {
    void e
  }
}
// Enforce text-only input on certain fields (remove digits/symbols except common name characters)
// variant that receives the emitted value directly (safer ordering with v-model)
const onInputTextProp = (field, emittedVal) => {
  try {
    if (!clientEdit || !clientEdit.value || !clientEdit.value.cliente) return
    const obj = clientEdit.value.cliente
    let val = emittedVal == null ? '' : String(emittedVal)
    val = val.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s\-']+/g, '')
    val = val.replace(/\s+/g, ' ').trim()
    obj[field] = val
  } catch (e) {
    void e
  }
}

// prevent typing non-letter characters in text fields like 'name'
const onKeydownText = (event) => {
  try {
    if (event.ctrlKey || event.metaKey) return
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Tab',
      'Enter',
      'Home',
      'End',
      ' ',
      '-',
      "'",
      '’',
    ]
    if (allowedKeys.includes(event.key)) return
    // allow letters (unicode)
    if (/^\p{L}$/u.test(event.key)) return
    event.preventDefault()
  } catch (e) {
    void e
  }
}

// handle paste into text fields: filter to letters, spaces, hyphen and apostrophe
const onPasteText = (field, event) => {
  try {
    const clipboardData = event.clipboardData || window.clipboardData
    const paste = clipboardData.getData('text') || ''
    const filtered = String(paste).replace(/[^\p{L}\s\-\u2019']+/gu, '')
    if (!filtered) {
      event.preventDefault()
      return
    }
    const target = event.target
    if (target && typeof target.selectionStart === 'number') {
      event.preventDefault()
      const start = target.selectionStart
      const end = target.selectionEnd
      const cur = String(target.value || '')
      const next = cur.slice(0, start) + filtered + cur.slice(end)
      if (!clientEdit.value) clientEdit.value = {}
      if (!clientEdit.value.cliente) clientEdit.value.cliente = {}
      clientEdit.value.cliente[field] = next.replace(/\s+/g, ' ').trim()
      const pos = start + filtered.length
      setTimeout(() => {
        try {
          target.setSelectionRange(pos, pos)
        } catch (e) {
          void e
        }
      }, 0)
    }
  } catch (e) {
    void e
  }
}

// Enforce numeric-only input; allowDecimal toggles acceptance of '.' and ','
const onInputNumeric = (field, allowDecimal = false) => {
  try {
    if (!clientEdit || !clientEdit.value || !clientEdit.value.cliente) return
    const obj = clientEdit.value.cliente
    let val = obj[field]
    if (val == null) return
    val = String(val)
    if (allowDecimal) {
      // allow digits, dot and comma
      val = val.replace(/[^0-9.,-]+/g, '')
    } else {
      val = val.replace(/\D+/g, '')
    }
    obj[field] = val
  } catch (e) {
    void e
  }
}
// Ensure any incoming phone values with leading '+' are normalized for display
watch(
  clientEdit,
  (n) => {
    try {
      if (!n || !n.cliente) return
      const c = n.cliente
      if (c.telefone && typeof c.telefone === 'string' && c.telefone.startsWith('+')) {
        c.telefone = String(c.telefone).replace(/\D/g, '')
      }
      if (
        c.contato_telefone &&
        typeof c.contato_telefone === 'string' &&
        c.contato_telefone.startsWith('+')
      ) {
        c.contato_telefone = String(c.contato_telefone).replace(/\D/g, '')
      }
    } catch (e) {
      void e
    }
  },
  { immediate: true, deep: true },
)
const optionsProfission = [
  { label: 'Engenheiro', value: 'engenheiro' },
  { label: 'Médico', value: 'medico' },
  { label: 'Professor', value: 'professor' },
  { label: 'Advogado', value: 'advogado' },
  { label: 'Outro', value: 'outro' },
]
// Abre arquivo (dataURL ou /storage URL) em nova aba
const openFile = (url) => {
  try {
    if (!url) return
    // se for caminho relativo '/storage', resolver para o host da API
    if (String(url).startsWith('data:')) {
      // criar blob e objectURL para abrir dataURL em nova aba
      try {
        const m = url.match(/^data:(.+?);base64,(.*)$/)
        if (m) {
          const base64 = m[2]
          const binary = atob(base64)
          const len = binary.length
          const bytes = new Uint8Array(len)
          for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i)
          const blob = new Blob([bytes], { type: m[1] })
          const objUrl = URL.createObjectURL(blob)
          window.open(objUrl, '_blank')
          // liberar objeto após algum tempo
          setTimeout(() => URL.revokeObjectURL(objUrl), 30000)
          return
        }
      } catch {
        // fallback to opening as-is
      }
    }
    const finalUrl = String(url).startsWith('/storage') ? resolveStorageUrl(url) : url
    window.open(finalUrl, '_blank')
  } catch (err) {
    if (typeof console !== 'undefined' && console.debug) console.debug('openFile failed', err)
  }
}
const rendaAnual = [
  { label: 'Até R$ 50.000,00', value: 'ate_50000' },
  { label: 'De R$ 50.000,00 a R$ 100.000,00', value: 'de_50000_a_100000' },
  { label: 'De R$ 100.000,00 a R$ 200.000,00', value: 'de_100000_a_200000' },
  { label: 'De R$ 200.000,00 a R$ 500.000,00', value: 'de_200000_a_500000' },
  { label: 'Acima de R$ 500.000,00', value: 'acima_de_500000' },
  { label: 'Não Informar', value: 'nao_informar' },
]
const generoOptions = [
  { label: 'Masculino', value: 'masculino' },
  { label: 'Feminino', value: 'feminino' },
  { label: 'Prefiro não informar', value: 'nao_informar' },
  { label: 'Outro', value: 'outro' },
]
const estadoCivilOptions = [
  { label: 'Solteiro(a)', value: 'solteiro' },
  { label: 'Casado(a)', value: 'casado' },
  { label: 'Divorciado(a)', value: 'divorciado' },
  { label: 'Viúvo(a)', value: 'viuvo' },
  { label: 'União Estável', value: 'uniao_estavel' },
]
// RG input triggers and handlers
const triggerRgFrontInput = () => {
  if (fileRgFrontInput.value) fileRgFrontInput.value.click()
}
const triggerRgBackInput = () => {
  if (fileRgBackInput.value) fileRgBackInput.value.click()
}

const handleFileRgFront = (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return
  const file = files[0]
  // upload immediately to server and set returned /storage url as field
  ;(async () => {
    try {
      const apiBase = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) || ''
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`${apiBase.replace(/\/$/, '')}/api/clients/upload`, {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) throw new Error('upload failed')
      const body = await res.json()
      const url = body && body.url ? body.url : null
      const name = (body && body.name) || file.name
      if (url) {
        // preserve mapping from storage url to original name
        try {
          pendingNames.set(url, name)
        } catch (e) {
          void e
        }
        const item = { file: file, name, preview: resolveStorageUrl(url), dataUrl: url }
        uploadedRgFront.value = [item]
        if (clientEdit && clientEdit.value) {
          if (!clientEdit.value.cliente) clientEdit.value.cliente = {}
          clientEdit.value.cliente.rg_frente = url
        }
      }
    } catch (err) {
      if (typeof console !== 'undefined' && console.debug)
        console.debug('rg front upload failed', err)
      // fallback to dataURL preview if upload fails
      const r = new FileReader()
      r.onload = async (e) => {
        const dataUrl = e.target.result
        try {
          if (file && file.name) pendingNames.set(dataUrl, file.name)
        } catch (err) {
          void err
        }
        // attempt to send base64 to backend fallback endpoint so we persist and get a /storage URL
        try {
          const apiBase =
            (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) || ''
          const res = await fetch(`${apiBase.replace(/\/$/, '')}/api/clients/upload-b64`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: file.name, data: dataUrl }),
          })
          if (res && res.ok) {
            const body = await res.json()
            const url = body && body.url ? body.url : null
            const name = (body && body.name) || file.name
            if (url) {
              try {
                pendingNames.set(url, name)
              } catch (e) {
                void e
              }
              const item = { file: file, name, preview: resolveStorageUrl(url), dataUrl: url }
              uploadedRgFront.value = [item]
              if (clientEdit && clientEdit.value) {
                if (!clientEdit.value.cliente) clientEdit.value.cliente = {}
                clientEdit.value.cliente.rg_frente = url
              }
              return
            }
          }
        } catch (err) {
          void err
        }
        // fallback to dataURL preview when backend b64 upload not available
        const item = {
          file: file,
          name: file.name || pendingNames.get(dataUrl) || 'rg_frente',
          preview: dataUrl,
          dataUrl,
        }
        uploadedRgFront.value = [item]
        if (clientEdit && clientEdit.value) {
          if (!clientEdit.value.cliente) clientEdit.value.cliente = {}
          clientEdit.value.cliente.rg_frente = dataUrl
        }
      }
      r.readAsDataURL(file)
    }
  })()
}

const handleFileRgBack = (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return
  const file = files[0]
  ;(async () => {
    try {
      const apiBase = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) || ''
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`${apiBase.replace(/\/$/, '')}/api/clients/upload`, {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) throw new Error('upload failed')
      const body = await res.json()
      const url = body && body.url ? body.url : null
      const name = (body && body.name) || file.name
      if (url) {
        try {
          pendingNames.set(url, name)
        } catch (e) {
          void e
        }
        const item = { file: file, name, preview: resolveStorageUrl(url), dataUrl: url }
        uploadedRgBack.value = [item]
        if (clientEdit && clientEdit.value) {
          if (!clientEdit.value.cliente) clientEdit.value.cliente = {}
          clientEdit.value.cliente.rg_verso = url
        }
      }
    } catch (err) {
      if (typeof console !== 'undefined' && console.debug)
        console.debug('rg back upload failed', err)
      const r = new FileReader()
      r.onload = async (e) => {
        const dataUrl = e.target.result
        try {
          if (file && file.name) pendingNames.set(dataUrl, file.name)
        } catch (err) {
          void err
        }
        try {
          const apiBase =
            (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) || ''
          const res = await fetch(`${apiBase.replace(/\/$/, '')}/api/clients/upload-b64`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: file.name, data: dataUrl }),
          })
          if (res && res.ok) {
            const body = await res.json()
            const url = body && body.url ? body.url : null
            const name = (body && body.name) || file.name
            if (url) {
              try {
                pendingNames.set(url, name)
              } catch (e) {
                void e
              }
              const item = { file: file, name, preview: resolveStorageUrl(url), dataUrl: url }
              uploadedRgBack.value = [item]
              if (clientEdit && clientEdit.value) {
                if (!clientEdit.value.cliente) clientEdit.value.cliente = {}
                clientEdit.value.cliente.rg_verso = url
              }
              return
            }
          }
        } catch (err) {
          void err
        }
        const item = {
          file: file,
          name: file.name || pendingNames.get(dataUrl) || 'rg_verso',
          preview: dataUrl,
          dataUrl,
        }
        uploadedRgBack.value = [item]
        if (clientEdit && clientEdit.value) {
          if (!clientEdit.value.cliente) clientEdit.value.cliente = {}
          clientEdit.value.cliente.rg_verso = dataUrl
        }
      }
      r.readAsDataURL(file)
    }
  })()
}

/* RG clear handlers replaced by removeUploadedRgFront/removeUploadedRgBack when using list UI */
// Função para disparar o clique no input de arquivo
const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click()
}

const triggerFileInputCertidao = () => {
  if (fileCertidaoInput.value) fileCertidaoInput.value.click()
}

// Função para lidar com o upload de arquivos
const handleFileUpload = async (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return
  const arr = Array.from(files)
  // attempt to upload each file immediately; fallback to dataURL preview on failure
  const uploaded = []
  await Promise.all(
    arr.map(async (f) => {
      try {
        const apiBase = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) || ''
        const fd = new FormData()
        fd.append('file', f)
        const res = await fetch(`${apiBase.replace(/\/$/, '')}/api/clients/upload`, {
          method: 'POST',
          body: fd,
        })
        if (!res.ok) throw new Error('upload failed')
        const body = await res.json()
        const url = body && body.url ? body.url : null
        const name = (body && body.name) || f.name
        if (url) {
          try {
            pendingNames.set(url, name)
          } catch (e) {
            void e
          }
          uploaded.push({ file: f, name, preview: resolveStorageUrl(url), dataUrl: url })
          return
        }
      } catch (err) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('file upload failed', err)
      }
      // fallback: read as dataURL and try backend b64 persistence
      const r = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (ev) => resolve(ev.target.result)
        reader.readAsDataURL(f)
      })
      try {
        if (f && f.name) pendingNames.set(r, f.name)
      } catch (e) {
        void e
      }
      try {
        const apiBase = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) || ''
        const res = await fetch(`${apiBase.replace(/\/$/, '')}/api/clients/upload-b64`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: f.name, data: r }),
        })
        if (res && res.ok) {
          const body = await res.json()
          const url = body && body.url ? body.url : null
          const name = (body && body.name) || f.name
          if (url) {
            try {
              pendingNames.set(url, name)
            } catch (e) {
              void e
            }
            uploaded.push({ file: f, name, preview: url, dataUrl: url })
            return
          }
        }
      } catch (err) {
        void err
      }
      uploaded.push({ file: f, name: f.name, preview: r, dataUrl: r })
    }),
  )
  uploadedFiles.value = uploaded
  try {
    if (clientEdit && clientEdit.value) {
      if (!clientEdit.value.cliente) clientEdit.value.cliente = {}
      const urls = uploaded.filter((x) => x.dataUrl).map((x) => x.dataUrl)
      if (urls.length === 1) clientEdit.value.cliente.comprovante_endereco = urls[0]
      else if (urls.length > 1) clientEdit.value.cliente.comprovante_endereco = urls
      else delete clientEdit.value.cliente.comprovante_endereco
    }
  } catch (err) {
    if (typeof console !== 'undefined' && console.debug)
      console.debug('persist comprovante_endereco failed', err)
  }
}
// Função para lidar com o upload de arquivos
const handleFileCertidao = async (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return
  const arr = Array.from(files)
  const uploaded = []
  await Promise.all(
    arr.map(async (f) => {
      try {
        const apiBase = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) || ''
        const fd = new FormData()
        fd.append('file', f)
        const res = await fetch(`${apiBase.replace(/\/$/, '')}/api/clients/upload`, {
          method: 'POST',
          body: fd,
        })
        if (!res.ok) throw new Error('upload failed')
        const body = await res.json()
        const url = body && body.url ? body.url : null
        const name = (body && body.name) || f.name
        if (url) {
          try {
            pendingNames.set(url, name)
          } catch (e) {
            void e
          }
          uploaded.push({ file: f, name, preview: resolveStorageUrl(url), dataUrl: url })
          return
        }
      } catch (err) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('certidao upload failed', err)
      }
      const r = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (ev) => resolve(ev.target.result)
        reader.readAsDataURL(f)
      })
      try {
        if (f && f.name) pendingNames.set(r, f.name)
      } catch (e) {
        void e
      }
      try {
        const apiBase = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) || ''
        const res = await fetch(`${apiBase.replace(/\/$/, '')}/api/clients/upload-b64`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: f.name, data: r }),
        })
        if (res && res.ok) {
          const body = await res.json()
          const url = body && body.url ? body.url : null
          const name = (body && body.name) || f.name
          if (url) {
            try {
              pendingNames.set(url, name)
            } catch (e) {
              void e
            }
            uploaded.push({ file: f, name, preview: url, dataUrl: url })
            return
          }
        }
      } catch (err) {
        void err
      }
      uploaded.push({ file: f, name: f.name, preview: r, dataUrl: r })
    }),
  )
  uploadedCertidao.value = uploaded
  try {
    if (clientEdit && clientEdit.value) {
      if (!clientEdit.value.cliente) clientEdit.value.cliente = {}
      const urls = uploaded.filter((x) => x.dataUrl).map((x) => x.dataUrl)
      if (urls.length === 1) clientEdit.value.cliente.certidao_casamento = urls[0]
      else if (urls.length > 1) clientEdit.value.cliente.certidao_casamento = urls
      else delete clientEdit.value.cliente.certidao_casamento
    }
  } catch (err) {
    if (typeof console !== 'undefined' && console.debug)
      console.debug('persist certidao_casamento failed', err)
  }
}
const removeUploadedFile = (index) => {
  try {
    const arr = Array.isArray(uploadedFiles.value) ? [...uploadedFiles.value] : []
    arr.splice(index, 1)
    uploadedFiles.value = arr
    // if no files left, clear native input
    if (!arr.length && fileInput.value) fileInput.value.value = null
    // update clientEdit payload
    try {
      if (clientEdit && clientEdit.value && clientEdit.value.cliente) {
        const urls = arr.filter((x) => x.dataUrl).map((x) => x.dataUrl)
        if (urls.length === 1) clientEdit.value.cliente.comprovante_endereco = urls[0]
        else if (urls.length > 1) clientEdit.value.cliente.comprovante_endereco = urls
        else delete clientEdit.value.cliente.comprovante_endereco
      }
    } catch (err) {
      if (typeof console !== 'undefined' && console.debug)
        console.debug('remove comprovante_endereco update failed', err)
    }
  } catch {
    // ignore
  }
}
const removeUploadedCertidao = (index) => {
  try {
    const arr = Array.isArray(uploadedCertidao.value) ? [...uploadedCertidao.value] : []
    arr.splice(index, 1)
    uploadedCertidao.value = arr
    if (!arr.length && fileCertidaoInput.value) fileCertidaoInput.value.value = null
    // update clientEdit payload for certidao
    try {
      if (clientEdit && clientEdit.value && clientEdit.value.cliente) {
        const urls = arr.filter((x) => x.dataUrl).map((x) => x.dataUrl)
        if (urls.length === 1) clientEdit.value.cliente.certidao_casamento = urls[0]
        else if (urls.length > 1) clientEdit.value.cliente.certidao_casamento = urls
        else delete clientEdit.value.cliente.certidao_casamento
      }
    } catch (err) {
      if (typeof console !== 'undefined' && console.debug)
        console.debug('remove certidao_casamento update failed', err)
    }
  } catch {
    // ignore
  }
}
const removeUploadedRgFront = (index) => {
  try {
    const arr = Array.isArray(uploadedRgFront.value) ? [...uploadedRgFront.value] : []
    arr.splice(index, 1)
    uploadedRgFront.value = arr
    if (!arr.length && fileRgFrontInput.value) fileRgFrontInput.value.value = null
    try {
      if (clientEdit && clientEdit.value && clientEdit.value.cliente) {
        const urls = arr.filter((x) => x.dataUrl).map((x) => x.dataUrl)
        if (urls.length === 1) clientEdit.value.cliente.rg_frente = urls[0]
        else if (urls.length > 1) clientEdit.value.cliente.rg_frente = urls
        else delete clientEdit.value.cliente.rg_frente
      }
    } catch (err) {
      if (typeof console !== 'undefined' && console.debug)
        console.debug('remove rg_frente update failed', err)
    }
  } catch {
    // ignore
  }
}
const removeUploadedRgBack = (index) => {
  try {
    const arr = Array.isArray(uploadedRgBack.value) ? [...uploadedRgBack.value] : []
    arr.splice(index, 1)
    uploadedRgBack.value = arr
    if (!arr.length && fileRgBackInput.value) fileRgBackInput.value.value = null
    try {
      if (clientEdit && clientEdit.value && clientEdit.value.cliente) {
        const urls = arr.filter((x) => x.dataUrl).map((x) => x.dataUrl)
        if (urls.length === 1) clientEdit.value.cliente.rg_verso = urls[0]
        else if (urls.length > 1) clientEdit.value.cliente.rg_verso = urls
        else delete clientEdit.value.cliente.rg_verso
      }
    } catch (err) {
      if (typeof console !== 'undefined' && console.debug)
        console.debug('remove rg_verso update failed', err)
    }
  } catch {
    // ignore
  }
}
// Foto avatar handlers
const uploadedPhoto = ref(null)
const filePhotoInput = ref(null)
const triggerPhotoInput = () => {
  if (filePhotoInput.value) filePhotoInput.value.click()
}
const handleFilePhoto = (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return
  const file = files[0]
  // preview as data URL
  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedPhoto.value = e.target.result
    // also store avatar url/data into clientEdit object so backend can see it
    if (clientEdit && clientEdit.value) {
      if (!clientEdit.value.cliente) clientEdit.value.cliente = {}
      clientEdit.value.cliente.avatar = e.target.result
    }
  }
  reader.readAsDataURL(file)
}
const clearPhoto = () => {
  uploadedPhoto.value = null
  if (
    clientEdit &&
    clientEdit.value &&
    clientEdit.value.cliente &&
    clientEdit.value.cliente.avatar
  ) {
    delete clientEdit.value.cliente.avatar
  }
  if (filePhotoInput.value) filePhotoInput.value.value = null
}

// Sync previews from clientEdit when editing an existing client
function resolveStorageUrl(u) {
  try {
    if (!u) return u
    if (typeof u === 'string' && u.startsWith('/storage')) {
      const apiBase =
        (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
        (import.meta && import.meta.env && import.meta.env.DEV ? '' : 'http://localhost:3333')
      return `${String(apiBase).replace(/\/$/, '')}${u}`
    }
    return u
  } catch {
    return u
  }
}
// Helper to present a friendly/short filename for uploaded items
const displayName = (item) => {
  try {
    if (!item) return ''
    // prefer explicit name if sensible
    const n = item.name || ''
    if (typeof n === 'string' && n && !n.startsWith('data:') && n.length < 100) return n

    // if file object exists, prefer its original filename
    if (item.file && item.file.name) return item.file.name

    // if we have a dataUrl and preserved pending name, use it
    if (item.dataUrl && pendingNames.has(item.dataUrl)) return pendingNames.get(item.dataUrl)

    // prefer basename of preview if it's a storage url
    const preview = item.preview || item.dataUrl || n
    if (preview && typeof preview === 'string' && preview.startsWith('/storage')) {
      const parts = preview.split('/')
      return parts[parts.length - 1] || 'arquivo'
    }

    // if name looks like data:..., infer extension from mime
    if (typeof n === 'string' && n.startsWith('data:')) {
      const m = n.match(/^data:(.+?);base64,/) || []
      const mime = m[1]
      const ext = mime ? mime.split('/')[1] || 'bin' : 'bin'
      return `arquivo.${ext}`
    }

    // fallback: truncate long names
    if (typeof n === 'string' && n.length > 80) return `${n.slice(0, 40)}…${n.slice(-20)}`
    return String(n || 'arquivo')
  } catch (e) {
    void e
    return ''
  }
}
watch(
  () => clientEdit.value && clientEdit.value.cliente,
  (cliente) => {
    try {
      // avatar (check nested and top-level variants)
      const avatarVal =
        (cliente && cliente.avatar) ||
        (cliente && cliente.avatar_url) ||
        (cliente && cliente.photo) ||
        (clientEdit.value && clientEdit.value.avatar) ||
        (clientEdit.value && clientEdit.value.avatar_url)
      if (avatarVal) uploadedPhoto.value = resolveStorageUrl(avatarVal)
      else uploadedPhoto.value = null
      // comprovante_endereco may be string or array
      const comp = cliente && cliente.comprovante_endereco
      if (comp) {
        const arr = Array.isArray(comp) ? comp : [comp]
        const nameFromUrl = (u) => {
          try {
            if (!u) return 'document'
            if (typeof u === 'string' && u.startsWith('data:')) {
              // if user just selected this file, use preserved original name
              const pn = pendingNames.get(u)
              if (pn) return pn
              // if we have an uploadedFiles entry for this dataUrl with original file, prefer that name
              try {
                const found = (uploadedFiles.value || []).find(
                  (it) => it && it.dataUrl === u && it.file && it.file.name,
                )
                if (found && found.file && found.file.name) return found.file.name
              } catch (e) {
                void e
              }
              const m = u.match(/^data:(.+?);base64,/) || []
              const mime = m[1]
              const ext = mime ? mime.split('/')[1] || 'bin' : 'bin'
              return `arquivo.${ext}`
            }
            if (typeof u === 'string') {
              const parts = u.split('/')
              return parts[parts.length - 1] || 'document'
            }
            return 'document'
          } catch {
            return 'document'
          }
        }
        uploadedFiles.value = arr.map((u) => ({
          file: null,
          name: nameFromUrl(u),
          preview: resolveStorageUrl(u),
          dataUrl: u,
        }))
      } else {
        uploadedFiles.value = []
      }
      // certidao_casamento
      const cert = cliente && cliente.certidao_casamento
      if (cert) {
        const arr2 = Array.isArray(cert) ? cert : [cert]
        uploadedCertidao.value = arr2.map((u) => ({
          file: null,
          name: (function nameFromUrl2(u) {
            try {
              if (!u) return 'certidao'
              if (typeof u === 'string' && u.startsWith('data:')) {
                const pn = pendingNames.get(u)
                if (pn) return pn
                try {
                  const found = (uploadedCertidao.value || []).find(
                    (it) => it && it.dataUrl === u && it.file && it.file.name,
                  )
                  if (found && found.file && found.file.name) return found.file.name
                } catch (e) {
                  void e
                }
                const m = u.match(/^data:(.+?);base64,/) || []
                const mime = m[1]
                const ext = mime ? mime.split('/')[1] || 'bin' : 'bin'
                return `certidao.${ext}`
              }
              if (typeof u === 'string') {
                const parts = u.split('/')
                return parts[parts.length - 1] || 'certidao'
              }
              return 'certidao'
            } catch {
              return 'certidao'
            }
          })(u),
          preview: resolveStorageUrl(u),
          dataUrl: u,
        }))
      } else {
        uploadedCertidao.value = []
      }
      // RG frente/verso (mapear para arrays de items compatíveis com outros uploads)
      try {
        const rgf = cliente && cliente.rg_frente
        const rgv = cliente && cliente.rg_verso
        const makeName = (u, fallback) => {
          try {
            if (!u) return fallback
            if (typeof u === 'string' && u.startsWith('data:')) {
              const pn = pendingNames.get(u)
              if (pn) return pn
              try {
                const found = (uploadedRgFront.value || [])
                  .concat(uploadedRgBack.value || [])
                  .find((it) => it && it.dataUrl === u && it.file && it.file.name)
                if (found && found.file && found.file.name) return found.file.name
              } catch (e) {
                void e
              }
              const m = u.match(/^data:(.+?);base64,/) || []
              const mime = m[1]
              const ext = mime ? mime.split('/')[1] || 'bin' : 'bin'
              return `${fallback}.${ext}`
            }
            if (typeof u === 'string') {
              const parts = u.split('/')
              return parts[parts.length - 1] || fallback
            }
            return fallback
          } catch {
            return fallback
          }
        }

        if (rgf) {
          const arr = Array.isArray(rgf) ? rgf : [rgf]
          uploadedRgFront.value = arr.map((u) => ({
            file: null,
            name: makeName(u, 'rg_frente'),
            preview: resolveStorageUrl(u),
            dataUrl: u,
          }))
        } else {
          uploadedRgFront.value = []
        }

        if (rgv) {
          const arr2 = Array.isArray(rgv) ? rgv : [rgv]
          uploadedRgBack.value = arr2.map((u) => ({
            file: null,
            name: makeName(u, 'rg_verso'),
            preview: resolveStorageUrl(u),
            dataUrl: u,
          }))
        } else {
          uploadedRgBack.value = []
        }
      } catch (e) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('sync rg previews failed', e)
      }
    } catch (err) {
      if (typeof console !== 'undefined' && console.debug)
        console.debug('sync clientEdit previews failed', err)
    }
  },
  { immediate: true, deep: true },
)
defineComponent({
  name: 'PersonalDataLayout',
})

// helper: compute age in years from date string (ISO or yyyy-mm-dd)
function computeAge(birth) {
  try {
    if (!birth) return null
    const d = new Date(birth)
    if (isNaN(d.getTime())) return null
    const today = new Date()
    let age = today.getFullYear() - d.getFullYear()
    const m = today.getMonth() - d.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--
    return age
  } catch {
    return null
  }
}

// expose computed display and numeric age via top-level computed refs
import { computed } from 'vue'
const computedAge = computed(() => {
  try {
    const b = clientEdit.value && clientEdit.value.cliente && clientEdit.value.cliente.birth
    return computeAge(b)
  } catch {
    return null
  }
})
const computedAgeDisplay = computed(() => {
  const a = computedAge.value
  return a === null || a === undefined ? '-' : `${a} anos`
})

// numeric age is available via computedAge.value when needed by parents
</script>

<style scoped>
/* Force three columns per row for the personal data form on medium+ screens.
   This ensures columns render as 33.33% even if some global styles interfere. */
@media (min-width: 960px) {
  /* Apply sizing only to the column wrapper so children can fill it */
  .PersonalDataLayout .row > .col-12.col-sm-4 {
    flex: 0 0 33.3333% !important;
    max-width: 33.3333% !important;
  }
}

/* Ensure label wrapper fills the column */
.PersonalDataLayout .row > div[class*='col-'] > .LabelForm {
  width: 100%;
}
</style>
