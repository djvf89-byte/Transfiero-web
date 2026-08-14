import { MercadoPagoConfig, Preference, Payment } from "mercadopago"

const accessToken = process.env.MP_ACCESS_TOKEN ?? ""

export const mpConfig = new MercadoPagoConfig({
  accessToken,
  options: { timeout: 5000 },
})

export const mpPreference = new Preference(mpConfig)
export const mpPayment = new Payment(mpConfig)
