import { NextRequest } from "next/server"
import { proxyWidgetRequest } from "@/lib/saas/server/widgetProxy"

export async function PATCH(request: NextRequest) {
  return proxyWidgetRequest(request, "/settings")
}