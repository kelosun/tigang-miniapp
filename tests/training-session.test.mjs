import test from 'node:test'
import assert from 'node:assert/strict'

import {
  advancePhase,
  createTrainingSession,
  formatElapsedSeconds,
  formatPhaseMilliseconds,
  getEndHoldProgress,
  getPhaseVoiceText,
  getTrainingMode,
  shouldPromptBeforeLeavingTraining,
  isEndHoldComplete,
  startTraining,
  tickElapsedSecond
} from '../src/utils/training-session.js'

test('starts a normal training session on the contract phase without incrementing the counter', () => {
  const session = startTraining(createTrainingSession('normal'))

  assert.equal(session.isPlaying, true)
  assert.equal(session.currentPhase, 'contract')
  assert.equal(session.phaseTimeLeftMs, 3000)
  assert.equal(session.counter, 0)
})

test('increments the counter only after a contract phase completes', () => {
  const started = startTraining(createTrainingSession('normal'))
  const relaxed = advancePhase(started)

  assert.equal(relaxed.currentPhase, 'relax')
  assert.equal(relaxed.phaseTimeLeftMs, 3000)
  assert.equal(relaxed.counter, 1)
})

test('formats elapsed training duration from seconds', () => {
  assert.equal(formatElapsedSeconds(75), '01:15')
})

test('formats phase countdown as decimal seconds', () => {
  assert.equal(formatPhaseMilliseconds(2000), '2.0s')
  assert.equal(formatPhaseMilliseconds(1250), '1.3s')
})

test('uses concise phase cue copy for the top voice toast', () => {
  assert.equal(getPhaseVoiceText('contract'), '平稳呼吸，向内收紧')
  assert.equal(getPhaseVoiceText('relax'), '完全放松，保持身体稳定')
  assert.equal(getPhaseVoiceText('quick-contract'), '短促发力，节奏轻快')
})

test('can advance elapsed training time by a measured number of seconds', () => {
  const session = createTrainingSession('normal')

  assert.equal(tickElapsedSecond(session, 7).elapsedSeconds, 7)
})

test('uses distinct total durations for each training mode', () => {
  assert.equal(getTrainingMode('normal').totalSeconds, 300)
  assert.equal(getTrainingMode('advanced').totalSeconds, 480)
  assert.equal(getTrainingMode('king').totalSeconds, 600)
})

test('requires a full hold before ending training', () => {
  assert.equal(getEndHoldProgress(600, 1200), 50)
  assert.equal(isEndHoldComplete(1199, 1200), false)
  assert.equal(isEndHoldComplete(1200, 1200), true)
})

test('prompts before leaving only while training is actively playing', () => {
  const ready = createTrainingSession('normal')
  const playing = startTraining(ready)
  const paused = {
    ...playing,
    isPlaying: false
  }

  assert.equal(shouldPromptBeforeLeavingTraining(ready), false)
  assert.equal(shouldPromptBeforeLeavingTraining(paused), false)
  assert.equal(shouldPromptBeforeLeavingTraining(playing), true)
})
