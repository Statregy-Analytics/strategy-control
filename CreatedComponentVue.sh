#!/bin/bash
# Script para cria arquivo padrão para Vuejs3
# author @JorgeNunes
# authorEmail jlbnunes@live.com
echo "Digite o nome do arquivo (sem extensão):"
read nome_arquivo

# echo "Digite o nome da pasta(deixe em branco para o diretorio atual):"
# read nome_pasta

echo "Voce quer cria em pasta padrão vue.js(components, layouts, pages)?(deixe em branco caso não queira)"
read initial_response

#verifique o nome da pasta está em branco e define o diretório
if [ -z "$initial_response" ]; then
  diretorio=""
else
  # comp="src/components"
  # lay="src/layouts"
  # pag="src/pages"

  echo "|-------------------------------------------------------------|"
  echo "| →  0 - components (src/components)                          |"
  echo "| →  1 - layouts    (src/layouts)                             |"
  echo "| →  2 - pages      (src/pages)                               |"
  echo "| →  3 - sistema components (src/system/components)           |"
  echo "| →  4 - sistema layouts    (src/system/layouts)              |"
  echo "| →  5 - sistema pages      (src/system/pages)                |"
  echo "| →  6 - sistema views      (src/system/views)                |"
  echo "| →  7 - sistema charts     (src/system/components/charts)    |"
  echo "|      _______________  Control   ______________              |"
  echo "| →  8 - sistema reports (src/system/layouts/control/reports) |"
  echo "| →  9 - sistema users   (src/system/layouts/control/users)   |"
  echo "| → 10 - sistema clients (src/system/layouts/control/clients) |"
  echo "|      _______________   Auth     ______________              |"
  echo "| → 11 - sistema auth    (src/system/layouts/auth)            |"
  echo "|-------------------------------------------------------------|"
  echo "Digite qual:"
  read a_input
  while [ -n  "$a_input" ]
  do
      case "$a_input" in
          0) diretorio="src/components/";;
          1) diretorio="src/layouts/";;
          2) diretorio="src/pages/";;
          3) diretorio="src/system/components/";;
          4) diretorio="src/system/layouts/";;
          5) diretorio="src/system/pages/";;
          6) diretorio="src/system/views/";;
          7) diretorio="src/system/components/charts/";;
          8) diretorio="src/system/layouts/control/reports/";;
          9) diretorio="src/system/layouts/control/users/";;
         10) diretorio="src/system/layouts/control/clients/";;
         11) diretorio="src/system/layouts/auth/";;
          *) opc="EXCEPTION";
          echo "Ainda não temos suporte para ${a_input}  ${opc}";;
      esac
      break
  done

fi

# Cria o arquivo Vue com o nome fornecido
arquivo="$diretorio$nome_arquivo.vue"
touch "$arquivo"

# Adiciona o conteúdo ao arquivo
echo "<template>
  <div class='$nome_arquivo'>
    <!-- Seu conteúdo HTML aqui -->
  </div>
</template>

<script>
import { defineComponent } from 'vue';
export default defineComponent({
  name: '$nome_arquivo',
  setup(){
    return{}
  }
  // Outras configurações do componente aqui
});
</script>

<style scoped>
  /* Estilos específicos do componente aqui */
</style>" > "$arquivo"

echo "Arquivo Vue criado com sucesso em: $arquivo"
