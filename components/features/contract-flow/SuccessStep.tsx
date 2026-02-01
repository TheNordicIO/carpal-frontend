"use client"

import { Card, CardContent } from "@/components/ui/card"

export function SuccessStep() {
  return (
    <section className="p-[18px] flex flex-col items-center justify-center h-[calc(50vh-100px)]" aria-labelledby="success-heading">
          <div className="mb-4 text-5xl" aria-hidden>
            ✅
          </div>
          <h2
            id="success-heading"
            className="mb-2 text-xl font-semibold text-green-800 dark:text-green-200"
          >
            Kontrakt sendt
          </h2>
          <p className="max-w-md text-base text-green-700 dark:text-green-300">
            Du kan lukke denne side. Flow gennemført og lykkedes.
          </p>
    </section>
  )
}
