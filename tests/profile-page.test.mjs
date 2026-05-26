import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const profilePage = readFileSync(new URL('../src/pages/profile/profile.vue', import.meta.url), 'utf8')

test('uses an in-page confirmation sheet for logout instead of the native modal', () => {
  const handleLogoutBlock = profilePage.match(/const handleLogout = \(\) => \{[\s\S]*?\n\}/)?.[0] || ''

  assert.match(profilePage, /showLogoutConfirmModal/)
  assert.doesNotMatch(handleLogoutBlock, /uni\.showModal/)
})
