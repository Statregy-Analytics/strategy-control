<template>
  <div class="ResendToken text-center">
    <q-btn
      v-if="statusStopWatch"
      color="primary"
      @click="resend()"
      label="Não recebeu token? Clique aqui para reenviar"
      flat
      no-caps
    >
    </q-btn>
    <div class="" v-else>
      <span class="text-overline">
        Tempo para reenvio
        <b>{{ minuteNow }}:{{ secondNow }}</b>
      </span>
    </div>
  </div>
</template>
<script>
import { defineComponent, ref } from 'vue'
import useWatch from 'src/composables/useWatch'
// import useNotify from "src/composables/useNotify";
// import useToken from "src/composables/system/Requests/useToken";

export default defineComponent({
  name: 'ResendToken',
  props: {
    token: { type: String },
  },
  setup(props) {
    // const { errorNotify, successNotify } = useNotify();

    // const { loading, resendToken } = useToken();
    const { getDate } = useWatch()
    const hourNow = ref(0)
    const minuteNow = ref(0)
    const secondNow = ref(0)
    const statusStopWatch = ref(true)
    const showTime = () => {
      let now = new Date()
      var tempLast = new Date(now.setMinutes(now.getMinutes() + 1))

      let timer = setInterval(() => {
        let { hour, minutes, seconds, status } = getDate(tempLast)
        hourNow.value = hour
        secondNow.value = seconds
        minuteNow.value = minutes
        statusStopWatch.value = status
        if (getDate(tempLast).status) {
          clearInterval(timer)
        }
      }, 1000)
    }

    const resend = async () => {
      showTime()
      console.log('Resend token', props.token)
      // await resendToken(props.token);
    }
    return {
      // loading,
      resend,
      hourNow,
      secondNow,
      minuteNow,
      statusStopWatch,
    }
  },
})
</script>
<style lang=""></style>
