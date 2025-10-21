<template>
  <div class="UploadPersonaLayout">
    <!-- Upload de Declaração IRPJ -->

    <label-form
      className="q-mt-sm"
      textLabel="Declaração IRPJ"
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
              :label="item.name"
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
        </div>
        <input
          type="file"
          ref="fileInputDeclaraoIrpj"
          style="display: none"
          @change="handleFileUpload"
          multiple
          accept=".jpg, .jpeg, .png, .pdf"
          class="col upload-declarao-irpj"
        />
      </div>
    </label-form>
    <!-- Upload de Recibo IRPJ -->

    <label-form className="q-mt-sm" textLabel="Recibo IRPJ" helperText=".jpg, .png, .pdf — até 5MB">
      <div class="row q-gutter-sm q-mt-xs" style="margin-top: 0; align-items: center">
        <q-btn
          label="Upload"
          color="primary"
          icon="upload"
          outline
          no-caps
          style="border-radius: 6px; border: 2px solid #00a3ff"
          @click="triggerFileInputIrpjRecibo"
        />
        <div class="" v-if="uploadedIrpjRecibo.length > 0">
          <div
            v-for="(item, index) in uploadedIrpjRecibo"
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
              :label="item.name"
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
              @click.prevent.stop="removeUploadedIrpjRecibo(index)"
            />
          </div>
        </div>
        <input
          type="file"
          ref="fileInputReciboIrpj"
          style="display: none"
          @change="handleFileUploadIrpjRecibo"
          multiple
          accept=".jpg, .jpeg, .png, .pdf"
          class="col upload-recibo-irpj"
        />
      </div>
    </label-form>

    <!-- Upload de Pro Labore -->

    <label-form className="q-mt-sm" textLabel="Pro Labore" helperText=".jpg, .png, .pdf — até 5MB">
      <div class="row q-gutter-sm q-mt-xs" style="margin-top: 0; align-items: center">
        <q-btn
          label="Upload"
          color="primary"
          icon="upload"
          outline
          no-caps
          style="border-radius: 6px; border: 2px solid #00a3ff"
          @click="triggerFileInputLabore"
        />
        <div class="" v-if="uploadLabore.length > 0">
          <div
            v-for="(item, index) in uploadLabore"
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
              :label="item.name"
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
              @click.prevent.stop="removeUploadLabore(index)"
            />
          </div>
        </div>
        <input
          type="file"
          ref="fileInputLabore"
          style="display: none"
          @change="handleFileUploadLabore"
          multiple
          accept=".jpg, .jpeg, .png, .pdf"
          class="col upload-labore"
        />
      </div>
    </label-form>

    <!-- Upload de  Faturamento dos últimos 9 meses-->

    <label-form
      className="q-mt-sm"
      textLabel="Faturamento dos últimos 9 meses"
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
          @click="triggerFileInputFaturamento"
        />
        <div class="" v-if="uploadedFaturamento.length > 0">
          <div
            v-for="(item, index) in uploadedFaturamento"
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
              :label="item.name"
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
              @click.prevent.stop="removeUploadedFaturamento(index)"
            />
          </div>
        </div>
        <input
          type="file"
          ref="fileInputFaturamento"
          style="display: none"
          @change="handleFileUploadFaturamento"
          multiple
          accept=".jpg, .jpeg, .png, .pdf"
          class="col upload-faturamento"
        />
      </div>
    </label-form>
    <!-- Upload de  Extrato bancário dos útimos 9 meses-->

    <label-form
      className="q-mt-sm"
      textLabel="Extrato bancário dos útimos 9 meses"
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
          @click="triggerFileInputExtrato"
        />
        <div class="" v-if="uploadedExtrato.length > 0">
          <div
            v-for="(item, index) in uploadedExtrato"
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
              :label="item.name"
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
              @click.prevent.stop="removeUploadedExtrato(index)"
            />
          </div>
        </div>
        <input
          type="file"
          ref="fileInputExtrato"
          style="display: none"
          @change="handleFileUploadExtrato"
          multiple
          accept=".jpg, .jpeg, .png, .pdf"
          class="col upload-extrato"
        />
      </div>
    </label-form>
    <!-- Upload de  Pagamento DAS-->

    <label-form className="q-mt-sm" textLabel="PGDAS" helperText=".jpg, .png, .pdf — até 5MB">
      <div class="row q-gutter-sm q-mt-xs" style="margin-top: 0; align-items: center">
        <q-btn
          label="Upload"
          color="primary"
          icon="upload"
          outline
          no-caps
          style="border-radius: 6px; border: 2px solid #00a3ff"
          @click="triggerFileInputDas"
        />
        <div class="" v-if="uploadedDas.length > 0">
          <div
            v-for="(item, index) in uploadedDas"
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
              :label="item.name"
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
              @click.prevent.stop="removeUploadedDas(index)"
            />
          </div>
        </div>
        <input
          type="file"
          ref="fileInputDas"
          style="display: none"
          @change="handleFileUploadDas"
          multiple
          accept=".jpg, .jpeg, .png, .pdf"
          class="col upload-das"
        />
      </div>
    </label-form>
    <!-- Upload de Comprovante Residencia da Empresa-->

    <label-form
      className="q-mt-sm"
      textLabel="Comprovante de Endereço da Empresa"
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
          @click="triggerFileInputCEmpresa"
        />
        <div class="" v-if="uploadedCEmpresa.length > 0">
          <div
            v-for="(item, index) in uploadedCEmpresa"
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
              :label="item.name"
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
              @click.prevent.stop="removeUploadedCEmpresa(index)"
            />
          </div>
        </div>
        <input
          type="file"
          ref="fileInputCEmpresa"
          style="display: none"
          @change="handleFileUploadCEmpresa"
          multiple
          accept=".jpg, .jpeg, .png, .pdf"
          class="col upload-compromante-empresa"
        />
      </div>
    </label-form>
  </div>
</template>
<script setup>
import LabelForm from 'src/components/Form/LabelForm.vue'
import { defineComponent, ref, watch } from 'vue'
import { useLayoutStore } from 'src/stores/layout'
import { storeToRefs } from 'pinia'

defineComponent({
  name: 'UploadPersonaLayout',
})

const layoutStore = useLayoutStore()
const { clientEdit } = storeToRefs(layoutStore)

const pendingNames = new Map()

// file input refs to avoid document.querySelector collisions
const fileInputDeclaraoIrpj = ref(null)
const fileInputReciboIrpj = ref(null)
const fileInputLabore = ref(null)
const fileInputFaturamento = ref(null)
const fileInputExtrato = ref(null)
const fileInputDas = ref(null)
const fileInputCEmpresa = ref(null)

const uploadedFiles = ref([])
const uploadedIrpjRecibo = ref([])
const uploadLabore = ref([])
const uploadedFaturamento = ref([])
const uploadedExtrato = ref([])
const uploadedDas = ref([])
const uploadedCEmpresa = ref([])

function resolveStorageUrl(u) {
  try {
    if (!u) return u
    if (typeof u === 'string' && u.startsWith('/storage')) {
      const apiBase =
        (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
        'http://localhost:3333'
      return `${String(apiBase).replace(/\/$/, '')}${u}`
    }
    return u
  } catch {
    return u
  }
}

const triggerFileInput = () => {
  if (fileInputDeclaraoIrpj.value) fileInputDeclaraoIrpj.value.click()
}
const handleFileUpload = (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return
  const arr = Array.from(files)
  const items = arr.map((f) => ({ file: f, name: f.name, preview: null, dataUrl: null }))
  items.forEach((it, idx) => {
    const r = new FileReader()
    r.onload = (ev) => {
      items[idx].preview = ev.target.result
      items[idx].dataUrl = ev.target.result
      try {
        if (items[idx] && items[idx].file && items[idx].file.name)
          pendingNames.set(items[idx].dataUrl, items[idx].file.name)
      } catch (err) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('pendingNames set failed', err)
      }
      uploadedFiles.value = items
      try {
        if (clientEdit && clientEdit.value) {
          if (!clientEdit.value.cliente) clientEdit.value.cliente = {}
          const urls = items.filter((x) => x.dataUrl).map((x) => x.dataUrl)
          if (urls.length === 1) clientEdit.value.cliente.irpj = urls[0]
          else if (urls.length > 1) clientEdit.value.cliente.irpj = urls
          else delete clientEdit.value.cliente.irpj
        }
      } catch (err) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('persist irpj failed', err)
      }
    }
    r.readAsDataURL(it.file)
  })
  uploadedFiles.value = items
}

const triggerFileInputIrpjRecibo = () => {
  if (fileInputReciboIrpj.value) fileInputReciboIrpj.value.click()
}
const handleFileUploadIrpjRecibo = (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return
  const arr = Array.from(files)
  const items = arr.map((f) => ({ file: f, name: f.name, preview: null, dataUrl: null }))
  items.forEach((it, idx) => {
    const r = new FileReader()
    r.onload = (ev) => {
      items[idx].preview = ev.target.result
      items[idx].dataUrl = ev.target.result
      try {
        if (items[idx] && items[idx].file && items[idx].file.name)
          pendingNames.set(items[idx].dataUrl, items[idx].file.name)
      } catch (err) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('pendingNames set failed', err)
      }
      uploadedIrpjRecibo.value = items
      try {
        if (clientEdit && clientEdit.value) {
          if (!clientEdit.value.cliente) clientEdit.value.cliente = {}
          const urls = items.filter((x) => x.dataUrl).map((x) => x.dataUrl)
          if (urls.length === 1) clientEdit.value.cliente.irpj_recibo = urls[0]
          else if (urls.length > 1) clientEdit.value.cliente.irpj_recibo = urls
          else delete clientEdit.value.cliente.irpj_recibo
        }
      } catch (err) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('persist irpj_recibo failed', err)
      }
    }
    r.readAsDataURL(it.file)
  })
  uploadedIrpjRecibo.value = items
}

const triggerFileInputLabore = () => {
  if (fileInputLabore.value) fileInputLabore.value.click()
}
const handleFileUploadLabore = (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return
  const arr = Array.from(files)
  const items = arr.map((f) => ({ file: f, name: f.name, preview: null, dataUrl: null }))
  items.forEach((it, idx) => {
    const r = new FileReader()
    r.onload = (ev) => {
      items[idx].preview = ev.target.result
      items[idx].dataUrl = ev.target.result
      try {
        if (items[idx] && items[idx].file && items[idx].file.name)
          pendingNames.set(items[idx].dataUrl, items[idx].file.name)
      } catch (err) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('pendingNames set failed', err)
      }
      uploadLabore.value = items
      try {
        if (clientEdit && clientEdit.value) {
          if (!clientEdit.value.cliente) clientEdit.value.cliente = {}
          const urls = items.filter((x) => x.dataUrl).map((x) => x.dataUrl)
          if (urls.length === 1) clientEdit.value.cliente.pro_labore = urls[0]
          else if (urls.length > 1) clientEdit.value.cliente.pro_labore = urls
          else delete clientEdit.value.cliente.pro_labore
        }
      } catch (err) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('persist pro_labore failed', err)
      }
    }
    r.readAsDataURL(it.file)
  })
  uploadLabore.value = items
}

const triggerFileInputFaturamento = () => {
  if (fileInputFaturamento.value) fileInputFaturamento.value.click()
}
const handleFileUploadFaturamento = (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return
  const arr = Array.from(files)
  const items = arr.map((f) => ({ file: f, name: f.name, preview: null, dataUrl: null }))
  items.forEach((it, idx) => {
    const r = new FileReader()
    r.onload = (ev) => {
      items[idx].preview = ev.target.result
      items[idx].dataUrl = ev.target.result
      try {
        if (items[idx] && items[idx].file && items[idx].file.name)
          pendingNames.set(items[idx].dataUrl, items[idx].file.name)
      } catch (err) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('pendingNames set failed', err)
      }
      uploadedFaturamento.value = items
      try {
        if (clientEdit && clientEdit.value) {
          if (!clientEdit.value.cliente) clientEdit.value.cliente = {}
          const urls = items.filter((x) => x.dataUrl).map((x) => x.dataUrl)
          if (urls.length === 1) clientEdit.value.cliente.faturamento = urls[0]
          else if (urls.length > 1) clientEdit.value.cliente.faturamento = urls
          else delete clientEdit.value.cliente.faturamento
        }
      } catch (err) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('persist faturamento failed', err)
      }
    }
    r.readAsDataURL(it.file)
  })
  uploadedFaturamento.value = items
}
const triggerFileInputExtrato = () => {
  if (fileInputExtrato.value) fileInputExtrato.value.click()
}
const handleFileUploadExtrato = (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return
  const arr = Array.from(files)
  const items = arr.map((f) => ({ file: f, name: f.name, preview: null, dataUrl: null }))
  // assign early so UI updates even if FileReader has issues
  if (typeof console !== 'undefined' && console.debug)
    console.debug(
      'handleFileUploadExtrato called, items:',
      items.map((i) => i.name),
    )
  uploadedExtrato.value = items
  try {
    items.forEach((it, idx) => {
      try {
        const r = new FileReader()
        r.onload = (ev) => {
          items[idx].preview = ev.target.result
          items[idx].dataUrl = ev.target.result
          try {
            if (items[idx] && items[idx].file && items[idx].file.name)
              pendingNames.set(items[idx].dataUrl, items[idx].file.name)
          } catch (err) {
            if (typeof console !== 'undefined' && console.debug)
              console.debug('pendingNames set failed', err)
          }
          // update reactive array reference to ensure reactivity for deep changes
          uploadedExtrato.value = [...items]
          try {
            if (clientEdit && clientEdit.value) {
              if (!clientEdit.value.cliente) clientEdit.value.cliente = {}
              const urls = items.filter((x) => x.dataUrl).map((x) => x.dataUrl)
              if (urls.length === 1) clientEdit.value.cliente.extrato_empresa = urls[0]
              else if (urls.length > 1) clientEdit.value.cliente.extrato_empresa = urls
              else delete clientEdit.value.cliente.extrato_empresa
            }
          } catch (err) {
            if (typeof console !== 'undefined' && console.debug)
              console.debug('persist extrato_empresa failed', err)
          }
        }
        r.readAsDataURL(it.file)
      } catch (innerErr) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('readAsDataURL failed for an item', innerErr)
      }
    })
  } catch (err) {
    if (typeof console !== 'undefined' && console.debug)
      console.debug('handleFileUploadExtrato failed', err)
  }
  // reset the input so same file can be selected again if needed
  try {
    if (event && event.target) event.target.value = null
  } catch (e) {
    if (typeof console !== 'undefined' && console.debug) console.debug('reset input failed', e)
  }
}
const triggerFileInputDas = () => {
  if (fileInputDas.value) fileInputDas.value.click()
}
const handleFileUploadDas = (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return
  const arr = Array.from(files)
  const items = arr.map((f) => ({ file: f, name: f.name, preview: null, dataUrl: null }))
  items.forEach((it, idx) => {
    const r = new FileReader()
    r.onload = (ev) => {
      items[idx].preview = ev.target.result
      items[idx].dataUrl = ev.target.result
      try {
        if (items[idx] && items[idx].file && items[idx].file.name)
          pendingNames.set(items[idx].dataUrl, items[idx].file.name)
      } catch (err) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('pendingNames set failed', err)
      }
      uploadedDas.value = items
      try {
        if (clientEdit && clientEdit.value) {
          if (!clientEdit.value.cliente) clientEdit.value.cliente = {}
          const urls = items.filter((x) => x.dataUrl).map((x) => x.dataUrl)
          if (urls.length === 1) clientEdit.value.cliente.das = urls[0]
          else if (urls.length > 1) clientEdit.value.cliente.das = urls
          else delete clientEdit.value.cliente.das
        }
      } catch (err) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('persist das failed', err)
      }
    }
    r.readAsDataURL(it.file)
  })
  uploadedDas.value = items
}
const triggerFileInputCEmpresa = () => {
  if (fileInputCEmpresa.value) fileInputCEmpresa.value.click()
}
const handleFileUploadCEmpresa = (event) => {
  const files = event.target.files
  if (!files || files.length === 0) return
  const arr = Array.from(files)
  const items = arr.map((f) => ({ file: f, name: f.name, preview: null, dataUrl: null }))
  items.forEach((it, idx) => {
    const r = new FileReader()
    r.onload = (ev) => {
      items[idx].preview = ev.target.result
      items[idx].dataUrl = ev.target.result
      try {
        if (items[idx] && items[idx].file && items[idx].file.name)
          pendingNames.set(items[idx].dataUrl, items[idx].file.name)
      } catch (err) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('pendingNames set failed', err)
      }
      uploadedCEmpresa.value = items
      try {
        if (clientEdit && clientEdit.value) {
          if (!clientEdit.value.cliente) clientEdit.value.cliente = {}
          const urls = items.filter((x) => x.dataUrl).map((x) => x.dataUrl)
          if (urls.length === 1) clientEdit.value.cliente.comprovante_endereco_empresa = urls[0]
          else if (urls.length > 1) clientEdit.value.cliente.comprovante_endereco_empresa = urls
          else delete clientEdit.value.cliente.comprovante_endereco_empresa
        }
      } catch (err) {
        if (typeof console !== 'undefined' && console.debug)
          console.debug('persist comprovante_endereco_empresa failed', err)
      }
    }
    r.readAsDataURL(it.file)
  })
  uploadedCEmpresa.value = items
}

const openFile = (url) => {
  try {
    if (!url) return
    if (String(url).startsWith('data:')) {
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
        setTimeout(() => URL.revokeObjectURL(objUrl), 30000)
        return
      }
    }
    window.open(url, '_blank')
  } catch (err) {
    if (typeof console !== 'undefined' && console.debug) console.debug('openFile failed', err)
  }
}

// removal helpers
const removeUploadedFile = (idx) => {
  uploadedFiles.value = uploadedFiles.value.filter((_, i) => i !== idx)
  try {
    if (clientEdit && clientEdit.value && clientEdit.value.cliente) {
      const urls = uploadedFiles.value.filter((x) => x.dataUrl).map((x) => x.dataUrl)
      if (urls.length === 1) clientEdit.value.cliente.irpj = urls[0]
      else if (urls.length > 1) clientEdit.value.cliente.irpj = urls
      else delete clientEdit.value.cliente.irpj
    }
  } catch (e) {
    if (typeof console !== 'undefined' && console.debug)
      console.debug('removeUploadedFile failed', e)
  }
}

const removeUploadedIrpjRecibo = (idx) => {
  uploadedIrpjRecibo.value = uploadedIrpjRecibo.value.filter((_, i) => i !== idx)
  try {
    if (clientEdit && clientEdit.value && clientEdit.value.cliente) {
      const urls = uploadedIrpjRecibo.value.filter((x) => x.dataUrl).map((x) => x.dataUrl)
      if (urls.length === 1) clientEdit.value.cliente.irpj_recibo = urls[0]
      else if (urls.length > 1) clientEdit.value.cliente.irpj_recibo = urls
      else delete clientEdit.value.cliente.irpj_recibo
    }
  } catch (e) {
    if (typeof console !== 'undefined' && console.debug)
      console.debug('removeUploadedIrpjRecibo failed', e)
  }
}

const removeUploadLabore = (idx) => {
  uploadLabore.value = uploadLabore.value.filter((_, i) => i !== idx)
  try {
    if (clientEdit && clientEdit.value && clientEdit.value.cliente) {
      const urls = uploadLabore.value.filter((x) => x.dataUrl).map((x) => x.dataUrl)
      if (urls.length === 1) clientEdit.value.cliente.pro_labore = urls[0]
      else if (urls.length > 1) clientEdit.value.cliente.pro_labore = urls
      else delete clientEdit.value.cliente.pro_labore
    }
  } catch (e) {
    if (typeof console !== 'undefined' && console.debug)
      console.debug('removeUploadLabore failed', e)
  }
}

const removeUploadedFaturamento = (idx) => {
  uploadedFaturamento.value = uploadedFaturamento.value.filter((_, i) => i !== idx)
  try {
    if (clientEdit && clientEdit.value && clientEdit.value.cliente) {
      const urls = uploadedFaturamento.value.filter((x) => x.dataUrl).map((x) => x.dataUrl)
      if (urls.length === 1) clientEdit.value.cliente.faturamento = urls[0]
      else if (urls.length > 1) clientEdit.value.cliente.faturamento = urls
      else delete clientEdit.value.cliente.faturamento
    }
  } catch (e) {
    if (typeof console !== 'undefined' && console.debug)
      console.debug('removeUploadedFaturamento failed', e)
  }
}

const removeUploadedExtrato = (idx) => {
  uploadedExtrato.value = uploadedExtrato.value.filter((_, i) => i !== idx)
  try {
    if (clientEdit && clientEdit.value && clientEdit.value.cliente) {
      const urls = uploadedExtrato.value.filter((x) => x.dataUrl).map((x) => x.dataUrl)
      if (urls.length === 1) clientEdit.value.cliente.extrato_empresa = urls[0]
      else if (urls.length > 1) clientEdit.value.cliente.extrato_empresa = urls
      else delete clientEdit.value.cliente.extrato_empresa
    }
  } catch (e) {
    if (typeof console !== 'undefined' && console.debug)
      console.debug('removeUploadedExtrato failed', e)
  }
}

const removeUploadedDas = (idx) => {
  uploadedDas.value = uploadedDas.value.filter((_, i) => i !== idx)
  try {
    if (clientEdit && clientEdit.value && clientEdit.value.cliente) {
      const urls = uploadedDas.value.filter((x) => x.dataUrl).map((x) => x.dataUrl)
      if (urls.length === 1) clientEdit.value.cliente.das = urls[0]
      else if (urls.length > 1) clientEdit.value.cliente.das = urls
      else delete clientEdit.value.cliente.das
    }
  } catch (e) {
    if (typeof console !== 'undefined' && console.debug)
      console.debug('removeUploadedDas failed', e)
  }
}

const removeUploadedCEmpresa = (idx) => {
  uploadedCEmpresa.value = uploadedCEmpresa.value.filter((_, i) => i !== idx)
  try {
    if (clientEdit && clientEdit.value && clientEdit.value.cliente) {
      const urls = uploadedCEmpresa.value.filter((x) => x.dataUrl).map((x) => x.dataUrl)
      if (urls.length === 1) clientEdit.value.cliente.comprovante_endereco_empresa = urls[0]
      else if (urls.length > 1) clientEdit.value.cliente.comprovante_endereco_empresa = urls
      else delete clientEdit.value.cliente.comprovante_endereco_empresa
    }
  } catch (e) {
    if (typeof console !== 'undefined' && console.debug)
      console.debug('removeUploadedCEmpresa failed', e)
  }
}

// Watch clientEdit.cliente to repopulate previews
watch(
  () => clientEdit && clientEdit.value && clientEdit.value.cliente,
  (cliente) => {
    try {
      const irpj = cliente && cliente.irpj
      if (irpj) {
        const arr = Array.isArray(irpj) ? irpj : [irpj]
        uploadedFiles.value = arr.map((u) => ({
          file: null,
          name:
            typeof u === 'string' && u.startsWith('/storage')
              ? u.split('/').pop()
              : pendingNames.get(u) || 'irpj',
          preview: resolveStorageUrl(u),
          dataUrl: u,
        }))
      } else uploadedFiles.value = []

      const recibo = cliente && cliente.irpj_recibo
      if (recibo) {
        const arr2 = Array.isArray(recibo) ? recibo : [recibo]
        uploadedIrpjRecibo.value = arr2.map((u) => ({
          file: null,
          name:
            typeof u === 'string' && u.startsWith('/storage')
              ? u.split('/').pop()
              : pendingNames.get(u) || 'irpj_recibo',
          preview: resolveStorageUrl(u),
          dataUrl: u,
        }))
      } else uploadedIrpjRecibo.value = []

      const lab = cliente && cliente.pro_labore
      if (lab) {
        const arr3 = Array.isArray(lab) ? lab : [lab]
        uploadLabore.value = arr3.map((u) => ({
          file: null,
          name:
            typeof u === 'string' && u.startsWith('/storage')
              ? u.split('/').pop()
              : pendingNames.get(u) || 'pro_labore',
          preview: resolveStorageUrl(u),
          dataUrl: u,
        }))
      } else uploadLabore.value = []

      const fat = cliente && cliente.faturamento
      if (fat) {
        const arr4 = Array.isArray(fat) ? fat : [fat]
        uploadedFaturamento.value = arr4.map((u) => ({
          file: null,
          name:
            typeof u === 'string' && u.startsWith('/storage')
              ? u.split('/').pop()
              : pendingNames.get(u) || 'faturamento',
          preview: resolveStorageUrl(u),
          dataUrl: u,
        }))
      } else uploadedFaturamento.value = []

      const extr = cliente && cliente.extrato_empresa
      if (extr) {
        const arr5 = Array.isArray(extr) ? extr : [extr]
        uploadedExtrato.value = arr5.map((u) => ({
          file: null,
          name:
            typeof u === 'string' && u.startsWith('/storage')
              ? u.split('/').pop()
              : pendingNames.get(u) || 'extrato_empresa',
          preview: resolveStorageUrl(u),
          dataUrl: u,
        }))
      } else uploadedExtrato.value = []

      const das = cliente && cliente.das
      if (das) {
        const arr6 = Array.isArray(das) ? das : [das]
        uploadedDas.value = arr6.map((u) => ({
          file: null,
          name:
            typeof u === 'string' && u.startsWith('/storage')
              ? u.split('/').pop()
              : pendingNames.get(u) || 'das',
          preview: resolveStorageUrl(u),
          dataUrl: u,
        }))
      } else uploadedDas.value = []

      const comp = cliente && cliente.comprovante_endereco_empresa
      if (comp) {
        const arr7 = Array.isArray(comp) ? comp : [comp]
        uploadedCEmpresa.value = arr7.map((u) => ({
          file: null,
          name:
            typeof u === 'string' && u.startsWith('/storage')
              ? u.split('/').pop()
              : pendingNames.get(u) || 'comprovante_endereco_empresa',
          preview: resolveStorageUrl(u),
          dataUrl: u,
        }))
      } else uploadedCEmpresa.value = []
    } catch (err) {
      if (typeof console !== 'undefined' && console.debug)
        console.debug('sync persona PJ previews failed', err)
    }
  },
  { immediate: true, deep: true },
)
</script>
