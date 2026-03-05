export type TelemetryEvent =
  | 'location_search_started'
  | 'location_search_loaded'
  | 'location_search_failed'
  | 'location_suggestion_selected'
  | 'location_submit_started'
  | 'location_submit_success'
  | 'location_submit_failed'

export function trackEvent(event: TelemetryEvent, payload?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    console.debug('[telemetry]', event, payload ?? {})
  }
}
