import { local } from '../services/storageService'

const KEY = 'kadaan:device-id'

/**
 * Random id for this browser. Road users have no account, so it is what keeps
 * one confirmation per device and lets them update their alert settings.
 */
export function getDeviceId(): string {
  let id = local.read<string | null>(KEY, null)
  if (!id) {
    id = crypto.randomUUID()
    local.write(KEY, id)
  }
  return id
}
