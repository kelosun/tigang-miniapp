import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const trainPage = readFileSync(new URL('../src/pages/train/train.vue', import.meta.url), 'utf8')
const pagesConfig = JSON.parse(readFileSync(new URL('../src/pages.json', import.meta.url), 'utf8'))

test('uses the in-page exit confirmation instead of native before-unload alerts', () => {
  assert.match(trainPage, /showExitConfirmModal/)
  assert.match(trainPage, /requestExitTraining/)
  assert.doesNotMatch(trainPage, /enableAlertBeforeUnload|disableAlertBeforeUnload/)
})

test('uses circular hold progress on the enlarged end button instead of linear progress bars', () => {
  assert.match(trainPage, /end-control active/)
  assert.match(trainPage, /endHoldProgress > 0 \? holdRingStyle : \{\}/)
  assert.doesNotMatch(trainPage, /<progress|progress-section|hold-progress-panel|holdProgressBarStyle/)
})

test('keeps idle control buttons borderless and shows hold progress only in active state', () => {
  assert.match(trainPage, /\.control-btn::after[\s\S]*border:\s*none/)
  assert.match(trainPage, /\.hold-ring\.active/)
})

test('uses a custom training navigation bar so back taps can show the in-page prompt', () => {
  const trainRoute = pagesConfig.pages.find((page) => page.path === 'pages/train/train')

  assert.equal(trainRoute?.style?.navigationStyle, 'custom')
  assert.match(trainPage, /class="train-back-btn"/)
  assert.match(trainPage, /handleBackNavigation/)
})

test('uses mini-program renderable local svg image layers for the training figure', () => {
  assert.equal(existsSync(new URL('../static/images/training-outline.svg', import.meta.url)), true)
  assert.equal(existsSync(new URL('../static/images/training-muscle.svg', import.meta.url)), true)
  assert.match(trainPage, /<image[\s\S]*class="butt-outline-layer"[\s\S]*src="\/static\/images\/training-outline\.svg"/)
  assert.match(trainPage, /<image[\s\S]*class="pelvic-muscle-layer"[\s\S]*src="\/static\/images\/training-muscle\.svg"/)
  assert.doesNotMatch(trainPage, /<svg[\s\S]*class="butt-svg"/)
  assert.doesNotMatch(trainPage, /<path[\s\S]*class="(?:butt-outline|pelvic-muscle)"/)
  assert.doesNotMatch(trainPage, /butt-cheek|cheek-shine/)
})

test('keeps the training figure clean without a center groove line', () => {
  assert.doesNotMatch(trainPage, /butt-groove/)
})

test('animates only the colored muscle image layer during contract and relax phases', () => {
  const contractBlock = trainPage.match(/&\.contract,[\s\S]*?^  \}/m)?.[0] || ''

  assert.match(trainPage, /&\.contract,[\s\S]*\.pelvic-muscle-layer[\s\S]*scaleX\(0\.78\)/)
  assert.match(trainPage, /&\.relax,[\s\S]*\.pelvic-muscle-layer[\s\S]*scaleX\(1\.02\)/)
  assert.doesNotMatch(contractBlock, /butt-outline-layer|\.butt-figure/)
})

test('keeps the training figure visual-only without the pink clock backdrop', () => {
  assert.doesNotMatch(trainPage, /class="butt-glow"|\.butt-glow/)
  assert.doesNotMatch(trainPage, /rgba\(255,\s*164,\s*188/)
})

test('places the time readout below the figure instead of inside the clock', () => {
  const clockStart = trainPage.indexOf('<view class="butt-clock"')
  const timePanelStart = trainPage.indexOf('<view class="training-time-panel"')
  const counterStart = trainPage.indexOf('<view class="counter-display"')

  assert.notEqual(clockStart, -1)
  assert.notEqual(timePanelStart, -1)
  assert.notEqual(counterStart, -1)
  assert.ok(clockStart < timePanelStart)
  assert.ok(timePanelStart < counterStart)
  assert.doesNotMatch(trainPage.slice(clockStart, timePanelStart), /phase-indicator|phase-timer|phase-countdown/)
})

test('anchors controls to the bottom and lowers the voice label below native buttons', () => {
  assert.match(trainPage, /\.train-container[\s\S]*display:\s*flex[\s\S]*flex-direction:\s*column/)
  assert.match(trainPage, /\.controls-section[\s\S]*margin-top:\s*auto[\s\S]*safe-area-inset-bottom/)
  assert.match(trainPage, /\.voice-pill[\s\S]*margin-top:\s*(?:4[0-9]|[5-9][0-9])rpx/)
})

test('uses an in-page voice cue so phase prompts do not cover training content', () => {
  assert.match(trainPage, /voiceCueText/)
  assert.match(trainPage, /class="voice-cue-slot"/)
  assert.doesNotMatch(trainPage, /uni\.showToast\(\{[\s\S]*title:\s*text/)
  assert.match(trainPage, /\.voice-cue-slot[\s\S]*height:\s*52rpx/)
  assert.match(trainPage, /\.voice-cue-text[\s\S]*min-height:\s*52rpx/)
})

test('moves the central training content down while keeping the middle gap controlled', () => {
  assert.match(trainPage, /\.voice-pill[\s\S]*margin-top:\s*(?:6[0-9]|[7-9][0-9])rpx/)
  assert.match(trainPage, /\.clock-section[\s\S]*padding-top:\s*(?:2[0-9]|[3-9][0-9])rpx/)
  assert.match(trainPage, /\.counter-display[\s\S]*margin-top:\s*(?:2[0-9]|[3-9][0-9])rpx/)
  assert.match(trainPage, /\.controls-section[\s\S]*padding:\s*(?:1[0-9]|2[0-9])rpx 8rpx calc\(env\(safe-area-inset-bottom\) \+ 24rpx\)/)
})

test('uses a spaced custom pause icon instead of a cramped text glyph', () => {
  assert.match(trainPage, /class="pause-mark"/)
  assert.match(trainPage, /class="pause-bar"/)
  assert.doesNotMatch(trainPage, /\{\{\s*isPlaying\s*\?\s*'Ⅱ'\s*:\s*'▶'\s*\}\}/)
  assert.match(trainPage, /\.pause-mark[\s\S]*gap:\s*(?:1[4-9]|[2-9][0-9])rpx/)
})

test('uses idle stop-button coloring before start and theme yellow after start', () => {
  assert.match(trainPage, /hasTrainingStarted/)
  assert.match(trainPage, /:class="\{ started: hasTrainingStarted, playing: isPlaying \}"/)
  assert.match(trainPage, /&\.primary[\s\S]*background:\s*#fff4f2/)
  assert.match(trainPage, /\.btn-icon-large[\s\S]*color:\s*#d94b3d/)
  assert.match(trainPage, /&\.started,[\s\S]*&\.playing[\s\S]*background:\s*#ffc329/)
  assert.match(trainPage, /\.primary\.started \.btn-icon-large[\s\S]*color:\s*#172232/)
})

test('keeps voice cue visible during training with stronger toast styling and spacing', () => {
  const speakBlock = trainPage.match(/const speak = \(text: string\) => \{[\s\S]*?\n\}/)?.[0] || ''

  assert.match(speakBlock, /voiceCueText\.value = text/)
  assert.doesNotMatch(speakBlock, /setTimeout|clearTimeout/)
  assert.match(trainPage, /\.voice-cue-slot[\s\S]*margin-bottom:\s*(?:1[4-9]|[2-9][0-9])rpx/)
  assert.match(trainPage, /\.voice-cue-text[\s\S]*font-size:\s*(?:2[8-9]|[3-9][0-9])rpx/)
  assert.match(trainPage, /\.voice-cue-text[\s\S]*padding:\s*0 (?:3[0-9]|[4-9][0-9])rpx/)
})

test('presents phase status as fixed cue text without duplicate hint copy', () => {
  assert.match(trainPage, /class="phase-meta-row"/)
  assert.match(trainPage, /class="phase-status-pill"/)
  assert.match(trainPage, /class="phase-badge"/)
  assert.match(trainPage, /v-if="isPlaying"[\s\S]*\{\{ formatPhaseTime\(phaseTimeLeft\) \}\}/)
  assert.match(trainPage, /v-else[\s\S]*待开始/)
  assert.doesNotMatch(trainPage, /phaseHintText|class="phase-hint"|剩余 \{\{ formatPhaseTime\(phaseTimeLeft\) \}\}/)
})

test('uses yellow phase styling with looser timer and counter spacing', () => {
  assert.match(trainPage, /\.phase-badge[\s\S]*background:\s*#ffc329/)
  assert.match(trainPage, /\.phase-badge[\s\S]*color:\s*#172232/)
  assert.match(trainPage, /\.phase-status-pill[\s\S]*min-width:\s*2[0-9]{2}rpx/)
  assert.match(trainPage, /\.phase-countdown[\s\S]*font-variant-numeric:\s*tabular-nums/)
  assert.match(trainPage, /\.phase-waiting[\s\S]*padding:\s*0 2[0-9]rpx/)
  assert.match(trainPage, /\.phase-meta-row[\s\S]*margin-top:\s*(?:2[0-9]|[3-9][0-9])rpx/)
  assert.match(trainPage, /\.counter-display[\s\S]*margin-top:\s*(?:3[2-9]|[4-9][0-9])rpx/)
})

test('keeps the end hold progress ring smaller than before', () => {
  assert.match(trainPage, /\.hold-ring\s*\{[\s\S]*width:\s*9[0-9]rpx[\s\S]*height:\s*9[0-9]rpx/)
  assert.match(trainPage, /\.end-control\.active \.hold-ring\s*\{[\s\S]*width:\s*1(?:1[0-9]|20)rpx[\s\S]*height:\s*1(?:1[0-9]|20)rpx/)
})

test('uses icon-only bottom controls without button captions', () => {
  const controlsBlock = trainPage.match(/<view class="controls-section">[\s\S]*?<\/view>\n\n    <view v-if="showExitConfirmModal"/)?.[0] || ''

  assert.doesNotMatch(controlsBlock, /class="btn-text"|class="hold-hint"|结束<\/text>|开始<\/text>|暂停<\/text>|指导<\/text>|长按/)
})

test('keeps the figure and time readout unframed while preserving stable timing layout', () => {
  const timePanelBlock = trainPage.match(/\.training-time-panel\s*\{[\s\S]*?\n\}/)?.[0] || ''

  assert.doesNotMatch(trainPage, /\.butt-clock::before|radial-gradient|linear-gradient\(180deg, #ffffff 0%, #fff9e9 100%\)/)
  assert.match(timePanelBlock, /width:\s*100%/)
  assert.match(timePanelBlock, /text-align:\s*center/)
  assert.doesNotMatch(timePanelBlock, /box-shadow:|border:|border-radius:|background:/)
})
