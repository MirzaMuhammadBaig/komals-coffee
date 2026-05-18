import type { Metadata } from "next";
import { AlertCircle, MessageCircle } from "lucide-react";
import OrderForm from "@/components/OrderForm";
import LocationHours from "@/components/LocationHours";
import { getStoreSettings } from "@/lib/admin/store";
import { site } from "@/lib/data/site";
import { whatsappLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order",
  description:
    "Order Komal's Coffee online. Signature lattes, iced drinks and frappés, delivered warm and sealed across Bahria Orchard and Lahore.",
};

export default async function OrderPage() {
  const store = await getStoreSettings();
  const isClosed = store !== null && !store.is_open;

  return (
    <>
      <section
        id="order-form"
        className="bg-cream-100/40 pb-14 pt-12 sm:pb-20 sm:pt-16 lg:pt-20"
      >
        <div className="container-base">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Build your order</p>
            <h2 className="mt-3 font-display text-3xl text-espresso-800 sm:text-4xl lg:text-5xl">
              Tap to add. We will handle the rest.
            </h2>
            <p className="mt-4 text-espresso-600">
              Add your drinks, fill in your address, and Komal will WhatsApp you
              within minutes to confirm timing and payment.
            </p>
          </div>

          <div className="mt-10 sm:mt-12">
            {isClosed ? (
              <div className="card mx-auto max-w-2xl overflow-hidden">
                <div className="bg-espresso-800 px-6 py-8 text-center text-cream-50 sm:px-10 sm:py-10">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream-50/15 ring-2 ring-cream-50/30">
                    <AlertCircle className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 font-display text-2xl">
                    We are temporarily closed.
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm text-cream-100/85">
                    {store?.closed_reason ||
                      "Komal is taking a short break. Online ordering will reopen shortly."}
                  </p>
                  {store?.closed_until && (
                    <p className="mt-2 text-xs text-cream-100/70">
                      Reopens{" "}
                      {new Date(store.closed_until).toLocaleString("en-PK", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                      .
                    </p>
                  )}
                </div>
                <div className="space-y-3 px-6 py-6 text-center sm:px-10">
                  <p className="text-sm text-espresso-600">
                    Want to be the first to know when we reopen? Drop Komal a
                    message.
                  </p>
                  <a
                    href={whatsappLink(
                      site.contact.whatsapp,
                      "Hi Komal, please let me know when you reopen!",
                    )}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn-whatsapp"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" /> Message Komal
                  </a>
                </div>
              </div>
            ) : (
              <OrderForm />
            )}
          </div>

          <div className="mt-12 grid gap-4 rounded-3xl bg-white p-5 ring-1 ring-espresso-100 sm:grid-cols-3 sm:p-8">
            <div>
              <p className="eyebrow">Delivery</p>
              <p className="mt-2 text-sm text-espresso-600">
                Bahria Orchard + surrounding Lahore zones. 30–45 minutes on
                average.
              </p>
            </div>
            <div>
              <p className="eyebrow">Payment</p>
              <p className="mt-2 text-sm text-espresso-600">
                Cash on delivery, Easypaisa or bank transfer. Komal will share
                details on confirmation.
              </p>
            </div>
            <div>
              <p className="eyebrow">Bulk orders</p>
              <p className="mt-2 text-sm text-espresso-600">
                10+ drinks? Birthday boxes? WhatsApp Komal for a custom quote &
                timing.
              </p>
            </div>
          </div>
        </div>
      </section>

      <LocationHours />
    </>
  );
}
