import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const viteConfig = readFileSync(new URL('../vite.config.js', import.meta.url), 'utf8')
const packageConfig = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const h5EntryPath = new URL('../index.html', import.meta.url)
const workflowPath = new URL('../.github/workflows/pages.yml', import.meta.url)

test('configures GitHub Pages builds with a repository base path', () => {
  assert.match(viteConfig, /GITHUB_PAGES/)
  assert.match(viteConfig, /GITHUB_REPOSITORY/)
  assert.match(viteConfig, /base:/)
})

test('publishes the uni-app H5 build output to GitHub Pages on push', () => {
  assert.equal(existsSync(workflowPath), true)

  const workflow = readFileSync(workflowPath, 'utf8')

  assert.match(workflow, /on:\s*\n\s+push:/)
  assert.match(workflow, /npm install/)
  assert.match(workflow, /node --test tests\/\*\.mjs/)
  assert.match(workflow, /npm run build:h5/)
  assert.match(workflow, /path:\s*dist\/build\/h5/)
  assert.match(workflow, /actions\/deploy-pages/)
  assert.doesNotMatch(workflow, /^\s+environment:/m)
})

test('keeps the uni-app H5 entry file available for Vite builds', () => {
  assert.equal(existsSync(h5EntryPath), true)

  const h5Entry = readFileSync(h5EntryPath, 'utf8')

  assert.match(h5Entry, /id="app"/)
  assert.match(h5Entry, /src="\/src\/main\.js"/)
})

test('documents runnable local H5 preview commands in package scripts', () => {
  assert.equal(packageConfig.scripts.test, 'node --test tests/*.mjs')
  assert.match(packageConfig.scripts['preview:h5'], /npm run build:h5/)
  assert.match(packageConfig.scripts['preview:h5'], /vite preview/)
})

test('declares the H5 platform plugin so uni can inject browser mount code', () => {
  assert.equal(
    packageConfig.dependencies['@dcloudio/uni-h5'],
    packageConfig.dependencies['@dcloudio/uni-app']
  )
})
