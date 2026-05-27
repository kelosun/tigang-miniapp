export const TRAINING_MODES = {
  normal: {
    name: '普通模式',
    desc: '适合新手入门',
    contractTime: 3000,
    relaxTime: 3000,
    totalSeconds: 300,
    phases: ['contract', 'relax']
  },
  advanced: {
    name: '进阶模式',
    desc: '提升肌肉耐力',
    contractTime: 5000,
    relaxTime: 3000,
    totalSeconds: 480,
    phases: ['contract', 'relax']
  },
  king: {
    name: '王者模式',
    desc: '高强度挑战',
    contractTime: 5000,
    relaxTime: 2000,
    quickContractTime: 1000,
    quickContractCount: 3,
    totalSeconds: 600,
    phases: ['contract', 'relax', 'quick-contract']
  }
}

export function getTrainingMode(modeKey = 'normal') {
  return TRAINING_MODES[modeKey] || TRAINING_MODES.normal
}

export function createTrainingSession(modeKey = 'normal') {
  const mode = getTrainingMode(modeKey)

  return {
    modeKey: TRAINING_MODES[modeKey] ? modeKey : 'normal',
    isPlaying: false,
    currentPhase: 'ready',
    phaseTimeLeftMs: 0,
    counter: 0,
    elapsedSeconds: 0,
    totalSeconds: mode.totalSeconds
  }
}

export function getPhaseDurationMs(mode, phase) {
  switch (phase) {
    case 'contract':
      return mode.contractTime
    case 'relax':
      return mode.relaxTime
    case 'quick-contract':
      return mode.quickContractTime * mode.quickContractCount
    default:
      return 0
  }
}

export function startTraining(session) {
  const mode = getTrainingMode(session.modeKey)

  if (session.currentPhase !== 'ready' && session.phaseTimeLeftMs > 0) {
    return {
      ...session,
      isPlaying: true
    }
  }

  return {
    ...session,
    isPlaying: true,
    currentPhase: 'contract',
    phaseTimeLeftMs: getPhaseDurationMs(mode, 'contract')
  }
}

export function pauseTraining(session) {
  return {
    ...session,
    isPlaying: false
  }
}

export function advancePhase(session) {
  const mode = getTrainingMode(session.modeKey)
  const phases = mode.phases
  const currentIndex = phases.indexOf(session.currentPhase)
  const nextPhase = phases[(currentIndex + 1) % phases.length] || 'contract'
  const completedCount =
    session.currentPhase === 'contract'
      ? 1
      : session.currentPhase === 'quick-contract'
        ? mode.quickContractCount
        : 0

  return {
    ...session,
    currentPhase: nextPhase,
    phaseTimeLeftMs: getPhaseDurationMs(mode, nextPhase),
    counter: session.counter + completedCount
  }
}

export function tickPhase(session, deltaMs = 100) {
  const nextTimeLeft = Math.max(0, session.phaseTimeLeftMs - deltaMs)

  return {
    ...session,
    phaseTimeLeftMs: nextTimeLeft
  }
}

export function tickElapsedSecond(session, deltaSeconds = 1) {
  return {
    ...session,
    elapsedSeconds: session.elapsedSeconds + Math.max(0, Math.floor(deltaSeconds))
  }
}

export function formatElapsedSeconds(seconds) {
  const totalSeconds = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function formatPhaseMilliseconds(ms) {
  const seconds = Math.max(0, ms / 1000)
  return `${seconds.toFixed(1)}s`
}

export function getPhaseVoiceText(phase) {
  switch (phase) {
    case 'contract':
      return '平稳呼吸，向内收紧'
    case 'relax':
      return '完全放松，保持身体稳定'
    case 'quick-contract':
      return '短促发力，节奏轻快'
    default:
      return '准备开始'
  }
}

export function getEndHoldProgress(heldMs, requiredMs = 1200) {
  if (requiredMs <= 0) return 100
  return Math.min(100, Math.max(0, Math.floor((heldMs / requiredMs) * 100)))
}

export function isEndHoldComplete(heldMs, requiredMs = 1200) {
  return heldMs >= requiredMs
}

export function shouldPromptBeforeLeavingTraining(session) {
  return Boolean(session?.isPlaying)
}
