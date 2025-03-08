import dayjs from 'dayjs'

dayjs.locale('fr')

export const formatDateTime = (date?: Date): string =>
  dayjs(date).format('DD/MM/YYYY [à] HH:mm')
